'use client'

import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CopyButton } from '@/components/ui/copy-button'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

const BASE_URL = 'https://sentinelx-somnia.vercel.app'

const sections: Array<{ id: string; label: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'quickstart', label: 'Quickstart' },
  { id: 'auth', label: 'Authentication' },
  { id: 'keys', label: 'API Keys' },
  { id: 'monitors', label: 'Monitors' },
  { id: 'incidents', label: 'Incidents' },
  { id: 'webhooks', label: 'Webhooks' },
  { id: 'ai', label: 'AI Agents' },
  { id: 'guardians', label: 'GuardianHub' },
  { id: 'copilot', label: 'Docs Copilot' }
]

function CodePanel({
  value,
  className
}: {
  value: string
  className?: string
}) {
  return (
    <div className={cn('relative rounded-lg border bg-muted/40 p-4', className)}>
      <CopyButton value={value} className='absolute right-4 top-4' />
      <pre className='overflow-x-auto text-xs leading-relaxed'>
        <code>{value}</code>
      </pre>
    </div>
  )
}

const apiKeyCurl = `curl -X POST ${BASE_URL}/api/api-keys \\
  -H "content-type: application/json" \\
  --cookie "sentinelx_siwe=<session-cookie>" \\
  -d '{
    "tenantId": "t_1234567890",
    "label": "policy-runner"
  }'`

const apiKeyTs = `const response = await fetch('${BASE_URL}/api/api-keys', {
  method: 'POST',
  credentials: 'include',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ tenantId: 't_1234567890', label: 'policy-runner' })
})
const { apiKey } = await response.json()`

const chainConfigCurl = `curl ${BASE_URL}/api/config/chain`

const monitorCurl = `curl -X POST ${BASE_URL}/api/monitors \\
  -H "authorization: Bearer sx_example_policy_runner_key" \\
  -H "content-type: application/json" \\
  -d '{
    "tenantId": "t_1234567890",
    "name": "Somnia ETH/USD validator",
    "type": "price",
    "contractAddress": "0x761D0dbB45654513AdF1BF6b5D217C0f8B3c5737",
    "guardianAddress": "0x9a667b845034dDf18B7a5a9b50e2fe8CD4e6e2C1",
    "routerAddress": "0xF5FCDBe9d4247D76c7fa5d2E06dBA1e77887F518",
    "agentInbox": "0x5c8B6a7981F41F0e11F3A2E93450A7702DEcAAb2",
    "oracleKey": "ETH/USD",
    "protofireFeed": "0xd9132c1d762D432672493F640a63B758891B449e",
    "diaFeed": "0x786c7893F8c26b80d42088749562eDb50Ba9601E",
    "maxDeviationBps": 100,
    "staleAfterSeconds": 120
  }'`

const monitorTs = `await fetch('${BASE_URL}/api/monitors', {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    authorization: 'Bearer ' + process.env.SENTINELX_API_KEY
  },
  body: JSON.stringify({
    tenantId: 't_1234567890',
    name: 'Somnia ETH/USD validator',
    type: 'price',
    contractAddress: '0x761D0dbB45654513AdF1BF6b5D217C0f8B3c5737',
    guardianAddress: '0x9a667b845034dDf18B7a5a9b50e2fe8CD4e6e2C1',
    routerAddress: '0xF5FCDBe9d4247D76c7fa5d2E06dBA1e77887F518',
    agentInbox: '0x5c8B6a7981F41F0e11F3A2E93450A7702DEcAAb2',
    oracleKey: 'ETH/USD',
    protofireFeed: '0xd9132c1d762D432672493F640a63B758891B449e',
    diaFeed: '0x786c7893F8c26b80d42088749562eDb50Ba9601E',
    maxDeviationBps: 100,
    staleAfterSeconds: 120
  })
})`

const simulateCurl = `curl -X POST ${BASE_URL}/api/demo/simulate`

const incidentCurl = `curl "${BASE_URL}/api/incidents?limit=50" \\
  -H "authorization: Bearer sx_example_policy_runner_key"`

