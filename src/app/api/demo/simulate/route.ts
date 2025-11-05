import { NextResponse } from 'next/server'
import { createWalletClient, http, parseAbi } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

import { somniaShannon } from '@/lib/chain'
import { loadChainConfig } from '@/lib/config'

const demoOracleAbi = parseAbi(['function setPrice(int256 p) external'])

export async function POST() {
  if (process.env.DEMO_MODE !== 'true') {
    return NextResponse.json({ error: 'Demo mode disabled' }, { status: 403 })
  }

  const privateKey = process.env.OPERATOR_PRIVATE_KEY
  if (!privateKey || !privateKey.startsWith('0x')) {
    return NextResponse.json(
      { error: 'Operator key missing or malformed' },
      { status: 500 }
    )
  }

  const rpcUrl =
    process.env.NEXT_PUBLIC_SOMNIA_RPC_URL ?? process.env.SOMNIA_RPC_URL
  if (!rpcUrl) {
    return NextResponse.json(
      { error: 'Somnia RPC URL not configured' },
      { status: 500 }
    )
  }

  const config = await loadChainConfig()

  try {
    const account = privateKeyToAccount(privateKey as `0x${string}`)
    const client = createWalletClient({
      chain: somniaShannon,
      transport: http(rpcUrl),
      account
    })

    const spikePrice = 3000_00000000n
    await client.writeContract({
      address: config.demoOracle,
      abi: demoOracleAbi,
      functionName: 'setPrice',
      args: [spikePrice],
      account
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('demo/simulate error', error)
    return NextResponse.json(
      { error: 'Failed to simulate incident' },
      { status: 500 }
    )
  }
}
