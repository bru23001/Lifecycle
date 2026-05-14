"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ChevronRight,
  ClipboardList,
  Clock3,
  FileText,
  GitBranch,
  Package,
  Pencil,
  Plus,
  SearchCheck,
  ShieldCheck,
} from "lucide-react";

import { AddEvidenceModal } from "@/components/evidence-center/add-evidence-modal";
import { ExportProjectPackageModal } from "@/components/reports/export-project-package-modal";
import { ReportSelectionModal } from "@/components/reports/report-selection-modal";
import { cn } from "@/lib/utils";
import type {
  SelectedProjectQuickAction,
  SelectedProjectQuickActionKind,
} from "@/types/projects.types";

type Props = {
  projectId: string;
  quickActions: SelectedProjectQuickAction[];
};

type OpenModal = Exclude<SelectedProjectQuickActionKind, "navigate"> | null;

/**
 * "Quick Actions" card for the Project Context Panel.
 *
 * Each action either:
 *   - navigates (`kind === "navigate"` or unset) — renders a `<Link>`
 *   - opens a modal (`kind === "modal-*"`) — renders a `<button>` that owns
 *     the visibility state for that modal kind.
 *
 * Designed as a client component so the parent shell can stay a server
 * component; props are fully serializable.
 */
export function QuickActionsCard({ projectId, quickActions }: Props) {
  const [openModal, setOpenModal] = useState<OpenModal>(null);

  return (
    <article className="cc-card-standard min-h-0 overflow-y-auto p-4">
      <h3 className="cc-card-title">Quick Actions</h3>
      <div className="mt-2 space-y-1">
        {quickActions.map((action) => {
          const icon = iconFor(action);
          const kind: SelectedProjectQuickActionKind = action.kind ?? "navigate";

          if (kind === "navigate") {
            return (
              <Link
                key={action.id}
                href={action.href}
                className={rowClass}
              >
                <span className="inline-flex items-center gap-2">
                  {icon}
                  {action.label}
                </span>
                <ChevronRight className="size-3.5 text-slate-400" />
              </Link>
            );
          }

          return (
            <button
              key={action.id}
              type="button"
              onClick={() => setOpenModal(kind)}
              className={cn(rowClass, "w-full text-left")}
              aria-haspopup="dialog"
            >
              <span className="inline-flex items-center gap-2">
                {icon}
                {action.label}
              </span>
              <ChevronRight className="size-3.5 text-slate-400" />
            </button>
          );
        })}
      </div>

      <AddEvidenceModal
        open={openModal === "modal-add-evidence"}
        projectId={projectId}
        onClose={() => setOpenModal(null)}
      />
      <ReportSelectionModal
        open={openModal === "modal-report-selection"}
        projectId={projectId}
        onClose={() => setOpenModal(null)}
      />
      <ExportProjectPackageModal
        open={openModal === "modal-export-package"}
        projectId={projectId}
        onClose={() => setOpenModal(null)}
      />
    </article>
  );
}

const rowClass =
  "cc-card-link flex items-center justify-between rounded-md px-2 py-2 hover:bg-blue-50";

function iconFor(action: SelectedProjectQuickAction): React.ReactNode {
  if (action.id.includes("add-evidence")) return <Plus className="size-3.5" />;
  if (action.id.includes("generate-report")) return <FileText className="size-3.5" />;
  if (action.id.includes("export")) return <Package className="size-3.5" />;
  if (action.id.includes("profile")) return <Pencil className="size-3.5" />;
  if (action.id.includes("lifecycle")) return <Clock3 className="size-3.5" />;
  if (action.id.includes("gate")) return <ShieldCheck className="size-3.5" />;
  if (action.id.includes("evidence")) return <SearchCheck className="size-3.5" />;
  if (action.id.includes("trace")) return <GitBranch className="size-3.5" />;
  if (action.id.includes("audit")) return <ClipboardList className="size-3.5" />;
  return <Package className="size-3.5" />;
}
