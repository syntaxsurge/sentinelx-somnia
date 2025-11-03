import { createPublicClient, http } from 'viem'
import { defineChain } from 'viem/utils'

let cachedClient: ReturnType<typeof createPublicClient> | null = null

function resolveRpcUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SOMNIA_RPC_URL ?? 'https://dream-rpc.somnia.network'
  )
}

function resolveChainId(): number {
  const raw = process.env.NEXT_PUBLIC_SOMNIA_CHAIN_ID
  if (!raw) return 50312
  const parsed = Number(raw)
  return Number.isNaN(parsed) ? 50312 : parsed
}

export function getSomniaClient() {
  if (cachedClient) return cachedClient

  const chainId = resolveChainId()
  const rpcUrl = resolveRpcUrl()

  const somniaChain = defineChain({
    id: chainId,
    name: 'Somnia Network',
    network: 'somnia',
    nativeCurrency: {
      name: 'Somnia Token',
      symbol: 'SOMI',
      decimals: 18
    },
    rpcUrls: {
      default: { http: [rpcUrl] },
      public: { http: [rpcUrl] }
    }
  })

  cachedClient = createPublicClient({
    chain: somniaChain,
    transport: http(rpcUrl)
  })

  return cachedClient
}
