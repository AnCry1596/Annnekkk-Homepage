<script setup>
useSeo({
  title: 'Pricing - Annnekkk Checker | Transparent Plans',
  description: 'Simple and transparent pricing for CCN and CVV checker tools. Choose from daily, weekly, or monthly plans. CVV: $8/day, $40/week, $100/month. CCN: $12/day, $60/week, $150/month.',
  keywords: 'CCN checker pricing, CVV checker cost, card validator pricing, subscription plans, daily weekly monthly',
  ogUrl: 'https://checker.annnekkk.com/pricing.html',
})

const products = [
  {
    name: 'CVV Checker',
    plans: [
      { tier: 'Daily', price: 8, period: '/day', savings: null, popular: false,
        features: ['24-hour access', 'All features included', 'Proxy support', 'Regular updates'] },
      { tier: 'Weekly', price: 40, period: '/week', savings: 'Save $16', popular: true,
        features: ['7-day access', 'All features included', 'Proxy support', 'Regular updates', 'Priority support'] },
      { tier: 'Monthly', price: 100, period: '/month', savings: 'Save $140', popular: false,
        features: ['30-day access', 'All features included', 'Proxy support', 'Regular updates', 'Priority support', 'Early access to new features'] },
    ],
  },
  {
    name: 'CCN Checker',
    plans: [
      { tier: 'Daily', price: 12, period: '/day', savings: null, popular: false,
        features: ['24-hour access', 'All features included', 'Proxy support', 'Regular updates'] },
      { tier: 'Weekly', price: 60, period: '/week', savings: 'Save $24', popular: true,
        features: ['7-day access', 'All features included', 'Proxy support', 'Regular updates', 'Priority support'] },
      { tier: 'Monthly', price: 150, period: '/month', savings: 'Save $210', popular: false,
        features: ['30-day access', 'All features included', 'Proxy support', 'Regular updates', 'Priority support', 'Early access to new features'] },
    ],
  },
]
</script>

<template>
  <div class="main-content">
    <div class="pricing-header">
      <h1>Simple, Transparent Pricing</h1>
      <p>Choose the plan that works best for you</p>
    </div>

    <div class="pricing-container">
      <div v-for="product in products" :key="product.name" class="pricing-section">
        <h2 class="pricing-section-title">{{ product.name }}</h2>
        <div class="pricing-grid">
          <div
            v-for="plan in product.plans"
            :key="plan.tier"
            class="pricing-card"
            :class="{ popular: plan.popular }"
          >
            <div v-if="plan.popular" class="popular-badge">Most Popular</div>
            <div class="pricing-card-header">
              <h3>{{ plan.tier }}</h3>
              <div class="price">
                <span class="currency">$</span>
                <span class="amount">{{ plan.price }}</span>
                <span class="period">{{ plan.period }}</span>
              </div>
              <div v-if="plan.savings" class="savings">{{ plan.savings }}</div>
            </div>
            <ul class="pricing-features">
              <li v-for="f in plan.features" :key="f">✓ {{ f }}</li>
            </ul>
            <NuxtLink to="/downloads" class="btn" :class="plan.popular ? 'btn-primary' : 'btn-secondary'">Get Started</NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
