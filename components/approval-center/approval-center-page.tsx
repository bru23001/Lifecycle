"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  ApprovalHistoryEventDetailDialog,
  AuditEventDetailDialog,
  openAuditFromHistoryEvent,
} from "@/components/approval-center/approval-history-dialogs";
import {
  DecisionBlockersDialog,
  SubmitDecisionConfirmationDialog,
} from "@/components/approval-center/approval-decision-modals";
import { ApprovalCenterContent } from "@/components/approval-center/approval-center-content";
import { ApprovalBulkActionsBar } from "@/components/approval-center/approval-bulk-actions-bar";
import {
  BulkApproveModal,
  BulkExportModal,
  BulkReassignModal,
  BulkRequestChangesModal,
} from "@/components/approval-center/approval-bulk-modals";
import { DEFAULT_QUEUE_FILTERS } from "@/components/approval-center/approval-center-ui.types";
import { AuthenticatedAppShell } from "@/components/lifecycle-workspace/authenticated-app-shell";
import { Breadcrumbs } from "@/components/lifecycle-workspace/breadcrumbs";
import { PaneSwitcher } from "@/components/lifecycle-workspace/pane-switcher";
import { TopHeader } from "@/components/lifecycle-workspace/top-header";
import { Button } from "@/components/ui/button";
import { recordApprovalDecision } from "@/app/actions/recordApprovalDecision";
import {
  buildDecisionBlockerItems,
  createDecisionHistoryEvent,
  evaluateDecisionState,
  prependApproverComment,
  replaceApproverComments,
  withApproverCountSynced,
  type DecisionBlockerItem,
} from "@/lib/approval-decision";
import {
  patchPackageAfterRecordedDecision,
  patchPendingRowAfterRecordedDecision,
  initialsFromDisplayName,
} from "@/lib/approval-bulk-local";
import { classifyArtifactBulkTargets } from "@/lib/approval-bulk-targets";
import type { ApproverDirectoryEntry } from "@/lib/approval-approver-directory";
import { buildApproverComment } from "@/lib/approval-comment-utils";
import { NOTIFICATIONS_HUB_HREF } from "@/lib/notifications-hub";
import type {
  ApprovalAuditRecord,
  ApprovalCenterData,
  ApprovalDecisionDraft,
  ApprovalHistoryEvent,
  ApprovalPackage,
  ApprovalQueueTab,
  ApproverComment,
  PendingApproval,
} from "@/types/approval-center.types";
import type { QueueFilters } from "@/components/approval-center/approval-center-ui.types";
import { formatDateTimeAbsolute, parseFlexibleTimestampLabelMs } from "@/lib/datetime-format";

