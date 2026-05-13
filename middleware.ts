import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { incrementRequestCount } from "@/lib/server/metrics";

const BASE62 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

function newRequestId(): string {
  let out = "req_";
  for (let i = 0; i < 22; i++) {
    out += BASE62[Math.floor(Math.random() * 62)]!;
  }
  return out;
}

function normalizePathname(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

function isGateIdSegment(raw: string): boolean {
  const u = raw.trim().toUpperCase();
  return (
    u === "G1" ||
    u === "G2" ||
    u === "G3" ||
    u === "G4" ||
    u === "G5" ||
    u === "G6" ||
    u === "G7" ||
    u === "G8" ||
    u === "G9" ||
    u === "G10"
  );
}

export function middleware(request: NextRequest) {
  const pathname = normalizePathname(request.nextUrl.pathname);
  const rid = request.headers.get("x-request-id")?.trim() || newRequestId();

  const legacyGate = pathname.match(/^\/projects\/([^/]+)\/gate\/([^/]+)$/);
  if (legacyGate) {
    const [, projectId, rawGate] = legacyGate;
    if (isGateIdSegment(rawGate)) {
      const gate = rawGate.trim().toUpperCase();
      const url = request.nextUrl.clone();
      url.pathname = `/projects/${projectId}/gates/${gate.toLowerCase()}/review`;
      const res = NextResponse.redirect(url, 301);
      res.headers.set("X-Request-ID", rid);
      incrementRequestCount({
        method: request.method,
        pathname,
        statusCode: 301,
      });
      return res;
    }
    const res = NextResponse.next();
    res.headers.set("X-Request-ID", rid);
    incrementRequestCount({
      method: request.method,
      pathname,
      statusCode: 200,
    });
    return res;
  }

  const res = NextResponse.next();
  res.headers.set("X-Request-ID", rid);
  incrementRequestCount({
    method: request.method,
    pathname,
    statusCode: 200,
  });
  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)).*)",
  ],
};
