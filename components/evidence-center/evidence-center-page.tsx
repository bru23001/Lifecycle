"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { AuthenticatedAppShell } from "@/components/lifecycle-workspace/authenticated-app-shell";
import { Breadcrumbs } from "@/components/lifecycle-workspace/breadcrumbs";
import { PaneSwitcher } from "@/components/lifecycle-workspace/pane-switcher";
import { TopHeader } from "@/components/lifecycle-workspace/top-header";
import { Button } from "@/components/ui/button";
import { exportEvidenceBundle } from "@/lib/evidence-export";
import type { ExportFullEvidenceBundleOptions } from "@/lib/evidence-export";
import { projectOverviewHref } from "@/lib/projects-url";
import type { EvidenceCenterData } from "@/types/evidence-center.types";

import { EvidenceActionBar } from "./evidence-action-bar";
import { EvidenceCenterContent } from "./evidence-center-content";
import { EvidenceCenterGrid } from "./evidence-center-grid";
import { EvidenceCoveragePanel } from "./evidence-coverage-panel";
import { EvidenceDetailPanel } from "./evidence-detail-panel";
import { EvidenceItemsPanel } from "./evidence-items-panel";
import { ExportFullEvidenceBundleModal } from "./export-full-evidence-bundle-modal";
import { applyEvidenceFilters } from "./evidence-center-shared";
import type { EvidenceFilters, EvidenceTab } from "./evidence-center-shared";

