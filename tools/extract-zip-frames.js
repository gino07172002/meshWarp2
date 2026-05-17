"use strict";
const fs = require("fs");
const path = require("path");

const ZIP = "D:/newExport/portrait_pngseq_Anim_1.zip";
const OUT = "D:/newExport";
const buf = fs.readFileSync(ZIP);

// Walk local file headers, write every Nth frame to disk.
let off = 0;
let n = 0;
const wanted = new Set([1, 6, 12, 18, 24]);
while (off + 30 <= buf.length) {
  if (buf[off] === 0x50 && buf[off + 1] === 0x4b && buf[off + 2] === 0x03 && buf[off + 3] === 0x04) {
    n += 1;
    const compSize = buf[off + 18] | (buf[off + 19] << 8) | (buf[off + 20] << 16) | (buf[off + 21] << 24);
    const nameLen = buf[off + 26] | (buf[off + 27] << 8);
    const extraLen = buf[off + 28] | (buf[off + 29] << 8);
    const name = buf.slice(off + 30, off + 30 + nameLen).toString("utf8");
    const dataStart = off + 30 + nameLen + extraLen;
    const data = buf.slice(dataStart, dataStart + compSize);
    if (wanted.has(n)) {
      const dest = path.join(OUT, `preview_frame_${String(n).padStart(4, "0")}.png`);
      fs.writeFileSync(dest, data);
      console.log(`  ${dest}  ${data.length} bytes`);
    }
    off = dataStart + compSize;
  } else {
    off += 1;
  }
}
console.log(`total local entries scanned: ${n}`);
