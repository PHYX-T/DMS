#!/usr/bin/env bash
set -euo pipefail
BASE="http://localhost:5173"
URLS=(
  "/login"
  "/"
  "/search"
  "/controller/upload"
  "/documents/ABC-XY-ENG-PRO-001"
  "/admin/users"
  "/qms/reports"
)
for u in "${URLS[@]}"; do
  echo "Checking $BASE$u"
  npx pa11y "$BASE$u" --threshold 0 || exit 1
done

