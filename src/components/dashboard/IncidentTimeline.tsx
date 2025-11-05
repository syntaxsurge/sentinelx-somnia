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
  summary?: string | null
  occurredAt: number
  safe: boolean
  bothFresh: boolean
  txHash?: string | null
}

export function IncidentTimeline({ incidents }: { incidents: Incident[] }) {
  if (incidents.length === 0) {
    return (
      <Card>
        <CardContent className='py-10 text-center text-sm text-muted-foreground'>
          No incidents logged yet. Run the policy runner to generate a trail.
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
              <CardTitle className='text-base font-semibold'>
                {incident.summary ?? 'No summary provided'}
              </CardTitle>
              <div className='flex items-center gap-2'>
                <Badge variant={incident.safe ? 'secondary' : 'destructive'}>
                  {incident.safe ? 'Safe' : 'Unsafe'}
                </Badge>
                <Badge variant={incident.bothFresh ? 'default' : 'outline'}>
                  {incident.bothFresh ? 'Both fresh' : 'Stale feed'}
                </Badge>
              </div>
            </div>
            <CardDescription>
              {new Date(incident.occurredAt).toLocaleString()}
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
