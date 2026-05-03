// Runtime DOM ↔ state invariants for d:\claude.
//
// Purpose:
//   Encode "if app state is X, then this DOM element must look like Y" as
//   data, not as ad-hoc tests. Each invariant is one rule:
//
//     {
//       id:        unique slug
//       when:      () => boolean    — does this rule apply right now?
//       expect:    () => boolean    — when it applies, must this hold?
//       describe:  () => string     — human description for failure
//       rationale: string           — *why* this rule exists; cites the bug
//                                     or trace that motivated it
//     }
//
// The motivating example is the workspaceTabObject failure trace
// (D:/harness/.worktrees/environment-fixture/traces/20260501T060902560215Z.json).
// In that bug, state.mesh was truthy but #workspaceTabObject.disabled was
// still true, swallowing pointer clicks. There is now a static check that
// guards the source-level fix; this file guards the runtime invariant so a
// future regression in any other call path also gets caught.
//
// Two ways to use it:
//
// 1. Browser (DevTools console, while the app is running):
//      fetch("/tools/dom-state-invariants.js").then(r => r.text()).then(eval);
//      const r = window.domStateInvariants.check();
//      console.table(r.violations);
//
// 2. Node (rule catalog only — does not run any rule):
//      node tools/dom-state-invariants.js --list      # one rule id per line
//      node tools/dom-state-invariants.js --json      # full JSON catalog
//      node tools/dom-state-invariants.js --validate  # parse-only sanity

