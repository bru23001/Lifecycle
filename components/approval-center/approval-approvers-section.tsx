"use client";

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { Bell, UserPlus, X } from "lucide-react";

import { Badge } from "@/components/approval-center/approval-center-shared";
import { ApproverReviewDetailDrawer } from "@/components/approval-center/approver-review-detail-drawer";
import { Button } from "@/components/ui/button";
import { withApproverCountSynced } from "@/lib/approval-decision";
import { searchApproverDirectory, type ApproverDirectoryEntry } from "@/lib/approval-approver-directory";
import { formatDateTimeAbsolute } from "@/lib/datetime-format";
import { cn } from "@/lib/utils";
import type { ApprovalApprover, ApprovalHistoryEvent, ApprovalPackage } from "@/types/approval-center.types";

export type ApproverManagementHandle = {
  openAddApprover: () => void;
  openReassign: () => void;
  openEscalate: () => void;
};

function useModalOpen(open: boolean, onReset?: () => void) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const prevOpen = useRef(false);
  const resetRef = useRef(onReset);
  resetRef.current = onReset;

  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;
    if (open) {
      if (!prevOpen.current) {
        resetRef.current?.();
      }
      if (!node.open) node.showModal();
    } else if (node.open) {
      node.close();
    }
    prevOpen.current = open;
  }, [open]);

  return dialogRef;
}

function nowLabel() {
  return formatDateTimeAbsolute(new Date());
}

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
}

function reviewStatusBadge(status: ApprovalApprover["reviewStatus"]) {
  switch (status) {
    case "completed":
      return { label: "Completed", tone: "green" as const };
    case "declined":
      return { label: "Declined", tone: "red" as const };
    case "in_review":
      return { label: "In review", tone: "blue" as const };
    default:
      return { label: "Pending", tone: "gray" as const };
  }
}

const dialogFrame =
  "w-[min(100vw-2rem,480px)] rounded-2xl border border-slate-200 bg-white p-0 shadow-xl backdrop:bg-slate-900/40 dark:border-border dark:bg-card";

type SectionProps = {
  pkg: ApprovalPackage;
  onPatchPackage: (updater: (prev: ApprovalPackage) => ApprovalPackage) => void;
  currentUser: { name: string; role: string; initials: string };
  disabled?: boolean;
};

