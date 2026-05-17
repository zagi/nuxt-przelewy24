# nuxt-przelewy24

[![npm version](https://img.shields.io/npm/v/nuxt-przelewy24/latest.svg?style=flat&colorA=020420&colorB=00DC82)](https://npmjs.com/package/nuxt-przelewy24)
[![ci](https://github.com/zagi/nuxt-przelewy24/actions/workflows/ci.yml/badge.svg)](https://github.com/zagi/nuxt-przelewy24/actions/workflows/ci.yml)
[![License](https://img.shields.io/npm/l/nuxt-przelewy24.svg?style=flat&colorA=020420&colorB=00DC82)](https://npmjs.com/package/nuxt-przelewy24)
[![Nuxt](https://img.shields.io/badge/Nuxt-020420?logo=nuxt)](https://nuxt.com)

Nuxt 4 module for **Przelewy24 (P24)** payments. Wraps [`przelewy24-ts-sdk`](https://github.com/zagi/przelewy24-ts-sdk) with runtime config, a server-only `useP24()` composable, and an automatic webhook handler.

## Install

```bash
pnpm add nuxt-przelewy24 przelewy24-ts-sdk
```

Add to `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  modules: ['nuxt-przelewy24'],
  p24: {
    merchantId: Number(process.env.P24_MERCHANT_ID),
    apiKey: process.env.P24_API_KEY!,
    crcKey: process.env.P24_CRC_KEY!,
    environment: 'sandbox', // or 'production'
  },
})
```

All options also accept `runtimeConfig.p24.*` overrides, so you can keep secrets out of source and inject them via `NUXT_P24_API_KEY`, `NUXT_P24_CRC_KEY`, etc.

### Options

| Option        | Type                          | Default                | Description                                          |
| ------------- | ----------------------------- | ---------------------- | ---------------------------------------------------- |
| `merchantId`  | `number`                      | `0`                    | P24 merchant id.                                     |
| `posId`       | `number`                      | `merchantId`           | POS id (defaults to merchant id).                    |
| `apiKey`      | `string`                      | `''`                   | API key (HTTP Basic auth password).                  |
| `crcKey`      | `string`                      | `''`                   | CRC key used to sign requests and verify webhooks.   |
| `environment` | `'sandbox'` \| `'production'` | `'sandbox'`            | Switches base URL.                                   |
| `webhookPath` | `string`                      | `'/api/p24/webhook'`   | Path the module registers as the notification URL.  |

## Usage — `useP24()`

`useP24()` is auto-imported in your Nitro server code and returns a memoized `P24Client`.

```ts
// server/api/checkout.post.ts
export default defineEventHandler(async (event) => {
  const body = await readBody<{ amount: number, email: string }>(event)
  const p24 = useP24()
  const origin = getRequestURL(event).origin

  const { redirectUrl } = await p24.registerTransaction({
    sessionId: crypto.randomUUID(),
    amount: body.amount,
    currency: 'PLN',
    description: 'Order #42',
    email: body.email,
    urlReturn: `${origin}/return`,
    urlStatus: `${origin}/api/p24/webhook`, // matches `webhookPath`
  })

  return { redirectUrl }
})
```

Verifying the final status and triggering a refund:

```ts
// server/api/return.get.ts
export default defineEventHandler(async (event) => {
  const { sessionId, amount, orderId } = getQuery(event)
  const p24 = useP24()
  await p24.verifyTransaction({
    sessionId: String(sessionId),
    amount: Number(amount),
    currency: 'PLN',
    orderId: Number(orderId),
  })
  return { ok: true }
})
```

```ts
const p24 = useP24()
await p24.refund({
  requestId: crypto.randomUUID(),
  refundsUuid: crypto.randomUUID(),
  refunds: [{
    orderId: 12345,
    sessionId: 'order-1',
    amount: 1099,
    description: 'Customer requested refund',
  }],
})
```

The composable is **server-only**. Never import it in a Vue component — it would leak your `apiKey` and `crcKey` into the client bundle.

## Webhook handler

The module registers a POST handler at `webhookPath` (default `/api/p24/webhook`) that:

1. Reads the JSON body.
2. Calls `verifyWebhook` from `przelewy24-ts-sdk/webhooks` to validate the SHA-384 signature.
3. Returns `{ received: true }` on success, `400` on signature mismatch.

To run your own logic after verification, attach a callback in a Nitro plugin:

```ts
// server/plugins/p24.ts
import type { WebhookPayload } from 'przelewy24-ts-sdk'

export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook('request', (event) => {
    event.context.$p24 = {
      onNotification: async (payload: WebhookPayload) => {
        // Mark the order paid, send a receipt, kick off fulfilment...
        const p24 = useP24()
        await p24.verifyTransaction({
          sessionId: payload.sessionId,
          amount: payload.amount,
          currency: payload.currency,
          orderId: payload.orderId,
        })
      },
    }
  })
})
```

If you need full control, set `webhookPath` to a path you implement yourself and skip the built-in handler.

## Related

For the full client API (`registerTransaction`, `verifyTransaction`, `refund`, `testAccess`, `verifyWebhook`, error classes, types), see [`przelewy24-ts-sdk`](https://github.com/zagi/przelewy24-ts-sdk).

## Contributing

```bash
pnpm install
pnpm dev:prepare
pnpm dev          # run playground
pnpm test
pnpm build
```

## License

MIT © 2026 Michał Zagalski
