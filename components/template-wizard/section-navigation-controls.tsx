"use client";

import { Button } from "@/components/ui/button";

export function SectionNavigationControls({
  canGoPrev,
  canGoNext,
  onPrev,
  onNext,
  onSaveSection,
}: {
  canGoPrev: boolean;
  canGoNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onSaveSection: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
      <Button type="button" variant="outline" size="sm" disabled={!canGoPrev} onClick={onPrev}>
        Previous Section
      </Button>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" size="sm" onClick={onSaveSection}>
          Save Section
        </Button>
        <Button type="button" variant="default" size="sm" disabled={!canGoNext} onClick={onNext}>
          Next Section
        </Button>
      </div>
    </div>
  );
}
