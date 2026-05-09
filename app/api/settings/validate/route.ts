import { NextResponse } from "next/server";

import { computeActionState } from "@/lib/settings-validation";
import type { SettingsPageData } from "@/types/settings.types";

export async function POST(request: Request) {
  const data = (await request.json()) as SettingsPageData;
  const actionState = computeActionState({ data, hasUnsavedChanges: true });
  return NextResponse.json({
    valid: actionState.blockers.length === 0,
    blockers: actionState.blockers,
  });
}
