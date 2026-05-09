import { prisma } from "@/lib/prisma";

/**
 * Resolve canonical project id from a dynamic route segment: CUID id or unique slug.
 * Trims whitespace so malformed URLs still resolve when possible.
 */
export async function resolveProjectIdFromRouteParam(
  projectParam: string,
): Promise<string | null> {
  const key = projectParam.trim();
  if (!key) return null;

  const row = await prisma.project.findFirst({
    where: {
      OR: [{ id: key }, { slug: key }],
    },
    select: { id: true },
  });

  return row?.id ?? null;
}
