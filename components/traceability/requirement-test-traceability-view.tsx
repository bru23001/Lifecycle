"use client";

import Link from "next/link";

import { AuthenticatedAppShell } from "@/components/lifecycle-workspace/authenticated-app-shell";
import { Breadcrumbs } from "@/components/lifecycle-workspace/breadcrumbs";
import { TopHeader } from "@/components/lifecycle-workspace/top-header";
import { buttonVariants } from "@/components/ui/button";
import { coverageStatusBadgeMap } from "@/lib/coverage-status";
import { projectOverviewHref } from "@/lib/projects-url";
import { cn } from "@/lib/utils";
import type { RequirementTestTraceabilityData } from "@/types/requirement-test-traceability.types";

import { CoverageProgressBar, StatusBadge, tableRowClass } from "./traceability-shared";

export function RequirementTestTraceabilityView({ data }: { data: RequirementTestTraceabilityData }) {
  const phaseScope = data.project.currentPhase;
  const avgCoverage =
    data.typeSummaries.length > 0
      ? Math.round(
          data.typeSummaries.reduce((a, s) => a + s.coveragePercent, 0) / data.typeSummaries.length,
        )
      : 0;

  return (
    <AuthenticatedAppShell
      projectId={data.project.id}
      projectName={data.project.name}
      phaseSummary="Requirement ↔ test coverage"
      phaseProgressPct={avgCoverage}
      navActive="traceability"
      projectCurrentPhase={data.project.currentPhase}
      navPhaseScope={phaseScope}
      workspaceHref={`/projects/${data.project.id}/workspace?phase=${phaseScope}`}
    >
      <TopHeader
        title="Requirement ↔ Test traceability"
        userInitials={data.user.initials}
        userName={data.user.name}
        userRole={data.user.role}
      />
      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-[var(--app-bg)] px-5 pb-8 pt-4 min-[901px]:px-8">
        <div className="mx-auto w-full max-w-[1280px]">
          <Breadcrumbs
            items={[
              { label: "Projects", href: "/projects" },
              { label: `${data.project.name} (${data.project.code})`, href: projectOverviewHref(data.project.id) },
              { label: "Traceability Matrix", href: data.matrixHref },
              { label: "Requirement ↔ Tests" },
            ]}
          />
          <p className="mt-3 text-sm text-slate-600">
            Coverage uses requirement <strong>verification method</strong> text and/or{" "}
            <code className="rounded bg-slate-100 px-1">tests</code> /{" "}
            <code className="rounded bg-slate-100 px-1">validates</code> trace links. Open a row to edit the
            requirement or follow a link to the test trace record.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Link
              href={`${data.matrixHref}/requirements-tests`}
              className={cn(
                buttonVariants({ variant: data.selectedType ? "outline" : "default", size: "sm" }),
              )}
            >
              All types
            </Link>
            {data.typeSummaries.map((s) => (
              <Link
                key={s.requirementType}
                href={s.href}
                className={cn(
                  buttonVariants({
                    variant: data.selectedType === s.requirementType ? "default" : "outline",
                    size: "sm",
                  }),
                )}
              >
                {s.label} ({s.testCoverageTotal}/{s.requirementsTotal})
              </Link>
            ))}
          </div>

          <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-3">ID</th>
                  <th className="px-3 py-3">Title</th>
                  <th className="px-3 py-3">Type</th>
                  <th className="px-3 py-3">Verification</th>
                  <th className="px-3 py-3">Test traces</th>
                  <th className="px-3 py-3">Execution</th>
                  <th className="px-3 py-3">Defects</th>
                  <th className="px-3 py-3">Rationale (trace)</th>
                  <th className="px-3 py-3">Link owner</th>
                  <th className="px-3 py-3">Health</th>
                  <th className="px-3 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.requirements.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-4 py-8 text-center text-slate-600">
                      No requirements in this view. Try another type filter or add requirements in the register.
                    </td>
                  </tr>
                ) : (
                  data.requirements.map((row) => (
                    <tr key={row.id} className={tableRowClass()}>
                      <td className="px-3 py-2 font-mono text-xs text-slate-800">{row.localId}</td>
                      <td className="px-3 py-2">
                        <Link href={row.detailHref} className="font-medium text-slate-900 hover:text-blue-700 hover:underline">
                          {row.title}
                        </Link>
                      </td>
                      <td className="px-3 py-2 text-slate-700">{row.requirementTypeLabel}</td>
                      <td className="max-w-[200px] px-3 py-2 text-xs text-slate-700">
                        {row.verificationMethod ? (
                          <span className="line-clamp-3" title={row.verificationMethod}>
                            {row.verificationMethod}
                          </span>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {row.linkedTestTraces.length === 0 ? (
                          <span className="text-slate-500">—</span>
                        ) : (
                          <ul className="space-y-1">
                            {row.linkedTestTraces.map((t) => (
                              <li key={t.traceLinkId}>
                                <Link href={t.href} className="text-xs font-semibold text-[#2563eb] hover:underline">
                                  {t.relation}
                                </Link>
                                <span className="text-xs text-slate-500"> · {t.endpointSummary}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </td>
                      <td className="px-3 py-2 text-xs text-slate-600">{row.executionStatusLabel}</td>
                      <td className="px-3 py-2 text-xs text-slate-600">{row.defectsLabel}</td>
                      <td className="max-w-[220px] px-3 py-2 text-xs text-slate-600">
                        {row.rationaleLines.length === 0 ? (
                          "—"
                        ) : (
                          <ul className="list-inside list-disc space-y-0.5">
                            {row.rationaleLines.map((line) => (
                              <li key={line}>{line}</li>
                            ))}
                          </ul>
                        )}
                      </td>
                      <td className="px-3 py-2 text-slate-700">{row.linkOwnerLabel ?? "—"}</td>
                      <td className="px-3 py-2">
                        <StatusBadge {...coverageStatusBadgeMap[row.rowStatus]} />
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-col gap-1">
                          <Link href={row.detailHref} className="text-xs font-semibold text-[#2563eb] hover:underline">
                            Requirement
                          </Link>
                          <Link href={data.matrixHref} className="text-xs font-semibold text-slate-600 hover:underline">
                            Create link
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Coverage by requirement type</h2>
            <div className="mt-3 grid grid-cols-1 gap-3 min-[640px]:grid-cols-2 min-[960px]:grid-cols-3">
              {data.typeSummaries.map((s) => (
                <div key={s.requirementType} className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <Link href={s.href} className="text-sm font-semibold text-slate-900 hover:text-blue-700 hover:underline">
                      {s.label}
                    </Link>
                    <StatusBadge {...coverageStatusBadgeMap[s.status]} />
                  </div>
                  <p className="mt-1 text-xs text-slate-600">
                    {s.testCoverageTotal} / {s.requirementsTotal} with test coverage
                  </p>
                  <div className="mt-2">
                    <CoverageProgressBar value={s.coveragePercent} label={s.label} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <p className="mt-4 text-xs text-slate-500">
            Register:{" "}
            <Link href={data.requirementsRegisterHref} className="font-medium text-[#2563eb] hover:underline">
              Requirements
            </Link>
            {" · "}
            Test trace links open under{" "}
            <code className="rounded bg-slate-100 px-1">/projects/…/tests/&lt;traceLinkId&gt;</code>
          </p>
        </div>
      </main>
    </AuthenticatedAppShell>
  );
}
