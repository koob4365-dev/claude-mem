---
phase: monitoring
feature: provider-catalog
title: Cloud body provider catalog monitoring
---

# Provider catalog monitoring

The catalog has no daemon and emits no telemetry. CI or a maintainer runs the
focused test after upstream preset changes. A missing, renamed, or extra preset
fails the test and names the drift. Provider availability, billing, and quota
remain the selected vendor's responsibility.
