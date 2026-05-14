import { GateReviewPage } from "@/components/gate-review/gate-review-page";
import { loadGateReviewData } from "@/lib/server/gate-review";

export default async function GateReviewRoutePage({
  params,
}: {
  params: Promise<{ id: string; gateId: string }>;
}) {
  const { id, gateId } = await params;
  const data = await loadGateReviewData(id, gateId);
  return <GateReviewPage data={data} />;
}
