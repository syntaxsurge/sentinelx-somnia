import Link from 'next/link'

const sections = [
  {
    title: 'Deploy on Somnia Shannon Testnet',
    steps: [
      'Copy blockchain/.env.example → blockchain/.env and set SOMNIA_RPC_URL + PRIVATE_KEY.',
      'pnpm install && pnpm --filter sentinelx-hardhat compile',
      'pnpm --filter sentinelx-hardhat ignition deploy ./ignition/modules/sentinelx.ts --network somniatestnet',
      'Record GuardianHub, SafeOracleRouter, and SOMIPaymentGuarded addresses.'
    ]
  },
  {
    title: 'Sync ABIs for the dashboard',
    steps: [
      'From repo root run pnpm contracts:sync-abis.',
      'Verify src/abi contains SafeOracleRouter.json, GuardianHub.json, SOMIPaymentGuarded.json.',
      'Restart Next.js dev server to pick up refreshed types.'
    ]
  },
  {
    title: 'Configure environment variables',
    steps: [
      'cp .env.example .env.local and set NEXT_PUBLIC_SOMNIA_RPC_URL, SENTINELX_ROUTER_ADDRESS, NEXT_PUBLIC_PROTOFIRE_ETH_USD, NEXT_PUBLIC_DIA_WETH_USD.',
      'Set CONVEX_DEPLOYMENT_URL to your Convex deployment.',
      'Optional: set NEXT_PUBLIC_SOMNIA_CHAIN_ID if you run against mainnet.'
    ]
  },
  {
    title: 'Operate SentinelX',
    steps: [
      'Visit /dashboard to create a tenant and register monitors.',
      'Trigger policy runs via the dashboard button, POST /api/jobs/run-policy, or pnpm policy:run.',
      'Check Convex tables (tenants, monitors, incidents) for realtime audit trails.'
    ]
  }
]

const apiEndpoints = [
  {
    method: 'POST',
    path: '/api/tenants',
    description: 'Create or resolve a tenant by owner address.',
    payload: '{ "name": "Vault Ops", "owner": "0xabc..." }'
  },
  {
    method: 'POST',
    path: '/api/monitors',
    description:
      'Register a monitor that links a contract + guardian + feed configuration.',
    payload:
      '{ "tenantId": "<convexId>", "contractAddress": "0x1...", "guardianAddress": "0x2...", "routerAddress": "0x3...", "oracleKey": "ETH/USD", "protofireFeed": "0x4...", "diaFeed": "0x5...", "maxDeviationBps": 150, "staleAfterSeconds": 300 }'
  },
  {
    method: 'POST',
    path: '/api/incidents',
    description: 'Write an incident record manually (optional).',
    payload:
      '{ "monitorId": "<convexId>", "safe": false, "bothFresh": false, "action": "pause-recommended", "summary": "DIA stale, Protofire disagreeing" }'
  },
  {
    method: 'POST',
    path: '/api/jobs/run-policy',
    description: 'Execute the policy runner once. Returns { processed }.',
    payload: '{}'
  }
]

export default function DocsPage() {
  return (
    <div className='mx-auto flex w-full max-w-5xl flex-col gap-12 px-4 pb-16 sm:px-6'>
      <header className='mt-4 space-y-4'>
        <span className='inline-flex items-center gap-2 rounded-full border border-brand-teal/40 bg-brand-teal/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-brand-teal'>
          Playbook
        </span>
        <h1 className='text-3xl font-semibold text-foreground'>
          SentinelX deployment & operations guide
        </h1>
        <p className='max-w-3xl text-sm text-muted-foreground'>
          This playbook covers contract deployment, Convex configuration,
          environment setup, and REST endpoints so you can operate SentinelX in
          Somnia production or test environments.
        </p>
      </header>

      <section className='grid gap-6 md:grid-cols-2'>
        {sections.map(section => (
          <article
            key={section.title}
            className='flex flex-col gap-4 rounded-3xl border border-border bg-card/70 p-6 shadow-inner'
          >
            <h2 className='text-lg font-semibold text-foreground'>
              {section.title}
            </h2>
            <ol className='space-y-2 text-sm text-muted-foreground'>
              {section.steps.map(step => (
                <li key={step} className='flex gap-2'>
                  <span className='text-brand-teal'>•</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </article>
        ))}
      </section>

      <section className='space-y-4 rounded-3xl border border-border bg-card/80 p-6 shadow-xl'>
        <header>
          <h2 className='text-lg font-semibold text-foreground'>
            REST endpoints
          </h2>
          <p className='text-xs text-muted-foreground'>
            All endpoints require no authentication in dev mode. Secure them
            behind API keys or allowlists before production go-live.
          </p>
        </header>
        <div className='space-y-4'>
          {apiEndpoints.map(endpoint => (
            <article
              key={endpoint.path}
              className='rounded-2xl border border-border bg-background/70 p-5 shadow-inner'
            >
              <div className='flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.35em] text-brand-teal'>
                <span>{endpoint.method}</span>
                <span className='text-muted-foreground'>{endpoint.path}</span>
              </div>
              <p className='mt-3 text-sm text-foreground'>
                {endpoint.description}
              </p>
              <pre className='mt-3 overflow-x-auto whitespace-pre-wrap rounded-xl bg-background p-4 text-xs text-muted-foreground'>
                {endpoint.payload}
              </pre>
            </article>
          ))}
        </div>
      </section>

      <section className='space-y-4 rounded-3xl border border-border bg-card/70 p-6 shadow-lg'>
        <h2 className='text-lg font-semibold text-foreground'>References</h2>
        <ul className='space-y-2 text-sm text-muted-foreground'>
          <li>
            <Link
              href='https://docs.somnia.network'
              className='text-brand-teal transition hover:text-brand-teal-light'
            >
              Somnia developer documentation
            </Link>
          </li>
          <li>
            <Link
              href='https://shannon-explorer.somnia.network'
              className='text-brand-teal transition hover:text-brand-teal-light'
            >
              Somnia Shannon Testnet Explorer
            </Link>
          </li>
          <li>
            <Link
              href='https://docs.diadata.org'
              className='text-brand-teal transition hover:text-brand-teal-light'
            >
              DIA oracle adapters
            </Link>
          </li>
        </ul>
      </section>
    </div>
  )
}
