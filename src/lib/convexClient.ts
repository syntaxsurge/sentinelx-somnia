import { ConvexHttpClient } from 'convex/browser'

function resolveConvexUrl(): string {
  const candidates = [
    process.env.CONVEX_DEPLOYMENT_URL,
    process.env.CONVEX_DEPLOYMENT
  ]

  for (const value of candidates) {
    if (value && value.trim().length > 0) {
      return value
    }
  }

  throw new Error(
    'Set CONVEX_DEPLOYMENT_URL or CONVEX_DEPLOYMENT before using the SentinelX API.'
  )
}

let client: ConvexHttpClient | null = null

export function getConvexClient(): ConvexHttpClient {
  if (!client) {
    client = new ConvexHttpClient(resolveConvexUrl())
  }
  return client
}
