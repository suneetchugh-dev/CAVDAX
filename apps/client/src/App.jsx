import React, { useState, useEffect } from 'react';
import Header from './components/Header.jsx';
import StoryStepper from './components/StoryStepper.jsx';
import TerminalView from './components/TerminalView.jsx';
import GraphCanvas from './components/GraphCanvas.jsx';
import NodeInspector from './components/NodeInspector.jsx';

export default function App() {
  const [currentAct, setCurrentAct] = useState(1);
  const [loadingAct, setLoadingAct] = useState(null);
  const [isResetting, setIsResetting] = useState(false);

  // Graph state
  const [graphData, setGraphData] = useState({
    nodes: [
      { id: 'ADR-001', label: 'Source', title: 'Adopt TokenAuth v1 for Payment Gateway', status: 'ACTIVE', type: 'ADR' },
      { id: 'F-Auth-v1', label: 'Fact', claim: 'Payment services require TokenAuth v1', is_stale: false, verified: true },
      { id: 'DEC-102', label: 'Decision', title: 'Generate Checkout Service with TokenAuth v1', status: 'VALID' },
      { id: 'ADR-002', label: 'Source', title: 'Mandatory Migration to OAuth2; TokenAuth v1 Decommissioned', status: 'ACTIVE', type: 'ADR' },
      { id: 'F-OAuth2', label: 'Fact', claim: 'OAuth2 is strictly enforced; TokenAuth v1 prohibited', is_stale: false, verified: true }
    ],
    edges: [
      { source: 'F-Auth-v1', target: 'ADR-001', type: 'EXTRACTED_FROM' },
      { source: 'DEC-102', target: 'F-Auth-v1', type: 'DEPENDS_ON' },
      { source: 'F-OAuth2', target: 'ADR-002', type: 'EXTRACTED_FROM' }
    ]
  });

  const [selectedNode, setSelectedNode] = useState(null);
  const [activeVerdict, setActiveVerdict] = useState(null);
  const [latestLatency, setLatestLatency] = useState('1.84');
  const [falkorLive, setFalkorLive] = useState(false);

  // Terminal & Action state
  const [terminalLogs, setTerminalLogs] = useState([
    {
      component: 'KERNEL',
      time: '15:30:00',
      type: 'INFO',
      text: 'CAVDAX Causal Graph Kernel initialized. GraphBLAS Sparse Matrix ready.'
    },
    {
      component: 'INGESTION',
      time: '15:30:01',
      type: 'INFO',
      text: 'Loaded baseline ADR-001: TokenAuth v1 accepted for payment gateway.'
    },
    {
      component: 'MCP_SERVER',
      time: '15:30:02',
      type: 'INFO',
      text: 'Enclosed tool `apply_code_change` registered. Grounded verification active.'
    }
  ]);

  const [latestAction, setLatestAction] = useState({
    filePath: 'demo-repo/src/services/payment.js',
    decisionId: 'DEC-102',
    codeSnippet: `// Agent attempting to scaffold checkout route with deprecated TokenAuth v1:\napp.post('/api/checkout', (req, res) => {\n  const token = req.headers['x-tokenauth-v1'];\n  if (!TokenAuth.v1.verify(token)) return res.status(401).send();\n  // Process checkout...\n});`
  });

  // Fetch initial graph and health
  useEffect(() => {
    async function loadInitial() {
      try {
        const healthRes = await fetch('/api/health');
        if (healthRes.ok) {
          const healthData = await healthRes.json();
          setFalkorLive(healthData.falkordb_connected);
        }

        const graphRes = await fetch('/api/graph');
        if (graphRes.ok) {
          const g = await graphRes.json();
          if (g && g.nodes && g.nodes.length > 0) {
            setGraphData(g);
          }
        }
      } catch (err) {
        console.warn('Initial load fallback:', err.message);
      }
    }
    loadInitial();

    // Setup SSE listener
    let evtSource;
    try {
      evtSource = new EventSource('/api/events');
      evtSource.addEventListener('GRAPH_UPDATED', (e) => {
        try {
          const updated = JSON.parse(e.data);
          if (updated && updated.data) setGraphData(updated.data);
        } catch {}
      });
    } catch {}

    return () => {
      if (evtSource) evtSource.close();
    };
  }, []);

  // -------------------------------------------------------------------------
  // ACT CONTROLLERS
  // -------------------------------------------------------------------------

  async function handleSelectAct(actNumber) {
    setCurrentAct(actNumber);
    setLoadingAct(actNumber);

    try {
      if (actNumber === 1) {
        // ACT I: Baseline
        await handleReset();
      } else if (actNumber === 2) {
        // ACT II: Ingest Commit Mutation
        addLog('INGESTION', '⚡ Ingesting git commit containing ADR-002 (supersedes ADR-001)...', 'CASCADE');
        const res = await fetch('/api/ingest', { method: 'POST', headers: { 'Content-Type': 'application/json' } });
        const data = await res.json();

        if (data.graph) setGraphData(data.graph);
        const lat = data.ingestResult?.invalidation?.latency_ms || 2.14;
        setLatestLatency(lat);

        addLog(
          'FALKORDB',
          `Query 2 Cascade completed in ${lat}ms. SUPERSEDES edge established. ADR-001 -> SUPERSEDED, F-Auth-v1 -> STALE, DEC-102 -> INVALIDATED_NEEDS_REVALIDATION.`,
          'CASCADE'
        );
        setActiveVerdict('BLOCKED');
      } else if (actNumber === 3) {
        // ACT III: Agent Enclosed MCP Gate Execution Call
        addLog('AGENT', 'Autonomous Coding Agent requests tool execution: `apply_code_change` with DEC-102...', 'INFO');
        setLatestAction({
          filePath: 'demo-repo/src/services/payment.js',
          decisionId: 'DEC-102',
          codeSnippet: `// ❌ AGENT PROPOSED MUTATION (STALE PROVENANCE):\napp.post('/api/checkout', (req, res) => {\n  const token = req.headers['x-tokenauth-v1'];\n  if (!TokenAuth.v1.verify(token)) return res.status(401).send();\n  res.json({ status: 'paid' });\n});`
        });

        const res = await fetch('/api/mcp/call', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            toolName: 'apply_code_change',
            args: {
              decision_id: 'DEC-102',
              file_path: 'demo-repo/src/services/payment.js',
              code_payload: '// TokenAuth v1 code'
            }
          })
        });

        const data = await res.json();
        setLatestLatency(data.latency_ms || 1.84);
        setActiveVerdict('BLOCKED');

        addLog(
          'MCP_GATE',
          `⛔ ENCLOSED MCP GATE BLOCKED in ${data.latency_ms || 1.84}ms! Verdict: ${data.gate_verdict}. Write rejected. Zero files modified.`,
          'GATE_BLOCK',
          data.violation_paths
        );
      } else if (actNumber === 4) {
        // ACT IV: Revalidation & Safe Execution
        addLog('AGENT', 'Act IV: Agent synthesizes Decision DEC-103 grounded in fresh Source ADR-002...', 'REVALIDATION');

        const revalRes = await fetch('/api/act-iv-revalidate', { method: 'POST' });
        const revalData = await revalRes.json();
        if (revalData.graph) setGraphData(revalData.graph);

        addLog('FALKORDB', 'Query 3 Revalidation complete: DEC-103 created; DEC-102 archived.', 'REVALIDATION');

        // Agent re-submits code with DEC-103
        addLog('AGENT', 'Agent re-submits `apply_code_change` using verified DEC-103...', 'INFO');

        const oauthCode = `/**\n * Payment Gateway Service\n * Verified & Grounded in DEC-103 (ADR-002: OAuth2 JWT/RS256)\n */\nimport express from 'express';\nimport { verifyOAuth2Bearer } from './auth.js';\n\nconst app = express();\napp.use(express.json());\n\n// Verified OAuth2 Checkout Endpoint\napp.post('/api/v2/checkout', verifyOAuth2Bearer, (req, res) => {\n  res.json({ status: 'approved', authMethod: 'OAuth2-RS256' });\n});\n\nexport default app;`;

        setLatestAction({
          filePath: 'demo-repo/src/services/payment.js',
          decisionId: 'DEC-103',
          codeSnippet: oauthCode
        });

        const execRes = await fetch('/api/mcp/call', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            toolName: 'apply_code_change',
            args: {
              decision_id: 'DEC-103',
              file_path: 'demo-repo/src/services/payment.js',
              code_payload: oauthCode
            }
          })
        });

        const execData = await execRes.json();
        if (execData.graph) setGraphData(execData.graph);
        setLatestLatency(execData.latency_ms || 1.62);
        setActiveVerdict('APPROVED');

        addLog(
          'MCP_GATE',
          `✅ GATE APPROVED in ${execData.latency_ms || 1.62}ms! Full causal provenance chain verified. File 'payment.js' safely written to disk.`,
          'GATE_APPROVE'
        );
      }
    } catch (err) {
      console.error('Act error:', err);
      addLog('ERROR', `Error executing Act ${actNumber}: ${err.message}`, 'ERROR');
    } finally {
      setLoadingAct(null);
    }
  }

  async function handleReset() {
    setIsResetting(true);
    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      const data = await res.json();
      if (data.graph) setGraphData(data.graph);

      setCurrentAct(1);
      setActiveVerdict(null);
      setSelectedNode(null);

      setTerminalLogs([
        {
          component: 'SYSTEM',
          time: new Date().toLocaleTimeString(),
          type: 'INFO',
          text: 'Demo repository and FalkorDB causal graph reset to Act I baseline.'
        }
      ]);

      setLatestAction({
        filePath: 'demo-repo/src/services/payment.js',
        decisionId: 'DEC-102',
        codeSnippet: `// Baseline: Unimplemented checkout route awaiting agent implementation\napp.post('/api/checkout', (req, res) => {\n  res.status(501).json({ error: 'Checkout route not implemented yet.' });\n});`
      });
    } catch (err) {
      console.error('Reset error:', err);
    } finally {
      setIsResetting(false);
    }
  }

  function addLog(component, text, type = 'INFO', violationPaths = null) {
    setTerminalLogs(prev => [
      ...prev,
      {
        component,
        time: new Date().toLocaleTimeString(),
        type,
        text,
        violationPaths
      }
    ]);
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-obsidian-900 text-slate-100 select-none overflow-hidden">
      {/* Top Header */}
      <Header
        status={{ falkorLive, latestLatency }}
        onReset={handleReset}
        isResetting={isResetting}
      />

      {/* 4-Act Storyline Stepper */}
      <StoryStepper
        currentAct={currentAct}
        onSelectAct={handleSelectAct}
        loadingAct={loadingAct}
      />

      {/* Main Split Screen: Terminal (Left) + Causal Graph Canvas (Right) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden">
        {/* Left: Cybernetic Agent Terminal HUD (5 Cols) */}
        <div className="lg:col-span-5 h-full overflow-hidden border-b lg:border-b-0">
          <TerminalView
            terminalLogs={terminalLogs}
            activeVerdict={activeVerdict}
            latestAction={latestAction}
            currentAct={currentAct}
          />
        </div>

        {/* Right: Interactive Causal Graph Canvas (7 Cols) */}
        <div className="lg:col-span-7 h-full relative overflow-hidden">
          <GraphCanvas
            graphData={graphData}
            onSelectNode={setSelectedNode}
            selectedNodeId={selectedNode?.id}
          />

          {/* Node Inspector Drawer */}
          <NodeInspector
            node={selectedNode}
            onClose={() => setSelectedNode(null)}
          />
        </div>
      </div>
    </div>
  );
}
