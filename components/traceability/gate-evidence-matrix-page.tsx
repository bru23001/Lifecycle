"use client";

import { useState } from "react";
import Link from "next/link";

import { AuthenticatedAppShell } from "@/components/lifecycle-workspace/authenticated-app-shell";
import { Breadcrumbs } from "@/components/lifecycle-workspace/breadcrumbs";
import { TopHeader } from "@/components/lifecycle-workspace/top-header";
import { Button, buttonVariants } from "@/components/ui/button";
import { projectOverviewHref } from "@/lib/projects-url";
import { cn } from "@/lib/utils";
import type { GateEvidenceTraceabilityListData, GateEvidenceTraceListRow } from "@/types/gate-evidence-traceability.types";
import type { GateTraceStatus } from "@/types/traceability.types";

import { GateEvidenceGapDrawer } from "./gate-evidence-gap-drawer";
import { CoverageProgressBar, StatusBadge, traceabilityCountCellClass } from "./traceability-shared";

function gateReadinessLabel(s: GateTraceStatus): string {
  switch (s) {
    case "approved":
      return "Approved";
    case "pending_decision":
      return "Pending";
    case "not_submitted":
      return "Not submitted";
    case "not_reached":
      return "Not reached";
    case "changes_requested":
      return "Changes requested";
    case "rejected":
      return "Rejected";
    default:
      return s;
  }
}

function gateReadinessTone(s: GateTraceStatus): "green" | "amber" | "red" | "gray" {
  if (s === "approved") return "green";
  if (s === "rejected") return "red";
  if (s === "not_reached") return "gray";
  return "amber";
}

export function GateEvidenceMatrixPage({ data }: { data: GateEvidenceTraceabilityListData }) {
  const [gapRow, setGapRow] = useState<GateEvidenceTraceListRow | null>(null);
  const phaseScope = data.project.currentPhase;
  const exportGateHref = `/api/projects/${data.project.id}/evidence/export?scope=gate`;
  const evidenceCenterHref = `/projects/${data.project.id}/evidence`;

  const avgCoverage = data.gates.length
    ? Math.round(data.gates.reduce((a, g) => a + g.coveragePercent, 0) / data.gates.length)
    : 0;

  return (
    <AuthenticatedAppShell
      projectId={data.project.id}
      projectName={data.project.name}
      phaseSummary="Gate ↔ Evidence traceability"
      phaseProgressPct={avgCoverage}
      navActive="traceability"
      projectCurrentPhase={data.project.currentPhase}
      navPhaseScope={phaseScope}
      workspaceHref={`/projects/${data.project.id}/workspace?phase=${phaseScope}`}
    >
      <TopHeader
        title="Gate evidence matrix"
        userInitials={data.user.initials}
        userName={data.user.name}
        userRole={data.user.role}
        actionButtonLabel="Export gate bundle"
        actionButtonAriaLabel="Export gate evidence bundle"
        onActionButtonClick={() => {
          window.open(exportGateHref, "_blank", "noopener,noreferrer");
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
              { label: "Gate ↔ Evidence" },
            ]}
          />

          <header className="space-y-1">
            <p className="text-sm font-medium text-slate-600">Gate ↔ Evidence traceability</p>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950">Gate evidence matrix</h1>
            <p className="max-w-2xl text-sm text-slate-600">
              Required evidence counts come from active gate rule configuration. Linked counts reflect evidence rows
              mapped to each gate.
            </p>
          </header>

          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[800px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-600">
                  <th className="px-4 py-3">Gate</th>
                  <th className="px-4 py-3 text-center">Required</th>
                  <th className="px-4 py-3 text-center">Linked</th>
                  <th className="px-4 py-3 text-center">Missing</th>
                  <th className="px-4 py-3">Coverage</th>
                  <th className="px-4 py-3">Readiness</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.gates.map((row) => (
                  <tr key={row.gateCode} className="border-b border-slate-100 last:border-b-0">
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      <Link href={row.detailHref} className="hover:text-blue-600 hover:underline">
                        {row.gateCode} · {row.gateName}
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
                        aria-label={`Open gap drawer for ${row.gateCode}`}
                      >
                        <CoverageProgressBar value={row.coveragePercent} label={`${row.gateCode} coverage`} />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge label={gateReadinessLabel(row.gateStatus)} tone={gateReadinessTone(row.gateStatus)} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Link
                          href={row.detailHref}
                          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                        >
                          Detail
                        </Link>
                        <Link
                          href={row.reviewHref}
                          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                        >
                          Review
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
                <Link href={exportGateHref} className="font-medium text-blue-600 underline-offset-2 hover:underline">
                  Export gate evidence package (JSON)
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

      <GateEvidenceGapDrawer open={gapRow != null} row={gapRow} onClose={() => setGapRow(null)} />
    </AuthenticatedAppShell>
  );
}
