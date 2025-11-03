'use client'

import { useState, useTransition } from 'react'

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
    <div className='flex flex-col gap-2 text-sm text-slate-200'>
      <button
        type='button'
        onClick={handleClick}
        disabled={pending}
        className='w-max rounded-md bg-emerald-500 px-4 py-2 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-60'
      >
        {pending ? 'Running policy…' : 'Run policy evaluation'}
      </button>
      {message ? <p className='text-xs text-emerald-200'>{message}</p> : null}
    </div>
  )
}
