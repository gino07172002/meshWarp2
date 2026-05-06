#!/usr/bin/env node
// Verify the ARAP solver produces sensible deformations on a small mesh.
// Standalone — stubs window for both vendor/sparse-cholesky.js and
// app/core/puppet-warp.js.

const fs = require("fs");
const path = require("path");

const win = {};
new Function("window", fs.readFileSync(path.resolve(__dirname, "..", "vendor", "sparse-cholesky.js"), "utf8"))(win);
new Function("window", fs.readFileSync(path.resolve(__dirname, "..", "app", "core", "puppet-warp.js"), "utf8"))(win);
const PW = win.PuppetWarp;

function makeGridMesh(cols, rows, w, h) {
  // (cols x rows) of vertices, two triangles per cell
  const positions = [];
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      positions.push((c / (cols - 1)) * w, (r / (rows - 1)) * h);
    }
  }
  const indices = [];
  for (let r = 0; r < rows - 1; r += 1) {
    for (let c = 0; c < cols - 1; c += 1) {
      const a = r * cols + c;
      const b = a + 1;
      const cIdx = a + cols;
      const d = cIdx + 1;
      indices.push(a, b, cIdx, b, d, cIdx);
    }
  }
  return {
    positions: new Float32Array(positions),
    indices: new Uint16Array(indices),
  };
}

let failed = 0;
function assert(cond, msg) {
  if (!cond) { console.error("FAIL:", msg); failed += 1; }
  else console.log("PASS:", msg);
}

// Test 1: single pin at one corner held in place — mesh shouldn't move.
{
  const md = makeGridMesh(5, 5, 100, 100);
  const att = {
    meshData: md,
    puppetWarp: { mode: "standalone", pins: [{ id: "p0", vertexIndex: 0, restX: 0, restY: 0 }] },
  };
  const targets = { 0: { x: 0, y: 0 } };
  const out = PW.solve(att, targets, 2);
  let maxMove = 0;
  for (let i = 0; i < md.positions.length; i += 1) {
    maxMove = Math.max(maxMove, Math.abs(out[i] - md.positions[i]));
  }
  assert(maxMove < 1e-3, `single-pin-at-rest: max move ${maxMove.toExponential(2)} (expected ~0)`);
}

// Test 2: two pins, one moves diagonally — middle should follow proportionally.
{
  const md = makeGridMesh(5, 5, 100, 100);
  const att = {
    meshData: md,
    puppetWarp: {
      mode: "standalone",
      pins: [
        { id: "p0", vertexIndex: 0, restX: 0, restY: 0 },         // top-left
        { id: "p24", vertexIndex: 24, restX: 100, restY: 100 },   // bottom-right
      ],
    },
  };
  // Both pins translate by (10, 0). Note this is NOT a pure rigid motion
  // because the diagonal lengthens slightly, so ARAP balances rotation +
  // mild stretch. We expect centre near (60, 50) within ~3 units.
  const targets = { 0: { x: 10, y: 0 }, 24: { x: 110, y: 100 } };
  const out = PW.solve(att, targets, 3);
  const cx = out[12 * 2];
  const cy = out[12 * 2 + 1];
  assert(
    Math.abs(cx - 60) < 3.0 && Math.abs(cy - 50) < 3.0,
    `two-pin translate: centre at (${cx.toFixed(2)},${cy.toFixed(2)}), expected ~(60,50)`
  );
}

// Test 3: pin holds corner in place; opposite corner stretched 50%
{
  const md = makeGridMesh(5, 5, 100, 100);
  const att = {
    meshData: md,
    puppetWarp: {
      mode: "standalone",
      pins: [
        { id: "p0", vertexIndex: 0, restX: 0, restY: 0 },
        { id: "p24", vertexIndex: 24, restX: 100, restY: 100 },
      ],
    },
  };
  const targets = { 0: { x: 0, y: 0 }, 24: { x: 150, y: 150 } };
  const out = PW.solve(att, targets, 3);
  const cx = out[12 * 2];
  const cy = out[12 * 2 + 1];
  // ARAP discourages scale, but with two corner pins forcing scale, the
  // centre should land roughly at (75, 75) — somewhere in [60..90] is OK.
  assert(
    cx > 60 && cx < 90 && cy > 60 && cy < 90,
    `two-pin scale: centre at (${cx.toFixed(2)},${cy.toFixed(2)}), expected roughly (75,75)`
  );
}

// Test 4: pin at corner verifies pin penalty is strong enough
{
  const md = makeGridMesh(5, 5, 100, 100);
  const att = {
    meshData: md,
    puppetWarp: { mode: "standalone", pins: [{ id: "p", vertexIndex: 12, restX: 50, restY: 50 }] },
  };
  const targets = { 12: { x: 70, y: 30 } };
  const out = PW.solve(att, targets, 2);
  const px = out[12 * 2], py = out[12 * 2 + 1];
  assert(
    Math.abs(px - 70) < 0.1 && Math.abs(py - 30) < 0.1,
    `pin penalty: pin at (${px.toFixed(3)}, ${py.toFixed(3)}), target (70,30)`
  );
}

// Test 5: factor reuse — solving twice should give same result
{
  const md = makeGridMesh(4, 4, 80, 80);
  const att = {
    meshData: md,
    puppetWarp: {
      mode: "standalone",
      pins: [
        { id: "a", vertexIndex: 0, restX: 0, restY: 0 },
        { id: "b", vertexIndex: 15, restX: 80, restY: 80 },
      ],
    },
  };
  const targets = { 0: { x: -10, y: -5 }, 15: { x: 100, y: 90 } };
  const out1 = PW.solve(att, targets, 3);
  const out2 = PW.solve(att, targets, 3);
  let maxDiff = 0;
  for (let i = 0; i < out1.length; i += 1) maxDiff = Math.max(maxDiff, Math.abs(out1[i] - out2[i]));
  assert(maxDiff < 1e-9, `repeat solve identical: max diff ${maxDiff.toExponential(2)}`);
}

if (failed > 0) {
  console.error(`${failed} test(s) failed.`);
  process.exit(1);
}
console.log("All puppet-warp ARAP tests passed.");
