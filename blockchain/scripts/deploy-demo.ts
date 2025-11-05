import { ethers } from 'hardhat'

async function main() {
  const [deployer] = await ethers.getSigners()
  console.log('Deploying demo contracts with:', deployer.address)

  const initialPriceValue = process.env.DEMO_ORACLE_PRICE ?? '2000'
  const decimals = Number(process.env.DEMO_ORACLE_DECIMALS ?? '8')
  const initialPrice = ethers.parseUnits(initialPriceValue, decimals)

  const DemoOracle = await ethers.getContractFactory('DemoOracle')
  const oracle = await DemoOracle.deploy(initialPrice, decimals)
  await oracle.waitForDeployment()
  const oracleAddress = await oracle.getAddress()
  console.log('DemoOracle:', oracleAddress)

  const DemoPausable = await ethers.getContractFactory('DemoPausable')
  const pausable = await DemoPausable.deploy()
  await pausable.waitForDeployment()
  const pausableAddress = await pausable.getAddress()
  console.log('DemoPausable:', pausableAddress)

  const guardianHub = process.env.GUARDIAN_HUB_ADDRESS
  if (guardianHub) {
    const tx = await pausable.setGuardianHub(guardianHub)
    await tx.wait()
    console.log('GuardianHub set on DemoPausable:', guardianHub)
  }
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
