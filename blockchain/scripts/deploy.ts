import { ethers } from 'hardhat'

async function main() {
  const [deployer] = await ethers.getSigners()
  console.log('Deploying contracts with:', deployer.address)

  const GuardianHub = await ethers.getContractFactory('GuardianHub')
  const guardianHub = await GuardianHub.deploy(deployer.address)
  await guardianHub.waitForDeployment()
  console.log('GuardianHub:', await guardianHub.getAddress())

  const SafeOracleRouter = await ethers.getContractFactory('SafeOracleRouter')
  const router = await SafeOracleRouter.deploy(deployer.address)
  await router.waitForDeployment()
  console.log('SafeOracleRouter:', await router.getAddress())

  const accessFee = ethers.parseEther('0.01')
  const SOMIPaymentGuarded =
    await ethers.getContractFactory('SOMIPaymentGuarded')
  const guarded = await SOMIPaymentGuarded.deploy(
    await guardianHub.getAddress(),
    accessFee
  )
  await guarded.waitForDeployment()
  console.log('SOMIPaymentGuarded:', await guarded.getAddress())
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
