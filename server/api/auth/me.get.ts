import { getCookie } from 'h3'

export default defineEventHandler((event) => {
  const config = useRuntimeConfig()
  const required = String(config.docsApiKey || '')
  const publicRead = Boolean(config.docsPublicRead)
  const cookieKey = String(getCookie(event, 'docs_api_key') || '')

  return {
    hasKey: Boolean(required),
    authenticated: required ? cookieKey === required : true,
    publicRead
  }
})
