/**
 * Pure mapping + validation helpers for the Add Evidence Modal.
 *
 * The server action `createEvidenceItem` (`app/actions/evidence.ts`) remains
 * the trust boundary (CYBERCUBE STD-SEC-002 §"Input Validation"); these
 * helpers exist purely to keep the modal's client logic small, testable, and
 * free of regex/coercion drift between client + server.
 */

export type EvidenceFormType =
  | "pdf"
  | "spreadsheet"
  | "document"
  | "image"
  | "link"
  | "json"
  | "markdown"
  | "report";

export const EVIDENCE_FORM_TYPES: readonly EvidenceFormType[] = [
  "pdf",
  "spreadsheet",
  "document",
  "image",
  "link",
  "json",
  "markdown",
  "report",
];

export type EvidenceClassification = "public" | "internal" | "confidential" | "restricted";

export const EVIDENCE_CLASSIFICATIONS: readonly EvidenceClassification[] = [
  "public",
  "internal",
  "confidential",
  "restricted",
];

/** Display label for a classification level. Matches STD-DAT-001 §"Classification Levels". */
export function classificationLabel(level: EvidenceClassification): string {
  switch (level) {
    case "public":
      return "Public (PUB)";
    case "internal":
      return "Internal (INT)";
    case "confidential":
      return "Confidential (CON)";
    case "restricted":
      return "Restricted (RST)";
    default: {
      const _exhaustive: never = level;
      void _exhaustive;
      return String(level);
    }
  }
}

export type AddEvidenceFormState = {
  name: string;
  description: string;
  evidenceType: EvidenceFormType;
  classification: EvidenceClassification;
  phaseNumber: string;
  gateCode: string;
  linkedArtifactId: string;
  sourceUrl: string;
  declaredFileName: string;
  notes: string;
};

export function emptyAddEvidenceFormState(): AddEvidenceFormState {
  return {
    name: "",
    description: "",
    evidenceType: "document",
    classification: "internal",
    phaseNumber: "",
    gateCode: "",
    linkedArtifactId: "",
    sourceUrl: "",
    declaredFileName: "",
    notes: "",
  };
}

/**
 * Normalized `createEvidenceItem` input. Optional fields are omitted when
 * blank so the server-side `optional()` paths don't reject placeholder
 * values like "". `gateCode` is always present (`string | null`) because
 * the server schema's `.optional().nullable().transform(...)` produces a
 * required `string | null` field in the inferred input type.
 */
export type AddEvidenceInput = {
  projectId: string;
  name: string;
  description?: string;
  evidenceType: EvidenceFormType;
  phaseNumber?: number;
  gateCode: string | null;
  classification?: EvidenceClassification;
  notes?: string;
  sourceUrl?: string;
  linkedArtifactId?: string;
  declaredFileName?: string;
};

export type FormValidationError =
  | { field: keyof AddEvidenceFormState | "projectId"; message: string };

/** Coerce form state into a `createEvidenceItem` input, or return the first validation error. */
export function buildAddEvidenceInput(
  state: AddEvidenceFormState,
  projectId: string,
): { ok: true; value: AddEvidenceInput } | { ok: false; error: FormValidationError } {
  if (!projectId) {
    return { ok: false, error: { field: "projectId", message: "Project is required." } };
  }

  const name = state.name.trim();
  if (name.length < 2) {
    return { ok: false, error: { field: "name", message: "Name must be at least 2 characters." } };
  }
  if (name.length > 200) {
    return { ok: false, error: { field: "name", message: "Name must be 200 characters or fewer." } };
  }

  if (!EVIDENCE_FORM_TYPES.includes(state.evidenceType)) {
    return {
      ok: false,
      error: { field: "evidenceType", message: "Choose a valid evidence type." },
    };
  }
  if (!EVIDENCE_CLASSIFICATIONS.includes(state.classification)) {
    return {
      ok: false,
      error: { field: "classification", message: "Choose a valid classification." },
    };
  }

  const phaseNumber = parsePhaseNumber(state.phaseNumber);
  if (phaseNumber === "invalid") {
    return {
      ok: false,
      error: { field: "phaseNumber", message: "Phase must be a number 1–14." },
    };
  }

  const gateCode = normalizeGateCode(state.gateCode);
  if (gateCode === "invalid") {
    return {
      ok: false,
      error: { field: "gateCode", message: "Gate code must be G1–G9 or blank." },
    };
  }

  const sourceUrl = state.sourceUrl.trim();
  if (state.evidenceType === "link") {
    if (sourceUrl.length === 0) {
      return {
        ok: false,
        error: { field: "sourceUrl", message: "Provide a URL for link-type evidence." },
      };
    }
    if (!/^https?:\/\//i.test(sourceUrl)) {
      return {
        ok: false,
        error: { field: "sourceUrl", message: "URL must start with http:// or https://." },
      };
    }
  }
  if (sourceUrl.length > 2000) {
    return {
      ok: false,
      error: { field: "sourceUrl", message: "URL must be 2000 characters or fewer." },
    };
  }

  const description = state.description.trim();
  if (description.length > 8000) {
    return {
      ok: false,
      error: { field: "description", message: "Description must be 8000 characters or fewer." },
    };
  }
  const notes = state.notes.trim();
  if (notes.length > 8000) {
    return {
      ok: false,
      error: { field: "notes", message: "Notes must be 8000 characters or fewer." },
    };
  }
  const declaredFileName = state.declaredFileName.trim();
  if (declaredFileName.length > 500) {
    return {
      ok: false,
      error: { field: "declaredFileName", message: "File name must be 500 characters or fewer." },
    };
  }
  const linkedArtifactId = state.linkedArtifactId.trim();

  const value: AddEvidenceInput = {
    projectId,
    name,
    evidenceType: state.evidenceType,
    classification: state.classification,
    gateCode: gateCode ?? null,
  };
  if (description) value.description = description;
  if (typeof phaseNumber === "number") value.phaseNumber = phaseNumber;
  if (notes) value.notes = notes;
  if (sourceUrl) value.sourceUrl = sourceUrl;
  if (declaredFileName) value.declaredFileName = declaredFileName;
  if (linkedArtifactId) value.linkedArtifactId = linkedArtifactId;

  return { ok: true, value };
}

function parsePhaseNumber(raw: string): number | undefined | "invalid" {
  const t = raw.trim();
  if (t.length === 0) return undefined;
  const n = Number.parseInt(t, 10);
  if (!Number.isFinite(n) || n < 1 || n > 14 || String(n) !== t) {
    return "invalid";
  }
  return n;
}

/**
 * Accepts `g3` / `G3` / `  G3  ` / `—` / blank. Returns:
 *   - `undefined` for empty/em-dash inputs (server treats as "no gate")
 *   - the uppercase normalized `G1`–`G9` code
 *   - `"invalid"` when the input doesn't match the gate-code shape.
 */
function normalizeGateCode(raw: string): string | undefined | "invalid" {
  const t = raw.trim();
  if (t.length === 0 || t === "—") return undefined;
  const upper = t.toUpperCase();
  if (!/^G[1-9]$/.test(upper)) return "invalid";
  return upper;
}
