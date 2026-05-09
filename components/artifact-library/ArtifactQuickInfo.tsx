import type { ArtifactQuickInfoData } from "@/types/artifact-library.types";

export function ArtifactQuickInfo({ info }: { info: ArtifactQuickInfoData }) {
  const pct = Math.max(0, Math.min(100, info.overallProgressPercent));
  return (
    <section className="rounded-2xl border border-[#e5e7eb] bg-white p-4 shadow-sm dark:border-border dark:bg-card">
      <h3 className="text-sm font-semibold text-[#111827] dark:text-foreground">Quick Info</h3>
      <dl className="mt-3 space-y-2 text-xs">
        <Row label="Artifact Type" value={info.artifactType} />
        <Row label="Template Version" value={info.templateVersion} />
        <Row label="Artifact Version" value={info.artifactVersion} />
        <Row label="Status" value={info.status} />
        <div>
          <dt className="text-[#64748b] dark:text-muted-foreground">Overall Progress</dt>
          <dd className="mt-1">
            <div
              className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"
              role="progressbar"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full rounded-full bg-[#2563eb]"
                style={{ width: `${pct}%` }}
              />
            </div>
          </dd>
        </div>
        <Row label="Required Sections" value={String(info.requiredSections)} />
        <Row label="Completed Sections" value={String(info.completedSections)} />
        <Row label="Evidence Items" value={String(info.evidenceItems)} />
        <Row label="Words" value={String(info.wordCount)} />
        <Row label="Last Updated By" value={info.lastUpdatedBy} />
      </dl>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-[#64748b] dark:text-muted-foreground">{label}</dt>
      <dd className="font-medium text-[#111827] dark:text-foreground">{value}</dd>
    </div>
  );
}
