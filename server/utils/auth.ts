import { createError, getCookie, getHeader } from 'h3'

export function getProvidedKey(event: any) {
  const headerKey = String(getHeader(event, 'x-docs-api-key') || '')
  if (headerKey) return headerKey
  const cookieKey = String(getCookie(event, 'docs_api_key') || '')
  return cookieKey
}

export function requireKey(event: any, requiredKey: string) {
  if (!requiredKey) return
  const provided = getProvidedKey(event)
  if (provided !== requiredKey) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
}

export function canRead(event: any, requiredKey: string, publicRead: boolean) {
  if (publicRead) return true
  if (!requiredKey) return true
  return getProvidedKey(event) === requiredKey
}
