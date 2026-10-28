#!/usr/bin/env node
/**
 * CAVDAX MCP Stdio Gateway (Compatibility Adapter)
 *
 * Forwards directly to the hardened, multi-tool MCP stdio server in
 * apps/mcp-server/src/stdioServer.js. Fail-closed by default:
 * zero fake latency fallbacks, zero blind approvals for offline nodes.
 */

import { startStdioServer, TOOLS } from '../../apps/mcp-server/src/stdioServer.js';

export { TOOLS };

// When executed directly as a process (e.g. `node core/mcp/stdio.js`)
if (process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('core/mcp/stdio.js')) {
  await startStdioServer();
}
