import { config as loadEnv } from "dotenv"
import { existsSync } from "node:fs"
import { createRequire } from "node:module"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { PrismaPg } from "@prisma/adapter-pg"
import type { PrismaClient as PrismaClientType } from "@prisma/client"

const moduleDir =
  typeof __dirname !== "undefined"
    ? __dirname
    : dirname(fileURLToPath(import.meta.url))
const envName = process.env.NODE_ENV ?? "development"

const findWorkspaceEnvCandidates = (startDir: string) => {
  const candidates: string[] = []
  let current = resolve(startDir)
  const root = resolve("/")

  while (true) {
    candidates.push(resolve(current, `packages/database/.env.${envName}`))
    candidates.push(resolve(current, "packages/database/.env"))
    candidates.push(resolve(current, `.env.${envName}`))
    candidates.push(resolve(current, ".env.local"))
    candidates.push(resolve(current, ".env"))

    if (current === root) {
      break
    }

    const parent = resolve(current, "..")
    if (parent === current) {
      break
    }
    current = parent
  }

  return candidates
}

const envCandidates = [
  resolve(moduleDir, `../.env.${envName}`),
  resolve(moduleDir, "../.env"),
  resolve(process.cwd(), `.env.${envName}`),
  resolve(process.cwd(), ".env.local"),
  resolve(process.cwd(), ".env"),
  ...findWorkspaceEnvCandidates(process.cwd()),
]

for (const envPath of envCandidates) {
  if (existsSync(envPath)) {
    loadEnv({ path: envPath })
  }
}

const connectionString =
  process.env.DATABASE_URL ??
  `postgresql://${encodeURIComponent(process.env.POSTGRES_USER!)}:${encodeURIComponent(process.env.POSTGRES_PASSWORD!)}@${process.env.POSTGRES_HOST!}:${process.env.POSTGRES_HOST_PORT!}/${process.env.POSTGRES_DB!}?schema=public`

try {
  new URL(connectionString)
} catch {
  throw new Error(
    "Invalid database connection string. Set a valid DATABASE_URL or POSTGRES_* variables."
  )
}

const adapter = new PrismaPg({
  connectionString,
})

const runtimeRequire =
  typeof require === "function" ? require : createRequire(import.meta.url)
const { PrismaClient } = runtimeRequire("@prisma/client") as {
  PrismaClient: new (options?: { adapter: PrismaPg }) => PrismaClientType
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClientType }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
