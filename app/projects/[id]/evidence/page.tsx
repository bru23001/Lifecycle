import { EvidenceCenterPage } from "@/components/evidence-center/evidence-center-page";
import type { EvidenceFilters } from "@/components/evidence-center/evidence-center-shared";
import { loadEvidenceCenterData } from "@/lib/server/evidence";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function searchParamFirst(value: string | string[] | undefined): string | undefined {
  if (value === undefined) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

function evidenceFiltersFromSearchParams(
  sp: Record<string, string | string[] | undefined>,
): Partial<EvidenceFilters> {
  const rawPhase = searchParamFirst(sp.phase) ?? "all";
  let phase: EvidenceFilters["phase"] = "all";
  if (rawPhase && rawPhase !== "all") {
    const n = Number.parseInt(rawPhase, 10);
    phase = Number.isFinite(n) && n >= 1 && n <= 14 ? String(n) : "all";
  }
  return {
    search: searchParamFirst(sp.search) ?? searchParamFirst(sp.q) ?? "",
    phase,
    gate: searchParamFirst(sp.gate)?.toUpperCase() ?? "all",
  };
}

export default async function ProjectEvidencePage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const sp = await searchParams;
  const data = await loadEvidenceCenterData(id);
  return <EvidenceCenterPage initial={data} initialFilters={evidenceFiltersFromSearchParams(sp)} />;
}
