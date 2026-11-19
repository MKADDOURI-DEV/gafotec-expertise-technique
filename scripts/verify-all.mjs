// ONE command for every check, in order, stopping at the first failure:
//   lint -> unit tests -> build -> bundle security -> end-to-end (mocked Supabase, production build)
// Usage (PowerShell or any shell):  npm run verify:all
import { spawnSync } from "node:child_process";

const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const steps = [
  ["1/5  Lint", ["run", "lint"]],
  ["2/5  Unit tests", ["test"]],
  ["3/5  Build", ["run", "build"]],
  ["4/5  Bundle security (no secret, no Base44 in the browser bundle)", ["run", "check:bundle"]],
  ["5/5  End-to-end (production build, mocked Supabase)", ["run", "test:e2e"]],
];

const started = Date.now();
for (const [label, args] of steps) {
  console.log(`\n=== ${label} ===`);
  const result = spawnSync(npm, args, { stdio: "inherit", shell: process.platform === "win32" });
  if (result.status !== 0) {
    console.error(`\nFAIL at step ${label}. Nothing after this step was run. Fix it, then run: npm run verify:all`);
    process.exit(result.status ?? 1);
  }
}
console.log(`\nALL CHECKS PASSED in ${Math.round((Date.now() - started) / 1000)} s.`);
