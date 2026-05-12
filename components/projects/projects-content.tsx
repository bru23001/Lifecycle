import Link from "next/link";
import {
  AlertCircle,
  ArrowUpDown,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  Clock3,
  ClipboardList,
  CircleAlert,
  FolderKanban,
  FileText,
  GitBranch,
  Network,
  Package,
  Pencil,
  Plus,
  SearchCheck,
  ShieldCheck,
  Star,
} from "lucide-react";

import { PROJECT_DETAIL_TABS } from "@/data/projects.constants";
import { ProjectAuditTrailTab, ProjectLifecycleTimelineTab } from "@/components/projects/project-audit-tabs";
import type {
  ProjectDetailTab,
  ProjectListItem,
  ProjectsScreenData,
  SelectedProject,
} from "@/types/projects.types";

function statusBadgeClass(status: ProjectListItem["status"]): string {
  if (status === "Blocked") return "bg-rose-50 text-rose-700";
  if (status === "Pending") return "bg-amber-50 text-amber-700";
  if (status === "Not Started") return "bg-slate-100 text-slate-600";
  return "bg-emerald-50 text-emerald-700";
}

type SummaryCard = {
  id: string;
  title: string;
  value: string;
  detail: string;
  icon: "file" | "shield" | "network";
  iconColor: "blue" | "green" | "slate";
};

type ActivityItem = {
  id: string;
  icon: "artifact" | "gate" | "evidence" | "trace" | "project";
  iconColor: "blue" | "green" | "slate";
  text: string;
  author: string;
  time: string;
};

type GateItem = {
  id: string;
  title: string;
  status: "Approved" | "In Review" | "Pending";
  time: string;
};

function SummaryIcon({
  icon,
  color,
}: {
  icon: SummaryCard["icon"];
  color: SummaryCard["iconColor"];
}) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-emerald-50 text-emerald-600",
    slate: "bg-slate-100 text-slate-600",
  };
  const iconClasses = "h-7 w-7 stroke-[2.2]";

  return (
    <div
      className={[
        "flex h-14 w-14 shrink-0 items-center justify-center rounded-xl",
        colorClasses[color],
      ].join(" ")}
    >
      {icon === "file" && <FileText className={iconClasses} />}
      {icon === "shield" && <ShieldCheck className={iconClasses} />}
      {icon === "network" && <Network className={iconClasses} />}
    </div>
  );
}

function ActivityIcon({
  icon,
  color,
}: {
  icon: ActivityItem["icon"];
  color: ActivityItem["iconColor"];
}) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-emerald-50 text-emerald-600",
    slate: "bg-slate-100 text-slate-600",
  };
  const iconClassName = "h-5 w-5 stroke-[2.2]";

  return (
    <div
      className={[
        "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
        colorClasses[color],
      ].join(" ")}
    >
      {icon === "artifact" && <FileText className={iconClassName} />}
      {icon === "gate" && <ShieldCheck className={iconClassName} />}
      {icon === "evidence" && <ClipboardList className={iconClassName} />}
      {icon === "trace" && <GitBranch className={iconClassName} />}
      {icon === "project" && <FileText className={iconClassName} />}
    </div>
  );
}

function GateStatusIcon({ status }: { status: GateItem["status"] }) {
  if (status === "Approved") {
    return <CheckCircle2 className="h-6 w-6 text-emerald-500" />;
  }
  if (status === "In Review") {
    return <Clock3 className="h-6 w-6 text-amber-500" />;
  }
  return <Circle className="h-6 w-6 text-slate-400" />;
}

