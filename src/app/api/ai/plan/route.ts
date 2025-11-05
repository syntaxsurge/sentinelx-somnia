import { NextResponse } from 'next/server'

import { generateActionPlan } from '@/lib/ai/openai'

export async function POST(request: Request) {
  const payload = await request.json()

  const proposals = await generateActionPlan(payload)

  return NextResponse.json({ proposals })
}
