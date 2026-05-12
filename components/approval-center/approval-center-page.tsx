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
import { createCommentHistoryEvent, createDecisionHistoryEvent, evaluateDecisionState } from "@/lib/approval-decision";
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

  const queueRows = useMemo(() => {
    if (queueTab === "history") return [];
    const byTab = pendingApprovals.filter((row) => row.queueTab === queueTab);
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
  }, [filters, pendingApprovals, queueTab]);

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
    const nextQueueTab: Exclude<ApprovalQueueTab, "history"> =
      selectedDecision === "approve" ? "approved" : selectedDecision === "request_changes" ? "changes_requested" : "rejected";
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
        notificationCount={6}
      />

      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[var(--app-bg)]">
        <div className="mx-auto w-full max-w-[1920px] shrink-0 px-5 pb-3 pt-4 min-[901px]:px-8">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Approval Center", href: "/approvals" },
              {
                label: "Gate Review",
                href: `/projects/${selectedPackage?.detail.projectId ?? "sip-001"}/gates/g2/review`,
              },
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
