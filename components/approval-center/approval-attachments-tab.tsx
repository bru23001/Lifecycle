"use client";

import { useState } from "react";
import { Paperclip } from "lucide-react";

import { ApprovalAttachmentPreviewDrawer } from "@/components/approval-center/approval-attachment-preview-drawer";
import { UploadApprovalAttachmentModal } from "@/components/approval-center/upload-approval-attachment-modal";
import { Button } from "@/components/ui/button";
import { downloadJson } from "@/lib/download-json";
import { formatDateTimeAbsolute } from "@/lib/datetime-format";
import type { ApprovalAttachment, ApprovalHistoryEvent, ApprovalPackage } from "@/types/approval-center.types";

function nowLabel() {
  return formatDateTimeAbsolute(new Date());
}

export function ApprovalAttachmentsTab({
  pkg,
  uploadedBy,
  onPatchPackage,
  disabled,
}: {
  pkg: ApprovalPackage;
  uploadedBy: string;
  onPatchPackage: (updater: (prev: ApprovalPackage) => ApprovalPackage) => void;
  disabled?: boolean;
}) {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [preview, setPreview] = useState<ApprovalAttachment | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const openPreview = (a: ApprovalAttachment) => {
    setPreview(a);
    setPreviewOpen(true);
  };

  const closePreview = () => {
    setPreviewOpen(false);
    setPreview(null);
  };

  const onUploadConfirm = (att: ApprovalAttachment) => {
    const hist: ApprovalHistoryEvent = {
      id: `hist-${Date.now()}`,
      approvalId: pkg.detail.id,
      eventType: "attachment_uploaded",
      title: "Attachment uploaded",
      actorName: uploadedBy,
      actorRole: "Reviewer",
      timestampLabel: nowLabel(),
      description: `${att.fileName} added to the approval package.`,
      statusTone: "blue",
      relatedObjectLabel: att.fileName,
    };
    onPatchPackage((prev) => ({
      ...prev,
      attachments: [...prev.attachments, att],
      history: [hist, ...prev.history],
    }));
    setNotice(`${att.fileName} attached.`);
    window.setTimeout(() => setNotice(null), 2800);
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      {notice ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          {notice}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-foreground">Attached files</h3>
          <p className="text-xs text-slate-500">{pkg.attachments.length} file{pkg.attachments.length === 1 ? "" : "s"} in this package</p>
        </div>
        <Button type="button" size="sm" className="gap-1.5" disabled={disabled} onClick={() => setUploadOpen(true)}>
          <Paperclip className="size-3.5" aria-hidden />
          Upload attachment
        </Button>
      </div>

      <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-0.5">
        {pkg.attachments.length === 0 ? (
          <li className="rounded-lg border border-dashed border-slate-200 bg-slate-50/80 px-3 py-8 text-center text-sm text-slate-600 dark:border-border dark:bg-muted/30">
            No attachments yet. Upload a file or use Download review package from the overflow menu.
          </li>
        ) : (
          pkg.attachments.map((a) => (
            <li key={a.id}>
              <button
                type="button"
                disabled={disabled}
                onClick={() => openPreview(a)}
                className="flex w-full flex-col items-start gap-1 rounded-xl border border-slate-200 bg-white px-3 py-3 text-left shadow-sm transition hover:border-slate-300 hover:bg-slate-50/80 disabled:cursor-not-allowed disabled:opacity-60 dark:border-border dark:bg-card dark:hover:bg-muted/50"
              >
                <span className="font-medium text-slate-900 dark:text-foreground">{a.fileName}</span>
                <span className="text-xs text-slate-600">
                  {a.attachmentType} · {a.sizeLabel} · {a.uploadedOnLabel}
                </span>
                <span className="text-[11px] capitalize text-slate-500">{a.classification}</span>
              </button>
            </li>
          ))
        )}
      </ul>

      <UploadApprovalAttachmentModal
        open={uploadOpen}
        pkg={pkg}
        uploadedBy={uploadedBy}
        onClose={() => setUploadOpen(false)}
        onConfirm={onUploadConfirm}
      />

      <ApprovalAttachmentPreviewDrawer
        open={previewOpen && Boolean(preview)}
        attachment={preview}
        packageTitle={pkg.detail.title}
        onClose={closePreview}
        onDownloadPlaceholder={() => {
          if (!preview) return;
          downloadJson(`approval-${pkg.detail.id}-attachment-${preview.id}.json`, {
            schema: "cybercube.attachment_download_stub@v1",
            fileName: preview.fileName,
            mimeType: preview.mimeType,
            note: "Binary download would be served by the files API; this stub keeps the action tangible in local mode.",
          });
        }}
      />
    </div>
  );
}
