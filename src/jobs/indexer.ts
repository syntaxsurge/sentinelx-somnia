import {
  createPublicClient,
  encodeFunctionData,
  http,
  keccak256,
  parseAbi,
  stringToBytes
} from 'viem'

import { generateActionPlan, generateIncidentSummary } from '@/lib/ai/openai'
import { somniaShannon } from '@/lib/chain'
import { getConvexClient } from '@/lib/convexClient'

const rpcUrl =
  process.env.SOMNIA_RPC_URL ??
  process.env.NEXT_PUBLIC_SOMNIA_RPC_URL ??
  'https://dream-rpc.somnia.network'

const safeOracleAbi = parseAbi([
  'function latest(bytes32 key) view returns (int256 price, bool safe, bool bothFresh, int256 protofireAnswer, int256 diaAnswer, uint256 protofireUpdatedAt, uint256 diaUpdatedAt)'
])

const guardianAbi = parseAbi([
  'function pause(address target)',
  'function unpause(address target)'
])

const publicClient = createPublicClient({
  chain: somniaShannon,
  transport: http(rpcUrl)
})

type MonitorRecord = {
  _id: string
  name: string
  type: string
  params?: Record<string, unknown>
  contractAddress: string
  guardianAddress: string
  routerAddress?: string
  oracleKey: string
  protofireFeed: string
  diaFeed: string
  maxDeviationBps: number
  staleAfterSeconds: number
}

export async function runSentinelIndexer(options: { convex?: any } = {}) {
  const convex = options.convex ?? getConvexClient()

  const monitors = (await convex.query('monitors:list' as any, {
    tenantId: undefined
  })) as MonitorRecord[]

  if (!monitors || monitors.length === 0) {
    return { processed: 0, anomalies: 0 }
  }

  const routerFallback = process.env.SENTINELX_ROUTER_ADDRESS
  let processed = 0
  let anomalies = 0

  for (const monitor of monitors) {
    processed += 1
    const routerAddress = monitor.routerAddress ?? routerFallback
    const evaluatedAt = Date.now()

    if (!routerAddress) {
      await convex.mutation('telemetry:record' as any, {
        monitorId: monitor._id,
        ts: evaluatedAt,
        source: 'policy',
        datapoint: {
          error: 'router_address_missing',
          message: 'SafeOracleRouter address missing; cannot evaluate monitor.'
        }
      })
      await convex.mutation('monitors:updateEvaluation' as any, {
        monitorId: monitor._id,
        evaluatedAt
      })
      continue
    }

    try {
      const key = keccak256(stringToBytes(monitor.oracleKey))
      const result = await publicClient.readContract({
        address: routerAddress as `0x${string}`,
        abi: safeOracleAbi,
        functionName: 'latest',
        args: [key]
      })

      const [
        price,
        safe,
        bothFresh,
        protofireAnswer,
        diaAnswer,
        protofireUpdatedAt,
        diaUpdatedAt
      ] = result

      const datapoint = {
        price: price.toString(),
        safe,
        bothFresh,
        protofireAnswer: protofireAnswer.toString(),
        diaAnswer: diaAnswer.toString(),
        protofireUpdatedAt: Number(protofireUpdatedAt),
        diaUpdatedAt: Number(diaUpdatedAt),
        evaluatedAt
      }

      await convex.mutation('telemetry:record' as any, {
        monitorId: monitor._id,
        ts: evaluatedAt,
        source: 'safeOracle',
        windowSeconds: monitor.staleAfterSeconds,
        datapoint
      })

      await convex.mutation('monitors:updateEvaluation' as any, {
        monitorId: monitor._id,
        evaluatedAt
      })

      if (safe && bothFresh) {
        await convex.mutation('monitors:setStatus' as any, {
          monitorId: monitor._id,
          status: 'active'
        })
        continue
      }

      anomalies += 1

      await convex.mutation('monitors:setStatus' as any, {
        monitorId: monitor._id,
        status: 'attention'
      })

      const recentIncidents = (await convex.query('incidents:list' as any, {
        monitorId: monitor._id
      })) as Array<{
        openedAt: number
        status: string
        severity: string
        summary: string
      }>

      const summary = await generateIncidentSummary({
        monitor: {
          id: monitor._id,
          name: monitor.name,
          type: monitor.type,
          oracleKey: monitor.oracleKey,
          guardianAddress: monitor.guardianAddress,
          routerAddress
        },
        latestTelemetry: [
          {
            ts: evaluatedAt,
            source: 'safeOracle',
            datapoint,
            meta: {
              maxDeviationBps: monitor.maxDeviationBps,
              staleAfterSeconds: monitor.staleAfterSeconds
            }
          }
        ],
        recentIncidents,
        anomaly: {
          safe,
          bothFresh
        }
      })

      const incidentId = (await convex.mutation('incidents:record' as any, {
        monitorId: monitor._id,
        safe,
        bothFresh,
        action: safe ? 'noop' : 'pause-recommended',
        summary: summary.summary,
        details: {
          ...datapoint,
          rootCause: summary.root_cause,
          mitigations: summary.mitigations
        },
        severity: summary.severity,
        advisoryTags: summary.tags ?? []
      })) as string

      const proposals = await generateActionPlan({
        incident: {
          summary: summary.summary,
          severity: summary.severity,
          root_cause: summary.root_cause,
          mitigations: summary.mitigations,
          monitor: {
            contractAddress: monitor.contractAddress,
            guardianAddress: monitor.guardianAddress,
            routerAddress,
            name: monitor.name,
            oracleKey: monitor.oracleKey
          }
        }
      })

      for (const proposal of proposals) {
        const augmented = {
          ...proposal,
          arguments: {
            ...proposal.arguments,
            target:
              (proposal.arguments as any).target ?? monitor.guardianAddress,
            contract:
              (proposal.arguments as any).contract ?? monitor.contractAddress
          }
        }

        let planPayload = augmented
        let rationale =
          augmented.arguments.rationale ??
          'SentinelX agent recommends operator review.'

        if (augmented.name === 'propose_pause_market') {
          const calldata = encodeFunctionData({
            abi: guardianAbi,
            functionName: 'pause',
            args: [monitor.contractAddress as `0x${string}`]
          })
          planPayload = {
            ...augmented,
            target: monitor.guardianAddress,
            calldata
          } as any
          rationale = `${augmented.arguments.rationale ?? 'Pause guarded contract.'} Execute pause(${monitor.contractAddress}) on GuardianHub ${monitor.guardianAddress}.`
        }

        await convex.mutation('actionIntents:create' as any, {
          incidentId,
          proposer: 'sentinelx-agent',
          plan: planPayload,
          rationale
        })
      }
    } catch (error) {
      await convex.mutation('telemetry:record' as any, {
        monitorId: monitor._id,
        ts: Date.now(),
        source: 'policy',
        datapoint: {
          error: 'evaluation_failed',
          message: (error as Error).message
        }
      })
    }
  }

  return { processed, anomalies }
}
