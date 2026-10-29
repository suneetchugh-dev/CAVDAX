/**
 * CAVDAX Architectural Invalidation Alert Dispatcher (Resend API)
 *
 * Dispatches high-priority, actionable causal divergence alerts when an
 * architecture decision is invalidated by a superseding ADR, breaking commit,
 * or concurrent lock race.
 *
 * Implements:
 *   - Native fetch to Resend REST API (zero npm bloat)
 *   - Sliding-window alert debouncer (prevents spam on rapid git pushes)
 *   - Monochromatic, developer-console HTML aesthetic
 *   - Actionable causal provenance & 1-click remediation links
 */

const RESEND_ENDPOINT = 'https://api.resend.com/emails';
const DEBOUNCE_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

// In-memory rate limiting map: `${recipient}:${decisionId}` -> timestamp
const alertDebounceMap = new Map();

/**
 * Clean up stale debounce entries periodically (unref so process can exit cleanly).
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamp] of alertDebounceMap.entries()) {
    if (now - timestamp > DEBOUNCE_WINDOW_MS) {
      alertDebounceMap.delete(key);
    }
  }
}, 60 * 1000).unref();

/**
 * Builds the monochromatic developer email template.
 */

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildEmailHtml({
  repo,
  decisionId,
  decisionTitle,
  breakingSourceId,
  breakingSourceTitle,
  violationPaths = [],
  hudUrl,
  remediationCli
}) {
  const formattedViolationPath = violationPaths && violationPaths.length > 0
    ? (Array.isArray(violationPaths[0]) ? violationPaths[0].join(' ➔ ') : String(violationPaths[0]))
    : `Decision:${decisionId} ➔ Fact:Stale ➔ Source:${breakingSourceId}`;

  const resolvedHudUrl = hudUrl || 'https://cavdax.sahnirmaan.live';
  const resolvedCli = remediationCli || `npx cavdax mcp -> revalidate_decision("${breakingSourceId}", "${decisionId}")`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CAVDAX Architectural Divergence Alert</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #06080B;
      color: #E2E8F0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
    }
    .container {
      max-width: 620px;
      margin: 32px auto;
      background-color: #0B0E14;
      border: 1px solid #1E2533;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 12px 36px rgba(0, 0, 0, 0.45);
    }
    .header {
      padding: 24px 28px;
      border-bottom: 1px solid #1E2533;
      background: linear-gradient(180deg, #10141D 0%, #0B0E14 100%);
    }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      background-color: rgba(239, 68, 68, 0.12);
      color: #EF4444;
      border: 1px solid rgba(239, 68, 68, 0.28);
      margin-bottom: 12px;
    }
    .title {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: #FFFFFF;
      letter-spacing: -0.02em;
    }
    .subtitle {
      margin: 6px 0 0 0;
      font-size: 13px;
      color: #94A3B8;
    }
    .body {
      padding: 28px;
    }
    .meta-box {
      background-color: #0E121B;
      border: 1px solid #1A2232;
      border-radius: 8px;
      padding: 18px;
      margin-bottom: 24px;
    }
    .meta-row {
      display: flex;
      margin-bottom: 10px;
      font-size: 13px;
      line-height: 1.5;
    }
    .meta-row:last-child {
      margin-bottom: 0;
    }
    .meta-label {
      width: 130px;
      color: #64748B;
      font-weight: 500;
      text-transform: uppercase;
      font-size: 11px;
      letter-spacing: 0.05em;
    }
    .meta-value {
      flex: 1;
      color: #F1F5F9;
      font-weight: 500;
    }
    .highlight-red {
      color: #F87171;
      font-weight: 600;
    }
    .code-block {
      background-color: #040608;
      border: 1px solid #1E2533;
      border-radius: 6px;
      padding: 14px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 12px;
      color: #38BDF8;
      overflow-x: auto;
      white-space: pre-wrap;
      word-break: break-all;
      margin: 16px 0 24px 0;
    }
    .section-title {
      font-size: 12px;
      font-weight: 700;
      color: #94A3B8;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin: 20px 0 8px 0;
    }
    .cta-button {
      display: inline-block;
      width: 100%;
      text-align: center;
      box-sizing: border-box;
      padding: 12px 20px;
      background-color: #D9A353;
      color: #0B0E14;
      font-weight: 600;
      font-size: 14px;
      text-decoration: none;
      border-radius: 6px;
      transition: background-color 0.15s ease;
    }
    .footer {
      padding: 20px 28px;
      border-top: 1px solid #1E2533;
      background-color: #080A0F;
      font-size: 11px;
      color: #475569;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="badge">Gate Refusal Alert</div>
      <h1 class="title">Architectural Divergence Detected</h1>
      <p class="subtitle">An incoming change has superseded an architecture decision in <strong>${safeRepo}</strong>.</p>
    </div>
    <div class="body">
      <div class="meta-box">
        <div class="meta-row">
          <span class="meta-label">Repository:</span>
          <span class="meta-value">${safeRepo}</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">Broken Decision:</span>
          <span class="meta-value highlight-red">${safeDecisionId} — ${safeDecisionTitle}</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">Superseded By:</span>
          <span class="meta-value">${safeBreakingSourceId} — ${safeBreakingSourceTitle}</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">Gate Verdict:</span>
          <span class="meta-value highlight-red">BLOCKED_SUPERSEDED_SOURCE</span>
        </div>
      </div>

      <div class="section-title">Causal Invalidation Traversal</div>
      <div class="code-block">${safeViolationPath}</div>

      <div class="section-title">Remediation Directive (MCP / CLI)</div>
      <div class="code-block">${safeCli}</div>

      <p style="font-size: 13px; color: #94A3B8; line-height: 1.5; margin-bottom: 20px;">
        AI coding agents attempting to write code grounded in <code>${decisionId}</code> are now <strong>hard-rejected</strong> by the CAVDAX Causal Gate until revalidated against <code>${breakingSourceId}</code>.
      </p>

      <a href="${resolvedHudUrl}" class="cta-button" target="_blank" rel="noopener noreferrer">
        Inspect Blast Radius in CAVDAX HUD ➔
      </a>
    </div>
    <div class="footer">
      This notification was dispatched automatically by CAVDAX Causal GraphBLAS Engine for <strong>${repo}</strong>.<br>
      To modify alert thresholds or unsubscribe, update Notification Preferences in your CAVDAX developer settings.
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Dispatches an architectural invalidation alert email via Resend REST API.
 *
 * @param {object} params
 * @param {string} params.to                  - Recipient email address
 * @param {string} params.repo                - Repository identifier (e.g. 'owner/repo')
 * @param {string} params.decisionId          - Impacted Decision ID (e.g. 'DEC-102')
 * @param {string} [params.decisionTitle]     - Decision title
 * @param {string} params.breakingSourceId    - Superseding Source ID (e.g. 'ADR-002')
 * @param {string} [params.breakingSourceTitle] - Source title
 * @param {Array}  [params.violationPaths]    - Graph nodes in violation path
 * @param {string} [params.hudUrl]            - Direct deep link to CAVDAX UI
 * @param {string} [params.remediationCli]    - Recommended CLI command
 * @param {boolean} [params.force=false]      - Bypass debounce window (used for interactive demo triggers)
 * @returns {Promise<{ success: boolean, id?: string, debounced?: boolean, error?: string }>}
 */
export async function sendInvalidationEmail({
  to,
  repo = 'connected-repo',
  decisionId = 'DEC-102',
  decisionTitle = 'Generate Checkout Service with TokenAuth v1',
  breakingSourceId = 'ADR-002',
  breakingSourceTitle = 'Mandatory Migration to OAuth2; TokenAuth v1 Decommissioned',
  violationPaths = [],
  hudUrl,
  remediationCli,
  force = false
}) {
  if (!to || typeof to !== 'string' || !to.includes('@')) {
    console.warn(`[CAVDAX Email] Skipping invalid recipient email: '${to}'`);
    return { success: false, error: 'INVALID_RECIPIENT' };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const isEnabled = process.env.EMAIL_ENABLED === 'true';
  const from = process.env.EMAIL_FROM || 'Sahnirmaan <no-reply@sahnirmaan.live>';

  if (!isEnabled || !apiKey) {
    console.log(`[CAVDAX Email] Email alerts disabled or missing RESEND_API_KEY (EMAIL_ENABLED=${isEnabled})`);
    return { success: false, error: 'EMAIL_DISABLED_OR_NO_KEY' };
  }

  // Check alert debouncer
  const debounceKey = `${to.toLowerCase().trim()}:${decisionId}`;
  const now = Date.now();
  if (!force && alertDebounceMap.has(debounceKey)) {
    const elapsed = now - alertDebounceMap.get(debounceKey);
    if (elapsed < DEBOUNCE_WINDOW_MS) {
      console.log(`[CAVDAX Email] Alert for ${debounceKey} debounced (${Math.round(elapsed / 1000)}s since last alert)`);
      return { success: true, debounced: true };
    }
  }

  alertDebounceMap.set(debounceKey, now);

  const subject = `⛔ [CAVDAX] Divergence Alert: ${decisionId} superseded in ${repo}`;
  const html = buildEmailHtml({
    repo,
    decisionId,
    decisionTitle,
    breakingSourceId,
    breakingSourceTitle,
    violationPaths,
    hudUrl,
    remediationCli
  });

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        html
      })
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('[CAVDAX Email] Resend API error response:', data);
      return { success: false, error: data.message || 'RESEND_DISPATCH_FAILED' };
    }

    console.log(`[CAVDAX Email] ✅ Alert email sent to ${to} for ${decisionId} (Resend ID: ${data.id})`);
    return { success: true, id: data.id };
  } catch (err) {
    console.error('[CAVDAX Email] Network failure sending email:', err.message);
    return { success: false, error: err.message };
  }
}
