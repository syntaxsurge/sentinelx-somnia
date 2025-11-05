# SentinelX Demo Video Script (5 minutes)

Authoritative walkthrough of the SentinelX prototype for Somnia Shannon. Hit the high notes - infra stability, AI co-pilot, and on-chain guardrails - within five minutes.

## Assumptions
- Demo mode is enabled (`DEMO_MODE=true`, `NEXT_PUBLIC_DEMO_MODE=true`) with a funded `OPERATOR_PRIVATE_KEY`.
- `config/chain.somniatest.json` (or env overrides) points at the deployed GuardianHub, AgentInbox, DemoOracle, and DemoPausable contracts.
- You are already signed in with RainbowKit + SIWE before recording.
- The Convex deployment is seeded with at least one tenant tied to your wallet.

---

## 0) Title card (5s)
- **VO**: "SentinelX safeguards Somnia with shared monitors, AI runbooks, and on-chain guardian approvals. Let me show you the end-to-end loop."

## 1) Dashboard (`/dashboard`) - Data plane (35s)
- On-screen: KPI cards, Monitors table, Daily brief, Action queue.
- Action: Click **Run policy evaluation**. Toast confirms; Daily brief refreshes.
- **Callout**: "The policy runner hits `/api/indexer/run`, polls SafeOracleRouter, and stores telemetry + incidents in Convex."

## 2) Register monitor (`/monitors/new`) - Config defaults (55s)
- On-screen: "Create Monitor" form with GuardianHub, AgentInbox, SafeOracleRouter, DemoOracle, and DemoPausable fields locked (read-only).
- Inputs to fill:
  - Monitor name → `Somnia ETH/USD router guard`
  - Max deviation (bps) → `100`
  - Stale after (seconds) → `120`
- Action: Submit, then show the new row on `/monitors`.
- **Callout**: "Addresses come from `/api/config/chain`. Advanced override is admin-only and env-gated - safe defaults for hackathon judges."

## 3) Simulate incident (`/dashboard`) - Deterministic trigger (35s)
- On-screen: **Simulate incident** button (top right).
- Action: Click it. Toast confirms. Within seconds, Recent incidents & Daily brief show a new high-severity incident.
- **Callout**: "Demo mode spikes the DemoOracle via `/api/demo/simulate`, so we never wait on real price swings."

## 4) Review incident (`/incidents`) - AI plane (60s)
- On-screen: Open the newest incident.
- Elements to highlight: AI Summary (severity, root cause, mitigations), telemetry snapshot, Action intents panel.
- Action: Click **Generate new plan**. A structured intent appears (Pause DemoPausable + Notify guardians) with rationale + calldata preview.
- **Callout**: "OpenAI Responses synthesizes an action plan grounded in monitor context and guardian capabilities."

## 5) Approve & execute (`/actions`) - Control plane (70s)
- On-screen: Proposed intent inside Action queue.
- Preferred path:
  - Click **Approve & Execute**, confirm wallet transaction.
  - Toast shows transaction hash; state flips to Executed.
- Fallback (if UI execution disabled):
  - Click **Approve**.
  - Run the tx manually, paste hash into **Mark executed**, confirm.
- Optional: Show `DemoPausable.paused()` or failed `doWork()` call to confirm the pause.
- **Callout**: "AgentInbox relays only allowlisted calls. Execution hashes are recorded for auditability."

## 6) Docs (`/docs`) - Quickstart + cron (35s)
- On-screen: Highlight the **Demo quickstart** section and `/api/indexer/run` cron snippet.
- Action: Copy the cron example (schedule `*/1 * * * *`) and briefly show the Docs Copilot prompt.
- **Callout**: "Docs bundle Quickstart, REST references, and an embedded Copilot. Cron keeps telemetry and AI plans fresh."

## 7) Settings (`/settings`) - Ops controls (25s)
- On-screen: API Keys, Webhooks, Guardian operators.
- Actions:
  - Create an API key (`policy-runner-demo`) and point out plaintext vs hashed storage.
  - Add a webhook (`Slack`, secret optional).
  - Add a guardian operator address (tiered role).
- **Callout**: "All automation hooks - credentials, alerts, guardian roster - live in one place."

## 8) Wrap (10s)
- **VO**: "We deployed a monitor, triggered an incident, used AI for triage, and executed a guarded pause on-chain - all in minutes. Hit the live Vercel URL to try it yourself or follow the docs to integrate your own contracts."
