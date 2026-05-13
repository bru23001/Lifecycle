import { notFound } from "next/navigation";

import { GatesListPage } from "@/components/gates/gates-list-page";
import { loadGatesListScreen } from "@/lib/server/gates-list";

export const dynamic = "force-dynamic";

export default async function ProjectGatesIndexPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await loadGatesListScreen(id);
  if (!data) {
    notFound();
  }
  return <GatesListPage data={data} />;
}
