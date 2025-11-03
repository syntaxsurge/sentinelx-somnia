# SentinelX

SentinelX is an infrastructure layer that protects Somnia builders from oracle
drift and stale data. We are assembling a guarded price surface, guardian
automation, and a Convex-backed observability layer for Somnia applications.

## Feature overview

- **Safe price surfaces** – `SafeOracleRouter` merges Protofire + DIA price
  sources on Somnia Shannon Testnet and exposes freshness + deviation flags.
- **Guardian automation** – `GuardianHub` coordinates SentinelX operators and
  enforces `GuardablePausable` contracts, including the demo SOMI paywall.
- **Dashboard & API** – `/dashboard` provides tenant/monitor creation, live
  monitor tables, incident stream, and a manual policy trigger. REST endpoints
  (`/api/tenants`, `/api/monitors`, `/api/incidents`, `/api/jobs/run-policy`)
  drive automation and integrations.
- **Playbook** – `/docs` consolidates deployment commands, environment variable
  expectations, and REST payload examples for quick onboarding.
- **Policy runner** – `src/jobs/policyRunner.ts` reads `SafeOracleRouter` on
  Somnia Testnet, logs enriched incidents, and updates monitor status. The job
  is accessible via the dashboard button or `pnpm policy:run` CLI helper.
- **Observability** – Convex stores tenants, monitors, incidents, and API keys
  with normalized IDs for seamless integration across the stack.

## Milestone log

- **Day 1** – Core contracts, Convex schema, Hardhat + Next.js reset to
  SentinelX branding.
- **Day 2** – Ignition module, unit tests, Convex mutations/queries, REST API
  scaffolding.
- **Day 3** – Initial dashboard, incident stream, manual policy runner trigger.
- **Day 4** – Tenant/monitor creation flows, on-chain policy runner integration,
  enriched incident logging.
- **Day 5** – Production hardening, Somnia Testnet-only configuration, and final
  documentation/playbook updates.

## Quick start

```bash
pnpm install
pnpm dev               # launches Next.js

# In another terminal (optional for contract interaction)
cd blockchain
pnpm install
pnpm compile
```

Visit `http://localhost:3000` to review the current SentinelX overview and
dashboard (`/dashboard`).

## Environment variables

Copy `.env.example` to `.env.local` and set the following values:

```env
NEXT_PUBLIC_SOMNIA_RPC_URL=https://dream-rpc.somnia.network
NEXT_PUBLIC_PROTOFIRE_ETH_USD=0xd9132c1d762D432672493F640a63B758891B449e
NEXT_PUBLIC_DIA_WETH_USD=0x786c7893F8c26b80d42088749562eDb50Ba9601E
CONVEX_DEPLOYMENT=dev:your-local-deployment-or-https://your-deployment.convex.site
# optional, overrides dev: aliases with explicit URL
CONVEX_LOCAL_URL=http://127.0.0.1:8000
```

Optional settings (for agent integrations) can be added as needed. Set
`SENTINELX_ROUTER_ADDRESS` to the deployed `SafeOracleRouter` address on Somnia
Shannon Testnet so the policy runner can evaluate monitors.

## Repository layout

- `src/app` – Next.js App Router with marketing shell and API routes for Convex
  integration.
- `convex` – Schema plus mutations/queries for tenants, monitors, incidents, and
  API keys.
- `blockchain` – Hardhat workspace with contracts, tests, and Ignition modules.
- `scripts` – helper scripts shared across the project (artifacts sync, Convex
  dev convenience, policy runner CLI).

## Security checklist

- Never commit private keys. The Hardhat workspace reads `PRIVATE_KEY` and
  `SOMNIA_RPC_URL` from `blockchain/.env`.
- Run `pnpm lint:check-solidity` inside `blockchain/` after editing contracts.
- Execute `pnpm typecheck` from the repo root before publishing changes.
- Run `pnpm lint` (root) and `pnpm --filter sentinelx-hardhat test` (or
  `cd blockchain && pnpm test`) prior to release.

## Next steps

Upcoming milestones include:

- Monitor creation/management workflow inside the dashboard (forms, validation,
  tenant scoping).
- Real oracle health evaluation (reading on-chain feeds) inside the policy
  runner rather than heuristics.
- Guardian action webhooks (Slack/Discord) with incident digests.
- Synthetic data seeding + integration tests for the Convex API.
