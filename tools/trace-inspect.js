#!/usr/bin/env node
// Local consumer for d:\harness trace JSON files.
//
// d:\harness owns the trace format. This tool just reads traces and asks the
// questions a target-side maintainer needs to answer without rebooting the
// harness toolchain:
//
//   - What pointer interactions actually reached which selectors?
//   - Are there "dead-end clicks" (pointerdown/pointerup landing on a target
//     but no click event firing)? This is the fingerprint of the
//     workspaceTabObject bug (trace 20260501T060902560215Z).
//   - For a given selector, what does the DOM probe history look like over
//     time (e.g. did .disabled change after import)?
//
// Usage:
//   node tools/trace-inspect.js <trace.json>
//   node tools/trace-inspect.js <trace.json> --selector '#workspaceTabObject'
//   node tools/trace-inspect.js <trace.json> --dead-end-clicks
//   node tools/trace-inspect.js <trace.json> --dom-state '#workspaceTabObject' [--field disabled]
//   node tools/trace-inspect.js <trace.json> --json   # JSON for any of the above
//
// Exit codes:
//   0 if trace was parseable and (for --dead-end-clicks) no dead ends found.
//   1 if dead ends were found in --dead-end-clicks mode (so CI can use it).
//   2 on usage / parse error.

const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
function flag(name) { return args.includes(name); }
function flagValue(name, fallback = null) {
  const i = args.indexOf(name);
  return i >= 0 && i + 1 < args.length ? args[i + 1] : fallback;
}

if (flag("-h") || flag("--help") || args.length === 0) {
  process.stdout.write([
    "Usage: node tools/trace-inspect.js <trace.json> [mode] [--json]",
    "",
    "Modes (default = summary):",
    "  --selector <id-or-#id>          show pointerdown/up/click sequence for that target",
    "  --dead-end-clicks               list selectors with pointerdown/up >= 3 and click = 0",
    "  --partial-drops                 list selectors where some pointerdowns produced no click",
    "                                  (click < min(pointerdown,pointerup), with pointerdown >= 2)",
    "  --dom-state <id-or-#id> [--field <name>]   show DOM probe history for that selector",
    "",
    "Common: --json   emit machine-readable output",
  ].join("\n") + "\n");
  process.exit(args.length === 0 ? 2 : 0);
}

const tracePath = args.find((a) => !a.startsWith("--") && (a.endsWith(".json")));
if (!tracePath) {
  process.stderr.write("trace-inspect: pass the path to a trace .json as the first positional argument\n");
  process.exit(2);
}

let trace;
try {
  trace = JSON.parse(fs.readFileSync(tracePath, "utf8"));
} catch (err) {
  process.stderr.write(`trace-inspect: failed to read/parse ${tracePath}: ${err.message}\n`);
  process.exit(2);
}

const events = Array.isArray(trace.events) ? trace.events : [];
const snapshots = Array.isArray(trace.snapshots) ? trace.snapshots : [];

