"use client";

import Link from "next/link";

import { AuthenticatedAppShell } from "@/components/lifecycle-workspace/authenticated-app-shell";
import { Breadcrumbs } from "@/components/lifecycle-workspace/breadcrumbs";
import { TopHeader } from "@/components/lifecycle-workspace/top-header";
import { buttonVariants } from "@/components/ui/button";
import { coverageStatusBadgeMap } from "@/lib/coverage-status";
import { projectOverviewHref } from "@/lib/projects-url";
import { cn } from "@/lib/utils";
import type { PhaseArtifactTraceabilityPhaseDetailData } from "@/types/phase-artifact-traceability.types";

import { CoverageProgressBar, StatusBadge, tableRowClass } from "./traceability-shared";

const linkHealthTone = {
  healthy: "green",
  attention: "amber",
  blocked: "red",
} as const;

export function PhaseArtifactTraceabilityPhaseDetailView({ data }: { data: PhaseArtifactTraceabilityPhaseDetailData }) {
  const { phase } = data;
  const phaseScope = phase.phaseNumber;

  return (
    <AuthenticatedAppShell
      projectId={data.project.id}
      projectName={data.project.name}
      phaseSummary={`Phase ${phase.phaseNumber} artifact coverage`}
      phaseProgressPct={phase.coveragePercent}
      navActive="traceability"
      projectCurrentPhase={data.project.currentPhase}
      navPhaseScope={phaseScope}
      workspaceHref={phase.workspaceHref}
    >
      <TopHeader
        title={`Phase ${phase.phaseNumber} — Artifacts`}
        userInitials={data.user.initials}
        userName={data.user.name}
        userRole={data.user.role}
      />
      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-[var(--app-bg)] px-5 pb-8 pt-4 min-[901px]:px-8">
        <div className="mx-auto w-full max-w-[1200px]">
          <Breadcrumbs
            items={[
              { label: "Projects", href: "/projects" },
              { label: `${data.project.name} (${data.project.code})`, href: projectOverviewHref(data.project.id) },
              { label: "Traceability Matrix", href: data.matrixHref },
              { label: "Phase ↔ Artifacts", href: `${data.matrixHref}/phase-artifacts` },
              { label: `Phase ${phase.phaseNumber}` },
            ]}
          />

          <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 min-[640px]:flex-row min-[640px]:items-start min-[640px]:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {phase.phaseNumber}. {phase.phaseName}
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Required {phase.requiredCount} · Linked {phase.linkedCount} · Missing {phase.missingCount}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <StatusBadge {...coverageStatusBadgeMap[phase.status]} />
                  <StatusBadge label={phase.linkHealthLabel} tone={linkHealthTone[phase.linkHealth]} />
                </div>
              </div>
              <div className="flex max-w-md flex-1 flex-col gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Coverage</p>
                <CoverageProgressBar value={phase.coveragePercent} label="Phase artifact coverage" />
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href={phase.workspaceHref}
                className={cn(buttonVariants({ variant: "default", size: "sm" }))}
              >
                Open phase workspace
              </Link>
              <Link href={data.matrixHref} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
                Back to matrix
              </Link>
              <Link
                href={`${data.matrixHref}/phase-artifacts`}
                className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
              >
                All phases
              </Link>
            </div>
          </section>

          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
            <section>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Linked artifacts</h3>
              <div className="mt-2 overflow-x-auto rounded-xl border border-slate-200 bg-white">
                {phase.linkedArtifacts.length === 0 ? (
                  <p className="p-4 text-sm text-slate-600">No linked artifacts for required templates in this phase.</p>
                ) : (
                  <table className="w-full min-w-[480px] text-left text-sm">
                    <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-3 py-2">Artifact</th>
                        <th className="px-3 py-2">Status</th>
                        <th className="px-3 py-2">Link health</th>
                        <th className="px-3 py-2">Owner</th>
                        <th className="px-3 py-2">Open</th>
                      </tr>
                    </thead>
                    <tbody>
                      {phase.linkedArtifacts.map((a) => (
                        <tr key={a.id} className={tableRowClass()}>
                          <td className="px-3 py-2">
                            <p className="font-medium text-slate-900">{a.title}</p>
                            <p className="text-xs text-slate-500">
                              {a.templateId} · {a.localId} v{a.version}
                            </p>
                          </td>
                          <td className="px-3 py-2 text-slate-700">{a.status}</td>
                          <td className="px-3 py-2">
                            <StatusBadge label={a.linkHealthLabel} tone={linkHealthTone[a.linkHealth]} />
                          </td>
                          <td className="px-3 py-2 text-slate-700">{a.ownerLabel ?? "—"}</td>
                          <td className="px-3 py-2">
                            <Link href={a.href} className="text-xs font-semibold text-[#2563eb] hover:underline">
                              Detail
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </section>

            <section>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Missing templates</h3>
              <div className="mt-2 overflow-x-auto rounded-xl border border-slate-200 bg-white">
                {phase.missingTemplates.length === 0 ? (
                  <p className="p-4 text-sm text-emerald-800">All required templates have at least one artifact instance.</p>
                ) : (
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-3 py-2">Template</th>
                        <th className="px-3 py-2">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {phase.missingTemplates.map((m) => (
                        <tr key={m.templateId} className={tableRowClass()}>
                          <td className="px-3 py-2">
                            <p className="font-medium text-slate-900">{m.templateName}</p>
                            <p className="text-xs text-slate-500">{m.templateId}</p>
                          </td>
                          <td className="px-3 py-2">
                            <Link
                              href={phase.workspaceHref}
                              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                            >
                              Create in workspace
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Use the workspace wizard to add missing artifacts, then return here to confirm coverage.
              </p>
            </section>
          </div>
        </div>
      </main>
    </AuthenticatedAppShell>
  );
}
