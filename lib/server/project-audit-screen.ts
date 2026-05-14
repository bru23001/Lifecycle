import type { Prisma } from "@prisma/client";

import { maskEmail, redactSensitive } from "@/lib/audit-event-details";
import { phaseShortLabel } from "@/lib/phaseLabels";
import { prisma } from "@/lib/prisma";
import type {
  ProjectScreenAuditEntry,
  ProjectScreenAuditRelated,
} from "@/types/projects.types";

const FETCH_LIMIT = 200;

function metaRecord(metadata: Prisma.JsonValue): Record<string, unknown> {
  if (metadata && typeof metadata === "object" && !Array.isArray(metadata)) {
    return metadata as Record<string, unknown>;
  }
  return {};
}

function metaStr(m: Record<string, unknown>, key: string): string | undefined {
  const v = m[key];
  return typeof v === "string" ? v : undefined;
}

function metaNum(m: Record<string, unknown>, key: string): number | undefined {
  const v = m[key];
  if (typeof v === "number" && Number.isFinite(v)) return v;
  return undefined;
}

function metaBool(m: Record<string, unknown>, key: string): boolean | undefined {
  const v = m[key];
  return typeof v === "boolean" ? v : undefined;
}

function actorLabel(actor: { name: string | null; email: string } | null): string | null {
  if (!actor) return null;
  const n = actor.name?.trim();
  if (n) return n;
  return actor.email;
}

