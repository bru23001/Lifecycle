/**
 * Pure helpers for the Audit Event Detail Drawer.
 *
 * CYBERCUBE 3.3/4.5 hooks live here even though `writeAuditEntry` also
 * scrubs metadata at write time — this is the read-path's defense-in-depth.
 */

const SENSITIVE_KEY_PATTERN = /^(password|secret|token|authorization|cookie|set-cookie|api[_-]?key)$/i;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** Conservative local-part charset so we don't gobble adjacent punctuation like `<`/`>`. */
const EMAIL_INLINE_PATTERN = /([\w.+-]+)@([\w.-]+\.[\w.-]+)/g;

/**
 * Drop sensitive keys and partial-mask anything that looks like an email
 * (`j***@example.com`). Operates on a shallow copy; nested objects/arrays
 * are recursively walked.
 */
export function redactSensitive(input: Record<string, unknown>): Record<string, unknown> {
  return walk(input) as Record<string, unknown>;
}

function walk(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.map(walk);
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      if (SENSITIVE_KEY_PATTERN.test(k)) continue;
      out[k] = walk(v);
    }
    return out;
  }
  if (typeof value === "string") return maskEmailsInString(value);
  return value;
}

/** `john.doe@example.com` → `j***@example.com`. */
export function maskEmail(email: string): string {
  const m = EMAIL_PATTERN.exec(email);
  if (!m) return email;
  const [local, ...rest] = email.split("@");
  const domain = rest.join("@");
  if (!local) return email;
  const head = local[0] ?? "";
  return `${head}***@${domain}`;
}

function maskEmailsInString(s: string): string {
  return s.replace(EMAIL_INLINE_PATTERN, (_, local, domain) => {
    const head = String(local)[0] ?? "";
    return `${head}***@${domain}`;
  });
}

/**
 * `gate_review.recorded` → `Gate Review · Recorded`
 */
export function humanizeAction(action: string): string {
  return action
    .split(".")
    .map((part) => part.replace(/_/g, " "))
    .join(" · ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** `slug` → `Slug`; `vault_folder` → `Vault folder`. */
export function humanizeMetadataKey(key: string): string {
  const spaced = key.replace(/[_-]/g, " ").trim();
  if (spaced.length === 0) return key;
  return spaced[0]!.toUpperCase() + spaced.slice(1);
}

export type BeforeAfterPair = { key: string; before: unknown; after: unknown };
export type MetadataRow = { key: string; value: unknown };

/**
 * Split metadata into before/after pairs vs remaining flat rows.
 *
 * Recognized conventions (drawn from existing call-sites in `app/actions/*`):
 *  - `before_<x>` / `after_<x>`
 *  - `previous_<x>` / `current_<x>`
 *  - `from_<x>` / `to_<x>`
 *  - `fields` — array of strings → surfaced as a "Changed fields" pair where
 *    `before = null`, `after = <comma-joined>`.
 *
 * Anything else is returned in `remainder` keyed by `humanizeMetadataKey`.
 */
export function deriveBeforeAfter(
  metadata: Record<string, unknown>,
): { pairs: BeforeAfterPair[]; remainder: MetadataRow[] } {
  const keys = Object.keys(metadata);
  const consumed = new Set<string>();
  const pairs: BeforeAfterPair[] = [];

  const prefixPairs: { before: string; after: string }[] = [
    { before: "before_", after: "after_" },
    { before: "previous_", after: "current_" },
    { before: "from_", after: "to_" },
  ];

  for (const key of keys) {
    for (const { before, after } of prefixPairs) {
      if (key.startsWith(before)) {
        const base = key.slice(before.length);
        const partner = `${after}${base}`;
        if (partner in metadata) {
          pairs.push({
            key: base,
            before: metadata[key],
            after: metadata[partner],
          });
          consumed.add(key);
          consumed.add(partner);
        }
      }
    }
  }

  if (Array.isArray(metadata.fields)) {
    const fields = (metadata.fields as unknown[])
      .filter((v): v is string => typeof v === "string")
      .join(", ");
    if (fields.length > 0) {
      pairs.push({ key: "changed fields", before: null, after: fields });
      consumed.add("fields");
    }
  }

  const remainder: MetadataRow[] = keys
    .filter((k) => !consumed.has(k))
    .map((k) => ({ key: k, value: metadata[k] }));

  return { pairs, remainder };
}

/**
 * cuid → `aud_… (short)` for display. We surface the full id via a copy
 * affordance in the drawer; this helper formats the inline label.
 */
export function formatAuditReference(id: string): { short: string; full: string } {
  const short = id.length > 12 ? `${id.slice(0, 8)}…${id.slice(-4)}` : id;
  return { short, full: id };
}
