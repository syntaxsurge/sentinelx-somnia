'use client'

import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const highlights = [
  {
    title: 'Safe price surface',
    body: 'Cross-check Protofire Chainlink and DIA adapters, expose guarded prices, status flags, and raw feed data for auditability.'
  },
  {
    title: 'Guardian enforcement',
    body: 'GuardianHub pauses and resumes guardable contracts in a single transaction so Somnia apps fail safe by default.'
  },
  {
    title: 'Convex observability',
    body: 'Tenants, monitors, and incidents persist in Convex for instant dashboards, SIWE-authenticated access, and automation.'
  }
]

export default function Home() {
  return (
    <section className='flex flex-col items-center gap-12 py-16 text-center'>
      <div className='max-w-3xl space-y-6'>
        <span className='inline-flex items-center justify-center rounded-full border border-brand-teal/40 bg-brand-teal/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-brand-teal'>
          Somnia Guardian Stack
        </span>
        <h1 className='text-4xl font-semibold leading-tight sm:text-5xl'>
          Dual-oracle circuit breaker for Somnia dApps
        </h1>
        <p className='text-lg text-muted-foreground'>
          SentinelX compares Protofire Chainlink and DIA feeds, logs every
          incident, and empowers guardians to pause smart contracts before bad
          data causes loss.
        </p>
        <div className='flex flex-wrap items-center justify-center gap-3'>
          <Link href='/dashboard'>
            <Button size='lg'>Open dashboard</Button>
          </Link>
          <Link href='/docs'>
            <Button size='lg' variant='secondary'>
              Read docs
            </Button>
          </Link>
        </div>
      </div>
      <div className='grid w-full max-w-5xl gap-4 md:grid-cols-3'>
        {highlights.map(item => (
          <Card key={item.title}>
            <CardHeader>
              <CardTitle>{item.title}</CardTitle>
            </CardHeader>
            <CardContent className='text-sm text-muted-foreground'>
              {item.body}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
