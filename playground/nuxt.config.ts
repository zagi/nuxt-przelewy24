export default defineNuxtConfig({
  modules: ['../src/module'],
  devtools: { enabled: true },
  compatibilityDate: '2025-01-01',
  p24: {
    merchantId: Number(process.env.P24_MERCHANT_ID ?? 0),
    apiKey: process.env.P24_API_KEY ?? '',
    crcKey: process.env.P24_CRC_KEY ?? '',
    environment: 'sandbox',
  },
})
