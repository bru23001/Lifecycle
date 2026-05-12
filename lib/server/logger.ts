/**
 * Structured JSON logging (CYBERCUBE 4.5 — solo-local baseline).
 * Uses `pino`; avoid logging secrets or raw PII.
 */
import pino from "pino";

const SERVICE = "lifecycle-platform";

export const logger = pino({
  level:
    process.env.LOG_LEVEL ??
    (process.env.NODE_ENV === "production" ? "info" : "debug"),
  base: {
    service: SERVICE,
    version: process.env.npm_package_version ?? "0.1.0",
    environment: process.env.NODE_ENV ?? "development",
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: [
      "password",
      "secret",
      "token",
      "authorization",
      "*.password",
      "*.secret",
      "*.token",
    ],
    remove: true,
  },
});

export function logInfo(fields: Record<string, unknown>) {
  logger.info(fields);
}

export function logWarn(fields: Record<string, unknown>) {
  logger.warn(fields);
}

export function logError(fields: Record<string, unknown> & { err?: unknown }) {
  logger.error(fields);
}
