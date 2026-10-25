/**
 * CAVDAX Enclosed MCP (Model Context Protocol) Server
 * Encloses the apply_code_change tool with an internal FalkorDB Cypher verification check.
 * An autonomous agent cannot skip the gate because it is the only execution path to write code.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { verifyActionGate, revalidateDecision } from '../graph/queries.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../../');

export class CavdaxMcpServer {
  constructor(graph) {
    this.graph = graph;
  }

  /**
   * Returns tool schemas exposed to AI coding agents (Claude Code / Cursor)
   */
  getTools() {
    return [
      {
        name: 'apply_code_change',
        description: 'Applies a verified code modification to a target file. Protected by the CAVDAX FalkorDB Gate. The decision_id must have a fresh, un-superseded provenance path.',
        parameters: {
          type: 'object',
          properties: {
            decision_id: {
              type: 'string',
              description: 'The ID of the Architecture Decision (e.g. DEC-102 or DEC-103) justifying this change.'
            },
            file_path: {
              type: 'string',
              description: 'The relative or absolute path of the target file to create or modify.'
            },
            code_payload: {
              type: 'string',
              description: 'The full code content or patch to write.'
            },
            reasoning: {
              type: 'string',
              description: 'Brief explanation of why this code change is being made.'
            }
          },
          required: ['decision_id', 'file_path', 'code_payload']
        }
      },
      {
        name: 'revalidate_decision',
        description: 'Act IV Revalidation: Synthesizes a new Decision replacing an invalidated one, grounded in a fresh superseding source.',
        parameters: {
          type: 'object',
          properties: {
            new_source_id: { type: 'string', description: 'ID of the fresh superseding source (e.g. ADR-002)' },
            old_decision_id: { type: 'string', description: 'ID of the invalidated decision being replaced (e.g. DEC-102)' },
            new_decision_id: { type: 'string', description: 'ID for the new decision (e.g. DEC-103)' },
            new_fact_id: { type: 'string', description: 'ID of the active fact supporting this decision (e.g. F-OAuth2)' },
            title: { type: 'string', description: 'Directive title for the new decision' }
          },
          required: ['new_source_id', 'old_decision_id', 'new_decision_id', 'new_fact_id', 'title']
        }
      }
    ];
  }

  /**
   * Handles tool execution calls from the agent
   */
  async handleToolCall(toolName, args) {
    console.log(`[MCP Gate] Received tool call: '${toolName}' with decision: '${args.decision_id || args.new_decision_id}'`);

    if (toolName === 'apply_code_change') {
      return await this.executeApplyCodeChange(args);
    } else if (toolName === 'revalidate_decision') {
      return await this.executeRevalidateDecision(args);
    } else {
      throw new Error(`Unknown tool: '${toolName}'`);
    }
  }

  /**
   * Enclosed Execution Wrapper for apply_code_change
   */
  async executeApplyCodeChange({ decision_id, file_path, code_payload, reasoning }) {
    console.log(`[MCP Gate] 🛡️ Intercepting apply_code_change for '${file_path}'...`);
    console.log(`[MCP Gate] Running Query 1 against FalkorDB on '${decision_id}'...`);

    // 1. RUN INTERNAL FALKORDB VERIFICATION
    const checkResult = await verifyActionGate(this.graph, decision_id);

    // 2. ENFORCEMENT BRANCH A: HARD REJECT
    if (!checkResult.is_approved) {
      console.warn(`[MCP Gate] ⛔ GATE REFUSAL: Action BLOCKED! Verdict: ${checkResult.gate_verdict}`);
      console.warn(`[MCP Gate] Violation path:`, checkResult.violation_paths);

      // Log the blocked attempt in FalkorDB audit trail
      try {
        const actionId = `act-${Date.now()}`;
        await this.graph.query(`
          MATCH (d:Decision {id: $decisionId})
          CREATE (a:AgentAction {
            id: $actionId,
            target_file: $targetFile,
            status: $status,
            timestamp: timestamp()
          })
          CREATE (a)-[:GROUNDED_IN]->(d)
        `, {
          params: {
            decisionId: decision_id,
            actionId,
            targetFile: file_path,
            status: checkResult.gate_verdict || "BLOCKED_SUPERSEDED_SOURCE"
          }
        });
      } catch (auditErr) {
        console.error(`[MCP Gate] Warning: Failed to log blocked audit node:`, auditErr.message);
      }

      // Return structured MCP error payload back to agent (zero files written!)
      return {
        isError: true,
        gate_verdict: checkResult.gate_verdict,
        decision_id,
        latency_ms: checkResult.latency_ms,
        violation_paths: checkResult.violation_paths,
        message: `⛔ CAVDAX GATE BLOCKED: Execution rejected. Decision '${decision_id}' status is '${checkResult.gate_verdict}'. A supporting fact or source was superseded. Revalidation is required before code can be written.`,
        instructions_for_agent: `To resolve this, inspect the superseding source, create an updated decision via 'revalidate_decision', and re-submit your change.`
      };
    }

    // 3. ENFORCEMENT BRANCH B: APPROVED (WRITE TO DISK)
    console.log(`[MCP Gate] ✅ GATE APPROVED: Causal provenance verified in ${checkResult.latency_ms}ms.`);

    // Security Confinement: Prevent path traversal (OWASP A01/A03 Hardening)
    const resolvedRepo = path.resolve(REPO_ROOT);
    const resolvedPath = path.resolve(resolvedRepo, file_path);
    if (!resolvedPath.startsWith(resolvedRepo + path.sep) && resolvedPath !== resolvedRepo) {
      console.warn(`[MCP Gate] ⛔ PATH TRAVERSAL ATTEMPT BLOCKED: '${file_path}' attempts to escape repo root.`);
      return {
        isError: true,
        gate_verdict: 'BLOCKED_PATH_TRAVERSAL',
        decision_id,
        error: 'Access denied: Target file path must reside within the repository root.'
      };
    }

    const dir = path.dirname(resolvedPath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(resolvedPath, code_payload, 'utf-8');
    console.log(`[MCP Gate] Successfully written verified code to: ${resolvedPath}`);

    // Log the successful execution in FalkorDB audit trail
    try {
      const actionId = `act-${Date.now()}`;
      await this.graph.query(`
        MATCH (d:Decision {id: $decisionId})
        CREATE (a:AgentAction {
          id: $actionId,
          target_file: $targetFile,
          status: 'EXECUTED',
          timestamp: timestamp()
        })
        CREATE (a)-[:GROUNDED_IN]->(d)
      `, { params: { decisionId: decision_id, actionId, targetFile: file_path } });
    } catch (auditErr) {
      console.error(`[MCP Gate] Warning: Failed to log audit node:`, auditErr.message);
    }

    return {
      isError: false,
      gate_verdict: 'APPROVED',
      decision_id,
      latency_ms: checkResult.latency_ms,
      file_path: resolvedPath,
      message: `✅ CAVDAX GATE APPROVED: Full causal provenance verified. File '${file_path}' successfully written to disk.`
    };
  }

  /**
   * Act IV Revalidation Handler
   */
  async executeRevalidateDecision(args) {
    console.log(`[MCP Gate] 🔄 Executing Act IV Revalidation: Replacing '${args.old_decision_id}' with '${args.new_decision_id}'...`);
    const result = await revalidateDecision(this.graph, {
      newSourceId: args.new_source_id,
      oldDecisionId: args.old_decision_id,
      newDecisionId: args.new_decision_id,
      newFactId: args.new_fact_id,
      title: args.title
    });

    return {
      isError: false,
      message: `✅ REVALIDATION COMPLETE: Decision '${args.new_decision_id}' is now ACTIVE and replaces '${args.old_decision_id}'. Gate is now open for updated code execution.`,
      result
    };
  }
}
