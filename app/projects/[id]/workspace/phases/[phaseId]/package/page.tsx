import Link from "next/link";
import { notFound } from "next/navigation";

import { AuthenticatedAppShell } from "@/components/lifecycle-workspace/authenticated-app-shell";
import { PhasePackageExportButton } from "@/components/lifecycle-workspace/phase-package-export-button";
import { Breadcrumbs } from "@/components/lifecycle-workspace/breadcrumbs";
import { TopHeader } from "@/components/lifecycle-workspace/top-header";
import { displayFromCurrentUser, getCurrentUser } from "@/lib/server/current-user";
import { prisma } from "@/lib/prisma";
import {
  buildGateMissingRequirements,
  buildWorkspacePhaseSlice,
} from "@/lib/workspacePhaseWorkspaceSlice";
import { formatDateTimeAbsolute } from "@/lib/datetime-format";
import { gateHeaderDisplayName, workspacePhaseMeta, workspacePhasePurpose } from "@/lib/workspacePhases";
import { mapEvidenceRowsToAttachments } from "@/lib/mapEvidenceAttachments";
import { projectTemplateWizardHref } from "@/lib/projects-url";

export const dynamic = "force-dynamic";

export default async function PhasePackagePage({
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
  const meta = workspacePhaseMeta(n);
  const gateId = meta.gate;
  const evidenceAttachments = mapEvidenceRowsToAttachments(slice.evidenceRows, project.id);
  const missing = buildGateMissingRequirements(
    slice.templateRows,
    slice.evidenceRows.length,
    slice.validationWarnings,
  );
  const templatesComplete =
    slice.templateRows.length === 0 || slice.templateRows.every((t) => t.status === "Completed");
  const gateReady =
    templatesComplete &&
    slice.evidenceRows.length > 0 &&
    slice.validationWarnings.filter((w) => w.severity !== "info").length === 0;

  const exportPayload = {
    exportedAt: new Date().toISOString(),
    projectId: project.id,
    projectName: project.name,
    phaseNumber: n,
    phaseName: meta.title,
    purpose: workspacePhasePurpose(n),
    gate: gateId
      ? { code: gateId, name: gateHeaderDisplayName(gateId) }
      : { code: null, name: null },
    requiredArtifacts: slice.templateRows.map((t) => ({
      id: t.id,
      title: t.title,
      status: t.status,
      href: projectTemplateWizardHref(project.id, t.id),
    })),
    completedArtifacts: slice.templateRows.filter((t) => t.status === "Completed"),
    evidence: evidenceAttachments,
    checklist: {
      templatesComplete,
      evidenceAttached: slice.evidenceRows.length > 0,
      validationClear: slice.validationWarnings.filter((w) => w.severity !== "info").length === 0,
    },
    validationResults: slice.validationWarnings,
    gateReadiness: { ready: gateReady, missingRequirements: missing },
  };

  const phaseProgressPct = Math.max(10, Math.round((Math.min(14, Math.max(1, n)) / 14) * 100));

  return (
    <AuthenticatedAppShell
      projectId={project.id}
      projectName={project.name}
      phaseSummary={`Phase ${n} package`}
      phaseProgressPct={phaseProgressPct}
      navActive="lifecycle"
      projectCurrentPhase={project.currentPhase}
    >
      <TopHeader
        title="Phase package"
        userInitials={userDisplay.initials}
        userName={userDisplay.name}
        userRole={userDisplay.role}
      />
      <main className="mx-auto w-full max-w-3xl flex-1 overflow-y-auto bg-[var(--app-bg)] px-5 py-6">
        <Breadcrumbs
          items={[
            { label: "Projects", href: "/projects" },
            { label: project.name, href: `/projects/${project.id}/workspace?phase=${n}` },
            { label: `Phase ${n} package` },
          ]}
        />
        <header className="mt-6 space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Phase {n} of 14
          </p>
          <h1 className="text-2xl font-semibold text-foreground">{meta.title}</h1>
          <p className="text-sm text-muted-foreground">{workspacePhasePurpose(n)}</p>
        </header>

        <div className="mt-8 space-y-8 text-sm">
          <section data-testid="phase-package-overview">
            <h2 className="text-sm font-semibold text-foreground">Phase overview</h2>
            <p className="mt-2 text-muted-foreground">
              Compiled read-only snapshot for milestone {n}. Workspace last aligned to project artifacts as of{" "}
              {formatDateTimeAbsolute(new Date())}.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-foreground">Required artifacts</h2>
            <ul className="mt-2 list-inside list-disc space-y-1 text-foreground/90">
              {slice.templateRows.map((t) => (
                <li key={t.id}>
                  <Link className="text-[#2563eb] underline" href={projectTemplateWizardHref(project.id, t.id)}>
                    {t.id} — {t.title}
                  </Link>{" "}
                  <span className="text-muted-foreground">({t.status})</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-foreground">Completed artifacts</h2>
            <ul className="mt-2 list-inside list-disc space-y-1 text-foreground/90">
              {slice.templateRows
                .filter((t) => t.status === "Completed")
                .map((t) => (
                  <li key={t.id}>
                    {t.id} — {t.title}
                  </li>
                ))}
              {slice.templateRows.every((t) => t.status !== "Completed") ? (
                <li className="text-muted-foreground">None yet.</li>
              ) : null}
            </ul>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-foreground">Evidence package</h2>
            {evidenceAttachments.length === 0 ? (
              <p className="mt-2 text-muted-foreground">No evidence linked for this phase view.</p>
            ) : (
              <ul className="mt-2 space-y-1">
                {evidenceAttachments.map((e) => (
                  <li key={e.id}>
                    <Link href={e.href} className="text-[#2563eb] underline">
                      {e.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="text-sm font-semibold text-foreground">Checklist status</h2>
            <ul className="mt-2 list-inside list-disc text-muted-foreground">
              <li>Templates complete: {templatesComplete ? "Yes" : "No"}</li>
              <li>Evidence attached: {slice.evidenceRows.length > 0 ? "Yes" : "No"}</li>
              <li>Validation clear: {slice.validationWarnings.filter((w) => w.severity !== "info").length === 0 ? "Yes" : "No"}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-foreground">Validation results</h2>
            {slice.validationWarnings.length === 0 ? (
              <p className="mt-2 text-muted-foreground">No validation warnings.</p>
            ) : (
              <ul className="mt-2 space-y-1">
                {slice.validationWarnings.map((w) => (
                  <li key={w.id} className="text-foreground/90">
                    <span className="font-medium">{w.severity}</span> — {w.message}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="text-sm font-semibold text-foreground">Gate readiness</h2>
            <p className="mt-2 text-foreground/90">{gateReady ? "Ready for gate submission." : "Not ready."}</p>
            {!gateReady && missing.length > 0 ? (
              <ul className="mt-2 list-inside list-disc text-muted-foreground">
                {missing.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            ) : null}
          </section>

          <div className="flex flex-wrap gap-3 border-t border-border pt-6">
            <PhasePackageExportButton exportPayload={exportPayload} />
            <Link
              href={`/projects/${project.id}/workspace?phase=${n}`}
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
