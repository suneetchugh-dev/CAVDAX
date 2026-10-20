#!/usr/bin/env node

/**
 * CAVDAX Universal CLI Entrypoint
 * Supports:
 *   npx cavdax mcp         -> Launches stdio MCP server for Cursor / Claude
 *   npx cavdax ingest      -> Ingests local ADRs and git history into FalkorDB
 *   npx cavdax check       -> Validates staged files against causal graph
 *   npx cavdax doctor      -> Runs connectivity and health checks
 */

import { Command } from 'commander';
import { startStdioServer } from '../src/stdioServer.js';
import { runIngest } from '../src/ingestCommand.js';
import { runCheck } from '../src/checkCommand.js';
import { runDoctor } from '../src/doctorCommand.js';

const program = new Command();

program
  .name('cavdax')
  .description('CAVDAX: Causal Invalidation & Enclosed MCP Execution Gate for AI Coding Agents')
  .version('1.0.0');

program
  .command('mcp', { isDefault: true })
  .description('Start the Model Context Protocol (MCP) stdio server for Claude Code and Cursor')
  .action(async () => {
    await startStdioServer();
  });

program
  .command('ingest')
  .description('Scan and ingest local Architecture Decision Records (.adr/ or docs/adr/) into FalkorDB')
  .option('-r, --repo <path>', 'Repository root path', process.cwd())
  .option('-h, --host <host>', 'FalkorDB host', process.env.FALKORDB_HOST || 'localhost')
  .option('-p, --port <port>', 'FalkorDB port', process.env.FALKORDB_PORT || '6379')
  .action(async (options) => {
    await runIngest(options);
  });

program
  .command('check')
  .description('Verify staged files or PR commits against the FalkorDB causal dependency graph')
  .option('-s, --staged', 'Check currently staged git files')
  .option('--pr <number>', 'GitHub Pull Request number (for CI environments)')
  .action(async (options) => {
    const success = await runCheck(options);
    process.exit(success ? 0 : 1);
  });

program
  .command('doctor')
  .description('Diagnose FalkorDB connectivity, GraphBLAS matrix health, and MCP readiness')
  .action(async () => {
    await runDoctor();
  });

program.parse(process.argv);
