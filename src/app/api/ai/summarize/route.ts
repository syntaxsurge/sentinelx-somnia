import { NextResponse } from 'next/server'

import { generateIncidentSummary } from '@/lib/ai/openai'
import { requireApiKey } from '@/lib/auth/apiKey'

export async function POST(request: Request) {
  const apiKey = await requireApiKey(request)
  if (!apiKey) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const payload = await request.json()

  if (payload?.tenantId && payload.tenantId !== apiKey.tenantId) {
    return NextResponse.json(
      { error: 'tenantId does not match credential scope' },
      { status: 403 }
    )
  }

  const summary = await generateIncidentSummary(payload)

  return NextResponse.json(summary)
}
