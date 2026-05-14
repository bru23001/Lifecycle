import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";

import type { ExportFullEvidenceBundleOptions } from "@/lib/evidence-export";
import { normalizeGateParam } from "@/lib/gateNormalize";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/server/current-user";
import { evidenceLinkedToPhase } from "@/lib/evidence-phase-links";

export const dynamic = "force-dynamic";

function parseBool(
  sp: URLSearchParams,
  key: keyof ExportFullEvidenceBundleOptions,
  defaultValue: boolean,
): boolean {
  const raw = sp.get(key);
  if (raw === null || raw === "") return defaultValue;
  return raw === "1" || raw === "true" || raw === "yes";
}

function parseFullOptions(sp: URLSearchParams): ExportFullEvidenceBundleOptions {
  return {
    includeFiles: parseBool(sp, "includeFiles", true),
    includeManifest: parseBool(sp, "includeManifest", true),
    includePhaseMappings: parseBool(sp, "includePhaseMappings", true),
    includeGateMappings: parseBool(sp, "includeGateMappings", true),
    includeArtifactMappings: parseBool(sp, "includeArtifactMappings", true),
    includeChecksums: parseBool(sp, "includeChecksums", true),
    includeAuditManifest: parseBool(sp, "includeAuditManifest", false),
    redactRestricted: parseBool(sp, "redactRestricted", false),
    includeGateDecisionRecord: parseBool(sp, "includeGateDecisionRecord", false),
  };
}

type EvidenceRow = Prisma.EvidenceItemGetPayload<{
  include: { artifactLinks: { include: { artifact: true } }; phaseLinks: true };
}>;

