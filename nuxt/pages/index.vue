<script setup>
useSeo({
  title: 'Annnekkk Checker - Professional Card Validation Tools',
  description: 'Professional CCN and CVV checker tools. Fast, secure, and cross-platform validation with proxy support. Available for Windows, macOS, and Linux.',
  keywords: 'CCN checker, CVV checker, card validator, credit card checker, proxy support, Windows, macOS, Linux',
})

const features = [
  { icon: '⚡', title: 'Lightning Fast', body: 'Optimized performance for quick validation of credit card numbers and CVV codes.' },
  { icon: '🔒', title: 'Secure & Safe', body: 'All processing happens locally on your device. No data is sent to external servers.' },
  { icon: '🎨', title: 'Beautiful UI', body: 'Modern interface with Catppuccin theme for a pleasant user experience.' },
  { icon: '💻', title: 'Cross-Platform', body: 'Available for Windows, macOS (Intel & Apple Silicon), and Linux.' },
  { icon: '🌐', title: 'Easy to Access', body: 'Support all type of proxies (http, socks4, socks4a, socks5, socks5h).' },
  { icon: '📱', title: 'Regular Updates', body: 'Continuously updated with new features and improvements.' },
]
</script>

<template>
  <section class="hero">
    <h1>CCN &amp; CVV Checker</h1>
    <p>Professional tools for validating credit card numbers and CVV codes. Fast, reliable, and easy to use.</p>
    <div class="hero-buttons">
      <NuxtLink to="/downloads" class="btn btn-primary">Download Now</NuxtLink>
      <a href="https://t.me/checkerforrent" class="btn btn-secondary" target="_blank">Contact on Telegram</a>
    </div>
  </section>

  <section class="features">
    <h2>Features</h2>
    <div class="features-grid">
      <div v-for="f in features" :key="f.title" class="feature-card">
        <div class="feature-icon">{{ f.icon }}</div>
        <h3>{{ f.title }}</h3>
        <p>{{ f.body }}</p>
      </div>
    </div>
  </section>
</template>