function normalizeSelector(s) {
  // Accept both "workspaceTabObject" and "#workspaceTabObject"; the latter is
  // also what selectorHint usually carries.
  return s && s[0] === "#" ? s : "#" + s;
}
function eventTargetId(ev) {
  return (ev.target && (ev.target.id || (ev.target.selectorHint || "").replace(/^#/, ""))) || "";
}
function isReplayablePointerEvent(t) {
  return t === "pointerdown" || t === "pointerup" || t === "click";
}

const wantJson = flag("--json");

// ── Mode dispatch ─────────────────────────────────────────────────────────
const selectorArg = flagValue("--selector");
const wantDeadEnds = flag("--dead-end-clicks");
const wantPartialDrops = flag("--partial-drops");
const domStateArg = flagValue("--dom-state");
const domStateField = flagValue("--field");

if (wantDeadEnds) {
  process.exit(runDeadEndClicks() ? 1 : 0);
} else if (wantPartialDrops) {
  process.exit(runPartialDrops() ? 1 : 0);
} else if (selectorArg) {
  runSelectorTimeline(selectorArg);
} else if (domStateArg) {
  runDomStateTimeline(domStateArg, domStateField);
} else {
  runSummary();
}

// ── Modes ─────────────────────────────────────────────────────────────────
function runSummary() {
  const types = {};
  for (const ev of events) types[ev.type] = (types[ev.type] || 0) + 1;
  const targetCounts = {};
  for (const ev of events) {
    if (!isReplayablePointerEvent(ev.type)) continue;
    const id = eventTargetId(ev);
    if (!id) continue;
    const bucket = targetCounts[id] || (targetCounts[id] = { pointerdown: 0, pointerup: 0, click: 0 });
    bucket[ev.type] = (bucket[ev.type] || 0) + 1;
  }
  const summary = {
    trace: path.basename(tracePath),
    session: trace.session && trace.session.id,
    target: trace.session && trace.session.targetName,
    events: events.length,
    snapshots: snapshots.length,
    eventTypes: types,
    pointerInteractions: targetCounts,
  };
  if (wantJson) {
    process.stdout.write(JSON.stringify(summary, null, 2) + "\n");
    return;
  }
  process.stdout.write(`Trace: ${summary.trace}\n`);
  process.stdout.write(`  session: ${summary.session || "?"}  target: ${summary.target || "?"}\n`);
  process.stdout.write(`  events: ${summary.events}  snapshots: ${summary.snapshots}\n`);
  process.stdout.write(`  event types: ${JSON.stringify(types)}\n`);
  process.stdout.write(`  pointer interactions per selector:\n`);
  const ids = Object.keys(targetCounts).sort();
  for (const id of ids) {
    const c = targetCounts[id];
    process.stdout.write(`    #${id.padEnd(28)} down=${String(c.pointerdown).padStart(3)}  up=${String(c.pointerup).padStart(3)}  click=${String(c.click).padStart(3)}\n`);
  }
}

function runSelectorTimeline(selRaw) {
  const selector = normalizeSelector(selRaw);
  const targetId = selector.slice(1);
  const rows = [];
  for (const ev of events) {
    if (!isReplayablePointerEvent(ev.type)) continue;
    if (eventTargetId(ev) !== targetId) continue;
    rows.push({
      time: ev.time,
      type: ev.type,
      x: ev.pointer && ev.pointer.x,
      y: ev.pointer && ev.pointer.y,
      button: ev.pointer && ev.pointer.button,
    });
  }
  if (wantJson) {
    process.stdout.write(JSON.stringify({ selector, rows }, null, 2) + "\n");
    return;
  }
  process.stdout.write(`Selector ${selector} — ${rows.length} pointer events\n`);
  for (const r of rows) {
    process.stdout.write(
      `  t=${String(r.time).padStart(9)}  ${r.type.padEnd(13)}  xy=(${r.x},${r.y})  btn=${r.button}\n`
    );
  }
}

function runDeadEndClicks() {
  // "Dead end" = pointerdown >= 3 AND pointerup >= 3 AND click == 0 on the
  // same selector. Matches the workspaceTabObject failure trace fingerprint.
  const targetCounts = {};
  for (const ev of events) {
    if (!isReplayablePointerEvent(ev.type)) continue;
    const id = eventTargetId(ev);
    if (!id) continue;
    const bucket = targetCounts[id] || (targetCounts[id] = { pointerdown: 0, pointerup: 0, click: 0 });
    bucket[ev.type] = (bucket[ev.type] || 0) + 1;
  }
  const findings = [];
  for (const id of Object.keys(targetCounts)) {
    const c = targetCounts[id];
    if (c.pointerdown >= 3 && c.pointerup >= 3 && c.click === 0) {
      findings.push({ selector: "#" + id, ...c });
    }
  }
  if (wantJson) {
    process.stdout.write(JSON.stringify({ deadEnds: findings }, null, 2) + "\n");
  } else if (findings.length === 0) {
    process.stdout.write("No dead-end click patterns found.\n");
  } else {
    process.stdout.write(`Dead-end click patterns: ${findings.length}\n`);
    for (const f of findings) {
      process.stdout.write(
        `  ${f.selector}: pointerdown=${f.pointerdown}  pointerup=${f.pointerup}  click=${f.click}\n`
      );
    }
    process.stdout.write(
      "\nThis is the fingerprint of the workspaceTabObject bug — pointer events landed,\n" +
      "but no click ever fired, usually because the element was disabled or replaced\n" +
      "between down and up. Cross-check with --dom-state <selector> --field disabled.\n"
    );
  }
  return findings.length > 0;
}

function runPartialDrops() {
  // "Partial drop" = pointerdown >= 2 AND click < min(pointerdown, pointerup).
  // Some clicks succeeded, some did not. This is the early-warning version of
  // the dead-end pattern: the same disabled-button bug class (or any element
  // that is briefly re-rendered or covered by an overlay) shows up here long
  // before reaching the 26/26/0 extreme. Real example, harness trace
  // 20260501T024533859151Z.json had #workspaceTabObject 4/4/2 — two of the
  // four downpresses produced no click at all.
  //
  // We deliberately exclude noisy targets (`#div`, `#span`, `#button`) from
  // the warning UI: those selectors come from harness's selectorHint default
  // when the real element id is empty, so down/up vs click ratios on them
  // mostly track focus/dropdown closing, not bug fingerprints.
  const NOISY_GENERIC = new Set(["div", "span", "button"]);
  const targetCounts = {};
  for (const ev of events) {
    if (!isReplayablePointerEvent(ev.type)) continue;
    const id = eventTargetId(ev);
    if (!id) continue;
    const bucket = targetCounts[id] || (targetCounts[id] = { pointerdown: 0, pointerup: 0, click: 0 });
    bucket[ev.type] = (bucket[ev.type] || 0) + 1;
  }
  const findings = [];
  for (const id of Object.keys(targetCounts)) {
    const c = targetCounts[id];
    if (c.pointerdown < 2) continue;
    const expectedClicks = Math.min(c.pointerdown, c.pointerup);
    if (c.click >= expectedClicks) continue;
    if (c.click === 0) continue; // dead-end already covered by other mode
    if (NOISY_GENERIC.has(id)) continue;
    findings.push({
      selector: "#" + id,
      pointerdown: c.pointerdown,
      pointerup: c.pointerup,
      click: c.click,
      dropped: expectedClicks - c.click,
    });
  }
  // Sort highest drop-rate first so a human eye lands on the worst offenders.
  findings.sort((a, b) => (b.dropped / b.pointerdown) - (a.dropped / a.pointerdown));
  if (wantJson) {
    process.stdout.write(JSON.stringify({ partialDrops: findings }, null, 2) + "\n");
  } else if (findings.length === 0) {
    process.stdout.write("No partial-drop click patterns found.\n");
  } else {
    process.stdout.write(`Partial-drop click patterns: ${findings.length}\n`);
    for (const f of findings) {
      process.stdout.write(
        `  ${f.selector}: pointerdown=${f.pointerdown} pointerup=${f.pointerup} click=${f.click} (dropped=${f.dropped})\n`
      );
    }
    process.stdout.write(
      "\nSome pointer events on these targets produced no click. Common causes:\n" +
      "  - element briefly disabled / re-rendered between down and up\n" +
      "  - overlay or modal intercepted the up\n" +
      "  - drag threshold consumed the gesture\n" +
      "Cross-check with --dom-state <selector> --field disabled (or .classes) to confirm.\n"
    );
  }
  return findings.length > 0;
}

function runDomStateTimeline(selRaw, fieldRaw) {
  const selector = normalizeSelector(selRaw);
  const field = fieldRaw || null;
  const rows = [];
  let last = null;
  for (const snap of snapshots) {
    const probeElements =
      (snap.passive && snap.passive.dom && snap.passive.dom.value && snap.passive.dom.value.elements) ||
      [];
    const found = probeElements.find((e) => e && e.selector === selector);
    if (!found) continue;
    let value;
    if (field) value = found[field];
    else value = { disabled: found.disabled, classes: found.classes, visible: found.visible };
    const sig = JSON.stringify(value);
    if (sig === last) continue;
    last = sig;
    rows.push({
      time: snap.time,
      reason: snap.reason,
      value,
    });
  }
  if (wantJson) {
    process.stdout.write(JSON.stringify({ selector, field, rows }, null, 2) + "\n");
    return;
  }
  process.stdout.write(`DOM probe timeline for ${selector}${field ? "." + field : ""} (deduped):\n`);
  if (rows.length === 0) {
    process.stdout.write("  (no DOM probe data found — was passiveProbes.domSelectors set in the profile?)\n");
    return;
  }
  for (const r of rows) {
    process.stdout.write(`  t=${String(r.time).padStart(9)}  reason=${r.reason || "?"}  value=${JSON.stringify(r.value)}\n`);
  }
}
