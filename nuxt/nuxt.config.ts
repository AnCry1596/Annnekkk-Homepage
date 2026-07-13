// Static-generated frontend. Fastify (../server.js) serves the built site from ../public
// and owns the /api/* + /downloads/* routes, so no Nuxt server/SSR is involved.
// ponytail: autoSubfolderIndex:false emits downloads.html (not downloads/index.html),
// matching Fastify's extensions:['html'] — server.js stays untouched.
export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  ssr: true,
  css: ['~/assets/styles.css'],
  nitro: {
    output: { publicDir: '../public' },
    prerender: {
      crawlLinks: true,
      routes: ['/', '/pricing', '/downloads', '/changelog'],
      autoSubfolderIndex: false,
    },
  },
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      meta: [
        { charset: 'UTF-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
        { name: 'author', content: 'Annnekkk' },
        { name: 'robots', content: 'index, follow' },
        { property: 'og:type', content: 'website' },
        { property: 'og:image', content: 'https://checker.annnekkk.com/assets/favicon.png' },
        { property: 'twitter:card', content: 'summary_large_image' },
        { property: 'twitter:image', content: 'https://checker.annnekkk.com/assets/favicon.png' },
        { name: 'telegram:channel', content: '@checkerforrent' },
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/assets/favicon.png' },
        { rel: 'apple-touch-icon', href: '/assets/favicon.png' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&display=swap' },
      ],
      script: [{ src: '/js/analytics.js' }],
    },
  },
})
