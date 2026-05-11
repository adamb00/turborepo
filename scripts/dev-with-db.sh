#!/usr/bin/env bash

set -euo pipefail

DEFAULT_STUDIO_PORT="${PRISMA_STUDIO_PORT:-5555}"
STUDIO_PORT="${DEFAULT_STUDIO_PORT}"
STUDIO_BROWSER="${PRISMA_STUDIO_BROWSER:-none}"
STUDIO_LOG="${PRISMA_STUDIO_LOG:-/tmp/prisma-studio.log}"

is_port_in_use() {
  local port="$1"
  if command -v lsof >/dev/null 2>&1; then
    lsof -nP -iTCP:"${port}" -sTCP:LISTEN >/dev/null 2>&1
    return $?
  fi

  if command -v nc >/dev/null 2>&1; then
    nc -z localhost "${port}" >/dev/null 2>&1
    return $?
  fi

  return 1
}

pick_studio_port() {
  local port="${DEFAULT_STUDIO_PORT}"
  local max_tries=30
  local i=0

  while [ "${i}" -lt "${max_tries}" ]; do
    if ! is_port_in_use "${port}"; then
      echo "${port}"
      return 0
    fi
    port=$((port + 1))
    i=$((i + 1))
  done

  echo "${DEFAULT_STUDIO_PORT}"
}

STUDIO_PORT="$(pick_studio_port)"
if [ "${STUDIO_PORT}" != "${DEFAULT_STUDIO_PORT}" ]; then
  echo "Port ${DEFAULT_STUDIO_PORT} is busy, using Prisma Studio port ${STUDIO_PORT}."
fi

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
