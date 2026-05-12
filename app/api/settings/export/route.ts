import { NextResponse } from "next/server";

import { loadSettingsPageData } from "@/lib/server/settings";

export async function GET() {
  const data = await loadSettingsPageData();
  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      "content-type": "application/json",
      "content-disposition": 'attachment; filename="settings-configuration.json"',
    },
  });
}
