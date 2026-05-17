import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { $fetch, setup } from '@nuxt/test-utils/e2e'

describe('nuxt-przelewy24', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/basic', import.meta.url)),
  })

  it('renders the index page', async () => {
    const html = await $fetch('/')
    expect(html).toContain('basic')
  })

  it('registers the webhook route and rejects unsigned bodies', async () => {
    // Empty body fails verifyWebhook → P24SignatureError → 400.
    await expect(
      $fetch('/api/p24/webhook', { method: 'POST', body: {} }),
    ).rejects.toMatchObject({ status: 400 })
  })
})
