#!/usr/bin/env node
// Inspect runs/*.jsonl produced by run-checks --runlog and run-spec-headless --runlog.
//
// The tools that emit run logs follow this convention:
//   - one .jsonl per invocation, named <tool>-<ISO-timestamp>.jsonl
//   - first line is { tool, phase: "summary", ... }
//   - subsequent lines are per-item details (phase: "check" or "recipe", ...)
//
// Usage:
//   node tools/show-runs.js                         # most recent 10 runs (one line each)
//   node tools/show-runs.js --limit 30              # last N
//   node tools/show-runs.js --tool run-checks       # filter by tool name
//   node tools/show-runs.js --last                  # detail dump of the most recent run
//   node tools/show-runs.js --last --tool run-checks   # most recent of that tool
//   node tools/show-runs.js --failed                # only show runs that failed
//   node tools/show-runs.js --diff                  # diff most recent two runs (same tool)
//   node tools/show-runs.js --prune --keep 20       # delete old runs, keep newest N per tool

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
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
    "  node tools/show-runs.js                          # last 10 runs, one per line",
    "  node tools/show-runs.js --limit 30",
    "  node tools/show-runs.js --tool run-checks        # filter by tool",
    "  node tools/show-runs.js --last                   # full detail of most recent",
    "  node tools/show-runs.js --failed                 # only failed runs",
    "  node tools/show-runs.js --diff                   # diff last two runs (same tool)",
    "  node tools/show-runs.js --prune --keep N         # delete oldest, keep newest N per tool",
    "  node tools/show-runs.js --prune --keep N --dry-run   # preview only",
  ].join("\n") + "\n");
  process.exit(0);
}

if (!fs.existsSync(RUNS)) {
  process.stdout.write(`runs/ does not exist yet — invoke a tool with --runlog to create entries.\n`);
  process.exit(0);
}

const limit = Number(flagValue("--limit")) || 10;
const toolFilter = flagValue("--tool");
const wantLast = flag("--last");
const wantFailed = flag("--failed");
const wantDiff = flag("--diff");
const wantPrune = flag("--prune");
const dryRun = flag("--dry-run");

// Load + sort .jsonl files, newest first.
const files = fs.readdirSync(RUNS)
  .filter((f) => f.endsWith(".jsonl"))
  .map((f) => ({
    name: f,
    full: path.join(RUNS, f),
    mtime: fs.statSync(path.join(RUNS, f)).mtimeMs,
  }))
  .sort((a, b) => b.mtime - a.mtime);

if (files.length === 0) {
  process.stdout.write(`runs/ has no .jsonl files yet.\n`);
  process.exit(0);
}

// ── --prune: keep newest N runs per tool, delete the rest ─────────────────
if (wantPrune) {
  const keepArg = flagValue("--keep");
  // Number(null) === 0, so we have to check the raw arg explicitly.
  // Without this guard, `--prune` alone would silently keep zero runs and
  // delete everything.
  if (keepArg == null) {
    process.stderr.write("show-runs: --prune requires --keep <N>\n");
    process.exit(2);
  }
  const keep = Number(keepArg);
  if (!Number.isFinite(keep) || keep < 0 || !Number.isInteger(keep)) {
    process.stderr.write(`show-runs: --keep must be a non-negative integer, got ${JSON.stringify(keepArg)}\n`);
    process.exit(2);
  }
  // Group files by tool name (parsed from the summary line). Files that
  // can't be classified — corrupt, missing summary, mid-write — go into a
  // "_unknown" bucket and are conservatively kept.
  const byTool = new Map();
  for (const file of files) {
    let tool = "_unknown";
    try {
      const firstLine = fs.readFileSync(file.full, "utf8").split("\n", 1)[0] || "";
      const rec = firstLine ? JSON.parse(firstLine) : null;
      if (rec && typeof rec.tool === "string") tool = rec.tool;
    } catch (_e) { /* keep _unknown */ }
    if (toolFilter && tool !== toolFilter) continue;
    if (!byTool.has(tool)) byTool.set(tool, []);
    byTool.get(tool).push(file);
  }
  const toDelete = [];
  for (const [tool, list] of byTool.entries()) {
    if (tool === "_unknown") continue;
    // list is already newest-first because outer files[] is.
    toDelete.push(...list.slice(keep).map((f) => ({ tool, file: f })));
  }
  if (toDelete.length === 0) {
    process.stdout.write(`prune: nothing to delete (each tool has <= ${keep} runs).\n`);
    process.exit(0);
  }
  for (const { tool, file } of toDelete) {
    if (dryRun) {
      process.stdout.write(`would delete: ${tool}  ${file.name}\n`);
    } else {
      try { fs.unlinkSync(file.full); }
      catch (err) { process.stderr.write(`prune: could not delete ${file.name}: ${err.message}\n`); }
      process.stdout.write(`deleted: ${tool}  ${file.name}\n`);
    }
  }
  if (dryRun) process.stdout.write(`(dry run — pass without --dry-run to actually delete)\n`);
  process.exit(0);
}

