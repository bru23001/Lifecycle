"use client";

import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";

export function WorkspaceThemeToggle() {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label="Toggle theme"
      className="text-muted-foreground"
      onClick={() => {
        document.documentElement.classList.toggle("dark");
      }}
    >
      <Sun className="hidden size-4 dark:inline" />
      <Moon className="inline size-4 dark:hidden" />
    </Button>
  );
}
