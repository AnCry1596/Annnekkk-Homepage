<script setup>
// Shared shell: nav + footer. Active link is derived from the current route.
const route = useRoute()
const open = ref(false)
const nav = [
  { href: '/', label: 'Home' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/downloads', label: 'Downloads' },
  { href: '/changelog', label: 'Changelog' },
  { href: 'https://t.me/checkerforrent', label: 'Telegram', external: true },
]
</script>

<template>
  <nav>
    <div class="nav-container">
      <NuxtLink to="/" class="nav-brand">Annnekkk Checker</NuxtLink>
      <button class="nav-toggle" aria-label="Toggle navigation" @click="open = !open">☰</button>
      <ul class="nav-links" :class="{ active: open }">
        <li v-for="item in nav" :key="item.href">
          <a
            v-if="item.external"
            :href="item.href"
            target="_blank"
          >{{ item.label }}</a>
          <NuxtLink
            v-else
            :to="item.href"
            :class="{ active: item.href === route.path }"
            @click="open = false"
          >{{ item.label }}</NuxtLink>
        </li>
      </ul>
    </div>
  </nav>

  <slot />

  <footer>
    <p>&copy; 2025 Annnekkk. All rights reserved.</p>
  </footer>
</template>
