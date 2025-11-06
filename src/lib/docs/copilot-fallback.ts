type DocsFallback = {
  source: string
  content: string
  keywords: string[]
}

export const docsCopilotFallback: DocsFallback[] = [
  {
    source: 'docs/quickstart',
    content: `Demo mode binds pre-deployed GuardianHub, AgentInbox, DemoOracle, and DemoPausable contracts. The dashboard exposes only the policy fields you tune. Connect your Somnia wallet, create an API key labelled policy-runner-demo, run the policy evaluation from the dashboard, and simulate incidents to exercise the full loop.`,
    keywords: ['quickstart', 'demo', 'policy', 'simulate']
  },
  {
    source: 'docs/api/create-monitor',
    content: `Create monitors via POST /api/monitors with a tenant-scoped SentinelX API key. Example payload:\n{\n  "tenantId": "t_1234567890",\n  "name": "Somnia ETH/USD validator",\n  "type": "price",\n  "contractAddress": "0x761D0dbB45654513AdF1BF6b5D217C0f8B3c5737",\n  "guardianAddress": "0x9a667b845034dDf18B7a5a9b50e2fe8CD4e6e2C1",\n  "routerAddress": "0xF5FCDBe9d4247D76c7fa5d2E06dBA1e77887F518",\n  "agentInbox": "0x5c8B6a7981F41F0e11F3A2E93450A7702DEcAAb2",\n  "oracleKey": "ETH/USD",\n  "protofireFeed": "0xd9132c1d762D432672493F640a63B758891B449e",\n  "diaFeed": "0x786c7893F8c26b80d42088749562eDb50Ba9601E",\n  "maxDeviationBps": 100,\n  "staleAfterSeconds": 120\n}. SentinelX pins GuardianHub, AgentInbox, SafeOracleRouter, and dual-oracle feeds via /api/config/chain; you supply the guardable contract and thresholds.`,
    keywords: ['monitor', 'payload', 'create', 'post', 'api/monitors', 'deviation']
  },
  {
    source: 'docs/incidents',
    content: `Fetch the latest incidents with GET /api/incidents?limit=50 including severity, summary, mitigations, and GuardianHub execution context. POST requests let external systems record incidents with the same schema SentinelX uses internally.`,
    keywords: ['incident', 'incidents', 'severity', 'mitigations']
  },
  {
    source: 'docs/actions',
    content: `Action intents capture proposed GuardianHub calls. Operators approve and execute inside the Actions console; the UI records Somnia transaction hashes automatically. The control plane mirrors guardian patterns found in protocols like Aave for human-in-the-loop safety.`,
    keywords: ['action', 'intent', 'approve', 'guardian', 'execute']
  },
  {
    source: 'docs/webhooks',
    content: `Create webhooks with POST /api/webhooks by supplying tenantId, label, kind (discord, slack, webhook), destination URL, and optional secret. SentinelX signs outgoing payloads so downstream services can verify provenance.`,
    keywords: ['webhook', 'webhooks', 'discord', 'destination', 'secret']
  },
  {
    source: 'docs/env',
    content: `Set SESSION_SECRET (32+ chars), NEXT_PUBLIC_WALLETCONNECT_ID, SENTINELX_ROUTER_ADDRESS, OPENAI_API_KEY, and Somnia RPC credentials before deploying. Demo mode honours NEXT_PUBLIC_DEMO_MODE, SENTINELX_DEMO_MODE, or DEMO_MODE set to true/1/yes/on.`,
    keywords: ['environment', 'env', 'variables', 'walletconnect', 'router', 'demo']
  }
]
