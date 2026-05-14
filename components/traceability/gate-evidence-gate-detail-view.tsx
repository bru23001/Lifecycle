"use client";

import Link from "next/link";

import { AuthenticatedAppShell } from "@/components/lifecycle-workspace/authenticated-app-shell";
import { Breadcrumbs } from "@/components/lifecycle-workspace/breadcrumbs";
import { TopHeader } from "@/components/lifecycle-workspace/top-header";
import { buttonVariants } from "@/components/ui/button";
import { coverageStatusBadgeMap, gateTraceStatusBadgeMap } from "@/lib/coverage-status";
import { projectOverviewHref } from "@/lib/projects-url";
import { cn } from "@/lib/utils";
import type { GateEvidenceGateDetailData } from "@/types/gate-evidence-traceability.types";

import { CoverageProgressBar, StatusBadge, tableRowClass } from "./traceability-shared";

export function GateEvidenceGateDetailView({ data }: { data: GateEvidenceGateDetailData }) {
  const phaseScope = data.project.currentPhase;
  const g = data.gate;

  return (
    <AuthenticatedAppShell
      projectId={data.project.id}
      projectName={data.project.name}
      phaseSummary={`${g.gateCode} evidence coverage`}
      phaseProgressPct={g.coveragePercent}
      navActive="traceability"
      projectCurrentPhase={data.project.currentPhase}
      navPhaseScope={phaseScope}
      workspaceHref={`/projects/${data.project.id}/workspace?phase=${phaseScope}`}
    >
      <TopHeader
        title={`${g.gateCode} — Gate ↔ Evidence`}
        userInitials={data.user.initials}
        userName={data.user.name}
        userRole={data.user.role}
      />
      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-[var(--app-bg)] px-5 pb-8 pt-4 min-[901px]:px-8">
        <div className="mx-auto w-full max-w-[960px]">
          <Breadcrumbs
            items={[
              { label: "Projects", href: "/projects" },
              { label: `${data.project.name} (${data.project.code})`, href: projectOverviewHref(data.project.id) },
              { label: "Traceability Matrix", href: data.matrixHref },
              { label: "Gate ↔ Evidence", href: data.listHref },
              { label: g.gateCode },
            ]}
          />

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {g.gateCode} · {g.gateName}
                </h2>
                <p className="mt-2 text-sm text-slate-600">{g.decisionSummary}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href={data.reviewHref} className={cn(buttonVariants({ size: "sm" }))}>
                  Open gate review
                </Link>
                <Link href={data.addEvidenceHref} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
                  Add evidence
                </Link>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <StatusBadge {...gateTraceStatusBadgeMap[g.gateStatus]} />
              <StatusBadge {...coverageStatusBadgeMap[g.linkStatus]} />
            </div>
            <div className="mt-4 max-w-md">
              <CoverageProgressBar value={g.coveragePercent} label="Evidence completeness" />
              <p className="mt-1 text-xs text-slate-500">
                Linked {g.evidenceLinked} / required {g.requiredEvidence}
              </p>
            </div>
          </section>

          {g.requiredInputLabels.length > 0 ? (
            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Required inputs (catalog)</h3>
              <ul className="mt-3 list-inside list-disc text-sm text-slate-700">
                {g.requiredInputLabels.map((id) => (
                  <li key={id}>
                    <code className="rounded bg-slate-100 px-1">{id}</code>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Linked evidence</h3>
            {data.linkedEvidence.length === 0 ? (
              <p className="mt-3 text-sm text-slate-600">No evidence items tagged for this gate yet.</p>
            ) : (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="py-2 pr-3">Code</th>
                      <th className="py-2 pr-3">Name</th>
                      <th className="py-2 pr-3">Type</th>
                      <th className="py-2 pr-3">Phase</th>
                      <th className="py-2 pr-3">Completeness</th>
                      <th className="py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.linkedEvidence.map((row) => (
                      <tr key={row.id} className={tableRowClass()}>
                        <td className="py-2 pr-3 font-mono text-xs">{row.evidenceCode}</td>
                        <td className="py-2 pr-3 text-slate-800">{row.name}</td>
                        <td className="py-2 pr-3 text-slate-600">{row.evidenceType}</td>
                        <td className="py-2 pr-3 text-slate-600">{row.phaseNumber ?? "—"}</td>
                        <td className="py-2 pr-3 text-slate-600">{row.completenessPercent}%</td>
                        <td className="py-2">
                          <Link href={row.detailHref} className="font-semibold text-[#2563eb] hover:underline">
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Missing evidence</h3>
            {data.missingEvidence.length === 0 ? (
              <p className="mt-3 text-sm text-slate-600">No shortfall vs required count for this gate.</p>
            ) : (
              <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-slate-700">
                {data.missingEvidence.map((m) => (
                  <li key={m.id}>{m.label}</li>
                ))}
              </ul>
            )}
          </section>

          {g.latestDecision ? (
            <section className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-sm text-slate-700">
              <p className="font-semibold text-slate-900">Latest decision</p>
              <p className="mt-1">
                {g.latestDecision.decision} · {g.latestDecision.createdAtLabel}
              </p>
            </section>
          ) : null}
        </div>
      </main>
    </AuthenticatedAppShell>
  );
}
