import Link from "next/link";

import {
  EvidenceCompletenessFilteredToolbar,
  EvidenceCompletenessResolveTrigger,
} from "@/components/evidence-center/evidence-completeness-interactions";
import { evidenceStatusBadgeMap } from "@/lib/evidence-status";
import {
  evidenceItemsForSegment,
  gateBlockingGaps,
  parseCompletenessStatus,
} from "@/lib/evidence-completeness-segments";
import { loadEvidenceCenterData } from "@/lib/server/evidence";
import { projectOverviewHref } from "@/lib/projects-url";
import type { EvidenceByGate, EvidenceItem } from "@/types/evidence-center.types";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(v: string | string[] | undefined): string | undefined {
  if (v === undefined) return undefined;
  return Array.isArray(v) ? v[0] : v;
}

function ItemRow({ row }: { row: EvidenceItem }) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
      <div className="min-w-0">
        <Link href={row.href} className="font-medium text-primary underline-offset-4 hover:underline">
          {row.evidenceCode} · {row.name}
        </Link>
        <p className="truncate text-xs text-muted-foreground">{row.description ?? "—"}</p>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-3">
        <span className="text-xs text-muted-foreground tabular-nums">{row.completenessPercent}%</span>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">{evidenceStatusBadgeMap[row.status].label}</span>
      </div>
    </li>
  );
}

function SegmentCard({
  href,
  label,
  count,
  percent,
  hint,
}: {
  href: string;
  label: string;
  count: number;
  percent: number;
  hint: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border bg-card p-4 shadow-sm transition hover:border-primary/40 hover:bg-muted/30"
    >
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold tabular-nums">
        {count} <span className="text-base font-medium text-muted-foreground">({percent}%)</span>
      </p>
      <p className="mt-2 text-xs text-muted-foreground">{hint}</p>
    </Link>
  );
}

