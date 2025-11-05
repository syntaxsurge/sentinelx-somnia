import { defineChain } from 'viem'

export const somniaShannon = defineChain({
  id: 50312,
  name: 'Somnia Shannon Testnet',
  network: 'somnia-shannon',
  nativeCurrency: {
    name: 'Somnia Test Token',
    symbol: 'STT',
    decimals: 18
  },
  rpcUrls: {
    default: { http: [process.env.NEXT_PUBLIC_SOMNIA_RPC_URL!] },
    public: { http: [process.env.NEXT_PUBLIC_SOMNIA_RPC_URL!] }
  },
  blockExplorers: {
    default: {
      name: 'Somnia Explorer',
      url: 'https://shannon-explorer.somnia.network'
    }
  },
  testnet: true
})

export const somniaMainnet = defineChain({
  id: 5031,
  name: 'Somnia',
  network: 'somnia',
  nativeCurrency: {
    name: 'Somnia',
    symbol: 'SOMI',
    decimals: 18
  },
  rpcUrls: {
    default: { http: ['https://api.infra.mainnet.somnia.network'] },
    public: { http: ['https://api.infra.mainnet.somnia.network'] }
  },
  blockExplorers: {
    default: {
      name: 'Somnia Explorer',
      url: 'https://explorer.somnia.network'
    }
  }
})
