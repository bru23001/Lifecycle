import Link from "next/link";

import { Button } from "@/components/ui/button";

export default async function EvidenceExportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <main className="mx-auto max-w-4xl space-y-4 px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Evidence Export</h1>
      <p className="text-sm text-muted-foreground">
        Export pipeline placeholder. Use Evidence Center to export selected, by-gate, or full evidence bundles.
      </p>
      <Link href={`/projects/${id}/evidence`}>
        <Button variant="outline">Back to Evidence Center</Button>
      </Link>
    </main>
  );
}
