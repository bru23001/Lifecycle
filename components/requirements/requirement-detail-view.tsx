"use client";

import Link from "next/link";

import { AuthenticatedAppShell } from "@/components/lifecycle-workspace/authenticated-app-shell";
import { Breadcrumbs } from "@/components/lifecycle-workspace/breadcrumbs";
import { TopHeader } from "@/components/lifecycle-workspace/top-header";
import { buttonVariants } from "@/components/ui/button";
import { coverageStatusBadgeMap } from "@/lib/coverage-status";
import { formatDateTimeAbsolute } from "@/lib/datetime-format";
import { projectOverviewHref } from "@/lib/projects-url";
import { cn } from "@/lib/utils";
import type { RequirementDetailScreenData } from "@/lib/server/requirement-detail-screen";

import { StatusBadge } from "@/components/traceability/traceability-shared";

export function RequirementDetailView({ data }: { data: RequirementDetailScreenData }) {
  const { requirement: r } = data;
  const phaseScope = data.project.currentPhase;
  const hasTests = Boolean(r.verificationMethod?.trim());

  return (
    <AuthenticatedAppShell
      projectId={data.project.id}
      projectName={data.project.name}
      phaseSummary={`Requirement ${r.localId}`}
      phaseProgressPct={data.hasDesignLink && hasTests ? 100 : data.hasDesignLink || hasTests ? 50 : 0}
      navActive="lifecycle"
      projectCurrentPhase={data.project.currentPhase}
      navPhaseScope={phaseScope}
      workspaceHref={`/projects/${data.project.id}/workspace?phase=${phaseScope}`}
    >
      <TopHeader
        title={`${r.localId} — ${r.title}`}
        userInitials={data.user.initials}
        userName={data.user.name}
        userRole={data.user.role}
      />
      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-[var(--app-bg)] px-5 pb-8 pt-4 min-[901px]:px-8">
        <div className="mx-auto w-full max-w-[880px]">
          <Breadcrumbs
            items={[
              { label: "Projects", href: "/projects" },
              { label: `${data.project.name} (${data.project.code})`, href: projectOverviewHref(data.project.id) },
              { label: "Requirements", href: data.registerHref },
              { label: r.localId },
            ]}
          />

          <div className="mt-4 flex flex-wrap gap-2">
            <Link href={data.registerHref} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
              Requirements register
            </Link>
            <Link href={data.matrixHref} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
              Traceability matrix
            </Link>
            <Link
              href={`${data.matrixHref}/requirements-design`}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              Req ↔ Design
            </Link>
          </div>

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge {...coverageStatusBadgeMap[data.traceRowStatus]} />
              <span className="text-xs text-slate-500">Design trace</span>
            </div>
            <dl className="mt-4 grid grid-cols-1 gap-3 text-sm min-[520px]:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Requirement ID</dt>
                <dd className="mt-0.5 font-mono text-slate-900">{r.localId}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Database ID</dt>
                <dd className="mt-0.5 break-all font-mono text-xs text-slate-600">{r.id}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Type</dt>
                <dd className="mt-0.5 text-slate-900">
                  {r.kind} · {data.requirementKindLabel}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Status</dt>
                <dd className="mt-0.5 text-slate-900">{r.status}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Version</dt>
                <dd className="mt-0.5 text-slate-900">{r.version}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Source</dt>
                <dd className="mt-0.5 text-slate-600">—</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Priority</dt>
                <dd className="mt-0.5 text-slate-600">—</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Updated</dt>
                <dd className="mt-0.5 text-slate-700">{formatDateTimeAbsolute(new Date(r.updatedAt))}</dd>
              </div>
            </dl>
          </section>

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Statement</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{r.body?.trim() ? r.body : r.title}</p>
          </section>

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Acceptance / verification</h2>
            <p className="mt-2 text-sm text-slate-700">
              {r.verificationMethod?.trim() || "No verification method recorded on this requirement."}
            </p>
          </section>

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Linked designs (features)</h2>
            {data.linkedFeatures.length === 0 ? (
              <p className="mt-2 text-sm text-slate-600">No implementing feature links yet.</p>
            ) : (
              <ul className="mt-2 space-y-2 text-sm">
                {data.linkedFeatures.map((f) => (
                  <li key={f.traceLinkId} className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-100 pb-2 last:border-0">
                    <span className="font-medium text-slate-900">
                      {f.localId} — {f.title}
                    </span>
                    <Link href={f.href} className="text-xs font-semibold text-[#2563eb] hover:underline">
                      Inspect trace link
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-3 text-xs text-slate-500">
              Features live in the{" "}
              <Link href={data.featuresHref} className="font-medium text-[#2563eb] hover:underline">
                features register
              </Link>
              . Design artifacts use{" "}
              <Link href={`/projects/${data.project.id}/artifacts`} className="font-medium text-[#2563eb] hover:underline">
                artifact detail
              </Link>{" "}
              when linked as artifacts.
            </p>
          </section>

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Linked tests</h2>
            <p className="mt-2 text-sm text-slate-700">
              {hasTests
                ? "Verification intent is recorded on this requirement (treat as test linkage baseline for this workspace)."
                : "No explicit test/trace linkage recorded beyond verification text."}
            </p>
          </section>

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Linked evidence</h2>
            <p className="mt-2 text-sm text-slate-600">
              Evidence is attached through the evidence center and gate workflows.{" "}
              <Link href={`/projects/${data.project.id}/evidence`} className="font-semibold text-[#2563eb] hover:underline">
                Open evidence center
              </Link>
            </p>
          </section>

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Traceability health</h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <StatusBadge {...coverageStatusBadgeMap[data.traceRowStatus]} />
            </div>
            {data.rationaleLines.length > 0 ? (
              <ul className="mt-3 list-inside list-disc space-y-1 text-xs text-slate-600">
                {data.rationaleLines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            ) : null}
          </section>
        </div>
      </main>
    </AuthenticatedAppShell>
  );
}
