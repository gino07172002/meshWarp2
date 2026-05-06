#!/usr/bin/env node
// Standalone verification of vendor/sparse-cholesky.js. Runs without a
// browser by stubbing window. Validates LDLᵀ on a small 4x4 SPD system
// against a hand-computed reference, and a 50x50 random SPD system
// against the dense Gauss elimination result.

const fs = require("fs");
const path = require("path");

const stub = { window: {} };
const code = fs.readFileSync(path.resolve(__dirname, "..", "vendor", "sparse-cholesky.js"), "utf8");
new Function("window", code)(stub.window);
const SC = stub.window.SparseCholesky;

function denseSolve(n, A, b) {
  // Plain Gauss elimination on a copy. A row-major n*n.
  const M = new Float64Array(n * (n + 1));
  for (let i = 0; i < n; i += 1) {
    for (let j = 0; j < n; j += 1) M[i * (n + 1) + j] = A[i * n + j];
    M[i * (n + 1) + n] = b[i];
  }
  for (let k = 0; k < n; k += 1) {
    // Partial pivot
    let maxAbs = Math.abs(M[k * (n + 1) + k]);
    let maxRow = k;
    for (let i = k + 1; i < n; i += 1) {
      if (Math.abs(M[i * (n + 1) + k]) > maxAbs) {
        maxAbs = Math.abs(M[i * (n + 1) + k]);
        maxRow = i;
      }
    }
    if (maxRow !== k) {
      for (let j = 0; j <= n; j += 1) {
        const t = M[k * (n + 1) + j]; M[k * (n + 1) + j] = M[maxRow * (n + 1) + j]; M[maxRow * (n + 1) + j] = t;
      }
    }
    for (let i = k + 1; i < n; i += 1) {
      const f = M[i * (n + 1) + k] / M[k * (n + 1) + k];
      for (let j = k; j <= n; j += 1) M[i * (n + 1) + j] -= f * M[k * (n + 1) + j];
    }
  }
  const x = new Float64Array(n);
  for (let i = n - 1; i >= 0; i -= 1) {
    let s = M[i * (n + 1) + n];
    for (let j = i + 1; j < n; j += 1) s -= M[i * (n + 1) + j] * x[j];
    x[i] = s / M[i * (n + 1) + i];
  }
  return x;
}

function makeRandSpd(n, seed) {
  // Deterministic PRNG so the test is repeatable.
  let s = seed | 0;
  const rand = () => {
    s = (s * 1664525 + 1013904223) | 0;
    return ((s >>> 0) / 0xffffffff) - 0.5;
  };
  // M = R*Rᵀ + n*I  (positive definite)
  const R = new Float64Array(n * n);
  for (let i = 0; i < n * n; i += 1) R[i] = rand();
  const A = new Float64Array(n * n);
  for (let i = 0; i < n; i += 1) {
    for (let j = 0; j < n; j += 1) {
      let s2 = 0;
      for (let k = 0; k < n; k += 1) s2 += R[i * n + k] * R[j * n + k];
      A[i * n + j] = s2 + (i === j ? n : 0);
    }
  }
  return A;
}

function maxAbsDiff(a, b) {
  let m = 0;
  for (let i = 0; i < a.length; i += 1) m = Math.max(m, Math.abs(a[i] - b[i]));
  return m;
}

let failed = 0;

// Test 1: 4x4 SPD with known solution
{
  const n = 4;
  // A = [[4,1,0,0],[1,4,1,0],[0,1,4,1],[0,0,1,4]] (tridiagonal SPD)
  const A = new Float64Array([
    4, 1, 0, 0,
    1, 4, 1, 0,
    0, 1, 4, 1,
    0, 0, 1, 4,
  ]);
  const b = new Float64Array([5, 6, 6, 5]);
  const expected = denseSolve(n, A, b);
  const got = SC.solveDense(n, A, b);
  const err = maxAbsDiff(expected, got);
  if (err > 1e-9) {
    console.error(`Test 1 (4x4 tridiag) FAILED: err=${err}, expected=[${expected}], got=[${got}]`);
    failed += 1;
  } else {
    console.log(`Test 1 (4x4 tridiag) PASS, err=${err.toExponential(2)}`);
  }
}

// Test 2: 50x50 random dense SPD via the same path (no sparsity exploited
// but proves the algorithm is correct)
{
  const n = 50;
  const A = makeRandSpd(n, 42);
  const b = new Float64Array(n);
  for (let i = 0; i < n; i += 1) b[i] = Math.sin(i * 0.7) * 3 + 1;
  const expected = denseSolve(n, A, b);
  const got = SC.solveDense(n, A, b);
  const err = maxAbsDiff(expected, got);
  if (err > 1e-6) {
    console.error(`Test 2 (50x50 random SPD) FAILED: err=${err}`);
    failed += 1;
  } else {
    console.log(`Test 2 (50x50 random SPD) PASS, err=${err.toExponential(2)}`);
  }
}

// Test 3: factor reuse (analyze + factor once, solve many times)
{
  const n = 30;
  const A = makeRandSpd(n, 7);
  const csc = SC.denseToCsc(n, A);
  const sym = SC.analyze(n, csc.Ap, csc.Ai);
  const num = SC.factor(sym, csc.Ap, csc.Ai, csc.Ax);
  let maxErr = 0;
  for (let trial = 0; trial < 10; trial += 1) {
    const b = new Float64Array(n);
    for (let i = 0; i < n; i += 1) b[i] = ((i + trial) * 13) % 7 - 3;
    const expected = denseSolve(n, A, b);
    const got = SC.solve(num, b);
    maxErr = Math.max(maxErr, maxAbsDiff(expected, got));
  }
  if (maxErr > 1e-6) {
    console.error(`Test 3 (factor reuse) FAILED: max err=${maxErr}`);
    failed += 1;
  } else {
    console.log(`Test 3 (factor reuse, 10 solves) PASS, max err=${maxErr.toExponential(2)}`);
  }
}

if (failed > 0) {
  console.error(`${failed} test(s) failed.`);
  process.exit(1);
}
console.log("All sparse-cholesky tests passed.");
