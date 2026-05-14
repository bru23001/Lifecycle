"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { AlertCircle, Check, ChevronRight, Circle, ExternalLink, ListTodo, ShieldCheck, X } from "lucide-react";

import { recordChecklistOverride } from "@/app/actions/recordChecklistOverride";
import type {
  CompletionChecklistItem,
  CompletionRulesPayload,
} from "@/components/lifecycle-workspace/completion-checklist-types";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function RightDrawer({
  open,
  title,
  onClose,
  children,
  footer,
  testId,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  testId: string;
}) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="presentation">
      <button type="button" className="absolute inset-0 bg-black/40" aria-label="Close drawer" onClick={onClose} />
      <div
        data-testid={testId}
        className="relative flex h-full w-full max-w-lg flex-col border-l border-border bg-[var(--app-bg)] shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          <button
            type="button"
            className="rounded-md p-2 text-muted-foreground hover:bg-muted"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 text-sm">{children}</div>
        {footer ? <footer className="border-t border-border px-4 py-3">{footer}</footer> : null}
      </div>
    </div>
  );
}

function severityLabel(s: CompletionChecklistItem["detail"]["blockingSeverity"]): string {
  if (s === "high") return "High — blocks gate submission when unsatisfied";
  if (s === "medium") return "Medium — should be cleared before review";
  return "None";
}

