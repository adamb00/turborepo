import { config as loadEnv } from "dotenv"
import { resolve } from "node:path"
import { defineConfig, env } from "prisma/config"

const envName = process.env.NODE_ENV ?? "development"
loadEnv({ path: resolve(process.cwd(), `.env.${envName}`) })

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
})
