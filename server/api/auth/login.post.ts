import { readBody, setCookie, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const required = String(config.docsApiKey || '')

  if (!required) {
    // No key configured -> nothing to do
    return { ok: true, mode: 'no-key' }
  }

  const body = await readBody<{ key?: string }>(event)
  const key = String(body?.key || '')

  if (key !== required) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid key' })
  }

  const secure = Boolean(config.docsCookieSecure)

  setCookie(event, 'docs_api_key', key, {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/',
    maxAge: 60 * 60 * 24 * 30
  })

  return { ok: true }
})
