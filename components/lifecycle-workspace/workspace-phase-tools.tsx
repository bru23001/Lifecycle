"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition, type ReactNode } from "react";
import { BookOpen, ClipboardList, History, Pencil, X } from "lucide-react";

import { updateWorkspacePhaseDetails } from "@/app/actions/updateWorkspacePhaseDetails";
import { Button } from "@/components/ui/button";
import type {
  EditablePhaseDetailValues,
  PhaseActivityRow,
  WorkspacePhaseActionsPayload,
} from "@/components/lifecycle-workspace/workspace-phase-tools-types";
import type { PhaseGuidePayload } from "@/lib/workspacePhaseGuide";
import { toUserMessage } from "@/lib/toUserMessage";
import { cn } from "@/lib/utils";
import { useWorkspaceUnsavedGuard } from "@/components/lifecycle-workspace/workspace-unsaved-context";

function SideDrawer({
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

function GuideContent({ guide }: { guide: PhaseGuidePayload }) {
  return (
    <div className="space-y-5 text-[13px] leading-relaxed">
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Phase purpose</h3>
        <p className="mt-1 text-foreground/90">{guide.purpose}</p>
      </section>
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Entry criteria</h3>
        <ul className="mt-1 list-inside list-disc space-y-1 text-foreground/90">
          {guide.entryCriteria.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      </section>
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Required outputs</h3>
        <ul className="mt-1 list-inside list-disc space-y-1 text-foreground/90">
          {guide.requiredOutputs.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      </section>
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Completion rules</h3>
        <ul className="mt-1 list-inside list-disc space-y-1 text-foreground/90">
          {guide.completionRules.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      </section>
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Gate relationship</h3>
        <p className="mt-1 text-foreground/90">{guide.gateRelationship}</p>
      </section>
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Evidence requirements</h3>
        <p className="mt-1 text-foreground/90">{guide.evidenceRequirements}</p>
      </section>
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Common mistakes</h3>
        <ul className="mt-1 list-inside list-disc space-y-1 text-foreground/90">
          {guide.commonMistakes.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      </section>
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Related templates</h3>
        <ul className="mt-1 space-y-1 font-mono text-[12px] text-foreground/90">
          {guide.relatedTemplates.map((t) => (
            <li key={t.id}>
              {t.id} — {t.title}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function ActivityContent({ rows }: { rows: PhaseActivityRow[] }) {
  if (rows.length === 0) {
    return <p className="text-muted-foreground">No activity recorded for this project yet.</p>;
  }
  return (
    <ol className="space-y-4">
      {rows.map((row) => (
        <li
          key={row.id}
          className="rounded-lg border border-border bg-card/80 px-3 py-2 text-[12px]"
          data-testid="phase-activity-row"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-medium text-foreground">{row.actor}</span>
            <time className="text-muted-foreground">{row.timestampLabel}</time>
          </div>
          <p className="mt-1 font-medium text-foreground/90">{row.changedObject}</p>
          <dl className="mt-2 grid gap-1 text-muted-foreground">
            <div>
              <dt className="inline font-medium text-foreground/80">Before:</dt>{" "}
              <dd className="inline">{row.beforeLabel}</dd>
            </div>
            <div>
              <dt className="inline font-medium text-foreground/80">After:</dt>{" "}
              <dd className="inline">{row.afterLabel}</dd>
            </div>
            <div>
              <dt className="inline font-medium text-foreground/80">Comments:</dt>{" "}
              <dd className="inline">{row.comment}</dd>
            </div>
            <div>
              <dt className="inline font-medium text-foreground/80">Audit ref:</dt>{" "}
              <dd className="inline font-mono text-[11px]">{row.auditRef}</dd>
            </div>
          </dl>
        </li>
      ))}
    </ol>
  );
}

function parseContributors(raw: string): string[] {
  return raw
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 50);
}

export function WorkspacePhaseTools({ payload }: { payload: WorkspacePhaseActionsPayload }) {
  const [editOpen, setEditOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [activityOpen, setActivityOpen] = useState(false);
  const serverSnapshot = useMemo(() => JSON.stringify(payload.initialEditable), [payload.initialEditable]);
  const [baseline, setBaseline] = useState<EditablePhaseDetailValues>(payload.initialEditable);
  const [form, setForm] = useState<EditablePhaseDetailValues>(payload.initialEditable);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const { setUnsaved, guardNavigation } = useWorkspaceUnsavedGuard();

  useEffect(() => {
    const next = JSON.parse(serverSnapshot) as EditablePhaseDetailValues;
    setBaseline(next);
    setForm(next);
    setError(null);
  }, [payload.projectRecordId, payload.phaseNumber, serverSnapshot]);

  const dirty = JSON.stringify(form) !== JSON.stringify(baseline);
  useEffect(() => {
    setUnsaved(dirty);
  }, [dirty, setUnsaved]);

  function requestCloseEdit() {
    guardNavigation(() => {
      setForm(baseline);
      setEditOpen(false);
      setError(null);
    });
  }

  function save() {
    setError(null);
    startTransition(async () => {
      try {
        const res = await updateWorkspacePhaseDetails({
          projectId: payload.projectRecordId,
          phaseNumber: payload.phaseNumber,
          ownerName: form.ownerName,
          targetCompletionIso: form.targetCompletionIso || null,
          phaseNotes: form.phaseNotes,
          priority: form.priority,
          riskLevel: form.riskLevel,
          internalStatus: form.internalStatus,
          contributorNames: parseContributors(form.contributorNames),
        });
        if (!res.ok) {
          setError(res.error);
          return;
        }
        setBaseline(form);
        setEditOpen(false);
        router.refresh();
      } catch (e) {
        setError(toUserMessage(e));
      }
    });
  }

  const btn =
    "inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-background px-2.5 text-xs font-medium text-foreground hover:bg-muted";

  return (
    <div className="workspace-phase-tools border-t border-border px-4 py-3">
      <div className="flex flex-wrap gap-2">
        <button type="button" className={cn(btn)} data-testid="edit-phase-details" onClick={() => setEditOpen(true)}>
          <Pencil className="size-3.5" aria-hidden />
          Edit phase details
        </button>
        <button type="button" className={cn(btn)} data-testid="view-phase-guide" onClick={() => setGuideOpen(true)}>
          <BookOpen className="size-3.5" aria-hidden />
          View phase guide
        </button>
        <Link href={payload.packageHref} className={cn(btn, "no-underline")} data-testid="view-full-phase-package">
          <ClipboardList className="size-3.5" aria-hidden />
          View full phase package
        </Link>
        <button type="button" className={cn(btn)} data-testid="phase-activity" onClick={() => setActivityOpen(true)}>
          <History className="size-3.5" aria-hidden />
          Phase activity
        </button>
      </div>

      <SideDrawer
        open={editOpen}
        title="Edit phase details"
        onClose={requestCloseEdit}
        testId="edit-phase-details-drawer"
        footer={
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={requestCloseEdit} disabled={pending}>
              Cancel
            </Button>
            <Button type="button" size="sm" onClick={save} disabled={pending}>
              {pending ? "Saving…" : "Save"}
            </Button>
          </div>
        }
      >
        {error ? (
          <p className="mb-3 rounded-md border border-rose-200 bg-rose-50 px-2 py-1.5 text-[12px] text-rose-900" role="alert">
            {error}
          </p>
        ) : null}
        <div className="space-y-3">
          <label className="block space-y-1">
            <span className="text-xs font-medium text-muted-foreground">Phase owner</span>
            <input
              className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
              value={form.ownerName}
              onChange={(e) => setForm((f) => ({ ...f, ownerName: e.target.value }))}
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-medium text-muted-foreground">Target completion date</span>
            <input
              type="date"
              className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
              value={form.targetCompletionIso}
              onChange={(e) => setForm((f) => ({ ...f, targetCompletionIso: e.target.value }))}
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-medium text-muted-foreground">Phase notes</span>
            <textarea
              className="min-h-[88px] w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
              value={form.phaseNotes}
              onChange={(e) => setForm((f) => ({ ...f, phaseNotes: e.target.value }))}
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-medium text-muted-foreground">Priority</span>
            <select
              className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
              value={form.priority}
              onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
            >
              <option value="P0">P0 — Critical</option>
              <option value="P1">P1 — High</option>
              <option value="P2">P2 — Medium</option>
              <option value="P3">P3 — Low</option>
            </select>
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-medium text-muted-foreground">Risk level</span>
            <select
              className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
              value={form.riskLevel}
              onChange={(e) => setForm((f) => ({ ...f, riskLevel: e.target.value }))}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-medium text-muted-foreground">Internal status</span>
            <select
              className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
              value={form.internalStatus}
              onChange={(e) => setForm((f) => ({ ...f, internalStatus: e.target.value }))}
            >
              <option value="drafting">Drafting</option>
              <option value="active">Active</option>
              <option value="at_risk">At risk</option>
              <option value="paused">Paused</option>
              <option value="complete">Complete</option>
            </select>
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-medium text-muted-foreground">Assigned contributors (comma or newline)</span>
            <textarea
              className="min-h-[72px] w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
              value={form.contributorNames}
              onChange={(e) => setForm((f) => ({ ...f, contributorNames: e.target.value }))}
            />
          </label>
        </div>
      </SideDrawer>

      <SideDrawer
        open={guideOpen}
        title="Phase guide"
        onClose={() => setGuideOpen(false)}
        testId="phase-guide-drawer"
      >
        <GuideContent guide={payload.guide} />
      </SideDrawer>

      <SideDrawer
        open={activityOpen}
        title="Phase activity"
        onClose={() => setActivityOpen(false)}
        testId="phase-activity-drawer"
      >
        <ActivityContent rows={payload.activity} />
      </SideDrawer>
    </div>
  );
}
