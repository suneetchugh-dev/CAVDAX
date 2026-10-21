import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Known standard browser binary paths across Windows, macOS, and Linux
function findSystemBrowser(preferred = 'chrome') {
  const chromePaths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    path.join(process.env.LOCALAPPDATA || '', 'Google\\Chrome\\Application\\chrome.exe'),
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
  ];

  const edgePaths = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    path.join(process.env.LOCALAPPDATA || '', 'Microsoft\\Edge\\Application\\msedge.exe'),
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/usr/bin/microsoft-edge',
    '/usr/bin/microsoft-edge-stable',
  ];

  const candidatePaths = preferred === 'edge' 
    ? [...edgePaths, ...chromePaths] 
    : [...chromePaths, ...edgePaths];

  for (const p of candidatePaths) {
    if (p && fs.existsSync(p)) {
      return p;
    }
  }
  return null;
}

// Get the system's real user profile directory (where your actual everyday bookmarks & logins live)
function getSystemUserDataDir(browser = 'chrome') {
  if (process.platform === 'win32') {
    const localAppData = process.env.LOCALAPPDATA || '';
    if (browser === 'edge') {
      return path.join(localAppData, 'Microsoft\\Edge\\User Data');
    }
    return path.join(localAppData, 'Google\\Chrome\\User Data');
  }
  return null;
}

// Check if a browser is actively running on port 9222 with remote debugging
async function isRemoteDebuggingActive(port = 9222) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 600);
    const res = await fetch(`http://127.0.0.1:${port}/json/version`, { signal: controller.signal });
    clearTimeout(timeout);
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Intelligent Browser Launcher:
 * 1. Mode A: Connects to your existing active browser if started with --remote-debugging-port=9222
 * 2. Mode B: Launches browser with full Cloud Sync & Passwords enabled (no anti-sync flags!)
 */
export async function getBrowser(options = {}) {
  const debugPort = options.debugPort || 9222;
  const isDebugRunning = await isRemoteDebuggingActive(debugPort);

  if (isDebugRunning) {
    console.log(`\x1b[32m✔ [Mode A] Connecting to your existing running browser on port ${debugPort}...\x1b[0m`);
    try {
      const browser = await puppeteer.connect({
        browserURL: `http://127.0.0.1:${debugPort}`,
        defaultViewport: null,
      });
      console.log(`\x1b[36m✔ Successfully attached to your already-signed-in browser!\x1b[0m`);
      return { browser, isAttached: true };
    } catch (err) {
      console.warn(`\x1b[33m⚠ Failed to attach to port ${debugPort}, falling back to persistent profile...\x1b[0m`, err.message);
    }
  }

  const preferredBrowser = options.preferredBrowser || (process.argv.includes('--edge') || process.env.BROWSER === 'edge' ? 'edge' : 'chrome');
  const useSystemProfile = options.useSystemProfile || process.argv.includes('--system-profile') || process.env.USE_SYSTEM_PROFILE === 'true';

  let profileDir;
  if (useSystemProfile) {
    const realDir = getSystemUserDataDir(preferredBrowser);
    if (realDir && fs.existsSync(realDir)) {
      profileDir = realDir;
      console.log(`\x1b[35m★ [System Profile Mode] Using your REAL everyday ${preferredBrowser} profile at:\x1b[0m ${profileDir}`);
      console.log(`\x1b[33m  (Note: Ensure all standard ${preferredBrowser} windows are closed so the profile lock is free)\x1b[0m`);
    } else {
      profileDir = options.userDataDir || path.resolve(__dirname, '../.puppeteer-profile');
    }
  } else {
    profileDir = options.userDataDir || path.resolve(__dirname, '../.puppeteer-profile');
    if (!fs.existsSync(profileDir)) {
      fs.mkdirSync(profileDir, { recursive: true });
    }
  }

  const executablePath = options.executablePath || findSystemBrowser(preferredBrowser);
  if (!executablePath) {
    throw new Error('Could not find Google Chrome or Microsoft Edge installed on this machine.');
  }

  const browserName = executablePath.toLowerCase().includes('msedge') ? 'Microsoft Edge' : 'Google Chrome';
  console.log(`\x1b[32m✔ [Mode B] Launching ${browserName} with persistent profile at:\x1b[0m ${profileDir}`);
  console.log(`\x1b[90m  Browser executable: ${executablePath}\x1b[0m`);
  console.log(`\x1b[36m  ✔ CLOUD SYNC & OS KEYCHAIN ENABLED (Anti-sync flags stripped)\x1b[0m`);

  const browser = await puppeteer.launch({
    headless: false,
    executablePath,
    userDataDir: profileDir,
    defaultViewport: null,
    args: [
      '--start-maximized',
      '--no-default-browser-check',
      '--disable-blink-features=AutomationControlled',
      '--enable-features=NetworkService,NetworkServiceInProcess',
    ],
    // STRIP all Puppeteer defaults that disable Cloud Sync, Extensions, and Windows Credential Vault!
    ignoreDefaultArgs: [
      '--enable-automation',
      '--disable-sync',
      '--disable-extensions',
      '--disable-default-apps',
      '--disable-component-extensions-with-background-pages',
      '--password-store=basic',
      '--use-mock-keychain',
    ],
  });

  return { browser, isAttached: false };
}

/**
 * Open target URL in the browser
 */
export async function openApp(targetUrl = 'http://localhost:5173', options = {}) {
  const { browser, isAttached } = await getBrowser(options);
  
  let page;
  const pages = await browser.pages();
  if (pages.length > 0) {
    const existingTargetPage = pages.find(p => p.url().includes('localhost:5173') || p.url().includes(targetUrl));
    if (existingTargetPage) {
      page = existingTargetPage;
      await page.bringToFront();
      console.log(`\x1b[36m✔ Navigated to existing open tab: ${page.url()}\x1b[0m`);
    } else {
      page = pages[0];
      await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
      await page.bringToFront();
    }
  } else {
    page = await browser.newPage();
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
  }

  console.log(`\x1b[32m✔ App loaded at: ${targetUrl}\x1b[0m`);
  return { browser, page, isAttached };
}

// Auto-run if executed directly via `node scripts/browser-runner.js [url]`
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const urlArg = process.argv.find(arg => arg.startsWith('http')) || 'http://localhost:5173';
  openApp(urlArg).then(({ browser }) => {
    console.log('\x1b[32m✔ Browser is actively open on your screen! (Close browser window to exit)\x1b[0m');
    browser.on('disconnected', () => {
      console.log('Browser closed by user. Exiting.');
      process.exit(0);
    });
  }).catch(err => {
    console.error('\x1b[31m✖ Error launching browser:\x1b[0m', err);
    process.exit(1);
  });
}
