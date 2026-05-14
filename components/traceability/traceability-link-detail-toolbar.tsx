"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { TraceabilityLinkDetail } from "@/types/traceability.types";

import { DeleteTraceLinkModal } from "./delete-trace-link-modal";
import { EditTraceLinkModal } from "./edit-trace-link-modal";

export function TraceabilityLinkDetailToolbar({
  projectId,
  detail,
}: {
  projectId: string;
  detail: TraceabilityLinkDetail;
}) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (!detail.editable) {
    return null;
  }

  return (
    <>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => setEditOpen(true)}>
          <Pencil className="size-3.5" aria-hidden />
          Edit link
        </Button>
        <Button type="button" variant="destructive" size="sm" className="gap-1.5" onClick={() => setDeleteOpen(true)}>
          <Trash2 className="size-3.5" aria-hidden />
          Remove link
        </Button>
      </div>
      <EditTraceLinkModal
        open={editOpen}
        projectId={projectId}
        detail={detail}
        onClose={() => setEditOpen(false)}
        onSaved={() => {
          setEditOpen(false);
          router.refresh();
        }}
      />
      <DeleteTraceLinkModal
        open={deleteOpen}
        projectId={projectId}
        linkId={detail.id}
        onClose={() => setDeleteOpen(false)}
        onDeleted={() => {
          setDeleteOpen(false);
          router.push(`/projects/${projectId}/traceability`);
        }}
      />
    </>
  );
}
