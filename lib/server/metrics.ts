/**
 * In-process HTTP counters for solo-local Prometheus scrape (CYBERCUBE 4.5 metrics baseline).
 * Low-cardinality labels only.
 */
type Key = string;

const requestCounts = new Map<Key, number>();

function key(method: string, route: string, statusClass: string): string {
  return `${method}|${route}|${statusClass}`;
}

export function incrementRequestCount(input: {
  method: string;
  pathname: string;
  statusCode: number;
}): void {
  const route = normalizeRouteLabel(input.pathname);
  const statusClass = `${Math.floor(input.statusCode / 100)}xx`;
  const k = key(input.method.toUpperCase(), route, statusClass);
  requestCounts.set(k, (requestCounts.get(k) ?? 0) + 1);
}

function normalizeRouteLabel(pathname: string): string {
  if (pathname === "/") return "/";
  if (pathname.startsWith("/api/")) return pathname;
  // Collapse high-cardinality ids to placeholders
  return pathname
    .replace(
      /\/projects\/[^/]+\/(artifacts|templates|traceability|gates|evidence|reports|trace|requirements|features|form)\/[^/]+/g,
      "/projects/:id/$1/:sub",
    )
    .replace(/\/projects\/[^/]+/g, "/projects/:id")
    .replace(/\/approvals\/[^/]+/g, "/approvals/:id");
}

export function prometheusTextSnapshot(): string {
  const lines: string[] = [
    "# HELP cybercube_http_requests_total Total HTTP requests (solo in-process counter).",
    "# TYPE cybercube_http_requests_total counter",
  ];
  for (const [compound, count] of requestCounts.entries()) {
    const [method, route, status] = compound.split("|");
    lines.push(
      `cybercube_http_requests_total{service="lifecycle-platform",method="${escapeLabel(
        method,
      )}",route="${escapeLabel(route)}",status_class="${escapeLabel(status)}"} ${count}`,
    );
  }
  if (requestCounts.size === 0) {
    lines.push(
      'cybercube_http_requests_total{service="lifecycle-platform",method="GET",route="/",status_class="2xx"} 0',
    );
  }
  return lines.join("\n") + "\n";
}

function escapeLabel(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}
