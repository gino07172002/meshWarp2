const { spawn } = require("child_process");
const path = require("path");
const zlib = require("zlib");

class StdioMcpClient {
  constructor(child) {
    this.child = child;
    this.nextId = 1;
    this.pending = new Map();
    this.buf = "";
    child.stdout.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      this.buf += chunk;
      let nl;
      while ((nl = this.buf.indexOf("\n")) >= 0) {
        const line = this.buf.slice(0, nl).trim();
        this.buf = this.buf.slice(nl + 1);
        if (!line) continue;
        let msg;
        try { msg = JSON.parse(line); } catch (_) { continue; }
        const pending = this.pending.get(msg.id);
        if (!pending) continue;
        this.pending.delete(msg.id);
        if (msg.error) pending.reject(new Error(msg.error.message || "rpc error"));
        else pending.resolve(msg.result);
      }
    });
    child.stderr.on("data", () => {});
  }

  request(method, params = {}) {
    const id = this.nextId++;
    const msg = { jsonrpc: "2.0", id, method, params };
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.child.stdin.write(JSON.stringify(msg) + "\n");
    });
  }

  notify(method, params = {}) {
    this.child.stdin.write(JSON.stringify({ jsonrpc: "2.0", method, params }) + "\n");
  }
}

function expect(condition, message) {
  if (!condition) throw new Error(message);
}

function parseToolText(result) {
  const text = result && result.content && result.content[0] ? result.content[0].text : "";
  return JSON.parse(text);
}

function makePngDataUrl() {
  const width = 32;
  const height = 32;
  const raw = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y += 1) {
    raw[y * (1 + width * 4)] = 0;
    for (let x = 0; x < width; x += 1) {
      const o = y * (1 + width * 4) + 1 + x * 4;
      raw[o] = 0x77;
      raw[o + 1] = 0xaa;
      raw[o + 2] = 0xff;
      raw[o + 3] = 0xff;
    }
  }
  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const t = Buffer.from(type, "ascii");
    const crcBuf = Buffer.concat([t, data]);
    let c = ~0;
    for (let i = 0; i < crcBuf.length; i += 1) {
      c ^= crcBuf[i];
      for (let k = 0; k < 8; k += 1) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
    }
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE((~c) >>> 0, 0);
    return Buffer.concat([len, t, data, crc]);
  }
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const png = Buffer.concat([sig, chunk("IHDR", ihdr), chunk("IDAT", zlib.deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]);
  return "data:image/png;base64," + png.toString("base64");
}

async function main() {
  const serverPath = path.resolve(__dirname, "..", "mcp-server", "animation-editor-mcp.js");
  const child = spawn(process.execPath, [serverPath], { stdio: ["pipe", "pipe", "pipe"] });
  const client = new StdioMcpClient(child);
  try {
    await client.request("initialize", {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: { name: "check-ai-bone-tools", version: "0.1.0" },
    });
    client.notify("notifications/initialized");

    const list = await client.request("tools/list");
    const ids = new Set(list.tools.map((t) => t.name));
    const required = ["ai.add_bone", "ai.set_bone", "ai.delete_bone", "ai.bind_slot_to_bone", "ai.list_bones"];
    for (const id of required) expect(ids.has(id), `missing MCP tool: ${id}`);

    await client.request("tools/call", {
      name: "ai.import_image",
      arguments: { dataUrl: makePngDataUrl(), name: "bone-tool.png" },
    });
    await client.request("tools/call", { name: "mode.skeleton", arguments: {} });
    await client.request("tools/call", { name: "mode.rig", arguments: {} });

    const added = parseToolText(await client.request("tools/call", {
      name: "ai.add_bone",
      arguments: {
        name: "root",
        parent: -1,
        connected: false,
        headX: 10,
        headY: 12,
        tailX: 10,
        tailY: 28,
      },
    }));
    expect(added.ok, "ai.add_bone should succeed");
    expect(added.result && added.result.bone && added.result.bone.name === "root", "added bone should be named root");

    const set = parseToolText(await client.request("tools/call", {
      name: "ai.set_bone",
      arguments: { index: added.result.index, name: "root_renamed", length: 24, rotation: 5 },
    }));
    expect(set.ok, "ai.set_bone should succeed");
    expect(set.result && set.result.bone && set.result.bone.name === "root_renamed", "set bone should rename");

    const bound = parseToolText(await client.request("tools/call", {
      name: "ai.bind_slot_to_bone",
      arguments: { slotIndex: 0, boneIndex: added.result.index },
    }));
    expect(bound.ok, "ai.bind_slot_to_bone should succeed");
    expect(bound.result && bound.result.slot && bound.result.slot.bone === added.result.index, "slot should bind to added bone");

    const listed = parseToolText(await client.request("tools/call", { name: "ai.list_bones", arguments: {} }));
    expect(listed.ok, "ai.list_bones should succeed");
    expect(listed.result && listed.result.bones.some((b) => b.name === "root_renamed"), "list should include renamed bone");

    console.log("check-ai-bone-tools: ok");
  } finally {
    child.kill();
  }
}

main().catch((err) => {
  console.error(`check-ai-bone-tools: ${err.message}`);
  process.exit(1);
});
