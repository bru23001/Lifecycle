"use client";

import { useCallback, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { recordGateReview } from "@/app/actions/recordGateReview";
import { assignGateApprovers } from "@/app/actions/assignGateApprovers";
import { AuthenticatedAppShell } from "@/components/lifecycle-workspace/authenticated-app-shell";
import { Breadcrumbs } from "@/components/lifecycle-workspace/breadcrumbs";
import { PaneSwitcher } from "@/components/lifecycle-workspace/pane-switcher";
import { TopHeader } from "@/components/lifecycle-workspace/top-header";
import type {
  DecisionCriterion,
  DecisionCriteriaSummary,
  GateApprover,
  GateApproverComment,
  GateDecisionType,
  GateEvidenceItem,
  GateReviewData,
  GateReviewHeaderChecklist,
  GateReviewSubmitBlocker,
} from "@/types/gate-review.types";
import { computeActionState, applyUnlockRules, computeOverallAssessment, buildSubmitBlockers } from "@/lib/gate-decision";
import type { GateId } from "@/lib/gateRules";
import { toUserMessage } from "@/lib/toUserMessage";

import { ApproverReview } from "./ApproverReview";
import {
  ApproverAssignmentDrawer,
  ApproverCommentsModal,
  ApproverReviewDetailDrawer,
  SendApproverReminderModal,
} from "./approver-review-dialogs";
import { AssignApproversModal } from "./assign-approvers-modal";
import { CompletionEvidence } from "./CompletionEvidence";
import { EvidencePreviewModal } from "./evidence-preview-modal";
import { DecisionCriteria } from "./DecisionCriteria";
import { DecisionRecord } from "./DecisionRecord";
import {
  ApproveGateConfirmationModal,
  ConditionalApprovalModal,
  DecisionCommentsEditorModal,
  FinalDecisionRecordDrawer,
  RejectGateConfirmationModal,
  RequestChangesModal,
} from "./decision-record-interaction-modals";
import { GateReviewActionBar } from "./GateReviewActionBar";
import { GateReviewContent } from "./GateReviewContent";
import { GateReviewGrid } from "./GateReviewGrid";
import { GateReviewHeader } from "./GateReviewHeader";
import { GateAuditTrailPreviewDrawer } from "@/components/gate-audit/gate-audit-trail-preview-drawer";
import { DownloadReviewPackageModal } from "./download-review-package-modal";
import { GateOverviewSidebar } from "./GateOverviewSidebar";
import { NextPhaseUnlock } from "./NextPhaseUnlock";
import { RequiredInputs } from "./RequiredInputs";
import {
  DecisionSubmissionBlockersDrawer,
  GateReviewSaveToast,
  SaveReviewSummaryModal,
  SubmitDecisionConfirmationModal,
  UnsavedReviewChangesModal,
} from "./gate-review-action-bar-modals";

function formatOverallAssessmentLabel(o: DecisionCriteriaSummary["overallAssessment"]): string {
  switch (o) {
    case "meets_requirements":
      return "Meets requirements";
    case "partially_meets_requirements":
      return "Partially meets requirements";
    case "does_not_meet_requirements":
      return "Does not meet requirements";
    case "not_reviewed":
    default:
      return "Not reviewed";
  }
}

function mapUiDecisionToServer(
  d: GateDecisionType | undefined,
): "Accepted" | "Conditional" | "Returned" | "Deferred" | "Rejected" | null {
  if (!d) return null;
  switch (d) {
    case "approve":
      return "Accepted";
    case "conditional_approve":
      return "Conditional";
    case "request_changes":
      return "Returned";
    case "reject":
      return "Rejected";
    default:
      return null;
  }
}

export function GateReviewPage({ data: initial }: { data: GateReviewData }) {
  const router = useRouter();
  const [submitPending, startSubmitTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [mobilePane, setMobilePane] = useState<"overview" | "inputs" | "decision">("overview");
  const decisionRecordRef = useRef<HTMLDivElement>(null);
  const submitHelperId = "gate-review-submit-helper";

  const [criteria, setCriteria] = useState(initial.decisionCriteria.criteria);
  const overallAssessment = useMemo(() => computeOverallAssessment(criteria), [criteria]);
  const overallAssessmentLabel = useMemo(
    () => formatOverallAssessmentLabel(overallAssessment),
    [overallAssessment],
  );
  const decisionCriteriaSummary = useMemo(
    () => ({
      criteria,
      overallAssessment,
    }),
    [criteria, overallAssessment],
  );

  const [draftDecision, setDraftDecision] = useState<GateDecisionType | undefined>();
  const [comments, setComments] = useState(initial.decisionRecord.comments);
  const [conditions, setConditions] = useState<string[]>(initial.decisionRecord.conditions);

  const [previewItem, setPreviewItem] = useState<GateEvidenceItem | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [commentApprover, setCommentApprover] = useState<GateApprover | null>(null);
  const [commentOpen, setCommentOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [downloadPackageOpen, setDownloadPackageOpen] = useState(false);
  const [detailApprover, setDetailApprover] = useState<GateApprover | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [assignmentDrawerOpen, setAssignmentDrawerOpen] = useState(false);
  const [reminderOpen, setReminderOpen] = useState(false);
  const [sessionCommentsByApproverId, setSessionCommentsByApproverId] = useState<
    Record<string, GateApproverComment[]>
  >({});
  const [approverAssignError, setApproverAssignError] = useState<string | null>(null);
  const [approverAssignPending, startApproverAssign] = useTransition();
  const [decisionModal, setDecisionModal] = useState<GateDecisionType | null>(null);
  const [commentsEditorOpen, setCommentsEditorOpen] = useState(false);
  const [finalRecordOpen, setFinalRecordOpen] = useState(false);
  const [auditTrailPreviewOpen, setAuditTrailPreviewOpen] = useState(false);

  const savedBaselineRef = useRef({
    criteria: structuredClone(initial.decisionCriteria.criteria) as DecisionCriterion[],
    draftDecision: undefined as GateDecisionType | undefined,
    comments: initial.decisionRecord.comments,
    conditions: [...initial.decisionRecord.conditions],
  });

  const [saveSummaryOpen, setSaveSummaryOpen] = useState(false);
  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false);
  const [blockersDrawerOpen, setBlockersDrawerOpen] = useState(false);
  const [submissionBlockersOverride, setSubmissionBlockersOverride] = useState<GateReviewSubmitBlocker[] | null>(
    null,
  );
  const [cancelUnsavedOpen, setCancelUnsavedOpen] = useState(false);
  const [saveToastVisible, setSaveToastVisible] = useState(false);
  const [saveToastMessage, setSaveToastMessage] = useState("");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  const headerData = useMemo(() => {
    const notReviewed = criteria.filter((c) => c.assessment === "not_reviewed").length;
    const readinessPercent = Math.max(
      40,
      Math.min(100, initial.gateReviewHeader.readinessPercent - notReviewed * 4),
    );
    return {
      ...initial.gateReviewHeader,
      readinessPercent,
      projectCode: initial.gateReviewHeader.projectCode ?? initial.project.code,
    };
  }, [initial.gateReviewHeader, initial.project.code, criteria]);

  const checklist: GateReviewHeaderChecklist = useMemo(
    () => ({
      allRequiredInputsProvided: initial.requiredInputs.every((i) => i.provided && i.status === "complete"),
      evidenceAttached: initial.completionEvidence.length > 0,
      decisionCriteriaMet: criteria.every((c) => c.assessment !== "not_reviewed"),
      awaitingReviewerDecision: initial.gateReviewHeader.status === "pending_decision",
    }),
    [initial.requiredInputs, initial.completionEvidence.length, criteria, initial.gateReviewHeader.status],
  );

  const nextPhaseUnlock = useMemo(
    () => applyUnlockRules(draftDecision, initial.nextPhaseUnlock),
    [draftDecision, initial.nextPhaseUnlock],
  );

  const actionState = useMemo(
    () =>
      computeActionState({
        base: initial.actionState,
        draftDecision,
        decisionComments: comments,
        conditions,
        requiredInputs: initial.requiredInputs,
        completionEvidence: initial.completionEvidence,
        approversCount: initial.approvers.length,
        criteria,
      }),
    [
      initial.actionState,
      draftDecision,
      comments,
      conditions,
      initial.requiredInputs,
      initial.completionEvidence,
      initial.approvers.length,
      criteria,
    ],
  );

  const immutableDecision =
    initial.decisionRecord.status === "finalized" || initial.decisionRecord.status === "submitted";
  const effectiveActionState = immutableDecision
    ? {
        ...actionState,
        canSaveReview: false,
        canSubmitDecision: false,
        submitBlockers: ["Decision already finalized. New submissions are disabled."],
        structuredSubmitBlockers: [
          {
            id: "immutable",
            category: "server" as const,
            message: "Decision already finalized. New submissions are disabled.",
          },
        ],
      }
    : actionState;

  const displayBlockers = useMemo(
    () => submissionBlockersOverride ?? effectiveActionState.structuredSubmitBlockers,
    [submissionBlockersOverride, effectiveActionState.structuredSubmitBlockers],
  );

  const isDirty = useCallback(() => {
    return (
      JSON.stringify({ criteria, draftDecision, comments, conditions }) !==
      JSON.stringify(savedBaselineRef.current)
    );
  }, [criteria, draftDecision, comments, conditions]);

  const pendingApprovers = useMemo(
    () => initial.approvers.filter((a) => a.status === "pending" || a.status === "in_review"),
    [initial.approvers],
  );

  const canSendApproverReminders =
    initial.approversPersisted && pendingApprovers.length > 0;

  const approveModalBlockers = useMemo(
    () =>
      decisionModal === "approve"
        ? buildSubmitBlockers({
            draftDecision: "approve",
            decisionComments: comments,
            conditions,
            requiredInputs: initial.requiredInputs,
            completionEvidence: initial.completionEvidence,
            approversCount: initial.approvers.length,
            criteria,
            serverMessages: initial.actionState.canSubmitDecision ? [] : initial.actionState.submitBlockers,
          })
        : [],
    [
      decisionModal,
      comments,
      conditions,
      initial.requiredInputs,
      initial.completionEvidence,
      initial.approvers.length,
      criteria,
      initial.actionState.canSubmitDecision,
      initial.actionState.submitBlockers,
    ],
  );

  const readinessItems = useMemo(
    () => [
      { label: "All required inputs provided", ok: checklist.allRequiredInputsProvided },
      { label: "Evidence attached", ok: checklist.evidenceAttached },
      { label: "Decision criteria assessed", ok: checklist.decisionCriteriaMet },
      { label: "Approvers assigned", ok: initial.approvers.length > 0 },
    ],
    [checklist, initial.approvers.length],
  );

  const openDecisionModal = useCallback((d: GateDecisionType) => {
    setDraftDecision(d);
    setDecisionModal(d);
  }, []);

  const scrollToGateSection = useCallback((target: NonNullable<GateReviewSubmitBlocker["jumpTarget"]>) => {
    const idMap = {
      inputs: "gate-review-required-inputs",
      evidence: "gate-review-completion-evidence",
      criteria: "gate-review-decision-criteria",
      approvers: "gate-review-approvers",
      decision: "gate-review-decision-record",
    } as const;
    if (target === "inputs" || target === "evidence") {
      setMobilePane("inputs");
    } else {
      setMobilePane("decision");
    }
    requestAnimationFrame(() => {
      document.getElementById(idMap[target])?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  const runRecordGateReview = useCallback(
    (args: { decision: GateDecisionType; nextActionText: string }) => {
      if (immutableDecision) return;
      const serverDecision = mapUiDecisionToServer(args.decision);
      if (!serverDecision) return;
      const gateId = initial.gateReviewHeader.gateCode as GateId;
      setSubmitError(null);
      startSubmitTransition(async () => {
        try {
          const res = await recordGateReview({
            projectId: initial.project.id,
            gateId,
            decision: serverDecision,
            authorityName: initial.user.name,
            authorityRole: initial.user.role,
            nextAction: args.nextActionText,
          });
          if (!res.ok) {
            if (res.blockingMessages && res.blockingMessages.length > 0) {
              setSubmissionBlockersOverride(
                res.blockingMessages.map((msg, i) => ({
                  id: `server-submit-${i}`,
                  category: "server" as const,
                  message: msg,
                  jumpTarget: "evidence" as const,
                  recommendedFix:
                    "Remediation required before an advance decision can be recorded.",
                })),
              );
              setBlockersDrawerOpen(true);
              setSubmitError(null);
            } else {
              setSubmissionBlockersOverride(null);
              setSubmitError(toUserMessage(res.error));
            }
            return;
          }
          setSubmissionBlockersOverride(null);
          setDecisionModal(null);
          router.push(`/projects/${initial.project.id}/workspace?phase=${res.newPhase}`);
          router.refresh();
        } catch (e) {
          setSubmitError(toUserMessage(e));
        }
      });
    },
    [
      immutableDecision,
      initial.gateReviewHeader.gateCode,
      initial.project.id,
      initial.user.name,
      initial.user.role,
      router,
    ],
  );

  const onUpdateCriterion = useCallback((id: string, patch: Partial<DecisionCriterion>) => {
    setCriteria((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }, []);

  const onPreview = useCallback((item: GateEvidenceItem) => {
    setPreviewItem(item);
    setPreviewOpen(true);
  }, []);

  const onOpenComments = useCallback((approver: GateApprover) => {
    setCommentApprover(approver);
    setCommentOpen(true);
  }, []);

  const onOpenDetail = useCallback((approver: GateApprover) => {
    setDetailApprover(approver);
    setDetailOpen(true);
  }, []);

  const onAddSessionComment = useCallback(
    (body: string, visibility: GateApproverComment["visibility"]) => {
      if (!commentApprover) return;
      const entry: GateApproverComment = {
        id: `session-${commentApprover.id}-${Date.now()}`,
        author: initial.user.name,
        role: initial.user.role,
        timestampLabel: new Date().toLocaleString(undefined, {
          dateStyle: "medium",
          timeStyle: "short",
        }),
        visibility,
        body,
      };
      setSessionCommentsByApproverId((prev) => ({
        ...prev,
        [commentApprover.id]: [...(prev[commentApprover.id] ?? []), entry],
      }));
    },
    [commentApprover, initial.user.name, initial.user.role],
  );

  const onRemoveApproverFromDrawer = useCallback(
    (approver: GateApprover) => {
      setApproverAssignError(null);
      const rest = initial.approvers.filter((x) => x.id !== approver.id);
      if (rest.length === 0) {
        setApproverAssignError("At least one approver is required.");
        return;
      }
      startApproverAssign(async () => {
        try {
          const res = await assignGateApprovers({
            projectId: initial.project.id,
            gateId: initial.gateReviewHeader.gateCode as GateId,
            approvers: rest.map((r) => ({
              userId: r.userId ?? null,
              name: r.name,
              role: r.role,
            })),
            dueAt: initial.assignedDueAtIso,
          });
          if (!res.ok) {
            setApproverAssignError(toUserMessage(res.error));
            return;
          }
          setApproverAssignError(null);
          router.refresh();
        } catch (e) {
          setApproverAssignError(toUserMessage(e));
        }
      });
    },
    [
      initial.approvers,
      initial.assignedDueAtIso,
      initial.gateReviewHeader.gateCode,
      initial.project.id,
      router,
    ],
  );

  const onSaveReview = useCallback(() => {
    if (immutableDecision) return;
    const now = new Date();
    setLastSavedAt(now);
    savedBaselineRef.current = {
      criteria: structuredClone(criteria),
      draftDecision,
      comments,
      conditions: [...conditions],
    };
    const hasWarnings = readinessItems.some((r) => !r.ok);
    if (hasWarnings) {
      setSaveSummaryOpen(true);
    } else {
      setSaveToastMessage("Draft saved");
      setSaveToastVisible(true);
      window.setTimeout(() => setSaveToastVisible(false), 3200);
    }
  }, [immutableDecision, criteria, draftDecision, comments, conditions, readinessItems]);

  const onSubmitDecision = useCallback(() => {
    if (immutableDecision) return;
    setSubmissionBlockersOverride(null);
    if (!effectiveActionState.canSubmitDecision) {
      if (effectiveActionState.structuredSubmitBlockers.length > 0) {
        setBlockersDrawerOpen(true);
      }
      if (!draftDecision) {
        setMobilePane("decision");
        requestAnimationFrame(() => {
          decisionRecordRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }
      return;
    }
    if (!draftDecision) {
      setMobilePane("decision");
      decisionRecordRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    setSubmitConfirmOpen(true);
  }, [
    immutableDecision,
    effectiveActionState.canSubmitDecision,
    effectiveActionState.structuredSubmitBlockers.length,
    draftDecision,
  ]);

  const gatesListHref = `/projects/${initial.project.id}/gates`;

  const onCancelReview = useCallback(() => {
    if (immutableDecision) {
      router.push(gatesListHref);
      return;
    }
    if (!isDirty()) {
      router.push(gatesListHref);
      return;
    }
    setCancelUnsavedOpen(true);
  }, [immutableDecision, isDirty, router, gatesListHref]);

  return (
    <AuthenticatedAppShell
      projectId={initial.project.id}
      projectName={initial.project.name}
      phaseSummary={`Phase ${initial.gateReviewHeader.phaseNumber}: ${initial.gateReviewHeader.phaseName}`}
      phaseProgressPct={initial.gateOverview.phaseProgressPercent}
      navActive="gates"
      gatesHref={`/projects/${initial.project.id}/gates`}
    >
      <TopHeader
        title="Gate Review"
        userInitials={initial.user.initials}
        userName={initial.user.name}
        userRole={initial.user.role}
        onDownloadReviewPackage={() => setDownloadPackageOpen(true)}
      />

      <GateReviewContent>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="mx-auto w-full max-w-[1920px] shrink-0 px-5 pt-4 min-[901px]:px-8">
            <Breadcrumbs
              items={[
                { label: "Projects", href: "/projects" },
                {
                  label: initial.project.name,
                  href: `/projects/${initial.project.id}`,
                },
                {
                  label: "Lifecycle Workspace",
                  href: `/projects/${initial.project.id}/workspace`,
                },
                {
                  label: `Phase ${initial.gateReviewHeader.phaseNumber}: ${initial.gateReviewHeader.phaseName}`,
                  href: `/projects/${initial.project.id}/workspace?phase=${initial.gateReviewHeader.phaseNumber}`,
                },
                { label: "Gates", href: `/projects/${initial.project.id}/gates` },
                { label: "Gate Review" },
              ]}
            />
            <div className="mt-4">
              <GateReviewHeader
                data={headerData}
                checklist={checklist}
                approvers={initial.approvers}
                onSendReminder={() => setReminderOpen(true)}
                canSendReminders={canSendApproverReminders}
                onPreviewAuditTrail={() => setAuditTrailPreviewOpen(true)}
              />
            </div>
          </div>

          <PaneSwitcher
            panes={[
              { id: "overview", label: "Overview" },
              { id: "inputs", label: "Inputs" },
              { id: "decision", label: "Decision" },
            ]}
            active={mobilePane}
            onChange={(id) => setMobilePane(id as typeof mobilePane)}
            className="mx-auto w-full max-w-[1920px]"
          />

          <div className="mx-auto flex w-full max-w-[1920px] flex-1 min-h-0 flex-col overflow-hidden px-5 min-[901px]:px-8">
            <GateReviewGrid
              activePane={mobilePane}
              className="min-h-0 flex-1"
              overviewColumn={<GateOverviewSidebar data={initial.gateOverview} />}
              inputsEvidenceColumn={
                <div className="flex h-full min-h-0 flex-col gap-6 max-xl:h-auto">
                  <div
                    id="gate-review-required-inputs"
                    className="flex min-h-[280px] flex-1 basis-0 flex-col xl:min-h-0"
                  >
                    <RequiredInputs
                      projectId={initial.project.id}
                      gateId={initial.gateReviewHeader.gateId}
                      inputs={initial.requiredInputs}
                      gateLabel={`${initial.gateReviewHeader.gateCode} ${initial.gateReviewHeader.gateName}`}
                      linkedPhaseLabel={`Phase ${initial.gateReviewHeader.phaseNumber}: ${initial.gateReviewHeader.phaseName}`}
                    />
                  </div>
                  <div
                    id="gate-review-completion-evidence"
                    className="flex min-h-[280px] flex-1 basis-0 flex-col xl:min-h-0"
                  >
                    <CompletionEvidence
                      projectId={initial.project.id}
                      gateCode={initial.gateReviewHeader.gateCode as GateId}
                      phaseNumber={initial.gateReviewHeader.phaseNumber}
                      artifactPickerOptions={initial.artifactPickerOptions}
                      evidence={initial.completionEvidence}
                      onPreview={onPreview}
                      onMutated={() => {
                        router.refresh();
                      }}
                    />
                  </div>
                </div>
              }
              decisionColumn={
                <div className="flex h-full min-h-0 w-full flex-1 flex-col gap-4 max-xl:h-auto xl:min-h-0 xl:gap-5">
                  <div className="flex min-h-0 flex-1 basis-0 flex-col overflow-hidden xl:min-h-[180px]">
                    <section
                      className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-border dark:bg-card"
                      aria-label="Decision criteria and approver review"
                    >
                      <div className="lifecycle-scroll min-h-0 flex-1 overflow-y-auto overflow-x-auto px-8 pb-8 pt-8">
                        <div id="gate-review-decision-criteria">
                          <DecisionCriteria
                            projectId={initial.project.id}
                            gateCode={initial.gateReviewHeader.gateCode}
                            summary={decisionCriteriaSummary}
                            completionEvidence={initial.completionEvidence}
                            onUpdateCriterion={onUpdateCriterion}
                            embedded
                          />
                        </div>
                        <div id="gate-review-approvers">
                          <ApproverReview
                            projectId={initial.project.id}
                            gateId={initial.gateReviewHeader.gateId}
                            approvers={initial.approvers}
                            onOpenDetail={onOpenDetail}
                            onOpenComments={onOpenComments}
                            onAssignApprovers={() => setAssignOpen(true)}
                            onViewApprovers={() => setAssignmentDrawerOpen(true)}
                            onSendReminder={() => setReminderOpen(true)}
                            canSendReminders={canSendApproverReminders}
                            embedded
                          />
                        </div>
                      </div>
                    </section>
                  </div>
                  <div className="flex min-h-0 flex-1 basis-0 flex-col overflow-hidden xl:min-h-[180px]">
                    <section
                      id="gate-review-decision-record"
                      ref={decisionRecordRef}
                      tabIndex={-1}
                      className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm outline-none dark:border-border dark:bg-card"
                      aria-label="Decision record and next phase unlock"
                    >
                      <div className="lifecycle-scroll min-h-0 flex-1 overflow-y-auto overflow-x-auto px-8 pb-8 pt-8">
                        <DecisionRecord
                          record={initial.decisionRecord}
                          draftDecision={draftDecision}
                          onOpenDecisionModal={openDecisionModal}
                          comments={comments}
                          onCommentsChange={setComments}
                          onExpandComments={() => setCommentsEditorOpen(true)}
                          onViewFinalRecord={() => setFinalRecordOpen(true)}
                          embedded
                        />
                        <NextPhaseUnlock
                          state={nextPhaseUnlock}
                          gateCode={initial.gateReviewHeader.gateCode}
                          gateName={initial.gateReviewHeader.gateName}
                          embedded
                        />
                      </div>
                    </section>
                  </div>
                </div>
              }
            />
          </div>

          {submitError ? (
            <div className="mx-auto w-full max-w-[1920px] shrink-0 px-5 pb-2 min-[901px]:px-8" role="alert">
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-100">
                {submitError}
              </div>
            </div>
          ) : null}
          {approverAssignError ? (
            <div className="mx-auto w-full max-w-[1920px] shrink-0 px-5 pb-2 min-[901px]:px-8" role="alert">
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-100">
                {approverAssignError}
              </div>
            </div>
          ) : null}
          <GateReviewActionBar
            actionState={effectiveActionState}
            onSaveReview={onSaveReview}
            onSubmitDecision={onSubmitDecision}
            onCancelReview={onCancelReview}
            submitHelperId={submitHelperId}
            submitting={submitPending}
          />
        </div>
      </GateReviewContent>

      <EvidencePreviewModal
        item={previewItem}
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
      />
      <ApproverReviewDetailDrawer
        open={detailOpen}
        approver={detailApprover}
        onClose={() => {
          setDetailOpen(false);
          setDetailApprover(null);
        }}
      />
      <ApproverCommentsModal
        approver={commentApprover}
        open={commentOpen}
        onClose={() => {
          setCommentOpen(false);
          setCommentApprover(null);
        }}
        sessionComments={
          commentApprover ? (sessionCommentsByApproverId[commentApprover.id] ?? []) : []
        }
        onAddComment={onAddSessionComment}
      />
      <ApproverAssignmentDrawer
        open={assignmentDrawerOpen}
        onClose={() => setAssignmentDrawerOpen(false)}
        approvers={initial.approvers}
        requiredRoles={initial.gateOverview.policy.requiredApproverRoles}
        onRequestAdd={() => {
          setAssignOpen(true);
        }}
        onRemoveApprover={onRemoveApproverFromDrawer}
        removePending={approverAssignPending}
      />
      <SendApproverReminderModal
        open={reminderOpen}
        onClose={() => setReminderOpen(false)}
        projectId={initial.project.id}
        gateId={initial.gateReviewHeader.gateCode as GateId}
        pendingApprovers={pendingApprovers}
      />
      <AssignApproversModal
        open={assignOpen}
        projectId={initial.project.id}
        gateId={initial.gateReviewHeader.gateCode as GateId}
        gateLabel={initial.gateReviewHeader.gateName}
        candidates={initial.assignableApprovers}
        initialSelection={initial.assignedApprovers}
        initialDueAtIso={initial.assignedDueAtIso}
        onClose={() => setAssignOpen(false)}
      />
      <DownloadReviewPackageModal
        open={downloadPackageOpen}
        projectId={initial.project.id}
        gateId={initial.gateReviewHeader.gateId}
        onClose={() => setDownloadPackageOpen(false)}
      />
      <SaveReviewSummaryModal
        open={saveSummaryOpen}
        onClose={() => setSaveSummaryOpen(false)}
        savedFieldLabels={[
          "Decision criteria assessments",
          "Decision record (choice, comments, conditions)",
        ]}
        unresolvedWarnings={readinessItems}
        savedAtLabel={
          lastSavedAt
            ? lastSavedAt.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
            : "—"
        }
      />
      <SubmitDecisionConfirmationModal
        open={submitConfirmOpen}
        onClose={() => setSubmitConfirmOpen(false)}
        onContinue={() => {
          setSubmitConfirmOpen(false);
          if (draftDecision) setDecisionModal(draftDecision);
        }}
        draftDecision={draftDecision}
        requiredInputs={initial.requiredInputs}
        completionEvidence={initial.completionEvidence}
        approvers={initial.approvers}
        criteria={criteria}
        overallAssessmentLabel={overallAssessmentLabel}
        nextPhaseUnlock={nextPhaseUnlock}
        gateCode={initial.gateReviewHeader.gateCode}
        gateName={initial.gateReviewHeader.gateName}
      />
      <DecisionSubmissionBlockersDrawer
        open={blockersDrawerOpen}
        onClose={() => {
          setBlockersDrawerOpen(false);
          setSubmissionBlockersOverride(null);
        }}
        blockers={displayBlockers}
        gateCode={initial.gateReviewHeader.gateCode}
        gateName={initial.gateReviewHeader.gateName}
        onJump={scrollToGateSection}
      />
      <UnsavedReviewChangesModal
        open={cancelUnsavedOpen}
        changedSummaries={(() => {
          const b = savedBaselineRef.current;
          const rows: string[] = [];
          if (JSON.stringify(criteria) !== JSON.stringify(b.criteria)) rows.push("Decision criteria");
          if (draftDecision !== b.draftDecision) rows.push("Selected decision");
          if (comments !== b.comments) rows.push("Decision comments");
          if (JSON.stringify(conditions) !== JSON.stringify(b.conditions)) rows.push("Conditions");
          return rows.length ? rows : ["Review edits"];
        })()}
        onSaveDraft={() => {
          onSaveReview();
          setCancelUnsavedOpen(false);
          router.push(gatesListHref);
        }}
        onDiscard={() => {
          const b = savedBaselineRef.current;
          setCriteria(structuredClone(b.criteria));
          setDraftDecision(b.draftDecision);
          setComments(b.comments);
          setConditions([...b.conditions]);
          setCancelUnsavedOpen(false);
          router.push(gatesListHref);
        }}
        onContinueEditing={() => setCancelUnsavedOpen(false)}
      />
      <ApproveGateConfirmationModal
        open={decisionModal === "approve"}
        onClose={() => setDecisionModal(null)}
        onConfirm={(modalNotes) => {
          const merged = [comments.trim(), modalNotes.trim() && `Approver notes: ${modalNotes.trim()}`]
            .filter(Boolean)
            .join("\n\n");
          const nextAction =
            [merged, ...conditions.filter(Boolean)].filter(Boolean).join("\n·\n") ||
            "Recorded via Gate Review UI (Accepted).";
          runRecordGateReview({ decision: "approve", nextActionText: nextAction });
        }}
        gateCode={initial.gateReviewHeader.gateCode}
        gateName={initial.gateReviewHeader.gateName}
        readinessItems={readinessItems}
        nextPhaseLabel={`Phase ${initial.nextPhaseUnlock.nextPhaseNumber}: ${initial.nextPhaseUnlock.nextPhaseName}`}
        blockers={approveModalBlockers}
        pending={submitPending}
      />
      <ConditionalApprovalModal
        open={decisionModal === "conditional_approve"}
        onClose={() => setDecisionModal(null)}
        onConfirm={(p) => {
          setConditions(p.conditions);
          const nextAction = [
            "Conditional approval (captured in gate review UI)",
            ...p.conditions.map((c) => `Condition: ${c}`),
            `Follow-ups: ${p.followUps}`,
            `Responsible owner: ${p.responsible}`,
            `Condition due date: ${p.dueDate || "not specified"}`,
            `Decision comments: ${p.comments}`,
          ].join("\n");
          runRecordGateReview({ decision: "conditional_approve", nextActionText: nextAction });
        }}
        gateCode={initial.gateReviewHeader.gateCode}
        gateName={initial.gateReviewHeader.gateName}
        initialConditions={conditions}
        pending={submitPending}
      />
      <RequestChangesModal
        open={decisionModal === "request_changes"}
        onClose={() => setDecisionModal(null)}
        onConfirm={(p) => {
          const inputLabels = p.relatedInputIds.map(
            (id) => initial.requiredInputs.find((i) => i.id === id)?.inputCode ?? id,
          );
          const evLabels = p.relatedEvidenceIds.map(
            (id) => initial.completionEvidence.find((e) => e.id === id)?.name ?? id,
          );
          setComments(p.reviewerComments);
          const nextAction = [
            `Request changes — severity: ${p.severity}`,
            `Required changes: ${p.requiredChanges}`,
            `Return workspace to phase: ${p.returnPhase}`,
            inputLabels.length ? `Related inputs: ${inputLabels.join(", ")}` : null,
            evLabels.length ? `Related evidence: ${evLabels.join(", ")}` : null,
            `Reviewer comments: ${p.reviewerComments}`,
          ]
            .filter(Boolean)
            .join("\n");
          runRecordGateReview({ decision: "request_changes", nextActionText: nextAction });
        }}
        gateCode={initial.gateReviewHeader.gateCode}
        gateName={initial.gateReviewHeader.gateName}
        requiredInputs={initial.requiredInputs}
        completionEvidence={initial.completionEvidence}
        currentPhaseNumber={initial.gateReviewHeader.phaseNumber}
        pending={submitPending}
      />
      <RejectGateConfirmationModal
        open={decisionModal === "reject"}
        onClose={() => setDecisionModal(null)}
        onConfirm={(p) => {
          setComments(p.comments);
          const nextAction = [
            `Rejected — reason: ${p.reason}`,
            `Disposition: ${p.disposition}`,
            `Comments: ${p.comments}`,
          ].join("\n");
          runRecordGateReview({ decision: "reject", nextActionText: nextAction });
        }}
        gateCode={initial.gateReviewHeader.gateCode}
        gateName={initial.gateReviewHeader.gateName}
        pending={submitPending}
      />
      <DecisionCommentsEditorModal
        open={commentsEditorOpen}
        onClose={() => setCommentsEditorOpen(false)}
        initialText={comments}
        storageKey={`gate-review-decision-comments-${initial.project.id}-${initial.gateReviewHeader.gateId}`}
        maxLength={4000}
        onApply={(text, visibility) => {
          setComments(`[visibility:${visibility}]\n${text}`);
        }}
      />
      <FinalDecisionRecordDrawer
        open={finalRecordOpen}
        onClose={() => setFinalRecordOpen(false)}
        record={initial.decisionRecord}
        gateCode={initial.gateReviewHeader.gateCode}
        gateName={initial.gateReviewHeader.gateName}
        requiredInputs={initial.requiredInputs}
        completionEvidence={initial.completionEvidence}
      />
      <GateReviewSaveToast message={saveToastMessage} visible={saveToastVisible} />
      <GateAuditTrailPreviewDrawer
        open={auditTrailPreviewOpen}
        onClose={() => setAuditTrailPreviewOpen(false)}
        projectId={initial.project.id}
        gateCode={initial.gateReviewHeader.gateCode}
        gateRouteId={initial.gateReviewHeader.gateId}
      />
    </AuthenticatedAppShell>
  );
}