function GateStatusText({ status }: { status: GateItem["status"] }) {
  const statusClasses = {
    Approved: "text-emerald-600",
    "In Review": "text-amber-500",
    Pending: "text-slate-600",
  };

  return (
    <span className={["font-semibold", statusClasses[status]].join(" ")}>
      {status}
    </span>
  );
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
    <aside className="cc-card-standard flex h-full min-h-0 flex-col p-0 dark:bg-card">
      <div className="flex h-[52px] items-center justify-between border-b border-slate-100 px-4">
        <div className="flex items-center gap-2">
          <h2 className="cc-card-title">Project List</h2>
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
          <div className="cc-card-meta flex-1 rounded-md border border-slate-200 bg-[var(--app-bg)] px-3 py-2">
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
                <p className="cc-card-text inline-flex items-center gap-1 truncate font-semibold text-slate-800">
                  {project.name}
                  {project.status === "In Progress" ? <Star className="size-3 text-amber-500" /> : null}
                  {project.status === "Blocked" ? <CircleAlert className="size-3 text-rose-500" /> : null}
                </p>
                <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${statusBadgeClass(project.status)}`}>
                  {project.status}
                </span>
              </div>
              <p className="cc-card-meta mt-1">
                {project.code} · Phase {project.currentPhase}
              </p>
              <p className="cc-card-meta mt-1">Updated {project.updatedLabel}</p>
              <div className="mt-2 flex items-center gap-2">
                <div className="h-1.5 flex-1 rounded-full bg-slate-100">
                  <div
                    className="h-1.5 rounded-full bg-[#2563eb]"
                    style={{ width: `${project.progressPercent}%` }}
                  />
                </div>
                <span className="cc-card-meta font-semibold">{project.progressPercent}%</span>
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
        <span className="cc-card-meta inline-flex min-w-6 items-center justify-center rounded-md bg-blue-50 px-2 py-1 font-semibold text-[#1d4ed8]">
          {currentPage}
        </span>
        <span className="cc-card-meta font-semibold">{totalPages > 1 ? totalPages : 1}</span>
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

export function ProjectDetailHeader({
  selectedProject,
  newProjectOpenHref,
}: {
  selectedProject: SelectedProject;
  newProjectOpenHref: string;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">{selectedProject.header.name}</h1>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${statusBadgeClass(selectedProject.header.status)}`}>
            {selectedProject.header.status}
          </span>
        </div>
        <p className="cc-card-meta mt-1">
          {selectedProject.header.code} · Phase {selectedProject.header.currentPhase} of {selectedProject.header.totalPhases}
          {" · "}
          Owner: {selectedProject.header.owner}
        </p>
      </div>
      <Link
        href={newProjectOpenHref}
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
  const phaseTitles = [
    "Idea Capture",
    "Problem Definition",
    "Evaluation & Selection",
    "Feasibility & Business Case",
    "Approval & Funding",
    "Planning & Scope Control",
    "Requirements",
    "UI/UX Design",
    "Architecture & Data Model",
    "Development",
    "Testing",
    "Deployment & Release",
    "Maintenance",
    "Maintenance / Review",
  ];
  const totalPhases = phaseTitles.length;
  const currentPhase = Math.min(
    totalPhases,
    Math.max(1, selectedProject.header.currentPhase),
  );
  const currentIndex = currentPhase - 1;
  const phases = phaseTitles.map((title, index) => ({
    id: index + 1,
    title,
    status:
      index < currentIndex
        ? ("complete" as const)
        : index === currentIndex
          ? ("current" as const)
          : ("pending" as const),
  }));
  const summaryCards: SummaryCard[] = selectedProject.metrics.map((metric) => {
    const isGateMetric = metric.label.includes("Gate");
    const isTraceMetric = metric.label.includes("Trace");

    return {
      id: metric.id,
      title: metric.label,
      value: metric.value,
      detail: metric.note,
      icon: isGateMetric ? "shield" : isTraceMetric ? "network" : "file",
      iconColor: isGateMetric ? "green" : isTraceMetric ? "slate" : "blue",
    };
  });
  const recentActivity: ActivityItem[] = selectedProject.recentActivity
    .slice(0, 5)
    .map((item) => {
      const text = item.title;
      const lowered = text.toLowerCase();
      const icon: ActivityItem["icon"] = lowered.includes("gate")
        ? "gate"
        : lowered.includes("trace")
          ? "trace"
          : lowered.includes("evidence")
            ? "evidence"
            : lowered.includes("project") || lowered.includes("phase")
              ? "project"
              : "artifact";
      const iconColor: ActivityItem["iconColor"] =
        icon === "trace" || icon === "project"
          ? "slate"
          : icon === "evidence"
            ? "green"
            : "blue";
      return {
        id: item.id,
        icon,
        iconColor,
        text,
        author: item.meta.split("·")[0]?.trim() ?? item.meta,
        time: item.timeLabel,
      };
    });
  const gateStatus: GateItem[] = selectedProject.gateStatuses
    .slice(0, 6)
    .map((gate) => ({
      id: gate.gateId,
      title: `${gate.gateId}: ${gate.title}`,
      status:
        gate.status === "Approved"
          ? "Approved"
          : gate.status === "In Review"
            ? "In Review"
            : "Pending",
      time: gate.timeLabel,
    }));
  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <section className="cc-card-standard shrink-0 p-6">
        <div className="mb-8 flex items-center justify-between gap-2">
          <h3 className="cc-card-title">
            Lifecycle Progress
          </h3>
          <Link
            href={`/projects?selected=${selectedProject.header.id}&tab=lifecycle-timeline`}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-blue-600 shadow-sm hover:bg-slate-50"
          >
            View Full Timeline
          </Link>
        </div>
        <div className="lifecycle-scroll overflow-x-auto pb-4">
          <div className="relative min-w-[1900px] px-8">
            <div className="absolute left-8 right-8 top-6 h-[3px] bg-slate-200" />
            <div
              className="absolute left-8 top-6 h-[3px] bg-emerald-500"
              style={{
                width: `calc(${(currentIndex / (phases.length - 1)) * 100}% - 0px)`,
              }}
            />

            <div className="relative grid grid-cols-[repeat(14,minmax(0,1fr))]">
              {phases.map((phase) => {
                const isComplete = phase.status === "complete";
                const isCurrent = phase.status === "current";
                const isPending = phase.status === "pending";

                return (
                  <div
                    key={phase.id}
                    className="flex flex-col items-center text-center"
                  >
                    <div
                      className={[
                        "z-10 flex h-12 w-12 items-center justify-center rounded-full text-base font-bold",
                        isComplete && "bg-emerald-500 text-white",
                        isCurrent && "bg-blue-600 text-white",
                        isPending && "bg-slate-100 text-slate-500",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      {phase.id === 1 && isComplete ? (
                        <span className="text-xl leading-none">✓</span>
                      ) : (
                        phase.id
                      )}
                    </div>

                    <p
                      className={[
                        "mt-5 max-w-[130px] text-sm leading-6",
                        isCurrent
                          ? "font-medium text-blue-600"
                          : "text-slate-700",
                      ].join(" ")}
                    >
                      {phase.title}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="grid w-full shrink-0 grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const isPositive = /(complete|passed)/i.test(card.detail);

          return (
            <article
              key={card.id}
              className="cc-card-standard flex min-h-[160px] items-start gap-6 p-7"
            >
              <SummaryIcon icon={card.icon} color={card.iconColor} />

              <div className="space-y-4">
                <h3 className="text-base font-medium text-slate-700">{card.title}</h3>
                <p className="text-3xl font-bold tracking-tight text-slate-950">{card.value}</p>
                <p
                  className={[
                    "text-base font-medium",
                    isPositive ? "text-emerald-600" : "text-slate-500",
                  ].join(" ")}
                >
                  {card.detail}
                </p>
              </div>
            </article>
          );
        })}
      </section>

      <section className="grid min-h-0 flex-1 w-full grid-cols-1 gap-6 min-[700px]:grid-cols-2">
        <article className="cc-card-standard flex min-h-0 flex-col overflow-hidden p-0">
          <header className="flex items-center justify-between px-7 py-6">
            <h2 className="cc-card-title">Recent Activity</h2>
            <Link
              href={`/projects?selected=${selectedProject.header.id}&tab=audit-trail`}
              className="cc-card-link"
            >
              View all activity
            </Link>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {recentActivity.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[44px_1fr_auto] gap-5 border-t border-slate-100 px-7 py-5"
              >
                <ActivityIcon icon={item.icon} color={item.iconColor} />

                <div>
                  <p className="cc-card-text">{item.text}</p>
                  <p className="cc-card-meta mt-1">by {item.author}</p>
                </div>

                <time className="cc-card-meta whitespace-nowrap font-medium">
                  {item.time}
                </time>
              </div>
            ))}
          </div>
        </article>

        <article className="cc-card-standard flex min-h-0 flex-col overflow-hidden p-0">
          <header className="flex items-center justify-between px-7 py-6">
            <h2 className="cc-card-title">Gate Status Summary</h2>
            <Link
              href={`/projects?selected=${selectedProject.header.id}&tab=gates`}
              className="cc-card-link"
            >
              View all gates
            </Link>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {gateStatus.map((gate) => (
              <div
                key={gate.id}
                className="grid grid-cols-[32px_1fr_130px_70px] items-center gap-4 border-t border-slate-100 px-7 py-4"
              >
                <GateStatusIcon status={gate.status} />

                <p className="cc-card-text">{gate.title}</p>

                <GateStatusText status={gate.status} />

                <time className="cc-card-meta text-right">{gate.time}</time>
              </div>
            ))}
          </div>
        </article>

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
    <section className="cc-card-standard p-4">
      <h3 className="cc-card-title">{title}</h3>
      <p className="cc-card-text mt-2">{description}</p>
      <p className="cc-card-meta mt-3">
        {selectedProject.header.code} · {selectedProject.header.name}
      </p>
      <Link
        href={`/projects/${selectedProject.header.id}/workspace`}
        className="cc-card-link mt-3 inline-flex items-center gap-1"
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
    return <ProjectLifecycleTimelineTab selectedProject={selectedProject} />;
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
  return <ProjectAuditTrailTab selectedProject={selectedProject} />;
}

