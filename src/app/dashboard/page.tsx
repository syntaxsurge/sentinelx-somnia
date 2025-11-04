import Link from 'next/link'

import { ArrowUpRight } from 'lucide-react'

import { CreateApiKeyForm } from '@/components/create-api-key-form'
import { CreateMonitorForm } from '@/components/create-monitor-form'
import { CreateTenantForm } from '@/components/create-tenant-form'
import { RunPolicyButton } from '@/components/run-policy-button'
import { cn } from '@/lib/utils'

function resolveBaseUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}

async function fetchJson(path: string) {
  const base = resolveBaseUrl()
  const response = await fetch(`${base}${path}`, {
    cache: 'no-store'
  })

  if (!response.ok) {
    throw new Error(`Failed to load ${path}: ${response.status}`)
  }

  return response.json()
}

export default async function DashboardPage() {
  const [monitorsPayload, incidentsPayload, tenantsPayload, apiKeysPayload] =
    await Promise.all([
      fetchJson('/api/monitors'),
      fetchJson('/api/incidents'),
      fetchJson('/api/tenants'),
      fetchJson('/api/api-keys')
    ])

  const monitors = (monitorsPayload?.monitors ?? []) as any[]
  const incidents = (incidentsPayload?.incidents ?? []) as any[]
  const tenants = (tenantsPayload?.tenants ?? []) as any[]
  const apiKeys = (apiKeysPayload?.keys ?? []) as any[]
  const attentionCount = monitors.filter(
    monitor => monitor.status === 'attention'
  ).length

  const identifier = (value: unknown) =>
    typeof value === 'string' ? value : JSON.stringify(value)

  const tenantMap = new Map(
    tenants.map(tenant => [identifier(tenant._id), tenant])
  )

  const stats = [
    { label: 'Tenants', value: tenants.length, hint: 'Guarded apps onboarded' },
    {
      label: 'Monitors',
      value: monitors.length,
      hint: 'Active dual-oracle observers'
    },
    {
      label: 'Incidents',
      value: incidents.length,
      hint: 'Logged policy evaluations'
    },
    {
      label: 'Attention required',
      value: attentionCount,
      hint: 'Monitors breached deviation or freshness'
    },
    {
      label: 'API keys',
      value: apiKeys.length,
      hint: 'Automation credentials issued'
    }
  ]

  return (
    <div className='mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 pb-16 sm:px-6'>
      <header className='mt-4 flex flex-col gap-6 rounded-3xl border border-border bg-card/80 p-6 shadow-xl md:flex-row md:items-center md:justify-between'>
        <div className='space-y-3'>
          <span className='inline-flex items-center gap-2 rounded-full border border-brand-teal/40 bg-brand-teal/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-brand-teal'>
            Operations
          </span>
          <h1 className='text-3xl font-semibold text-foreground'>
            SentinelX Control Plane
          </h1>
          <p className='max-w-2xl text-sm text-muted-foreground'>
            Manage tenants, register monitors, and trigger policy evaluations.
            Every action syncs with Convex to maintain an auditable history of
            price deviations and guardian decisions.
          </p>
          <div className='flex flex-wrap items-center gap-3 text-xs text-muted-foreground'>
            <span>
              Router: {process.env.SENTINELX_ROUTER_ADDRESS ?? 'not set'}
            </span>
            <Link
              href='/docs'
              className='inline-flex items-center gap-1 text-brand-teal transition hover:text-brand-teal-light'
            >
              View integration docs
              <ArrowUpRight className='h-3 w-3' />
            </Link>
          </div>
        </div>
        <RunPolicyButton />
      </header>

      <section className='grid gap-4 rounded-3xl border border-border bg-card/70 p-6 shadow-inner md:grid-cols-5'>
        {stats.map(stat => (
          <div key={stat.label} className='space-y-2'>
            <p className='text-xs font-semibold uppercase tracking-[0.35em] text-brand-orange'>
              {stat.label}
            </p>
            <p className='text-2xl font-semibold text-foreground'>
              {stat.value}
            </p>
            <p className='text-xs text-muted-foreground'>{stat.hint}</p>
          </div>
        ))}
      </section>

      <section className='grid gap-6 md:grid-cols-[1.3fr_1fr]'>
        <div className='space-y-4 rounded-3xl border border-border bg-card/70 p-6 shadow-lg'>
          <header className='space-y-2'>
            <h2 className='text-xl font-semibold text-foreground'>
              Register monitor
            </h2>
            <p className='text-xs text-muted-foreground'>
              Feeds default to Somnia Shannon Testnet ETH/USD, but you can
              override addresses per monitor.
            </p>
          </header>
          <CreateMonitorForm
            tenants={tenants}
            defaults={{
              routerAddress: process.env.SENTINELX_ROUTER_ADDRESS,
              protofireFeed: process.env.NEXT_PUBLIC_PROTOFIRE_ETH_USD,
              diaFeed: process.env.NEXT_PUBLIC_DIA_WETH_USD
            }}
          />
        </div>
        <div className='space-y-6'>
          <div className='space-y-4 rounded-3xl border border-border bg-card/70 p-6 shadow-lg'>
            <header className='space-y-2'>
              <h2 className='text-xl font-semibold text-foreground'>
                Create tenant
              </h2>
              <p className='text-xs text-muted-foreground'>
                Each tenant scopes monitors, incidents, and API keys. Owners map
                to guardian operators.
              </p>
            </header>
            <CreateTenantForm />
          </div>
          <div className='space-y-4 rounded-3xl border border-border bg-card/70 p-6 shadow-lg'>
            <header className='space-y-2'>
              <h2 className='text-xl font-semibold text-foreground'>
                Provision API key
              </h2>
              <p className='text-xs text-muted-foreground'>
                Generate scoped credentials for automation pipelines and store
                the secret in your secure vault. Keys are hashed in Convex.
              </p>
            </header>
            <CreateApiKeyForm tenants={tenants} />
          </div>
        </div>
      </section>

      <section
        id='api-keys'
        className='space-y-4 rounded-3xl border border-border bg-card/80 p-6 shadow-xl'
      >
        <header className='flex flex-col gap-2 md:flex-row md:items-center md:justify-between'>
          <div>
            <h2 className='text-xl font-semibold text-foreground'>API keys</h2>
            <p className='text-xs text-muted-foreground'>
              Stored as SHA-256 hashes. Rotate regularly and remove unused
              credentials.
            </p>
          </div>
          <span className='text-xs text-muted-foreground'>
            {apiKeys.length} key{apiKeys.length === 1 ? '' : 's'}
          </span>
        </header>
        <div className='overflow-hidden rounded-2xl border border-border'>
          <table className='min-w-full divide-y divide-border text-left text-sm'>
            <thead className='bg-background/60 text-xs uppercase tracking-[0.25em] text-muted-foreground'>
              <tr>
                <th className='px-4 py-3 font-medium'>Label</th>
                <th className='px-4 py-3 font-medium'>Tenant</th>
                <th className='px-4 py-3 font-medium'>Key hash</th>
                <th className='px-4 py-3 font-medium'>Issued</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border/70 bg-background/50 text-sm'>
              {apiKeys.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className='px-4 py-6 text-center text-muted-foreground'
                  >
                    No API keys issued yet.
                  </td>
                </tr>
              ) : (
                apiKeys.map(key => {
                  const tenant = tenantMap.get(identifier(key.tenantId))
                  return (
                    <tr key={JSON.stringify(key._id)}>
                      <td className='px-4 py-4 font-mono text-xs'>
                        {key.label}
                      </td>
                      <td className='px-4 py-4'>
                        {tenant ? (
                          <div className='space-y-1'>
                            <p>{tenant.name}</p>
                            <p className='font-mono text-[11px] text-muted-foreground'>
                              {tenant.owner}
                            </p>
                          </div>
                        ) : (
                          <span className='text-muted-foreground'>
                            Tenant removed
                          </span>
                        )}
                      </td>
                      <td className='px-4 py-4 font-mono text-xs text-muted-foreground'>
                        {typeof key.keyHash === 'string'
                          ? `${key.keyHash.slice(0, 10)}…${key.keyHash.slice(-6)}`
                          : 'n/a'}
                      </td>
                      <td className='px-4 py-4 text-xs text-muted-foreground'>
                        {key.createdAt
                          ? new Date(key.createdAt).toLocaleString(undefined, {
                              hour12: false
                            })
                          : '—'}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className='space-y-4 rounded-3xl border border-border bg-card/80 p-6 shadow-xl'>
        <header className='flex flex-col gap-2 md:flex-row md:items-center md:justify-between'>
          <div>
            <h2 className='text-xl font-semibold text-foreground'>Monitors</h2>
            <p className='text-xs text-muted-foreground'>
              Track every Guardable contract, its oracle pair, and current
              status.
            </p>
          </div>
          <span className='text-xs text-muted-foreground'>
            {monitors.length} record{monitors.length === 1 ? '' : 's'}
          </span>
        </header>
        <div className='overflow-hidden rounded-2xl border border-border'>
          <table className='min-w-full divide-y divide-border text-left text-sm'>
            <thead className='bg-background/60 text-xs uppercase tracking-[0.25em] text-muted-foreground'>
              <tr>
                <th className='px-4 py-3 font-medium'>Contract</th>
                <th className='px-4 py-3 font-medium'>Oracle key</th>
                <th className='px-4 py-3 font-medium'>Feeds</th>
                <th className='px-4 py-3 font-medium'>Deviation</th>
                <th className='px-4 py-3 font-medium'>Guardian</th>
                <th className='px-4 py-3 font-medium'>Status</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border/70 bg-background/50 text-sm'>
              {monitors.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className='px-4 py-6 text-center text-muted-foreground'
                  >
                    No monitors registered yet.
                  </td>
                </tr>
              ) : (
                monitors.map(monitor => (
                  <tr key={JSON.stringify(monitor._id)}>
                    <td className='px-4 py-4 font-mono text-xs'>
                      {monitor.contractAddress}
                    </td>
                    <td className='px-4 py-4'>{monitor.oracleKey}</td>
                    <td className='px-4 py-4 font-mono text-xs'>
                      <div className='space-y-1'>
                        <p className='truncate text-muted-foreground'>
                          P: {monitor.protofireFeed}
                        </p>
                        <p className='truncate text-muted-foreground'>
                          D: {monitor.diaFeed}
                        </p>
                      </div>
                    </td>
                    <td className='px-4 py-4'>{monitor.maxDeviationBps} bps</td>
                    <td className='px-4 py-4 font-mono text-xs'>
                      {monitor.guardianAddress}
                    </td>
                    <td className='px-4 py-4'>
                      <StatusBadge status={monitor.status ?? 'unknown'} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className='space-y-4 rounded-3xl border border-border bg-card/80 p-6 shadow-xl'>
        <header className='flex flex-col gap-2 md:flex-row md:items-center md:justify-between'>
          <div>
            <h2 className='text-xl font-semibold text-foreground'>
              Incident stream
            </h2>
            <p className='text-xs text-muted-foreground'>
              Latest policy decisions with deviation context and status updates.
            </p>
          </div>
          <span className='text-xs text-muted-foreground'>
            {incidents.length} event{incidents.length === 1 ? '' : 's'}
          </span>
        </header>
        <div className='space-y-3'>
          {incidents.length === 0 ? (
            <p className='text-sm text-muted-foreground'>
              No incidents recorded yet. Run the policy evaluation to create the
              first log entry.
            </p>
          ) : (
            incidents.map(incident => (
              <article
                key={JSON.stringify(incident._id)}
                className='rounded-2xl border border-border bg-background/70 p-5 shadow-inner'
              >
                <div className='flex flex-wrap items-center justify-between gap-2 text-xs uppercase tracking-[0.3em] text-brand-teal'>
                  <span>{incident.action}</span>
                  <span>
                    {new Date(incident.occurredAt).toLocaleString(undefined, {
                      hour12: false
                    })}
                  </span>
                </div>
                <p className='mt-3 text-sm text-foreground'>
                  {incident.summary ?? 'No summary provided.'}
                </p>
                <p className='mt-3 text-xs text-muted-foreground'>
                  Safe: {incident.safe ? 'yes' : 'no'} · Fresh:{' '}
                  {incident.bothFresh ? 'yes' : 'no'}
                  {incident.txHash ? (
                    <>
                      {' '}
                      · Tx:{' '}
                      <span className='font-mono'>
                        {incident.txHash.slice(0, 10)}…
                        {incident.txHash.slice(-6)}
                      </span>
                    </>
                  ) : null}
                </p>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase()
  let variant: 'default' | 'attention' | 'unknown' = 'default'

  if (normalized === 'attention') {
    variant = 'attention'
  } else if (normalized === 'unknown') {
    variant = 'unknown'
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em]',
        variant === 'default' && 'bg-brand-teal/15 text-brand-teal',
        variant === 'attention' && 'bg-brand-orange/15 text-brand-orange',
        variant === 'unknown' && 'bg-muted text-muted-foreground'
      )}
    >
      {status}
    </span>
  )
}

export const revalidate = 0
