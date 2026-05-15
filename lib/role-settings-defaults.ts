import type { RoleExtendedDetail, RolePermissionSetting } from "@/types/settings.types";

export const ROLES_EXT_SCHEMA_VERSION = 1 as const;

export function emptyRoleDetail(): RoleExtendedDetail {
  return {
    assignedUsersRaw: "",
    assignmentNotes: "",
    auditHistoryNotes: "",
    relatedApprovalsNotes: "",
    exportPermissionsNotes: "",
  };
}

export function assignedCountFromRaw(raw: string): number {
  return raw
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean).length;
}

export function mergeRoleDetail(roleId: string, byRoleId: Record<string, unknown>): RoleExtendedDetail {
  const base = emptyRoleDetail();
  const raw = byRoleId[roleId];
  if (!raw || typeof raw !== "object") return base;
  const r = raw as Record<string, unknown>;
  return {
    assignedUsersRaw: typeof r.assignedUsersRaw === "string" ? r.assignedUsersRaw : base.assignedUsersRaw,
    assignmentNotes: typeof r.assignmentNotes === "string" ? r.assignmentNotes : base.assignmentNotes,
    auditHistoryNotes: typeof r.auditHistoryNotes === "string" ? r.auditHistoryNotes : base.auditHistoryNotes,
    relatedApprovalsNotes:
      typeof r.relatedApprovalsNotes === "string" ? r.relatedApprovalsNotes : base.relatedApprovalsNotes,
    exportPermissionsNotes:
      typeof r.exportPermissionsNotes === "string" ? r.exportPermissionsNotes : base.exportPermissionsNotes,
  };
}

export function roleDetailHasPersistableContent(d: RoleExtendedDetail): boolean {
  return (
    d.assignedUsersRaw.trim().length > 0 ||
    d.assignmentNotes.trim().length > 0 ||
    d.auditHistoryNotes.trim().length > 0 ||
    d.relatedApprovalsNotes.trim().length > 0 ||
    d.exportPermissionsNotes.trim().length > 0
  );
}

export function ensureRoleItem(role: RolePermissionSetting): RolePermissionSetting {
  const detail =
    role.detail && typeof role.detail === "object" ? { ...emptyRoleDetail(), ...role.detail } : emptyRoleDetail();
  return {
    ...role,
    detail,
    assignedUsersCount: assignedCountFromRaw(detail.assignedUsersRaw),
  };
}

export function ensureRolesList(roles: RolePermissionSetting[]): RolePermissionSetting[] {
  return roles.map(ensureRoleItem);
}

export function findRoleByRouteParam(roles: RolePermissionSetting[], param: string): RolePermissionSetting | undefined {
  const decoded = decodeURIComponent(param);
  return roles.find((r) => r.roleId === param || r.roleId === decoded);
}

export function parseRoleExtJson(raw: unknown): { byRoleId: Record<string, Record<string, unknown>> } {
  if (!raw || typeof raw !== "object") return { byRoleId: {} };
  const o = raw as Record<string, unknown>;
  const by = o.byRoleId;
  if (by && typeof by === "object" && !Array.isArray(by)) {
    return { byRoleId: by as Record<string, Record<string, unknown>> };
  }
  return { byRoleId: {} };
}

export function buildRoleExtPersistPayload(roles: RolePermissionSetting[]): { v: typeof ROLES_EXT_SCHEMA_VERSION; byRoleId: Record<string, RoleExtendedDetail> } {
  const byRoleId: Record<string, RoleExtendedDetail> = {};
  for (const r of roles) {
    if (roleDetailHasPersistableContent(r.detail)) {
      byRoleId[r.roleId] = r.detail;
    }
  }
  return { v: ROLES_EXT_SCHEMA_VERSION, byRoleId };
}
