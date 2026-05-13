import type { ArtifactDetail } from "@/types/artifact-library.types";
import { cn } from "@/lib/utils";

function statusBadge(status: ArtifactDetail["status"]): string {
  if (status === "approved") return "bg-emerald-50 text-emerald-800";
  if (status === "draft") return "bg-slate-100 text-slate-700";
  if (status === "in_review") return "bg-amber-50 text-amber-800";
  if (status === "changes_requested") return "bg-rose-50 text-rose-800";
  return "bg-blue-50 text-blue-800";
}

export function ArtifactDetailHeader({ detail }: { detail: ArtifactDetail }) {
  return (
    <section className="cc-card-standard p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="font-mono text-[11px] text-muted-foreground">{detail.artifactCode}</p>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">{detail.name}</h1>
          <p className="max-w-prose text-sm text-muted-foreground">{detail.description}</p>
        </div>
        <span
          className={cn(
            "inline-flex shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold capitalize",
            statusBadge(detail.status),
          )}
        >
          {detail.status.replaceAll("_", " ")}
        </span>
      </div>
      <dl className="mt-4 grid gap-2 text-xs sm:grid-cols-2">
        <div>
          <dt className="text-muted-foreground">Template</dt>
          <dd className="font-medium text-foreground">
            {detail.templateName} ({detail.templateId})
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Phase</dt>
          <dd className="font-medium text-foreground">
            {detail.phaseNumber} · {detail.phaseName}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Updated</dt>
          <dd className="font-medium text-foreground">{detail.lastUpdatedLabel}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Created</dt>
          <dd className="font-medium text-foreground">{detail.createdOnLabel}</dd>
        </div>
      </dl>
    </section>
  );
}
