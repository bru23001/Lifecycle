"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, X } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ShareEvidenceModal({
  open,
  projectId,
  evidenceId,
  evidenceCode,
  evidenceName,
  onClose,
}: {
  open: boolean;
  projectId: string;
  evidenceId: string;
  evidenceCode: string;
  evidenceName: string;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [copied, setCopied] = useState(false);
  const [access, setAccess] = useState<"project_members" | "link_viewers">("project_members");
  const [expiration, setExpiration] = useState("");
  const [notify, setNotify] = useState(false);

  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;
    if (open) {
      if (!node.open) node.showModal();
      setCopied(false);
    } else if (node.open) {
      node.close();
    }
  }, [open]);

  const shareUrl =
    typeof window !== "undefined" ?
      `${window.location.origin}/projects/${projectId}/evidence/${evidenceId}`
    : `/projects/${projectId}/evidence/${evidenceId}`;

  const copyLink = () => {
    void navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    });
  };

  const save = () => {
    onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="fixed left-1/2 top-1/2 z-50 w-[min(100vw-2rem,480px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-0 shadow-xl backdrop:bg-slate-900/40 dark:border-border dark:bg-card"
      aria-labelledby="share-evidence-title"
    >
      <div className="flex flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-border">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Evidence</p>
            <h2 id="share-evidence-title" className="mt-1 text-lg font-semibold text-slate-900 dark:text-foreground">
              Share evidence
            </h2>
            <p className="mt-0.5 truncate text-xs text-slate-500" title={evidenceName}>
              {evidenceCode} · {evidenceName}
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-slate-500 hover:bg-slate-100" aria-label="Close">
            <X className="size-5" aria-hidden />
          </button>
        </header>

        <div className="space-y-4 px-5 py-4 text-sm">
          <div>
            <span className="text-xs font-semibold text-slate-600">Shareable link</span>
            <div className="mt-1 flex gap-2">
              <input
                readOnly
                className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800"
                value={shareUrl}
                aria-label="Shareable URL"
              />
              <Button type="button" variant="outline" size="sm" className="shrink-0 gap-1" onClick={copyLink}>
                {copied ? <Check className="size-4 text-emerald-600" aria-hidden /> : <Copy className="size-4" aria-hidden />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Recipients must be signed in and authorized for this project. Fine-grained sharing controls ship with
              the access platform.
            </p>
          </div>

          <label className="block">
            <span className="text-xs font-semibold text-slate-600">Access level</span>
            <select
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={access}
              onChange={(e) => setAccess(e.target.value as typeof access)}
            >
              <option value="project_members">Project members (RBAC)</option>
              <option value="link_viewers">Anyone with link (preview only)</option>
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-slate-600">Expiration date (optional)</span>
            <input
              type="date"
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={expiration}
              onChange={(e) => setExpiration(e.target.value)}
            />
          </label>

          <label className="flex cursor-pointer items-center gap-2">
            <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} className="size-4 rounded border-slate-300" />
            <span className="text-sm text-slate-700">Notify users when sharing is updated</span>
          </label>
        </div>

        <footer className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4 dark:border-border">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" className="bg-[#2563eb] hover:bg-[#1d4ed8]" onClick={save}>
            Save sharing settings
          </Button>
        </footer>
      </div>
    </dialog>
  );
}
