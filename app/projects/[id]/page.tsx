import { notFound, redirect } from "next/navigation";

import { ProjectOverviewScreen } from "@/components/projects/project-overview-screen";
import { PROJECT_DETAIL_TABS } from "@/data/projects.constants";
import { normalizeProjectDetailTabQueryParam } from "@/lib/normalize-project-detail-tab-query";
import { loadProjectOverviewScreenData } from "@/lib/server/project-overview-screen";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string | string[] }>;
};

function searchParamFirst(value: string | string[] | undefined): string | undefined {
  if (value === undefined) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

export default async function ProjectOverviewPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const sp = await searchParams;
  const tab = normalizeProjectDetailTabQueryParam(searchParamFirst(sp.tab));

  if (tab != null && PROJECT_DETAIL_TABS.some((item) => item.id === tab)) {
    redirect(`/projects?selected=${id}&tab=${tab}`);
  }

  const data = await loadProjectOverviewScreenData(id);
  if (!data) {
    notFound();
  }
  return <ProjectOverviewScreen data={data} />;
}
