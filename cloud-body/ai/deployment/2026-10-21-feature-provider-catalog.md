---
phase: deployment
feature: provider-catalog
title: Cloud body provider catalog deployment
---

# Provider catalog deployment

Push the catalog and CLI to `koob4365-dev/claude-mem` main. GitHub contains no
keys. A maintainer selects one profile, reviews its plan, then adds that exact
host and secret requirement to the cloud environment draft. Environment review
and publication remain separate from the Git push.

Rollback is a normal Git revert of the provider-catalog commit. It does not
delete runtime memory or rotate credentials.
