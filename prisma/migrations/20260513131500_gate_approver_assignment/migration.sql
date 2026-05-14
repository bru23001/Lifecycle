-- CreateTable
CREATE TABLE "GateApproverAssignment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "gateId" TEXT NOT NULL,
    "userId" TEXT,
    "approverName" TEXT NOT NULL,
    "approverRole" TEXT NOT NULL,
    "dueAt" DATETIME,
    "assignedById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GateApproverAssignment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "GateApproverAssignment_projectId_gateId_idx" ON "GateApproverAssignment"("projectId", "gateId");
