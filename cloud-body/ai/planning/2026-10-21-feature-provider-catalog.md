---
phase: planning
feature: provider-catalog
title: Cloud body provider catalog plan
---

# Provider catalog plan

## Task queue

- [x] Initialize AI DevKit under `cloud-body/ai/`.
- [x] Record requirements and design decisions.
- [x] Add a failing public-behavior test for coverage and plan safety.
- [x] Implement the catalog and read-only CLI.
- [x] Update cloud-body usage documentation.
- [x] Run feature lint, focused tests, typecheck, and secret scan.
- [x] Prepare one verified commit for GitHub main.

## Dependencies

The upstream preset registry is the source for supported preset IDs. The cloud
catalog adds deployment policy but does not replace that registry.

## Risks

- Upstream adds a preset without a cloud profile. The drift test fails.
- A custom endpoint has no known host. Planning stays blocked until supplied.
- One credential gets scoped to several vendors. The plan schema prevents this
  by allowing one credential host per selected profile.
