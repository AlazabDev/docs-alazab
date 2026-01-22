# docs.alazab.com – Production Deployment (Nuxt 4 Full-Stack)

## What you get (real, working)
- Central on-disk storage (`DOCS_STORAGE_ROOT`, default `/var/docs`)
- SQLite metadata database (`DOCS_DB_PATH`, default `/var/docs/.meta/metadata.db`)
- Secure optional API key (header `x-docs-api-key` or cookie `docs_api_key`)
- Ingest endpoints (multipart, multi-files):
  - `POST /api/ingest/manual`
  - `POST /api/ingest/whatsapp`
  - `POST /api/ingest/daftra`
  - `POST /api/ingest/magicplan`
- Query/download endpoints:
  - `GET /api/health`
  - `GET /api/documents` (filters: source, reference, projectId, q, limit, offset)
  - `GET /api/documents/:id`
  - `GET /api/download/:id`
- UI pages:
  - `/documents` list + download
  - `/upload` multi-file upload
  - `/login` (if `DOCS_API_KEY` set and `DOCS_PUBLIC_READ=0`)

## Server requirements
- Ubuntu 24.04
- Node.js 20+
- pnpm 10+
- Nginx
- PM2

## Install (server)
```bash
cd /var/www/docs-alazab
cp .env.example .env
nano .env

mkdir -p /var/docs/.tmp /var/docs/.meta
chmod -R 775 /var/docs

pnpm install
pnpm build

# Option A: direct
pm2 start "node .output/server/index.mjs" --name docs-alazab

# Option B: PM2 config
# pm2 start deploy/pm2/ecosystem.config.cjs

pm2 save
```

## Nginx
Use the provided config:
- `deploy/nginx/docs.alazab.com.conf`

```bash
cp deploy/nginx/docs.alazab.com.conf /etc/nginx/sites-available/docs.alazab.com
ln -s /etc/nginx/sites-available/docs.alazab.com /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

## Test
```bash
curl http://127.0.0.1:4010/api/health
curl http://docs.alazab.com/api/health
```

## PowerShell bulk upload (Windows)
```powershell
cd F:\A\domain
$headers = @{ "x-docs-api-key" = "YOUR_KEY" }
Get-ChildItem -File | ForEach-Object {
  Invoke-RestMethod -Uri "http://docs.alazab.com/api/ingest/manual" -Method Post -Headers $headers -Form @{ files = $_; reference = "BULK-2026-01" }
}
```

## Notes
- If `DOCS_API_KEY` is empty, ingest endpoints do not require auth.
- If `DOCS_PUBLIC_READ=0`, list/download require key (header or cookie).
- If your site is HTTPS (recommended), keep `DOCS_COOKIE_SECURE=1`.
