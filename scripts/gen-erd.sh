#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT_DIR/assets/erd/dms_erd.mmd"
OUT_PNG="$ROOT_DIR/assets/erd/dms_erd.png"
OUT_SVG="$ROOT_DIR/assets/erd/dms_erd.svg"

if [ ! -f "$SRC" ]; then
  echo "ERD source not found: $SRC" >&2
  exit 1
fi

if ! command -v mmdc >/dev/null 2>&1; then
  echo "Mermaid CLI (mmdc) not found. Install via:"
  echo "  npm install -g @mermaid-js/mermaid-cli" >&2
  echo "Or use Docker:"
  echo "  docker run --rm -v \"$ROOT_DIR/assets/erd:/data\" minlag/mermaid-cli -i /data/dms_erd.mmd -o /data/dms_erd.png" >&2
  exit 2
fi

echo "Generating ERD PNG -> $OUT_PNG"
mmdc -i "$SRC" -o "$OUT_PNG" -b transparent

echo "Generating ERD SVG -> $OUT_SVG"
mmdc -i "$SRC" -o "$OUT_SVG" -b transparent

echo "Done."

