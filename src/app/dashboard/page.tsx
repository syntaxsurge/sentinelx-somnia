import { CreateMonitorForm } from '@/components/create-monitor-form'
import { CreateTenantForm } from '@/components/create-tenant-form'
import { RunPolicyButton } from '@/components/run-policy-button'

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
  const [monitorsPayload, incidentsPayload, tenantsPayload] = await Promise.all(
    [
      fetchJson('/api/monitors'),
      fetchJson('/api/incidents'),
      fetchJson('/api/tenants')
    ]
  )

  const monitors = (monitorsPayload?.monitors ?? []) as any[]
  const incidents = (incidentsPayload?.incidents ?? []) as any[]
  const tenants = (tenantsPayload?.tenants ?? []) as any[]

  return (
    <main className='mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-12 px-6 py-16'>
      <header className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
        <div>
          <h1 className='text-4xl font-semibold text-white'>
            SentinelX Dashboard
          </h1>
          <p className='mt-2 text-sm text-slate-200'>
            Active monitors, incidents, and policy execution controls.
          </p>
        </div>
        <RunPolicyButton />
      </header>

      <section className='grid gap-6 rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur'>
        <h2 className='text-xl font-semibold text-white'>Create tenant</h2>
        <CreateTenantForm />
      </section>

      <section className='grid gap-6 rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur'>
        <h2 className='text-xl font-semibold text-white'>Register monitor</h2>
        <CreateMonitorForm
          tenants={tenants}
          defaults={{
            routerAddress: process.env.SENTINELX_ROUTER_ADDRESS,
            protofireFeed: process.env.NEXT_PUBLIC_PROTOFIRE_ETH_USD,
            diaFeed: process.env.NEXT_PUBLIC_DIA_WETH_USD
          }}
        />
      </section>

      <section className='grid gap-6 rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur'>
        <h2 className='text-xl font-semibold text-white'>Monitors</h2>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-white/10 text-left text-sm text-slate-200'>
            <thead>
              <tr>
                <th className='px-4 py-2 font-medium'>Contract</th>
                <th className='px-4 py-2 font-medium'>Router</th>
                <th className='px-4 py-2 font-medium'>Oracle key</th>
                <th className='px-4 py-2 font-medium'>Deviation (bps)</th>
                <th className='px-4 py-2 font-medium'>Guardian</th>
                <th className='px-4 py-2 font-medium'>Status</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-white/5'>
              {monitors.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className='px-4 py-6 text-center text-slate-400'
                  >
                    No monitors found. Create one via the API to see it listed
                    here.
                  </td>
                </tr>
              ) : (
                monitors.map(monitor => (
                  <tr key={JSON.stringify(monitor._id)}>
                    <td className='px-4 py-3 font-mono text-xs'>
                      {monitor.contractAddress}
                    </td>
                    <td className='px-4 py-3 font-mono text-xs'>
                      {monitor.routerAddress}
                    </td>
                    <td className='px-4 py-3'>{monitor.oracleKey}</td>
                    <td className='px-4 py-3'>{monitor.maxDeviationBps}</td>
                    <td className='px-4 py-3 font-mono text-xs'>
                      {monitor.guardianAddress}
                    </td>
                    <td className='px-4 py-3'>
                      <span className='rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs uppercase tracking-widest'>
                        {monitor.status ?? 'unknown'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className='grid gap-6 rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur'>
        <h2 className='text-xl font-semibold text-white'>Incident stream</h2>
        <div className='flex flex-col gap-4'>
          {incidents.length === 0 ? (
            <p className='text-sm text-slate-300'>No incidents recorded yet.</p>
          ) : (
            incidents.map(incident => (
              <article
                key={JSON.stringify(incident._id)}
                className='rounded-lg border border-white/10 bg-white/10 p-4 text-sm text-slate-200'
              >
                <header className='flex flex-wrap items-center justify-between gap-2 text-xs uppercase tracking-wider text-emerald-200'>
                  <span>{incident.action}</span>
                  <span>{new Date(incident.occurredAt).toLocaleString()}</span>
                </header>
                <p className='mt-2 text-slate-100'>
                  {incident.summary ?? 'No summary provided.'}
                </p>
                <p className='mt-2 text-xs text-slate-300'>
                  Safe: {incident.safe ? 'yes' : 'no'} · Fresh:{' '}
                  {incident.bothFresh ? 'yes' : 'no'}
                </p>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  )
}

export const revalidate = 0
