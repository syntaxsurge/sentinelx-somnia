#!/usr/bin/env tsx

const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

fetch(`${base}/api/indexer/run`, { method: 'POST' })
  .then(async response => {
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
      throw new Error(detail ?? `Request failed with status ${response.status}`)
    }

    if (payload?.skipped) {
      console.log(payload.message ?? 'Policy engine run skipped.')
      return
    }

    console.log('Policy engine run complete:', payload)
  })
  .catch(error => {
    console.error('Policy engine run failed:', error)
    process.exitCode = 1
  })
