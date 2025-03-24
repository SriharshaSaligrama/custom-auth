import { env } from "@/data/env/server"
import { defineConfig } from "drizzle-kit"

export default defineConfig({
    out: "./drizzle",
    schema: "./db/schema.ts",
    dialect: "postgresql",
    strict: true,
    verbose: true,
    dbCredentials: {
        url: env.DATABASE_URL,
    },
})