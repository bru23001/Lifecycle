import { redirect } from "next/navigation";

type PageProps = {
  searchParams?: Promise<{ intent?: string | string[] }>;
};

export default async function NewProjectLegacyRedirect({ searchParams }: PageProps) {
  const params = searchParams != null ? await searchParams : {};
  const raw = params.intent;
  const intent = Array.isArray(raw) ? raw[0] : raw;
  const q = new URLSearchParams();
  q.set("new", "1");
  if (intent?.trim()) q.set("intent", intent.trim());
  redirect(`/projects?${q.toString()}`);
}
