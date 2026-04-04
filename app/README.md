# App Script Layout

This project now uses a domain-based classic-script structure instead of a single monolithic `app.js`.

Folders
- `app/core`: shared runtime bootstrap, DOM references, state, math, bone system.
- `app/workspace`: workspace switching, slot lifecycle, slot mesh helpers, constraint model prep.
- `app/render`: constraint application, canvas rendering, interaction helpers, state-machine bridge.
- `app/animation`: animation data model, timeline UI, playback runtime.
- `app/io`: project import/export, diagnostics, tree bindings.
- `app/ui`: editor panels, panel bindings, hotkeys, final bootstrap wiring.

Load order
1. `app/core/runtime.js`
2. `app/core/bones.js`
3. `app/workspace/workspace.js`
4. `app/workspace/slots.js`
5. `app/workspace/constraint-model.js`
6. `app/render/constraints.js`
7. `app/render/canvas.js`
8. `app/render/state-machine.js`
9. `app/animation/model.js`
10. `app/animation/timeline-ui.js`
11. `app/animation/runtime.js`
12. `app/io/tree-bindings.js`
13. `app/io/project-export.js`
14. `app/io/project-actions.js`
15. `app/ui/editor-panels.js`
16. `app/ui/constraint-panels.js`
17. `app/ui/animation-panels.js`
18. `app/ui/timeline-pointer.js`
19. `app/ui/hotkeys.js`
20. `app/ui/bootstrap.js`

Conventions
- Keep shared globals in earlier scripts; later files assume those globals already exist.
- Add new code to the domain folder it belongs to instead of creating more catch-all files.
- Keep startup wiring and top-level event registration in `app/ui`.
