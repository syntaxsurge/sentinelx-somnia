import fs from 'node:fs/promises'
import path from 'node:path'

type FeedConfig = {
  protofire: `0x${string}`
  dia: `0x${string}`
}

export type ChainConfig = {
  chainId: number
  name: string
  guardianHub: `0x${string}`
  agentInbox: `0x${string}`
  oracleRouter: `0x${string}`
  demoOracle: `0x${string}`
  demoPausable: `0x${string}`
  feeds: Record<string, FeedConfig>
  defaults: {
    maxDeviationBps: number
    staleAfterSeconds: number
  }
  demoMode: boolean
}

let cachedConfig: ChainConfig | null = null

async function readChainConfigFromDisk(): Promise<ChainConfig> {
  const file = path.join(process.cwd(), 'config/chain.somniatest.json')
  const json = await fs.readFile(file, 'utf8')
  const parsed = JSON.parse(json) as ChainConfig
  return parsed
}

function selectAddress(
  envKey: string,
  fallbacks: Array<`0x${string}` | undefined>,
  aliases: string[] = []
): `0x${string}` {
  const searchKeys = [
    envKey,
    `NEXT_PUBLIC_${envKey}`,
    `SENTINELX_${envKey}`,
    ...aliases
  ]
  const envValue = searchKeys
    .map(key => process.env[key])
    .find(value => value && value.length > 0) as `0x${string}` | undefined
  const candidates = [
    envValue ? (envValue as `0x${string}`) : undefined,
    ...fallbacks
  ]

  for (const candidate of candidates) {
    if (candidate && candidate.startsWith('0x') && candidate.length === 42) {
      return candidate
    }
  }

  throw new Error(`Missing or invalid address for ${envKey}`)
}

export async function loadChainConfig(): Promise<ChainConfig> {
  if (cachedConfig) {
    return cachedConfig
  }

  const base = await readChainConfigFromDisk()

  const guardianHub = selectAddress('GUARDIAN_HUB', [base.guardianHub])
  const agentInbox = selectAddress('AGENT_INBOX', [base.agentInbox])
  const oracleRouter = selectAddress('SAFE_ORACLE_ROUTER', [base.oracleRouter], [
    'SENTINELX_ROUTER_ADDRESS'
  ])
  const demoOracle = selectAddress('DEMO_ORACLE', [base.demoOracle])
  const demoPausable = selectAddress('DEMO_PAUSABLE', [base.demoPausable])
  const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

  cachedConfig = {
    ...base,
    guardianHub,
    agentInbox,
    oracleRouter,
    demoOracle,
    demoPausable,
    demoMode
  }

  return cachedConfig
}

export async function reloadChainConfig(): Promise<ChainConfig> {
  cachedConfig = null
  return loadChainConfig()
}
