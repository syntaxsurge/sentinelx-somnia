# SentinelX Convex Workspace

This directory defines Convex tables for SentinelX observability. The schema
captures:

- **tenants** – onboarding records for teams running SentinelX guardians.
- **monitors** – configuration for each protected contract (or pair) including
  oracle sources and thresholds.
- **incidents** – policy decisions, pause/unpause executions, and oracle health
  snapshots.
- **apiKeys** – hashed API keys for external integrations (webhooks,
  dashboards).

Additional query and mutation functions will be implemented in future days of
the sprint.
