"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { ApprovalCenterContent } from "@/components/approval-center/approval-center-content";
import { DEFAULT_QUEUE_FILTERS } from "@/components/approval-center/approval-center-ui.types";
import { AuthenticatedAppShell } from "@/components/lifecycle-workspace/authenticated-app-shell";
import { Breadcrumbs } from "@/components/lifecycle-workspace/breadcrumbs";
import { PaneSwitcher } from "@/components/lifecycle-workspace/pane-switcher";
import { TopHeader } from "@/components/lifecycle-workspace/top-header";
import { Button } from "@/components/ui/button";
import { recordApprovalDecision } from "@/app/actions/recordApprovalDecision";
import { createCommentHistoryEvent, createDecisionHistoryEvent, evaluateDecisionState } from "@/lib/approval-decision";
import { NOTIFICATIONS_HUB_HREF } from "@/lib/notifications-hub";
import type {
  ApprovalCenterData,
  ApprovalDecisionDraft,
  ApprovalHistoryEvent,
  ApprovalPackage,
  ApprovalQueueTab,
  ApproverComment,
  PendingApproval,
} from "@/types/approval-center.types";
import type { QueueFilters } from "@/components/approval-center/approval-center-ui.types";

function normalizeForSearch(value: string) {
  return value.toLowerCase();
}

function byPriorityRank(priority: PendingApproval["priority"]) {
  if (priority === "critical") return 4;
  if (priority === "high") return 3;
  if (priority === "medium") return 2;
  return 1;
}

function parseYmdStartMs(ymd: string): number | null {
  const t = ymd.trim();
  if (!t) return null;
  const d = new Date(`${t}T00:00:00`);
  const ms = d.getTime();
  return Number.isNaN(ms) ? null : ms;
}

function parseYmdEndMs(ymd: string): number | null {
  const t = ymd.trim();
  if (!t) return null;
  const d = new Date(`${t}T23:59:59.999`);
  const ms = d.getTime();
  return Number.isNaN(ms) ? null : ms;
}

function byStatusRank(status: PendingApproval["status"]) {
  if (status === "overdue") return 3;
  if (status === "blocked") return 2;
  if (status === "in_review") return 1;
  return 0;
}

function sortedQueue(rows: PendingApproval[], sort: QueueFilters["sort"]) {
  const cloned = [...rows];
  const tieId = (a: PendingApproval, b: PendingApproval) => a.id.localeCompare(b.id);
  switch (sort) {
    case "priority":
      return cloned.sort((a, b) => {
        const d = byPriorityRank(b.priority) - byPriorityRank(a.priority);
        return d !== 0 ? d : tieId(a, b);
      });
    case "project":
      return cloned.sort((a, b) => {
        const d = a.projectName.localeCompare(b.projectName);
        return d !== 0 ? d : tieId(a, b);
      });
    case "submitted":
      return cloned.sort((a, b) => {
        const d = b.submittedAtMs - a.submittedAtMs;
        return d !== 0 ? d : tieId(a, b);
      });
    case "due":
      return cloned.sort((a, b) => {
        const an = a.dueAtMs;
        const bn = b.dueAtMs;
        if (an == null && bn == null) return tieId(a, b);
        if (an == null) return 1;
        if (bn == null) return -1;
        const d = an - bn;
        return d !== 0 ? d : tieId(a, b);
      });
    case "type":
      return cloned.sort((a, b) => {
        const d = a.approvalType.localeCompare(b.approvalType);
        return d !== 0 ? d : tieId(a, b);
      });
    case "status":
      return cloned.sort((a, b) => {
        const d = byStatusRank(b.status) - byStatusRank(a.status);
        return d !== 0 ? d : tieId(a, b);
      });
    case "updated":
      return cloned.sort((a, b) => {
        const d = b.updatedAtMs - a.updatedAtMs;
        return d !== 0 ? d : tieId(a, b);
      });
    default: {
      const neverSort: never = sort;
      throw new Error(`Unsupported sort value: ${String(neverSort)}`);
    }
  }
}

