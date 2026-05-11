#!/usr/bin/env bash

set -euo pipefail

PROJECT_NAME="$(basename "$PWD")"
DB_USER="$PROJECT_NAME"
DB_PASSWORD="$PROJECT_NAME"
DB_NAME="$PROJECT_NAME"
DB_HOST="127.0.0.1"
DB_PORT="5433"
REDIS_PORT="6380"
API_PORT="8000"
ADMIN_URL="http://localhost:3000"
API_URL="http://localhost:${API_PORT}"

generate_secret() {
  if command -v openssl >/dev/null 2>&1; then
    openssl rand -hex 32
    return
  fi

  node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
}

AUTH_SECRET="$(generate_secret)"

echo "Writing environment files for project: ${PROJECT_NAME}"

node -e '
const fs = require("node:fs");
const path = "package.json";
const pkg = JSON.parse(fs.readFileSync(path, "utf8"));
pkg.name = process.argv[1];
fs.writeFileSync(path, `${JSON.stringify(pkg, null, 2)}\n`);
' "$PROJECT_NAME"
echo "Updated package.json name to: ${PROJECT_NAME}"

cat > .env.development <<EOF
POSTGRES_USER=${DB_USER}
POSTGRES_PASSWORD=${DB_PASSWORD}
POSTGRES_DB=${DB_NAME}
POSTGRES_HOST=${DB_HOST}
POSTGRES_HOST_PORT=${DB_PORT}
REDIS_HOST_PORT=${REDIS_PORT}
EOF

mkdir -p apps/api apps/admin packages/database

cat > apps/api/.env.development <<EOF
NODE_ENV=development
PORT=${API_PORT}
ADMIN_URL=${ADMIN_URL}
AUTH_SECRET=${AUTH_SECRET}
REDIS_URL=redis://${DB_HOST}:${REDIS_PORT}
DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?schema=public
SMTP_HOST=${DB_HOST}
SMTP_PORT=1025
EMAIL_FROM=no-reply@${PROJECT_NAME}.local
EOF

cat > packages/database/.env.development <<EOF
NODE_ENV=development
DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?schema=public
POSTGRES_USER=${DB_USER}
POSTGRES_PASSWORD=${DB_PASSWORD}
POSTGRES_HOST=${DB_HOST}
POSTGRES_HOST_PORT=${DB_PORT}
POSTGRES_DB=${DB_NAME}
EOF

if [ ! -f apps/admin/.env.local ]; then
  cat > apps/admin/.env.local <<EOF
API_URL=${API_URL}
NEXT_PUBLIC_API_URL=${API_URL}
EOF
  echo "Created apps/admin/.env.local"
else
  echo "Kept existing apps/admin/.env.local"
fi

echo "Installing dependencies..."
pnpm install

echo "Starting development setup (db + redis + migrations)..."
pnpm run dev:setup

echo "Bootstrap completed."
echo "Run: pnpm run dev:with-db"
