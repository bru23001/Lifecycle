"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type RefObject,
  type SetStateAction,
} from "react";
import { Download, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import type {
  GateDecisionRecord,
  GateEvidenceItem,
  RequiredGateInput,
} from "@/types/gate-review.types";
import { cn } from "@/lib/utils";

function useDialogOpen(open: boolean) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (open) {
      if (!node.open) node.showModal();
    } else if (node.open) {
      node.close();
    }
  }, [open]);
  return ref;
}

function ModalFrame({
  ref,
  titleId,
  title,
  subtitle,
  onClose,
  children,
  footer,
  widthClassName,
}: {
  ref: RefObject<HTMLDialogElement | null>;
  titleId: string;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  footer: ReactNode;
  widthClassName?: string;
}) {
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      className={cn(
        "fixed left-1/2 top-1/2 z-50 w-[min(100vw-2rem,640px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-0 shadow-xl backdrop:bg-slate-900/40 dark:border-border dark:bg-card",
        widthClassName,
      )}
      aria-labelledby={titleId}
    >
      <div className="flex max-h-[min(88vh,760px)] flex-col">
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-border">
          <div className="min-w-0">
            {subtitle ? (
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-muted-foreground">
                {subtitle}
              </p>
            ) : null}
            <h2 id={titleId} className="mt-1 text-lg font-semibold text-slate-950 dark:text-foreground">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-muted"
          >
            <X className="size-4" aria-hidden />
          </button>
        </header>
        <div className="lifecycle-scroll min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
        <footer className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-slate-200 px-5 py-3 dark:border-border">
          {footer}
        </footer>
      </div>
    </dialog>
  );
}

