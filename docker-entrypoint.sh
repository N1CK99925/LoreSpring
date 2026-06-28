#!/usr/bin/env bash
set -euo pipefail

# Wait for DB to be available? rely on alembic to fail fast if no connection.
# Run database migrations then start the app.
if command -v alembic >/dev/null 2>&1; then
  echo "Running Alembic migrations..."
  alembic upgrade head || {
    echo "Alembic migration failed" >&2
    exit 1
  }
else
  echo "alembic not found in PATH, skipping migrations"
fi

echo "=== DEBUG: /app contents ==="
ls -la /app
echo "=== DEBUG: schemas check ==="
ls -la /app/schemas 2>&1 || echo "schemas directory NOT FOUND"
echo "=== END DEBUG ==="
# Start Uvicorn
exec uvicorn api.main:app --host 0.0.0.0 --port 8000
