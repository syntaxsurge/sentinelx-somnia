#!/usr/bin/env tsx

const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

fetch(`${base}/api/jobs/run-policy`, { method: 'POST' })
  .then(async response => {
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`)
    }
    const payload = await response.json()
    console.log('Policy engine run complete:', payload)
  })
  .catch(error => {
    console.error('Policy engine run failed:', error)
    process.exitCode = 1
  })
