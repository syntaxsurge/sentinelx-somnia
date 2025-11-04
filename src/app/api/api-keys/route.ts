import { createHash, randomBytes } from 'crypto'

import { NextResponse } from 'next/server'

import { getConvexClient } from '@/lib/convexClient'

function generateApiKey(): { key: string; hash: string } {
  const key = randomBytes(24).toString('base64url')
  const hash = createHash('sha256').update(key).digest('hex')
  return { key, hash }
}

export async function GET(request: Request) {
  const client = getConvexClient()
  const { searchParams } = new URL(request.url)
  const tenantId = searchParams.get('tenantId') ?? undefined

  if (tenantId) {
    const keys = await client.query('apiKeys:list' as any, {
      tenantId
    })
    return NextResponse.json({ keys })
  }

  const keys = await client.query('apiKeys:listAll' as any, {})
  return NextResponse.json({ keys })
}

export async function POST(request: Request) {
  const client = getConvexClient()
  const payload = await request.json()

  const tenantId = payload?.tenantId
  const label = (payload?.label ?? '').trim()

  if (!tenantId || !label) {
    return NextResponse.json(
      { error: 'tenantId and label are required' },
      { status: 400 }
    )
  }

  const { key, hash } = generateApiKey()

  const apiKeyId = await client.mutation('apiKeys:create' as any, {
    tenantId,
    label,
    keyHash: hash
  })

  return NextResponse.json({ apiKeyId, apiKey: key }, { status: 201 })
}

export const revalidate = 0
