import Link from 'next/link'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { cn } from '@/lib/utils'

type Monitor = {
  _id: string
  oracleKey: string
  status?: string | null
  contractAddress: string
  guardianAddress: string
  createdAt: number
}

const statusColor: Record<string, string> = {
  safe: 'text-emerald-500',
  guarded: 'text-amber-500',
  attention: 'text-red-500'
}

function shortAddress(value: string) {
  return `${value.slice(0, 6)}…${value.slice(-4)}`
}

export function MonitorsTable({ monitors }: { monitors: Monitor[] }) {
  if (monitors.length === 0) {
    return (
      <Card>
        <CardContent className='py-10 text-center text-sm text-muted-foreground'>
          No monitors registered yet. Create one to start analyzing oracle
          health.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className='pb-4'>
        <CardTitle className='text-lg'>Monitors</CardTitle>
        <CardDescription>
          Dual-oracle status and guardian binding for every protected contract.
        </CardDescription>
      </CardHeader>
      <CardContent className='overflow-x-auto'>
        <table className='min-w-full divide-y divide-border text-sm'>
          <thead className='bg-secondary/50 text-left uppercase tracking-wide text-xs text-muted-foreground'>
            <tr>
              <th className='px-4 py-3 font-medium'>Pair</th>
              <th className='px-4 py-3 font-medium'>Status</th>
              <th className='px-4 py-3 font-medium'>Contract</th>
              <th className='px-4 py-3 font-medium'>Guardian</th>
              <th className='px-4 py-3 font-medium'>Created</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-border'>
            {monitors.map(monitor => (
              <tr key={monitor._id} className='hover:bg-muted/50'>
                <td className='px-4 py-3'>
                  <Link
                    href={`/monitors/${monitor._id}`}
                    className='font-medium text-foreground hover:underline'
                  >
                    {monitor.oracleKey}
                  </Link>
                </td>
                <td className='px-4 py-3'>
                  <span
                    className={cn(
                      'font-medium capitalize',
                      statusColor[monitor.status ?? ''] ??
                        'text-muted-foreground'
                    )}
                  >
                    {monitor.status ?? 'unknown'}
                  </span>
                </td>
                <td className='px-4 py-3 font-mono text-xs text-muted-foreground'>
                  {shortAddress(monitor.contractAddress)}
                </td>
                <td className='px-4 py-3 font-mono text-xs text-muted-foreground'>
                  {shortAddress(monitor.guardianAddress)}
                </td>
                <td className='px-4 py-3 text-muted-foreground'>
                  {new Date(monitor.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}
