#!/usr/bin/env bash
set -euo pipefail

# TestCodex DMS Environment Setup Script
# This script helps set up and verify your PostgreSQL environment

echo "=== TestCodex DMS Environment Setup ==="

# Load environment variables from .env if it exists
if [ -f .env ]; then
    echo "Loading environment from .env..."
    export $(grep -v '^#' .env | xargs)
else
    echo "Warning: .env file not found. Creating from template..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "Created .env from .env.example - please customize it"
    fi
fi

# Set PostgreSQL path
export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"

# Verify PostgreSQL is running
echo ""
echo "=== Checking PostgreSQL Status ==="
if /opt/homebrew/bin/brew services list | /usr/bin/grep postgresql@15 | /usr/bin/grep started > /dev/null; then
    echo "✅ PostgreSQL 15 is running"
else
    echo "❌ PostgreSQL 15 is not running"
    echo "Starting PostgreSQL..."
    /opt/homebrew/bin/brew services start postgresql@15
    sleep 2
fi

# Check PostgreSQL version
echo ""
echo "=== PostgreSQL Version ==="
psql --version

# Verify database connection
echo ""
echo "=== Testing Database Connection ==="
DATABASE_URL=${DATABASE_URL:-"postgres://$(whoami)@localhost:5432/dms_dev"}
echo "Using DATABASE_URL: $DATABASE_URL"

if psql "$DATABASE_URL" -c "SELECT current_database(), current_user, version();" 2>/dev/null; then
    echo "✅ Database connection successful"
else
    echo "❌ Database connection failed"
    echo ""
    echo "Troubleshooting steps:"
    echo "1. Check if PostgreSQL is running: /opt/homebrew/bin/brew services list | /usr/bin/grep postgresql"
    echo "2. Try explicit connection: psql -h 127.0.0.1 -d dms_dev -U $(whoami)"
    echo "3. Check if database exists: psql -d postgres -c \"\\l\""
    echo "4. Create database if needed: createdb dms_dev"
    echo ""
    echo "Common auth solutions:"
    echo "- Add password to DATABASE_URL: postgres://user:pass@localhost:5432/dms_dev"
    echo "- Use ~/.pgpass file for password storage"
    echo "- Check pg_hba.conf for authentication settings"
    exit 1
fi

# Check if migrations have been applied
echo ""
echo "=== Checking Database Schema ==="
if psql "$DATABASE_URL" -c "\\dt" 2>/dev/null | /usr/bin/grep -q "No relations found"; then
    echo "⚠️  No tables found - you may need to run migrations"
    echo "Run: make migrate-psql"
else
    echo "✅ Database tables found"
    psql "$DATABASE_URL" -c "\\dt"
fi

echo ""
echo "=== Environment Ready ==="
echo "You can now run:"
echo "  make setup    # Install dependencies"
echo "  make run      # Start the application"
echo "  make test     # Run tests"
echo ""
echo "Application will be available at: http://127.0.0.1:8000"