import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpDown,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ClipboardList,
  CircleAlert,
  FileText,
  GitBranch,
  Package,
  Pencil,
  Plus,
  SearchCheck,
  ShieldCheck,
  Star,
} from "lucide-react";

import { PROJECT_DETAIL_TABS } from "@/data/projects.mock";
import type {
  ProjectDetailTab,
  ProjectListItem,
  ProjectsScreenData,
  SelectedProject,
  SelectedProjectMetric,
} from "@/types/projects.types";

function statusBadgeClass(status: ProjectListItem["status"]): string {
  if (status === "Blocked") return "bg-rose-50 text-rose-700";
  if (status === "Pending") return "bg-amber-50 text-amber-700";
  if (status === "Not Started") return "bg-slate-100 text-slate-600";
  return "bg-emerald-50 text-emerald-700";
}

function metricToneClass(tone: SelectedProjectMetric["tone"]): string {
  switch (tone) {
    case "green":
      return "bg-emerald-50 text-emerald-600";
    case "amber":
      return "bg-amber-50 text-amber-600";
    case "red":
      return "bg-rose-50 text-rose-600";
    case "purple":
      return "bg-fuchsia-50 text-fuchsia-600";
    default:
      return "bg-blue-50 text-blue-600";
  }
}

function metricIcon(label: string) {
  if (label.includes("Gate")) return ShieldCheck;
  if (label.includes("Trace")) return GitBranch;
  if (label.includes("Evidence")) return SearchCheck;
  return FileText;
}

export function ProjectListPanel({
  projects,
  selectedProjectId,
  selectedTab,
  currentPage,
  totalPages,
}: {
  projects: ProjectsScreenData["projects"];
  selectedProjectId: string;
  selectedTab: ProjectDetailTab;
  currentPage: number;
  totalPages: number;
}) {
  const perPage = 6;
  const start = (currentPage - 1) * perPage;
  const visibleProjects = projects.slice(start, start + perPage);
  const previousPage = Math.max(1, currentPage - 1);
  const nextPage = Math.min(totalPages, currentPage + 1);
  return (
    <aside className="flex min-h-0 flex-col rounded-2xl border border-[var(--cc-border)] bg-white dark:bg-card">
      <div className="flex h-[52px] items-center justify-between border-b border-slate-100 px-4">
        <div className="flex items-center gap-2">
          <h2 className="text-[13px] font-bold">Project List</h2>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
            {projects.length}
          </span>
        </div>
        <button
          type="button"
          className="inline-flex size-7 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50"
          aria-label="Sort project list"
        >
          <ArrowUpDown className="size-4" />
        </button>
      </div>
      <div className="border-b border-slate-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 rounded-md border border-slate-200 bg-[var(--app-bg)] px-3 py-2 text-[11px] text-slate-400">
            Search projects...
          </div>
          <button
            type="button"
            className="inline-flex size-8 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50"
            aria-label="Filter projects"
          >
            <SearchCheck className="size-4" />
          </button>
        </div>
      </div>
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
        {visibleProjects.map((project) => {
          const active = project.id === selectedProjectId;
          return (
            <Link
              key={project.id}
              href={`/projects?selected=${project.id}&tab=${selectedTab}&page=${currentPage}`}
              className={`block rounded-lg border p-3 ${
                active
                  ? "border-[#2563eb] border-l-[3px] bg-blue-50/30 shadow-[0_0_0_1px_rgba(37,99,235,0.08)]"
                  : "border-slate-200 bg-white hover:bg-slate-50/60"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="inline-flex items-center gap-1 truncate text-[12px] font-semibold text-slate-800">
                  {project.name}
                  {project.status === "In Progress" ? <Star className="size-3 text-amber-500" /> : null}
                  {project.status === "Blocked" ? <CircleAlert className="size-3 text-rose-500" /> : null}
                </p>
                <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${statusBadgeClass(project.status)}`}>
                  {project.status}
                </span>
              </div>
              <p className="mt-1 text-[10px] text-slate-500">
                {project.code} · Phase {project.currentPhase}
              </p>
              <p className="mt-1 text-[10px] text-slate-500">Updated {project.updatedLabel}</p>
              <div className="mt-2 flex items-center gap-2">
                <div className="h-1.5 flex-1 rounded-full bg-slate-100">
                  <div
                    className="h-1.5 rounded-full bg-[#2563eb]"
                    style={{ width: `${project.progressPercent}%` }}
                  />
                </div>
                <span className="text-[10px] font-semibold text-slate-500">{project.progressPercent}%</span>
              </div>
            </Link>
          );
        })}
      </div>
      <div className="flex items-center justify-center gap-3 border-t border-slate-100 px-4 py-3 text-slate-500">
        <Link
          href={`/projects?selected=${selectedProjectId}&tab=${selectedTab}&page=${previousPage}`}
          className={`inline-flex size-6 items-center justify-center rounded-md hover:bg-slate-100 ${
            currentPage <= 1 ? "pointer-events-none opacity-40" : ""
          }`}
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" />
        </Link>
        <span className="inline-flex min-w-6 items-center justify-center rounded-md bg-blue-50 px-2 py-1 text-[10px] font-semibold text-[#1d4ed8]">
          {currentPage}
        </span>
        <span className="text-[10px] font-semibold">{totalPages > 1 ? totalPages : 1}</span>
        <Link
          href={`/projects?selected=${selectedProjectId}&tab=${selectedTab}&page=${nextPage}`}
          className={`inline-flex size-6 items-center justify-center rounded-md hover:bg-slate-100 ${
            currentPage >= totalPages ? "pointer-events-none opacity-40" : ""
          }`}
          aria-label="Next page"
        >
          <ChevronRight className="size-4" />
        </Link>
      </div>
    </aside>
  );
}

