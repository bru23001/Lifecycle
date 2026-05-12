export type ParsedMarkdownSection =
  | { type: "prose"; title: string; body: string }
  | { type: "table"; title: string; headers: string[]; rows: string[][] }
  | { type: "list"; title: string; items: string[] };

function splitTableRow(line: string): string[] {
  const parts = line.trim().split("|");
  if (parts.length < 2) return [];
  return parts.slice(1, -1).map((c) => c.trim());
}

function isSeparatorTableLine(line: string): boolean {
  const cells = splitTableRow(line);
  if (cells.length < 2) return false;
  return cells.every((c) => /^[-:]+$/.test(c.replace(/\s/g, "")) || c.replace(/\s/g, "") === "");
}

function tryParseTable(content: string): { headers: string[]; rows: string[][] } | null {
  const lines = content.split("\n").map((l) => l.trim());
  const tableLines = lines.filter((l) => l.startsWith("|"));
  if (tableLines.length < 3) return null;

  const sepIdx = tableLines.findIndex(isSeparatorTableLine);
  if (sepIdx < 1) return null;

  const headers = splitTableRow(tableLines[0]);
  if (!headers.length) return null;

  const rows = tableLines.slice(sepIdx + 1).map(splitTableRow);
  if (rows.some((r) => r.length !== headers.length)) return null;

  return { headers, rows };
}

function tryParseList(content: string): string[] {
  const rawLines = content.split("\n").map((l) => l.trim()).filter(Boolean);
  const listLines = rawLines.filter((l) => /^-\s+/.test(l));
  if (listLines.length === 0 || listLines.length !== rawLines.length) return [];
  return listLines.map((l) => l.replace(/^-\s+/, "").trim());
}

/**
 * Parses artifact markdown from the first `##` heading onward into sections
 * (tables, bullet lists, or prose paragraphs).
 */
export function parseArtifactMarkdownBody(markdown: string): ParsedMarkdownSection[] {
  const idx = markdown.search(/\n## /);
  const body = idx >= 0 ? markdown.slice(idx + 1) : markdown;
  const blocks = body
    .split(/(?=^## )/m)
    .map((b) => b.trim())
    .filter(Boolean);

  return blocks.map((block) => {
    const lines = block.split("\n");
    const title = (lines[0] ?? "").replace(/^##\s*/, "").trim();
    const content = lines.slice(1).join("\n").trim();

    const table = tryParseTable(content);
    if (table) return { type: "table", title, ...table };

    const items = tryParseList(content);
    if (items.length > 0) return { type: "list", title, items };

    return { type: "prose", title, body: content };
  });
}
