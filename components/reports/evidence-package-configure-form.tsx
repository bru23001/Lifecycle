"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { FullProjectEvidencePackageSummary } from "@/types/reports.types";

export function EvidencePackageConfigureForm({
  projectId,
  initial,
}: {
  projectId: string;
  initial: FullProjectEvidencePackageSummary;
}) {
  const [includes, setIncludes] = useState({
    artifacts: initial.includesArtifacts,
    evidence: initial.includesEvidenceFiles,
    gates: initial.includesGateDecisions,
    trace: initial.includesTraceabilityLinks,
    approvals: initial.includesApprovalRecords,
    manifest: initial.includesAuditManifest,
  });

  const toggle = (key: keyof typeof includes) => {
    setIncludes((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6">
      <fieldset className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <legend className="text-lg font-semibold text-slate-900">Include in export</legend>
        <ul className="mt-4 space-y-3 text-sm">
          {(
            [
              ["artifacts", "Markdown artifacts", includes.artifacts],
              ["evidence", "JSON evidence files", includes.evidence],
              ["gates", "Gate decisions", includes.gates],
              ["trace", "Traceability matrix & links", includes.trace],
              ["approvals", "Approval records", includes.approvals],
              ["manifest", "Audit manifest & checksums", includes.manifest],
            ] as const
          ).map(([key, label, checked]) => (
            <li key={key}>
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(key)}
                  className="size-4 rounded border-slate-300"
                />
                <span className="text-slate-800">{label}</span>
              </label>
            </li>
          ))}
        </ul>
      </fieldset>
      <div className="flex flex-wrap gap-3">
        <Button type="button">Generate export manifest</Button>
        <Link
          href={`/projects/${projectId}/reports/evidence-package`}
          className="inline-flex h-8 items-center justify-center rounded-lg border border-border bg-background px-2.5 text-sm font-medium hover:bg-muted"
        >
          Back to package
        </Link>
      </div>
      <p className="text-xs text-slate-500">
        Selection is stored for this session. Wire to backend export job when available.
      </p>
    </div>
  );
}
