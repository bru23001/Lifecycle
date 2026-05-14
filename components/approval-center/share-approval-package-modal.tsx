"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, X } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ShareApprovalPackageModal({
  open,
  approvalId,
  packageTitle,
  onClose,
}: {
  open: boolean;
  approvalId: string;
  packageTitle: string;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const prevOpen = useRef(false);
  const [copied, setCopied] = useState(false);
  const [recipientQuery, setRecipientQuery] = useState("");
  const [permission, setPermission] = useState("view");
  const [expiresInDays, setExpiresInDays] = useState("7");
  const [includeAttachments, setIncludeAttachments] = useState(true);

  const sharePath = `/approvals/${approvalId}`;
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") setOrigin(window.location.origin);
  }, []);

  const shareUrl = origin ? `${origin}${sharePath}` : sharePath;

  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;
    if (open) {
      if (!prevOpen.current) {
        setCopied(false);
        setRecipientQuery("");
        setPermission("view");
        setExpiresInDays("7");
        setIncludeAttachments(true);
      }
      if (!node.open) node.showModal();
    } else if (node.open) {
      node.close();
    }
    prevOpen.current = open;
  }, [open]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="w-[min(100vw-2rem,440px)] rounded-2xl border border-slate-200 bg-white p-0 shadow-xl backdrop:bg-slate-900/40 dark:border-border dark:bg-card"
      aria-labelledby="share-approval-package-title"
    >
      <div className="flex max-h-[90vh] flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-border">
          <div className="min-w-0">
            <h2 id="share-approval-package-title" className="text-lg font-semibold text-slate-900 dark:text-foreground">
              Share approval package
            </h2>
            <p className="mt-1 truncate text-sm text-slate-600" title={packageTitle}>
              {packageTitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-muted"
            aria-label="Close"
          >
            <X className="size-5" aria-hidden />
          </button>
        </header>

        <div className="space-y-4 overflow-y-auto px-5 py-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Share link</label>
            <div className="mt-1 flex gap-2">
              <input
                readOnly
                value={shareUrl}
                className="min-w-0 flex-1 truncate rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800"
                aria-label="Share link URL"
              />
              <Button type="button" variant="outline" size="sm" className="shrink-0 gap-1" onClick={() => void copyLink()}>
                {copied ? <Check className="size-4 text-emerald-600" aria-hidden /> : <Copy className="size-4" aria-hidden />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          </div>

          <div>
            <label htmlFor="share-recipient-search" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Recipient search
            </label>
            <input
              id="share-recipient-search"
              type="search"
              value={recipientQuery}
              onChange={(e) => setRecipientQuery(e.target.value)}
              placeholder="Search directory…"
              className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <p className="mt-1 text-[11px] text-slate-500">Directory search is not wired in local mode; capture intent only.</p>
          </div>

          <div>
            <label htmlFor="share-permission" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Permission level
            </label>
            <select
              id="share-permission"
              value={permission}
              onChange={(e) => setPermission(e.target.value)}
              className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm"
            >
              <option value="view">View only</option>
              <option value="comment">View + comment</option>
              <option value="decide">Full reviewer</option>
            </select>
          </div>

          <div>
            <label htmlFor="share-expires" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Expiration
            </label>
            <select
              id="share-expires"
              value={expiresInDays}
              onChange={(e) => setExpiresInDays(e.target.value)}
              className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm"
            >
              <option value="1">1 day</option>
              <option value="7">7 days</option>
              <option value="30">30 days</option>
              <option value="0">No expiry</option>
            </select>
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-800">
            <input
              type="checkbox"
              checked={includeAttachments}
              onChange={(e) => setIncludeAttachments(e.target.checked)}
              className="size-4 rounded border-slate-300"
            />
            Include attachments in shared view
          </label>
        </div>

        <footer className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4 dark:border-border">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-[#2563eb] hover:bg-[#1d4ed8]"
            disabled
            title="Send requires server-side share service"
          >
            Send
          </Button>
        </footer>
      </div>
    </dialog>
  );
}
