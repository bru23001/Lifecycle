"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, AlertTriangle, CheckCircle2, Filter, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ValidationIssue, ValidationSummary } from "@/types/template-wizard.types";

type SectionOption = { id: string; title: string };

function severityClasses(severity: ValidationIssue["severity"]) {
  if (severity === "error") return "border-[#fecaca] bg-[#fef2f2] text-[#991b1b]";
  if (severity === "warning") return "border-[#fde68a] bg-[#fffbeb] text-[#92400e]";
  return "border-border bg-muted/30 text-muted-foreground";
}

function SeverityIcon({ severity }: { severity: ValidationIssue["severity"] }) {
  if (severity === "error") return <AlertCircle className="size-4 shrink-0" aria-hidden />;
  if (severity === "warning") return <AlertTriangle className="size-4 shrink-0" aria-hidden />;
  return <CheckCircle2 className="size-4 shrink-0" aria-hidden />;
}

function DrawerShell({
  open,
  title,
  testId,
  onClose,
  children,
  footer,
}: {
  open: boolean;
  title: string;
  testId: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
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
    <div className="fixed inset-0 z-[70] flex justify-end" role="presentation">
      <button type="button" className="absolute inset-0 bg-black/40" aria-label="Close drawer" onClick={onClose} />
      <div
        data-testid={testId}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${testId}-title`}
        className="relative flex h-full w-full max-w-xl flex-col border-l border-border bg-[var(--app-bg)] shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 id={`${testId}-title`} className="text-sm font-semibold text-foreground">
            {title}
          </h2>
          <button
            type="button"
            className="rounded-md p-2 text-muted-foreground hover:bg-muted"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="size-4" aria-hidden />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 text-sm">{children}</div>
        {footer ? <footer className="border-t border-border px-4 py-3">{footer}</footer> : null}
      </div>
    </div>
  );
}

function getSectionTitle(issue: ValidationIssue, sections: SectionOption[]) {
  if (!issue.sectionId) return "Artifact-level";
  return sections.find((s) => s.id === issue.sectionId)?.title ?? issue.sectionId;
}

function getFieldLabel(issue: ValidationIssue, fieldLabels: Record<string, string>) {
  if (!issue.fieldName) return "No field";
  return fieldLabels[issue.fieldName] ?? issue.fieldName;
}

export function ValidationIssueDetailDrawer({
  open,
  issue,
  sections,
  fieldLabels,
  onClose,
  onJumpToField,
}: {
  open: boolean;
  issue: ValidationIssue | null;
  sections: SectionOption[];
  fieldLabels: Record<string, string>;
  onClose: () => void;
  onJumpToField: (issue: ValidationIssue) => void;
}) {
  return (
    <DrawerShell
      open={open}
      title="Validation issue detail"
      testId="validation-issue-detail-drawer"
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={!issue?.sectionId}
            onClick={() => issue && onJumpToField(issue)}
          >
            Jump to field
          </Button>
        </div>
      }
    >
      {issue ? (
        <div className="space-y-4">
          <div className={cn("rounded-xl border px-3 py-2", severityClasses(issue.severity))}>
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide">
              <SeverityIcon severity={issue.severity} />
              {issue.severity}
            </p>
            <p className="mt-2 text-sm font-semibold">{issue.message}</p>
          </div>

          <dl className="grid gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm">
            <DetailRow label="Related section" value={getSectionTitle(issue, sections)} />
            <DetailRow label="Related field" value={getFieldLabel(issue, fieldLabels)} />
            <DetailRow label="Rule ID" value={issue.ruleId ?? issue.id} />
            <DetailRow label="Required fix" value={issue.requiredFix ?? "Resolve the validation message above."} />
            <DetailRow label="Suggested value" value={issue.suggestedValue ?? "No suggested value available."} />
          </dl>
        </div>
      ) : (
        <p className="text-muted-foreground">Select a validation issue to view details.</p>
      )}
    </DrawerShell>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm text-foreground">{value}</dd>
    </div>
  );
}

export function ValidationIssuesDrawer({
  open,
  summary,
  sections,
  fieldLabels,
  onClose,
  onOpenIssue,
  onJumpToIssue,
}: {
  open: boolean;
  summary: ValidationSummary;
  sections: SectionOption[];
  fieldLabels: Record<string, string>;
  onClose: () => void;
  onOpenIssue: (issue: ValidationIssue) => void;
  onJumpToIssue: (issue: ValidationIssue) => void;
}) {
  const [sectionFilter, setSectionFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState<ValidationIssue["severity"] | "all">("all");

  useEffect(() => {
    if (!open) return;
    setSectionFilter("all");
    setSeverityFilter("all");
  }, [open]);

  const filteredIssues = useMemo(() => {
    return summary.issues.filter((issue) => {
      if (sectionFilter !== "all" && issue.sectionId !== sectionFilter) return false;
      if (severityFilter !== "all" && issue.severity !== severityFilter) return false;
      return true;
    });
  }, [sectionFilter, severityFilter, summary.issues]);

  const grouped = useMemo(
    () => ({
      error: filteredIssues.filter((i) => i.severity === "error"),
      warning: filteredIssues.filter((i) => i.severity === "warning"),
      info: filteredIssues.filter((i) => i.severity === "info"),
    }),
    [filteredIssues],
  );

  const infoCount = summary.issues.filter((i) => i.severity === "info").length;

  return (
    <DrawerShell
      open={open}
      title="Validation issues"
      testId="validation-issues-drawer"
      onClose={onClose}
      footer={
        <div className="flex justify-end">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-2 text-center">
          <SummaryCard label="Errors" value={summary.errorCount} tone="error" />
          <SummaryCard label="Warnings" value={summary.warningCount} tone="warning" />
          <SummaryCard label="Info" value={infoCount} tone="info" />
        </div>

        <div className="grid gap-2 rounded-xl border border-border bg-card px-3 py-2 sm:grid-cols-2">
          <label className="block text-xs font-semibold text-foreground">
            <span className="flex items-center gap-1">
              <Filter className="size-3" aria-hidden />
              Section
            </span>
            <select
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs"
            >
              <option value="all">All sections</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-semibold text-foreground">
            Severity
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as ValidationIssue["severity"] | "all")}
              className="mt-1 w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs"
            >
              <option value="all">All severities</option>
              <option value="error">Errors</option>
              <option value="warning">Warnings</option>
              <option value="info">Info</option>
            </select>
          </label>
        </div>

        <IssueListGroup
          title="Errors"
          issues={grouped.error}
          sections={sections}
          fieldLabels={fieldLabels}
          onOpenIssue={onOpenIssue}
          onJumpToIssue={onJumpToIssue}
        />
        <IssueListGroup
          title="Warnings"
          issues={grouped.warning}
          sections={sections}
          fieldLabels={fieldLabels}
          onOpenIssue={onOpenIssue}
          onJumpToIssue={onJumpToIssue}
        />
        <IssueListGroup
          title="Info"
          issues={grouped.info}
          sections={sections}
          fieldLabels={fieldLabels}
          onOpenIssue={onOpenIssue}
          onJumpToIssue={onJumpToIssue}
        />
      </div>
    </DrawerShell>
  );
}

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "error" | "warning" | "info";
}) {
  const classes =
    tone === "error"
      ? "border-[#fecaca] bg-[#fef2f2] text-[#991b1b]"
      : tone === "warning"
        ? "border-[#fde68a] bg-[#fffbeb] text-[#92400e]"
        : "border-border bg-muted/30 text-muted-foreground";
  return (
    <div className={cn("rounded-xl border px-2 py-2", classes)}>
      <p className="text-lg font-bold">{value}</p>
      <p className="text-[10px] font-bold uppercase tracking-wide">{label}</p>
    </div>
  );
}

function IssueListGroup({
  title,
  issues,
  sections,
  fieldLabels,
  onOpenIssue,
  onJumpToIssue,
}: {
  title: string;
  issues: ValidationIssue[];
  sections: SectionOption[];
  fieldLabels: Record<string, string>;
  onOpenIssue: (issue: ValidationIssue) => void;
  onJumpToIssue: (issue: ValidationIssue) => void;
}) {
  return (
    <section>
      <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{title}</h3>
      {issues.length === 0 ? (
        <p className="mt-1 text-sm text-muted-foreground">No {title.toLowerCase()}.</p>
      ) : (
        <ul className="mt-2 space-y-1.5">
          {issues.map((issue) => (
            <li key={issue.id} className={cn("rounded-lg border px-3 py-2", severityClasses(issue.severity))}>
              <div className="flex items-start gap-2">
                <SeverityIcon severity={issue.severity} />
                <div className="min-w-0 flex-1">
                  <button type="button" className="text-left font-medium hover:underline" onClick={() => onOpenIssue(issue)}>
                    {issue.message}
                  </button>
                  <p className="mt-0.5 text-xs opacity-80">
                    {getSectionTitle(issue, sections)} · {getFieldLabel(issue, fieldLabels)}
                  </p>
                </div>
                <Button type="button" size="xs" variant="outline" disabled={!issue.sectionId} onClick={() => onJumpToIssue(issue)}>
                  Jump
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function ValidationProgressModal({
  open,
  summary,
  onClose,
}: {
  open: boolean;
  summary: ValidationSummary;
  onClose: () => void;
}) {
  const steps = useMemo(
    () => [
      "Scanning required fields",
      "Checking evidence links",
      "Evaluating scoring matrices",
      "Building validation summary",
    ],
    [],
  );
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (!open) return;
    setStepIndex(0);
    const timers = steps.map((_, index) =>
      window.setTimeout(() => setStepIndex(index), 180 + index * 220),
    );
    const closeTimer = window.setTimeout(onClose, 1300);
    return () => {
      for (const timer of timers) window.clearTimeout(timer);
      window.clearTimeout(closeTimer);
    };
  }, [open, onClose, steps]);

  if (!open) return null;

  const rulesChecked = steps.length;
  const issuesFound = summary.issues.length;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4" role="presentation">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="validation-progress-title"
        data-testid="validation-progress-modal"
        className="w-full max-w-md rounded-2xl border border-border bg-card shadow-xl"
      >
        <header className="border-b border-border px-5 py-4">
          <h2 id="validation-progress-title" className="text-lg font-semibold text-foreground">
            Running validation
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Validation is client-side and uses the current artifact state.
          </p>
        </header>
        <div className="space-y-4 px-5 py-4">
          <ol className="space-y-2">
            {steps.map((step, index) => (
              <li key={step} className="flex items-center gap-2 text-sm">
                <span
                  className={cn(
                    "flex size-5 items-center justify-center rounded-full border text-[10px]",
                    index <= stepIndex
                      ? "border-[#2563eb] bg-[#eff6ff] text-[#1d4ed8]"
                      : "border-border text-muted-foreground",
                  )}
                >
                  {index < stepIndex ? "✓" : index + 1}
                </span>
                <span className={index === stepIndex ? "font-semibold text-foreground" : "text-muted-foreground"}>
                  {step}
                </span>
              </li>
            ))}
          </ol>
          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            <div className="rounded-lg border border-border bg-muted/20 px-2 py-2">
              <p className="text-lg font-bold text-foreground">{rulesChecked}</p>
              <p className="uppercase tracking-wide text-muted-foreground">Rules checked</p>
            </div>
            <div className="rounded-lg border border-border bg-muted/20 px-2 py-2">
              <p className="text-lg font-bold text-foreground">{issuesFound}</p>
              <p className="uppercase tracking-wide text-muted-foreground">Issues found</p>
            </div>
          </div>
        </div>
        <footer className="flex justify-end border-t border-border px-5 py-3">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </footer>
      </div>
    </div>
  );
}
