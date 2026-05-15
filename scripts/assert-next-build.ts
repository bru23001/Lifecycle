import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const buildIdPath = path.join(root, ".next", "BUILD_ID");
const buildManifestPath = path.join(root, ".next", "build-manifest.json");

function fail(message: string): never {
  console.error(
    `[assert-next-build] ${message} Run \`npm run build\` before \`npm run start\`, or use \`npm run dev\` for development.`,
  );
  process.exit(1);
}

if (!fs.existsSync(buildIdPath)) {
  fail("Missing `.next/BUILD_ID`.");
}

if (!fs.existsSync(buildManifestPath)) {
  fail("Missing `.next/build-manifest.json`.");
}

type BuildManifest = {
  rootMainFiles?: string[];
  pages?: Record<string, string[] | undefined>;
};

let manifest: BuildManifest;
try {
  manifest = JSON.parse(fs.readFileSync(buildManifestPath, "utf8")) as BuildManifest;
} catch {
  fail("Unable to parse `.next/build-manifest.json`.");
}

const rootMainFiles = manifest.rootMainFiles ?? [];
if (rootMainFiles.length === 0) {
  fail("Build output looks incomplete (`rootMainFiles` is empty).");
}

const appPageFiles = manifest.pages?.["/_app"] ?? [];
const filesToCheck = [...rootMainFiles, ...appPageFiles];
for (const rel of filesToCheck) {
  const normalizedRel = rel.replace(/^\/+/, "");
  const abs = path.join(root, ".next", normalizedRel);
  if (!fs.existsSync(abs)) {
    fail(`Missing built asset referenced by manifest: \`${normalizedRel}\`.`);
  }
}
