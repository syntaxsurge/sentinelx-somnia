import { api } from '@/convex/_generated/api'
import { getConvexServerClient } from '@/lib/convexServer'
import { sha256 } from '@/lib/apiKeys'
import { type Id } from '@/convex/_generated/dataModel'

type ApiKeyRecord = {
  _id: Id<'apiKeys'>
  tenantId: Id<'tenants'>
  hash: string
  label: string
  createdAt: number
  lastUsedAt?: number
  revokedAt?: number
}

export type ResolvedApiKey = ApiKeyRecord

function extractBearer(request: Request): string | null {
  const authHeader = request.headers.get('authorization') ?? ''
  const match = authHeader.match(/^Bearer\s+(.+)$/i)
  if (!match) return null
  return match[1]?.trim() ?? null
}

export async function requireApiKey(request: Request): Promise<ResolvedApiKey | null> {
  const token = extractBearer(request)
  if (!token) return null

  const convex = getConvexServerClient()
  const hash = sha256(token)

  try {
    const record = (await convex.query(api.apiKeys.findByHash, { hash })) as ApiKeyRecord | null
    if (!record || record.revokedAt) {
      return null
    }

    await convex.mutation(api.apiKeys.markUsed, { apiKeyId: record._id })
    return record
  } catch (error) {
    console.error('apiKey verification failed', error)
    return null
  }
}