function DrawerFrame({
  ref,
  titleId,
  title,
  subtitle,
  onClose,
  children,
  footer,
}: {
  ref: RefObject<HTMLDialogElement | null>;
  titleId: string;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      className="fixed inset-y-0 right-0 z-50 m-0 flex w-[min(100vw-0.5rem,32rem)] max-w-[100vw] flex-col border-0 border-l border-slate-200 bg-white p-0 shadow-2xl backdrop:bg-slate-900/40 dark:border-border dark:bg-card"
      aria-labelledby={titleId}
    >
      <header className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-border">
        <div className="min-w-0">
          {subtitle ? (
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-muted-foreground">
              {subtitle}
            </p>
          ) : null}
          <h2 id={titleId} className="mt-1 text-lg font-semibold text-slate-950 dark:text-foreground">
            {title}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="rounded-md p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-muted"
        >
          <X className="size-4" aria-hidden />
        </button>
      </header>
      <div className="lifecycle-scroll min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
      <footer className="flex shrink-0 flex-wrap gap-2 border-t border-slate-200 px-5 py-3 dark:border-border">
        {footer}
      </footer>
    </dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-muted-foreground">
        {label}
      </p>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

export function ApproveGateConfirmationModal({
  open,
  onClose,
  onConfirm,
  gateCode,
  gateName,
  readinessItems,
  nextPhaseLabel,
  blockers,
  pending,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (modalNotes: string) => void;
  gateCode: string;
  gateName: string;
  readinessItems: { label: string; ok: boolean }[];
  nextPhaseLabel: string;
  blockers: string[];
  pending: boolean;
}) {
  const titleId = useId();
  const ref = useDialogOpen(open);
  const [modalNotes, setModalNotes] = useState("");
  useEffect(() => {
    if (open) setModalNotes("");
  }, [open]);

  const canConfirm = blockers.length === 0;

  return (
    <ModalFrame
      ref={ref}
      titleId={titleId}
      subtitle="Confirm decision"
      title="Approve gate"
      onClose={onClose}
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-emerald-600 text-white hover:bg-emerald-700"
            disabled={pending || !canConfirm}
            onClick={() => onConfirm(modalNotes)}
            data-testid="gate-confirm-approval"
          >
            {pending ? "Recording…" : "Confirm approval"}
          </Button>
        </>
      }
    >
      <Field label="Gate">{`${gateCode} — ${gateName}`}</Field>
      <Field label="Decision">
        <span className="font-semibold text-emerald-700 dark:text-emerald-400">Approve</span>
      </Field>
      <Field label="Inputs / evidence readiness">
        <ul className="space-y-1 text-sm">
          {readinessItems.map((r) => (
            <li key={r.label} className={r.ok ? "text-emerald-800 dark:text-emerald-200" : "text-amber-800 dark:text-amber-200"}>
              {r.ok ? "✓ " : "○ "}
              {r.label}
            </li>
          ))}
        </ul>
      </Field>
      <Field label="Next phase to unlock">
        <p className="text-sm font-medium text-foreground">{nextPhaseLabel}</p>
      </Field>
      <label className="block">
        <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Optional decision comments</span>
        <textarea
          value={modalNotes}
          onChange={(e) => setModalNotes(e.target.value)}
          rows={2}
          className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-border dark:bg-background"
          placeholder="Add any approver notes for the audit trail…"
        />
      </label>
      {blockers.length ? (
        <div role="alert" className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-50">
          <p className="font-semibold">Resolve before approval:</p>
          <ul className="mt-1 list-inside list-disc">
            {blockers.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </ModalFrame>
  );
}

export function ConditionalApprovalModal({
  open,
  onClose,
  onConfirm,
  gateCode,
  gateName,
  initialConditions,
  pending,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (payload: {
    conditions: string[];
    followUps: string;
    responsible: string;
    dueDate: string;
    comments: string;
  }) => void;
  gateCode: string;
  gateName: string;
  initialConditions: string[];
  pending: boolean;
}) {
  const titleId = useId();
  const ref = useDialogOpen(open);
  const [conditions, setConditions] = useState<string[]>([""]);
  const [followUps, setFollowUps] = useState("");
  const [responsible, setResponsible] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [comments, setComments] = useState("");

  useEffect(() => {
    if (open) {
      setConditions(initialConditions.length ? [...initialConditions] : [""]);
      setFollowUps("");
      setResponsible("");
      setDueDate("");
      setComments("");
    }
  }, [open, initialConditions]);

  function addRow() {
    setConditions((c) => [...c, ""]);
  }
  function removeRow(i: number) {
    setConditions((c) => c.filter((_, j) => j !== i));
  }

  const valid =
    conditions.some((c) => c.trim()) &&
    followUps.trim().length >= 3 &&
    responsible.trim().length >= 2 &&
    comments.trim().length >= 3;

  return (
    <ModalFrame
      ref={ref}
      titleId={titleId}
      subtitle="Conditional path"
      title="Conditional approval"
      onClose={onClose}
      widthClassName="w-[min(100vw-2rem,700px)]"
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-blue-600 text-white hover:bg-blue-700"
            disabled={pending || !valid}
            onClick={() =>
              onConfirm({
                conditions: conditions.map((c) => c.trim()).filter(Boolean),
                followUps: followUps.trim(),
                responsible: responsible.trim(),
                dueDate: dueDate.trim(),
                comments: comments.trim(),
              })
            }
          >
            {pending ? "Recording…" : "Confirm conditional approval"}
          </Button>
        </>
      }
    >
      <Field label="Gate">{`${gateCode} — ${gateName}`}</Field>
      <Field label="Conditions list">
        <ul className="space-y-2">
          {conditions.map((c, i) => (
            <li key={i} className="flex gap-2">
              <input
                value={c}
                onChange={(e) => setConditions((rows) => rows.map((row, j) => (j === i ? e.target.value : row)))}
                className="flex-1 rounded-md border border-slate-200 px-3 py-2 text-sm dark:border-border dark:bg-background"
                placeholder={`Condition ${i + 1}`}
              />
              <Button type="button" variant="ghost" size="sm" onClick={() => removeRow(i)}>
                Remove
              </Button>
            </li>
          ))}
        </ul>
        <Button type="button" variant="outline" size="sm" className="mt-2" onClick={addRow}>
          Add condition
        </Button>
      </Field>
      <label className="block">
        <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Required follow-up actions</span>
        <textarea
          value={followUps}
          onChange={(e) => setFollowUps(e.target.value)}
          rows={2}
          className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm dark:border-border dark:bg-background"
        />
      </label>
      <label className="mt-3 block">
        <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Responsible owner</span>
        <input
          value={responsible}
          onChange={(e) => setResponsible(e.target.value)}
          className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm dark:border-border dark:bg-background"
        />
      </label>
      <label className="mt-3 block">
        <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Due date</span>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm dark:border-border dark:bg-background"
        />
      </label>
      <label className="mt-3 block">
        <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Decision comments</span>
        <textarea
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          rows={3}
          className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm dark:border-border dark:bg-background"
        />
      </label>
    </ModalFrame>
  );
}

const SEVERITIES = ["low", "medium", "high"] as const;

export function RequestChangesModal({
  open,
  onClose,
  onConfirm,
  gateCode,
  gateName,
  requiredInputs,
  completionEvidence,
  currentPhaseNumber,
  pending,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (payload: {
    requiredChanges: string;
    severity: (typeof SEVERITIES)[number];
    relatedInputIds: string[];
    relatedEvidenceIds: string[];
    returnPhase: number;
    reviewerComments: string;
  }) => void;
  gateCode: string;
  gateName: string;
  requiredInputs: RequiredGateInput[];
  completionEvidence: GateEvidenceItem[];
  currentPhaseNumber: number;
  pending: boolean;
}) {
  const titleId = useId();
  const ref = useDialogOpen(open);
  const [requiredChanges, setRequiredChanges] = useState("");
  const [severity, setSeverity] = useState<(typeof SEVERITIES)[number]>("medium");
  const [relatedInputIds, setRelatedInputIds] = useState<string[]>([]);
  const [relatedEvidenceIds, setRelatedEvidenceIds] = useState<string[]>([]);
  const [returnPhase, setReturnPhase] = useState(String(Math.max(1, currentPhaseNumber - 1)));
  const [reviewerComments, setReviewerComments] = useState("");

  useEffect(() => {
    if (open) {
      setRequiredChanges("");
      setSeverity("medium");
      setRelatedInputIds([]);
      setRelatedEvidenceIds([]);
      setReturnPhase(String(Math.max(1, currentPhaseNumber - 1)));
      setReviewerComments("");
    }
  }, [open, currentPhaseNumber]);

  const phaseOptions = useMemo(
    () => Array.from({ length: currentPhaseNumber }, (_, i) => i + 1),
    [currentPhaseNumber],
  );

  function toggleId(set: Dispatch<SetStateAction<string[]>>, id: string) {
    set((arr) => (arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]));
  }

  const valid = requiredChanges.trim().length >= 5 && reviewerComments.trim().length >= 3;

  return (
    <ModalFrame
      ref={ref}
      titleId={titleId}
      subtitle="Return package"
      title="Request changes"
      onClose={onClose}
      widthClassName="w-[min(100vw-2rem,720px)]"
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-amber-600 text-white hover:bg-amber-700"
            disabled={pending || !valid}
            onClick={() =>
              onConfirm({
                requiredChanges: requiredChanges.trim(),
                severity,
                relatedInputIds,
                relatedEvidenceIds,
                returnPhase: Number.parseInt(returnPhase, 10) || 1,
                reviewerComments: reviewerComments.trim(),
              })
            }
          >
            {pending ? "Submitting…" : "Submit request"}
          </Button>
        </>
      }
    >
      <Field label="Gate">{`${gateCode} — ${gateName}`}</Field>
      <label className="block">
        <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Required changes</span>
        <textarea
          value={requiredChanges}
          onChange={(e) => setRequiredChanges(e.target.value)}
          rows={3}
          className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm dark:border-border dark:bg-background"
        />
      </label>
      <label className="mt-3 block">
        <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Change severity</span>
        <select
          value={severity}
          onChange={(e) => setSeverity(e.target.value as (typeof SEVERITIES)[number])}
          className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm dark:border-border dark:bg-background"
        >
          {SEVERITIES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
      <Field label="Related inputs">
        <ul className="max-h-36 space-y-1 overflow-y-auto text-sm">
          {requiredInputs.map((i) => (
            <li key={i.id}>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={relatedInputIds.includes(i.id)}
                  onChange={() => toggleId(setRelatedInputIds, i.id)}
                  className="size-4 rounded border-slate-300"
                />
                <span>
                  {i.inputCode} — {i.name}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </Field>
      <Field label="Related evidence">
        <ul className="max-h-36 space-y-1 overflow-y-auto text-sm">
          {completionEvidence.map((e) => (
            <li key={e.id}>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={relatedEvidenceIds.includes(e.id)}
                  onChange={() => toggleId(setRelatedEvidenceIds, e.id)}
                  className="size-4 rounded border-slate-300"
                />
                <span>{e.name}</span>
              </label>
            </li>
          ))}
        </ul>
      </Field>
      <label className="mt-3 block">
        <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Return-to phase</span>
        <select
          value={returnPhase}
          onChange={(e) => setReturnPhase(e.target.value)}
          className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm dark:border-border dark:bg-background"
        >
          {phaseOptions.map((p) => (
            <option key={p} value={String(p)}>
              Phase {p}
            </option>
          ))}
        </select>
      </label>
      <label className="mt-3 block">
        <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Reviewer comments</span>
        <textarea
          value={reviewerComments}
          onChange={(e) => setReviewerComments(e.target.value)}
          rows={3}
          className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm dark:border-border dark:bg-background"
        />
      </label>
    </ModalFrame>
  );
}

const DISPOSITIONS = [
  { value: "stop", label: "Stop — hold progression" },
  { value: "defer", label: "Defer — pause until replan" },
  { value: "rework", label: "Rework — return to prior artifacts" },
] as const;

export function RejectGateConfirmationModal({
  open,
  onClose,
  onConfirm,
  gateCode,
  gateName,
  pending,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (payload: { reason: string; disposition: (typeof DISPOSITIONS)[number]["value"]; comments: string }) => void;
  gateCode: string;
  gateName: string;
  pending: boolean;
}) {
  const titleId = useId();
  const ref = useDialogOpen(open);
  const [reason, setReason] = useState("");
  const [disposition, setDisposition] = useState<(typeof DISPOSITIONS)[number]["value"]>("stop");
  const [comments, setComments] = useState("");

  useEffect(() => {
    if (open) {
      setReason("");
      setDisposition("stop");
      setComments("");
    }
  }, [open]);

  const valid = reason.trim().length >= 5 && comments.trim().length >= 5;

  return (
    <ModalFrame
      ref={ref}
      titleId={titleId}
      subtitle="Destructive action"
      title="Reject gate"
      onClose={onClose}
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={pending || !valid}
            onClick={() =>
              onConfirm({
                reason: reason.trim(),
                disposition,
                comments: comments.trim(),
              })
            }
          >
            {pending ? "Recording…" : "Confirm rejection"}
          </Button>
        </>
      }
    >
      <div
        role="alert"
        className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-100"
      >
        Rejecting blocks forward progression for this gate until governance reopens the review.
      </div>
      <Field label="Gate">{`${gateCode} — ${gateName}`}</Field>
      <label className="block">
        <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Rejection reason</span>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={2}
          className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm dark:border-border dark:bg-background"
        />
      </label>
      <Field label="Impact warning">
        <p className="text-sm text-muted-foreground">
          Workspace phase will not advance on a rejection. Downstream teams should treat open work as blocked at this
          gate until a new package is submitted.
        </p>
      </Field>
      <Field label="Stop / defer / rework">
        <div className="space-y-2">
          {DISPOSITIONS.map((d) => (
            <label key={d.value} className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="radio"
                name="disposition"
                value={d.value}
                checked={disposition === d.value}
                onChange={() => setDisposition(d.value)}
                className="size-4"
              />
              {d.label}
            </label>
          ))}
        </div>
      </Field>
      <label className="mt-3 block">
        <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Required comments</span>
        <textarea
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          rows={3}
          className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm dark:border-border dark:bg-background"
        />
      </label>
    </ModalFrame>
  );
}

const VISIBILITY = ["reviewers", "internal", "project_team"] as const;

export function DecisionCommentsEditorModal({
  open,
  onClose,
  initialText,
  storageKey,
  maxLength,
  onApply,
}: {
  open: boolean;
  onClose: () => void;
  initialText: string;
  storageKey: string;
  maxLength: number;
  onApply: (text: string, visibility: (typeof VISIBILITY)[number]) => void;
}) {
  const titleId = useId();
  const ref = useDialogOpen(open);
  const [text, setText] = useState(initialText);
  const [visibility, setVisibility] = useState<(typeof VISIBILITY)[number]>("reviewers");

  useEffect(() => {
    if (open) {
      const draft = typeof window !== "undefined" ? window.sessionStorage.getItem(storageKey) : null;
      setText(draft ?? initialText);
      setVisibility("reviewers");
    }
  }, [open, initialText, storageKey]);

  const remaining = maxLength - text.length;

  const saveDraft = useCallback(() => {
    try {
      window.sessionStorage.setItem(storageKey, text);
    } catch {
      /* ignore quota */
    }
  }, [storageKey, text]);

  return (
    <ModalFrame
      ref={ref}
      titleId={titleId}
      subtitle="Decision notes"
      title="Decision comments"
      onClose={onClose}
      widthClassName="w-[min(100vw-2rem,720px)]"
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" variant="secondary" onClick={saveDraft}>
            Save draft
          </Button>
          <Button
            type="button"
            onClick={() => {
              onApply(text.slice(0, maxLength), visibility);
              try {
                window.sessionStorage.removeItem(storageKey);
              } catch {
                /* ignore */
              }
              onClose();
            }}
          >
            Apply comments
          </Button>
        </>
      }
    >
      <label className="block">
        <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Comment visibility</span>
        <select
          value={visibility}
          onChange={(e) => setVisibility(e.target.value as (typeof VISIBILITY)[number])}
          className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm dark:border-border dark:bg-background"
        >
          {VISIBILITY.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </label>
      <label className="mt-3 block">
        <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Comments (plain text)</span>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, maxLength))}
          rows={12}
          className="mt-1 w-full resize-y rounded-md border border-slate-200 px-3 py-2 font-mono text-sm leading-relaxed dark:border-border dark:bg-background"
        />
      </label>
      <p className="mt-2 text-xs text-muted-foreground">
        {remaining < 0 ? 0 : remaining} characters remaining (max {maxLength}).
      </p>
    </ModalFrame>
  );
}

export function FinalDecisionRecordDrawer({
  open,
  onClose,
  record,
  gateCode,
  gateName,
  requiredInputs,
  completionEvidence,
}: {
  open: boolean;
  onClose: () => void;
  record: GateDecisionRecord;
  gateCode: string;
  gateName: string;
  requiredInputs: RequiredGateInput[];
  completionEvidence: GateEvidenceItem[];
}) {
  const finalized = record.status === "finalized" || record.status === "submitted";
  const titleId = useId();
  const ref = useDialogOpen(open && finalized);

  const exportJson = useCallback(() => {
    const payload = {
      gateCode,
      gateName,
      outcome: record.decisionLabel ?? record.decision,
      decidedBy: record.decidedBy,
      decidedOn: record.decidedOn,
      decidedOnIso: record.decidedOnIso,
      comments: record.comments,
      conditions: record.conditions,
      evidencePassSnapshot: record.evidencePassSnapshot,
      auditRecordId: record.id,
      inputSnapshot: requiredInputs.map((i) => ({
        code: i.inputCode,
        name: i.name,
        status: i.status,
        provided: i.provided,
      })),
      evidenceSnapshot: completionEvidence.map((e) => ({ id: e.id, name: e.name, type: e.type })),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${gateCode}-decision-record.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [completionEvidence, gateCode, gateName, record, requiredInputs]);

  if (!finalized) return null;

  return (
    <DrawerFrame
      ref={ref}
      titleId={titleId}
      subtitle="Sealed record"
      title="Final decision record"
      onClose={onClose}
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button type="button" onClick={exportJson} className="gap-2">
            <Download className="size-4" aria-hidden />
            Export JSON
          </Button>
        </>
      }
    >
      <Field label="Decision outcome">
        <p className="text-lg font-semibold">{record.decisionLabel ?? record.decision ?? "—"}</p>
      </Field>
      <Field label="Decided by">{record.decidedBy ?? "—"}</Field>
      <Field label="Decision timestamp">
        {record.decidedOnIso ? <time dateTime={record.decidedOnIso}>{record.decidedOn}</time> : record.decidedOn ?? "—"}
      </Field>
      <Field label="Comments">
        <p className="whitespace-pre-wrap text-sm text-foreground/90">{record.comments.trim() || "—"}</p>
      </Field>
      <Field label="Conditions">
        {record.conditions.length ? (
          <ul className="list-inside list-disc text-sm">
            {record.conditions.map((c, i) => (
              <li key={`${i}-${c.slice(0, 6)}`}>{c}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">None recorded.</p>
        )}
      </Field>
      <Field label="Evidence snapshot">
        <p className="text-sm">
          Automated evidence checks:{" "}
          <span className="font-medium">
            {record.evidencePassSnapshot === undefined ? "Unknown" : record.evidencePassSnapshot ? "Passed" : "Did not pass"}
          </span>
        </p>
      </Field>
      <Field label="Input snapshot">
        <ul className="space-y-1 text-sm">
          {requiredInputs.map((i) => (
            <li key={i.id}>
              {i.inputCode} — {i.status} {i.provided ? "(provided)" : ""}
            </li>
          ))}
        </ul>
      </Field>
      <Field label="Audit record ID">
        <code className="rounded bg-muted px-2 py-1 text-xs">{record.id ?? "—"}</code>
      </Field>
    </DrawerFrame>
  );
}
