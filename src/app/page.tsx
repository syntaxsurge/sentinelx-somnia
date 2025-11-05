'use client'

import Link from 'next/link'
import {
  ShieldCheck,
  Radar,
  RefreshCw,
  ArrowRight,
  Code2,
  Wallet,
  Network
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

const highlights = [
  {
    title: 'Safe price surface',
    description:
      'SafeOracleRouter compares Protofire Chainlink and DIA feeds, exposing guarded answers, status flags, and raw oracle metadata for audits.',
    icon: ShieldCheck,
    gradient: 'from-emerald-500/10 to-teal-500/10'
  },
  {
    title: 'Guardian enforcement',
    description:
      'GuardianHub pauses and unpauses critical contracts atomically, ensuring Somnia applications fail safe under deviation or stale data.',
    icon: Radar,
    gradient: 'from-blue-500/10 to-cyan-500/10'
  },
  {
    title: 'Convex observability',
    description:
      'Tenants, monitors, and incidents persist in Convex with SIWE auth, powering dashboards, policy automation, and webhook fan-out.',
    icon: RefreshCw,
    gradient: 'from-violet-500/10 to-purple-500/10'
  }
]

const architecture = [
  {
    title: 'Next.js App Router',
    description:
      'Marketing shell, dashboard, and REST endpoints run on Next.js 15 with Tailwind + shadcn/ui for accessible, responsive interfaces.',
    icon: Code2
  },
  {
    title: 'RainbowKit + SIWE',
    description:
      'WalletConnect v2 with custom RainbowKit authentication adapter keeps sessions in iron-session and syncs to Convex.',
    icon: Wallet
  },
  {
    title: 'Somnia Shannon Testnet',
    description:
      'Monitors guard Somnia contracts via SafeOracleRouter, with policy runs calling latest(bytes32) and logging incidents.',
    icon: Network
  }
]

export default function Home() {
  return (
    <section className='space-y-20 py-12 sm:py-20'>
      <div className='mx-auto flex max-w-5xl flex-col items-center gap-8 text-center px-4'>
        <Badge
          variant='secondary'
          className='px-4 py-2 text-xs font-semibold uppercase tracking-wider'
        >
          <span className='inline-block h-2 w-2 rounded-full bg-primary mr-2 animate-pulse' />
          Somnia Guardian Stack
        </Badge>
        <div className='space-y-4'>
          <h1 className='text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent'>
            Dual-oracle circuit breaker
          </h1>
          <h2 className='text-3xl font-bold tracking-tight sm:text-4xl text-primary'>
            for Somnia dApps
          </h2>
        </div>
        <p className='text-lg sm:text-xl text-muted-foreground max-w-3xl leading-relaxed'>
          SentinelX compares Protofire Chainlink and DIA feeds, logs every
          incident, and empowers guardians to pause smart contracts before bad
          data causes loss.
        </p>
        <div className='flex flex-wrap items-center justify-center gap-4 pt-4'>
          <Button asChild size='lg' className='gap-2 text-base px-8'>
            <Link href='/dashboard'>
              Open dashboard
              <ArrowRight className='h-4 w-4' />
            </Link>
          </Button>
          <Button asChild size='lg' variant='outline' className='text-base px-8'>
            <Link href='/docs'>Read documentation</Link>
          </Button>
        </div>
      </div>

      <div className='grid gap-6 md:grid-cols-3 max-w-6xl mx-auto px-4'>
        {highlights.map(item => (
          <Card
            key={item.title}
            className='group relative overflow-hidden border-border/60 transition-all hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1'
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity`}
            />
            <CardHeader className='space-y-4 relative z-10'>
              <div className='inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors'>
                <item.icon className='h-7 w-7' />
              </div>
              <div className='space-y-2'>
                <CardTitle className='text-xl'>{item.title}</CardTitle>
                <CardDescription className='leading-relaxed text-base'>
                  {item.description}
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className='mx-auto max-w-6xl space-y-8 px-4'>
        <div className='text-center space-y-2'>
          <h2 className='text-3xl font-bold tracking-tight text-foreground'>
            Built with modern stack
          </h2>
          <p className='text-muted-foreground text-lg'>
            Enterprise-grade architecture for blockchain monitoring
          </p>
        </div>
        <div className='grid gap-6 md:grid-cols-3'>
          {architecture.map(item => (
            <Card key={item.title} className='border-border/60 hover:border-primary/50 transition-all group'>
              <CardHeader className='space-y-4'>
                <div className='inline-flex h-12 w-12 items-center justify-center rounded-xl bg-muted border border-border/60 text-muted-foreground group-hover:border-primary/50 group-hover:text-primary transition-colors'>
                  <item.icon className='h-6 w-6' />
                </div>
                <div className='space-y-2'>
                  <CardTitle className='text-lg'>{item.title}</CardTitle>
                  <CardDescription className='leading-relaxed'>
                    {item.description}
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
