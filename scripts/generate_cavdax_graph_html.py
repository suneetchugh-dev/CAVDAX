#!/usr/bin/env python3
"""
generate_cavdax_graph_html.py
Transforms graphify's raw graph.html output into the bespoke, production-grade
CAVDAX UI Design System specification (Swiss Architectural Modernism, #d9a353 warm amber,
tactile Web Audio synthesis, and zero-emoji compliance).
"""

import sys
import os
from pathlib import Path

def main():
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    root_dir = Path(__file__).resolve().parent.parent
    graph_html_paths = [
        root_dir.parent / "graphify-out" / "graph.html",
        root_dir / "graphify-out" / "graph.html"
    ]

    target_path = None
    for p in graph_html_paths:
        if p.exists():
            target_path = p
            break

    if not target_path:
        print("ERROR: graphify-out/graph.html not found! Run graphify first.", file=sys.stderr)
        sys.exit(1)

    print(f"==> Reading raw graph from: {target_path}")
    orig = target_path.read_text(encoding="utf-8")

    start_nodes = orig.find("const RAW_NODES = ")
    end_nodes = orig.find(";\nconst RAW_EDGES = ", start_nodes)
    if start_nodes == -1 or end_nodes == -1:
        print("ERROR: Could not locate RAW_NODES in graph.html", file=sys.stderr)
        sys.exit(1)
    raw_nodes_str = orig[start_nodes:end_nodes]

    start_edges = end_nodes + 2
    end_edges = orig.find(";\nconst LEGEND = ", start_edges)
    raw_edges_str = orig[start_edges:end_edges]

    start_legend = end_edges + 2
    end_legend = orig.find("\n\n// HTML-escape helper", start_legend)
    if end_legend == -1:
        end_legend = orig.find(";\n\nconst nodesDS = ", start_legend)
    raw_legend_str = orig[start_legend:end_legend]

    html_template = f"""<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>CAVDAX • Autonomous Causal Knowledge Graph</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
<script src="https://unpkg.com/vis-network@9.1.6/standalone/umd/vis-network.min.js"
        integrity="sha384-Ux6phic9PEHJ38YtrijhkzyJ8yQlH8i/+buBR8s3mAZOJrP1gwyvAcIYl3GWtpX1"
        crossorigin="anonymous"></script>

<style>
  :root {{
    --bg: #0B0D0E;
    --surface: #111417;
    --surface-card: rgba(17, 20, 23, 0.85);
    --surface-elevated: #181C20;
    --border: rgba(255, 255, 255, 0.08);
    --border-hover: rgba(255, 255, 255, 0.16);
    --border-active: rgba(217, 163, 83, 0.5);
    --accent: #d9a353;
    --accent-hover: #e5b269;
    --accent-subtle: rgba(217, 163, 83, 0.12);
    --text-primary: #F8FAFC;
    --text-secondary: #94A3B8;
    --text-muted: #64748B;
    --node-label: #F8FAFC;
    --edge-color: rgba(255, 255, 255, 0.12);
    --glass-blur: blur(16px);
  }}

  [data-theme="light"] {{
    --bg: #F4F6F8;
    --surface: #FFFFFF;
    --surface-card: rgba(255, 255, 255, 0.9);
    --surface-elevated: #F8FAFC;
    --border: rgba(0, 0, 0, 0.08);
    --border-hover: rgba(0, 0, 0, 0.16);
    --border-active: rgba(217, 163, 83, 0.6);
    --accent: #b88237;
    --accent-hover: #d9a353;
    --accent-subtle: rgba(217, 163, 83, 0.14);
    --text-primary: #0F172A;
    --text-secondary: #475569;
    --text-muted: #64748B;
    --node-label: #0F172A;
    --edge-color: rgba(0, 0, 0, 0.12);
  }}

  * {{ box-sizing: border-box; margin: 0; padding: 0; }}
  body {{
    background: var(--bg);
    color: var(--text-primary);
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    height: 100vh;
    width: 100vw;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    user-select: none;
    -webkit-font-smoothing: antialiased;
  }}

  #header {{
    height: 52px;
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    z-index: 100;
    flex-shrink: 0;
  }}

  .header-brand {{
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
  }}

  .brand-logo-svg {{
    height: 22px;
    color: var(--text-primary);
    transition: transform 0.2s ease, color 0.2s ease;
  }}
  .brand-logo-svg:hover {{
    color: var(--accent);
    transform: scale(1.02);
  }}

  .telemetry-strip {{
    display: flex;
    align-items: center;
    gap: 12px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    font-weight: 500;
    color: var(--text-muted);
    letter-spacing: 0.05em;
  }}
  .telemetry-item b {{ color: var(--text-primary); font-weight: 600; }}
  .telemetry-badge {{
    padding: 2px 7px;
    border-radius: 4px;
    background: var(--accent-subtle);
    color: var(--accent);
    border: 1px solid var(--border-active);
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.06em;
  }}

  .header-controls {{
    display: flex;
    align-items: center;
    gap: 8px;
  }}

  .launch-platform-btn {{
    height: 32px;
    padding: 0 12px;
    border-radius: 6px;
    background: var(--accent-subtle);
    border: 1px solid var(--accent);
    color: var(--accent);
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    font-family: 'JetBrains Mono', monospace;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-decoration: none;
    cursor: pointer;
    transition: all 0.15s ease;
  }}
  .launch-platform-btn:hover {{
    background: var(--accent);
    color: #000000;
    box-shadow: 0 0 12px rgba(217, 163, 83, 0.4);
    transform: translateY(-1px);
  }}
  .launch-platform-btn .pulse-indicator {{
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--accent);
    box-shadow: 0 0 6px var(--accent);
  }}
  .launch-platform-btn:hover .pulse-indicator {{
    background: #000000;
    box-shadow: none;
  }}

  .ctrl-btn {{
    height: 32px;
    padding: 0 10px;
    border-radius: 6px;
    background: var(--surface-elevated);
    border: 1px solid var(--border);
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    font-family: 'JetBrains Mono', monospace;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
  }}
  .ctrl-btn:hover {{
    background: var(--surface);
    color: var(--text-primary);
    border-color: var(--border-hover);
  }}
  .ctrl-btn.active {{
    background: var(--accent-subtle);
    border-color: var(--border-active);
    color: var(--accent);
  }}

  .theme-switcher {{
    position: relative;
    display: flex;
    align-items: center;
    background: var(--surface-elevated);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 2px;
  }}
  .theme-btn {{
    border: none;
    background: transparent;
    color: var(--text-muted);
    font-size: 11px;
    font-family: 'JetBrains Mono', monospace;
    padding: 4px 8px;
    border-radius: 4px;
    cursor: pointer;
    transition: color 0.15s ease;
    display: flex;
    align-items: center;
    gap: 4px;
  }}
  .theme-btn:hover {{ color: var(--text-primary); }}
  .theme-btn.active {{
    background: var(--surface);
    color: var(--accent);
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  }}

  #workspace {{
    flex: 1;
    display: flex;
    position: relative;
    overflow: hidden;
  }}

  #graph {{ flex: 1; height: 100%; width: 100%; outline: none; }}

  #sidebar {{
    width: 320px;
    height: 100%;
    background: var(--surface-card);
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
    border-left: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    z-index: 50;
    transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  }}

  .sidebar-tabs {{
    display: flex;
    border-bottom: 1px solid var(--border);
    background: rgba(0,0,0,0.1);
  }}
  .tab-btn {{
    flex: 1;
    padding: 10px 0;
    text-align: center;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    color: var(--text-muted);
    border: none;
    background: transparent;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: all 0.15s ease;
  }}
  .tab-btn:hover {{ color: var(--text-primary); }}
  .tab-btn.active {{
    color: var(--accent);
    border-bottom-color: var(--accent);
  }}

  .search-container {{
    padding: 12px;
    border-bottom: 1px solid var(--border);
    position: relative;
  }}
  .search-box {{
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--surface-elevated);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 6px 10px;
    transition: border-color 0.15s ease;
  }}
  .search-box:focus-within {{ border-color: var(--accent); }}
  .search-box input {{
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: var(--text-primary);
    font-size: 12px;
    font-family: 'Inter', sans-serif;
  }}
  .search-box input::placeholder {{
    color: var(--text-muted);
    font-size: 11px;
    font-family: 'JetBrains Mono', monospace;
  }}
  .search-shortcut {{
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    color: var(--text-muted);
    border: 1px solid var(--border);
    padding: 1px 5px;
    border-radius: 3px;
    background: rgba(255,255,255,0.03);
  }}

  #search-results {{
    position: absolute;
    top: 56px;
    left: 12px;
    right: 12px;
    background: var(--surface);
    border: 1px solid var(--border-active);
    border-radius: 6px;
    max-height: 240px;
    overflow-y: auto;
    z-index: 200;
    box-shadow: 0 12px 32px rgba(0,0,0,0.5);
    display: none;
  }}
  .search-item {{
    padding: 8px 10px;
    cursor: pointer;
    border-bottom: 1px solid var(--border);
    font-size: 12px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    transition: background 0.1s ease;
  }}
  .search-item:last-child {{ border-bottom: none; }}
  .search-item:hover {{ background: var(--accent-subtle); }}
  .search-item-label {{ font-weight: 500; color: var(--text-primary); }}
  .search-item-sub {{ font-family: 'JetBrains Mono', monospace; font-size: 10px; color: var(--text-muted); }}

  .tab-pane {{
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }}
  .tab-pane.hidden {{ display: none; }}

  #inspector-pane {{ padding: 14px; gap: 14px; }}
  .panel-header {{
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-muted);
  }}

  .node-title-card {{
    background: var(--surface-elevated);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }}
  .node-title-label {{
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
    word-break: break-all;
    line-height: 1.4;
  }}
  .node-badge-row {{
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 2px;
  }}
  .node-type-badge {{
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    padding: 2px 6px;
    border-radius: 3px;
    background: var(--accent-subtle);
    color: var(--accent);
    border: 1px solid var(--border-active);
  }}

  .inspector-kv {{
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 12px;
  }}
  .kv-label {{
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    font-weight: 500;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }}
  .kv-value {{
    color: var(--text-secondary);
    font-size: 12px;
    word-break: break-all;
    line-height: 1.4;
  }}
  .kv-value.code {{
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    background: var(--surface-elevated);
    padding: 4px 6px;
    border-radius: 4px;
    border: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }}
  .copy-btn {{
    border: none;
    background: transparent;
    color: var(--text-muted);
    cursor: pointer;
    font-size: 11px;
    padding: 2px;
  }}
  .copy-btn:hover {{ color: var(--accent); }}

  .neighbors-wrap {{
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-top: 6px;
  }}
  .neighbors-list {{
    max-height: 200px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }}
  .neighbor-chip {{
    padding: 6px 8px;
    background: var(--surface-elevated);
    border: 1px solid var(--border);
    border-left: 3px solid var(--accent);
    border-radius: 4px;
    font-size: 11px;
    color: var(--text-secondary);
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: all 0.15s ease;
  }}
  .neighbor-chip:hover {{
    background: var(--accent-subtle);
    color: var(--text-primary);
    border-color: var(--accent);
  }}

  #legend-pane {{
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }}
  .legend-toolbar {{
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--border);
  }}
  .legend-action-btn {{
    border: none;
    background: transparent;
    color: var(--text-muted);
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    cursor: pointer;
    padding: 2px 4px;
  }}
  .legend-action-btn:hover {{ color: var(--accent); }}

  .legend-scroll {{
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }}
  .legend-item {{
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 5px 6px;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.12s ease;
  }}
  .legend-item:hover {{ background: var(--surface-elevated); }}
  .legend-item.dimmed {{ opacity: 0.35; }}
  .legend-dot {{ width: 8px; height: 8px; border-radius: 2px; flex-shrink: 0; }}
  .legend-name {{
    flex: 1;
    font-size: 11px;
    color: var(--text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }}
  .legend-count {{ font-family: 'JetBrains Mono', monospace; font-size: 10px; color: var(--text-muted); }}
  .custom-cb {{
    appearance: none;
    -webkit-appearance: none;
    width: 14px;
    height: 14px;
    border: 1px solid var(--border);
    border-radius: 3px;
    background: var(--surface-elevated);
    cursor: pointer;
    flex-shrink: 0;
    position: relative;
  }}
  .custom-cb:checked {{ background: var(--accent); border-color: var(--accent); }}
  .custom-cb:checked::after {{
    content: '';
    position: absolute;
    left: 4px;
    top: 1px;
    width: 4px;
    height: 7px;
    border: solid #000;
    border-width: 0 1.5px 1.5px 0;
    transform: rotate(45deg);
  }}

  .empty-state {{
    color: var(--text-muted);
    font-size: 12px;
    text-align: center;
    padding: 40px 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    line-height: 1.5;
  }}

  #hud-hint-bar {{
    position: absolute;
    bottom: 12px;
    left: 16px;
    background: var(--surface-card);
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 6px 12px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    color: var(--text-muted);
    display: flex;
    align-items: center;
    gap: 12px;
    pointer-events: none;
    z-index: 40;
  }}
  #hud-hint-bar span b {{ color: var(--accent); }}

  ::-webkit-scrollbar {{ width: 5px; height: 5px; }}
  ::-webkit-scrollbar-track {{ background: transparent; }}
  ::-webkit-scrollbar-thumb {{ background: rgba(255, 255, 255, 0.1); border-radius: 3px; }}
  ::-webkit-scrollbar-thumb:hover {{ background: rgba(255, 255, 255, 0.2); }}
</style>
</head>
<body>

<header id="header">
  <div class="header-brand" onclick="resetView()" title="CAVDAX Knowledge Graph">
    <svg class="brand-logo-svg" viewBox="0 0 1000 260" fill="currentColor">
      <path d="M 21.9 21.1 L 163.2 21.1 L 163.2 59.6 L 68.4 59.6 L 68.4 150.0 L 163.2 150.0 L 163.2 188.6 L 21.9 188.6 Z M 181.6 188.6 L 244.7 20.2 L 276.3 20.2 L 339.5 188.6 L 293.9 188.6 L 280.7 151.8 L 240.4 151.8 L 227.2 188.6 Z M 230.7 123.7 L 289.5 123.7 L 260.5 47.4 Z M 328.9 20.2 L 377.2 20.2 L 407.0 148.2 L 436.8 20.2 L 485.1 20.2 L 430.7 188.6 L 383.3 188.6 Z M 508.8 20.2 L 599.1 20.2 C 625.0 20.2 647.4 42.6 647.4 68.5 L 647.4 140.3 C 647.4 166.2 625.0 188.6 599.1 188.6 L 508.8 188.6 Z M 554.4 60.5 L 554.4 148.3 L 594.7 148.3 C 607.7 148.3 618.3 137.7 618.3 124.7 L 618.3 84.1 C 618.3 71.1 607.7 60.5 594.7 60.5 Z M 661.4 188.6 L 724.6 20.2 L 756.1 20.2 L 819.3 188.6 L 773.7 188.6 L 760.5 151.8 L 720.2 151.8 L 707.0 188.6 Z M 712.3 124.6 L 769.3 124.6 L 740.8 46.5 Z M 830.7 20.2 L 878.1 20.2 L 903.5 86.8 L 929.0 20.2 L 976.3 20.2 L 928.1 104.4 L 976.3 188.6 L 929.0 188.6 L 903.5 122.0 L 878.1 188.6 L 830.7 188.6 L 878.9 104.4 Z" fillRule="evenodd"/>
      <g stroke="currentColor">
        <line x1="92" y1="223" x2="928" y2="223" stroke-width="3.8" stroke-linecap="round"/>
        <circle cx="92" cy="223" r="8" fill="currentColor"/>
        <circle cx="578" cy="223" r="7" fill="currentColor"/>
        <circle cx="903" cy="223" r="7" fill="currentColor"/>
        <path d="M 922 216 L 938 223 L 922 230 L 925 223 Z" fill="currentColor" stroke="none"/>
      </g>
    </svg>
    <span class="telemetry-badge">TOPOLOGICAL GRAPH</span>
  </div>

  <div class="telemetry-strip">
    <span class="telemetry-item"><b>1,048</b> NODES</span>
    <span>•</span>
    <span class="telemetry-item"><b>1,405</b> EDGES</span>
    <span>•</span>
    <span class="telemetry-item"><b>83</b> COMMUNITIES</span>
    <span>•</span>
    <span class="telemetry-badge">FALKORDB GRAPHBLAS</span>
  </div>

  <div class="header-controls">
    <a href="https://cavdax.sahnirmaan.live" target="_blank" rel="noopener noreferrer" class="launch-platform-btn" onclick="playClick()" title="Launch official CAVDAX autonomous decision execution platform">
      <span class="pulse-indicator"></span>
      <span>OFFICIAL PLATFORM: CAVDAX.SAHNIRMAAN.LIVE</span>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M7 17L17 7M17 7H7M17 7V17"/></svg>
    </a>

    <button class="ctrl-btn" id="physics-btn" onclick="togglePhysics()" title="Freeze / Resume Graph Physics">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
      <span id="physics-label">FREEZE</span>
    </button>

    <button class="ctrl-btn" onclick="resetView()" title="Fit Graph to Viewport">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
      <span>FIT</span>
    </button>

    <button class="ctrl-btn" id="sound-btn" onclick="toggleSound()" title="Toggle Tactile Audio Feedback">
      <svg id="sound-icon-on" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
      <svg id="sound-icon-off" style="display:none;" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
      <span id="sound-label">AUDIO</span>
    </button>

    <div class="theme-switcher">
      <button class="theme-btn active" id="btn-theme-dark" onclick="setTheme('dark')">DARK</button>
      <button class="theme-btn" id="btn-theme-light" onclick="setTheme('light')">LIGHT</button>
    </div>

    <button class="ctrl-btn" onclick="toggleFullscreen()" title="Toggle Fullscreen (F11)">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
    </button>
  </div>
</header>

<main id="workspace">
  <div id="graph"></div>

  <div id="hud-hint-bar">
    <span><b>CLICK</b> INSPECT NODE</span>
    <span>•</span>
    <span><b>DRAG</b> PAN</span>
    <span>•</span>
    <span><b>SCROLL</b> ZOOM</span>
    <span>•</span>
    <span><b>/</b> SEARCH</span>
  </div>

  <aside id="sidebar">
    <div class="sidebar-tabs">
      <button class="tab-btn active" id="tab-inspector-btn" onclick="switchTab('inspector')">INSPECTOR</button>
      <button class="tab-btn" id="tab-legend-btn" onclick="switchTab('legend')">COMMUNITIES</button>
    </div>

    <div class="search-container">
      <div class="search-box">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input id="search-input" type="text" placeholder="Search nodes... (Press /)" autocomplete="off">
        <span class="search-shortcut">/</span>
      </div>
      <div id="search-results"></div>
    </div>

    <div class="tab-pane" id="inspector-pane">
      <div id="inspector-content">
        <div class="empty-state">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color:var(--text-muted);"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <div>Click any node or use search to inspect granular causal provenance</div>
          <div style="margin-top:16px;padding:12px;background:var(--accent-subtle);border:1px solid var(--border-active);border-radius:6px;font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--text-secondary);line-height:1.6;text-align:left;">
            <div style="color:var(--accent);font-weight:700;margin-bottom:4px;letter-spacing:0.06em;">TOPOLOGICAL GRAPH COMPANION</div>
            This page visualizes the repository architecture. To launch the full autonomous decision execution platform, visit the official production app at:
            <div style="margin-top:6px;">
              <a href="https://cavdax.sahnirmaan.live" target="_blank" rel="noopener noreferrer" style="color:var(--accent);font-weight:600;text-decoration:underline;">cavdax.sahnirmaan.live &rarr;</a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="tab-pane hidden" id="legend-pane">
      <div class="legend-toolbar">
        <span class="panel-header">83 CLUSTERS</span>
        <div style="display:flex;gap:6px;">
          <button class="legend-action-btn" onclick="selectAllCommunities(true)">ALL</button>
          <span style="color:var(--text-muted);">|</span>
          <button class="legend-action-btn" onclick="selectAllCommunities(false)">NONE</button>
        </div>
      </div>
      <div class="legend-scroll" id="legend-list"></div>
    </div>
  </aside>
</main>

<script>
{raw_nodes_str};
{raw_edges_str};
{raw_legend_str};

let audioCtx = null;
let soundMuted = localStorage.getItem('cavdax_sounds_muted') === 'true';

function getAudioCtx() {{
  if (!audioCtx && typeof AudioContext !== 'undefined') {{
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }}
  return audioCtx;
}}

function playClick() {{
  if (soundMuted) return;
  const ctx = getAudioCtx();
  if (!ctx) return;
  try {{
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.04);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.045);
  }} catch (e) {{}}
}}

function playChime() {{
  if (soundMuted) return;
  const ctx = getAudioCtx();
  if (!ctx) return;
  try {{
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.19);
  }} catch (e) {{}}
}}

function toggleSound() {{
  soundMuted = !soundMuted;
  localStorage.setItem('cavdax_sounds_muted', soundMuted ? 'true' : 'false');
  updateSoundUI();
  if (!soundMuted) playClick();
}}

function updateSoundUI() {{
  document.getElementById('sound-icon-on').style.display = soundMuted ? 'none' : 'block';
  document.getElementById('sound-icon-off').style.display = soundMuted ? 'block' : 'none';
  document.getElementById('sound-btn').classList.toggle('active', !soundMuted);
}}
updateSoundUI();

function setTheme(theme) {{
  playClick();
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('graphify-theme', theme);
  document.getElementById('btn-theme-dark').classList.toggle('active', theme === 'dark');
  document.getElementById('btn-theme-light').classList.toggle('active', theme === 'light');
  
  const isDark = theme === 'dark';
  const labelColor = isDark ? '#F8FAFC' : '#0F172A';
  nodesDS.update(nodesDS.get().map(n => ({{ id: n.id, font: Object.assign({{}}, n.font, {{ color: labelColor }}) }})));
}}

const savedTheme = localStorage.getItem('graphify-theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);
document.getElementById('btn-theme-dark').classList.toggle('active', savedTheme === 'dark');
document.getElementById('btn-theme-light').classList.toggle('active', savedTheme === 'light');

function switchTab(tab) {{
  playClick();
  document.getElementById('tab-inspector-btn').classList.toggle('active', tab === 'inspector');
  document.getElementById('tab-legend-btn').classList.toggle('active', tab === 'legend');
  document.getElementById('inspector-pane').classList.toggle('hidden', tab !== 'inspector');
  document.getElementById('legend-pane').classList.toggle('hidden', tab !== 'legend');
}}

function toggleFullscreen() {{
  playClick();
  if (!document.fullscreenElement) {{
    document.documentElement.requestFullscreen().catch(() => {{}});
  }} else {{
    document.exitFullscreen().catch(() => {{}});
  }}
}}

const nodesDS = new vis.DataSet(RAW_NODES.map(n => ({{
  id: n.id,
  label: n.label,
  color: {{
    background: n.color.background,
    border: n.color.border,
    highlight: {{ background: '#d9a353', border: '#ffffff' }}
  }},
  size: Math.max(12, n.size),
  font: {{ size: 11, color: savedTheme === 'dark' ? '#F8FAFC' : '#0F172A', face: 'Inter' }},
  borderWidth: 1.5,
  title: n.label
}})));

const edgesDS = new vis.DataSet(RAW_EDGES.map(e => ({{
  from: e.from,
  to: e.to,
  color: {{ color: savedTheme === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)', highlight: '#d9a353' }},
  arrows: {{ to: {{ enabled: true, scaleFactor: 0.5 }} }},
  smooth: {{ type: 'continuous', roundness: 0.15 }}
}})));

const container = document.getElementById('graph');
const network = new vis.Network(container, {{ nodes: nodesDS, edges: edgesDS }}, {{
  physics: {{
    enabled: true,
    solver: 'forceAtlas2Based',
    forceAtlas2Based: {{
      gravitationalConstant: -60,
      centralGravity: 0.006,
      springLength: 110,
      springConstant: 0.08,
      damping: 0.45,
      avoidOverlap: 0.75,
    }},
    stabilization: {{ iterations: 180, fit: true }},
  }},
  interaction: {{
    hover: true,
    tooltipDelay: 120,
    hideEdgesOnDrag: true,
    navigationButtons: false,
    keyboard: false,
  }},
  nodes: {{ shape: 'dot' }},
}});

let physicsEnabled = true;
network.once('stabilizationIterationsDone', () => {{
  network.setOptions({{ physics: {{ enabled: false }} }});
  physicsEnabled = false;
  document.getElementById('physics-label').textContent = 'RESUME';
  document.getElementById('physics-btn').classList.remove('active');
}});

function togglePhysics() {{
  playClick();
  physicsEnabled = !physicsEnabled;
  network.setOptions({{ physics: {{ enabled: physicsEnabled }} }});
  document.getElementById('physics-label').textContent = physicsEnabled ? 'FREEZE' : 'RESUME';
  document.getElementById('physics-btn').classList.toggle('active', physicsEnabled);
}}

function resetView() {{
  playClick();
  network.fit({{ animation: {{ duration: 400, easingFunction: 'easeInOutQuad' }} }});
}}

function esc(s) {{
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}}

function showInfo(nodeId) {{
  const n = RAW_NODES.find(x => x.id === nodeId);
  if (!n) return;
  playChime();

  const neighborIds = network.getConnectedNodes(nodeId);
  const neighborChips = neighborIds.map(nid => {{
    const nb = RAW_NODES.find(x => x.id === nid);
    const lbl = nb ? nb.label : nid;
    const clr = nb ? nb.color.background : '#d9a353';
    return `<div class="neighbor-chip" style="border-left-color:${{clr}}" onclick="focusNode('${{esc(nid)}}')">${{esc(lbl)}}</div>`;
  }}).join('');

  const type = n.file_type || (n.id.includes('adr') ? 'ADR' : n.id.includes('fact') ? 'FACT' : n.id.includes('dec') ? 'DECISION' : 'NODE');
  const community = n.community_name || ('Community ' + n.community);
  const src = n.source_file || 'Internal Topological Entity';

  const html = `
    <div class="node-title-card">
      <div class="panel-header">PROVENANCE NODE</div>
      <div class="node-title-label">${{esc(n.label)}}</div>
      <div class="node-badge-row">
        <span class="node-type-badge">${{esc(type)}}</span>
        <span class="node-type-badge" style="background:rgba(255,255,255,0.05);color:var(--text-secondary);border-color:var(--border);">DEGREE ${{n.degree || 0}}</span>
      </div>
    </div>

    <div class="inspector-kv" style="margin-top:10px;">
      <span class="kv-label">COMMUNITY CLUSTER</span>
      <span class="kv-value" style="display:flex;align-items:center;gap:6px;">
        <span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${{n.color.background}};"></span>
        <b>${{esc(community)}}</b>
      </span>
    </div>

    <div class="inspector-kv">
      <span class="kv-label">SOURCE LOCATION</span>
      <div class="kv-value code">
        <span style="overflow:hidden;text-overflow:ellipsis;">${{esc(src)}}</span>
        <button class="copy-btn" onclick="navigator.clipboard.writeText('${{esc(src)}}');playClick();this.textContent='COPIED';" title="Copy path">COPY</button>
      </div>
    </div>

    <div class="neighbors-wrap">
      <div class="panel-header">CONNECTED EDGES (${{neighborIds.length}})</div>
      <div class="neighbors-list">
        ${{neighborChips || '<div style="color:var(--text-muted);font-size:11px;">No connected edges</div>'}}
      </div>
    </div>
  `;

  document.getElementById('inspector-content').innerHTML = html;
  switchTab('inspector');
}}

function focusNode(nodeId) {{
  playClick();
  network.focus(nodeId, {{ scale: 1.5, animation: {{ duration: 400, easingFunction: 'easeInOutQuad' }} }});
  network.selectNodes([nodeId]);
  showInfo(nodeId);
}}

network.on('click', params => {{
  if (params.nodes.length > 0) {{
    showInfo(params.nodes[0]);
  }}
}});

const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');

searchInput.addEventListener('input', () => {{
  const q = searchInput.value.toLowerCase().trim();
  searchResults.innerHTML = '';
  if (!q) {{ searchResults.style.display = 'none'; return; }}

  const matches = RAW_NODES.filter(n => n.label.toLowerCase().includes(q) || (n.source_file && n.source_file.toLowerCase().includes(q))).slice(0, 15);
  if (!matches.length) {{
    searchResults.innerHTML = '<div style="padding:10px;font-size:11px;color:var(--text-muted);text-align:center;">No matching nodes found</div>';
    searchResults.style.display = 'block';
    return;
  }}

  searchResults.style.display = 'block';
  matches.forEach(n => {{
    const item = document.createElement('div');
    item.className = 'search-item';
    item.innerHTML = `
      <div class="search-item-label">${{esc(n.label)}}</div>
      <div class="search-item-sub">${{esc(n.community_name || 'Cluster ' + n.community)}} • ${{esc(n.source_file || '')}}</div>
    `;
    item.onclick = () => {{
      focusNode(n.id);
      searchResults.style.display = 'none';
      searchInput.value = '';
    }};
    searchResults.appendChild(item);
  }});
}});

document.addEventListener('click', e => {{
  if (!searchResults.contains(e.target) && e.target !== searchInput) {{
    searchResults.style.display = 'none';
  }}
}});

document.addEventListener('keydown', e => {{
  if (e.key === '/' && document.activeElement !== searchInput) {{
    e.preventDefault();
    searchInput.focus();
    playClick();
  }} else if (e.key === 'Escape') {{
    searchResults.style.display = 'none';
    searchInput.blur();
  }}
}});

const legendList = document.getElementById('legend-list');
const hiddenCommunities = new Set();

LEGEND.forEach(c => {{
  const item = document.createElement('div');
  item.className = 'legend-item';
  const cb = document.createElement('input');
  cb.type = 'checkbox';
  cb.className = 'custom-cb';
  cb.checked = true;

  cb.addEventListener('change', e => {{
    e.stopPropagation();
    playClick();
    if (cb.checked) {{
      hiddenCommunities.delete(c.cid);
      item.classList.remove('dimmed');
    }} else {{
      hiddenCommunities.add(c.cid);
      item.classList.add('dimmed');
    }}
    const updates = RAW_NODES
      .filter(n => n.community === c.cid)
      .map(n => ({{ id: n.id, hidden: !cb.checked }}));
    nodesDS.update(updates);
  }});

  item.innerHTML = `
    <span class="legend-dot" style="background:${{c.color}}"></span>
    <span class="legend-name" title="${{esc(c.label)}}">${{esc(c.label)}}</span>
    <span class="legend-count">${{c.count}}</span>
  `;
  item.prepend(cb);
  item.onclick = e => {{
    if (e.target !== cb) {{
      cb.checked = !cb.checked;
      cb.dispatchEvent(new Event('change'));
    }}
  }};
  legendList.appendChild(item);
}});

function selectAllCommunities(selectAll) {{
  playClick();
  document.querySelectorAll('#legend-list .custom-cb').forEach(cb => {{
    cb.checked = selectAll;
  }});
  document.querySelectorAll('#legend-list .legend-item').forEach(it => {{
    it.classList.toggle('dimmed', !selectAll);
  }});
  LEGEND.forEach(c => {{
    if (selectAll) hiddenCommunities.delete(c.cid);
    else hiddenCommunities.add(c.cid);
  }});
  const updates = RAW_NODES.map(n => ({{ id: n.id, hidden: !selectAll }}));
  nodesDS.update(updates);
}}

console.log('CAVDAX Knowledge Graph Initialized with Design System tokens.');
</script>
</body>
</html>
"""

    target_path.write_text(html_template, encoding="utf-8")
    index_path = target_path.parent / "index.html"
    index_path.write_text(html_template, encoding="utf-8")
    print(f"SUCCESS: Transformed {target_path} and {index_path} into CAVDAX UI Design System standard!")

if __name__ == "__main__":
    main()
