import type { WizardScoreMatrix } from "@/types/template-wizard.types";

export type ScoreMatrixCriterion = WizardScoreMatrix["criteria"][number];

export function totalWeight(matrix: WizardScoreMatrix): number {
  return matrix.criteria.reduce(
    (acc, c) => acc + (Number.isFinite(c.weight) ? c.weight : 0),
    0,
  );
}

export function nextCriterionId(matrix: WizardScoreMatrix, prefix = "c-new"): string {
  const taken = new Set(matrix.criteria.map((c) => c.id));
  let n = matrix.criteria.length + 1;
  while (taken.has(`${prefix}-${n}`)) n++;
  return `${prefix}-${n}`;
}

export function addRow(
  matrix: WizardScoreMatrix,
  row: {
    id?: string;
    name: string;
    description?: string;
    weight: number;
    scores?: Record<string, number | undefined>;
    comment?: string;
    evidence?: string[];
  },
): WizardScoreMatrix {
  const id = row.id ?? nextCriterionId(matrix);
  const scores: Record<string, number | undefined> = {};
  for (const ok of matrix.optionKeys) {
    scores[ok] = row.scores?.[ok];
  }
  return {
    ...matrix,
    criteria: [
      ...matrix.criteria,
      {
        id,
        name: row.name,
        description: row.description ?? "",
        weight: Number.isFinite(row.weight) ? row.weight : 0,
      },
    ],
    scores: { ...matrix.scores, [id]: scores },
    rowComments: { ...matrix.rowComments, [id]: row.comment ?? "" },
    rowEvidence: {
      ...(matrix.rowEvidence ?? {}),
      [id]: row.evidence ?? [],
    },
  };
}

export function updateRow(
  matrix: WizardScoreMatrix,
  criterionId: string,
  patch: {
    name?: string;
    description?: string;
    weight?: number;
    scores?: Record<string, number | undefined>;
    comment?: string;
    evidence?: string[];
  },
): WizardScoreMatrix {
  const exists = matrix.criteria.some((c) => c.id === criterionId);
  if (!exists) return matrix;

  const nextCriteria = matrix.criteria.map((c) =>
    c.id === criterionId
      ? {
          ...c,
          name: patch.name ?? c.name,
          description: patch.description ?? c.description,
          weight:
            patch.weight !== undefined && Number.isFinite(patch.weight)
              ? patch.weight
              : c.weight,
        }
      : c,
  );

  const nextScores = { ...matrix.scores };
  if (patch.scores) {
    nextScores[criterionId] = {
      ...(matrix.scores[criterionId] ?? {}),
      ...patch.scores,
    };
  }

  const nextComments = { ...matrix.rowComments };
  if (patch.comment !== undefined) nextComments[criterionId] = patch.comment;

  const nextEvidence: Record<string, string[]> = { ...(matrix.rowEvidence ?? {}) };
  if (patch.evidence !== undefined) nextEvidence[criterionId] = patch.evidence;

  return {
    ...matrix,
    criteria: nextCriteria,
    scores: nextScores,
    rowComments: nextComments,
    rowEvidence: nextEvidence,
  };
}

export function removeRow(
  matrix: WizardScoreMatrix,
  criterionId: string,
): WizardScoreMatrix {
  const scores = { ...matrix.scores };
  delete scores[criterionId];
  const rowComments = { ...matrix.rowComments };
  delete rowComments[criterionId];
  const rowEvidence = { ...(matrix.rowEvidence ?? {}) };
  delete rowEvidence[criterionId];

  return {
    ...matrix,
    criteria: matrix.criteria.filter((c) => c.id !== criterionId),
    scores,
    rowComments,
    rowEvidence,
  };
}

export function getRowValidation(
  matrix: WizardScoreMatrix,
  criterionId: string,
): { tone: "ok" | "warn" | "error"; messages: string[] } {
  const messages: string[] = [];
  const criterion = matrix.criteria.find((c) => c.id === criterionId);
  if (!criterion) return { tone: "error", messages: ["Row not found."] };

  if (!criterion.name.trim()) messages.push("Name is required.");
  if (criterion.weight <= 0) messages.push("Weight must be greater than 0.");

  const rowScores = matrix.scores[criterionId] ?? {};
  const missing = matrix.optionKeys.filter(
    (ok) => typeof rowScores[ok] !== "number",
  );
  if (missing.length > 0) {
    messages.push(`${missing.length} option score${missing.length === 1 ? "" : "s"} missing.`);
  }

  const comment = (matrix.rowComments[criterionId] ?? "").trim();
  if (!comment) messages.push("Justification comment is missing.");

  if (messages.length === 0) return { tone: "ok", messages: ["Row complete."] };
  if (missing.length > 0 || criterion.weight <= 0) return { tone: "error", messages };
  return { tone: "warn", messages };
}
