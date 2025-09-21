.PHONY: help setup run test lint format build clean

DEFAULT_GOAL := help

help:
	@echo "Available targets:"
	@echo "  make setup  - Install dependencies if manifest exists"
	@echo "  make run    - Run the app (best-effort across stacks)"
	@echo "  make run-api - Run Python API server (loads .env)"
	@echo "  make test   - Run tests across common toolchains"
	@echo "  make lint   - Run linters/format checks when available"
	@echo "  make format - Apply autoformatters (Black/Prettier/etc.)"
	@echo "  make build  - Build/compile project when applicable"
	@echo "  make clean  - Remove typical build artifacts"
	@echo "  make migrate-psql - Apply SQL migrations with psql (DATABASE_URL required)"
	@echo "  make erd     - Generate ERD image(s) from Mermaid source"
	@echo "  make web-dev - Start Vite dev server (web/)"
	@echo "  make web-build - Build frontend (web/)"

setup:
	@if [ -f package.json ]; then \
		echo "Detected Node project -> npm ci" && npm ci || true; \
	elif [ -f pnpm-lock.yaml ]; then \
		echo "Detected pnpm project -> pnpm install --frozen-lockfile" && pnpm install --frozen-lockfile || true; \
	elif [ -f yarn.lock ]; then \
		echo "Detected Yarn project -> yarn install --frozen-lockfile" && yarn install --frozen-lockfile || true; \
	elif [ -f requirements.txt ] || [ -f requirements-dev.txt ] || [ -f pyproject.toml ]; then \
		echo "Detected Python project"; \
		if command -v python3 >/dev/null 2>&1; then PY=python3; else PY=python; fi; \
		if [ -f requirements.txt ]; then echo " -> $$PY -m pip install -r requirements.txt" && $$PY -m pip install -r requirements.txt || true; fi; \
		if [ -f requirements-dev.txt ]; then echo " -> $$PY -m pip install -r requirements-dev.txt" && $$PY -m pip install -r requirements-dev.txt || true; fi; \
		if [ -f pyproject.toml ] && [ ! -f requirements.txt ]; then echo " -> $$PY -m pip install ." && $$PY -m pip install . || true; fi; \
	elif [ -f go.mod ]; then \
		echo "Detected Go project -> go mod download" && go mod download || true; \
	elif [ -f Cargo.toml ]; then \
		echo "Detected Rust project -> cargo fetch" && cargo fetch || true; \
	else \
		echo "No known dependency manifest found. Skipping."; \
	fi

run:
	@if [ -f package.json ]; then \
		echo "Node run: npm run dev || npm start"; \
		npm run dev 2>/dev/null || npm start || true; \
	elif [ -f pyproject.toml ] || [ -f requirements.txt ]; then \
		echo "Python run: python -m src.app or scripts in README"; \
		python -m src.app || true; \
	elif [ -f main.go ] || [ -f go.mod ]; then \
		echo "Go run: go run ./..."; \
		go run ./... || true; \
	elif [ -f Cargo.toml ]; then \
		echo "Rust run: cargo run"; \
		cargo run || true; \
	else \
		echo "No standard run command detected. Define one in README or package scripts."; \
	fi

test:
	@if [ -f package.json ]; then \
		echo "Node tests: npm test (or pnpm/yarn)"; \
		npm test || pnpm test || yarn test || true; \
	elif [ -f pyproject.toml ] || [ -f requirements.txt ]; then \
		echo "Python tests: pytest"; \
		pytest -q || true; \
	elif [ -f go.mod ]; then \
		echo "Go tests: go test ./..."; \
		go test ./... || true; \
	elif [ -f Cargo.toml ]; then \
		echo "Rust tests: cargo test"; \
		cargo test || true; \
	else \
		echo "No tests configured. Create tests/ and add a framework."; \
	fi

lint:
	@if [ -f package.json ]; then \
		echo "Node lint: npm run lint || npx eslint . && npx prettier -c ."; \
		npm run lint || (npx eslint . || true; npx prettier -c . || true); \
	elif [ -f pyproject.toml ] || [ -f requirements.txt ]; then \
		echo "Python lint: ruff + black --check"; \
		ruff check . || true; \
		black --check . || true; \
	elif [ -f go.mod ]; then \
		echo "Go lint: go vet ./..."; \
		go vet ./... || true; \
	elif [ -f Cargo.toml ]; then \
		echo "Rust lint: cargo clippy -- -D warnings"; \
		cargo clippy -- -D warnings || true; \
	else \
		echo "No linters configured. Add one for your stack."; \
	fi

format:
	@if [ -f package.json ]; then \
		echo "Node format: npx prettier -w ."; \
		npx prettier -w . || true; \
	elif [ -f pyproject.toml ] || [ -f requirements.txt ] || [ -f requirements-dev.txt ]; then \
		echo "Python format: black ."; \
		black . || true; \
	elif [ -f go.mod ]; then \
		echo "Go format: go fmt ./..."; \
		go fmt ./... || true; \
	elif [ -f Cargo.toml ]; then \
		echo "Rust format: cargo fmt"; \
		cargo fmt || true; \
	else \
		echo "No formatter configured for this stack."; \
	fi

build:
	@if [ -f package.json ]; then \
		echo "Node build: npm run build"; \
		npm run build || true; \
	elif [ -f pyproject.toml ]; then \
		echo "Python build: python -m build (requires build)"; \
		python -m build || true; \
	elif [ -f go.mod ]; then \
		echo "Go build: go build ./..."; \
		go build ./... || true; \
	elif [ -f Cargo.toml ]; then \
		echo "Rust build: cargo build --release"; \
		cargo build --release || true; \
	else \
		echo "No build step required or configured."; \
	fi

clean:
	@echo "Cleaning typical artifacts..."
	@rm -rf dist build target node_modules .pytest_cache **/__pycache__ *.egg-info || true

migrate-psql:
	@if [ -z "$$DATABASE_URL" ]; then \
		echo "DATABASE_URL env var is required (e.g., postgres://user:pass@localhost:5432/dbname)"; \
		exit 1; \
	fi; \
	bash scripts/migrate.sh

erd:
	@bash scripts/gen-erd.sh

run-api:
	@echo "Loading .env (HOST/PORT) and starting API..."
	@set -a; \
	[ -f .env ] && . ./.env; \
	set +a; \
	python3 -m src.api.server

web-dev:
	@cd web && npm run dev

web-build:
	@cd web && npm run build
