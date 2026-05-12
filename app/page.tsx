import { DashboardPage } from "@/components/dashboard/dashboard-page";
import { getDashboardData } from "@/lib/server/dashboard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const data = await getDashboardData();
  return <DashboardPage data={data} />;
}
