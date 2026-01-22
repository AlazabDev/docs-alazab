import { requireKey } from '../../utils/auth'
import { ingestMultipart } from '../../services/ingest'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const requiredKey = String(config.docsApiKey || '')
  requireKey(event, requiredKey)

  const storageRoot = String(config.docsStorageRoot || '/var/docs')
  const dbPath = String(config.docsDbPath || '/var/docs/.meta/metadata.db')
  const maxFileSizeMb = Number(config.docsMaxFileSizeMb || 100)
  const maxFiles = Number(config.docsMaxFilesPerRequest || 50)

  return await ingestMultipart({
    event,
    source: 'whatsapp',
    storageRoot,
    dbPath,
    maxFiles,
    maxFileSizeMb
  })
})
