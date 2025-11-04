import type { Chain } from 'wagmi/chains'

export const somniaShannon: Chain = {
  id: 50312,
  name: 'Somnia Shannon Testnet',
  nativeCurrency: {
    name: 'Somnia Test Token',
    symbol: 'STT',
    decimals: 18
  },
  rpcUrls: {
    default: { http: ['https://dream-rpc.somnia.network'] },
    public: { http: ['https://dream-rpc.somnia.network'] }
  },
  blockExplorers: {
    default: {
      name: 'Shannon Explorer',
      url: 'https://shannon-explorer.somnia.network'
    }
  },
  testnet: true
}

export const somniaMainnet: Chain = {
  id: 5031,
  name: 'Somnia',
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
}
