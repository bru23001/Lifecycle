import type {
  SettingsActionState,
  SettingsNavItem,
  SettingsQuickAction,
  SettingsSectionId,
  SettingsSystemNavItem,
} from "@/types/settings.types";

function buildNavigationItems(activeSection: SettingsSectionId): SettingsNavItem[] {
  const baseItems: Omit<SettingsNavItem, "active">[] = [
    {
      id: "lifecycle-configuration",
      section: "lifecycle_configuration",
      label: "Lifecycle Configuration",
      description: "Configure phases, milestones, artifacts, and lifecycle behavior.",
      icon: "workflow",
      href: "/settings/lifecycle",
    },
    {
      id: "template-registry",
      section: "template_registry",
      label: "Template Registry",
      description: "Manage templates for artifacts, forms, and outputs.",
      icon: "file-text",
      href: "/settings/templates",
    },
    {
      id: "gate-rules",
      section: "gate_rules",
      label: "Gate Rules",
      description: "Define gate criteria, required inputs, and decision rules.",
      icon: "shield-check",
      href: "/settings/gates",
    },
    {
      id: "roles-permissions",
      section: "roles_permissions",
      label: "Roles / Permissions",
      description: "Manage users, roles, and fine-grained access controls.",
      icon: "users-lock",
      href: "/settings/roles",
    },
    {
      id: "export-settings",
      section: "export_settings",
      label: "Export Settings",
      description: "Configure export formats, package rules, and redaction behavior.",
      icon: "upload",
      href: "/settings/exports",
    },
    {
      id: "local-storage-settings",
      section: "local_storage_settings",
      label: "Local Storage Settings",
      description: "Manage local storage size, retention, and sync behavior.",
      icon: "database",
      href: "/settings/storage",
    },
  ];

  return baseItems.map((item) => ({ ...item, active: item.section === activeSection }));
}

export const SETTINGS_SYSTEM_NAV: SettingsSystemNavItem[] = [
  { id: "general", label: "General", href: "/settings/general" },
  { id: "notifications", label: "Notifications", href: "/settings/notifications" },
  { id: "integrations", label: "Integrations", href: "/settings/integrations" },
  { id: "security", label: "Security", href: "/settings/security" },
  { id: "audit-compliance", label: "Audit & Compliance", href: "/settings/audit-compliance" },
];

export const SETTINGS_QUICK_ACTIONS: SettingsQuickAction[] = [
  {
    id: "import-lifecycle-configuration",
    label: "Import Lifecycle Configuration",
    icon: "upload",
    actionType: "import_config",
  },
  {
    id: "export-current-configuration",
    label: "Export Current Configuration",
    icon: "download",
    actionType: "export_config",
  },
  {
    id: "reset-to-default",
    label: "Reset to Default",
    icon: "refresh-ccw",
    actionType: "reset_defaults",
  },
  {
    id: "validate-configuration",
    label: "Validate Configuration",
    icon: "shield-check",
    actionType: "validate_config",
  },
  {
    id: "documentation-help",
    label: "Documentation & Help",
    icon: "book-open",
    actionType: "open_docs",
    href: "/docs/settings",
  },
];

export const SETTINGS_DEFAULT_ACTION_STATE: Omit<
  SettingsActionState,
  "hasUnsavedChanges" | "canSave" | "canReset" | "blockers"
> = {
  title: "Configuration drives governance.",
  description:
    "Keep lifecycle, gates, templates, and permissions aligned with your organization's process and policies.",
};

export function withActiveSection(
  activeSection: SettingsSectionId,
): { activeSection: SettingsSectionId; navigationItems: SettingsNavItem[] } {
  return {
    activeSection,
    navigationItems: buildNavigationItems(activeSection),
  };
}
