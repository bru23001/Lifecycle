-- CreateTable
CREATE TABLE "Requirement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "localId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL DEFAULT '',
    "verificationMethod" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Draft',
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Requirement_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Feature" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "localId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "priority" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Draft',
    "scopeStatus" TEXT NOT NULL DEFAULT 'InScope',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Feature_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TraceLink" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "fromKind" TEXT NOT NULL,
    "fromId" TEXT NOT NULL,
    "toKind" TEXT NOT NULL,
    "toId" TEXT NOT NULL,
    "relation" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TraceLink_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Requirement_projectId_kind_idx" ON "Requirement"("projectId", "kind");

-- CreateIndex
CREATE UNIQUE INDEX "Requirement_projectId_localId_key" ON "Requirement"("projectId", "localId");

-- CreateIndex
CREATE UNIQUE INDEX "Feature_projectId_localId_key" ON "Feature"("projectId", "localId");

-- CreateIndex
CREATE INDEX "TraceLink_projectId_fromKind_fromId_idx" ON "TraceLink"("projectId", "fromKind", "fromId");

-- CreateIndex
CREATE INDEX "TraceLink_projectId_toKind_toId_idx" ON "TraceLink"("projectId", "toKind", "toId");

-- AlterTable
ALTER TABLE "Project" ADD COLUMN "applicabilityJson" TEXT NOT NULL DEFAULT '{}';

-- AlterTable
ALTER TABLE "Project" ADD COLUMN "complexityLevel" TEXT;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN "namingConformanceNote" TEXT;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN "initialTestSetupNote" TEXT;
