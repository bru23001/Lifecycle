import { NextResponse } from "next/server";

import { executeGlobalSearch, normalizeGlobalSearchQuery } from "@/lib/server/global-search";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("q") ?? "";
  const query = normalizeGlobalSearchQuery(raw);
  if (query.length < 2) {
    return NextResponse.json({ query, results: [] });
  }

  try {
    const results = await executeGlobalSearch(query);
    return NextResponse.json({ query, results });
  } catch {
    return NextResponse.json({ error: "search_failed", query, results: [] }, { status: 500 });
  }
}
