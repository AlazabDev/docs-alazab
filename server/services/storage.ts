import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { safeName } from '../utils/sanitize'

export function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

export function buildPath(opts: {
  root: string
  source: 'manual' | 'whatsapp' | 'daftra' | 'magicplan'
  id: string
  originalName: string
  reference?: string | null
  projectId?: string | null
}) {
  const now = new Date()
  const yyyy = String(now.getUTCFullYear())
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0')

  const safeOriginal = safeName(opts.originalName)
  const safeRef = opts.reference ? safeName(opts.reference) : ''
  const safeProject = opts.projectId ? safeName(opts.projectId) : ''

  let dir = path.join(opts.root, opts.source, yyyy, mm)
  if (safeProject) dir = path.join(dir, safeProject)
  if (safeRef) dir = path.join(dir, safeRef)

  const filename = `${opts.id}__${safeOriginal}`
  return { dir, fullPath: path.join(dir, filename), filename }
}

export async function writeStreamToFile(input: NodeJS.ReadableStream, fullPath: string) {
  ensureDir(path.dirname(fullPath))

  return await new Promise<{ size: number; sha256: string }>((resolve, reject) => {
    const hash = crypto.createHash('sha256')
    let size = 0
    let settled = false

    const out = fs.createWriteStream(fullPath)

    const cleanupPartial = () => {
      try {
        if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath)
      } catch {
        // ignore
      }
    }

    const fail = (err: Error) => {
      if (settled) return
      settled = true
      try { out.destroy() } catch {}
      cleanupPartial()
      reject(err)
    }

    // Busboy will emit this on the file stream if fileSize limit is reached
    // @ts-expect-error - 'limit' is an event busboy adds
    input.on('limit', () => fail(new Error('File too large')))

    input.on('data', (chunk: Buffer) => {
      size += chunk.length
      hash.update(chunk)
    })

    input.on('error', (e: any) => fail(e instanceof Error ? e : new Error(String(e))))
    out.on('error', (e: any) => fail(e instanceof Error ? e : new Error(String(e))))

    out.on('finish', () => {
      if (settled) return
      settled = true
      resolve({ size, sha256: hash.digest('hex') })
    })

    input.pipe(out)
  })
}
