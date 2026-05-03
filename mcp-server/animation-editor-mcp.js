#!/usr/bin/env node
// MCP server for the 2D animation editor.
//
// Architecture:
//   stdio JSON-RPC 2.0 (MCP)  <-->  this process  <-->  headless Chromium (Playwright)
//                                                            └── loads index.html
//                                                            └── window.ai is the tool surface
//
// Design choices:
//   - Persistent Chromium across MCP requests so animation state is preserved
//     between tool calls (the AI is doing iterative editing).
//   - Tool list is fetched live from window.ai.tools() at MCP initialize time,
//     so any palette command added to the editor automatically becomes an MCP
//     tool — zero changes here.
//   - Static server is bundled (no need for the user to launch python -m http.server).
//
// Usage:
//   node mcp-server/animation-editor-mcp.js [--repo PATH] [--port PORT]
//
//   Add to Claude Code:
//     claude mcp add anim-editor -- node /abs/path/to/mcp-server/animation-editor-mcp.js --repo /abs/path/to/d-claude
//
// Spec compatibility: implements the subset of MCP 2024-11-05 needed for
// tool listing + invocation. No prompts, no resources, no streaming.

const path = require("path");
const fs = require("fs");
const http = require("http");
const { chromium } = require("playwright");

// -- CLI args -----------------------------------------------------------------
function parseArgs() {
  const out = { repo: path.resolve(__dirname, ".."), port: 0 };
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--repo") out.repo = path.resolve(argv[++i]);
    else if (argv[i] === "--port") out.port = Number(argv[++i]) || 0;
  }
  return out;
}

// -- Static server (so we don't need python -m http.server) -------------------
function startStaticServer(repoRoot, port) {
  const types = {
    ".html": "text/html", ".js": "application/javascript",
    ".css": "text/css", ".json": "application/json",
    ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml",
    ".wasm": "application/wasm", ".map": "application/json",
  };
  const server = http.createServer((req, res) => {
    const url = decodeURIComponent(req.url.split("?")[0]);
    let p = path.join(repoRoot, url === "/" ? "/index.html" : url);
    if (!p.startsWith(repoRoot)) { res.statusCode = 403; return res.end("forbidden"); }
    fs.stat(p, (err, st) => {
      if (err) { res.statusCode = 404; return res.end("not found"); }
      if (st.isDirectory()) p = path.join(p, "index.html");
      const ext = path.extname(p).toLowerCase();
      res.setHeader("Content-Type", types[ext] || "application/octet-stream");
      fs.createReadStream(p).pipe(res);
    });
  });
  return new Promise((r, rej) => {
    server.on("error", rej);
    server.listen(port, "127.0.0.1", () => r(server));
  });
}

// -- Editor session -----------------------------------------------------------
class EditorSession {
  constructor(repoRoot, port) { this.repoRoot = repoRoot; this.port = port; }
  async start() {
    this.staticServer = await startStaticServer(this.repoRoot, this.port);
    const addr = this.staticServer.address();
    this.origin = `http://127.0.0.1:${addr.port}`;
    this.browser = await chromium.launch();
    this.ctx = await this.browser.newContext();
    this.page = await this.ctx.newPage();
    // Surface page errors as MCP server logs (stderr — never stdout, that's the JSON-RPC channel)
    this.page.on("pageerror", (e) => process.stderr.write(`[editor pageerror] ${e.message}\n`));
    this.page.on("console", (m) => {
      if (m.type() === "error") process.stderr.write(`[editor console.error] ${m.text()}\n`);
    });
    await this.page.goto(this.origin + "/index.html");
    await this.page.waitForFunction(() => !!window.ai && typeof state !== "undefined", { timeout: 15000 });
  }
  async tools() {
    return await this.page.evaluate(() => window.ai.tools());
  }
  async invoke(id, args) {
    return await this.page.evaluate(([id, args]) => window.ai.invoke(id, args), [id, args || {}]);
  }
  async query(domain) {
    return await this.page.evaluate((d) => window.ai.query(d), domain || null);
  }
  async stop() {
    if (this.browser) await this.browser.close().catch(() => {});
    if (this.staticServer) this.staticServer.close();
  }
}

// -- MCP protocol -------------------------------------------------------------
// Translate window.ai's arg schema into MCP's JSON Schema for inputSchema.
function argsToInputSchema(argDefs) {
  const properties = {};
  const required = [];
  for (const a of argDefs || []) {
    let jsType = "string";
    if (a.type === "number") jsType = "number";
    else if (a.type === "integer") jsType = "integer";
    else if (a.type === "boolean") jsType = "boolean";
    else if (a.type === "object") jsType = "object";
    properties[a.name] = { type: jsType };
    if (a.description) properties[a.name].description = a.description;
    if (a.required) required.push(a.name);
  }
  return { type: "object", properties, required };
}

