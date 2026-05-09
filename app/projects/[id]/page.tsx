import Link from "next/link";
import { notFound } from "next/navigation";

import { MermaidBlock } from "@/components/mermaid-block";
import { ProjectMetaForm } from "@/components/project-meta-form";
import { gateAuditTooltip, getGateVisualState, indexLatestGateDecisions } from "@/lib/gateStatus";
import type { GateId } from "@/lib/gateRules";
import { buildProjectMetaInitial } from "@/lib/projectMetaInitial";
import { canOpenGateReview } from "@/lib/phaseTransitions";
import { phaseLabel } from "@/lib/phaseLabels";
import {
  artifactTemplatesFromRows,
  buildTraceabilityMermaid,
} from "@/lib/traceability-mermaid";
import { parseApplicability } from "@/lib/applicability";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { getTemplatesForPhase } from "@/templates/registry";

export const dynamic = "force-dynamic";

const GATES: GateId[] = [
  "G1",
  "G2",
  "G3",
  "G4",
  "G5",
  "G6",
  "G7",
  "G8",
  "G9",
  "G10",
];

function badgeClass(state: ReturnType<typeof getGateVisualState>): string {
  switch (state) {
    case "done":
      return "border-emerald-600/40 bg-emerald-600/15 text-emerald-900 dark:text-emerald-100";
    case "ready":
      return "border-amber-500/50 bg-amber-500/15 text-amber-950 dark:text-amber-100";
    case "upcoming":
      return "border-border bg-muted/60 text-muted-foreground";
    default: {
      const _e: never = state;
      return _e;
    }
  }
}

const navPillClass =
  "rounded-lg border border-transparent bg-background px-3 py-1.5 text-sm font-medium shadow-sm transition-colors hover:border-border hover:bg-muted/60";

const TEMPLATES: { id: string; title: string }[] = [
  { id: "A-0", title: "Idea capture" },
  { id: "A-0.1", title: "Problem definition" },
  { id: "A-3.1", title: "Selection scorecard" },
  { id: "A-3.2", title: "Feasibility" },
  { id: "A-3.3", title: "Business case" },
  { id: "A-4", title: "Business field report" },
  { id: "A-7", title: "Stakeholder & user profile" },
  { id: "A-1", title: "CRS" },
  { id: "A-2", title: "SRS" },
  { id: "A-10", title: "NFR register" },
  { id: "A-9", title: "Feature inventory" },
  { id: "A-8", title: "Requirements specification package" },
  { id: "A-6", title: "Scope document" },
  { id: "A-15", title: "Development plan" },
  { id: "ARD-001", title: "Architecture description" },
  { id: "A-11", title: "ERD" },
  { id: "A-12", title: "API & integration contract" },
  { id: "UXD-001", title: "UI / UX (light)" },
  { id: "A-13", title: "Module & file plan" },
  { id: "A-14", title: "Environment & delivery strategy" },
];

