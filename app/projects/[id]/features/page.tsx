import Link from "next/link";
import { notFound } from "next/navigation";

import { FeaturesRegisterTable } from "@/components/features-register-table";
import { Button } from "@/components/ui/button";
import {
  buildEntityLabelMaps,
  summarizeFeatureTraceParts,
} from "@/lib/registerTraceLabels";
import { prisma } from "@/lib/prisma";
import { projectTemplateWizardHref } from "@/lib/projects-url";

export const dynamic = "force-dynamic";

const STATUSES = ["Draft", "Baselined", "Deferred", "Withdrawn"] as const;
const SCOPES = ["InScope", "OutOfScope", "Deferred"] as const;

function parseStatus(v: unknown): string {
  if (typeof v !== "string" || v === "") return "";
  return STATUSES.includes(v as (typeof STATUSES)[number]) ? v : "";
}

function parseScope(v: unknown): string {
  if (typeof v !== "string" || v === "") return "";
  return SCOPES.includes(v as (typeof SCOPES)[number]) ? v : "";
}

export default async function FeaturesPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const statusFilter = parseStatus(typeof sp.status === "string" ? sp.status : "");
  const scopeFilter = parseScope(typeof sp.scope === "string" ? sp.scope : "");
  const focusFeatureRaw = typeof sp.focus === "string" ? sp.focus : "";
  const focusFeatureId = focusFeatureRaw.trim();

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) notFound();

  const where: {
    projectId: string;
    status?: string;
    scopeStatus?: string;
  } = { projectId: id };
  if (statusFilter) {
    where.status = statusFilter;
  }
  if (scopeFilter) {
    where.scopeStatus = scopeFilter;
  }

  const [featRows, links, allReqLabels, allFeatLabels] = await Promise.all([
    prisma.feature.findMany({
      where,
      orderBy: { localId: "asc" },
    }),
    prisma.traceLink.findMany({
      where: { projectId: id, deletedAt: null },
      select: {
        fromKind: true,
        fromId: true,
        toKind: true,
        toId: true,
        relation: true,
      },
    }),
    prisma.requirement.findMany({
      where: { projectId: id },
      select: { id: true, localId: true },
    }),
    prisma.feature.findMany({
      where: { projectId: id },
      select: { id: true, localId: true },
    }),
  ]);

  const maps = buildEntityLabelMaps({
    requirementRows: allReqLabels,
    featureRows: allFeatLabels,
  });

  const rows = featRows.map((f) => ({
    id: f.id,
    localId: f.localId,
    title: f.title,
    priority: f.priority,
    status: f.status,
    scopeStatus: f.scopeStatus,
    traceParts: summarizeFeatureTraceParts({
      featureId: f.id,
      links,
      maps,
      maxParts: 8,
    }),
  }));

  return (
    <div className="min-h-full bg-background px-4 py-10 text-foreground">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">
              <Link href="/projects" className="underline-offset-4 hover:underline">
                Projects
              </Link>
              {" · "}
              <Link
                href={`/projects/${id}`}
                className="underline-offset-4 hover:underline"
              >
                {project.name}
              </Link>
            </p>
            <h1 className="text-2xl font-semibold tracking-tight">Features</h1>
          </div>
          <Link
            href={projectTemplateWizardHref(id, "A-9")}
            className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-muted/50"
          >
            Edit features (A-9)
          </Link>
        </header>

        <form
          method="get"
          action={`/projects/${id}/features`}
          className="flex flex-wrap items-end gap-4 rounded-2xl border bg-card p-4 shadow-sm"
        >
          <div className="grid gap-1">
            <label htmlFor="status" className="text-xs font-medium text-muted-foreground">
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={statusFilter}
              className="min-w-[10rem] rounded-lg border bg-background px-3 py-2 text-sm"
            >
              <option value="">All statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-1">
            <label htmlFor="scope" className="text-xs font-medium text-muted-foreground">
              Scope
            </label>
            <select
              id="scope"
              name="scope"
              defaultValue={scopeFilter}
              className="min-w-[10rem] rounded-lg border bg-background px-3 py-2 text-sm"
            >
              <option value="">All scopes</option>
              {SCOPES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit" size="sm">
            Apply filters
          </Button>
          <Link
            href={`/projects/${id}/features`}
            className="self-center text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            Clear
          </Link>
        </form>

        <FeaturesRegisterTable
          projectId={id}
          rows={rows}
          focusFeatureId={focusFeatureId || undefined}
        />
      </div>
    </div>
  );
}
