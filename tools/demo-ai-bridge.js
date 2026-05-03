// Demo: contrast a Playwright agent driving the editor via raw DOM
// against the same agent using window.ai. Both flows do the same thing:
//
//   1. Open the editor
//   2. Discover the available actions
//   3. Switch to skeleton mode
//   4. Open the command palette
//   5. Read the live state
//
// Run with: node tools/demo-ai-bridge.js
// Requires: a static server on http://127.0.0.1:5173 serving the repo.

const { chromium } = require("playwright");
const { spawn } = require("child_process");
const path = require("path");
const http = require("http");

const PORT = 5174;
const ORIGIN = `http://127.0.0.1:${PORT}`;

function startStaticServer() {
  // Tiny static server so we don't need python on the demo path.
  const fs = require("fs");
  const root = path.resolve(__dirname, "..");
  const types = {
    ".html": "text/html", ".js": "application/javascript",
    ".css": "text/css", ".json": "application/json",
    ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml",
    ".wasm": "application/wasm", ".map": "application/json",
  };
  const server = http.createServer((req, res) => {
    const url = decodeURIComponent(req.url.split("?")[0]);
    let p = path.join(root, url === "/" ? "/index.html" : url);
    if (!p.startsWith(root)) { res.statusCode = 403; return res.end("forbidden"); }
    fs.stat(p, (err, st) => {
      if (err) { res.statusCode = 404; return res.end("not found"); }
      if (st.isDirectory()) p = path.join(p, "index.html");
      const ext = path.extname(p).toLowerCase();
      res.setHeader("Content-Type", types[ext] || "application/octet-stream");
      fs.createReadStream(p).pipe(res);
    });
  });
  return new Promise((resolve) => server.listen(PORT, "127.0.0.1", () => resolve(server)));
}

function divider(title) {
  console.log("\n" + "=".repeat(70));
  console.log(" " + title);
  console.log("=".repeat(70));
}

async function flowRawDom(page) {
  divider("FLOW A — raw DOM driving (the 'just use Playwright' baseline)");

  // The agent has no map of the app. It has to discover the UI.
  console.log("\n[A1] Scanning visible buttons / selects to find skeleton mode toggle...");
  const buttons = await page.$$eval("button, select", (els) =>
    els.slice(0, 80).map((el) => ({
      tag: el.tagName,
      id: el.id,
      text: (el.innerText || el.value || "").trim().slice(0, 40),
    })).filter((e) => e.id || e.text)
  );
  console.log(`    -> got ${buttons.length} candidate elements; agent must guess which is "skeleton mode"`);

  // Real Playwright code an agent would have to write per app:
  console.log("\n[A2] Trying #editMode select with hard-coded value 'skeleton'...");
  const beforeMode = await page.evaluate(() => state.editMode);
  await page.selectOption("#editMode", "skeleton").catch(() => {});
  const afterMode = await page.evaluate(() => state.editMode);
  console.log(`    -> editMode: ${beforeMode} -> ${afterMode}`);

  // Open command palette: agent has to know it's Ctrl+K, or find a button
  console.log("\n[A3] Pressing Ctrl+K to open command palette (hard-coded hotkey)...");
  await page.keyboard.press("Control+k");
  await page.waitForTimeout(120);
  const paletteOpen = await page.evaluate(() => state.commandPalette && state.commandPalette.open);
  console.log(`    -> palette open: ${paletteOpen}`);
  await page.keyboard.press("Escape");

  // Read state: agent has to know that 'state' is a global
  console.log("\n[A4] Reading state via raw window.state walk...");
  const peek = await page.evaluate(() => ({
    slots: state.slots ? state.slots.length : 0,
    editMode: state.editMode,
    hasMesh: !!state.mesh,
  }));
  console.log("    ->", peek);

  console.log("\n[A] Verdict: works, but every step needs app-specific knowledge:");
  console.log("    - the right CSS selector ('#editMode')");
  console.log("    - the right value string ('skeleton')");
  console.log("    - the hotkey ('Ctrl+K')");
  console.log("    - the global state shape (state.editMode, state.slots)");
  console.log("    - no observability of WHY a click did or did not work");
}