function mapEvidenceItem(
  e: EvidenceRow,
  opts: ExportFullEvidenceBundleOptions,
): Record<string, unknown> {
  const restricted = e.classification === "restricted";
  const redact = opts.redactRestricted && restricted;

  const item: Record<string, unknown> = {
    id: e.id,
    evidenceCode: e.evidenceCode,
    name: redact ? "[REDACTED]" : e.name,
    description: redact ? "" : e.description,
    evidenceType: e.evidenceType,
    phaseNumber: e.phaseNumber,
    gateCode: e.gateCode,
    classification: redact ? "internal" : e.classification,
    status: e.status,
    completenessPercent: e.completenessPercent,
    fileTypeLabel: e.fileTypeLabel,
    fileSizeBytes: e.fileSizeBytes,
    source: redact ? null : e.source,
    retentionPolicyLabel: e.retentionPolicyLabel,
    tagsJson: e.tagsJson,
    notes: redact ? null : e.notes,
    uploadedByName: e.uploadedByName,
    createdAt: e.createdAt.toISOString(),
    updatedAt: e.updatedAt.toISOString(),
  };

  if (opts.includeChecksums) {
    item.checksum = e.checksum;
  }
  if (opts.includeFiles) {
    item.previewHref = e.previewHref;
    item.downloadHref = e.downloadHref;
  }

  if (opts.includePhaseMappings) {
    const phases = new Set<number>();
    if (e.phaseNumber != null && e.phaseNumber >= 1 && e.phaseNumber <= 14) {
      phases.add(e.phaseNumber);
    }
    for (const pl of e.phaseLinks) {
      if (pl.phaseNumber >= 1 && pl.phaseNumber <= 14) phases.add(pl.phaseNumber);
    }
    item.linkedPhaseNumbers = [...phases].sort((a, b) => a - b);
  }

  return item;
}

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireCurrentUser();
  } catch {
    return NextResponse.json({ error: "Current user is unavailable." }, { status: 401 });
  }

  const { id: projectId } = await context.params;
  const url = new URL(req.url);
  const scope = (url.searchParams.get("scope") ?? "full").toLowerCase();

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      evidenceItems: {
        orderBy: { updatedAt: "desc" },
        include: { artifactLinks: { include: { artifact: true } }, phaseLinks: true },
      },
    },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  if (scope === "selected") {
    const ids = url.searchParams.getAll("selectedId").filter(Boolean);
    const picked = ids.length > 0 ? project.evidenceItems.filter((e) => ids.includes(e.id)) : [];
    const opts = parseFullOptions(url.searchParams);
    const payload = {
      scope: "selected" as const,
      exportedAt: new Date().toISOString(),
      projectId: project.id,
      projectName: project.name,
      bundleOptions: opts,
      items: picked.map((e) => mapEvidenceItem(e, opts)),
    };
    return NextResponse.json(payload, { status: 200 });
  }

  if (scope === "gate") {
    const opts = parseFullOptions(url.searchParams);
    const gateCodeRaw = url.searchParams.get("gateCode")?.trim() ?? "";
    const gateId = gateCodeRaw ? normalizeGateParam(gateCodeRaw) : null;
    if (gateCodeRaw && !gateId) {
      return NextResponse.json({ error: "Invalid gateCode (use G1–G10)." }, { status: 400 });
    }

    const sourceItems =
      gateId ?
        project.evidenceItems.filter((e) => (e.gateCode ?? "UNASSIGNED").toUpperCase() === gateId)
      : project.evidenceItems;

    const byGate: Record<string, string[]> = {};
    for (const e of sourceItems) {
      const g = (e.gateCode ?? "UNASSIGNED").toUpperCase();
      if (!byGate[g]) byGate[g] = [];
      byGate[g].push(e.id);
    }

    let gateDecisionRecord: {
      id: string;
      gateId: string;
      decision: string;
      authorityName: string;
      authorityRole: string;
      nextAction: string;
      evidencePassSnapshot: boolean;
      createdAt: string;
    }[] = [];
    if (opts.includeGateDecisionRecord && gateId) {
      const rows = await prisma.gateDecision.findMany({
        where: { projectId, gateId },
        orderBy: { createdAt: "desc" },
        take: 100,
        select: {
          id: true,
          gateId: true,
          decision: true,
          authorityName: true,
          authorityRole: true,
          nextAction: true,
          evidencePassSnapshot: true,
          createdAt: true,
        },
      });
      gateDecisionRecord = rows.map((r) => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
      }));
    }

    const payload: Record<string, unknown> = {
      scope: "gate" as const,
      exportedAt: new Date().toISOString(),
      projectId: project.id,
      projectName: project.name,
      gateCode: gateId,
      bundleOptions: opts,
      evidenceIdsByGate: byGate,
      items: sourceItems.map((e) => mapEvidenceItem(e, opts)),
    };
    if (gateDecisionRecord.length > 0) {
      payload.gateDecisionRecord = gateDecisionRecord;
    }
    return NextResponse.json(payload, { status: 200 });
  }

  if (scope === "phase") {
    const raw = url.searchParams.get("phaseNumber") ?? url.searchParams.get("phase");
    const phaseNum = raw != null && raw !== "" ? parseInt(raw, 10) : NaN;
    if (!Number.isFinite(phaseNum) || phaseNum < 1 || phaseNum > 14) {
      return NextResponse.json({ error: "Invalid or missing phaseNumber (1–14)." }, { status: 400 });
    }
    const picked = project.evidenceItems.filter((e) => evidenceLinkedToPhase(e, phaseNum));
    const opts = parseFullOptions(url.searchParams);
    const artifactMappings: { evidenceId: string; artifactId: string; templateId: string; localId: string }[] = [];
    if (opts.includeArtifactMappings) {
      for (const e of picked) {
        for (const link of e.artifactLinks) {
          artifactMappings.push({
            evidenceId: e.id,
            artifactId: link.artifactId,
            templateId: link.artifact.templateId,
            localId: link.artifact.localId,
          });
        }
      }
    }
    const payload: Record<string, unknown> = {
      scope: "phase" as const,
      phaseNumber: phaseNum,
      exportedAt: new Date().toISOString(),
      projectId: project.id,
      projectName: project.name,
      bundleOptions: opts,
      items: picked.map((e) => mapEvidenceItem(e, opts)),
    };
    if (artifactMappings.length > 0) {
      payload.artifactMappings = artifactMappings;
    }
    return NextResponse.json(payload, { status: 200 });
  }

  if (scope !== "full") {
    return NextResponse.json({ error: "Invalid scope." }, { status: 400 });
  }

  const bundleOptions = parseFullOptions(url.searchParams);

  const items = project.evidenceItems.map((e) => mapEvidenceItem(e, bundleOptions));

  const phaseMappings: Record<number, string[]> = {};
  if (bundleOptions.includePhaseMappings) {
    for (const e of project.evidenceItems) {
      const phases = new Set<number>();
      if (e.phaseNumber != null && e.phaseNumber >= 1 && e.phaseNumber <= 14) {
        phases.add(e.phaseNumber);
      }
      for (const pl of e.phaseLinks) {
        if (pl.phaseNumber >= 1 && pl.phaseNumber <= 14) phases.add(pl.phaseNumber);
      }
      for (const p of phases) {
        if (!phaseMappings[p]) phaseMappings[p] = [];
        phaseMappings[p].push(e.id);
      }
    }
  }

  const gateMappings: Record<string, string[]> = {};
  if (bundleOptions.includeGateMappings) {
    for (const e of project.evidenceItems) {
      const g = (e.gateCode ?? "UNASSIGNED").toUpperCase();
      if (!gateMappings[g]) gateMappings[g] = [];
      gateMappings[g].push(e.id);
    }
  }

  const artifactMappings: { evidenceId: string; artifactId: string; templateId: string; localId: string }[] = [];
  if (bundleOptions.includeArtifactMappings) {
    for (const e of project.evidenceItems) {
      for (const link of e.artifactLinks) {
        artifactMappings.push({
          evidenceId: e.id,
          artifactId: link.artifactId,
          templateId: link.artifact.templateId,
          localId: link.artifact.localId,
        });
      }
    }
  }

  let auditManifest: { action: string; subjectKind: string; subjectId: string; createdAt: string }[] = [];
  if (bundleOptions.includeAuditManifest) {
    const rows = await prisma.auditEntry.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
      take: 500,
      select: { action: true, subjectKind: true, subjectId: true, createdAt: true },
    });
    auditManifest = rows.map((r) => ({
      action: r.action,
      subjectKind: r.subjectKind,
      subjectId: r.subjectId,
      createdAt: r.createdAt.toISOString(),
    }));
  }

  const manifest = bundleOptions.includeManifest
    ? {
        version: 1,
        exportedAt: new Date().toISOString(),
        projectId: project.id,
        projectName: project.name,
        bundleOptions,
        itemCount: items.length,
      }
    : undefined;

  const payload: Record<string, unknown> = {
    scope: "full",
    exportedAt: new Date().toISOString(),
    projectId: project.id,
    projectName: project.name,
    bundleOptions,
    items,
  };

  if (manifest) payload.manifest = manifest;
  if (bundleOptions.includePhaseMappings) payload.phaseMappings = phaseMappings;
  if (bundleOptions.includeGateMappings) payload.gateMappings = gateMappings;
  if (bundleOptions.includeArtifactMappings) payload.artifactMappings = artifactMappings;
  if (bundleOptions.includeAuditManifest) payload.auditManifest = auditManifest;

  return NextResponse.json(payload, { status: 200 });
}
