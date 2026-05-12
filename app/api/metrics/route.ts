import { NextResponse } from "next/server";

import { prometheusTextSnapshot } from "@/lib/server/metrics";

export const dynamic = "force-dynamic";

export async function GET() {
  const body = prometheusTextSnapshot();
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
