#!/usr/bin/env bash
set -euo pipefail

# Simple migration runner for PostgreSQL using psql.
# Requires DATABASE_URL or PG* env vars to be set.

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
MIG_DIR="$ROOT_DIR/migrations"

if ! command -v psql >/dev/null 2>&1; then
  echo "psql not found. Please install PostgreSQL client." >&2
  exit 1
fi

if [ ! -d "$MIG_DIR" ]; then
  echo "Migrations directory not found: $MIG_DIR" >&2
  exit 1
fi

echo "Applying migrations in $MIG_DIR..."
for file in $(ls "$MIG_DIR"/*.sql | sort); do
  echo "-> $file"
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$file"
done

echo "Done."

