type FeedConfig = {
  protofire: string
  dia: string
}

type CanonicalConfig = {
  guardianHub: string
  agentInbox: string
  oracleRouter: string
  demoOracle: string
  demoPausable: string
  feeds: Record<string, FeedConfig>
}

const FALLBACK: CanonicalConfig = {
  guardianHub: '0x9a667b845034dDf18B7a5a9b50e2fe8CD4e6e2C1',
  agentInbox: '0x5c8B6a7981F41F0e11F3A2E93450A7702DEcAAb2',
  oracleRouter: '0xF5FCDBe9d4247D76c7fa5d2E06dBA1e77887F518',
  demoOracle: '0x52D22f255b58d5936f24A92228a09E9C0c4B7c34',
  demoPausable: '0x761D0dbB45654513AdF1BF6b5D217C0f8B3c5737',
  feeds: {
    'ETH/USD': {
      protofire: '0xd9132c1d762D432672493F640a63B758891B449e',
      dia: '0x786c7893F8c26b80d42088749562eDb50Ba9601E'
    },
    'BTC/USD': {
      protofire: '0x8CeE6c58b8CbD8afdEaF14e6fCA0876765e161fE',
      dia: '0x4803db1ca3A1DA49c3DB991e1c390321c20e1f21'
    },
    'USDC/USD': {
      protofire: '0xa2515C9480e62B510065917136B08F3f7ad743B4',
      dia: '0x235266D5ca6f19F134421C49834C108b32C2124e'
    }
  }
}

function pickAddress(key: string, fallback: string): string {
  const candidates = [
    process.env[key],
    process.env[`NEXT_PUBLIC_${key}`],
    process.env[`SENTINELX_${key}`],
    fallback
  ]

  for (const candidate of candidates) {
    if (candidate && candidate.startsWith('0x') && candidate.length === 42) {
      return candidate
    }
  }

  throw new Error(`Missing canonical address for ${key}`)
}

export function getCanonicalAddresses(): CanonicalConfig {
  return {
    guardianHub: pickAddress('GUARDIAN_HUB', FALLBACK.guardianHub),
    agentInbox: pickAddress('AGENT_INBOX', FALLBACK.agentInbox),
    oracleRouter: pickAddress(
      'SAFE_ORACLE_ROUTER',
      FALLBACK.oracleRouter
    ),
    demoOracle: pickAddress('DEMO_ORACLE', FALLBACK.demoOracle),
    demoPausable: pickAddress('DEMO_PAUSABLE', FALLBACK.demoPausable),
    feeds: FALLBACK.feeds
  }
}

export function isOverrideAllowed(): boolean {
  return (
    process.env.ALLOW_CONTRACT_OVERRIDE === 'true' ||
    process.env.SENTINELX_ALLOW_CONTRACT_OVERRIDE === 'true'
  )
}
