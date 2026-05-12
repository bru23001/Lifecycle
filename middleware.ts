import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

function normalizePathname(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

function isGateIdSegment(raw: string): boolean {
  const u = raw.trim().toUpperCase();
  return u === "G1" || u === "G2" || u === "G3" || u === "G4" || u === "G5" || u === "G6" || u === "G7" || u === "G8" || u === "G9" || u === "G10";
}

export function middleware(request: NextRequest) {
  const pathname = normalizePathname(request.nextUrl.pathname);

  const legacyGate = pathname.match(/^\/projects\/([^/]+)\/gate\/([^/]+)$/);
  if (legacyGate) {
    const [, projectId, rawGate] = legacyGate;
    if (isGateIdSegment(rawGate)) {
      const gate = rawGate.trim().toUpperCase();
      const url = request.nextUrl.clone();
      url.pathname = `/projects/${projectId}/gates/${gate.toLowerCase()}/review`;
      return NextResponse.redirect(url, 301);
    }
    return NextResponse.next();
  }

  const projectRoot = pathname.match(/^\/projects\/([^/]+)$/);
  if (projectRoot) {
    const projectId = projectRoot[1];
    if (projectId !== "new") {
      const url = request.nextUrl.clone();
      url.pathname = `/projects/${projectId}/workspace`;
      return NextResponse.redirect(url, 301);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/projects/:path*"],
};
