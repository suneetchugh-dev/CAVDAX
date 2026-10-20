# @cavdax/mcp-server

> **CAVDAX** — Contextual Action & Verified Decision Autonomous eXecution  
> Enclosed MCP Server backed by FalkorDB GraphBLAS

Blocks AI coding agents from writing code grounded in stale or superseded Architecture Decisions. Implements the [Model Context Protocol](https://spec.modelcontextprotocol.io) `2024-11-05` over stdio for zero-config integration with Cursor, Claude Code, and Claude Desktop.

---

## Quick Start

### Cursor (project-level `.cursor/mcp.json`)

```json
{
  "mcpServers": {
    "cavdax": {
      "command": "npx",
      "args": ["-y", "@cavdax/mcp-server"]
    }
  }
}
```

### Claude Code CLI

```bash
claude mcp add cavdax npx -y @cavdax/mcp-server
```

### Claude Desktop (`claude_desktop_config.json`)

```json
{
  "mcpServers": {
    "cavdax": {
      "command": "npx",
      "args": ["-y", "@cavdax/mcp-server"]
    }
  }
}
```

### Hosted Enterprise SSE (Cursor / any SSE-capable client)

```json
{
  "mcpServers": {
    "cavdax-cloud": {
      "url": "https://cavdax.sahnirmaan.live/api/mcp/sse",
      "transport": "sse"
    }
  }
}
```

---

## CLI Commands

```bash
npx @cavdax/mcp-server              # Start MCP stdio server (default)
npx cavdax mcp                      # Start MCP stdio server (explicit)
npx cavdax ingest --repo .          # Ingest ADRs from current repo into FalkorDB
npx cavdax check --staged           # Validate staged files (git pre-commit hook)
npx cavdax check --pr 42            # Validate PR #42 changed files (CI)
npx cavdax doctor                   # Diagnose FalkorDB & MCP readiness
```

---

## MCP Tools Exposed

| Tool | Description |
|------|-------------|
| `apply_code_change` | Writes a file only if the referenced `decision_id` is causally valid. Hard-rejects stale decisions. |
| `revalidate_decision` | Archives an invalidated decision and creates a new one grounded in a superseding ADR. |
| `query_causal_graph` | Inspects the live FalkorDB graph to check node statuses and dependency paths. |

---

## FalkorDB Setup (Local)

```bash
docker run -d --name falkordb -p 6379:6379 falkordb/falkordb:latest
```

Without FalkorDB, the server runs in **simulation mode** — `DEC-102` is treated as stale, all other decision IDs pass.

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `FALKORDB_HOST` | `localhost` | FalkorDB server host |
| `FALKORDB_PORT` | `6379` | FalkorDB server port |

---

## License

GPL-3.0 — © CAVDAX Team
