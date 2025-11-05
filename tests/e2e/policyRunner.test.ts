import { beforeEach, describe, expect, it, vi } from 'vitest'

const queryMock = vi.fn()
const mutationMock = vi.fn()
const readContractMock = vi.fn()

vi.mock('@/lib/convexClient', () => ({
  getConvexClient: () => ({
    query: queryMock,
    mutation: mutationMock
  })
}))

vi.mock('@/lib/somniaClient', () => ({
  getSomniaClient: () => ({
    readContract: readContractMock
  })
}))

import { runPolicyOnce } from '@/jobs/policyRunner'

describe('policy runner', () => {
  beforeEach(() => {
    queryMock.mockReset()
    mutationMock.mockReset()
    readContractMock.mockReset()
    delete process.env.SENTINELX_ROUTER_ADDRESS
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
      'monitors:setStatus',
      expect.objectContaining({ status: 'active' })
    )
    expect(mutationMock).toHaveBeenNthCalledWith(
      2,
      'incidents:record',
      expect.objectContaining({ safe: true, bothFresh: true, action: 'noop' })
    )
  })

  it('flags attention when router address missing', async () => {
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
      'monitors:setStatus',
      expect.objectContaining({ status: 'attention' })
    )
    expect(mutationMock).toHaveBeenNthCalledWith(
      2,
      'incidents:record',
      expect.objectContaining({ safe: false, bothFresh: false, action: 'pause-recommended' })
    )
  })
})
