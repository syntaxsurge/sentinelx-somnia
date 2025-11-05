'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

function Code({ children }: { children: React.ReactNode }) {
  return (
    <pre className='rounded-lg border border-border bg-muted p-4 text-xs leading-relaxed'>
      <code>{children}</code>
    </pre>
  )
}

export default function DocsPage() {
  return (
    <div className='space-y-10 py-10'>
      <header className='space-y-3'>
        <h1 className='text-3xl font-semibold'>Integrate SentinelX</h1>
        <p className='max-w-2xl text-sm text-muted-foreground'>
          Harden Somnia contracts with dual-oracle validation and GuardianHub
          enforcement. Follow these steps to deploy the contracts, register
          monitors, and run the policy agent.
        </p>
        <div className='flex flex-wrap gap-3'>
          <Button asChild>
            <a
              href='https://github.com/syntaxsurge/sentinelx-somnia'
              target='_blank'
              rel='noreferrer'
            >
              GitHub repo
            </a>
          </Button>
          <Button asChild variant='secondary'>
            <a
              href='https://docs.somnia.network'
              target='_blank'
              rel='noreferrer'
            >
              Somnia docs
            </a>
          </Button>
        </div>
      </header>

      <Tabs defaultValue='contracts' className='space-y-6'>
        <TabsList>
          <TabsTrigger value='contracts'>Contracts</TabsTrigger>
          <TabsTrigger value='deploy'>Deploy</TabsTrigger>
          <TabsTrigger value='agent'>Policy agent</TabsTrigger>
        </TabsList>

        <TabsContent value='contracts' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Guardable mixin</CardTitle>
            </CardHeader>
            <CardContent className='space-y-2 text-sm text-muted-foreground'>
              <p>Add the mixin so GuardianHub can pause unsafe entrypoints.</p>
              <Code>{`contract MyContract is GuardablePausable {
  constructor(address guardian) {
    _initializeGuardian(guardian);
  }

  function execute() external whenNotPaused {
    // critical logic
  }
}`}</Code>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SafeOracleRouter</CardTitle>
            </CardHeader>
            <CardContent className='space-y-2 text-sm text-muted-foreground'>
              <p>Register Protofire + DIA feeds and the policy thresholds.</p>
              <Code>{`bytes32 KEY = keccak256(bytes("ETH/USD"));
safeOracle.configureFeed(
  KEY,
  0xd9132c1d762D432672493F640a63B758891B449e, // Protofire
  0x786c7893F8c26b80d42088749562eDb50Ba9601E, // DIA adapter
  100,  // deviation in bps (1%)
  180   // stale window (seconds)
);`}</Code>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='deploy' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Hardhat Ignition (Somnia testnet)</CardTitle>
            </CardHeader>
            <CardContent className='space-y-2 text-sm text-muted-foreground'>
              <Code>{`cd blockchain
pnpm install
pnpm compile
pnpm exec hardhat ignition deploy ./ignition/modules/sentinelx.ts --network somniatestnet`}</Code>
              <p className='text-xs'>
                Copy the GuardianHub, SafeOracleRouter, and SOMIPaymentGuarded
                addresses. Paste them into the New Monitor form or environment
                variables.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Environment variables</CardTitle>
            </CardHeader>
            <CardContent>
              <Code>{`# .env.local
NEXT_PUBLIC_APP_NAME=SentinelX
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_WALLETCONNECT_ID=your_walletconnect_project_id
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
CONVEX_DEPLOYMENT=https://your-deployment.convex.cloud
SESSION_SECRET=32+character_random_value
NEXT_PUBLIC_SOMNIA_RPC_URL=https://dream-rpc.somnia.network`}</Code>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='agent' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Manual run</CardTitle>
            </CardHeader>
            <CardContent>
              <Code>{`pnpm policy:run`}</Code>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Vercel cron (every 2 minutes)</CardTitle>
            </CardHeader>
            <CardContent className='space-y-2 text-sm text-muted-foreground'>
              <Code>{`{
  "crons": [
    { "path": "/api/jobs/run-policy", "schedule": "*/2 * * * *" }
  ]
}`}</Code>
              <p className='text-xs'>
                The policy runner reads SafeOracleRouter.latest, updates monitor
                status, records incidents, and can call GuardianHub when safe is
                false.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>RainbowKit authentication surface</CardTitle>
            </CardHeader>
            <CardContent className='space-y-2 text-sm text-muted-foreground'>
              <Code>{`GET  /api/auth/nonce   # issues SIWE nonce and seeds session
POST /api/auth/verify  # verifies signature, stores wallet + chain
GET  /api/auth/me      # returns { isLoggedIn, address, chainId }
POST /api/auth/logout  # destroys iron-session`}</Code>
              <p className='text-xs'>
                Client providers call these endpoints from RainbowKit’s custom
                authentication adapter. Successful verify upserts the wallet in
                Convex and keeps the dashboard synchronized for multi-tab
                sessions.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Automation & settings API</CardTitle>
            </CardHeader>
            <CardContent className='space-y-2 text-sm text-muted-foreground'>
              <Code>{`GET  /api/api-keys?tenantId=...            # list hashed keys
POST /api/api-keys                       # create + return plaintext key once
DELETE /api/api-keys?apiKeyId=...        # revoke key
POST /api/webhooks                       # add Slack/Discord/HTTP target
DELETE /api/webhooks?webhookId=...       # remove target
POST /api/guardian-operators             # register GuardianHub signer
DELETE /api/guardian-operators?guardianId=...`}</Code>
              <p className='text-xs'>
                The Settings page consumes these routes for issuing automation
                credentials, managing webhook fan-out, and keeping the guardian
                roster current.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
