import Link from "next/link";
import {
  CheckCircle2,
  Circle,
  Clock3,
  FileText,
  FolderOpen,
  Plus,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  Users,
  XCircle,
} from "lucide-react";

import { AuthenticatedAppShell } from "@/components/lifecycle-workspace/authenticated-app-shell";
import { Breadcrumbs } from "@/components/lifecycle-workspace/breadcrumbs";
import { TopHeader } from "@/components/lifecycle-workspace/top-header";
import type { GateId } from "@/lib/gateRules";
import { getGateVisualState } from "@/lib/gateStatus";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const gates: GateId[] = ["G1", "G2", "G3", "G4", "G5", "G6"];
const sampleProjects = [
  "Secure Identity Platform",
  "Data Governance Hub",
  "Threat Intelligence System",
  "Compliance Automation Tool",
];

function percentForPhase(phase: number): number {
  return Math.min(100, Math.max(10, Math.round((phase / 9) * 100)));
}

function gateTitle(gate: GateId): string {
  switch (gate) {
    case "G1":
      return "Concept Approval";
    case "G2":
      return "Feasibility Approval";
    case "G3":
      return "Solution Approval";
    case "G4":
      return "Readiness Approval";
    case "G5":
      return "Deployment Approval";
    case "G6":
      return "Architecture Approval";
    case "G7":
      return "Readiness Validation";
    case "G8":
      return "Release Approval";
    case "G9":
      return "Operations Handover";
    case "G10":
      return "Post-Launch Review";
    default: {
      return gate;
    }
  }
}

function decisionLabel(decision: string | undefined): string {
  switch (decision) {
    case "Accepted":
      return "Approved";
    case "Returned":
    case "Rejected":
      return "Changes Requested";
    case "Conditional":
    case "Deferred":
    default:
      return "Pending";
  }
}

function decisionTone(label: string): string {
  switch (label) {
    case "Approved":
      return "bg-emerald-50 text-emerald-700";
    case "Changes Requested":
      return "bg-rose-50 text-rose-700";
    default:
      return "bg-amber-50 text-amber-700";
  }
}

function decisionIcon(label: string) {
  if (label === "Approved") return CheckCircle2;
  if (label === "Changes Requested") return XCircle;
  return Clock3;
}

function decisionIconTone(label: string): string {
  if (label === "Approved") return "text-emerald-500";
  if (label === "Changes Requested") return "text-rose-500";
  return "text-amber-500";
}

function gateBarTone(label: string): string {
  if (label === "Approved") return "bg-emerald-500";
  if (label === "Changes Requested") return "bg-rose-500";
  return "bg-amber-400";
}

