"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, Filter, Flag, MessageSquarePlus, MoreHorizontal, Search, Share2, Shield, Star } from "lucide-react";

import { AuthenticatedAppShell } from "@/components/lifecycle-workspace/authenticated-app-shell";
import { Breadcrumbs } from "@/components/lifecycle-workspace/breadcrumbs";
import { TopHeader } from "@/components/lifecycle-workspace/top-header";
import { Button } from "@/components/ui/button";
import { createCommentHistoryEvent, createDecisionHistoryEvent, evaluateDecisionState } from "@/lib/approval-decision";
import { approvalPriorityBadgeMap, approvalStatusBadgeMap, historyToneMap, inputStatusBadgeMap } from "@/lib/approval-status";
import { cn } from "@/lib/utils";
import type {
  ApprovalCenterData,
  ApprovalDecisionDraft,
  ApprovalDecisionType,
  ApprovalHistoryEvent,
  ApprovalPackage,
  ApprovalQueueTab,
  ApproverComment,
  PendingApproval,
} from "@/types/approval-center.types";

type QueueFilters = {
  search: string;
  type: "all" | PendingApproval["approvalType"];
  status: "all" | PendingApproval["status"];
  priority: "all" | PendingApproval["priority"];
  sort: "due" | "priority" | "submitted" | "project";
};

const toneClass: Record<"green" | "amber" | "red" | "blue" | "purple" | "gray", string> = {
  green: "border-emerald-200 bg-emerald-50 text-emerald-800",
  amber: "border-amber-200 bg-amber-50 text-amber-900",
  red: "border-red-200 bg-red-50 text-red-800",
  blue: "border-blue-200 bg-blue-50 text-blue-800",
  purple: "border-violet-200 bg-violet-50 text-violet-800",
  gray: "border-slate-200 bg-slate-50 text-slate-700",
};

function Badge({ label, tone }: { label: string; tone: keyof typeof toneClass }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium", toneClass[tone])}>
      {label}
    </span>
  );
}

function decisionButtonTone(decision: ApprovalDecisionType, selected: boolean) {
  if (decision === "approve") {
    return selected
      ? "border-emerald-300 bg-emerald-600 text-white"
      : "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100";
  }
  if (decision === "request_changes") {
    return selected
      ? "border-amber-300 bg-amber-500 text-white"
      : "border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100";
  }
  return selected
    ? "border-red-300 bg-red-600 text-white"
    : "border-red-200 bg-red-50 text-red-800 hover:bg-red-100";
}

function normalizeForSearch(value: string) {
  return value.toLowerCase();
}

function byPriorityRank(priority: PendingApproval["priority"]) {
  if (priority === "critical") return 4;
  if (priority === "high") return 3;
  if (priority === "medium") return 2;
  return 1;
}

function sortedQueue(rows: PendingApproval[], sort: QueueFilters["sort"]) {
  const cloned = [...rows];
  switch (sort) {
    case "priority":
      return cloned.sort((a, b) => byPriorityRank(b.priority) - byPriorityRank(a.priority));
    case "project":
      return cloned.sort((a, b) => a.projectName.localeCompare(b.projectName));
    case "submitted":
      return cloned.sort((a, b) => b.submittedOnLabel.localeCompare(a.submittedOnLabel));
    case "due":
      return cloned.sort((a, b) => (a.dueDateLabel ?? "").localeCompare(b.dueDateLabel ?? ""));
    default: {
      const neverSort: never = sort;
      throw new Error(`Unsupported sort value: ${String(neverSort)}`);
    }
  }
}

