export default defineNuxtConfig({
  ssr: true,

  modules: [
    '@nuxt/ui',
    '@nuxt/image',
    '@vueuse/nuxt'
  ],

  runtimeConfig: {
    docsApiKey: process.env.DOCS_API_KEY || '',
    docsStorageRoot: process.env.DOCS_STORAGE_ROOT || '/var/docs',
    docsDbPath: process.env.DOCS_DB_PATH || '/var/docs/.meta/metadata.db',
    docsPublicRead: process.env.DOCS_PUBLIC_READ === '1',
    docsCookieSecure: process.env.DOCS_COOKIE_SECURE !== '0',
    docsMaxFileSizeMb: Number(process.env.DOCS_MAX_FILE_SIZE_MB || '100'),
    docsMaxFilesPerRequest: Number(process.env.DOCS_MAX_FILES_PER_REQUEST || '50'),
    public: {
      appName: 'Alazab Docs Repository'
    }
  },

  css: ['~/assets/css/main.css'],

  typescript: {
    strict: true,
    typeCheck: true
  },

  app: {
    head: {
      title: 'docs.alazab.com',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ]
    }
  }
})
