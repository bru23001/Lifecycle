import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const buildIdPath = path.join(root, ".next", "BUILD_ID");

if (!fs.existsSync(buildIdPath)) {
  console.error(
    "[assert-next-build] Missing `.next/BUILD_ID`. Run `npm run build` before `npm run start`, or use `npm run dev` for development.",
  );
  process.exit(1);
}
