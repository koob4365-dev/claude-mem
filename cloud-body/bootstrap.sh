#!/usr/bin/env bash
set -euo pipefail
umask 077

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd -- "$script_dir/.." && pwd)"

if [[ ! -f "$repo_root/package.json" || ! -d "$repo_root/plugin" ]]; then
  echo "cloud-body: repository root could not be verified" >&2
  exit 1
fi

mkdir -p \
  /workspace/.local \
  /workspace/.cache/npm \
  /workspace/.cache/node-gyp \
  /workspace/.config \
  /workspace/.tmp/bun

npm install --global bun@1.4.3 \
  --prefix /workspace/.local \
  --cache /workspace/.cache/npm \
  --no-audit \
  --no-fund

npm install --global @anthropic-ai/claude-code@2.1.306 \
  --prefix /workspace/.local \
  --cache /workspace/.cache/npm \
  --no-audit \
  --no-fund

export PATH="/workspace/.local/bin:$PATH"
export XDG_CACHE_HOME=/workspace/.cache
export XDG_CONFIG_HOME=/workspace/.config
export npm_config_cache=/workspace/.cache/npm
export TMPDIR=/workspace/.tmp/bun

cd "$repo_root"
npm install --no-package-lock --no-audit --no-fund --cache /workspace/.cache/npm

(
  cd "$repo_root/plugin"
  bun install --frozen-lockfile --ignore-scripts
)

(
  cd "$repo_root/workers/sync-hub"
  bun install --frozen-lockfile
)

echo "cloud-body: bootstrap complete"

