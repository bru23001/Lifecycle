"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Eye, ShieldCheck, UserPlus } from "lucide-react";

import { DecisionRecordDrawer } from "@/components/gate-review/decision-record-drawer";
import { AuthenticatedAppShell } from "@/components/lifecycle-workspace/authenticated-app-shell";
import { Breadcrumbs } from "@/components/lifecycle-workspace/breadcrumbs";
import { TopHeader } from "@/components/lifecycle-workspace/top-header";
import type { GatesListScreenData } from "@/lib/server/gates-list";
import { cn } from "@/lib/utils";

function visualBadge(state: GatesListScreenData["rows"][number]["visualState"]): {
  label: string;
  className: string;
} {
  switch (state) {
    case "done":
      return {
        label: "Complete",
        className: "border border-emerald-300 bg-emerald-100 text-emerald-950",
      };
    case "ready":
      return {
        label: "Ready",
        className: "border border-blue-300 bg-blue-100 text-blue-950",
      };
    default:
      return {
        label: "Upcoming",
        className: "border border-slate-400 bg-slate-200 text-slate-950",
      };
  }
}

export function GatesListPage({ data }: { data: GatesListScreenData }) {
  const [drawerRow, setDrawerRow] = useState<GatesListScreenData["rows"][number] | null>(null);

  return (
    <AuthenticatedAppShell
      projectId={data.project.id}
      projectName={data.project.name}
      phaseSummary={`Phase ${data.currentPhase} of 14`}
      projectCurrentPhase={data.currentPhase}
      gatesHref={`/projects/${data.project.id}/gates`}
      navActive="gates"
    >
      <TopHeader
        title="Gates"
        userInitials={data.user.initials}
        userName={data.user.name}
        userRole={data.user.role}
      />
      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto bg-[var(--app-bg)] px-5 pb-10 pt-4 min-[901px]:px-8">
        <div className="mx-auto w-full max-w-[960px] space-y-6">
          <Breadcrumbs
            items={[
              { label: "Projects", href: "/projects" },
              {
                label: `${data.project.name} (${data.project.code})`,
                href: `/projects/${data.project.id}/workspace`,
              },
              { label: "Gates" },
            ]}
          />

          <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-950">Decision gates</h1>
              <p className="mt-2 max-w-prose text-sm leading-relaxed text-slate-600">
                Gate list, readiness from lifecycle rules, latest decision state, and links into each gate review.
              </p>
            </div>
            <Link
              href={data.nextReviewHref}
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-md bg-[#2563eb] px-4 text-sm font-semibold text-white hover:bg-[#1d4ed8]"
            >
              Open next gate review
              <ChevronRight className="size-4" aria-hidden />
            </Link>
          </header>

          <section className="cc-card-standard divide-y divide-slate-100 overflow-hidden p-0">
            {data.rows.map((row) => {
              const badge = visualBadge(row.visualState);
              const hasDecision = row.decisionRecord !== null;
              return (
                <div
                  key={row.gateId}
                  className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-blue-200 bg-blue-100 text-blue-900">
                      <ShieldCheck className="size-5" aria-hidden />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{row.gateId}</p>
                      <p className="font-semibold text-slate-900">{row.title}</p>
                      <p className="mt-1 text-sm text-slate-600">{row.decisionSummary}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {row.evidenceChecksTotal > 0 ? (
                          <>
                            Rule checks: {row.evidenceChecksPassing}/{row.evidenceChecksTotal} passing
                            {!row.rulesPass ? " · Gate evidence not fully satisfied" : ""}
                          </>
                        ) : row.gateId === "G1" || row.gateId === "G2" ? (
                          <>Early gates share the phase evidence bundle with G3 — open review for the full checklist.</>
                        ) : (
                          <>No automated rule checks returned for this gate — use the review screen for details.</>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-[11px] font-bold shadow-sm",
                        badge.className,
                      )}
                    >
                      {badge.label}
                    </span>
                    {hasDecision ? (
                      <button
                        type="button"
                        onClick={() => setDrawerRow(row)}
                        className="inline-flex h-9 items-center gap-1 rounded-md border border-slate-200 bg-white px-3 text-[12px] font-semibold text-slate-700 hover:bg-slate-50"
                        aria-label={`View decision record for ${row.gateId}`}
                      >
                        <Eye className="size-3.5" aria-hidden />
                        View Decision Record
                      </button>
                    ) : null}
                    {!hasDecision ? (
                      <Link
                        href={`${row.reviewHref}#approver-review`}
                        className="inline-flex h-9 items-center gap-1 rounded-md border border-slate-200 bg-white px-3 text-[12px] font-semibold text-slate-700 hover:bg-slate-50"
                        aria-label={`Assign approvers for ${row.gateId}`}
                      >
                        <UserPlus className="size-3.5" aria-hidden />
                        Assign Approvers
                      </Link>
                    ) : null}
                    <Link
                      href={row.reviewHref}
                      className="inline-flex h-9 items-center gap-1 rounded-md border border-slate-200 bg-white px-3 text-[12px] font-semibold text-[#1d4ed8] hover:bg-slate-50"
                    >
                      Review
                      <ChevronRight className="size-3.5" aria-hidden />
                    </Link>
                  </div>
                </div>
              );
            })}
          </section>
        </div>
      </main>

      <DecisionRecordDrawer
        open={drawerRow !== null}
        record={drawerRow?.decisionRecord ?? null}
        gateTitle={drawerRow?.title ?? ""}
        onClose={() => setDrawerRow(null)}
      />
    </AuthenticatedAppShell>
  );
}
