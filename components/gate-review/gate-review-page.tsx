"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { recordGateReview } from "@/app/actions/recordGateReview";
import { AuthenticatedAppShell } from "@/components/lifecycle-workspace/authenticated-app-shell";
import { Breadcrumbs } from "@/components/lifecycle-workspace/breadcrumbs";
import { PaneSwitcher } from "@/components/lifecycle-workspace/pane-switcher";
import { TopHeader } from "@/components/lifecycle-workspace/top-header";
import type {
  DecisionCriterion,
  GateApprover,
  GateDecisionType,
  GateEvidenceItem,
  GateReviewData,
} from "@/types/gate-review.types";
import { computeActionState, applyUnlockRules, computeOverallAssessment } from "@/lib/gate-decision";
import { triggerReviewPackageDownload } from "@/lib/evidence-package";
import type { GateId } from "@/lib/gateRules";
import { toUserMessage } from "@/lib/toUserMessage";

import { ApproverReview } from "./ApproverReview";
import { CompletionEvidence } from "./CompletionEvidence";
import { DecisionCriteria } from "./DecisionCriteria";
import { DecisionRecord } from "./DecisionRecord";
import { GateReviewActionBar } from "./GateReviewActionBar";
import { GateReviewContent } from "./GateReviewContent";
import { GateReviewGrid } from "./GateReviewGrid";
import { GateReviewHeader, type GateReviewHeaderChecklist } from "./GateReviewHeader";
import { GateOverviewSidebar } from "./GateOverviewSidebar";
import { NextPhaseUnlock } from "./NextPhaseUnlock";
import { RequiredInputs } from "./RequiredInputs";

function EvidencePreviewDialog({
  item,
  open,
  onClose,
}: {
  item: GateEvidenceItem | null;
  open: boolean;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && item) {
      if (!d.open) d.showModal();
    } else if (d.open) {
      d.close();
    }
  }, [open, item]);

  if (!item) return null;

  return (
    <dialog
      ref={ref}
      className="fixed left-1/2 top-1/2 z-50 w-[min(100vw-2rem,480px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-xl dark:border-border dark:bg-card"
      aria-labelledby="evidence-preview-title"
      onClose={onClose}
    >
      <h2 id="evidence-preview-title" className="text-lg font-semibold text-[#111827] dark:text-foreground">
        Preview
      </h2>
      <p className="mt-2 text-sm text-[#475569] dark:text-muted-foreground">{item.name}</p>
      <p className="mt-4 text-sm text-[#64748b] dark:text-muted-foreground">
        Preview is not available in this demo. Open the evidence record to view the full document.
      </p>
      <div className="mt-6 flex justify-end gap-2">
        <button
          type="button"
          className="rounded-lg border border-[#e5e7eb] px-4 py-2 text-sm font-medium dark:border-border"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </dialog>
  );
}

