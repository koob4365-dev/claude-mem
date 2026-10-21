#!/usr/bin/env node

import { readFileSync } from 'node:fs';

const catalog = JSON.parse(
  readFileSync(new URL('./catalog.json', import.meta.url), 'utf8'),
);

function fail(message, exitCode = 2) {
  process.stderr.write(`${message}\n`);
  process.exitCode = exitCode;
}

function findProfile(id) {
  return catalog.profiles.find(profile => profile.id === id);
}

function settingsFor(profile) {
  const settings = { CLAUDE_MEM_PROVIDER: profile.provider };

  if (profile.provider === 'openai-compatible') {
    settings.CLAUDE_MEM_OPENAI_COMPAT_PRESET = profile.preset ?? 'custom';
    if (profile.baseUrl) settings.CLAUDE_MEM_OPENAI_COMPAT_BASE_URL = profile.baseUrl;
    if (profile.model) settings.CLAUDE_MEM_OPENAI_COMPAT_MODEL = profile.model;
  } else if (profile.provider === 'openrouter') {
    if (profile.baseUrl) settings.CLAUDE_MEM_OPENROUTER_BASE_URL = profile.baseUrl;
    if (profile.model) settings.CLAUDE_MEM_OPENROUTER_MODEL = profile.model;
  } else if (profile.provider === 'gemini' && profile.model) {
    settings.CLAUDE_MEM_GEMINI_MODEL = profile.model;
  }

  return settings;
}

function planFor(profile) {
  if (profile.cloudPolicy === 'local-only') {
    throw new Error(`Provider profile "${profile.id}" is local-only and cannot produce a cloud plan.`);
  }
  if (profile.cloudPolicy === 'requires-endpoint') {
    throw new Error(`Provider profile "${profile.id}" requires an exact HTTPS endpoint before cloud planning.`);
  }

  if (profile.baseUrl) {
    const endpoint = new URL(profile.baseUrl);
    if (endpoint.protocol !== 'https:') {
      throw new Error(`Provider profile "${profile.id}" does not use HTTPS.`);
    }
    if (profile.allowedHost && endpoint.hostname !== profile.allowedHost) {
      throw new Error(`Provider profile "${profile.id}" has a mismatched credential host.`);
    }
  }

  const secretRequirement = profile.credentialEnv
    ? {
        name: profile.credentialEnv,
        source: 'user_provided',
        target: {
          type: 'environment_variable',
          name: profile.credentialEnv,
          allowedDomains: [profile.allowedHost],
        },
      }
    : null;

  return {
    profileId: profile.id,
    settings: settingsFor(profile),
    network: { allowedDomains: profile.allowedHost ? [profile.allowedHost] : [] },
    secretRequirement,
  };
}

function validateCatalog() {
  const ids = new Set();
  const counts = {
    profiles: catalog.profiles.length,
    cloudReady: 0,
    localOnly: 0,
    requiresEndpoint: 0,
  };

  for (const profile of catalog.profiles) {
    if (ids.has(profile.id)) throw new Error(`Duplicate provider profile: ${profile.id}`);
    ids.add(profile.id);

    if (profile.cloudPolicy === 'cloud-ready') counts.cloudReady += 1;
    else if (profile.cloudPolicy === 'local-only') counts.localOnly += 1;
    else if (profile.cloudPolicy === 'requires-endpoint') counts.requiresEndpoint += 1;
    else throw new Error(`Unknown cloud policy for provider profile "${profile.id}".`);

    if (profile.cloudPolicy === 'cloud-ready' && profile.baseUrl) {
      const endpoint = new URL(profile.baseUrl);
      if (endpoint.protocol !== 'https:') {
        throw new Error(`Cloud-ready provider profile "${profile.id}" must use HTTPS.`);
      }
      if (profile.allowedHost !== endpoint.hostname) {
        throw new Error(`Provider profile "${profile.id}" has a mismatched allowed host.`);
      }
    }

    if (profile.cloudPolicy === 'local-only') {
      const endpoint = new URL(profile.baseUrl);
      if (!['localhost', '127.0.0.1', '[::1]'].includes(endpoint.hostname)) {
        throw new Error(`Local-only provider profile "${profile.id}" is not local.`);
      }
      if (profile.allowedHost || profile.credentialEnv) {
        throw new Error(`Local-only provider profile "${profile.id}" cannot declare cloud credentials.`);
      }
    }

    if (profile.cloudPolicy === 'requires-endpoint' && (profile.baseUrl || profile.allowedHost)) {
      throw new Error(`Provider profile "${profile.id}" must wait for an exact endpoint.`);
    }
  }

  return counts;
}

function writeJson(value) {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

const [command = 'list', id] = process.argv.slice(2);

if (command === 'list') {
  for (const profile of catalog.profiles) {
    process.stdout.write(`${profile.id}\t${profile.cloudPolicy}\t${profile.label}\n`);
  }
} else if (command === 'validate') {
  try {
    writeJson(validateCatalog());
  } catch (error) {
    fail(error instanceof Error ? error.message : String(error));
  }
} else if (command === 'show' || command === 'plan') {
  const profile = findProfile(id);
  if (!profile) {
    fail(`Unknown provider profile: ${id ?? '(missing)'}`);
  } else if (command === 'show') {
    writeJson(profile);
  } else {
    try {
      writeJson(planFor(profile));
    } catch (error) {
      fail(error instanceof Error ? error.message : String(error));
    }
  }
} else {
  fail(`Unknown command: ${command}. Use list, show <id>, plan <id>, or validate.`);
}