function readRun(file) {
  const lines = fs.readFileSync(file.full, "utf8").split("\n").filter(Boolean);
  const records = lines.map((line) => {
    try { return JSON.parse(line); } catch { return null; }
  }).filter(Boolean);
  const summary = records.find((r) => r.phase === "summary") || records[0] || null;
  const items = records.filter((r) => r.phase !== "summary");
  return { file, summary, items };
}

function matches(run) {
  if (toolFilter && (run.summary && run.summary.tool) !== toolFilter) return false;
  if (wantFailed && run.summary && run.summary.ok) return false;
  return true;
}

const runs = files.map(readRun).filter(matches);

if (runs.length === 0) {
  process.stdout.write(`No runs match the given filters.\n`);
  process.exit(0);
}

// ── --diff: compare the two most recent runs of the same tool ─────────────
if (wantDiff) {
  // If --tool was given, runs[] is already filtered. Otherwise pick whichever
  // tool the most-recent run uses.
  const targetTool = toolFilter || (runs[0] && runs[0].summary && runs[0].summary.tool);
  const sameTool = runs.filter((r) => r.summary && r.summary.tool === targetTool);
  if (sameTool.length < 2) {
    process.stdout.write(`Need at least 2 runs of '${targetTool}' to diff (have ${sameTool.length}).\n`);
    process.exit(0);
  }
  const [newer, older] = sameTool;
  const idKey = newer.summary.tool === "run-spec-headless" ? "id" : "name";
  const indexBy = (run) => {
    const map = new Map();
    for (const it of run.items) map.set(it[idKey], it);
    return map;
  };
  const oldIdx = indexBy(older);
  const newIdx = indexBy(newer);
  const allKeys = new Set([...oldIdx.keys(), ...newIdx.keys()]);
  const lines = [];
  for (const k of [...allKeys].sort()) {
    const o = oldIdx.get(k);
    const n = newIdx.get(k);
    if (!o && n) lines.push(`+ ${k} (added, ${n.ok ? "PASS" : "FAIL"})`);
    else if (o && !n) lines.push(`- ${k} (removed)`);
    else if (o.ok !== n.ok) lines.push(`~ ${k} ${o.ok ? "PASS" : "FAIL"} → ${n.ok ? "PASS" : "FAIL"}`);
  }
  process.stdout.write(`diff: ${path.basename(older.file.name)} → ${path.basename(newer.file.name)}\n`);
  if (lines.length === 0) process.stdout.write("(no differences)\n");
  else for (const l of lines) process.stdout.write(l + "\n");
  process.exit(0);
}

// ── --last: detail dump of the most recent matching run ──────────────────
if (wantLast) {
  const r = runs[0];
  process.stdout.write(`file: ${r.file.name}\n`);
  if (r.summary) {
    const s = r.summary;
    process.stdout.write(`tool: ${s.tool}  ok: ${s.ok}  pass=${s.pass || s.passed || 0}  fail=${s.fail || s.failed || 0}  total=${s.total || 0}  duration=${s.durationMs || 0}ms\n`);
  }
  for (const it of r.items) {
    const tag = it.ok ? "PASS" : it.skipped ? "SKIP" : "FAIL";
    const id = it.id || it.name || "?";
    process.stdout.write(`  [${tag}] ${id.padEnd(50)} ${String(it.durationMs || 0).padStart(5)}ms\n`);
  }
  process.exit(0);
}

// ── default: short list ──────────────────────────────────────────────────
const shown = runs.slice(0, limit);
for (const r of shown) {
  const s = r.summary || {};
  const okStr = s.ok ? "OK " : "RED";
  const pass = s.pass != null ? s.pass : (s.passed != null ? s.passed : "?");
  const fail = s.fail != null ? s.fail : (s.failed != null ? s.failed : "?");
  const tool = (s.tool || "?").padEnd(20);
  const ts = new Date(r.file.mtime).toISOString();
  process.stdout.write(`${okStr}  ${tool}  ${ts}  pass=${pass} fail=${fail}  ${r.file.name}\n`);
}
if (runs.length > shown.length) {
  process.stdout.write(`(${runs.length - shown.length} more — use --limit to widen)\n`);
}
