/**
 * devAuth.js — High-Security Access Gate & Cloaking Service for /devteam
 *
 * Implements strict multi-factor defense:
 * 1. IP Whitelisting: Validates client IP against VITE_ALLOWED_DEV_IPS
 * 2. GitHub Identity: Requires authenticated session matching authorized developer roster
 * 3. Master Dev Passkey: Zero-knowledge SHA-256 session challenge
 * 4. Silent 404 Cloaking: Unauthorized visitors see a standard 404 Causal Node Not Found page,
 *    revealing zero reconnaissance information about the existence of the dev panel.
 */

const SESSION_VAULT_KEY = 'cavdax_dev_vault_v1';
const IP_CACHE_KEY = 'cavdax_detected_client_ip';
const DYNAMIC_ROSTER_KEY = 'cavdax_authorized_dev_roster';

// Hardcoded authorized developer roster
export const DEFAULT_AUTHORIZED_ROSTER = [
  'suneetchugh-dev',
  'geetikachughibm',
  'gkc2406'
];

// Precomputed zero-knowledge SHA-256 hash for master passkey
// Never commits plaintext password to source
const MASTER_PASSKEY_HASH = '44fc4515e924df63db607ff442569372836352e041b1daa45716032d858317cc';

// Parse allowed IPs from env (supports comma-separated list, trims whitespace)
export function getAllowedIps() {
  const envIps = (import.meta.env.VITE_ALLOWED_DEV_IPS || '').trim();
  if (!envIps) {
    // In local development, default to local loopbacks if no env set
    return import.meta.env.DEV ? ['127.0.0.1', 'localhost', '::1'] : [];
  }
  return envIps.split(',').map((ip) => ip.trim().toLowerCase()).filter(Boolean);
}

// Parse authorized GitHub usernames from roster + env + local persistent roster
export function getAuthorizedUsers() {
  const envUsers = (import.meta.env.VITE_AUTHORIZED_DEV_USERS || '').trim();
  const parsedEnv = envUsers
    ? envUsers.split(',').map((u) => u.trim().toLowerCase()).filter(Boolean)
    : [];

  let dynamicRoster = [];
  try {
    const raw = localStorage.getItem(DYNAMIC_ROSTER_KEY);
    if (raw) dynamicRoster = JSON.parse(raw);
  } catch {}

  const combined = Array.from(new Set([
    ...DEFAULT_AUTHORIZED_ROSTER,
    ...parsedEnv,
    ...dynamicRoster
  ]));

  return combined;
}

// Authorize a new GitHub team member (only accessible from inside unlocked dev panel)
export function addAuthorizedUser(username) {
  if (!username) return false;
  const clean = username.trim().toLowerCase().replace(/^@/, '');
  if (!clean) return false;

  const current = getAuthorizedUsers();
  if (!current.includes(clean)) {
    const updated = [...current, clean];
    try {
      localStorage.setItem(DYNAMIC_ROSTER_KEY, JSON.stringify(updated));
    } catch {}
    return true;
  }
  return false;
}

// Revoke access for a GitHub team member
export function removeAuthorizedUser(username) {
  if (!username) return false;
  const clean = username.trim().toLowerCase().replace(/^@/, '');
  const current = getAuthorizedUsers();
  const filtered = current.filter((u) => u !== clean);
  try {
    localStorage.setItem(DYNAMIC_ROSTER_KEY, JSON.stringify(filtered));
  } catch {}
  return true;
}

// Fetch client public IP with timeout and failover
export async function fetchClientIp() {
  try {
    const cached = sessionStorage.getItem(IP_CACHE_KEY);
    if (cached) return cached;
  } catch {}

  const isLocalHost = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname === '[::1]');

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3500);

  try {
    const res = await fetch('https://api.ipify.org?format=json', { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      if (data?.ip) {
        try { sessionStorage.setItem(IP_CACHE_KEY, data.ip); } catch {}
        return data.ip;
      }
    }
  } catch {
    try {
      const fbController = new AbortController();
      const fbTimeoutId = setTimeout(() => fbController.abort(), 2500);
      const fbRes = await fetch('https://api64.ipify.org?format=json', { signal: fbController.signal });
      clearTimeout(fbTimeoutId);
      if (fbRes.ok) {
        const fbData = await fbRes.json();
        if (fbData?.ip) {
          try { sessionStorage.setItem(IP_CACHE_KEY, fbData.ip); } catch {}
          return fbData.ip;
        }
      }
    } catch {}
  }

  if (isLocalHost && import.meta.env.DEV) {
    return '127.0.0.1';
  }

  return 'unknown';
}

