#!/usr/bin/env bash

set -euo pipefail

copy_if_missing() {
  local source_file="$1"
  local target_file="$2"

  if [ ! -f "$source_file" ]; then
    echo "Skipping missing template file: $source_file"
    return 0
  fi

  if [ -f "$target_file" ]; then
    echo "Already exists, leaving as-is: $target_file"
    return 0
  fi

  cp "$source_file" "$target_file"
  echo "Created: $target_file"
}

echo "Installing dependencies..."
pnpm install

echo "Creating development env files from examples..."
copy_if_missing ".env.example" ".env.development"
copy_if_missing "apps/api/.env.example" "apps/api/.env.development"
copy_if_missing "apps/admin/.env.example" "apps/admin/.env.local"
copy_if_missing "packages/database/.env.example" "packages/database/.env.development"

echo "Starting local infrastructure (db, redis, maildev)..."
pnpm run db:up

echo "Template setup completed."
