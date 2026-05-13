import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["**/*.test.ts"],
    exclude: ["node_modules", ".next"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary"],
      include: [
        "lib/approval-decision.ts",
        "lib/waiver.ts",
        "lib/server/metrics.ts",
        "lib/server/logger.ts",
        "lib/gateStatus.ts",
        "lib/workspacePhases.ts",
      ],
      exclude: [
        "**/*.test.ts",
        "**/*.d.ts",
        "node_modules/**",
        "prisma/seed.ts",
        "scripts/**",
      ],
      thresholds: {
        lines: 70,
        branches: 65,
        functions: 75,
        statements: 70,
      },
    },
  },
  resolve: {
    alias: {
      "@": root,
    },
  },
});
