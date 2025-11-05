'use client'

import Link from 'next/link'
import {
  Activity,
  ArrowRight,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  ShieldCheck,
  Workflow
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

const problems = [
  {
    title: 'Feeds update on deviation + heartbeat',
    description:
      'Oracle prices refresh only when deviation thresholds or heartbeat timers fire. Drift and staleness are the default state, not an edge case.',
    link: {
      label: 'Chainlink data feeds',
      href: 'https://docs.chain.link/data-feeds'
    }
  },
  {
    title: 'Multi-source configs drift over time',
    description:
      'DIA on Somnia recommends 0.5% deviation and 120s freshness, while other feeds default to 1% / 180s. Mismatched values cause inaccurate reads.',
    link: {
      label: 'DIA price feeds on Somnia',
      href: 'https://docs.somnia.network/developer/building-dapps/oracles/dia-price-feeds'
    }
  },
  {
    title: 'MEV + operational mistakes cascade',
    description:
      'Flash-loan manipulation and paused keeper jobs still break DeFi protocols. Mitigation needs SRE-grade telemetry, AI triage, and human control.',
    link: {
      label: 'Flashbots research',
      href: 'https://docs.flashbots.net/flashbots-auction/overview'
    }
  }
]

const solution = [
  {
    title: 'Data plane',
    description:
      'Policy runner evaluates SafeOracleRouter for every monitor, comparing multi-source feeds, logging telemetry, and opening incidents in Convex.',
    icon: Activity
  },
  {
    title: 'AI plane',
    description:
      'LLM summaries translate telemetry into severity, root cause, mitigations, and proposed GuardianHub calldata—even when OpenAI is unavailable.',
    icon: BrainCircuit
  },
  {
    title: 'Control plane',
    description:
      'Operators approve and execute action intents from the dashboard; wallet signatures relay allowlisted calls via AgentInbox with audit-ready tx hashes.',
    icon: ShieldCheck
  }
]

const featureCards = [
  {
    title: 'Multi-source oracle guardrails',
    description:
      'Configure deviation and heartbeat per asset, evaluate Chainlink, DIA, or custom feeds, and catch drift before it hits users.',
    icon: CheckCircle2
  },
  {
    title: 'AI triage & action intents',
    description:
      'Incident summaries, mitigations, and GuardianHub calldata are generated in seconds, giving operators time to investigate instead of react.',
    icon: BrainCircuit
  },
  {
    title: 'Production-ready integration',
    description:
      'RainbowKit SIWE auth, Convex persistence, cron-ready policy runner, and docs with API/webhook examples make SentinelX deployable on day one.',
    icon: Workflow
  }
]

export default function Home() {
  return (
    <main className='min-h-screen bg-gradient-to-b from-white via-slate-50 to-white'>
      <section className='mx-auto flex max-w-6xl flex-col gap-10 px-4 pb-16 pt-20 sm:pb-24 sm:pt-28'>
        <Badge
          variant='outline'
          className='w-fit border-[#189baf]/40 bg-[#189baf]/10 text-[#0f6b79] uppercase tracking-wide'
        >
          Somnia · Infra + AI Agents
        </Badge>
        <div className='space-y-6'>
          <h1 className='text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl'>
            AI-guarded oracle reliability for{' '}
            <span className='text-[#189baf]'>Somnia</span>
          </h1>
          <p className='max-w-3xl text-lg leading-relaxed text-slate-600 sm:text-xl'>
            SentinelX watches multi-source price feeds, flags drift or staleness, triages incidents
            with AI, and lets guardians execute safe fixes before MEV or operator mistakes cascade
            into user losses.
          </p>
          <div className='flex flex-wrap gap-4'>
            <Button
              asChild
              size='lg'
              className='gap-2 bg-[#189baf] px-7 text-base hover:bg-[#15859b]'
            >
              <Link href='/dashboard'>
                Open dashboard
                <ArrowRight className='h-4 w-4' />
              </Link>
            </Button>
            <Button asChild size='lg' variant='outline' className='gap-2 px-7 text-base'>
              <Link href='/docs'>
                Read SentinelX docs
                <BookOpen className='h-4 w-4' />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className='bg-white/80'>
        <div className='mx-auto grid max-w-6xl gap-6 px-4 py-12 md:grid-cols-3'>
          {problems.map(problem => (
            <Card key={problem.title} className='border-border/60'>
              <CardHeader>
                <CardTitle className='text-lg'>{problem.title}</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4 text-sm leading-relaxed text-slate-600'>
                <p>{problem.description}</p>
                <Link
                  href={problem.link.href}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex items-center gap-2 text-[#189baf] hover:underline'
                >
                  {problem.link.label}
                  <ArrowRight className='h-3.5 w-3.5' />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className='mx-auto max-w-6xl px-4 py-16'>
        <div className='grid gap-6 md:grid-cols-3'>
          {solution.map(item => (
            <Card key={item.title} className='border border-[#189baf]/30 bg-[#189baf]/5'>
              <CardHeader className='space-y-4'>
                <div className='inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm text-[#189baf]'>
                  <item.icon className='h-6 w-6' />
                </div>
                <div className='space-y-2'>
                  <CardTitle className='text-xl text-[#0f6b79]'>{item.title}</CardTitle>
                  <CardDescription className='text-sm leading-relaxed text-[#0f4b57]'>
                    {item.description}
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className='mx-auto max-w-6xl px-4 pb-24'>
        <div className='mb-10 space-y-3 text-center'>
          <h2 className='text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl'>
            Built for production teams
          </h2>
          <p className='mx-auto max-w-3xl text-base text-slate-600 sm:text-lg'>
            Everything you need to ship reliable price-driven agents and dApps on Somnia—from cron
            friendly indexers and action queues to docs that spell out REST hooks, webhooks, and
            policy runners.
          </p>
        </div>
        <div className='grid gap-6 md:grid-cols-3'>
          {featureCards.map(feature => (
            <Card key={feature.title} className='border-border/60 hover:border-[#189baf]/40'>
              <CardHeader className='space-y-4'>
                <div className='inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#189baf]/10 text-[#189baf]'>
                  <feature.icon className='h-6 w-6' />
                </div>
                <div className='space-y-2'>
                  <CardTitle className='text-lg'>{feature.title}</CardTitle>
                  <CardDescription className='text-sm leading-relaxed text-slate-600'>
                    {feature.description}
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
        <div className='mt-10 flex flex-col gap-3 text-sm text-slate-500 md:flex-row md:items-center'>
          <Workflow className='h-4 w-4 text-[#189baf]' />
          <p>
            Backed by deviation/heartbeat research (Chainlink, DIA) and MEV mitigation work from{' '}
            <Link
              href='https://docs.flashbots.net/flashbots-auction/overview'
              target='_blank'
              rel='noopener noreferrer'
              className='text-[#189baf] underline'
            >
              Flashbots
            </Link>
            . SentinelX applies those patterns to Somnia with AI + human-in-the-loop guardrails.
          </p>
        </div>
      </section>
    </main>
  )
}
