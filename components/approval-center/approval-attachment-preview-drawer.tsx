"use client";

import Link from "next/link";
import { useEffect, useRef, type ReactNode } from "react";
import { Download, FileText, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ApprovalAttachment } from "@/types/approval-center.types";

export function ApprovalAttachmentPreviewDrawer({
  open,
  attachment,
  packageTitle,
  onClose,
  onDownloadPlaceholder,
}: {
  open: boolean;
  attachment: ApprovalAttachment | null;
  packageTitle: string;
  onClose: () => void;
  onDownloadPlaceholder: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const prevOpen = useRef(false);

  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;
    if (open && attachment) {
      if (!prevOpen.current && !node.open) node.showModal();
    } else if (node.open) {
      node.close();
    }
    prevOpen.current = Boolean(open && attachment);
  }, [open, attachment]);

  if (!attachment) return null;

  const link = attachment.link;
  let linkedBlock: ReactNode = <p className="text-sm text-slate-500">No linked object.</p>;
  if (link.kind === "required_input") {
    linkedBlock = link.href ? (
      <Link href={link.href} className="text-sm font-semibold text-[#2563eb] hover:underline">
        {link.inputName}
      </Link>
    ) : (
      <p className="text-sm text-slate-800">{link.inputName}</p>
    );
  } else if (link.kind === "evidence") {
    linkedBlock = link.href ? (
      <Link href={link.href} className="text-sm font-semibold text-[#2563eb] hover:underline">
        {link.label}
      </Link>
    ) : (
      <p className="text-sm text-slate-800">{link.label}</p>
    );
  } else if (link.kind === "comment") {
    linkedBlock = (
      <div>
        <p className="text-xs uppercase text-slate-500">Comment</p>
        <p className="text-sm text-slate-800">{link.preview}</p>
      </div>
    );
  }

  const isImage = attachment.mimeType.startsWith("image/");

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="ml-auto mr-0 my-0 h-screen max-h-screen w-[min(100vw,440px)] translate-x-0 rounded-none border-l border-slate-200 bg-white p-0 shadow-2xl backdrop:bg-slate-900/40 dark:border-border dark:bg-card"
      aria-labelledby="att-drawer-title"
    >
      <div className="flex h-full flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-border">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Attachment</p>
            <h2 id="att-drawer-title" className="mt-1 break-words text-lg font-semibold text-slate-900 dark:text-foreground">
              {attachment.fileName}
            </h2>
            <p className="mt-0.5 text-sm text-slate-600">{packageTitle}</p>
          </div>
          <Button type="button" variant="outline" size="icon-sm" aria-label="Close drawer" onClick={onClose}>
            <X className="size-5" aria-hidden />
          </Button>
        </header>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-4 text-sm">
          <div
            className={cn(
              "flex min-h-[140px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 dark:border-border dark:bg-muted/40",
              isImage && "border-solid",
            )}
          >
            {isImage ? (
              <p className="px-4 text-center text-sm text-slate-600">Image preview requires a file URL. {attachment.previewHint}</p>
            ) : (
              <div className="flex flex-col items-center gap-2 text-slate-500">
                <FileText className="size-10 opacity-60" aria-hidden />
                <p className="text-center text-sm">Preview not embedded for this file type.</p>
              </div>
            )}
          </div>

          <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
            <dt className="text-slate-500">Type</dt>
            <dd className="font-medium text-slate-900 dark:text-foreground">{attachment.attachmentType}</dd>
            <dt className="text-slate-500">MIME</dt>
            <dd className="font-mono text-xs text-slate-800">{attachment.mimeType}</dd>
            <dt className="text-slate-500">Size</dt>
            <dd>{attachment.sizeLabel}</dd>
            <dt className="text-slate-500">Classification</dt>
            <dd className="capitalize">{attachment.classification}</dd>
            <dt className="text-slate-500">Uploaded by</dt>
            <dd>{attachment.uploadedBy}</dd>
            <dt className="text-slate-500">Uploaded on</dt>
            <dd>{attachment.uploadedOnLabel}</dd>
          </dl>

          {attachment.description ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Description</p>
              <p className="mt-1 text-slate-700">{attachment.description}</p>
            </div>
          ) : null}

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Linked object</p>
            <div className="mt-1">{linkedBlock}</div>
          </div>

          {attachment.previewHint ? <p className="text-xs text-slate-500">{attachment.previewHint}</p> : null}
        </div>

        <footer className="border-t border-slate-200 px-5 py-4 dark:border-border">
          <Button type="button" className="w-full gap-2 sm:w-auto" onClick={onDownloadPlaceholder}>
            <Download className="size-4" aria-hidden />
            Download (local placeholder)
          </Button>
        </footer>
      </div>
    </dialog>
  );
}
