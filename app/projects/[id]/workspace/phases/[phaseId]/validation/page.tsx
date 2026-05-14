import Link from "next/link";
import { notFound } from "next/navigation";

import { AuthenticatedAppShell } from "@/components/lifecycle-workspace/authenticated-app-shell";
import { Breadcrumbs } from "@/components/lifecycle-workspace/breadcrumbs";
import { PhaseValidationExportButton } from "@/components/lifecycle-workspace/phase-validation-export-button";
import { TopHeader } from "@/components/lifecycle-workspace/top-header";
import { displayFromCurrentUser, getCurrentUser } from "@/lib/server/current-user";
import { prisma } from "@/lib/prisma";
import {
  applyDismissedValidationWarnings,
  getWorkspacePhaseDetail,
  parseWorkspacePhaseDetailsJson,
} from "@/lib/workspacePhaseDetails";
import { buildGateMissingRequirements, buildWorkspacePhaseSlice } from "@/lib/workspacePhaseWorkspaceSlice";
import { gateHeaderDisplayName, workspacePhaseMeta, workspacePhasePurpose } from "@/lib/workspacePhases";

export const dynamic = "force-dynamic";

export default async function PhaseValidationReportPage({
  params,
}: {
  params: Promise<{ id: string; phaseId: string }>;
}) {
  const { id, phaseId } = await params;
  const n = Number.parseInt(phaseId, 10);
  if (!Number.isFinite(n) || n < 1 || n > 14) {
    notFound();
  }

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      artifacts: {
        select: {
          id: true,
          templateId: true,
          version: true,
          status: true,
          updatedAt: true,
          markdownPath: true,
        },
        orderBy: { updatedAt: "desc" },
      },
    },
  });

  if (!project) {
    notFound();
  }

  const userDisplay = displayFromCurrentUser(await getCurrentUser());
  const slice = buildWorkspacePhaseSlice(project, n, userDisplay);
  const detailsMap = parseWorkspacePhaseDetailsJson(project.workspacePhaseDetailsJson);
  const phaseDetail = getWorkspacePhaseDetail(detailsMap, n);
  const warnings = applyDismissedValidationWarnings(
    slice.validationWarnings,
    phaseDetail.dismissedValidationWarnings,
  );

  const meta = workspacePhaseMeta(n);
  const gateId = meta.gate;
  const templatesComplete =
    slice.templateRows.length === 0 || slice.templateRows.every((t) => t.status === "Completed");
  const gateReady =
    templatesComplete &&
    slice.evidenceRows.length > 0 &&
    warnings.filter((w) => w.severity !== "info").length === 0;
  const missing = buildGateMissingRequirements(
    slice.templateRows,
    slice.evidenceRows.length,
    warnings,
  );

  const errors = warnings.filter((w) => w.severity === "error");
  const warns = warnings.filter((w) => w.severity === "warning");
  const infos = warnings.filter((w) => w.severity === "info");

  const exportPayload = {
    exportedAt: new Date().toISOString(),
    projectId: project.id,
    projectName: project.name,
    phaseNumber: n,
    phaseName: meta.title,
    summary: {
      total: warnings.length,
      errors: errors.length,
      warnings: warns.length,
      informational: infos.length,
      blocking: errors.length > 0,
      gateReady,
    },
    affectedObjects: warnings.map((w) => ({
      id: w.id,
      severity: w.severity,
      message: w.message,
      templateId: w.affectedTemplateId ?? w.relatedObjectId,
      ruleId: w.ruleId,
    })),
    recommendedFixes: warnings.map((w) => ({
      id: w.id,
      fix: w.recommendedFix ?? w.message,
    })),
    missingRequirements: missing,
    warnings,
  };

  const phaseProgressPct = Math.max(10, Math.round((Math.min(14, Math.max(1, n)) / 14) * 100));

  return (
    <AuthenticatedAppShell
      projectId={project.id}
      projectName={project.name}
      phaseSummary={`Phase ${n} validation`}
      phaseProgressPct={phaseProgressPct}
      navActive="lifecycle"
      projectCurrentPhase={project.currentPhase}
    >
      <TopHeader
        title="Phase validation report"
        userInitials={userDisplay.initials}
        userName={userDisplay.name}
        userRole={userDisplay.role}
      />
      <main className="mx-auto w-full max-w-3xl flex-1 overflow-y-auto bg-[var(--app-bg)] px-5 py-6">
        <Breadcrumbs
          items={[
            { label: "Projects", href: "/projects" },
            { label: project.name, href: `/projects/${project.id}/workspace?phase=${n}` },
            { label: `Phase ${n} validation` },
          ]}
        />
        <header className="mt-6 space-y-2" data-testid="phase-validation-report">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Phase {n} of 14</p>
          <h1 className="text-2xl font-semibold text-foreground">{meta.title}</h1>
          <p className="text-sm text-muted-foreground">{workspacePhasePurpose(n)}</p>
        </header>

        <div className="mt-8 space-y-8 text-sm">
          <section>
            <h2 className="text-sm font-semibold text-foreground">Validation summary</h2>
            <ul className="mt-2 list-inside list-disc text-foreground/90">
              <li>Total findings: {warnings.length}</li>
              <li>Errors: {errors.length}</li>
              <li>Warnings: {warns.length}</li>
              <li>Informational: {infos.length}</li>
              <li>Blocking status: {errors.length > 0 ? "Blocked (errors present)" : "No error-severity blockers"}</li>
              <li>
                Gate {gateId ? `${gateId} (${gateHeaderDisplayName(gateId)})` : "—"} readiness:{" "}
                {gateReady ? "Ready" : "Not ready"}
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-foreground">Errors</h2>
            {errors.length === 0 ? (
              <p className="mt-2 text-muted-foreground">None.</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {errors.map((w) => (
                  <li key={w.id} className="rounded-md border border-red-200 bg-red-50/60 px-3 py-2 text-foreground/90 dark:border-red-900/50 dark:bg-red-950/20">
                    <span className="font-semibold">Error</span> — {w.message}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="text-sm font-semibold text-foreground">Warnings</h2>
            {warns.length === 0 ? (
              <p className="mt-2 text-muted-foreground">None.</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {warns.map((w) => (
                  <li key={w.id} className="rounded-md border border-amber-200 bg-amber-50/50 px-3 py-2 text-foreground/90 dark:border-amber-900/40 dark:bg-amber-950/20">
                    {w.message}
                    {w.recommendedFix ? (
                      <p className="mt-1 text-xs text-muted-foreground">Fix: {w.recommendedFix}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="text-sm font-semibold text-foreground">Informational notices</h2>
            {infos.length === 0 ? (
              <p className="mt-2 text-muted-foreground">None.</p>
            ) : (
              <ul className="mt-2 space-y-1 text-foreground/90">
                {infos.map((w) => (
                  <li key={w.id}>{w.message}</li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="text-sm font-semibold text-foreground">Affected objects</h2>
            {warnings.length === 0 ? (
              <p className="mt-2 text-muted-foreground">No findings.</p>
            ) : (
              <ul className="mt-2 list-inside list-disc text-foreground/90">
                {warnings.map((w) => (
                  <li key={w.id}>
                    {w.relatedObjectType}
                    {w.relatedObjectId ? ` ${w.relatedObjectId}` : ""} — {w.message}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="text-sm font-semibold text-foreground">Recommended fixes</h2>
            {warnings.length === 0 ? (
              <p className="mt-2 text-muted-foreground">No fixes required.</p>
            ) : (
              <ul className="mt-2 list-inside list-disc text-muted-foreground">
                {warnings.map((w) => (
                  <li key={`fix-${w.id}`}>{w.recommendedFix ?? w.message}</li>
                ))}
              </ul>
            )}
          </section>

          <div className="flex flex-wrap gap-3 border-t border-border pt-6">
            <PhaseValidationExportButton exportPayload={exportPayload} filename={`phase-${n}-validation.json`} />
            <Link
              href={`/projects/${project.id}/workspace?phase=${n}#validation-warnings`}
              className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-4 text-sm font-medium hover:bg-muted"
            >
              Back to workspace
            </Link>
          </div>
        </div>
      </main>
    </AuthenticatedAppShell>
  );
}
