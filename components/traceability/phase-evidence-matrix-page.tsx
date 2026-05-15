"use client";

import { useState } from "react";
import Link from "next/link";

import { AuthenticatedAppShell } from "@/components/lifecycle-workspace/authenticated-app-shell";
import { Breadcrumbs } from "@/components/lifecycle-workspace/breadcrumbs";
import { TopHeader } from "@/components/lifecycle-workspace/top-header";
import { Button, buttonVariants } from "@/components/ui/button";
import { projectOverviewHref } from "@/lib/projects-url";
import { cn } from "@/lib/utils";
import type { PhaseEvidenceTraceabilityListData, PhaseEvidenceTraceListRow } from "@/types/phase-evidence-traceability.types";

import { PhaseEvidenceGapDrawer } from "./phase-evidence-gap-drawer";
import { CoverageProgressBar, traceabilityCountCellClass } from "./traceability-shared";

export function PhaseEvidenceMatrixPage({ data }: { data: PhaseEvidenceTraceabilityListData }) {
  const [gapRow, setGapRow] = useState<PhaseEvidenceTraceListRow | null>(null);
  const phaseScope = data.project.currentPhase;
  const exportPhaseHref = `/api/projects/${data.project.id}/evidence/export?scope=phase&phaseNumber=${phaseScope}`;
  const evidenceCenterHref = `/projects/${data.project.id}/evidence`;

  const avgCoverage = data.phases.length
    ? Math.round(data.phases.reduce((a, p) => a + p.coveragePercent, 0) / data.phases.length)
    : 0;

  return (
    <AuthenticatedAppShell
      projectId={data.project.id}
      projectName={data.project.name}
      phaseSummary="Phase ↔ Evidence traceability"
      phaseProgressPct={avgCoverage}
      navActive="traceability"
      projectCurrentPhase={data.project.currentPhase}
      navPhaseScope={phaseScope}
      workspaceHref={`/projects/${data.project.id}/workspace?phase=${phaseScope}`}
    >
      <TopHeader
        title="Phase evidence matrix"
        userInitials={data.user.initials}
        userName={data.user.name}
        userRole={data.user.role}
        actionButtonLabel="Export current phase"
        actionButtonAriaLabel="Export phase evidence JSON for current workspace phase"
        onActionButtonClick={() => {
          window.open(exportPhaseHref, "_blank", "noopener,noreferrer");
        }}
      />

      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-[var(--app-bg)] px-5 pb-8 pt-4 min-[901px]:px-8">
        <div className="mx-auto w-full max-w-[1200px] space-y-6">
          <Breadcrumbs
            items={[
              { label: "Projects", href: "/projects" },
              {
                label: `${data.project.name} (${data.project.code})`,
                href: projectOverviewHref(data.project.id),
              },
              { label: "Traceability Matrix", href: data.matrixHref },
              { label: "Phase ↔ Evidence" },
            ]}
          />

          <header className="space-y-1">
            <p className="text-sm font-medium text-slate-600">Phase ↔ Evidence traceability</p>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950">Phase evidence matrix</h1>
            <p className="max-w-2xl text-sm text-slate-600">
              Required counts follow templates registered for each lifecycle phase. Linked counts reflect evidence rows
              tagged with that phase.
            </p>
          </header>

          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[800px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-600">
                  <th className="px-4 py-3">Phase</th>
                  <th className="px-4 py-3 text-center">Required</th>
                  <th className="px-4 py-3 text-center">Linked</th>
                  <th className="px-4 py-3 text-center">Missing</th>
                  <th className="px-4 py-3">Coverage</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.phases.map((row) => (
                  <tr key={row.phaseIdParam} className="border-b border-slate-100 last:border-b-0">
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      <Link href={row.detailHref} className="hover:text-blue-600 hover:underline">
                        {row.phaseNumber}. {row.phaseName}
                      </Link>
                    </td>
                    <td className={cn("px-4 py-3 text-center", traceabilityCountCellClass)}>{row.requiredEvidence}</td>
                    <td className={cn("px-4 py-3 text-center", traceabilityCountCellClass)}>{row.evidenceLinked}</td>
                    <td className={cn("px-4 py-3 text-center", traceabilityCountCellClass)}>{row.missingCount}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        className={cn(
                          "w-full max-w-[180px] text-left",
                          row.linkStatus !== "complete" &&
                            "rounded-md ring-1 ring-transparent hover:bg-slate-50 hover:ring-slate-200",
                        )}
                        onClick={() => {
                          if (row.linkStatus !== "complete") setGapRow(row);
                        }}
                        aria-label={`Open gap drawer for phase ${row.phaseNumber}`}
                      >
                        <CoverageProgressBar value={row.coveragePercent} label={`Phase ${row.phaseNumber} coverage`} />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Link href={row.detailHref} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
                          Detail
                        </Link>
                        <Link href={row.workspaceHref} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
                          Workspace
                        </Link>
                        {row.linkStatus !== "complete" ? (
                          <Button type="button" size="sm" variant="secondary" onClick={() => setGapRow(row)}>
                            Gaps
                          </Button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Remediation</h2>
            <ul className="mt-3 flex flex-wrap gap-4 text-sm">
              <li>
                <Link href={evidenceCenterHref} className="font-medium text-blue-600 underline-offset-2 hover:underline">
                  Open Evidence Center
                </Link>
              </li>
              <li>
                <Link href={exportPhaseHref} className="font-medium text-blue-600 underline-offset-2 hover:underline">
                  Export current phase evidence (JSON)
                </Link>
              </li>
              <li>
                <Link href={data.matrixHref} className="font-medium text-blue-600 underline-offset-2 hover:underline">
                  Back to traceability matrix
                </Link>
              </li>
            </ul>
          </section>
        </div>
      </main>

      <PhaseEvidenceGapDrawer open={gapRow != null} row={gapRow} onClose={() => setGapRow(null)} />
    </AuthenticatedAppShell>
  );
}
