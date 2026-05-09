"use client";

import { createContext, useContext } from "react";

export type AppShellLayoutContextValue = {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
};

export const AppShellLayoutContext = createContext<AppShellLayoutContextValue | null>(
  null,
);

export function useAppShellLayout(): AppShellLayoutContextValue {
  const ctx = useContext(AppShellLayoutContext);
  if (!ctx) {
    throw new Error("useAppShellLayout must be used within AuthenticatedAppShell");
  }
  return ctx;
}