function ApproverCommentsDialog({
  approver,
  open,
  onClose,
}: {
  approver: GateApprover | null;
  open: boolean;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && approver) {
      if (!d.open) d.showModal();
    } else if (d.open) {
      d.close();
    }
  }, [open, approver]);

  if (!approver) return null;

  return (
    <dialog
      ref={ref}
      className="fixed left-1/2 top-1/2 z-50 w-[min(100vw-2rem,440px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-xl dark:border-border dark:bg-card"
      aria-labelledby="approver-comments-title"
      onClose={onClose}
    >
      <h2 id="approver-comments-title" className="text-lg font-semibold">
        Comments — {approver.name}
      </h2>
      <p className="mt-3 text-sm text-[#475569] dark:text-muted-foreground">
        {approver.comments ?? "No comments recorded."}
      </p>
      <div className="mt-6 flex justify-end">
        <button
          type="button"
          className="rounded-lg border border-[#e5e7eb] px-4 py-2 text-sm font-medium dark:border-border"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </dialog>
  );
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
        requiredInputsCount: initial.requiredInputs.length,
        approversCount: initial.approvers.length,
        criteria,
      }),
    [
      initial.actionState,
      draftDecision,
      comments,
      conditions,
      initial.requiredInputs.length,
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
      }
    : actionState;

  const onChangeAssessment = useCallback((id: string, assessment: DecisionCriterion["assessment"]) => {
    setCriteria((prev) => prev.map((c) => (c.id === id ? { ...c, assessment } : c)));
  }, []);

  const onPreview = useCallback((item: GateEvidenceItem) => {
    setPreviewItem(item);
    setPreviewOpen(true);
  }, []);

  const onOpenComments = useCallback((approver: GateApprover) => {
    setCommentApprover(approver);
    setCommentOpen(true);
  }, []);

  const onSaveReview = useCallback(() => {
    if (immutableDecision) return;
    // Draft persistence placeholder — wire to API / local draft save.
    console.info("[gate-review] save draft", {
      criteria,
      draftDecision,
      comments,
      conditions,
    });
  }, [immutableDecision, criteria, draftDecision, comments, conditions]);

  const onSubmitDecision = useCallback(() => {
    if (immutableDecision) return;
    const blockers = effectiveActionState.submitBlockers;
    if (blockers.length > 0) {
      decisionRecordRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      decisionRecordRef.current?.focus();
      return;
    }
    const serverDecision = mapUiDecisionToServer(draftDecision);
    if (!serverDecision) {
      decisionRecordRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    const gateId = initial.gateReviewHeader.gateCode as GateId;
    const nextActionText =
      [comments.trim(), ...conditions.filter(Boolean)].filter(Boolean).join(" · ") ||
      `Recorded via Gate Review UI (${serverDecision}).`;

    setSubmitError(null);
    startSubmitTransition(async () => {
      try {
        const res = await recordGateReview({
          projectId: initial.project.id,
          gateId,
          decision: serverDecision,
          authorityName: "Governance Reviewer",
          authorityRole: "Lifecycle Gate Authority",
          nextAction: nextActionText,
        });
        if (!res.ok) {
          setSubmitError(toUserMessage(res.error));
          return;
        }
        router.push(`/projects/${initial.project.id}/workspace?phase=${res.newPhase}`);
        router.refresh();
      } catch (e) {
        setSubmitError(toUserMessage(e));
      }
    });
  }, [
    immutableDecision,
    effectiveActionState.submitBlockers,
    draftDecision,
    comments,
    conditions,
    router,
    initial.project.id,
    initial.gateReviewHeader.gateCode,
  ]);

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
        onDownloadReviewPackage={() =>
          triggerReviewPackageDownload(initial.project.id, initial.gateReviewHeader.gateId)
        }
      />

      <GateReviewContent>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="mx-auto w-full max-w-[1920px] shrink-0 px-5 pt-4 min-[901px]:px-8">
            <Breadcrumbs
              items={[
                { label: "Projects", href: "/projects" },
                {
                  label: initial.project.name,
                  href: `/projects/${initial.project.id}/workspace`,
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
              <GateReviewHeader data={headerData} checklist={checklist} approvers={initial.approvers} />
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
                  <div className="flex min-h-[280px] flex-1 basis-0 flex-col xl:min-h-0">
                    <RequiredInputs
                      projectId={initial.project.id}
                      gateId={initial.gateReviewHeader.gateId}
                      inputs={initial.requiredInputs}
                    />
                  </div>
                  <div className="flex min-h-[280px] flex-1 basis-0 flex-col xl:min-h-0">
                    <CompletionEvidence
                      projectId={initial.project.id}
                      gateId={initial.gateReviewHeader.gateId}
                      evidence={initial.completionEvidence}
                      onPreview={onPreview}
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
                        <DecisionCriteria
                          projectId={initial.project.id}
                          gateId={initial.gateReviewHeader.gateId}
                          summary={decisionCriteriaSummary}
                          onChangeAssessment={onChangeAssessment}
                          embedded
                        />
                        <ApproverReview
                          projectId={initial.project.id}
                          gateId={initial.gateReviewHeader.gateId}
                          approvers={initial.approvers}
                          onOpenComments={onOpenComments}
                          embedded
                        />
                      </div>
                    </section>
                  </div>
                  <div className="flex min-h-0 flex-1 basis-0 flex-col overflow-hidden xl:min-h-[180px]">
                    <section
                      ref={decisionRecordRef}
                      tabIndex={-1}
                      className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm outline-none dark:border-border dark:bg-card"
                      aria-label="Decision record and next phase unlock"
                    >
                      <div className="lifecycle-scroll min-h-0 flex-1 overflow-y-auto overflow-x-auto px-8 pb-8 pt-8">
                        <DecisionRecord
                          record={initial.decisionRecord}
                          draftDecision={draftDecision}
                          onSelectDecision={setDraftDecision}
                          comments={comments}
                          onCommentsChange={setComments}
                          conditions={conditions}
                          onAddCondition={() => setConditions((c) => [...c, ""])}
                          onRemoveCondition={(i) => setConditions((c) => c.filter((_, j) => j !== i))}
                          onConditionChange={(i, v) =>
                            setConditions((c) => c.map((row, j) => (j === i ? v : row)))
                          }
                          embedded
                        />
                        <NextPhaseUnlock state={nextPhaseUnlock} embedded />
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
          <GateReviewActionBar
            actionState={effectiveActionState}
            onSaveReview={onSaveReview}
            onSubmitDecision={onSubmitDecision}
            submitHelperId={submitHelperId}
            submitting={submitPending}
          />
        </div>
      </GateReviewContent>

      <EvidencePreviewDialog
        item={previewItem}
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
      />
      <ApproverCommentsDialog
        approver={commentApprover}
        open={commentOpen}
        onClose={() => setCommentOpen(false)}
      />
    </AuthenticatedAppShell>
  );
}
