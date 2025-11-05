import { NextResponse } from 'next/server'

import { generateIncidentSummary } from '@/lib/ai/openai'

export async function POST(request: Request) {
  const payload = await request.json()

  const summary = await generateIncidentSummary(payload)

  return NextResponse.json(summary)
}
