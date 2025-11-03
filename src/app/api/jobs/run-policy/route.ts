import { NextResponse } from 'next/server'

import { runPolicyOnce } from '@/jobs/policyRunner'

export async function POST() {
  const outcome = await runPolicyOnce()
  return NextResponse.json(outcome)
}

export const revalidate = 0
