# Eidolon Concord 1

**Eidolon Concord 1** is the English project name for "鬼神同行1". One task
identity can move among several AI bodies. Any node may hold the temporary lead,
but no node is the whole identity.

This directory describes the reproducible cloud execution body for this fork.
It is deliberately separate from claude-mem's application source: no runtime
memory, credentials, login state, or generated logs belong in Git.

## What lives where

- GitHub holds the source revision, these reproducible setup scripts, and
  secret-free provider examples.
- The cloud environment runs the Linux worker and keeps transient state below
  `/tmp`.
- Windows 11 is a thin client through WSL2. It does not host or copy the memory
  database.
- Port `38000` is the loopback-only claude-mem control plane.
- Port `8000` is reserved for the user's cloud-reachable WebSocket service. This
  repository does not bind it locally and does not claim a WebSocket adapter
  exists yet.

The cloud body itself is not downloaded to Windows. A checkout downloads only
source and declared dependencies. Pinning a Git commit makes a rebuilt body
repeatable; it does not clone credentials, databases, or live processes.

## Identity and roles

The provider is not the identity and does not permanently own a role. The
continuous identity is the task state, memory, permissions, and accepted commit
history. Leadership is a short-lived lease for one stage of work.

| Role | Default candidates | Rule |
| --- | --- | --- |
| Coordinator | Current interactive Codex session | Routes work and holds the temporary task lease; it is not a permanent head |
| Builder | Codex or Claude Code | Receives repository write access for one bounded change |
| Researcher | OpenAI, Gemini, or an approved search service | Reads external material and does not mutate the repository |
| Observer | Fast OpenAI-compatible, OpenRouter, Gemini, or Claude model | Compresses observations and does not decide releases |
| Reviewer | A provider or session independent from the builder | Tests the result and cannot reuse the builder's approval |
| Private executor | An allowlisted custom gateway | Handles data that policy forbids sending to a public endpoint |

Routing uses privacy, tools, latency, context, cost, and independent-review
requirements. It does not assign one vendor a permanent personality.

## Bootstrap and start

From the repository root:

```bash
bash cloud-body/bootstrap.sh
bash cloud-body/start.sh
bash cloud-body/doctor.sh
```

The bootstrap script pins Bun and Claude Code and follows the repository's
existing lockfiles. It intentionally does not create a root `package-lock.json`.

## Providers

Claude login remains the safe default. The machine-readable catalog currently
contains 22 profiles. It covers Claude, Codex, OpenAI, OpenRouter, Gemini,
NVIDIA NIM, OrcaRouter, API Route, Opper, Atlas Cloud, DeepSeek, OpenCode Go,
OpenCode Zen, Groq, Together AI, both MiniMax regions, iFlytek, Ollama, LM
Studio, vLLM, and a custom OpenAI-compatible gateway.

Inspect it without reading or writing any key:

```bash
node cloud-body/providers/providerctl.mjs list
node cloud-body/providers/providerctl.mjs show openai
node cloud-body/providers/providerctl.mjs plan deepseek
node cloud-body/providers/providerctl.mjs validate
```

`plan` emits settings, the exact network hostname, and the required secret
variable name. It never reads a credential value. Localhost profiles cannot
produce a cloud plan, so the vLLM preset cannot take over the user's external
port 8000 by accident.

The underlying worker routes are:

| Route | Provider value | Credential |
| --- | --- | --- |
| Claude Code / Anthropic | `claude` | Claude login or `ANTHROPIC_API_KEY` |
| Codex app-server | `codex` | Existing Codex login; no OpenAI API key |
| OpenAI API | `openai-compatible` | `CLAUDE_MEM_OPENAI_COMPAT_API_KEY` |
| Any OpenAI-compatible gateway | `openai-compatible` | Key issued by that gateway |
| OpenRouter | `openrouter` | `CLAUDE_MEM_OPENROUTER_API_KEY` |
| Gemini | `gemini` | `CLAUDE_MEM_GEMINI_API_KEY` |

OpenAI uses the project's generic Chat Completions-compatible route:

```text
CLAUDE_MEM_PROVIDER=openai-compatible
CLAUDE_MEM_OPENAI_COMPAT_PRESET=custom
CLAUDE_MEM_OPENAI_COMPAT_BASE_URL=https://api.openai.com/v1
CLAUDE_MEM_OPENAI_COMPAT_MODEL=<a chat-completions model available to the account>
```

For a custom provider, replace the base URL and model. Add that exact hostname
to the cloud environment's network allowlist before supplying its key. Do not
use wildcard credential destinations.

Copy `.env.example` only into a private runtime location outside the checkout.
Enter keys through cloud environment Secrets, never in this directory, a URL,
an issue, a pull request, or a chat message.

## Windows 11 choice

Use WSL2 with Ubuntu 24.04 as the thin client. See
[`windows/README.md`](windows/README.md). Native Windows remains optional, but
it is not the reference path because the cloud body and project scripts are
Linux/Bash-first.

## Current boundaries

- The worker HTTP/SSE service is single-user and loopback-only.
- A real `wss://...:8000/...` adapter still needs an explicit endpoint and
  server-side tenant/profile isolation.
- Provider keys are selectable, but concurrent multi-account isolation is not
  yet a safe assumption.
- Publishing the cloud environment is separate from pushing this directory to
  GitHub. Git records the recipe; environment publication snapshots the built
  machine.

