// Demo / validation for export-animation-encoders.js
//
// Verifies pure encoders without a browser:
//   1. GIF89a magic, screen size, frame count, LZW min code size.
//   2. Animated WebP RIFF/WEBP, VP8X animation flag, ANIM, ANMF count, size.
//   3. ZIP central directory: entry count, file names, CRC32 round-trip.
//   4. Cross-format pixel sanity: GIF frame 0 vs frame 1 produce different
//      LZW payloads when the source frames differ (simulating a skeleton
//      animation: a vertical "bone" line shifted left -> right).
//
// Run: node tools/demo-export-animation.js
"use strict";

const path = require("path");
const enc = require(path.resolve(__dirname, "..", "app/ui/export-animation-encoders.js"));

function makeRGBAFrame(w, h, drawLineX) {
  // Solid black background, single white vertical bone at x=drawLineX
  const data = new Uint8Array(w * h * 4);
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const i = (y * w + x) * 4;
      const onLine = Math.abs(x - drawLineX) <= 0 && y > 4 && y < h - 4;
      data[i] = onLine ? 255 : 0;
      data[i + 1] = onLine ? 255 : 0;
      data[i + 2] = onLine ? 255 : 0;
      data[i + 3] = 255;
    }
  }
  return { data };
}

function makeMinimalStillWebPWithAlpha(width, height) {
  // Synthetic VP8X + ALPH + VP8  RIFF WebP for testing ALPH preservation
  // through the ANMF assembler. Payloads do not decode; the assembler only
  // re-wraps them, so structural correctness is what matters.
  const out = [];
  const pushFcc = (s) => { for (let i = 0; i < 4; i += 1) out.push(s.charCodeAt(i)); };
  const pushU32 = (v) => out.push(v & 0xff, (v >>> 8) & 0xff, (v >>> 16) & 0xff, (v >>> 24) & 0xff);
  function pushChunk(fourcc, payload) {
    pushFcc(fourcc);
    pushU32(payload.length);
    for (let i = 0; i < payload.length; i += 1) out.push(payload[i]);
    if (payload.length & 1) out.push(0);
  }
  pushFcc("RIFF");
  const sizeOffset = out.length;
  pushU32(0);
  pushFcc("WEBP");
  // VP8X payload (10 bytes): flags(1) + reserved(3) + (w-1)(3) + (h-1)(3)
  const w = (width - 1) & 0xffffff;
  const h = (height - 1) & 0xffffff;
  const vp8x = [
    0x10, 0, 0, 0,
    w & 0xff, (w >>> 8) & 0xff, (w >>> 16) & 0xff,
    h & 0xff, (h >>> 8) & 0xff, (h >>> 16) & 0xff,
  ];
  pushChunk("VP8X", vp8x);
  // ALPH: 1 byte flags + dummy alpha data
  pushChunk("ALPH", [0, 0, 0]);
  // VP8 bitstream with parseable width/height header
  const vp8 = [
    0x00, 0x00, 0x00,
    0x9d, 0x01, 0x2a,
    width & 0xff, (width >>> 8) & 0x3f,
    height & 0xff, (height >>> 8) & 0x3f,
  ];
  pushChunk("VP8 ", vp8);
  const inside = out.length - 8;
  out[sizeOffset] = inside & 0xff;
  out[sizeOffset + 1] = (inside >>> 8) & 0xff;
  out[sizeOffset + 2] = (inside >>> 16) & 0xff;
  out[sizeOffset + 3] = (inside >>> 24) & 0xff;
  return Uint8Array.from(out);
}

