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

export async function loadChainConfig(): Promise<ChainConfig> {
  if (cachedConfig) {
    return cachedConfig
  }

  const base = await readChainConfigFromDisk()

  const guardianHubEnv = process.env.GUARDIAN_HUB ?? process.env.NEXT_PUBLIC_GUARDIAN_HUB
  let guardianHub: `0x${string}`
  try {
    guardianHub = getAddress((guardianHubEnv ?? base.guardianHub) as `0x${string}`)
  } catch (error) {
    console.warn(`Invalid guardian hub address override: ${guardianHubEnv}`, error)
    guardianHub = getAddress(base.guardianHub)
  }

  const agentInboxEnv = process.env.AGENT_INBOX ?? process.env.NEXT_PUBLIC_AGENT_INBOX
  let agentInbox: `0x${string}`
  try {
    agentInbox = getAddress((agentInboxEnv ?? base.agentInbox) as `0x${string}`)
  } catch (error) {
    console.warn(`Invalid agent inbox address override: ${agentInboxEnv}`, error)
    agentInbox = getAddress(base.agentInbox)
  }

  const routerEnv =
    process.env.SAFE_ORACLE_ROUTER ?? process.env.NEXT_PUBLIC_SAFE_ORACLE_ROUTER
  let oracleRouter: `0x${string}`
  try {
    oracleRouter = getAddress((routerEnv ?? base.oracleRouter) as `0x${string}`)
  } catch (error) {
    console.warn(`Invalid safe oracle router override: ${routerEnv}`, error)
    oracleRouter = getAddress(base.oracleRouter)
  }

  const demoOracleEnv = process.env.DEMO_ORACLE ?? process.env.NEXT_PUBLIC_DEMO_ORACLE
  let demoOracle: `0x${string}`
  try {
    demoOracle = getAddress((demoOracleEnv ?? base.demoOracle) as `0x${string}`)
  } catch (error) {
    console.warn(`Invalid demo oracle override: ${demoOracleEnv}`, error)
    demoOracle = getAddress(base.demoOracle)
  }

  const demoPausableEnv =
    process.env.DEMO_PAUSABLE ?? process.env.NEXT_PUBLIC_DEMO_PAUSABLE
  let demoPausable: `0x${string}`
  try {
    demoPausable = getAddress((demoPausableEnv ?? base.demoPausable) as `0x${string}`)
  } catch (error) {
    console.warn(`Invalid demo pausable override: ${demoPausableEnv}`, error)
    demoPausable = getAddress(base.demoPausable)
  }

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
