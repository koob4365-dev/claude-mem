#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd -- "$script_dir/.." && pwd)"
failed=0

pass() { printf 'PASS  %s\n' "$1"; }
fail() { printf 'FAIL  %s\n' "$1" >&2; failed=1; }

[[ -x /workspace/.local/bin/bun ]] && pass "Bun is installed" || fail "Bun is missing"
[[ -x /workspace/.local/bin/claude ]] && pass "Claude Code is installed" || fail "Claude Code is missing"

if [[ -z "$(git -C "$repo_root" status --porcelain)" ]]; then
  pass "Git worktree is clean"
else
  fail "Git worktree has uncommitted changes"
fi

local_sha="$(git -C "$repo_root" rev-parse HEAD)"
remote_sha="$(git -C "$repo_root" ls-remote origin refs/heads/main | awk 'NR == 1 {print $1}')"
if [[ -n "$remote_sha" && "$local_sha" == "$remote_sha" ]]; then
  pass "GitHub main matches local HEAD ($local_sha)"
else
  fail "GitHub main does not match local HEAD"
fi

health="$(curl --silent --show-error --fail-with-body http://127.0.0.1:38000/api/health 2>/dev/null || true)"
if [[ "$health" == *'"status":"ok"'* && "$health" == *'"mcpReady":true'* ]]; then
  pass "Worker health and MCP readiness"
else
  fail "Worker health or MCP readiness"
fi

if ss -Hlt '( sport = :8000 )' 2>/dev/null | grep -q .; then
  fail "Port 8000 is bound locally; it is reserved for the external WebSocket service"
else
  pass "Port 8000 is not bound locally"
fi

if find /workspace/.runtime -type f -print -quit 2>/dev/null | grep -q .; then
  fail "Runtime files exist below /workspace/.runtime"
else
  pass "No runtime files will enter the workspace snapshot"
fi

if [[ "$failed" -ne 0 ]]; then
  exit 1
fi

