'use client'

import Link from 'next/link'

import { ShieldCheck, Radar, RefreshCw } from 'lucide-react'

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
    icon: ShieldCheck
  },
  {
    title: 'Guardian enforcement',
    description:
      'GuardianHub pauses and unpauses critical contracts atomically, ensuring Somnia applications fail safe under deviation or stale data.',
    icon: Radar
  },
  {
    title: 'Convex observability',
    description:
      'Tenants, monitors, and incidents persist in Convex with SIWE auth, powering dashboards, policy automation, and webhook fan-out.',
    icon: RefreshCw
  }
]

const architecture = [
  {
    title: 'Next.js App Router',
    description:
      'Marketing shell, dashboard, and REST endpoints run on Next.js 15 with Tailwind + shadcn/ui for accessible, responsive interfaces.'
  },
  {
    title: 'RainbowKit + SIWE',
    description:
      'WalletConnect v2 with custom RainbowKit authentication adapter keeps sessions in iron-session and syncs to Convex.'
  },
  {
    title: 'Somnia Shannon Testnet',
    description:
      'Monitors guard Somnia contracts via SafeOracleRouter, with policy runs calling latest(bytes32) and logging incidents.'
  }
]

export default function Home() {
  return (
    <section className='space-y-16 py-16'>
      <div className='mx-auto flex max-w-4xl flex-col items-center gap-6 text-center'>
        <span className='inline-flex items-center rounded-full border border-muted-foreground/20 bg-muted px-4 py-1 text-xs font-semibold uppercase tracking-[0.4em] text-muted-foreground'>
          Somnia Guardian Stack
        </span>
        <h1 className='text-4xl font-semibold tracking-tight sm:text-5xl'>
          Dual-oracle circuit breaker for Somnia dApps
        </h1>
        <p className='text-lg text-muted-foreground'>
          SentinelX compares Protofire Chainlink and DIA feeds, logs every
          incident, and empowers guardians to pause smart contracts before bad
          data causes loss.
        </p>
        <div className='flex flex-wrap items-center justify-center gap-3'>
          <Button asChild size='lg'>
            <Link href='/dashboard'>Open dashboard</Link>
          </Button>
          <Button asChild size='lg' variant='secondary'>
            <Link href='/docs'>Read docs</Link>
          </Button>
        </div>
      </div>

      <div className='grid gap-4 md:grid-cols-3'>
        {highlights.map(item => (
          <Card key={item.title} className='relative overflow-hidden'>
            <CardHeader className='space-y-3'>
              <span className='inline-flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground'>
                <item.icon className='h-5 w-5' />
              </span>
              <CardTitle>{item.title}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className='mx-auto grid max-w-5xl gap-4 md:grid-cols-3'>
        {architecture.map(item => (
          <Card key={item.title}>
            <CardHeader>
              <CardTitle className='text-lg'>{item.title}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
            <CardContent />
          </Card>
        ))}
      </div>
    </section>
  )
}
