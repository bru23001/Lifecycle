"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Download, Package, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { EvidenceCenterData } from "@/types/evidence-center.types";

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

  const selectedItems = useMemo(
    () => data.evidenceItems.filter((item) => selectedIds.includes(item.id)),
    [data.evidenceItems, selectedIds],
  );

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
      note: "Stub payload. Replace with signed ZIP bundle generation once backend export orchestration is ready.",
    };
    triggerDownload(`${data.project.code}_evidence-export-stub.json`, JSON.stringify(payload, null, 2), "application/json");
    setMessage("Full export JSON stub generated.");
  };

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-6 py-10">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Evidence Export Bundle</h1>
        <p className="text-sm text-slate-600">
          Configure selected evidence and download CSV/JSON stubs while backend ZIP packaging is integrated.
        </p>
        <p className="text-xs text-slate-500">
          Project: <span className="font-medium text-slate-700">{data.project.name}</span> ({data.project.code})
        </p>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-slate-900">Selected Evidence</h2>
        <p className="mt-1 text-xs text-slate-600">Choose evidence items to include in selected exports.</p>
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

      <section className="rounded-xl border border-blue-200 bg-blue-50/70 p-4 text-sm text-slate-700">
        <p className="font-semibold text-slate-900">Backend Bundle Placeholder</p>
        <p className="mt-1">
          Full ZIP bundle packaging, signed download URLs, and long-running export job progress should be connected to
          `/api/projects/{data.project.id}/evidence/export`.
        </p>
      </section>

      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}

      <div className="flex items-center gap-2">
        <Link href={`/projects/${data.project.id}/evidence`}>
          <Button variant="outline">Back to Evidence Center</Button>
        </Link>
        <Link href={`/projects/${data.project.id}/evidence/${selectedIds[0] ?? data.selectedEvidence.detail.id}`}>
          <Button variant="secondary">Open Selected Evidence</Button>
        </Link>
      </div>
    </main>
  );
}
