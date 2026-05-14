"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { ExternalLink, FileSearch, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ArtifactPreviewDrawer } from "@/components/approval-center/artifact-preview-drawer";
import { Badge } from "@/components/approval-center/approval-center-shared";
import { EvidencePreviewDrawer } from "@/components/approval-center/evidence-preview-drawer";
import { MissingInputRemediationDrawer } from "@/components/approval-center/missing-input-remediation-drawer";
import { requiredInputLinkKind } from "@/lib/approval-required-input-utils";
import { inputStatusBadgeMap } from "@/lib/approval-status";
import { cn } from "@/lib/utils";
import type { ApprovalDetail, ApprovalRequiredInput } from "@/types/approval-center.types";

export type RequiredInputsBlockProps = {
  approvalId: string;
  detail: ApprovalDetail;
  requiredInputs: ApprovalRequiredInput[];
  isLoading: boolean;
  variant: "embedded" | "full";
};

export function RequiredInputsBlock({ approvalId, detail, requiredInputs, isLoading, variant }: RequiredInputsBlockProps) {
  const router = useRouter();
  const [artifactPreviewRow, setArtifactPreviewRow] = useState<ApprovalRequiredInput | null>(null);
  const [evidencePreviewRow, setEvidencePreviewRow] = useState<ApprovalRequiredInput | null>(null);
  const [remediationRow, setRemediationRow] = useState<ApprovalRequiredInput | null>(null);

  const viewAllHref = approvalId !== "approval-none" ? `/approvals/${approvalId}/inputs` : undefined;

  const openRowTarget = (row: ApprovalRequiredInput) => {
    if (row.linkedObjectHref) router.push(row.linkedObjectHref);
    else setRemediationRow(row);
  };

  return (
    <>
      <ArtifactPreviewDrawer
        open={artifactPreviewRow != null}
        onClose={() => setArtifactPreviewRow(null)}
        row={artifactPreviewRow}
        fullHref={artifactPreviewRow?.linkedObjectHref}
        projectName={detail.projectName}
      />
      <EvidencePreviewDrawer
        open={evidencePreviewRow != null}
        onClose={() => setEvidencePreviewRow(null)}
        row={evidencePreviewRow}
        fullHref={evidencePreviewRow?.linkedObjectHref}
        projectName={detail.projectName}
      />
      <MissingInputRemediationDrawer
        open={remediationRow != null}
        onClose={() => setRemediationRow(null)}
        row={remediationRow}
        detail={detail}
      />

      {variant === "full" ? (
        <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h1 className="text-xl font-semibold text-[#111827]">Required inputs</h1>
          <p className="mt-1 text-sm text-slate-600">{detail.title}</p>
          <p className="mt-0.5 text-xs text-slate-500">{detail.approvalType.replaceAll("_", " ")} · {detail.projectName}</p>
        </div>
      ) : null}

      <header className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-[#111827]">Required Inputs</h3>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
            {requiredInputs.length}
          </span>
        </div>
        {variant === "embedded" && viewAllHref ? (
          <Link href={viewAllHref} className="text-xs font-semibold text-[#2563eb] hover:underline">
            View all inputs
          </Link>
        ) : variant === "embedded" && detail.workspaceHref ? (
          <Link href={detail.workspaceHref} className="text-xs font-semibold text-[#2563eb] hover:underline">
            View all inputs
          </Link>
        ) : variant === "embedded" && detail.projectId ? (
          <Link href={`/projects/${detail.projectId}/workspace`} className="text-xs font-semibold text-[#2563eb] hover:underline">
            View all inputs
          </Link>
        ) : variant === "full" ? (
          <Link href={`/approvals/${approvalId}`} className="text-xs font-semibold text-[#2563eb] hover:underline">
            Back to approval
          </Link>
        ) : null}
      </header>

      {variant === "embedded" ? (
        <div className="mb-3 flex flex-wrap gap-1.5 border-b border-slate-100 pb-2">
          {["Required Inputs", "Approver Comments", "Decision", "Attachments (8)"].map((tab) => (
            <button
              key={tab}
              type="button"
              className={cn(
                "rounded-md border px-2.5 py-1 text-[11px] font-semibold",
                tab === "Required Inputs" ? "border-blue-300 bg-blue-50 text-blue-800" : "border-slate-200 bg-white text-slate-600",
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      ) : null}

      {isLoading ? (
        <div className="space-y-2">
          <div className="h-10 animate-pulse rounded bg-slate-100" />
          <div className="h-10 animate-pulse rounded bg-slate-100" />
        </div>
      ) : requiredInputs.length === 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <p>No required inputs configured for this approval.</p>
          {detail.approvalType === "gate_review" && detail.gateReviewHref ? (
            <p className="mt-2">
              <Link href={detail.gateReviewHref} className="font-semibold text-amber-950 underline">
                Open gate review
              </Link>{" "}
              to complete checklist and evidence in the gate workflow.
            </p>
          ) : null}
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="pb-2">Input</th>
                <th className="pb-2">Description</th>
                <th className="pb-2">Required</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Linked</th>
                <th className="pb-2">Preview</th>
                <th className="pb-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requiredInputs.map((row) => {
                const k = requiredInputLinkKind(row.linkedObjectHref);
                const needsAttention = row.status === "missing" || row.status === "incomplete";
                return (
                  <tr
                    key={row.id}
                    tabIndex={0}
                    className="cursor-pointer border-b border-slate-100 last:border-b-0 hover:bg-slate-50/80"
                    onClick={() => openRowTarget(row)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openRowTarget(row);
                      }
                    }}
                  >
                    <td className="py-2 align-top">
                      <p className="font-semibold text-slate-800">{row.name}</p>
                      <p className="text-xs text-slate-500">{row.inputCode}</p>
                      {needsAttention ? (
                        <button
                          type="button"
                          className="mt-1.5 text-left text-[11px] font-semibold text-amber-800 underline decoration-amber-600/60 hover:text-amber-950"
                          onClick={(e) => {
                            e.stopPropagation();
                            setRemediationRow(row);
                          }}
                        >
                          Missing input — open remediation
                        </button>
                      ) : null}
                    </td>
                    <td className="py-2 align-top text-slate-700">{row.description}</td>
                    <td className="py-2 align-top text-xs font-medium text-slate-700">
                      {row.requiredLevel === "optional" ? "Optional" : "Required"}
                    </td>
                    <td className="py-2 align-top">
                      <Badge {...inputStatusBadgeMap[row.status]} />
                    </td>
                    <td className="py-2 align-top">
                      {row.linkedObjectHref && row.linkedObjectLabel ? (
                        <Link
                          href={row.linkedObjectHref}
                          className="inline-flex items-center gap-1 font-medium text-[#2563eb] hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {row.linkedObjectLabel}
                          <ExternalLink className="size-3" aria-hidden />
                        </Link>
                      ) : (
                        <span className="text-slate-500">Not linked</span>
                      )}
                    </td>
                    <td className="py-2 align-top">
                      <div className="flex items-center gap-1">
                        {k === "artifact" && row.linkedObjectHref ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon-sm"
                            aria-label="Artifact preview"
                            title="Artifact preview"
                            onClick={(e) => {
                              e.stopPropagation();
                              setArtifactPreviewRow(row);
                            }}
                          >
                            <FileText className="size-4" aria-hidden />
                          </Button>
                        ) : null}
                        {k === "evidence" && row.linkedObjectHref ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon-sm"
                            aria-label="Evidence preview"
                            title="Evidence preview"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEvidencePreviewRow(row);
                            }}
                          >
                            <FileSearch className="size-4" aria-hidden />
                          </Button>
                        ) : null}
                        {!(k === "artifact" && row.linkedObjectHref) && !(k === "evidence" && row.linkedObjectHref) ? (
                          <span className="text-xs text-slate-400">—</span>
                        ) : null}
                      </div>
                    </td>
                    <td className="py-2 align-top">
                      {row.linkedObjectHref ? (
                        <Link
                          href={row.linkedObjectHref}
                          className="text-sm font-semibold text-[#2563eb] hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Open
                        </Link>
                      ) : (
                        <span className="text-xs text-slate-500">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