function humanizeAction(action: string): string {
  return action
    .split(".")
    .map((part) => part.replace(/_/g, " "))
    .join(" · ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function mapParts(
  action: string,
  subjectKind: string,
  subjectId: string,
  metadata: Prisma.JsonValue,
): { title: string; detail: string; lifecycleRelevant: boolean } {
  const m = metaRecord(metadata);
  const sk = `${subjectKind} ${subjectId}`.trim();

  switch (action) {
    case "project.created": {
      const slug = metaStr(m, "slug");
      const vault = metaStr(m, "vaultFolder");
      const bits = [slug && `slug ${slug}`, vault && `vault ${vault}`].filter(Boolean);
      return {
        title: "Project created",
        detail: bits.length > 0 ? bits.join(" · ") : "Workspace initialized",
        lifecycleRelevant: true,
      };
    }
    case "project.meta_updated": {
      const fields = m.fields;
      const fieldList = Array.isArray(fields) ? fields.filter((x): x is string => typeof x === "string") : [];
      return {
        title: "Project profile updated",
        detail:
          fieldList.length > 0 ? `Fields: ${fieldList.slice(0, 8).join(", ")}${fieldList.length > 8 ? "…" : ""}` : sk,
        lifecycleRelevant: false,
      };
    }
    case "gate_review.recorded": {
      const gateId = metaStr(m, "gateId") ?? "—";
      const decision = metaStr(m, "decision") ?? "—";
      const newPhase = metaNum(m, "newPhase");
      const evidencePass = metaBool(m, "evidencePass");
      const phaseBit =
        newPhase !== undefined ? `${phaseShortLabel(newPhase)} (${newPhase})` : "phase unchanged";
      const ev =
        evidencePass === undefined ? "" : evidencePass ? " · evidence pass" : " · evidence not pass";
      return {
        title: "Gate review recorded",
        detail: `${gateId} · ${decision} → ${phaseBit}${ev}`,
        lifecycleRelevant: true,
      };
    }
    case "artifact.saved": {
      const templateId = metaStr(m, "templateId");
      const version = metaStr(m, "version");
      const localId = metaStr(m, "localId");
      return {
        title: "Artifact saved",
        detail: [templateId && `template ${templateId}`, localId, version && `v${version}`]
          .filter(Boolean)
          .join(" · ") || sk,
        lifecycleRelevant: false,
      };
    }
    case "evidence.item_created": {
      const code = metaStr(m, "evidenceCode");
      return {
        title: "Evidence item created",
        detail: code ? `Code ${code}` : sk,
        lifecycleRelevant: false,
      };
    }
    case "evidence.linked_to_artifact": {
      const artifactId = metaStr(m, "artifactId");
      return {
        title: "Evidence linked to artifact",
        detail: artifactId ? `Artifact ${artifactId}` : sk,
        lifecycleRelevant: false,
      };
    }
    case "register.requirement_status_updated": {
      const status = metaStr(m, "status");
      return {
        title: "Requirement status updated",
        detail: status ? `Status → ${status}` : sk,
        lifecycleRelevant: false,
      };
    }
    case "register.feature_row_updated": {
      const status = metaStr(m, "status");
      return {
        title: "Feature row updated",
        detail: status ? `Status → ${status}` : sk,
        lifecycleRelevant: false,
      };
    }
    default: {
      const keys = Object.keys(m);
      const preview = keys.length > 0 ? `Metadata: ${keys.slice(0, 5).join(", ")}${keys.length > 5 ? "…" : ""}` : sk;
      return {
        title: humanizeAction(action),
        detail: preview,
        lifecycleRelevant: false,
      };
    }
  }
}

function hrefForAuditRow(
  projectId: string,
  row: { action: string; subjectKind: string; subjectId: string; metadata: Prisma.JsonValue },
): string | undefined {
  const sk = row.subjectKind.toLowerCase();

  if (row.action === "evidence.item_created" && row.subjectId.length > 0) {
    return `/projects/${projectId}/evidence/${row.subjectId}`;
  }
  if (row.action === "evidence.linked_to_artifact" && row.subjectId.length > 0) {
    return `/projects/${projectId}/evidence/${row.subjectId}`;
  }
  if ((sk === "evidence_item" || sk === "evidenceitem") && row.subjectId.length > 0) {
    return `/projects/${projectId}/evidence/${row.subjectId}`;
  }

  if (row.action === "artifact.saved" && row.subjectId.length > 0) {
    return `/projects/${projectId}/artifacts/${row.subjectId}`;
  }
  if ((sk === "artifact" || sk.endsWith(":artifact")) && row.subjectId.length > 0) {
    return `/projects/${projectId}/artifacts/${row.subjectId}`;
  }
  return undefined;
}

/**
 * Best-effort derivation of related entity deep-links from an audit row.
 *
 * Reads three sources of truth:
 *   1. Subject kind/id (e.g. `subjectKind = "gate"`, `subjectId = "G3"`).
 *   2. Metadata keys we observe in `app/actions/*` (gateId, artifactId, evidenceId, …).
 *   3. The single `hrefForAuditRow` primary link, included here so the
 *      drawer's "related" list always has at least the primary deep-link.
 */
function relatedHrefsForAuditRow(
  projectId: string,
  row: {
    action: string;
    subjectKind: string;
    subjectId: string;
    metadata: Record<string, unknown>;
  },
): ProjectScreenAuditRelated[] {
  const out: ProjectScreenAuditRelated[] = [];
  const seen = new Set<string>();

  const push = (entry: ProjectScreenAuditRelated) => {
    const key = `${entry.kind}:${entry.href}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push(entry);
  };

  const sk = row.subjectKind.toLowerCase();
  if (sk === "gate" && row.subjectId.length > 0) {
    push({
      kind: "gate",
      label: `Gate ${row.subjectId}`,
      href: `/projects/${projectId}/gates/${row.subjectId.toLowerCase()}/review`,
    });
  }
  if (sk === "approval" && row.subjectId.length > 0) {
    push({
      kind: "approval",
      label: `Approval ${row.subjectId.slice(0, 8)}`,
      href: `/approvals?selected=${row.subjectId}`,
    });
  }

  const gateId = metaStr(row.metadata, "gateId");
  if (gateId) {
    push({
      kind: "gate",
      label: `Gate ${gateId}`,
      href: `/projects/${projectId}/gates/${gateId.toLowerCase()}/review`,
    });
  }
  const artifactId = metaStr(row.metadata, "artifactId");
  if (artifactId) {
    push({
      kind: "artifact",
      label: `Artifact ${artifactId.slice(0, 8)}`,
      href: `/projects/${projectId}/artifacts/${artifactId}`,
    });
  }
  const evidenceId = metaStr(row.metadata, "evidenceId");
  if (evidenceId) {
    push({
      kind: "evidence",
      label: `Evidence ${evidenceId.slice(0, 8)}`,
      href: `/projects/${projectId}/evidence/${evidenceId}`,
    });
  }

  const primary = hrefForAuditRow(projectId, {
    action: row.action,
    subjectKind: row.subjectKind,
    subjectId: row.subjectId,
    metadata: row.metadata as Prisma.JsonValue,
  });
  if (primary) {
    const kind: ProjectScreenAuditRelated["kind"] = primary.includes("/evidence/")
      ? "evidence"
      : primary.includes("/artifacts/")
        ? "artifact"
        : primary.includes("/gates/")
          ? "gate"
          : "artifact";
    push({ kind, label: "Primary subject", href: primary });
  }

  return out;
}

export async function getProjectAuditScreenEntries(projectId: string): Promise<ProjectScreenAuditEntry[]> {
  const rows = await prisma.auditEntry.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
    take: FETCH_LIMIT,
    include: { actor: { select: { name: true, email: true } } },
  });

  return rows.map((row) => {
    const { title, detail, lifecycleRelevant } = mapParts(row.action, row.subjectKind, row.subjectId, row.metadata);
    const sanitized = redactSensitive(metaRecord(row.metadata));
    return {
      id: row.id,
      createdAt: row.createdAt.toISOString(),
      action: row.action,
      title,
      subjectKind: row.subjectKind,
      subjectId: row.subjectId,
      detail,
      actorLabel: actorLabel(row.actor),
      actorEmail: row.actor?.email ? maskEmail(row.actor.email) : null,
      metadata: sanitized,
      lifecycleRelevant,
      href: hrefForAuditRow(projectId, row),
      relatedHrefs: relatedHrefsForAuditRow(projectId, {
        action: row.action,
        subjectKind: row.subjectKind,
        subjectId: row.subjectId,
        metadata: sanitized,
      }),
    };
  });
}
