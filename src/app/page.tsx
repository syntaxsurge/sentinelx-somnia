'use client'

import Link from 'next/link'
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  Clock,
  Layers,
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
    title: 'Reality lags the oracle heartbeat',
    description:
      'Price feeds wait for deviation thresholds or heartbeat timers before updating. During Somnia volatility, teams trade on stale numbers for minutes.',
    icon: AlertTriangle,
    link: {
      label: 'Chainlink data feeds',
      href: 'https://docs.chain.link/data-feeds'
    }
  },
  {
    title: 'Multi-source configs drift apart',
    description:
      'Somnia DIA feeds recommend 0.5% deviation and 120s freshness; Chainlink defaults to 1% / 180s. Without continuous alignment, governance votes lock in bad assumptions.',
    icon: Layers,
    link: {
      label: 'DIA price feeds on Somnia',
      href: 'https://docs.somnia.network/developer/building-dapps/oracles/dia-price-feeds'
    }
  },
  {
    title: 'Operational mistakes cascade fast',
    description:
      'Paused keeper jobs, MEV manipulations, and manual incident response leave users exposed. SRE-grade telemetry, AI triage, and gated execution are now table stakes.',
    icon: Workflow,
    link: {
      label: 'Flashbots research',
      href: 'https://docs.flashbots.net/flashbots-auction/overview'
    }
  }
]

const systemLayers = [
  {
    title: 'Data plane',
    description:
      'Policy runner evaluates SafeOracleRouter on schedule, compares Chainlink, DIA, and custom feeds, and stores telemetry snapshots in Convex.',
    extra:
      'Every monitor keeps historical drift, stale durations, and operator overrides for post-mortems.',
    icon: Activity
  },
  {
    title: 'AI plane',
    description:
      'LLM summaries translate anomalies into human context: severity, root cause, mitigations, and fallback logic when OpenAI is unreachable.',
    extra: 'Operators can see both the raw data and the AI judgement to decide faster.',
    icon: BrainCircuit
  },
  {
    title: 'Control plane',
    description:
      'GuardianHub + AgentInbox hold allowlisted contract calls. Operators approve or reject action intents and relay mitigations with tracked Somnia transaction hashes.',
    extra: 'All activity rides through audit-friendly pipelines and sticks to allowlists.',
    icon: ShieldCheck
  }
]

const responsePlaybook = [
  {
    title: 'Watch continuously',
    description:
      'SafeOracleRouter monitors run every cycle, comparing multi-source data and contract thresholds so drift never slips through nightly cron gaps.',
    icon: Clock
  },
  {
    title: 'Diagnose with context',
    description:
      'Telemetry is normalized into incidents with AI-written context plus deterministic fallbacks. Teams see what moved, why it matters, and how long it has been broken.',
    icon: Layers
  },
  {
    title: 'Decide and act safely',
    description:
      'Action intents craft GuardianHub calldata, preflight simulations, and execution plans. Operators approve the single allowlisted tx, keeping final accountability.',
    icon: ShieldCheck
  }
]

const outcomes = [
  {
    metric: '24 / 7',
    label: 'Coverage windows',
    description:
      'Monitoring never pauses—policy runner keeps tenants online across weekends, holidays, and volatile Somnia trading sessions.'
  },
  {
    metric: '< 60s',
    label: 'Incident triage',
    description:
      'AI summaries land in the dashboard within a minute of drift detection so operators can contain issues before they hit liquidity pools.'
  },
  {
    metric: '1 tx',
    label: 'Controlled execution',
    description:
      'Allowlisted AgentInbox relays mean mitigations reach chain with a single signed transaction and full audit trails.'
  }
]

