-- CreateTable
CREATE TABLE "EvidenceItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "evidenceCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "evidenceType" TEXT NOT NULL,
    "phaseNumber" INTEGER,
    "gateCode" TEXT,
    "classification" TEXT NOT NULL DEFAULT 'internal',
    "status" TEXT NOT NULL DEFAULT 'linked',
    "completenessPercent" INTEGER NOT NULL DEFAULT 100,
    "fileTypeLabel" TEXT NOT NULL DEFAULT 'Document',
    "fileSizeBytes" INTEGER,
    "source" TEXT,
    "retentionPolicyLabel" TEXT,
    "checksum" TEXT,
    "tagsJson" TEXT NOT NULL DEFAULT '[]',
    "notes" TEXT,
    "uploadedByName" TEXT NOT NULL DEFAULT 'Local User',
    "previewHref" TEXT,
    "downloadHref" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EvidenceItem_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EvidenceArtifactLink" (
    "evidenceId" TEXT NOT NULL,
    "artifactId" TEXT NOT NULL,

    PRIMARY KEY ("evidenceId", "artifactId"),
    CONSTRAINT "EvidenceArtifactLink_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "EvidenceItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EvidenceArtifactLink_artifactId_fkey" FOREIGN KEY ("artifactId") REFERENCES "Artifact" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ApplicabilityRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "applies" BOOLEAN NOT NULL DEFAULT true,
    "rationale" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ApplicabilityRecord_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "EvidenceItem_projectId_evidenceCode_key" ON "EvidenceItem"("projectId", "evidenceCode");

-- CreateIndex
CREATE INDEX "EvidenceItem_projectId_gateCode_idx" ON "EvidenceItem"("projectId", "gateCode");

-- CreateIndex
CREATE INDEX "EvidenceArtifactLink_artifactId_idx" ON "EvidenceArtifactLink"("artifactId");

-- CreateIndex
CREATE UNIQUE INDEX "ApplicabilityRecord_projectId_key_key" ON "ApplicabilityRecord"("projectId", "key");

-- CreateIndex
CREATE INDEX "ApplicabilityRecord_projectId_idx" ON "ApplicabilityRecord"("projectId");
