/**
 * Loads `.env` for Prisma CLI (`migrate`, `db push`, etc.). The Next.js app also loads
 * `.env` during `next build` / `next dev` independently — keep `DATABASE_URL` defined for both.
 */
import "dotenv/config";

import { defineConfig } from "prisma/config";

/**
 * Prisma CLI configuration (replaces deprecated `package.json#prisma`).
 * @see https://www.prisma.io/docs/orm/reference/prisma-config-reference
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
});
