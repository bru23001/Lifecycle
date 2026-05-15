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

export type LifecyclePhaseExtended = {
  entryCriteria: string;
  exitCriteria: string;
  requiredEvidenceCount: number;
  relatedGateCode: string;
  requiredTemplateIds: string[];
  transitionRulesSummary: string;
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
  extended: LifecyclePhaseExtended;
};

export type LifecycleMilestone = {
  id: string;
  name: string;
  phaseNumber: number;
  description: string;
  completionCriteria: string;
  requiredArtifactIds: string[];
  requiredEvidenceCount: number;
};

export type LifecycleTransitionRule = {
  id: string;
  fromPhaseNumber: number;
  toPhaseNumber: number;
  triggerCondition: string;
  requiredGateCode: string;
  requiredArtifactIds: string[];
  requiredEvidenceCount: number;
  blockingConditions: string;
};

export type LifecycleConfigurationBlock = {
  phases: LifecyclePhaseSetting[];
  totalPhases: number;
  totalGates: number;
  totalArtifacts: number;
  activeTemplates: number;
  lastUpdatedLabel: string;
  /** When false, structural edits require unlock flow first. */
  configurationEditUnlocked: boolean;
  milestones: LifecycleMilestone[];
  transitionRules: LifecycleTransitionRule[];
};

export type TemplateVersionEntry = {
  id: string;
  author: string;
  timestampLabel: string;
  changeSummary: string;
  schemaSnapshot: string;
};

export type TemplateRegistryDetail = {
  sectionDefinitions: string;
  fieldDefinitions: string;
  validationRules: string;
  markdownRendererSettings: string;
  jsonEvidenceSettings: string;
  usageSummaryLabel: string;
  versionHistory: TemplateVersionEntry[];
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
  detail: TemplateRegistryDetail;
};

export type GateRuleExtendedDetail = {
  readinessRuleSummary: string;
  decisionCriteriaNotes: string;
  approverPolicyNotes: string;
  escalationNotes: string;
  dueDatePolicyNotes: string;
  usageSummaryLabel: string;
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
  detail: GateRuleExtendedDetail;
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

/** Persisted under `settings_roles_ext` (by `roleId`). */
export type RoleExtendedDetail = {
  assignedUsersRaw: string;
  assignmentNotes: string;
  auditHistoryNotes: string;
  relatedApprovalsNotes: string;
  exportPermissionsNotes: string;
};

export type RolePermissionSetting = {
  roleId: string;
  roleName: string;
  description: string;
  permissions: RolePermissionEntry[];
  assignedUsersCount: number;
  systemRole: boolean;
  detail: RoleExtendedDetail;
};

/** Granular export redaction toggles (edited via Redaction Rules drawer). */
export type ExportRedactionRules = {
  restrictApiKeys: boolean;
  restrictInternalUrls: boolean;
  restrictFinancialCodes: boolean;
  piiEmails: boolean;
  piiPhones: boolean;
  piiNames: boolean;
  evidenceUploaderIdentity: boolean;
  evidenceLocationHints: boolean;
  evidenceDeviceFingerprints: boolean;
  exportStripWikiMarkup: boolean;
  exportCollapseTimestamps: boolean;
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
  redactionRules: ExportRedactionRules;
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
    backupFrequency: "daily" | "weekly" | "monthly";
    includeEvidenceFiles: boolean;
    includeAuditSnapshots: boolean;
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
  lifecycleConfiguration: LifecycleConfigurationBlock;
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
