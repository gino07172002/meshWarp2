# Testing & validation

This project uses three layers of test infrastructure. Run all three before
shipping a change.

## Layer 1: static check tools (`tools/check-*.js`)

25 small Node scripts that read source files and assert structural invariants:
no direct `slot.meshData` access, all DOM ids referenced via `els.*` exist
in HTML, every `<script src=...>` has a cache-buster, AI capture domains are
properly registered, etc.

```bash
# Run all of them:
for f in tools/check-*.js; do node "$f"; done
```

Each one prints `<name> check passed.` on success or specific failure
messages. **All must pass.**

When you add a new top-level `app/**/*.js` file:

1. Add a `<script src="app/<path>?v=<datestamp>-N">` to `index.html`.
2. Append the path to the `checks` array in
   `tools/check-cache-busting-assets.js`.
3. Bump the `?v=...` query whenever you change the file (any datestamp scheme
   works as long as it changes).

Some tools read multiple source files concatenated — e.g.
`check-ai-capture-mesh.js` reads `runtime-els.js + runtime.js + runtime-ai-capture.js`
together. If you split a file, extend the affected tools the same way.

## Layer 2: test recipe spec (`docs/superpowers/specs/test-spec-master.md`)

A machine-readable checklist of 115 test recipes across 31 sections. Each
recipe declares prereqs, steps, and verifications in a stable format that
both humans and AI agents can follow.

```bash
# Validate the spec (parser + schema check):
node tools/test-spec-runner.js --validate
```

Should print `Parsed N recipe(s) across M section(s). All recipes validate.`

The spec is **the canonical source of truth for "what each feature should
do"**. When you add a feature, add a recipe section. When you fix a bug,
add a regression-guard recipe.

Recipe schema (one entry):

```markdown
### feature-id
- **summary**: one-line description
- **impl**: file:line refs to the implementation
- **prereqs**: starting state required
- **steps**:
  1. step description (uses the runner step DSL — see below)
- **verify**:
  - `function_returns` `<JS expression>` == `<expected>`
  - `dom_exists` `<CSS selector>` == `true`
- **manual_only**: true|false  (true = needs human eyes; not auto-runnable)
```

## Layer 3: browser test runner

For recipes marked `manual_only: false`, use the browser-side runner.

Open the editor in a browser, then in the console:

```js
// Load the test runner harness (it's already in tools/):
// (see tools/test-runner-browser.js for the active runner)
```

Step DSL:

| Step prefix | Meaning |
|---|---|
| `click:#id` | Dispatch a `click` event on the element |
| `set_value:#id=VALUE` | Set `input.value = VALUE` and dispatch `input` event |
| `set_checked:#id=BOOL` | Set `input.checked` and dispatch `change` |
| `select_option:#id=VALUE` | Set `<select>.value` and dispatch `change` |
| `key:#id=KEY` | Dispatch `keydown` with the given key |
| `wait:MS` | `await new Promise(r => setTimeout(r, MS))` |
| `call:EXPR` | `eval(EXPR)` (for direct API calls) |
| `pointer:overlay@x,y[:drag@x2,y2]` | Synthetic pointerdown/up (or drag) on the canvas overlay |

Verify DSL:

| Verify prefix | Meaning |
|---|---|
| `function_returns` `<JS expr>` `==` `<expected>` | Eval expression, compare with `==` |
| `state_path` `<state.foo.bar>` `==` `<expected>` | Read state field, compare |
| `dom_exists` `<CSS selector>` `==` `true|false` | `document.querySelector()` non-null |
| `dom_text` `<CSS selector>` `==` `<text>` | `.textContent` equals |
| `dom_class` `<CSS selector>` `contains` `<class>` | `.classList.contains` |
| `dom_attr` `<CSS selector>` `<attr>` `==` `<value>` | Attribute value equals |
| `array_length` `<state path>` `==` `<n>` | Array length |

## What the diagnostic surface gives you

Even without running tests, the editor exposes diagnostic data through
`window.debug.*` (defined in `app/core/debug.js`):

```js
debug.snapshot()     // major state at a glance
debug.timing()       // per-frame perf (deform / slotDraw / overlay / total)
debug.actionLog()    // last 50 user-visible actions for repro
debug.errors()       // auto-captured exceptions + manual recordError()
debug.help()         // print the full menu
```

For bug repros, paste `debug.actionLogText()` into the report — it's a
chronological log of what the user clicked + what status messages fired,
with timestamp deltas (`+0.00s`, `+1.23s`, ...).

## CI / pre-commit checklist

Before committing:

```bash
# 1. Syntax-check any file you edited
node --check app/<changed-file>.js

# 2. Run all 25 static checks
for f in tools/check-*.js; do node "$f"; done

# 3. Validate the test spec
node tools/test-spec-runner.js --validate
```

If any of these fail, fix before commit. The check tools should never be
ignored — they encode invariants you'd otherwise discover at runtime
(broken DOM ref, missing cache-buster, stale legacy access pattern).

## When tests catch something stale

The check tools sometimes go stale themselves — e.g. they might require a
specific function to live in `runtime.js` after you split that function
into a sibling file. The fix is usually to teach the tool the new layout
(e.g. read both files concatenated) rather than working around it. See
`tools/check-ai-capture-mesh.js` for the canonical "read multiple files"
pattern.

## Scope of "manual_only: true"

Recipes flagged manual-only either (a) need human eyes for visual
verification (waveform shapes, GPU effects), (b) need browser context the
node validator can't provide (canvas pixel ops), or (c) are repro
checklists for known regressions. Run them by hand during a release.