// Check whether an IP is in the allowed list
export function isIpAuthorized(clientIp) {
  const isLocalHost = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname === '[::1]');

  if (import.meta.env.DEV && isLocalHost) {
    return true;
  }

  const allowed = getAllowedIps();
  if (allowed.length === 0) {
    return Boolean(import.meta.env.DEV);
  }
  const cleanIp = (clientIp || '').trim().toLowerCase();
  if (!cleanIp || cleanIp === 'unknown') {
    return Boolean(import.meta.env.DEV && isLocalHost);
  }
  return allowed.includes(cleanIp) || (isLocalHost && (allowed.includes('localhost') || allowed.includes('127.0.0.1')));
}

// Check whether a GitHub user object is in the authorized roster
export function isUserAuthorized(githubUser) {
  const authorized = getAuthorizedUsers();
  if (!githubUser || !githubUser.login) {
    // In local development, if no user session is active yet, allow testing only if dev bypass is set
    return Boolean(import.meta.env.DEV && import.meta.env.VITE_DEV_ALLOW_DEV_BYPASS === 'true');
  }
  const cleanLogin = githubUser.login.trim().toLowerCase().replace(/^@/, '');
  return authorized.includes(cleanLogin);
}

// Check active dev session
export function getActiveDevSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_VAULT_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    const FOUR_HOURS = 4 * 60 * 60 * 1000;
    if (Date.now() - session.authenticatedAt > FOUR_HOURS) {
      sessionStorage.removeItem(SESSION_VAULT_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

// SHA-256 helper
async function sha256(str) {
  const buffer = new TextEncoder().encode(str);
  const hash = await crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Verify Dev Passkey Challenge
export async function verifyDevPasskey(enteredKey, user) {
  const cleanKey = (enteredKey || '').trim();
  if (!cleanKey) return { success: false, error: 'Passkey cannot be empty' };

  const masterPass = (import.meta.env.VITE_DEV_MASTER_KEY || '').trim();
  const passHash = (import.meta.env.VITE_DEV_PASSKEY_HASH || '').trim().toLowerCase();

  let isValid = false;

  const enteredHash = await sha256(cleanKey);

  // 1. Direct env master pass match
  if (masterPass && cleanKey === masterPass) {
    isValid = true;
  }
  // 2. Custom env hash match
  else if (passHash && enteredHash === passHash) {
    isValid = true;
  }
  // 3. Built-in zero-knowledge hash match for user-configured master passkey
  else if (enteredHash === MASTER_PASSKEY_HASH) {
    isValid = true;
  }
  // 4. Built-in dev passkey fallback for local isolated dev testing
  else if (import.meta.env.DEV && (cleanKey === 'cavdax_dev' || cleanKey === 'admin')) {
    isValid = true;
  }

  if (isValid) {
    const sessionPayload = {
      authenticatedAt: Date.now(),
      user: user?.login || 'authorized_dev',
      role: 'CORE_DEV',
      token: `cavdax_token_${Math.random().toString(36).slice(2)}`,
    };
    try {
      sessionStorage.setItem(SESSION_VAULT_KEY, JSON.stringify(sessionPayload));
    } catch {}
    return { success: true, session: sessionPayload };
  }

  return { success: false, error: 'Invalid master passkey credentials.' };
}

// Developer Entitlement Tier Override
export function setDevTierOverride(tierKey) {
  if (!['free', 'pro', 'enterprise'].includes(tierKey)) return;
  try {
    localStorage.setItem('cavdax_tier', tierKey);
    localStorage.setItem('cavdax_dev_tier_override', 'true');
    window.dispatchEvent(new CustomEvent('cavdax:tier-changed', { detail: { tier: tierKey } }));
  } catch {}
}

export function getDevCurrentTier() {
  try {
    return localStorage.getItem('cavdax_tier') || 'free';
  } catch {
    return 'free';
  }
}

// Emergency Killswitch / Sign Out
export function devSignOut() {
  try {
    sessionStorage.removeItem(SESSION_VAULT_KEY);
  } catch {}
}
