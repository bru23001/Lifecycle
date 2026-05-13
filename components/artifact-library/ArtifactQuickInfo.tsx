import type { ArtifactQuickInfoData } from "@/types/artifact-library.types";

export function ArtifactQuickInfo({ info }: { info: ArtifactQuickInfoData }) {
  return (
    <section className="cc-card-standard p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Quick info</h3>
      <dl className="mt-3 space-y-2 text-xs">
        <div className="flex justify-between gap-2">
          <dt className="text-muted-foreground">Type</dt>
          <dd className="font-medium text-foreground">{info.artifactType}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-muted-foreground">Template version</dt>
          <dd className="font-medium text-foreground">{info.templateVersion}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-muted-foreground">Artifact version</dt>
          <dd className="font-medium text-foreground">{info.artifactVersion}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-muted-foreground">Progress</dt>
          <dd className="font-medium tabular-nums text-foreground">{info.overallProgressPercent}%</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-muted-foreground">Sections</dt>
          <dd className="font-medium tabular-nums text-foreground">
            {info.completedSections}/{info.requiredSections}
          </dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-muted-foreground">Evidence links</dt>
          <dd className="font-medium tabular-nums text-foreground">{info.evidenceItems}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-muted-foreground">Approx. words</dt>
          <dd className="font-medium tabular-nums text-foreground">{info.wordCount}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-muted-foreground">Last updated by</dt>
          <dd className="font-medium text-foreground">{info.lastUpdatedBy}</dd>
        </div>
      </dl>
    </section>
  );
}
