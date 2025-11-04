# SentinelX Demo Video Script

This script outlines a 7–8 minute walkthrough of SentinelX Somnia Guardian. Each voice-over line is paired with the visual or interaction the audience should see at that moment.

---

## Segment 1 – Ecosystem Intro

1. **On-screen:** Start on the SentinelX landing hero (`/`), slowly pan across the headline, architecture blocks, and the primary CTA “Launch dashboard”.
   - **Voice-over 1:** “SentinelX is a guardian stack for the Somnia network. It hardens price feeds by cross‑checking Protofire and DIA, logs incidents in Convex, and coordinates guardian actions so protocols fail safe—not open.”


## Segment 3 – Dashboard Tour (Tenants, Monitors, Incidents)

1. **On-screen:** Navigate to `/dashboard`; show the Operations header, stats, and “Run policy” button.
   - **Voice-over 4:** “The dashboard is the control plane: tenants scope ownership, monitors watch your contracts and feed pair, and incidents capture every evaluation.”
2. **On-screen:** In “Create tenant”, add a new tenant.
   - **Voice-over 5:** “Let’s add a tenant that represents our application or team. The owner address maps to operators.”
   - Field inputs — type exactly:
     - Tenant name: `Somnia Index Vaults`
     - Owner address: `0xA0C2E2aB4B7E3A0b9C0F44E5F3a6C9F10F9A1E21`
3. **On-screen:** In “Register monitor”, paste the deployed addresses and set the feed pair and thresholds. Click “Register monitor”.
   - **Voice-over 6:** “A monitor links a guardable contract, our GuardianHub, and the SafeOracleRouter with a specific oracle key and feed pair. We’ll start with ETH/USD.”
   - Field inputs — type exactly:
     - Guarded contract: (paste) `<SOMIPaymentGuarded from deploy>`
     - Guardian hub: (paste) `<GuardianHub from deploy>`
     - SafeOracleRouter: (paste) `<SafeOracleRouter from deploy>`
     - Oracle key: `ETH/USD`
     - Protofire feed: `0xd9132c1d762D432672493F640a63B758891B449e`
     - DIA feed: `0x786c7893F8c26b80d42088749562eDb50Ba9601E`
     - Max deviation (bps): `100`
     - Staleness window (seconds): `180`
4. **On-screen:** Show the Monitors table with the newly added row and the Incident stream (empty initially).
   - **Voice-over 7:** “New monitors appear here with their current status. The incident stream will populate as the policy runs.”

## Segment 4 – Policy Run & Incident Logging

1. **On-screen:** Click `Run policy` in the header. The toast appears; then the Incident stream updates with a new entry.
   - **Voice-over 8:** “The policy runner queries SafeOracleRouter.latest for our key, checks freshness and deviation, updates the monitor status, and writes a detailed incident to Convex.”
2. **On-screen:** Click the latest incident card; highlight Safe/ Fresh flags and the summary text.
   - **Voice-over 9:** “Here you see whether both feeds are fresh, if the price was marked safe, and a human‑readable summary for operators.”

## Segment 5 – Provision API Key for Automation

1. **On-screen:** In the right column, open “Provision API key”, choose the tenant, add a label, and click `Generate API key`. Copy the key to clipboard.
   - **Voice-over 10:** “We issue an API key for automation jobs or CI. The plaintext key is shown once. Convex stores only a SHA‑256 hash.”
   - Field inputs — type exactly:
     - Tenant: `Somnia Index Vaults`
     - Label: `policy-runner-prod`
2. **On-screen:** Scroll to the API keys table; point out the label, tenant, and truncated hash.
   - **Voice-over 11:** “Keys are scoped to tenants. Rotate them regularly and remove unused credentials.”

## Segment 6 – Demo Contract Behavior (Guarded Paywall)

1. **On-screen:** Open a terminal and call the `payToAccess` function on `SOMIPaymentGuarded` with exactly 0.01 SOMI. Show success.
   - **Voice-over 12:** “Our sample contract is guardable and requires an exact SOMI payment. When not paused, payToAccess succeeds.”
   - Commands — type exactly (replace address):
     - `cast send <SOMIPaymentGuarded> "payToAccess()" --value 0.01ether --rpc-url $SOMNIA_RPC_URL --private-key $PRIVATE_KEY`
2. **On-screen:** Pause the target via GuardianHub, then call `payToAccess` again and show it reverts with `GUARDIAN_PAUSED`.
   - **Voice-over 13:** “If policy flags a risk, operators can pause via GuardianHub. The contract’s guard blocks entrypoints until conditions are safe again.”
   - Commands — type exactly (replace addresses):
     - `cast send <GuardianHub> "pauseTarget(address)" <SOMIPaymentGuarded> --rpc-url $SOMNIA_RPC_URL --private-key $PRIVATE_KEY`
     - `cast send <SOMIPaymentGuarded> "payToAccess()" --value 0.01ether --rpc-url $SOMNIA_RPC_URL --private-key $PRIVATE_KEY`

## Segment 7 – REST API & Health Check

1. **On-screen:** Open terminal and call the REST endpoints with curl. Show JSON responses.
   - **Voice-over 14:** “Every feature in the UI is mirrored by a simple REST surface. Here are the most useful ones.”
   - Commands — type exactly:
     - `curl -s http://localhost:3000/api/status | jq`
     - `curl -s http://localhost:3000/api/tenants | jq`
     - `curl -s http://localhost:3000/api/monitors | jq`
     - `curl -s -X POST http://localhost:3000/api/jobs/run-policy | jq`

## Segment 8 – Docs & Playbook

1. **On-screen:** Open `/docs` and scroll through the deployment steps, env vars, and API examples.
   - **Voice-over 15:** “The playbook covers deployment, environment setup, and all REST payloads so operators can onboard quickly and safely.”

## Segment 9 – Optional: Feed Pair Tuning

1. **On-screen:** Briefly open the Ignition deploy notes or a script where you call `configureFeed` on the router for another key like `BTC/USD`.
   - **Voice-over 16:** “You can register multiple keys on SafeOracleRouter and run separate monitors. For each, set deviation and staleness based on your risk model.”

## Segment 10 – Thank You

- **Voice-over 17:** “Thanks for watching the SentinelX demo. You’ve seen the full guardian path—deploy, monitor, evaluate, and enforce—on Somnia.”
