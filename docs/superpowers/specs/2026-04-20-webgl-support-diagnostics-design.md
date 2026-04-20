# WebGL Support Diagnostics In Tools Panel

## Goal

Add a detailed WebGL support checker inside the left `Tools` panel so the app can explain why one browser works and another does not.

The feature should help compare browsers such as Firefox and Edge without requiring DevTools or code edits.

## Scope

In scope:

- Add a `Check WebGL Support` action to the existing `Tools` panel.
- Show a detailed report directly inside the `Tools` panel.
- Include a `Copy Report` action for easy sharing.
- Probe `webgl2`, `webgl`, and `experimental-webgl` support independently.
- Report success, failure, exception message, renderer/version info, capabilities, and selected extensions.
- Keep the report usable even when all WebGL context creation attempts fail.

Out of scope:

- Automatic browser-specific fixes.
- Changes to the main render bootstrap or fallback strategy.
- Integrating the new report into the existing project diagnostics list.

## Approaches Considered

### 1. Inline text report in `Tools` panel

Add a small diagnostics block with buttons and a scrollable report area inside the existing `Tools` panel.

Pros:

- Fastest way to compare browsers.
- Matches the requested location.
- Lowest risk to existing diagnostics flow.

Cons:

- Adds more content to the left panel.

### 2. Reuse the existing project diagnostics UI

Treat WebGL support as another diagnostics category and push issues into the existing diagnostics list.

Pros:

- Reuses an existing pattern.

Cons:

- WebGL support is not really a project validation issue.
- Harder to present detailed capability data cleanly.
- Does not match the requested location as well.

### 3. Modal or separate dock

Open a dedicated panel with detailed WebGL information.

Pros:

- Plenty of room for rich data.

Cons:

- Heavier UI change than needed.
- Slower for repeated browser comparisons.

## Recommendation

Use approach 1.

It is the clearest fit for the request, keeps the feature local to the `Tools` panel, and avoids mixing browser/runtime support diagnostics with project content diagnostics.

## UX Design

Inside the existing `Tools` section, add a new `WebGL Support` subsection with:

- `Check WebGL Support` button
- `Copy Report` button
- a summary line
- a scrollable report area using preformatted text

Behavior:

- Clicking `Check WebGL Support` runs a fresh probe and replaces the current report.
- Clicking `Copy Report` copies the latest report text to the clipboard.
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
  - add the `WebGL Support` subsection in the `Tools` panel
- `styles.css`
  - add compact styling for the report block
- `app/core/runtime.js`
  - add WebGL probe helpers and state bucket
- `app/core/bones.js`
  - extend panel refresh logic for tool panel visibility/state sync
- `app/ui/editor-panels.js`
  - bind the new buttons and clipboard action

If panel refresh logic fits better in another current UI file after inspection, follow the existing pattern there instead of forcing it.

## Data Flow

1. User opens the `Tools` tab.
2. User clicks `Check WebGL Support`.
3. UI handler calls the runtime probe helper.
4. Probe helper gathers raw browser WebGL support data on a temporary canvas.
5. Formatter produces summary plus detailed report text.
6. State is updated.
7. UI refresh renders the latest summary and report.
8. User can click `Copy Report` to copy the rendered text.

## Error Handling

- If clipboard write fails, keep the report visible and show a status message.
- If a particular context probe throws, record the exception and continue probing the remaining context types.
- If querying a capability throws, record `unavailable` instead of failing the whole report.
- If no WebGL context can be created, still render a complete report with failure details.

## Testing Plan

### Static verification

- Confirm new DOM nodes exist and are wired through `els`.
- Run syntax checks on touched files.
- Add a lightweight static check so the new `Tools` panel controls cannot silently disappear in future cleanup.

### Functional verification

- Load the page and open the `Tools` tab.
- Run the WebGL support check and confirm the report renders.
- Confirm `Copy Report` copies the latest report.
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
