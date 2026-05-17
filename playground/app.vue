<script setup lang="ts">
const amount = ref(1099)
const email = ref('test@example.com')
const loading = ref(false)

async function checkout() {
  loading.value = true
  try {
    const { redirectUrl } = await $fetch<{ redirectUrl: string }>('/api/checkout', {
      method: 'POST',
      body: { amount: amount.value, email: email.value },
    })
    window.location.href = redirectUrl
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <main style="font-family: system-ui; padding: 2rem; max-width: 32rem;">
    <h1>nuxt-przelewy24 playground</h1>
    <p>Set <code>P24_MERCHANT_ID</code>, <code>P24_API_KEY</code>, <code>P24_CRC_KEY</code> env vars before running.</p>
    <form @submit.prevent="checkout">
      <label>
        Amount (groszy)
        <input
          v-model.number="amount"
          type="number"
        >
      </label>
      <label>
        Email
        <input
          v-model="email"
          type="email"
        >
      </label>
      <button
        :disabled="loading"
        type="submit"
      >
        {{ loading ? 'Redirecting…' : 'Pay' }}
      </button>
    </form>
  </main>
</template>
