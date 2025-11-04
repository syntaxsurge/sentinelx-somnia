'use client'

import {
  RainbowKitProvider,
  darkTheme,
  getDefaultConfig
} from '@rainbow-me/rainbowkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import '@rainbow-me/rainbowkit/styles.css'
import { WagmiProvider, http } from 'wagmi'

import { somniaShannon } from '@/lib/chains'

const queryClient = new QueryClient()

const wagmiConfig = getDefaultConfig({
  appName: 'SentinelX',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_ID ?? '',
  chains: [somniaShannon],
  transports: {
    [somniaShannon.id]: http('https://dream-rpc.somnia.network')
  },
  ssr: true
})

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()}>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
