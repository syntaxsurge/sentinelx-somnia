# SentinelX Demo Video Script

7–8 minute walkthrough highlighting the production SentinelX guardian stack. Each beat pairs on-screen actions with voice-over.

---

## Segment 1 – Landing + Value Prop

1. **On-screen:** Start on `/` and sweep across the hero headline, Wallet/Docs CTAs, and the three highlight cards.
   - **Voice-over 1:** “SentinelX hardens Somnia dApps with a dual-oracle circuit breaker. SafeOracleRouter cross-checks Protofire and DIA, while GuardianHub enforces pauses so protocols fail safe.”
2. **On-screen:** Scroll to the architecture cards that outline Next.js, RainbowKit SIWE, and Somnia integration.
   - **Voice-over 2:** “The stack runs on Next.js 15 with shadcn/ui, RainbowKit authentication, and Convex for observability. Everything you see in the UI is also exposed over REST for automation.”

## Segment 2 – Connect & Workspace Onboarding

1. **On-screen:** Tap the Connect button in the header, pick a wallet, and sign the RainbowKit SIWE prompt.
   - **Voice-over 3:** “Authentication uses RainbowKit’s custom SIWE adapter. The modal handles wallet connect, nonce fetch, message signing, and iron-session cookies.”
2. **On-screen:** Automatically land on the onboarding card; enter the workspace name and submit.
   - **Voice-over 4:** “Each tenant maps to your Somnia address. Let’s name this workspace `Somnia Index Vaults` so every operator knows what they’re protecting.”

## Segment 3 – Dashboard Overview

1. **On-screen:** Show the refreshed `/dashboard` view with KPI cards, Monitors table, workspace card, and incident timeline.
   - **Voice-over 5:** “The operations view gives us KPIs, a monitors table, workspace metadata, and a live incident timeline. Everything is responsive and dark-mode ready.”
2. **On-screen:** Point to KPI cards (Active monitors, Attention required, Unique guardians, Recent incidents).
   - **Voice-over 6:** “KPIs summarize monitors, highlight attention-needed statuses, count unique GuardianHub operators, and show the ten most recent incidents.”

## Segment 4 – Register a Monitor

1. **On-screen:** Navigate to `/monitors/new`, paste contract, guardian, router, and accept the ETH/USD defaults. Submit the form.
   - **Voice-over 7:** “Registering a monitor wires the guardable contract, GuardianHub, and SafeOracleRouter with a chosen oracle key. Defaults include Protofire and DIA addresses on Somnia Shannon.”
2. **On-screen:** After redirect, open `/monitors` to show the registry table with the new entry.
   - **Voice-over 8:** “The registry lists every monitor with status, contract, guardian, and when it was added. From here you can jump into incident detail.”

## Segment 5 – Incident Triage

1. **On-screen:** Back on `/dashboard`, click `Run policy`. Show the toast, then the incident timeline updating.
   - **Voice-over 9:** “Manual runs hit `/api/jobs/run-policy`. It calls SafeOracleRouter.latest, evaluates deviation and freshness, updates monitor status, and appends an incident record.”
2. **On-screen:** Click into the monitor detail (`/monitors/[id]`) and scroll through the Incident Timeline cards.
   - **Voice-over 10:** “Each incident spells out Safe vs Unsafe, whether both feeds were fresh, timestamp, summary, and a deep link to the Somnia explorer.”

## Segment 6 – Settings & Automation Prep

1. **On-screen:** Open `/settings`; in Automation enter `policy-runner-prod`, click “Generate API key”, copy the plaintext value, and show it listed with hash + revoke button.
   - **Voice-over 11:** “Settings issues scoped automation credentials—labels map to audit trails, plaintext shows once, and revocation keeps Convex hashes clean.”
2. **On-screen:** In Incident webhooks, add a Slack webhook URL, optional secret, show the saved card, and remove it.
   - **Voice-over 12:** “Wire Slack, Discord, or HTTP webhooks. Secrets let downstream services validate each incident payload.”
3. **On-screen:** In Guardian operators, add a wallet + role, reveal the roster table, and remove an entry.
   - **Voice-over 13:** “Track GuardianHub signers with notes so you always know who can pause or unpause contracts.”
4. **On-screen:** Return to `/dashboard` and highlight the workspace card linking to docs.
   - **Voice-over 14:** “Everything routes back to the playbook—deployment checklists, cron setup, and REST payloads for integrating SentinelX into ops pipelines.”

## Segment 7 – Docs & REST Surface

1. **On-screen:** Visit `/docs`, tab through Contracts, Deploy, and Policy Agent panels.
   - **Voice-over 15:** “The docs page distills the guardian flow: Ignition deploys on Somnia, environment variables, policy runner cron, and express REST examples.”
2. **On-screen:** Run terminal commands calling `curl /api/status` and `curl /api/jobs/run-policy`.
   - **Voice-over 16:** “Every dashboard action mirrors a REST endpoint. Automation can read status, list monitors, and trigger policy runs without touching the UI.”

## Segment 8 – Closing

- **On-screen:** Return to the dashboard hero shot with KPI cards and incident timeline in view.
- **Voice-over 17:** “That’s SentinelX: authenticate, create a tenant, register monitors, evaluate policy, and enforce guardian actions—all on Somnia Shannon Testnet.”
