"use client";

import { useMemo, useState } from "react";

import { AuthenticatedAppShell } from "@/components/lifecycle-workspace/authenticated-app-shell";
import { Breadcrumbs } from "@/components/lifecycle-workspace/breadcrumbs";
import { TopHeader } from "@/components/lifecycle-workspace/top-header";
import type { ArtifactLibraryData, ArtifactListItem } from "@/types/artifact-library.types";

import { ArtifactContentTabs } from "./ArtifactContentTabs";
import { ArtifactDetailHeader } from "./ArtifactDetailHeader";
import { ArtifactLibraryContent } from "./ArtifactLibraryContent";
import { ArtifactLibraryGrid } from "./ArtifactLibraryGrid";
import { ArtifactListPanel } from "./ArtifactListPanel";
import { ArtifactQuickInfo } from "./ArtifactQuickInfo";
import { ExportPackageCard } from "./ExportPackageCard";
import { LinkedGateCard } from "./LinkedGateCard";
import { LinkedPhaseCard } from "./LinkedPhaseCard";

function applyFilters(
  items: ArtifactListItem[],
  search: string,
  phaseFilter: string,
  statusFilter: string,
) {
  return items.filter((item) => {
    const searchOk =
      search.trim().length === 0 ||
      `${item.artifactCode} ${item.name} ${item.phaseName} ${item.templateName}`
        .toLowerCase()
        .includes(search.toLowerCase());
    const phaseOk = phaseFilter === "all" || String(item.phaseNumber) === phaseFilter;
    const statusOk = statusFilter === "all" || item.status === statusFilter;
    return searchOk && phaseOk && statusOk;
  });
}

export function ArtifactLibraryPage({
  data,
  selectedArtifactId,
}: {
  data: ArtifactLibraryData;
  selectedArtifactId?: string;
}) {
  const [search, setSearch] = useState("");
  const [phaseFilter, setPhaseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredItems = useMemo(
    () => applyFilters(data.artifactListItems, search, phaseFilter, statusFilter),
    [data.artifactListItems, search, phaseFilter, statusFilter],
  );

  return (
    <AuthenticatedAppShell
      projectId={data.project.id}
      projectName={data.project.name}
      phaseSummary={`Phase ${data.selectedArtifact.detail.phaseNumber}: ${data.selectedArtifact.detail.phaseName}`}
      phaseProgressPct={data.selectedArtifact.quickInfo.overallProgressPercent}
      navActive="artifacts"
      gatesHref={data.selectedArtifact.linkedGate.reviewHref}
    >
      <TopHeader title="Artifact Library" userInitials={data.user.initials} />
      <ArtifactLibraryContent>
        <div className="mx-auto w-full max-w-[1920px] px-5 pt-4 min-[901px]:px-8">
          <Breadcrumbs
            items={[
              { label: "Projects", href: "/projects" },
              { label: data.project.name, href: `/projects/${data.project.id}` },
              { label: "Artifacts", href: `/projects/${data.project.id}/artifacts` },
              {
                label: `${data.selectedArtifact.detail.artifactCode} ${data.selectedArtifact.detail.name}`,
              },
            ]}
          />
        </div>

        <ArtifactLibraryGrid
          listPanel={
            <ArtifactListPanel
              projectId={data.project.id}
              selectedArtifactId={selectedArtifactId ?? data.selectedArtifact.detail.id}
              search={search}
              onSearchChange={setSearch}
              phaseFilter={phaseFilter}
              onPhaseFilterChange={setPhaseFilter}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              items={filteredItems}
            />
          }
          detailPanel={
            <>
              <ArtifactDetailHeader detail={data.selectedArtifact.detail} />
              <ArtifactContentTabs artifact={data.selectedArtifact} />
            </>
          }
          contextPanel={
            <>
              <LinkedPhaseCard phase={data.selectedArtifact.linkedPhase} />
              <LinkedGateCard gate={data.selectedArtifact.linkedGate} />
              <ArtifactQuickInfo info={data.selectedArtifact.quickInfo} />
              <ExportPackageCard
                exportPackage={data.selectedArtifact.exportPackage}
                markdown={data.selectedArtifact.markdownView}
                json={data.selectedArtifact.jsonEvidence}
              />
            </>
          }
        />
      </ArtifactLibraryContent>
    </AuthenticatedAppShell>
  );
}
