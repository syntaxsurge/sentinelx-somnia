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

export function KpiCards({ items }: { items: KPI[] }) {
  return (
    <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
      {items.map(item => (
        <Card key={item.title}>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              {item.title}
            </CardTitle>
            {item.hint ? (
              <CardDescription>{item.hint}</CardDescription>
            ) : null}
          </CardHeader>
          <CardContent>
            <span className='text-2xl font-semibold tracking-tight'>
              {item.value}
            </span>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
