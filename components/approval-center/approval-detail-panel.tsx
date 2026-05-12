"use client";

import Link from "next/link";
import { ExternalLink, MessageSquarePlus, MoreHorizontal, Share2, Shield, Star } from "lucide-react";
import type { RefObject } from "react";

import { Button } from "@/components/ui/button";
import { Badge, MetaItem } from "@/components/approval-center/approval-center-shared";
import { approvalStatusBadgeMap, inputStatusBadgeMap } from "@/lib/approval-status";
import { cn } from "@/lib/utils";
import type { ApprovalPackage, ApproverComment } from "@/types/approval-center.types";

type ApprovalDetailPanelProps = {
  selectedPackage?: ApprovalPackage;
  isLoading: boolean;
  commentDraft: string;
  commentVisibility: ApproverComment["visibility"];
  commentBoxRef: RefObject<HTMLTextAreaElement | null>;
  onCommentDraftChange: (value: string) => void;
  onCommentVisibilityChange: (value: ApproverComment["visibility"]) => void;
  onAddComment: () => void;
};

export function ApprovalDetailPanel({
  selectedPackage,
  isLoading,
  commentDraft,
  commentVisibility,
  commentBoxRef,
  onCommentDraftChange,
  onCommentVisibilityChange,
  onAddComment,
}: ApprovalDetailPanelProps) {
  return (
    <section data-pane="detail" className="approval-detail-panel min-w-0 flex h-full min-h-0 flex-col gap-3 overflow-hidden">
      {!selectedPackage ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">
          <p>Select an approval to review details.</p>
        </div>
      ) : (
        <div className="grid min-h-0 flex-1 grid-rows-3 gap-3 overflow-hidden">
          <article className="min-h-0 overflow-auto rounded-2xl border border-[#e5e7eb] bg-white p-4 shadow-sm">
            <header className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-start gap-3">
                <div className="grid size-11 place-items-center rounded-xl bg-amber-100 text-amber-700">
                  <Shield className="size-5" aria-hidden />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-[28px] font-semibold leading-none text-[#111827]">{selectedPackage.detail.approvalCode}</h2>
                    <h3 className="text-2xl font-semibold text-[#111827]">{selectedPackage.detail.title}</h3>
                    <Badge {...approvalStatusBadgeMap[selectedPackage.detail.status]} />
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{selectedPackage.detail.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button type="button" variant="outline" size="icon-sm" aria-label="Star approval">
                  <Star className="size-4" aria-hidden />
                </Button>
                <Button type="button" variant="outline" size="sm" className="gap-1.5" aria-label="Share approval">
                  <Share2 className="size-3.5" aria-hidden />
                  Share
                </Button>
                <Button type="button" variant="outline" size="icon-sm" aria-label="More actions">
                  <MoreHorizontal className="size-4" aria-hidden />
                </Button>
              </div>
            </header>

            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm min-[1024px]:grid-cols-5">
              <MetaItem label="Project" value={selectedPackage.detail.projectName} />
              <MetaItem
                label="Phase"
                value={
                  selectedPackage.detail.phaseNumber && selectedPackage.detail.phaseName
                    ? `${selectedPackage.detail.phaseNumber} ${selectedPackage.detail.phaseName}`
                    : "—"
                }
              />
              <MetaItem label="Type" value={selectedPackage.detail.approvalType.replaceAll("_", " ")} />
              <MetaItem label="Submitted By" value={selectedPackage.detail.submittedBy} />
              <MetaItem label="Submitted On" value={selectedPackage.detail.submittedOnLabel} />
              <MetaItem label="Due Date" value={selectedPackage.detail.dueDateLabel ?? "—"} />
              <MetaItem label="Priority" value={selectedPackage.detail.priority} />
              <MetaItem label="Linked Artifacts" value={String(selectedPackage.detail.linkedArtifactsCount)} />
              <MetaItem label="Evidence Items" value={String(selectedPackage.detail.evidenceItemsCount)} />
              <MetaItem label="Approvers" value={String(selectedPackage.detail.approversCount)} />
            </dl>
          </article>

          <article className="flex min-h-0 flex-col rounded-2xl border border-[#e5e7eb] bg-white p-4 shadow-sm">
            <header className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-[#111827]">Required Inputs</h3>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                  {selectedPackage.requiredInputs.length}
                </span>
              </div>
              <Link href={`/projects/${selectedPackage.detail.projectId}/workspace`} className="text-xs font-semibold text-[#2563eb] hover:underline">
                View all inputs
              </Link>
            </header>

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

            {isLoading ? (
              <div className="space-y-2">
                <div className="h-10 animate-pulse rounded bg-slate-100" />
                <div className="h-10 animate-pulse rounded bg-slate-100" />
              </div>
            ) : selectedPackage.requiredInputs.length === 0 ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                <p>No required inputs configured for this approval.</p>
              </div>
            ) : (
              <div className="min-h-0 flex-1 overflow-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="pb-2">Input</th>
                      <th className="pb-2">Description</th>
                      <th className="pb-2">Status</th>
                      <th className="pb-2">Linked Artifact / Evidence</th>
                      <th className="pb-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPackage.requiredInputs.map((row) => (
                      <tr key={row.id} className="border-b border-slate-100 last:border-b-0">
                        <td className="py-2">
                          <p className="font-semibold text-slate-800">{row.name}</p>
                          <p className="text-xs text-slate-500">{row.inputCode}</p>
                        </td>
                        <td className="py-2 text-slate-700">{row.description}</td>
                        <td className="py-2">
                          <Badge {...inputStatusBadgeMap[row.status]} />
                        </td>
                        <td className="py-2">
                          {row.linkedObjectHref && row.linkedObjectLabel ? (
                            <Link href={row.linkedObjectHref} className="inline-flex items-center gap-1 font-medium text-[#2563eb] hover:underline">
                              {row.linkedObjectLabel}
                              <ExternalLink className="size-3" aria-hidden />
                            </Link>
                          ) : (
                            <span className="text-slate-500">Not linked</span>
                          )}
                        </td>
                        <td className="py-2">
                          {row.linkedObjectHref ? (
                            <Link href={row.linkedObjectHref} className="text-sm font-semibold text-[#2563eb] hover:underline">
                              Open
                            </Link>
                          ) : (
                            <span className="text-xs text-slate-500">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </article>

          <article className="flex min-h-0 flex-col rounded-2xl border border-[#e5e7eb] bg-white p-4 shadow-sm">
            <header className="mb-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-[#111827]">Approver Comments</h3>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                  {selectedPackage.comments.length}
                </span>
              </div>
              <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => commentBoxRef.current?.focus()}>
                <MessageSquarePlus className="size-3.5" aria-hidden />
                Add Comment
              </Button>
            </header>

            {selectedPackage.comments.length === 0 ? (
              <div className="mb-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                <p>No approver comments yet.</p>
              </div>
            ) : (
              <ul className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
                {selectedPackage.comments.map((comment) => (
                  <li key={comment.id} className="rounded-xl border border-slate-200 p-3">
                    <div className="flex items-start gap-2">
                      <div className="grid size-8 place-items-center rounded-full bg-blue-600 text-xs font-semibold text-white">
                        {comment.authorInitials}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-slate-800">
                            {comment.authorName} ({comment.authorRole})
                          </p>
                          {comment.statusAtComment ? <Badge {...approvalStatusBadgeMap[comment.statusAtComment]} /> : null}
                          <p className="text-xs text-slate-500">{comment.createdOnLabel}</p>
                        </div>
                        <p className="mt-1 text-sm text-slate-700">{comment.body}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <label htmlFor="approval-comment-composer" className="text-sm font-semibold text-slate-800">
                Comment
              </label>
              <textarea
                id="approval-comment-composer"
                ref={commentBoxRef}
                value={commentDraft}
                onChange={(event) => onCommentDraftChange(event.target.value.slice(0, 1200))}
                rows={3}
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Add review comments..."
              />
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                <select
                  className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs"
                  value={commentVisibility}
                  onChange={(event) => onCommentVisibilityChange(event.target.value as ApproverComment["visibility"])}
                  aria-label="Comment visibility"
                >
                  <option value="public_to_project">Visible to project</option>
                  <option value="internal">Internal only</option>
                </select>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-slate-500">{commentDraft.length}/1200 characters</p>
                  <Button type="button" size="sm" disabled={commentDraft.trim().length === 0} onClick={onAddComment}>
                    Add Comment
                  </Button>
                </div>
              </div>
            </div>
          </article>
        </div>
      )}
    </section>
  );
}
