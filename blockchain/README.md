# SentinelX Hardhat Workspace

This workspace contains the SentinelX Somnia Guardian smart contracts used
during the 5‑day MVP sprint.

## Contracts

- **SafeOracleRouter.sol** – Combines Protofire Chainlink feeds with DIA
  adapters to calculate guarded prices and freshness flags.
- **GuardianHub.sol** – Manages authorised SentinelX operators and routes
  pause/unpause commands to registered guardable contracts.
- **GuardablePausable.sol** – Lightweight mixin that exposes `pause` and
  `unpause` methods gated by a guardian address.
- **SOMIPaymentGuarded.sol** – Example paywall that requires a SOMI payment
  while respecting GuardianHub actions.

## Network configuration

`hardhat.config.ts` targets the Somnia Shannon Testnet (chain id `50312`) by
default. Set the following environment variables in `blockchain/.env`:

```env
PRIVATE_KEY=0xyour_private_key        # never commit this
SOMNIA_RPC_URL=https://dream-rpc.somnia.network
```

## Usage

```bash
pnpm install        # inside the blockchain folder
pnpm compile        # generate artifacts
pnpm test           # run Hardhat tests (to be added on Day 2)
```

Artifacts produced in this workspace are synced into the Next.js frontend via
`pnpm contracts:sync-abis` from the repository root.
