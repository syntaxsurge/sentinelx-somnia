'use client'

import { ConvexProvider, ConvexReactClient } from 'convex/react'

const convexUrl =
  process.env.NEXT_PUBLIC_CONVEX_URL ??
  process.env.CONVEX_DEPLOYMENT_URL ??
  'http://127.0.0.1:8000'

const convexClient = new ConvexReactClient(convexUrl)

export function ConvexProviderClient({
  children
}: {
  children: React.ReactNode
}) {
  return <ConvexProvider client={convexClient}>{children}</ConvexProvider>
}