function makeMinimalStillWebP(width, height) {
  // Construct a minimal lossless VP8L still WebP for testing the WebP container
  // assembler (we don't need a real encoder — the assembler just copies the
  // inner VP8/VP8L chunk and wraps it with ANMF).
  //
  // VP8L bitstream:
  //   signature 0x2f
  //   14 bits (width - 1), 14 bits (height - 1), 1 bit alpha, 3 bits version
  //   then 1 bit "no transforms", then encoded LZ77+huffman data...
  //
  // Constructing a valid VP8L body is overkill — for ANMF wrapping our
  // assembler only reads width/height from VP8L header bytes. We hand-craft
  // a 5-byte minimal "VP8L" payload that won't actually decode but will
  // parse width/height correctly. parseStillWebP() only needs that for
  // dimension reporting; ANMF embeds the payload verbatim.
  const wm = (width - 1) & 0x3fff;
  const hm = (height - 1) & 0x3fff;
  const b0 = 0x2f;
  const b1 = wm & 0xff;
  const b2 = ((wm >> 8) & 0x3f) | ((hm & 0x03) << 6);
  const b3 = (hm >> 2) & 0xff;
  const b4 = ((hm >> 10) & 0x0f) | 0x00; // alpha=0, version=0
  const vp8lPayload = Uint8Array.from([b0, b1, b2, b3, b4]);

  const out = [];
  const fcc = (s) => { for (let i = 0; i < 4; i += 1) out.push(s.charCodeAt(i)); };
  const u32 = (v) => out.push(v & 0xff, (v >>> 8) & 0xff, (v >>> 16) & 0xff, (v >>> 24) & 0xff);
  fcc("RIFF");
  // size placeholder
  const sizeOffset = out.length;
  u32(0);
  fcc("WEBP");
  fcc("VP8L");
  u32(vp8lPayload.length);
  for (let i = 0; i < vp8lPayload.length; i += 1) out.push(vp8lPayload[i]);
  if (out.length & 1) out.push(0);
  // Patch RIFF size = total - 8
  const total = out.length;
  const inside = total - 8;
  out[sizeOffset] = inside & 0xff;
  out[sizeOffset + 1] = (inside >>> 8) & 0xff;
  out[sizeOffset + 2] = (inside >>> 16) & 0xff;
  out[sizeOffset + 3] = (inside >>> 24) & 0xff;
  return Uint8Array.from(out);
}

let failures = 0;
function readGifSubBlocks(bytes, pos) {
  const chunks = [];
  while (pos < bytes.length) {
    const n = bytes[pos++];
    if (n === 0) break;
    chunks.push(bytes.subarray(pos, pos + n));
    pos += n;
  }
  let total = 0;
  for (const c of chunks) total += c.length;
  const data = new Uint8Array(total);
  let off = 0;
  for (const c of chunks) { data.set(c, off); off += c.length; }
  return { data, pos };
}

function decodeGifLzwImageData(data, minCodeSize, expectedPixels) {
  const clearCode = 1 << minCodeSize;
  const endCode = clearCode + 1;
  let codeSize = minCodeSize + 1;
  let nextCode = endCode + 1;
  let bit = 0;
  let dict = [];
  let prev = null;
  const out = [];
  const reset = () => {
    dict = [];
    for (let i = 0; i < clearCode; i += 1) dict[i] = [i];
    dict[clearCode] = null;
    dict[endCode] = null;
    codeSize = minCodeSize + 1;
    nextCode = endCode + 1;
  };
  const readCode = () => {
    let code = 0;
    for (let i = 0; i < codeSize; i += 1) {
      const byte = data[bit >> 3];
      if (byte === undefined) throw new Error("truncated LZW stream");
      code |= ((byte >> (bit & 7)) & 1) << i;
      bit += 1;
    }
    return code;
  };
  reset();
  while (true) {
    const code = readCode();
    if (code === clearCode) {
      reset();
      prev = null;
      continue;
    }
    if (code === endCode) break;
    let entry;
    if (code < dict.length && dict[code]) entry = dict[code].slice();
    else if (code === nextCode && prev) entry = prev.concat(prev[0]);
    else throw new Error(`invalid LZW code ${code} (next=${nextCode}, size=${codeSize})`);
    out.push(...entry);
    if (prev) {
      dict[nextCode++] = prev.concat(entry[0]);
      if (nextCode === (1 << codeSize) && codeSize < 12) codeSize += 1;
    }
    prev = entry;
    if (out.length >= expectedPixels) break;
  }
  return out.length;
}

