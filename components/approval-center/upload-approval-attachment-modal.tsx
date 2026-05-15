"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatDateTimeAbsolute } from "@/lib/datetime-format";
import type {
  ApprovalAttachment,
  ApprovalAttachmentClassification,
  ApprovalAttachmentLink,
  ApprovalPackage,
} from "@/types/approval-center.types";

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

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function nowLabel() {
  return formatDateTimeAbsolute(new Date());
}

const dialogFrame =
  "w-[min(100vw-2rem,520px)] rounded-2xl border border-slate-200 bg-white p-0 shadow-xl backdrop:bg-slate-900/40 dark:border-border dark:bg-card";

export function UploadApprovalAttachmentModal({
  open,
  pkg,
  uploadedBy,
  onClose,
  onConfirm,
}: {
  open: boolean;
  pkg: ApprovalPackage;
  uploadedBy: string;
  onClose: () => void;
  onConfirm: (attachment: ApprovalAttachment) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [attachmentType, setAttachmentType] = useState("Supporting document");
  const [description, setDescription] = useState("");
  const [linkChoice, setLinkChoice] = useState<string>("none");
  const [classification, setClassification] = useState<ApprovalAttachmentClassification>("internal");

  const dialogRef = useModalOpen(open, () => {
    setFile(null);
    setAttachmentType("Supporting document");
    setDescription("");
    setLinkChoice("none");
    setClassification("internal");
  });

  const buildLink = (): ApprovalAttachmentLink => {
    if (linkChoice === "evidence" && pkg.detail.evidenceListHref) {
      return { kind: "evidence", label: "Evidence hub", href: pkg.detail.evidenceListHref };
    }
    if (linkChoice === "evidence") {
      return { kind: "evidence", label: "Evidence hub" };
    }
    if (linkChoice.startsWith("input:")) {
      const id = linkChoice.slice("input:".length);
      const inp = pkg.requiredInputs.find((r) => r.id === id);
      if (inp) {
        return {
          kind: "required_input",
          inputId: inp.id,
          inputName: inp.name,
          href: inp.linkedObjectHref,
        };
      }
    }
    if (linkChoice.startsWith("comment:")) {
      const id = linkChoice.slice("comment:".length);
      const top = pkg.comments.find((c) => c.id === id);
      if (top) {
        return { kind: "comment", commentId: top.id, preview: top.body.slice(0, 160) };
      }
    }
    return { kind: "none" };
  };

  const submit = () => {
    if (!file) return;
    const att: ApprovalAttachment = {
      id: `att-upload-${Date.now()}`,
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
      sizeLabel: formatSize(file.size),
      attachmentType,
      description: description.trim() || undefined,
      uploadedBy,
      uploadedOnLabel: nowLabel(),
      classification,
      link: buildLink(),
      previewHint: "Uploaded in this session only until a files API is connected.",
    };
    onConfirm(att);
    onClose();
  };

  return (
    <dialog ref={dialogRef} onClose={onClose} className={dialogFrame} aria-labelledby="upload-att-title">
      <div className="flex max-h-[90vh] flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <h2 id="upload-att-title" className="text-lg font-semibold text-slate-900 dark:text-foreground">
              Upload attachment
            </h2>
            <p className="mt-1 text-sm text-slate-600">Adds a file to this approval package (browser-local until upload API exists).</p>
          </div>
          <Button type="button" variant="outline" size="icon-sm" aria-label="Close" onClick={onClose}>
            <X className="size-4" aria-hidden />
          </Button>
        </header>

        <div className="space-y-4 overflow-y-auto px-5 py-4 text-sm">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="upload-file">
              File
            </label>
            <input
              id="upload-file"
              type="file"
              className="mt-1 block w-full text-sm"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="upload-type">
              Attachment type
            </label>
            <select
              id="upload-type"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 dark:border-border dark:bg-background"
              value={attachmentType}
              onChange={(e) => setAttachmentType(e.target.value)}
            >
              {["Supporting document", "Evidence excerpt", "Signed PDF", "Screenshot", "Other"].map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="upload-desc">
              Description
            </label>
            <textarea
              id="upload-desc"
              rows={3}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 dark:border-border dark:bg-background"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional context for reviewers"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="upload-link">
              Link to
            </label>
            <select
              id="upload-link"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 dark:border-border dark:bg-background"
              value={linkChoice}
              onChange={(e) => setLinkChoice(e.target.value)}
            >
              <option value="none">None</option>
              {pkg.requiredInputs.map((inp) => (
                <option key={inp.id} value={`input:${inp.id}`}>
                  Required input: {inp.name}
                </option>
              ))}
              <option value="evidence">Evidence hub</option>
              {pkg.comments.map((c) => (
                <option key={c.id} value={`comment:${c.id}`}>
                  Comment: {c.body.slice(0, 48)}
                  {c.body.length > 48 ? "…" : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="upload-class">
              Classification
            </label>
            <select
              id="upload-class"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 dark:border-border dark:bg-background"
              value={classification}
              onChange={(e) => setClassification(e.target.value as ApprovalAttachmentClassification)}
            >
              <option value="public">Public</option>
              <option value="internal">Internal</option>
              <option value="confidential">Confidential</option>
            </select>
          </div>
        </div>

        <footer className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={submit} disabled={!file}>
            Upload
          </Button>
        </footer>
      </div>
    </dialog>
  );
}
