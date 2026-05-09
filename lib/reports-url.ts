import type { ReportsFilters } from "@/types/reports.types";

import { formatDateTimeLabel } from "@/lib/server/helpers";

export function mergeReportsFilters(
  projectId: string,
  partial?: Partial<ReportsFilters>,
): ReportsFilters {
  const now = new Date();
  return {
    projectId,
    dateRange: partial?.dateRange ?? "this_quarter",
    startDate: partial?.startDate,
    endDate: partial?.endDate,
    phaseNumber: partial?.phaseNumber ?? "all",
    gateCode: partial?.gateCode ?? "all",
    reportStatus: partial?.reportStatus ?? "all",
    lastUpdatedLabel: partial?.lastUpdatedLabel ?? formatDateTimeLabel(now),
  };
}

function parsePhase(raw: string | undefined): number | "all" {
  if (!raw || raw === "all") return "all";
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1 || n > 14) return "all";
  return n;
}

export function reportsFiltersFromSearchParams(
  projectId: string,
  searchParams: Record<string, string | string[] | undefined>,
): ReportsFilters {
  const get = (key: string): string | undefined => {
    const v = searchParams[key];
    return Array.isArray(v) ? v[0] : v;
  };

  const dr = get("dateRange");
  const dateRange =
    dr === "this_week" ||
    dr === "this_month" ||
    dr === "this_quarter" ||
    dr === "this_year" ||
    dr === "custom"
      ? dr
      : "this_quarter";

  const rs = get("reportStatus");
  const reportStatus =
    rs === "ready" || rs === "stale" || rs === "missing" ? rs : "all";

  const gc = get("gateCode") ?? "all";
  const gateCode =
    gc === "G1" ||
    gc === "G2" ||
    gc === "G3" ||
    gc === "G4" ||
    gc === "G5" ||
    gc === "G6" ||
    gc === "G7" ||
    gc === "G8" ||
    gc === "G9" ||
    gc === "G10"
      ? gc
      : "all";

  return mergeReportsFilters(projectId, {
    dateRange,
    startDate: get("startDate"),
    endDate: get("endDate"),
    phaseNumber: parsePhase(get("phase")),
    gateCode,
    reportStatus,
  });
}

export function reportsFiltersToSearchParams(filters: ReportsFilters): URLSearchParams {
  const q = new URLSearchParams();
  if (filters.dateRange !== "this_quarter") q.set("dateRange", filters.dateRange);
  if (filters.phaseNumber !== "all") q.set("phase", String(filters.phaseNumber));
  if (filters.gateCode && filters.gateCode !== "all") q.set("gateCode", filters.gateCode);
  if (filters.reportStatus && filters.reportStatus !== "all") q.set("reportStatus", filters.reportStatus);
  if (filters.startDate !== undefined && filters.startDate !== "") {
    q.set("startDate", filters.startDate);
  }
  if (filters.endDate !== undefined && filters.endDate !== "") {
    q.set("endDate", filters.endDate);
  }
  return q;
}