function ChecklistDetailBody({ item }: { item: CompletionChecklistItem }) {
  const d = item.detail;
  return (
    <div className="space-y-4 text-[13px]">
      <div>
        <p className="text-xs font-semibold uppercase text-muted-foreground">Requirement</p>
        <p className="mt-1 font-medium text-foreground">{item.label}</p>
        <p className="mt-2 text-foreground/90">{d.description}</p>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase text-muted-foreground">Completion status</p>
        <p className="mt-1 text-foreground">
          {item.status === "complete"
            ? "Complete"
            : item.status === "blocked"
              ? "Blocked"
              : "Incomplete"}
          <span className="ml-2 text-muted-foreground">
            (system: {item.computedDone ? "satisfied" : "not satisfied"})
          </span>
        </p>
      </div>
      <div className="grid gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-muted-foreground">Required artifact</p>
          {d.requiredArtifactHref ? (
            <Link href={d.requiredArtifactHref} className="mt-1 inline-flex items-center gap-1 text-[#2563eb] hover:underline">
              {d.requiredArtifact}
              <ExternalLink className="size-3" />
            </Link>
          ) : (
            <p className="mt-1 text-foreground/90">{d.requiredArtifact}</p>
          )}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase text-muted-foreground">Required evidence</p>
          <p className="mt-1 text-foreground/90">{d.requiredEvidence}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase text-muted-foreground">Validation rule</p>
          <p className="mt-1 text-foreground/90">{d.validationRule}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase text-muted-foreground">Blocking severity</p>
          <p className="mt-1 text-foreground/90">{severityLabel(d.blockingSeverity)}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase text-muted-foreground">Related template</p>
          {d.relatedTemplateHref ? (
            <Link
              href={d.relatedTemplateHref}
              className="mt-1 inline-flex items-center gap-1 text-[#2563eb] hover:underline"
            >
              {d.relatedTemplate}
              <ExternalLink className="size-3" />
            </Link>
          ) : (
            <p className="mt-1 text-foreground/90">{d.relatedTemplate}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function CompletionRulesBody({ rules }: { rules: CompletionRulesPayload }) {
  const rows: { k: keyof CompletionRulesPayload; title: string }[] = [
    { k: "requiredArtifactsRule", title: "Required artifacts" },
    { k: "requiredEvidenceRule", title: "Required evidence" },
    { k: "requiredApprovalsRule", title: "Required approvals" },
    { k: "validationRule", title: "Validation" },
    { k: "gateSubmissionRule", title: "Gate submission" },
    { k: "manualOverridePolicy", title: "Manual override policy" },
    { k: "ruleSourceReference", title: "Rule source reference" },
  ];
  return (
    <div className="space-y-4 text-[13px]">
      {rows.map(({ k, title }) => (
        <div key={k}>
          <p className="text-xs font-semibold uppercase text-muted-foreground">{title}</p>
          <p className="mt-1 text-foreground/90">{rules[k]}</p>
        </div>
      ))}
    </div>
  );
}

export type CompletionChecklistProps = {
  items: CompletionChecklistItem[];
  completionRules: CompletionRulesPayload;
  projectRecordId: string;
  phaseNumber: number;
};

export function CompletionChecklist({
  items,
  completionRules,
  projectRecordId,
  phaseNumber,
}: CompletionChecklistProps) {
  const router = useRouter();
  const [detailItem, setDetailItem] = useState<CompletionChecklistItem | null>(null);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [overrideModal, setOverrideModal] = useState<{
    item: CompletionChecklistItem;
    targetStatus: "complete" | "incomplete";
  } | null>(null);
  const [reason, setReason] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!overrideModal) {
      setReason("");
      setComment("");
      setFormError(null);
      setSubmitting(false);
    }
  }, [overrideModal]);

  const completedCount = items.filter((i) => i.status === "complete").length;
  const totalCount = items.length;
  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const firstIncompleteIndex = items.findIndex((i) => i.status !== "complete");

  async function submitOverride() {
    if (!overrideModal) return;
    const r = reason.trim();
    const c = comment.trim();
    if (!r || !c) {
      setFormError("Reason and comment are required.");
      return;
    }
    setSubmitting(true);
    setFormError(null);
    const res = await recordChecklistOverride({
      projectId: projectRecordId,
      phaseNumber,
      checklistItemId: overrideModal.item.id,
      targetStatus: overrideModal.targetStatus,
      reason: r,
      comment: c,
    });
    setSubmitting(false);
    if (!res.ok) {
      setFormError(res.error);
      return;
    }
    setOverrideModal(null);
    router.refresh();
  }

  function onCheckboxActivate(item: CompletionChecklistItem) {
    const currentlyComplete = item.status === "complete";
    const targetStatus: "complete" | "incomplete" = currentlyComplete ? "incomplete" : "complete";
    if (item.governance === "none") {
      void (async () => {
        setSubmitting(true);
        const res = await recordChecklistOverride({
          projectId: projectRecordId,
          phaseNumber,
          checklistItemId: item.id,
          targetStatus,
          reason: "Direct checklist update",
          comment: "No additional governance confirmation required for this line.",
        });
        setSubmitting(false);
        if (res.ok) router.refresh();
      })();
      return;
    }
    setOverrideModal({ item, targetStatus });
  }

  return (
    <section
      id="completion-checklist"
      aria-labelledby="completion-checklist-heading"
      className="completion-checklist rounded-lg border bg-card p-4 shadow-sm"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 id="completion-checklist-heading" className="flex items-center gap-2 text-sm font-semibold">
          <span className="inline-flex size-5 items-center justify-center rounded bg-[#e7f0ff]">
            <ShieldCheck className="size-3.5 text-[#2563eb]" aria-hidden />
          </span>
          Completion checklist
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          <p
            className="rounded bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
            aria-live="polite"
          >
            {completedCount} of {totalCount} completed
          </p>
          <button
            type="button"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "gap-1 text-[11px] font-medium",
            )}
            data-testid="view-completion-rules"
            onClick={() => setRulesOpen(true)}
          >
            <ListTodo className="size-3.5" />
            View completion rules
          </button>
        </div>
      </div>
      <div
        className="mt-3 h-2 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Checklist completion"
      >
        <div className="h-full rounded-full bg-[#2563eb] transition-[width]" style={{ width: `${pct}%` }} />
      </div>
      <ul className="mt-3 space-y-2">
        {items.map((item, index) => {
          const emphasize =
            item.status !== "complete" &&
            index === firstIncompleteIndex &&
            item.status !== "blocked";
          const labelCls = cn(
            item.status === "complete" && "text-foreground",
            item.status === "incomplete" && !emphasize && "text-muted-foreground",
            emphasize && "font-medium text-foreground",
            item.status === "blocked" && "font-medium text-amber-900 dark:text-amber-100",
          );
          const checked = item.status === "complete";

          return (
            <li
              key={item.id}
              data-testid="checklist-item-row"
              className="flex gap-2 rounded-md text-sm hover:bg-muted/30"
            >
              <button
                type="button"
                role="checkbox"
                aria-checked={checked}
                disabled={submitting}
                className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded border border-border bg-background text-muted-foreground hover:bg-muted disabled:opacity-50"
                data-testid="checklist-item-checkbox"
                onClick={(e) => {
                  e.stopPropagation();
                  onCheckboxActivate(item);
                }}
              >
                {checked ? (
                  <Check className="size-3.5 text-emerald-600" aria-hidden />
                ) : item.status === "blocked" ? (
                  <AlertCircle className="size-3.5 text-amber-600" aria-hidden />
                ) : emphasize ? (
                  <Circle className="size-3.5 text-[#2563eb]" aria-hidden />
                ) : (
                  <Circle className="size-3.5 text-muted-foreground/50" aria-hidden />
                )}
              </button>
              <button
                type="button"
                className={cn("min-w-0 flex-1 py-0.5 text-left", labelCls)}
                data-testid="checklist-item-open-detail"
                onClick={() => setDetailItem(item)}
              >
                {item.label}
                {item.required ? (
                  <span className="sr-only"> (required)</span>
                ) : (
                  <span className="sr-only"> (optional)</span>
                )}
              </button>
              {item.href ? (
                <Link
                  href={item.href}
                  className="mt-0.5 inline-flex shrink-0 items-center gap-0.5 text-[11px] font-medium text-[#2563eb] hover:underline"
                  title="Open linked workspace destination"
                  onClick={(e) => e.stopPropagation()}
                >
                  Open
                  <ChevronRight className="size-3.5" />
                </Link>
              ) : null}
            </li>
          );
        })}
      </ul>

      <RightDrawer
        open={detailItem != null}
        title="Checklist item detail"
        onClose={() => setDetailItem(null)}
        testId="checklist-item-detail-drawer"
        footer={
          detailItem ? (
            <div className="flex flex-wrap justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setDetailItem(null)}>
                Close
              </Button>
              {detailItem.detail.resolveHref ? (
                <Link href={detailItem.detail.resolveHref} className={buttonVariants({ size: "sm" })}>
                  {detailItem.detail.resolveActionLabel}
                </Link>
              ) : null}
            </div>
          ) : null
        }
      >
        {detailItem ? <ChecklistDetailBody item={detailItem} /> : null}
      </RightDrawer>

      <RightDrawer
        open={rulesOpen}
        title="Completion rules"
        onClose={() => setRulesOpen(false)}
        testId="completion-rules-drawer"
        footer={
          <div className="flex justify-end">
            <Button type="button" variant="outline" size="sm" onClick={() => setRulesOpen(false)}>
              Close
            </Button>
          </div>
        }
      >
        <CompletionRulesBody rules={completionRules} />
      </RightDrawer>

      {overrideModal ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4" role="presentation">
          <div
            className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl"
            data-testid="checklist-override-confirmation-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="checklist-override-title"
          >
            <div className="flex items-start justify-between gap-2">
              <h2 id="checklist-override-title" className="text-lg font-semibold text-foreground">
                Checklist override confirmation
              </h2>
              <button
                type="button"
                className="rounded-md p-2 text-muted-foreground hover:bg-muted"
                onClick={() => setOverrideModal(null)}
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Checklist item: <span className="font-medium text-foreground">{overrideModal.item.label}</span>
            </p>
            <p className="mt-3 text-xs font-semibold uppercase text-muted-foreground">Current validation state</p>
            <p className="text-sm text-foreground">
              {overrideModal.item.computedDone
                ? "Satisfied (automated checks)"
                : "Not satisfied (automated checks)"}
            </p>
            <p className="mt-2 text-sm text-foreground">
              You are marking this item as{" "}
              <span className="font-semibold">
                {overrideModal.targetStatus === "complete" ? "complete" : "incomplete"}
              </span>{" "}
              manually.
            </p>
            <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-[13px] text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
              Audit warning: overrides are written to the project record and appear in the audit trail. Use only for
              coordinated exceptions.
            </div>
            <label className="mt-4 block space-y-1 text-sm">
              <span className="text-xs font-medium text-muted-foreground">Reason for manual override</span>
              <input
                className="w-full rounded-md border border-input bg-background px-2 py-1.5"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                autoComplete="off"
              />
            </label>
            <label className="mt-3 block space-y-1 text-sm">
              <span className="text-xs font-medium text-muted-foreground">Required comment</span>
              <textarea
                className="min-h-[88px] w-full rounded-md border border-input bg-background px-2 py-1.5"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </label>
            {formError ? <p className="mt-2 text-sm text-destructive">{formError}</p> : null}
            <div className="mt-6 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOverrideModal(null)} disabled={submitting}>
                Cancel
              </Button>
              <Button type="button" onClick={() => void submitOverride()} disabled={submitting}>
                Confirm override
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
