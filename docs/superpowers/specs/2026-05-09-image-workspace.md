# Image Workspace

## Goal

Provide a built-in raster editing workspace for imported images and attachment
canvases, so common pre-mesh work can happen inside the editor instead of in an
external image tool.

## Scope

- Load standalone images through file picker, drop zone, or `window.ai`.
- Edit on a 2D work canvas with undo/redo history.
- Crop by dragging a rectangle on the image canvas.
- Rotate, flip, trim transparent bounds, and resize the work canvas.
- Zoom and pan the image view without changing pixels.
- Remove image backgrounds with lazy MediaPipe SelfieSegmentation.
- Round-trip an active attachment through Image Workspace via Edit in Image and
  Apply.
- Expose headless AI bridge tools for automation and verification.

## Architecture

`app/image/image-workspace.js` owns editor state, source/work canvas references,
history, crop state, view transforms, and the `"image"` AI Capture domain.
It does not know about DOM event wiring beyond canvas pointer interactions.

`app/image/image-ops.js` owns pure canvas operations. Each operation takes a
source canvas and returns a new canvas.

`app/image/image-bg-removal.js` owns segmentation model loading and pixel alpha
masking. It can be tested with a fake segmentation provider.

`app/image/image-io.js` owns UI wiring: file/drop load, toolbar buttons,
download, attachment apply, and slot creation.

`app/core/runtime-ai-bridge.js` owns `window.ai` tools. The image tools operate
through the public Image Workspace/Image IO APIs and use the image capture
domain.

## Attachment Round Trip

The attachment flow starts from the right-side Attachment panel. Edit in Image
clones the active attachment canvas into `state.imageEditor.source` and switches
to the image workspace. Apply writes the edited work canvas back to the same
attachment record, releases any old GL texture, refreshes slot UI, records undo,
requests render, and returns to the mesh workspace.

## AI Capture

The image domain snapshot records active state, work size, source attachment
identity, history index/ops, view transform, crop rectangle, and background
removal status. Diffs report semantic changes, and invariants check positive
canvas size, valid history index, attachment source identity, and nonnegative
crop rectangles.

## Validation

- `node tools/test-image-ops.js`
- `node tools/test-image-bg-removal.js`
- `node tools/test-image-attachment-ai.js`
- `node tools/smoke-image-workspace.js`
- `node tools/check-ai-capture-image.js`
- Browser verification with a real JPG at `D:\newExport\1f94a319-35a4-4056-942f-53e8ae32aeba.jpg`
