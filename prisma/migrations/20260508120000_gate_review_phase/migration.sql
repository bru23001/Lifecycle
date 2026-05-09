-- AlterTable
ALTER TABLE "Project" ADD COLUMN "currentPhase" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "GateDecision" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "gateId" TEXT NOT NULL,
    "decision" TEXT NOT NULL,
    "authorityName" TEXT NOT NULL,
    "authorityRole" TEXT NOT NULL,
    "nextAction" TEXT NOT NULL,
    "evidencePassSnapshot" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GateDecision_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "GateDecision_projectId_gateId_idx" ON "GateDecision"("projectId", "gateId");
