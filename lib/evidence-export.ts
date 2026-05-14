import type { EvidenceCenterData } from "@/types/evidence-center.types";

export type ExportFullEvidenceBundleOptions = {
  includeFiles: boolean;
  includeManifest: boolean;
  includePhaseMappings: boolean;
  includeGateMappings: boolean;
  includeArtifactMappings: boolean;
  includeChecksums: boolean;
  includeAuditManifest: boolean;
  redactRestricted: boolean;
  includeGateDecisionRecord: boolean;
};

function triggerDownload(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function appendFullBundleOptions(q: URLSearchParams, opts: ExportFullEvidenceBundleOptions) {
  (Object.keys(opts) as (keyof ExportFullEvidenceBundleOptions)[]).forEach((key) => {
    q.set(key, opts[key] ? "1" : "0");
  });
}

export async function exportEvidenceBundle(
  data: EvidenceCenterData,
  scope: "selected" | "gate" | "phase" | "full",
  selectedEvidenceIds: string[],
  fullBundleOptions?: ExportFullEvidenceBundleOptions,
  gateExport?: { gateCode: string },
  phaseExport?: { phaseNumber: number },
): Promise<void> {
  const base = `/api/projects/${data.project.id}/evidence/export`;

  const opts: ExportFullEvidenceBundleOptions = fullBundleOptions ?? {
    includeFiles: true,
    includeManifest: true,
    includePhaseMappings: true,
    includeGateMappings: true,
    includeArtifactMappings: true,
    includeChecksums: true,
    includeAuditManifest: false,
    redactRestricted: false,
    includeGateDecisionRecord: false,
  };

  if (scope === "selected") {
    const qs = new URLSearchParams({ scope: "selected" });
    for (const id of selectedEvidenceIds) qs.append("selectedId", id);
    appendFullBundleOptions(qs, opts);
    const res = await fetch(`${base}?${qs.toString()}`);
    if (!res.ok) {
      const err = (await res.json().catch(() => null)) as { error?: string } | null;
      throw new Error(err?.error ?? `Export failed (${res.status})`);
    }
    const text = await res.text();
    triggerDownload(data.exportBundle.selectedFilename, text, "application/json");
    return;
  }

  if (scope === "gate") {
    const qs = new URLSearchParams({ scope: "gate" });
    appendFullBundleOptions(qs, opts);
    if (gateExport?.gateCode) {
      qs.set("gateCode", gateExport.gateCode.trim().toUpperCase());
    }
    const res = await fetch(`${base}?${qs.toString()}`);
    if (!res.ok) {
      const err = (await res.json().catch(() => null)) as { error?: string } | null;
      throw new Error(err?.error ?? `Export failed (${res.status})`);
    }
    const text = await res.text();
    const gateSlug = gateExport?.gateCode?.trim().toLowerCase() ?? "all-gates";
    triggerDownload(`${data.project.code}_gate-${gateSlug}-evidence.json`, text, "application/json");
    return;
  }

  if (scope === "phase") {
    const phaseNum = phaseExport?.phaseNumber;
    if (phaseNum == null || phaseNum < 1 || phaseNum > 14) {
      throw new Error("Phase must be between 1 and 14.");
    }
    const qs = new URLSearchParams({
      scope: "phase",
      phaseNumber: String(phaseNum),
    });
    appendFullBundleOptions(qs, opts);
    const res = await fetch(`${base}?${qs.toString()}`);
    if (!res.ok) {
      const err = (await res.json().catch(() => null)) as { error?: string } | null;
      throw new Error(err?.error ?? `Export failed (${res.status})`);
    }
    const text = await res.text();
    triggerDownload(`${data.project.code}_phase-${phaseNum}-evidence.json`, text, "application/json");
    return;
  }

  const qs = new URLSearchParams({ scope: "full" });
  appendFullBundleOptions(qs, opts);
  const res = await fetch(`${base}?${qs.toString()}`);
  if (!res.ok) {
    const err = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(err?.error ?? `Export failed (${res.status})`);
  }
  const text = await res.text();
  triggerDownload(data.exportBundle.fullBundleFilename, text, "application/json");
}
