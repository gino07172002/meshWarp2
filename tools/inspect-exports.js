// Inspect the actual exported files in D:/newExport/, sample frames out of
// the GIF and PNG-zip so we can confirm visually that the animation moves.
"use strict";

const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const OUT = "D:/newExport";

function summarizeGif(buf) {
  if (buf.length < 13) return { error: "too small" };
  const magic = String.fromCharCode(...buf.slice(0, 6));
  const sw = buf[6] | (buf[7] << 8);
  const sh = buf[8] | (buf[9] << 8);
  let pos = 13;
  if (buf[10] & 0x80) pos += 3 * (1 << ((buf[10] & 0x07) + 1));
  let frames = 0;
  let loopCount = null;
  let firstDelay = null;
  let transparentFlag = false;
  let disposalSeen = -1;
  while (pos < buf.length) {
    const tag = buf[pos++];
    if (tag === 0x3b) break;
    if (tag === 0x21) {
      const label = buf[pos++];
      if (label === 0xf9 && buf[pos] === 0x04) {
        const packed = buf[pos + 1];
        const delay = buf[pos + 2] | (buf[pos + 3] << 8);
        if (firstDelay === null) firstDelay = delay;
        transparentFlag = transparentFlag || ((packed & 0x01) === 1);
        disposalSeen = (packed >> 2) & 0x07;
      } else if (label === 0xff) {
        if (buf[pos] === 0x0b) {
          const id = String.fromCharCode(...buf.slice(pos + 1, pos + 12));
          if (id.startsWith("NETSCAPE")) {
            // sub-block: 03 01 LL LL  -> loop count
            const sb = buf[pos + 12];
            if (sb === 3) loopCount = buf[pos + 14] | (buf[pos + 15] << 8);
          }
        }
      }
      // skip sub-blocks
      while (pos < buf.length) {
        const n = buf[pos++];
        if (n === 0) break;
        pos += n;
      }
      continue;
    }
    if (tag === 0x2c) {
      frames += 1;
      pos += 8;
      const packed = buf[pos++];
      if (packed & 0x80) pos += 3 * (1 << ((packed & 0x07) + 1));
      pos += 1; // LZW min code size
      while (pos < buf.length) {
        const n = buf[pos++];
        if (n === 0) break;
        pos += n;
      }
    }
  }
  return { magic, w: sw, h: sh, frames, firstDelayCs: firstDelay, loopCount, transparentFlag, disposalSeen };
}

function summarizeWebP(buf) {
  if (buf.length < 12) return { error: "too small" };
  const riff = String.fromCharCode(...buf.slice(0, 4));
  const webp = String.fromCharCode(...buf.slice(8, 12));
  if (riff !== "RIFF" || webp !== "WEBP") return { error: "not webp" };
  let pos = 12;
  const chunks = [];
  let vp8x = null;
  let anmfCount = 0;
  let firstDuration = null;
  let loops = null;
  while (pos + 8 <= buf.length) {
    const fcc = String.fromCharCode(...buf.slice(pos, pos + 4));
    const size = buf[pos + 4] | (buf[pos + 5] << 8) | (buf[pos + 6] << 16) | (buf[pos + 7] << 24);
    chunks.push({ fcc, size });
    if (fcc === "VP8X") {
      const flags = buf[pos + 8];
      const w = (buf[pos + 12] | (buf[pos + 13] << 8) | (buf[pos + 14] << 16)) + 1;
      const h = (buf[pos + 15] | (buf[pos + 16] << 8) | (buf[pos + 17] << 16)) + 1;
      vp8x = { flags, w, h, animation: (flags & 0x02) !== 0, alpha: (flags & 0x10) !== 0 };
    } else if (fcc === "ANIM") {
      loops = buf[pos + 8 + 4] | (buf[pos + 8 + 5] << 8);
    } else if (fcc === "ANMF") {
      anmfCount += 1;
      if (firstDuration === null) {
        // ANMF payload: X(3) Y(3) W(3) H(3) Duration(3) ...
        firstDuration = buf[pos + 8 + 12] | (buf[pos + 8 + 13] << 8) | (buf[pos + 8 + 14] << 16);
      }
    }
    pos += 8 + size + (size & 1);
  }
  return { vp8x, anmfCount, firstDurationMs: firstDuration, loops, chunks: chunks.map((c) => c.fcc) };
}

function summarizeWebM(buf) {
  // Just check EBML header magic.
  const magic = buf.slice(0, 4).toString("hex");
  return { ebml: magic === "1a45dfa3", size: buf.length };
}

