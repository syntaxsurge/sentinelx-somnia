import { ConvexHttpClient } from 'convex/browser'

let serverClient: ConvexHttpClient | null = null

function resolveConvexUrl(): string {
  const sources = [
    process.env.CONVEX_DEPLOYMENT_URL,
    process.env.CONVEX_DEPLOYMENT,
    process.env.NEXT_PUBLIC_CONVEX_URL,
    process.env.CONVEX_LOCAL_URL
  ]

  const url = sources.find(Boolean)
  if (!url) {
    throw new Error(
      'Set CONVEX_DEPLOYMENT_URL, CONVEX_DEPLOYMENT, or NEXT_PUBLIC_CONVEX_URL before using Convex on the server.'
    )
  }

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }

  if (url.startsWith('dev:')) {
    return process.env.CONVEX_LOCAL_URL ?? 'http://127.0.0.1:8000'
  }

  throw new Error(
    `Unsupported Convex deployment value "${url}". Provide an https:// URL or set CONVEX_LOCAL_URL for dev deployments.`
  )
}

export function getConvexServerClient(): ConvexHttpClient {
  if (!serverClient) {
    serverClient = new ConvexHttpClient(resolveConvexUrl())
  }
  return serverClient
}
