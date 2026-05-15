import type { Metadata } from "next";
import type { ReactNode } from "react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Settings",
  description: "Configure lifecycle, templates, gates, roles, exports, and local storage for the platform.",
};

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return children;
}
