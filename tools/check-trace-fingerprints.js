#!/usr/bin/env node
// Trace-fingerprint regression check.
//
// d:\harness owns the trace format and golden traces for the harness itself.
// What this tool guards is the d:\claude side: the fingerprints that our
// trace-inspect.js detectors are supposed to recognize.
//
// Each *.fingerprint.json file in tools/golden/ pins:
//   - a path to a trace (synthetic, lives next to the fingerprint)
//   - the expected output of trace-inspect.js for that trace
//
// The check runs trace-inspect.js in --json mode against each trace and
// compares to the fingerprint's expectations. Two fixtures are shipped:
//
//   1. disabled-button-failure.synthetic.json + .fingerprint.json
//      — the workspaceTabObject failure fingerprint (must trip dead-end
//        detection; DOM probe must show disabled=true).
//
//   2. healthy-claude-trace.synthetic.json + .fingerprint.json
//      — negative control (must NOT trip dead-end; disabled=false).
//
// This file is auto-discovered by tools/run-checks.js because it follows
// the check-*.js naming convention.

const fs = require("fs");
const path = require("path");
const cp = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const GOLDEN = path.join(ROOT, "tools", "golden");
const INSPECT = path.join(ROOT, "tools", "trace-inspect.js");

const failures = [];

function inspect(args) {
  const r = cp.spawnSync(process.execPath, [INSPECT, ...args], { cwd: ROOT, encoding: "utf8" });
  // trace-inspect exits 1 for --dead-end-clicks when matches found; that's
  // not an error from the regression-check's perspective. Surface stderr only
  // when stdout is unparseable.
  let parsed = null;
  try { parsed = JSON.parse(r.stdout); } catch (_e) {
    return { error: `non-JSON output (status=${r.status}): ${(r.stderr || r.stdout || "").slice(0, 240)}` };
  }
  return { value: parsed, status: r.status };
}

