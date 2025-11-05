# SentinelX Hardhat Workspace

Smart contracts and deployment scripts that back the SentinelX Somnia deployment.

## Contracts

- **GuardianHub.sol** – Authorises operators and relays guardian-approved calls
  to allowlisted contracts.
- **AgentInbox.sol** – Allowlist-enforced router that executes calldata once an
  operator approves a plan.
- **SafeOracleRouter.sol** – Blends Protofire Chainlink and DIA feeds to produce
  guarded price + freshness signals for monitors.
- **GuardablePausable.sol** – Lightweight mixin that exposes `pause` / `unpause`
  guarded by a SentinelX guardian.
- **SOMIPaymentGuarded.sol** – Example paywall contract that consumes the
  GuardianHub guardrails.
- **contracts/mocks/** – Contains `DemoOracle.sol` and `DemoPausable.sol`, the
  demo-only contracts used to generate deterministic incidents.

Generated artifacts are consumed by the Next.js frontend (ABI sync) and by the
policy runner.

## Environment

`hardhat.config.ts` targets Somnia Shannon Testnet (`50312`). Create
`blockchain/.env` with:

```env
PRIVATE_KEY=0xabc...               # funded deployer (never commit)
SOMNIA_RPC_URL=https://dream-rpc.somnia.network
```

For demo mode, provision a second key that only owns the demo contracts:

```env
DEMO_OPERATOR_PRIVATE_KEY=0xdef... # optional helper for tests/scripts
```

Inside the Next.js workspace set `EXECUTOR_PRIVATE_KEY` (demo operator) and,
if desired, override addresses with the `NEXT_PUBLIC_*` env vars.

## Installation & Commands

```bash
pnpm install          # install Hardhat toolchain
pnpm compile          # compile contracts
pnpm test             # run unit tests
pnpm lint:check-solidity
```

After any compilation, sync artifacts back to the frontend from the repo root:

```bash
pnpm contracts:sync-abis
```

## Deployment Playbook

### Core infrastructure (GuardianHub, AgentInbox, SafeOracleRouter, SOMI guard)

```bash
pnpm exec hardhat ignition deploy ./ignition/modules/sentinelx.ts --network somniatestnet
```

Ignition prints the addresses you must copy into `config/chain.somniatest.json`
or the corresponding `NEXT_PUBLIC_*` env variables.

### Demo assets (DemoOracle + DemoPausable)

```bash
pnpm exec hardhat run scripts/deploy-demo.ts --network somniatestnet
```

By default the script sets an initial 2000.00 price (8 decimals) and configures
`DemoPausable` by calling `setGuardianHub` when `GUARDIAN_HUB_ADDRESS` is set in
`blockchain/.env`. Copy both addresses into the shared config file so the UI and
Convex reference them automatically.

### Verifications (optional)

```bash
pnpm exec hardhat verify --network somniatestnet <DEPLOYED_ADDRESS> <constructor args>
```

### Demo Mode Checklist

1. Deploy demo assets (`deploy-demo.ts`) with a wallet dedicated to the demo.
2. Copy the addresses into `config/chain.somniatest.json`.
3. Set `NEXT_PUBLIC_DEMO_MODE=true` and
   `EXECUTOR_PRIVATE_KEY=<demo operator>` in the Next.js environment.
4. Keep the demo operator key funded with a small amount of gas to allow
   `/api/demo/simulate` to spike the oracle price on demand.

Following these steps keeps the blockchain workspace and the frontend in sync
with the latest SentinelX guardrails and demo flow. Remember to rerun
`pnpm contracts:sync-abis` whenever new contracts or ABIs are generated.
