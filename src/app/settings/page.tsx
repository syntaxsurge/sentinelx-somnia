import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

const sections = [
  {
    title: 'Automation',
    description:
      'Provision API keys for SentinelX CLI jobs, rotate secrets, and scope access to specific monitors.',
    actions: [
      { label: 'Manage API keys', href: '/dashboard' },
      { label: 'Generate token', href: '/dashboard' }
    ]
  },
  {
    title: 'Webhooks',
    description:
      'Notify Somnia operators via Slack or Discord when incidents fire. Each webhook receives structured incident payloads.',
    actions: [{ label: 'Configure webhooks', href: '/docs' }]
  },
  {
    title: 'Guardian operators',
    description:
      'Link GuardianHub signers responsible for pause/unpause authority. Keep a minimum of two guardians online.',
    actions: [{ label: 'View GuardianHub guide', href: '/docs' }]
  }
]

export default function SettingsPage() {
  return (
    <div className='space-y-8'>
      <header className='space-y-2'>
        <h1 className='text-3xl font-semibold tracking-tight'>Settings</h1>
        <p className='text-sm text-muted-foreground'>
          Harden automation flows, manage API keys, and orchestrate guardian
          access for SentinelX.
        </p>
      </header>

      <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>
        {sections.map(section => (
          <Card key={section.title}>
            <CardHeader>
              <CardTitle>{section.title}</CardTitle>
              <CardDescription>{section.description}</CardDescription>
            </CardHeader>
            <CardContent className='flex flex-col gap-2'>
              {section.actions.map(action => (
                <Button key={action.label} asChild variant='outline'>
                  <a href={action.href}>{action.label}</a>
                </Button>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
