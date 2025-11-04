'use client'

import { useCallback } from 'react'

import { SiweMessage } from 'siwe'
import { useAccount, useSignMessage } from 'wagmi'

import { Button } from '@/components/ui/button'
import { useSession } from '@/hooks/useSession'

export default function SiweButton() {
  const { address, isConnected } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const { user, refresh } = useSession()

  const handleSignIn = useCallback(async () => {
    if (!address) return

    const nonceResponse = await fetch('/api/siwe/nonce', { cache: 'no-store' })
    const { nonce } = await nonceResponse.json()

    const message = new SiweMessage({
      domain: window.location.host,
      address,
      statement: 'Sign in to SentinelX',
      uri: window.location.origin,
      version: '1',
      chainId: 50312,
      nonce
    })

    const signature = await signMessageAsync({
      message: message.prepareMessage()
    })

    await fetch('/api/siwe/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, signature })
    })

    await refresh()
  }, [address, refresh, signMessageAsync])

  if (!isConnected || user?.address) {
    return null
  }

  return (
    <Button onClick={handleSignIn} variant='outline' size='sm'>
      Sign message
    </Button>
  )
}
