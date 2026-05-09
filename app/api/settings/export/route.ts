import { NextResponse } from "next/server";

import { readSettingsStore } from "@/lib/settings-storage";

export async function GET() {
  const data = await readSettingsStore();
  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      "content-type": "application/json",
      "content-disposition": 'attachment; filename="settings-configuration.json"',
    },
  });
}
