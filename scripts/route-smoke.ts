/**
 * HTTP smoke checks against a running Next server (dev or production).
 * Run: BASE_URL=http://127.0.0.1:3010 npm run route-smoke
 */
import "dotenv/config";

import { PrismaClient } from "@prisma/client";

import { SOLO_WORKSPACE_USER_EMAIL } from "@/lib/server/current-user";

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

  const soloUser = await prisma.user.findUnique({
    where: { email: SOLO_WORKSPACE_USER_EMAIL },
    select: { name: true },
  });
  const welcomeNeedle =
    soloUser?.name?.trim() != null && soloUser.name.trim().length > 0
      ? `Welcome back, ${soloUser.name.trim()}`
      : "Welcome back,";

  const checks: { path: string; needle: string }[] = [
    { path: "/", needle: welcomeNeedle },
    { path: "/dashboard", needle: welcomeNeedle },
    { path: "/projects", needle: "Project List" },
    { path: `/projects/${id}`, needle: "Lifecycle Workspace" },
    { path: `/projects/${id}/requirements`, needle: "Requirements" },
    { path: `/projects/${id}/features`, needle: "Features" },
    { path: `/projects/${id}/trace`, needle: "Trace links" },
    { path: `/projects/${id}/workspace`, needle: "Lifecycle Workspace" },
    { path: `/projects/${id}/templates/a-3-2`, needle: "Template Wizard" },
    { path: `/projects/${id}/gates/g1/review`, needle: "Gate Review" },
    { path: `/projects/${id}/gates/g2/review`, needle: "Gate Review" },
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
    { path: "/approvals", needle: "Approval Center" },
    { path: "/settings", needle: "Settings" },
    { path: "/api/healthz", needle: `"ok":true` },
    { path: `/projects/${id}/traceability/gate-evidence`, needle: "Traceability Matrix" },
    { path: `/projects/${id}/traceability/phase-evidence`, needle: "Traceability Matrix" },
    { path: `/projects/${id}/traceability/phase-artifacts`, needle: "Traceability Matrix" },
    { path: `/projects/${id}/traceability/requirements-design`, needle: "Traceability Matrix" },
    { path: `/projects/${id}/traceability/requirements-tests`, needle: "Traceability Matrix" },
  ];

  const firstTraceLink = await prisma.traceLink.findFirst({
    where: { projectId: id },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });
  if (firstTraceLink) {
    checks.push({
      path: `/projects/${id}/traceability/${firstTraceLink.id}`,
      needle: "Traceability Detail",
    });
  }

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

async function chooseDefaultBaseUrl(): Promise<string> {
  const candidates = ["http://127.0.0.1:3001", "http://127.0.0.1:3033"];
  for (const candidate of candidates) {
    try {
      const home = await fetchText(`${candidate}/`);
      const projects = await fetchText(`${candidate}/projects`);
      if (home.status > 0 && home.status < 500 && projects.status > 0 && projects.status < 500) {
        return candidate;
      }
    } catch {
      // Try next candidate.
    }
  }
  return candidates[0]!;
}

async function main() {
  const base =
    process.env.BASE_URL?.trim() || await chooseDefaultBaseUrl();
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
