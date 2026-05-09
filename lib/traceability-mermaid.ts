/**
 * Mermaid flowchart for artifact → gate traceability (G1–G8 subset drawn; G9–G10 implied).
 * Rendered client-side via `MermaidBlock`.
 */

import { clampWorkspacePhase } from "@/lib/workspacePhases";

function sanitizeComment(s: string): string {
  return s.replace(/[\r\n%]/g, " ").slice(0, 120);
}

function hasTpl(present: ReadonlySet<string>, id: string): boolean {
  return present.has(id);
}

/**
 * Linear backbone + gate styling; template nodes styled when an artifact exists.
 */
export function buildTraceabilityMermaid(args: {
  projectSlug: string;
  currentPhase: number;
  artifactTemplatesPresent: ReadonlySet<string>;
}): string {
  const slug = sanitizeComment(args.projectSlug);
  const p = clampWorkspacePhase(args.currentPhase);
  const h = hasTpl.bind(null, args.artifactTemplatesPresent);

  const lines: string[] = [];
  lines.push("%% Traceability — " + slug);
  lines.push("flowchart TB");

  /* Phases 1–4 + G3 (existing MVP chain) */
  lines.push(`  P1["Phase 1 · Idea"]`);
  lines.push(`  A0["A-0 Idea capture"]`);
  lines.push(`  G1{{"G1 · Idea accepted"}}`);
  lines.push(`  P2["Phase 2 · Problem"]`);
  lines.push(`  A01["A-0.1 Problem definition"]`);
  lines.push(`  G2{{"G2 · Problem validated"}}`);
  lines.push(`  P34["Phases 3–4 · Selection & feasibility"]`);
  lines.push(`  A31["A-3.1 Selection scorecard"]`);
  lines.push(`  A4["A-4 Business field report"]`);
  lines.push(`  A32["A-3.2 Feasibility"]`);
  lines.push(`  A33["A-3.3 Business case"]`);
  lines.push(`  G3{{"G3 · Project selected"}}`);

  lines.push(`  P5["Phase 5 · Requirements"]`);
  lines.push(`  A7["A-7 Stakeholder profile"]`);
  lines.push(`  A1["A-1 CRS"]`);
  lines.push(`  A2["A-2 SRS"]`);
  lines.push(`  A10["A-10 NFR register"]`);
  lines.push(`  A9["A-9 Features"]`);
  lines.push(`  A8["A-8 Req package"]`);
  lines.push(`  A6["A-6 Scope"]`);
  lines.push(`  G4{{"G4 · Requirements approved"}}`);

  lines.push(`  P6["Phase 6 · Planning"]`);
  lines.push(`  A15a["A-15 Dev plan (draft)"]`);

  lines.push(`  P7["Phase 7 · Architecture"]`);
  lines.push(`  ARD["ARD-001 Architecture"]`);
  lines.push(`  A11["A-11 ERD"]`);
  lines.push(`  A12["A-12 API contract"]`);
  lines.push(`  UXD["UXD-001 UI/UX"]`);
  lines.push(`  G5{{"G5 · Architecture approved"}}`);

  lines.push(`  P8["Phase 8 · Development prep"]`);
  lines.push(`  A13["A-13 Module & files"]`);
  lines.push(`  A14["A-14 Env & delivery"]`);
  lines.push(`  A15b["A-15 Dev plan (final)"]`);
  lines.push(`  G6{{"G6 · Development ready"}}`);
  lines.push(`  P9["Phase 9 · Implementation"]`);

  lines.push("  P1 --> A0 --> G1 --> P2 --> A01 --> G2 --> P34 --> A31");
  lines.push("  A31 --> A4 --> A32 --> A33 --> G3 --> P5");
  lines.push("  P5 --> A7");
  lines.push("  P5 --> A1");
  lines.push("  P5 --> A2");
  lines.push("  P5 --> A10");
  lines.push("  P5 --> A9");
  lines.push("  P5 --> A8");
  lines.push("  P5 --> A6");
  lines.push("  A7 --> G4");
  lines.push("  A1 --> G4");
  lines.push("  A2 --> G4");
  lines.push("  A10 --> G4");
  lines.push("  A9 --> G4");
  lines.push("  A8 --> G4");
  lines.push("  A6 --> G4");
  lines.push("  G4 --> P6 --> A15a --> P7");
  lines.push("  P7 --> ARD --> G5");
  lines.push("  P7 --> A11 --> G5");
  lines.push("  P7 --> A12 --> G5");
  lines.push("  P7 --> UXD --> G5");
  lines.push("  G5 --> P8");
  lines.push("  P8 --> A13");
  lines.push("  P8 --> A14");
  lines.push("  P8 --> A15b");
  lines.push("  A13 --> G6");
  lines.push("  A14 --> G6");
  lines.push("  A15b --> G6");
  lines.push("  G6 --> P9");

  const phaseNode =
    p <= 1
      ? "P1"
      : p === 2
        ? "P2"
        : p === 3 || p === 4
          ? "P34"
          : p === 5
            ? "P34"
            : p === 6
              ? "P5"
              : p === 7
                ? "P6"
                : p === 8
                  ? "P7"
                  : p === 9
                    ? "P8"
                    : "P9";

  lines.push(`  style ${phaseNode} fill:#fef3c7,stroke:#b45309,stroke-width:2px`);

  const earlyTpls: { id: string; tpl: string }[] = [
    { id: "A0", tpl: "A-0" },
    { id: "A01", tpl: "A-0.1" },
    { id: "A31", tpl: "A-3.1" },
    { id: "A4", tpl: "A-4" },
    { id: "A32", tpl: "A-3.2" },
    { id: "A33", tpl: "A-3.3" },
  ];
  for (const { id, tpl } of earlyTpls) {
    lines.push(
      `  style ${id} ${h(tpl) ? "fill:#ecfdf5,stroke:#15803d" : "fill:#f4f4f5,stroke:#71717a,stroke-dasharray: 4 3"}`,
    );
  }

  const lateTpls: { id: string; tpl: string }[] = [
    { id: "A7", tpl: "A-7" },
    { id: "A1", tpl: "A-1" },
    { id: "A2", tpl: "A-2" },
    { id: "A10", tpl: "A-10" },
    { id: "A9", tpl: "A-9" },
    { id: "A8", tpl: "A-8" },
    { id: "A6", tpl: "A-6" },
    { id: "A15a", tpl: "A-15" },
    { id: "ARD", tpl: "ARD-001" },
    { id: "A11", tpl: "A-11" },
    { id: "A12", tpl: "A-12" },
    { id: "UXD", tpl: "UXD-001" },
    { id: "A13", tpl: "A-13" },
    { id: "A14", tpl: "A-14" },
    { id: "A15b", tpl: "A-15" },
  ];
  for (const { id, tpl } of lateTpls) {
    lines.push(
      `  style ${id} ${h(tpl) ? "fill:#ecfdf5,stroke:#15803d" : "fill:#f4f4f5,stroke:#71717a,stroke-dasharray: 4 3"}`,
    );
  }

  const gateDone = (g: string, minPhase: number) => {
    if (p >= minPhase) {
      lines.push(`  style ${g} fill:#dcfce7,stroke:#166534`);
    }
  };
  gateDone("G1", 2);
  gateDone("G2", 3);
  gateDone("G3", 6);
  gateDone("G4", 7);
  gateDone("G5", 9);
  gateDone("G6", 10);
  gateDone("G7", 13);
  gateDone("G8", 14);

  return lines.join("\n");
}

export function artifactTemplatesFromRows(
  rows: { templateId: string }[],
): Set<string> {
  return new Set(rows.map((r) => r.templateId));
}