export const ApprovalApproversSection = forwardRef<ApproverManagementHandle, SectionProps>(function ApprovalApproversSection(
  { pkg, onPatchPackage, currentUser, disabled = false },
  ref,
) {
  const [drawerApprover, setDrawerApprover] = useState<ApprovalApprover | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [addOpen, setAddOpen] = useState(false);
  const [addSearch, setAddSearch] = useState("");
  const [addPick, setAddPick] = useState<ApproverDirectoryEntry | null>(null);

  const [reassignOpen, setReassignOpen] = useState(false);
  const [reassignTargetId, setReassignTargetId] = useState<string>("");
  const [reassignSearch, setReassignSearch] = useState("");
  const [reassignPick, setReassignPick] = useState<ApproverDirectoryEntry | null>(null);

  const [escalateOpen, setEscalateOpen] = useState(false);
  const [escalateNote, setEscalateNote] = useState("");

  const [remindOpen, setRemindOpen] = useState(false);
  const [remindTarget, setRemindTarget] = useState<ApprovalApprover | null>(null);

  const [banner, setBanner] = useState<string | null>(null);

  const defaultInputLabels = useMemo(() => {
    const names = pkg.requiredInputs.map((r) => r.name).filter(Boolean);
    return names.length > 0 ? names.slice(0, 4) : ["General review"];
  }, [pkg.requiredInputs]);

  const addResults = useMemo(() => searchApproverDirectory(addSearch), [addSearch]);
  const reassignResults = useMemo(() => searchApproverDirectory(reassignSearch), [reassignSearch]);

  const addDialogRef = useModalOpen(addOpen, () => {
    setAddSearch("");
    setAddPick(null);
  });
  const reassignDialogRef = useModalOpen(reassignOpen, () => {
    setReassignSearch("");
    setReassignPick(null);
    setReassignTargetId(pkg.approvers[0]?.id ?? "");
  });
  const escalateDialogRef = useModalOpen(escalateOpen, () => setEscalateNote(""));
  const remindDialogRef = useModalOpen(remindOpen, () => setRemindTarget(null));

  useImperativeHandle(
    ref,
    () => ({
      openAddApprover: () => {
        if (disabled) return;
        setAddPick(null);
        setAddSearch("");
        setAddOpen(true);
      },
      openReassign: () => {
        if (disabled) return;
        if (pkg.approvers.length === 0) {
          setBanner("Add at least one approver before using reassign.");
          return;
        }
        setReassignTargetId(pkg.approvers[0]?.id ?? "");
        setReassignPick(null);
        setReassignSearch("");
        setReassignOpen(true);
      },
      openEscalate: () => {
        if (disabled) return;
        setEscalateNote("");
        setEscalateOpen(true);
      },
    }),
    [disabled, pkg.approvers],
  );

  useEffect(() => {
    if (!banner) return;
    const t = window.setTimeout(() => setBanner(null), 3200);
    return () => window.clearTimeout(t);
  }, [banner]);

  const pushHistory = (event: Omit<ApprovalHistoryEvent, "id" | "timestampLabel" | "approvalId">) => {
    const row: ApprovalHistoryEvent = {
      ...event,
      id: `hist-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestampLabel: nowLabel(),
      approvalId: pkg.detail.id,
    };
    return row;
  };

  const openDrawer = (a: ApprovalApprover) => {
    setDrawerApprover(a);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setDrawerApprover(null);
  };

  const confirmAdd = () => {
    if (!addPick) return;
    const nextApprover: ApprovalApprover = {
      id: `apr-${Date.now()}`,
      name: addPick.name,
      role: addPick.role,
      initials: initialsFromName(addPick.name),
      reviewStatus: "pending",
      assignedInputLabels: [...defaultInputLabels],
    };
    const hist = pushHistory({
      eventType: "approver_added",
      title: "Approver added",
      actorName: currentUser.name,
      actorRole: currentUser.role,
      description: `${addPick.name} was added to the review roster (local workflow).`,
      statusTone: "blue",
    });
    onPatchPackage((prev) =>
      withApproverCountSynced({
        ...prev,
        approvers: [...prev.approvers, nextApprover],
        history: [hist, ...prev.history],
      }),
    );
    setBanner(`${addPick.name} added as approver.`);
    setAddOpen(false);
  };

  const confirmReassign = () => {
    if (!reassignPick || !reassignTargetId) return;
    const prevName = pkg.approvers.find((a) => a.id === reassignTargetId)?.name ?? "Reviewer";
    const hist = pushHistory({
      eventType: "approver_reassigned",
      title: "Approver reassigned",
      actorName: currentUser.name,
      actorRole: currentUser.role,
      description: `${prevName} replaced by ${reassignPick.name} (local workflow).`,
      statusTone: "amber",
      beforeValue: prevName,
      afterValue: reassignPick.name,
    });
    onPatchPackage((prev) =>
      withApproverCountSynced({
        ...prev,
        approvers: prev.approvers.map((a) =>
          a.id === reassignTargetId
            ? {
                ...a,
                id: `apr-${Date.now()}`,
                name: reassignPick.name,
                role: reassignPick.role,
                initials: initialsFromName(reassignPick.name),
                reviewStatus: "pending" as const,
                reviewComments: undefined,
                reviewedOnLabel: undefined,
              }
            : a,
        ),
        history: [hist, ...prev.history],
      }),
    );
    setBanner(`Reassigned ${prevName} → ${reassignPick.name}.`);
    setReassignOpen(false);
  };

  const confirmEscalate = () => {
    const note = escalateNote.trim();
    const hist = pushHistory({
      eventType: "approval_escalated",
      title: "Approval escalated",
      actorName: currentUser.name,
      actorRole: currentUser.role,
      description: note.length > 0 ? note : "Escalated for leadership visibility (local workflow).",
      statusTone: "amber",
    });
    onPatchPackage((prev) =>
      withApproverCountSynced({
        ...prev,
        history: [hist, ...prev.history],
      }),
    );
    setBanner("Escalation recorded on the timeline.");
    setEscalateOpen(false);
  };

  const confirmRemind = () => {
    if (!remindTarget) return;
    const hist = pushHistory({
      eventType: "approver_reminder_sent",
      title: "Reminder sent",
      actorName: currentUser.name,
      actorRole: currentUser.role,
      description: `Reminder queued for ${remindTarget.name} (local workflow).`,
      statusTone: "blue",
    });
    onPatchPackage((prev) =>
      withApproverCountSynced({
        ...prev,
        history: [hist, ...prev.history],
      }),
    );
    setBanner(`Reminder logged for ${remindTarget.name}.`);
    setRemindOpen(false);
    setRemindTarget(null);
  };

  const startRemind = (a: ApprovalApprover) => {
    setRemindTarget(a);
    setRemindOpen(true);
  };

  const openReassignFor = (approverId: string) => {
    setReassignTargetId(approverId);
    setReassignPick(null);
    setReassignSearch("");
    setReassignOpen(true);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      {banner ? (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-900">
          <Bell className="size-4 shrink-0" aria-hidden />
          <p>{banner}</p>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-foreground">Approvers</h3>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-700 dark:border-border dark:bg-muted">
            {pkg.approvers.length}
          </span>
        </div>
        <Button type="button" size="sm" variant="outline" className="gap-1.5" disabled={disabled} onClick={() => setAddOpen(true)}>
          <UserPlus className="size-3.5" aria-hidden />
          Add approver
        </Button>
      </div>

      <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-0.5">
        {pkg.approvers.length === 0 ? (
          <li className="rounded-lg border border-dashed border-slate-200 bg-slate-50/80 px-3 py-6 text-center text-sm text-slate-600 dark:border-border dark:bg-muted/40">
            No approvers assigned yet. Use Add approver or the overflow menu.
          </li>
        ) : (
          pkg.approvers.map((a) => {
            const st = reviewStatusBadge(a.reviewStatus);
            const canRemind = a.reviewStatus === "pending" || a.reviewStatus === "in_review";
            return (
              <li
                key={a.id}
                className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-sm dark:border-border dark:bg-card"
              >
                <div className="flex min-w-0 flex-1 gap-3">
                  <div
                    className={cn(
                      "grid size-10 shrink-0 place-items-center rounded-lg text-xs font-bold",
                      "bg-slate-100 text-slate-800 dark:bg-muted dark:text-foreground",
                    )}
                    aria-hidden
                  >
                    {a.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-foreground">{a.name}</p>
                    <p className="text-xs text-slate-600">{a.role}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Badge label={st.label} tone={st.tone} />
                      {a.assignedInputLabels?.slice(0, 3).map((label) => (
                        <span
                          key={`${a.id}-${label}`}
                          className="max-w-[10rem] truncate rounded border border-slate-100 bg-slate-50 px-1.5 py-0.5 text-[11px] text-slate-700 dark:border-border dark:bg-muted"
                          title={label}
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap gap-1.5">
                  <Button type="button" size="sm" variant="ghost" onClick={() => openDrawer(a)}>
                    View
                  </Button>
                  <Button type="button" size="sm" variant="ghost" disabled={!canRemind || disabled} onClick={() => startRemind(a)}>
                    Remind
                  </Button>
                </div>
              </li>
            );
          })
        )}
      </ul>

      <ApproverReviewDetailDrawer
        open={drawerOpen && Boolean(drawerApprover)}
        approver={drawerApprover}
        packageTitle={pkg.detail.title}
        dueDateLabel={pkg.detail.dueDateLabel}
        onClose={closeDrawer}
        onSendReminder={() => {
          if (drawerApprover) startRemind(drawerApprover);
        }}
        onReassignThisApprover={() => {
          if (drawerApprover) openReassignFor(drawerApprover.id);
        }}
      />

      <dialog ref={addDialogRef} onClose={() => setAddOpen(false)} className={dialogFrame} aria-labelledby="add-apr-title">
        <div className="flex max-h-[90vh] flex-col">
          <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
            <div>
              <h2 id="add-apr-title" className="text-lg font-semibold text-slate-900 dark:text-foreground">
                Add approver
              </h2>
              <p className="mt-1 text-sm text-slate-600">Search the directory (mock data until the API ships).</p>
            </div>
            <Button type="button" variant="outline" size="icon-sm" aria-label="Close" onClick={() => setAddOpen(false)}>
              <X className="size-4" aria-hidden />
            </Button>
          </header>
          <div className="space-y-3 overflow-y-auto px-5 py-4">
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="add-apr-search">
              Search
            </label>
            <input
              id="add-apr-search"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-border dark:bg-background"
              value={addSearch}
              onChange={(e) => setAddSearch(e.target.value)}
              placeholder="Name, role, or email"
              autoComplete="off"
            />
            <ul className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-slate-100 dark:border-border">
              {addResults.map((row) => (
                <li key={row.id}>
                  <button
                    type="button"
                    onClick={() => setAddPick(row)}
                    className={cn(
                      "flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-muted",
                      addPick?.id === row.id && "bg-blue-50 dark:bg-blue-950/30",
                    )}
                  >
                    <span className="font-medium text-slate-900 dark:text-foreground">{row.name}</span>
                    <span className="text-xs text-slate-600">{row.role}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <footer className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
            <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={confirmAdd} disabled={!addPick}>
              Add to package
            </Button>
          </footer>
        </div>
      </dialog>

      <dialog ref={reassignDialogRef} onClose={() => setReassignOpen(false)} className={dialogFrame} aria-labelledby="reassign-apr-title">
        <div className="flex max-h-[90vh] flex-col">
          <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
            <div>
              <h2 id="reassign-apr-title" className="text-lg font-semibold text-slate-900 dark:text-foreground">
                Reassign approver
              </h2>
              <p className="mt-1 text-sm text-slate-600">Replace an assigned reviewer with someone from the directory.</p>
            </div>
            <Button type="button" variant="outline" size="icon-sm" aria-label="Close" onClick={() => setReassignOpen(false)}>
              <X className="size-4" aria-hidden />
            </Button>
          </header>
          <div className="space-y-4 overflow-y-auto px-5 py-4 text-sm">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="reassign-who">
                Current approver
              </label>
              <select
                id="reassign-who"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 dark:border-border dark:bg-background"
                value={reassignTargetId}
                onChange={(e) => setReassignTargetId(e.target.value)}
                disabled={pkg.approvers.length === 0}
              >
                {pkg.approvers.length === 0 ? (
                  <option value="">No approvers</option>
                ) : (
                  pkg.approvers.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))
                )}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="reassign-search">
                New reviewer
              </label>
              <input
                id="reassign-search"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 dark:border-border dark:bg-background"
                value={reassignSearch}
                onChange={(e) => setReassignSearch(e.target.value)}
                placeholder="Search directory"
                autoComplete="off"
              />
              <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto rounded-lg border border-slate-100 dark:border-border">
                {reassignResults.map((row) => (
                  <li key={row.id}>
                    <button
                      type="button"
                      onClick={() => setReassignPick(row)}
                      className={cn(
                        "flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-muted",
                        reassignPick?.id === row.id && "bg-amber-50 dark:bg-amber-950/30",
                      )}
                    >
                      <span className="font-medium">{row.name}</span>
                      <span className="text-xs text-slate-600">{row.role}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <footer className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
            <Button type="button" variant="outline" onClick={() => setReassignOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={confirmReassign} disabled={!reassignPick || !reassignTargetId}>
              Confirm reassignment
            </Button>
          </footer>
        </div>
      </dialog>

      <dialog ref={escalateDialogRef} onClose={() => setEscalateOpen(false)} className={dialogFrame} aria-labelledby="escalate-title">
        <div className="flex max-h-[90vh] flex-col">
          <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
            <div>
              <h2 id="escalate-title" className="text-lg font-semibold text-slate-900 dark:text-foreground">
                Escalate approval
              </h2>
              <p className="mt-1 text-sm text-slate-600">Adds a timeline entry for leadership visibility (local workflow).</p>
            </div>
            <Button type="button" variant="outline" size="icon-sm" aria-label="Close" onClick={() => setEscalateOpen(false)}>
              <X className="size-4" aria-hidden />
            </Button>
          </header>
          <div className="px-5 py-4">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="escalate-note">
              Context (optional)
            </label>
            <textarea
              id="escalate-note"
              rows={4}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-border dark:bg-background"
              value={escalateNote}
              onChange={(e) => setEscalateNote(e.target.value)}
              placeholder="Why is this escalation needed?"
            />
          </div>
          <footer className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
            <Button type="button" variant="outline" onClick={() => setEscalateOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={confirmEscalate}>
              Record escalation
            </Button>
          </footer>
        </div>
      </dialog>

      <dialog ref={remindDialogRef} onClose={() => setRemindOpen(false)} className={dialogFrame} aria-labelledby="remind-title">
        <div className="flex flex-col">
          <header className="border-b border-slate-100 px-5 py-4">
            <h2 id="remind-title" className="text-lg font-semibold text-slate-900 dark:text-foreground">
              Send reminder
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {remindTarget ? (
                <>
                  Queue a reminder for <span className="font-medium">{remindTarget.name}</span> (simulated locally).
                </>
              ) : null}
            </p>
          </header>
          <footer className="flex justify-end gap-2 px-5 py-4">
            <Button type="button" variant="outline" onClick={() => setRemindOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={confirmRemind} disabled={!remindTarget}>
              Confirm
            </Button>
          </footer>
        </div>
      </dialog>
    </div>
  );
});