function summarizeZip(buf) {
  // Find EOCD
  let eocd = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65535 - 22); i -= 1) {
    if (buf[i] === 0x50 && buf[i + 1] === 0x4b && buf[i + 2] === 0x05 && buf[i + 3] === 0x06) { eocd = i; break; }
  }
  if (eocd < 0) return { error: "no EOCD" };
  const total = buf[eocd + 10] | (buf[eocd + 11] << 8);
  const cdOff = buf[eocd + 16] | (buf[eocd + 17] << 8) | (buf[eocd + 18] << 16) | (buf[eocd + 19] << 24);

  const entries = [];
  let p = cdOff;
  for (let i = 0; i < total; i += 1) {
    if (buf[p] !== 0x50 || buf[p + 1] !== 0x4b || buf[p + 2] !== 0x01 || buf[p + 3] !== 0x02) break;
    const nameLen = buf[p + 28] | (buf[p + 29] << 8);
    const extraLen = buf[p + 30] | (buf[p + 31] << 8);
    const commentLen = buf[p + 32] | (buf[p + 33] << 8);
    const compSize = buf[p + 20] | (buf[p + 21] << 8) | (buf[p + 22] << 16) | (buf[p + 23] << 24);
    const uncompSize = buf[p + 24] | (buf[p + 25] << 8) | (buf[p + 26] << 16) | (buf[p + 27] << 24);
    const localHdr = buf[p + 42] | (buf[p + 43] << 8) | (buf[p + 44] << 16) | (buf[p + 45] << 24);
    const name = buf.slice(p + 46, p + 46 + nameLen).toString("utf8");
    entries.push({ name, compSize, uncompSize, localHdr });
    p += 46 + nameLen + extraLen + commentLen;
  }
  return { entryCount: total, entries: entries.slice(0, 4), lastEntries: entries.slice(-2), allCount: entries.length };
}

function extractFirstPngFromZip(buf, outFile) {
  // Find local file headers (PK\x03\x04). Method must be 0 (store) per our writer.
  let off = 0;
  while (off + 30 <= buf.length) {
    if (buf[off] === 0x50 && buf[off + 1] === 0x4b && buf[off + 2] === 0x03 && buf[off + 3] === 0x04) {
      const method = buf[off + 8] | (buf[off + 9] << 8);
      const compSize = buf[off + 18] | (buf[off + 19] << 8) | (buf[off + 20] << 16) | (buf[off + 21] << 24);
      const nameLen = buf[off + 26] | (buf[off + 27] << 8);
      const extraLen = buf[off + 28] | (buf[off + 29] << 8);
      const name = buf.slice(off + 30, off + 30 + nameLen).toString("utf8");
      const dataStart = off + 30 + nameLen + extraLen;
      let data = buf.slice(dataStart, dataStart + compSize);
      if (method === 8) data = zlib.inflateRawSync(data);
      fs.writeFileSync(outFile, data);
      return { ok: true, name, bytes: data.length };
    }
    off += 1;
  }
  return { ok: false };
}

const files = {
  gif: path.join(OUT, "portrait_gif_Anim_1.gif"),
  webm: path.join(OUT, "portrait_webm_Anim_1.webm"),
  pngseq: path.join(OUT, "portrait_pngseq_Anim_1.zip"),
  webp: path.join(OUT, "portrait_webp_Anim_1.webp"),
};

console.log("=== Inspecting D:/newExport/ outputs ===\n");
for (const [fmt, file] of Object.entries(files)) {
  if (!fs.existsSync(file)) { console.log(`${fmt}: MISSING ${file}`); continue; }
  const buf = fs.readFileSync(file);
  const sz = (buf.length / 1024).toFixed(1);
  let info;
  if (fmt === "gif") info = summarizeGif(buf);
  else if (fmt === "webp") info = summarizeWebP(buf);
  else if (fmt === "webm") info = summarizeWebM(buf);
  else info = summarizeZip(buf);
  console.log(`${fmt.padEnd(7)} ${sz.padStart(8)} KB  ${file}`);
  console.log("        " + JSON.stringify(info));
}

// Extract first PNG from the zip so the user can visually see the rendered frame.
console.log("\n=== Extract first frame from pngseq.zip ===");
const zipBuf = fs.readFileSync(files.pngseq);
const ex = extractFirstPngFromZip(zipBuf, path.join(OUT, "preview_frame_0001.png"));
console.log(ex);
