// ROLE: Puppet-warp ARAP (As-Rigid-As-Possible) solver. Given a triangle
// mesh and a set of "pins" (vertex index → target position), compute the
// vertex positions that satisfy the pins while distorting triangles as
// little as possible.
//
// Algorithm: Igarashi/Moscovich/Hughes (2005). The energy is a sum over
// triangles of squared deviation from a best-fit rotation+translation.
// We solve a fixed Laplacian-style system once per topology (and pin set)
// and back-substitute on every pin drag.
//
// We DO NOT do the two-step decomposition from the paper exactly — that
// solves separate similarity / scale-free / scale-fitting passes and is
// elegant for arbitrary handles. For our use case (every pin is a hard
// constraint at vertex granularity) we use the simpler "ARAP energy with
// hard constraints + local-global iteration" formulation by Sorkine &
// Alexa (2007) restricted to 2D, which boils down to:
//
//   Build a cotangent-weighted Laplacian L on the mesh. For each pin
//   vertex i, replace row i of L with e_i (identity row) so that the
//   pin position becomes a Dirichlet boundary condition. Factor once.
//
//   Iterate (2-3 times):
//     1. Local: for each triangle, find the best 2D rotation R_t that
//        maps its rest edges to its current deformed edges (closed-form
//        SVD on a 2x2 covariance).
//     2. Global: build RHS where each row i (non-pin) is the cot-weighted
//        sum of R_t · (rest_edge), and pin rows are pin targets. Solve
//        L · x_new = b. Repeat with x_new as the new "current".
//
// EXPORTS (under window.PuppetWarp):
//   precompute(att)            -> cache  (factorises the system)
//   solve(att, pinTargets, iters=2) -> Float32Array deformed positions
//   invalidate(att, reason)    drop cache (mesh topology changed)
//   debugCacheSize()           introspection

