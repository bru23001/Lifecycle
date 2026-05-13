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

async function fetchJson(url: string): Promise<{ status: number; json: unknown }> {
  const res = await fetch(url, {
    redirect: "follow",
    headers: { Accept: "application/json" },
  });
  const json = await res.json().catch(() => null);
  return { status: res.status, json };
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

  /** Registry id that must exist in `templates/registry` (used for template wizard smoke). */
  const templateWizardSmokeId = "A-3.2";
  const templateWizardPath = `/projects/${id}/templates/${encodeURIComponent(templateWizardSmokeId)}`;

  const welcomeNeedle = "Welcome back,";

  const checks: { path: string; needle: string }[] = [
    { path: "/", needle: welcomeNeedle },
    { path: "/dashboard", needle: welcomeNeedle },
    { path: "/projects", needle: "Project List" },
    { path: "/projects/new", needle: "Create project" },
    { path: `/projects/${id}`, needle: "Project" },
    { path: `/projects/${id}/requirements`, needle: "Requirements" },
    { path: `/projects/${id}/features`, needle: "Features" },
    { path: `/projects/${id}/trace`, needle: "Trace links" },
    { path: `/projects/${id}/workspace`, needle: "Lifecycle Workspace" },
    { path: templateWizardPath, needle: "Template Wizard" },
    { path: `/projects/${id}/gates`, needle: "Decision gates" },
    { path: `/projects/${id}/gates/g1/review`, needle: "Gate Review" },
    { path: `/projects/${id}/gates/g2/review`, needle: "Gate Review" },
    { path: `/projects/${id}/artifacts`, needle: "Artifact" },
    { path: `/projects/${id}/evidence`, needle: "Evidence Center" },
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
    { path: "/notifications", needle: "Notifications" },
    { path: "/settings", needle: "Settings" },
    { path: "/api/healthz", needle: `"ok":true` },
    { path: `/projects/${id}/traceability/gate-evidence`, needle: "Traceability Matrix" },
    { path: `/projects/${id}/traceability/phase-evidence`, needle: "Traceability Matrix" },
    { path: `/projects/${id}/traceability/phase-artifacts`, needle: "Traceability Matrix" },
    { path: `/projects/${id}/traceability/requirements-design`, needle: "Traceability Matrix" },
    { path: `/projects/${id}/traceability/requirements-tests`, needle: "Traceability Matrix" },
  ];

  const firstEvidence = await prisma.evidenceItem.findFirst({
    where: { projectId: id },
    orderBy: { updatedAt: "desc" },
    select: { id: true },
  });
  if (firstEvidence) {
    checks.push({
      path: `/projects/${id}/evidence/${firstEvidence.id}`,
      needle: "Evidence Detail",
    });
  }

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

  const firstAuditEvent = await prisma.auditEntry.findFirst({
    where: { projectId: id },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });
  if (firstAuditEvent) {
    checks.push({
      path: `/projects/${id}/audit/${firstAuditEvent.id}`,
      needle: "Project List",
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

  const searchRes = await fetch(`${origin}/api/search?q=demo`, {
    headers: { Accept: "application/json" },
  });
  if (!searchRes.ok) {
    throw new Error(`route-smoke failed: GET /api/search?q=demo → HTTP ${searchRes.status}`);
  }
  const searchJson = (await searchRes.json()) as { results?: unknown };
  if (!Array.isArray(searchJson.results)) {
    throw new Error("route-smoke failed: /api/search response missing results array");
  }

  console.log(`route-smoke OK: ${checks.length} routes + search API @ ${origin}`);
}

async function chooseDefaultBaseUrl(): Promise<string> {
  const candidates = [
    "http://127.0.0.1:3001",
    "http://127.0.0.1:3033",
    "http://127.0.0.1:3034",
    "http://127.0.0.1:3035",
    "http://127.0.0.1:3111",
    "http://127.0.0.1:3010",
  ];
  for (const candidate of candidates) {
    try {
      const home = await fetchText(`${candidate}/`);
      const projects = await fetchText(`${candidate}/projects`);
      const notifications = await fetchText(`${candidate}/notifications`);
      const search = await fetchJson(`${candidate}/api/search?q=demo`);
      const projectsHtml = normalizeHtmlNeedles(projects.text);
      const looksLikeLifecyclePlatform =
        projectsHtml.includes("Project List") ||
        projectsHtml.includes("No projects yet") ||
        projectsHtml.includes("New project modal requested");
      const hasSearchResultsArray =
        search.status > 0 &&
        search.status < 500 &&
        !!search.json &&
        typeof search.json === "object" &&
        Array.isArray((search.json as { results?: unknown }).results);
      if (
        home.status > 0 &&
        home.status < 500 &&
        projects.status > 0 &&
        projects.status < 500 &&
        notifications.status > 0 &&
        notifications.status < 500 &&
        looksLikeLifecyclePlatform &&
        hasSearchResultsArray
      ) {
        return candidate;
      }
    } catch {
      // Try next candidate.
    }
  }
  throw new Error(
    `route-smoke failed: could not auto-detect a compatible Lifecycle Platform server. ` +
      `Set BASE_URL explicitly, e.g. BASE_URL=http://127.0.0.1:3010 npm run route-smoke`,
  );
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
