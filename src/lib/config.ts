import fs from 'node:fs/promises'
import path from 'node:path'

import { getAddress } from 'viem'

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

const DEMO_MODE_ENV_KEYS = [
  'NEXT_PUBLIC_DEMO_MODE',
  'SENTINELX_DEMO_MODE',
  'DEMO_MODE'
] as const

let cachedConfig: ChainConfig | null = null

function parseBooleanFlag(value: string | undefined): boolean | undefined {
  if (typeof value !== 'string') {
    return undefined
  }

  const normalized = value.trim().toLowerCase()

  if (['true', '1', 'yes', 'on'].includes(normalized)) {
    return true
  }

  if (['false', '0', 'no', 'off'].includes(normalized)) {
    return false
  }

  return undefined
}

function resolveDemoMode(): boolean {
  for (const key of DEMO_MODE_ENV_KEYS) {
    const parsed = parseBooleanFlag(process.env[key])
    if (typeof parsed === 'boolean') {
      return parsed
    }
  }

  return false
}

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
  const normalize = (value: string | undefined): `0x${string}` | null => {
    if (!value) {
      return null
    }

    const trimmed = value.trim()
    const candidates: string[] = [trimmed]
    if (trimmed !== trimmed.toLowerCase()) {
      candidates.push(trimmed.toLowerCase())
    }

    try {
      for (const candidate of candidates) {
        try {
          return getAddress(candidate as `0x${string}`)
        } catch {
          continue
        }
      }
      throw new Error('checksum mismatch')
    } catch (error) {
      console.warn(`Invalid address for ${envKey}: ${value}`, error)
      return null
    }
  }

  const searchKeys = [
    envKey,
    `NEXT_PUBLIC_${envKey}`,
    `SENTINELX_${envKey}`,
    ...aliases
  ]
  const envValue = searchKeys
    .map(key => process.env[key])
    .find(value => value && value.length > 0)
  const candidates = [
    envValue,
    ...fallbacks
  ]

  for (const candidate of candidates) {
    const normalized = normalize(candidate)
    if (normalized) {
      return normalized
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
  const demoMode = resolveDemoMode()

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
