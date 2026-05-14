"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";

import {
  ApprovalHistoryEventDetailDialog,
  AuditEventDetailDialog,
  openAuditFromHistoryEvent,
} from "@/components/approval-center/approval-history-dialogs";
import { Button, buttonVariants } from "@/components/ui/button";
import { AuthenticatedAppShell } from "@/components/lifecycle-workspace/authenticated-app-shell";
import { Breadcrumbs } from "@/components/lifecycle-workspace/breadcrumbs";
import { TopHeader } from "@/components/lifecycle-workspace/top-header";
import { downloadJson } from "@/lib/download-json";
import { approvalAuditFromHistoryEvent } from "@/lib/approval-audit";
import { NOTIFICATIONS_HUB_HREF } from "@/lib/notifications-hub";
import { cn } from "@/lib/utils";
import type { ApprovalAuditRecord, ApprovalHistoryEvent, ApprovalPackage } from "@/types/approval-center.types";

const DECISION_TYPES = new Set<ApprovalHistoryEvent["eventType"]>(["approved", "rejected", "changes_requested"]);

function eventTypeLabel(t: ApprovalHistoryEvent["eventType"]) {
  return t.replaceAll("_", " ");
}

export function FullApprovalHistoryPage({
  approvalId,
  pkg,
  user,
  notificationCount,
}: {
  approvalId: string;
  pkg: ApprovalPackage;
  user: { name: string; role: string; initials: string };
  notificationCount: number;
}) {
  const [eventFilter, setEventFilter] = useState<string>("all");
  const [actorFilter, setActorFilter] = useState("");
  const [decisionOnly, setDecisionOnly] = useState(false);
  const [detailEvent, setDetailEvent] = useState<ApprovalHistoryEvent | null>(null);
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);
  const [auditRecord, setAuditRecord] = useState<ApprovalAuditRecord | null>(null);
  const [auditDrawerOpen, setAuditDrawerOpen] = useState(false);

  const actorNorm = actorFilter.trim().toLowerCase();

  const filteredHistory = useMemo(() => {
    return pkg.history.filter((ev) => {
      if (eventFilter !== "all" && ev.eventType !== eventFilter) return false;
      if (decisionOnly && !DECISION_TYPES.has(ev.eventType)) return false;
      if (actorNorm && !ev.actorName.toLowerCase().includes(actorNorm)) return false;
      return true;
    });
  }, [pkg.history, eventFilter, decisionOnly, actorNorm]);

  const eventTypeOptions = useMemo(() => {
    const uniq = new Set(pkg.history.map((e) => e.eventType));
    return ["all", ...[...uniq].sort()];
  }, [pkg.history]);

  const auditRecords = useMemo(() => pkg.history.map((ev) => approvalAuditFromHistoryEvent(ev)), [pkg.history]);

  const backHref = `/approvals/${approvalId}`;

  return (
    <AuthenticatedAppShell>
      <TopHeader
        title="Approval history"
        userInitials={user.initials}
        userName={user.name}
        userRole={user.role}
        notificationCount={notificationCount}
        notificationHref={NOTIFICATIONS_HUB_HREF}
      />
      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-auto bg-[var(--app-bg)]">
        <div className="mx-auto w-full max-w-[960px] px-5 py-6 min-[901px]:px-8">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/dashboard" },
              { label: "Approval Center", href: "/approvals" },
              { label: pkg.detail.approvalCode, href: backHref },
              { label: "History" },
            ]}
          />

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <Link
              href={backHref}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "inline-flex gap-2")}
            >
              <ArrowLeft className="size-4" aria-hidden />
              Back to approval
            </Link>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                downloadJson(`approval-history-${approvalId}.json`, {
                  exportedAt: new Date().toISOString(),
                  approvalId,
                  events: pkg.history,
                  comments: pkg.comments,
                  auditRecords,
                })
              }
            >
              Export history
            </Button>
          </div>

          <h1 className="mt-4 text-2xl font-semibold text-slate-900">Full approval history</h1>
          <p className="mt-1 text-sm text-slate-600">{pkg.detail.title}</p>

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-800">Filters</h2>
            <div className="mt-3 flex flex-wrap gap-3">
              <label className="flex flex-col gap-1 text-xs text-slate-600">
                Event type
                <select
                  className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm"
                  value={eventFilter}
                  onChange={(e) => setEventFilter(e.target.value)}
                >
                  {eventTypeOptions.map((v) => (
                    <option key={v} value={v}>
                      {v === "all" ? "All events" : eventTypeLabel(v as ApprovalHistoryEvent["eventType"])}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex min-w-[12rem] flex-col gap-1 text-xs text-slate-600">
                Actor contains
                <input
                  type="search"
                  value={actorFilter}
                  onChange={(e) => setActorFilter(e.target.value)}
                  placeholder="Name…"
                  className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm"
                />
              </label>
              <label className="flex items-end gap-2 pb-1 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={decisionOnly}
                  onChange={(e) => setDecisionOnly(e.target.checked)}
                  className="rounded border-slate-300"
                />
                Decision events only
              </label>
            </div>
          </section>

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-800">Timeline</h2>
            {filteredHistory.length === 0 ? (
              <p className="mt-3 text-sm text-slate-600">No events match the current filters.</p>
            ) : (
              <ul className="mt-3 space-y-2" aria-label="Filtered approval history">
                {filteredHistory.map((ev) => (
                  <li key={ev.id}>
                    <button
                      type="button"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-left text-sm transition hover:border-blue-200 hover:bg-blue-50/50"
                      onClick={() => {
                        setDetailEvent(ev);
                        setHistoryDrawerOpen(true);
                      }}
                    >
                      <p className="font-semibold text-slate-800">{ev.title}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {ev.actorName}
                        {ev.actorRole ? ` · ${ev.actorRole}` : ""} · {ev.timestampLabel}
                      </p>
                      <span className="mt-2 inline-block rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                        {eventTypeLabel(ev.eventType)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-800">Comments</h2>
            {pkg.comments.length === 0 ? (
              <p className="mt-3 text-sm text-slate-600">No approver comments on this package.</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {pkg.comments.map((c) => (
                  <li key={c.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm">
                    <p className="font-semibold text-slate-800">
                      {c.authorName} <span className="font-normal text-slate-500">({c.authorRole})</span>
                    </p>
                    <p className="text-xs text-slate-500">{c.createdOnLabel}</p>
                    <p className="mt-2 text-slate-700">{c.body}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-800">Related audit records</h2>
            <ul className="mt-3 divide-y divide-slate-100">
              {auditRecords.map((r) => (
                <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                  <span className="font-mono text-xs text-slate-700">{r.id}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="shrink-0 text-[#2563eb]"
                    onClick={() => {
                      setAuditRecord(r);
                      setAuditDrawerOpen(true);
                    }}
                  >
                    View
                  </Button>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>

      <ApprovalHistoryEventDetailDialog
        open={historyDrawerOpen}
        event={detailEvent}
        onClose={() => {
          setHistoryDrawerOpen(false);
          setDetailEvent(null);
        }}
        onOpenAudit={(ev) => {
          setAuditRecord(openAuditFromHistoryEvent(ev));
          setHistoryDrawerOpen(false);
          setDetailEvent(null);
          setAuditDrawerOpen(true);
        }}
      />
      <AuditEventDetailDialog
        open={auditDrawerOpen}
        record={auditRecord}
        onClose={() => {
          setAuditDrawerOpen(false);
          setAuditRecord(null);
        }}
      />
    </AuthenticatedAppShell>
  );
}
