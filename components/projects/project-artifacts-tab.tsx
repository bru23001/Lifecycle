"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { ChevronRight, FileText, MoreHorizontal, Plus } from "lucide-react";

import { archiveProjectArtifact } from "@/app/actions/archiveProjectArtifact";
import { downloadTextFile } from "@/lib/artifact-export";
import { cn } from "@/lib/utils";
import type { ArtifactWorkflowStatus } from "@/types/artifact-library.types";
import type { ProjectsArtifactsTabData, ProjectsArtifactsTabRow } from "@/types/projects.types";

function statusBadgeClass(status: ArtifactWorkflowStatus): string {
  if (status === "approved") return "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200";
  if (status === "draft") return "bg-slate-100 text-slate-700 dark:bg-muted dark:text-foreground";
  if (status === "in_review") return "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200";
  if (status === "changes_requested") return "bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-200";
  if (status === "archived") return "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300";
  return "bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-200";
}

function markerLabel(marker: ProjectsArtifactsTabData["templatesForModal"][number]["marker"]): string {
  if (marker === "required") return "Required";
  if (marker === "conditional") return "Conditional";
  return "Optional";
}

function markerClass(marker: ProjectsArtifactsTabData["templatesForModal"][number]["marker"]): string {
  if (marker === "required") return "bg-rose-50 text-rose-800 dark:bg-rose-950/30 dark:text-rose-100";
  if (marker === "conditional") return "bg-violet-50 text-violet-800 dark:bg-violet-950/30 dark:text-violet-100";
  return "bg-slate-100 text-slate-600 dark:bg-muted dark:text-muted-foreground";
}

