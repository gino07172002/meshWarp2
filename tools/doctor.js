#!/usr/bin/env node
// Harness-engineering Doctor for d:\claude (the target side).
//
// Question this tool answers:
//   "Can I trust this checkout to run the d:\claude harness-engineering
//    tools (run-checks, run-spec-headless, trace-inspect, ...)?"
//
// It is intentionally conservative — only reports what it can prove locally,
// without launching a browser or hitting d:\harness. If you want to verify
// d:\harness too, point at it with --harness <path> and we will spawn its
// own doctor.
//
// Usage:
//   node tools/doctor.js
//   node tools/doctor.js --json
//   node tools/doctor.js --harness D:/harness   # also probe sibling harness

const fs = require("fs");
const path = require("path");
const cp = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const args = process.argv.slice(2);
if (args.includes("-h") || args.includes("--help")) {
  process.stdout.write([
    "Usage:",
    "  node tools/doctor.js                       # human report",
    "  node tools/doctor.js --json                # machine report",
    "  node tools/doctor.js --harness D:/harness  # also run sibling harness doctor",
    "",
    "Verifies that the d:\\claude checkout is sane enough to run the rest of",
    "the wave-1 harness-engineering tools (run-checks, dom-state-invariants,",
    "trace-inspect). Exit 0 = green, 1 = at least one check is red.",
  ].join("\n") + "\n");
  process.exit(0);
}
const wantJson = args.includes("--json");
const harnessIdx = args.indexOf("--harness");
const harnessPath = harnessIdx >= 0 ? args[harnessIdx + 1] : null;

// Lowest Node we know everything else assumes (template literals, fs.promises,
// Optional chaining are all 14+; we use 16-only APIs in run-spec-headless,
// so floor at 16).
const NODE_MAJOR_FLOOR = 16;

const checks = [];
function record(name, ok, detail) {
  checks.push({ name, ok: !!ok, detail: detail || "" });
}

// 1. Node version
{
  const m = /^v(\d+)\./.exec(process.version);
  const major = m ? Number(m[1]) : 0;
  record(
    "node-version",
    major >= NODE_MAJOR_FLOOR,
    `${process.version} (need >= v${NODE_MAJOR_FLOOR})`
  );
}

// 2. Project root sanity
{
  const indexHtml = path.join(ROOT, "index.html");
  record(
    "index-html-present",
    fs.existsSync(indexHtml),
    indexHtml
  );
}

// 3. tools/lib/version-floor.js loadable
{
  try {
    const lib = require("./lib/version-floor");
    record(
      "version-floor-loadable",
      typeof lib.compareVersion === "function" && lib.compareVersion("20260101-1", "20260101-2") < 0,
      "compareVersion sanity passes"
    );
  } catch (err) {
    record("version-floor-loadable", false, err.message);
  }
}

// 4. Static checks all parse (node --check on each)
{
  const checkFiles = fs.readdirSync(path.join(ROOT, "tools"))
    .filter((f) => f.startsWith("check-") && f.endsWith(".js"))
    .map((f) => path.join("tools", f));
  const failed = [];
  for (const rel of checkFiles) {
    const r = cp.spawnSync(process.execPath, ["--check", rel], { cwd: ROOT });
    if (r.status !== 0) failed.push(`${rel}: ${(r.stderr || "").toString().trim().split("\n")[0]}`);
  }
  record(
    "check-scripts-parse",
    failed.length === 0,
    failed.length === 0 ? `${checkFiles.length} files parse OK` : failed.join(" | ")
  );
}

// 5. Browser-side runner parses
{
  const browserRunner = path.join(ROOT, "tools", "test-runner-browser.js");
  if (!fs.existsSync(browserRunner)) {
    record("browser-runner-present", false, browserRunner);
  } else {
    const r = cp.spawnSync(process.execPath, ["--check", browserRunner], { cwd: ROOT });
    record(
      "browser-runner-parses",
      r.status === 0,
      r.status === 0 ? "test-runner-browser.js parses" : (r.stderr || "").toString().trim()
    );
  }
}

// 6. Test spec parser runs in --validate mode
{
  const specRunner = path.join("tools", "test-spec-runner.js");
  const r = cp.spawnSync(process.execPath, [specRunner, "--validate"], { cwd: ROOT });
  record(
    "test-spec-valid",
    r.status === 0,
    r.status === 0 ? "test-spec-master.md is well-formed" : (r.stderr || r.stdout || "").toString().trim()
  );
}

// 7. Artifact dirs writable (will be used by run-checks --runlog later, but
//    create on first doctor run so downstream tools never have to mkdir).
{
  const runs = path.join(ROOT, "runs");
  try {
    if (!fs.existsSync(runs)) fs.mkdirSync(runs, { recursive: true });
    const probe = path.join(runs, ".doctor-write-probe");
    fs.writeFileSync(probe, "ok");
    fs.unlinkSync(probe);
    record("runs-dir-writable", true, runs);
  } catch (err) {
    record("runs-dir-writable", false, err.message);
  }
}

// 8. Optional: external d:\harness doctor (target = this checkout via the
//    claude-ref profile shipped by the harness, when present)
if (harnessPath) {
  const harnessDoctor = path.join(harnessPath, "harness_doctor.py");
  if (!fs.existsSync(harnessDoctor)) {
    record("harness-doctor", false, `not found: ${harnessDoctor}`);
  } else {
    const claudeRefProfile = path.join(harnessPath, "examples", "targets", "claude-ref", "harness.profile.json");
    const cmd = ["python", [harnessDoctor]];
    if (fs.existsSync(claudeRefProfile)) {
      cmd[1].push("--profile", claudeRefProfile);
    } else {
      // Fallback: point at this checkout directly so harness_doctor has a target.
      cmd[1].push("--target", ROOT, "--target-name", "claude");
    }
    const r = cp.spawnSync(cmd[0], cmd[1], { cwd: harnessPath });
    const out = ((r.stdout || "") + (r.stderr || "")).toString();
    record(
      "harness-doctor",
      r.status === 0,
      r.status === 0 ? "harness doctor ok" : out.trim().split("\n").slice(-3).join(" | ")
    );
  }
}

// ── Output ────────────────────────────────────────────────────────────────
const allOk = checks.every((c) => c.ok);

if (wantJson) {
  process.stdout.write(JSON.stringify({ ok: allOk, checks }, null, 2) + "\n");
} else {
  process.stdout.write("DOCTOR (d:\\claude)\n");
  process.stdout.write(`ok: ${allOk}\n`);
  for (const c of checks) {
    const tag = c.ok ? "PASS" : "FAIL";
    process.stdout.write(`  [${tag}] ${c.name} — ${c.detail}\n`);
  }
  if (!allOk) {
    process.stdout.write("\nDoctor red. Read the FAIL lines above; fix the most foundational one first\n");
    process.stdout.write("(node-version → index-html → check scripts → browser runner).\n");
  }
}
process.exit(allOk ? 0 : 1);