function toolToMcp(t) {
  return {
    name: t.id,
    description: `${t.label}${t.group ? ` (${t.group})` : ""}${t.hotkey ? ` [hotkey: ${t.hotkey}]` : ""}`,
    inputSchema: argsToInputSchema(t.args),
  };
}

class MCPServer {
  constructor(session) { this.session = session; this.toolCache = null; }

  async handleInitialize(params) {
    return {
      protocolVersion: "2024-11-05",
      capabilities: { tools: { listChanged: false } },
      serverInfo: { name: "animation-editor-mcp", version: "0.1.0" },
    };
  }

  async handleToolsList() {
    const tools = await this.session.tools();
    this.toolCache = tools;
    return { tools: tools.map(toolToMcp) };
  }

  async handleToolsCall(params) {
    const name = params && params.name;
    const args = (params && params.arguments) || {};
    if (!name) throw new Error("missing tool name");
    const result = await this.session.invoke(name, args);
    // MCP tool responses use a `content` array. We return one text block of
    // structured JSON so the LLM can both read it and parse if needed.
    // Strip the dataUrl from screenshot results — large blobs blow up context.
    // The caller can ask for another invocation with explicit "include image" flag in future.
    const compact = compactInvocationResult(result);
    return {
      content: [{ type: "text", text: JSON.stringify(compact, null, 2) }],
      isError: !result.ok,
    };
  }

  async handle(message) {
    const id = message.id;
    const method = message.method;
    try {
      let result;
      if (method === "initialize") result = await this.handleInitialize(message.params);
      else if (method === "initialized" || method === "notifications/initialized") return null; // notification, no response
      else if (method === "tools/list") result = await this.handleToolsList(message.params);
      else if (method === "tools/call") result = await this.handleToolsCall(message.params);
      else if (method === "ping") result = {};
      else if (method === "shutdown") { result = {}; setTimeout(() => process.exit(0), 50); }
      else throw new RpcError(-32601, `method not found: ${method}`);
      return { jsonrpc: "2.0", id, result };
    } catch (err) {
      const code = err instanceof RpcError ? err.code : -32603;
      return { jsonrpc: "2.0", id, error: { code, message: err.message || String(err) } };
    }
  }
}

class RpcError extends Error {
  constructor(code, msg) { super(msg); this.code = code; }
}

function compactInvocationResult(result) {
  if (!result || typeof result !== "object") return result;
  const compact = { ...result };
  // Replace screenshot dataUrl with size summary so we don't flood the LLM
  if (compact.result && typeof compact.result === "object" && typeof compact.result.dataUrl === "string") {
    const url = compact.result.dataUrl;
    const m = /^data:([^;]+);base64,(.*)$/.exec(url);
    const bytes = m ? Math.floor(m[2].length * 3 / 4) : url.length;
    compact.result = { ...compact.result, dataUrl: `<base64 ${m ? m[1] : "?"} ${bytes}B omitted>` };
  }
  // Same for capture before/after (large objects)
  if (compact.before) compact.before = "<snapshot omitted>";
  if (compact.after) compact.after = "<snapshot omitted>";
  return compact;
}

// -- stdio framing ------------------------------------------------------------
async function runStdio(server) {
  let buffer = "";
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", async (chunk) => {
    buffer += chunk;
    let nl;
    while ((nl = buffer.indexOf("\n")) >= 0) {
      const line = buffer.slice(0, nl).trim();
      buffer = buffer.slice(nl + 1);
      if (!line) continue;
      let msg;
      try { msg = JSON.parse(line); } catch (_) {
        process.stderr.write(`[mcp] bad json: ${line.slice(0, 200)}\n`);
        continue;
      }
      const resp = await server.handle(msg);
      if (resp) process.stdout.write(JSON.stringify(resp) + "\n");
    }
  });
  process.stdin.on("end", () => process.exit(0));
}

// -- main ---------------------------------------------------------------------
async function main() {
  const args = parseArgs();
  const session = new EditorSession(args.repo, args.port);
  await session.start();
  process.stderr.write(`[mcp] editor ready at ${session.origin}\n`);
  const server = new MCPServer(session);
  await runStdio(server);
}

main().catch((err) => { process.stderr.write(`[mcp] fatal: ${err.stack || err.message}\n`); process.exit(1); });
