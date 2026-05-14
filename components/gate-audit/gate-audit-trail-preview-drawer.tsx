"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { X } from "lucide-react";

import { fetchGateAuditTrailForDrawer } from "@/app/actions/fetchGateAuditTrailForDrawer";
import { GateAuditTrailPanel } from "@/components/gate-audit/gate-audit-trail-panel";
import type { GateAuditTrailViewData } from "@/types/gate-audit.types";
import { projectGateAuditTrailHref } from "@/lib/projects-url";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toUserMessage } from "@/lib/toUserMessage";

export function GateAuditTrailPreviewDrawer({
  open,
  onClose,
  projectId,
  gateCode,
  gateRouteId,
}: {
  open: boolean;
  onClose: () => void;
  projectId: string;
  gateCode: string;
  /** Lowercase gate segment for `/gates/[gateId]/review` URLs. */
  gateRouteId: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<GateAuditTrailViewData | null>(null);
  const [eventDetailOpen, setEventDetailOpen] = useState(false);

  const reviewHref = `/projects/${projectId}/gates/${gateRouteId}/review`;
  const fullPageHref = projectGateAuditTrailHref(projectId, gateCode);

  const load = useCallback(() => {
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetchGateAuditTrailForDrawer({ projectId, gateCode });
        if (!res.ok) {
          setData(null);
          setError(res.error);
          return;
        }
        setData(res.data);
      } catch (e) {
        setData(null);
        setError(toUserMessage(e));
      }
    });
  }, [projectId, gateCode]);

  useEffect(() => {
    if (!open) {
      setData(null);
      setError(null);
      setEventDetailOpen(false);
      return;
    }
    load();
  }, [open, load]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      if (eventDetailOpen) return;
      onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, eventDetailOpen]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex justify-end"
      role="presentation"
      data-testid="gate-audit-trail-preview-drawer"
    >
      <button
        type="button"
        data-testid="gate-audit-trail-preview-drawer-backdrop"
        className="absolute inset-0 bg-black/40"
        aria-label="Close preview"
        onClick={onClose}
      />
      <div className="relative flex h-full w-full max-w-[min(100vw-0.5rem,40rem)] flex-col border-l border-slate-200 bg-[var(--app-bg)] shadow-2xl dark:border-border">
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-border">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Gate review</p>
            <h2 className="text-base font-semibold text-foreground">Audit trail preview</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {gateCode} · lazy-loaded; same data as the full audit page.
            </p>
          </div>
          <button
            type="button"
            data-testid="gate-audit-trail-preview-drawer-close-header"
            className="rounded-md p-2 text-muted-foreground hover:bg-muted"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {pending && !data ? (
            <p
              className="text-sm text-muted-foreground"
              role="status"
              data-testid="gate-audit-trail-preview-drawer-loading"
            >
              Loading audit events…
            </p>
          ) : null}
          {error ? (
            <div
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-100"
              role="alert"
            >
              {error}
            </div>
          ) : null}
          {data ? (
            <GateAuditTrailPanel
              data={data}
              reviewHref={reviewHref}
              variant="drawer"
              onEventDetailOpenChange={setEventDetailOpen}
            />
          ) : null}
        </div>

        <footer className="flex shrink-0 flex-col gap-2 border-t border-border px-5 py-3">
          <Link
            data-testid="gate-audit-trail-preview-drawer-open-full"
            href={fullPageHref}
            className={cn(buttonVariants({ variant: "default" }), "w-full justify-center")}
            onClick={onClose}
          >
            Open full audit page
          </Link>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            data-testid="gate-audit-trail-preview-drawer-close-footer"
            onClick={onClose}
          >
            Close
          </Button>
        </footer>
      </div>
    </div>
  );
}