const recordIncidentCurl = `curl -X POST ${BASE_URL}/api/incidents \\
  -H "authorization: Bearer sx_example_policy_runner_key" \\
  -H "content-type: application/json" \\
  -d '{
    "monitorId": "m_1234567890",
    "safe": false,
    "bothFresh": true,
    "action": "pause_guardian",
    "txHash": "0xtransaction",
    "summary": "Deviation between Protofire and DIA exceeded 0.5%",
    "details": {
      "protofire": "2389.12",
      "dia": "2521.44",
      "thresholdBps": 100
    }
  }'`

const webhookCurl = `curl -X POST ${BASE_URL}/api/webhooks \\
  -H "content-type: application/json" \\
  --cookie "sentinelx_siwe=<session-cookie>" \\
  -d '{
    "tenantId": "t_1234567890",
    "label": "discord-alerts",
    "kind": "discord",
    "destination": "https://discord.com/api/webhooks/...",
    "secret": ""
  }'`

const summarizeCurl = `curl -X POST ${BASE_URL}/api/ai/summarize \\
  -H "authorization: Bearer sx_example_policy_runner_key" \\
  -H "content-type: application/json" \\
  -d '{
    "tenantId": "t_1234567890",
    "incident": {
      "summary": "Protofire/DIA drift >0.5%",
      "severity": "high",
      "root_cause": "Feed divergence",
      "mitigations": [],
      "monitor": {
        "id": "m_1234567890",
        "name": "Somnia ETH/USD validator"
      }
    }
  }'`

const planCurl = `curl -X POST ${BASE_URL}/api/ai/plan \\
  -H "authorization: Bearer sx_example_policy_runner_key" \\
  -H "content-type: application/json" \\
  -d '{
    "tenantId": "t_1234567890",
    "context": {
      "router": "0xRouter",
      "guardian": "0xGuardian",
      "agentInbox": "0x5c8B6a7981F41F0e11F3A2E93450A7702DEcAAb2",
      "monitor": {
        "id": "m_1234567890",
        "oracleKey": "ETH/USD",
        "maxDeviationBps": 100
      }
    }
  }'`

const guardianSnippet = `abstract contract GuardablePausable {
  address public guardianHub;
  bool public paused;

  modifier notPaused() {
    require(!paused, "paused");
    _;
  }

  function setGuardianHub(address hub) external onlyOwner {
    guardianHub = hub;
  }

  function pause() external {
    require(msg.sender == guardianHub, "guardian only");
    paused = true;
  }

  function unpause() external onlyOwner {
    paused = false;
  }
}`

