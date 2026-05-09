import { cn } from "@/lib/utils";

export const gateReviewStatusBadgeMap = {
  draft: { label: "Draft", tone: "gray" as const },
  submitted: { label: "Submitted", tone: "blue" as const },
  pending_decision: { label: "Pending Decision", tone: "amber" as const },
  approved: { label: "Approved", tone: "green" as const },
  conditional: { label: "Conditional", tone: "purple" as const },
  changes_requested: { label: "Changes Requested", tone: "amber" as const },
  rejected: { label: "Rejected", tone: "red" as const },
};

export const inputStatusBadgeMap = {
  missing: { label: "Missing", tone: "red" as const },
  incomplete: { label: "Incomplete", tone: "amber" as const },
  complete: { label: "Complete", tone: "green" as const },
  needs_review: { label: "Needs Review", tone: "purple" as const },
};

export const approverStatusBadgeMap = {
  pending: { label: "Pending", tone: "gray" as const },
  in_review: { label: "In Review", tone: "blue" as const },
  reviewed: { label: "Reviewed", tone: "green" as const },
  approved: { label: "Approved", tone: "green" as const },
  rejected: { label: "Rejected", tone: "red" as const },
};

const toneClass: Record<
  "gray" | "blue" | "amber" | "green" | "red" | "purple",
  string
> = {
  gray: "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-200",
  blue: "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-100",
  amber:
    "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-50",
  green:
    "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-50",
  red: "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-50",
  purple:
    "border-violet-200 bg-violet-50 text-violet-900 dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-50",
};

export function StatusBadge({
  label,
  tone,
  className,
}: {
  label: string;
  tone: keyof typeof toneClass;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        toneClass[tone],
        className,
      )}
    >
      {label}
    </span>
  );
}