async function flowAIBridge(page) {
  divider("FLOW B — window.ai (the auto-generated agent surface)");

  // Step 1: discovery is one call, returns a structured catalog
  console.log("\n[B1] ai.help() — agent learns the whole tool surface in one call");
  const help = await page.evaluate(() => window.ai.help());
  console.log(`    -> ${help.toolCount} tools, domains: ${Object.keys(help.domains).join(", ")}`);
  console.log("    -> example domain 'Mode':");
  for (const t of (help.domains.app || []).filter((t) => t.id.startsWith("mode."))) {
    console.log(`         ${t.id.padEnd(28)} ${t.label}`);
  }

  // Step 2: invoke by id, no DOM knowledge needed
  console.log("\n[B2] ai.invoke('mode.skeleton') — semantic id, not a CSS selector");
  const r = await page.evaluate(() => window.ai.invoke("mode.skeleton"));
  console.log(`    -> ${JSON.stringify({ ok: r.ok, durationMs: r.durationMs, error: r.error })}`);

  // Step 3: invoke a command WITH structured args (this is the bridge's value-add)
  console.log("\n[B3] ai.invoke('ai.set_animation_time', { time: 0.25 })");
  const tr = await page.evaluate(() => window.ai.invoke("ai.set_animation_time", { time: 0.25 }));
  console.log("    ->", JSON.stringify({ ok: tr.ok, result: tr.result, durationMs: tr.durationMs }));
  console.log("    -> Note: bridge wrapped this in pushUndoCheckpoint + AI Capture domain snapshot.");

  // Step 4: structured query, not a state walk
  console.log("\n[B4] ai.query('snapshot') — single read, normalized shape");
  const q = await page.evaluate(() => window.ai.query("snapshot"));
  console.log("    ->", JSON.stringify(q.debug || q.app || q));

  // Step 5: invariants
  console.log("\n[B5] ai.invariants() — runs every domain's self-check");
  const issues = await page.evaluate(() => window.ai.invariants());
  console.log(`    -> ${issues.length} issue(s) found`);

  // Step 6: error handling is uniform — bad arg comes back as ok:false, not exception
  console.log("\n[B6] Bad invocation returns structured error (no try/catch dance)");
  const bad = await page.evaluate(() => window.ai.invoke("ai.set_animation_time", { time: "oops" }));
  console.log("    ->", JSON.stringify(bad));

  // Step 7: bad tool id
  const bad2 = await page.evaluate(() => window.ai.invoke("not.a.real.tool"));
  console.log("    ->", JSON.stringify(bad2));

  console.log("\n[B] Verdict: every step is one structured call. The agent never sees DOM,");
  console.log("    never hard-codes selectors, never guesses hotkeys, never walks globals.");
  console.log("    When the editor adds a new palette command, the tool catalog grows for free.");
}

async function autoExtensionDemo(page) {
  divider("FLOW C — auto-extension proof");

  console.log("\n[C1] Agent injects a NEW tool at runtime via window.aiBridgeExtraTools.");
  console.log("     This simulates 'a future feature got added' — bridge picks it up,");
  console.log("     no edit to runtime-ai-bridge.js needed.");

  await page.evaluate(() => {
    window.aiBridgeExtraTools = [{
      id: "demo.echo",
      label: "Demo: Echo",
      group: "Demo",
      hotkey: "",
      domain: "demo",
      source: "demo",
      args: [{ name: "msg", type: "string", required: true }],
    }];
  });

  const before = await page.evaluate(() => window.ai.help().toolCount);
  console.log(`    -> tool count before / after: depends on registry; current = ${before}`);
  const tools = await page.evaluate(() => window.ai.tools({ domain: "demo" }));
  console.log("    -> tools in domain 'demo':", tools.map((t) => t.id));
}

async function main() {
  const server = await startStaticServer();
  const browser = await chromium.launch();
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  page.on("pageerror", (e) => console.error("[pageerror]", e.message));
  page.on("console", (m) => {
    if (m.type() === "error") console.error("[browser:error]", m.text());
  });

  page.on("console", (m) => {
    if (m.type() !== "error") return;
    console.error("[browser]", m.type(), m.text());
  });
  await page.goto(ORIGIN + "/index.html");
  // Bootstrap takes a moment; bridge is built synchronously at script load
  try {
    await page.waitForFunction(() => !!window.ai && typeof state !== "undefined", { timeout: 8000 });
  } catch (e) {
    const probe = await page.evaluate(() => ({
      hasAi: !!window.ai,
      hasState: typeof state !== "undefined",
      hasDebug: !!window.debug,
      readyState: document.readyState,
    }));
    console.error("waitForFunction failed; probe:", probe);
    throw e;
  }
  console.log("Editor loaded. window.ai installed.");

  await flowRawDom(page);
  await flowAIBridge(page);
  await autoExtensionDemo(page);

  divider("DONE");
  await browser.close();
  server.close();
}

main().catch((err) => { console.error(err); process.exit(1); });
