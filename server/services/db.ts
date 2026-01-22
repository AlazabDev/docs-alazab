import fs from 'node:fs'
import path from 'node:path'
import Database from 'better-sqlite3'

let db: Database.Database | null = null

export type DocSource = 'manual' | 'whatsapp' | 'daftra' | 'magicplan'

export type DocRow = {
  id: string
  source: DocSource
  reference: string | null
  project_id: string | null
  original_name: string
  filename: string
  mime_type: string
  size_bytes: number
  sha256: string
  stored_path: string
  meta_json: string | null
  created_at: string
}

export function getDb(dbPath: string) {
  if (db) return db

  const dir = path.dirname(dbPath)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

  db = new Database(dbPath)
  db.pragma('journal_mode = WAL')

  db.prepare(`
    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      source TEXT NOT NULL,
      reference TEXT,
      project_id TEXT,
      original_name TEXT NOT NULL,
      filename TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size_bytes INTEGER NOT NULL,
      sha256 TEXT NOT NULL,
      stored_path TEXT NOT NULL,
      meta_json TEXT,
      created_at TEXT NOT NULL
    )
  `).run()

  db.prepare(`CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at)`).run()
  db.prepare(`CREATE INDEX IF NOT EXISTS idx_documents_source ON documents(source)`).run()
  db.prepare(`CREATE INDEX IF NOT EXISTS idx_documents_reference ON documents(reference)`).run()
  db.prepare(`CREATE INDEX IF NOT EXISTS idx_documents_project ON documents(project_id)`).run()

  return db
}

export function insertDocument(dbPath: string, row: DocRow) {
  const d = getDb(dbPath)
  d.prepare(`
    INSERT INTO documents (
      id, source, reference, project_id, original_name, filename,
      mime_type, size_bytes, sha256, stored_path, meta_json, created_at
    ) VALUES (
      @id, @source, @reference, @project_id, @original_name, @filename,
      @mime_type, @size_bytes, @sha256, @stored_path, @meta_json, @created_at
    )
  `).run(row)
}

export function getDocument(dbPath: string, id: string) {
  const d = getDb(dbPath)
  return d.prepare(`SELECT * FROM documents WHERE id = ?`).get(id) as DocRow | undefined
}

export function listDocuments(dbPath: string, opts: {
  source?: string
  reference?: string
  projectId?: string
  q?: string
  limit: number
  offset: number
}) {
  const d = getDb(dbPath)
  const where: string[] = []
  const params: any = { limit: opts.limit, offset: opts.offset }

  if (opts.source) { where.push('source = @source'); params.source = opts.source }
  if (opts.reference) { where.push('reference = @reference'); params.reference = opts.reference }
  if (opts.projectId) { where.push('project_id = @projectId'); params.projectId = opts.projectId }
  if (opts.q) {
    where.push('(original_name LIKE @q OR reference LIKE @q OR project_id LIKE @q)')
    params.q = `%${opts.q}%`
  }

  const sql = `
    SELECT * FROM documents
    ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
    ORDER BY created_at DESC
    LIMIT @limit OFFSET @offset
  `

  return d.prepare(sql).all(params) as DocRow[]
}


export function countDocuments(dbPath: string, opts: {
  source?: string
  reference?: string
  projectId?: string
  q?: string
}) {
  const d = getDb(dbPath)
  const where: string[] = []
  const params: any = {}

  if (opts.source) { where.push('source = @source'); params.source = opts.source }
  if (opts.reference) { where.push('reference = @reference'); params.reference = opts.reference }
  if (opts.projectId) { where.push('project_id = @projectId'); params.projectId = opts.projectId }
  if (opts.q) {
    where.push('(original_name LIKE @q OR reference LIKE @q OR project_id LIKE @q)')
    params.q = `%${opts.q}%`
  }

  const sql = `
    SELECT COUNT(1) as c FROM documents
    ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
  `

  const row = d.prepare(sql).get(params) as any
  return Number(row?.c || 0)
}
