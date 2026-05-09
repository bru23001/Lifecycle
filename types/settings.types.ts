export type SettingsSectionId =
  | "lifecycle_configuration"
  | "template_registry"
  | "gate_rules"
  | "roles_permissions"
  | "export_settings"
  | "local_storage_settings";

export type SettingsNavItem = {
  id: string;
  section: SettingsSectionId;
  label: string;
  description: string;
  icon: string;
  active: boolean;
  href: string;
};

export type SettingsSystemNavItem = {
  id: string;
  label: string;
  href: string;
};

export type LifecyclePhaseSetting = {
  id: string;
  phaseNumber: number;
  name: string;
  description: string;
  keyDeliverables: string[];
  requiredArtifactIds: string[];
  status: "active" | "inactive" | "draft";
  canEdit: boolean;
  canReorder: boolean;
};

export type TemplateRegistryItem = {
  id: string;
  templateCode: string;
  name: string;
  phaseNumber: number;
  phaseName: string;
  outputType: "markdown" | "json" | "both";
  required: boolean;
  schemaVersion: string;
  status: "active" | "draft" | "deprecated" | "archived";
  canEdit: boolean;
  canClone: boolean;
  canArchive: boolean;
};

export type GateRuleSetting = {
  id: string;
  gateCode: string;
  gateName: string;
  relatedPhaseNumber: number;
  requiredInputIds: string[];
  requiredEvidenceCount: number;
  requiredApproverRoles: string[];
  decisionRule: "single_approver" | "majority" | "unanimous" | "role_based";
  unlocksPhaseNumber?: number;
  status: "active" | "draft" | "inactive";
};

export type PermissionModule =
  | "projects"
  | "lifecycle"
  | "templates"
  | "gates"
  | "artifacts"
  | "evidence"
  | "traceability"
  | "approvals"
  | "reports"
  | "settings";

export type RolePermissionEntry = {
  module: PermissionModule;
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  approve: boolean;
  export: boolean;
  admin: boolean;
};

export type RolePermissionSetting = {
  roleId: string;
  roleName: string;
  description: string;
  permissions: RolePermissionEntry[];
  assignedUsersCount: number;
  systemRole: boolean;
};

export type ExportSettings = {
  formats: {
    markdown: boolean;
    jsonEvidence: boolean;
    pdf: boolean;
    csv: boolean;
    zip: boolean;
  };
  packageRules: {
    includeArtifacts: boolean;
    includeEvidenceFiles: boolean;
    includeGateDecisions: boolean;
    includeApprovalRecords: boolean;
    includeTraceabilityLinks: boolean;
    includeAuditManifest: boolean;
    generateChecksums: boolean;
    redactRestrictedFields: boolean;
  };
  namingRules: {
    filenamePattern: string;
    dateFormat: string;
    projectCodePrefix: boolean;
    versionSuffix: boolean;
  };
};

export type LocalStorageSettings = {
  paths: {
    projectDataPath: string;
    evidenceFilesPath: string;
    exportPackagesPath: string;
    cachePath: string;
  };
  usage: {
    usedBytes: number;
    availableBytes: number;
    cacheBytes: number;
    evidenceBytes: number;
    quotaBytes?: number;
  };
  retention: {
    keepDraftsDays: number;
    keepExportPackagesDays: number;
    keepAuditSnapshotsDays: number;
    cleanupPolicy: "manual" | "weekly" | "monthly";
  };
  backupSync: {
    autoBackupEnabled: boolean;
    backupLocation?: string;
    syncEnabled: boolean;
    lastBackupLabel?: string;
  };
};

export type SystemOverview = {
  lifecycleModelName: string;
  gateCount: number;
  activeTemplateCount: number;
  roleCount: number;
  permissionRuleCount: number;
  exportFormats: string[];
  localStorageUsageLabel: string;
  overviewHref: string;
};

export type SettingsActivityEventType =
  | "lifecycle_updated"
  | "template_added"
  | "template_updated"
  | "gate_rule_modified"
  | "role_changed"
  | "export_settings_changed"
  | "storage_settings_changed";

export type SettingsActivity = {
  id: string;
  eventType: SettingsActivityEventType;
  title: string;
  actorName: string;
  timestampLabel: string;
  href?: string;
};

export type SettingsQuickAction = {
  id: string;
  label: string;
  description?: string;
  icon: string;
  actionType:
    | "import_config"
    | "export_config"
    | "reset_defaults"
    | "validate_config"
    | "open_docs";
  href?: string;
};

export type SettingsActionState = {
  title: string;
  description: string;
  hasUnsavedChanges: boolean;
  canSave: boolean;
  canReset: boolean;
  blockers: string[];
};

export type SettingsPageData = {
  user: {
    name: string;
    role: string;
    initials: string;
  };
  activeSection: SettingsSectionId;
  navigationItems: SettingsNavItem[];
  systemNavigationItems: SettingsSystemNavItem[];
  lifecycleConfiguration: {
    phases: LifecyclePhaseSetting[];
    totalPhases: number;
    totalGates: number;
    totalArtifacts: number;
    activeTemplates: number;
    lastUpdatedLabel: string;
  };
  templateRegistry: TemplateRegistryItem[];
  gateRules: GateRuleSetting[];
  rolesPermissions: RolePermissionSetting[];
  exportSettings: ExportSettings;
  localStorageSettings: LocalStorageSettings;
  systemOverview: SystemOverview;
  recentActivity: SettingsActivity[];
  quickActions: SettingsQuickAction[];
  actionState: SettingsActionState;
};
