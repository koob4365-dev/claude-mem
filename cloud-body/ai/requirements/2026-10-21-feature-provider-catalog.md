---
phase: requirements
feature: provider-catalog
title: Cloud body provider catalog requirements
---

# Provider catalog requirements

## Problem

The cloud body documents four provider families, while claude-mem already has
many OpenAI-compatible presets. A maintainer cannot see the full set, determine
which profiles are cloud-safe, or prepare an exact network and secret binding
without reading application source.

## Required behavior

- Keep provider metadata in `cloud-body/providers/catalog.json`.
- Include Claude, Codex, OpenRouter, Gemini, OpenAI, every upstream
  OpenAI-compatible preset, and one custom profile.
- Mark localhost profiles as `local-only`. Never present them as cloud-ready.
- Give each hosted profile an exact HTTPS hostname and credential variable.
- Expose a read-only CLI that lists profiles and produces a secret-free cloud
  configuration plan for one profile.
- Fail validation when the catalog drifts from the upstream preset registry.
- Keep key values, runtime memory, logs, and login state out of Git.

## Non-goals

- Do not change claude-mem provider implementations.
- Do not activate every endpoint or widen one key across several providers.
- Do not implement the external port 8000 WebSocket adapter.
- Do not claim multi-account isolation.

## Acceptance criteria

- The catalog covers every preset in `src/shared/openai-compat-presets.ts`.
- A cloud plan contains only settings, exact network hosts, and secret variable
  names. It never contains a credential value.
- Local profiles cannot produce a cloud plan.
- Tests, AI DevKit lint, typecheck, and the cloud-body doctor pass.
