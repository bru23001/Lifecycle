import { prisma } from "@/lib/prisma";
import { projectTemplateWizardHref } from "@/lib/projects-url";
import type { GlobalSearchResultItem } from "@/types/global-search.types";

const MIN_LEN = 2;
const MAX_LEN = 64;
const MAX_TOTAL = 24;

export function normalizeGlobalSearchQuery(raw: string): string {
  return raw.trim().slice(0, MAX_LEN);
}

function pushUnique(
  out: GlobalSearchResultItem[],
  item: GlobalSearchResultItem,
  seen: Set<string>,
): void {
  if (seen.has(item.href) || out.length >= MAX_TOTAL) return;
  seen.add(item.href);
  out.push(item);
}

export async function executeGlobalSearch(rawQuery: string): Promise<GlobalSearchResultItem[]> {
  const q = normalizeGlobalSearchQuery(rawQuery);
  if (q.length < MIN_LEN) return [];

  const out: GlobalSearchResultItem[] = [];
  const seen = new Set<string>();

  try {
    const [projects, artifacts, evidence, approvals, gateDecisions] = await Promise.all([
      prisma.project.findMany({
        where: {
          archivedAt: null,
          OR: [{ name: { contains: q } }, { slug: { contains: q } }, { vaultFolder: { contains: q } }],
        },
        take: 6,
        orderBy: { updatedAt: "desc" },
        select: { id: true, name: true, slug: true, currentPhase: true },
      }),
      prisma.artifact.findMany({
        where: {
          OR: [{ templateId: { contains: q } }, { localId: { contains: q } }],
        },
        take: 8,
        orderBy: { updatedAt: "desc" },
        include: { project: { select: { id: true, name: true } } },
      }),
      prisma.evidenceItem.findMany({
        where: {
          OR: [{ evidenceCode: { contains: q } }, { name: { contains: q } }],
        },
        take: 8,
        orderBy: { updatedAt: "desc" },
        include: { project: { select: { id: true, name: true } } },
      }),
      prisma.approval.findMany({
        where: {
          OR: [{ gateId: { contains: q } }, { approvalType: { contains: q } }],
        },
        take: 8,
        orderBy: { updatedAt: "desc" },
        include: { project: { select: { id: true, name: true } } },
      }),
      prisma.gateDecision.findMany({
        where: {
          OR: [{ gateId: { contains: q } }, { decision: { contains: q } }],
        },
        take: 6,
        orderBy: { createdAt: "desc" },
        include: { project: { select: { id: true, name: true } } },
      }),
    ]);

    for (const p of projects) {
      const phase = Math.min(14, Math.max(1, p.currentPhase));
      pushUnique(
        out,
        {
          id: `project-${p.id}`,
          type: "project",
          title: p.name,
          subtitle: `Project · ${p.slug}`,
          href: `/projects/${p.id}`,
        },
        seen,
      );
      if (projects.length === 1) {
        pushUnique(
          out,
          {
            id: `workspace-${p.id}`,
            type: "workspace",
            title: `Workspace — ${p.name}`,
            subtitle: `Phase ${phase} of 14`,
            href: `/projects/${p.id}/workspace?phase=${phase}`,
          },
          seen,
        );
        pushUnique(
          out,
          {
            id: `trace-${p.id}`,
            type: "traceability",
            title: `Traceability — ${p.name}`,
            subtitle: "Coverage matrix",
            href: `/projects/${p.id}/traceability?phase=${phase}`,
          },
          seen,
        );
        pushUnique(
          out,
          {
            id: `reports-${p.id}`,
            type: "reports",
            title: `Reports — ${p.name}`,
            subtitle: "Report hub",
            href: `/projects/${p.id}/reports`,
          },
          seen,
        );
      }
    }

    for (const a of artifacts) {
      pushUnique(
        out,
        {
          id: `artifact-${a.id}`,
          type: "artifact",
          title: `${a.templateId} · ${a.localId}`,
          subtitle: a.project.name,
          href: `/projects/${a.projectId}/artifacts/${a.id}`,
        },
        seen,
      );
    }

    for (const e of evidence) {
      pushUnique(
        out,
        {
          id: `evidence-${e.id}`,
          type: "evidence",
          title: `${e.evidenceCode} — ${e.name}`,
          subtitle: e.project.name,
          href: `/projects/${e.projectId}/evidence/${e.id}`,
        },
        seen,
      );
    }

    for (const ap of approvals) {
      const title =
        ap.approvalType === "gate_review" && ap.gateId
          ? `${ap.gateId} approval · ${ap.project.name}`
          : `Approval · ${ap.project.name}`;
      pushUnique(
        out,
        {
          id: `approval-${ap.id}`,
          type: "approval",
          title,
          subtitle: `${ap.approvalType.replace(/_/g, " ")} · ${ap.status}`,
          href: `/approvals/${ap.id}`,
        },
        seen,
      );
      if (ap.approvalType === "gate_review" && ap.gateId) {
        pushUnique(
          out,
          {
            id: `gate-review-${ap.id}`,
            type: "gate_decision",
            title: `Gate review · ${ap.gateId}`,
            subtitle: ap.project.name,
            href: `/projects/${ap.projectId}/gates/${ap.gateId.toLowerCase()}/review`,
          },
          seen,
        );
      }
    }

    for (const g of gateDecisions) {
      pushUnique(
        out,
        {
          id: `gate-decision-${g.id}`,
          type: "gate_decision",
          title: `${g.gateId} — ${g.decision}`,
          subtitle: g.project.name,
          href: `/projects/${g.projectId}/gates/${g.gateId.toLowerCase()}/review`,
        },
        seen,
      );
    }

    const templateProjectId =
      projects[0]?.id ??
      (
        await prisma.project.findFirst({
          where: { archivedAt: null },
          orderBy: { updatedAt: "desc" },
          select: { id: true },
        })
      )?.id;

    if (templateProjectId) {
      const catalogHits = await prisma.templateRegistryEntry.findMany({
        where: {
          status: "active",
          OR: [{ templateCode: { contains: q } }, { name: { contains: q } }],
        },
        take: 6,
        orderBy: { templateCode: "asc" },
        select: { id: true, templateCode: true, name: true },
      });
      for (const t of catalogHits) {
        pushUnique(
          out,
          {
            id: `template-${t.id}`,
            type: "template",
            title: `${t.templateCode} — ${t.name}`,
            subtitle: "Template wizard",
            href: projectTemplateWizardHref(templateProjectId, t.templateCode),
          },
          seen,
        );
      }
    }
  } catch {
    return [];
  }

  return out;
}