function validateGifLzwStreams(gif) {
  let pos = 13;
  if (gif[10] & 0x80) pos += 3 * (1 << ((gif[10] & 0x07) + 1));
  let frames = 0;
  while (pos < gif.length) {
    const tag = gif[pos++];
    if (tag === 0x3b) break;
    if (tag === 0x21) {
      pos += 1;
      pos = readGifSubBlocks(gif, pos).pos;
      continue;
    }
    if (tag !== 0x2c) throw new Error(`unexpected GIF block 0x${tag.toString(16)}`);
    const iw = gif[pos + 4] | (gif[pos + 5] << 8);
    const ih = gif[pos + 6] | (gif[pos + 7] << 8);
    pos += 8;
    const packed = gif[pos++];
    if (packed & 0x80) pos += 3 * (1 << ((packed & 0x07) + 1));
    const minCodeSize = gif[pos++];
    const blocks = readGifSubBlocks(gif, pos);
    const decoded = decodeGifLzwImageData(blocks.data, minCodeSize, iw * ih);
    if (decoded !== iw * ih) throw new Error(`decoded ${decoded} pixels, expected ${iw * ih}`);
    frames += 1;
    pos = blocks.pos;
  }
  return frames;
}

function check(name, cond, info) {
  if (cond) console.log(`PASS ${name}`);
  else {
    console.log(`FAIL ${name}${info ? " — " + info : ""}`);
    failures += 1;
  }
}

(function runGifTest() {
  const W = 32, H = 32, FPS = 10;
  const frames = [makeRGBAFrame(W, H, 8), makeRGBAFrame(W, H, 24)];
  const gif = enc.encodeGifFromImageDataFrames(frames, W, H, FPS);

  const magic = String.fromCharCode(gif[0], gif[1], gif[2], gif[3], gif[4], gif[5]);
  check("gif: magic GIF89a", magic === "GIF89a", `got ${magic}`);
  const sw = gif[6] | (gif[7] << 8);
  const sh = gif[8] | (gif[9] << 8);
  check("gif: screen width", sw === W);
  check("gif: screen height", sh === H);

  // Count image descriptors (byte 0x2C)
  let imgCount = 0;
  for (let i = 0; i < gif.length; i += 1) if (gif[i] === 0x2c) imgCount += 1;
  // Note: 0x2c may also appear in palette/data bytes coincidentally; for
  // robustness scan structurally: after the global header, walk blocks.
  // Simple heuristic: GIF89a + screen desc (7 bytes) + GCT (768 bytes) +
  // NETSCAPE app ext (~19 bytes). Frame count == 2 minimum is what we want.
  check("gif: at least 2 frames detected", imgCount >= 2, `count=${imgCount}`);

  const trailerByte = gif[gif.length - 1];
  check("gif: trailer 0x3B", trailerByte === 0x3b);

  // LZW min code size 0x08 should be present somewhere after each image descriptor
  // Image Descriptor = 0x2C + left(2) + top(2) + w(2) + h(2) + packed(1),
  // immediately followed by LZW min code size byte (= 0x08 here).
  let lzwHits = 0;
  for (let i = 0; i < gif.length - 10; i += 1) {
    if (gif[i] === 0x2c && gif[i + 10] === 0x08) lzwHits += 1;
  }
  check("gif: LZW min code size 8 after each frame", lzwHits >= 2, `hits=${lzwHits}`);

  try {
    const decodedFrames = validateGifLzwStreams(gif);
    check("gif: LZW streams decode all pixels", decodedFrames === frames.length, `frames=${decodedFrames}`);
  } catch (err) {
    check("gif: LZW streams decode all pixels", false, err && err.message ? err.message : String(err));
  }
})();

