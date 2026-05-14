"use client";

import Link from "next/link";

import { AuthenticatedAppShell } from "@/components/lifecycle-workspace/authenticated-app-shell";
import { Breadcrumbs } from "@/components/lifecycle-workspace/breadcrumbs";
import { TopHeader } from "@/components/lifecycle-workspace/top-header";
import { coverageStatusBadgeMap } from "@/lib/coverage-status";
import { projectOverviewHref } from "@/lib/projects-url";
import type { PhaseArtifactTraceabilityListData } from "@/types/phase-artifact-traceability.types";

import { CoverageProgressBar, StatusBadge, tableRowClass } from "./traceability-shared";

const linkHealthTone = {
  healthy: "green",
  attention: "amber",
  blocked: "red",
} as const;

export function PhaseArtifactTraceabilityListView({ data }: { data: PhaseArtifactTraceabilityListData }) {
  const phaseScope = data.project.currentPhase;
  const phaseProgressPct =
    data.phases[data.project.currentPhase - 1]?.coveragePercent ?? data.phases[0]?.coveragePercent ?? 0;

  return (
    <AuthenticatedAppShell
      projectId={data.project.id}
      projectName={data.project.name}
      phaseSummary="Phase ↔ artifact coverage"
      phaseProgressPct={phaseProgressPct}
      navActive="traceability"
      projectCurrentPhase={data.project.currentPhase}
      navPhaseScope={phaseScope}
      workspaceHref={`/projects/${data.project.id}/workspace?phase=${phaseScope}`}
    >
      <TopHeader
        title="Phase → Artifact traceability"
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
              { label: "Traceability Matrix", href: `/projects/${data.project.id}/traceability` },
              { label: "Phase ↔ Artifacts" },
            ]}
          />
          <p className="mt-3 text-sm text-slate-600">
            Lifecycle phases, required template artifacts, linked instances, and gaps. Open a phase for required vs linked
            lists, owners, and repair shortcuts.
          </p>

          <div className="mt-6 overflow-x-auto rounded-2xl border border-[#e5e7eb] bg-white shadow-sm">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Phase</th>
                  <th className="px-4 py-3">Required</th>
                  <th className="px-4 py-3">Linked</th>
                  <th className="px-4 py-3">Missing</th>
                  <th className="px-4 py-3">Coverage</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Link health</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.phases.map((row) => (
                  <tr key={row.phaseNumber} className={tableRowClass()}>
                    <td className="px-4 py-3">
                      <Link
                        href={row.detailHref}
                        className="font-semibold text-slate-900 hover:text-blue-700 hover:underline"
                      >
                        {row.phaseNumber}. {row.phaseName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{row.requiredCount}</td>
                    <td className="px-4 py-3 text-slate-700">{row.linkedCount}</td>
                    <td className="px-4 py-3 text-slate-700">{row.missingCount}</td>
                    <td className="px-4 py-3">
                      <CoverageProgressBar value={row.coveragePercent} label={`Phase ${row.phaseNumber} coverage`} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge {...coverageStatusBadgeMap[row.status]} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge label={row.linkHealthLabel} tone={linkHealthTone[row.linkHealth]} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={row.detailHref}
                          className="text-xs font-semibold text-[#2563eb] hover:underline"
                        >
                          View detail
                        </Link>
                        <Link href={row.workspaceHref} className="text-xs font-semibold text-slate-600 hover:underline">
                          Workspace
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-xs text-slate-500">
            Create or repair links from the phase detail view or the{" "}
            <Link href={`/projects/${data.project.id}/traceability`} className="font-medium text-[#2563eb] hover:underline">
              traceability matrix
            </Link>
            .
          </p>
        </div>
      </main>
    </AuthenticatedAppShell>
  );
}
