/**
 * HTTP smoke checks against a running Next server (dev or production).
 * Run: BASE_URL=http://127.0.0.1:3010 npm run route-smoke
 */
import "dotenv/config";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fetchText(url: string): Promise<{ status: number; text: string }> {
  const res = await fetch(url, {
    redirect: "follow",
    headers: { Accept: "text/html" },
  });
  const text = await res.text();
  return { status: res.status, text };
}

/** Collapses React SSR comment boundaries (e.g. `Gate <!-- -->G1`) so needles match. */
function normalizeHtmlNeedles(html: string): string {
  return html.replace(/<!--[\s\S]*?-->/g, "");
}

function assertContains(path: string, body: string, needle: string) {
  const normalized = normalizeHtmlNeedles(body);
  if (!normalized.includes(needle)) {
    throw new Error(
      `route-smoke failed: ${path} — expected HTML to contain ${JSON.stringify(needle)}`,
    );
  }
}

export async function runRouteSmoke(baseUrl: string): Promise<void> {
  const origin = baseUrl.replace(/\/$/, "");

  const project = await prisma.project.findUnique({
    where: { slug: "demo" },
    select: { id: true },
  });
  if (!project) {
    throw new Error(
      'route-smoke failed: no demo project. Run: npm run seed',
    );
  }
  const id = project.id;

  const checks: { path: string; needle: string }[] = [
    { path: "/", needle: "Welcome back, Alex" },
    { path: "/projects", needle: "Project List" },
    { path: `/projects/${id}`, needle: "Gate status" },
    { path: `/projects/${id}/requirements`, needle: "Requirements" },
    { path: `/projects/${id}/features`, needle: "Features" },
    { path: `/projects/${id}/trace`, needle: "Trace links" },
    { path: `/projects/${id}/workspace`, needle: "Lifecycle Workspace" },
    { path: `/projects/${id}/templates/a-3-2`, needle: "Template Wizard" },
    { path: `/projects/${id}/gate/g1`, needle: "Gate G1" },
    { path: `/projects/${id}/gates/g2/review`, needle: "Feasibility Approval" },
    { path: `/projects/${id}/artifacts`, needle: "Artifact Library" },
    { path: `/projects/${id}/reports`, needle: "Reports" },
    { path: `/projects/${id}/reports/lifecycle-status`, needle: "Lifecycle Status Report" },
    { path: `/projects/${id}/reports/gate-decisions`, needle: "Gate Decision Report" },
    { path: `/projects/${id}/reports/traceability`, needle: "Traceability Coverage Report" },
    { path: `/projects/${id}/reports/missing-evidence`, needle: "Missing Evidence Report" },
    { path: `/projects/${id}/reports/approval-history`, needle: "Approval History Report" },
    { path: `/projects/${id}/reports/evidence-package`, needle: "Full Project Evidence Package" },
    { path: `/projects/${id}/reports/evidence-package/configure`, needle: "Configure Evidence Package" },
    { path: `/projects/${id}/reports/schedule`, needle: "Schedule Reports" },
    { path: `/projects/${id}/traceability`, needle: "Traceability Matrix" },
    { path: `/projects/${id}/traceability/gate-evidence`, needle: "Traceability Matrix" },
    { path: `/projects/${id}/traceability/phase-evidence`, needle: "Traceability Matrix" },
    { path: `/projects/${id}/traceability/phase-artifacts`, needle: "Traceability Matrix" },
    { path: `/projects/${id}/traceability/requirements-design`, needle: "Traceability Matrix" },
    { path: `/projects/${id}/traceability/requirements-tests`, needle: "Traceability Matrix" },
    { path: `/projects/${id}/traceability/ag-1`, needle: "Traceability Detail" },
  ];

  for (const { path, needle } of checks) {
    const url = `${origin}${path}`;
    const { status, text } = await fetchText(url);
    if (status >= 400) {
      throw new Error(`route-smoke failed: GET ${path} → HTTP ${status}`);
    }
    assertContains(path, text, needle);
  }

  console.log(`route-smoke OK: ${checks.length} routes @ ${origin}`);
}

async function main() {
  const base =
    process.env.BASE_URL?.trim() || "http://127.0.0.1:3001";
  await runRouteSmoke(base);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
