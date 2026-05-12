import { redirect } from "next/navigation";

/** Canonical entry: dashboard is the solo home screen. */
export default function HomePage() {
  redirect("/dashboard");
}
