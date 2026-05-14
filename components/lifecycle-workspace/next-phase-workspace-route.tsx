"use client";

import Link from "next/link";

import { AuthenticatedAppShell } from "@/components/lifecycle-workspace/authenticated-app-shell";
import { Breadcrumbs } from "@/components/lifecycle-workspace/breadcrumbs";
import { TopHeader } from "@/components/lifecycle-workspace/top-header";
import type { NextPhaseWorkspaceViewData } from "@/types/next-phase-workspace.types";
import { workspacePhaseProgressPercent } from "@/lib/workspacePhases";

export function NextPhaseWorkspaceRoute({
  data,
  user,
}: {
  data: NextPhaseWorkspaceViewData;
  user: { name: string; role: string; initials: string };
}) {
  const progress = workspacePhaseProgressPercent(data.phaseNumber);

  return (
    <AuthenticatedAppShell
      projectId={data.projectId}
      projectName={data.projectName}
      phaseSummary={`Phase ${data.phaseNumber}: ${data.phaseTitle}`}
      phaseProgressPct={progress}
      navActive="lifecycle"
      projectCurrentPhase={data.phaseNumber}
      navPhaseScope={data.phaseNumber}
    >
      <TopHeader title="Lifecycle Workspace" userInitials={user.initials} userName={user.name} userRole={user.role} />

      <div className="mx-auto w-full max-w-[1100px] px-5 py-6 min-[901px]:px-8">
        <Breadcrumbs
          items={[
            { label: "Projects", href: "/projects" },
            { label: data.projectName, href: `/projects/${data.projectId}` },
            { label: "Lifecycle Workspace" },
          ]}
        />

        <header className="mt-8 border-b border-slate-200 pb-6 dark:border-border">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-muted-foreground">
            Phase {data.phaseNumber}
            {data.phaseGateCode ? ` · ${data.phaseGateCode}` : ""}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-foreground">{data.phaseTitle}</h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-600 dark:text-muted-foreground">
            {data.phasePurpose}
          </p>
          <p className="mt-2 text-sm text-slate-500 dark:text-muted-foreground">
            Project {data.projectName} ({data.projectCode})
          </p>
        </header>

        <div className="mt-8 grid gap-10 lg:grid-cols-2">
          <section aria-labelledby="req-templates-heading">
            <h2 id="req-templates-heading" className="text-lg font-semibold text-slate-950 dark:text-foreground">
              Required templates
            </h2>
            <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-slate-700 dark:text-foreground/90">
              {data.requiredTemplates.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="evidence-exp-heading">
            <h2 id="evidence-exp-heading" className="text-lg font-semibold text-slate-950 dark:text-foreground">
              Required evidence expectations
            </h2>
            <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-slate-700 dark:text-foreground/90">
              {data.evidenceExpectations.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </section>
        </div>

        <section className="mt-10" aria-labelledby="checklist-heading">
          <h2 id="checklist-heading" className="text-lg font-semibold text-slate-950 dark:text-foreground">
            Initial checklist
          </h2>
          <ul className="mt-3 space-y-2">
            {data.initialChecklist.map((row) => (
              <li
                key={row.id}
                className="flex items-start gap-3 rounded-lg border border-slate-100 px-3 py-2 dark:border-border"
              >
                <input type="checkbox" disabled className="mt-1 size-4 rounded border-slate-300" aria-label={row.label} />
                <span className="text-sm text-slate-800 dark:text-foreground/90">{row.label}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10" aria-labelledby="carry-heading">
          <h2 id="carry-heading" className="text-lg font-semibold text-slate-950 dark:text-foreground">
            Carried-forward artifacts
          </h2>
          {data.carriedForwardArtifacts.length ? (
            <ul className="mt-3 space-y-2">
              {data.carriedForwardArtifacts.map((a) => (
                <li key={a.id}>
                  <Link href={a.href} className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400">
                    {a.label}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">No artifacts on this project yet.</p>
          )}
        </section>

        <section className="mt-10 rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-border dark:bg-muted/30">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-foreground">Gate dependency</h2>
          <p className="mt-2 text-sm text-slate-700 dark:text-foreground/90">{data.gateDependencyLabel}</p>
        </section>
      </div>
    </AuthenticatedAppShell>
  );
}
