import { describe, expect, it } from "vitest";

import {
  csvCell,
  formatContentMeta,
  parseAuditExportSearchParams,
  serializeAuditCsv,
  serializeAuditJson,
  type AuditExportRow,
} from "@/lib/audit-trail-export";

const sampleRow: AuditExportRow = {
  id: "aud_1",
  createdAt: "2026-05-13T14:00:00.000Z",
  action: "gate_review.recorded",
  subjectKind: "gate",
  subjectId: "G3",
  actor: "Alice",
  metadata: { decision: "approved", gateId: "G3" },
};

describe("csvCell", () => {
  it("returns empty string for null/undefined", () => {
    expect(csvCell(null)).toBe("");
    expect(csvCell(undefined)).toBe("");
  });

  it("returns the value unchanged when no special chars", () => {
    expect(csvCell("hello")).toBe("hello");
  });

  it('quotes and escapes embedded quotes ("Alice "the AppSec lead"")', () => {
    expect(csvCell('Alice "the AppSec lead"')).toBe('"Alice ""the AppSec lead"""');
  });

  it("quotes values containing commas or newlines", () => {
    expect(csvCell("a,b")).toBe('"a,b"');
    expect(csvCell("line1\nline2")).toBe('"line1\nline2"');
  });

  it("JSON-stringifies non-strings", () => {
    expect(csvCell({ a: 1 })).toBe('"{""a"":1}"');
  });
});

describe("serializeAuditCsv", () => {
  it("includes a header row and one data row", () => {
    const csv = serializeAuditCsv([sampleRow]);
    const lines = csv.split("\r\n");
    expect(lines[0]).toBe("id,createdAt,action,subjectKind,subjectId,actor,metadata");
    expect(lines[1]).toContain("aud_1");
    expect(lines[1]).toContain("gate_review.recorded");
    expect(lines[1]).toContain('"{""decision"":""approved"",""gateId"":""G3""}"');
  });

  it("yields only the header for an empty list", () => {
    expect(serializeAuditCsv([])).toBe(
      "id,createdAt,action,subjectKind,subjectId,actor,metadata",
    );
  });
});

describe("serializeAuditJson", () => {
  it("returns a pretty-printed array", () => {
    const json = serializeAuditJson([sampleRow]);
    const parsed = JSON.parse(json);
    expect(parsed).toEqual([sampleRow]);
    expect(json).toContain("\n");
  });
});

describe("parseAuditExportSearchParams", () => {
  it("defaults to JSON when format is missing", () => {
    const result = parseAuditExportSearchParams(new URLSearchParams());
    expect(result.format).toBe("json");
    expect(result.error).toBeNull();
  });

  it("rejects unknown formats", () => {
    const result = parseAuditExportSearchParams(new URLSearchParams("format=xlsx"));
    expect(result.error).toContain("Unknown export format");
  });

  it("rejects invalid `from`/`to` dates", () => {
    expect(parseAuditExportSearchParams(new URLSearchParams("from=not-a-date")).error).toMatch(/from/);
    expect(parseAuditExportSearchParams(new URLSearchParams("to=also-bad")).error).toMatch(/to/);
  });

  it("parses comma-separated actions and actorIds", () => {
    const sp = new URLSearchParams("actions=a.x,b.y&actorIds=u1,u2&format=csv");
    const result = parseAuditExportSearchParams(sp);
    expect(result.filter.actions).toEqual(["a.x", "b.y"]);
    expect(result.filter.actorIds).toEqual(["u1", "u2"]);
    expect(result.format).toBe("csv");
  });

  it("treats empty action/actor lists as null", () => {
    const sp = new URLSearchParams("actions=&actorIds=");
    const result = parseAuditExportSearchParams(sp);
    expect(result.filter.actions).toBeNull();
    expect(result.filter.actorIds).toBeNull();
  });
});

describe("formatContentMeta", () => {
  it.each<[
    "csv" | "json" | "pdf",
    string,
    string,
  ]>([
    ["csv", "text/csv; charset=utf-8", "csv"],
    ["json", "application/json; charset=utf-8", "json"],
    ["pdf", "application/json; charset=utf-8", "pdf"],
  ])("for %s yields the right content-type + extension", (format, ct, ext) => {
    const meta = formatContentMeta(format);
    expect(meta.contentType).toBe(ct);
    expect(meta.extension).toBe(ext);
  });
});
