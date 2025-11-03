'use client'

import Link from 'next/link'

export default function HomePage() {
  return (
    <main className='mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-16 px-6 py-24'>
      <section className='flex flex-col gap-6'>
        <span className='inline-flex w-max items-center rounded-full border border-emerald-400/40 bg-emerald-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-emerald-100'>
          Somnia Shannon Testnet ready
        </span>
        <h1 className='text-4xl font-semibold leading-tight md:text-6xl'>
          SentinelX Guardian
        </h1>
        <p className='max-w-3xl text-lg text-slate-200'>
          SentinelX is an infrastructure layer for Somnia builders. It combines
          dual-oracle validation, on-chain guardians, and automated policy
          agents to pause or resume contracts the instant pricing data becomes
          unsafe.
        </p>
        <div className='flex flex-wrap gap-4'>
          <Link
            className='rounded-md bg-emerald-400 px-6 py-3 text-base font-semibold text-slate-950 transition hover:bg-emerald-300'
            href='https://explorer.somnia.network/'
          >
            Explore Somnia
          </Link>
          <Link
            className='rounded-md border border-emerald-400/60 px-6 py-3 text-base font-semibold text-slate-50 transition hover:border-emerald-200/80 hover:text-emerald-100'
            href='https://docs.somnia.network/'
          >
            View Somnia docs
          </Link>
        </div>
      </section>

      <section className='grid gap-8 md:grid-cols-3'>
        {cards.map(card => (
          <article
            key={card.title}
            className='rounded-xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur'
          >
            <h2 className='text-xl font-semibold text-white'>{card.title}</h2>
            <p className='mt-2 text-sm text-slate-200'>{card.body}</p>
          </article>
        ))}
      </section>
    </main>
  )
}

const cards = [
  {
    title: 'Safe price surfaces',
    body: 'Combine Protofire Chainlink feeds with DIA adapters to compute guarded prices that downstream dApps can consume without trusting a single data source.'
  },
  {
    title: 'Autonomous guardians',
    body: 'Tenant-specific guardians enforce pause/unpause actions across Somnia contracts when SentinelX policies detect deviations, outages, or stale feeds.'
  },
  {
    title: 'Convex-backed observability',
    body: 'Incidents, monitors, and policy executions are persisted in Convex for fast analytics, audit trails, and integrations with downstream systems.'
  }
]