export default async function EvidenceCompletenessPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const sp = await searchParams;
  const data = await loadEvidenceCenterData(id);
  const c = data.selectedEvidence.completeness;
  const evidenceHref = `/projects/${id}/evidence`;
  const completenessBase = `/projects/${id}/evidence/completeness`;
  const filterStatus = parseCompletenessStatus(firstParam(sp.status));

  const items = data.evidenceItems;
  const completeItems = evidenceItemsForSegment(items, "complete");
  const partialItems = evidenceItemsForSegment(items, "partial");
  const unlinkedItems = evidenceItemsForSegment(items, "unlinked");
  const archivedItems = items.filter((i) => i.status === "archived");
  const gaps = gateBlockingGaps(data.evidenceByGate);

  let filteredEvidence: EvidenceItem[] = [];
  let filteredGaps: EvidenceByGate[] = [];
  if (filterStatus === "complete") filteredEvidence = completeItems;
  else if (filterStatus === "partial") filteredEvidence = partialItems;
  else if (filterStatus === "unlinked") filteredEvidence = unlinkedItems;
  else if (filterStatus === "missing") filteredGaps = gaps;

  return (
    <div className="min-h-full bg-background px-4 py-10 text-foreground">
      <div className="mx-auto max-w-4xl space-y-10">
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
            Project-level linkage and coverage rollup. Use segment cards to drill into fully linked, partially linked,
            gate gaps, or unlinked items. Per-item fixes stay on each evidence detail view.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-2xl border bg-card p-4 shadow-sm sm:col-span-2 lg:col-span-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Overall completeness</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums">{c.overallPercent}%</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Weighted rollup: fully linked items count fully; partially linked items count at half weight against all
              evidence rows.
            </p>
          </article>
          <SegmentCard
            href={`${completenessBase}?status=complete`}
            label="Fully linked"
            count={c.complete.count}
            percent={c.complete.percent}
            hint="Items in “linked” status with workspace context satisfied."
          />
          <SegmentCard
            href={`${completenessBase}?status=partial`}
            label="Partially linked"
            count={c.partial.count}
            percent={c.partial.percent}
            hint="Artifact or gate linkage still incomplete."
          />
          <Link
            href={`${completenessBase}?status=missing`}
            className="rounded-2xl border bg-card p-4 shadow-sm transition hover:border-primary/40 hover:bg-muted/30"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Missing coverage (gates)</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums">{gaps.length}</p>
            <p className="mt-2 text-xs text-muted-foreground">Gates below template-backed evidence expectations.</p>
          </Link>
          <SegmentCard
            href={`${completenessBase}?status=unlinked`}
            label="Unlinked items"
            count={c.unlinked?.count ?? c.missing.count}
            percent={c.unlinked?.percent ?? c.missing.percent}
            hint="Evidence rows not yet tied to phase/gate context."
          />
        </section>

        {filterStatus ? (
          <EvidenceCompletenessFilteredToolbar
            projectId={data.project.id}
            projectCode={data.project.code}
            filterStatus={filterStatus}
            evidenceItems={filteredEvidence}
            gateGaps={filteredGaps}
          />
        ) : null}

        {filterStatus === "missing" ? (
          <section className="rounded-2xl border bg-card shadow-sm">
            <div className="border-b px-4 py-3">
              <h2 className="text-sm font-semibold">Missing coverage (gates)</h2>
              <p className="text-xs text-muted-foreground">Blocking status reflects template coverage per gate.</p>
            </div>
            {filteredGaps.length === 0 ? (
              <p className="px-4 py-6 text-sm text-muted-foreground">No gate gaps — all gates meet the current template bar.</p>
            ) : (
              <ul className="divide-y">
                {filteredGaps.map((g) => (
                  <li key={g.gateId} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
                    <div className="min-w-0">
                      <Link href={g.href} className="font-medium text-primary underline-offset-4 hover:underline">
                        {g.gateCode} · {g.gateName}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        Linked {g.evidenceLinked} / {g.requiredEvidence} required · {g.coveragePercent}% coverage ·{" "}
                        <span className="capitalize">{g.status.replaceAll("_", " ")}</span>
                      </p>
                    </div>
                    <EvidenceCompletenessResolveTrigger
                      projectId={data.project.id}
                      label={`Gate ${g.gateCode} — ${g.gateName}`}
                      gateCode={g.gateCode}
                      gateReviewHref={g.href}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>
        ) : null}

        {filterStatus && filterStatus !== "missing" ? (
          <section className="rounded-2xl border bg-card shadow-sm">
            <div className="border-b px-4 py-3">
              <h2 className="text-sm font-semibold capitalize">Evidence — {filterStatus}</h2>
              <p className="text-xs text-muted-foreground">Items in this linkage segment.</p>
            </div>
            <ul className="divide-y">
              {filteredEvidence.length === 0 ? (
                <li className="px-4 py-6 text-sm text-muted-foreground">No items in this segment.</li>
              ) : (
                filteredEvidence.map((row) => <ItemRow key={row.id} row={row} />)
              )}
            </ul>
          </section>
        ) : null}

        {!filterStatus ? (
          <>
            <section className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border bg-card shadow-sm">
                <div className="border-b px-4 py-3">
                  <h2 className="text-sm font-semibold">Complete evidence list</h2>
                  <p className="text-xs text-muted-foreground">Linked status.</p>
                </div>
                <ul className="max-h-72 divide-y overflow-y-auto">
                  {completeItems.length === 0 ? (
                    <li className="px-4 py-4 text-sm text-muted-foreground">None yet.</li>
                  ) : (
                    completeItems.map((row) => <ItemRow key={row.id} row={row} />)
                  )}
                </ul>
              </div>
              <div className="rounded-2xl border bg-card shadow-sm">
                <div className="border-b px-4 py-3">
                  <h2 className="text-sm font-semibold">Partial evidence list</h2>
                  <p className="text-xs text-muted-foreground">Partially linked status.</p>
                </div>
                <ul className="max-h-72 divide-y overflow-y-auto">
                  {partialItems.length === 0 ? (
                    <li className="px-4 py-4 text-sm text-muted-foreground">None.</li>
                  ) : (
                    partialItems.map((row) => <ItemRow key={row.id} row={row} />)
                  )}
                </ul>
              </div>
              <div className="rounded-2xl border bg-card shadow-sm">
                <div className="border-b px-4 py-3">
                  <h2 className="text-sm font-semibold">Missing coverage (gates)</h2>
                  <p className="text-xs text-muted-foreground">Template-driven gate gaps.</p>
                </div>
                <ul className="max-h-72 divide-y overflow-y-auto">
                  {gaps.length === 0 ? (
                    <li className="px-4 py-4 text-sm text-muted-foreground">No blocking gate gaps.</li>
                  ) : (
                    gaps.map((g) => (
                      <li key={g.gateId} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                        <div className="min-w-0">
                          <Link href={g.href} className="font-medium text-primary underline-offset-4 hover:underline">
                            {g.gateCode} · {g.gateName}
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            {g.evidenceLinked}/{g.requiredEvidence} · {g.coveragePercent}%
                          </p>
                        </div>
                        <EvidenceCompletenessResolveTrigger
                          projectId={data.project.id}
                          label={`Gate ${g.gateCode} — ${g.gateName}`}
                          gateCode={g.gateCode}
                          gateReviewHref={g.href}
                        />
                      </li>
                    ))
                  )}
                </ul>
              </div>
              <div className="rounded-2xl border bg-card shadow-sm">
                <div className="border-b px-4 py-3">
                  <h2 className="text-sm font-semibold">Unlinked evidence list</h2>
                  <p className="text-xs text-muted-foreground">Not yet tied to workspace phase/gate.</p>
                </div>
                <ul className="max-h-72 divide-y overflow-y-auto">
                  {unlinkedItems.length === 0 ? (
                    <li className="px-4 py-4 text-sm text-muted-foreground">None.</li>
                  ) : (
                    unlinkedItems.map((row) => <ItemRow key={row.id} row={row} />)
                  )}
                </ul>
              </div>
            </section>

            {archivedItems.length > 0 ? (
              <section className="rounded-2xl border bg-card shadow-sm">
                <div className="border-b px-4 py-3">
                  <h2 className="text-sm font-semibold">Archived</h2>
                  <p className="text-xs text-muted-foreground">Excluded from active readiness counts.</p>
                </div>
                <ul className="divide-y">
                  {archivedItems.map((row) => (
                    <ItemRow key={row.id} row={row} />
                  ))}
                </ul>
              </section>
            ) : null}

            <section className="rounded-2xl border bg-card p-5 shadow-sm">
              <h2 className="text-sm font-semibold">Completeness rules</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                <li>Fully linked: evidence item has coherent workspace phase/gate context and supporting artifact links.</li>
                <li>Partial: at least one link exists but coverage rules are not fully satisfied.</li>
                <li>Gate gaps: fewer evidence rows mapped to a gate than templates registered for that gate.</li>
                <li>Unlinked: evidence exists in the vault but is not yet placed on the lifecycle map.</li>
                <li>Archives are retained for audit but do not improve active completeness.</li>
              </ul>
            </section>

            <section className="rounded-2xl border bg-card p-5 shadow-sm">
              <h2 className="text-sm font-semibold">Blocking gaps</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Phases below coverage expectations (template count vs. evidence rows in that phase).
              </p>
              <ul className="mt-4 space-y-2 text-sm">
                {(() => {
                  const phaseGaps = data.evidenceByPhase.filter(
                    (p) => p.status === "missing" || p.status === "partial",
                  );
                  if (phaseGaps.length === 0) {
                    return <li className="text-muted-foreground">No phase-level gaps flagged.</li>;
                  }
                  return phaseGaps.map((p) => (
                    <li key={p.phaseId} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2">
                      <span>
                        Phase {p.phaseNumber}: {p.phaseName}
                      </span>
                      <span className="text-muted-foreground">
                        {p.evidenceItems}/{p.requiredEvidence} evidence · {p.coveragePercent}%
                      </span>
                      <Link href={p.workspaceHref} className="text-primary underline-offset-4 hover:underline">
                        Open workspace
                      </Link>
                    </li>
                  ));
                })()}
              </ul>
            </section>

            <section className="rounded-2xl border bg-card p-5 shadow-sm">
              <h2 className="text-sm font-semibold">Remediation actions</h2>
              <ul className="mt-3 flex flex-wrap gap-3 text-sm">
                <li>
                  <Link href={evidenceHref} className="font-medium text-primary underline-offset-4 hover:underline">
                    Add or link evidence
                  </Link>
                </li>
                <li>
                  <Link href={`${evidenceHref}#evidence-coverage`} className="font-medium text-primary underline-offset-4 hover:underline">
                    Review coverage pane
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/api/projects/${data.project.id}/evidence/export?scope=full`}
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    Export full bundle
                  </Link>
                </li>
              </ul>
            </section>
          </>
        ) : null}

        <p className="text-center text-sm text-muted-foreground">
          <Link href={evidenceHref} className="font-medium text-primary underline-offset-4 hover:underline">
            Back to Evidence Center
          </Link>
        </p>
      </div>
    </div>
  );
}
