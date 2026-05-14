"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Download,
  ExternalLink,
  FolderOpen,
  Link2,
  MoreHorizontal,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import {
  createEvidenceItem,
  linkEvidenceToWorkspacePhase,
  unlinkEvidenceFromWorkspace,
} from "@/app/actions/evidence";
import type {
  EvidenceAttachment,
  EvidenceWorkspaceContextPayload,
} from "@/components/lifecycle-workspace/evidence-attachments-types";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const iconLinkClass = cn(
  buttonVariants({ variant: "ghost", size: "icon-xs" }),
  "text-muted-foreground",
);

function RightDrawer({
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

function TypeIcon() {
  const common = "size-4 shrink-0 text-muted-foreground";
  return <FolderOpen className={common} aria-hidden />;
}

export type EvidenceAttachmentsProps = {
  attachments: EvidenceAttachment[];
  projectRecordId: string;
  evidenceWorkspace: EvidenceWorkspaceContextPayload;
};

export function EvidenceAttachments({
  attachments,
  projectRecordId,
  evidenceWorkspace,
}: EvidenceAttachmentsProps) {
  const router = useRouter();
  const [detailRow, setDetailRow] = useState<EvidenceAttachment | null>(null);
  const [downloadRow, setDownloadRow] = useState<EvidenceAttachment | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [removeRow, setRemoveRow] = useState<EvidenceAttachment | null>(null);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [addTab, setAddTab] = useState<"upload" | "link">("link");
  const [addName, setAddName] = useState("");
  const [addType, setAddType] = useState<EvidenceAttachment["type"]>("document");
  const [addClassification, setAddClassification] = useState<
    "public" | "internal" | "confidential" | "restricted"
  >("internal");
  const [addNotes, setAddNotes] = useState("");
  const [addUrl, setAddUrl] = useState("");
  const [addArtifactId, setAddArtifactId] = useState("");

  const [linkSearch, setLinkSearch] = useState("");
  const [linkPickId, setLinkPickId] = useState("");
  const [linkTarget, setLinkTarget] = useState<"phase" | "artifact" | "gate">("phase");
  const [linkArtifactId, setLinkArtifactId] = useState("");
  const [linkRationale, setLinkRationale] = useState("");

  const [removeReason, setRemoveReason] = useState("");

  const filteredLinkPool = useMemo(() => {
    const q = linkSearch.trim().toLowerCase();
    if (!q) return evidenceWorkspace.linkableEvidence;
    return evidenceWorkspace.linkableEvidence.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.evidenceCode.toLowerCase().includes(q) ||
        e.id.toLowerCase().includes(q),
    );
  }, [evidenceWorkspace.linkableEvidence, linkSearch]);

  useEffect(() => {
    const first = filteredLinkPool[0];
    if (linkOpen && first && !linkPickId) setLinkPickId(first.id);
  }, [filteredLinkPool, linkOpen, linkPickId]);

  const count = attachments.length;

  const exportBase = `/api/projects/${projectRecordId}/evidence/export`;

  async function onSaveAdd() {
    if (addTab === "upload") {
      setFormError("File upload is not available yet. Use External link to attach evidence.");
      return;
    }
    setBusy(true);
    setFormError(null);
    if (addTab === "link") {
      const u = addUrl.trim();
      if (!/^https?:\/\//i.test(u)) {
        setFormError("Enter a valid http(s) URL for external evidence.");
        setBusy(false);
        return;
      }
    }
    const name = addName.trim() || "Untitled evidence";
    const res = await createEvidenceItem({
      projectId: projectRecordId,
      name,
      description: addNotes.trim() || undefined,
      evidenceType: addTab === "link" ? "link" : addType,
      phaseNumber: evidenceWorkspace.workspacePhaseNumber,
      gateCode: evidenceWorkspace.gateCode,
      classification: addClassification,
      notes: addNotes.trim() || undefined,
      sourceUrl: addTab === "link" ? addUrl.trim() : undefined,
      linkedArtifactId: addArtifactId.trim() || undefined,
    });
    setBusy(false);
    if (!res.ok) {
      setFormError(res.error);
      return;
    }
    setAddOpen(false);
    setAddName("");
    setAddNotes("");
    setAddUrl("");
    setAddArtifactId("");
    router.refresh();
  }

  async function onConfirmLink() {
    if (!linkPickId) {
      setFormError("Select an evidence item.");
      return;
    }
    const r = linkRationale.trim();
    if (!r) {
      setFormError("Link rationale is required.");
      return;
    }
    if (linkTarget === "artifact" && !linkArtifactId.trim()) {
      setFormError("Select an artifact for artifact linking.");
      return;
    }
    setBusy(true);
    setFormError(null);
    const res = await linkEvidenceToWorkspacePhase({
      projectId: projectRecordId,
      evidenceId: linkPickId,
      phaseNumber: evidenceWorkspace.workspacePhaseNumber,
      gateCode: evidenceWorkspace.gateCode,
      artifactId:
        linkTarget === "artifact" && linkArtifactId.trim() ? linkArtifactId.trim() : undefined,
      rationale: r,
    });
    setBusy(false);
    if (!res.ok) {
      setFormError(res.error);
      return;
    }
    setLinkOpen(false);
    setLinkRationale("");
    setLinkSearch("");
    router.refresh();
  }

  async function onConfirmRemove() {
    if (!removeRow || removeRow.rowKind !== "evidence_item") return;
    const r = removeReason.trim();
    if (!r) {
      setFormError("Reason is required.");
      return;
    }
    setBusy(true);
    setFormError(null);
    const res = await unlinkEvidenceFromWorkspace({
      projectId: projectRecordId,
      evidenceId: removeRow.id,
      reason: r,
    });
    setBusy(false);
    if (!res.ok) {
      setFormError(res.error);
      return;
    }
    setRemoveRow(null);
    setRemoveReason("");
    router.refresh();
  }

  return (
    <section
      id="evidence-attachments"
      aria-labelledby="evidence-attachments-heading"
      className="evidence-attachments rounded-lg border bg-card shadow-sm"
    >
      <div className="card-header flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <h3 id="evidence-attachments-heading" className="flex items-center gap-2 text-sm font-semibold">
            <span className="inline-flex size-5 items-center justify-center rounded bg-[#e7f0ff]">
              <FolderOpen className="size-3.5 text-[#2563eb]" aria-hidden />
            </span>
            Evidence attachments
          </h3>
          <span
            className="count-badge rounded-full bg-muted px-2 py-0.5 text-xs font-semibold tabular-nums text-foreground"
            aria-label={`${count} attachments`}
          >
            {count}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            type="button"
            data-testid="add-evidence"
            onClick={() => {
              setFormError(null);
              setAddOpen(true);
            }}
          >
            <Plus className="size-3.5" />
            Add evidence
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            type="button"
            data-testid="link-existing-evidence"
            onClick={() => {
              setFormError(null);
              setLinkOpen(true);
            }}
            disabled={evidenceWorkspace.linkableEvidence.length === 0}
          >
            <Link2 className="size-3.5" />
            Link existing evidence
          </Button>
        </div>
      </div>
      <div className="card-scroll-area">
        <table className="evidence-table w-full min-w-[720px] text-[13px]">
          <thead>
            <tr className="border-b bg-muted/30 text-left text-[11px] font-semibold text-muted-foreground">
              <th className="px-4 py-2.5">Evidence</th>
              <th className="px-4 py-2.5">Type</th>
              <th className="px-4 py-2.5">Linked to</th>
              <th className="px-4 py-2.5">Added by</th>
              <th className="px-4 py-2.5">Added on</th>
              <th className="px-4 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {attachments.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No evidence attached yet.
                </td>
              </tr>
            ) : (
              attachments.map((row) => (
                <tr
                  key={row.id}
                  data-testid="evidence-attachment-row"
                  className="cursor-pointer border-b last:border-0 hover:bg-muted/20"
                  onClick={() => setDetailRow(row)}
                >
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2 font-medium">
                      <TypeIcon />
                      <button
                        type="button"
                        className="text-left text-[#2563eb] hover:underline"
                        data-testid="evidence-open-detail"
                        onClick={() => setDetailRow(row)}
                      >
                        {row.name}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 capitalize text-muted-foreground">{row.type}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {row.linkedTo.map((code) => (
                        <code key={code} className="rounded bg-muted px-1.5 py-0.5 text-xs">
                          {code}
                        </code>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">{row.addedBy}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{row.addedOnLabel}</td>
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <div
                      className="flex flex-wrap items-center justify-end gap-0.5"
                      role="group"
                      aria-label={`Actions for ${row.name}`}
                    >
                      <Link href={row.href} className={iconLinkClass} aria-label={`Open ${row.name}`}>
                        <ExternalLink className="size-4" />
                      </Link>
                      <button
                        type="button"
                        className={iconLinkClass}
                        aria-label={`Download options for ${row.name}`}
                        data-testid="evidence-download-options"
                        onClick={() => setDownloadRow(row)}
                      >
                        <Download className="size-4" />
                      </button>
                      {row.rowKind === "evidence_item" && row.canUnlink !== false ? (
                        <button
                          type="button"
                          className={iconLinkClass}
                          aria-label={`Remove workspace link for ${row.name}`}
                          data-testid="remove-evidence-link"
                          onClick={() => {
                            setFormError(null);
                            setRemoveRow(row);
                          }}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      ) : null}
                      <Link href={row.href} className={iconLinkClass} aria-label={`More for ${row.name}`}>
                        <MoreHorizontal className="size-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <RightDrawer
        open={detailRow != null}
        title="Evidence detail"
        onClose={() => setDetailRow(null)}
        testId="evidence-detail-drawer"
        footer={
          detailRow ? (
            <div className="flex flex-wrap justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setDetailRow(null)}>
                Close
              </Button>
              <Link href={detailRow.href} className={buttonVariants({ size: "sm" })}>
                Open full view
              </Link>
            </div>
          ) : null
        }
      >
        {detailRow ? (
          <div className="space-y-3 text-[13px]">
            <p className="font-medium text-foreground">{detailRow.name}</p>
            {detailRow.description ? (
              <p className="text-muted-foreground">{detailRow.description}</p>
            ) : null}
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">Metadata</p>
              <ul className="mt-1 list-inside list-disc text-foreground/90">
                <li>Type: {detailRow.type}</li>
                {detailRow.classification ? <li>Classification: {detailRow.classification}</li> : null}
                {detailRow.phaseNumber != null ? <li>Linked phase: {detailRow.phaseNumber}</li> : null}
                {detailRow.gateCode ? <li>Linked gate: {detailRow.gateCode}</li> : null}
                <li>Completeness: {detailRow.completenessPercent ?? "—"}%</li>
                {detailRow.versionLabel ? <li>Version: {detailRow.versionLabel}</li> : null}
                {detailRow.checksum ? <li>Checksum: {detailRow.checksum}</li> : <li>Checksum: —</li>}
              </ul>
            </div>
            {detailRow.externalUrl ? (
              <p>
                <span className="text-xs font-semibold uppercase text-muted-foreground">External</span>
                <br />
                <Link href={detailRow.externalUrl} className="text-[#2563eb] hover:underline" target="_blank">
                  {detailRow.externalUrl}
                </Link>
              </p>
            ) : null}
          </div>
        ) : null}
      </RightDrawer>

      {downloadRow ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4" role="presentation">
          <div
            className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl"
            data-testid="evidence-download-options-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dl-ev-title"
          >
            <div className="flex items-start justify-between gap-2">
              <h2 id="dl-ev-title" className="text-lg font-semibold text-foreground">
                Download options
              </h2>
              <button
                type="button"
                className="rounded-md p-2 text-muted-foreground hover:bg-muted"
                onClick={() => setDownloadRow(null)}
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{downloadRow.name}</p>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link
                  className="text-[#2563eb] hover:underline"
                  href={downloadRow.externalUrl ?? downloadRow.href}
                  target="_blank"
                >
                  Open / download primary reference
                </Link>
              </li>
              {downloadRow.rowKind === "evidence_item" ? (
                <li>
                  <Link
                    className="text-[#2563eb] hover:underline"
                    href={`${exportBase}?scope=selected&selectedId=${encodeURIComponent(downloadRow.id)}`}
                    target="_blank"
                  >
                    Download metadata JSON (export)
                  </Link>
                </li>
              ) : (
                <li className="text-muted-foreground">Metadata JSON export applies to registered evidence items.</li>
              )}
              <li>
                <span className={downloadRow.checksum ? "text-foreground" : "text-muted-foreground"}>
                  Checksum manifest: {downloadRow.checksum ?? "Not recorded for this row"}
                </span>
              </li>
              <li>
                <Link className="text-[#2563eb] hover:underline" href={`${exportBase}?scope=full`} target="_blank">
                  Download evidence package (full project bundle)
                </Link>
              </li>
            </ul>
            <div className="mt-6 flex justify-end">
              <Button type="button" variant="outline" onClick={() => setDownloadRow(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {addOpen ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4" role="presentation">
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-xl"
            data-testid="add-evidence-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-ev-title"
          >
            <div className="flex items-start justify-between gap-2">
              <h2 id="add-ev-title" className="text-lg font-semibold text-foreground">
                Add evidence
              </h2>
              <button
                type="button"
                className="rounded-md p-2 text-muted-foreground hover:bg-muted"
                onClick={() => setAddOpen(false)}
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="mt-3 flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={addTab === "link" ? "default" : "outline"}
                onClick={() => setAddTab("link")}
              >
                External link
              </Button>
              <Button
                type="button"
                size="sm"
                variant={addTab === "upload" ? "default" : "outline"}
                onClick={() => setAddTab("upload")}
              >
                Upload file (coming soon)
              </Button>
            </div>
            <div className="mt-4 space-y-3 text-sm">
              <label className="block space-y-1">
                <span className="text-xs font-medium text-muted-foreground">Evidence name</span>
                <input
                  className="w-full rounded-md border border-input bg-background px-2 py-1.5"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                />
              </label>
              {addTab === "upload" ? (
                <div className="rounded-md border border-dashed border-border bg-muted/20 px-3 py-3 text-xs text-muted-foreground">
                  Upload is intentionally disabled until a compliant binary evidence pipeline is available.
                  Use <span className="font-medium">External link</span> for now.
                </div>
              ) : (
                <label className="block space-y-1">
                  <span className="text-xs font-medium text-muted-foreground">External URL</span>
                  <input
                    className="w-full rounded-md border border-input bg-background px-2 py-1.5"
                    value={addUrl}
                    onChange={(e) => setAddUrl(e.target.value)}
                    placeholder="https://"
                  />
                </label>
              )}
              <label className="block space-y-1">
                <span className="text-xs font-medium text-muted-foreground">Evidence type</span>
                <select
                  className="w-full rounded-md border border-input bg-background px-2 py-1.5"
                  value={addType}
                  onChange={(e) => setAddType(e.target.value as EvidenceAttachment["type"])}
                  disabled={addTab === "link"}
                >
                  <option value="document">Document</option>
                  <option value="pdf">PDF</option>
                  <option value="spreadsheet">Spreadsheet</option>
                  <option value="image">Image</option>
                  <option value="json">JSON</option>
                  <option value="markdown">Markdown</option>
                </select>
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-medium text-muted-foreground">Classification</span>
                <select
                  className="w-full rounded-md border border-input bg-background px-2 py-1.5"
                  value={addClassification}
                  onChange={(e) =>
                    setAddClassification(e.target.value as typeof addClassification)
                  }
                >
                  <option value="internal">Internal</option>
                  <option value="public">Public</option>
                  <option value="confidential">Confidential</option>
                  <option value="restricted">Restricted</option>
                </select>
              </label>
              <div className="grid gap-2 sm:grid-cols-2">
                <label className="block space-y-1">
                  <span className="text-xs font-medium text-muted-foreground">Linked phase</span>
                  <input
                    readOnly
                    className="w-full rounded-md border border-input bg-muted px-2 py-1.5 text-muted-foreground"
                    value={String(evidenceWorkspace.workspacePhaseNumber)}
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-xs font-medium text-muted-foreground">Linked gate</span>
                  <input
                    readOnly
                    className="w-full rounded-md border border-input bg-muted px-2 py-1.5 text-muted-foreground"
                    value={evidenceWorkspace.gateCode}
                  />
                </label>
              </div>
              <label className="block space-y-1">
                <span className="text-xs font-medium text-muted-foreground">Linked artifact (optional)</span>
                <select
                  className="w-full rounded-md border border-input bg-background px-2 py-1.5"
                  value={addArtifactId}
                  onChange={(e) => setAddArtifactId(e.target.value)}
                >
                  <option value="">— None —</option>
                  {evidenceWorkspace.artifactOptions.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-medium text-muted-foreground">Notes</span>
                <textarea
                  className="min-h-[72px] w-full rounded-md border border-input bg-background px-2 py-1.5"
                  value={addNotes}
                  onChange={(e) => setAddNotes(e.target.value)}
                />
              </label>
            </div>
            {formError ? <p className="mt-2 text-sm text-destructive">{formError}</p> : null}
            <div className="mt-6 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)} disabled={busy}>
                Cancel
              </Button>
              <Button type="button" onClick={() => void onSaveAdd()} disabled={busy || addTab === "upload"}>
                Save evidence
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {linkOpen ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4" role="presentation">
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-xl"
            data-testid="link-existing-evidence-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="link-ev-title"
          >
            <div className="flex items-start justify-between gap-2">
              <h2 id="link-ev-title" className="text-lg font-semibold text-foreground">
                Link existing evidence
              </h2>
              <button
                type="button"
                className="rounded-md p-2 text-muted-foreground hover:bg-muted"
                onClick={() => setLinkOpen(false)}
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>
            <label className="mt-3 block space-y-1 text-sm">
              <span className="text-xs font-medium text-muted-foreground">Search</span>
              <input
                className="w-full rounded-md border border-input bg-background px-2 py-1.5"
                value={linkSearch}
                onChange={(e) => setLinkSearch(e.target.value)}
                placeholder="Filter by name or code"
              />
            </label>
            <div className="mt-2 max-h-40 overflow-y-auto rounded-md border border-border">
              {filteredLinkPool.map((e) => (
                <button
                  key={e.id}
                  type="button"
                  className={cn(
                    "flex w-full flex-col items-start gap-0.5 border-b px-3 py-2 text-left text-sm last:border-0 hover:bg-muted/40",
                    linkPickId === e.id && "bg-muted/60",
                  )}
                  onClick={() => setLinkPickId(e.id)}
                >
                  <span className="font-medium">{e.name}</span>
                  <span className="text-xs text-muted-foreground">{e.evidenceCode}</span>
                </button>
              ))}
            </div>
            <fieldset className="mt-4 space-y-2 text-sm">
              <legend className="text-xs font-semibold uppercase text-muted-foreground">Link target</legend>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="linkTarget"
                  checked={linkTarget === "phase"}
                  onChange={() => setLinkTarget("phase")}
                />
                Phase workspace ({evidenceWorkspace.workspacePhaseNumber})
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="linkTarget"
                  checked={linkTarget === "artifact"}
                  onChange={() => setLinkTarget("artifact")}
                />
                Artifact
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="linkTarget"
                  checked={linkTarget === "gate"}
                  onChange={() => setLinkTarget("gate")}
                />
                Gate ({evidenceWorkspace.gateCode})
              </label>
            </fieldset>
            {linkTarget === "artifact" ? (
              <label className="mt-3 block space-y-1 text-sm">
                <span className="text-xs font-medium text-muted-foreground">Artifact</span>
                <select
                  className="w-full rounded-md border border-input bg-background px-2 py-1.5"
                  value={linkArtifactId}
                  onChange={(e) => setLinkArtifactId(e.target.value)}
                >
                  <option value="">Select artifact</option>
                  {evidenceWorkspace.artifactOptions.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            <label className="mt-3 block space-y-1 text-sm">
              <span className="text-xs font-medium text-muted-foreground">Link rationale</span>
              <textarea
                className="min-h-[80px] w-full rounded-md border border-input bg-background px-2 py-1.5"
                value={linkRationale}
                onChange={(e) => setLinkRationale(e.target.value)}
              />
            </label>
            {formError ? <p className="mt-2 text-sm text-destructive">{formError}</p> : null}
            <div className="mt-6 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setLinkOpen(false)} disabled={busy}>
                Cancel
              </Button>
              <Button type="button" onClick={() => void onConfirmLink()} disabled={busy}>
                Link evidence
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {removeRow ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4" role="presentation">
          <div
            className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl"
            data-testid="remove-evidence-link-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="rm-ev-title"
          >
            <h2 id="rm-ev-title" className="text-lg font-semibold text-foreground">
              Remove evidence link
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Evidence: <span className="font-medium text-foreground">{removeRow.name}</span>
            </p>
            <p className="mt-2 text-sm text-foreground">
              This removes the workspace phase association from the evidence record. The evidence item itself is not
              deleted.
            </p>
            <label className="mt-4 block space-y-1 text-sm">
              <span className="text-xs font-medium text-muted-foreground">Required reason</span>
              <textarea
                className="min-h-[80px] w-full rounded-md border border-input bg-background px-2 py-1.5"
                value={removeReason}
                onChange={(e) => setRemoveReason(e.target.value)}
              />
            </label>
            {formError ? <p className="mt-2 text-sm text-destructive">{formError}</p> : null}
            <div className="mt-6 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setRemoveRow(null);
                  setRemoveReason("");
                  setFormError(null);
                }}
                disabled={busy}
              >
                Cancel
              </Button>
              <Button type="button" variant="destructive" onClick={() => void onConfirmRemove()} disabled={busy}>
                Remove link
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
