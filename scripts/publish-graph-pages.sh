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

REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
ORIGIN_URL="$(git -C "$REPO_ROOT" remote get-url origin)"
TEMP_DIR="$(mktemp -d /tmp/cavdax-gh-pages.XXXXXX)"

trap 'rm -rf "$TEMP_DIR"' EXIT

echo "==> Deploying $SOURCE_HTML to gh-pages branch..."
cp "$SOURCE_HTML" "$TEMP_DIR/index.html"

cd "$TEMP_DIR"
git init -b gh-pages
git remote add origin "$ORIGIN_URL"
git add index.html
git commit -m "deploy: publish interactive knowledge graph to GitHub Pages [skip ci]"
git push -f origin gh-pages

echo "✅ SUCCESS: Knowledge graph published to gh-pages branch!"
echo "Live URL: https://suneetchugh-dev.github.io/CAVDAX/"
