-- CreateTable
CREATE TABLE "EvidenceComment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "evidenceId" TEXT NOT NULL,
    "authorId" TEXT,
    "authorName" TEXT NOT NULL DEFAULT 'User',
    "body" TEXT NOT NULL DEFAULT '',
    "visibility" TEXT NOT NULL DEFAULT 'project',
    "mentionsJson" TEXT NOT NULL DEFAULT '[]',
    "attachmentRef" TEXT,
    "resolved" INTEGER NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EvidenceComment_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "EvidenceItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EvidenceComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "EvidenceComment_evidenceId_createdAt_idx" ON "EvidenceComment"("evidenceId", "createdAt");
