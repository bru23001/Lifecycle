import { describe, expect, it } from "vitest";

import { extractMarkdownOutline } from "@/lib/markdown-outline";

describe("extractMarkdownOutline", () => {
  it("returns empty array when no headings", () => {
    expect(extractMarkdownOutline("Hello\n\nworld.")).toEqual([]);
  });

  it("extracts ATX headings with stable ids and dedupes slug collisions", () => {
    const md = ["# Alpha", "## Beta", "### Beta", "## Gamma"].join("\n");
    const o = extractMarkdownOutline(md);
    expect(o.map((x) => x.text)).toEqual(["Alpha", "Beta", "Beta", "Gamma"]);
    expect(o.map((x) => x.level)).toEqual([1, 2, 3, 2]);
    expect(o.map((x) => x.id)).toEqual(["alpha", "beta", "beta-2", "gamma"]);
  });
});
