// Per-page title/description/keywords + OG/twitter, mirroring the old Base.astro props.
export function useSeo(opts: {
  title: string
  description: string
  keywords?: string
  ogUrl?: string
}) {
  const ogUrl = opts.ogUrl ?? 'https://checker.annnekkk.com/'
  useHead({
    title: opts.title,
    meta: [
      { name: 'description', content: opts.description },
      ...(opts.keywords ? [{ name: 'keywords', content: opts.keywords }] : []),
      { property: 'og:url', content: ogUrl },
      { property: 'og:title', content: opts.title },
      { property: 'og:description', content: opts.description },
      { property: 'twitter:url', content: ogUrl },
      { property: 'twitter:title', content: opts.title },
      { property: 'twitter:description', content: opts.description },
    ],
  })
}
