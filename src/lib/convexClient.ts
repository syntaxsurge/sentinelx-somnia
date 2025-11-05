import { ConvexHttpClient } from 'convex/browser'

function resolveConvexUrl(): string {
  const raw = [
    process.env.CONVEX_DEPLOYMENT_URL,
    process.env.CONVEX_DEPLOYMENT
  ].find(Boolean)

  if (!raw) {
    throw new Error(
      'Set CONVEX_DEPLOYMENT_URL or CONVEX_DEPLOYMENT before using the SentinelX API.'
    )
  }

  if (raw.startsWith('https://') || raw.startsWith('http://')) {
    return raw
  }

  if (raw.startsWith('dev:')) {
    return process.env.NEXT_PUBLIC_CONVEX_URL ?? 'http://127.0.0.1:8000'
  }

  throw new Error(
    `Unsupported Convex deployment value "${raw}". Provide an https:// URL or set NEXT_PUBLIC_CONVEX_URL for dev deployments.`
  )
}

let client: ConvexHttpClient | null = null

export function getConvexClient(): ConvexHttpClient {
  if (!client) {
    client = new ConvexHttpClient(resolveConvexUrl())
  }
  return client
}