const featureCards = [
  {
    title: 'Multi-source oracle guardrails',
    description:
      'Set deviation, quorum, and heartbeat per asset. Compare Chainlink, DIA, or custom feeds and surface incidents before end users feel them.',
    icon: CheckCircle2
  },
  {
    title: 'AI triage & action intents',
    description:
      'Incident summaries, mitigations, and GuardianHub calldata arrive in seconds so operators focus on decisions, not copy-paste playbooks.',
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
    <main className='min-h-screen bg-gradient-to-b from-black via-[#050b14] to-black text-slate-100'>
      <section className='mx-auto max-w-6xl px-4 pb-20 pt-24 sm:pb-28 sm:pt-32'>
        <Badge className='w-fit border-white/20 bg-white/5 text-brand-teal-light uppercase tracking-wide'>
          SentinelX for Somnia
        </Badge>
        <div className='mt-10 grid gap-12 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-center'>
          <div className='space-y-6'>
            <h1 className='text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl'>
              Keep Somnia oracles honest, resilient, and operator-controlled
            </h1>
            <p className='max-w-2xl text-lg leading-relaxed text-slate-300 sm:text-xl'>
              SentinelX gives protocol teams a reliable safety net: real-time monitors, AI-assisted
              incidents, and an allowlisted execution plane that keeps humans in control while the
              system does the heavy lifting.
            </p>
            <ul className='space-y-3 text-sm text-slate-400 sm:text-base'>
              <li className='flex items-start gap-3'>
                <ShieldCheck className='mt-1 h-5 w-5 text-brand-teal-light' />
                <span>Guardians approve every action while GuardianHub enforces allowlists.</span>
              </li>
              <li className='flex items-start gap-3'>
                <Activity className='mt-1 h-5 w-5 text-brand-teal-light' />
                <span>Telemetry flows into Convex so drift, staleness, and remediation are auditable.</span>
              </li>
              <li className='flex items-start gap-3'>
                <BrainCircuit className='mt-1 h-5 w-5 text-brand-teal-light' />
                <span>AI triage writes actionable incidents even when external LLMs are offline.</span>
              </li>
            </ul>
            <div className='flex flex-wrap gap-4'>
              <Button
                asChild
                size='lg'
                className='gap-2 bg-brand-teal px-7 text-base text-background hover:bg-brand-teal-light'
              >
                <Link href='/dashboard'>
                  Open dashboard
                  <ArrowRight className='h-4 w-4' />
                </Link>
              </Button>
              <Button
                asChild
                size='lg'
                variant='outline'
                className='gap-2 border-white/20 px-7 text-base text-slate-200 hover:bg-white/10'
              >
                <Link href='/docs'>
                  Read SentinelX docs
                  <BookOpen className='h-4 w-4' />
                </Link>
              </Button>
            </div>
          </div>
          <Card className='border-white/10 bg-white/5 backdrop-blur-sm'>
            <CardHeader>
              <CardTitle className='text-xl text-slate-100'>Why teams choose SentinelX</CardTitle>
              <CardDescription className='text-slate-400'>
                Autonomy when you want it, human control when you need it. SentinelX anchors
                incident response in clear policy, verifiable data, and accountable execution.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4 text-sm text-slate-400'>
              <p>
                • Autonomous monitors catch drift across Chainlink, DIA, and custom feeds before
                slippage hits pools.
              </p>
              <p>
                • AI generates severity, mitigations, and playbooks, while operators stay in charge
                of the final transaction.
              </p>
              <p>
                • Convex persistence and GuardianHub guardrails make audits and post-incident
                reviews straightforward.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className='border-t border-white/10 bg-[#050a13]/90'>
        <div className='mx-auto max-w-6xl px-4 py-16'>
          <div className='mb-12 max-w-4xl space-y-4'>
            <h2 className='text-3xl font-semibold tracking-tight sm:text-4xl'>
              The reliability gap on Somnia today
            </h2>
            <p className='text-base text-slate-400 sm:text-lg'>
              Volatility, thin liquidity, and multi-source oracle stacks make reliability a full-time
              job. Without automated guardrails, teams respond after losses. SentinelX starts by
              confronting the root issues.
            </p>
          </div>
          <div className='grid gap-6 md:grid-cols-3'>
            {problems.map(problem => (
              <Card key={problem.title} className='border-white/10 bg-white/5 backdrop-blur-sm'>
                <CardHeader className='space-y-4'>
                  <div className='inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand-teal/20 text-brand-teal-light'>
                    <problem.icon className='h-5 w-5' />
                  </div>
                  <CardTitle className='text-lg text-slate-100'>{problem.title}</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4 text-sm leading-relaxed text-slate-400'>
                  <p>{problem.description}</p>
                  <Link
                    href={problem.link.href}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='inline-flex items-center gap-2 text-brand-teal-light hover:text-brand-teal'
                  >
                    {problem.link.label}
                    <ArrowRight className='h-3.5 w-3.5' />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className='mx-auto max-w-6xl px-4 py-16 lg:py-20'>
        <div className='grid gap-12 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]'>
          <div className='space-y-6'>
            <h2 className='text-3xl font-semibold tracking-tight sm:text-4xl'>
              The SentinelX stack keeps coverage, diagnosis, and action in sync
            </h2>
            <p className='text-base text-slate-400 sm:text-lg'>
              Every layer is purpose-built: monitors gather truth, AI provides clarity, and the
              control plane makes mitigations safe to execute. Each piece can run on its own, but
              SentinelX shines when everything is connected.
            </p>
            <div className='grid gap-4 sm:grid-cols-2 sm:gap-6'>
              {systemLayers.map(layer => (
                <Card key={layer.title} className='border-white/10 bg-white/5 backdrop-blur-sm'>
                  <CardHeader className='space-y-3'>
                    <div className='inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-teal/20 text-brand-teal-light'>
                      <layer.icon className='h-6 w-6' />
                    </div>
                    <div className='space-y-2'>
                      <CardTitle className='text-xl text-slate-100'>{layer.title}</CardTitle>
                      <CardDescription className='text-sm text-slate-400'>
                        {layer.description}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className='text-sm text-slate-400'>{layer.extra}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <Card className='border-white/10 bg-white/5 backdrop-blur-sm'>
            <CardHeader className='space-y-2'>
              <CardTitle className='text-xl text-slate-100'>Response playbook</CardTitle>
              <CardDescription className='text-slate-400'>
                SentinelX keeps the loop tight—from detection to mitigation—without removing human
                oversight.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-6 text-sm text-slate-300'>
              {responsePlaybook.map(step => (
                <div key={step.title} className='flex items-start gap-4'>
                  <div className='mt-1 rounded-full bg-brand-teal/20 p-2 text-brand-teal-light'>
                    <step.icon className='h-4 w-4' />
                  </div>
                  <div className='space-y-1'>
                    <p className='font-semibold text-slate-100'>{step.title}</p>
                    <p className='text-slate-400'>{step.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className='border-y border-white/10 bg-[#040910]'>
        <div className='mx-auto max-w-6xl px-4 py-16'>
          <div className='mb-12 space-y-4 text-center'>
            <h2 className='text-3xl font-semibold tracking-tight sm:text-4xl'>
              Operational outcomes SentinelX delivers
            </h2>
            <p className='mx-auto max-w-2xl text-base text-slate-400 sm:text-lg'>
              Measure success in minutes saved, incidents contained, and mitigations that land
              safely the first time.
            </p>
          </div>
          <div className='grid gap-6 sm:grid-cols-3'>
            {outcomes.map(outcome => (
              <Card key={outcome.label} className='border-white/10 bg-white/5 backdrop-blur-sm'>
                <CardHeader className='space-y-3 text-center'>
                  <p className='text-3xl font-semibold text-brand-teal-light'>{outcome.metric}</p>
                  <CardTitle className='text-lg text-slate-100'>{outcome.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className='text-sm text-slate-400'>{outcome.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className='mx-auto max-w-6xl px-4 py-16'>
        <div className='mb-10 space-y-3 text-center'>
          <h2 className='text-3xl font-semibold tracking-tight text-slate-100 sm:text-4xl'>
            Built for production teams
          </h2>
          <p className='mx-auto max-w-3xl text-base text-slate-400 sm:text-lg'>
            Everything you need to ship reliable price-driven agents and dApps on Somnia—from
            cron-friendly indexers and action queues to docs that cover REST hooks, webhooks, and
            policy runners.
          </p>
        </div>
        <div className='grid gap-6 md:grid-cols-3'>
          {featureCards.map(feature => (
            <Card key={feature.title} className='border-white/10 bg-white/5 backdrop-blur-sm'>
              <CardHeader className='space-y-4'>
                <div className='inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-teal/20 text-brand-teal-light'>
                  <feature.icon className='h-6 w-6' />
                </div>
                <div className='space-y-2'>
                  <CardTitle className='text-lg text-slate-100'>{feature.title}</CardTitle>
                  <CardDescription className='text-sm leading-relaxed text-slate-400'>
                    {feature.description}
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
        <div className='mt-12 grid gap-6 rounded-2xl border border-white/10 bg-white/5 p-10 text-sm text-slate-300 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] md:items-center'>
          <div className='space-y-3'>
            <h3 className='text-2xl font-semibold text-slate-100'>
              Ready to guard your protocol?
            </h3>
            <p className='text-slate-400'>
              Spin up a tenant, seed demo data, and run the full SentinelX loop locally. When you are
              ready for mainnet, configure the GuardianHub and AgentInbox addresses once and ship
              with confidence.
            </p>
          </div>
          <div className='flex flex-wrap gap-3'>
            <Button
              asChild
              className='gap-2 bg-brand-teal px-6 text-base text-background hover:bg-brand-teal-light'
            >
              <Link href='/onboarding'>
                Create a workspace
                <ArrowRight className='h-4 w-4' />
              </Link>
            </Button>
            <Button
              asChild
              variant='outline'
              className='gap-2 border-white/20 px-6 text-base text-slate-200 hover:bg-white/10'
            >
              <Link href='/docs'>
                Explore docs
                <BookOpen className='h-4 w-4' />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
