'use client'

import Link from 'next/link'
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Loader2,
  ShieldAlert
} from 'lucide-react'

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
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
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
    <Card className='border-border/60'>
      <CardContent className='flex flex-col items-center py-16'>
        <CheckCircle2 className='h-12 w-12 text-emerald-500/50 mb-4' />
        <p className='text-sm font-medium text-foreground'>All clear</p>
        <p className='text-xs text-muted-foreground mt-1 text-center max-w-md'>
          {message}
        </p>
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
    return (
      <div className='space-y-6'>
        <div className='space-y-2'>
          <Skeleton className='h-10 w-48' />
          <Skeleton className='h-4 w-96' />
        </div>
        <Card className='border-border/60'>
          <CardContent className='py-16 flex flex-col items-center'>
            <Loader2 className='h-12 w-12 text-primary animate-spin mb-4' />
            <p className='text-sm font-medium text-foreground'>
              Loading incidents
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!tenant) {
    return (
      <EmptyState message='No tenant detected. Connect wallet and complete onboarding first.' />
    )
  }

  const incidentList = incidents ?? []
  const monitorLookup = new Map(
    (monitors ?? []).map(monitor => [String(monitor._id), monitor])
  )

  if (incidentList.length === 0) {
    return (
      <div className='space-y-6'>
        <header className='space-y-2'>
          <h1 className='text-4xl font-bold tracking-tight text-foreground'>
            Incidents
          </h1>
          <p className='text-sm text-muted-foreground max-w-2xl'>
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
      <header className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
        <div className='space-y-2'>
          <div className='flex items-center gap-3'>
            <h1 className='text-4xl font-bold tracking-tight text-foreground'>
              Incidents
            </h1>
            <Badge variant='secondary' className='text-sm'>
              {incidentList.length}
            </Badge>
          </div>
          <p className='text-sm text-muted-foreground max-w-2xl'>
            Ranked by severity. Review AI insights, acknowledge or close, and
            trigger mitigations.
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Button asChild variant='outline' className='gap-2'>
            <Link href='/actions'>
              <ShieldAlert className='h-4 w-4' />
              Action queue
            </Link>
          </Button>
        </div>
      </header>

      <Card className='border-border/60'>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='text-xl'>Incident console</CardTitle>
              <CardDescription className='mt-1'>
                Latest incidents across all monitors. Click through for details,
                telemetry, and AI playbook.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className='rounded-md border border-border/60'>
            <Table>
              <TableHeader>
                <TableRow className='bg-muted/30 hover:bg-muted/30'>
                  <TableHead className='font-semibold text-foreground'>
                    Summary
                  </TableHead>
                  <TableHead className='font-semibold text-foreground'>
                    Severity
                  </TableHead>
                  <TableHead className='font-semibold text-foreground'>
                    Status
                  </TableHead>
                  <TableHead className='font-semibold text-foreground'>
                    Opened
                  </TableHead>
                  <TableHead className='font-semibold text-foreground'>
                    Monitor
                  </TableHead>
                  <TableHead className='text-right font-semibold text-foreground'>
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incidentList.map(incident => (
                  <TableRow
                    key={incident._id}
                    className='hover:bg-muted/50 transition-colors'
                  >
                    <TableCell>
                      <div className='font-medium text-foreground'>
                        {incident.summary}
                      </div>
                      <p className='text-xs text-muted-foreground mt-0.5'>
                        {incident.rootCause ??
                          'Root cause pending AI analysis'}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          severityVariant[incident.severity] ?? 'secondary'
                        }
                        className='uppercase text-xs'
                      >
                        {incident.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          incident.status === 'open'
                            ? 'destructive'
                            : incident.status === 'acknowledged'
                              ? 'default'
                              : 'outline'
                        }
                        className='capitalize'
                      >
                        {incident.status}
                      </Badge>
                    </TableCell>
                    <TableCell className='text-sm text-muted-foreground'>
                      {new Date(incident.openedAt).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </TableCell>
                    <TableCell className='text-sm text-muted-foreground'>
                      {monitorLookup.get(String(incident.monitorId))?.name ??
                        'Unknown'}
                    </TableCell>
                    <TableCell className='text-right'>
                      <Button
                        asChild
                        size='sm'
                        variant='outline'
                        className='gap-1'
                      >
                        <Link href={`/incidents/${incident._id}`}>
                          View
                          <ExternalLink className='h-3 w-3' />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
