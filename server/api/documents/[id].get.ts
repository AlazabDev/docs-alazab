import { getRouterParam, createError } from 'h3'
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
  return doc
})
