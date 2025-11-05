'use client'

import Link from 'next/link'
import { useState } from 'react'

import { useQuery } from 'convex/react'
import useSWR from 'swr'

import { IncidentTimeline } from '@/components/dashboard/IncidentTimeline'
import { KpiCards } from '@/components/dashboard/KpiCards'
import { MonitorsTable } from '@/components/dashboard/MonitorsTable'
import { RunPolicyButton } from '@/components/run-policy-button'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/convex/_generated/api'
import { useSession } from '@/hooks/useSession'
import type { ChainConfig } from '@/lib/config'

const configFetcher = async (url: string): Promise<ChainConfig> => {
  const response = await fetch(url, { cache: 'no-store' })
  if (!response.ok) {
    throw new Error('Unable to load chain configuration')
  }
  return response.json()
}

function EmptyState({
  title,
  children,
  action
}: {
  title: string
  children: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <Card className='mx-auto max-w-md'>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4 text-sm text-muted-foreground'>
        {children}
        {action}
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const { toast } = useToast()
  const { user, loading } = useSession()
  const [simulating, setSimulating] = useState(false)
  const { data: chainConfig } = useSWR('/api/config/chain', configFetcher)
  const demoMode = chainConfig?.demoMode ?? false
  const tenant = useQuery(
    api.tenants.getByOwner,
    user?.address ? { owner: user.address } : 'skip'
  )
  const monitors = useQuery(
    api.monitors.listForTenant,
    tenant?._id ? { tenantId: tenant._id } : 'skip'
  )
  const timeline = useQuery(
    api.incidents.timelineForTenant,
    tenant?._id ? { tenantId: tenant._id, limit: 10 } : 'skip'
  )
  const openIncidents = useQuery(
    api.incidents.listOpen,
    tenant?._id ? { tenantId: tenant._id, status: 'open' } : 'skip'
  )
  const proposedActions = useQuery(
    api.actionIntents.listByState,
    tenant?._id ? { state: 'proposed', limit: 5 } : 'skip'
  )

  if (loading) {
    return (
      <EmptyState title='Loading workspace'>
        <p>Fetching tenant, monitors, and active incidents.</p>
      </EmptyState>
    )
  }

  if (!user?.address) {
    return (
      <EmptyState title='Connect wallet'>
        <p>
          Connect your Somnia wallet and sign-in with Ethereum to unlock
          SentinelX.
        </p>
      </EmptyState>
    )
  }

  if (!tenant) {
    return (
      <EmptyState
        title='Create a workspace'
        action={
          <Button asChild>
            <Link href='/onboarding'>Launch onboarding</Link>
          </Button>
        }
      >
        <p>
          SentinelX maps each tenant to your wallet. Create a workspace to
          register monitors and guardian policies.
        </p>
      </EmptyState>
    )
  }

  const monitorList = monitors ?? []
  const openIncidentList = openIncidents ?? []
  const actionQueue = proposedActions ?? []
  const timelineItems = timeline ?? []
  const latestIncident = timelineItems[0]

  const lastEvaluation = monitorList.reduce(
    (acc, monitor) => Math.max(acc, monitor.lastEvaluatedAt ?? 0),
    0
  )

  const kpis = [
    { title: 'Active monitors', value: String(monitorList.length) },
    {
      title: 'Open incidents',
      value: String(openIncidentList.length),
      hint: 'AI triage awaiting response'
    },
    {
      title: 'Pending actions',
      value: String(actionQueue.length),
      hint: 'Autonomous plans requiring approval'
    },
    {
      title: 'Last evaluation',
      value: lastEvaluation
        ? new Date(lastEvaluation).toLocaleTimeString()
        : 'Never',
      hint: 'Latest policy pass across monitors'
    }
  ]

  const handleSimulateIncident = async () => {
    setSimulating(true)
    try {
      const response = await fetch('/api/demo/simulate', { method: 'POST' })
      if (!response.ok) {
        const message = await response.json().catch(() => null)
        throw new Error(message?.error ?? 'Simulation failed')
      }
      toast({
        title: 'Incident simulated',
        description: 'Oracle price spiked. Refresh the dashboard in a few seconds.'
      })
    } catch (err) {
      toast({
        title: 'Simulation failed',
        description:
          err instanceof Error ? err.message : 'Check demo mode configuration.',
        variant: 'destructive'
      })
    } finally {
      setSimulating(false)
    }
  }

  return (
    <div className='space-y-8'>
      {demoMode ? (
        <div className='flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/40 bg-primary/10 px-4 py-3 text-sm text-primary-foreground'>
          <div>
            <p className='font-medium text-primary-foreground'>Demo mode enabled</p>
            <p className='text-xs text-primary-foreground/80'>
              Trigger deterministic incidents and walk judges through the end-to-end flow.
            </p>
          </div>
          <Button asChild size='sm' variant='outline'>
            <Link href='/docs#quickstart'>Demo quickstart</Link>
          </Button>
        </div>
      ) : null}
      <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
        <div>
          <h1 className='text-3xl font-semibold tracking-tight'>
            Somnia operations overview
          </h1>
          <p className='text-sm text-muted-foreground'>
            Tenant <span className='font-mono'>{tenant.name}</span> ·{' '}
            {monitorList.length} monitors · Guardian automation with AI co-pilot.
          </p>
        </div>
        <div className='flex flex-wrap items-center gap-3'>
          {demoMode ? (
            <Button
              variant='outline'
              onClick={handleSimulateIncident}
              disabled={simulating}
            >
              {simulating ? 'Simulating...' : 'Simulate incident'}
            </Button>
          ) : null}
          <RunPolicyButton />
          <Button asChild variant='secondary'>
            <Link href='/monitors/new'>New monitor</Link>
          </Button>
        </div>
      </div>

      <KpiCards items={kpis} />

      <div className='grid gap-6 xl:grid-cols-3'>
        <Card className='xl:col-span-2'>
          <CardHeader className='flex flex-row items-start justify-between gap-4'>
            <div>
              <CardTitle>Daily brief</CardTitle>
              <CardDescription>
                Latest SentinelX intelligence from Somnia telemetry.
              </CardDescription>
            </div>
            {latestIncident ? (
              <Badge
                variant={
                  latestIncident.severity === 'critical'
                    ? 'destructive'
                    : latestIncident.severity === 'high'
                      ? 'default'
                      : 'secondary'
                }
              >
                {latestIncident.severity}
              </Badge>
            ) : null}
          </CardHeader>
          <CardContent className='space-y-4 text-sm text-muted-foreground'>
            {latestIncident ? (
              <>
                <div className='space-y-2'>
                  <p className='text-base text-foreground'>
                    {latestIncident.summary}
                  </p>
                  <p>
                    Opened{' '}
                    <span className='font-medium text-foreground'>
                      {new Date(latestIncident.openedAt).toLocaleString()}
                    </span>{' '}
                    · status{' '}
                    <span className='uppercase'>{latestIncident.status}</span>
                  </p>
                </div>
                {latestIncident.advisoryTags?.length ? (
                  <div className='flex flex-wrap gap-2'>
                    {latestIncident.advisoryTags.map(tag => (
                      <Badge key={tag} variant='outline'>
                        {tag}
                      </Badge>
                    ))}
                  </div>
                ) : null}
                <div>
                  <Button asChild size='sm' variant='outline'>
                    <Link href='/incidents'>Review incident playbook</Link>
                  </Button>
                </div>
              </>
            ) : (
              <p>No incidents detected in the last policy pass.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Action queue</CardTitle>
            <CardDescription>
              AI-suggested plans awaiting guardian approval.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4 text-sm text-muted-foreground'>
            {actionQueue.length ? (
              actionQueue.map(intent => (
                <div
                  key={intent._id}
                  className='rounded-md border border-border/60 p-3'
                >
                  <div className='flex items-center justify-between'>
                    <span className='font-medium text-foreground'>
                      {intent.plan?.name ?? 'Proposed action'}
                    </span>
                    <Badge variant='outline'>proposed</Badge>
                  </div>
                  <p className='mt-1 text-xs leading-relaxed'>
                    {intent.rationale}
                  </p>
                  <Button asChild size='sm' className='mt-3 w-full'>
                    <Link href='/actions'>Review &amp; approve</Link>
                  </Button>
                </div>
              ))
            ) : (
              <p>
                No pending actions. SentinelX will queue mitigations when
                anomalies are detected.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className='grid gap-6 lg:grid-cols-[2fr,1fr]'>
        <MonitorsTable monitors={monitorList} />
        <Card>
          <CardHeader>
            <CardTitle>Workspace</CardTitle>
            <CardDescription>
              Convex tenant, guardian, and automation metadata.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-3 text-sm text-muted-foreground'>
            <div>
              <p className='text-xs uppercase tracking-wide text-muted-foreground'>
                Owner
              </p>
              <p className='font-mono'>{tenant.owner}</p>
            </div>
            <div>
              <p className='text-xs uppercase tracking-wide text-muted-foreground'>
                Created
              </p>
              <p>{new Date(tenant.createdAt).toLocaleString()}</p>
            </div>
            <p>
              Run <code>pnpm policy:run</code> or schedule{' '}
              <code>/api/indexer/run</code> via cron to keep SentinelX AI aligned
              with Somnia telemetry.
            </p>
            <Button asChild variant='outline' className='w-full'>
              <Link href='/docs'>Implementation guide</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <section className='space-y-4'>
        <div className='flex items-center justify-between'>
          <h2 className='text-2xl font-semibold tracking-tight'>
            Recent incidents
          </h2>
          <Link
            href='/incidents'
            className='text-sm font-medium text-primary hover:underline'
          >
            Incident console
          </Link>
        </div>
        <IncidentTimeline incidents={timelineItems} />
      </section>
    </div>
  )
}