(function runWebPTest() {
  const W = 32, H = 32, FPS = 10, LOOP = 0;
  const f1 = makeMinimalStillWebP(W, H);
  const f2 = makeMinimalStillWebP(W, H);
  const webp = enc.encodeAnimatedWebPFromStillBlobs([f1, f2], W, H, FPS, LOOP);

  const riff = String.fromCharCode(webp[0], webp[1], webp[2], webp[3]);
  const head = String.fromCharCode(webp[8], webp[9], webp[10], webp[11]);
  check("webp: RIFF magic", riff === "RIFF", `got ${riff}`);
  check("webp: WEBP fourcc", head === "WEBP", `got ${head}`);

  // Walk chunks after byte 12
  let pos = 12;
  let vp8x = null, anim = null;
  let anmfCount = 0;
  const fourccs = [];
  while (pos + 8 <= webp.length) {
    const fcc = String.fromCharCode(webp[pos], webp[pos + 1], webp[pos + 2], webp[pos + 3]);
    const size = webp[pos + 4] | (webp[pos + 5] << 8) | (webp[pos + 6] << 16) | (webp[pos + 7] << 24);
    fourccs.push(fcc);
    if (fcc === "VP8X") vp8x = { pos, size, flags: webp[pos + 8] };
    else if (fcc === "ANIM") anim = { pos, size };
    else if (fcc === "ANMF") anmfCount += 1;
    pos += 8 + size + (size & 1);
  }
  check("webp: VP8X present", !!vp8x);
  check("webp: VP8X animation flag", vp8x && (vp8x.flags & 0x02) !== 0, `flags=${vp8x && vp8x.flags}`);
  check("webp: ANIM chunk present", !!anim);
  check("webp: ANMF count == 2", anmfCount === 2, `count=${anmfCount}, chunks=${fourccs.join(",")}`);

  // Canvas size from VP8X
  if (vp8x) {
    const wm = webp[vp8x.pos + 12] | (webp[vp8x.pos + 13] << 8) | (webp[vp8x.pos + 14] << 16);
    const hm = webp[vp8x.pos + 15] | (webp[vp8x.pos + 16] << 8) | (webp[vp8x.pos + 17] << 24 >>> 24);
    // Only 3 bytes, so:
    const hmFixed = webp[vp8x.pos + 15] | (webp[vp8x.pos + 16] << 8) | (webp[vp8x.pos + 17] << 16);
    check("webp: canvas width = 32", wm + 1 === W, `got ${wm + 1}`);
    check("webp: canvas height = 32", hmFixed + 1 === H, `got ${hmFixed + 1}`);
  }
})();

(function runZipTest() {
  const a = new Uint8Array([1, 2, 3, 4, 5]);
  const b = new Uint8Array([9, 9, 9]);
  const zip = enc.buildZipFromNamedParts([
    { name: "frame_0001.png", data: a },
    { name: "frame_0002.png", data: b },
  ]);

  // End of Central Directory record is at the end. Find signature 0x06054b50.
  let eocdPos = -1;
  for (let i = zip.length - 22; i >= 0; i -= 1) {
    if (zip[i] === 0x50 && zip[i + 1] === 0x4b && zip[i + 2] === 0x05 && zip[i + 3] === 0x06) {
      eocdPos = i;
      break;
    }
  }
  check("zip: EOCD signature found", eocdPos >= 0);
  if (eocdPos >= 0) {
    const total = zip[eocdPos + 10] | (zip[eocdPos + 11] << 8);
    check("zip: 2 entries in EOCD", total === 2, `got ${total}`);
  }

  // Local file header at offset 0
  check("zip: local file header at 0", zip[0] === 0x50 && zip[1] === 0x4b && zip[2] === 0x03 && zip[3] === 0x04);

  // CRC32 round-trip on first entry
  // Local header layout: sig(4) ver(2) flags(2) method(2) time(2) date(2) crc(4) ...
  const crcA = zip[14] | (zip[15] << 8) | (zip[16] << 16) | (zip[17] << 24);
  const expectedCrcA = enc.crc32OfBytes(a);
  check("zip: CRC32 of entry 0 matches", (crcA >>> 0) === (expectedCrcA >>> 0), `got ${crcA >>> 0} exp ${expectedCrcA >>> 0}`);
})();

