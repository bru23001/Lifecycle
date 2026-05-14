-- Traceability report schedules (stored intent; delivery worker is out of scope for this migration).

CREATE TABLE "TraceabilityReportSchedule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "reportName" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "recipientsJson" TEXT NOT NULL DEFAULT '[]',
    "format" TEXT NOT NULL DEFAULT 'html_print',
    "includeGapsOnly" INTEGER NOT NULL DEFAULT 0,
    "includeFullMatrix" INTEGER NOT NULL DEFAULT 1,
    "active" INTEGER NOT NULL DEFAULT 1,
    "createdByUserId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TraceabilityReportSchedule_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "TraceabilityReportSchedule_projectId_idx" ON "TraceabilityReportSchedule"("projectId");
