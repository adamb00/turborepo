#!/usr/bin/env bash

set -euo pipefail

STUDIO_PORT="${PRISMA_STUDIO_PORT:-5555}"
STUDIO_BROWSER="${PRISMA_STUDIO_BROWSER:-none}"
STUDIO_LOG="${PRISMA_STUDIO_LOG:-/tmp/prisma-studio.log}"

pnpm run dev:setup

echo "Starting Prisma Studio on http://localhost:${STUDIO_PORT} ..."
(
  cd packages/database
  pnpm exec prisma studio --port "${STUDIO_PORT}" --browser "${STUDIO_BROWSER}" >>"${STUDIO_LOG}" 2>&1
) &
studio_pid=$!
echo "Prisma Studio log: ${STUDIO_LOG}"

wait_for_studio() {
  local max_attempts=15
  local attempt=1

  while [ "$attempt" -le "$max_attempts" ]; do
    if ! kill -0 "${studio_pid}" 2>/dev/null; then
      echo "Prisma Studio failed to start. Last log lines:"
      tail -n 80 "${STUDIO_LOG}" || true
      return 1
    fi

    if grep -Eq "Prisma Studio is up|localhost:${STUDIO_PORT}" "${STUDIO_LOG}" 2>/dev/null; then
      echo "Prisma Studio is running on http://localhost:${STUDIO_PORT}"
      return 0
    fi

    sleep 1
    attempt=$((attempt + 1))
  done

  echo "Prisma Studio process is running, but startup could not be confirmed yet. Continuing..."
  return 0
}

cleanup() {
  if kill -0 "${studio_pid}" 2>/dev/null; then
    kill "${studio_pid}" 2>/dev/null || true
    wait "${studio_pid}" 2>/dev/null || true
  fi
}

trap cleanup EXIT INT TERM

wait_for_studio

pnpm run dev
