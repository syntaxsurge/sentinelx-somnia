import { keccak256, stringToBytes } from 'viem'

import { getConvexClient } from '@/lib/convexClient'
import { getSomniaClient } from '@/lib/somniaClient'

const safeOracleAbi = [
  {
    inputs: [{ internalType: 'bytes32', name: 'key', type: 'bytes32' }],
    name: 'latest',
    outputs: [
      { internalType: 'int256', name: 'price', type: 'int256' },
      { internalType: 'bool', name: 'safe', type: 'bool' },
      { internalType: 'bool', name: 'bothFresh', type: 'bool' },
      { internalType: 'int256', name: 'protofireAnswer', type: 'int256' },
      { internalType: 'int256', name: 'diaAnswer', type: 'int256' },
      { internalType: 'uint256', name: 'protofireUpdatedAt', type: 'uint256' },
      { internalType: 'uint256', name: 'diaUpdatedAt', type: 'uint256' }
    ],
    stateMutability: 'view',
    type: 'function'
  }
] as const

type MonitorRecord = {
  _id: unknown
  contractAddress: string
  guardianAddress: string
  routerAddress?: string
  oracleKey: string
  protofireFeed: string
  diaFeed: string
  maxDeviationBps: number
  staleAfterSeconds: number
}

export async function runPolicyOnce() {
  const convex = getConvexClient()
  const somnia = getSomniaClient()

  const monitors = (await convex.query('monitors:list' as any, {
    tenantId: undefined
  })) as MonitorRecord[]

  const routerFallback = process.env.SENTINELX_ROUTER_ADDRESS

  let processed = 0

  for (const monitor of monitors) {
    processed += 1
    const routerAddress = monitor.routerAddress ?? routerFallback

    let action: 'noop' | 'pause-recommended' = 'pause-recommended'
    let safe = false
    let bothFresh = false
    let summary = ''
    const details: Record<string, unknown> = {
      evaluatedAt: Date.now(),
      oracleKey: monitor.oracleKey,
      routerAddress,
      protofireFeed: monitor.protofireFeed,
      diaFeed: monitor.diaFeed
    }

    if (!routerAddress) {
      summary = `Router address missing for ${monitor.oracleKey}; guardian pause recommended.`
    } else {
      try {
        const key = keccak256(stringToBytes(monitor.oracleKey))
        const result = await somnia.readContract({
          address: routerAddress as `0x${string}`,
          abi: safeOracleAbi,
          functionName: 'latest',
          args: [key]
        })

        const [
          price,
          isSafe,
          isBothFresh,
          protoPrice,
          diaPrice,
          protoUpdated,
          diaUpdated
        ] = result
        safe = isSafe
        bothFresh = isBothFresh

        details.price = price
        details.protofireAnswer = protoPrice
        details.diaAnswer = diaPrice
        details.protofireUpdatedAt = Number(protoUpdated)
        details.diaUpdatedAt = Number(diaUpdated)

        if (safe && bothFresh) {
          action = 'noop'
          summary = `SafeOracleRouter reports safe price ${price} for ${monitor.oracleKey}.`
        } else if (!bothFresh) {
          summary = `One or both oracle feeds are stale for ${monitor.oracleKey}; guardian attention required.`
        } else {
          summary = `Deviation breach detected for ${monitor.oracleKey}; guardian attention required.`
        }
      } catch (error) {
        summary = `Failed to evaluate ${monitor.oracleKey}: ${(error as Error).message}`
      }
    }

    await convex.mutation('monitors:setStatus' as any, {
      monitorId: monitor._id,
      status: action === 'noop' ? 'active' : 'attention'
    })

    await convex.mutation('incidents:record' as any, {
      monitorId: monitor._id,
      safe,
      bothFresh,
      action,
      summary,
      details
    })
  }

  return { processed }
}
