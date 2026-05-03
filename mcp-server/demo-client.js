// Demo MCP client — pretends to be Claude Code talking to our server.
// Walks the full lifecycle:
//   1. spawn the MCP server
//   2. initialize handshake
//   3. tools/list (proves dynamic tool registration works)
//   4. tools/call several times (proves stateful editing works)
//
// Run with: node mcp-server/demo-client.js

const { spawn } = require("child_process");
const path = require("path");

class StdioClient {
  constructor(child) {
    this.child = child;
    this.nextId = 1;
    this.pending = new Map();
    this.buf = "";
    child.stdout.setEncoding("utf8");
    child.stdout.on("data", (s) => {
      this.buf += s;
      let nl;
      while ((nl = this.buf.indexOf("\n")) >= 0) {
        const line = this.buf.slice(0, nl).trim();
        this.buf = this.buf.slice(nl + 1);
        if (!line) continue;
        let msg;
        try { msg = JSON.parse(line); } catch (_) { continue; }
        const r = this.pending.get(msg.id);
        if (r) {
          this.pending.delete(msg.id);
          if (msg.error) r.reject(new Error(msg.error.message || "rpc error"));
          else r.resolve(msg.result);
        }
      }
    });
    child.stderr.on("data", (s) => process.stderr.write(`[server] ${s}`));
  }
  request(method, params) {
    const id = this.nextId++;
    const msg = { jsonrpc: "2.0", id, method, params: params || {} };
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.child.stdin.write(JSON.stringify(msg) + "\n");
    });
  }
  notify(method, params) {
    const msg = { jsonrpc: "2.0", method, params: params || {} };
    this.child.stdin.write(JSON.stringify(msg) + "\n");
  }
  close() { this.child.kill(); }
}

function divider(t) {
  console.log("\n" + "=".repeat(70) + "\n " + t + "\n" + "=".repeat(70));
}

// 64x64 PNG generated at runtime
function makeTestPngDataUrl() {
  const zlib = require("zlib");
  const W = 64, H = 64;
  const raw = Buffer.alloc(H * (1 + W * 4));
  for (let y = 0; y < H; y += 1) {
    raw[y * (1 + W * 4)] = 0;
    for (let x = 0; x < W; x += 1) {
      const o = y * (1 + W * 4) + 1 + x * 4;
      raw[o] = 0x40; raw[o + 1] = 0xc0; raw[o + 2] = 0xff; raw[o + 3] = 0xff;
    }
  }
  function chunk(type, data) {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
    const t = Buffer.from(type, "ascii");
    const crcBuf = Buffer.concat([t, data]);
    let c = ~0;
    for (let i = 0; i < crcBuf.length; i += 1) {
      c ^= crcBuf[i];
      for (let k = 0; k < 8; k += 1) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
    }
    const crc = Buffer.alloc(4); crc.writeUInt32BE((~c) >>> 0, 0);
    return Buffer.concat([len, t, data, crc]);
  }
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const idat = zlib.deflateSync(raw);
  const png = Buffer.concat([sig, chunk("IHDR", ihdr), chunk("IDAT", idat), chunk("IEND", Buffer.alloc(0))]);
  return "data:image/png;base64," + png.toString("base64");
}

async function main() {
  const serverPath = path.resolve(__dirname, "animation-editor-mcp.js");
  const child = spawn(process.execPath, [serverPath], { stdio: ["pipe", "pipe", "pipe"] });
  const client = new StdioClient(child);

  divider("HANDSHAKE — initialize");
  const init = await client.request("initialize", {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "demo-client", version: "0.1.0" },
  });
  console.log("  serverInfo:", init.serverInfo);
  console.log("  capabilities:", JSON.stringify(init.capabilities));
  client.notify("notifications/initialized");

  divider("TOOL DISCOVERY — tools/list (live from window.ai.tools)");
  const list = await client.request("tools/list");
  console.log(`  total tools advertised: ${list.tools.length}`);
  console.log("  sample (first 10):");
  for (const t of list.tools.slice(0, 10)) {
    const argList = Object.keys(t.inputSchema.properties || {});
    console.log(`    ${t.name.padEnd(28)} args=[${argList.join(",") || "-"}]`);
  }
  console.log("  ... (full list omitted)");
  console.log(`\n  bridge-owned (ai.*) tools:`);
  for (const t of list.tools.filter((t) => t.name.startsWith("ai."))) {
    const argList = Object.keys(t.inputSchema.properties || {});
    console.log(`    ${t.name.padEnd(28)} args=[${argList.join(",") || "-"}]`);
  }

  divider("TOOL CALL #1 — ai.import_image (synthesise project)");
  const impR = await client.request("tools/call", {
    name: "ai.import_image",
    arguments: { dataUrl: makeTestPngDataUrl(), name: "synth.png" },
  });
  console.log("  ->", impR.content[0].text);

  divider("TOOL CALL #2 — mode.skeleton (palette command, no args)");
  const modeR = await client.request("tools/call", { name: "mode.skeleton", arguments: {} });
  console.log("  ->", modeR.content[0].text);

  divider("TOOL CALL #3 — ai.set_animation_time (mutation with arg validation)");
  const t1 = await client.request("tools/call", { name: "ai.set_animation_time", arguments: { time: 0.33 } });
  console.log("  ->", t1.content[0].text);

  divider("TOOL CALL #4 — ai.set_animation_time with bad arg (proves schema validation)");
  const tBad = await client.request("tools/call", { name: "ai.set_animation_time", arguments: { time: "oops" } });
  console.log("  isError:", tBad.isError);
  console.log("  ->", tBad.content[0].text);

  divider("TOOL CALL #5 — ai.screenshot (composite render)");
  const shotR = await client.request("tools/call", { name: "ai.screenshot", arguments: {} });
  console.log("  ->", shotR.content[0].text);

  divider("TOOL CALL #6 — ai.export_project_json (round-trippable)");
  const projR = await client.request("tools/call", { name: "ai.export_project_json", arguments: {} });
  // Just print the keys to keep output readable
  const projParsed = JSON.parse(projR.content[0].text);
  console.log("  ok:", projParsed.ok);
  if (projParsed.ok) {
    console.log("  result.data keys:", Object.keys(projParsed.result.data));
  }

  divider("TOOL CALL #7 — unknown tool (proves error path)");
  const badR = await client.request("tools/call", { name: "totally.fake.tool", arguments: {} });
  console.log("  isError:", badR.isError);
  console.log("  ->", badR.content[0].text);

  divider("STATE PERSISTENCE PROOF");
  console.log("  Same Chromium kept alive across all tool calls. Slot count after:");
  // sneak in a query via a tool call
  const curState = await client.request("tools/call", { name: "diag.run", arguments: {} });
  console.log("  diag.run ->", curState.content[0].text);

  divider("DONE");
  client.close();
}

main().catch((err) => { console.error(err); process.exit(1); });
