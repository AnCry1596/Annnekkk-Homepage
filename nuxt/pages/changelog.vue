<script setup>
// Data lives in Mongo, fetched from /api/changelog at runtime — client-only, no prerender fetch.
useSeo({
  title: 'Changelog - Annnekkk Checker',
  description: "Version history and changelog for CCN and CVV checker tools. See what's new in each release with detailed update notes.",
  keywords: "CCN checker changelog, CVV checker updates, version history, release notes, what's new",
  ogUrl: 'https://checker.annnekkk.com/changelog',
})

const versions = ref(null)
const error = ref(false)

const sections = [
  { key: 'new', title: 'New Features', emoji: '✨' },
  { key: 'improved', title: 'Improvements', emoji: '🔧' },
  { key: 'fixed', title: 'Bug Fixes', emoji: '🐛' },
  { key: 'breaking', title: 'Breaking Changes', emoji: '💥' },
]

async function load() {
  error.value = false
  versions.value = null
  try {
    versions.value = (await $fetch('/api/changelog')).versions || []
  } catch {
    error.value = true
  }
}

onMounted(load)
</script>

<template>
  <div class="main-content">
    <div class="changelog-header">
      <h1>Changelog</h1>
      <p>Stay updated with the latest features, improvements, and bug fixes</p>
    </div>

    <div class="changelog-container">
      <div v-if="error" style="text-align:center">
        <p style="color:var(--ctp-red);margin-bottom:20px">Error loading changelog</p>
        <button class="btn btn-primary" @click="load">Retry</button>
      </div>

      <p v-else-if="versions && !versions.length" style="color: var(--ctp-subtext0); text-align: center;">
        No changelog entries found
      </p>

      <div v-for="v in versions" v-else :key="v.version" class="changelog-entry">
        <div class="changelog-version">
          <h2>Version {{ v.version }}</h2>
          <span v-if="v.isLatest" class="badge badge-latest">Latest</span>
          <span v-if="v.date" class="changelog-date">{{ v.date }}</span>
        </div>
        <div class="changelog-content">
          <template v-for="s in sections" :key="s.key">
            <div v-if="v[s.key] && v[s.key].length" class="changelog-section">
              <h3>{{ s.emoji }} {{ s.title }}</h3>
              <ul>
                <li v-for="(item, i) in v[s.key]" :key="i">{{ item }}</li>
              </ul>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
