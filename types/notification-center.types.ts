export type NotificationItemKind = "approval_pending" | "gate_event" | "audit_event";

export type NotificationCenterItem = {
  id: string;
  kind: NotificationItemKind;
  title: string;
  subtitle: string;
  timeLabel: string;
  href: string;
};

export type NotificationCenterData = {
  user: { name: string; role: string; initials: string };
  items: NotificationCenterItem[];
  /** Open workflow approvals (pending / in_review / changes_requested); drives header badge. */
  openApprovalsCount: number;
};
