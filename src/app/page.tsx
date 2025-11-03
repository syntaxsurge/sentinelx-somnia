'use client'

import Link from 'next/link'

import { ArrowRight, ShieldCheck, Zap } from 'lucide-react'

import { cn } from '@/lib/utils'

const protofireFeed =
  process.env.NEXT_PUBLIC_PROTOFIRE_ETH_USD ??
  '0xd9132c1d762D432672493F640a63B758891B449e'
const diaFeed =
  process.env.NEXT_PUBLIC_DIA_WETH_USD ??
  '0x786c7893F8c26b80d42088749562eDb50Ba9601E'

const architectureBlocks = [
  {
    title: 'SafeOracleRouter',
    description:
      'Somnia-native dual feed router computes guarded prices, flags deviations, and emits freshness signals for policy automation.',
    highlight: 'On-chain Solidity · Somnia Shannon Testnet'
  },
  {
    title: 'GuardianHub',
    description:
      'SentinelX operators pause/unpause Guardable contracts instantly. Targets inherit a pausability mixin with zero external deps.',
    highlight: 'Hardhat Ignition deployment'
  },
  {
    title: 'Convex Observability',
    description:
      'Tenants, monitors, incidents, and API keys live inside Convex. Queries power the dashboard, policy runners, and webhooks.',
    highlight: 'Convex serverless tables + indexes'
  },
  {
    title: 'Policy Agent',
    description:
      'Server-side job reads SafeOracleRouter, writes enriched incidents, and recommends guardian actions with explainable summaries.',
    highlight: 'Next.js API + Viem client'
  }
]

const flowSteps = [
  {
    label: 'Register',
    title: 'Create a tenant & monitor',
    body: 'Point SentinelX to your guarded contract, guardian hub, and the Protofire + DIA feed pair you rely on.'
  },
  {
    label: 'Evaluate',
    title: 'Policy runner inspects feeds',
    body: 'The agent compares both oracles, computes deviation, and logs a decision to Convex with every evaluation cycle.'
  },
  {
    label: 'Enforce',
    title: 'Guardians act automatically',
    body: 'If data is stale or diverges, SentinelX flags the monitor and the GuardianHub can pause or resume on your behalf.'
  }
]

const integrationPoints = [
  {
    title: 'Oracles · ETH/USD',
    items: [
      { label: 'Protofire Chainlink', value: protofireFeed },
      { label: 'DIA Adapter (Aggregator)', value: diaFeed }
    ]
  },
  {
    title: 'Contracts',
    items: [
      {
        label: 'SafeOracleRouter',
        value: 'deploy via Ignition → safe price surface'
      },
      {
        label: 'GuardianHub',
        value: 'register guardable targets + operators'
      },
      {
        label: 'SOMIPaymentGuarded',
        value: 'reference implementation of GuardablePausable'
      }
    ]
  },
  {
    title: 'Automation',
    items: [
      { label: 'Policy CLI', value: 'pnpm policy:run' },
      { label: 'Dashboard trigger', value: '/dashboard → Run policy' },
      { label: 'API endpoint', value: 'POST /api/jobs/run-policy' }
    ]
  }
]