export default function DocsPage() {
  return (
    <div className='mx-auto grid w-full max-w-6xl gap-10 px-6 py-8 lg:grid-cols-[240px_1fr]'>
      <aside className='hidden lg:block'>
        <nav className='sticky top-20 space-y-4'>
          <div className='space-y-2'>
            <p className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
              SentinelX Docs
            </p>
            <ul className='space-y-2 text-sm text-muted-foreground'>
              {sections.map(section => (
                <li key={section.id}>
                  <a className='transition hover:text-foreground' href={`#${section.id}`}>
                    {section.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className='space-y-2 text-xs text-muted-foreground'>
            <p>All examples target {BASE_URL}. Replace the origin if you run a self-hosted deployment.</p>
          </div>
        </nav>
      </aside>

      <main className='space-y-12'>
        <header className='space-y-4'>
          <div className='flex flex-wrap items-center gap-2'>
            <Badge variant='secondary'>Somnia Shannon Testnet</Badge>
            <Badge variant='outline'>Infra · AI Agents</Badge>
          </div>
          <h1 className='text-3xl font-semibold tracking-tight'>SentinelX Integration Guide</h1>
          <p className='max-w-2xl text-sm text-muted-foreground'>
            SentinelX guards Somnia dApps with price monitors, incident telemetry, guardian approvals, and AI-assisted runbooks.
            Use these endpoints to automate monitoring, alerting, and mitigation from your decentralized application or off-chain agent.
          </p>
          <div className='flex flex-wrap gap-3'>
            <Button asChild>
              <Link href='https://github.com/syntaxsurge/sentinelx-somnia' target='_blank' rel='noreferrer'>
                GitHub Repository
              </Link>
            </Button>
            <Button asChild variant='secondary'>
              <Link href='/dashboard'>Open Dashboard</Link>
            </Button>
          </div>
        </header>

        <section id='overview' className='space-y-4'>
          <h2 className='text-2xl font-semibold tracking-tight'>Platform overview</h2>
          <p className='text-sm text-muted-foreground'>
            The App Router hosts the SentinelX AppShell, Convex stores tenancy, monitors, incidents, API keys, webhooks, and guardian operators,
            while the blockchain workspace ships GuardianHub and AgentInbox contracts for managed execution. REST APIs provide integration points for external agents and automation.
          </p>
          <ul className='text-sm text-muted-foreground'>
            <li>Convex deployment persists telemetry, incidents, action intents, doc embeddings, and hashed API keys.</li>
            <li>RainbowKit + SIWE establish operator sessions for the dashboard and for issuing credentials.</li>
            <li>API keys with prefix <code className='rounded bg-muted px-1'>sx_</code> authenticate server-to-server usage with per-tenant scoping.</li>
            <li>AI endpoints use OpenAI Responses API server-side to summarise incidents and synthesize guardian plans.</li>
          </ul>
        </section>

        <section id='quickstart' className='space-y-4'>
          <h2 className='text-2xl font-semibold tracking-tight'>Demo quickstart</h2>
          <p className='text-sm text-muted-foreground'>
            Reproduce the full SentinelX loop in minutes. Demo mode binds pre-deployed GuardianHub, AgentInbox, DemoOracle, and DemoPausable contracts. The form exposes only your monitor policy fields while core infrastructure stays read-only.
          </p>
          <ol className='list-decimal space-y-2 pl-6 text-sm text-muted-foreground'>
            <li>Open the dashboard, connect your Somnia wallet, and approve the SIWE prompt.</li>
            <li>Visit <em>Settings → API Keys</em>, create a key (for example <code className='rounded bg-muted px-1 font-mono text-xs'>policy-runner-demo</code>), and copy the plaintext secret.</li>
            <li>Go to <em>Monitors → New</em>. Click <strong>Seed demo values</strong> to autofill the guarded contract and thresholds, or provide your own values. GuardianHub, AgentInbox, SafeOracleRouter, and feeds are read-only from config.</li>
            <li>Back on the dashboard, click <strong>Simulate incident</strong>. This calls <code className='rounded bg-muted px-1 font-mono text-xs'>POST /api/demo/simulate</code> and spikes the demo oracle so the policy runner opens an incident.</li>
            <li>Navigate to <em>Incidents</em>, open the newest entry, and generate a plan. The AI co-pilot will recommend pausing the demo contract and notifying guardians.</li>
            <li>Approve &amp; execute the action from <em>Actions</em>. AgentInbox relays the pause transaction and records the hash. Attempting <code className='rounded bg-muted px-1 font-mono text-xs'>doWork()</code> on DemoPausable now reverts because the contract is paused.</li>
            <li>Schedule <code className='rounded bg-muted px-1 font-mono text-xs'>POST /api/indexer/run</code> (or run <code className='rounded bg-muted px-1 font-mono text-xs'>pnpm policy:run</code>) to keep telemetry and AI summaries fresh. Reference the cron snippet below.</li>
          </ol>
          <div className='space-y-2 text-xs text-muted-foreground'>
            <p className='font-medium text-foreground'>Demo mode configuration</p>
            <p>
              Enable demo mode with <code className='rounded bg-muted px-1 font-mono text-xs'>DEMO_MODE=true</code>, <code className='rounded bg-muted px-1 font-mono text-xs'>NEXT_PUBLIC_DEMO_MODE=true</code>, and a funded <code className='rounded bg-muted px-1 font-mono text-xs'>OPERATOR_PRIVATE_KEY</code> that can update the DemoOracle price.
            </p>
            <p>
              Canonical contract addresses are served from <code className='rounded bg-muted px-1 font-mono text-xs'>/api/config/chain</code>:
            </p>
            <CodePanel value={chainConfigCurl} />
            <p>
              Trigger deterministic incidents from CI or operator tooling:
            </p>
            <CodePanel value={simulateCurl} />
            <p>
              SentinelX always enforces these canonical addresses server-side, so customers only provide their guarded contract and thresholds.
            </p>
          </div>
        </section>

        <section id='auth' className='space-y-4'>
          <h2 className='text-2xl font-semibold tracking-tight'>Authentication</h2>
          <p className='text-sm text-muted-foreground'>
            Wallet authentication runs with RainbowKit and SIWE. Operators sign once, receive the
            <code className='mx-1 rounded bg-muted px-1 font-mono text-xs'>sentinelx_siwe</code> session cookie, and can issue credentials or manage tenants from the dashboard.
            Server-side integrations should never reuse the session cookie; create scoped API keys instead.
          </p>
          <p className='text-sm text-muted-foreground'>
            Ensure the following environment variables are populated before deploying:
          </p>
          <ul className='text-sm text-muted-foreground'>
            <li><code className='rounded bg-muted px-1 font-mono text-xs'>SESSION_SECRET</code> – 32+ character string for iron-session cookies.</li>
            <li><code className='rounded bg-muted px-1 font-mono text-xs'>NEXT_PUBLIC_WALLETCONNECT_ID</code> – WalletConnect project ID for RainbowKit.</li>
            <li><code className='rounded bg-muted px-1 font-mono text-xs'>OPENAI_API_KEY</code> – server-only key for AI summarisation and planning.</li>
          </ul>
        </section>

        <section id='keys' className='space-y-4'>
          <h2 className='text-2xl font-semibold tracking-tight'>API keys</h2>
          <p className='text-sm text-muted-foreground'>
            API keys are issued per tenant, hashed with SHA-256, and stored with created/last used metadata. Keys are displayed exactly once on creation—persist them securely.
            Revoke keys from <em>Settings → API Keys</em> or via the REST endpoint.
          </p>
          <Tabs defaultValue='curl' className='mt-2'>
            <TabsList className='w-fit'>
              <TabsTrigger value='curl'>cURL</TabsTrigger>
              <TabsTrigger value='ts'>TypeScript</TabsTrigger>
            </TabsList>
            <TabsContent value='curl' className='mt-4'>
              <CodePanel value={apiKeyCurl} />
            </TabsContent>
            <TabsContent value='ts' className='mt-4'>
              <CodePanel value={apiKeyTs} />
            </TabsContent>
          </Tabs>
          <p className='text-xs text-muted-foreground'>
            Response payload: <code className='rounded bg-muted px-1 font-mono text-xs'>{'{ apiKeyId, apiKey }'}</code>. Only session-authenticated operators can create or revoke credentials.
          </p>
        </section>

        <section id='monitors' className='space-y-4'>
          <h2 className='text-2xl font-semibold tracking-tight'>Register monitors</h2>
          <p className='text-sm text-muted-foreground'>
            Monitors pin GuardianHub, AgentInbox, SafeOracleRouter, and dual-oracle feeds. SentinelX persists the canonical addresses from <code className='rounded bg-muted px-1 font-mono text-xs'>/api/config/chain</code>; requests only need to supply the guarded contract and policy thresholds.
          </p>
          <Tabs defaultValue='curl' className='mt-2'>
            <TabsList className='w-fit'>
              <TabsTrigger value='curl'>cURL</TabsTrigger>
              <TabsTrigger value='ts'>TypeScript</TabsTrigger>
            </TabsList>
            <TabsContent value='curl' className='mt-4'>
              <CodePanel value={monitorCurl} />
            </TabsContent>
            <TabsContent value='ts' className='mt-4'>
              <CodePanel value={monitorTs} />
            </TabsContent>
          </Tabs>
          <p className='text-xs text-muted-foreground'>
            <strong>Deviation guidance:</strong> volatile assets → 100 bps (1%) and 180 s freshness. Stable pairs → 50 bps and 120 s.
          </p>
        </section>

        <section id='incidents' className='space-y-4'>
          <h2 className='text-2xl font-semibold tracking-tight'>Incidents & telemetry</h2>
          <p className='text-sm text-muted-foreground'>
            Pull incidents for dashboards or automation, or push new incident records from external analysis. GET requests scoped by API key return the 100 latest incidents across the tenant.
          </p>
          <Tabs defaultValue='list' className='mt-2'>
            <TabsList className='w-fit'>
              <TabsTrigger value='list'>List incidents</TabsTrigger>
              <TabsTrigger value='record'>Record incident</TabsTrigger>
            </TabsList>
            <TabsContent value='list' className='mt-4'>
              <CodePanel value={incidentCurl} />
            </TabsContent>
            <TabsContent value='record' className='mt-4'>
              <CodePanel value={recordIncidentCurl} />
            </TabsContent>
          </Tabs>
          <p className='text-xs text-muted-foreground'>
            SentinelX automatically enriches incidents with severity, mitigations, and advisory tags. Supplying <code className='rounded bg-muted px-1 font-mono text-xs'>summary</code> and <code className='rounded bg-muted px-1 font-mono text-xs'>details</code> keeps the dashboard narrative consistent.
          </p>
        </section>

        <section id='webhooks' className='space-y-4'>
          <h2 className='text-2xl font-semibold tracking-tight'>Incident webhooks</h2>
          <p className='text-sm text-muted-foreground'>
            Configure per-tenant push targets for Slack, Discord, or generic HTTP receivers. Webhooks deliver the full incident payload plus advisory tags for downstream routing.
          </p>
          <CodePanel value={webhookCurl} />
          <p className='text-xs text-muted-foreground'>
            Keys are HMAC-signed when a secret is supplied. Webhook endpoints receive the payload:
            <code className='ml-1 rounded bg-muted px-1 font-mono text-xs'>{'{ id, monitorId, severity, status, summary, details, advisoryTags, observedAt }'}</code>.
          </p>
        </section>

        <section id='ai' className='space-y-4'>
          <h2 className='text-2xl font-semibold tracking-tight'>AI agents</h2>
          <p className='text-sm text-muted-foreground'>
            AI endpoints operate strictly with API keys. <code className='rounded bg-muted px-1 font-mono text-xs'>/api/ai/summarize</code> normalises telemetry into actionable briefings, and
            <code className='mx-1 rounded bg-muted px-1 font-mono text-xs'>/api/ai/plan</code> generates structured mitigation plans that the policy runner can execute through GuardianHub.
          </p>
          <Tabs defaultValue='summarize' className='mt-2'>
            <TabsList className='w-fit'>
              <TabsTrigger value='summarize'>Summarize</TabsTrigger>
              <TabsTrigger value='plan'>Plan</TabsTrigger>
            </TabsList>
            <TabsContent value='summarize' className='mt-4'>
              <CodePanel value={summarizeCurl} />
            </TabsContent>
            <TabsContent value='plan' className='mt-4'>
              <CodePanel value={planCurl} />
            </TabsContent>
          </Tabs>
          <p className='text-xs text-muted-foreground'>
            Responses are JSON objects. Plans return <code className='rounded bg-muted px-1 font-mono text-xs'>{'{ actions: [], rationale }'}</code>, providing deterministic next steps for the SentinelX policy runner.
          </p>
        </section>

        <section id='guardians' className='space-y-4'>
          <h2 className='text-2xl font-semibold tracking-tight'>GuardianHub integration</h2>
          <p className='text-sm text-muted-foreground'>
            GuardianHub and AgentInbox enforce human-in-the-loop approvals before mutating guarded contracts. Apply the GuardablePausable mixin and assign SentinelX&apos;s GuardianHub during deployment.
          </p>
          <CodePanel value={guardianSnippet} />
          <p className='text-xs text-muted-foreground'>
            SentinelX emits action intents with the target contract + calldata. Operators approve in-app or via the policy runner CLI, then confirm the transaction hash to close the loop.
          </p>
        </section>

        <section id='copilot' className='space-y-4'>
          <h2 className='text-2xl font-semibold tracking-tight'>Docs Copilot</h2>
          <p className='text-sm text-muted-foreground'>
            The Docs Copilot endpoint <code className='rounded bg-muted px-1 font-mono text-xs'>POST /api/ai/ask</code> retrieves embedded Markdown guidance from Convex and answers grounded questions.
            Use it to embed SentinelX support directly into your operations tooling.
          </p>
          <p className='text-sm text-muted-foreground'>
            Sample payload:
          </p>
          <CodePanel
            value={`curl -X POST ${BASE_URL}/api/ai/ask \\
  -H "content-type: application/json" \\
  -d '{ "question": "How do I trigger the indexer cron?" }'`}
          />
          <p className='text-xs text-muted-foreground'>
            Responses include <code className='rounded bg-muted px-1 font-mono text-xs'>{'{ answer, sources: [] }'}</code> with similarity scores for transparency.
          </p>
        </section>
      </main>
    </div>
  )
}
