"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { downloadJson } from "@/lib/download-json";
import { searchApproverDirectory, type ApproverDirectoryEntry } from "@/lib/approval-approver-directory";
import { cn } from "@/lib/utils";
import type { ApprovalPackage, PendingApproval } from "@/types/approval-center.types";

function useModalOpen(open: boolean, onReset?: () => void) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const prevOpen = useRef(false);
  const resetRef = useRef(onReset);
  resetRef.current = onReset;

  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;
    if (open) {
      if (!prevOpen.current) resetRef.current?.();
      if (!node.open) node.showModal();
    } else if (node.open) {
      node.close();
    }
    prevOpen.current = open;
  }, [open]);

  return dialogRef;
}

const dialogFrame =
  "w-[min(100vw-2rem,560px)] rounded-2xl border border-slate-200 bg-white p-0 shadow-xl backdrop:bg-slate-900/40 dark:border-border dark:bg-card";

type BulkExportRow = {
  approvalId: string;
  code: string;
  title: string;
  type: PendingApproval["approvalType"];
  project: string;
  comments?: ApprovalPackage["comments"];
  evidenceItemCount?: number;
  decisionDraft?: ApprovalPackage["decisionDraft"];
};

function csvCell(value: unknown): string {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

function triggerDownload(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  a.click();
  URL.revokeObjectURL(url);
}

export function BulkApproveModal({
  open,
  onClose,
  eligible,
  skipped,
  isSubmitting,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  eligible: PendingApproval[];
  skipped: { row: PendingApproval; reason: string }[];
  isSubmitting: boolean;
  onConfirm: (sharedComment: string) => void | Promise<void>;
}) {
  const [comment, setComment] = useState("");
  const dialogRef = useModalOpen(open, () => setComment(""));

  return (
    <dialog ref={dialogRef} onClose={onClose} className={dialogFrame} aria-labelledby="bulk-approve-title">
      <div className="flex max-h-[90vh] flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <h2 id="bulk-approve-title" className="text-lg font-semibold text-slate-900 dark:text-foreground">
              Bulk approve
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {eligible.length} approval{eligible.length === 1 ? "" : "s"} can be approved from here. Gate reviews are excluded.
            </p>
          </div>
          <Button type="button" variant="outline" size="icon-sm" aria-label="Close" onClick={onClose}>
            <X className="size-4" aria-hidden />
          </Button>
        </header>
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4 text-sm">
          {skipped.length > 0 ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-950">
              <p className="text-xs font-semibold uppercase tracking-wide">Exceptions / skipped ({skipped.length})</p>
              <ul className="mt-2 max-h-28 list-inside list-disc space-y-1 text-xs">
                {skipped.map(({ row, reason }) => (
                  <li key={row.id}>
                    <span className="font-medium">{row.approvalCode}</span> — {reason}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Eligible ({eligible.length})</p>
            <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto rounded-lg border border-slate-100 p-2 dark:border-border">
              {eligible.map((row) => (
                <li key={row.id} className="truncate text-xs text-slate-800">
                  {row.approvalCode} · {row.title} · {row.projectName}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="bulk-approve-comment">
              Shared comment (optional)
            </label>
            <textarea
              id="bulk-approve-comment"
              rows={3}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 dark:border-border dark:bg-background"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Recorded on each approval decision."
            />
          </div>
        </div>
        <footer className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="button" onClick={() => void onConfirm(comment)} disabled={eligible.length === 0 || isSubmitting}>
            {isSubmitting ? "Working…" : "Confirm bulk approval"}
          </Button>
        </footer>
      </div>
    </dialog>
  );
}

export function BulkRequestChangesModal({
  open,
  onClose,
  eligible,
  skipped,
  isSubmitting,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  eligible: PendingApproval[];
  skipped: { row: PendingApproval; reason: string }[];
  isSubmitting: boolean;
  onConfirm: (sharedMessage: string, applySameToAll: boolean, perNotes: Record<string, string>) => void | Promise<void>;
}) {
  const [message, setMessage] = useState("");
  const [applySame, setApplySame] = useState(true);
  const [perNotes, setPerNotes] = useState<Record<string, string>>({});
  const dialogRef = useModalOpen(open, () => {
    setMessage("");
    setApplySame(true);
    setPerNotes({});
  });

  const canSubmit = message.trim().length > 0 && eligible.length > 0;

  return (
    <dialog ref={dialogRef} onClose={onClose} className={dialogFrame} aria-labelledby="bulk-rc-title">
      <div className="flex max-h-[90vh] flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <h2 id="bulk-rc-title" className="text-lg font-semibold text-slate-900 dark:text-foreground">
              Bulk request changes
            </h2>
            <p className="mt-1 text-sm text-slate-600">Applies to {eligible.length} artifact approval(s). Gate reviews are skipped.</p>
          </div>
          <Button type="button" variant="outline" size="icon-sm" aria-label="Close" onClick={onClose}>
            <X className="size-4" aria-hidden />
          </Button>
        </header>
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4 text-sm">
          {skipped.length > 0 ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950">
              <p className="font-semibold uppercase tracking-wide">Skipped ({skipped.length})</p>
              <ul className="mt-2 max-h-24 list-inside list-disc space-y-1 overflow-y-auto">
                {skipped.map(({ row, reason }) => (
                  <li key={row.id}>
                    {row.approvalCode} — {reason}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="bulk-rc-msg">
              Shared change request <span className="text-red-600">*</span>
            </label>
            <textarea
              id="bulk-rc-msg"
              rows={4}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 dark:border-border dark:bg-background"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe the changes reviewers need."
            />
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" className="size-4 rounded border-slate-300" checked={applySame} onChange={(e) => setApplySame(e.target.checked)} />
            Apply the same primary message to each approval (local workflow)
          </label>
          {!applySame && eligible.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase text-slate-500">Per-approval notes</p>
              {eligible.map((row) => (
                <div key={row.id}>
                  <label className="text-[11px] text-slate-600" htmlFor={`note-${row.id}`}>
                    {row.approvalCode}
                  </label>
                  <input
                    id={`note-${row.id}`}
                    className="mt-0.5 w-full rounded border border-slate-200 px-2 py-1 text-xs dark:border-border dark:bg-background"
                    value={perNotes[row.id] ?? ""}
                    onChange={(e) => setPerNotes((p) => ({ ...p, [row.id]: e.target.value }))}
                    placeholder="Optional extra line for this item"
                  />
                </div>
              ))}
            </div>
          ) : null}
        </div>
        <footer className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="button" onClick={() => void onConfirm(message, applySame, perNotes)} disabled={!canSubmit || isSubmitting}>
            {isSubmitting ? "Working…" : "Request changes"}
          </Button>
        </footer>
      </div>
    </dialog>
  );
}

export function BulkReassignModal({
  open,
  onClose,
  count,
  isSubmitting,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  count: number;
  isSubmitting: boolean;
  onConfirm: (approver: ApproverDirectoryEntry, reason: string, notify: boolean) => void | Promise<void>;
}) {
  const [search, setSearch] = useState("");
  const [pick, setPick] = useState<ApproverDirectoryEntry | null>(null);
  const [reason, setReason] = useState("");
  const [notify, setNotify] = useState(true);
  const dialogRef = useModalOpen(open, () => {
    setSearch("");
    setPick(null);
    setReason("");
    setNotify(true);
  });
  const results = searchApproverDirectory(search);

  return (
    <dialog ref={dialogRef} onClose={onClose} className={dialogFrame} aria-labelledby="bulk-re-title">
      <div className="flex max-h-[90vh] flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <h2 id="bulk-re-title" className="text-lg font-semibold text-slate-900 dark:text-foreground">
              Bulk reassign
            </h2>
            <p className="mt-1 text-sm text-slate-600">{count} selected approval(s). Updates roster locally until an API exists.</p>
          </div>
          <Button type="button" variant="outline" size="icon-sm" aria-label="Close" onClick={onClose}>
            <X className="size-4" aria-hidden />
          </Button>
        </header>
        <div className="space-y-4 overflow-y-auto px-5 py-4 text-sm">
          <div>
            <label className="text-xs font-semibold uppercase text-slate-500">New approver</label>
            <input
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 dark:border-border dark:bg-background"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search directory"
            />
            <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto rounded-lg border border-slate-100 dark:border-border">
              {results.map((row) => (
                <li key={row.id}>
                  <button
                    type="button"
                    onClick={() => setPick(row)}
                    className={cn(
                      "flex w-full flex-col items-start px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-muted",
                      pick?.id === row.id && "bg-blue-50 dark:bg-blue-950/30",
                    )}
                  >
                    <span className="font-medium">{row.name}</span>
                    <span className="text-xs text-slate-600">{row.role}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase text-slate-500" htmlFor="bulk-reason">
              Reassignment reason
            </label>
            <textarea
              id="bulk-reason"
              rows={3}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 dark:border-border dark:bg-background"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          <label className="flex cursor-pointer items-center gap-2">
            <input type="checkbox" className="size-4 rounded border-slate-300" checked={notify} onChange={(e) => setNotify(e.target.checked)} />
            Notify users (simulated)
          </label>
        </div>
        <footer className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="button" onClick={() => pick && void onConfirm(pick, reason, notify)} disabled={!pick || isSubmitting}>
            {isSubmitting ? "Working…" : "Reassign selected"}
          </Button>
        </footer>
      </div>
    </dialog>
  );
}

export function BulkExportModal({
  open,
  onClose,
  selectedIds,
  packages,
  onExportComplete,
}: {
  open: boolean;
  onClose: () => void;
  selectedIds: string[];
  packages: Record<string, ApprovalPackage>;
  onExportComplete?: () => void;
}) {
  const [includeComments, setIncludeComments] = useState(true);
  const [includeEvidence, setIncludeEvidence] = useState(true);
  const [includeDecisions, setIncludeDecisions] = useState(true);
  const [format, setFormat] = useState<"json" | "csv">("json");
  const dialogRef = useModalOpen(open, () => {
    setIncludeComments(true);
    setIncludeEvidence(true);
    setIncludeDecisions(true);
    setFormat("json");
  });

  const exportNow = () => {
    const rows: BulkExportRow[] = [];
    for (const id of selectedIds) {
      const p = packages[id];
      if (!p) continue;
      rows.push({
        approvalId: id,
        code: p.detail.approvalCode,
        title: p.detail.title,
        type: p.detail.approvalType,
        project: p.detail.projectName,
        ...(includeComments ? { comments: p.comments } : {}),
        ...(includeEvidence ? { evidenceItemCount: p.detail.evidenceItemsCount } : {}),
        ...(includeDecisions ? { decisionDraft: p.decisionDraft } : {}),
      });
    }

    if (format === "csv") {
      const csv = [
        ["approvalId", "code", "title", "type", "project", "comments", "evidenceItemCount", "decisionDraft"],
        ...rows.map((row) => [
          row.approvalId,
          row.code,
          row.title,
          row.type,
          row.project,
          includeComments ? JSON.stringify(row.comments ?? []) : "",
          includeEvidence ? String(row.evidenceItemCount ?? "") : "",
          includeDecisions ? JSON.stringify(row.decisionDraft ?? null) : "",
        ]),
      ]
        .map((line) => line.map(csvCell).join(","))
        .join("\n");
      triggerDownload("bulk-approvals-export.csv", csv, "text/csv;charset=utf-8");
      onExportComplete?.();
      onClose();
      return;
    }

    const payload = {
      schema: "cybercube.bulk_approval_export@v1",
      format,
      generatedAt: new Date().toISOString(),
      count: rows.length,
      rows,
    };
    downloadJson("bulk-approvals-export.json", payload);
    onExportComplete?.();
    onClose();
  };

  return (
    <dialog ref={dialogRef} onClose={onClose} className={dialogFrame} aria-labelledby="bulk-ex-title">
      <div className="flex max-h-[90vh] flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <h2 id="bulk-ex-title" className="text-lg font-semibold text-slate-900 dark:text-foreground">
              Bulk export
            </h2>
            <p className="mt-1 text-sm text-slate-600">{selectedIds.length} package(s) selected. JSON manifest for now.</p>
          </div>
          <Button type="button" variant="outline" size="icon-sm" aria-label="Close" onClick={onClose}>
            <X className="size-4" aria-hidden />
          </Button>
        </header>
        <div className="space-y-4 px-5 py-4 text-sm">
          <fieldset className="space-y-2">
            <legend className="text-xs font-semibold uppercase text-slate-500">Include</legend>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="size-4" checked={includeComments} onChange={(e) => setIncludeComments(e.target.checked)} />
              Comments
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="size-4" checked={includeEvidence} onChange={(e) => setIncludeEvidence(e.target.checked)} />
              Evidence summary (counts)
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="size-4" checked={includeDecisions} onChange={(e) => setIncludeDecisions(e.target.checked)} />
              Decision drafts / records
            </label>
          </fieldset>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">Format</p>
            <div className="mt-2 flex gap-2">
              {(["json", "csv"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFormat(f)}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-sm font-medium",
                    format === f ? "border-blue-300 bg-blue-50 text-blue-900" : "border-slate-200 bg-white",
                  )}
                >
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-500">CSV exports a flat snapshot; nested fields are JSON-encoded cells.</p>
          </div>
        </div>
        <footer className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={exportNow} disabled={selectedIds.length === 0}>
            Export
          </Button>
        </footer>
      </div>
    </dialog>
  );
}
