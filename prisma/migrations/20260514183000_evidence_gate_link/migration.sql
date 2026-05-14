-- CreateTable
CREATE TABLE "EvidenceGateLink" (
    "evidenceId" TEXT NOT NULL,
    "gateCode" TEXT NOT NULL,

    CONSTRAINT "EvidenceGateLink_pkey" PRIMARY KEY ("evidenceId","gateCode"),
    CONSTRAINT "EvidenceGateLink_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "EvidenceItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "EvidenceGateLink_gateCode_idx" ON "EvidenceGateLink"("gateCode");

-- Backfill from existing EvidenceItem.gateCode (workspace-linked gates)
INSERT INTO "EvidenceGateLink" ("evidenceId", "gateCode")
SELECT "id", "gateCode" FROM "EvidenceItem" WHERE "gateCode" IS NOT NULL AND TRIM("gateCode") != '';
