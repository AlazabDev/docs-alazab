import { getQuery, createError } from 'h3'
import { canRead } from '../utils/auth'
import { listDocuments, countDocuments } from '../services/db'

export default defineEventHandler((event) => {
  const config = useRuntimeConfig()
  const requiredKey = String(config.docsApiKey || '')
  const publicRead = Boolean(config.docsPublicRead)

  if (!canRead(event, requiredKey, publicRead)) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const dbPath = String(config.docsDbPath || '/var/docs/.meta/metadata.db')

  const q = getQuery(event)
  const source = typeof q.source === 'string' && q.source ? q.source : undefined
  const reference = typeof q.reference === 'string' && q.reference ? q.reference : undefined
  const projectId = typeof q.projectId === 'string' && q.projectId ? q.projectId : undefined
  const search = typeof q.q === 'string' && q.q ? q.q : undefined

  const limit = Math.min(200, Math.max(1, Number(q.limit || 50)))
  const offset = Math.max(0, Number(q.offset || 0))

  const items = listDocuments(dbPath, { source, reference, projectId, q: search, limit, offset })
  const total = countDocuments(dbPath, { source, reference, projectId, q: search })

  return {
    items,
    limit,
    offset,
    total,
    hasMore: offset + items.length < total
  }
})
