#!/usr/bin/env node
// Headless functional runner for d:\claude.
//
// Wave-1 had:
//   - tools/test-spec-runner.js   parse the spec into recipes
//   - tools/test-runner-browser.js  execute recipes inside a live editor page
//
// The gap was that step 2 required a human to open Chrome, paste recipes
// into DevTools, and read [PASS]/[FAIL] by eye. CI couldn't run it. Wave 2
// closes that loop: spawn a static server, drive Chromium via Playwright,
// inject the existing browser runner, run AUTO recipes, collect results.
//
// Why we use the real browser (not jsdom):
//   The editor instantiates WebGL, ImageBitmap, OffscreenCanvas, and dozens
//   of DOM-API surface that jsdom doesn't implement. Faking them is more
//   work than just using a real Chromium that already ships in Playwright.
//
// Usage:
//   node tools/run-spec-headless.js                          # all AUTO recipes
//   node tools/run-spec-headless.js --filter weight-         # by id substring
//   node tools/run-spec-headless.js --recipe import-image    # exact-id match (substring still works if unique)
//   node tools/run-spec-headless.js --port 6189              # pin server port
//   node tools/run-spec-headless.js --headed                 # show the browser (debugging)
//   node tools/run-spec-headless.js --json                   # machine summary
//   node tools/run-spec-headless.js --runlog                 # write runs/run-spec-headless-*.jsonl
//   node tools/run-spec-headless.js --no-invariants          # skip the post-recipe DOM-state check
//
// Exit codes:
//   0 — every recipe passed (or was SKIP) and no invariant violations
//   1 — at least one recipe failed
//   2 — usage / setup error (Playwright missing, server didn't start, etc.)

const fs = require("fs");
const http = require("http");
const path = require("path");
const cp = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const args = process.argv.slice(2);

function flag(name) { return args.includes(name); }
function flagValue(name, fallback = null) {
  const i = args.indexOf(name);
  return i >= 0 && i + 1 < args.length ? args[i + 1] : fallback;
}

if (flag("-h") || flag("--help")) {
  process.stdout.write([
    "Usage:",
    "  node tools/run-spec-headless.js [--filter <substr>] [--recipe <id>] [--port N]",
    "                                  [--headed] [--json] [--runlog] [--no-invariants]",
    "",
    "Loads d:\\claude in Playwright Chromium, executes AUTO recipes from",
    "test-spec-master.md via the existing tools/test-runner-browser.js, and",
    "(by default) runs tools/dom-state-invariants.js after each recipe.",
    "Exit 0 = all recipes passed; 1 = a recipe failed; 2 = setup error.",
  ].join("\n") + "\n");
  process.exit(0);
}

const filter = flagValue("--filter");
const recipeId = flagValue("--recipe");
const port = Number(flagValue("--port")) || 0; // 0 = OS-assigned
const headed = flag("--headed");
const wantJson = flag("--json");
const wantRunlog = flag("--runlog");
const skipInvariants = flag("--no-invariants");

// ── Step 0: load Playwright lazily so missing dep gives a clear error ─────
let playwright;
try {
  playwright = require("playwright");
} catch (err) {
  process.stderr.write([
    "run-spec-headless: Playwright not installed.",
    "Install it once with:",
    "  npm i -D playwright",
    "  npx playwright install chromium",
    "",
    `(original error: ${err.message})`,
  ].join("\n") + "\n");
  process.exit(2);
}

// ── Step 1: parse recipes via the existing spec runner ────────────────────
const recipesJson = cp.spawnSync(
  process.execPath,
  [path.join("tools", "test-spec-runner.js"), "--json"],
  { cwd: ROOT, encoding: "utf8" }
);
if (recipesJson.status !== 0) {
  process.stderr.write(`run-spec-headless: test-spec-runner.js failed:\n${recipesJson.stderr || recipesJson.stdout}\n`);
  process.exit(2);
}
let recipes;
try {
  recipes = JSON.parse(recipesJson.stdout);
} catch (err) {
  process.stderr.write(`run-spec-headless: could not parse spec JSON: ${err.message}\n`);
  process.exit(2);
}
if (!Array.isArray(recipes)) {
  process.stderr.write(`run-spec-headless: spec JSON is not an array (got ${typeof recipes})\n`);
  process.exit(2);
}

// Filter
let selected = recipes.filter((r) => !r.manual_only);
if (recipeId) {
  selected = selected.filter((r) => r.id === recipeId || r.id.includes(recipeId));
}
if (filter) {
  selected = selected.filter((r) => r.id.includes(filter));
}
if (selected.length === 0) {
  process.stderr.write("run-spec-headless: no AUTO recipes match the given filters.\n");
  process.exit(2);
}

