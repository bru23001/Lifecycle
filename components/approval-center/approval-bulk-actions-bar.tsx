"use client";

import { CheckSquare } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ApprovalBulkActionsBar({
  count,
  onClear,
  onOpenBulkApprove,
  onOpenBulkRequestChanges,
  onOpenBulkReassign,
  onOpenBulkExport,
}: {
  count: number;
  onClear: () => void;
  onOpenBulkApprove: () => void;
  onOpenBulkRequestChanges: () => void;
  onOpenBulkReassign: () => void;
  onOpenBulkExport: () => void;
}) {
  if (count <= 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm dark:border-border dark:bg-card">
      <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-800 dark:text-foreground">
        <CheckSquare className="size-4 text-blue-600" aria-hidden />
        {count} selected
      </span>
      <div className="flex flex-1 flex-wrap justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onClear}>
          Clear
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={onOpenBulkApprove}>
          Bulk approve…
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={onOpenBulkRequestChanges}>
          Request changes…
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={onOpenBulkReassign}>
          Reassign…
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={onOpenBulkExport}>
          Export…
        </Button>
      </div>
    </div>
  );
}
