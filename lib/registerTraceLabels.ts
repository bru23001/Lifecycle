/** Minimal link shape for trace labeling (decoupled from Prisma exports). */
export type TraceLinkLike = {
  fromKind: string;
  fromId: string;
  toKind: string;
  toId: string;
  relation: string;
};

/** Resolve stable local IDs for trace link endpoints (requirements + features in project). */
export function buildEntityLabelMaps(args: {
  requirementRows: { id: string; localId: string }[];
  featureRows: { id: string; localId: string }[];
}): {
  requirement: Map<string, string>;
  feature: Map<string, string>;
} {
  return {
    requirement: new Map(args.requirementRows.map((r) => [r.id, r.localId])),
    feature: new Map(args.featureRows.map((f) => [f.id, f.localId])),
  };
}

export function labelTraceEndpoint(
  kind: string,
  id: string,
  maps: ReturnType<typeof buildEntityLabelMaps>,
): string {
  if (kind === "requirement") return maps.requirement.get(id) ?? id.slice(0, 10);
  if (kind === "feature") return maps.feature.get(id) ?? id.slice(0, 10);
  return `${kind}:${id.slice(0, 8)}`;
}

/** Ordered trace fragments for one requirement (outgoing first, then incoming). */
export function summarizeRequirementTraceParts(args: {
  requirementId: string;
  links: TraceLinkLike[];
  maps: ReturnType<typeof buildEntityLabelMaps>;
  maxParts?: number;
}): string[] {
  const maxParts = args.maxParts ?? 8;
  const parts: string[] = [];

  for (const l of args.links) {
    if (parts.length >= maxParts) break;
    if (l.fromKind === "requirement" && l.fromId === args.requirementId) {
      const to = labelTraceEndpoint(l.toKind, l.toId, args.maps);
      parts.push(`${l.relation}→${to}`);
    }
  }

  for (const l of args.links) {
    if (parts.length >= maxParts) break;
    if (l.toKind === "requirement" && l.toId === args.requirementId) {
      const from = labelTraceEndpoint(l.fromKind, l.fromId, args.maps);
      parts.push(`←${l.relation} ${from}`);
    }
  }

  return parts;
}

export function summarizeFeatureTraceParts(args: {
  featureId: string;
  links: TraceLinkLike[];
  maps: ReturnType<typeof buildEntityLabelMaps>;
  maxParts?: number;
}): string[] {
  const maxParts = args.maxParts ?? 8;
  const parts: string[] = [];
  for (const l of args.links) {
    if (parts.length >= maxParts) break;
    if (l.fromKind === "feature" && l.fromId === args.featureId) {
      const to = labelTraceEndpoint(l.toKind, l.toId, args.maps);
      parts.push(`${l.relation}→${to}`);
    }
  }
  return parts;
}
