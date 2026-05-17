import { getRequestURL, readBody } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ amount: number, email: string }>(event)
  const p24 = useP24()
  const origin = getRequestURL(event).origin
  const { redirectUrl } = await p24.registerTransaction({
    sessionId: `pg-${Date.now()}`,
    amount: body.amount,
    currency: 'PLN',
    description: 'Playground order',
    email: body.email,
    urlReturn: `${origin}/return`,
    urlStatus: `${origin}/api/p24/webhook`,
  })
  return { redirectUrl }
})
