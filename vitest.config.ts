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
      exclude: ["**/*.test.ts", "**/*.d.ts", "node_modules/**"],
      thresholds: {
        lines: 70,
        branches: 55,
        functions: 65,
        statements: 65,
      },
    },
  },
  resolve: {
    alias: {
      "@": root,
    },
  },
});
