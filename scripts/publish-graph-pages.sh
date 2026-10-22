#!/usr/bin/env bash
# Publishes graph.html to GitHub Pages (gh-pages branch) without polluting main branch.
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PARENT_GRAPH="$SCRIPT_DIR/../../graphify-out/graph.html"
LOCAL_GRAPH="$SCRIPT_DIR/../graphify-out/graph.html"

if [ -f "$PARENT_GRAPH" ]; then
    SOURCE_HTML="$PARENT_GRAPH"
elif [ -f "$LOCAL_GRAPH" ]; then
    SOURCE_HTML="$LOCAL_GRAPH"
else
    echo "ERROR: graph.html not found! Run 'graphify' or 'graphify export html' first."
    exit 1
fi

echo "==> Auditing knowledge graph markup integrity before publishing..."
VERIFY_SCRIPT="$SCRIPT_DIR/verify-graph-integrity.py"
if [ -f "$VERIFY_SCRIPT" ]; then
    python3 "$VERIFY_SCRIPT" "$SOURCE_HTML"
fi

REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
ORIGIN_URL="$(git -C "$REPO_ROOT" remote get-url origin)"
TEMP_DIR="$(mktemp -d /tmp/cavdax-gh-pages.XXXXXX)"

trap 'rm -rf "$TEMP_DIR"' EXIT

echo "==> Deploying $SOURCE_HTML to gh-pages branch..."
cp "$SOURCE_HTML" "$TEMP_DIR/index.html"

SOURCE_DIR="$(dirname "$SOURCE_HTML")"
if [ -d "$SOURCE_DIR/cursors" ]; then
    echo "==> Bundling custom SVG cursors..."
    cp -r "$SOURCE_DIR/cursors" "$TEMP_DIR/cursors"
fi
if [ -d "$SOURCE_DIR/sounds" ]; then
    echo "==> Bundling audio assets..."
    cp -r "$SOURCE_DIR/sounds" "$TEMP_DIR/sounds"
fi

cd "$TEMP_DIR"
git init -b gh-pages
git remote add origin "$ORIGIN_URL"
git add -A
git commit -m "deploy: publish interactive knowledge graph with custom cursors & audio assets [skip ci]"
git push -f origin gh-pages

echo "SUCCESS: Knowledge graph published to gh-pages branch!"
echo "Live URL: https://suneetchugh-dev.github.io/CAVDAX/"
