import { NextResponse } from "next/server";

import { loadEvidenceCenterData } from "@/lib/server/evidence";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const url = new URL(req.url);
  const scope = url.searchParams.get("scope") ?? "full";
  const selected = url.searchParams.getAll("selectedId");

  try {
    const data = await loadEvidenceCenterData(id);

    if (scope === "selected") {
      const body = JSON.stringify(
        {
          scope: "selected",
          project: data.project,
          selectedEvidenceIds: selected,
          manifestVersion: "1.0",
          generatedAt: new Date().toISOString(),
        },
        null,
        2,
      );
      return new NextResponse(body, {
        status: 200,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Content-Disposition": `attachment; filename="${data.exportBundle.selectedFilename}"`,
        },
      });
    }

    if (scope === "gate") {
      const body = JSON.stringify(
        {
          scope: "gate",
          project: data.project,
          gateCoverage: data.evidenceByGate,
          manifestVersion: "1.0",
          generatedAt: new Date().toISOString(),
        },
        null,
        2,
      );
      return new NextResponse(body, {
        status: 200,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Content-Disposition": `attachment; filename="${data.exportBundle.gateBundleFilename}"`,
        },
      });
    }

    const body = JSON.stringify(
      {
        scope: "full",
        project: data.project,
        evidenceItems: data.evidenceItems.map((row) => row.id),
        gateCoverage: data.evidenceByGate,
        phaseCoverage: data.evidenceByPhase,
        manifestVersion: "1.0",
        generatedAt: new Date().toISOString(),
      },
      null,
      2,
    );

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${data.exportBundle.fullBundleFilename}"`,
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Export failed";
    return NextResponse.json({ error: message }, { status: 404 });
  }
}
