import { redirect } from "next/navigation";

/** Canonical entry: section workspace lives under `/settings/lifecycle`. */
export default function SettingsRootPage() {
  redirect("/settings/lifecycle");
}
