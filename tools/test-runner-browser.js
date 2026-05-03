// Browser-side test runner for test-spec-master.md.
//
// This file is meant to be loaded *into the live editor page* (e.g. via
// DevTools console: `await fetch('/tools/test-runner-browser.js').then(r=>r.text()).then(eval)`
// or a bookmarklet). It does NOT run under Node — it runs in the actual
// browser context where `state`, `els`, the editor's globals are defined.
//
// Phase 1 capability:
//   - Read recipes JSON (caller provides; usually fetched from
//     test-spec-master.md via the node parser, then sent over).
//   - Execute steps using a small DSL covering: click, set_value, set_checked,
//     select_option, key, wait, call.
//   - Run verify lines: state_path, function_returns, dom_text, dom_class,
//     dom_attr, dom_exists, array_length.
//   - Returns a result object with pass/fail counts and per-recipe details.
//
// Not yet implemented (phase 2): pointer:overlay@x,y drags, screenshot diff.

(function (global) {
  if (global.editorTestRunner) return;

  function delay(ms) { return new Promise((r) => setTimeout(r, Math.max(0, Number(ms) || 0))); }

  function getEl(sel) {
    if (!sel || sel[0] !== "#") throw new Error(`only #id selectors supported, got ${sel}`);
    const el = document.getElementById(sel.slice(1));
    if (!el) throw new Error(`element not found: ${sel}`);
    return el;
  }

  function fireEvent(el, type, init = {}) {
    const ev = type.startsWith("key")
      ? new KeyboardEvent(type, { bubbles: true, cancelable: true, ...init })
      : type === "input" || type === "change"
        ? new Event(type, { bubbles: true })
        : new MouseEvent(type, { bubbles: true, cancelable: true, ...init });
    el.dispatchEvent(ev);
  }

  // Per-recipe scratchpad. Set by runRecipe before calling execStep / execVerify
  // and reset at the start of each recipe. Recipes can stash values across
  // lines via `set:NAME=expr` and read them back as `scratch.NAME` in any
  // later step or verify expression.
  let currentScratch = Object.create(null);

  async function execStep(step) {
    const m = String(step).match(/^(\w+):(.*)$/);
    if (!m) throw new Error(`bad step: ${step}`);
    const op = m[1];
    const arg = m[2];
    switch (op) {
      case "click": {
        getEl(arg).click();
        return;
      }
      case "set_value": {
        const eq = arg.indexOf("=");
        const sel = arg.slice(0, eq);
        const val = arg.slice(eq + 1);
        const el = getEl(sel);
        el.value = val;
        fireEvent(el, "input");
        fireEvent(el, "change");
        return;
      }
      case "set_checked": {
        const eq = arg.indexOf("=");
        const sel = arg.slice(0, eq);
        const val = arg.slice(eq + 1).toLowerCase() === "true";
        const el = getEl(sel);
        el.checked = val;
        fireEvent(el, "change");
        return;
      }
      case "select_option": {
        const eq = arg.indexOf("=");
        const sel = arg.slice(0, eq);
        const val = arg.slice(eq + 1);
        const el = getEl(sel);
        el.value = val;
        fireEvent(el, "change");
        return;
      }
      case "key": {
        // Format: "v" or "ctrl+c" or "Delete"
        const parts = arg.split("+");
        const key = parts[parts.length - 1];
        const ctrlKey = parts.includes("ctrl");
        const metaKey = parts.includes("meta");
        const shiftKey = parts.includes("shift");
        const altKey = parts.includes("alt");
        const ev = new KeyboardEvent("keydown", { key, ctrlKey, metaKey, shiftKey, altKey, bubbles: true, cancelable: true });
        window.dispatchEvent(ev);
        return;
      }
      case "wait": {
        const ms = arg.endsWith("ms") ? parseInt(arg.slice(0, -2), 10) : parseInt(arg, 10);
        await delay(ms);
        return;
      }
      case "call": {
        // arg is a JS expression like "myFn(1,2)" — evaluate in the recipe's
        // scratch scope so it can read/write scratch.X.
        evalExpression(arg);
        return;
      }
      case "set": {
        // Format: "NAME=expr". Evaluates expr in scratch scope and stashes
        // the result as scratch[NAME]. Lets a recipe record a "before" value
        // and reference it from a later verify line as `scratch.NAME`.
        const eq = arg.indexOf("=");
        if (eq < 0) throw new Error(`set step needs NAME=expr, got: ${arg}`);
        const name = arg.slice(0, eq).trim();
        const expr = arg.slice(eq + 1).trim();
        if (!/^[A-Za-z_][\w]*$/.test(name)) throw new Error(`set: NAME must be an identifier, got "${name}"`);
        currentScratch[name] = evalExpression(expr);
        return;
      }
      case "pointer": {
        // Format: "overlay@x,y" or "overlay@x,y:drag@x2,y2"
        // Synthesises pointerdown/move/up on #overlay with coordinates in CSS px.
        // x/y can be literal numbers OR cx/cy (overlay center) with optional
        // +N / -N offsets, e.g. "overlay@cx,cy:drag@cx+50,cy".
        return execPointerStep(arg);
      }
      default:
        throw new Error(`unknown step op: ${op}`);
    }
  }

  // Resolve one pointer-step coordinate token. Accepts:
  //   "120"        → 120
  //   "-15.5"      → -15.5
  //   "cx" / "cy"  → overlay center (in overlay-local CSS px)
  //   "cx+50"      → overlay center + 50
  //   "cy-30"      → overlay center - 30
  // Offsets are integer or decimal; only one +/- term allowed.
  function resolvePointerCoord(token, axis, overlay) {
    const t = String(token).trim();
    if (/^-?\d+(?:\.\d+)?$/.test(t)) return Number(t);
    const rect = overlay.getBoundingClientRect();
    const center = axis === "x" ? rect.width / 2 : rect.height / 2;
    const m = t.match(/^c([xy])\s*(?:([+-])\s*(\d+(?:\.\d+)?))?$/);
    if (!m) throw new Error(`bad pointer coord "${token}" (expected number, cx, cy, cx+N, cy-N)`);
    if (m[1] !== axis) throw new Error(`pointer coord "${token}" used for ${axis} axis but names c${m[1]}`);
    if (!m[2]) return center;
    const off = Number(m[3]);
    return m[2] === "+" ? center + off : center - off;
  }

  async function execPointerStep(arg) {
    // arg = "overlay@x,y"  or  "overlay@x,y:drag@x2,y2"
    // x/y tokens may be: literal number, "cx", "cy", or "cx±N" / "cy±N".
    const overlay = document.getElementById("overlay");
    if (!overlay) throw new Error("#overlay not found");
    // Split into landing point and optional drag target. Coords are still
    // tokenized by the resolver, so we just pull out comma-separated halves.
    const m1 = arg.match(/^overlay@([^,]+),\s*([^:]+?)(?::drag@([^,]+),\s*(.+?))?$/);
    if (!m1) throw new Error(`bad pointer step: ${arg}`);
    const x0 = resolvePointerCoord(m1[1], "x", overlay);
    const y0 = resolvePointerCoord(m1[2], "y", overlay);
    const x1 = m1[3] != null ? resolvePointerCoord(m1[3], "x", overlay) : null;
    const y1 = m1[4] != null ? resolvePointerCoord(m1[4], "y", overlay) : null;
    const rect = overlay.getBoundingClientRect();
    const toClient = (x, y) => ({ clientX: rect.left + x, clientY: rect.top + y });
    const pointerId = 9999; // arbitrary synthetic id
    const fire = (type, x, y, opts = {}) => {
      const c = toClient(x, y);
      const ev = new PointerEvent(type, {
        bubbles: true, cancelable: true,
        pointerId, pointerType: "mouse",
        clientX: c.clientX, clientY: c.clientY,
        button: 0, buttons: type === "pointerup" ? 0 : 1,
        ...opts,
      });
      overlay.dispatchEvent(ev);
    };
    fire("pointerdown", x0, y0);
    if (x1 != null && y1 != null) {
      // Move in 4 evenly spaced steps for a more natural drag.
      for (let i = 1; i <= 4; i += 1) {
        const t = i / 4;
        const x = x0 + (x1 - x0) * t;
        const y = y0 + (y1 - y0) * t;
        fire("pointermove", x, y);
        await delay(8);
      }
      fire("pointerup", x1, y1);
    } else {
      fire("pointerup", x0, y0);
    }
  }

  function evalExpression(expr) {
    // `scratch` is exposed as a local so `set:NAME=expr` and later
    // `function_returns \`scratch.NAME\`` lines can talk to each other
    // across recipe lines (each line otherwise evaluates in its own
    // function scope and can't see local variables from earlier lines).
    // The script-level `state` / `els` consts are still reachable as
    // identifiers because new Function()'s body runs in global scope.
    // eslint-disable-next-line no-new-func
    return new Function("scratch", `return (${expr});`)(currentScratch);
  }

  function execVerify(v) {
    // v is a string like:
    //   "`state_path` `state.foo.bar` == `42`"
    //   "`function_returns` `someFn()` == `true`"
    //   "`dom_text` `#elem` contains `hello`"
    // Robust parse: split on "==" or "contains" tokens and strip backticks.
    const txt = String(v).trim();
    const stripBackticks = (s) => s.trim().replace(/^`|`$/g, "").trim();
    let kind, target, op, expected;
    // Try "X Y contains Z" (and "has Z" for dom_class — it accepts has).
    let m = txt.match(/^`?(\w+)`?\s+`?([^`]+?)`?\s+(contains|has)\s+`?(.+?)`?$/);
    if (m) { kind = m[1]; target = stripBackticks(m[2]); op = m[3]; expected = stripBackticks(m[4]); }
    if (!m) {
      m = txt.match(/^`?(\w+)`?\s+`?([^`]+?)`?\s+(==)\s+`?(.+?)`?$/);
      if (m) { kind = m[1]; target = stripBackticks(m[2]); op = m[3]; expected = stripBackticks(m[4]); }
    }
    if (!m) {
      // dom_exists has no operator
      m = txt.match(/^`?(\w+)`?\s+`?([^`]+?)`?$/);
      if (m) { kind = m[1]; target = stripBackticks(m[2]); op = "exists"; expected = "true"; }
    }
    if (!m) return { ok: false, reason: `unparseable verify: ${txt}` };
    // Spec authors often write `contains \`"ON"\`` or `has \`"active"\`` with
    // double-quotes around the literal for emphasis. Strip a single matching
    // pair of surrounding quotes off `expected` before any compare runs.
    const stripQuotes = (s) => {
      if (typeof s !== "string") return s;
      const t = s.trim();
      if (t.length >= 2 && ((t[0] === '"' && t[t.length - 1] === '"') || (t[0] === "'" && t[t.length - 1] === "'"))) {
        return t.slice(1, -1);
      }
      return s;
    };
    let actual;
    try {
      switch (kind) {
        case "state_path":
        case "function_returns": {
          actual = evalExpression(target);
          break;
        }
        case "dom_text": {
          actual = (document.querySelector(target) || {}).textContent || "";
          break;
        }
        case "dom_class": {
          actual = (document.querySelector(target) || { classList: { contains: () => false } }).classList;
          if (op === "contains" || op === "has") {
            const wanted = stripQuotes(expected);
            return actual.contains(wanted) ? { ok: true } : { ok: false, reason: `class "${wanted}" not on ${target}` };
          }
          return { ok: false, reason: `dom_class needs "contains" / "has" op` };
        }
        case "dom_attr": {
          // target like body[data-foo]; split selector + attr
          const am = target.match(/^(.*)\[([^\]]+)\]$/);
          if (!am) return { ok: false, reason: `dom_attr target needs [attr]: ${target}` };
          actual = (document.querySelector(am[1]) || { getAttribute: () => null }).getAttribute(am[2]);
          break;
        }
        case "dom_exists": {
          actual = !!document.querySelector(target);
          expected = "true";
          break;
        }
        case "array_length": {
          const arr = evalExpression(target);
          actual = Array.isArray(arr) ? arr.length : (arr && arr.size != null ? arr.size : NaN);
          break;
        }
        default:
          return { ok: false, reason: `unknown verify kind: ${kind}` };
      }
    } catch (err) {
      return { ok: false, reason: `eval threw: ${err.message}` };
    }
    if (op === "contains") {
      const wanted = stripQuotes(expected);
      const ok = String(actual).indexOf(wanted) >= 0;
      return ok ? { ok: true } : { ok: false, reason: `actual="${actual}" does not contain "${wanted}"` };
    }
    if (op === "==") {
      // Compare loose equality after JSON-ifying expected for primitives.
      // JSON.parse("\"foo\"") → "foo", JSON.parse("42") → 42, JSON.parse("true") → true.
      // For barewords like `mode` JSON.parse throws and we fall back to a
      // (quote-stripped) string compare.
      let cmp;
      try { cmp = JSON.parse(expected); }
      catch { cmp = stripQuotes(expected); }
      const ok = actual === cmp || String(actual) === String(cmp);
      return ok ? { ok: true } : { ok: false, reason: `actual=${JSON.stringify(actual)} expected=${JSON.stringify(cmp)}` };
    }
    if (op === "exists") {
      return actual ? { ok: true } : { ok: false, reason: "element does not exist" };
    }
    return { ok: false, reason: `unhandled op: ${op}` };
  }

  async function runRecipe(recipe) {
    const result = { id: recipe.id, section: recipe.section, ok: true, steps: 0, verifyPass: 0, verifyFail: 0, errors: [] };
    if (recipe.manual_only) {
      result.ok = null;
      result.skipped = "manual_only";
      return result;
    }
    // Each recipe gets a fresh scratch object so values don't bleed across.
    currentScratch = Object.create(null);
    try {
      // Steps: arrays of strings, may include "1." prefixes already stripped
      // by parser. Spec authors often write `click:#foo` with markdown
      // backticks, so strip those before classifying.
      const steps = Array.isArray(recipe.steps) ? recipe.steps : [];
      for (const sRaw of steps) {
        const s = String(sRaw).trim().replace(/^`+|`+$/g, "").trim();
        // Skip prose lines that don't match step DSL (allow plain English steps to be no-ops in phase 1)
        if (!/^[a-z_]+:/.test(s)) {
          result.errors.push(`SKIPPED (prose only): ${sRaw.slice(0, 80)}`);
          continue;
        }
        await execStep(s);
        result.steps += 1;
      }
      const verify = Array.isArray(recipe.verify) ? recipe.verify : [];
      for (const v of verify) {
        const r = execVerify(v);
        if (r.ok) result.verifyPass += 1;
        else { result.verifyFail += 1; result.errors.push(`verify failed: ${r.reason} | line: ${v}`); }
      }
      if (result.verifyFail > 0) result.ok = false;
    } catch (err) {
      result.ok = false;
      result.errors.push(`exception: ${err && err.message ? err.message : String(err)}`);
    }
    return result;
  }

  async function runAll(recipes, opts = {}) {
    const filter = opts.filter ? new RegExp(opts.filter) : null;
    const summary = { total: 0, pass: 0, fail: 0, skipped: 0, results: [] };
    for (const r of recipes) {
      if (filter && !filter.test(r.id)) continue;
      summary.total += 1;
      const res = await runRecipe(r);
      summary.results.push(res);
      if (res.ok === null) summary.skipped += 1;
      else if (res.ok) summary.pass += 1;
      else summary.fail += 1;
      console.log(`[${res.ok === null ? "SKIP" : res.ok ? "PASS" : "FAIL"}] ${res.id}`,
        res.errors.length > 0 ? res.errors : "");
    }
    console.log("\n=== Test summary ===");
    console.log(`pass: ${summary.pass}  fail: ${summary.fail}  skipped: ${summary.skipped}  total: ${summary.total}`);
    return summary;
  }

  global.editorTestRunner = {
    runAll,
    runRecipe,
    _internal: { execStep, execVerify, evalExpression },
  };
})(typeof window !== "undefined" ? window : globalThis);
