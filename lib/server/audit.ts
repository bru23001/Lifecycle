import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/server/current-user";

const SENSITIVE_METADATA_KEYS = /^(password|secret|token|authorization|cookie|set-cookie)$/i;

const MAX_METADATA_JSON_BYTES = 8_192;

export type WriteAuditEntryInput = {
  action: string;
  subjectKind: string;
  subjectId: string;
  projectId?: string | null;
  /** When omitted, uses the seeded solo user id if present. */
  actorId?: string | null;
  metadata?: Record<string, unknown>;
};

function sanitizeMetadata(metadata: Record<string, unknown> | undefined): Prisma.InputJsonValue {
  if (!metadata || Object.keys(metadata).length === 0) {
    return {};
  }
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (SENSITIVE_METADATA_KEYS.test(key)) continue;
    if (typeof value === "string" && value.length > 500) {
      out[key] = `${value.slice(0, 500)}…`;
      continue;
    }
    out[key] = value;
  }
  let encoded = JSON.stringify(out);
  if (encoded.length > MAX_METADATA_JSON_BYTES) {
    encoded = JSON.stringify({
      _truncated: true,
      _originalKeys: Object.keys(out),
    });
  }
  return JSON.parse(encoded) as Prisma.InputJsonValue;
}

/**
 * Persists an `AuditEntry` row. Safe for local / solo workspace; metadata is shallow-redacted.
 */
export async function writeAuditEntry(input: WriteAuditEntryInput) {
  let actorId: string | null;
  if (input.actorId !== undefined) {
    actorId = input.actorId;
  } else {
    const user = await getCurrentUser();
    actorId = user?.id ?? null;
  }

  return prisma.auditEntry.create({
    data: {
      action: input.action,
      subjectKind: input.subjectKind,
      subjectId: input.subjectId,
      projectId: input.projectId ?? null,
      actorId,
      metadata: sanitizeMetadata(input.metadata),
    },
  });
}

/** Alias for {@link writeAuditEntry} — use from server actions and route handlers. */
export const recordAudit = writeAuditEntry;