(function runGifPixelDiffTest() {
  // Sanity: two different source frames should produce two different LZW
  // payloads. This proves the encoder actually used the per-frame data,
  // not just stamped a constant.
  const W = 16, H = 16;
  const fA = makeRGBAFrame(W, H, 4);
  const fB = makeRGBAFrame(W, H, 12);
  const gifA = enc.encodeGifFromImageDataFrames([fA, fA], W, H, 10);
  const gifB = enc.encodeGifFromImageDataFrames([fA, fB], W, H, 10);
  // Same length is fine; bytes must differ.
  let differ = false;
  const minLen = Math.min(gifA.length, gifB.length);
  for (let i = 0; i < minLen; i += 1) {
    if (gifA[i] !== gifB[i]) { differ = true; break; }
  }
  check("gif: frame content actually affects encoded bytes", differ || gifA.length !== gifB.length);
})();

(function runGifLzwBoundaryDecodeTest() {
  // This cycles through all 256 palette indices enough times to force GIF LZW
  // code-size growth past 9 bits. The stream must remain decodable by a
  // normal GIF LZW decoder, not merely have valid headers.
  const W = 64, H = 16;
  const data = new Uint8Array(W * H * 4);
  for (let i = 0; i < W * H; i += 1) {
    const idx = i & 0xff;
    const p = i * 4;
    data[p] = ((idx >> 5) & 0x07) * 255 / 7;
    data[p + 1] = ((idx >> 2) & 0x07) * 255 / 7;
    data[p + 2] = (idx & 0x03) * 255 / 3;
    data[p + 3] = 255;
  }
  const gif = enc.encodeGifFromImageDataFrames([{ data }, { data }], W, H, 10);
  try {
    const decodedFrames = validateGifLzwStreams(gif);
    check("gif: LZW code-size boundary stream decodes", decodedFrames === 2, `frames=${decodedFrames}`);
  } catch (err) {
    check("gif: LZW code-size boundary stream decodes", false, err && err.message ? err.message : String(err));
  }
})();

(function runGifTransparencyTest() {
  // Build a frame where left half is alpha=0 (transparent), right half opaque white.
  const W = 16, H = 8;
  function makeAlphaFrame() {
    const data = new Uint8Array(W * H * 4);
    for (let y = 0; y < H; y += 1) {
      for (let x = 0; x < W; x += 1) {
        const i = (y * W + x) * 4;
        const transparent = x < W / 2;
        data[i] = 255; data[i + 1] = 255; data[i + 2] = 255;
        data[i + 3] = transparent ? 0 : 255;
      }
    }
    return { data };
  }
  const frame = makeAlphaFrame();
  const gif = enc.encodeGifFromImageDataFrames([frame, frame], W, H, 10, 0, { transparent: true });

  // Find a Graphic Control Extension: 0x21 0xF9 0x04 [packed] [delay LE x2] [trans idx] 0x00
  let gceFound = false;
  let gceTransparentFlag = false;
  let gceDisposal = -1;
  let gceTransparentIdx = -1;
  for (let i = 0; i < gif.length - 7; i += 1) {
    if (gif[i] === 0x21 && gif[i + 1] === 0xf9 && gif[i + 2] === 0x04) {
      gceFound = true;
      const packed = gif[i + 3];
      gceDisposal = (packed >> 2) & 0x07;
      gceTransparentFlag = (packed & 0x01) === 0x01;
      gceTransparentIdx = gif[i + 6];
      break;
    }
  }
  check("gif transparent: GCE block present", gceFound);
  check("gif transparent: GCE transparent color flag = 1", gceTransparentFlag);
  check("gif transparent: GCE transparent color index = 0", gceTransparentIdx === 0, `got ${gceTransparentIdx}`);
  check("gif transparent: GCE disposal method = 2 (restore-to-background)", gceDisposal === 2, `got ${gceDisposal}`);

  // Opaque path should NOT set transparent flag.
  const gifOpaque = enc.encodeGifFromImageDataFrames([frame, frame], W, H, 10, 0);
  let opaqueTransparentFlag = true;
  for (let i = 0; i < gifOpaque.length - 7; i += 1) {
    if (gifOpaque[i] === 0x21 && gifOpaque[i + 1] === 0xf9 && gifOpaque[i + 2] === 0x04) {
      opaqueTransparentFlag = (gifOpaque[i + 3] & 0x01) === 0x01;
      break;
    }
  }
  check("gif opaque: transparent flag NOT set when transparent=false", !opaqueTransparentFlag);
})();

