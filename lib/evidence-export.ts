import type { EvidenceCenterData } from "@/types/evidence-center.types";

function triggerDownload(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportEvidenceBundle(
  data: EvidenceCenterData,
  scope: "selected" | "gate" | "full",
  selectedEvidenceIds: string[],
): Promise<void> {
  const base = `/api/projects/${data.project.id}/evidence/export`;

  if (scope === "selected") {
    const qs = new URLSearchParams({ scope: "selected" });
    for (const id of selectedEvidenceIds) qs.append("selectedId", id);
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
    const res = await fetch(`${base}?scope=gate`);
    if (!res.ok) {
      const err = (await res.json().catch(() => null)) as { error?: string } | null;
      throw new Error(err?.error ?? `Export failed (${res.status})`);
    }
    const text = await res.text();
    triggerDownload(data.exportBundle.gateBundleFilename, text, "application/json");
    return;
  }

  const res = await fetch(`${base}?scope=full`);
  if (!res.ok) {
    const err = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(err?.error ?? `Export failed (${res.status})`);
  }
  const text = await res.text();
  triggerDownload(data.exportBundle.fullBundleFilename, text, "application/json");
}
