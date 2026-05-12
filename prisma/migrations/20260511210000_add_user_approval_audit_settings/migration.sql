-- CreateTable
CREATE TABLE "Approval" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "approvalType" TEXT NOT NULL,
    "gateId" TEXT,
    "artifactId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "submittedById" TEXT,
    "dueAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Approval_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Approval_artifactId_fkey" FOREIGN KEY ("artifactId") REFERENCES "Artifact" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Approval_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ApprovalComment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "approvalId" TEXT NOT NULL,
    "authorId" TEXT,
    "body" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ApprovalComment_approvalId_fkey" FOREIGN KEY ("approvalId") REFERENCES "Approval" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ApprovalComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "subjectKind" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "metadata" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditEntry_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AuditEntry_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LifecyclePhaseConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "phaseNumber" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "keyDeliverablesJson" TEXT NOT NULL DEFAULT '[]',
    "requiredArtifactIdsJson" TEXT NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'active',
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "TemplateRegistryEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "templateCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phaseNumber" INTEGER NOT NULL,
    "outputType" TEXT NOT NULL DEFAULT 'both',
    "required" BOOLEAN NOT NULL DEFAULT true,
    "schemaVersion" TEXT NOT NULL DEFAULT '1.0',
    "status" TEXT NOT NULL DEFAULT 'active',
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "GateRuleConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "gateCode" TEXT NOT NULL,
    "gateName" TEXT NOT NULL,
    "relatedPhaseNumber" INTEGER NOT NULL,
    "requiredInputIdsJson" TEXT NOT NULL DEFAULT '[]',
    "requiredEvidenceCount" INTEGER NOT NULL DEFAULT 0,
    "requiredApproverRolesJson" TEXT NOT NULL DEFAULT '[]',
    "decisionRule" TEXT NOT NULL DEFAULT 'single_approver',
    "unlocksPhaseNumber" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'active',
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "RoleConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "roleId" TEXT NOT NULL,
    "roleName" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "permissionsJson" TEXT NOT NULL DEFAULT '[]',
    "systemRole" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AppSetting" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL DEFAULT '{}',
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_EvidenceItem" (
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
INSERT INTO "new_EvidenceItem" ("checksum", "classification", "completenessPercent", "createdAt", "description", "downloadHref", "evidenceCode", "evidenceType", "fileSizeBytes", "fileTypeLabel", "gateCode", "id", "name", "notes", "phaseNumber", "previewHref", "projectId", "retentionPolicyLabel", "source", "status", "tagsJson", "updatedAt", "uploadedByName") SELECT "checksum", "classification", "completenessPercent", "createdAt", "description", "downloadHref", "evidenceCode", "evidenceType", "fileSizeBytes", "fileTypeLabel", "gateCode", "id", "name", "notes", "phaseNumber", "previewHref", "projectId", "retentionPolicyLabel", "source", "status", "tagsJson", "updatedAt", "uploadedByName" FROM "EvidenceItem";
DROP TABLE "EvidenceItem";
ALTER TABLE "new_EvidenceItem" RENAME TO "EvidenceItem";
CREATE INDEX "EvidenceItem_projectId_gateCode_idx" ON "EvidenceItem"("projectId", "gateCode");
CREATE UNIQUE INDEX "EvidenceItem_projectId_evidenceCode_key" ON "EvidenceItem"("projectId", "evidenceCode");
CREATE TABLE "new_GateDecision" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "gateId" TEXT NOT NULL,
    "decision" TEXT NOT NULL,
    "authorityName" TEXT NOT NULL,
    "authorityRole" TEXT NOT NULL,
    "nextAction" TEXT NOT NULL,
    "evidencePassSnapshot" BOOLEAN NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GateDecision_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_GateDecision" ("authorityName", "authorityRole", "createdAt", "decision", "evidencePassSnapshot", "gateId", "id", "nextAction", "projectId") SELECT "authorityName", "authorityRole", "createdAt", "decision", "evidencePassSnapshot", "gateId", "id", "nextAction", "projectId" FROM "GateDecision";
DROP TABLE "GateDecision";
ALTER TABLE "new_GateDecision" RENAME TO "GateDecision";
CREATE INDEX "GateDecision_projectId_gateId_idx" ON "GateDecision"("projectId", "gateId");
CREATE TABLE "new_Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "ownerId" TEXT,
    "vaultFolder" TEXT NOT NULL DEFAULT 'IDEA-0001',
    "currentPhase" INTEGER NOT NULL DEFAULT 1,
    "applicabilityJson" TEXT NOT NULL DEFAULT '{}',
    "complexityLevel" TEXT,
    "namingConformanceNote" TEXT,
    "initialTestSetupNote" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Project_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Project" ("applicabilityJson", "complexityLevel", "createdAt", "currentPhase", "id", "initialTestSetupNote", "name", "namingConformanceNote", "slug", "updatedAt", "vaultFolder") SELECT "applicabilityJson", "complexityLevel", "createdAt", "currentPhase", "id", "initialTestSetupNote", "name", "namingConformanceNote", "slug", "updatedAt", "vaultFolder" FROM "Project";
DROP TABLE "Project";
ALTER TABLE "new_Project" RENAME TO "Project";
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");
CREATE INDEX "Project_ownerId_idx" ON "Project"("ownerId");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'Project Owner',
    "initials" TEXT NOT NULL DEFAULT 'AD',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("createdAt", "email", "id", "name", "updatedAt") SELECT "createdAt", "email", "id", "name", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Approval_projectId_status_idx" ON "Approval"("projectId", "status");

-- CreateIndex
CREATE INDEX "Approval_artifactId_idx" ON "Approval"("artifactId");

-- CreateIndex
CREATE INDEX "ApprovalComment_approvalId_createdAt_idx" ON "ApprovalComment"("approvalId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditEntry_projectId_createdAt_idx" ON "AuditEntry"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditEntry_subjectKind_subjectId_idx" ON "AuditEntry"("subjectKind", "subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "LifecyclePhaseConfig_phaseNumber_key" ON "LifecyclePhaseConfig"("phaseNumber");

-- CreateIndex
CREATE UNIQUE INDEX "TemplateRegistryEntry_templateCode_key" ON "TemplateRegistryEntry"("templateCode");

-- CreateIndex
CREATE UNIQUE INDEX "GateRuleConfig_gateCode_key" ON "GateRuleConfig"("gateCode");

-- CreateIndex
CREATE UNIQUE INDEX "RoleConfig_roleId_key" ON "RoleConfig"("roleId");