export default function HomePage() {
  return (
    <div className='mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 sm:px-6'>
      <section className='grid gap-10 pt-6 md:grid-cols-[1.1fr_0.9fr] md:items-center'>
        <div className='space-y-6'>
          <span className='inline-flex w-max items-center gap-2 rounded-full border border-brand-teal/40 bg-brand-teal/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-brand-teal'>
            Somnia Guardian Stack
          </span>
          <h1 className='text-balance text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl'>
            Dual-oracle circuit breakers for Somnia in one deployable kit.
          </h1>
          <p className='max-w-2xl text-lg text-muted-foreground'>
            SentinelX keeps Somnia smart contracts safe by validating Protofire
            Chainlink feeds against DIA adapters, logging incidents in Convex,
            and coordinating guardian actions without human reaction time.
          </p>
          <div className='flex flex-wrap items-center gap-4'>
            <Link
              href='/dashboard'
              className='text-brand-teal-foreground inline-flex items-center gap-2 rounded-lg bg-brand-teal px-6 py-3 text-sm font-semibold shadow transition hover:scale-[1.01] hover:bg-brand-teal-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal-light'
            >
              Launch dashboard
              <ArrowRight className='h-4 w-4' />
            </Link>
            <Link
              href='/docs'
              className='inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-medium text-foreground transition hover:border-brand-teal hover:text-brand-teal'
            >
              Read the playbook
            </Link>
          </div>
          <div className='grid gap-4 rounded-2xl border border-border/80 bg-card/70 p-5 shadow-lg sm:grid-cols-3'>
            <Stat
              label='Feeds hardened'
              value='Protofire + DIA'
              description='ETH/USD reference pair'
            />
            <Stat
              label='Guardian latency'
              value='< 2s'
              description='Pause/unpause via GuardianHub'
            />
            <Stat
              label='Policy coverage'
              value='Programmable'
              description='Deviation & freshness controls'
            />
          </div>
        </div>
        <div className='relative flex flex-col gap-4 rounded-3xl border border-brand-teal/30 bg-gradient-to-br from-brand-teal/15 via-background to-brand-orange/20 p-6 shadow-xl'>
          <ShieldCheck className='h-10 w-10 text-brand-teal' />
          <h2 className='text-2xl font-semibold text-foreground'>
            End-to-end control plane
          </h2>
          <p className='text-sm text-muted-foreground'>
            Deploy SafeOracleRouter, register targets in GuardianHub, and let
            SentinelX track every incident with rich metadata. Convex keeps your
            audit trail immutable and queryable.
          </p>
          <div className='rounded-2xl border border-white/10 bg-background/60 p-4 font-mono text-xs text-muted-foreground shadow-inner'>
            <p className='text-[11px] font-semibold uppercase tracking-[0.25em] text-brand-teal'>
              ETH/USD feeds
            </p>
            <div className='mt-3 space-y-2'>
              <FeedRow label='Protofire' value={protofireFeed} />
              <FeedRow label='DIA Adapter' value={diaFeed} />
            </div>
          </div>
          <div className='flex items-center gap-2 text-xs text-muted-foreground'>
            <Zap className='h-4 w-4 text-brand-orange' />
            Live for Somnia Shannon Testnet (Chain ID 50312)
          </div>
        </div>
      </section>

      <section className='space-y-8'>
        <header className='max-w-3xl space-y-3'>
          <p className='text-xs font-semibold uppercase tracking-[0.35em] text-brand-teal'>
            Architecture
          </p>
          <h2 className='text-3xl font-semibold text-foreground'>
            Modular building blocks ready for production hardening.
          </h2>
          <p className='text-sm text-muted-foreground'>
            Each module ships with tests, Ignition deployments, and synced ABIs.
            Extend the pieces independently or adopt the full stack.
          </p>
        </header>
        <div className='grid gap-6 md:grid-cols-2'>
          {architectureBlocks.map(block => (
            <article
              key={block.title}
              className='group flex flex-col gap-4 rounded-2xl border border-border bg-card/70 p-6 shadow transition hover:border-brand-teal hover:shadow-lg'
            >
              <div className='flex items-center justify-between'>
                <h3 className='text-xl font-semibold text-foreground'>
                  {block.title}
                </h3>
                <span className='rounded-full border border-brand-teal/40 bg-brand-teal/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-brand-teal'>
                  Ready
                </span>
              </div>
              <p className='text-sm text-muted-foreground'>
                {block.description}
              </p>
              <p className='text-xs font-medium uppercase tracking-[0.3em] text-brand-orange'>
                {block.highlight}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className='space-y-8'>
        <header className='max-w-3xl space-y-3'>
          <p className='text-xs font-semibold uppercase tracking-[0.35em] text-brand-teal'>
            SentinelX policy lifecycle
          </p>
          <h2 className='text-3xl font-semibold text-foreground'>
            Three simple steps from onboarding to automated protection.
          </h2>
        </header>
        <div className='grid gap-6 md:grid-cols-3'>
          {flowSteps.map((step, index) => (
            <article
              key={step.title}
              className={cn(
                'relative flex h-full flex-col gap-4 rounded-2xl border border-border bg-card/70 p-6 shadow-lg',
                index === 1 && 'md:-translate-y-4 md:bg-card'
              )}
            >
              <span className='text-xs font-semibold uppercase tracking-[0.35em] text-brand-orange'>
                {step.label}
              </span>
              <h3 className='text-xl font-semibold text-foreground'>
                {step.title}
              </h3>
              <p className='text-sm text-muted-foreground'>{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className='space-y-6 rounded-3xl border border-border bg-card/80 p-8 shadow-2xl'>
        <header className='space-y-3'>
          <p className='text-xs font-semibold uppercase tracking-[0.35em] text-brand-teal'>
            Integration surface
          </p>
          <h2 className='text-3xl font-semibold text-foreground'>
            All live endpoints & contracts at a glance.
          </h2>
          <p className='text-sm text-muted-foreground'>
            Swap these references into your Somnia deployments to harden price
            feeds and wire guardians without touching legacy flows.
          </p>
        </header>
        <div className='grid gap-6 md:grid-cols-3'>
          {integrationPoints.map(column => (
            <div
              key={column.title}
              className='flex h-full flex-col gap-4 rounded-2xl border border-border bg-background/70 p-5 shadow-inner'
            >
              <h3 className='text-sm font-semibold uppercase tracking-[0.35em] text-brand-orange'>
                {column.title}
              </h3>
              <div className='space-y-3 font-mono text-xs text-muted-foreground'>
                {column.items.map(item => (
                  <div key={item.label}>
                    <p className='text-[11px] font-semibold uppercase tracking-[0.25em] text-brand-teal'>
                      {item.label}
                    </p>
                    <p className='break-all text-muted-foreground/90'>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className='space-y-6 pb-8'>
        <header className='max-w-3xl space-y-3'>
          <p className='text-xs font-semibold uppercase tracking-[0.35em] text-brand-teal'>
            Ready to evaluate?
          </p>
          <h2 className='text-3xl font-semibold text-foreground'>
            Trigger a policy run and observe a full incident lifecycle in
            minutes.
          </h2>
        </header>
        <div className='grid gap-6 md:grid-cols-[2fr_1fr]'>
          <div className='rounded-3xl border border-border bg-card/80 p-6 shadow-xl'>
            <ol className='space-y-4 text-sm text-muted-foreground'>
              <li>
                <span className='font-semibold text-brand-teal'>1.</span> Deploy
                `SafeOracleRouter` & `GuardianHub` on Somnia Shannon Testnet
                using Hardhat Ignition.
              </li>
              <li>
                <span className='font-semibold text-brand-teal'>2.</span>{' '}
                Register a monitor in the dashboard and associate it with your
                guardable contract.
              </li>
              <li>
                <span className='font-semibold text-brand-teal'>3.</span> Hit
                “Run policy evaluation” to capture the result. Check
                `/dashboard` → Incident stream for audit logs.
              </li>
              <li>
                <span className='font-semibold text-brand-teal'>4.</span> Wire
                the GuardianHub pause/unpause into your runbooks—or let it act
                autonomously.
              </li>
            </ol>
          </div>
          <div className='flex flex-col items-start gap-4 rounded-3xl border border-brand-teal/40 bg-brand-teal/10 p-6 shadow-xl'>
            <h3 className='text-lg font-semibold text-brand-teal'>
              Need the technical breakdown?
            </h3>
            <p className='text-sm text-brand-teal-light'>
              Dive into the SentinelX playbook for deployment commands, Convex
              schema diagrams, and API reference.
            </p>
            <Link
              href='/docs'
              className='inline-flex items-center gap-2 rounded-lg border border-brand-teal px-4 py-2 text-sm font-semibold text-brand-teal transition hover:bg-brand-teal/10'
            >
              View documentation
              <ArrowRight className='h-4 w-4' />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

function Stat({
  label,
  value,
  description
}: {
  label: string
  value: string
  description: string
}) {
  return (
    <div className='space-y-2'>
      <p className='text-xs font-semibold uppercase tracking-[0.35em] text-brand-orange'>
        {label}
      </p>
      <p className='text-xl font-semibold text-foreground'>{value}</p>
      <p className='text-xs text-muted-foreground'>{description}</p>
    </div>
  )
}

function FeedRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className='text-[11px] font-semibold uppercase tracking-[0.25em] text-brand-orange'>
        {label}
      </p>
      <p className='break-all text-muted-foreground'>{value}</p>
    </div>
  )
}
