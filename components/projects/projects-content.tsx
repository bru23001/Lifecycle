import Link from "next/link";
import {
  AlertTriangle,
  Check,
  ChevronRight,
  Clock3,
  ClipboardList,
  FileText,
  GitBranch,
  Package,
  Pencil,
  Plus,
  SearchCheck,
  ShieldCheck,
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
}: {
  projects: ProjectsScreenData["projects"];
  selectedProjectId: string;
  selectedTab: ProjectDetailTab;
}) {
  return (
    <aside className="min-h-0 rounded-2xl border border-[var(--cc-border)] bg-white dark:bg-card">
      <div className="flex h-[52px] items-center justify-between border-b border-slate-100 px-4">
        <div className="flex items-center gap-2">
          <h2 className="text-[13px] font-bold">Project List</h2>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
            {projects.length}
          </span>
        </div>
        <Link
          href="/projects/new"
          className="inline-flex size-7 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50"
          aria-label="Create project"
        >
          <Plus className="size-4" />
        </Link>
      </div>
      <div className="border-b border-slate-100 px-4 py-3">
        <div className="rounded-md border border-slate-200 bg-[var(--app-bg)] px-3 py-2 text-[11px] text-slate-400">
          Search projects...
        </div>
      </div>
      <div className="min-h-0 space-y-2 overflow-y-auto p-3">
        {projects.map((project) => {
          const active = project.id === selectedProjectId;
          return (
            <Link
              key={project.id}
              href={`/projects?selected=${project.id}&tab=${selectedTab}`}
              className={`block rounded-lg border p-3 ${
                active
                  ? "border-[#2563eb] border-l-[3px] bg-blue-50/50"
                  : "border-slate-200 bg-white hover:bg-slate-50/60"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="truncate text-[12px] font-semibold text-slate-800">{project.name}</p>
                <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${statusBadgeClass(project.status)}`}>
                  {project.status}
                </span>
              </div>
              <p className="mt-1 text-[10px] text-slate-500">
                {project.code} · Phase {project.currentPhase}
              </p>
              <p className="mt-1 text-[10px] text-slate-500">Updated {project.updatedLabel}</p>
              <div className="mt-2 h-1.5 rounded-full bg-slate-100">
                <div className="h-1.5 rounded-full bg-[#2563eb]" style={{ width: `${project.progressPercent}%` }} />
              </div>
            </Link>
          );
        })}
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
  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <h3 className="text-[13px] font-bold">Lifecycle Timeline</h3>
        <div className="mt-4 flex items-start gap-3 overflow-x-auto pb-1">
          {selectedProject.lifecyclePhases.map((phase) => {
            const done = phase.status === "completed";
            const current = phase.status === "current";
            return (
              <div key={phase.id} className="min-w-[128px] space-y-2">
                <div
                  className={`grid size-7 place-items-center rounded-full border text-[11px] font-bold ${
                    done
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                      : current
                      ? "border-[#2563eb] bg-[#2563eb] text-white"
                      : "border-slate-200 bg-white text-slate-400"
                  }`}
                >
                  {done ? <Check className="size-4" /> : phase.id.replace("phase-", "")}
                </div>
                <p className={`text-[10px] font-semibold ${current ? "text-[#1d4ed8]" : "text-slate-600"}`}>{phase.label}</p>
              </div>
            );
          })}
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
                ) : action.id.includes("gate") ? (
                  <ShieldCheck className="size-3.5" />
                ) : action.id.includes("audit") ? (
                  <ClipboardList className="size-3.5" />
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

      <article className="rounded-2xl border border-rose-100 bg-rose-50/60 p-4">
        <h3 className="text-[12px] font-bold text-rose-900">Blockers</h3>
        <ul className="mt-2 space-y-2 text-[10.5px] font-semibold text-rose-800">
          {selectedProject.blockers.map((blocker) => (
            <li key={blocker.id} className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
              {blocker.message}
            </li>
          ))}
        </ul>
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white p-4">
        <h3 className="text-[13px] font-bold">Recent Activity</h3>
        <ul className="mt-2 space-y-2">
          {selectedProject.recentActivity.slice(0, 3).map((activity) => (
            <li key={activity.id} className="flex items-start gap-2">
              <div className="mt-0.5 grid size-6 place-items-center rounded-full bg-slate-100">
                <Clock3 className="size-3.5 text-slate-500" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-slate-800">{activity.title}</p>
                <p className="text-[10px] text-slate-500">{activity.timeLabel}</p>
              </div>
            </li>
          ))}
        </ul>
      </article>
    </aside>
  );
}

export function ProjectsContent({
  data,
  selectedProjectId,
  selectedTab,
}: {
  data: ProjectsScreenData;
  selectedProjectId: string;
  selectedTab: ProjectDetailTab;
}) {
  return (
    <div className="mx-auto flex w-full max-w-[1920px] flex-1 min-h-0 flex-col overflow-hidden px-5 pb-5 min-[901px]:px-8">
      <div className="split-detail-grid min-h-0 flex-1 overflow-hidden">
        <ProjectListPanel
          projects={data.projects}
          selectedProjectId={selectedProjectId}
          selectedTab={selectedTab}
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
