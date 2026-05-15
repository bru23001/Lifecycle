/**
 * HTTP smoke checks against a running Next server (dev or production).
 * Run: BASE_URL=http://127.0.0.1:3010 npm run route-smoke
 */
import "dotenv/config";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function getDemoProjectId(): Promise<string> {
  const project = await prisma.project.findUnique({
    where: { slug: "demo" },
    select: { id: true },
  });
  if (!project) {
    throw new Error('route-smoke failed: no demo project. Run: npm run seed');
  }
  return project.id;
}

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
  const id = await getDemoProjectId();

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
    { path: `/projects/${id}/workspace/phases/1/package`, needle: "Phase package" },
    { path: `/projects/${id}/workspace/phases/1/validation`, needle: "Phase validation report" },
    { path: templateWizardPath, needle: "Template Wizard" },
    { path: `/projects/${id}/gates`, needle: "Decision gates" },
    { path: `/projects/${id}/gates/g1/review`, needle: "Gate Review" },
    { path: `/projects/${id}/gates/g2/review`, needle: "Gate Review" },
    { path: `/projects/${id}/gates/g3/review`, needle: "Gate Review" },
    { path: `/projects/${id}/gates/g3/package-preview`, needle: "Gate package preview" },
    { path: `/projects/${id}/gates/g4/review`, needle: "Gate Review" },
    { path: `/projects/${id}/artifacts`, needle: "Artifact" },
    { path: `/projects/${id}/evidence`, needle: "Evidence Center" },
    { path: `/projects/${id}/evidence/new`, needle: "Add Evidence" },
    { path: `/projects/${id}/evidence/export`, needle: "Evidence export hub" },
    { path: `/projects/${id}/reports`, needle: "Reports" },
    { path: `/projects/${id}/reports?phase=1`, needle: "project-reports-hub" },
    { path: `/projects/${id}/reports/lifecycle-status`, needle: "Lifecycle Status Report" },
    { path: `/projects/${id}/reports/gate-decisions`, needle: "Gate Decision Report" },
    { path: `/projects/${id}/reports/traceability`, needle: "Traceability Coverage Report" },
    { path: `/projects/${id}/reports/missing-evidence`, needle: "Missing Evidence Report" },
    { path: `/projects/${id}/reports/approval-history`, needle: "Approval History Report" },
    { path: `/projects/${id}/reports/evidence-package`, needle: "Full Project Evidence Package" },
    { path: `/projects/${id}/reports/evidence-package/configure`, needle: "Configure Evidence Package" },
    { path: `/projects/${id}/reports/schedule`, needle: "Schedule Reports" },
    { path: `/projects/${id}/traceability`, needle: "Traceability Matrix" },
    { path: `/projects/${id}/traceability?phase=1`, needle: "Traceability Matrix" },
    { path: `/projects/${id}/evidence?phase=1`, needle: "Evidence Center" },
    { path: `/projects/${id}/traceability`, needle: "Create Trace Link" },
    { path: `/projects?selected=${id}`, needle: "Add Evidence" },
    { path: `/projects?selected=${id}`, needle: "Generate Report" },
    { path: `/projects?selected=${id}`, needle: "Export Project Package" },
    { path: "/approvals", needle: "Approval Center" },
    { path: "/notifications", needle: "Notifications" },
    { path: "/settings", needle: "Settings" },
    { path: "/settings/lifecycle", needle: "Lifecycle Configuration" },
    { path: "/settings/templates", needle: "Template Registry" },
    { path: "/settings/templates/new", needle: "New template" },
    { path: "/settings/templates/a-3-2", needle: "Feasibility Assessment" },
    { path: "/settings/templates/a-3-2/edit", needle: "Edit template" },
    { path: "/settings/gates", needle: "Gate Rules" },
    { path: "/settings/gates/new", needle: "New gate rule" },
    { path: "/settings/gates/gate-rule-g1", needle: "Idea Acceptance" },
    { path: "/settings/gates/gate-rule-g1/edit", needle: "Edit gate rule" },
    { path: "/settings/roles", needle: "Roles / Permissions" },
    { path: "/settings/roles/new", needle: "New role" },
    { path: "/settings/roles/viewer", needle: "Viewer" },
    { path: "/settings/roles/viewer/edit", needle: "Edit role" },
    { path: "/settings/exports", needle: "Export Settings" },
    { path: "/settings/storage", needle: "Local Storage Settings" },
    { path: "/api/healthz", needle: `"ok":true` },
    { path: `/projects/${id}/traceability/gate-evidence`, needle: "Gate ↔ Evidence traceability" },
    { path: `/projects/${id}/traceability/gate-evidence/g1`, needle: "Gate ↔ Evidence" },
    { path: `/projects/${id}/traceability/phase-evidence`, needle: "Phase ↔ Evidence traceability" },
    { path: `/projects/${id}/traceability/phase-evidence/phase-1`, needle: "Phase ↔ Evidence" },
    { path: `/projects/${id}/traceability/phase-artifacts`, needle: "Phase → Artifact traceability" },
    { path: `/projects/${id}/traceability/phase-artifacts/1`, needle: "Linked artifacts" },
    { path: `/projects/${id}/traceability/requirements-design`, needle: "Requirement ↔ Design traceability" },
    { path: `/projects/${id}/traceability/requirements-design?type=functional`, needle: "Requirement ↔ Design traceability" },
    { path: `/projects/${id}/traceability/requirements-tests`, needle: "Requirement ↔ Test traceability" },
    { path: `/projects/${id}/traceability/requirements-tests?type=functional`, needle: "Requirement ↔ Test traceability" },
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
    checks.push({
      path: `/projects/${id}/evidence/${firstEvidence.id}/preview`,
      needle: "Evidence preview",
    });
  }

  const firstRequirement = await prisma.requirement.findFirst({
    where: { projectId: id },
    orderBy: { localId: "asc" },
    select: { id: true },
  });
  if (firstRequirement) {
    checks.push({
      path: `/projects/${id}/requirements/${firstRequirement.id}`,
      needle: "Traceability health",
    });
  }

  const firstTraceLink = await prisma.traceLink.findFirst({
    where: { projectId: id, deletedAt: null },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });
  if (firstTraceLink) {
    checks.push({
      path: `/projects/${id}/traceability/${firstTraceLink.id}`,
      needle: "Traceability Detail",
    });
  }

  const firstTestRelationLink = await prisma.traceLink.findFirst({
    where: { projectId: id, relation: { in: ["tests", "validates"] } },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });
  if (firstTestRelationLink) {
    checks.push({
      path: `/projects/${id}/tests/${firstTestRelationLink.id}`,
      needle: "Test trace link",
    });
  }

  const firstAuditEvent = await prisma.auditEntry.findFirst({
    where: { projectId: id },
    orderBy: { createdAt: "desc" },
    select: { id: true, metadata: true },
  });
  if (firstAuditEvent) {
    checks.push({
      path: `/projects/${id}/audit/${firstAuditEvent.id}`,
      needle: "Audit Trail",
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

  const auditExportRes = await fetch(
    `${origin}/api/projects/${id}/audit/export?format=json`,
    { headers: { Accept: "application/json" } },
  );
  if (!auditExportRes.ok) {
    throw new Error(
      `route-smoke failed: GET /api/projects/${id}/audit/export?format=json → HTTP ${auditExportRes.status}`,
    );
  }
  const auditExportCt = auditExportRes.headers.get("content-type") ?? "";
  if (!auditExportCt.includes("application/json")) {
    throw new Error(
      `route-smoke failed: audit export expected application/json content-type, got "${auditExportCt}"`,
    );
  }
  const auditExportJson = (await auditExportRes.json()) as unknown;
  if (!Array.isArray(auditExportJson)) {
    throw new Error(
      "route-smoke failed: audit export response is not a JSON array",
    );
  }

  console.log(`route-smoke OK: ${checks.length} routes + search API + audit export @ ${origin}`);
}

async function chooseDefaultBaseUrl(): Promise<string> {
  const demoProjectId = await getDemoProjectId();
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
      const phaseValidation = await fetchText(
        `${candidate}/projects/${demoProjectId}/workspace/phases/1/validation`,
      );
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
        phaseValidation.status === 200 &&
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