export function ProjectDetailHeader({ selectedProject }: { selectedProject: SelectedProject }) {
  return (
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">{selectedProject.header.name}</h1>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${statusBadgeClass(selectedProject.header.status)}`}>
            {selectedProject.header.status}
          </span>
        </div>
        <p className="mt-1 text-[11px] text-slate-600">
          {selectedProject.header.code} · Phase {selectedProject.header.currentPhase} of {selectedProject.header.totalPhases}
          {" · "}
          Owner: {selectedProject.header.owner}
        </p>
      </div>
      <Link
        href="/projects/new"
        className="inline-flex h-9 items-center gap-2 rounded-md bg-[#2563eb] px-4 text-[12px] font-semibold text-white"
      >
        <Plus className="size-4" />
        New Project
      </Link>
    </div>
  );
}

export function ProjectTabs({
  selectedProjectId,
  selectedTab,
}: {
  selectedProjectId: string;
  selectedTab: ProjectDetailTab;
}) {
  return (
    <div className="mb-4 flex flex-wrap gap-5 border-b border-slate-200">
      {PROJECT_DETAIL_TABS.map((tab) => {
        const active = tab.id === selectedTab;
        return (
          <Link
            key={tab.id}
            href={`/projects?selected=${selectedProjectId}&tab=${tab.id}`}
            className={`relative pb-3 text-[12px] font-semibold ${
              active ? "text-[#1d4ed8]" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
            {active ? <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[#2563eb]" /> : null}
          </Link>
        );
      })}
    </div>
  );
}

function ProjectOverviewTab({ selectedProject }: { selectedProject: SelectedProject }) {
  const totalPhases = selectedProject.header.totalPhases;
  const currentPhase = selectedProject.header.currentPhase;
  const visualCurrentPhase =
    currentPhase >= totalPhases ? totalPhases : currentPhase > 5 ? 5 : currentPhase;
  const earlyPhases = selectedProject.lifecyclePhases.slice(0, 5);
  const finalPhaseLabel =
    selectedProject.lifecyclePhases[selectedProject.lifecyclePhases.length - 1]?.label ??
    "Maintenance / Review";
  const milestones = [
    ...earlyPhases.map((phase, index) => ({
      id: phase.id,
      label: phase.label,
      phaseNumber: index + 1,
    })),
    {
      id: "phase-final",
      label: finalPhaseLabel,
      phaseNumber: totalPhases,
    },
  ];

  function milestoneState(phaseNumber: number): "completed" | "current" | "upcoming" {
    if (phaseNumber === totalPhases) {
      if (currentPhase >= totalPhases) return "current";
      return "upcoming";
    }
    if (visualCurrentPhase > phaseNumber) return "completed";
    if (visualCurrentPhase === phaseNumber) return "current";
    return "upcoming";
  }

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-[13px] font-bold">Lifecycle Progress</h3>
          <Link
            href={`/projects?selected=${selectedProject.header.id}&tab=lifecycle-timeline`}
            className="inline-flex items-center rounded-md border border-blue-100 bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-[#1d4ed8]"
          >
            View Full Timeline
          </Link>
        </div>
        <div className="mt-4 overflow-x-auto pb-1">
          <div className="flex min-w-[780px] items-start">
            {milestones.map((milestone, idx) => {
              const state = milestoneState(milestone.phaseNumber);
              const isCurrent = state === "current";
              const isCompleted = state === "completed";
              const isFirst = idx === 0;
              const hasConnector = idx < milestones.length - 1;
              const nextPhase = milestones[idx + 1]?.phaseNumber ?? totalPhases;
              const nextState = milestoneState(nextPhase);
              const connectorTone =
                state === "completed" && nextState === "completed"
                  ? "bg-emerald-500"
                  : state === "completed" && nextState === "current"
                    ? "bg-[#2563eb]"
                    : "bg-slate-200";

              return (
                <div key={milestone.id} className="flex min-w-0 flex-1 items-start">
                  <div className="w-[86px] shrink-0">
                    <div
                      className={`mx-auto grid size-8 place-items-center rounded-full text-[11px] font-bold ${
                        isCurrent
                          ? "bg-[#2563eb] text-white shadow-[0_2px_8px_rgba(37,99,235,0.3)]"
                          : isCompleted
                            ? "bg-emerald-500 text-white"
                            : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {isFirst && isCompleted ? <Check className="size-4" /> : milestone.phaseNumber}
                    </div>
                    <p
                      className={`mt-2 text-center text-[10px] font-semibold leading-4 ${
                        isCurrent ? "text-[#1d4ed8]" : "text-slate-600"
                      }`}
                    >
                      {milestone.label}
                    </p>
                  </div>

                  {hasConnector ? (
                    <div className="relative mt-4 h-[2px] min-w-[44px] flex-1">
                      <span className={`block h-[2px] w-full rounded-full ${connectorTone}`} />
                      {idx === milestones.length - 2 ? (
                        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-[14px] font-semibold leading-none text-slate-400">
                          ...
                        </span>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {selectedProject.metrics.map((metric) => {
          const Icon = metricIcon(metric.label);
          return (
            <article key={metric.id} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className={`inline-grid size-8 place-items-center rounded-lg ${metricToneClass(metric.tone)}`}>
                <Icon className="size-4" />
              </div>
              <p className="mt-2 text-[11px] font-semibold text-slate-500">{metric.label}</p>
              <p className="mt-1 text-2xl font-bold">{metric.value}</p>
              <p className="mt-1 text-[10px] font-semibold text-slate-600">{metric.note}</p>
            </article>
          );
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-[13px] font-bold">Recent Activity</h3>
            <Link
              href={`/projects?selected=${selectedProject.header.id}&tab=audit-trail`}
              className="text-[10px] font-semibold text-[#1d4ed8]"
            >
              View all activity
            </Link>
          </div>
          <ul className="mt-2 space-y-2">
            {selectedProject.recentActivity.slice(0, 5).map((activity) => (
              <li key={activity.id} className="flex items-start gap-2">
                <div className="mt-0.5 grid size-6 place-items-center rounded-full bg-slate-100">
                  <Clock3 className="size-3.5 text-slate-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-slate-800">{activity.title}</p>
                  <p className="text-[10px] text-slate-500">{activity.meta}</p>
                  <p className="text-[10px] text-slate-500">{activity.timeLabel}</p>
                </div>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-[13px] font-bold">Gate Status Summary</h3>
            <Link
              href={`/projects?selected=${selectedProject.header.id}&tab=gates`}
              className="text-[10px] font-semibold text-[#1d4ed8]"
            >
              View all gates
            </Link>
          </div>
          <ul className="mt-2 space-y-2">
            {selectedProject.gateStatuses.map((gate) => (
              <li key={gate.gateId} className="flex items-center justify-between gap-2 text-[11px]">
                <span className="inline-flex min-w-0 items-center gap-2 truncate">
                  <span className="size-1.5 rounded-full bg-slate-400" />
                  <span className="truncate">
                    {gate.gateId}: {gate.title}
                  </span>
                </span>
                <span
                  className={`shrink-0 font-semibold ${
                    gate.status === "Approved"
                      ? "text-emerald-700"
                      : gate.status === "In Review"
                        ? "text-amber-700"
                        : gate.status === "Changes Requested"
                          ? "text-rose-700"
                          : "text-slate-500"
                  }`}
                >
                  {gate.status}
                </span>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="rounded-2xl border border-rose-100 bg-rose-50/60 p-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-[12px] font-bold text-rose-900">Blockers / Missing Evidence</h3>
          <Link
            href={`/projects?selected=${selectedProject.header.id}&tab=artifacts`}
            className="text-[10px] font-semibold text-[#1d4ed8]"
          >
            View all
          </Link>
        </div>
        <ul className="mt-2 space-y-2 text-[10.5px] font-semibold text-rose-800">
          {selectedProject.blockers.map((blocker) => (
            <li key={blocker.id} className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
              {blocker.message}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function GenericDataTab({
  selectedProject,
  title,
  description,
}: {
  selectedProject: SelectedProject;
  title: string;
  description: string;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4">
      <h3 className="text-[13px] font-bold">{title}</h3>
      <p className="mt-2 text-[11px] text-slate-600">{description}</p>
      <p className="mt-3 text-[11px] text-slate-500">
        {selectedProject.header.code} · {selectedProject.header.name}
      </p>
      <Link
        href={`/projects/${selectedProject.header.id}/workspace`}
        className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-[#1d4ed8]"
      >
        Open lifecycle workspace
        <ChevronRight className="size-3.5" />
      </Link>
    </section>
  );
}

export function ActiveTabContent({
  selectedProject,
  selectedTab,
}: {
  selectedProject: SelectedProject;
  selectedTab: ProjectDetailTab;
}) {
  if (selectedTab === "overview") return <ProjectOverviewTab selectedProject={selectedProject} />;
  if (selectedTab === "profile") {
    return <GenericDataTab selectedProject={selectedProject} title="Project Profile" description="Project identity, ownership, classification, and governance metadata." />;
  }
  if (selectedTab === "lifecycle-timeline") {
    return <GenericDataTab selectedProject={selectedProject} title="Lifecycle Timeline" description="Phase-by-phase movement, historical changes, and readiness checkpoints." />;
  }
  if (selectedTab === "artifacts") {
    return <GenericDataTab selectedProject={selectedProject} title="Artifacts" description="Artifact inventory, completion status, and evidence package readiness." />;
  }
  if (selectedTab === "gates") {
    return <GenericDataTab selectedProject={selectedProject} title="Gates" description="Gate status matrix, latest decisions, and pending approvals." />;
  }
  if (selectedTab === "traceability") {
    return <GenericDataTab selectedProject={selectedProject} title="Traceability" description="Links between requirements, designs, tests, and evidence records." />;
  }
  return <GenericDataTab selectedProject={selectedProject} title="Audit Trail" description="Immutable activity and decision log for project lifecycle governance." />;
}

export function ProjectDetailPanel({
  selectedProject,
  selectedTab,
}: {
  selectedProject: SelectedProject;
  selectedTab: ProjectDetailTab;
}) {
  return (
    <section className="min-h-0 rounded-2xl border border-[var(--cc-border)] bg-[var(--app-bg)] p-6">
      <ProjectDetailHeader selectedProject={selectedProject} />
      <ProjectTabs selectedProjectId={selectedProject.header.id} selectedTab={selectedTab} />
      <ActiveTabContent selectedProject={selectedProject} selectedTab={selectedTab} />
    </section>
  );
}

export function ProjectContextPanel({ selectedProject }: { selectedProject: SelectedProject }) {
  return (
    <aside className="space-y-4">
      <article className="rounded-2xl border border-slate-200 bg-white p-4">
        <h3 className="text-[13px] font-bold">Project Snapshot</h3>
        <dl className="mt-3 space-y-2 text-[11px]">
          {selectedProject.snapshot.map((item) => (
            <div key={item.key} className="flex items-start justify-between gap-3">
              <dt className="text-slate-500">{item.key}</dt>
              <dd className="max-w-[60%] text-right font-semibold text-slate-800">{item.value}</dd>
            </div>
          ))}
        </dl>
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white p-4">
        <h3 className="text-[13px] font-bold">Quick Actions</h3>
        <div className="mt-2 space-y-1">
          {selectedProject.quickActions.map((action) => (
            <Link
              key={action.id}
              href={action.href}
              className="flex items-center justify-between rounded-md px-2 py-2 text-[11px] font-semibold text-[#1d4ed8] hover:bg-blue-50"
            >
              <span className="inline-flex items-center gap-2">
                {action.id.includes("profile") ? (
                  <Pencil className="size-3.5" />
                ) : action.id.includes("lifecycle") ? (
                  <Clock3 className="size-3.5" />
                ) : action.id.includes("gate") ? (
                  <ShieldCheck className="size-3.5" />
                ) : action.id.includes("trace") ? (
                  <GitBranch className="size-3.5" />
                ) : action.id.includes("audit") ? (
                  <ClipboardList className="size-3.5" />
                ) : action.id.includes("export") ? (
                  <FileText className="size-3.5" />
                ) : (
                  <Package className="size-3.5" />
                )}
                {action.label}
              </span>
              <ChevronRight className="size-3.5 text-slate-400" />
            </Link>
          ))}
        </div>
      </article>
    </aside>
  );
}

export function ProjectsContent({
  data,
  selectedProjectId,
  selectedTab,
  currentPage,
  totalPages,
}: {
  data: ProjectsScreenData;
  selectedProjectId: string;
  selectedTab: ProjectDetailTab;
  currentPage: number;
  totalPages: number;
}) {
  return (
    <div className="mx-auto flex w-full max-w-[1920px] flex-1 min-h-0 flex-col overflow-hidden px-5 pb-5 min-[901px]:px-8">
      <div className="split-detail-grid min-h-0 flex-1 overflow-hidden">
        <ProjectListPanel
          projects={data.projects}
          selectedProjectId={selectedProjectId}
          selectedTab={selectedTab}
          currentPage={currentPage}
          totalPages={totalPages}
        />
        <ProjectDetailPanel selectedProject={data.selectedProject} selectedTab={selectedTab} />
        <div className="min-h-0 overflow-y-auto">
          <ProjectContextPanel selectedProject={data.selectedProject} />
        </div>
      </div>

      <footer className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-100 bg-[#eff6ff] px-4 py-3 text-[11px] text-slate-700">
        <span className="font-medium">{data.selectedProject.nextRequiredAction.description}</span>
        <Link
          href={data.selectedProject.nextRequiredAction.href}
          className="inline-flex h-9 items-center gap-2 rounded-md bg-[#2563eb] px-3 text-[11px] font-semibold text-white"
        >
          {data.selectedProject.nextRequiredAction.ctaLabel}
          <ChevronRight className="size-3.5" />
        </Link>
      </footer>
    </div>
  );
}
