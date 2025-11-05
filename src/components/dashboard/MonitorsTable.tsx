import Link from 'next/link'
import { Activity, CheckCircle2, Pause, XCircle } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

type Monitor = {
  _id: string
  name: string
  type: string
  oracleKey: string
  status: string
  contractAddress: string
  guardianAddress: string
  createdAt: number
  lastEvaluatedAt?: number | null
}

const statusConfig: Record<
  string,
  {
    variant: 'default' | 'destructive' | 'secondary' | 'outline'
    icon: React.ComponentType<{ className?: string }>
  }
> = {
  active: { variant: 'default', icon: CheckCircle2 },
  attention: { variant: 'destructive', icon: XCircle },
  paused: { variant: 'secondary', icon: Pause }
}

function shortAddress(value: string) {
  return `${value.slice(0, 6)}…${value.slice(-4)}`
}

export function MonitorsTable({ monitors }: { monitors: Monitor[] }) {
  if (monitors.length === 0) {
    return (
      <Card className='border-border/60'>
        <CardHeader>
          <CardTitle className='text-lg'>Monitors</CardTitle>
          <CardDescription>
            Dual-oracle status and guardian binding for every protected
            contract.
          </CardDescription>
        </CardHeader>
        <CardContent className='flex flex-col items-center justify-center py-12'>
          <Activity className='h-12 w-12 text-muted-foreground/50 mb-4' />
          <p className='text-sm text-muted-foreground text-center'>
            No monitors registered yet.
          </p>
          <p className='text-xs text-muted-foreground text-center mt-1'>
            Create one to start analyzing oracle health.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className='border-border/60'>
      <CardHeader className='pb-4'>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle className='text-lg'>Monitors</CardTitle>
            <CardDescription>
              Dual-oracle status and guardian binding for every protected
              contract.
            </CardDescription>
          </div>
          <Badge variant='secondary' className='text-xs'>
            {monitors.length} active
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className='rounded-md border border-border/60'>
          <Table>
            <TableHeader>
              <TableRow className='bg-muted/30 hover:bg-muted/30'>
                <TableHead className='font-semibold text-foreground'>
                  Monitor
                </TableHead>
                <TableHead className='font-semibold text-foreground'>
                  Status
                </TableHead>
                <TableHead className='font-semibold text-foreground'>
                  Contract
                </TableHead>
                <TableHead className='font-semibold text-foreground'>
                  Guardian
                </TableHead>
                <TableHead className='font-semibold text-foreground'>
                  Last evaluation
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {monitors.map(monitor => {
                const statusInfo =
                  statusConfig[monitor.status] ?? statusConfig.active
                const StatusIcon = statusInfo.icon
                return (
                  <TableRow
                    key={monitor._id}
                    className='hover:bg-muted/50 transition-colors'
                  >
                    <TableCell>
                      <Link
                        href={`/monitors/${monitor._id}`}
                        className='font-medium text-foreground hover:text-primary transition-colors hover:underline'
                      >
                        {monitor.name}
                      </Link>
                      <div className='text-xs text-muted-foreground mt-0.5'>
                        {monitor.type} · {monitor.oracleKey}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={statusInfo.variant}
                        className='flex items-center gap-1 w-fit'
                      >
                        <StatusIcon className='h-3 w-3' />
                        <span className='capitalize'>{monitor.status}</span>
                      </Badge>
                    </TableCell>
                    <TableCell className='font-mono text-xs text-muted-foreground'>
                      {shortAddress(monitor.contractAddress)}
                    </TableCell>
                    <TableCell className='font-mono text-xs text-muted-foreground'>
                      {shortAddress(monitor.guardianAddress)}
                    </TableCell>
                    <TableCell className='text-sm text-muted-foreground'>
                      {monitor.lastEvaluatedAt
                        ? new Date(monitor.lastEvaluatedAt).toLocaleString(
                            'en-US',
                            {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }
                          )
                        : 'Pending'}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
