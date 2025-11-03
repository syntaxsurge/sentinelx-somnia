import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import 'dotenv/config'

const PRIVATE_KEY = process.env.PRIVATE_KEY ?? ''
const SOMNIA_RPC_URL =
  process.env.SOMNIA_RPC_URL ?? 'https://dream-rpc.somnia.network'

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.28',
    settings: {
      evmVersion: 'london',
      optimizer: { enabled: true, runs: 200 }
    }
  },
  networks: {
    hardhat: {},
    somniatestnet: {
      url: SOMNIA_RPC_URL,
      chainId: 50312,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : []
    }
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts'
  }
}

export default config
