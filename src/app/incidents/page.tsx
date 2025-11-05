'use client'

import Link from 'next/link'

import { useQuery } from 'convex/react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { api } from '@/convex/_generated/api'
import { useSession } from '@/hooks/useSession'

const severityVariant: Record<string, 'secondary' | 'default' | 'destructive'> =
  {
    low: 'secondary',
    medium: 'default',
    high: 'default',
    critical: 'destructive'
  }

function EmptyState({ message }: { message: string }) {
  return (
    <Card>
      <CardContent className='py-12 text-center text-sm text-muted-foreground'>
        {message}
      </CardContent>
    </Card>
  )
}

export default function IncidentsPage() {
  const { user, loading } = useSession()
  const tenant = useQuery(
    api.tenants.getByOwner,
    user?.address ? { owner: user.address } : 'skip'
  )
  const monitors = useQuery(
    api.monitors.listForTenant,
    tenant?._id ? { tenantId: tenant._id } : 'skip'
  )
  const incidents = useQuery(
    api.incidents.listForTenant,
    tenant?._id ? { tenantId: tenant._id, limit: 200 } : 'skip'
  )

  if (loading) {
    return <EmptyState message='Loading incidents…' />
  }

  if (!tenant) {
    return <EmptyState message='No tenant detected. Connect and onboard first.' />
  }

  const incidentList = incidents ?? []
  const monitorLookup = new Map(
    (monitors ?? []).map(monitor => [String(monitor._id), monitor])
  )

  if (incidentList.length === 0) {
    return (
      <div className='space-y-6'>
        <header className='space-y-2'>
          <h1 className='text-3xl font-semibold tracking-tight'>Incidents</h1>
          <p className='text-sm text-muted-foreground'>
            When SentinelX detects an anomaly, it opens an incident with AI
            summary, severity, and mitigation playbook.
          </p>
        </header>
        <EmptyState message='No incidents recorded yet. Schedule the indexer or run pnpm policy:run to populate telemetry.' />
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <header className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-3xl font-semibold tracking-tight'>Incidents</h1>
          <p className='text-sm text-muted-foreground'>
            Ranked by severity. Review AI insights, acknowledge or close, and
            trigger mitigations.
          </p>
        </div>
        <div className='flex items-center gap-3'>
          <Button asChild variant='outline'>
            <Link href='/actions'>View action queue</Link>
          </Button>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Incident console</CardTitle>
          <CardDescription>
            Latest incidents across all monitors. Click through for details,
            telemetry, and AI playbook.
          </CardDescription>
        </CardHeader>
        <CardContent className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-border text-sm'>
            <thead className='bg-secondary/50 text-left text-xs uppercase tracking-wide text-muted-foreground'>
              <tr>
                <th className='px-4 py-3 font-medium'>Summary</th>
                <th className='px-4 py-3 font-medium'>Severity</th>
                <th className='px-4 py-3 font-medium'>Status</th>
                <th className='px-4 py-3 font-medium'>Opened</th>
                <th className='px-4 py-3 font-medium'>Monitor</th>
                <th className='px-4 py-3 font-medium'></th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border'>
              {incidentList.map(incident => (
                <tr key={incident._id} className='hover:bg-muted/40'>
                  <td className='px-4 py-3'>
                    <div className='font-medium text-foreground'>
                      {incident.summary}
                    </div>
                    <p className='text-xs text-muted-foreground'>
                      {incident.rootCause ?? 'Root cause pending AI analysis.'}
                    </p>
                  </td>
                  <td className='px-4 py-3'>
                    <Badge
                      variant={
                        severityVariant[incident.severity] ?? 'secondary'
                      }
                    >
                      {incident.severity}
                    </Badge>
                  </td>
                  <td className='px-4 py-3 capitalize text-muted-foreground'>
                    {incident.status}
                  </td>
                  <td className='px-4 py-3 text-muted-foreground'>
                    {new Date(incident.openedAt).toLocaleString()}
                  </td>
                  <td className='px-4 py-3 text-sm text-muted-foreground'>
                    {monitorLookup.get(String(incident.monitorId))?.name ??
                      (incident.monitorId as string)}
                  </td>
                  <td className='px-4 py-3 text-right'>
                    <Button asChild size='sm' variant='outline'>
                      <Link href={`/incidents/${incident._id}`}>View</Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
