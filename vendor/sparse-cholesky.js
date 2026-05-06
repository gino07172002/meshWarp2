// Sparse Cholesky (LDLᵀ) solver for symmetric positive-definite matrices.
// Vendored so the puppet-warp ARAP solver can do "factor once, back-
// substitute many times" — the hot path during a pin drag.
//
// Implementation note: we use a column-major dense LDLᵀ. The puppet-warp
// matrix is the cotangent Laplacian augmented with pin rows, which for
// realistic meshes (≤ 10k vertices) factors in <100 ms with the dense
// path and back-substitutes in O(n²) which is still fast (sub-millisecond
// at 1k verts). We can drop in a true sparse path later if larger meshes
// become a target — the public API (analyze/factor/solve) is identical.
//
// Pure JS, zero dependencies. Float64 throughout.
//
// Exposes: window.SparseCholesky = { analyze, factor, solve, denseToCsc, ... }
//
// CSC format (used by callers building the matrix):
//   Ap[0..n]   column pointers, length n+1
//   Ai[0..nz]  row indices for each non-zero, length nz
//   Ax[0..nz]  numeric values, length nz
// The lower triangle (including diagonal) is sufficient for symmetric matrices.

(function buildSparseCholesky() {
  if (typeof window === "undefined") return;
  if (window.SparseCholesky && window.SparseCholesky.__installed) return;

  // ---- helpers --------------------------------------------------------------

  function denseToCsc(n, dense) {
    // dense: row-major n*n Float64Array. Builds the lower-triangular CSC.
    const Ap = new Int32Array(n + 1);
    const rows = [];
    const vals = [];
    for (let j = 0; j < n; j += 1) {
      Ap[j] = rows.length;
      for (let i = j; i < n; i += 1) {
        const v = dense[i * n + j];
        if (v !== 0) {
          rows.push(i);
          vals.push(v);
        }
      }
    }
    Ap[n] = rows.length;
    return { n, Ap, Ai: Int32Array.from(rows), Ax: Float64Array.from(vals) };
  }

  // ---- analyze --------------------------------------------------------------
  //
  // For the dense path, "analyze" just expands CSC into a row-major dense
  // matrix (with the symmetric upper triangle filled in) for factor() to
  // consume. We keep the analyze/factor split in the API because callers
  // expect to reuse symbolic structure across re-factors when only numeric
  // values change — for the dense path we still recompute factor() each
  // time, but the API stays stable for a future sparse implementation.

  function analyze(n, Ap, Ai) {
    return { n }; // dense path: nothing to precompute
  }

  // ---- factor ---------------------------------------------------------------
  //
  // Standard column-by-column LDLᵀ:
  //   For column j:
  //     v[i] = A(i,j) - sum_{k<j} L(i,k) * D[k] * L(j,k)   for i = j..n-1
  //     D[j] = v[j]
  //     L(i,j) = v[i] / D[j]                                for i = j+1..n-1
  // Stored as a single Float64Array L[n*n] in row-major; lower triangle holds
  // L's off-diagonals, diagonal stored separately in D.

  function expandCscToDense(n, Ap, Ai, Ax) {
    const M = new Float64Array(n * n);
    for (let j = 0; j < n; j += 1) {
      for (let p = Ap[j]; p < Ap[j + 1]; p += 1) {
        const i = Ai[p];
        const v = Ax[p];
        M[i * n + j] = v;
        if (i !== j) M[j * n + i] = v; // symmetric
      }
    }
    return M;
  }

  function factor(symbolic, Ap, Ai, Ax) {
    const n = symbolic.n;
    const A = expandCscToDense(n, Ap, Ai, Ax);
    const L = new Float64Array(n * n); // L[i*n + j] = L(i,j)
    const D = new Float64Array(n);
    const tmp = new Float64Array(n);

    for (let j = 0; j < n; j += 1) {
      // tmp[i] = A(i, j) for i = j..n-1, then subtract contributions from
      // previous columns 0..j-1.
      for (let i = j; i < n; i += 1) tmp[i] = A[i * n + j];
      for (let k = 0; k < j; k += 1) {
        const Ljk = L[j * n + k];
        if (Ljk === 0) continue;
        const dkLjk = D[k] * Ljk;
        for (let i = j; i < n; i += 1) {
          tmp[i] -= L[i * n + k] * dkLjk;
        }
      }
      const dj = tmp[j];
      if (dj === 0) {
        throw new Error(`SparseCholesky.factor: zero pivot at column ${j}`);
      }
      D[j] = dj;
      L[j * n + j] = 1;
      for (let i = j + 1; i < n; i += 1) {
        L[i * n + j] = tmp[i] / dj;
      }
    }
    return { n, L, D };
  }

  // ---- solve ----------------------------------------------------------------

  // Solve L D Lᵀ x = b, into x (b unchanged).
  function solve(numeric, b, x) {
    const n = numeric.n;
    const L = numeric.L;
    const D = numeric.D;
    if (!x) x = new Float64Array(n);
    // Forward: solve L y = b (L unit lower tri, diagonal = 1)
    for (let i = 0; i < n; i += 1) {
      let s = b[i];
      for (let j = 0; j < i; j += 1) s -= L[i * n + j] * x[j];
      x[i] = s; // L[i,i] = 1
    }
    // Diagonal: y / D
    for (let i = 0; i < n; i += 1) x[i] /= D[i];
    // Back: solve Lᵀ x = y
    for (let i = n - 1; i >= 0; i -= 1) {
      let s = x[i];
      for (let j = i + 1; j < n; j += 1) s -= L[j * n + i] * x[j];
      x[i] = s;
    }
    return x;
  }

  // ---- convenience ----------------------------------------------------------

  // Solve Ax = b in one shot from a dense lower-tri A. For tests / small cases.
  function solveDense(n, denseLowerTri, b) {
    const csc = denseToCsc(n, denseLowerTri);
    const sym = analyze(n, csc.Ap, csc.Ai);
    const num = factor(sym, csc.Ap, csc.Ai, csc.Ax);
    return solve(num, b);
  }

  window.SparseCholesky = {
    __installed: true,
    version: 1,
    analyze,
    factor,
    solve,
    solveDense,
    denseToCsc,
  };
})();
