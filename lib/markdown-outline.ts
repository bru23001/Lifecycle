export type MarkdownOutlineItem = {
  level: number;
  text: string;
  id: string;
};

function slugifyHeading(text: string): string {
  const s = text
    .toLowerCase()
    .replace(/['"`]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return s.length > 0 ? s : "section";
}

/** ATX headings only (`#` … `######`), one per line — matches template `toMarkdown` output. */
export function extractMarkdownOutline(md: string): MarkdownOutlineItem[] {
  const lines = md.split(/\r?\n/);
  const used = new Set<string>();
  const items: MarkdownOutlineItem[] = [];
  for (const raw of lines) {
    const line = raw.trim();
    const m = /^(#{1,6})\s+(.+)$/.exec(line);
    if (!m) continue;
    const level = m[1]!.length;
    const text = m[2]!.trim();
    const base = slugifyHeading(text);
    let id = base;
    let n = 2;
    while (used.has(id)) {
      id = `${base}-${n}`;
      n += 1;
    }
    used.add(id);
    items.push({ level, text, id });
  }
  return items;
}
