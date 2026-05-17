import { createError, defineEventHandler, readBody } from 'h3'
import { isP24Error, type WebhookPayload } from 'przelewy24-ts-sdk'
import { verifyWebhook } from 'przelewy24-ts-sdk/webhooks'
import { useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event) => {
  const cfg = useRuntimeConfig().p24
  const body = await readBody<WebhookPayload>(event)
  try {
    verifyWebhook({ merchantId: cfg.merchantId, crcKey: cfg.crcKey, payload: body })
    // Userland hook: attach an onNotification handler via a Nitro plugin
    // (see README).
    const onNotification = (event.context as { $p24?: { onNotification?: (p: WebhookPayload) => unknown | Promise<unknown> } }).$p24?.onNotification
    if (onNotification) await onNotification(body)
    return { received: true }
  }
  catch (err) {
    if (isP24Error(err)) {
      throw createError({ statusCode: 400, statusMessage: err.message })
    }
    throw err
  }
})
