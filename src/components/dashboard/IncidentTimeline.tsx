import Link from 'next/link'
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Info,
  ShieldAlert
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { cn } from '@/lib/utils'

type Incident = {
  _id: string
  summary: string
  openedAt: number
  severity: string
  status: string
  txHash?: string | null
  advisoryTags?: string[]
}

const severityConfig = {
  critical: {
    icon: ShieldAlert,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30'
  },
  high: {
    icon: AlertTriangle,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30'
  },
  medium: {
    icon: AlertCircle,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30'
  },
  low: {
    icon: Info,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30'
  }
}

export function IncidentTimeline({ incidents }: { incidents: Incident[] }) {
  if (incidents.length === 0) {
    return (
      <Card className='border-border/60'>
        <CardContent className='flex flex-col items-center justify-center py-12'>
          <CheckCircle2 className='h-12 w-12 text-emerald-500/50 mb-4' />
          <p className='text-sm font-medium text-foreground'>
            All systems operational
          </p>
          <p className='text-xs text-muted-foreground text-center mt-1 max-w-md'>
            No incidents logged yet. Schedule the SentinelX policy agent or run
            it on demand to populate telemetry.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className='space-y-3'>
      {incidents.map((incident, index) => {
        const config =
          severityConfig[incident.severity as keyof typeof severityConfig] ??
          severityConfig.medium
        const Icon = config.icon

        return (
          <div key={incident._id} className='relative'>
            {index < incidents.length - 1 && (
              <div className='absolute left-[23px] top-[60px] h-full w-[2px] bg-border/60' />
            )}
            <Card
              className={cn(
                'border-l-4 transition-all hover:shadow-md',
                config.borderColor
              )}
            >
              <CardHeader className='pb-3'>
                <div className='flex items-start gap-4'>
                  <div
                    className={cn(
                      'rounded-full p-2.5 mt-0.5',
                      config.bgColor,
                      config.borderColor,
                      'border'
                    )}
                  >
                    <Icon className={cn('h-5 w-5', config.color)} />
                  </div>
                  <div className='flex-1 space-y-2'>
                    <div className='flex flex-wrap items-start justify-between gap-3'>
                      <div className='space-y-1'>
                        <div className='flex items-center gap-2 flex-wrap'>
                          <Badge
                            variant={
                              incident.severity === 'critical'
                                ? 'destructive'
                                : 'secondary'
                            }
                            className='uppercase text-xs'
                          >
                            {incident.severity}
                          </Badge>
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
                        </div>
                        <CardTitle className='text-base font-semibold text-foreground leading-snug'>
                          {incident.summary}
                        </CardTitle>
                      </div>
                    </div>
                    <CardDescription className='flex items-center gap-2'>
                      <span>
                        {new Date(incident.openedAt).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className='pt-0 pl-[68px]'>
                <div className='flex flex-wrap items-center gap-2'>
                  {incident.advisoryTags?.map(tag => (
                    <Badge key={tag} variant='outline' className='text-xs'>
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className='flex flex-wrap items-center justify-between gap-3 mt-3'>
                  <span className='text-xs text-muted-foreground font-mono'>
                    ID: {incident._id}
                  </span>
                  <div className='flex items-center gap-3'>
                    <Link
                      href={`/incidents/${incident._id}`}
                      className='text-xs font-medium text-primary hover:underline'
                    >
                      View details
                    </Link>
                    {incident.txHash ? (
                      <Link
                        href={`https://shannon-explorer.somnia.network/tx/${incident.txHash}`}
                        target='_blank'
                        className='text-xs font-medium text-primary hover:underline inline-flex items-center gap-1'
                      >
                        Transaction
                        <ExternalLink className='h-3 w-3' />
                      </Link>
                    ) : null}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      })}
    </div>
  )
}
