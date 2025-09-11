import os
from pathlib import Path
from src.api.server import main as run_api


def main() -> None:
    """Start the minimal API server.

    Endpoints:
      - GET /health -> "ok"
      - GET /validate?id=ABC-XY-ENG-PRO-001 -> {"id": ..., "valid": true|false}
    """
    # Minimal .env loader (no external deps). Only sets HOST/PORT if present.
    env_path = Path(".env")
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            key, value = key.strip(), value.strip()
            if key in {"HOST", "PORT", "APP_ENV"} and key not in os.environ:
                os.environ[key] = value
    run_api()


if __name__ == "__main__":
    main()
