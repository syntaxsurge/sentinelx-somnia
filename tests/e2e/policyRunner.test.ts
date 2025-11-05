import { beforeEach, describe, expect, it, vi } from 'vitest'

const { queryMock, mutationMock, readContractMock } = vi.hoisted(() => ({
  queryMock: vi.fn(),
  mutationMock: vi.fn(),
  readContractMock: vi.fn()
}))
const { loadChainConfigMock } = vi.hoisted(() => ({
  loadChainConfigMock: vi.fn()
}))

vi.mock('@/lib/convexClient', () => ({
  getConvexClient: () => ({
    query: queryMock,
    mutation: mutationMock
  })
}))

vi.mock('viem', async () => {
  const actual = await vi.importActual<typeof import('viem')>('viem')
  return {
    ...actual,
    createPublicClient: vi.fn(() => ({
      readContract: readContractMock
    }))
  }
})

vi.mock('@/lib/somniaClient', () => ({
  getSomniaClient: () => ({
    readContract: readContractMock
  })
}))

vi.mock('@/lib/config', () => ({
  loadChainConfig: loadChainConfigMock
}))

import { runPolicyOnce } from '@/jobs/policyRunner'

describe('policy runner', () => {
  const baseConfig = {
    chainId: 50312,
    name: 'Somnia Shannon Testnet',
    guardianHub: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    agentInbox: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    oracleRouter: '0xcccccccccccccccccccccccccccccccccccccccc',
    demoOracle: '0xdddddddddddddddddddddddddddddddddddddddd',
    demoPausable: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    feeds: {},
    defaults: {
      maxDeviationBps: 100,
      staleAfterSeconds: 180
    },
    demoMode: false
  }

  beforeEach(() => {
    queryMock.mockReset()
    mutationMock.mockReset()
    readContractMock.mockReset()
    loadChainConfigMock.mockReset()
    loadChainConfigMock.mockResolvedValue(baseConfig)
    delete process.env.NEXT_PUBLIC_SAFE_ORACLE_ROUTER
  })

  it('updates status and records incident when router returns safe result', async () => {
    queryMock.mockResolvedValueOnce([
      {
        _id: 'monitor_1',
        contractAddress: '0xcontract',
        guardianAddress: '0xguardian',
        routerAddress: '0xrouter',
        oracleKey: 'ETH/USD',
        protofireFeed: '0xproto',
        diaFeed: '0xdia',
        maxDeviationBps: 100,
        staleAfterSeconds: 180
      }
    ])

    readContractMock.mockResolvedValueOnce([
      100n,
      true,
      true,
      100n,
      100n,
      1n,
      1n
    ])

    mutationMock.mockResolvedValue(undefined)

    const outcome = await runPolicyOnce()

    expect(outcome.processed).toBe(1)
    expect(readContractMock).toHaveBeenCalledWith(
      expect.objectContaining({
        address: '0xrouter',
        functionName: 'latest'
      })
    )
    expect(mutationMock).toHaveBeenNthCalledWith(
      1,
      'telemetry:record',
      expect.objectContaining({
        monitorId: 'monitor_1',
        source: 'safeOracle'
      })
    )
    expect(mutationMock).toHaveBeenNthCalledWith(
      2,
      'monitors:updateEvaluation',
      expect.objectContaining({ monitorId: 'monitor_1' })
    )
    expect(mutationMock).toHaveBeenNthCalledWith(
      3,
      'monitors:setStatus',
      expect.objectContaining({ status: 'active' })
    )
    expect(
      mutationMock.mock.calls.find(call => call[0] === 'incidents:record')
    ).toBeUndefined()
  })

  it('flags attention when router address missing', async () => {
    loadChainConfigMock.mockRejectedValueOnce(new Error('config unavailable'))
    queryMock.mockResolvedValueOnce([
      {
        _id: 'monitor_missing_router',
        contractAddress: '0xcontract',
        guardianAddress: '0xguardian',
        routerAddress: undefined,
        oracleKey: 'ETH/USD',
        protofireFeed: '0xproto',
        diaFeed: '0xdia',
        maxDeviationBps: 100,
        staleAfterSeconds: 180
      }
    ])

    mutationMock.mockResolvedValue(undefined)

    const outcome = await runPolicyOnce()

    expect(outcome.processed).toBe(1)
    expect(readContractMock).not.toHaveBeenCalled()
    expect(mutationMock).toHaveBeenNthCalledWith(
      1,
      'telemetry:record',
      expect.objectContaining({
        monitorId: 'monitor_missing_router',
        source: 'policy',
        datapoint: expect.objectContaining({
          error: 'router_address_missing'
        })
      })
    )
    expect(mutationMock).toHaveBeenNthCalledWith(
      2,
      'monitors:updateEvaluation',
      expect.objectContaining({ monitorId: 'monitor_missing_router' })
    )
  })
})
