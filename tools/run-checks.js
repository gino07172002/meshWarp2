#!/usr/bin/env node
// Unified runner for tools/check-*.js.
//
// Why this exists:
//   - The legacy invocation `for f in tools/check-*.js; do node "$f"; done`
//     does not run on Windows PowerShell.
//   - Failures previously interleaved on stderr with no per-check structure.
//   - There was no machine-readable summary an agent could consume in one shot.
//
// This runner spawns each check in its own node process (so a process.exit(1)
// from one check cannot affect the rest), captures stdout/stderr per check,
// and emits both a human and a JSON report.
//
// Usage:
//   node tools/run-checks.js                    # human report, exit 1 if any fail
//   node tools/run-checks.js --json             # machine report on stdout
//   node tools/run-checks.js --filter workspace # only run checks whose name matches substring
//   node tools/run-checks.js --bail             # stop on first failure
//   node tools/run-checks.js --runlog           # append a JSONL entry to runs/ for this invocation

const fs = require("fs");
const path = require("path");
const cp = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const TOOLS = path.join(ROOT, "tools");
const RUNS = path.join(ROOT, "runs");

const args = process.argv.slice(2);
function flag(name) { return args.includes(name); }
function flagValue(name, fallback = null) {
  const i = args.indexOf(name);
  return i >= 0 && i + 1 < args.length ? args[i + 1] : fallback;
}

if (flag("-h") || flag("--help")) {
  process.stdout.write([
    "Usage:",
    "  node tools/run-checks.js [--filter <substring>] [--bail] [--json] [--runlog]",
    "",
    "Discovers tools/check-*.js, runs each in its own node process,",
    "and prints pass/fail + duration. Exits non-zero if any check fails.",
  ].join("\n") + "\n");
  process.exit(0);
}

const wantJson = flag("--json");
const wantBail = flag("--bail");
const wantRunlog = flag("--runlog");
const filter = flagValue("--filter", "");

const checkFiles = fs.readdirSync(TOOLS)
  .filter((f) => f.startsWith("check-") && f.endsWith(".js"))
  .filter((f) => !filter || f.includes(filter))
  .sort()
  .map((f) => path.join("tools", f));

if (checkFiles.length === 0) {
  process.stderr.write(`run-checks: no check-*.js files match filter ${JSON.stringify(filter)}\n`);
  process.exit(2);
}

const results = [];
const startedAt = Date.now();
let bailed = false;

for (const rel of checkFiles) {
  const t0 = Date.now();
  const r = cp.spawnSync(process.execPath, [rel], { cwd: ROOT, encoding: "utf8" });
  const ms = Date.now() - t0;
  const ok = r.status === 0 && !r.error;
  results.push({
    name: path.basename(rel),
    ok,
    durationMs: ms,
    exitCode: r.status,
    signal: r.signal,
    stdout: (r.stdout || "").trimEnd(),
    stderr: (r.stderr || "").trimEnd(),
    spawnError: r.error ? String(r.error.message || r.error) : null,
  });
  if (!ok && wantBail) { bailed = true; break; }
}

const passCount = results.filter((x) => x.ok).length;
const failCount = results.length - passCount;
const totalMs = Date.now() - startedAt;
const summary = {
  ok: failCount === 0 && !bailed === false ? failCount === 0 : failCount === 0,
  // Easier to read:
  passed: passCount,
  failed: failCount,
  total: checkFiles.length,
  ran: results.length,
  bailed,
  durationMs: totalMs,
  startedAt: new Date(startedAt).toISOString(),
};
summary.ok = failCount === 0;

// ── Output ────────────────────────────────────────────────────────────────
if (wantJson) {
  process.stdout.write(JSON.stringify({ summary, results }, null, 2) + "\n");
} else {
  for (const r of results) {
    const tag = r.ok ? "PASS" : "FAIL";
    process.stdout.write(`[${tag}] ${r.name.padEnd(50)} ${String(r.durationMs).padStart(5)}ms\n`);
    if (!r.ok) {
      const out = (r.stdout + (r.stdout && r.stderr ? "\n" : "") + r.stderr).split("\n");
      for (const line of out.slice(0, 30)) process.stdout.write(`    ${line}\n`);
      if (r.spawnError) process.stdout.write(`    spawn error: ${r.spawnError}\n`);
    }
  }
  process.stdout.write("\n");
  process.stdout.write(`Summary: ${passCount}/${checkFiles.length} passed`);
  if (bailed) process.stdout.write(" (bailed early)");
  process.stdout.write(`, ${totalMs}ms total\n`);
}

// ── Run log (optional) ─────────────────────────────────────────────────────
if (wantRunlog) {
  try {
    if (!fs.existsSync(RUNS)) fs.mkdirSync(RUNS, { recursive: true });
    const stamp = new Date(startedAt).toISOString().replace(/[:.]/g, "-");
    const logPath = path.join(RUNS, `run-checks-${stamp}.jsonl`);
    const compact = results.map((r) => ({
      name: r.name, ok: r.ok, durationMs: r.durationMs, exitCode: r.exitCode,
    }));
    fs.writeFileSync(logPath, [
      JSON.stringify({ tool: "run-checks", phase: "summary", ...summary }),
      ...compact.map((c) => JSON.stringify({ tool: "run-checks", phase: "check", ...c })),
    ].join("\n") + "\n");
    if (!wantJson) process.stdout.write(`run log: ${path.relative(ROOT, logPath)}\n`);
  } catch (err) {
    process.stderr.write(`run-checks: failed to write run log: ${err.message}\n`);
  }
}

process.exit(summary.ok ? 0 : 1);
