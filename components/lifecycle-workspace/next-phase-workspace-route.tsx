"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Circle, Clock3, FileText } from "lucide-react";

import { AuthenticatedAppShell } from "@/components/lifecycle-workspace/authenticated-app-shell";
import { Breadcrumbs } from "@/components/lifecycle-workspace/breadcrumbs";
import { TopHeader } from "@/components/lifecycle-workspace/top-header";
import type {
  NextPhaseWorkspaceViewData,
  RequiredTemplateStatus,
  RequiredTemplateSummary,
} from "@/types/next-phase-workspace.types";
import { workspacePhaseProgressPercent } from "@/lib/workspacePhases";
import { cn } from "@/lib/utils";

function statusBadge(status: RequiredTemplateStatus): {
  label: string;
  className: string;
  Icon: typeof Circle;
} {
  if (status === "approved") {
    return {
      label: "Approved",
      className:
        "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100",
      Icon: CheckCircle2,
    };
  }
  if (status === "in_review") {
    return {
      label: "In review",
      className:
        "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-100",
      Icon: Clock3,
    };
  }
  if (status === "in_progress") {
    return {
      label: "Draft saved",
      className: "bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-100",
      Icon: FileText,
    };
  }
  return {
    label: "Not started",
    className: "bg-slate-100 text-slate-700 dark:bg-muted dark:text-foreground",
    Icon: Circle,
  };
}

function actionLabel(status: RequiredTemplateStatus): string {
  if (status === "approved") return "Open";
  if (status === "in_review") return "Open";
  if (status === "in_progress") return "Continue";
  return "Start";
}

function TemplateCard({ t }: { t: RequiredTemplateSummary }) {
  const badge = statusBadge(t.status);
  const Icon = badge.Icon;
  return (
    <Link
      href={t.href}
      data-testid={`required-template-${t.templateId}`}
      className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 transition hover:border-blue-300 hover:bg-blue-50/40 dark:border-border dark:bg-card dark:hover:border-blue-700/60 dark:hover:bg-blue-950/20"
    >
      <span
        className={cn(
          "inline-flex size-9 shrink-0 items-center justify-center rounded-lg",
          badge.className,
        )}
        aria-hidden
      >
        <Icon className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline gap-2">
          <span className="truncate font-mono text-[11px] font-semibold text-slate-500 dark:text-muted-foreground">
            {t.templateId}
          </span>
          {t.gate ? (
            <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-muted dark:text-muted-foreground">
              {t.gate}
            </span>
          ) : null}
        </span>
        <span className="mt-0.5 block truncate text-sm font-semibold text-slate-900 dark:text-foreground">
          {t.title}
        </span>
        <span className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-500 dark:text-muted-foreground">
          <span
            className={cn(
              "inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
              badge.className,
            )}
          >
            {badge.label}
          </span>
          {t.statusHint ? <span className="truncate">{t.statusHint}</span> : null}
        </span>
      </span>
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-3 py-1 text-[11px] font-semibold text-white transition group-hover:bg-blue-700">
        {actionLabel(t.status)}
        <ArrowRight className="size-3" aria-hidden />
      </span>
    </Link>
  );
}

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
            <div className="flex items-baseline justify-between gap-2">
              <h2
                id="req-templates-heading"
                className="text-lg font-semibold text-slate-950 dark:text-foreground"
              >
                Templates for this phase
              </h2>
              <span className="text-[11px] text-muted-foreground">
                Click a card to open the wizard
              </span>
            </div>
            {data.requiredTemplates.length > 0 ? (
              <ul className="mt-3 space-y-2" data-testid="required-templates-list">
                {data.requiredTemplates.map((t) => (
                  <li key={t.templateId}>
                    <TemplateCard t={t} />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-700 dark:border-border dark:bg-muted/30 dark:text-foreground/90">
                <p>
                  {data.requiredTemplatesEmptyMessage ??
                    "No templates are registered for this phase yet."}
                </p>
                <Link
                  href={`/settings/templates?projectId=${encodeURIComponent(
                    data.projectId,
                  )}`}
                  className="mt-2 inline-flex items-center gap-1 text-[12px] font-semibold text-blue-700 hover:underline dark:text-blue-300"
                >
                  Open Template Registry
                  <ArrowRight className="size-3" aria-hidden />
                </Link>
              </div>
            )}
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
