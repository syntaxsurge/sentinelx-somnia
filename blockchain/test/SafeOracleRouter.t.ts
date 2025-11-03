import { expect } from 'chai'
import { ethers } from 'hardhat'

describe('SafeOracleRouter', () => {
  it('returns guarded price when feeds align', async () => {
    const SafeOracleRouter = await ethers.getContractFactory('SafeOracleRouter')
    const router = await SafeOracleRouter.deploy(ethers.ZeroAddress)
    await router.waitForDeployment()

    const MockAggregator = await ethers.getContractFactory('MockAggregator')
    const protofire = await MockAggregator.deploy(8, 1_800_00000000n)
    const dia = await MockAggregator.deploy(8, 1_802_00000000n)

    const key = ethers.keccak256(ethers.toUtf8Bytes('ETH/USD'))

    await router.configureFeed(
      key,
      await protofire.getAddress(),
      await dia.getAddress(),
      150, // 1.5%
      300
    )

    const result = await router.latest(key)
    expect(result.safe).to.equal(true)
    expect(result.bothFresh).to.equal(true)
    expect(result.price).to.equal((1_800_00000000n + 1_802_00000000n) / 2n)
  })

  it('flags deviation and falls back to freshest feed', async () => {
    const SafeOracleRouter = await ethers.getContractFactory('SafeOracleRouter')
    const router = await SafeOracleRouter.deploy(ethers.ZeroAddress)
    await router.waitForDeployment()

    const MockAggregator = await ethers.getContractFactory('MockAggregator')
    const protofire = await MockAggregator.deploy(8, 1_800_00000000n)
    const dia = await MockAggregator.deploy(8, 1_900_00000000n)

    const key = ethers.keccak256(ethers.toUtf8Bytes('ETH/USD'))

    await router.configureFeed(
      key,
      await protofire.getAddress(),
      await dia.getAddress(),
      50, // 0.5%
      300
    )

    const result = await router.latest(key)
    expect(result.safe).to.equal(false)
    expect(result.bothFresh).to.equal(true)
  })
})