const QUEUE_TABS: { id: ApprovalQueueTab; label: string }[] = [
  { id: "pending", label: "Pending" },
  { id: "my_reviews", label: "My reviews" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
  { id: "changes_requested", label: "Changes requested" },
  { id: "history", label: "History" },
];

export function ApprovalCenterPage({ initial }: { initial: ApprovalCenterData }) {
  const router = useRouter();
  const [queueTab, setQueueTab] = useState<ApprovalQueueTab>("pending");
  const [filters, setFilters] = useState<QueueFilters>({
    search: "",
    type: "all",
    status: "all",
    priority: "all",
    sort: "due",
  });
  const [selectedApprovalId, setSelectedApprovalId] = useState(initial.selectedApproval.detail.id);
  const [packages, setPackages] = useState<Record<string, ApprovalPackage>>(initial.approvalPackages);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [commentDraft, setCommentDraft] = useState("");
  const [commentVisibility, setCommentVisibility] = useState<ApproverComment["visibility"]>("public_to_project");
  const [decisionDraft, setDecisionDraft] = useState<ApprovalDecisionDraft>(() => initial.selectedApproval.decisionDraft);
  const commentBoxRef = useRef<HTMLTextAreaElement | null>(null);
  const decisionPanelRef = useRef<HTMLDivElement | null>(null);
  const submitHelperId = "approval-submit-helper";

  const selectedPackage = packages[selectedApprovalId];

  const queueRows = useMemo(() => {
    if (queueTab === "history") return [];
    const byTab = initial.pendingApprovals.filter((row) => row.queueTab === queueTab);
    const byFilter = byTab.filter((row) => {
      const matchesSearch =
        filters.search.trim().length === 0 ||
        normalizeForSearch(`${row.approvalCode} ${row.title} ${row.projectName} ${row.submittedBy} ${row.approvalType}`).includes(
          normalizeForSearch(filters.search.trim()),
        );
      const matchesType = filters.type === "all" || row.approvalType === filters.type;
      const matchesStatus = filters.status === "all" || row.status === filters.status;
      const matchesPriority = filters.priority === "all" || row.priority === filters.priority;
      return matchesSearch && matchesType && matchesStatus && matchesPriority;
    });
    return sortedQueue(byFilter, filters.sort);
  }, [filters, initial.pendingApprovals, queueTab]);

  const mergedHistoryEvents = useMemo(() => {
    const out: ApprovalHistoryEvent[] = [];
    for (const pkg of Object.values(packages)) {
      out.push(...pkg.history);
    }
    return out.sort((a, b) => a.timestampLabel.localeCompare(b.timestampLabel));
  }, [packages]);

  useEffect(() => {
    if (queueTab === "history") return;
    if (queueRows.length === 0) return;
    if (!queueRows.some((r) => r.id === selectedApprovalId)) {
      const next = queueRows[0]?.id;
      if (next) {
        setSelectedApprovalId(next);
        router.replace(`/approvals/${next}`);
      }
    }
  }, [queueRows, queueTab, router, selectedApprovalId]);

  const selectedActionState = useMemo(() => {
    if (!selectedPackage) {
      return {
        readinessLabel: "Review Readiness",
        readinessSummary: "No approval selected.",
        canSaveReview: false,
        canSubmitDecision: false,
        submitBlockers: ["Select an approval to review details."],
      };
    }
    return evaluateDecisionState(decisionDraft, selectedPackage);
  }, [decisionDraft, selectedPackage]);

  const onSelectApproval = (approvalId: string) => {
    if (!packages[approvalId]) {
      setErrorMessage("Selected approval package is unavailable. Please retry.");
      return;
    }
    setErrorMessage(null);
    setIsLoading(true);
    window.setTimeout(() => {
      setSelectedApprovalId(approvalId);
      setDecisionDraft(packages[approvalId].decisionDraft);
      setCommentDraft("");
      setIsLoading(false);
      router.push(`/approvals/${approvalId}`);
    }, 160);
  };

  const onAddComment = () => {
    if (!selectedPackage) return;
    const body = commentDraft.trim();
    if (body.length === 0) return;
    const newComment: ApproverComment = {
      id: `comment-${Date.now()}`,
      authorName: initial.user.name,
      authorRole: initial.user.role,
      authorInitials: initial.user.initials,
      statusAtComment: "in_review",
      createdOnLabel: new Date().toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }),
      body,
      visibility: commentVisibility,
    };

    setPackages((prev) => {
      const current = prev[selectedPackage.detail.id];
      if (!current) return prev;
      return {
        ...prev,
        [selectedPackage.detail.id]: {
          ...current,
          comments: [newComment, ...current.comments],
          history: [createCommentHistoryEvent(initial.user.name), ...current.history],
        },
      };
    });
    setCommentDraft("");
  };

  const onSubmitDecision = () => {
    if (!selectedPackage) return;
    const selectedDecision = decisionDraft.decision;
    const state = evaluateDecisionState(decisionDraft, selectedPackage);
    if (!state.canSubmitDecision || !selectedDecision) {
      decisionPanelRef.current?.focus();
      return;
    }

    setPackages((prev) => {
      const current = prev[selectedPackage.detail.id];
      if (!current) return prev;
      const nextStatus =
        selectedDecision === "approve"
          ? "approved"
          : selectedDecision === "request_changes"
            ? "changes_requested"
            : "rejected";
      return {
        ...prev,
        [selectedPackage.detail.id]: {
          ...current,
          detail: { ...current.detail, status: nextStatus },
          decisionDraft: {
            ...decisionDraft,
            canSubmit: true,
            blockers: [],
          },
          history: [createDecisionHistoryEvent(selectedDecision, initial.user.name), ...current.history],
          actionState: {
            ...state,
            canSubmitDecision: false,
            submitBlockers: ["Decision already finalized for this approval package."],
          },
        },
      };
    });
    setDecisionDraft((prev) => ({
      ...prev,
      canSubmit: true,
      blockers: [],
    }));
  };

  const onSaveReview = () => {
    if (!selectedPackage) return;
    setPackages((prev) => ({
      ...prev,
      [selectedPackage.detail.id]: {
        ...selectedPackage,
        decisionDraft: decisionDraft,
      },
    }));
  };

  const retryLoad = () => {
    setErrorMessage(null);
    setIsLoading(false);
  };

  return (
    <AuthenticatedAppShell
      projectId={selectedPackage?.detail.projectId ?? "sip-001"}
      projectName={selectedPackage?.detail.projectName ?? "Secure Identity Platform"}
      phaseSummary="Approval workflow operations"
      phaseProgressPct={65}
      navActive="gates"
    >
      <TopHeader title="Approval Center" userInitials={initial.user.initials} notificationCount={6} />

      <main className="flex min-h-0 min-w-0 flex-1 flex-col bg-[#f8fafc] dark:bg-background">
        <div className="mx-auto w-full max-w-[1920px] px-5 pb-3 pt-4 min-[901px]:px-8">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/dashboard" },
              { label: "Approval Center", href: "/approvals" },
              {
                label: "Gate Review",
                href: `/projects/${selectedPackage?.detail.projectId ?? "sip-001"}/gates/g2/review`,
              },
              { label: selectedPackage?.detail.title ?? "Select an approval" },
            ]}
          />
        </div>

        {errorMessage ? (
          <div className="mx-auto mb-3 w-full max-w-[1920px] px-5 min-[901px]:px-8">
            <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
              <p>{errorMessage}</p>
              <Button type="button" size="sm" variant="outline" onClick={retryLoad}>
                Retry
              </Button>
            </div>
          </div>
        ) : null}

        <div className="approval-center mx-auto w-full max-w-[1920px] flex-1 overflow-y-auto px-5 pb-6 min-[901px]:px-8">
          <section className="pending-approvals-panel min-w-0 space-y-4 rounded-2xl border border-[#e5e7eb] bg-white p-4 shadow-sm">
            <header className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold text-[#111827]">Approvals</h2>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                    {queueTab === "history" ? mergedHistoryEvents.length : queueRows.length}
                  </span>
                </div>
                <Button type="button" variant="outline" size="icon-sm" aria-label="Filter approvals">
                  <Filter className="size-4" aria-hidden />
                </Button>
              </div>
              <div role="tablist" aria-label="Approval queues" className="flex flex-wrap gap-2">
                {QUEUE_TABS.map((tab) => {
                  const active = queueTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs font-semibold outline-none transition focus-visible:ring-2 focus-visible:ring-blue-400",
                        active ? "border-blue-300 bg-blue-50 text-blue-800" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                      )}
                      onClick={() => setQueueTab(tab.id)}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </header>

            {queueTab !== "history" ? (
              <>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden />
              <input
                type="search"
                value={filters.search}
                onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
                placeholder="Search approvals..."
                className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Search approvals"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <select
                className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs"
                value={filters.type}
                onChange={(event) => setFilters((prev) => ({ ...prev, type: event.target.value as QueueFilters["type"] }))}
                aria-label="Filter by approval type"
              >
                <option value="all">All Types</option>
                <option value="gate_review">Gate Review</option>
                <option value="artifact_review">Artifact Review</option>
                <option value="phase_approval">Phase Approval</option>
                <option value="exception_approval">Exception Approval</option>
                <option value="funding_approval">Funding Approval</option>
              </select>
              <select
                className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs"
                value={filters.status}
                onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value as QueueFilters["status"] }))}
                aria-label="Filter by approval status"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in_review">In Review</option>
                <option value="overdue">Overdue</option>
                <option value="blocked">Blocked</option>
              </select>
              <select
                className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs"
                value={filters.priority}
                onChange={(event) =>
                  setFilters((prev) => ({ ...prev, priority: event.target.value as QueueFilters["priority"] }))
                }
                aria-label="Filter by approval priority"
              >
                <option value="all">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
              <select
                className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs"
                value={filters.sort}
                onChange={(event) => setFilters((prev) => ({ ...prev, sort: event.target.value as QueueFilters["sort"] }))}
                aria-label="Sort approvals"
              >
                <option value="due">Sort: Due Date</option>
                <option value="priority">Sort: Priority</option>
                <option value="submitted">Sort: Submitted</option>
                <option value="project">Sort: Project</option>
              </select>
            </div>
              </>
            ) : (
              <p className="text-xs text-slate-500">Consolidated timeline from all approval packages below.</p>
            )}

            {isLoading ? (
              <div className="space-y-2">
                <div className="h-16 animate-pulse rounded-lg bg-slate-100" />
                <div className="h-16 animate-pulse rounded-lg bg-slate-100" />
                <div className="h-16 animate-pulse rounded-lg bg-slate-100" />
              </div>
            ) : queueTab === "history" ? (
              mergedHistoryEvents.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  <p>No history events recorded yet.</p>
                </div>
              ) : (
                <ul className="space-y-2" aria-label="Approval history timeline">
                  {mergedHistoryEvents.map((ev) => (
                    <li key={ev.id} className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm shadow-sm">
                      <p className="font-semibold text-slate-800">{ev.title}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {ev.actorName}
                        {ev.actorRole ? ` · ${ev.actorRole}` : ""} · {ev.timestampLabel}
                      </p>
                      {ev.description ? <p className="mt-2 text-slate-600">{ev.description}</p> : null}
                      <span className="mt-2 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                        {ev.eventType.replaceAll("_", " ")}
                      </span>
                    </li>
                  ))}
                </ul>
              )
            ) : queueRows.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                <p>No approvals in this queue match your filters.</p>
                <button
                  type="button"
                  className="mt-2 inline-block font-semibold text-[#2563eb] hover:underline"
                  onClick={() => setFilters({ search: "", type: "all", status: "all", priority: "all", sort: "due" })}
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <ul className="space-y-2" role="listbox" aria-label="Approval queue">
                {queueRows.map((row) => {
                  const selected = row.id === selectedApprovalId;
                  return (
                    <li key={row.id}>
                      <div
                        role="option"
                        tabIndex={0}
                        className={cn(
                          "w-full rounded-xl border px-3 py-3 text-left outline-none transition focus-visible:ring-2 focus-visible:ring-blue-400",
                          selected
                            ? "border-blue-300 bg-blue-50 shadow-[0_0_0_1px_rgba(37,99,235,0.25)]"
                            : "border-slate-200 bg-white hover:bg-slate-50",
                        )}
                        aria-selected={selected}
                        onClick={() => onSelectApproval(row.id)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            onSelectApproval(row.id);
                          }
                        }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold text-[#0f172a]">{row.title}</p>
                          {row.dueDateLabel ? (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-900">
                              {row.dueDateLabel}
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                          {row.approvalType.replaceAll("_", " ")} • {row.projectName}
                        </p>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <p className="text-xs text-slate-500">Submitted {row.submittedOnLabel}</p>
                          <Badge {...approvalPriorityBadgeMap[row.priority]} />
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="approval-detail-panel min-w-0 space-y-4">
            {!selectedPackage ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">
                <p>Select an approval to review details.</p>
              </div>
            ) : (
              <>
                <article className="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
                  <header className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
                    <div className="flex items-start gap-3">
                      <div className="grid size-11 place-items-center rounded-xl bg-amber-100 text-amber-700">
                        <Shield className="size-5" aria-hidden />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-2xl font-semibold text-[#111827]">{selectedPackage.detail.title}</h2>
                          <Badge {...approvalStatusBadgeMap[selectedPackage.detail.status]} />
                        </div>
                        <p className="mt-1 text-sm text-slate-600">{selectedPackage.detail.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button type="button" variant="outline" size="icon-sm" aria-label="Star approval">
                        <Star className="size-4" aria-hidden />
                      </Button>
                      <Button type="button" variant="outline" size="sm" className="gap-1.5" aria-label="Share approval">
                        <Share2 className="size-3.5" aria-hidden />
                        Share
                      </Button>
                      <Button type="button" variant="outline" size="icon-sm" aria-label="More actions">
                        <MoreHorizontal className="size-4" aria-hidden />
                      </Button>
                    </div>
                  </header>

                  <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm min-[1024px]:grid-cols-5">
                    <MetaItem label="Project" value={selectedPackage.detail.projectName} />
                    <MetaItem
                      label="Phase"
                      value={
                        selectedPackage.detail.phaseNumber && selectedPackage.detail.phaseName
                          ? `${selectedPackage.detail.phaseNumber} ${selectedPackage.detail.phaseName}`
                          : "—"
                      }
                    />
                    <MetaItem
                      label="Type"
                      value={selectedPackage.detail.approvalType.replaceAll("_", " ")}
                    />
                    <MetaItem label="Submitted By" value={selectedPackage.detail.submittedBy} />
                    <MetaItem label="Submitted On" value={selectedPackage.detail.submittedOnLabel} />
                    <MetaItem label="Due Date" value={selectedPackage.detail.dueDateLabel ?? "—"} />
                    <MetaItem label="Priority" value={selectedPackage.detail.priority} />
                    <MetaItem label="Linked Artifacts" value={String(selectedPackage.detail.linkedArtifactsCount)} />
                    <MetaItem label="Evidence Items" value={String(selectedPackage.detail.evidenceItemsCount)} />
                    <MetaItem label="Approvers" value={String(selectedPackage.detail.approversCount)} />
                  </dl>
                </article>

                <article className="rounded-2xl border border-[#e5e7eb] bg-white p-4 shadow-sm">
                  <header className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-[#111827]">Required Inputs</h3>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                        {selectedPackage.requiredInputs.length}
                      </span>
                    </div>
                    <Link
                      href={`/projects/${selectedPackage.detail.projectId}/workspace`}
                      className="text-xs font-semibold text-[#2563eb] hover:underline"
                    >
                      View all inputs
                    </Link>
                  </header>

                  {isLoading ? (
                    <div className="space-y-2">
                      <div className="h-10 animate-pulse rounded bg-slate-100" />
                      <div className="h-10 animate-pulse rounded bg-slate-100" />
                    </div>
                  ) : selectedPackage.requiredInputs.length === 0 ? (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                      <p>No required inputs configured for this approval.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[760px] text-left text-sm">
                        <thead className="text-xs uppercase tracking-wide text-slate-500">
                          <tr>
                            <th className="pb-2">Input</th>
                            <th className="pb-2">Description</th>
                            <th className="pb-2">Status</th>
                            <th className="pb-2">Linked Artifact / Evidence</th>
                            <th className="pb-2">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedPackage.requiredInputs.map((row) => (
                            <tr key={row.id} className="border-b border-slate-100 last:border-b-0">
                              <td className="py-2">
                                <p className="font-semibold text-slate-800">{row.name}</p>
                                <p className="text-xs text-slate-500">{row.inputCode}</p>
                              </td>
                              <td className="py-2 text-slate-700">{row.description}</td>
                              <td className="py-2">
                                <Badge {...inputStatusBadgeMap[row.status]} />
                              </td>
                              <td className="py-2">
                                {row.linkedObjectHref && row.linkedObjectLabel ? (
                                  <Link href={row.linkedObjectHref} className="font-medium text-[#2563eb] hover:underline">
                                    {row.linkedObjectLabel}
                                  </Link>
                                ) : (
                                  <span className="text-slate-500">Not linked</span>
                                )}
                              </td>
                              <td className="py-2">
                                {row.linkedObjectHref ? (
                                  <Link href={row.linkedObjectHref} className="text-sm font-semibold text-[#2563eb] hover:underline">
                                    Open
                                  </Link>
                                ) : (
                                  <span className="text-xs text-slate-500">—</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </article>

                <article className="rounded-2xl border border-[#e5e7eb] bg-white p-4 shadow-sm">
                  <header className="mb-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-[#111827]">Approver Comments</h3>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                        {selectedPackage.comments.length}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => commentBoxRef.current?.focus()}
                    >
                      <MessageSquarePlus className="size-3.5" aria-hidden />
                      Add Comment
                    </Button>
                  </header>

                  {selectedPackage.comments.length === 0 ? (
                    <div className="mb-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                      <p>No approver comments yet.</p>
                    </div>
                  ) : (
                    <ul className="space-y-3">
                      {selectedPackage.comments.map((comment) => (
                        <li key={comment.id} className="rounded-xl border border-slate-200 p-3">
                          <div className="flex items-start gap-2">
                            <div className="grid size-8 place-items-center rounded-full bg-blue-600 text-xs font-semibold text-white">
                              {comment.authorInitials}
                            </div>
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm font-semibold text-slate-800">
                                  {comment.authorName} ({comment.authorRole})
                                </p>
                                {comment.statusAtComment ? (
                                  <Badge {...approvalStatusBadgeMap[comment.statusAtComment]} />
                                ) : null}
                                <p className="text-xs text-slate-500">{comment.createdOnLabel}</p>
                              </div>
                              <p className="mt-1 text-sm text-slate-700">{comment.body}</p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <label htmlFor="approval-comment-composer" className="text-sm font-semibold text-slate-800">
                      Comment
                    </label>
                    <textarea
                      id="approval-comment-composer"
                      ref={commentBoxRef}
                      value={commentDraft}
                      onChange={(event) => setCommentDraft(event.target.value.slice(0, 1200))}
                      rows={3}
                      className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
                      placeholder="Add review comments..."
                    />
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                      <select
                        className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs"
                        value={commentVisibility}
                        onChange={(event) =>
                          setCommentVisibility(event.target.value as ApproverComment["visibility"])
                        }
                        aria-label="Comment visibility"
                      >
                        <option value="public_to_project">Visible to project</option>
                        <option value="internal">Internal only</option>
                      </select>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-slate-500">{commentDraft.length}/1200 characters</p>
                        <Button type="button" size="sm" disabled={commentDraft.trim().length === 0} onClick={onAddComment}>
                          Add Comment
                        </Button>
                      </div>
                    </div>
                  </div>
                </article>
              </>
            )}
          </section>

          <aside className="approval-review-panel min-w-0 space-y-4">
            <article className="rounded-2xl border border-[#e5e7eb] bg-white p-4 shadow-sm">
              <header className="mb-3 flex items-center justify-between">
                <h3 className="text-base font-semibold text-[#111827]">Approval History</h3>
                {selectedPackage ? (
                  <Link href={`/approvals/${selectedPackage.detail.id}`} className="text-xs font-semibold text-[#2563eb] hover:underline">
                    View full history
                  </Link>
                ) : null}
              </header>
              {!selectedPackage || selectedPackage.history.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                  <p>No approval history recorded yet.</p>
                </div>
              ) : (
                <ol className="space-y-4">
                  {selectedPackage.history.map((event) => (
                    <TimelineEvent key={event.id} event={event} />
                  ))}
                </ol>
              )}
            </article>

            <article
              ref={decisionPanelRef}
              tabIndex={-1}
              className="rounded-2xl border border-[#e5e7eb] bg-white p-4 shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            >
              <header className="mb-2">
                <h3 className="text-base font-semibold text-[#111827]">Record Your Decision</h3>
                <p className="text-xs text-slate-500">Select a decision and provide optional comments.</p>
              </header>

              {!selectedPackage ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                  <p>Select an approval to record a decision.</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-2">
                    {(["approve", "request_changes", "reject"] as const).map((decision) => (
                      <button
                        key={decision}
                        type="button"
                        className={cn(
                          "rounded-lg border px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                          decisionButtonTone(decision, decisionDraft.decision === decision),
                        )}
                        aria-pressed={decisionDraft.decision === decision}
                        onClick={() => setDecisionDraft((prev) => ({ ...prev, decision }))}
                      >
                        {decision === "approve"
                          ? "Approve"
                          : decision === "request_changes"
                            ? "Request Changes"
                            : "Reject"}
                      </button>
                    ))}
                  </div>

                  <div className="mt-3">
                    <label htmlFor="decision-comments" className="text-sm font-semibold text-slate-800">
                      Comments {decisionDraft.decision === "request_changes" || decisionDraft.decision === "reject" ? "(required)" : "(optional)"}
                    </label>
                    <textarea
                      id="decision-comments"
                      rows={4}
                      value={decisionDraft.comments}
                      onChange={(event) =>
                        setDecisionDraft((prev) => ({ ...prev, comments: event.target.value.slice(0, 2000) }))
                      }
                      className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
                      placeholder="Add decision comments or instructions..."
                    />
                    <p className="mt-1 text-xs text-slate-500">{decisionDraft.comments.length}/2000 characters</p>
                  </div>

                  {(decisionDraft.decision === "request_changes" || decisionDraft.decision === "reject") && (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-800">
                          {decisionDraft.decision === "request_changes" ? "Required Changes" : "Rejection Reasons"}
                        </p>
                        <Button
                          type="button"
                          size="xs"
                          variant="outline"
                          onClick={() =>
                            setDecisionDraft((prev) => ({
                              ...prev,
                              requiredChanges: [...prev.requiredChanges, ""],
                            }))
                          }
                        >
                          Add
                        </Button>
                      </div>
                      {decisionDraft.requiredChanges.length === 0 ? (
                        <p className="text-xs text-amber-700">Add at least one item before submitting this decision.</p>
                      ) : null}
                      {decisionDraft.requiredChanges.map((item, index) => (
                        <div key={`required-change-${index}`} className="flex gap-2">
                          <input
                            type="text"
                            value={item}
                            onChange={(event) =>
                              setDecisionDraft((prev) => ({
                                ...prev,
                                requiredChanges: prev.requiredChanges.map((value, i) => (i === index ? event.target.value : value)),
                              }))
                            }
                            className="h-9 flex-1 rounded-md border border-slate-200 bg-white px-2 text-sm"
                            aria-label={`Required change ${index + 1}`}
                          />
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setDecisionDraft((prev) => ({
                                ...prev,
                                requiredChanges: prev.requiredChanges.filter((_, i) => i !== index),
                              }))
                            }
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {!selectedActionState.canSubmitDecision && selectedActionState.submitBlockers.length > 0 ? (
                    <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800" role="alert">
                      {selectedActionState.submitBlockers.join(" · ")}
                    </div>
                  ) : null}
                </>
              )}
            </article>
          </aside>
        </div>

        <footer className="approval-action-bar sticky bottom-0 z-20 border-t border-[#e5e7eb] bg-white px-5 py-4 shadow-[0_-8px_24px_rgba(15,23,42,0.06)] min-[901px]:px-8">
          <div className="flex min-w-0 items-start gap-3 rounded-xl border border-blue-200 bg-blue-50/70 p-3">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-[#2563eb]" aria-hidden />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#111827]">{selectedActionState.readinessLabel}</p>
              <p className="text-sm text-slate-600">{selectedActionState.readinessSummary}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3">
            {!selectedActionState.canSubmitDecision && selectedActionState.submitBlockers.length > 0 ? (
              <>
                <p id={submitHelperId} className="sr-only">
                  Submit disabled: {selectedActionState.submitBlockers.join(" ")}
                </p>
                <p className="hidden max-w-md text-right text-xs text-slate-500 min-[901px]:block">
                  {selectedActionState.submitBlockers.join(" · ")}
                </p>
              </>
            ) : null}
            <Button type="button" variant="outline" size="lg" disabled={!selectedActionState.canSaveReview} onClick={onSaveReview}>
              Save Review
            </Button>
            <Button
              type="button"
              size="lg"
              className="gap-2 bg-[#2563eb] text-white hover:bg-blue-700"
              disabled={!selectedActionState.canSubmitDecision}
              aria-describedby={!selectedActionState.canSubmitDecision ? submitHelperId : undefined}
              onClick={onSubmitDecision}
            >
              Submit Decision
              <Flag className="size-4" aria-hidden />
            </Button>
          </div>
        </footer>
      </main>
    </AuthenticatedAppShell>
  );
}

function TimelineEvent({ event }: { event: ApprovalHistoryEvent }) {
  return (
    <li className="relative pl-6">
      <span className={cn("absolute left-0 top-1.5 size-2.5 rounded-full", dotToneClass(historyToneMap[event.statusTone]))} />
      <p className="text-sm font-semibold text-slate-800">{event.title}</p>
      <p className="text-xs text-slate-500">
        {event.actorName}
        {event.actorRole ? ` (${event.actorRole})` : ""} · {event.timestampLabel}
      </p>
      {event.description ? <p className="mt-1 text-sm text-slate-600">{event.description}</p> : null}
    </li>
  );
}

function dotToneClass(tone: "blue" | "green" | "amber" | "red" | "gray") {
  if (tone === "blue") return "bg-blue-500";
  if (tone === "green") return "bg-emerald-500";
  if (tone === "amber") return "bg-amber-500";
  if (tone === "red") return "bg-red-500";
  return "bg-slate-400";
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-slate-800">{value}</dd>
    </div>
  );
}
