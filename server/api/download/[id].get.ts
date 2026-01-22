import fs from 'node:fs'
import { getRouterParam, createError, setHeader, sendStream } from 'h3'
import { canRead } from '../../utils/auth'
import { getDocument } from '../../services/db'

export default defineEventHandler((event) => {
  const config = useRuntimeConfig()
  const requiredKey = String(config.docsApiKey || '')
  const publicRead = Boolean(config.docsPublicRead)

  if (!canRead(event, requiredKey, publicRead)) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const dbPath = String(config.docsDbPath || '/var/docs/.meta/metadata.db')
  const id = String(getRouterParam(event, 'id') || '')
  const doc = getDocument(dbPath, id)

  if (!doc) throw createError({ statusCode: 404, statusMessage: 'Not found' })
  if (!fs.existsSync(doc.stored_path)) throw createError({ statusCode: 404, statusMessage: 'File missing on disk' })

  setHeader(event, 'Content-Type', doc.mime_type || 'application/octet-stream')
  setHeader(event, 'Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(doc.original_name)}`)

  return sendStream(event, fs.createReadStream(doc.stored_path))
})
