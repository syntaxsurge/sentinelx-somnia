import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock
} from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

type KPI = {
  title: string
  value: string
  hint?: string
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'Active monitors': Activity,
  'Open incidents': AlertTriangle,
  'Pending actions': CheckCircle2,
  'Last evaluation': Clock
}

export function KpiCards({ items }: { items: KPI[] }) {
  return (
    <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
      {items.map(item => {
        const Icon = iconMap[item.title] || Activity
        return (
          <Card
            key={item.title}
            className='border-border/60 bg-card transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5'
          >
            <CardHeader className='flex flex-row items-center justify-between pb-2 space-y-0'>
              <CardTitle className='text-sm font-medium text-foreground'>
                {item.title}
              </CardTitle>
              <Icon className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent className='space-y-1'>
              <div className='text-3xl font-bold tracking-tight text-foreground'>
                {item.value}
              </div>
              {item.hint ? (
                <CardDescription className='text-xs'>
                  {item.hint}
                </CardDescription>
              ) : null}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