function checkFingerprint(fpPath) {
  const fpName = path.basename(fpPath);
  let fp;
  try {
    fp = JSON.parse(fs.readFileSync(fpPath, "utf8"));
  } catch (err) {
    failures.push(`${fpName}: cannot parse fingerprint: ${err.message}`);
    return;
  }
  if (!fp.trace || typeof fp.trace !== "string") {
    failures.push(`${fpName}: missing 'trace' field`);
    return;
  }
  const tracePath = path.resolve(ROOT, fp.trace);
  if (!fs.existsSync(tracePath)) {
    failures.push(`${fpName}: trace file not found at ${fp.trace}`);
    return;
  }

  const expectedDeadEnds = (fp.expect && fp.expect.deadEndClicks) || [];

  // 1. Dead-end clicks
  const deadEndsRes = inspect([tracePath, "--dead-end-clicks", "--json"]);
  if (deadEndsRes.error) {
    failures.push(`${fpName}: dead-end inspect error: ${deadEndsRes.error}`);
  } else {
    const actual = deadEndsRes.value.deadEnds || [];
    if (expectedDeadEnds.length === 0 && actual.length > 0) {
      failures.push(`${fpName}: expected no dead-end clicks, got ${actual.length}: ${JSON.stringify(actual)}`);
    } else if (expectedDeadEnds.length > 0) {
      // Each expected entry must be matched by some actual entry that
      // satisfies the lower-bounds.
      for (const exp of expectedDeadEnds) {
        const m = actual.find((a) => a.selector === exp.selector);
        if (!m) {
          failures.push(`${fpName}: missing dead-end entry for ${exp.selector}`);
          continue;
        }
        if (typeof exp.pointerdownAtLeast === "number" && m.pointerdown < exp.pointerdownAtLeast) {
          failures.push(`${fpName}: ${exp.selector} pointerdown=${m.pointerdown} < ${exp.pointerdownAtLeast}`);
        }
        if (typeof exp.pointerupAtLeast === "number" && m.pointerup < exp.pointerupAtLeast) {
          failures.push(`${fpName}: ${exp.selector} pointerup=${m.pointerup} < ${exp.pointerupAtLeast}`);
        }
        if (typeof exp.clickExactly === "number" && m.click !== exp.clickExactly) {
          failures.push(`${fpName}: ${exp.selector} click=${m.click} != ${exp.clickExactly}`);
        }
      }
    }
  }

  // 2. Partial drops (early-warning fingerprint for the same bug class).
  const expectedPartial = (fp.expect && fp.expect.partialDrops) || [];
  const partialRes = inspect([tracePath, "--partial-drops", "--json"]);
  if (partialRes.error) {
    failures.push(`${fpName}: partial-drops inspect error: ${partialRes.error}`);
  } else {
    const actual = partialRes.value.partialDrops || [];
    if (expectedPartial.length === 0 && actual.length > 0) {
      failures.push(`${fpName}: expected no partial drops, got ${actual.length}: ${JSON.stringify(actual)}`);
    } else if (expectedPartial.length > 0) {
      for (const exp of expectedPartial) {
        const m = actual.find((a) => a.selector === exp.selector);
        if (!m) {
          failures.push(`${fpName}: missing partial-drop entry for ${exp.selector}`);
          continue;
        }
        if (typeof exp.pointerdownAtLeast === "number" && m.pointerdown < exp.pointerdownAtLeast) {
          failures.push(`${fpName}: ${exp.selector} pointerdown=${m.pointerdown} < ${exp.pointerdownAtLeast}`);
        }
        if (typeof exp.pointerupAtLeast === "number" && m.pointerup < exp.pointerupAtLeast) {
          failures.push(`${fpName}: ${exp.selector} pointerup=${m.pointerup} < ${exp.pointerupAtLeast}`);
        }
        if (typeof exp.clickExactly === "number" && m.click !== exp.clickExactly) {
          failures.push(`${fpName}: ${exp.selector} click=${m.click} != ${exp.clickExactly}`);
        }
        if (typeof exp.droppedAtLeast === "number" && m.dropped < exp.droppedAtLeast) {
          failures.push(`${fpName}: ${exp.selector} dropped=${m.dropped} < ${exp.droppedAtLeast}`);
        }
      }
    }
  }

  // 3. DOM state at capture (first probe row)
  const expectedProbes = (fp.expect && fp.expect.domStateAtCapture) || [];
  for (const probe of expectedProbes) {
    const r = inspect([tracePath, "--dom-state", probe.selector, "--field", probe.field, "--json"]);
    if (r.error) {
      failures.push(`${fpName}: dom-state inspect error for ${probe.selector}.${probe.field}: ${r.error}`);
      continue;
    }
    const rows = (r.value && r.value.rows) || [];
    if (rows.length === 0) {
      failures.push(`${fpName}: dom-state for ${probe.selector}.${probe.field} is empty (probe missing in trace?)`);
      continue;
    }
    if (rows[0].value !== probe.value) {
      failures.push(
        `${fpName}: dom-state ${probe.selector}.${probe.field} expected ${JSON.stringify(probe.value)}, got ${JSON.stringify(rows[0].value)}`
      );
    }
  }
}

if (!fs.existsSync(GOLDEN)) {
  process.stdout.write("trace-fingerprint check: tools/golden/ does not exist (skipping).\n");
  process.exit(0);
}

const fingerprints = fs.readdirSync(GOLDEN)
  .filter((f) => f.endsWith(".fingerprint.json"))
  .map((f) => path.join(GOLDEN, f));

if (fingerprints.length === 0) {
  process.stdout.write("trace-fingerprint check: no *.fingerprint.json files (skipping).\n");
  process.exit(0);
}

for (const fp of fingerprints) checkFingerprint(fp);

if (failures.length > 0) {
  process.stderr.write(failures.join("\n") + "\n");
  process.exit(1);
}

process.stdout.write(`Trace fingerprint check passed (${fingerprints.length} fingerprint(s)).\n`);
