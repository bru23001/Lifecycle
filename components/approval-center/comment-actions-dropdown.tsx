"use client";

import { useEffect, useRef, useState } from "react";
import { MoreVertical } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ApproverComment } from "@/types/approval-center.types";

type Props = {
  comment: ApproverComment;
  onReply: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onCopyLink: () => void;
  onToggleResolved: () => void;
  onLinkEvidence: () => void;
};

export function CommentActionsDropdown({
  comment,
  onReply,
  onEdit,
  onDelete,
  onCopyLink,
  onToggleResolved,
  onLinkEvidence,
}: Props) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div className="relative shrink-0" ref={wrapRef}>
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        aria-label={`Comment actions for ${comment.id}`}
        aria-expanded={open}
        aria-haspopup="menu"
        className="size-8"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
      >
        <MoreVertical className="size-4" aria-hidden />
      </Button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-40 mt-1 min-w-[12rem] rounded-lg border border-slate-200 bg-white py-1 text-sm shadow-lg dark:border-border dark:bg-card"
          onClick={(e) => e.stopPropagation()}
        >
          <button type="button" role="menuitem" className="block w-full px-3 py-2 text-left hover:bg-slate-50" onClick={() => { setOpen(false); onReply(); }}>
            Reply
          </button>
          <button type="button" role="menuitem" className="block w-full px-3 py-2 text-left hover:bg-slate-50" onClick={() => { setOpen(false); onEdit(); }}>
            Edit
          </button>
          <button type="button" role="menuitem" className="block w-full px-3 py-2 text-left text-red-700 hover:bg-red-50" onClick={() => { setOpen(false); onDelete(); }}>
            Delete
          </button>
          <button type="button" role="menuitem" className="block w-full px-3 py-2 text-left hover:bg-slate-50" onClick={() => { setOpen(false); onCopyLink(); }}>
            Copy link
          </button>
          <button type="button" role="menuitem" className="block w-full px-3 py-2 text-left hover:bg-slate-50" onClick={() => { setOpen(false); onToggleResolved(); }}>
            {comment.resolved ? "Mark unresolved" : "Mark resolved"}
          </button>
          <button type="button" role="menuitem" className="block w-full px-3 py-2 text-left hover:bg-slate-50" onClick={() => { setOpen(false); onLinkEvidence(); }}>
            Link to evidence
          </button>
        </div>
      ) : null}
    </div>
  );
}
