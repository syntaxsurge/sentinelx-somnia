'use client'

import { useState, useTransition } from 'react'

import { Play, RotateCcw } from 'lucide-react'

import { Button } from '@/components/ui/button'

export function RunPolicyButton() {
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)

  const handleClick = () => {
    setMessage(null)
    startTransition(async () => {
      try {
        const response = await fetch('/api/jobs/run-policy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`)
        }

        const payload = await response.json()
        setMessage(`Processed ${payload.processed ?? 0} monitor(s).`)
      } catch (error) {
        setMessage((error as Error).message)
      }
    })
  }

  return (
    <div className='flex flex-col gap-2 text-sm text-foreground'>
      <Button onClick={handleClick} disabled={pending} size='sm'>
        {pending ? (
          <>
            <RotateCcw className='h-4 w-4 animate-spin' />
            Running policy…
          </>
        ) : (
          <>
            <Play className='h-4 w-4' />
            Run policy evaluation
          </>
        )}
      </Button>
      {message ? (
        <p className='text-xs text-brand-teal-light'>{message}</p>
      ) : null}
    </div>
  )
}