(function buildPuppetWarp() {
  if (typeof window === "undefined") return;
  if (window.PuppetWarp && window.PuppetWarp.__installed) return;

  const SC = window.SparseCholesky;
  const cacheByAtt = new WeakMap();

  // ---------- topology hash ------------------------------------------------
  // Fast cheap hash for "did the mesh structure change". We hash positions
  // length and the indices array. It is OK to be conservative (false positive
  // = rebuild factor, which is cheap).
  function topologyHash(meshData) {
    const positions = meshData.positions;
    const indices = meshData.indices;
    let h = 2166136261 >>> 0;
    h = ((h ^ (positions ? positions.length : 0)) * 16777619) >>> 0;
    h = ((h ^ (indices ? indices.length : 0)) * 16777619) >>> 0;
    if (indices) {
      const step = Math.max(1, Math.floor(indices.length / 32));
      for (let i = 0; i < indices.length; i += step) {
        h = ((h ^ indices[i]) * 16777619) >>> 0;
      }
    }
    return h.toString(16);
  }

  // ---------- cotangent Laplacian ------------------------------------------
  // For each triangle (a,b,c), the cot-Laplacian contribution is:
  //   L[a][a] += cot(C); L[b][b] += cot(C); L[a][b] -= cot(C); L[b][a] -= cot(C)
  // (and analogous for the other two angles). cot(angle at C) is the
  // standard FEM weight. We compute it via:
  //   cot(angle at C) = ((a-c) · (b-c)) / |((a-c) × (b-c))|
  function buildCotLaplacian(positions, indices, vCount) {
    const L = new Float64Array(vCount * vCount); // dense for simplicity
    const triCount = (indices.length / 3) | 0;
    for (let t = 0; t < triCount; t += 1) {
      const ia = indices[t * 3];
      const ib = indices[t * 3 + 1];
      const ic = indices[t * 3 + 2];
      const ax = positions[ia * 2], ay = positions[ia * 2 + 1];
      const bx = positions[ib * 2], by = positions[ib * 2 + 1];
      const cx = positions[ic * 2], cy = positions[ic * 2 + 1];
      const cotA = cot2D(bx - ax, by - ay, cx - ax, cy - ay); // angle at A, opp edge bc
      const cotB = cot2D(ax - bx, ay - by, cx - bx, cy - by); // angle at B, opp edge ac
      const cotC = cot2D(ax - cx, ay - cy, bx - cx, by - cy); // angle at C, opp edge ab
      // angle at A is opposite edge (b,c); contributes cot(A) to that edge
      addEdgeWeight(L, vCount, ib, ic, cotA);
      addEdgeWeight(L, vCount, ia, ic, cotB);
      addEdgeWeight(L, vCount, ia, ib, cotC);
    }
    // Half each weight (each edge has been visited from one triangle on each side)
    for (let i = 0; i < vCount * vCount; i += 1) L[i] *= 0.5;
    return L;
  }

  function cot2D(ux, uy, vx, vy) {
    const dot = ux * vx + uy * vy;
    const cross = Math.abs(ux * vy - uy * vx);
    if (cross < 1e-12) return 0; // degenerate
    return dot / cross;
  }

  function addEdgeWeight(L, n, i, j, w) {
    if (i === j) return;
    L[i * n + i] += w;
    L[j * n + j] += w;
    L[i * n + j] -= w;
    L[j * n + i] -= w;
  }

  // ---------- system with pinned rows --------------------------------------
  // Given Laplacian L and pin vertex indices, build the constrained system:
  //   - For each pin vertex i: row i becomes e_i (and column i is zeroed
  //     except diag = 1) — symmetry preserved by also setting L[*][i] = 0
  //     and folding the contribution into RHS.
  // To keep SPD, we use the standard "soft-replace" trick: leave L's entries
  // at row i and zero columns + add a heavy diagonal. Sorkine's "remove
  // pinned columns" approach is cleaner but trickier to plug into a
  // generic LDLᵀ — instead we use Lagrange-free: replace rows + columns and
  // patch RHS.
  //
  // Simpler still (and what we do): augment L with very large weights on
  // the pinned diagonals. This preserves symmetry, stays SPD, and solving
  // is just Lᵀx = b with the pin entries pulling x close to the targets.
  // The penalty weight is high enough that pin error is < 1e-6 of typical
  // mesh size.
  const PIN_PENALTY = 1e8;

  function buildPinnedSystem(L, vCount, pinVertices) {
    // Output as a CSC of the lower triangle.
    const Mdense = new Float64Array(vCount * vCount);
    for (let i = 0; i < vCount * vCount; i += 1) Mdense[i] = L[i];
    for (let p = 0; p < pinVertices.length; p += 1) {
      const i = pinVertices[p];
      Mdense[i * vCount + i] += PIN_PENALTY;
    }
    // Convert dense to CSC lower-tri (the SC factor reads symmetric so this
    // works for our SPD inputs).
    const Ap = new Int32Array(vCount + 1);
    const rows = [];
    const vals = [];
    for (let j = 0; j < vCount; j += 1) {
      Ap[j] = rows.length;
      for (let i = j; i < vCount; i += 1) {
        const v = Mdense[i * vCount + j];
        if (v !== 0) {
          rows.push(i);
          vals.push(v);
        }
      }
    }
    Ap[vCount] = rows.length;
    return {
      n: vCount,
      Ap,
      Ai: Int32Array.from(rows),
      Ax: Float64Array.from(vals),
    };
  }

  // ---------- precompute ---------------------------------------------------
  function precompute(att) {
    if (!att || !att.meshData) return null;
    const md = att.meshData;
    const positions = md.positions;
    const indices = md.indices;
    if (!positions || !indices || positions.length < 6 || indices.length < 3) return null;
    const vCount = (positions.length / 2) | 0;
    const pins = att.puppetWarp && Array.isArray(att.puppetWarp.pins) ? att.puppetWarp.pins : [];
    const pinVertices = pins.map((p) => Number(p.vertexIndex)).filter((v) => v >= 0 && v < vCount);
    const topoHash = topologyHash(md);
    const pinHash = pinVertices.slice().sort((a, b) => a - b).join(",");

    const cached = cacheByAtt.get(att);
    if (cached && cached.topoHash === topoHash && cached.pinHash === pinHash) {
      return cached;
    }

    const L = buildCotLaplacian(positions, indices, vCount);
    // Save rest positions as Float64 for use during solve
    const restX = new Float64Array(vCount);
    const restY = new Float64Array(vCount);
    for (let i = 0; i < vCount; i += 1) {
      restX[i] = positions[i * 2];
      restY[i] = positions[i * 2 + 1];
    }
    // Triangle list as plain arrays for the local rotation step
    const triCount = (indices.length / 3) | 0;
    const triA = new Int32Array(triCount);
    const triB = new Int32Array(triCount);
    const triC = new Int32Array(triCount);
    for (let t = 0; t < triCount; t += 1) {
      triA[t] = indices[t * 3];
      triB[t] = indices[t * 3 + 1];
      triC[t] = indices[t * 3 + 2];
    }
    // Per-triangle cotangents (used in RHS assembly)
    const triCotA = new Float64Array(triCount);
    const triCotB = new Float64Array(triCount);
    const triCotC = new Float64Array(triCount);
    for (let t = 0; t < triCount; t += 1) {
      const ia = triA[t], ib = triB[t], ic = triC[t];
      const ax = restX[ia], ay = restY[ia];
      const bx = restX[ib], by = restY[ib];
      const cx = restX[ic], cy = restY[ic];
      triCotA[t] = cot2D(bx - ax, by - ay, cx - ax, cy - ay);
      triCotB[t] = cot2D(ax - bx, ay - by, cx - bx, cy - by);
      triCotC[t] = cot2D(ax - cx, ay - cy, bx - cx, by - cy);
    }

    let factor = null;
    if (pinVertices.length > 0) {
      const sys = buildPinnedSystem(L, vCount, pinVertices);
      const sym = SC.analyze(sys.n, sys.Ap, sys.Ai);
      factor = SC.factor(sym, sys.Ap, sys.Ai, sys.Ax);
    }

    const cache = {
      topoHash,
      pinHash,
      vCount,
      triCount,
      triA, triB, triC,
      triCotA, triCotB, triCotC,
      L,
      restX, restY,
      pinVertices: Int32Array.from(pinVertices),
      factor,
    };
    cacheByAtt.set(att, cache);
    return cache;
  }

  // ---------- solve --------------------------------------------------------
  // pinTargets: Map or Object of { vertexIndex: {x, y} } in slot-local coords.
  //
  // Returns Float32Array of size vCount * 2, deformed positions in slot-local.
  function solve(att, pinTargets, iters) {
    const cache = precompute(att);
    if (!cache || !cache.factor) {
      // No pins (or no mesh). Return rest as-is.
      const positions = att.meshData.positions;
      return new Float32Array(positions);
    }
    const iterations = Math.max(1, iters | 0 || 2);
    const n = cache.vCount;
    const triCount = cache.triCount;
    const triA = cache.triA, triB = cache.triB, triC = cache.triC;
    const cotA = cache.triCotA, cotB = cache.triCotB, cotC = cache.triCotC;
    const restX = cache.restX, restY = cache.restY;

    // Initialise the deformed positions: start from rest, but pull pinned
    // vertices toward their targets so the first local step has something
    // sensible to fit rotations to.
    const x = new Float64Array(n);
    const y = new Float64Array(n);
    for (let i = 0; i < n; i += 1) { x[i] = restX[i]; y[i] = restY[i]; }
    for (const p of cache.pinVertices) {
      const t = readTarget(pinTargets, p);
      if (t) { x[p] = t.x; y[p] = t.y; }
    }

    // Per-triangle 2x2 rotation, stored as (cos, sin)
    const rotC = new Float64Array(triCount);
    const rotS = new Float64Array(triCount);

    const bX = new Float64Array(n);
    const bY = new Float64Array(n);

    for (let it = 0; it < iterations; it += 1) {
      // 1. Local: best-fit rotation per triangle.
      // For 2D, the best rotation aligning rest edges {p_j - p_i} to
      // current edges {q_j - q_i} weighted by cotangents is the rotation
      // R such that (R · sum_e w_e (rest_e ⊗ cur_e)) is symmetric.
      // The 2x2 SVD reduces to: covariance S = sum w_e (rest ⊗ cur);
      //   tr = S[0,0] + S[1,1]; cr = S[0,1] - S[1,0];
      //   theta = atan2(cr, tr) gives the rotation; (cos, sin) = (tr, cr) / sqrt(tr²+cr²)
      for (let t = 0; t < triCount; t += 1) {
        const ia = triA[t], ib = triB[t], ic = triC[t];
        // edges around the triangle: (b->c) with cotA, (c->a) with cotB, (a->b) with cotC
        let s00 = 0, s01 = 0, s10 = 0, s11 = 0;
        // edge bc
        {
          const erx = restX[ic] - restX[ib];
          const ery = restY[ic] - restY[ib];
          const ecx = x[ic] - x[ib];
          const ecy = y[ic] - y[ib];
          const w = cotA[t];
          s00 += w * erx * ecx;
          s01 += w * erx * ecy;
          s10 += w * ery * ecx;
          s11 += w * ery * ecy;
        }
        // edge ca
        {
          const erx = restX[ia] - restX[ic];
          const ery = restY[ia] - restY[ic];
          const ecx = x[ia] - x[ic];
          const ecy = y[ia] - y[ic];
          const w = cotB[t];
          s00 += w * erx * ecx;
          s01 += w * erx * ecy;
          s10 += w * ery * ecx;
          s11 += w * ery * ecy;
        }
        // edge ab
        {
          const erx = restX[ib] - restX[ia];
          const ery = restY[ib] - restY[ia];
          const ecx = x[ib] - x[ia];
          const ecy = y[ib] - y[ia];
          const w = cotC[t];
          s00 += w * erx * ecx;
          s01 += w * erx * ecy;
          s10 += w * ery * ecx;
          s11 += w * ery * ecy;
        }
        const tr = s00 + s11;
        const cr = s10 - s01; // skew of antisymmetric part
        const norm = Math.sqrt(tr * tr + cr * cr);
        if (norm < 1e-12) {
          rotC[t] = 1; rotS[t] = 0;
        } else {
          rotC[t] = tr / norm;
          rotS[t] = cr / norm;
        }
      }

      // 2. Global: assemble RHS bX, bY = sum_triangles cot · R · rest_edge_diff
      for (let i = 0; i < n; i += 1) { bX[i] = 0; bY[i] = 0; }
      for (let t = 0; t < triCount; t += 1) {
        const ia = triA[t], ib = triB[t], ic = triC[t];
        const c = rotC[t], s = rotS[t];
        // For each edge (i,j) in the triangle with weight w, contribute:
        //   b[i] += 0.5 * w * R(rest_i - rest_j); b[j] += 0.5 * w * R(rest_j - rest_i)
        // The 0.5 matches the 0.5 we applied when building L.
        addRotatedEdge(bX, bY, ib, ic, restX[ib] - restX[ic], restY[ib] - restY[ic], cotA[t] * 0.5, c, s);
        addRotatedEdge(bX, bY, ia, ic, restX[ia] - restX[ic], restY[ia] - restY[ic], cotB[t] * 0.5, c, s);
        addRotatedEdge(bX, bY, ia, ib, restX[ia] - restX[ib], restY[ia] - restY[ib], cotC[t] * 0.5, c, s);
      }
      // Add pin penalties to RHS
      for (const p of cache.pinVertices) {
        const target = readTarget(pinTargets, p);
        if (!target) continue;
        bX[p] += PIN_PENALTY * target.x;
        bY[p] += PIN_PENALTY * target.y;
      }

      // Solve
      SC.solve(cache.factor, bX, x);
      SC.solve(cache.factor, bY, y);
    }

    const out = new Float32Array(n * 2);
    for (let i = 0; i < n; i += 1) {
      out[i * 2] = x[i];
      out[i * 2 + 1] = y[i];
    }
    return out;
  }

  function addRotatedEdge(bX, bY, i, j, ex, ey, w, c, s) {
    // R · (ex, ey) = (c*ex - s*ey, s*ex + c*ey)
    const rx = c * ex - s * ey;
    const ry = s * ex + c * ey;
    bX[i] += w * rx;
    bY[i] += w * ry;
    bX[j] -= w * rx;
    bY[j] -= w * ry;
  }

  function readTarget(targets, vertexIndex) {
    if (!targets) return null;
    if (typeof targets.get === "function") return targets.get(vertexIndex) || null;
    if (typeof targets === "object" && Object.prototype.hasOwnProperty.call(targets, vertexIndex)) {
      return targets[vertexIndex];
    }
    return null;
  }

  function invalidate(att, reason) {
    cacheByAtt.delete(att);
  }

  function debugCacheSize() {
    // WeakMap has no size; provide a probe instead
    return "WeakMap (size opaque); call invalidate(att) to clear";
  }

  window.PuppetWarp = {
    __installed: true,
    version: 1,
    precompute,
    solve,
    invalidate,
    debugCacheSize,
  };
})();
