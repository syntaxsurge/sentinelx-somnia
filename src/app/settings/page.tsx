export default function SettingsPage() {
  return (
    <div className='mx-auto max-w-2xl space-y-4 py-10'>
      <h1 className='text-3xl font-semibold'>Settings</h1>
      <p className='text-sm text-muted-foreground'>
        Configure automation credentials, webhooks, and guardian operators. The
        current MVP exposes API keys via the dashboard and stores them hashed in
        Convex.
      </p>
    </div>
  )
}
