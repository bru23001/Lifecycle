"use client";

import Link from "next/link";

import { AuthenticatedAppShell } from "@/components/lifecycle-workspace/authenticated-app-shell";
import { Breadcrumbs } from "@/components/lifecycle-workspace/breadcrumbs";
import { TopHeader } from "@/components/lifecycle-workspace/top-header";
import { buttonVariants } from "@/components/ui/button";
import { coverageStatusBadgeMap, gateTraceStatusBadgeMap } from "@/lib/coverage-status";
import { projectOverviewHref } from "@/lib/projects-url";
import { cn } from "@/lib/utils";
import type { GateEvidenceTraceabilityListData } from "@/types/gate-evidence-traceability.types";

import { CoverageProgressBar, StatusBadge, tableRowClass, traceabilityCountCellClass } from "./traceability-shared";

export function GateEvidenceTraceabilityListView({ data }: { data: GateEvidenceTraceabilityListData }) {
  const phaseScope = data.project.currentPhase;
  const avg =
    data.gates.length > 0
      ? Math.round(data.gates.reduce((a, g) => a + g.coveragePercent, 0) / data.gates.length)
      : 0;

  return (
    <AuthenticatedAppShell
      projectId={data.project.id}
      projectName={data.project.name}
      phaseSummary="Gate ↔ evidence coverage"
      phaseProgressPct={avg}
      navActive="traceability"
      projectCurrentPhase={data.project.currentPhase}
      navPhaseScope={phaseScope}
      workspaceHref={`/projects/${data.project.id}/workspace?phase=${phaseScope}`}
    >
      <TopHeader
        title="Gate ↔ Evidence traceability"
        userInitials={data.user.initials}
        userName={data.user.name}
        userRole={data.user.role}
      />
      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-[var(--app-bg)] px-5 pb-8 pt-4 min-[901px]:px-8">
        <div className="mx-auto w-full max-w-[1100px]">
          <Breadcrumbs
            items={[
              { label: "Projects", href: "/projects" },
              { label: `${data.project.name} (${data.project.code})`, href: projectOverviewHref(data.project.id) },
              { label: "Traceability Matrix", href: data.matrixHref },
              { label: "Gate ↔ Evidence" },
            ]}
          />
          <p className="mt-3 text-sm text-slate-600">
            Decision gates, evidence tagged to each gate, policy-required counts, latest decision snapshot, and shortcuts
            to gate review or per-gate coverage.
          </p>

          <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Gate</th>
                  <th className="px-4 py-3">Gate status</th>
                  <th className="px-4 py-3">Linked</th>
                  <th className="px-4 py-3">Required</th>
                  <th className="px-4 py-3">Missing</th>
                  <th className="px-4 py-3">Completeness</th>
                  <th className="px-4 py-3">Decision</th>
                  <th className="px-4 py-3">Link health</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.gates.map((row) => (
                  <tr key={row.gateCode} className={tableRowClass()}>
                    <td className="px-4 py-3">
                      <Link
                        href={row.detailHref}
                        className="font-semibold text-slate-900 hover:text-blue-700 hover:underline"
                      >
                        {row.gateCode} — {row.gateName}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge {...gateTraceStatusBadgeMap[row.gateStatus]} />
                    </td>
                    <td className={cn("px-4 py-3", traceabilityCountCellClass)}>{row.evidenceLinked}</td>
                    <td className={cn("px-4 py-3", traceabilityCountCellClass)}>{row.requiredEvidence}</td>
                    <td className={cn("px-4 py-3", traceabilityCountCellClass)}>{row.missingCount}</td>
                    <td className="px-4 py-3">
                      <CoverageProgressBar value={row.coveragePercent} label={`${row.gateCode} completeness`} />
                    </td>
                    <td className="max-w-[220px] px-4 py-3 text-xs text-slate-600">{row.decisionSummary}</td>
                    <td className="px-4 py-3">
                      <StatusBadge {...coverageStatusBadgeMap[row.linkStatus]} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <Link href={row.detailHref} className="text-xs font-semibold text-[#2563eb] hover:underline">
                          Coverage
                        </Link>
                        <Link href={row.reviewHref} className="text-xs font-semibold text-slate-600 hover:underline">
                          Gate review
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-6 text-center">
            <Link href={data.matrixHref} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
              ← Traceability matrix
            </Link>
          </p>
        </div>
      </main>
    </AuthenticatedAppShell>
  );
}
