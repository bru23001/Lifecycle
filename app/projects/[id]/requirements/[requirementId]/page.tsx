import { RequirementDetailView } from "@/components/requirements/requirement-detail-view";
import { loadRequirementDetailScreen } from "@/lib/server/requirement-detail-screen";

export const dynamic = "force-dynamic";

export default async function RequirementDetailPage({
  params,
}: {
  params: Promise<{ id: string; requirementId: string }>;
}) {
  const { id, requirementId } = await params;
  const data = await loadRequirementDetailScreen(id, requirementId);
  return <RequirementDetailView data={data} />;
}