(function (global) {
  // ── Rule library ────────────────────────────────────────────────────────
  // Keep rules small, single-fact, and self-justifying. If a rule needs more
  // than two clauses to explain, split it.
  const RULES = [
    {
      id: "workspace-object-tab-enabled-when-mesh",
      // Browser-only predicates. Node sees them as functions but does not
      // call them — the catalog lists them as descriptive strings instead
      // (see exposeForCatalog below).
      when: function () { try { return !!(state && state.mesh); } catch (_e) { return false; } },
      expect: function () {
        const el = global.document && global.document.getElementById("workspaceTabObject");
        return !!el && !el.disabled;
      },
      describe: function () { return "state.mesh truthy ⇒ #workspaceTabObject must not be disabled"; },
      rationale:
        "Failure trace 20260501T060902560215Z showed pointerdown 26 / pointerup 26 / click 0 on " +
        "this tab because disabled=true was never refreshed after image import. Disabled <button> " +
        "elements receive pointer events but never dispatch click. " +
        "See app/io/tree-bindings.js (the post-import updateWorkspaceUI() call) " +
        "and app/workspace/workspace.js (pointerup self-heal fallback).",
      sources: [
        "app/io/tree-bindings.js",
        "app/workspace/workspace.js",
        "app/core/bones-tree-ui.js",
      ],
    },
    {
      id: "workspace-mesh-tab-enabled-when-mesh",
      // Same gating logic applies to the Mesh tab; if a future change adds
      // a similar disabled toggle there, this rule guards it preemptively.
      when: function () { try { return !!(state && state.mesh); } catch (_e) { return false; } },
      expect: function () {
        const el = global.document && global.document.getElementById("workspaceTabSlot");
        return !!el && !el.disabled;
      },
      describe: function () { return "state.mesh truthy ⇒ #workspaceTabSlot must not be disabled"; },
      rationale:
        "Mesh and Object tabs share the same gating premise (require state.mesh). The Object " +
        "trace bug would have hit Mesh too if disabled was wired the same way; this rule keeps " +
        "the invariant explicit instead of waiting for a parallel regression.",
      sources: [
        "app/core/bones-tree-ui.js",
      ],
    },
    {
      id: "workspace-rig-tab-always-enabled",
      // Rig is the always-available default workspace. It must never be
      // disabled — if it were, the user could be locked out of every tab.
      when: function () { return true; },
      expect: function () {
        const el = global.document && global.document.getElementById("workspaceTabRig");
        return !!el && !el.disabled;
      },
      describe: function () { return "#workspaceTabRig must always be enabled"; },
      rationale:
        "Rig is the recovery surface for the workspace switcher. If it ever became disabled, " +
        "users with no mesh imported would have no clickable tab at all.",
      sources: ["app/core/bones-tree-ui.js"],
    },
    {
      id: "active-tab-matches-current-ws",
      // The .active class on the workspace tabs must agree with state.
      // `state`, `els`, `getCurrentWsType` are top-level `const` in classic
      // <script>s — they live in script scope, not on window — so we look
      // them up via try/identifier instead of global.X.
      when: function () {
        try {
          return !!(global.document
            && global.document.getElementById("workspaceTabRig")
            && global.document.getElementById("workspaceTabSlot")
            && global.document.getElementById("workspaceTabObject")
            && typeof getCurrentWsType === "function");
        } catch (_e) { return false; }
      },
      expect: function () {
        let ws;
        try { ws = getCurrentWsType(); } catch (_e) { return false; }
        const map = {
          rig: "workspaceTabRig",
          mesh: "workspaceTabSlot",
          object: "workspaceTabObject",
        };
        const activeId = map[ws];
        if (!activeId) return false;
        const ids = ["workspaceTabRig", "workspaceTabSlot", "workspaceTabObject"];
        for (const id of ids) {
          const el = global.document.getElementById(id);
          if (!el) return false;
          const isActive = el.classList.contains("active");
          if (id === activeId && !isActive) return false;
          if (id !== activeId && isActive) return false;
        }
        return true;
      },
      describe: function () {
        return "exactly one workspace tab carries .active, and it matches getCurrentWsType()";
      },
      rationale:
        "If updateWorkspaceUI() is skipped after a state mutation, .active drifts from state. " +
        "This rule catches the same class of bug the Object trace surfaced, but on the visual " +
        "highlight side rather than the disabled side.",
      sources: ["app/core/bones-tree-ui.js"],
    },
    // (Removed `addBoneBtn-only-visible-in-rig-edit`: the rule was added
    // speculatively and tried to enforce "if #addBoneBtn is visible, app
    // must be in skeleton+edit". A wave-7 audit found the rule was wrong on
    // its premise — the button lives inside a <details> panel and is
    // intentionally always present in DOM regardless of editMode. The
    // rule's `display !== "none"` check also did not look through
    // collapsed-ancestor visibility, so it false-positived in mesh mode.
    // Removed rather than patched: there is no documented bug it was
    // guarding, and "always-present" buttons are common in the editor.)
  ];

  // ── Browser-side runner ────────────────────────────────────────────────
  function check(opts) {
    const options = opts || {};
    const ids = options.only && options.only.length ? new Set(options.only) : null;
    const violations = [];
    const checked = [];
    for (const rule of RULES) {
      if (ids && !ids.has(rule.id)) continue;
      let applies, holds, error = null;
      try { applies = !!rule.when(); } catch (err) {
        violations.push({ id: rule.id, kind: "when-threw", message: String(err && err.message || err) });
        continue;
      }
      checked.push(rule.id);
      if (!applies) continue;
      try { holds = !!rule.expect(); } catch (err) {
        violations.push({ id: rule.id, kind: "expect-threw", message: String(err && err.message || err) });
        continue;
      }
      if (!holds) {
        violations.push({
          id: rule.id,
          kind: "violation",
          describe: rule.describe(),
          rationale: rule.rationale,
        });
      }
    }
    return {
      ok: violations.length === 0,
      total: RULES.length,
      checked: checked.length,
      violations,
      timestamp: Date.now(),
    };
  }

  function listRules() {
    return RULES.map(function (r) {
      return {
        id: r.id,
        describe: typeof r.describe === "function" ? r.describe() : null,
        rationale: r.rationale,
        sources: r.sources || [],
      };
    });
  }

  // Expose to window/global so DevTools / headless can find us.
  global.domStateInvariants = {
    check: check,
    list: listRules,
    rules: RULES,
  };

  // ── Node CLI mode ──────────────────────────────────────────────────────
  // This block only runs under Node (where module.exports exists). In a
  // browser, top-level `module` is undefined so this is skipped cleanly.
  if (typeof module !== "undefined" && module.exports) {
    module.exports = { check: check, list: listRules, rules: RULES };
    if (require.main === module) {
      const args = process.argv.slice(2);
      if (args.includes("--help") || args.includes("-h")) {
        process.stdout.write([
          "Usage:",
          "  node tools/dom-state-invariants.js --list      # one id per line",
          "  node tools/dom-state-invariants.js --json      # full catalog",
          "  node tools/dom-state-invariants.js --validate  # parse-only sanity",
          "",
          "Browser usage (paste in DevTools while app is loaded):",
          "  fetch('/tools/dom-state-invariants.js').then(r=>r.text()).then(eval);",
          "  console.table(window.domStateInvariants.check().violations);",
        ].join("\n") + "\n");
        process.exit(0);
      }
      if (args.includes("--list")) {
        for (const r of listRules()) process.stdout.write(r.id + "\n");
        process.exit(0);
      }
      if (args.includes("--json")) {
        process.stdout.write(JSON.stringify(listRules(), null, 2) + "\n");
        process.exit(0);
      }
      if (args.includes("--validate") || args.length === 0) {
        // Sanity: every rule must have id/when/expect/describe/rationale.
        const issues = [];
        const seenIds = new Set();
        for (const r of RULES) {
          if (!r.id || typeof r.id !== "string") issues.push("rule missing id");
          if (seenIds.has(r.id)) issues.push("duplicate id: " + r.id);
          seenIds.add(r.id);
          for (const fnKey of ["when", "expect", "describe"]) {
            if (typeof r[fnKey] !== "function") issues.push(r.id + ": missing " + fnKey + "()");
          }
          if (!r.rationale || typeof r.rationale !== "string") issues.push(r.id + ": missing rationale");
        }
        if (issues.length) {
          for (const i of issues) process.stderr.write(i + "\n");
          process.exit(1);
        }
        process.stdout.write("dom-state-invariants: " + RULES.length + " rules well-formed\n");
        process.exit(0);
      }
      process.stderr.write("unknown args; try --help\n");
      process.exit(2);
    }
  }
})(typeof globalThis !== "undefined"
  ? globalThis
  : (typeof window !== "undefined" ? window : (typeof global !== "undefined" ? global : this)));