(function runGifLoopCountTest() {
  // GIF loop count is written as a 16-bit LE word at byte offset 16/17 of
  // the NETSCAPE2.0 application extension sub-block (3-byte sub-block:
  // index 0 = 0x01, indices 1-2 = loop count LE).
  const W = 8, H = 8;
  const frames = [makeRGBAFrame(W, H, 2), makeRGBAFrame(W, H, 5)];
  const gif7 = enc.encodeGifFromImageDataFrames(frames, W, H, 10, 7);
  const gif0 = enc.encodeGifFromImageDataFrames(frames, W, H, 10);

  function readLoopCount(gif) {
    // Find ASCII "NETSCAPE2.0"
    for (let i = 0; i + 11 < gif.length; i += 1) {
      let ok = true;
      const target = "NETSCAPE2.0";
      for (let j = 0; j < target.length; j += 1) {
        if (gif[i + j] !== target.charCodeAt(j)) { ok = false; break; }
      }
      if (ok) {
        // After "NETSCAPE2.0" (11 bytes): sub-block size (1) + 0x01 (1) + loop LE (2) + terminator (1)
        const subSize = gif[i + 11];
        const id = gif[i + 12];
        const lo = gif[i + 13];
        const hi = gif[i + 14];
        if (subSize === 0x03 && id === 0x01) return lo | (hi << 8);
      }
    }
    return -1;
  }
  check("gif: loop count = 7 written into NETSCAPE block", readLoopCount(gif7) === 7, `got ${readLoopCount(gif7)}`);
  check("gif: loop count default = 0 (infinite)", readLoopCount(gif0) === 0, `got ${readLoopCount(gif0)}`);
})();

