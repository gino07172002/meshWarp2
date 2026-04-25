// Helper for the static-analysis check tools that historically pinned a
// specific cache-buster version on a script/style tag. Pinning made every
// version bump break the test, which is wasteful. This helper accepts any
// version string >= the floor (lex compare on YYYYMMDD-N format works
// because both halves are zero-padded sortable).
//
// Usage:
//   const { ensureAssetVersionAtLeast } = require("./lib/version-floor");
//   const failures = [];
//   ensureAssetVersionAtLeast(failures, indexSource, "app/ui/bootstrap.js", "20260423-2",
//     "mesh debug instrumentation is not hidden by browser cache");

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function ensureAssetVersionAtLeast(failures, indexSource, asset, floor, reason = "") {
  const escaped = escapeRegExp(asset);
  const re = new RegExp(`${escaped}\\?v=([\\w-]+)`);
  const m = indexSource.match(re);
  if (!m) {
    failures.push(`index.html: ${asset} script/style tag with ?v=... not found`);
    return;
  }
  const actual = m[1];
  if (compareVersion(actual, floor) < 0) {
    const tail = reason ? ` so ${reason}` : "";
    failures.push(`index.html: ${asset} must use v>=${floor} (found ${actual})${tail}`);
  }
}

// Compare YYYYMMDD-N strings. Returns negative if a<b, 0 if equal, positive if a>b.
// Falls back to plain string compare for non-conforming values.
function compareVersion(a, b) {
  const re = /^(\d{8})-(\d+)$/;
  const ma = re.exec(a);
  const mb = re.exec(b);
  if (ma && mb) {
    const dateDiff = Number(ma[1]) - Number(mb[1]);
    if (dateDiff !== 0) return dateDiff;
    return Number(ma[2]) - Number(mb[2]);
  }
  return a < b ? -1 : a > b ? 1 : 0;
}

module.exports = { ensureAssetVersionAtLeast, compareVersion };
