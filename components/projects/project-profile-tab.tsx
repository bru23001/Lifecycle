"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, UserRoundCog, Archive, Trash2, X } from "lucide-react";

import {
  archiveProject,
  changeProjectOwner,
  deleteProject,
  updateProjectProfile,
} from "@/app/actions/projectProfile";
import {
  NEW_PROJECT_BUSINESS_AREAS,
  NEW_PROJECT_WORKFLOW_STATUSES,
  PROJECT_PRIORITY_OPTIONS,
} from "@/data/new-project.constants";
import { normalizeProjectCodeForConfirm } from "@/lib/format-project-code";
import { toUserMessage } from "@/lib/toUserMessage";
import type { SelectedProject, SelectedProjectProfile } from "@/types/projects.types";

function fieldClass(): string {
  return "mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-[12px] text-slate-900 shadow-sm outline-none focus:border-[#2563eb] dark:border-border dark:bg-background dark:text-foreground";
}

function ProfileEditDrawer({
  open,
  onClose,
  profile,
  assignableUsers,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  profile: SelectedProjectProfile;
  assignableUsers: { id: string; name: string; email: string }[];
  onSaved: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState(profile.name);
  const [slug, setSlug] = useState(profile.slug);
  const [description, setDescription] = useState(profile.description);
  const [sponsor, setSponsor] = useState(profile.sponsor);
  const [ownerUserId, setOwnerUserId] = useState(
    profile.ownerUserId ?? assignableUsers[0]?.id ?? "",
  );
  const [businessArea, setBusinessArea] = useState(
    profile.businessArea && NEW_PROJECT_BUSINESS_AREAS.includes(profile.businessArea as (typeof NEW_PROJECT_BUSINESS_AREAS)[number])
      ? profile.businessArea
      : NEW_PROJECT_BUSINESS_AREAS[0],
  );
  const [priority, setPriority] = useState(profile.priority || PROJECT_PRIORITY_OPTIONS[4]);
  const [workflowStatus, setWorkflowStatus] = useState(profile.status);
  const [targetStartDate, setTargetStartDate] = useState(profile.targetStartDate);
  const [targetEndDate, setTargetEndDate] = useState(profile.targetEndDate);

  useEffect(() => {
    if (!open) return;
    setName(profile.name);
    setSlug(profile.slug);
    setDescription(profile.description);
    setSponsor(profile.sponsor);
    setOwnerUserId(profile.ownerUserId ?? assignableUsers[0]?.id ?? "");
    setBusinessArea(
      profile.businessArea &&
        NEW_PROJECT_BUSINESS_AREAS.includes(profile.businessArea as (typeof NEW_PROJECT_BUSINESS_AREAS)[number])
        ? profile.businessArea
        : NEW_PROJECT_BUSINESS_AREAS[0],
    );
    setPriority(profile.priority || PROJECT_PRIORITY_OPTIONS[4]);
    setWorkflowStatus(profile.status);
    setTargetStartDate(profile.targetStartDate);
    setTargetEndDate(profile.targetEndDate);
    setError(null);
  }, [open, profile, assignableUsers]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  function save() {
    setError(null);
    startTransition(async () => {
      try {
        const res = await updateProjectProfile({
          projectId: profile.projectId,
          name,
          slug,
          description,
          sponsor,
          ownerUserId,
          businessArea,
          priority,
          workflowStatus,
          targetStartDate,
          targetEndDate,
        });
        if (!res.ok) {
          setError(res.error);
          return;
        }
        onSaved();
        onClose();
      } catch (e) {
        setError(toUserMessage(e));
      }
    });
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close profile editor"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        data-testid="edit-project-profile-drawer"
        className="relative flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-[var(--app-bg)] shadow-2xl dark:border-border"
      >
        <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-border">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-foreground">Edit project profile</h2>
          <button
            type="button"
            className="rounded-md p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-muted"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </header>
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
          {error ? (
            <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-[12px] text-rose-900" role="alert">
              {error}
            </p>
          ) : null}
          <p className="text-[11px] text-slate-500 dark:text-muted-foreground">
            Displayed code{" "}
            <span className="font-mono font-semibold text-slate-800 dark:text-foreground">{profile.displayedCode}</span>{" "}
            is derived from the slug and vault folder; editing the slug updates URLs.
          </p>
          <div>
            <label className="text-[11px] font-semibold text-slate-600 dark:text-muted-foreground" htmlFor="ep-name">
              Project name
            </label>
            <input id="ep-name" className={fieldClass()} value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-slate-600 dark:text-muted-foreground" htmlFor="ep-slug">
              Project code / URL slug
            </label>
            <input id="ep-slug" className={fieldClass()} value={slug} onChange={(e) => setSlug(e.target.value)} />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-slate-600 dark:text-muted-foreground" htmlFor="ep-desc">
              Description
            </label>
            <textarea
              id="ep-desc"
              rows={3}
              className={fieldClass()}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-slate-600 dark:text-muted-foreground" htmlFor="ep-owner">
              Owner
            </label>
            <select
              id="ep-owner"
              className={fieldClass()}
              value={ownerUserId}
              onChange={(e) => setOwnerUserId(e.target.value)}
            >
              {assignableUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name || u.email}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[11px] font-semibold text-slate-600 dark:text-muted-foreground" htmlFor="ep-sponsor">
              Sponsor
            </label>
            <input id="ep-sponsor" className={fieldClass()} value={sponsor} onChange={(e) => setSponsor(e.target.value)} />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-slate-600 dark:text-muted-foreground" htmlFor="ep-area">
              Business area
            </label>
            <select
              id="ep-area"
              className={fieldClass()}
              value={businessArea}
              onChange={(e) => setBusinessArea(e.target.value)}
            >
              {NEW_PROJECT_BUSINESS_AREAS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[11px] font-semibold text-slate-600 dark:text-muted-foreground" htmlFor="ep-priority">
              Priority
            </label>
            <select
              id="ep-priority"
              className={fieldClass()}
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              {PROJECT_PRIORITY_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[11px] font-semibold text-slate-600 dark:text-muted-foreground" htmlFor="ep-status">
              Status
            </label>
            <select
              id="ep-status"
              className={fieldClass()}
              value={workflowStatus}
              onChange={(e) => setWorkflowStatus(e.target.value as SelectedProjectProfile["status"])}
            >
              {NEW_PROJECT_WORKFLOW_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-3 min-[400px]:grid-cols-2">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-muted-foreground" htmlFor="ep-ts">
                Target start
              </label>
              <input
                id="ep-ts"
                type="date"
                className={fieldClass()}
                value={targetStartDate}
                onChange={(e) => setTargetStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-muted-foreground" htmlFor="ep-te">
                Target end
              </label>
              <input
                id="ep-te"
                type="date"
                className={fieldClass()}
                value={targetEndDate}
                onChange={(e) => setTargetEndDate(e.target.value)}
              />
            </div>
          </div>
        </div>
        <footer className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4 dark:border-border">
          <button
            type="button"
            className="rounded-md border border-slate-200 px-4 py-2 text-[12px] font-medium dark:border-border"
            onClick={onClose}
            disabled={pending}
          >
            Cancel
          </button>
          <button
            type="button"
            data-testid="edit-project-profile-save"
            className="rounded-md bg-[#2563eb] px-4 py-2 text-[12px] font-semibold text-white hover:bg-[#1d4ed8] disabled:opacity-60"
            onClick={save}
            disabled={pending}
          >
            {pending ? "Saving…" : "Save"}
          </button>
        </footer>
      </div>
    </div>
  );
}

function ChangeOwnerModal({
  open,
  onClose,
  profile,
  assignableUsers,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  profile: SelectedProjectProfile;
  assignableUsers: { id: string; name: string; email: string }[];
  onSaved: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [newOwnerId, setNewOwnerId] = useState(profile.ownerUserId ?? assignableUsers[0]?.id ?? "");
  const [note, setNote] = useState("");

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open) {
      setNewOwnerId(profile.ownerUserId ?? assignableUsers[0]?.id ?? "");
      setNote("");
      setError(null);
      if (!d.open) d.showModal();
    } else if (d.open) {
      d.close();
    }
  }, [open, profile, assignableUsers]);

  function confirm() {
    setError(null);
    startTransition(async () => {
      try {
        const res = await changeProjectOwner({
          projectId: profile.projectId,
          newOwnerUserId: newOwnerId,
          note: note.trim() || undefined,
        });
        if (!res.ok) {
          setError(res.error);
          return;
        }
        onSaved();
        onClose();
      } catch (e) {
        setError(toUserMessage(e));
      }
    });
  }

  return (
    <dialog
      ref={ref}
      data-testid="change-owner-modal"
      className="fixed left-1/2 top-1/2 z-50 w-[min(100vw-2rem,440px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-border dark:bg-card"
      onClose={onClose}
    >
      <h2 className="text-lg font-semibold text-slate-900 dark:text-foreground">Change owner</h2>
      <p className="mt-2 text-[12px] text-slate-600 dark:text-muted-foreground">Reassign the accountable project owner.</p>
      {error ? (
        <p className="mt-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-[12px] text-rose-900" role="alert">
          {error}
        </p>
      ) : null}
      <div className="mt-4 space-y-3">
        <div>
          <p className="text-[11px] font-semibold text-slate-600 dark:text-muted-foreground">Current owner</p>
          <p className="mt-1 text-sm font-medium text-slate-900 dark:text-foreground">{profile.ownerName}</p>
        </div>
        <div>
          <label className="text-[11px] font-semibold text-slate-600 dark:text-muted-foreground" htmlFor="co-new">
            New owner
          </label>
          <select id="co-new" className={fieldClass()} value={newOwnerId} onChange={(e) => setNewOwnerId(e.target.value)}>
            {assignableUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name || u.email}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[11px] font-semibold text-slate-600 dark:text-muted-foreground" htmlFor="co-note">
            Reassignment note (optional)
          </label>
          <textarea id="co-note" rows={2} className={fieldClass()} value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <button type="button" className="rounded-md border border-slate-200 px-4 py-2 text-sm dark:border-border" onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className="rounded-md bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1d4ed8] disabled:opacity-60"
          onClick={confirm}
          disabled={pending || !newOwnerId}
        >
          {pending ? "Saving…" : "Confirm reassignment"}
        </button>
      </div>
    </dialog>
  );
}

function ArchiveModal({
  open,
  onClose,
  profile,
  onArchived,
}: {
  open: boolean;
  onClose: () => void;
  profile: SelectedProjectProfile;
  onArchived: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open) {
      setReason("");
      setError(null);
      if (!d.open) d.showModal();
    } else if (d.open) {
      d.close();
    }
  }, [open]);

  function confirm() {
    setError(null);
    startTransition(async () => {
      try {
        const res = await archiveProject({ projectId: profile.projectId, reason });
        if (!res.ok) {
          setError(res.error);
          return;
        }
        onArchived();
        onClose();
      } catch (e) {
        setError(toUserMessage(e));
      }
    });
  }

  return (
    <dialog
      ref={ref}
      data-testid="archive-project-modal"
      className="fixed left-1/2 top-1/2 z-50 w-[min(100vw-2rem,440px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-border dark:bg-card"
      onClose={onClose}
    >
      <h2 className="text-lg font-semibold text-slate-900 dark:text-foreground">Archive project</h2>
      <p className="mt-2 text-sm font-medium text-slate-800 dark:text-foreground">Confirm archiving {profile.name}</p>
      {error ? (
        <p className="mt-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-[12px] text-rose-900" role="alert">
          {error}
        </p>
      ) : null}
      <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] text-amber-950">
        The project will be removed from the active projects list. Deep links may still work until you delete the project.
      </div>
      <div className="mt-4">
        <label className="text-[11px] font-semibold text-slate-600 dark:text-muted-foreground" htmlFor="ar-reason">
          Archive reason <span className="text-rose-600">*</span>
        </label>
        <textarea
          id="ar-reason"
          rows={3}
          className={fieldClass()}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
        />
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <button type="button" className="rounded-md border border-slate-200 px-4 py-2 text-sm dark:border-border" onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className="rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-60"
          onClick={confirm}
          disabled={pending || !reason.trim()}
        >
          {pending ? "Archiving…" : "Confirm archive"}
        </button>
      </div>
    </dialog>
  );
}

function DeleteModal({
  open,
  onClose,
  profile,
  onDeleted,
}: {
  open: boolean;
  onClose: () => void;
  profile: SelectedProjectProfile;
  onDeleted: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [typed, setTyped] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open) {
      setTyped("");
      setReason("");
      setError(null);
      if (!d.open) d.showModal();
    } else if (d.open) {
      d.close();
    }
  }, [open]);

  function confirm() {
    setError(null);
    startTransition(async () => {
      try {
        const res = await deleteProject({
          projectId: profile.projectId,
          typedCode: typed,
          reason,
        });
        if (!res.ok) {
          setError(res.error);
          return;
        }
        onDeleted();
        onClose();
      } catch (e) {
        setError(toUserMessage(e));
      }
    });
  }

  const codeOk =
    normalizeProjectCodeForConfirm(typed) === normalizeProjectCodeForConfirm(profile.displayedCode);

  return (
    <dialog
      ref={ref}
      data-testid="delete-project-modal"
      className="fixed left-1/2 top-1/2 z-50 w-[min(100vw-2rem,440px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-rose-200 bg-white p-6 shadow-xl dark:border-border dark:bg-card"
      onClose={onClose}
    >
      <h2 className="text-lg font-semibold text-rose-800 dark:text-rose-400">Delete project</h2>
      <p className="mt-2 text-[12px] text-slate-600 dark:text-muted-foreground">
        This permanently removes the project and related records in this workspace. This cannot be undone.
      </p>
      {error ? (
        <p className="mt-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-[12px] text-rose-900" role="alert">
          {error}
        </p>
      ) : null}
      <p className="mt-4 text-sm text-slate-800 dark:text-foreground">
        Type project code <span className="font-mono font-bold">{profile.displayedCode}</span> to confirm.
      </p>
      <input
        className={`${fieldClass()} mt-2`}
        value={typed}
        onChange={(e) => setTyped(e.target.value)}
        autoComplete="off"
        placeholder="e.g. PRJ-001"
      />
      <div className="mt-3">
        <label className="text-[11px] font-semibold text-slate-600 dark:text-muted-foreground" htmlFor="del-reason">
          Delete reason <span className="text-rose-600">*</span>
        </label>
        <textarea id="del-reason" rows={2} className={fieldClass()} value={reason} onChange={(e) => setReason(e.target.value)} />
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <button type="button" className="rounded-md border border-slate-200 px-4 py-2 text-sm dark:border-border" onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className="rounded-md bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
          onClick={confirm}
          disabled={pending || !codeOk || !reason.trim()}
        >
          {pending ? "Deleting…" : "Delete project"}
        </button>
      </div>
    </dialog>
  );
}

