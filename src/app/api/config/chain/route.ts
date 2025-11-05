import { NextResponse } from 'next/server'

import { loadChainConfig } from '@/lib/config'

export async function GET() {
  const config = await loadChainConfig()
  return NextResponse.json(config)
}