(function runWebPAlphaPreservationTest() {
  const W = 32, H = 32;
  const alphaFrame = makeMinimalStillWebPWithAlpha(W, H);
  const webp = enc.encodeAnimatedWebPFromStillBlobs([alphaFrame, alphaFrame], W, H, 10, 0);

  // Walk top-level chunks. VP8X should have alpha bit (0x10) since input had it.
  let pos = 12;
  let vp8xFlags = -1;
  const anmfPayloads = [];
  while (pos + 8 <= webp.length) {
    const fcc = String.fromCharCode(webp[pos], webp[pos + 1], webp[pos + 2], webp[pos + 3]);
    const size = webp[pos + 4] | (webp[pos + 5] << 8) | (webp[pos + 6] << 16) | (webp[pos + 7] << 24);
    if (fcc === "VP8X") vp8xFlags = webp[pos + 8];
    else if (fcc === "ANMF") anmfPayloads.push(webp.subarray(pos + 8, pos + 8 + size));
    pos += 8 + size + (size & 1);
  }
  check("webp: VP8X alpha bit set when source frames have alpha", (vp8xFlags & 0x10) !== 0, `flags=${vp8xFlags}`);

  // Each ANMF payload: 16 bytes header (X/Y/W/H/Duration/flags) then frame chunks.
  // Frame chunks should contain "ALPH" fourcc before "VP8 ".
  let allFramesHaveAlph = anmfPayloads.length > 0;
  for (const p of anmfPayloads) {
    // Search "ALPH" and "VP8 " fourccs in the chunk stream (after 16-byte header).
    let hasAlph = false, hasVp8 = false, alphPos = -1, vp8Pos = -1;
    for (let i = 16; i + 4 <= p.length; i += 1) {
      const s = String.fromCharCode(p[i], p[i + 1], p[i + 2], p[i + 3]);
      if (s === "ALPH" && alphPos < 0) { hasAlph = true; alphPos = i; }
      if (s === "VP8 " && vp8Pos < 0) { hasVp8 = true; vp8Pos = i; }
    }
    if (!hasAlph || !hasVp8 || alphPos >= vp8Pos) { allFramesHaveAlph = false; break; }
  }
  check("webp: every ANMF embeds ALPH chunk before VP8 chunk", allFramesHaveAlph);
})();

(function runWebPAlphaFlagFalseForOpaqueTest() {
  // Opaque-only VP8L source: parseStillWebP treats VP8L as hasAlpha=true (per spec),
  // so VP8X should still set alpha. Use VP8 only (no ALPH) to test the opaque path.
  const W = 16, H = 16;
  const opaque = (function () {
    const out = [];
    const fcc = (s) => { for (let i = 0; i < 4; i += 1) out.push(s.charCodeAt(i)); };
    const u32 = (v) => out.push(v & 0xff, (v >>> 8) & 0xff, (v >>> 16) & 0xff, (v >>> 24) & 0xff);
    fcc("RIFF");
    const sz = out.length; u32(0);
    fcc("WEBP");
    // Plain VP8 still without VP8X (canvas.toBlob on opaque canvas typically does this).
    const vp8 = [0, 0, 0, 0x9d, 0x01, 0x2a,
      W & 0xff, (W >>> 8) & 0x3f, H & 0xff, (H >>> 8) & 0x3f, 0];
    fcc("VP8 "); u32(vp8.length);
    for (let i = 0; i < vp8.length; i += 1) out.push(vp8[i]);
    if (vp8.length & 1) out.push(0);
    const inside = out.length - 8;
    out[sz] = inside & 0xff; out[sz + 1] = (inside >>> 8) & 0xff;
    out[sz + 2] = (inside >>> 16) & 0xff; out[sz + 3] = (inside >>> 24) & 0xff;
    return Uint8Array.from(out);
  })();
  const webp = enc.encodeAnimatedWebPFromStillBlobs([opaque, opaque], W, H, 10, 0);
  let pos = 12, flags = -1;
  while (pos + 8 <= webp.length) {
    const fcc = String.fromCharCode(webp[pos], webp[pos + 1], webp[pos + 2], webp[pos + 3]);
    const size = webp[pos + 4] | (webp[pos + 5] << 8) | (webp[pos + 6] << 16) | (webp[pos + 7] << 24);
    if (fcc === "VP8X") { flags = webp[pos + 8]; break; }
    pos += 8 + size + (size & 1);
  }
  check("webp: VP8X alpha bit NOT set when all frames are opaque VP8", (flags & 0x10) === 0, `flags=${flags}`);
  check("webp: VP8X animation bit still set for opaque animation", (flags & 0x02) !== 0, `flags=${flags}`);
})();

if (failures > 0) {
  console.error(`\n${failures} check(s) failed.`);
  process.exit(1);
}
console.log("\nAll export encoder checks passed.");
