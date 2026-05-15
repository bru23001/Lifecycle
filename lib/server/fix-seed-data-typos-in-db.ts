import type { Prisma, PrismaClient } from "@prisma/client";

import { applySeedDataTypoFixes, applySeedDataTypoFixesToJson } from "@/lib/seed-data-typo-fixes";
import { RECENT_ACTIVITY_KEY } from "@/lib/server/settings";

function fixOptional(s: string | null | undefined): string | null {
  if (s == null) return null;
  return applySeedDataTypoFixes(s);
}

function changed(a: string, b: string): boolean {
  return a !== b;
}

/**
 * Idempotent: rewrites known typo strings in persisted rows (SQLite-safe).
 * Call after seed inserts so demo / legacy DBs self-heal on `prisma migrate reset` / `npm run seed`.
 */
export async function fixSeedDataTyposInDatabase(client: PrismaClient): Promise<void> {
  for (const p of await client.project.findMany()) {
    const name = applySeedDataTypoFixes(p.name);
    const namingConformanceNote = fixOptional(p.namingConformanceNote);
    const initialTestSetupNote = fixOptional(p.initialTestSetupNote);
    if (
      changed(p.name, name) ||
      p.namingConformanceNote !== namingConformanceNote ||
      p.initialTestSetupNote !== initialTestSetupNote
    ) {
      await client.project.update({
        where: { id: p.id },
        data: { name, namingConformanceNote, initialTestSetupNote },
      });
    }
  }

  for (const r of await client.requirement.findMany()) {
    const title = applySeedDataTypoFixes(r.title);
    const body = applySeedDataTypoFixes(r.body);
    const verificationMethod = fixOptional(r.verificationMethod);
    if (
      changed(r.title, title) ||
      changed(r.body, body) ||
      r.verificationMethod !== verificationMethod
    ) {
      await client.requirement.update({
        where: { id: r.id },
        data: { title, body, verificationMethod },
      });
    }
  }

  for (const f of await client.feature.findMany()) {
    const title = applySeedDataTypoFixes(f.title);
    const description = applySeedDataTypoFixes(f.description);
    if (changed(f.title, title) || changed(f.description, description)) {
      await client.feature.update({
        where: { id: f.id },
        data: { title, description },
      });
    }
  }

  for (const e of await client.evidenceItem.findMany()) {
    const name = applySeedDataTypoFixes(e.name);
    const description = applySeedDataTypoFixes(e.description);
    const notes = fixOptional(e.notes);
    const source = fixOptional(e.source);
    const retentionPolicyLabel = fixOptional(e.retentionPolicyLabel);
    const uploadedByName = applySeedDataTypoFixes(e.uploadedByName);
    const previewHref = fixOptional(e.previewHref);
    const downloadHref = fixOptional(e.downloadHref);
    const fileTypeLabel = applySeedDataTypoFixes(e.fileTypeLabel);
    if (
      changed(e.name, name) ||
      changed(e.description, description) ||
      e.notes !== notes ||
      e.source !== source ||
      e.retentionPolicyLabel !== retentionPolicyLabel ||
      e.uploadedByName !== uploadedByName ||
      e.previewHref !== previewHref ||
      e.downloadHref !== downloadHref ||
      changed(e.fileTypeLabel, fileTypeLabel)
    ) {
      await client.evidenceItem.update({
        where: { id: e.id },
        data: {
          name,
          description,
          notes,
          source,
          retentionPolicyLabel,
          uploadedByName,
          previewHref,
          downloadHref,
          fileTypeLabel,
        },
      });
    }
  }

  for (const t of await client.traceLink.findMany()) {
    const rationale = applySeedDataTypoFixes(t.rationale);
    const evidenceReference = applySeedDataTypoFixes(t.evidenceReference);
    const verificationNote = applySeedDataTypoFixes(t.verificationNote);
    if (
      changed(t.rationale, rationale) ||
      changed(t.evidenceReference, evidenceReference) ||
      changed(t.verificationNote, verificationNote)
    ) {
      await client.traceLink.update({
        where: { id: t.id },
        data: { rationale, evidenceReference, verificationNote },
      });
    }
  }

  for (const g of await client.gateDecision.findMany()) {
    const decision = applySeedDataTypoFixes(g.decision);
    const authorityName = applySeedDataTypoFixes(g.authorityName);
    const authorityRole = applySeedDataTypoFixes(g.authorityRole);
    const nextAction = applySeedDataTypoFixes(g.nextAction);
    if (
      changed(g.decision, decision) ||
      changed(g.authorityName, authorityName) ||
      changed(g.authorityRole, authorityRole) ||
      changed(g.nextAction, nextAction)
    ) {
      await client.gateDecision.update({
        where: { id: g.id },
        data: { decision, authorityName, authorityRole, nextAction },
      });
    }
  }

  for (const c of await client.approvalComment.findMany()) {
    const body = applySeedDataTypoFixes(c.body);
    if (changed(c.body, body)) {
      await client.approvalComment.update({ where: { id: c.id }, data: { body } });
    }
  }

  for (const w of await client.wizardCollaborationComment.findMany()) {
    const body = applySeedDataTypoFixes(w.body);
    if (changed(w.body, body)) {
      await client.wizardCollaborationComment.update({ where: { id: w.id }, data: { body } });
    }
  }

  for (const a of await client.artifact.findMany({ select: { id: true, dataJson: true } })) {
    const fixed = applySeedDataTypoFixesToJson(a.dataJson);
    if (JSON.stringify(fixed) !== JSON.stringify(a.dataJson)) {
      await client.artifact.update({
        where: { id: a.id },
        data: { dataJson: fixed as Prisma.InputJsonValue },
      });
    }
  }

  const activityRow = await client.appSetting.findUnique({ where: { key: RECENT_ACTIVITY_KEY } });
  if (activityRow?.value != null && Array.isArray(activityRow.value)) {
    const arr = activityRow.value as unknown[];
    let touched = false;
    const next = arr.map((row) => {
      if (!row || typeof row !== "object") return row;
      const r = row as Record<string, unknown>;
      if (typeof r.title !== "string") return row;
      const title = applySeedDataTypoFixes(r.title);
      if (title === r.title) return row;
      touched = true;
      return { ...r, title };
    });
    if (touched) {
      await client.appSetting.update({
        where: { key: RECENT_ACTIVITY_KEY },
        data: { value: next as Prisma.InputJsonValue },
      });
    }
  }
}