export default async function HomePage() {
  const projectsQuery = prisma.project.findMany({
    orderBy: { updatedAt: "desc" },
    take: 4,
    include: {
      _count: { select: { artifacts: true, gateDecisions: true } },
    },
  });
  const decisionsQuery = prisma.gateDecision.findMany({
    orderBy: { createdAt: "desc" },
    take: 4,
    include: { project: { select: { name: true } } },
  });

  let projects: Awaited<typeof projectsQuery> = [];
  let recentGateDecisions: Awaited<typeof decisionsQuery> = [];

  try {
    [projects, recentGateDecisions] = await Promise.all([projectsQuery, decisionsQuery]);
  } catch {
    // Fall back to deterministic sample values when DB access is unavailable.
  }

  const sampleSeed = sampleProjects.map((name, index) => ({
    id: "",
    name,
    phase: [6, 4, 2, 1][index] ?? 1,
    gate: (["G2", "G1", "G1", "G1"][index] ?? "G1") as GateId,
    status: index === 2 ? "Blocked" : "In Progress",
    progress: [65, 40, 20, 10][index] ?? 10,
    artifacts: [5, 3, 1, 0][index] ?? 0,
  }));

  const realProjects = projects.map((project, index) => ({
    id: project.id,
    name: project.name,
    phase: project.currentPhase,
    gate:
      gates.find(
        (gate) => getGateVisualState(project.currentPhase, gate) === "ready",
      ) ?? "G1",
    status: project.currentPhase <= 3 && index === 2 ? "Blocked" : "In Progress",
    progress: percentForPhase(project.currentPhase),
    artifacts: project._count.artifacts,
  }));

  const displayProjects = [
    ...realProjects,
    ...sampleSeed.slice(realProjects.length),
  ].slice(0, 4);

  const pendingGateCount = Math.max(
    1,
    displayProjects.flatMap((project) =>
      gates.filter((gate) => getGateVisualState(project.phase, gate) === "ready"),
    ).length,
  );
  const missingEvidence =
    projects.length === 0
      ? 7
      : Math.max(1, displayProjects.filter((project) => project.artifacts < 2).length);
  const pendingApprovals = recentGateDecisions.filter(
    (decision) => decisionLabel(decision.decision) !== "Approved",
  ).length;

  const decisionRows =
    recentGateDecisions.length > 0
      ? recentGateDecisions.map((decision) => ({
          gate: decision.gateId,
          label: decisionLabel(decision.decision),
          project: decision.project.name,
        }))
      : [
          { gate: "G1", label: "Approved", project: "Secure Identity Platform" },
          { gate: "G2", label: "Pending", project: "Data Governance Hub" },
          {
            gate: "G3",
            label: "Changes Requested",
            project: "Threat Intelligence System",
          },
        ];

  const gateSummary = gates.slice(0, 5).map((gate, index) => {
    const latest = recentGateDecisions.find((decision) => decision.gateId === gate);
    const label =
      latest === undefined
        ? index === 0
          ? "Approved"
          : index === 2
            ? "Changes Requested"
            : "Pending"
        : decisionLabel(latest.decision);
    return {
      gate,
      title: gateTitle(gate),
      label,
      count: label === "Approved" ? 3 : label === "Changes Requested" ? 1 : 0,
      width: label === "Approved" ? "100%" : label === "Changes Requested" ? "32%" : "46%",
    };
  });

  const metrics = [
    {
      label: "Active Projects",
      value: displayProjects.length,
      note: `${displayProjects.filter((project) => project.status === "In Progress").length} in progress`,
      icon: FolderOpen,
      tone: "bg-blue-50 text-blue-600",
    },
    {
      label: "Phases In Progress",
      value: new Set(displayProjects.map((project) => project.phase)).size,
      note: `Across ${displayProjects.length} projects`,
      icon: SearchCheck,
      tone: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Gates Pending Review",
      value: pendingGateCount,
      note: "Awaiting decision",
      icon: ShieldCheck,
      tone: "bg-amber-50 text-amber-600",
    },
    {
      label: "Missing Evidence",
      value: missingEvidence,
      note: `Across ${Math.max(1, displayProjects.filter((project) => project.artifacts < 2).length)} projects`,
      icon: FileText,
      tone: "bg-rose-50 text-rose-600",
    },
    {
      label: "Pending Approvals",
      value: Math.max(pendingApprovals, projects.length === 0 ? 5 : 0),
      note: "Requires your action",
      icon: Users,
      tone: "bg-fuchsia-50 text-fuchsia-600",
    },
  ];
  const firstProject = projects[0];

  return (
    <AuthenticatedAppShell
      projectId={firstProject?.id ?? null}
      projectName={firstProject?.name}
      phaseSummary={
        firstProject ? `Phase ${firstProject.currentPhase} of 14` : undefined
      }
      phaseProgressPct={
        firstProject ? percentForPhase(firstProject.currentPhase) : undefined
      }
      navActive="dashboard"
    >
      <TopHeader title="Dashboard" />
      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-auto bg-[var(--app-bg)] text-[11px] text-foreground">
        <div className="mx-auto w-full max-w-[1920px] shrink-0 px-5 pt-4 min-[901px]:px-8">
          <Breadcrumbs
            items={[{ label: "Home", href: "/" }, { label: "Dashboard" }]}
          />
        </div>

        <div className="mx-auto w-full max-w-[1920px] flex-1 px-5 pb-6 pt-2 min-[901px]:px-8">
          <div className="flex flex-col gap-5">
            <section className="command-grid card-grid-12">
              <div className="span-12 flex flex-col gap-4 min-[901px]:flex-row min-[901px]:items-center min-[901px]:justify-between">
                <div>
                  <h1 className="text-[24px] font-bold tracking-[-0.02em]">
                    Welcome back, Alex
                  </h1>
                  <p className="mt-[5px] text-[13px] text-slate-500">
                    Here&apos;s what&apos;s happening with your lifecycle projects.
                  </p>
                </div>
                <Link
                  href="/form/A-0"
                  className="inline-flex h-[39px] shrink-0 items-center gap-2 self-start rounded-[6px] bg-[#2563eb] px-[18px] text-[12px] font-semibold text-white shadow-sm min-[901px]:self-auto"
                >
                  <Plus className="size-[15px]" aria-hidden="true" />
                  New Project
                </Link>
              </div>
            </section>

            <section className="command-grid card-grid-12">
              {metrics.map((metric) => {
                const noteColor = metric.tone.includes("rose")
                  ? "text-rose-600"
                  : metric.tone.includes("amber")
                    ? "text-amber-600"
                    : metric.tone.includes("emerald")
                      ? "text-emerald-600"
                      : metric.tone.includes("fuchsia")
                        ? "text-fuchsia-600"
                        : "text-blue-600";
                return (
                  <article
                    key={metric.label}
                    className="span-2 metric-card flex items-start gap-[12px] rounded-[10px] border border-slate-200 bg-white p-[14px] shadow-[0_2px_8px_rgba(15,23,42,0.04)] dark:border-[var(--cc-border)] dark:bg-card"
                  >
                    <div
                      className={`grid size-[36px] shrink-0 place-items-center rounded-[10px] ${metric.tone}`}
                    >
                      <metric.icon className="size-[17px]" aria-hidden="true" />
                    </div>
                    <div className="min-w-0 flex-1 leading-tight">
                      <p className="text-[10.5px] font-semibold text-slate-500">
                        {metric.label}
                      </p>
                      <p className="mt-[8px] text-[22px] font-bold leading-none tracking-tight">
                        {metric.value}
                      </p>
                      <p className={`mt-[8px] text-[10.5px] font-semibold ${noteColor}`}>
                        {metric.note}
                      </p>
                    </div>
                  </article>
                );
              })}
            </section>

            <section className="command-grid card-grid-12">
              <article className="span-6 summary-card h-[246px] rounded-[9px] border border-slate-200 bg-white p-[20px] shadow-[0_2px_8px_rgba(15,23,42,0.04)] dark:border-[var(--cc-border)] dark:bg-card">
                <div className="mb-[23px] flex items-center justify-between">
                  <h2 className="text-[13px] font-bold">Lifecycle Progress Overview</h2>
                  <Link href="/projects" className="text-[11px] font-semibold text-[#1d4ed8]">
                    View all projects
                  </Link>
                </div>
                <div className="space-y-[18px]">
                  {displayProjects.map((project) => (
                    <div
                      key={project.name}
                      className="grid grid-cols-[178px_1fr_42px] items-center gap-[18px]"
                    >
                      <p className="truncate text-[12px] font-medium text-slate-700">
                        {project.name}
                      </p>
                      <div className="h-[10px] overflow-hidden rounded-full bg-slate-100">
                        <div className="flex h-full" style={{ width: `${project.progress}%` }}>
                          <div className="h-full flex-1 bg-emerald-500" />
                          <div className="h-full w-[70px] bg-[#2563eb]" />
                          <div className="h-full w-[44px] bg-amber-400" />
                        </div>
                      </div>
                      <p className="text-right text-[11px] font-bold">{project.progress}%</p>
                    </div>
                  ))}
                </div>
                <div className="mt-[25px] flex gap-[25px] text-[11px] text-slate-500">
                  {[
                    ["bg-emerald-500", "Completed"],
                    ["bg-[#2563eb]", "In Progress"],
                    ["bg-amber-400", "Pending"],
                    ["bg-slate-200", "Not Started"],
                  ].map(([dot, label]) => (
                    <span key={label} className="flex items-center gap-[8px]">
                      <span className={`size-[8px] rounded-full ${dot}`} />
                      {label}
                    </span>
                  ))}
                </div>
              </article>

              <article className="span-6 summary-card h-[246px] rounded-[9px] border border-slate-200 bg-white p-[20px] shadow-[0_2px_8px_rgba(15,23,42,0.04)] dark:border-[var(--cc-border)] dark:bg-card">
                <div className="mb-[20px] flex items-center justify-between">
                  <h2 className="text-[13px] font-bold">Gate Status Summary</h2>
                  <Link href="/projects" className="text-[11px] font-semibold text-[#1d4ed8]">
                    View all gates
                  </Link>
                </div>
                <div className="space-y-[14px]">
                  {gateSummary.map((gate) => {
                    const Icon = decisionIcon(gate.label);
                    return (
                      <div
                        key={gate.gate}
                        className="grid grid-cols-[190px_110px_1fr] items-center gap-[16px]"
                      >
                        <div className="flex items-center gap-[8px]">
                          <Icon
                            className={`size-[15px] ${decisionIconTone(gate.label)}`}
                            aria-hidden="true"
                          />
                          <span className="text-[12px] font-semibold">
                            {gate.gate}: {gate.title}
                          </span>
                        </div>
                        <span
                          className={`text-[11px] font-semibold ${
                            gate.label === "Changes Requested"
                              ? "text-rose-600"
                              : gate.label === "Approved"
                                ? "text-emerald-600"
                                : "text-amber-600"
                          }`}
                        >
                          {gate.count} {gate.label}
                        </span>
                        <div className="h-[7px] rounded-full bg-slate-100">
                          <div
                            className={`h-[7px] rounded-full ${gateBarTone(gate.label)}`}
                            style={{ width: gate.width }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </article>
            </section>

            <section className="command-grid card-grid-12">
              <article className="span-4 rounded-[9px] border border-slate-200 bg-white p-[15px] shadow-[0_2px_8px_rgba(15,23,42,0.04)] dark:border-[var(--cc-border)] dark:bg-card">
                <h2 className="mb-[14px] text-[13px] font-bold">My Next Actions</h2>
                <div className="space-y-[11px]">
                  {[
                    [
                      "Review Gate G2",
                      displayProjects[0]?.name ?? sampleProjects[0],
                      "Due Today",
                      "text-amber-700 bg-amber-50",
                    ],
                    [
                      "Complete Artifact A-3.2",
                      displayProjects[1]?.name ?? sampleProjects[1],
                      "Due in 2 days",
                      "text-blue-700 bg-blue-50",
                    ],
                    [
                      "Provide Evidence",
                      displayProjects[2]?.name ?? sampleProjects[2],
                      "Overdue",
                      "text-rose-700 bg-rose-50",
                    ],
                    [
                      "Review Gate G1",
                      displayProjects[3]?.name ?? sampleProjects[3],
                      "Due in 3 days",
                      "text-fuchsia-700 bg-fuchsia-50",
                    ],
                  ].map(([title, project, due, tone]) => (
                    <div key={title} className="flex items-center gap-[9px]">
                      <Circle className="size-[12px] shrink-0 text-slate-300" aria-hidden="true" />
                      <div className="min-w-0 flex-1 leading-tight">
                        <p className="truncate text-[11.5px] font-bold">{title}</p>
                        <p className="truncate text-[10px] text-slate-500">{project}</p>
                      </div>
                      <span
                        className={`whitespace-nowrap rounded-full px-[7px] py-[2px] text-[9px] font-bold ${tone}`}
                      >
                        {due}
                      </span>
                    </div>
                  ))}
                </div>
                <Link href="/projects" className="mt-[12px] inline-flex text-[11px] font-semibold text-[#1d4ed8]">
                  View all actions
                </Link>
              </article>

              <article className="span-4 rounded-[9px] border border-slate-200 bg-white p-[15px] shadow-[0_2px_8px_rgba(15,23,42,0.04)] dark:border-[var(--cc-border)] dark:bg-card">
                <div className="mb-[14px] flex items-center justify-between gap-[8px]">
                  <h2 className="whitespace-nowrap text-[13px] font-bold">Recent Decisions</h2>
                  <Link
                    href="/projects"
                    className="whitespace-nowrap text-[11px] font-semibold text-[#1d4ed8]"
                  >
                    View all decisions
                  </Link>
                </div>
                <div className="space-y-[12px]">
                  {decisionRows.slice(0, 3).map((decision) => (
                    <div
                      key={`${decision.gate}-${decision.project}`}
                      className="flex items-center gap-[9px]"
                    >
                      <Circle
                        className="size-[12px] shrink-0 text-slate-300"
                        aria-hidden="true"
                      />
                      <div className="min-w-0 flex-1 leading-tight">
                        <p className="truncate text-[11.5px] font-bold">
                          {decision.gate} {decision.label}
                        </p>
                        <p className="truncate text-[10px] text-slate-500">
                          {decision.project}
                        </p>
                      </div>
                      <span
                        className={`whitespace-nowrap rounded-full px-[7px] py-[2px] text-[9px] font-bold ${decisionTone(decision.label)}`}
                      >
                        {decision.label}
                      </span>
                    </div>
                  ))}
                </div>
                <Link
                  href="/projects"
                  className="mt-[12px] inline-flex text-[11px] font-semibold text-[#1d4ed8]"
                >
                  View all decisions
                </Link>
              </article>

              <article className="span-4 overflow-hidden rounded-[9px] border border-slate-200 bg-white p-[17px] shadow-[0_2px_8px_rgba(15,23,42,0.04)] dark:border-[var(--cc-border)] dark:bg-card">
                <div className="mb-[14px] flex items-center justify-between gap-[8px]">
                  <h2 className="whitespace-nowrap text-[13px] font-bold">Projects Snapshot</h2>
                  <Link
                    href="/projects"
                    className="whitespace-nowrap text-[11px] font-semibold text-[#1d4ed8]"
                  >
                    View all projects
                  </Link>
                </div>
                <table className="w-full table-fixed text-left">
                  <colgroup>
                    <col className="w-[44%]" />
                    <col className="w-[16%]" />
                    <col className="w-[14%]" />
                    <col className="w-[26%]" />
                  </colgroup>
                  <thead className="text-[10px] text-slate-500">
                    <tr>
                      <th className="pb-[8px] pr-[6px] font-medium">Project</th>
                      <th className="pb-[8px] pr-[6px] font-medium">Phase</th>
                      <th className="pb-[8px] pr-[6px] font-medium">Gate</th>
                      <th className="pb-[8px] font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayProjects.map((project) => (
                      <tr key={project.name} className="border-t border-slate-100">
                        <td className="truncate py-[7px] pr-[6px] text-[10.5px] font-medium">
                          {project.name}
                        </td>
                        <td className="py-[7px] pr-[6px] text-[10.5px] text-slate-600">
                          {project.phase}/9
                        </td>
                        <td className="py-[7px] pr-[6px] text-[10.5px] text-slate-600">
                          {project.gate}
                        </td>
                        <td className="py-[7px]">
                          <span
                            className={`inline-flex whitespace-nowrap rounded-full px-[7px] py-[2px] text-[9px] font-bold ${
                              project.status === "Blocked"
                                ? "bg-rose-50 text-rose-700"
                                : "bg-blue-50 text-blue-700"
                            }`}
                          >
                            {project.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </article>
            </section>

            <section className="command-grid card-grid-12">
              <footer className="span-12 action-bar flex min-h-[44px] flex-col gap-3 rounded-[9px] border border-slate-200 bg-white px-[19px] py-3 text-[11px] text-slate-500 shadow-[0_2px_8px_rgba(15,23,42,0.04)] sm:flex-row sm:items-center sm:justify-between dark:border-[var(--cc-border)] dark:bg-card">
                <span className="flex items-center gap-[10px]">
                  <Sparkles className="size-[15px] shrink-0 text-amber-500" aria-hidden="true" />
                  Tip: Keep your evidence and artifacts up to date to ensure smooth gate reviews.
                </span>
                <Link href="/projects" className="shrink-0 font-semibold text-[#1d4ed8]">
                  View Lifecycle Guide
                </Link>
              </footer>
            </section>
          </div>
        </div>
      </main>
    </AuthenticatedAppShell>
  );
}
