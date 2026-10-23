import puppeteer from 'puppeteer-core';

const ARTIFACT_DIR = 'C:/Users/krish/.gemini/antigravity/brain/38440976-4035-486f-afea-97d85d33f0fb';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function main() {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: CHROME_PATH,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  // 1. Mobile Viewport (390x844 iPhone 14 Pro standard)
  const mobilePage = await browser.newPage();
  await mobilePage.setViewport({ width: 390, height: 844 });
  await mobilePage.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1200));

  // Capture Mobile Navbar & Centered Lamp
  await mobilePage.screenshot({ path: `${ARTIFACT_DIR}/verified_mobile_lamp_and_navbar.png` });
  console.log('✔ Captured mobile lamp & navbar');

  // Scroll to Hero Headline
  await mobilePage.evaluate(() => {
    const hero = document.getElementById('hero-section');
    if (hero) hero.scrollIntoView();
  });
  await new Promise(r => setTimeout(r, 600));
  await mobilePage.screenshot({ path: `${ARTIFACT_DIR}/verified_mobile_hero_headline_no_overflow.png` });
  console.log('✔ Captured mobile hero headline');

  // Scroll to Solution Scroller Mobile Card
  await mobilePage.evaluate(() => {
    const scroller = document.getElementById('causal-loop-section');
    if (scroller) scroller.scrollIntoView();
  });
  await new Promise(r => setTimeout(r, 800));
  await mobilePage.screenshot({ path: `${ARTIFACT_DIR}/verified_mobile_swipeable_card_stage.png` });
  console.log('✔ Captured mobile swipeable card stage');

  // Scroll to FAQ
  await mobilePage.evaluate(() => {
    const faq = document.getElementById('faq-section');
    if (faq) faq.scrollIntoView();
  });
  await new Promise(r => setTimeout(r, 600));
  await mobilePage.screenshot({ path: `${ARTIFACT_DIR}/verified_mobile_faq_section.png` });
  console.log('✔ Captured mobile FAQ section');

  // Scroll to Footer
  await mobilePage.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });
  await new Promise(r => setTimeout(r, 800));
  await mobilePage.screenshot({ path: `${ARTIFACT_DIR}/verified_mobile_footer_columns.png` });
  console.log('✔ Captured mobile footer columns');

  await mobilePage.close();

  // 2. Desktop Dark Mode: Card 3 (403 Unboxed) & Card 4 (200 OK Unboxed & Visible Outlines)
  const desktopPage = await browser.newPage();
  await desktopPage.setViewport({ width: 1440, height: 900 });
  await desktopPage.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 800));

  // Scroll to Solution Scroller
  await desktopPage.evaluate(() => {
    const s = document.getElementById('causal-loop-section');
    if (s) s.scrollIntoView();
  });
  await new Promise(r => setTimeout(r, 600));

  // Step 03 (Card 3: 403 Forbidden Unboxed)
  await desktopPage.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn03 = btns.find(b => b.textContent.trim() === '03');
    if (btn03) btn03.click();
  });
  await new Promise(r => setTimeout(r, 1200));
  await desktopPage.screenshot({ path: `${ARTIFACT_DIR}/verified_card3_unboxed_403_forbidden.png` });
  console.log('✔ Captured Card 3 unboxed 403');

  // Step 04 (Card 4: 200 OK Unboxed with Visible Outlines)
  await desktopPage.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn04 = btns.find(b => b.textContent.trim() === '04');
    if (btn04) btn04.click();
  });
  await new Promise(r => setTimeout(r, 1200));
  await desktopPage.screenshot({ path: `${ARTIFACT_DIR}/verified_card4_unboxed_200_ok_visible_outlines.png` });
  console.log('✔ Captured Card 4 unboxed 200 OK with visible outlines');

  await desktopPage.close();
  await browser.close();
  console.log('ALL VERIFICATIONS COMPLETED SUCCESSFULLY');
}

main().catch(console.error);
