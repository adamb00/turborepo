#!/usr/bin/env bash

set -euo pipefail

migrate_deploy_with_retry() {
  local max_attempts=15
  local attempt=1
  local output=""
  local exit_code=0

  while [ "$attempt" -le "$max_attempts" ]; do
    output="$(pnpm run db:migrate:deploy 2>&1)" && exit_code=0 || exit_code=$?

    echo "$output"

    if [ "$exit_code" -eq 0 ]; then
      return 0
    fi

    if echo "$output" | grep -q "Error: P1001" && [ "$attempt" -lt "$max_attempts" ]; then
      echo "Database not ready yet (attempt $attempt/$max_attempts). Retrying in 2s..."
      sleep 2
      attempt=$((attempt + 1))
      continue
    fi

    if echo "$output" | grep -q "Error: P1000"; then
      return 10
    fi
    if echo "$output" | grep -q "Error: P3005"; then
      return 11
    fi

    return "$exit_code"
  done

  return 1
}

echo "Starting development infrastructure (Postgres + Redis)..."
pnpm run db:up

echo "Applying Prisma migrations (db:migrate:deploy)..."
set +e
migrate_deploy_with_retry
migrate_status=$?
set -e

if [ "$migrate_status" -eq 0 ]; then
  echo "Building @workspace/database package..."
  pnpm --filter @workspace/database build
  echo "Development database is ready."
  exit 0
fi

if [ "$migrate_status" -eq 10 ] || [ "$migrate_status" -eq 11 ]; then
  echo "Detected incompatible existing dev DB state. Recreating dev DB volume and retrying..."
  pnpm run db:reset
  pnpm run db:up
  migrate_deploy_with_retry
  echo "Building @workspace/database package..."
  pnpm --filter @workspace/database build
  echo "Development database was reset and is now ready."
  exit 0
fi

echo "db:migrate:deploy failed for a non-auth reason. Keeping current state."
exit 1
