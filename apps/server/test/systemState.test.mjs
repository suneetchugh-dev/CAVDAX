import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadSystemState, saveSystemState } from '../systemState.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const STATE_FILE = path.join(DATA_DIR, 'system_state.json');

test('systemState: loadSystemState returns clean defaults on initial call', () => {
  const state = loadSystemState();
  assert.equal(typeof state.hackathonMode, 'boolean');
  assert.ok(Array.isArray(state.whitelistedIps));
  assert.ok(Array.isArray(state.devRoster));
  assert.ok(Array.isArray(state.apiKeys));
  assert.ok(Array.isArray(state.auditEntries));
});

test('systemState: saveSystemState atomically persists state to disk and reloads accurately', () => {
  const mockState = {
    hackathonMode: true,
    whitelistedIps: ['192.168.1.100', '10.0.0.1'],
    devRoster: ['test-architect', 'evaluator-judge'],
    apiKeys: [
      { keyHash: 'hash_abc123', userId: '12345', login: 'test-architect', tier: 'enterprise' }
    ],
    auditEntries: [
      { action_id: 'act-001', repo: 'test/repo', status: 'APPROVED', target_file: 'src/app.js', executed_at: Date.now() }
    ]
  };

  const saved = saveSystemState(mockState);
  assert.equal(saved, true);
  assert.ok(fs.existsSync(STATE_FILE));

  const loaded = loadSystemState();
  assert.equal(loaded.hackathonMode, true);
  assert.deepEqual(loaded.whitelistedIps, ['192.168.1.100', '10.0.0.1']);
  assert.deepEqual(loaded.devRoster, ['test-architect', 'evaluator-judge']);
  assert.equal(loaded.apiKeys.length, 1);
  assert.equal(loaded.apiKeys[0].login, 'test-architect');
  assert.equal(loaded.auditEntries.length, 1);
  assert.equal(loaded.auditEntries[0].repo, 'test/repo');

  // Clean up test file so it does not pollute git index or runtime
  try {
    fs.unlinkSync(STATE_FILE);
  } catch {}
});
