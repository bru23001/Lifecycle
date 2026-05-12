import { prisma } from "@/lib/prisma";

/** Canonical workspace user email (must match `prisma/seed.ts` upsert). */
export const SOLO_WORKSPACE_USER_EMAIL = "solo@local.test";

export type CurrentUser = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  initials: string;
  active: boolean;
};

export type CurrentUserDisplay = {
  name: string;
  role: string;
  initials: string;
};

/**
 * Default shell labels when the DB row is missing (aligned with `prisma/seed.ts` default user).
 * Keeps server modules free of `helpers.ts` coupling.
 */
const SOLO_WORKSPACE_USER_DISPLAY_FALLBACK: CurrentUserDisplay = {
  name: "Signed-in user",
  role: "Member",
  initials: "?",
};

/** Map a loaded user (or null) to UI display fields using the same fallback as `getCurrentUserDisplay`. */
export function displayFromCurrentUser(user: CurrentUser | null): CurrentUserDisplay {
  if (!user) {
    return { ...SOLO_WORKSPACE_USER_DISPLAY_FALLBACK };
  }
  return {
    name: user.name?.trim() || SOLO_WORKSPACE_USER_DISPLAY_FALLBACK.name,
    role: user.role?.trim() || SOLO_WORKSPACE_USER_DISPLAY_FALLBACK.role,
    initials: user.initials?.trim() || SOLO_WORKSPACE_USER_DISPLAY_FALLBACK.initials,
  };
}

/**
 * Loads the seeded solo workspace user when the DB is available.
 * This app has no interactive auth; identity is the single local user row.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const row = await prisma.user.findUnique({
      where: { email: SOLO_WORKSPACE_USER_EMAIL },
      select: { id: true, email: true, name: true, role: true, initials: true, active: true },
    });
    return row;
  } catch {
    return null;
  }
}

export async function requireCurrentUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Current user is unavailable (database not reachable or user not seeded).");
  }
  return user;
}

/** Display shape for shells and headers; merges DB user with seed-aligned fallback when DB is down. */
export async function getCurrentUserDisplay(): Promise<CurrentUserDisplay> {
  return displayFromCurrentUser(await getCurrentUser());
}
