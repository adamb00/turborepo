# Turborepo Template

Monorepo alkalmazás `admin` (Next.js), `api` (NestJS) és közös `packages/*` workspace-ekkel.

## Requirements

- Node.js `>=20`
- `pnpm` (`packageManager`: `pnpm@10.33.2`)
- Docker + Docker Compose (dev DB/Redis/Maildev stackhez)

## Environment fájlok

Ez a repo környezetenként külön env fájlokat vár.
`pnpm run bootstrap` automatikusan létrehozza ezeket, és a DB értékeket a projekt mappanevéből állítja:
`POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` = `<folder-name>`.
Docker parancsok (`db:up/down/reset/logs`) explicit a root `/.env.development` fájlt használják.

### 1) Root szint (`/`)

Ide kerüljenek a Docker/dev stack és közös DB kapcsolati változók.

- `.env.example` (template)
- `.env.development` (saját, gitignore)
- `.env.production` (opcionális, gitignore)

Szükséges változók:

- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_DB`
- `POSTGRES_HOST`
- `POSTGRES_HOST_PORT`
- `REDIS_HOST_PORT`

### 2) API app (`apps/api`)

Ide kerüljenek az API-specifikus változók.

- `apps/api/.env.example` (template)
- `apps/api/.env.development` (saját, gitignore)
- `apps/api/.env.production` (opcionális, gitignore)

Szükséges változók:

- `NODE_ENV` (`development` | `production`)
- `PORT` (pl. `8000`)
- `ADMIN_URL` (pl. `http://localhost:3000`)
- `AUTH_SECRET`
- `REDIS_URL` (pl. `redis://localhost:6380`)
- `DATABASE_URL` (vagy a `POSTGRES_*` fallback változók)
- `SMTP_HOST`
- `SMTP_PORT`
- `EMAIL_FROM`

### 3) Admin app (`apps/admin`)

Ide kerüljenek az admin frontend változói.

- `apps/admin/.env.example` (template)
- `apps/admin/.env.local` (saját, gitignore, Next.js)
- `apps/admin/.env.development` (opcionális)
- `apps/admin/.env.production` (opcionális, gitignore)

Szükséges változók:

- `API_URL` (pl. `http://localhost:8000`)
- `NEXT_PUBLIC_API_URL` (kliens oldali használathoz, ha szükséges)

### 4) Packages (`packages/*`)

Jelenleg env-et használó package:

- `packages/database/.env.example` (template)
- `packages/database/.env.development` (saját, gitignore)
- `packages/database/.env.production` (opcionális, gitignore)

Szükséges változók (`packages/database`):

- `NODE_ENV`
- `DATABASE_URL` (elsődleges)
- `POSTGRES_USER` (fallback)
- `POSTGRES_PASSWORD` (fallback)
- `POSTGRES_HOST` (fallback)
- `POSTGRES_HOST_PORT` (fallback)
- `POSTGRES_DB` (fallback)

## Gyors indulás (dev)

```bash
pnpm run bootstrap
pnpm dev:with-db
```

## Project Structure

- `apps/admin`: Next.js admin frontend
- `apps/api`: NestJS API
- `packages/database`: Prisma schema, kliens, migrációk
- `packages/ui`: megosztott UI komponensek
- `packages/*`: közös auth/validation/utils/config workspace-ek
- `scripts/*`: fejlesztői automatizálás

## Common Commands

```bash
pnpm run bootstrap    # teljes init: env-ek generálása + AUTH_SECRET + install + db setup+migrate
pnpm run setup        # install + env fájlok létrehozása + db/redis/maildev start
pnpm run dev          # összes app dev módban (turbo)
pnpm run dev:with-db  # dev setup + Prisma Studio + dev
pnpm run verify       # lint + typecheck + build
pnpm run db:up        # db/redis/maildev start
pnpm run db:down      # db/redis/maildev stop
pnpm run db:migrate:dev
```

## Template Usage

1. Használd a repót GitHub template-ként vagy klónozd.
2. Futtasd: `pnpm run bootstrap`.
3. Ellenőrizd/env finomítsd a létrejött env fájlokat:
`/.env.development`, `apps/api/.env.development`, `packages/database/.env.development`, `apps/admin/.env.local`.
4. Indítsd a fejlesztést: `pnpm run dev:with-db`.
5. PR előtt ellenőrzés: `pnpm run verify`.

## Troubleshooting

- `Error: P1001`: DB még nem állt fel; futtasd újra `pnpm run dev:setup`.
- `Error: P1000`: hibás DB credential; ellenőrizd `DATABASE_URL` vagy `POSTGRES_*`.
- API nem elérhető adminból: ellenőrizd `apps/admin/.env.local` `API_URL` értékét.
