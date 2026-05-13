import Link from "next/link";

import { AuthenticatedAppShell } from "@/components/lifecycle-workspace/authenticated-app-shell";
import { Breadcrumbs } from "@/components/lifecycle-workspace/breadcrumbs";
import { TopHeader } from "@/components/lifecycle-workspace/top-header";
import type { TraceabilityLinkDetail } from "@/types/traceability.types";

export function TraceabilityLinkDetailView({
  projectId,
  projectName,
  projectCode,
  userInitials,
  userName,
  userRole,
  phaseProgressPct,
  detail,
}: {
  projectId: string;
  projectName: string;
  projectCode: string;
  userInitials: string;
  userName?: string;
  userRole?: string;
  phaseProgressPct: number;
  detail: TraceabilityLinkDetail;
}) {
  const validationLabel =
    detail.validationStatus === "valid" ? "Valid" : detail.validationStatus === "warning" ? "Review needed" : "Invalid";

  return (
    <AuthenticatedAppShell
      projectId={projectId}
      projectName={projectName}
      phaseSummary="Traceability link detail"
      phaseProgressPct={phaseProgressPct}
      navActive="traceability"
    >
      <TopHeader
        title="Traceability Detail"
        userInitials={userInitials}
        userName={userName}
        userRole={userRole}
      />
      <main className="flex min-h-0 flex-1 flex-col bg-[var(--app-bg)] px-5 pb-10 pt-4 min-[901px]:px-8">
        <div className="mx-auto w-full max-w-[880px]">
          <Breadcrumbs
            items={[
              { label: "Projects", href: "/projects" },
              { label: `${projectName} (${projectCode})`, href: `/projects/${projectId}/workspace` },
              { label: "Traceability Matrix", href: `/projects/${projectId}/traceability` },
              { label: detail.id },
            ]}
          />
          <header className="mt-6">
            <h1 className="text-2xl font-bold text-slate-900">Trace link</h1>
            <p className="mt-1 text-sm text-slate-600">{detail.linkType}</p>
          </header>

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Endpoints</h2>
            <dl className="mt-4 space-y-4 text-sm">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Source ({detail.sourceKind})</dt>
                <dd className="mt-1">
                  <Link href={detail.sourceHref} className="font-medium text-[#2563eb] hover:underline">
                    {detail.sourceLabel}
                  </Link>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Target ({detail.targetKind})</dt>
                <dd className="mt-1">
                  <Link href={detail.targetHref} className="font-medium text-[#2563eb] hover:underline">
                    {detail.targetLabel}
                  </Link>
                </dd>
              </div>
            </dl>
          </section>

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Link metadata</h2>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div className="rounded-lg bg-slate-50 px-3 py-2">
                <dt className="text-slate-500">Link type</dt>
                <dd className="font-semibold text-slate-900">{detail.linkType}</dd>
              </div>
              <div className="rounded-lg bg-slate-50 px-3 py-2">
                <dt className="text-slate-500">Strength</dt>
                <dd className="font-semibold capitalize text-slate-900">{detail.linkStrength}</dd>
              </div>
              <div className="rounded-lg bg-slate-50 px-3 py-2">
                <dt className="text-slate-500">Created by</dt>
                <dd className="font-semibold text-slate-900">{detail.createdBy}</dd>
              </div>
              <div className="rounded-lg bg-slate-50 px-3 py-2">
                <dt className="text-slate-500">Created</dt>
                <dd className="font-semibold text-slate-900">{detail.createdAtLabel}</dd>
              </div>
              <div className="rounded-lg bg-slate-50 px-3 py-2 sm:col-span-2">
                <dt className="text-slate-500">Evidence reference</dt>
                <dd className="font-semibold text-slate-900">{detail.evidenceReference}</dd>
              </div>
              <div className="rounded-lg bg-slate-50 px-3 py-2 sm:col-span-2">
                <dt className="text-slate-500">Validation</dt>
                <dd className="font-semibold text-slate-900">{validationLabel}</dd>
              </div>
            </dl>
          </section>

          <p className="mt-6 text-sm">
            <Link href={`/projects/${projectId}/traceability`} className="font-semibold text-[#2563eb] hover:underline">
              ← Back to traceability matrix
            </Link>
          </p>
        </div>
      </main>
    </AuthenticatedAppShell>
  );
}
