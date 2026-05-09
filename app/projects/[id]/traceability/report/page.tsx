import Link from "next/link";

import { Button } from "@/components/ui/button";

export default async function TraceabilityReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <main className="mx-auto max-w-4xl space-y-4 px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Traceability Report</h1>
      <p className="text-sm text-muted-foreground">
        Detailed report package is staged here. Use the matrix screen to review current coverage and export
        CSV, JSON, or PDF snapshots.
      </p>
      <Link href={`/projects/${id}/traceability`}>
        <Button variant="outline">Back to Traceability Matrix</Button>
      </Link>
    </main>
  );
}
