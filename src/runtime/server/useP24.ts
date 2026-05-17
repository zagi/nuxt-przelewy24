import { createClient, type P24Client, type P24Environment } from 'przelewy24-ts-sdk'
import { useRuntimeConfig } from '#imports'

let cached: P24Client | null = null

/**
 * Server-only composable returning a memoized P24 client built from
 * `runtimeConfig.p24`. Use only inside Nitro server routes / API handlers.
 */
export function useP24(): P24Client {
  if (cached) return cached
  const cfg = useRuntimeConfig().p24
  cached = createClient({
    merchantId: cfg.merchantId,
    posId: cfg.posId,
    apiKey: cfg.apiKey,
    crcKey: cfg.crcKey,
    environment: cfg.environment as P24Environment,
  })
  return cached
}
