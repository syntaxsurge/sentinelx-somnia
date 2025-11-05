'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'

function Code({ children }: { children: React.ReactNode }) {
  return (
    <pre className='rounded-lg border border-border bg-muted p-4 text-xs leading-relaxed'>
      <code>{children}</code>
    </pre>
  )
}

function AiDocCopilot() {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleAsk = async () => {
    if (!question.trim()) return
    setLoading(true)
    setAnswer(null)
    const response = await fetch('/api/ai/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question })
    })
    const payload = await response.json()
    setAnswer(payload.answer ?? 'No answer available.')
    setLoading(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Docs Copilot</CardTitle>
        <CardDescription>
          Ask SentinelX about deployment, cron cadence, or AI configuration.
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='flex flex-col gap-3 sm:flex-row'>
          <Input
            placeholder='How do I schedule the indexer on Vercel?'
            value={question}
            onChange={event => setQuestion(event.target.value)}
          />
          <Button onClick={handleAsk} disabled={loading}>
            {loading ? 'Thinking…' : 'Ask'}
          </Button>
        </div>
        {loading ? (
          <p className='text-xs text-muted-foreground'>Fetching context…</p>
        ) : null}
        {answer ? (
          <p className='text-sm leading-relaxed text-muted-foreground'>
            {answer}
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}

export default function DocsPage() {
  return (
    <div className='space-y-10 py-8'>
      <header className='space-y-3'>
        <h1 className='text-3xl font-semibold tracking-tight'>SentinelX Playbook</h1>
        <p className='max-w-2xl text-sm text-muted-foreground'>
          Deploy the SentinelX agent mesh: ingest Somnia telemetry, triage anomalies with AI, and route mitigations through GuardianHub.
        </p>
        <div className='flex flex-wrap gap-3'>
          <Button asChild>
            <a
              href='https://github.com/syntaxsurge/sentinelx-somnia'
              target='_blank'
              rel='noreferrer'
            >
              GitHub repo
            </a>
          </Button>
          <Button asChild variant='secondary'>
            <a
              href='https://docs.somnia.network'
              target='_blank'
              rel='noreferrer'
            >
              Somnia docs
            </a>
          </Button>
        </div>
      </header>

      <AiDocCopilot />

      <section className='grid gap-6 lg:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>Data plane · Indexer</CardTitle>
            <CardDescription>
              Poll SafeOracleRouter, persist telemetry, and trigger incident summaries.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4 text-sm text-muted-foreground'>
            <Code>{`# Vercel cron (every minute)
{
  "crons": [
    { "path": "/api/indexer/run", "schedule": "*/1 * * * *" }
  ]
}

# Local execution
pnpm policy:run`}</Code>
            <p>
              The indexer reads <code>SafeOracleRouter.latest</code>, stores raw telemetry in Convex, and flags monitors that drift or go stale. Anomalies immediately open incidents and call the AI co-pilot pipeline.
            </p>
            <p>
              Configure <code>SENTINELX_ROUTER_ADDRESS</code> if monitors omit router addresses. The cron endpoint returns <code>{'{ processed, anomalies }'}</code> for observability dashboards.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI plane · Configuration</CardTitle>
            <CardDescription>
              Summaries, mitigations, and action intents powered by OpenAI Responses & Embeddings APIs.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4 text-sm text-muted-foreground'>
            <Code>{`# .env
OPENAI_API_KEY=sk-...
SOMNIA_RPC_URL=https://dream-rpc.somnia.network

# Optional overrides
SENTINELX_ROUTER_ADDRESS=0xrouter
AGENT_INBOX_ADDRESS=0xinbox`}</Code>
            <p>
              <code>/api/ai/summarize</code> and <code>/api/ai/plan</code> wrap <code>gpt-4.1-mini</code> for deterministic, JSON-typed responses. Incident write-ups include severity, mitigations, and advisory tags.
            </p>
            <p>
              The docs copilot (<code>/api/ai/ask</code>) embeds Markdown into Convex, enabling grounded Q&amp;A for operators.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Control plane · AgentInbox</CardTitle>
            <CardDescription>
              Human-in-the-loop approvals before GuardianHub execution.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4 text-sm text-muted-foreground'>
            <Code>{`// blockchain/contracts/AgentInbox.sol
function execute(bytes32 id, address target, bytes calldata data) external onlyOperator {
  require(allowlist[target], "target not allowed");
  (bool ok, bytes memory res) = target.call(data);
  require(ok, "call failed");
  emit Executed(id, res);
}`}</Code>
            <p>
              Deploy <code>AgentInbox</code> on Somnia testnet and allowlist GuardianHub. When the AI proposes <code>pause</code>, the action intent bundles target + calldata (<code>GuardianHub.pause()</code>). Approve in the Actions console and record the transaction hash after submission.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Convex schema</CardTitle>
            <CardDescription>
              Telemetry, incidents, action intents, and doc embeddings.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4 text-sm text-muted-foreground'>
            <Code>{`telemetry: monitorId, ts, source, datapoint
incidents: severity, status, rootCause, mitigations
actionIntents: plan { name, target, calldata, rationale }
docChunks: embeddings for docs copilot`}</Code>
            <p>
              Use <code>telemetry:record</code> for any custom ingestion (gas spikes, log volume). Each incident maintains a full playbook and drives the dashboard daily brief.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className='space-y-4'>
        <h2 className='text-2xl font-semibold tracking-tight'>GuardianHub quickstart</h2>
        <Card>
          <CardContent className='space-y-4 text-sm text-muted-foreground'>
            <Code>{`cd blockchain
pnpm install
pnpm compile
pnpm exec hardhat ignition deploy ./ignition/modules/sentinelx.ts --network somniatestnet`}</Code>
            <p>
              Export contract addresses: GuardianHub, SafeOracleRouter, AgentInbox. Feed them into <code>/monitors/new</code> and the SentinelX settings page.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