export function EvidenceCenterPage({
  initial,
  selectedEvidenceId,
  initialFilters,
  view = "list",
}: {
  initial: EvidenceCenterData;
  selectedEvidenceId?: string;
  initialFilters?: Partial<EvidenceFilters>;
  /** `detail` — deep-linked evidence item (§18): header, breadcrumbs, and mobile layout emphasize the item. */
  view?: "list" | "detail";
}) {
  const router = useRouter();
  const initialSelectedId =
    selectedEvidenceId && initial.evidencePackages[selectedEvidenceId]
      ? selectedEvidenceId
      : initial.selectedEvidence.detail.id;
  const [filters, setFilters] = useState<EvidenceFilters>({
    search: initialFilters?.search ?? "",
    type: initialFilters?.type ?? "all",
    phase: initialFilters?.phase ?? "all",
    gate: initialFilters?.gate ?? "all",
    sort: initialFilters?.sort ?? "updated",
  });
  const [selectedId, setSelectedId] = useState(initialSelectedId);
  const [selectedTab, setSelectedTab] = useState<EvidenceTab>("overview");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedForExport, setSelectedForExport] = useState<string[]>(
    initial.evidencePackages[initialSelectedId] ? [initialSelectedId] : [],
  );
  const [mobilePane, setMobilePane] = useState<"items" | "detail" | "coverage">(
    view === "detail" ? "detail" : "items",
  );
  const [addEvidenceOpen, setAddEvidenceOpen] = useState(false);
  const [exportFullOpen, setExportFullOpen] = useState(false);

  const selectedEvidence = initial.evidencePackages[selectedId];
  const activeEvidence = selectedEvidence ?? initial.selectedEvidence;
  const isDetailView = view === "detail" && activeEvidence.detail.id !== "empty";

  const filteredItems = useMemo(() => applyEvidenceFilters(initial.evidenceItems, filters), [initial.evidenceItems, filters]);

  const evidenceListHref =
    filters.phase !== "all"
      ? `/projects/${initial.project.id}/evidence?phase=${encodeURIComponent(filters.phase)}`
      : `/projects/${initial.project.id}/evidence`;
  const detailPhaseQuery = filters.phase !== "all" ? `?phase=${encodeURIComponent(filters.phase)}` : "";

  const navPhaseParsed = filters.phase !== "all" ? Number.parseInt(filters.phase, 10) : NaN;
  const navPhaseScope =
    Number.isFinite(navPhaseParsed) && navPhaseParsed >= 1 && navPhaseParsed <= 14
      ? navPhaseParsed
      : initial.project.currentPhase;

  const onSelectEvidence = (evidenceId: string) => {
    if (!initial.evidencePackages[evidenceId]) {
      setError("Unable to load evidence detail. Please retry.");
      return;
    }
    setError(null);
    setIsLoading(true);
    window.setTimeout(() => {
      setSelectedId(evidenceId);
      setSelectedForExport((prev) => (prev.includes(evidenceId) ? prev : [evidenceId, ...prev]));
      setSelectedTab("overview");
      setIsLoading(false);
      router.push(`/projects/${initial.project.id}/evidence/${evidenceId}${detailPhaseQuery}`);
    }, 120);
  };

  const onRetry = () => {
    setError(null);
    setIsLoading(false);
  };

  const runExport = async (
    scope: "selected" | "gate" | "full",
    ids: string[],
  ) => {
    if (scope === "full") {
      setExportFullOpen(true);
      return;
    }
    setError(null);
    try {
      await exportEvidenceBundle(initial, scope, ids);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Export failed.");
    }
  };

  const runFullBundleExport = async (options: ExportFullEvidenceBundleOptions) => {
    setError(null);
    try {
      await exportEvidenceBundle(initial, "full", selectedForExport, options);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Export failed.");
    }
  };

  const onToggleExportSelection = (evidenceId: string) => {
    setSelectedForExport((prev) => (prev.includes(evidenceId) ? prev.filter((id) => id !== evidenceId) : [...prev, evidenceId]));
  };

  return (
    <AuthenticatedAppShell
      projectId={initial.project.id}
      projectName={initial.project.name}
      phaseSummary={`Evidence readiness: ${activeEvidence.completeness.overallPercent}%`}
      phaseProgressPct={activeEvidence.completeness.overallPercent}
      navActive="evidence"
      projectCurrentPhase={initial.project.currentPhase}
      navPhaseScope={navPhaseScope}
      workspaceHref={`/projects/${initial.project.id}/workspace?phase=${navPhaseScope}`}
    >
      <TopHeader
        title={isDetailView ? "Evidence Detail" : "Evidence Center"}
        userInitials={initial.user.initials}
        userName={initial.user.name}
        userRole={initial.user.role}
        actionButtonLabel="Export Bundle"
        actionButtonAriaLabel="Export evidence bundle"
        onActionButtonClick={() => setExportFullOpen(true)}
      />

      <main
        className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[var(--app-bg)]"
        {...(isDetailView ? { "data-route-smoke": "evidence-detail" } : {})}
      >
        <div className="mx-auto w-full max-w-[1920px] shrink-0 px-5 pb-3 pt-4 min-[901px]:px-8">
          <Breadcrumbs
            items={
              isDetailView
                ? [
                    { label: "Projects", href: "/projects" },
                    {
                      label: initial.project.name,
                      href: projectOverviewHref(initial.project.id),
                    },
                    { label: "Evidence", href: evidenceListHref },
                    {
                      label: `${activeEvidence.detail.evidenceCode} · ${activeEvidence.detail.name}`,
                    },
                  ]
                : [
                    { label: "Projects", href: "/projects" },
                    {
                      label: initial.project.name,
                      href: projectOverviewHref(initial.project.id),
                    },
                    { label: "Evidence", href: evidenceListHref },
                  ]
            }
          />
        </div>

        <EvidenceCenterContent>
          <PaneSwitcher
            panes={[
              { id: "items", label: "Evidence Items" },
              { id: "detail", label: "Detail" },
              { id: "coverage", label: "Coverage" },
            ]}
            active={mobilePane}
            onChange={(id) => setMobilePane(id as typeof mobilePane)}
            className="mx-auto w-full max-w-[1920px]"
          />

          {error ? (
            <div className="mx-auto mb-3 w-full max-w-[1920px] shrink-0 px-5 min-[901px]:px-8">
              <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
                <p>{error}</p>
                <Button type="button" size="sm" variant="outline" onClick={onRetry}>
                  Retry
                </Button>
              </div>
            </div>
          ) : null}

          <EvidenceCenterGrid
            activePane={mobilePane}
            itemsPanel={
              <EvidenceItemsPanel
                evidenceItems={initial.evidenceItems}
                filteredItems={filteredItems}
                filters={filters}
                selectedId={selectedId}
                selectedForExport={selectedForExport}
                isLoading={isLoading}
                addEvidenceOpen={addEvidenceOpen}
                onOpenAddEvidence={() => setAddEvidenceOpen(true)}
                onCloseAddEvidence={() => setAddEvidenceOpen(false)}
                onSelectEvidence={onSelectEvidence}
                onToggleExportSelection={onToggleExportSelection}
                onFiltersChange={setFilters}
                projectId={initial.project.id}
                artifactOptions={initial.evidenceByArtifact.map((a) => ({
                  id: a.artifactId,
                  label: `${a.artifactLocalId} · ${a.artifactTitle}`,
                }))}
              />
            }
            detailPanel={
              <EvidenceDetailPanel
                projectId={initial.project.id}
                artifacts={initial.evidenceByArtifact.map((a) => ({
                  id: a.artifactId,
                  label: `${a.artifactLocalId} · ${a.artifactTitle}`,
                }))}
                selectedEvidence={activeEvidence ?? null}
                selectedTab={selectedTab}
                onTabChange={setSelectedTab}
              />
            }
            coveragePanel={
              activeEvidence ? (
                <EvidenceCoveragePanel
                  data={initial}
                  selectedEvidence={activeEvidence}
                  selectedForExport={selectedForExport}
                  onExport={runExport}
                />
              ) : null
            }
          />

          <EvidenceActionBar actionState={initial.actionState} onPrimaryAction={() => setExportFullOpen(true)} />
        </EvidenceCenterContent>

        <ExportFullEvidenceBundleModal
          open={exportFullOpen}
          data={initial}
          selectedIds={selectedForExport}
          onClose={() => setExportFullOpen(false)}
          onExport={runFullBundleExport}
        />
      </main>
    </AuthenticatedAppShell>
  );
}
