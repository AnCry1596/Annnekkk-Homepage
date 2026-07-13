<script setup>
// Download metadata lives in Mongo (fetched from /api/downloads); binaries are served
// by Fastify from /downloads/V<version>/. Client-rendered, so no prerender fetch.
useSeo({
  title: 'Downloads - Annnekkk Checker | All Platforms',
  description: 'Download CCN and CVV checker tools for Windows, macOS (Intel & Apple Silicon), and Linux. Latest version available with automatic updates and proxy support.',
  keywords: 'CCN checker download, CVV checker download, Windows download, macOS download, Linux download, card validator download',
  ogUrl: 'https://checker.annnekkk.com/downloads.html',
})

const icons = {
  windows: (color) => `<svg class="platform-icon" viewBox="0 0 88 88" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 12.5L35.5 8.5L35.5 41.5H0V12.5Z" fill="${color}"/><path d="M40.5 8L78 3.5V41.5H40.5V8Z" fill="${color}"/><path d="M0 46.5H35.5V79.5L0 75.5V46.5Z" fill="${color}"/><path d="M40.5 46.5H78V84.5L40.5 80V46.5Z" fill="${color}"/></svg>`,
  macos: (color) => `<svg class="platform-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.09997 22C7.78997 22.05 6.79997 20.68 5.95997 19.47C4.24997 17 2.93997 12.45 4.69997 9.39C5.56997 7.87 7.12997 6.91 8.81997 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z" fill="${color}"/></svg>`,
  linux: (color) => `<svg class="platform-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.5 2C12.5 2 8.85 2.02 6.5 4.5C6.5 4.5 4.5 6.84 4.5 10.5C4.5 10.5 4.48 14.16 6.5 16.5L11.71 21.71C11.8 21.8 11.9 21.85 12 21.87C12.1 21.85 12.2 21.8 12.29 21.71L17.5 16.5C17.5 16.5 19.52 14.16 19.5 10.5C19.5 10.5 19.5 6.84 17.5 4.5C17.5 4.5 15.15 2.02 11.5 2C11.83 2 12.17 2 12.5 2Z" stroke="${color}" stroke-width="1.5" fill="none"/><path d="M8.5 10.5L11 13L15.5 8.5" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>`,
}

const displayNames = {
  'windows-x64.exe': 'Windows (64-bit)',
  'windows-arm64.exe': 'Windows ARM64',
  'macos-arm64.dmg': 'macOS (Apple Silicon)',
  'macos-x64.dmg': 'macOS (Intel)',
  'linux-x64': 'Linux (64-bit)',
}

function isMobileDevice() {
  const ua = navigator.userAgent.toLowerCase()
  const mobileOS = /android/.test(ua) || /iphone|ipad|ipod/.test(ua) || /windows phone/.test(ua)
  const touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  return mobileOS || (touch && window.innerWidth <= 768)
}
function mobileType() {
  const ua = navigator.userAgent.toLowerCase()
  if (/iphone|ipad|ipod/.test(ua)) return 'iOS'
  if (/android/.test(ua)) return 'Android'
  if (/windows phone/.test(ua)) return 'Windows Phone'
  return 'Mobile'
}

// Prefer UA Client Hints (accurate arch, incl. Apple Silicon); fall back to UA sniffing.
async function detectPlatform() {
  const osFrom = (s) => s.includes('win') ? 'windows' : /mac|darwin/.test(s) ? 'macos' : s.includes('linux') ? 'linux' : 'unknown'
  const archFrom = (s) => /arm|aarch64/.test(s) ? 'arm64' : 'x64'
  try {
    if (navigator.userAgentData?.getHighEntropyValues) {
      const ua = await navigator.userAgentData.getHighEntropyValues(['architecture', 'platform'])
      return { os: osFrom((ua.platform || '').toLowerCase()), arch: archFrom((ua.architecture || '').toLowerCase()) }
    }
  } catch { /* fall through */ }
  return { os: osFrom((navigator.platform || '').toLowerCase()), arch: archFrom(navigator.userAgent.toLowerCase()) }
}
function recommendedSuffix({ os, arch }) {
  if (os === 'windows') return arch === 'arm64' ? 'windows-arm64.exe' : 'windows-x64.exe'
  if (os === 'macos') return arch === 'arm64' ? 'macos-arm64.dmg' : 'macos-x64.dmg'
  if (os === 'linux') return 'linux-x64'
  return null
}
function formatSize(bytes) {
  if (!bytes) return 'N/A'
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return parseFloat((bytes / Math.pow(1024, i)).toFixed(1)) + ' ' + sizes[i]
}
function fileName(app, version, suffix) {
  return app.prefix === 'Gate-Rent'
    ? `${app.prefix}-${version}-${suffix}`
    : `${version}-${app.prefix}-by-annnekkk-${suffix}`
}

