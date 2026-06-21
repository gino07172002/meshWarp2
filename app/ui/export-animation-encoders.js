// ROLE: Pure encoders for export-animation-modal — GIF89a (LZW, 332 palette),
// animated WebP (RIFF VP8X + ANIM + ANMF chunks), ZIP (store, CRC32).
// EXPORTS (global in browser, module.exports in Node):
//   - encodeGifFromImageDataFrames(frames, width, height, fps)
//   - encodeAnimatedWebPFromWebPBlobs(webpArrayBuffers, width, height, fps, loopCount)
//   - buildZipFromNamedParts(parts) where part = { name, data: Uint8Array }
//   - lzwEncode8, buildGif332Palette, crc32OfBytes (lower-level helpers)
//
// Pure: no DOM, no globals, no `window`. Safe for `require()` in Node.

(function (root) {
  // Opaque palette: full 256-color 332 layout (no transparent slot).
  function buildGif332Palette() {
    const out = new Uint8Array(256 * 3);
    let n = 0;
    for (let i = 0; i < 256; i += 1) {
      const r = (i >> 5) & 0x07;
      const g = (i >> 2) & 0x07;
      const b = i & 0x03;
      out[n++] = Math.round((r / 7) * 255);
      out[n++] = Math.round((g / 7) * 255);
      out[n++] = Math.round((b / 3) * 255);
    }
    return out;
  }

  // Transparent-mode palette: index 0 reserved as transparent placeholder
  // (color value unused by viewers when GCE transparent flag is set, but we
  // still emit black). Indices 1..255 hold 255 colors from the 332 layout,
  // skipping the last 332 entry so quantized opaque pixels never collide
  // with index 0.
  function buildGif332PaletteWithTransparent() {
    const out = new Uint8Array(256 * 3);
    let n = 3; // skip index 0 (transparent, leave as 0/0/0)
    for (let i = 0; i < 255; i += 1) {
      const r = (i >> 5) & 0x07;
      const g = (i >> 2) & 0x07;
      const b = i & 0x03;
      out[n++] = Math.round((r / 7) * 255);
      out[n++] = Math.round((g / 7) * 255);
      out[n++] = Math.round((b / 3) * 255);
    }
    return out;
  }

  function lzwEncode8(indices) {
    const minCodeSize = 8;
    const clearCode = 1 << minCodeSize;
    const endCode = clearCode + 1;
    let codeSize = minCodeSize + 1;
    let nextCode = endCode + 1;
    const dict = new Map();
    const resetDict = () => {
      dict.clear();
      for (let i = 0; i < clearCode; i += 1) dict.set(String(i), i);
      codeSize = minCodeSize + 1;
      nextCode = endCode + 1;
    };
    resetDict();
    const outBytes = [];
    let bitBuffer = 0;
    let bitCount = 0;
    const writeCode = (code) => {
      bitBuffer |= Number(code) << bitCount;
      bitCount += codeSize;
      while (bitCount >= 8) {
        outBytes.push(bitBuffer & 0xff);
        bitBuffer >>= 8;
        bitCount -= 8;
      }
    };
    writeCode(clearCode);
    let prefix = String(indices[0] || 0);
    for (let i = 1; i < indices.length; i += 1) {
      const k = Number(indices[i]) & 0xff;
      const pk = `${prefix},${k}`;
      if (dict.has(pk)) {
        prefix = pk;
        continue;
      }
      writeCode(dict.get(prefix));
      if (nextCode < 4096) {
        dict.set(pk, nextCode++);
        if (nextCode > 1 << codeSize && codeSize < 12) codeSize += 1;
      } else {
        writeCode(clearCode);
        resetDict();
      }
      prefix = String(k);
    }
    writeCode(dict.get(prefix));
    writeCode(endCode);
    if (bitCount > 0) outBytes.push(bitBuffer & 0xff);
    return new Uint8Array(outBytes);
  }

  // ── Median-cut colour quantizer ──────────────────────────────────────────
  // Returns { palette: Uint8Array(paletteSize*3), map: (r,g,b)=>index }.
  // paletteSize must be a power of two ≤ 256.
  function medianCutQuantize(rgba, paletteSize, transparent, alphaThreshold) {
    // Collect opaque pixels (sample for speed on large frames)
    const maxSamples = 32768;
    const total = rgba.length >> 2;
    const step = Math.max(1, Math.floor(total / maxSamples));
    const pixels = [];
    for (let i = 0; i < total; i += step) {
      const o = i << 2;
      if (transparent && rgba[o + 3] < alphaThreshold) continue;
      pixels.push([rgba[o], rgba[o + 1], rgba[o + 2]]);
    }
    if (pixels.length === 0) {
      // fallback: black palette
      return { palette: new Uint8Array(paletteSize * 3), map: () => 0 };
    }
    // Median-cut: recursively split buckets
    const targetBuckets = transparent ? paletteSize - 1 : paletteSize;
    function splitBucket(bucket) {
      if (bucket.length <= 1) return [bucket];
      let minR = 255, maxR = 0, minG = 255, maxG = 0, minB = 255, maxB = 0;
      for (const [r, g, b] of bucket) {
        if (r < minR) minR = r; if (r > maxR) maxR = r;
        if (g < minG) minG = g; if (g > maxG) maxG = g;
        if (b < minB) minB = b; if (b > maxB) maxB = b;
      }
      const rangeR = maxR - minR, rangeG = maxG - minG, rangeB = maxB - minB;
      const axis = rangeR >= rangeG && rangeR >= rangeB ? 0 : rangeG >= rangeB ? 1 : 2;
      bucket.sort((a, b) => a[axis] - b[axis]);
      const mid = bucket.length >> 1;
      return [bucket.slice(0, mid), bucket.slice(mid)];
    }
    let buckets = [pixels];
    while (buckets.length < targetBuckets) {
      // Split the largest bucket
      let largest = 0;
      for (let i = 1; i < buckets.length; i++) {
        if (buckets[i].length > buckets[largest].length) largest = i;
      }
      if (buckets[largest].length <= 1) break;
      const [a, b] = splitBucket(buckets[largest]);
      buckets.splice(largest, 1, a, b);
    }
    // Build palette from bucket averages
    const palOffset = transparent ? 1 : 0; // index 0 reserved for transparency
    const palRGB = new Uint8Array(paletteSize * 3);
    const palColors = []; // [{r,g,b}] indexed by palette slot
    if (transparent) palColors.push({ r: 0, g: 0, b: 0 }); // slot 0 = transparent
    for (const bucket of buckets) {
      if (bucket.length === 0) { palColors.push({ r: 0, g: 0, b: 0 }); continue; }
      let sr = 0, sg = 0, sb = 0;
      for (const [r, g, b] of bucket) { sr += r; sg += g; sb += b; }
      palColors.push({ r: Math.round(sr / bucket.length), g: Math.round(sg / bucket.length), b: Math.round(sb / bucket.length) });
    }
    // Fill palette bytes
    for (let i = 0; i < Math.min(palColors.length, paletteSize); i++) {
      palRGB[i * 3] = palColors[i].r;
      palRGB[i * 3 + 1] = palColors[i].g;
      palRGB[i * 3 + 2] = palColors[i].b;
    }
    // Fast nearest-colour lookup with a 15-bit RGB cache
    const cache = new Int16Array(32768).fill(-1);
    function nearestIndex(r, g, b) {
      const key = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3);
      if (cache[key] >= 0) return cache[key];
      let best = palOffset, bestD = Infinity;
      for (let i = palOffset; i < palColors.length; i++) {
        const dr = r - palColors[i].r, dg = g - palColors[i].g, db = b - palColors[i].b;
        const d = dr * dr + dg * dg + db * db;
        if (d < bestD) { bestD = d; best = i; }
      }
      cache[key] = best;
      return best;
    }
    return { palette: palRGB, map: nearestIndex };
  }

  // frames: [{ data: Uint8ClampedArray|Uint8Array (RGBA) }]
  // loopCount: 0 = infinite (default), N = loop N times
  // opts: { transparent?: boolean, alphaThreshold?: number }
  //   Uses per-frame local colour table (median-cut quantization) for full-colour GIF.
  function encodeGifFromImageDataFrames(frames, width, height, fps, loopCount, opts) {
    if (!frames || frames.length === 0) throw new Error("encodeGif: no frames");
    const loops = Math.max(0, Math.min(0xffff, Number(loopCount) || 0));
    const transparent = !!(opts && opts.transparent);
    const alphaThreshold = Math.max(0, Math.min(255, Number(opts && opts.alphaThreshold) || 128));
    const bytes = [];
    const pushByte = (b) => bytes.push(b & 0xff);
    const pushWord = (w) => { pushByte(w & 0xff); pushByte((w >> 8) & 0xff); };
    const pushString = (s) => { for (let i = 0; i < s.length; i++) pushByte(s.charCodeAt(i)); };

    // GIF header — no global colour table (each frame has its own local table)
    pushString("GIF89a");
    pushWord(width);
    pushWord(height);
    // Packed field: globalColorTableFlag=0, colorResolution=7, sort=0, globalColorTableSize=0
    pushByte(0x70);
    pushByte(0x00); // background colour index
    pushByte(0x00); // pixel aspect ratio

    // NETSCAPE loop extension
    pushByte(0x21); pushByte(0xff); pushByte(0x0b);
    pushString("NETSCAPE2.0");
    pushByte(0x03); pushByte(0x01); pushWord(loops); pushByte(0x00);

    const delay = Math.max(1, Math.round(100 / Math.max(1, fps)));

    for (const frame of frames) {
      const rgba = frame.data;
      // Per-frame median-cut quantization (256 colours, or 255+transparent slot)
      const { palette, map } = medianCutQuantize(rgba, 256, transparent, alphaThreshold);

      // Map each pixel to its nearest palette index
      const idx = new Uint8Array(width * height);
      const total = width * height;
      for (let i = 0; i < total; i++) {
        const o = i << 2;
        if (transparent && rgba[o + 3] < alphaThreshold) {
          idx[i] = 0;
        } else {
          idx[i] = map(rgba[o], rgba[o + 1], rgba[o + 2]);
        }
      }

      // Graphic Control Extension
      pushByte(0x21); pushByte(0xf9); pushByte(0x04);
      pushByte(transparent ? (2 << 2) | 0x01 : 0x00);
      pushWord(delay);
      pushByte(0x00); // transparent colour index = 0
      pushByte(0x00);

      // Image descriptor with local colour table flag set
      pushByte(0x2c);
      pushWord(0); pushWord(0); pushWord(width); pushWord(height);
      // packed: localColorTableFlag=1, interlace=0, sort=0, localColorTableSize=7 (256 colors)
      pushByte(0x87);
      // Local colour table (256 × 3 bytes)
      for (let i = 0; i < palette.length; i++) pushByte(palette[i]);

      // LZW image data
      pushByte(0x08);
      const lzw = lzwEncode8(idx);
      let off = 0;
      while (off < lzw.length) {
        const n = Math.min(255, lzw.length - off);
        pushByte(n);
        for (let i = 0; i < n; i++) pushByte(lzw[off + i]);
        off += n;
      }
      pushByte(0x00);
    }
    pushByte(0x3b);
    return new Uint8Array(bytes);
  }

  // RIFF helpers
  function writeFourCC(arr, s) {
    for (let i = 0; i < 4; i += 1) arr.push(s.charCodeAt(i) & 0xff);
  }
  function writeUint32LE(arr, v) {
    arr.push(v & 0xff, (v >>> 8) & 0xff, (v >>> 16) & 0xff, (v >>> 24) & 0xff);
  }
  function writeUint24LE(arr, v) {
    arr.push(v & 0xff, (v >>> 8) & 0xff, (v >>> 16) & 0xff);
  }
  function padIfOdd(arr) {
    if (arr.length & 1) arr.push(0);
  }
  function chunkBytes(fourcc, payload) {
    const out = [];
    writeFourCC(out, fourcc);
    writeUint32LE(out, payload.length);
    for (let i = 0; i < payload.length; i += 1) out.push(payload[i] & 0xff);
    if (out.length & 1) out.push(0);
    return out;
  }

  // Parse a still WebP ArrayBuffer / Uint8Array and return:
  //   { width, height, hasAlpha, frameChunks }
  // where frameChunks is the raw chunk bytes that should be embedded inside
  // an ANMF — per WebP spec that is: optional ALPH, followed by exactly one
  // of (VP8 | VP8L). Other still-only chunks (ICCP, EXIF, XMP, VP8X) are
  // dropped because they are not legal inside ANMF.
  function parseStillWebP(input) {
    const u8 = input instanceof Uint8Array ? input : new Uint8Array(input);
    if (u8.length < 20) throw new Error("WebP too small");
    const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
    const riff = String.fromCharCode(u8[0], u8[1], u8[2], u8[3]);
    const webp = String.fromCharCode(u8[8], u8[9], u8[10], u8[11]);
    if (riff !== "RIFF" || webp !== "WEBP") throw new Error("Not a WebP RIFF");
    let pos = 12;
    let alphChunk = null;        // bytes of full ALPH chunk including header+padding
    let codecChunk = null;       // bytes of full VP8 / VP8L chunk including header+padding
    let codecFourcc = "";
    let codecPayload = null;
    let vp8xWidth = 0, vp8xHeight = 0, vp8xHasAlpha = false;

    function sliceChunk(fcc, dataStart, size) {
      const padded = dataStart - 8 + 8 + size + (size & 1);
      return u8.subarray(dataStart - 8, padded);
    }

    while (pos + 8 <= u8.length) {
      const fourcc = String.fromCharCode(u8[pos], u8[pos + 1], u8[pos + 2], u8[pos + 3]);
      const size = dv.getUint32(pos + 4, true);
      const dataStart = pos + 8;
      const dataEnd = dataStart + size;
      if (dataEnd > u8.length) throw new Error("WebP chunk truncated");
      if (fourcc === "ALPH") {
        alphChunk = sliceChunk(fourcc, dataStart, size);
      } else if (fourcc === "VP8 " || fourcc === "VP8L") {
        codecChunk = sliceChunk(fourcc, dataStart, size);
        codecFourcc = fourcc;
        codecPayload = u8.subarray(dataStart, dataEnd);
      } else if (fourcc === "VP8X") {
        if (size >= 10) {
          const flags = u8[dataStart];
          vp8xHasAlpha = (flags & 0x10) !== 0;
          vp8xWidth = (u8[dataStart + 4] | (u8[dataStart + 5] << 8) | (u8[dataStart + 6] << 16)) + 1;
          vp8xHeight = (u8[dataStart + 7] | (u8[dataStart + 8] << 8) | (u8[dataStart + 9] << 16)) + 1;
        }
      }
      pos = dataEnd + (size & 1);
    }

    if (!codecChunk) throw new Error("WebP: no VP8/VP8L chunk found");

    let width = vp8xWidth, height = vp8xHeight;
    if (!width || !height) {
      if (codecFourcc === "VP8 ") {
        // VP8: tag(3) + signature 0x9d 0x01 0x2a + w(2) + h(2)
        if (codecPayload.length >= 10
          && codecPayload[3] === 0x9d && codecPayload[4] === 0x01 && codecPayload[5] === 0x2a) {
          width = (codecPayload[6] | (codecPayload[7] << 8)) & 0x3fff;
          height = (codecPayload[8] | (codecPayload[9] << 8)) & 0x3fff;
        }
      } else if (codecPayload.length >= 5 && codecPayload[0] === 0x2f) {
        const b1 = codecPayload[1], b2 = codecPayload[2], b3 = codecPayload[3], b4 = codecPayload[4];
        width = ((b1 | (b2 << 8)) & 0x3fff) + 1;
        height = (((b2 >> 6) | (b3 << 2) | (b4 << 10)) & 0x3fff) + 1;
      }
    }

    const hasAlpha = !!alphChunk || vp8xHasAlpha || codecFourcc === "VP8L";

    // Concatenate frame chunks in the order required by ANMF: ALPH (optional) then VP8/VP8L.
    let frameChunks;
    if (alphChunk) {
      frameChunks = new Uint8Array(alphChunk.length + codecChunk.length);
      frameChunks.set(alphChunk, 0);
      frameChunks.set(codecChunk, alphChunk.length);
    } else {
      frameChunks = codecChunk;
    }

    return { width, height, hasAlpha, frameChunks };
  }

  // webpStillBlobs: Array<Uint8Array|ArrayBuffer> — each a complete RIFF WEBP for one frame.
  function encodeAnimatedWebPFromStillBlobs(webpStillBlobs, width, height, fps, loopCount) {
    if (!webpStillBlobs || webpStillBlobs.length === 0) throw new Error("encodeWebP: no frames");
    const durationMs = Math.max(1, Math.round(1000 / Math.max(1, fps)));
    const loops = Math.max(0, Math.min(0xffff, Number(loopCount) || 0));

    // Parse all frames up front so VP8X flags reflect actual alpha presence.
    const parsedFrames = webpStillBlobs.map(parseStillWebP);
    const anyAlpha = parsedFrames.some((p) => p.hasAlpha);

    // VP8X chunk: 1 byte flags + 3 bytes reserved + 3 bytes (w-1) + 3 bytes (h-1)
    // bit 1 (0x02) = animation, bit 4 (0x10) = alpha.
    const vp8xPayload = [];
    vp8xPayload.push(0x02 | (anyAlpha ? 0x10 : 0x00));
    vp8xPayload.push(0, 0, 0); // reserved
    writeUint24LE(vp8xPayload, (width - 1) & 0xffffff);
    writeUint24LE(vp8xPayload, (height - 1) & 0xffffff);
    const vp8xChunk = chunkBytes("VP8X", vp8xPayload);

    // ANIM chunk: 4 bytes background color (BGRA) + 2 bytes loop count
    const animPayload = [0, 0, 0, 0, loops & 0xff, (loops >>> 8) & 0xff];
    const animChunk = chunkBytes("ANIM", animPayload);

    // ANMF chunks
    const anmfChunks = [];
    for (const parsed of parsedFrames) {
      const fw = parsed.width || width;
      const fh = parsed.height || height;
      const anmfPayload = [];
      writeUint24LE(anmfPayload, 0);                 // X offset / 2 = 0
      writeUint24LE(anmfPayload, 0);                 // Y offset / 2 = 0
      writeUint24LE(anmfPayload, (fw - 1) & 0xffffff);
      writeUint24LE(anmfPayload, (fh - 1) & 0xffffff);
      writeUint24LE(anmfPayload, durationMs & 0xffffff);
      anmfPayload.push(0x00); // flags: dispose=none, blend=use alpha
      // Embed the frame's ALPH (if any) + VP8/VP8L chunks verbatim — they
      // already include their own fourcc, size, payload, and padding.
      const fc = parsed.frameChunks;
      for (let i = 0; i < fc.length; i += 1) anmfPayload.push(fc[i]);
      anmfChunks.push(chunkBytes("ANMF", anmfPayload));
    }

    // Build inside of RIFF: "WEBP" + VP8X + ANIM + ANMF...
    const inside = [];
    writeFourCC(inside, "WEBP");
    for (let i = 0; i < vp8xChunk.length; i += 1) inside.push(vp8xChunk[i]);
    for (let i = 0; i < animChunk.length; i += 1) inside.push(animChunk[i]);
    for (const c of anmfChunks) for (let i = 0; i < c.length; i += 1) inside.push(c[i]);

    const out = [];
    writeFourCC(out, "RIFF");
    writeUint32LE(out, inside.length);
    for (let i = 0; i < inside.length; i += 1) out.push(inside[i]);
    return new Uint8Array(out);
  }

  const crc32Table = (() => {
    const table = new Uint32Array(256);
    for (let i = 0; i < 256; i += 1) {
      let c = i;
      for (let j = 0; j < 8; j += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[i] = c >>> 0;
    }
    return table;
  })();

  function crc32OfBytes(bytes) {
    let c = 0xffffffff;
    for (let i = 0; i < bytes.length; i += 1) {
      c = crc32Table[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  // parts: [{ name: string, data: Uint8Array }]
  function buildZipFromNamedParts(parts) {
    const files = [];
    for (const it of parts || []) {
      if (!it || !it.data || !it.name) continue;
      const data = it.data instanceof Uint8Array ? it.data : new Uint8Array(it.data);
      const nameBytes = new TextEncoder().encode(String(it.name));
      files.push({ data, nameBytes, crc32: crc32OfBytes(data) });
    }
    const chunks = [];
    const central = [];
    let offset = 0;
    const pushU16 = (arr, v) => arr.push(v & 0xff, (v >>> 8) & 0xff);
    const pushU32 = (arr, v) => arr.push(v & 0xff, (v >>> 8) & 0xff, (v >>> 16) & 0xff, (v >>> 24) & 0xff);
    for (const f of files) {
      const local = [];
      pushU32(local, 0x04034b50);
      pushU16(local, 20);
      pushU16(local, 0);
      pushU16(local, 0);
      pushU16(local, 0);
      pushU16(local, 0);
      pushU32(local, f.crc32 >>> 0);
      pushU32(local, f.data.length >>> 0);
      pushU32(local, f.data.length >>> 0);
      pushU16(local, f.nameBytes.length);
      pushU16(local, 0);
      for (let i = 0; i < f.nameBytes.length; i += 1) local.push(f.nameBytes[i]);
      chunks.push(new Uint8Array(local), f.data);
      const cent = [];
      pushU32(cent, 0x02014b50);
      pushU16(cent, 20);
      pushU16(cent, 20);
      pushU16(cent, 0);
      pushU16(cent, 0);
      pushU16(cent, 0);
      pushU16(cent, 0);
      pushU32(cent, f.crc32 >>> 0);
      pushU32(cent, f.data.length >>> 0);
      pushU32(cent, f.data.length >>> 0);
      pushU16(cent, f.nameBytes.length);
      pushU16(cent, 0);
      pushU16(cent, 0);
      pushU16(cent, 0);
      pushU16(cent, 0);
      pushU32(cent, 0);
      pushU32(cent, offset >>> 0);
      for (let i = 0; i < f.nameBytes.length; i += 1) cent.push(f.nameBytes[i]);
      central.push(new Uint8Array(cent));
      offset += local.length + f.data.length;
    }
    let centralSize = 0;
    for (const c of central) centralSize += c.length;
    const end = [];
    pushU32(end, 0x06054b50);
    pushU16(end, 0);
    pushU16(end, 0);
    pushU16(end, files.length);
    pushU16(end, files.length);
    pushU32(end, centralSize >>> 0);
    pushU32(end, offset >>> 0);
    pushU16(end, 0);

    let total = 0;
    for (const c of chunks) total += c.length;
    for (const c of central) total += c.length;
    total += end.length;
    const out = new Uint8Array(total);
    let pos = 0;
    for (const c of chunks) { out.set(c, pos); pos += c.length; }
    for (const c of central) { out.set(c, pos); pos += c.length; }
    out.set(new Uint8Array(end), pos);
    return out;
  }

  const api = {
    buildGif332Palette,
    buildGif332PaletteWithTransparent,
    lzwEncode8,
    encodeGifFromImageDataFrames,
    parseStillWebP,
    encodeAnimatedWebPFromStillBlobs,
    crc32OfBytes,
    buildZipFromNamedParts,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  } else {
    Object.assign(root, api);
  }
})(typeof window !== "undefined" ? window : globalThis);
