"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ApprovalDecisionType } from "@/types/approval-center.types";
import type { DecisionBlockerItem } from "@/lib/approval-decision";

function useModalOpen(open: boolean, onReset?: () => void) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const prevOpen = useRef(false);
  const resetRef = useRef(onReset);
  resetRef.current = onReset;

  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;
    if (open) {
      if (!prevOpen.current) {
        resetRef.current?.();
      }
      if (!node.open) node.showModal();
    } else if (node.open) {
      node.close();
    }
    prevOpen.current = open;
  }, [open]);

  return dialogRef;
}

const dialogFrame =
  "w-[min(100vw-2rem,520px)] rounded-2xl border border-slate-200 bg-white p-0 shadow-xl backdrop:bg-slate-900/40 dark:border-border dark:bg-card";

export function ApproveConfirmationDialog({
  open,
  packageTitle,
  inputsCompleteConfirmed,
  evidenceCompleteConfirmed,
  optionalComment,
  onInputsCompleteChange,
  onEvidenceCompleteChange,
  onOptionalCommentChange,
  onConfirm,
  onClose,
}: {
  open: boolean;
  packageTitle: string;
  inputsCompleteConfirmed: boolean;
  evidenceCompleteConfirmed: boolean;
  optionalComment: string;
  onInputsCompleteChange: (v: boolean) => void;
  onEvidenceCompleteChange: (v: boolean) => void;
  onOptionalCommentChange: (v: string) => void;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const dialogRef = useModalOpen(open);
  const canConfirm = inputsCompleteConfirmed && evidenceCompleteConfirmed;

  return (
    <dialog ref={dialogRef} onClose={onClose} className={dialogFrame} aria-labelledby="approve-confirm-title">
      <div className="flex max-h-[90vh] flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <h2 id="approve-confirm-title" className="text-lg font-semibold text-slate-900">
              Confirm approval
            </h2>
            <p className="mt-1 text-sm text-slate-600">{packageTitle}</p>
          </div>
          <Button type="button" variant="outline" size="icon-sm" aria-label="Close" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </header>
        <div className="space-y-4 overflow-y-auto px-5 py-4 text-sm">
          <div>
            <p className="font-semibold text-slate-800">Approval summary</p>
            <p className="mt-1 text-slate-600">You are about to approve this package. Confirm readiness below.</p>
          </div>
          <label className="flex cursor-pointer items-start gap-2">
            <input
              type="checkbox"
              checked={inputsCompleteConfirmed}
              onChange={(e) => onInputsCompleteChange(e.target.checked)}
              className="mt-1 rounded border-slate-300"
            />
            <span>Required inputs are complete and accurate.</span>
          </label>
          <label className="flex cursor-pointer items-start gap-2">
            <input
              type="checkbox"
              checked={evidenceCompleteConfirmed}
              onChange={(e) => onEvidenceCompleteChange(e.target.checked)}
              className="mt-1 rounded border-slate-300"
            />
            <span>Evidence review is complete for this decision.</span>
          </label>
          <div>
            <label htmlFor="approve-optional-comment" className="font-semibold text-slate-800">
              Optional comment
            </label>
            <textarea
              id="approve-optional-comment"
              rows={2}
              value={optionalComment}
              onChange={(e) => onOptionalCommentChange(e.target.value.slice(0, 500))}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Notes recorded with this approval…"
            />
          </div>
        </div>
        <footer className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" disabled={!canConfirm} onClick={onConfirm}>
            Confirm approval
          </Button>
        </footer>
      </div>
    </dialog>
  );
}

export function RequestChangesDialog({
  open,
  packageTitle,
  onApply,
  onClose,
}: {
  open: boolean;
  packageTitle: string;
  onApply: (payload: {
    summary: string;
    category: string;
    relatedObject: string;
    owner: string;
    dueDate: string;
    reviewerComments: string;
  }) => void;
  onClose: () => void;
}) {
  const [summary, setSummary] = useState("");
  const [category, setCategory] = useState("documentation");
  const [relatedObject, setRelatedObject] = useState("");
  const [owner, setOwner] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [reviewerComments, setReviewerComments] = useState("");
  const reset = () => {
    setSummary("");
    setCategory("documentation");
    setRelatedObject("");
    setOwner("");
    setDueDate("");
    setReviewerComments("");
  };
  const dialogRef = useModalOpen(open, reset);

  return (
    <dialog ref={dialogRef} onClose={onClose} className={dialogFrame} aria-labelledby="req-changes-title">
      <div className="flex max-h-[90vh] flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <h2 id="req-changes-title" className="text-lg font-semibold text-slate-900">
              Request changes
            </h2>
            <p className="mt-1 text-sm text-slate-600">{packageTitle}</p>
          </div>
          <Button type="button" variant="outline" size="icon-sm" aria-label="Close" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </header>
        <div className="grid max-h-[60vh] gap-3 overflow-y-auto px-5 py-4 text-sm">
          <label className="grid gap-1">
            <span className="font-semibold text-slate-800">Required change summary</span>
            <input
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="h-9 rounded-md border border-slate-200 px-2"
              placeholder="Short summary"
            />
          </label>
          <label className="grid gap-1">
            <span className="font-semibold text-slate-800">Change category</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-9 rounded-md border border-slate-200 px-2"
            >
              <option value="documentation">Documentation</option>
              <option value="evidence">Evidence</option>
              <option value="artifact">Artifact</option>
              <option value="process">Process</option>
            </select>
          </label>
          <label className="grid gap-1">
            <span className="font-semibold text-slate-800">Related artifact / input / evidence</span>
            <input
              value={relatedObject}
              onChange={(e) => setRelatedObject(e.target.value)}
              className="h-9 rounded-md border border-slate-200 px-2"
              placeholder="Name or link"
            />
          </label>
          <label className="grid gap-1">
            <span className="font-semibold text-slate-800">Assigned owner</span>
            <input
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              className="h-9 rounded-md border border-slate-200 px-2"
            />
          </label>
          <label className="grid gap-1">
            <span className="font-semibold text-slate-800">Due date</span>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="h-9 rounded-md border border-slate-200 px-2" />
          </label>
          <label className="grid gap-1">
            <span className="font-semibold text-slate-800">Reviewer comments</span>
            <textarea
              rows={3}
              value={reviewerComments}
              onChange={(e) => setReviewerComments(e.target.value.slice(0, 2000))}
              className="rounded-lg border border-slate-200 px-3 py-2"
              placeholder="Instructions for the submitter…"
            />
          </label>
        </div>
        <footer className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => {
              onApply({ summary, category, relatedObject, owner, dueDate, reviewerComments });
              onClose();
            }}
          >
            Request changes
          </Button>
        </footer>
      </div>
    </dialog>
  );
}