const data = ref(null)
const error = ref('')
const isMobile = ref(false)
const recommended = ref(null)

// Cards for one app: only platforms that actually have an uploaded file, with computed url/size.
function cards(version, app) {
  return data.value.platforms
    .filter((p) => app.files && app.files[p.suffix])
    .map((p) => ({
      ...p,
      url: `/downloads/V${version.version}/${fileName(app, version.version, p.suffix)}`,
      size: formatSize(app.files[p.suffix]),
      icon: icons[p.icon](app.iconColor),
      isRecommended: version.isLatest && recommended.value === p.suffix,
    }))
}

function onDownload(card, version, appName) {
  window.analytics?.trackDownload(appName, version.version, card.name, card.size)
}

async function load() {
  error.value = ''
  data.value = null
  try {
    const res = await $fetch('/api/downloads')
    if (!res.versions?.length) throw new Error('No downloads available yet.')

    isMobile.value = isMobileDevice()
    if (isMobile.value) {
      window.analytics?.trackMobileWarning()
    } else {
      recommended.value = recommendedSuffix(await detectPlatform())
      if (recommended.value) window.analytics?.trackPlatformDetection(displayNames[recommended.value] || recommended.value)
    }
    data.value = res
  } catch (e) {
    error.value = e.message
  }
}

const recommendedName = computed(() => recommended.value ? (displayNames[recommended.value] || recommended.value) : '')
const recommendedIcon = computed(() => {
  if (!recommended.value) return ''
  const os = recommended.value.startsWith('windows') ? 'windows' : recommended.value.startsWith('macos') ? 'macos' : 'linux'
  return icons[os]('#cba6f7')
})

onMounted(load)
</script>

<template>
  <div class="main-content">
    <div class="container">
      <header>
        <h1>Downloads</h1>
        <p class="subtitle">Choose your platform and download the latest version</p>
      </header>

      <div id="downloads-container">
        <div v-if="error" class="version-section">
          <div style="padding: 40px; text-align: center;">
            <h3 style="color: var(--ctp-red); margin-bottom: 15px;">Failed to load downloads</h3>
            <p style="color: var(--ctp-subtext0); margin-bottom: 20px;">{{ error }}</p>
            <button class="btn btn-primary" @click="load">Retry</button>
          </div>
        </div>

        <template v-else-if="data">
          <div v-if="isMobile" class="mobile-warning-banner">
            <svg class="warning-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="#f38ba8"/>
            </svg>
            <div class="warning-content">
              <h3>Mobile Device Detected ({{ mobileType() }})</h3>
              <p><strong>Note:</strong> CCN &amp; CVV Checker applications are designed for desktop use only.</p>
              <p>These applications will not work on mobile devices. Please download on a desktop computer (Windows, macOS, or Linux) for the best experience.</p>
            </div>
          </div>

          <div v-else-if="recommended" class="recommendation-banner">
            <span v-html="recommendedIcon" />
            <div class="recommendation-text">
              <h3>Detected: {{ recommendedName }}</h3>
              <p>We recommend downloading the version marked below for your system</p>
            </div>
          </div>

          <div v-for="version in data.versions" :key="version.version" class="version-section">
            <div class="version-header">
              <span class="version-tag">v{{ version.version }}</span>
              <span v-if="version.isLatest" class="latest-badge">LATEST</span>
            </div>
            <div v-for="app in version.apps" :key="app.name" class="app-section">
              <h3 class="app-title">{{ app.name }}</h3>
              <div class="downloads-grid">
                <div
                  v-for="card in cards(version, app)"
                  :key="card.suffix"
                  class="download-card"
                  :class="{ recommended: card.isRecommended }"
                >
                  <span v-if="card.isRecommended" class="recommended-badge">Recommended for you</span>
                  <span v-html="card.icon" />
                  <div class="platform-name">{{ card.name }}</div>
                  <div class="file-info">
                    {{ card.description }}
                    <span class="file-size">{{ card.size }}</span>
                  </div>
                  <a :href="card.url" class="download-btn" download @click="onDownload(card, version, app.name)">Download</a>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
