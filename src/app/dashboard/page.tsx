'use client'

import Link from 'next/link'

import { useQuery } from 'convex/react'

import { RunPolicyButton } from '@/components/run-policy-button'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { api } from '@/convex/_generated/api'
import { useSession } from '@/hooks/useSession'

export default function DashboardPage() {
  const { user, loading } = useSession()
  const tenant = useQuery(
    api.tenants.getByOwner,
    user?.address ? { owner: user.address } : 'skip'
  )
  const monitors = useQuery(
    api.monitors.listForTenant,
    tenant?._id ? { tenantId: tenant._id } : 'skip'
  )

  if (loading) {
    return (
      <p className='py-10 text-center text-sm text-muted-foreground'>
        Loading session…
      </p>
    )
  }

  if (!user?.address) {
    return (
      <div className='mx-auto max-w-md space-y-4 py-16 text-center'>
        <h2 className='text-2xl font-semibold'>Connect wallet</h2>
        <p className='text-sm text-muted-foreground'>
          Connect and sign a message to access the SentinelX dashboard.
        </p>
      </div>
    )
  }

  if (!tenant) {
    return (
      <div className='mx-auto max-w-md space-y-4 py-16 text-center'>
        <h2 className='text-2xl font-semibold'>Create a workspace</h2>
        <p className='text-sm text-muted-foreground'>
          You don’t have a tenant yet. Head to onboarding to create one.
        </p>
        <Link href='/onboarding'>
          <Button>Create workspace</Button>
        </Link>
      </div>
    )
  }

  const monitorList = monitors ?? []

  return (
    <div className='space-y-10 py-8'>
      <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
        <div>
          <h1 className='text-3xl font-semibold'>Monitors</h1>
          <p className='text-sm text-muted-foreground'>
            Track every guardable contract, oracle pair, and guardian binding
            for tenant <span className='font-mono'>{tenant.name}</span>.
          </p>
        </div>
        <div className='flex items-center gap-3'>
          <RunPolicyButton />
          <Link href='/monitors/new'>
            <Button variant='secondary'>New monitor</Button>
          </Link>
        </div>
      </div>

      <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
        {monitorList.map(monitor => (
          <Card key={monitor._id}>
            <CardHeader>
              <CardTitle className='flex items-center justify-between text-base'>
                <span>{monitor.oracleKey}</span>
                <Badge
                  variant={
                    monitor.status === 'attention' ? 'destructive' : 'default'
                  }
                >
                  {monitor.status ?? 'unknown'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-2 text-sm text-muted-foreground'>
              <div>
                <strong>Contract:</strong>{' '}
                <span className='font-mono'>
                  {monitor.contractAddress.slice(0, 6)}…
                  {monitor.contractAddress.slice(-4)}
                </span>
              </div>
              <div>
                <strong>Guardian:</strong>{' '}
                <span className='font-mono'>
                  {monitor.guardianAddress.slice(0, 6)}…
                  {monitor.guardianAddress.slice(-4)}
                </span>
              </div>
              <div className='space-y-1'>
                <p>
                  <strong>Protofire:</strong>{' '}
                  <span className='font-mono text-xs'>
                    {monitor.protofireFeed}
                  </span>
                </p>
                <p>
                  <strong>DIA:</strong>{' '}
                  <span className='font-mono text-xs'>{monitor.diaFeed}</span>
                </p>
              </div>
              <p>
                <strong>Rules:</strong> ≤ {monitor.maxDeviationBps} bps
                deviation · stale after {monitor.staleAfterSeconds}s
              </p>
            </CardContent>
            <CardFooter className='flex items-center justify-between'>
              <Link
                href={`/monitors/${monitor._id}`}
                className='text-sm font-semibold text-brand-teal hover:underline'
              >
                View incidents
              </Link>
              <span className='text-xs text-muted-foreground'>
                Added {new Date(monitor.createdAt).toLocaleDateString()}
              </span>
            </CardFooter>
          </Card>
        ))}
      </div>

      {monitorList.length === 0 ? (
        <div className='rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground'>
          No monitors registered yet. Create your first monitor to start
          tracking oracle health.
        </div>
      ) : null}
    </div>
  )
}
