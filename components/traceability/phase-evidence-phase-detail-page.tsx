"use client";

import Link from "next/link";

import { AuthenticatedAppShell } from "@/components/lifecycle-workspace/authenticated-app-shell";
import { Breadcrumbs } from "@/components/lifecycle-workspace/breadcrumbs";
import { TopHeader } from "@/components/lifecycle-workspace/top-header";
import { Button, buttonVariants } from "@/components/ui/button";
import { projectOverviewHref } from "@/lib/projects-url";
import { cn } from "@/lib/utils";
import type { PhaseEvidencePhaseDetailData } from "@/types/phase-evidence-traceability.types";

import { CoverageProgressBar } from "./traceability-shared";

export function PhaseEvidencePhaseDetailPage({ data }: { data: PhaseEvidencePhaseDetailData }) {
  const p = data.phase;
  const phaseScope = data.project.currentPhase;
  const selectedExport =
    data.linkedEvidence.length > 0 ?
      (() => {
        const qs = new URLSearchParams({ scope: "selected" });
        for (const e of data.linkedEvidence) qs.append("selectedId", e.id);
        return `/api/projects/${data.project.id}/evidence/export?${qs.toString()}`;
      })()
    : null;

  const phaseExportHref = `/api/projects/${data.project.id}/evidence/export?scope=phase&phaseNumber=${String(p.phaseNumber)}`;

  return (
    <AuthenticatedAppShell
      projectId={data.project.id}
      projectName={data.project.name}
      phaseSummary={`Phase ${p.phaseNumber} evidence`}
      phaseProgressPct={p.coveragePercent}
      navActive="traceability"
      projectCurrentPhase={data.project.currentPhase}
      navPhaseScope={phaseScope}
      workspaceHref={`/projects/${data.project.id}/workspace?phase=${phaseScope}`}
    >
      <TopHeader
        title={`Phase ${p.phaseNumber} · Evidence`}
        userInitials={data.user.initials}
        userName={data.user.name}
        userRole={data.user.role}
        actionButtonLabel="Open workspace"
        actionButtonAriaLabel="Open lifecycle workspace for this phase"
        onActionButtonClick={() => {
          window.location.href = data.workspaceHref;
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
              { label: "Phase ↔ Evidence", href: data.listHref },
              { label: `Phase ${p.phaseNumber}` },
            ]}
          />

          <header className="space-y-2">
            <p className="text-sm font-medium text-slate-600">Phase ↔ Evidence</p>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
              {p.phaseNumber}. {p.phaseName}
            </h1>
            <p className="text-sm text-slate-600">{p.completionImpact}</p>
          </header>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Phase summary</h2>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold text-slate-500">Required evidence</dt>
                <dd className="mt-1 font-medium text-slate-900">{p.requiredEvidence}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-slate-500">Linked evidence</dt>
                <dd className="mt-1 font-medium text-slate-900">{p.evidenceLinked}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-slate-500">Missing slots</dt>
                <dd className="mt-1 font-medium text-slate-900">{p.missingCount}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-slate-500">Coverage</dt>
                <dd className="mt-1 max-w-xs">
                  <CoverageProgressBar value={p.coveragePercent} label={`Phase ${p.phaseNumber} coverage`} />
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Linked evidence</h2>
            {data.linkedEvidence.length === 0 ? (
              <p className="mt-3 text-sm text-slate-600">No evidence rows tagged with this phase yet.</p>
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
            <h2 className="text-sm font-semibold text-slate-900">Evidence completeness</h2>
            <p className="mt-2 text-sm text-slate-600">
              Open the project completeness view for cross-phase rules, applicability, and exports.
            </p>
            <div className="mt-4">
              <Link href={data.completenessHref} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
                View completeness details
              </Link>
            </div>
            <p className="mt-4 text-sm text-slate-600">
              Template-vs-evidence linkage for this phase:{" "}
              <span className="font-medium capitalize">{p.linkStatus}</span>.
            </p>
            <div className="mt-2 max-w-md">
              <CoverageProgressBar value={p.coveragePercent} label="Phase evidence coverage" />
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Phase checklist impact</h2>
            <p className="mt-2 text-sm text-slate-700">{p.checklistImpact}</p>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Export phase evidence package</h2>
            <p className="mt-2 text-sm text-slate-600">Download JSON for evidence tagged with this phase only.</p>
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
              <a href={phaseExportHref} className={cn(buttonVariants({ variant: "outline" }))}>
                Export phase bundle (JSON)
              </a>
            </div>
          </section>

          <div className="flex flex-wrap gap-3">
            <Link href={data.listHref} className={cn(buttonVariants({ variant: "outline" }))}>
              Back to matrix
            </Link>
            <Link href={data.workspaceHref} className={cn(buttonVariants({ variant: "outline" }))}>
              Open workspace
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
