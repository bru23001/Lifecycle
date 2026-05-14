/** Latest artifact id per template (by highest version). */
export function latestArtifactIdByTemplateId(
  artifacts: { id: string; templateId: string; version: number }[],
): Map<string, string> {
  const m = new Map<string, { id: string; version: number }>();
  for (const a of artifacts) {
    const cur = m.get(a.templateId);
    if (!cur || a.version > cur.version) {
      m.set(a.templateId, { id: a.id, version: a.version });
    }
  }
  return new Map([...m.entries()].map(([k, v]) => [k, v.id]));
}
