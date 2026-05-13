import { NotificationCenterPage } from "@/components/notifications/notification-center-page";
import { loadNotificationCenterData } from "@/lib/server/notification-center-screen";

export const dynamic = "force-dynamic";

export default async function NotificationsRoutePage() {
  const data = await loadNotificationCenterData();
  return <NotificationCenterPage data={data} />;
}
