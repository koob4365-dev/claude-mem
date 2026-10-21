#!/usr/bin/env bash
set -euo pipefail
umask 077

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd -- "$script_dir/.." && pwd)"

export PATH="/workspace/.local/bin:$PATH"
export XDG_CACHE_HOME=/workspace/.cache
export XDG_CONFIG_HOME=/workspace/.config
export npm_config_cache=/workspace/.cache/npm
export TMPDIR=/workspace/.tmp/bun
export CLAUDE_MEM_DATA_DIR=/tmp/claude-mem-runtime
export CLAUDE_CONFIG_DIR=/tmp/claude-config
export CLAUDE_MEM_WORKER_PORT=38000
export CLAUDE_CODE_PATH=/workspace/.local/bin/claude
export DO_NOT_TRACK=1
export CLAUDE_MEM_TELEMETRY=0
export CLAUDE_MEM_TELEMETRY_ERRORS=0
export CLAUDE_MEM_REDACT_ENABLED=true
export CLAUDE_MEM_REDACT_GENERIC_ENABLED=true
export CLAUDE_MEM_REDACT_LOG_MATCHES=false

mkdir -p "$CLAUDE_MEM_DATA_DIR" "$CLAUDE_CONFIG_DIR" "$TMPDIR"

if find /workspace/.runtime -type f -print -quit 2>/dev/null | grep -q .; then
  echo "cloud-body: refusing to start with runtime files below /workspace/.runtime" >&2
  exit 1
fi

cd "$repo_root"
bun plugin/scripts/worker-service.cjs start
curl --silent --show-error --fail-with-body \
  http://127.0.0.1:38000/api/health
printf '\ncloud-body: worker ready on the internal control plane\n'

