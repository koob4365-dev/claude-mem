# Claude cloud body

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

Claude login remains the safe default. The worker also supports:

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

