import { addImportsDir, addServerHandler, createResolver, defineNuxtModule } from '@nuxt/kit'
import { defu } from 'defu'
import type { P24Environment } from '@zagi_14/przelewy24-ts-sdk'

export interface ModuleOptions {
  merchantId: number
  posId?: number
  apiKey: string
  crcKey: string
  environment?: P24Environment
  webhookPath?: string
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-przelewy24',
    configKey: 'p24',
    compatibility: { nuxt: '>=3.13.0' },
  },
  defaults: {
    merchantId: 0,
    apiKey: '',
    crcKey: '',
    environment: 'sandbox',
    webhookPath: '/api/p24/webhook',
  },
  setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    nuxt.options.runtimeConfig.p24 = defu(nuxt.options.runtimeConfig.p24, {
      merchantId: options.merchantId,
      posId: options.posId ?? options.merchantId,
      apiKey: options.apiKey,
      crcKey: options.crcKey,
      environment: options.environment,
      webhookPath: options.webhookPath,
    })

    addImportsDir(resolve('./runtime/server'))

    addServerHandler({
      route: options.webhookPath!,
      method: 'post',
      handler: resolve('./runtime/server/webhook'),
    })
  },
})

declare module '@nuxt/schema' {
  interface RuntimeConfig {
    p24: {
      merchantId: number
      posId: number
      apiKey: string
      crcKey: string
      environment: P24Environment
      webhookPath: string
    }
  }
}
