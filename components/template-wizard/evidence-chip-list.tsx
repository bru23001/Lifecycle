"use client";

import {
  ExternalLink,
  FileImage,
  FileJson,
  FileSpreadsheet,
  FileText,
  Link2,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type {
  WizardEvidenceItem,
  WizardEvidenceTarget,
} from "@/types/template-wizard.types";

const typeIcon: Record<WizardEvidenceItem["evidenceType"], typeof Link2> = {
  pdf: FileText,
  spreadsheet: FileSpreadsheet,
  document: FileText,
  image: FileImage,
  link: ExternalLink,
  json: FileJson,
  markdown: FileText,
  report: FileText,
};

const classificationTone: Record<WizardEvidenceItem["classification"], string> = {
  public: "bg-[#dcfce7] text-[#166534] border-[#86efac]",
  internal: "bg-[#dbeafe] text-[#1e40af] border-[#93c5fd]",
  confidential: "bg-[#fef3c7] text-[#92400e] border-[#fcd34d]",
  restricted: "bg-[#fee2e2] text-[#991b1b] border-[#fca5a5]",
};

export function EvidenceChipList({
  items,
  target,
  emptyMessage,
  onOpenDetail,
  onRequestUnlink,
}: {
  items: WizardEvidenceItem[];
  target: WizardEvidenceTarget;
  emptyMessage?: string;
  onOpenDetail: (evidenceId: string) => void;
  onRequestUnlink: (evidenceId: string, target: WizardEvidenceTarget) => void;
}) {
  if (items.length === 0) {
    return emptyMessage ? (
      <p className="text-xs text-muted-foreground">{emptyMessage}</p>
    ) : null;
  }

  return (
    <ul className="flex flex-wrap gap-2" data-testid="evidence-chip-list">
      {items.map((item) => {
        const Icon = typeIcon[item.evidenceType] ?? Link2;
        return (
          <li key={`${item.id}-${target.kind}`}>
            <span
              className={cn(
                "group inline-flex items-center gap-1.5 rounded-full border bg-card px-2 py-0.5 text-xs shadow-sm",
                classificationTone[item.classification] ?? "border-border",
              )}
            >
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => onOpenDetail(item.id)}
                data-testid="evidence-chip"
                title={item.description ?? item.name}
              >
                <Icon className="size-3" aria-hidden />
                <span className="max-w-[200px] truncate font-medium">{item.name}</span>
                <span className="font-mono text-[10px] opacity-70">{item.evidenceCode}</span>
                {item.staged ? (
                  <span className="rounded-sm bg-background px-1 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Staged
                  </span>
                ) : null}
              </button>
              <button
                type="button"
                className="ml-0.5 rounded-full p-0.5 text-muted-foreground hover:bg-background/40 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => onRequestUnlink(item.id, target)}
                data-testid="evidence-chip-remove"
                aria-label={`Remove evidence link ${item.name}`}
              >
                <X className="size-3" aria-hidden />
              </button>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
