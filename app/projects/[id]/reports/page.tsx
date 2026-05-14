import Link from "next/link";
import { notFound } from "next/navigation";

import { AuthenticatedAppShell } from "@/components/lifecycle-workspace/authenticated-app-shell";
import { Breadcrumbs } from "@/components/lifecycle-workspace/breadcrumbs";
import { TopHeader } from "@/components/lifecycle-workspace/top-header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { mergeReportsFilters, reportsFiltersToSearchParams } from "@/lib/reports-url";
import { projectOverviewHref } from "@/lib/projects-url";
import { displayFromCurrentUser, getCurrentUser } from "@/lib/server/current-user";

export const dynamic = "force-dynamic";

function parsePhaseParam(raw: string | undefined): number | undefined {
  if (!raw) return undefined;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1 || n > 14) return undefined;
  return n;
}

export default async function ProjectReportsHubPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ phase?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const project = await prisma.project.findUnique({
    where: { id },
    select: { id: true, name: true, vaultFolder: true, currentPhase: true },
  });
  if (!project) notFound();

  const userDisplay = displayFromCurrentUser(await getCurrentUser());
  const phase = parsePhaseParam(sp.phase?.trim());
  const filters = mergeReportsFilters(project.id, { phaseNumber: phase ?? "all" });
  const reportQuery = reportsFiltersToSearchParams(filters).toString();
  const qSuffix = reportQuery ? `?${reportQuery}` : "";

  const links: { href: string; title: string; description: string }[] = [
    {
      href: `/projects/${project.id}/reports/lifecycle-status${qSuffix}`,
      title: "Lifecycle Status Report",
      description: "Progress, current phase, and blocker counts.",
    },
    {
      href: `/projects/${project.id}/reports/gate-decisions${qSuffix}`,
      title: "Gate Decision Report",
      description: "Recorded gate outcomes and conditions.",
    },
    {
      href: `/projects/${project.id}/reports/traceability${qSuffix}`,
      title: "Traceability Report",
      description: "Coverage across requirements, design, and tests.",
    },
    {
      href: `/projects/${project.id}/reports/missing-evidence${qSuffix}`,
      title: "Missing Evidence Report",
      description: "Gaps and remediation targets.",
    },
    {
      href: `/projects/${project.id}/reports/approval-history${qSuffix}`,
      title: "Approval History Report",
      description: "Artifact approvals and reviewers.",
    },
    {
      href: `/projects/${project.id}/reports/evidence-package${qSuffix}`,
      title: "Full Project Evidence Package",
      description: "Bundled evidence views and export options.",
    },
  ];

  return (
    <AuthenticatedAppShell
      projectId={project.id}
      projectName={project.name}
      phaseSummary="Reports"
      phaseProgressPct={40}
      navActive="reports"
      projectCurrentPhase={project.currentPhase}
      navPhaseScope={phase}
      workspaceHref={
        phase !== undefined
          ? `/projects/${project.id}/workspace?phase=${phase}`
          : `/projects/${project.id}/workspace?phase=${project.currentPhase}`
      }
    >
      <TopHeader
        title="Project reports"
        userInitials={userDisplay.initials}
        userName={userDisplay.name}
        userRole={userDisplay.role}
      />
      <main className="mx-auto w-full max-w-3xl flex-1 overflow-y-auto bg-[var(--app-bg)] px-5 py-6">
        <Breadcrumbs
          items={[
            { label: "Projects", href: "/projects" },
            { label: project.name, href: projectOverviewHref(project.id) },
            { label: "Reports" },
          ]}
        />
        <header className="mt-6 space-y-2" data-testid="project-reports-hub">
          <h1 className="text-2xl font-semibold text-foreground">Project reports</h1>
          <p className="text-sm text-muted-foreground">
            {phase
              ? `Showing report shortcuts scoped to workspace phase ${phase}. Filters are passed to each report via query string.`
              : "Open a report to review lifecycle, gates, traceability, evidence, and approvals for this project."}
          </p>
        </header>

        <ul className="mt-8 space-y-3">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className={cn(
                  buttonVariants({ variant: "outline", size: "default" }),
                  "flex h-auto min-h-10 w-full flex-col items-start gap-1 py-3 text-left font-normal",
                )}
              >
                <span className="text-sm font-semibold text-foreground">{l.title}</span>
                <span className="text-xs font-normal text-muted-foreground">{l.description}</span>
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-8 text-xs text-muted-foreground">
          For advanced filters and exports, open any report — the full reports workspace is available from there.
        </p>
      </main>
    </AuthenticatedAppShell>
  );
}
