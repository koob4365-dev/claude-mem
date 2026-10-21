---
phase: implementation
feature: provider-catalog
title: Cloud body provider catalog implementation
---

# Provider catalog implementation

## Status

The catalog and CLI are implemented. TDD recorded two red-green cycles: the
missing catalog, then the missing plan and validation commands.

## Changed files

- `cloud-body/providers/catalog.json`
- `cloud-body/providers/providerctl.mjs`
- `cloud-body/tests/provider-catalog.test.mjs`
- `cloud-body/README.md`

## Behavior

- `list` prints all profiles and their cloud policy.
- `show <id>` prints one profile as JSON.
- `plan <id>` prints a secret-free cloud configuration plan.
- `validate` checks unique IDs, policies, HTTPS endpoints, exact hostname
  matches, and local-only credential isolation.

The implementation uses Node built-ins and performs no network or secret-store
access.

The shipped catalog has 22 profiles: 18 cloud-ready, three local-only, and one
that waits for an exact custom endpoint. Role allocation stays separate from
provider selection. The current interactive Codex session holds the temporary
coordinator lease; no provider becomes the permanent identity.

## Rules

- Use Node built-ins only.
- Keep commands read-only.
- Write JSON to stdout and diagnostics to stderr.
- Never inspect or print credential values.