function TemplateSelectionModal({
  open,
  onClose,
  data,
}: {
  open: boolean;
  onClose: () => void;
  data: ProjectsArtifactsTabData;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const [phaseFilter, setPhaseFilter] = useState<string>("all");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  const phaseOptions = useMemo(() => {
    const nums = [...new Set(data.templatesForModal.map((t) => t.phaseNumber))].sort((a, b) => a - b);
    return nums;
  }, [data.templatesForModal]);

  const filtered = useMemo(
    () =>
      data.templatesForModal.filter((t) => phaseFilter === "all" || String(t.phaseNumber) === phaseFilter),
    [data.templatesForModal, phaseFilter],
  );

  useEffect(() => {
    if (!selectedTemplateId) return;
    if (!filtered.some((t) => t.templateId === selectedTemplateId)) {
      setSelectedTemplateId(null);
    }
  }, [filtered, selectedTemplateId]);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open) {
      setSelectedTemplateId(null);
      if (!d.open) d.showModal();
    } else if (d.open) {
      d.close();
    }
  }, [open]);

  function continueToWizard() {
    if (!selectedTemplateId) return;
    router.push(`/projects/${data.projectId}/templates/${encodeURIComponent(selectedTemplateId)}`);
    onClose();
  }

  return (
    <dialog
      ref={ref}
      data-testid="artifact-template-modal"
      className="fixed left-1/2 top-1/2 z-[60] w-[min(100vw-2rem,560px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-border dark:bg-card"
      onClose={onClose}
    >
      <h2 className="text-lg font-semibold text-foreground">Create artifact</h2>
      <p className="mt-2 text-[12px] text-muted-foreground">
        Choose a lifecycle template. You will continue in the template wizard to capture structured content and
        evidence-ready exports.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <label className="text-[11px] font-semibold text-muted-foreground">
          Phase filter
          <select
            value={phaseFilter}
            onChange={(e) => setPhaseFilter(e.target.value)}
            className="ml-2 h-8 rounded-md border border-border bg-background px-2 text-[12px]"
          >
            <option value="all">All phases</option>
            {phaseOptions.map((p) => (
              <option key={p} value={String(p)}>
                Phase {p}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-3 max-h-[min(50vh,360px)] space-y-2 overflow-y-auto rounded-lg border border-border p-2">
        {filtered.length === 0 ? (
          <p className="px-2 py-6 text-center text-[12px] text-muted-foreground">No templates for this phase filter.</p>
        ) : (
          filtered.map((t) => {
            const active = selectedTemplateId === t.templateId;
            return (
              <button
                key={t.templateId}
                type="button"
                onClick={() => setSelectedTemplateId(t.templateId)}
                className={cn(
                  "flex w-full flex-col rounded-lg border px-3 py-2.5 text-left text-[12px] transition",
                  active
                    ? "border-[#2563eb] bg-blue-50/80 dark:bg-blue-950/40"
                    : "border-transparent hover:border-border hover:bg-muted/50",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold text-foreground">{t.title}</span>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                      markerClass(t.marker),
                    )}
                  >
                    {markerLabel(t.marker)}
                  </span>
                </div>
                <span className="mt-1 font-mono text-[10px] text-muted-foreground">{t.templateId}</span>
                <span className="mt-0.5 text-[10px] text-muted-foreground">
                  Phase {t.phaseNumber} · {t.phaseName}
                </span>
              </button>
            );
          })
        )}
      </div>

      <div className="mt-5 flex justify-end gap-2 border-t border-border pt-4">
        <button
          type="button"
          className="h-9 rounded-md border border-border bg-background px-3 text-[12px] font-semibold"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={!selectedTemplateId}
          className="h-9 rounded-md bg-[#2563eb] px-3 text-[12px] font-semibold text-white disabled:opacity-40"
          onClick={continueToWizard}
        >
          Continue
        </button>
      </div>
    </dialog>
  );
}

function VersionHistoryDialog({
  open,
  onClose,
  row,
}: {
  open: boolean;
  onClose: () => void;
  row: ProjectsArtifactsTabRow | null;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [leftV, setLeftV] = useState("");
  const [rightV, setRightV] = useState("");

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && row) {
      const versions = row.versions;
      if (versions.length >= 2) {
        setLeftV(versions[versions.length - 1]!.version);
        setRightV(versions[0]!.version);
      } else {
        const v0 = versions[0]?.version ?? "";
        setLeftV(v0);
        setRightV(v0);
      }
      if (!d.open) d.showModal();
    } else if (d.open) {
      d.close();
    }
  }, [open, row]);

  const leftPayload = row?.versions.find((v) => v.version === leftV)?.jsonPayload ?? "";
  const rightPayload = row?.versions.find((v) => v.version === rightV)?.jsonPayload ?? "";

  return (
    <dialog
      ref={ref}
      data-testid="artifact-version-history-dialog"
      className="fixed left-1/2 top-1/2 z-[60] w-[min(100vw-2rem,720px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-border dark:bg-card"
      onClose={onClose}
    >
      <h2 className="text-lg font-semibold text-foreground">Version history</h2>
      {row ? (
        <>
          <p className="mt-1 text-[12px] text-muted-foreground">{row.name}</p>
          <p className="mt-1 font-mono text-[10px] text-muted-foreground">{row.artifactCode}</p>

          <ul className="mt-4 max-h-40 space-y-2 overflow-y-auto rounded-lg border border-border p-2 text-[11px]">
            {row.versions.map((v) => (
              <li key={v.artifactRowId} className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border/60 pb-2 last:border-0 last:pb-0">
                <div>
                  <span className="font-semibold">v{v.version}</span>
                  {v.isCurrent ? (
                    <span className="ml-2 rounded bg-blue-100 px-1.5 py-0.5 text-[10px] text-blue-800 dark:bg-blue-950 dark:text-blue-100">
                      current
                    </span>
                  ) : null}
                </div>
                <div className="text-right text-muted-foreground">
                  <div>{v.author}</div>
                  <div>{v.timestampLabel}</div>
                </div>
                <p className="w-full text-muted-foreground">{v.changeSummary}</p>
              </li>
            ))}
          </ul>

          {row.versions.length >= 2 ? (
            <div className="mt-4 space-y-2">
              <p className="text-[11px] font-semibold text-muted-foreground">Compare JSON snapshots</p>
              <div className="flex flex-wrap gap-2">
                <label className="text-[11px]">
                  Left
                  <select
                    value={leftV}
                    onChange={(e) => setLeftV(e.target.value)}
                    className="ml-1 h-8 rounded-md border border-border bg-background px-2 text-[11px]"
                  >
                    {row.versions.map((v) => (
                      <option key={`L-${v.artifactRowId}`} value={v.version}>
                        v{v.version}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-[11px]">
                  Right
                  <select
                    value={rightV}
                    onChange={(e) => setRightV(e.target.value)}
                    className="ml-1 h-8 rounded-md border border-border bg-background px-2 text-[11px]"
                  >
                    {row.versions.map((v) => (
                      <option key={`R-${v.artifactRowId}`} value={v.version}>
                        v{v.version}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="grid max-h-48 grid-cols-2 gap-2 overflow-hidden rounded-lg border border-border">
                <pre className="overflow-auto p-2 text-[10px] leading-snug">{leftPayload}</pre>
                <pre className="overflow-auto border-l border-border p-2 text-[10px] leading-snug">{rightPayload}</pre>
              </div>
            </div>
          ) : null}

          <p className="mt-4 text-[11px] text-muted-foreground">
            Restore version is handled from the artifact library when you publish a new revision from an older
            snapshot.
          </p>
        </>
      ) : null}

      <div className="mt-5 flex justify-end">
        <button
          type="button"
          className="h-9 rounded-md border border-border bg-background px-3 text-[12px] font-semibold"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </dialog>
  );
}

function RowActionsMenu({
  row,
  projectId,
  onOpenHistory,
  onArchived,
}: {
  row: ProjectsArtifactsTabRow;
  projectId: string;
  onOpenHistory: () => void;
  onArchived: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onArchive() {
    if (row.status === "archived") return;
    setError(null);
    startTransition(async () => {
      const res = await archiveProjectArtifact({ projectId, artifactId: row.id });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      onArchived();
    });
  }

  return (
    <details className="relative group/menu">
      <summary
        className="flex h-8 w-8 cursor-pointer list-none items-center justify-center rounded-md border border-transparent text-muted-foreground hover:bg-muted hover:text-foreground [&::-webkit-details-marker]:hidden"
        aria-label="Artifact actions"
      >
        <MoreHorizontal className="size-4" />
      </summary>
      <div className="absolute right-0 z-30 mt-1 w-52 rounded-lg border border-border bg-card py-1 text-[11px] shadow-lg">
        <Link href={row.detailHref} className="block px-3 py-2 hover:bg-muted">
          Open
        </Link>
        <Link href={row.templateWizardHref} className="block px-3 py-2 hover:bg-muted">
          Edit in wizard
        </Link>
        <Link href={row.templateWizardHref} className="block px-3 py-2 hover:bg-muted">
          Duplicate (new draft)
        </Link>
        <button
          type="button"
          className="block w-full px-3 py-2 text-left hover:bg-muted"
          onClick={() => {
            downloadTextFile(`${row.templateId}-v${row.version}.md`, row.exportMarkdown, "text/markdown;charset=utf-8");
          }}
        >
          Export Markdown
        </button>
        <button
          type="button"
          className="block w-full px-3 py-2 text-left hover:bg-muted"
          onClick={() => {
            downloadTextFile(`${row.templateId}-v${row.version}.json`, row.exportJson, "application/json;charset=utf-8");
          }}
        >
          Export JSON evidence
        </button>
        <button type="button" className="block w-full px-3 py-2 text-left hover:bg-muted" onClick={onOpenHistory}>
          View version history
        </button>
        <Link href={row.evidenceCenterHref} className="block px-3 py-2 hover:bg-muted">
          Link evidence
        </Link>
        <button
          type="button"
          disabled={pending || row.status === "archived"}
          className="block w-full px-3 py-2 text-left text-rose-700 hover:bg-rose-50 disabled:opacity-40 dark:text-rose-300 dark:hover:bg-rose-950/40"
          onClick={onArchive}
        >
          {row.status === "archived" ? "Archived" : pending ? "Archiving…" : "Archive"}
        </button>
        {error ? <p className="px-3 py-1 text-[10px] text-rose-600">{error}</p> : null}
      </div>
    </details>
  );
}

export function ProjectArtifactsTab({
  data,
  projectCode,
}: {
  data: ProjectsArtifactsTabData;
  projectCode: string;
}) {
  const router = useRouter();
  const [templateOpen, setTemplateOpen] = useState(false);
  const [historyRow, setHistoryRow] = useState<ProjectsArtifactsTabRow | null>(null);

  return (
    <div className="space-y-4">
      <section className="cc-card-standard p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="cc-card-title">Artifacts</h3>
            <p className="cc-card-meta mt-1 max-w-prose">
              Inventory for {projectCode} — latest revision per template instance. Open the full library for tabs,
              comments, and publishing controls.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="inline-flex h-9 items-center gap-2 rounded-md bg-[#2563eb] px-3 text-[11px] font-semibold text-white"
              onClick={() => setTemplateOpen(true)}
            >
              <Plus className="size-3.5" />
              Create artifact
            </button>
            <Link
              href={data.fullLibraryHref}
              className="inline-flex h-9 items-center gap-1 rounded-md border border-border bg-background px-3 text-[11px] font-semibold"
            >
              Open artifact library
              <ChevronRight className="size-3.5 text-muted-foreground" />
            </Link>
          </div>
        </div>
      </section>

      <section className="cc-card-standard overflow-hidden p-0">
        <header className="border-b border-border px-4 py-3">
          <h4 className="text-sm font-semibold text-foreground">Latest artifacts</h4>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Phase {data.currentPhase} of 14 · {data.artifacts.length} logical artifact
            {data.artifacts.length === 1 ? "" : "s"}
          </p>
        </header>
        {data.artifacts.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-4 py-12 text-center">
            <FileText className="size-10 text-muted-foreground" aria-hidden />
            <p className="max-w-sm text-[12px] text-muted-foreground">
              No artifacts yet. Create one from a template or open the library after seeding workspace data.
            </p>
            <button
              type="button"
              className="inline-flex h-9 items-center gap-2 rounded-md bg-[#2563eb] px-3 text-[11px] font-semibold text-white"
              onClick={() => setTemplateOpen(true)}
            >
              <Plus className="size-3.5" />
              Create artifact
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-[11px]">
              <thead className="border-b border-border bg-muted/40 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Artifact</th>
                  <th className="px-3 py-2">Phase</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Version</th>
                  <th className="px-3 py-2">Updated</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.artifacts.map((row) => (
                  <tr key={row.id} className="border-b border-border/70 last:border-0 hover:bg-muted/30">
                    <td className="px-3 py-2">
                      <Link href={row.detailHref} className="font-semibold text-foreground hover:underline">
                        {row.name}
                      </Link>
                      <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">{row.artifactCode}</p>
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">Phase {row.phaseNumber}</td>
                    <td className="px-3 py-2">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize",
                          statusBadgeClass(row.status),
                        )}
                      >
                        {row.status.replaceAll("_", " ")}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-mono text-muted-foreground">v{row.version}</td>
                    <td className="px-3 py-2 text-muted-foreground">{row.lastUpdatedLabel}</td>
                    <td className="px-3 py-2 text-right">
                      <RowActionsMenu
                        row={row}
                        projectId={data.projectId}
                        onOpenHistory={() => {
                          setHistoryRow(row);
                        }}
                        onArchived={() => router.refresh()}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <TemplateSelectionModal open={templateOpen} onClose={() => setTemplateOpen(false)} data={data} />
      <VersionHistoryDialog open={historyRow !== null} onClose={() => setHistoryRow(null)} row={historyRow} />
    </div>
  );
}
