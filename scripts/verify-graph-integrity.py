#!/usr/bin/env python3
"""
verify-graph-integrity.py
Pre-Publish Integrity Guard for CAVDAX Interactive Knowledge Graph pages.
Ensures zero JavaScript leakage into HTML text nodes, validates strict
script/style tag balance, and checks for all required UI Design System tokens
before publishing to gh-pages or deploying to production.
"""

import sys
import re
import json
from pathlib import Path

LEAK_SIGNATURES = [
    "let audioCtx",
    "function playClick",
    "function playChime",
    "function toggleSound",
    "function setTheme",
    "const nodesDS",
    "const edgesDS",
    "soundMuted =",
    "getAudioCtx()",
    "network.setOptions"
]

def verify_file(file_path: Path) -> list:
    errors = []
    print(f"[*] Auditing markup integrity: {file_path}")

    if not file_path.exists():
        return [f"File not found: {file_path}"]

    try:
        content = file_path.read_text(encoding="utf-8")
    except Exception as e:
        return [f"Failed to read file as UTF-8: {e}"]

    # 1. Check tag balancing
    open_scripts = len(re.findall(r"<script\b", content, re.IGNORECASE))
    close_scripts = len(re.findall(r"</script>", content, re.IGNORECASE))
    if open_scripts != close_scripts:
        errors.append(f"Mismatched <script> tags: found {open_scripts} opening vs {close_scripts} closing")

    # In CAVDAX graph.html, we expect exactly 2 script blocks:
    # 1. External Vis.js CDN script
    # 2. Main inline application script
    if open_scripts != 2 or close_scripts != 2:
        errors.append(f"Unexpected script tag count: expected exactly 2 <script> and 2 </script>, found {open_scripts} / {close_scripts}")

    open_styles = len(re.findall(r"<style\b", content, re.IGNORECASE))
    close_styles = len(re.findall(r"</style>", content, re.IGNORECASE))
    if open_styles != close_styles:
        errors.append(f"Mismatched <style> tags: found {open_styles} opening vs {close_styles} closing")

    # 2. Check for script leakage outside <script> tags
    # Find all inline scripts
    matches = list(re.finditer(r"<script\b[^>]*>(.*?)</script>", content, re.DOTALL | re.IGNORECASE))
    if not matches:
        errors.append("No script tags found in HTML")
        return errors

    # Extract non-script content (strip everything between <script> and </script>)
    non_script_content = re.sub(r"<script\b[^>]*>.*?</script>", "<!-- SCRIPT REMOVED -->", content, flags=re.DOTALL | re.IGNORECASE)

    # Also strip comments
    non_script_content = re.sub(r"<!--.*?-->", "", non_script_content, flags=re.DOTALL)

    for sig in LEAK_SIGNATURES:
        if sig in non_script_content:
            errors.append(f"CRITICAL LEAK DETECTED: Signature '{sig}' found outside <script> blocks (rendered directly into HTML text)!")

    # 3. Check trailing content after the last </script>
    last_script_end = content.rfind("</script>")
    if last_script_end != -1:
        trailing = content[last_script_end + len("</script>"):].strip()
        # Trailing content should only be </body></html>
        allowed_trailing = ["</body>", "</html>", "</body></html>", ""]
        cleaned_trailing = re.sub(r"\s+", "", trailing.lower())
        if cleaned_trailing not in ["</body></html>", "</html>", ""]:
            errors.append(f"Suspicious trailing content after final </script>: {repr(trailing[:100])}")

    # 4. Check for essential dataset arrays
    for data_var in ["RAW_NODES", "RAW_EDGES", "LEGEND"]:
        var_match = re.search(rf"const\s+{data_var}\s*=\s*(\[.*?\]);", content, re.DOTALL)
        if not var_match:
            errors.append(f"Missing or malformed data array: const {data_var} = [...] not found inside <script>")
        else:
            try:
                arr = json.loads(var_match.group(1))
                if len(arr) == 0:
                    errors.append(f"Data array {data_var} is empty (0 items)")
                else:
                    print(f"    [+] {data_var} verified ({len(arr):,} items)")
            except Exception as e:
                errors.append(f"Failed to parse {data_var} as valid JSON: {e}")

    # 5. Check Design System and Navigation Anchors
    required_tokens = [
        ("data-theme=\"dark\"", "Dark theme default attribute"),
        ("https://cavdax.sahnirmaan.live", "Official platform CTA link"),
        ("TOPOLOGICAL GRAPH", "Topological Graph companion badge"),
        ("vis-network", "Vis.js library inclusion"),
        ("#d9a353", "CAVDAX warm amber design token"),
    ]
    for token, desc in required_tokens:
        if token not in content:
            errors.append(f"Missing required design/architecture token: {desc} ('{token}')")

    # 6. Check custom SVG cursors & memory-leak defense tokens
    advanced_checks = [
        ("cursors/default_cursor.svg", "Custom default SVG cursor definition"),
        ("cursors/hand-pointer.svg", "Custom interactive hand-pointer SVG cursor definition"),
        ("cursors/cover_hand_grab_dark.svg", "Custom canvas grab SVG cursor definition"),
        ("clickAudioPool", "Zero-leak Audio Pool (soundFx.js pattern)"),
        ("osc.disconnect()", "Web Audio oscillator disconnection (memory leak defense)"),
        ("gain.disconnect()", "Web Audio gain node disconnection (memory leak defense)"),
    ]
    for token, desc in advanced_checks:
        if token not in content:
            errors.append(f"Missing UX/Safety token: {desc} ('{token}')")

    # 7. Check that cursors and sounds folders exist alongside the HTML file
    parent_dir = file_path.parent
    if not (parent_dir / "cursors" / "default_cursor.svg").exists():
        errors.append(f"Missing cursor asset file: {parent_dir / 'cursors' / 'default_cursor.svg'}")
    if not (parent_dir / "sounds" / "click.mp3").exists():
        errors.append(f"Missing sound asset file: {parent_dir / 'sounds' / 'click.mp3'}")

    return errors

def main():
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')

    root_dir = Path(__file__).resolve().parent.parent
    workspace_root = root_dir.parent

    target_files = []
    if len(sys.argv) > 1:
        for arg in sys.argv[1:]:
            target_files.append(Path(arg))
    else:
        candidates = [
            workspace_root / "graphify-out" / "graph.html",
            workspace_root / "graphify-out" / "index.html",
            root_dir / "graphify-out" / "graph.html",
            root_dir / "graphify-out" / "index.html",
        ]
        target_files = [p for p in candidates if p.exists()]

    if not target_files:
        print("[-] ERROR: No target HTML files found to audit!", file=sys.stderr)
        sys.exit(1)

    all_passed = True
    print(f"=== Starting Pre-Publish Graph Integrity Audit ({len(target_files)} files) ===")
    for f in target_files:
        errs = verify_file(f)
        if errs:
            all_passed = False
            print(f"[-] FAILED: {f.name} failed integrity checks:")
            for e in errs:
                print(f"    [!] {e}")
        else:
            print(f"[+] PASSED: {f.name} is clean, verified, and ready for publication.")

    if not all_passed:
        print("\n=======================================================")
        print("PRE-PUBLISH INTEGRITY GUARD FAILED!")
        print("Publication halted to prevent corrupted or leaking HTML.")
        print("=======================================================")
        sys.exit(1)

    print("\n[OK] All graph files passed pre-publish integrity checks with zero leaks!")
    sys.exit(0)

if __name__ == "__main__":
    main()
