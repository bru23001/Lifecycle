-- AlterTable TraceLink: metadata, soft delete, editor tracking (SQLite-safe defaults)
ALTER TABLE "TraceLink" ADD COLUMN "rationale" TEXT NOT NULL DEFAULT '';
ALTER TABLE "TraceLink" ADD COLUMN "confidence" TEXT NOT NULL DEFAULT 'medium';
ALTER TABLE "TraceLink" ADD COLUMN "evidenceReference" TEXT NOT NULL DEFAULT '';
ALTER TABLE "TraceLink" ADD COLUMN "verificationNote" TEXT NOT NULL DEFAULT '';
ALTER TABLE "TraceLink" ADD COLUMN "lastVerifiedAt" DATETIME;
ALTER TABLE "TraceLink" ADD COLUMN "deletedAt" DATETIME;
ALTER TABLE "TraceLink" ADD COLUMN "createdByUserId" TEXT;
ALTER TABLE "TraceLink" ADD COLUMN "updatedAt" DATETIME NOT NULL DEFAULT '2020-01-01 00:00:00';

UPDATE "TraceLink" SET "updatedAt" = "createdAt";

CREATE INDEX "TraceLink_projectId_deletedAt_idx" ON "TraceLink"("projectId", "deletedAt");
