"use client";

import Link from "next/link";

import { AuthenticatedAppShell } from "@/components/lifecycle-workspace/authenticated-app-shell";
import { Breadcrumbs } from "@/components/lifecycle-workspace/breadcrumbs";
import { TopHeader } from "@/components/lifecycle-workspace/top-header";
import { Button, buttonVariants } from "@/components/ui/button";
import { projectOverviewHref } from "@/lib/projects-url";
import { cn } from "@/lib/utils";
import type { GateEvidenceGateDetailData } from "@/types/gate-evidence-traceability.types";

import { CoverageProgressBar, StatusBadge } from "./traceability-shared";

function gateReadinessLabel(s: GateEvidenceGateDetailData["gate"]["gateStatus"]): string {
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

function gateReadinessTone(s: GateEvidenceGateDetailData["gate"]["gateStatus"]): "green" | "amber" | "red" | "gray" {
  if (s === "approved") return "green";
  if (s === "rejected") return "red";
  if (s === "not_reached") return "gray";
  return "amber";
}

export function GateEvidenceGateDetailPage({ data }: { data: GateEvidenceGateDetailData }) {
  const g = data.gate;
  const phaseScope = data.project.currentPhase;
  const selectedExport =
    data.linkedEvidence.length > 0 ?
      (() => {
        const qs = new URLSearchParams({ scope: "selected" });
        for (const e of data.linkedEvidence) qs.append("selectedId", e.id);
        return `/api/projects/${data.project.id}/evidence/export?${qs.toString()}`;
      })()
    : null;

  return (
    <AuthenticatedAppShell
      projectId={data.project.id}
      projectName={data.project.name}
      phaseSummary={`Gate ${g.gateCode} evidence`}
      phaseProgressPct={g.coveragePercent}
      navActive="traceability"
      projectCurrentPhase={data.project.currentPhase}
      navPhaseScope={phaseScope}
      workspaceHref={`/projects/${data.project.id}/workspace?phase=${phaseScope}`}
    >
      <TopHeader
        title={`${g.gateCode} · Evidence`}
        userInitials={data.user.initials}
        userName={data.user.name}
        userRole={data.user.role}
        actionButtonLabel="Gate review"
        actionButtonAriaLabel="Open gate review"
        onActionButtonClick={() => {
          window.location.href = data.reviewHref;
        }}
      />

      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-[var(--app-bg)] px-5 pb-8 pt-4 min-[901px]:px-8">
        <div className="mx-auto w-full max-w-[960px] space-y-8">
          <Breadcrumbs
            items={[
              { label: "Projects", href: "/projects" },
              {
                label: `${data.project.name} (${data.project.code})`,
                href: projectOverviewHref(data.project.id),
              },
              { label: "Traceability Matrix", href: data.matrixHref },
              { label: "Gate ↔ Evidence", href: data.listHref },
              { label: g.gateCode },
            ]}
          />

          <header className="space-y-2">
            <p className="text-sm font-medium text-slate-600">Gate ↔ Evidence</p>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
              {g.gateCode} · {g.gateName}
            </h1>
            <p className="text-sm text-slate-600">{g.decisionSummary}</p>
            <div className="flex flex-wrap gap-2 pt-1">
              <StatusBadge label={gateReadinessLabel(g.gateStatus)} tone={gateReadinessTone(g.gateStatus)} />
            </div>
          </header>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Gate summary</h2>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold text-slate-500">Required evidence</dt>
                <dd className="mt-1 font-medium text-slate-900">{g.requiredEvidence}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-slate-500">Linked evidence</dt>
                <dd className="mt-1 font-medium text-slate-900">{g.evidenceLinked}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-slate-500">Missing slots</dt>
                <dd className="mt-1 font-medium text-slate-900">{Math.max(0, g.requiredEvidence - g.evidenceLinked)}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-slate-500">Coverage</dt>
                <dd className="mt-1 max-w-xs">
                  <CoverageProgressBar value={g.coveragePercent} label={`${g.gateCode} coverage`} />
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Required evidence (inputs)</h2>
            {g.requiredInputLabels.length === 0 ? (
              <p className="mt-3 text-sm text-slate-600">No explicit input labels on the gate rule — slots are numbered.</p>
            ) : (
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
                {g.requiredInputLabels.map((label, i) => (
                  <li key={`${label}-${i}`}>{label}</li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Linked evidence</h2>
            {data.linkedEvidence.length === 0 ? (
              <p className="mt-3 text-sm text-slate-600">No evidence rows mapped to this gate yet.</p>
            ) : (
              <ul className="mt-3 divide-y divide-slate-100">
                {data.linkedEvidence.map((e) => (
                  <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                    <Link href={e.detailHref} className="font-medium text-blue-600 underline-offset-2 hover:underline">
                      {e.evidenceCode} · {e.name}
                    </Link>
                    <span className="text-xs text-slate-500">
                      {e.completenessPercent}% · {e.evidenceType}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Missing evidence</h2>
            {data.missingEvidence.length === 0 ? (
              <p className="mt-3 text-sm text-slate-600">No missing slots at the current template count.</p>
            ) : (
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
                {data.missingEvidence.map((m) => (
                  <li key={m.id}>{m.label}</li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Evidence completeness (this gate)</h2>
            <p className="mt-2 text-sm text-slate-600">
              Linkage status against configured requirements:{" "}
              <span className="font-medium capitalize">{g.linkStatus}</span>.
            </p>
            <div className="mt-4 max-w-md">
              <CoverageProgressBar value={g.coveragePercent} label="Gate evidence coverage" />
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Gate readiness impact</h2>
            <p className="mt-2 text-sm text-slate-700">{g.decisionSummary}</p>
            {g.latestDecision ? (
              <p className="mt-2 text-xs text-slate-500">
                Latest: {g.latestDecision.decision} · {g.latestDecision.createdAtLabel} · Evidence checks:{" "}
                {g.latestDecision.evidencePassSnapshot ? "passed" : "not fully passed"}
              </p>
            ) : null}
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Export gate evidence package</h2>
            <p className="mt-2 text-sm text-slate-600">
              Download JSON for evidence linked to this gate only (selected export).
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedExport ? (
                <a href={selectedExport} className={cn(buttonVariants({ variant: "outline" }))}>
                  Export linked evidence (JSON)
                </a>
              ) : (
                <Button type="button" variant="outline" disabled>
                  Export linked evidence (JSON)
                </Button>
              )}
              <a
                href={`/api/projects/${data.project.id}/evidence/export?scope=gate`}
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                Export all gates bundle
              </a>
            </div>
          </section>

          <div className="flex flex-wrap gap-3">
            <Link href={data.listHref} className={cn(buttonVariants({ variant: "outline" }))}>
              Back to matrix
            </Link>
            <Link href={data.reviewHref} className={cn(buttonVariants({ variant: "outline" }))}>
              Open gate review
            </Link>
            <Link href={data.addEvidenceHref} className={cn(buttonVariants())}>
              Add evidence
            </Link>
          </div>
        </div>
      </main>
    </AuthenticatedAppShell>
  );
}
