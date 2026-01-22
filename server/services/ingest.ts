import Busboy from 'busboy'
import crypto from 'node:crypto'
import type { H3Event } from 'h3'
import { createError } from 'h3'
import { buildPath, writeStreamToFile } from './storage'
import { insertDocument, type DocSource } from './db'

export async function ingestMultipart(opts: {
  event: H3Event
  source: DocSource
  storageRoot: string
  dbPath: string
  maxFiles: number
  maxFileSizeMb: number
}) {
  const { event, source, storageRoot, dbPath, maxFiles, maxFileSizeMb } = opts

  const req = event.node.req
  const ct = String(req.headers['content-type'] || '')
  if (!ct.includes('multipart/form-data')) {
    throw createError({ statusCode: 400, statusMessage: 'multipart/form-data required' })
  }

  const bb = Busboy({
    headers: req.headers,
    limits: {
      files: maxFiles,
      fileSize: maxFileSizeMb * 1024 * 1024
    }
  })

  let reference: string | null = null
  let projectId: string | null = null
  const meta: Record<string, any> = {}

  const items: any[] = []
  const fileWrites: Promise<void>[] = []

  bb.on('field', (name, val) => {
    const v = String(val || '').trim()
    if (!v) return

    if (name === 'reference') {
      reference = v
      return
    }

    if (name === 'projectId') {
      projectId = v
      return
    }

    // store any extra fields as metadata
    meta[name] = v
  })

  bb.on('file', (fieldname, file, info) => {
    if (fieldname !== 'file' && fieldname !== 'files') {
      file.resume()
      return
    }

    const id = crypto.randomUUID()
    const { fullPath, filename } = buildPath({
      root: storageRoot,
      source,
      id,
      originalName: info.filename,
      reference,
      projectId
    })

    const p = (async () => {
      const { size, sha256 } = await writeStreamToFile(file, fullPath)

      insertDocument(dbPath, {
        id,
        source,
        reference,
        project_id: projectId,
        original_name: info.filename,
        filename,
        mime_type: info.mimeType || 'application/octet-stream',
        size_bytes: size,
        sha256,
        stored_path: fullPath,
        meta_json: Object.keys(meta).length ? JSON.stringify(meta) : null,
        created_at: new Date().toISOString()
      })

      items.push({ id, original_name: info.filename, stored_path: fullPath })
    })()

    fileWrites.push(p)
  })

  const finished = new Promise<void>((resolve, reject) => {
    bb.on('error', reject)
    bb.on('finish', resolve)

    // These happen when limits are hit
    // @ts-expect-error - busboy emits these events
    bb.on('filesLimit', () => reject(new Error('Too many files in request')))
    // @ts-expect-error
    bb.on('partsLimit', () => reject(new Error('Too many parts in request')))
    // @ts-expect-error
    bb.on('fieldsLimit', () => reject(new Error('Too many fields in request')))
  })

  req.pipe(bb)
  await finished
  await Promise.all(fileWrites)

  if (!items.length) {
    throw createError({ statusCode: 400, statusMessage: 'No files uploaded' })
  }

  return { ok: true, items }
}
