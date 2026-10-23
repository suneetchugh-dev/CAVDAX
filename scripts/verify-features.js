import { openApp } from './browser-runner.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ARTIFACT_DIR = 'C:/Users/krish/.gemini/antigravity/brain/38440976-4035-486f-afea-97d85d33f0fb';

async function main() {
  console.log('--- Launching browser verification ---');
  const { browser, page } = await openApp('http://localhost:5173/devteam');

  // Dismiss splash loader & set authorized dev session
  await page.setViewport({ width: 1440, height: 900 });
  await new Promise((r) => setTimeout(r, 800));
  await page.keyboard.press('Space');
  await page.mouse.click(100, 100);

  // Set authorized GitHub user session
  await page.evaluate(() => {
    localStorage.setItem('cavdax_user_session', JSON.stringify({
      username: 'krishna',
      role: 'Core Architect',
      authenticated: true,
      timestamp: Date.now()
    }));
  });

  // Reload /devteam with authorized session
  console.log('\n[1/4] Reloading http://localhost:5173/devteam with authorized session...');
  await page.goto('http://localhost:5173/devteam', { waitUntil: 'networkidle2' });
  await page.keyboard.press('Space');
  await new Promise((r) => setTimeout(r, 1200));

  // Take screenshot of locked passkey challenge HUD
  await page.screenshot({ path: `${ARTIFACT_DIR}/verified_devteam_locked_gate.png` });
  console.log('✔ Captured locked gate screenshot');

  // Unlock passkey challenge
  console.log('\n[2/4] Entering master passkey to unlock /devteam...');
  const passInput = await page.$('input[type="password"]');
  if (passInput) {
    await passInput.type('cavdax_dev');
    await page.click('button[type="submit"]');
    await new Promise((r) => setTimeout(r, 1200));
  }
  await page.screenshot({ path: `${ARTIFACT_DIR}/verified_devteam_unlocked_dashboard.png` });
  console.log('✔ Captured unlocked dashboard screenshot');

  // Switch tabs in Dev Panel to Scenarios and Security
  const securityTab = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find((el) => el.textContent.includes('Security & Roster'));
    if (b) { b.click(); return true; }
    return false;
  });
  if (securityTab) {
    await new Promise((r) => setTimeout(r, 600));
    await page.screenshot({ path: `${ARTIFACT_DIR}/verified_devteam_security_roster.png` });
    console.log('✔ Captured security roster screenshot');
  }

  // Test 3: Card 4 in Causal Solution Scroller
  console.log('\n[3/4] Navigating to http://localhost:5173/overview to check Card 4 (Continuous Revalidation Loop)...');
  await page.goto('http://localhost:5173/overview', { waitUntil: 'networkidle2' });
  await page.keyboard.press('Space');
  await new Promise((r) => setTimeout(r, 1200));

  // Scroll to continuous revalidation section and click tab '04'
  await page.evaluate(() => {
    const el = document.getElementById('causal-loop-section');
    if (el) el.scrollIntoView({ behavior: 'instant' });
    else window.scrollTo(0, 3600);
  });
  await new Promise((r) => setTimeout(r, 800));

  // Click tab button 04
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn04 = btns.find((b) => b.textContent.trim() === '04');
    if (btn04) btn04.click();
  });
  await new Promise((r) => setTimeout(r, 1500));

  await page.screenshot({ path: `${ARTIFACT_DIR}/verified_causal_solution_card4_monochrome.png` });
  console.log('✔ Captured Card 4 screenshot');

  await browser.close();
  console.log('\nAll verifications completed successfully!');
}

main().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