export function RejectApprovalDialog({
  open,
  approvalCode,
  packageTitle,
  comments,
  resubmissionAllowed,
  confirmCode,
  onCommentsChange,
  onResubmissionChange,
  onConfirmCodeChange,
  onConfirm,
  onClose,
}: {
  open: boolean;
  approvalCode: string;
  packageTitle: string;
  comments: string;
  resubmissionAllowed: boolean;
  confirmCode: string;
  onCommentsChange: (v: string) => void;
  onResubmissionChange: (v: boolean) => void;
  onConfirmCodeChange: (v: string) => void;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const dialogRef = useModalOpen(open);
  const codeOk = confirmCode.trim().toLowerCase() === approvalCode.trim().toLowerCase();
  const canConfirm = codeOk && comments.trim().length > 0;

  return (
    <dialog ref={dialogRef} onClose={onClose} className={dialogFrame} aria-labelledby="reject-title">
      <div className="flex max-h-[90vh] flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <h2 id="reject-title" className="text-lg font-semibold text-slate-900">
              Reject approval
            </h2>
            <p className="mt-1 text-sm text-slate-600">{packageTitle}</p>
          </div>
          <Button type="button" variant="outline" size="icon-sm" aria-label="Close" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </header>
        <div className="space-y-4 overflow-y-auto px-5 py-4 text-sm">
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-900">
            <p className="font-semibold">Impact warning</p>
            <p className="mt-1 text-xs">Rejection stops progression for this package until addressed or superseded.</p>
          </div>
          <label className="grid gap-1">
            <span className="font-semibold text-slate-800">Rejection reason (comments)</span>
            <textarea
              rows={4}
              value={comments}
              onChange={(e) => onCommentsChange(e.target.value.slice(0, 2000))}
              className="rounded-lg border border-slate-200 px-3 py-2"
              placeholder="Required — explain the rejection…"
            />
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={resubmissionAllowed}
              onChange={(e) => onResubmissionChange(e.target.checked)}
              className="rounded border-slate-300"
            />
            <span>Resubmission allowed after remediation</span>
          </label>
          <label className="grid gap-1">
            <span className="font-semibold text-slate-800">Type approval code to confirm</span>
            <span className="text-xs text-slate-500">Code: {approvalCode}</span>
            <input
              value={confirmCode}
              onChange={(e) => onConfirmCodeChange(e.target.value)}
              className="h-9 rounded-md border border-slate-200 px-2 font-mono text-sm"
              placeholder={approvalCode}
              autoComplete="off"
            />
          </label>
        </div>
        <footer className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" disabled={!canConfirm} onClick={onConfirm}>
            Reject
          </Button>
        </footer>
      </div>
    </dialog>
  );
}

export function DecisionCommentEditorDialog({
  open,
  value,
  mentionSeed,
  evidenceLinkDraft,
  onValueChange,
  onEvidenceLinkChange,
  onInsertTemplate,
  onSave,
  onClose,
}: {
  open: boolean;
  value: string;
  mentionSeed: string;
  evidenceLinkDraft: string;
  onValueChange: (v: string) => void;
  onEvidenceLinkChange: (v: string) => void;
  onInsertTemplate: (template: string) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  const dialogRef = useModalOpen(open);

  return (
    <dialog ref={dialogRef} onClose={onClose} className={dialogFrame} aria-labelledby="dec-comment-title">
      <div className="flex max-h-[90vh] flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <h2 id="dec-comment-title" className="text-lg font-semibold text-slate-900">
              Decision comments
            </h2>
            <p className="mt-1 text-xs text-slate-500">{value.length}/2000 characters</p>
          </div>
          <Button type="button" variant="outline" size="icon-sm" aria-label="Close" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </header>
        <div className="space-y-3 px-5 py-4 text-sm">
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="xs" variant="outline" onClick={() => onInsertTemplate("Please update the linked artifact to address the review notes.")}>
              Template: update artifact
            </Button>
            <Button type="button" size="xs" variant="outline" onClick={() => onInsertTemplate("Additional evidence is required before this gate can pass.")}>
              Template: more evidence
            </Button>
            <Button
              type="button"
              size="xs"
              variant="outline"
              onClick={() => onInsertTemplate(`@${mentionSeed} FYI — please review the decision comments.`)}
            >
              Mention reviewer
            </Button>
          </div>
          <label className="grid gap-1">
            <span className="font-semibold text-slate-800">Link evidence (appended as a line)</span>
            <input
              value={evidenceLinkDraft}
              onChange={(e) => onEvidenceLinkChange(e.target.value)}
              className="h-9 rounded-md border border-slate-200 px-2 text-sm"
              placeholder="/projects/…/evidence/…"
            />
          </label>
          <textarea
            rows={12}
            value={value}
            onChange={(e) => onValueChange(e.target.value.slice(0, 2000))}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm"
          />
        </div>
        <footer className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => {
              onSave();
              onClose();
            }}
          >
            Save comment
          </Button>
        </footer>
      </div>
    </dialog>
  );
}

export function AddRequiredChangeDialog({
  open,
  onAdd,
  onClose,
}: {
  open: boolean;
  onAdd: (row: { title: string; description: string; relatedObject: string; severity: string; assignee: string; dueDate: string }) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [relatedObject, setRelatedObject] = useState("");
  const [severity, setSeverity] = useState("medium");
  const [assignee, setAssignee] = useState("");
  const [dueDate, setDueDate] = useState("");
  const reset = () => {
    setTitle("");
    setDescription("");
    setRelatedObject("");
    setSeverity("medium");
    setAssignee("");
    setDueDate("");
  };
  const dialogRef = useModalOpen(open, reset);

  return (
    <dialog ref={dialogRef} onClose={onClose} className={dialogFrame} aria-labelledby="add-change-title">
      <div className="flex max-h-[90vh] flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <h2 id="add-change-title" className="text-lg font-semibold text-slate-900">
            Add required change
          </h2>
          <Button type="button" variant="outline" size="icon-sm" aria-label="Close" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </header>
        <div className="grid max-h-[55vh] gap-3 overflow-y-auto px-5 py-4 text-sm">
          <label className="grid gap-1">
            <span className="font-semibold">Change title</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="h-9 rounded-md border px-2" />
          </label>
          <label className="grid gap-1">
            <span className="font-semibold">Description</span>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="rounded-md border px-2 py-2" />
          </label>
          <label className="grid gap-1">
            <span className="font-semibold">Related object</span>
            <input value={relatedObject} onChange={(e) => setRelatedObject(e.target.value)} className="h-9 rounded-md border px-2" />
          </label>
          <label className="grid gap-1">
            <span className="font-semibold">Severity</span>
            <select value={severity} onChange={(e) => setSeverity(e.target.value)} className="h-9 rounded-md border px-2">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>
          <label className="grid gap-1">
            <span className="font-semibold">Assignee</span>
            <input value={assignee} onChange={(e) => setAssignee(e.target.value)} className="h-9 rounded-md border px-2" />
          </label>
          <label className="grid gap-1">
            <span className="font-semibold">Due date</span>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="h-9 rounded-md border px-2" />
          </label>
        </div>
        <footer className="flex justify-end gap-2 border-t px-5 py-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!title.trim()}
            onClick={() => {
              onAdd({ title: title.trim(), description, relatedObject, severity, assignee, dueDate });
              onClose();
            }}
          >
            Add change
          </Button>
        </footer>
      </div>
    </dialog>
  );
}

export function SubmitDecisionConfirmationDialog({
  open,
  decision,
  comments,
  requiredChanges,
  conditions,
  onSubmit,
  onClose,
}: {
  open: boolean;
  decision: ApprovalDecisionType;
  comments: string;
  requiredChanges: string[];
  conditions: string[];
  onSubmit: () => void;
  onClose: () => void;
}) {
  const dialogRef = useModalOpen(open);
  const label = decision === "approve" ? "Approve" : decision === "request_changes" ? "Request changes" : "Reject";

  return (
    <dialog ref={dialogRef} onClose={onClose} className={dialogFrame} aria-labelledby="submit-decision-title">
      <div className="flex max-h-[90vh] flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <h2 id="submit-decision-title" className="text-lg font-semibold text-slate-900">
              Submit decision
            </h2>
            <p className="mt-1 text-sm text-slate-600">This action is recorded in the audit trail.</p>
          </div>
          <Button type="button" variant="outline" size="icon-sm" aria-label="Close" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </header>
        <div className="max-h-[55vh] space-y-3 overflow-y-auto px-5 py-4 text-sm">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Selected decision</p>
            <p className="font-semibold text-slate-900">{label}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Decision comments</p>
            <p className="whitespace-pre-wrap text-slate-700">{comments.trim() || "—"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Required changes / reasons</p>
            <ul className="list-disc pl-4 text-slate-700">
              {requiredChanges.filter((c) => c.trim()).map((c) => (
                <li key={c.slice(0, 80)}>{c}</li>
              ))}
              {requiredChanges.filter((c) => c.trim()).length === 0 ? <li>—</li> : null}
            </ul>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Conditions</p>
            <ul className="list-disc pl-4 text-slate-700">
              {conditions.filter((c) => c.trim()).map((c) => (
                <li key={c}>{c}</li>
              ))}
              {conditions.filter((c) => c.trim()).length === 0 ? <li>—</li> : null}
            </ul>
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-950">
            <p className="font-semibold">Downstream workflow</p>
            <p className="mt-1 text-xs">Project queues and notifications may update immediately after submit.</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800">
            <p className="font-semibold">Finality</p>
            <p className="mt-1 text-xs">You can add follow-up comments later, but the formal decision stands until superseded.</p>
          </div>
        </div>
        <footer className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" className="bg-[#2563eb] text-white hover:bg-blue-700" onClick={onSubmit}>
            Submit decision
          </Button>
        </footer>
      </div>
    </dialog>
  );
}

export function DecisionBlockersDialog({
  open,
  items,
  onClose,
  onFixNavigate,
}: {
  open: boolean;
  items: DecisionBlockerItem[];
  onClose: () => void;
  onFixNavigate: (item: DecisionBlockerItem) => void;
}) {
  const dialogRef = useModalOpen(open);

  return (
    <dialog ref={dialogRef} onClose={onClose} className={dialogFrame} aria-labelledby="blockers-title">
      <div className="flex max-h-[90vh] flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <h2 id="blockers-title" className="text-lg font-semibold text-slate-900">
              Cannot submit yet
            </h2>
            <p className="mt-1 text-sm text-slate-600">Resolve the items below, then try again.</p>
          </div>
          <Button type="button" variant="outline" size="icon-sm" aria-label="Close" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </header>
        <ul className="max-h-[60vh] space-y-3 overflow-y-auto px-5 py-4 text-sm">
          {items.map((item) => (
            <li key={item.id} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="text-slate-800">{item.message}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {item.fixHref ? (
                  <Link
                    href={item.fixHref}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "xs" }),
                      "inline-flex no-underline",
                    )}
                  >
                    {item.fixLabel ?? "Open"}
                  </Link>
                ) : null}
                {!item.fixHref ? (
                  <Button type="button" size="xs" variant="outline" onClick={() => onFixNavigate(item)}>
                    {item.id.includes("comment") || item.id.includes("required") || item.id.includes("reject") ?
                      "Scroll to decision panel"
                    : "Focus review"}
                  </Button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
        <footer className="flex justify-end border-t px-5 py-4">
          <Button type="button" onClick={onClose}>
            Close
          </Button>
        </footer>
      </div>
    </dialog>
  );
}
