#!/usr/bin/env node
/**
 * CAVDAX Visual Regression Test — Console Acts & Graph Layout
 *
 * Tests two specific fixes:
 *   Fix A — AgentAction nodes stay inside SVG viewBox (no overflow past Y=440)
 *   Fix B — Direct click on Act 3/4 still yields correct graph state (Act 2 auto-runs)
 *
 * Requires: puppeteer  (npm install -D puppeteer)
 * Usage:    node benchmark/visual-test-console.js [--url http://localhost:5173]
 *
 * Outputs: benchmark/screenshots/  — one PNG per act
 *          Console pass/fail summary per assertion
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── Config ──────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const urlFlag = args.indexOf('--url');
const BASE_URL = urlFlag !== -1 ? args[urlFlag + 1] : 'http://localhost:5173';
const CONSOLE_URL = `${BASE_URL}/console`;
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');

// SVG viewBox dimensions — must match GraphCanvas.jsx
const VIEWBOX_WIDTH  = 880;
const VIEWBOX_HEIGHT = 440;
// AgentAction column X — must match ACTION_X in GraphCanvas.jsx
const EXPECTED_ACTION_X = 740;

// ─── Helpers ─────────────────────────────────────────────────────────────────
let passed = 0;
let failed = 0;

function assert(condition, label) {
  if (condition) {
    console.log(`  ✅  PASS  ${label}`);
    passed++;
  } else {
    console.error(`  ❌  FAIL  ${label}`);
    failed++;
  }
}

async function waitAndClick(page, selector, timeout = 8000) {
  await page.waitForSelector(selector, { timeout });
  await page.click(selector);
}

async function screenshot(page, name) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  const file = path.join(SCREENSHOT_DIR, `${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  console.log(`  📷  Saved: ${file}`);
}

// ─── Graph node position extractor ───────────────────────────────────────────
// Reads the SVG transform="translate(x, y)" of all .graph-node <g> elements
async function getNodePositions(page) {
  return page.evaluate(() => {
    const nodes = document.querySelectorAll('g.graph-node');
    const positions = [];
    nodes.forEach(g => {
      const transform = g.getAttribute('transform') || '';
      const match = transform.match(/translate\(([^,]+),\s*([^)]+)\)/);
      if (match) {
        positions.push({ x: parseFloat(match[1]), y: parseFloat(match[2]) });
      }
    });
    return positions;
  });
}

// ─── Act button selector ──────────────────────────────────────────────────────
// StoryStepper renders 4 buttons in the story-stepper-shell container
function actButtonSelector(actNumber) {
  // nth-of-type is 1-based; StoryStepper renders buttons in a grid
  return `.story-stepper-shell button:nth-of-type(${actNumber})`;
}

// ─── Test runner ─────────────────────────────────────────────────────────────
async function run() {
  console.log(`\nCAVDAX Visual Test — Console Acts & Graph Layout`);
  console.log(`Target: ${CONSOLE_URL}\n`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    // ── Navigate to /console ────────────────────────────────────────────────
    console.log('► Navigating to /console...');
    await page.goto(CONSOLE_URL, { waitUntil: 'networkidle2', timeout: 20000 });
    await screenshot(page, 'act1-baseline');

    // ── ACT I — Baseline State ───────────────────────────────────────────────
    console.log('\n[Act I — Baseline]');
    const basePositions = await getNodePositions(page);
    assert(basePositions.length >= 5, `Baseline: at least 5 nodes rendered (got ${basePositions.length})`);
    assert(
      basePositions.every(p => p.y <= VIEWBOX_HEIGHT + 10),
      `Baseline: all nodes within viewBox height ${VIEWBOX_HEIGHT} (max Y = ${Math.max(...basePositions.map(p => p.y)).toFixed(0)})`
    );

    // ── ACT II — Ingest ──────────────────────────────────────────────────────
    console.log('\n[Act II — Ingest Commit Mutation]');
    await waitAndClick(page, actButtonSelector(2));
    // Wait for graph to update (SSE or direct response)
    await page.waitForTimeout(3500);
    await screenshot(page, 'act2-ingest');

    const act2Positions = await getNodePositions(page);
    assert(
      act2Positions.every(p => p.y <= VIEWBOX_HEIGHT + 10),
      `Act II: all nodes within viewBox height (max Y = ${Math.max(...act2Positions.map(p => p.y)).toFixed(0)})`
    );

    // Check that ADR-001 SUPERSEDED node exists (graph state changed)
    const act2NodeText = await page.evaluate(() =>
      [...document.querySelectorAll('g.graph-node text')].map(t => t.textContent).join(' ')
    );
    assert(act2NodeText.includes('SUPERSEDED'), 'Act II: SUPERSEDED badge visible on graph');

    // ── ACT III — Direct click (Fix B test: skipping Act II from reset state) ─
    console.log('\n[Fix B Test — Act III direct click from Act I (reset first)]');
    // Reset to Act I
    await waitAndClick(page, '[title="Reset Demo"]');
    await page.waitForTimeout(2000);

    // NOW directly click Act III without going through Act II
    console.log('  Clicking Act III directly from Act I baseline...');
    await waitAndClick(page, actButtonSelector(3));
    await page.waitForTimeout(5000); // Act II + Act III both run sequentially
    await screenshot(page, 'act3-direct-skip');

    const act3Positions = await getNodePositions(page);

    // Fix B assertion: graph should show SUPERSEDED (Act 2 ran silently)
    const act3NodeText = await page.evaluate(() =>
      [...document.querySelectorAll('g.graph-node text')].map(t => t.textContent).join(' ')
    );
    assert(act3NodeText.includes('SUPERSEDED'), 'Fix B: Act III direct click — ADR-001 shows SUPERSEDED (Act II auto-ran)');
    assert(act3NodeText.includes('BLOCKED') || act3NodeText.includes('INVALIDATED'), 'Fix B: Act III direct click — DEC-102 shows INVALIDATED/BLOCKED state');

    // Fix A assertion: AgentAction nodes still inside viewBox
    const actionNodes = act3Positions.filter(p => p.x >= EXPECTED_ACTION_X - 20);
    assert(actionNodes.length >= 1, `Fix A: At least 1 AgentAction node rendered at x≈${EXPECTED_ACTION_X}`);
    assert(
      actionNodes.every(p => p.y >= 0 && p.y <= VIEWBOX_HEIGHT + 10),
      `Fix A: AgentAction nodes within viewBox height (max Y = ${actionNodes.length ? Math.max(...actionNodes.map(p => p.y)).toFixed(0) : 'N/A'})`
    );

    // ── ACT IV — Full run with multiple AgentAction nodes ────────────────────
    console.log('\n[Act IV — Revalidation & Multiple AgentAction nodes]');
    await waitAndClick(page, actButtonSelector(4));
    await page.waitForTimeout(5000);
    await screenshot(page, 'act4-approved');

    const act4Positions = await getNodePositions(page);
    const act4ActionNodes = act4Positions.filter(p => p.x >= EXPECTED_ACTION_X - 20);

    assert(
      act4ActionNodes.length >= 2,
      `Fix A: After Act IV, at least 2 AgentAction nodes present (got ${act4ActionNodes.length})`
    );
    assert(
      act4ActionNodes.every(p => p.y >= 0 && p.y <= VIEWBOX_HEIGHT + 10),
      `Fix A: All AgentAction nodes within viewBox height after Act IV (max Y = ${act4ActionNodes.length ? Math.max(...act4ActionNodes.map(p => p.y)).toFixed(0) : 'N/A'})`
    );

    const act4NodeText = await page.evaluate(() =>
      [...document.querySelectorAll('g.graph-node text')].map(t => t.textContent).join(' ')
    );
    assert(act4NodeText.includes('APPROVED') || act4NodeText.includes('EXECUTED'), 'Act IV: APPROVED/EXECUTED badge visible');

  } finally {
    await browser.close();
  }

  // ── Summary ──────────────────────────────────────────────────────────────
  console.log(`\n${'─'.repeat(50)}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    console.error(`\n⚠  Some assertions failed. Check screenshots in benchmark/screenshots/`);
    process.exit(1);
  } else {
    console.log(`\n✅  All assertions passed.`);
  }
}

run().catch(err => {
  console.error('Visual test runner crashed:', err.message);
  process.exit(1);
});
