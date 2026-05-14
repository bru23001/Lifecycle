-- CreateTable
CREATE TABLE "EvidencePhaseLink" (
    "evidenceId" TEXT NOT NULL,
    "phaseNumber" INTEGER NOT NULL,

    CONSTRAINT "EvidencePhaseLink_pkey" PRIMARY KEY ("evidenceId","phaseNumber"),
    CONSTRAINT "EvidencePhaseLink_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "EvidenceItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "EvidencePhaseLink_phaseNumber_idx" ON "EvidencePhaseLink"("phaseNumber");

-- Backfill from existing EvidenceItem.phaseNumber
INSERT INTO "EvidencePhaseLink" ("evidenceId", "phaseNumber")
SELECT "id", "phaseNumber" FROM "EvidenceItem" WHERE "phaseNumber" IS NOT NULL AND "phaseNumber" >= 1 AND "phaseNumber" <= 14;