function bulkQueueHistoryEvent(input: {
  approvalId: string;
  title: string;
  description: string;
  actorName: string;
  actorRole: string;
}): ApprovalHistoryEvent {
  return {
    id: `hist-bulk-${input.approvalId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    approvalId: input.approvalId,
    eventType: "queue_bulk_action",
    title: input.title,
    actorName: input.actorName,
    actorRole: input.actorRole,
    timestampLabel: formatDateTimeAbsolute(new Date()),
    description: input.description,
    statusTone: "blue",
  };
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

function parseHistoryTimestampLabelMs(label: string): number {
  return parseFlexibleTimestampLabelMs(label, Date.now());
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
  const [historyDetailEvent, setHistoryDetailEvent] = useState<ApprovalHistoryEvent | null>(null);
  const [historyDetailOpen, setHistoryDetailOpen] = useState(false);
  const [auditDetail, setAuditDetail] = useState<ApprovalAuditRecord | null>(null);
  const [auditDetailOpen, setAuditDetailOpen] = useState(false);
  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false);
  const [blockersModalOpen, setBlockersModalOpen] = useState(false);
  const [blockerItems, setBlockerItems] = useState<DecisionBlockerItem[]>([]);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [bulkSelectedIds, setBulkSelectedIds] = useState<Set<string>>(new Set());
  const [bulkApproveOpen, setBulkApproveOpen] = useState(false);
  const [bulkRequestChangesOpen, setBulkRequestChangesOpen] = useState(false);
  const [bulkReassignOpen, setBulkReassignOpen] = useState(false);
  const [bulkExportOpen, setBulkExportOpen] = useState(false);
  const [bulkSubmitting, setBulkSubmitting] = useState(false);

  const selectedPackage = packages[selectedApprovalId];

  const patchSelectedPackage = useCallback(
    (updater: (prev: ApprovalPackage) => ApprovalPackage) => {
      setPackages((prev) => {
        const cur = prev[selectedApprovalId];
        if (!cur) return prev;
        return { ...prev, [selectedApprovalId]: updater(cur) };
      });
    },
    [selectedApprovalId],
  );

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

  useEffect(() => {
    setBulkSelectedIds(new Set());
  }, [queueTab]);

  const toggleBulkSelect = useCallback((approvalId: string) => {
    setBulkSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(approvalId)) next.delete(approvalId);
      else next.add(approvalId);
      return next;
    });
  }, []);

  const selectAllBulkVisible = useCallback(() => {
    setBulkSelectedIds(new Set(queueRows.map((r) => r.id)));
  }, [queueRows]);

  const bulkSelectedRows = useMemo(
    () => pendingApprovals.filter((r) => bulkSelectedIds.has(r.id)),
    [pendingApprovals, bulkSelectedIds],
  );

  const { eligible: eligibleBulkArtifact, skipped: skippedBulkArtifact } = useMemo(
    () => classifyArtifactBulkTargets(bulkSelectedRows, packages),
    [bulkSelectedRows, packages],
  );

  const mergedHistoryEvents = useMemo(() => {
    const out: ApprovalHistoryEvent[] = [];
    for (const [approvalId, pkg] of Object.entries(packages)) {
      for (const ev of pkg.history) {
        out.push({ ...ev, approvalId: ev.approvalId ?? approvalId });
      }
    }
    return out.sort((a, b) => {
      const d = parseHistoryTimestampLabelMs(b.timestampLabel) - parseHistoryTimestampLabelMs(a.timestampLabel);
      if (d !== 0) return d;
      return a.id.localeCompare(b.id);
    });
  }, [packages]);

  const fullHistoryHref = useMemo(() => {
    if (queueTab !== "history") return undefined;
    if (selectedApprovalId === "approval-none") return undefined;
    if (!packages[selectedApprovalId]) return undefined;
    return `/approvals/${selectedApprovalId}/history`;
  }, [queueTab, selectedApprovalId, packages]);

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

  const submitDecisionDisabled = useMemo(() => {
    if (isLoading) return true;
    if (!selectedPackage) return true;
    if (selectedPackage.detail.id === "approval-none") return true;
    if (selectedPackage.detail.approvalType === "gate_review") return true;
    return false;
  }, [isLoading, selectedPackage]);

  useEffect(() => {
    if (!saveNotice) return;
    const timer = window.setTimeout(() => setSaveNotice(null), 2500);
    return () => window.clearTimeout(timer);
  }, [saveNotice]);

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

  const appendCommentForSelected = (newComment: ApproverComment) => {
    if (!selectedPackage) return;
    setPackages((prev) => {
      const current = prev[selectedPackage.detail.id];
      if (!current) return prev;
      return {
        ...prev,
        [selectedPackage.detail.id]: prependApproverComment(current, newComment, initial.user.name, initial.user.role),
      };
    });
  };

  const onAddComment = () => {
    if (!selectedPackage) return;
    const body = commentDraft.trim();
    if (body.length === 0) return;
    const newComment = buildApproverComment({
      body,
      visibility: commentVisibility,
      user: { name: initial.user.name, role: initial.user.role, initials: initial.user.initials },
    });
    appendCommentForSelected(newComment);
    setCommentDraft("");
  };

  const onAppendComment = (comment: ApproverComment) => {
    appendCommentForSelected(comment);
  };

  const onReplaceComments = (next: ApproverComment[]) => {
    if (!selectedPackage) return;
    setPackages((prev) => {
      const current = prev[selectedPackage.detail.id];
      if (!current) return prev;
      return {
        ...prev,
        [selectedPackage.detail.id]: replaceApproverComments(current, next),
      };
    });
  };

  const performSubmitDecision = async () => {
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

    let commentsPayload = decisionDraft.comments;
    if (selectedDecision === "reject" && decisionDraft.resubmissionAllowed != null) {
      commentsPayload = [commentsPayload.trim(), `Resubmission allowed: ${decisionDraft.resubmissionAllowed ? "yes" : "no"}`]
        .filter(Boolean)
        .join("\n");
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      const result = await recordApprovalDecision({
        approvalId: selectedPackage.detail.id,
        decision: selectedDecision,
        comments: commentsPayload,
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
            history: [
              createDecisionHistoryEvent(selectedDecision, initial.user.name, {
                approvalId: selectedPackage.detail.id,
                authorRole: initial.user.role,
              }),
              ...current.history,
            ],
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

  const onSubmitDecisionIntent = () => {
    if (!selectedPackage || submitDecisionDisabled) return;
    const state = evaluateDecisionState(decisionDraft, selectedPackage);
    if (!state.canSubmitDecision || !decisionDraft.decision) {
      setBlockerItems(buildDecisionBlockerItems(decisionDraft, selectedPackage));
      setBlockersModalOpen(true);
      setMobilePane("review");
      return;
    }
    setSubmitConfirmOpen(true);
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
    setSaveNotice("Review saved");
  };

  const confirmBulkApprove = useCallback(
    async (comment: string) => {
      setBulkSubmitting(true);
      setErrorMessage(null);
      try {
        const ok: string[] = [];
        const fail: string[] = [];
        for (const row of eligibleBulkArtifact) {
          const result = await recordApprovalDecision({
            approvalId: row.id,
            decision: "approve",
            comments: comment.trim() || undefined,
          });
          if (result.ok) ok.push(row.id);
          else fail.push(`${row.approvalCode}: ${result.error}`);
        }
        if (ok.length > 0) {
          setPackages((prev) => {
            const next = { ...prev };
            for (const id of ok) {
              const cur = next[id];
              if (!cur) continue;
              next[id] = patchPackageAfterRecordedDecision(cur, "approve", initial.user.name, initial.user.role, {
                comments: comment,
              });
            }
            return next;
          });
          setPendingApprovals((prev) =>
            prev.map((row) => (ok.includes(row.id) ? patchPendingRowAfterRecordedDecision(row, "approve") : row)),
          );
        }
        if (fail.length > 0) setErrorMessage(fail.join("\n"));
        else if (ok.length > 0) setSaveNotice(`Bulk approved ${ok.length} approval(s).`);
        setBulkSelectedIds(new Set());
        setBulkApproveOpen(false);
        router.refresh();
      } finally {
        setBulkSubmitting(false);
      }
    },
    [eligibleBulkArtifact, initial.user.name, initial.user.role, router],
  );

  const confirmBulkRequestChanges = useCallback(
    async (msg: string, applySame: boolean, perNotes: Record<string, string>) => {
      setBulkSubmitting(true);
      setErrorMessage(null);
      try {
        const ok: string[] = [];
        const fail: string[] = [];
        for (const row of eligibleBulkArtifact) {
          const extra = applySame ? "" : (perNotes[row.id]?.trim() ?? "");
          const comments = [msg.trim(), extra].filter(Boolean).join("\n\n");
          const requiredChanges = [msg.trim().slice(0, 240), ...(extra ? [extra.slice(0, 240)] : [])].filter((s) => s.length > 0);
          const result = await recordApprovalDecision({
            approvalId: row.id,
            decision: "request_changes",
            comments,
            requiredChanges,
          });
          if (result.ok) ok.push(row.id);
          else fail.push(`${row.approvalCode}: ${result.error}`);
        }
        if (ok.length > 0) {
          setPackages((prev) => {
            const next = { ...prev };
            for (const id of ok) {
              const cur = next[id];
              if (!cur) continue;
              const row = eligibleBulkArtifact.find((r) => r.id === id);
              const extra = applySame ? "" : (row ? (perNotes[row.id]?.trim() ?? "") : "");
              const comments = [msg.trim(), extra].filter(Boolean).join("\n\n");
              const requiredChanges = [msg.trim().slice(0, 240), ...(extra ? [extra.slice(0, 240)] : [])].filter((s) => s.length > 0);
              next[id] = patchPackageAfterRecordedDecision(cur, "request_changes", initial.user.name, initial.user.role, {
                comments,
                requiredChanges,
              });
            }
            return next;
          });
          setPendingApprovals((prev) =>
            prev.map((row) => (ok.includes(row.id) ? patchPendingRowAfterRecordedDecision(row, "request_changes") : row)),
          );
        }
        if (fail.length > 0) setErrorMessage(fail.join("\n"));
        else if (ok.length > 0) setSaveNotice(`Bulk request changes applied to ${ok.length} approval(s).`);
        setBulkSelectedIds(new Set());
        setBulkRequestChangesOpen(false);
        router.refresh();
      } finally {
        setBulkSubmitting(false);
      }
    },
    [eligibleBulkArtifact, initial.user.name, initial.user.role, router],
  );

  const confirmBulkReassign = useCallback(
    (pick: ApproverDirectoryEntry, reason: string, notify: boolean) => {
      const ids = Array.from(bulkSelectedIds);
      setPackages((prev) => {
        const next = { ...prev };
        for (const id of ids) {
          const p = next[id];
          if (!p) continue;
          const hist = bulkQueueHistoryEvent({
            approvalId: id,
            title: "Bulk reassignment",
            description: `Primary reviewer set to ${pick.name}. ${reason.trim()}`.slice(0, 900),
            actorName: initial.user.name,
            actorRole: initial.user.role,
          });
          const head = {
            id: `apr-br-${id}-${Date.now()}`,
            name: pick.name,
            role: pick.role,
            initials: initialsFromDisplayName(pick.name),
            reviewStatus: "pending" as const,
          };
          const nextApprovers =
            p.approvers.length > 0 ? [{ ...p.approvers[0], ...head }, ...p.approvers.slice(1)] : [head];
          next[id] = withApproverCountSynced({
            ...p,
            approvers: nextApprovers,
            history: [hist, ...p.history],
          });
        }
        return next;
      });
      setSaveNotice(`Updated reviewer on ${ids.length} package(s)${notify ? " (notifications simulated)." : "."}`);
      setBulkSelectedIds(new Set());
      setBulkReassignOpen(false);
    },
    [bulkSelectedIds, initial.user.name, initial.user.role],
  );

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
          fullHistoryHref={fullHistoryHref}
          selectedPackage={selectedPackage}
          currentUser={{ name: initial.user.name, role: initial.user.role, initials: initial.user.initials }}
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
          onHistoryEventClick={(ev) => {
            setHistoryDetailEvent(ev);
            setHistoryDetailOpen(true);
          }}
          onCommentDraftChange={setCommentDraft}
          onCommentVisibilityChange={setCommentVisibility}
          onAddComment={onAddComment}
          onAppendComment={onAppendComment}
          onReplaceComments={onReplaceComments}
          onPatchSelectedPackage={patchSelectedPackage}
          onDecisionDraftChange={setDecisionDraft}
          onSaveReview={onSaveReview}
          onSubmitDecision={onSubmitDecisionIntent}
          submitDisabled={submitDecisionDisabled}
          saveNotice={saveNotice}
          reviewerDisplayName={initial.user.name}
          bulkToolbar={
            queueTab !== "history" && bulkSelectedIds.size > 0 ? (
              <ApprovalBulkActionsBar
                count={bulkSelectedIds.size}
                onClear={() => setBulkSelectedIds(new Set())}
                onOpenBulkApprove={() => setBulkApproveOpen(true)}
                onOpenBulkRequestChanges={() => setBulkRequestChangesOpen(true)}
                onOpenBulkReassign={() => setBulkReassignOpen(true)}
                onOpenBulkExport={() => setBulkExportOpen(true)}
              />
            ) : null
          }
          bulkSelectEnabled={queueTab !== "history"}
          bulkSelectedIds={bulkSelectedIds}
          onToggleBulkSelect={toggleBulkSelect}
          onSelectAllBulkVisible={selectAllBulkVisible}
        />
      </main>

      <ApprovalHistoryEventDetailDialog
        open={historyDetailOpen}
        event={historyDetailEvent}
        onClose={() => {
          setHistoryDetailOpen(false);
          setHistoryDetailEvent(null);
        }}
        onOpenAudit={(ev) => {
          setAuditDetail(openAuditFromHistoryEvent(ev));
          setHistoryDetailOpen(false);
          setHistoryDetailEvent(null);
          setAuditDetailOpen(true);
        }}
      />
      <AuditEventDetailDialog
        open={auditDetailOpen}
        record={auditDetail}
        onClose={() => {
          setAuditDetailOpen(false);
          setAuditDetail(null);
        }}
      />
      {selectedPackage && decisionDraft.decision ? (
        <SubmitDecisionConfirmationDialog
          open={submitConfirmOpen}
          decision={decisionDraft.decision}
          comments={decisionDraft.comments}
          requiredChanges={decisionDraft.requiredChanges}
          conditions={decisionDraft.conditions}
          onClose={() => setSubmitConfirmOpen(false)}
          onSubmit={() => {
            setSubmitConfirmOpen(false);
            void performSubmitDecision();
          }}
        />
      ) : null}
      <DecisionBlockersDialog
        open={blockersModalOpen}
        items={blockerItems}
        onClose={() => setBlockersModalOpen(false)}
        onFixNavigate={(item) => {
          setBlockersModalOpen(false);
          setMobilePane("review");
          window.requestAnimationFrame(() => {
            if (item.id === "no_decision") {
              decisionPanelRef.current?.focus();
              return;
            }
            document.getElementById("decision-comments")?.focus();
          });
        }}
      />
      <BulkApproveModal
        open={bulkApproveOpen}
        onClose={() => setBulkApproveOpen(false)}
        eligible={eligibleBulkArtifact}
        skipped={skippedBulkArtifact}
        isSubmitting={bulkSubmitting}
        onConfirm={(c) => void confirmBulkApprove(c)}
      />
      <BulkRequestChangesModal
        open={bulkRequestChangesOpen}
        onClose={() => setBulkRequestChangesOpen(false)}
        eligible={eligibleBulkArtifact}
        skipped={skippedBulkArtifact}
        isSubmitting={bulkSubmitting}
        onConfirm={(msg, apply, notes) => void confirmBulkRequestChanges(msg, apply, notes)}
      />
      <BulkReassignModal
        open={bulkReassignOpen}
        onClose={() => setBulkReassignOpen(false)}
        count={bulkSelectedIds.size}
        isSubmitting={false}
        onConfirm={(pick, reason, notify) => {
          confirmBulkReassign(pick, reason, notify);
        }}
      />
      <BulkExportModal
        open={bulkExportOpen}
        onClose={() => setBulkExportOpen(false)}
        selectedIds={Array.from(bulkSelectedIds)}
        packages={packages}
        onExportComplete={() => {
          const n = bulkSelectedIds.size;
          setBulkSelectedIds(new Set());
          setSaveNotice(`Exported ${n} approval(s).`);
        }}
      />
    </AuthenticatedAppShell>
  );
}
