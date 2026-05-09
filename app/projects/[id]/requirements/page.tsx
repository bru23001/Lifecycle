import Link from "next/link";
import { notFound } from "next/navigation";

import { RequirementsRegisterTable } from "@/components/requirements-register-table";
import { Button } from "@/components/ui/button";
import {
  buildEntityLabelMaps,
  summarizeRequirementTraceParts,
} from "@/lib/registerTraceLabels";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const KINDS = ["CRS", "SRS_FR", "SRS_NFR", "NFR"] as const;
const STATUSES = ["Draft", "Baselined", "Deferred", "Withdrawn"] as const;

function parseKind(v: unknown): string {
  if (typeof v !== "string" || v === "") return "";
  return KINDS.includes(v as (typeof KINDS)[number]) ? v : "";
}

function parseStatus(v: unknown): string {
  if (typeof v !== "string" || v === "") return "";
  return STATUSES.includes(v as (typeof STATUSES)[number]) ? v : "";
}

export default async function RequirementsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const kindRaw = typeof sp.kind === "string" ? sp.kind : "";
  const statusRaw = typeof sp.status === "string" ? sp.status : "";
  const kindFilter = parseKind(kindRaw);
  const statusFilter = parseStatus(statusRaw);

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) notFound();

  const where: {
    projectId: string;
    kind?: string;
    status?: string;
  } = { projectId: id };
  if (kindFilter) {
    where.kind = kindFilter;
  }
  if (statusFilter) {
    where.status = statusFilter;
  }

  const [reqRows, links, allReqLabels, allFeatLabels] = await Promise.all([
    prisma.requirement.findMany({
      where,
      orderBy: [{ kind: "asc" }, { localId: "asc" }],
    }),
    prisma.traceLink.findMany({
      where: { projectId: id },
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

  const rows = reqRows.map((r) => ({
    id: r.id,
    localId: r.localId,
    kind: r.kind,
    title: r.title,
    status: r.status,
    traceParts: summarizeRequirementTraceParts({
      requirementId: r.id,
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
            <h1 className="text-2xl font-semibold tracking-tight">Requirements</h1>
          </div>
          <Link
            href={`/projects/${id}/form/A-1`}
            className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-muted/50"
          >
            Edit CRS / SRS / NFR (forms)
          </Link>
        </header>

        <form
          method="get"
          action={`/projects/${id}/requirements`}
          className="flex flex-wrap items-end gap-4 rounded-2xl border bg-card p-4 shadow-sm"
        >
          <div className="grid gap-1">
            <label htmlFor="kind" className="text-xs font-medium text-muted-foreground">
              Kind
            </label>
            <select
              id="kind"
              name="kind"
              defaultValue={kindFilter}
              className="min-w-[10rem] rounded-lg border bg-background px-3 py-2 text-sm"
            >
              <option value="">All kinds</option>
              {KINDS.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>
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
          <Button type="submit" size="sm">
            Apply filters
          </Button>
          <Link
            href={`/projects/${id}/requirements`}
            className="self-center text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            Clear
          </Link>
        </form>

        <RequirementsRegisterTable projectId={id} rows={rows} />
      </div>
    </div>
  );
}
