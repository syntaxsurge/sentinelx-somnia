import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'

const SentinelXModule = buildModule('SentinelXModule', m => {
  const owner = m.getAccount(0)

  const guardianHub = m.contract('GuardianHub', [owner])
  const safeOracleRouter = m.contract('SafeOracleRouter', [owner])

  const accessFeeWei = m.getParameter('accessFeeWei', 10n ** 16n) // 0.01 SOMI
  const somiPaymentGuarded = m.contract('SOMIPaymentGuarded', [
    guardianHub,
    accessFeeWei
  ])

  m.call(guardianHub, 'registerTarget', [somiPaymentGuarded])

  return { guardianHub, safeOracleRouter, somiPaymentGuarded }
})

export default SentinelXModule
