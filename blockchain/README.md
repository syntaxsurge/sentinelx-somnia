# SentinelX Hardhat Workspace

This workspace contains the SentinelX smart contracts.

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
```

Artifacts produced in this workspace are synced into the Next.js frontend via
`pnpm contracts:sync-abis` from the repository root.

## Deployment flow

1. **Install dependencies (once):**

   ```bash
   pnpm install
   ```

2. **Compile and run tests (optional but recommended):**

   ```bash
   pnpm compile
   pnpm test                      # runs Hardhat tests
   ```

3. **Deploy with Hardhat Ignition to Somnia Shannon Testnet:**

   ```bash
   pnpm exec hardhat ignition deploy ./ignition/modules/sentinelx.ts --network somniatestnet
   ```

   Ignition will print the deployed addresses for:
   - `GuardianHub`
   - `SafeOracleRouter`
   - `SOMIPaymentGuarded`

4. **Verify contracts (optional):**

   ```bash
   pnpm exec hardhat verify --network somniatestnet <DEPLOYED_ADDRESS> <constructor args>
   ```

5. **Sync ABIs back to the Next.js app:**

   From the repository root:

   ```bash
   pnpm contracts:sync-abis
   ```
