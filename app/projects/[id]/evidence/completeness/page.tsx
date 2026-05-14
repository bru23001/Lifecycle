import Link from "next/link";

import { loadEvidenceCenterData } from "@/lib/server/evidence";
import { evidenceStatusBadgeMap } from "@/lib/evidence-status";
import { projectOverviewHref } from "@/lib/projects-url";

export const dynamic = "force-dynamic";

export default async function EvidenceCompletenessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await loadEvidenceCenterData(id);
  const c = data.selectedEvidence.completeness;
  const evidenceHref = `/projects/${id}/evidence`;

  return (
    <div className="min-h-full bg-background px-4 py-10 text-foreground">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="space-y-2">
          <p className="text-sm text-muted-foreground">
            <Link href="/projects" className="underline-offset-4 hover:underline">
              Projects
            </Link>
            {" · "}
            <Link href={projectOverviewHref(id)} className="underline-offset-4 hover:underline">
              {data.project.name}
            </Link>
            {" · "}
            <Link href={evidenceHref} className="underline-offset-4 hover:underline">
              Evidence
            </Link>
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">Evidence completeness</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Project-level linkage and coverage rollup. Per-item actions stay on the evidence detail view.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Overall readiness", value: `${c.overallPercent}%` },
            { label: "Fully linked", value: `${c.complete.count} (${c.complete.percent}%)` },
            { label: "Partially linked", value: `${c.partial.count} (${c.partial.percent}%)` },
            { label: "Unlinked / missing", value: `${c.missing.count} (${c.missing.percent}%)` },
          ].map((card) => (
            <article key={card.label} className="rounded-2xl border bg-card p-4 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{card.label}</p>
              <p className="mt-2 text-2xl font-semibold tabular-nums">{card.value}</p>
            </article>
          ))}
        </section>

        <section className="rounded-2xl border bg-card shadow-sm">
          <div className="border-b px-4 py-3">
            <h2 className="text-sm font-semibold">Evidence items</h2>
            <p className="text-xs text-muted-foreground">Status reflects artifact and gate linkage in the workspace.</p>
          </div>
          <ul className="divide-y">
            {data.evidenceItems.length === 0 ? (
              <li className="px-4 py-6 text-sm text-muted-foreground">No evidence items yet.</li>
            ) : (
              data.evidenceItems.map((row) => (
                <li key={row.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
                  <div className="min-w-0">
                    <Link href={row.href} className="font-medium text-primary underline-offset-4 hover:underline">
                      {row.evidenceCode} · {row.name}
                    </Link>
                    <p className="truncate text-xs text-muted-foreground">{row.description ?? "—"}</p>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-3">
                    <span className="text-xs text-muted-foreground tabular-nums">{row.completenessPercent}%</span>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                      {evidenceStatusBadgeMap[row.status].label}
                    </span>
                  </div>
                </li>
              ))
            )}
          </ul>
        </section>

        <p className="text-center text-sm text-muted-foreground">
          <Link href={evidenceHref} className="font-medium text-primary underline-offset-4 hover:underline">
            Back to Evidence Center
          </Link>
        </p>
      </div>
    </div>
  );
}