export function ProjectProfileTab({
  selectedProject,
  profile,
  assignableUsers,
}: {
  selectedProject: SelectedProject;
  profile: SelectedProjectProfile | null;
  assignableUsers: { id: string; name: string; email: string }[];
}) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [ownerOpen, setOwnerOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  function refresh() {
    router.refresh();
  }

  if (!profile) {
    return (
      <section className="cc-card-standard p-4">
        <h3 className="cc-card-title">Project Profile</h3>
        <p className="cc-card-text mt-2">Select a project to manage profile, ownership, and lifecycle metadata.</p>
        <p className="cc-card-meta mt-3">
          {selectedProject.header.code} · {selectedProject.header.name}
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-4">
      <section className="cc-card-standard p-4">
        <h3 className="cc-card-title">Project Profile</h3>
        <p className="cc-card-text mt-2 text-[12px] leading-relaxed">
          Project identity, ownership, classification, and governance metadata. Use the actions below to update this
          project.
        </p>
        <dl className="cc-card-meta mt-4 grid gap-2 sm:grid-cols-2">
          <div className="flex justify-between gap-2 border-b border-slate-100 py-2 dark:border-border">
            <dt>Code</dt>
            <dd className="font-mono font-semibold text-slate-800 dark:text-foreground">{profile.displayedCode}</dd>
          </div>
          <div className="flex justify-between gap-2 border-b border-slate-100 py-2 dark:border-border">
            <dt>Owner</dt>
            <dd className="text-right font-medium text-slate-800 dark:text-foreground">{profile.ownerName}</dd>
          </div>
          <div className="flex justify-between gap-2 border-b border-slate-100 py-2 dark:border-border sm:col-span-2">
            <dt>Description</dt>
            <dd className="max-w-[70%] text-right text-slate-700 dark:text-foreground">{profile.description || "—"}</dd>
          </div>
        </dl>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            data-testid="project-profile-edit-open"
            className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-[12px] font-medium text-slate-800 hover:bg-slate-50 dark:border-border dark:bg-background dark:hover:bg-muted"
            onClick={() => setEditOpen(true)}
          >
            <Pencil className="size-3.5" aria-hidden />
            Edit project profile
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-[12px] font-medium text-slate-800 hover:bg-slate-50 dark:border-border dark:bg-background dark:hover:bg-muted"
            onClick={() => setOwnerOpen(true)}
          >
            <UserRoundCog className="size-3.5" aria-hidden />
            Change owner
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] font-medium text-amber-950 hover:bg-amber-100"
            onClick={() => setArchiveOpen(true)}
          >
            <Archive className="size-3.5" aria-hidden />
            Archive project
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-[12px] font-medium text-rose-900 hover:bg-rose-100"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="size-3.5" aria-hidden />
            Delete project
          </button>
        </div>
      </section>

      <ProfileEditDrawer
        open={editOpen}
        onClose={() => setEditOpen(false)}
        profile={profile}
        assignableUsers={assignableUsers}
        onSaved={refresh}
      />
      <ChangeOwnerModal
        open={ownerOpen}
        onClose={() => setOwnerOpen(false)}
        profile={profile}
        assignableUsers={assignableUsers}
        onSaved={refresh}
      />
      <ArchiveModal
        open={archiveOpen}
        onClose={() => setArchiveOpen(false)}
        profile={profile}
        onArchived={() => {
          refresh();
          router.replace("/projects");
        }}
      />
      <DeleteModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        profile={profile}
        onDeleted={() => {
          router.replace("/projects");
          router.refresh();
        }}
      />
    </div>
  );
}