export function ProjectDetailPanel({
  selectedProject,
  selectedTab,
  newProjectOpenHref,
}: {
  selectedProject: SelectedProject;
  selectedTab: ProjectDetailTab;
  newProjectOpenHref: string;
}) {
  return (
    <section className="cc-card-standard flex h-full min-h-0 flex-col overflow-hidden bg-[var(--app-bg)] p-6">
      <ProjectDetailHeader selectedProject={selectedProject} newProjectOpenHref={newProjectOpenHref} />
      <ProjectTabs selectedProjectId={selectedProject.header.id} selectedTab={selectedTab} />
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
        <ActiveTabContent selectedProject={selectedProject} selectedTab={selectedTab} />
      </div>
    </section>
  );
}

export function ProjectContextPanel({
  selectedProject,
  selectedTab,
}: {
  selectedProject: SelectedProject;
  selectedTab: ProjectDetailTab;
}) {
  const blockers = selectedProject.blockers.map((blocker) => ({
    id: blocker.id,
    text: blocker.message,
    icon: blocker.message.toLowerCase().includes("gate") ? "alert" : "file",
  }));
  const layoutRowsClass =
    selectedTab === "overview"
      ? "grid h-full min-h-0 grid-rows-[auto_auto_1fr] gap-4"
      : "grid h-full min-h-0 grid-rows-[auto_1fr] gap-4";

  return (
    <aside className={layoutRowsClass}>
      <article className="cc-card-standard min-h-0 overflow-y-auto p-4">
        <h3 className="cc-card-title">Project Snapshot</h3>
        <dl className="cc-card-meta mt-3 space-y-2">
          {selectedProject.snapshot.map((item) => (
            <div key={item.key} className="flex items-start justify-between gap-3">
              <dt className="text-slate-500">{item.key}</dt>
              <dd className="max-w-[60%] text-right font-semibold text-slate-800">{item.value}</dd>
            </div>
          ))}
        </dl>
      </article>

      <article className="cc-card-standard min-h-0 overflow-y-auto p-4">
        <h3 className="cc-card-title">Quick Actions</h3>
        <div className="mt-2 space-y-1">
          {selectedProject.quickActions.map((action) => (
            <Link
              key={action.id}
              href={action.href}
              className="cc-card-link flex items-center justify-between rounded-md px-2 py-2 hover:bg-blue-50"
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

      {selectedTab === "overview" ? (
        <article className="cc-card-standard flex min-h-0 flex-col p-4">
          <header className="mb-4 flex items-center justify-between">
            <h2 className="cc-card-title">
              Blockers / Missing Evidence
            </h2>
            <Link
              href={`/projects?selected=${selectedProject.header.id}&tab=artifacts`}
              className="cc-card-link"
            >
              View all
            </Link>
          </header>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto">
            {blockers.map((blocker) => (
              <div key={blocker.id} className="flex items-center gap-3">
                {blocker.icon === "file" ? (
                  <FileText className="h-4 w-4 text-red-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
                <p className="cc-card-meta font-semibold text-red-500">
                  {blocker.text}
                </p>
              </div>
            ))}
          </div>
        </article>
      ) : null}
    </aside>
  );
}

export function ProjectsContent({
  data,
  selectedProjectId,
  selectedTab,
  currentPage,
  totalPages,
  hasProjects,
  newProjectOpenHref,
}: {
  data: ProjectsScreenData;
  selectedProjectId: string;
  selectedTab: ProjectDetailTab;
  currentPage: number;
  totalPages: number;
  hasProjects: boolean;
  newProjectOpenHref: string;
}) {
  if (!hasProjects) {
    return (
      <div className="mx-auto flex w-full max-w-[1920px] flex-1 min-h-0 flex-col items-center justify-center overflow-hidden px-5 pb-8 pt-4 min-[901px]:px-8">
        <section className="cc-card-standard flex max-w-md flex-col items-center gap-4 p-10 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <FolderKanban className="size-7 stroke-[2]" aria-hidden />
          </div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-950">No projects yet</h2>
          <p className="text-sm leading-relaxed text-slate-600">
            Create a project to manage lifecycle phases, gate reviews, artifacts, and traceability in one workspace.
          </p>
          <Link
            href={newProjectOpenHref}
            className="inline-flex h-10 items-center gap-2 rounded-md bg-[#2563eb] px-4 text-sm font-semibold text-white"
          >
            <Plus className="size-4" />
            New project
          </Link>
        </section>
      </div>
    );
  }

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
        <ProjectDetailPanel
          selectedProject={data.selectedProject}
          selectedTab={selectedTab}
          newProjectOpenHref={newProjectOpenHref}
        />
        <div className="h-full min-h-0">
          <ProjectContextPanel
            selectedProject={data.selectedProject}
            selectedTab={selectedTab}
          />
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
