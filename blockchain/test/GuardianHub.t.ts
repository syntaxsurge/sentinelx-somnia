import { expect } from 'chai'
import { ethers } from 'hardhat'

describe('GuardianHub', () => {
  it('registers targets and pauses/unpauses via operators', async () => {
    const [owner, operator, user] = await ethers.getSigners()

    const GuardianHub = await ethers.getContractFactory('GuardianHub')
    const guardianHub = await GuardianHub.deploy(owner.address)
    await guardianHub.waitForDeployment()

    const SOMIPaymentGuarded =
      await ethers.getContractFactory('SOMIPaymentGuarded')
    const accessFee = ethers.parseEther('0.01')
    const guarded = await SOMIPaymentGuarded.deploy(
      await guardianHub.getAddress(),
      accessFee
    )
    await guarded.waitForDeployment()

    await guardianHub.registerTarget(await guarded.getAddress())
    await guardianHub.setOperator(operator.address, true)

    await guardianHub.connect(operator).pauseTarget(await guarded.getAddress())
    expect(await guarded.paused()).to.equal(true)

    await guardianHub
      .connect(operator)
      .unpauseTarget(await guarded.getAddress())
    expect(await guarded.paused()).to.equal(false)

    await expect(guardianHub.pauseTarget(await guarded.getAddress()))
      .to.emit(guardianHub, 'TargetPaused')
      .withArgs(await guarded.getAddress(), owner.address)

    await expect(
      guardianHub.pauseTarget(ethers.ZeroAddress)
    ).to.be.revertedWithCustomError(guardianHub, 'TargetNotRegistered')

    await expect(
      guardianHub.connect(user).pauseTarget(await guarded.getAddress())
    ).to.be.revertedWithCustomError(guardianHub, 'NotOperator')
  })
})
