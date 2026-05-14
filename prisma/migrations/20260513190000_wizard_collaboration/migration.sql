-- CreateTable
CREATE TABLE "WizardCollaborationComment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "artifactId" TEXT,
    "sectionId" TEXT,
    "fieldName" TEXT,
    "authorId" TEXT,
    "body" TEXT NOT NULL,
    "resolved" INTEGER NOT NULL DEFAULT 0,
    "visibility" TEXT NOT NULL DEFAULT 'internal',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WizardCollaborationComment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WizardCollaborationComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "WizardCollaborationComment_projectId_templateId_createdAt_idx" ON "WizardCollaborationComment"("projectId", "templateId", "createdAt");

-- CreateTable
CREATE TABLE "ArtifactReviewRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "artifactId" TEXT,
    "assigneeUserId" TEXT,
    "assigneeName" TEXT NOT NULL,
    "assigneeRole" TEXT NOT NULL,
    "dueAt" DATETIME,
    "reviewScope" TEXT NOT NULL DEFAULT 'full',
    "instructions" TEXT,
    "assignedById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ArtifactReviewRequest_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ArtifactReviewRequest_assigneeUserId_fkey" FOREIGN KEY ("assigneeUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ArtifactReviewRequest_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "ArtifactReviewRequest_projectId_templateId_idx" ON "ArtifactReviewRequest"("projectId", "templateId");
