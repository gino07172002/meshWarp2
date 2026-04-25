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
        // arg is a JS expression like "myFn(1,2)" — evaluate in current scope.
        // eslint-disable-next-line no-new-func
        const f = new Function(`return (${arg});`);
        f();
        return;
      }
      default:
        throw new Error(`unknown step op: ${op}`);
    }
  }

  function evalExpression(expr) {
    // eslint-disable-next-line no-new-func
    return new Function(`return (${expr});`)();
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
    // Try "X Y contains Z"
    let m = txt.match(/^`?(\w+)`?\s+`?([^`]+?)`?\s+(contains)\s+`?(.+?)`?$/);
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
            return actual.contains(expected) ? { ok: true } : { ok: false, reason: `class "${expected}" not on ${target}` };
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
      const ok = String(actual).indexOf(expected) >= 0;
      return ok ? { ok: true } : { ok: false, reason: `actual="${actual}" does not contain "${expected}"` };
    }
    if (op === "==") {
      // Compare loose equality after JSON-ifying expected for primitives.
      let cmp;
      try { cmp = JSON.parse(expected); }
      catch { cmp = expected; }
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
    try {
      // Steps: arrays of strings, may include "1." prefixes already stripped by parser
      const steps = Array.isArray(recipe.steps) ? recipe.steps : [];
      for (const s of steps) {
        // Skip prose lines that don't match step DSL (allow plain English steps to be no-ops in phase 1)
        if (!/^[a-z_]+:/.test(s)) {
          result.errors.push(`SKIPPED (prose only): ${s.slice(0, 80)}`);
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
