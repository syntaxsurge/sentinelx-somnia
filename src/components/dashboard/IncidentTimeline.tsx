import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

type Incident = {
  _id: string
  summary: string
  openedAt: number
  severity: string
  status: string
  txHash?: string | null
  advisoryTags?: string[]
}

export function IncidentTimeline({ incidents }: { incidents: Incident[] }) {
  if (incidents.length === 0) {
    return (
      <Card>
        <CardContent className='py-10 text-center text-sm text-muted-foreground'>
          No incidents logged yet. Schedule the SentinelX policy agent or run it
          on demand to populate telemetry.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className='space-y-4'>
      {incidents.map(incident => (
        <Card key={incident._id}>
          <CardHeader className='pb-4'>
            <div className='flex flex-wrap items-center justify-between gap-3'>
              <CardTitle className='text-base font-semibold capitalize'>
                {incident.severity} · {incident.summary}
              </CardTitle>
              <div className='flex items-center gap-2'>
                <Badge
                  variant={
                    incident.status === 'open'
                      ? 'destructive'
                      : incident.status === 'acknowledged'
                        ? 'default'
                        : 'secondary'
                  }
                >
                  {incident.status}
                </Badge>
                {incident.advisoryTags?.slice(0, 2).map(tag => (
                  <Badge key={tag} variant='outline'>
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            <CardDescription>
              {new Date(incident.openedAt).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent className='flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground'>
            <span>Monitor incident ID: {incident._id}</span>
            {incident.txHash ? (
              <Link
                href={`https://shannon-explorer.somnia.network/tx/${incident.txHash}`}
                target='_blank'
                className='text-sm font-medium text-primary hover:underline'
              >
                View transaction
              </Link>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
