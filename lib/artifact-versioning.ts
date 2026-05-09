import type { ArtifactVersion } from "@/types/artifact-library.types";

export function compareVersionLabels(current: string, candidate: string): string {
  return `Compare ${candidate} against ${current}`;
}

export function restoreVersion(
  versions: ArtifactVersion[],
  id: string,
): ArtifactVersion[] {
  return versions.map((v) =>
    v.id === id ? { ...v, canRestore: false, status: "draft" } : v,
  );
}
