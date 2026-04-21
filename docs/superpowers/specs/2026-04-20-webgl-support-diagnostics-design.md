# WebGL Support Diagnostics Dialog

## Goal

Add a detailed WebGL support checker that opens in an in-page dialog so the app can explain why one browser works and another does not without occupying permanent sidebar space.

The feature should help compare browsers such as Firefox and Edge without requiring DevTools or code edits.

## Scope

In scope:

- Add a `Check WebGL Support` action to the existing `Tools` panel.
- Show a detailed report inside a dedicated modal dialog.
- Include a `Copy Report` action for easy sharing.
- Probe `webgl2`, `webgl`, and `experimental-webgl` support independently.
- Report success, failure, exception message, renderer/version info, capabilities, and selected extensions.
- Keep the report usable even when all WebGL context creation attempts fail.

Out of scope:

- Automatic browser-specific fixes.
- Changes to the main render bootstrap or fallback strategy.
- Integrating the new report into the existing project diagnostics list.

## Approaches Considered

### 1. Dedicated in-page dialog

Open a modal dialog with buttons and a scrollable report area when the user runs the WebGL diagnostics command.

Pros:

- Keeps the sidebar clean.
- Matches the "open, inspect, close" workflow.
- Avoids popup blockers because it stays in-page.

Cons:

- Slightly more UI behavior than an inline panel.

### 2. Reuse the existing project diagnostics UI

Treat WebGL support as another diagnostics category and push issues into the existing diagnostics list.

Pros:

- Reuses an existing pattern.

Cons:

- WebGL support is not really a project validation issue.
- Harder to present detailed capability data cleanly.
- Does not match the requested location as well.

## Recommendation

Use approach 1.

It fits the request best because the report is temporary by nature, keeps the left sidebar focused on editing tools, and still provides enough space for a detailed browser comparison report.

## UX Design

Add a `WebGL Support Diagnostics` dialog with:

- `Run Check` button
- `Copy Report` button
- `Close` button
- a summary line
- a scrollable report area using preformatted text

Behavior:

- Clicking the top menu item `Tools > Check WebGL Support` opens the dialog and immediately runs a fresh probe.
- Clicking `Run Check` inside the dialog reruns the probe and replaces the current report.
- Clicking `Copy Report` copies the latest report text to the clipboard.
- Clicking the backdrop, pressing `Escape`, or using `Close` dismisses the dialog.
- If no report exists yet, `Copy Report` stays disabled.
- The summary line should quickly state the best detected context, for example:
  - `WebGL2 available`
  - `WebGL1 available, WebGL2 unavailable`
  - `No WebGL context available`

## Technical Design

### Probe helper

Add a small helper in the runtime layer that performs a fresh capability probe on a temporary canvas instead of reusing the app's live render context.

For each context name in this order:

1. `webgl2`
2. `webgl`
3. `experimental-webgl`

Collect:

- requested context name
- whether context creation succeeded
- whether an exception was thrown
- exception message if any
- `VERSION`
- `SHADING_LANGUAGE_VERSION`
- `VENDOR`
- `RENDERER`
- unmasked vendor/renderer if `WEBGL_debug_renderer_info` is available
- `MAX_TEXTURE_SIZE`
- `MAX_VIEWPORT_DIMS`
- `MAX_VERTEX_ATTRIBS`
- `MAX_TEXTURE_IMAGE_UNITS`
- a short list of important extensions and whether each is present

Important extensions to check:

- `WEBGL_debug_renderer_info`
- `OES_element_index_uint`
- `OES_standard_derivatives`
- `OES_vertex_array_object`
- `WEBGL_lose_context`

For WebGL2, the report should note that some WebGL1 extensions may be built in rather than exposed as extensions.

### Formatting layer

Convert the raw probe result into a readable multiline report string.

The report should contain:

- timestamp
- user agent
- platform info if available
- app bootstrap state summary: `hasGL`, `isWebGL2`, `hasVAO`
- one section per attempted context
- final conclusion with likely causes when all attempts fail

Example likely-cause guidance:

- browser disabled hardware acceleration
- GPU/driver blocklist
- privacy/security policy limitation
- remote desktop / virtualization path

This guidance should be clearly labeled as inference, not certainty.

### UI state

Store the latest probe result and rendered report text in app state so the panel can re-render without re-probing on unrelated UI refreshes.

Suggested additions:

- `state.webglSupport.lastCheckedAt`
- `state.webglSupport.summary`
- `state.webglSupport.reportText`
- `state.webglSupport.raw`

## File Placement

- `index.html`
  - add the WebGL support dialog markup and trigger entry in the top `Tools` menu
- `styles.css`
  - add dialog/backdrop/report styling
- `app/core/runtime.js`
  - add WebGL probe helpers, dialog open/close helpers, and state bucket
- `app/ui/editor-panels.js`
  - bind dialog buttons, backdrop close behavior, and clipboard action

If dialog lifecycle logic fits better in another current UI file after inspection, follow the existing pattern there instead of forcing it.

## Data Flow

1. User chooses `Tools > Check WebGL Support`.
2. UI opens the dialog and triggers a WebGL support probe.
3. UI handler calls the runtime probe helper.
4. Probe helper gathers raw browser WebGL support data on a temporary canvas.
5. Formatter produces summary plus detailed report text.
6. State is updated.
7. Dialog UI refresh renders the latest summary and report.
8. User can click `Copy Report` to copy the rendered text, then close the dialog.

## Error Handling

- If clipboard write fails, keep the report visible and show a status message.
- If a particular context probe throws, record the exception and continue probing the remaining context types.
- If querying a capability throws, record `unavailable` instead of failing the whole report.
- If no WebGL context can be created, still render a complete report with failure details.

## Testing Plan

### Static verification

- Confirm new DOM nodes exist and are wired through `els`.
- Run syntax checks on touched files.
- Add a lightweight static check so the dialog controls and top menu trigger cannot silently disappear in future cleanup.

### Functional verification

- Load the page and trigger `Tools > Check WebGL Support`.
- Confirm the dialog opens and the report renders.
- Confirm `Copy Report` copies the latest report.
- Confirm the dialog closes via backdrop, close button, and `Escape`.
- Confirm the feature still works when the active app render path is 2D fallback.

## Risks

- Browser APIs expose different renderer details depending on privacy settings.
- Some extensions are intentionally hidden in one browser but not another.
- Capability values alone may not explain every failure, so the report must distinguish facts from inferred causes.

## Success Criteria

- A user can run the checker from the `Tools` panel without opening DevTools.
- The report clearly shows what WebGL context types are supported in the current browser.
- The report is detailed enough to compare Firefox and Edge on the same machine.
- The feature does not break page load when WebGL is unavailable.