export function ApprovalCenterPage({ initial }: { initial: ApprovalCenterData }) {
  const router = useRouter();
  const [queueTab, setQueueTab] = useState<ApprovalQueueTab>("pending");
  const [filters, setFilters] = useState<QueueFilters>(DEFAULT_QUEUE_FILTERS);
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>(initial.pendingApprovals);
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
  const [mobilePane, setMobilePane] = useState<"queue" | "detail" | "review">("detail");

  const selectedPackage = packages[selectedApprovalId];

  const unfilteredTabRows = useMemo(() => {
    if (queueTab === "history") return [];
    return pendingApprovals.filter((row) => row.queueTab === queueTab);
  }, [pendingApprovals, queueTab]);

  const queueRows = useMemo(() => {
    if (queueTab === "history") return [];
    const byTab = unfilteredTabRows;
    const dueFromMs = parseYmdStartMs(filters.dueFrom);
    const dueToMs = parseYmdEndMs(filters.dueTo);
    const hasDueRange = dueFromMs != null || dueToMs != null;
    const now = Date.now();
    const submitQ = normalizeForSearch(filters.submitterContains.trim());

    const byFilter = byTab.filter((row) => {
      const matchesSearch =
        filters.search.trim().length === 0 ||
        normalizeForSearch(`${row.approvalCode} ${row.title} ${row.projectName} ${row.submittedBy} ${row.approvalType}`).includes(
          normalizeForSearch(filters.search.trim()),
        );
      const matchesType = filters.type === "all" || row.approvalType === filters.type;
      const matchesStatus = filters.status === "all" || row.status === filters.status;
      const matchesPriority = filters.priority === "all" || row.priority === filters.priority;
      const matchesProject = filters.projectId === "all" || row.projectId === filters.projectId;
      const matchesPhase = filters.phase === "all" || String(row.phaseNumber ?? "") === filters.phase;
      const matchesGate = filters.gate === "all" || row.gateCode === filters.gate;
      const matchesSubmitter =
        submitQ.length === 0 || normalizeForSearch(row.submittedBy).includes(submitQ);
      const matchesOverdue = !filters.overdueOnly || (row.dueAtMs != null && row.dueAtMs < now);
      const matchesBlocked = !filters.blockedOnly || row.status === "blocked";
      let matchesDueWindow = true;
      if (hasDueRange) {
        if (row.dueAtMs == null) matchesDueWindow = false;
        else {
          if (dueFromMs != null && row.dueAtMs < dueFromMs) matchesDueWindow = false;
          if (dueToMs != null && row.dueAtMs > dueToMs) matchesDueWindow = false;
        }
      }
      return (
        matchesSearch &&
        matchesType &&
        matchesStatus &&
        matchesPriority &&
        matchesProject &&
        matchesPhase &&
        matchesGate &&
        matchesSubmitter &&
        matchesOverdue &&
        matchesBlocked &&
        matchesDueWindow
      );
    });
    return sortedQueue(byFilter, filters.sort);
  }, [filters, queueTab, unfilteredTabRows]);

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

  const onSubmitDecision = async () => {
    if (!selectedPackage) return;
    const selectedDecision = decisionDraft.decision;
    const state = evaluateDecisionState(decisionDraft, selectedPackage);
    if (!state.canSubmitDecision || !selectedDecision) {
      decisionPanelRef.current?.focus();
      return;
    }

    if (selectedPackage.detail.id === "approval-none") return;

    if (selectedPackage.detail.approvalType === "gate_review") {
      decisionPanelRef.current?.focus();
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      const result = await recordApprovalDecision({
        approvalId: selectedPackage.detail.id,
        decision: selectedDecision,
        comments: decisionDraft.comments,
        requiredChanges: decisionDraft.requiredChanges,
      });
      if (!result.ok) {
        setErrorMessage(result.error);
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
              submitBlockers: ["Decision recorded."],
            },
          },
        };
      });
      const nextQueueTab: Exclude<ApprovalQueueTab, "history"> =
        selectedDecision === "approve"
          ? "approved"
          : selectedDecision === "request_changes"
            ? "changes_requested"
            : "rejected";
      setPendingApprovals((prev) =>
        prev.map((row) =>
          row.id === selectedPackage.detail.id
            ? {
                ...row,
                status: selectedDecision === "approve" ? "pending" : "in_review",
                queueTab: nextQueueTab,
              }
            : row,
        ),
      );
      setDecisionDraft((prev) => ({
        ...prev,
        canSubmit: true,
        blockers: [],
      }));
      router.refresh();
    } finally {
      setIsLoading(false);
    }
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
      projectId={selectedPackage?.detail.projectId ?? null}
      projectName={selectedPackage?.detail.projectName}
      phaseSummary={selectedPackage ? "Approval workflow operations" : undefined}
      phaseProgressPct={selectedPackage ? 65 : undefined}
      navActive="approvals"
    >
      <TopHeader
        title="Approval Center"
        userInitials={initial.user.initials}
        userName={initial.user.name}
        userRole={initial.user.role}
        notificationCount={Math.min(initial.pendingApprovals.length, 9)}
        notificationHref={NOTIFICATIONS_HUB_HREF}
      />

      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[var(--app-bg)]">
        <div className="mx-auto w-full max-w-[1920px] shrink-0 px-5 pb-3 pt-4 min-[901px]:px-8">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/dashboard" },
              { label: "Approval Center", href: "/approvals" },
              ...(selectedPackage?.detail.approvalType === "gate_review" &&
              selectedPackage.detail.projectId &&
              selectedPackage.detail.gateCode
                ? [
                    {
                      label: "Gate Review",
                      href:
                        selectedPackage.detail.gateReviewHref ??
                        `/projects/${selectedPackage.detail.projectId}/gates/${selectedPackage.detail.gateCode.toLowerCase()}/review`,
                    },
                  ]
                : selectedPackage?.detail.approvalType === "artifact_review" &&
                    selectedPackage.requiredInputs[0]?.linkedObjectHref
                  ? [
                      {
                        label: "Artifact",
                        href: selectedPackage.requiredInputs[0].linkedObjectHref,
                      },
                    ]
                  : []),
              { label: selectedPackage?.detail.title ?? "Select an approval" },
            ]}
          />
        </div>

        <PaneSwitcher
          panes={[
            { id: "queue", label: "Queue" },
            { id: "detail", label: "Detail" },
            { id: "review", label: "Review" },
          ]}
          active={mobilePane}
          onChange={(id) => setMobilePane(id as typeof mobilePane)}
          className="mx-auto w-full max-w-[1920px]"
        />

        {errorMessage ? (
          <div className="mx-auto mb-3 w-full max-w-[1920px] shrink-0 px-5 min-[901px]:px-8">
            <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
              <p>{errorMessage}</p>
              <Button type="button" size="sm" variant="outline" onClick={retryLoad}>
                Retry
              </Button>
            </div>
          </div>
        ) : null}

        <ApprovalCenterContent
          mobilePane={mobilePane}
          queueTab={queueTab}
          queueRows={queueRows}
          unfilteredTabRows={unfilteredTabRows}
          selectedApprovalId={selectedApprovalId}
          filters={filters}
          isLoading={isLoading}
          mergedHistoryEvents={mergedHistoryEvents}
          selectedPackage={selectedPackage}
          commentDraft={commentDraft}
          commentVisibility={commentVisibility}
          decisionDraft={decisionDraft}
          selectedActionState={selectedActionState}
          submitHelperId={submitHelperId}
          commentBoxRef={commentBoxRef}
          decisionPanelRef={decisionPanelRef}
          onQueueTabChange={setQueueTab}
          onFilterChange={setFilters}
          onSelectApproval={onSelectApproval}
          onClearFilters={() => setFilters(DEFAULT_QUEUE_FILTERS)}
          onCommentDraftChange={setCommentDraft}
          onCommentVisibilityChange={setCommentVisibility}
          onAddComment={onAddComment}
          onDecisionDraftChange={setDecisionDraft}
          onSaveReview={onSaveReview}
          onSubmitDecision={onSubmitDecision}
        />
      </main>
    </AuthenticatedAppShell>
  );
}
