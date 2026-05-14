"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Download, Package, ShieldCheck } from "lucide-react";

import { AuthenticatedAppShell } from "@/components/lifecycle-workspace/authenticated-app-shell";
import { Breadcrumbs } from "@/components/lifecycle-workspace/breadcrumbs";
import { TopHeader } from "@/components/lifecycle-workspace/top-header";
import { Button } from "@/components/ui/button";
import { exportEvidenceBundle } from "@/lib/evidence-export";
import type { ExportFullEvidenceBundleOptions } from "@/lib/evidence-export";
import { projectOverviewHref } from "@/lib/projects-url";
import type { EvidenceCenterData } from "@/types/evidence-center.types";

import { EvidenceExportBundleCard } from "./evidence-coverage-panel";
import { ExportFullEvidenceBundleModal } from "./export-full-evidence-bundle-modal";

function triggerDownload(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function toCsv(data: string[][]): string {
  return data
    .map((row) =>
      row
        .map((cell) => {
          const escaped = cell.replaceAll('"', '""');
          return `"${escaped}"`;
        })
        .join(","),
    )
    .join("\n");
}

export function EvidenceExportPage({ data }: { data: EvidenceCenterData }) {
  const [selectedIds, setSelectedIds] = useState<string[]>(data.exportBundle.selectedEvidenceIds);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [exportFullOpen, setExportFullOpen] = useState(false);

  const selectedItems = useMemo(
    () => data.evidenceItems.filter((item) => selectedIds.includes(item.id)),
    [data.evidenceItems, selectedIds],
  );

  const navPhase = data.project.currentPhase;

  const onToggleSelected = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id]));
  };

  const exportSelectedCsv = () => {
    const rows = [
      ["Evidence ID", "Evidence Code", "Name", "Type", "Phase", "Gate", "Status", "Uploaded On"],
      ...selectedItems.map((item) => [
        item.id,
        item.evidenceCode,
        item.name,
        item.evidenceType,
        item.phaseName ?? "",
        item.gateCode ?? "",
        item.status,
        item.uploadedOnLabel,
      ]),
    ];
    triggerDownload(`${data.project.code}_selected-evidence.csv`, toCsv(rows), "text/csv;charset=utf-8");
    setMessage("Selected evidence CSV exported.");
  };

  const exportGateCsv = () => {
    const rows = [
      ["Gate", "Gate Name", "Evidence Linked", "Required Evidence", "Coverage Percent", "Status"],
      ...data.evidenceByGate.map((gate) => [
        gate.gateCode,
        gate.gateName,
        String(gate.evidenceLinked),
        String(gate.requiredEvidence),
        String(gate.coveragePercent),
        gate.status,
      ]),
    ];
    triggerDownload(`${data.project.code}_evidence-by-gate.csv`, toCsv(rows), "text/csv;charset=utf-8");
    setMessage("Gate matrix CSV exported.");
  };

  const exportFullJsonStub = () => {
    const payload = {
      project: data.project,
      exportedAt: new Date().toISOString(),
      selectedIds,
      evidenceItems: data.evidenceItems,
      evidenceByGate: data.evidenceByGate,
      evidenceByPhase: data.evidenceByPhase,
      note: "Stub payload for offline planning. Prefer JSON export from the bundle actions for API-shaped payloads.",
    };
    triggerDownload(`${data.project.code}_evidence-export-stub.json`, JSON.stringify(payload, null, 2), "application/json");
    setMessage("Full export JSON stub generated.");
  };

  const runFullBundleExport = async (options: ExportFullEvidenceBundleOptions) => {
    setError(null);
    try {
      await exportEvidenceBundle(data, "full", selectedIds, options);
      setMessage("Full bundle JSON downloaded.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Export failed.");
    }
  };

  return (
    <AuthenticatedAppShell
      projectId={data.project.id}
      projectName={data.project.name}
      phaseSummary="Evidence export hub"
      phaseProgressPct={data.evidenceItems.length ? 100 : 0}
      navActive="evidence"
      projectCurrentPhase={data.project.currentPhase}
      navPhaseScope={navPhase}
      workspaceHref={`/projects/${data.project.id}/workspace?phase=${navPhase}`}
    >
      <TopHeader
        title="Evidence export hub"
        userInitials={data.user.initials}
        userName={data.user.name}
        userRole={data.user.role}
        actionButtonLabel="Full bundle"
        actionButtonAriaLabel="Open full evidence bundle export modal"
        onActionButtonClick={() => setExportFullOpen(true)}
      />

      <main className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col space-y-6 overflow-y-auto px-5 py-8 min-[901px]:px-8">
        <Breadcrumbs
          items={[
            { label: "Projects", href: "/projects" },
            { label: data.project.name, href: projectOverviewHref(data.project.id) },
            { label: "Evidence", href: `/projects/${data.project.id}/evidence` },
            { label: "Export" },
          ]}
        />

        <header className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Evidence export bundle</h1>
          <p className="text-sm text-slate-600">
            Configure JSON exports with manifest and traceability options. ZIP packaging is planned; use JSON for audit
            pipelines today.
          </p>
          <p className="text-xs text-slate-500">
            Project: <span className="font-medium text-slate-700">{data.project.name}</span> ({data.project.code})
          </p>
        </header>

        {error ? (
          <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
            <p>{error}</p>
            <Button type="button" size="sm" variant="outline" onClick={() => setError(null)}>
              Dismiss
            </Button>
          </div>
        ) : null}

        <EvidenceExportBundleCard
          exportBundle={data.exportBundle}
          data={data}
          selectedForExport={selectedIds}
          onRequestFullExport={() => setExportFullOpen(true)}
          onExportResult={(msg) => setError(msg)}
        />

        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-slate-900">Selection for exports</h2>
          <p className="mt-1 text-xs text-slate-600">Toggle items included in “Export selected” and the full bundle modal.</p>
          <ul className="mt-3 grid gap-2">
            {data.evidenceItems.map((item) => {
              const checked = selectedIds.includes(item.id);
              return (
                <li key={item.id} className="rounded-lg border border-slate-200 p-2">
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                    <input type="checkbox" checked={checked} onChange={() => onToggleSelected(item.id)} aria-label={`Select ${item.name}`} />
                    <span className="font-medium text-slate-900">{item.name}</span>
                    <span className="text-xs text-slate-500">{item.evidenceCode}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 min-[920px]:grid-cols-3">
          <Button type="button" className="gap-2" onClick={exportSelectedCsv} disabled={selectedItems.length === 0}>
            <Download className="size-4" aria-hidden />
            Export Selected CSV
          </Button>
          <Button type="button" variant="outline" className="gap-2" onClick={exportGateCsv}>
            <ShieldCheck className="size-4" aria-hidden />
            Export by Gate CSV
          </Button>
          <Button type="button" variant="outline" className="gap-2" onClick={exportFullJsonStub}>
            <Package className="size-4" aria-hidden />
            Export Full JSON Stub
          </Button>
        </section>

        {message ? <p className="text-sm text-emerald-700">{message}</p> : null}

        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/projects/${data.project.id}/evidence`}>
            <Button variant="outline">Back to Evidence Center</Button>
          </Link>
          <Link href={`/projects/${data.project.id}/evidence/${selectedIds[0] ?? data.selectedEvidence.detail.id}`}>
            <Button variant="secondary">Open first selected evidence</Button>
          </Link>
        </div>
      </main>

      <ExportFullEvidenceBundleModal
        open={exportFullOpen}
        data={data}
        selectedIds={selectedIds}
        onClose={() => setExportFullOpen(false)}
        onExport={async (opts) => {
          await runFullBundleExport(opts);
        }}
      />
    </AuthenticatedAppShell>
  );
}
