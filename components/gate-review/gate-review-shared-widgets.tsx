import { Download, Eye, FileSpreadsheet, FileText } from "lucide-react";

import type {
  DecisionCriterion,
  GateApprover,
  GateEvidenceItem,
  RequiredGateInput,
} from "@/types/gate-review.types";

import { cn } from "@/lib/utils";

export function GateCountBadge({ count }: { count: number }) {
  return (
    <span className="inline-flex h-8 min-w-10 items-center justify-center rounded-full bg-blue-50 px-3 text-sm font-semibold text-blue-600 dark:bg-blue-950/50 dark:text-blue-300">
      {count}
    </span>
  );
}

const requiredStatusPill: Record<
  RequiredGateInput["status"],
  { label: string; className: string }
> = {
  complete: {
    label: "Complete",
    className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  },
  missing: {
    label: "Missing",
    className: "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300",
  },
  incomplete: {
    label: "Incomplete",
    className: "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200",
  },
  needs_review: {
    label: "Needs Review",
    className: "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300",
  },
};

export function RequiredInputStatusPill({ status }: { status: RequiredGateInput["status"] }) {
  const cfg = requiredStatusPill[status];
  return (
    <span
      className={cn(
        "inline-flex min-w-[100px] justify-center rounded-full px-4 py-2 text-sm font-semibold",
        cfg.className,
      )}
    >
      {cfg.label}
    </span>
  );
}

export type EvidenceTone = "red" | "green" | "blue";

const toneClasses: Record<EvidenceTone, string> = {
  red: "text-red-500 dark:text-red-400",
  green: "text-emerald-600 dark:text-emerald-400",
  blue: "text-blue-600 dark:text-blue-400",
};

export function evidenceTypeLabel(t: GateEvidenceItem["type"]): "PDF" | "Excel" | "Word" | "Image" | "Link" | "JSON" {
  switch (t) {
    case "pdf":
      return "PDF";
    case "spreadsheet":
      return "Excel";
    case "document":
      return "Word";
    case "image":
      return "Image";
    case "link":
      return "Link";
    case "json":
      return "JSON";
  }
}

export function EvidenceFileIcon({
  type,
  tone,
}: {
  type: GateEvidenceItem["type"];
  tone: EvidenceTone;
}) {
  const iconClassName = cn("h-6 w-6 stroke-[2.2]", toneClasses[tone]);
  if (type === "spreadsheet") {
    return <FileSpreadsheet className={iconClassName} aria-hidden />;
  }
  return <FileText className={iconClassName} aria-hidden />;
}

export function evidenceToneForIndex(index: number): EvidenceTone {
  const tones: EvidenceTone[] = ["red", "green", "blue"];
  return tones[index % 3]!;
}

/** Split "May 12, 2024 10:10 AM" into two lines like the reference layout */
export function formatEvidenceAddedOn(label: string): string {
  if (label.includes("\n")) return label;
  const m = label.match(/^(.+?\d{4})\s+(.+)$/);
  return m ? `${m[1]}\n${m[2]}` : label;
}

export function CriterionAssessmentBadge({ assessment }: { assessment: DecisionCriterion["assessment"] }) {
  const styles: Record<DecisionCriterion["assessment"], string> = {
    meets: "border-emerald-100 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300",
    partially_meets:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300",
    does_not_meet:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300",
    not_reviewed:
      "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300",
  };
  const labels: Record<DecisionCriterion["assessment"], string> = {
    meets: "Meets",
    partially_meets: "Partially Meets",
    does_not_meet: "Does Not Meet",
    not_reviewed: "Not Reviewed",
  };
  return (
    <span
      className={cn(
        "inline-flex min-w-[72px] justify-center rounded-md border px-3 py-1.5 text-sm font-semibold",
        styles[assessment],
      )}
    >
      {labels[assessment]}
    </span>
  );
}

const approverBadgeConfig: Record<
  GateApprover["status"],
  { label: string; className: string }
> = {
  reviewed: {
    label: "Reviewed",
    className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  },
  in_review: {
    label: "In Review",
    className: "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300",
  },
  pending: {
    label: "Pending",
    className: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  },
  approved: {
    label: "Approved",
    className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300",
  },
};

export function ApproverWorkflowBadge({ status }: { status: GateApprover["status"] }) {
  const cfg = approverBadgeConfig[status];
  return (
    <span
      className={cn(
        "inline-flex min-w-[90px] justify-center rounded-lg px-3 py-2 text-sm font-semibold",
        cfg.className,
      )}
    >
      {cfg.label}
    </span>
  );
}

export function EvidencePreviewDownloadActions({
  name,
  onPreview,
  downloadHref,
}: {
  name: string;
  onPreview: () => void;
  downloadHref: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        aria-label={`View evidence ${name}`}
        onClick={onPreview}
        className="inline-flex h-10 w-14 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 dark:border-border dark:bg-card dark:text-foreground dark:hover:bg-muted/60"
      >
        <Eye className="h-5 w-5 stroke-[2.2]" aria-hidden />
      </button>

      <a
        href={downloadHref}
        download
        aria-label={`Download evidence ${name}`}
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-50 dark:text-foreground dark:hover:bg-muted/60"
      >
        <Download className="h-5 w-5 stroke-[2.2]" aria-hidden />
      </a>
    </div>
  );
}
