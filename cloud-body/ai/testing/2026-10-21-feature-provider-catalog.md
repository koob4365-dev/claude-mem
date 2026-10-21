---
phase: testing
feature: provider-catalog
title: Cloud body provider catalog testing
---

# Provider catalog testing

## Planned checks

- [x] Catalog preset IDs match the upstream registry.
- [x] Hosted endpoints use HTTPS and exact matching hostnames.
- [x] Local profiles are marked `local-only`.
- [x] A hosted provider plan contains settings and secret metadata only.
- [x] Local and unknown profiles fail with a non-zero exit code.
- [x] No key-shaped value appears in the changed cloud-body files.
- [x] AI DevKit feature lint passes with 15 checks and one intentional no-worktree warning.
- [x] Existing typecheck and 37 bundle/version tests pass.
- [ ] Run doctor after the commit so its clean-worktree and remote-SHA checks are meaningful.

## Fresh evidence

- `node --test cloud-body/tests/provider-catalog.test.mjs`: 5 passed, 0 failed.
- `node cloud-body/providers/providerctl.mjs validate`: 22 profiles split
  18 cloud-ready, 3 local-only, 1 requires-endpoint.
- `npx ai-devkit@latest lint --feature provider-catalog`: 15 checks passed.
- `npm run typecheck`: exit 0.
- Bun bundle/version suite: 37 passed, 0 failed.
