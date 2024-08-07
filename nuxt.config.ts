export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  dir: {
    public: 'public'
  },
  assets: {
    dirs: ['assets']
  },
  nitro: {
    plugins: ['~/plugins/analyze-frames.ts'],
    routeRules: {
      '/api/**': { cache: { maxAge: 60 * 60 } }
    },
    devServer: {
      watch: ['server']
    },
    workers: {
      maxTimeout: 10000 // 10 seconds
    }
  },
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt'
  ],
  runtimeConfig: {
    baseDir: process.env.BASE_DIR,
    thumbnailSize: parseInt(process.env.THUMBNAIL_SIZE || '100', 10),
    public: {
      baseDir: process.env.BASE_DIR,
      thumbnailSize: parseInt(process.env.THUMBNAIL_SIZE || '100', 10)
    }
  },
  pinia: {
    autoImports: ['defineStore', 'storeToRefs'],
  },
  imports: {
    dirs: ['stores'],
  },
  plugins: ['~/plugins/piniaPersist.ts'],
})