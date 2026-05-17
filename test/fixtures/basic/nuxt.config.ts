import P24Module from '../../../src/module'

export default defineNuxtConfig({
  modules: [
    P24Module,
  ],
  p24: {
    merchantId: 12345,
    apiKey: 'test-api-key',
    crcKey: 'test-crc-key',
    environment: 'sandbox',
  },
})