export default async function ProjectDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      _count: { select: { artifacts: true, gateDecisions: true } },
      artifacts: {
        select: { templateId: true, localId: true, version: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      },
      gateDecisions: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          gateId: true,
          decision: true,
          authorityName: true,
          authorityRole: true,
          nextAction: true,
          evidencePassSnapshot: true,
          createdAt: true,
        },
      },
    },
  });

  if (!project) {
    notFound();
  }

  const present = artifactTemplatesFromRows(project.artifacts);
  const mermaid = buildTraceabilityMermaid({
    projectSlug: project.slug,
    currentPhase: project.currentPhase,
    artifactTemplatesPresent: present,
  });

  const latestByGate = indexLatestGateDecisions(project.gateDecisions);
  const metaInitial = buildProjectMetaInitial(project);
  const app = parseApplicability(project.applicabilityJson);

  const templatesForProject = TEMPLATES.filter(({ id: tid }) => {
    if (tid === "A-11" && !app.data) return false;
    if (tid === "A-12" && !app.apis) return false;
    if (tid === "UXD-001" && !app.ui) return false;
    return true;
  });

  /** Phase-scoped shortcuts (same applicability rules as the full artifact grid). */
  const phaseFocusTemplates = getTemplatesForPhase(project.currentPhase).filter(
    (tmpl) => {
      const tid = tmpl.templateId;
      if (tid === "A-11" && !app.data) return false;
      if (tid === "A-12" && !app.apis) return false;
      if (tid === "UXD-001" && !app.ui) return false;
      return true;
    },
  );

  return (
    <div className="min-h-full bg-background px-4 py-10 text-foreground">
      <div className="mx-auto max-w-4xl space-y-10">
        <header className="space-y-4">
          <p className="text-sm text-muted-foreground">
            <Link href="/" className="underline-offset-4 hover:underline">
              Home
            </Link>
            {" · "}
            <Link href="/projects" className="underline-offset-4 hover:underline">
              Projects
            </Link>
          </p>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight">
                {project.name}
              </h1>
              <p className="text-sm text-muted-foreground">{project.slug}</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border bg-card p-4 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Current phase
              </p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">
                {project.currentPhase}
              </p>
              <p className="mt-1 text-xs leading-snug text-muted-foreground">
                {phaseLabel(project.currentPhase)}
              </p>
            </div>
            <div className="rounded-xl border bg-card p-4 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Artifacts
              </p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">
                {project._count.artifacts}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Saved templates in this project
              </p>
            </div>
            <div className="rounded-xl border bg-card p-4 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Gate decisions
              </p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">
                {project._count.gateDecisions}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Recorded reviews (G1–G10)
              </p>
            </div>
          </div>

          <nav
            aria-label="Project workspace"
            className="flex flex-wrap gap-2 rounded-xl border bg-muted/40 p-2"
          >
            <Link href={`/projects/${project.id}/workspace`} className={navPillClass}>
              Lifecycle Workspace
            </Link>
            <Link href={`/projects/${project.id}/requirements`} className={navPillClass}>
              Requirements
            </Link>
            <Link href={`/projects/${project.id}/features`} className={navPillClass}>
              Features
            </Link>
            <Link href={`/projects/${project.id}/traceability`} className={navPillClass}>
              Trace matrix
            </Link>
            <Link href={`/projects/${project.id}/evidence`} className={navPillClass}>
              Evidence Center
            </Link>
            <Link href={`/projects/${project.id}/reports`} className={navPillClass}>
              Reports
            </Link>
          </nav>
        </header>

        <ProjectMetaForm projectId={project.id} initial={metaInitial} />

        <section
          className="rounded-2xl border bg-card p-6 shadow-sm"
          aria-labelledby="phase-focus-heading"
        >
          <h2 id="phase-focus-heading" className="text-lg font-semibold">
            Current phase focus
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Phase {project.currentPhase}: {phaseLabel(project.currentPhase)}. Open a
            template for this phase (advances primarily via gate decisions).
          </p>
          {phaseFocusTemplates.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              No templates mapped to this phase in the registry, or applicability hides
              optional architecture/UI artifacts.
            </p>
          ) : (
            <ul className="mt-4 flex flex-wrap gap-2">
              {phaseFocusTemplates.map((tmpl) => {
                const saved = present.has(tmpl.templateId);
                return (
                  <li key={tmpl.templateId}>
                    <Link
                      href={`/projects/${project.id}/form/${tmpl.templateId}`}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors",
                        saved
                          ? "border-emerald-600/40 bg-emerald-600/10 text-emerald-900 dark:text-emerald-100"
                          : "border-border bg-background hover:bg-muted/60",
                      )}
                    >
                      <span className="font-mono text-xs">{tmpl.templateId}</span>
                      <span className="font-medium">{tmpl.title}</span>
                      {saved ? (
                        <span className="text-[10px] uppercase text-muted-foreground">
                          saved
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section
          className="rounded-2xl border bg-card p-6 shadow-sm"
          aria-labelledby="gate-status-heading"
        >
          <h2 id="gate-status-heading" className="text-lg font-semibold">
            Gate status
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Status follows <span className="font-mono text-xs">currentPhase</span>{" "}
            and eligibility. Latest decision summary appears on each card when
            available.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {GATES.map((g) => {
              const state = getGateVisualState(
                project.currentPhase,
                g,
                latestByGate,
              );
              const el = canOpenGateReview(
                project.currentPhase,
                g,
                latestByGate,
              );
              const tip = gateAuditTooltip(g, latestByGate.get(g));
              const headline =
                state === "done"
                  ? "Done"
                  : state === "ready" && el.ok
                    ? "Open for review"
                    : state === "ready"
                      ? "Awaiting prior gate"
                      : "Pending";
              const detail = tip ?? (!el.ok ? el.reason : null);

              return (
                <div
                  key={g}
                  className={cn(
                    "flex flex-col rounded-xl border p-4",
                    badgeClass(state),
                  )}
                >
                  <p className="text-sm font-semibold">{g}</p>
                  <p className="mt-1 text-sm font-medium leading-snug">{headline}</p>
                  {detail ? (
                    <p className="mt-2 text-xs leading-snug opacity-90">{detail}</p>
                  ) : null}
                  {state === "ready" && el.ok ? (
                    <Link
                      href={`/projects/${project.id}/gate/${g.toLowerCase()}`}
                      className="mt-3 inline-flex text-sm font-semibold text-primary underline-offset-4 hover:underline"
                    >
                      Run gate review →
                    </Link>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>

        <section className="space-y-6">
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Artifact templates</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Open a project-scoped form. Saved templates show a badge below.
            </p>
            <ul className="mt-4 grid list-none gap-3 sm:grid-cols-2">
              {templatesForProject.map(({ id: tid, title }) => {
                const saved = present.has(tid);
                return (
                  <li key={tid}>
                    <Link
                      href={`/projects/${project.id}/form/${tid}`}
                      className="flex h-full flex-col rounded-xl border bg-background p-4 shadow-sm transition-colors hover:border-primary/40 hover:bg-muted/20"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-mono text-xs text-muted-foreground">
                            {tid}
                          </p>
                          <p className="mt-0.5 font-medium leading-snug">{title}</p>
                        </div>
                        <span
                          className={cn(
                            "shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium",
                            saved
                              ? "border-emerald-600/40 bg-emerald-600/10 text-emerald-900 dark:text-emerald-100"
                              : "border-border bg-muted/50 text-muted-foreground",
                          )}
                        >
                          {saved ? "Saved" : "Not saved"}
                        </span>
                      </div>
                      <span className="mt-3 text-xs font-semibold text-primary">
                        Open form →
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            <p className="mt-4 text-xs text-muted-foreground">
              Standalone forms (no project in URL):{" "}
              <Link href="/form/A-0" className="font-medium text-primary underline-offset-4 hover:underline">
                /form/…
              </Link>
            </p>
          </div>

          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Recent activity</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Latest gate decisions (newest first).
            </p>
            {project.gateDecisions.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">
                No gate decisions recorded yet.
              </p>
            ) : (
              <ul className="mt-4 max-h-64 space-y-3 overflow-y-auto text-sm">
                {project.gateDecisions.slice(0, 12).map((d) => (
                  <li
                    key={d.id}
                    className="border-b border-border/60 pb-3 last:border-0 last:pb-0"
                  >
                    <span className="font-semibold text-foreground">{d.gateId}</span>
                    <span className="text-muted-foreground"> · </span>
                    <span>{d.decision}</span>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {d.authorityName} ({d.authorityRole}) ·{" "}
                      {d.createdAt.toISOString().slice(0, 16).replace("T", " ")}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section
          className="rounded-2xl border border-dashed border-muted-foreground/25 bg-muted/20 p-6"
          aria-labelledby="trace-map-heading"
        >
          <h2 id="trace-map-heading" className="text-base font-semibold text-foreground">
            Traceability map
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Reference diagram: workspace milestones 1–14, templates A-0 … A-38 / ARD / UXD, and gates G1–G10
            G1–G10. Green nodes indicate a saved artifact; dashed lines indicate not yet
            saved. Amber highlights the current phase.
          </p>
          <div className="mt-4">
            <MermaidBlock chart={mermaid} />
          </div>
        </section>
      </div>
    </div>
  );
}
