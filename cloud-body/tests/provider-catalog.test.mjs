import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const testsDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(testsDir, '..', '..');
const catalogPath = join(repoRoot, 'cloud-body', 'providers', 'catalog.json');
const presetSourcePath = join(repoRoot, 'src', 'shared', 'openai-compat-presets.ts');
const providerctlPath = join(repoRoot, 'cloud-body', 'providers', 'providerctl.mjs');

function readCatalog() {
  return JSON.parse(readFileSync(catalogPath, 'utf8'));
}

test('catalog covers every upstream OpenAI-compatible preset', () => {
  const source = readFileSync(presetSourcePath, 'utf8');
  const upstreamPresetIds = [...source.matchAll(/\bid:\s*'([^']+)'/g)]
    .map(match => match[1])
    .sort();
  const catalogPresetIds = readCatalog().profiles
    .filter(profile => typeof profile.preset === 'string')
    .map(profile => profile.preset)
    .sort();

  assert.deepEqual(catalogPresetIds, upstreamPresetIds);
});

function providerctl(...args) {
  return spawnSync(process.execPath, [providerctlPath, ...args], {
    cwd: repoRoot,
    encoding: 'utf8',
  });
}

test('hosted profile plan scopes one secret to its exact provider host', () => {
  const result = providerctl('plan', 'deepseek');

  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), {
    profileId: 'deepseek',
    settings: {
      CLAUDE_MEM_PROVIDER: 'openai-compatible',
      CLAUDE_MEM_OPENAI_COMPAT_PRESET: 'deepseek',
      CLAUDE_MEM_OPENAI_COMPAT_BASE_URL: 'https://api.deepseek.com/v1',
      CLAUDE_MEM_OPENAI_COMPAT_MODEL: 'deepseek-chat',
    },
    network: { allowedDomains: ['api.deepseek.com'] },
    secretRequirement: {
      name: 'CLAUDE_MEM_OPENAI_COMPAT_API_KEY',
      source: 'user_provided',
      target: {
        type: 'environment_variable',
        name: 'CLAUDE_MEM_OPENAI_COMPAT_API_KEY',
        allowedDomains: ['api.deepseek.com'],
      },
    },
  });
});

test('local-only profile cannot produce a cloud plan', () => {
  const result = providerctl('plan', 'vllm');

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /local-only/);
});

test('unknown profile fails without falling back to a different provider', () => {
  const result = providerctl('plan', 'not-a-provider');

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Unknown provider profile/);
});

test('catalog validation reports the complete cloud policy split', () => {
  const result = providerctl('validate');

  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), {
    profiles: 22,
    cloudReady: 18,
    localOnly: 3,
    requiresEndpoint: 1,
  });
});
