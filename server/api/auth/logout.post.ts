import { deleteCookie } from 'h3'

export default defineEventHandler((event) => {
  deleteCookie(event, 'docs_api_key', { path: '/' })
  return { ok: true }
})
