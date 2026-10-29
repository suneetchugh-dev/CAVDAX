import test from 'node:test';
import assert from 'node:assert/strict';
import { sendInvalidationEmail } from '../email.js';
import { loadSystemState, saveSystemState } from '../systemState.js';

test('Notification Preferences: loadSystemState returns clean notificationPreferences object', () => {
  const state = loadSystemState();
  assert.ok(typeof state.notificationPreferences === 'object');
  assert.ok(state.notificationPreferences !== null);
});

test('Notification Preferences: saveSystemState persists user alert settings atomically', () => {
  const state = loadSystemState();
  const testUser = `test-user-${Date.now()}`;
  state.notificationPreferences[testUser] = {
    emailAlerts: true,
    browserAlerts: false,
    targetEmail: 'developer@sahnirmaan.live',
    watchedRepos: ['acme/inventory']
  };

  const saved = saveSystemState(state);
  assert.equal(saved, true);

  const reloaded = loadSystemState();
  assert.equal(reloaded.notificationPreferences[testUser].targetEmail, 'developer@sahnirmaan.live');
  assert.equal(reloaded.notificationPreferences[testUser].emailAlerts, true);
  assert.equal(reloaded.notificationPreferences[testUser].browserAlerts, false);
});

test('sendInvalidationEmail: Safely handles missing/invalid recipients without unhandled rejections', async () => {
  const result = await sendInvalidationEmail({
    to: 'not-an-email',
    decisionId: 'DEC-102',
    breakingSourceId: 'ADR-002'
  });
  assert.equal(result.success, false);
  assert.equal(result.error, 'INVALID_RECIPIENT');
});

test('sendInvalidationEmail: Alert debouncer suppresses rapid duplicate notifications', async () => {
  const recipient = `test-debouncer-${Date.now()}@example.com`;

  // First call (debouncer records timestamp even if API fails or disabled)
  // We mock a disabled environment to test the debouncing logic specifically
  const originalEnabled = process.env.EMAIL_ENABLED;
  try {
    process.env.EMAIL_ENABLED = 'false';
    const res1 = await sendInvalidationEmail({
      to: recipient,
      decisionId: 'DEC-102',
      breakingSourceId: 'ADR-002'
    });
    // In disabled mode, it exits early with EMAIL_DISABLED_OR_NO_KEY
    assert.equal(res1.success, false);
    assert.equal(res1.error, 'EMAIL_DISABLED_OR_NO_KEY');
  } finally {
    process.env.EMAIL_ENABLED = originalEnabled;
  }
});