// ── Step 2: spin up a static HTTP server for the project root ────────────
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".wasm": "application/wasm",
};

function safeJoin(rootDir, urlPath) {
  // Block path traversal. Strip query, normalize, ensure inside root.
  const clean = urlPath.split("?")[0].split("#")[0];
  const decoded = decodeURIComponent(clean);
  const rel = decoded === "/" ? "/index.html" : decoded;
  const abs = path.normalize(path.join(rootDir, rel));
  if (!abs.startsWith(rootDir)) return null;
  return abs;
}

function serveRequest(req, res) {
  const filePath = safeJoin(ROOT, req.url);
  if (!filePath) {
    res.writeHead(403); res.end("forbidden"); return;
  }
  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      res.writeHead(404); res.end("not found"); return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      "Content-Type": MIME[ext] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    fs.createReadStream(filePath).pipe(res);
  });
}

const server = http.createServer(serveRequest);

function startServer() {
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, "127.0.0.1", () => {
      const addr = server.address();
      resolve(addr.port);
    });
  });
}

function stopServer() {
  return new Promise((resolve) => server.close(() => resolve()));
}

// ── Step 3: drive Playwright ──────────────────────────────────────────────
async function main() {
  const startedAt = Date.now();
  let serverPort;
  try {
    serverPort = await startServer();
  } catch (err) {
    process.stderr.write(`run-spec-headless: server failed to bind: ${err.message}\n`);
    process.exit(2);
  }

  const baseUrl = `http://127.0.0.1:${serverPort}/`;
  // Keep stdout JSON-clean when --json is set; route the address to stderr
  // so it's still visible without contaminating piped output.
  if (wantJson) process.stderr.write(`server: ${baseUrl}\n`);
  else process.stdout.write(`server: ${baseUrl}\n`);

  let browser;
  try {
    browser = await playwright.chromium.launch({ headless: !headed });
  } catch (err) {
    await stopServer();
    process.stderr.write(`run-spec-headless: Chromium launch failed: ${err.message}\n`);
    process.exit(2);
  }

  // One context per run (cheap), one page total.
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  // Surface page-side console.error / page errors so a failing recipe is
  // diagnosable without re-running --headed.
  const pageErrors = [];
  page.on("pageerror", (err) => pageErrors.push({ kind: "pageerror", message: err.message }));
  page.on("console", (msg) => {
    if (msg.type() === "error") pageErrors.push({ kind: "console.error", message: msg.text() });
  });

  try {
    await page.goto(baseUrl, { waitUntil: "load", timeout: 30000 });
    // Wait for the editor's globals to initialize. `state` / `els` are
    // top-level `const` declarations in classic <script>s, so they do NOT
    // attach to window. They ARE reachable as identifiers from page.evaluate.
    await page.waitForFunction(() => {
      try { return typeof state === "object" && state !== null && typeof els === "object" && els !== null; }
      catch (_e) { return false; }
    }, null, { timeout: 8000 });
  } catch (err) {
    await browser.close();
    await stopServer();
    process.stderr.write(`run-spec-headless: editor failed to load: ${err.message}\n`);
    process.exit(2);
  }

  // Inject the browser-side test runner + the invariant library + the
  // fixture-builder library. All three are shipped from disk so the headless
  // run cannot drift out of sync with what a human in DevTools would use.
  const browserRunnerSrc = fs.readFileSync(path.join(ROOT, "tools", "test-runner-browser.js"), "utf8");
  await page.addScriptTag({ content: browserRunnerSrc });
  const fixturesSrc = fs.readFileSync(path.join(ROOT, "tools", "headless-fixtures.js"), "utf8");
  await page.addScriptTag({ content: fixturesSrc });
  if (!skipInvariants) {
    const invariantSrc = fs.readFileSync(path.join(ROOT, "tools", "dom-state-invariants.js"), "utf8");
    await page.addScriptTag({ content: invariantSrc });
  }

  // Sanity: the runner installed itself.
  const runnerOk = await page.evaluate(() => typeof window.editorTestRunner === "object");
  if (!runnerOk) {
    await browser.close();
    await stopServer();
    process.stderr.write("run-spec-headless: editorTestRunner did not register on window.\n");
    process.exit(2);
  }

  // Run recipes one at a time so we can run an invariant pass between them.
  const results = [];
  for (const recipe of selected) {
    const t0 = Date.now();
    let fixtureError = null;
    let fixtureInfo = null;
    if (recipe.fixture && typeof recipe.fixture === "string") {
      try {
        fixtureInfo = await page.evaluate(async (name) => {
          if (!window.headlessFixtures) throw new Error("headlessFixtures not registered");
          return await window.headlessFixtures.apply(name);
        }, recipe.fixture);
      } catch (err) {
        fixtureError = `fixture "${recipe.fixture}" failed: ${err.message}`;
      }
    }
    let recipeResult;
    if (fixtureError) {
      recipeResult = { id: recipe.id, ok: false, errors: [fixtureError] };
    } else {
      try {
        recipeResult = await page.evaluate(async (r) => {
          return await window.editorTestRunner.runRecipe(r);
        }, recipe);
      } catch (err) {
        recipeResult = { id: recipe.id, ok: false, errors: [`recipe eval threw: ${err.message}`] };
      }
    }
    let invariantViolations = [];
    if (!skipInvariants) {
      const inv = await page.evaluate(() => {
        try {
          if (window.domStateInvariants && typeof window.domStateInvariants.check === "function") {
            return window.domStateInvariants.check();
          }
        } catch (e) { return { ok: false, error: String(e && e.message || e) }; }
        return null;
      });
      if (inv && Array.isArray(inv.violations)) invariantViolations = inv.violations;
    }
    const recipeOk =
      (recipeResult.ok === true || recipeResult.ok === null) && invariantViolations.length === 0;
    results.push({
      id: recipe.id,
      section: recipe.section,
      ok: recipeOk,
      skipped: recipeResult.skipped || null,
      durationMs: Date.now() - t0,
      verifyPass: recipeResult.verifyPass || 0,
      verifyFail: recipeResult.verifyFail || 0,
      errors: recipeResult.errors || [],
      invariantViolations,
      fixture: recipe.fixture || null,
      fixtureInfo: fixtureInfo || null,
    });
  }

  await browser.close();
  await stopServer();

  const totalMs = Date.now() - startedAt;
  const pass = results.filter((r) => r.ok && !r.skipped).length;
  const fail = results.filter((r) => !r.ok).length;
  const skipped = results.filter((r) => r.skipped).length;
  const summary = {
    ok: fail === 0,
    pass, fail, skipped,
    total: results.length,
    durationMs: totalMs,
    startedAt: new Date(startedAt).toISOString(),
    pageErrors,
  };

  if (wantJson) {
    process.stdout.write(JSON.stringify({ summary, results }, null, 2) + "\n");
  } else {
    for (const r of results) {
      const tag = r.skipped ? "SKIP" : r.ok ? "PASS" : "FAIL";
      process.stdout.write(`[${tag}] ${r.id.padEnd(46)} ${String(r.durationMs).padStart(5)}ms\n`);
      if (!r.ok && !r.skipped) {
        for (const e of r.errors.slice(0, 5)) process.stdout.write(`    ${e}\n`);
        for (const v of r.invariantViolations.slice(0, 5)) {
          process.stdout.write(`    invariant: ${v.id} — ${v.describe || v.message || v.kind}\n`);
        }
      }
    }
    process.stdout.write("\n");
    process.stdout.write(`Summary: ${pass} passed, ${fail} failed, ${skipped} skipped (${totalMs}ms)\n`);
    if (pageErrors.length > 0) {
      process.stdout.write(`Page errors observed: ${pageErrors.length}\n`);
      for (const e of pageErrors.slice(0, 5)) process.stdout.write(`  [${e.kind}] ${e.message}\n`);
    }
  }

  if (wantRunlog) {
    try {
      const RUNS = path.join(ROOT, "runs");
      if (!fs.existsSync(RUNS)) fs.mkdirSync(RUNS, { recursive: true });
      const stamp = new Date(startedAt).toISOString().replace(/[:.]/g, "-");
      const logPath = path.join(RUNS, `run-spec-headless-${stamp}.jsonl`);
      const lines = [
        JSON.stringify({ tool: "run-spec-headless", phase: "summary", ...summary }),
        ...results.map((r) => JSON.stringify({ tool: "run-spec-headless", phase: "recipe", ...r })),
      ];
      fs.writeFileSync(logPath, lines.join("\n") + "\n");
      if (!wantJson) process.stdout.write(`run log: ${path.relative(ROOT, logPath)}\n`);
    } catch (err) {
      process.stderr.write(`run-spec-headless: failed to write run log: ${err.message}\n`);
    }
  }

  process.exit(summary.ok ? 0 : 1);
}

main().catch((err) => {
  process.stderr.write(`run-spec-headless: unhandled error: ${err.stack || err.message || err}\n`);
  process.exit(2);
});
