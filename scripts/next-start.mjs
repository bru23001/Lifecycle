import { spawn } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function resolvePort() {
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "-p" || a === "--port") {
      const v = argv[i + 1];
      if (v && /^\d+$/.test(v)) return v;
    }
    if (a?.startsWith("-p") && a.length > 2 && /^\d+$/.test(a.slice(2))) {
      return a.slice(2);
    }
    if (a?.startsWith("--port=")) {
      const v = a.slice("--port=".length);
      if (/^\d+$/.test(v)) return v;
    }
  }
  const env = process.env.PORT;
  if (env && /^\d+$/.test(env)) return env;
  return "3001";
}

const port = resolvePort();
const npx = process.platform === "win32" ? "npx.cmd" : "npx";

function repairServerChunkLayout() {
  const runtimePath = path.join(root, ".next", "server", "webpack-runtime.js");
  if (!existsSync(runtimePath)) return;

  const runtime = readFileSync(runtimePath, "utf8");
  const hasLegacyChunkRequire = runtime.includes('require("./" + __webpack_require__.u(');
  const hasChunksRequire = runtime.includes('require("./chunks/" + __webpack_require__.u(');
  if (!hasLegacyChunkRequire || hasChunksRequire) return;

  const patched = runtime.replaceAll(
    'require("./" + __webpack_require__.u(',
    'require("./chunks/" + __webpack_require__.u(',
  );
  if (patched !== runtime) {
    writeFileSync(runtimePath, patched, "utf8");
  }
}

repairServerChunkLayout();

const child = spawn(npx, ["next", "start", "-p", port], {
  cwd: root,
  stdio: "inherit",
  env: { ...process.env, PORT: port },
});

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 1);
});
