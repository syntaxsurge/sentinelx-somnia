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
        const response = await fetch('/api/indexer/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })

        let payload: any = null
        try {
          payload = await response.json()
        } catch {
          payload = null
        }
        if (!response.ok) {
          const detail =
            (payload && typeof payload.message === 'string') ||
            typeof payload?.error === 'string'
              ? payload.message ?? payload.error
              : null
          throw new Error(
            detail ?? `Request failed with status ${response.status}`
          )
        }

        const display =
          payload?.message ??
          `Processed ${payload?.processed ?? 0} monitor(s).`

        setMessage(display)
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
      {message ? <p className='text-xs text-primary'>{message}</p> : null}
    </div>
  )
}
