// Fixture presets for tools/run-spec-headless.js.
//
// Why this exists: most AUTO recipes in test-spec-master.md assume the editor
// has been used a bit before the recipe runs (image imported, mesh built,
// bones added, weights painted, …). The headless runner spawns a fresh
// editor with `state.mesh = null`, so those recipes hit Category A from
// docs/superpowers/runbooks/headless-spec-failures.md and die before
// reaching their real assertion.
//
// This file is loaded into the page next to tools/test-runner-browser.js by
// run-spec-headless.js. It exposes `window.headlessFixtures` with a small
// catalog of named presets. The runner calls one before each recipe whose
// spec opts in via `fixture: <preset-name>`.
//
// Design constraints:
//   - presets MUST be deterministic — same preset, same state every time
//   - presets MUST be additive — no preset depends on another running first
//   - presets MUST clean up after themselves before installing the new state
//     (otherwise re-running a recipe in the same page leaves a slot pile-up)
//   - presets MUST use the app's own functions (addSlotEntry, rebuildMesh,
//     addBone, …) so they exercise the real code paths, not a parallel
//     reality
//
// If a recipe needs a preset we don't have, *don't* invent it inline in the
// recipe. Add the preset here so the catalog stays explicit.

(function (global) {
  if (global.headlessFixtures) return;

  // Build a 64×64 canvas with a centered opaque rectangle. Used by every
  // mesh-bearing preset because rebuildMesh() needs a non-empty alpha
  // channel to produce a useful contour.
  function buildSyntheticCanvas(width = 64, height = 64) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#ff8844";
    const margin = Math.floor(Math.min(width, height) * 0.2);
    ctx.fillRect(margin, margin, width - 2 * margin, height - 2 * margin);
    return canvas;
  }

  // Wipe project state back to a known empty starting point. Mirrors what
  // file.new does internally without touching its UI flow.
  function reset() {
    if (typeof state === "undefined") throw new Error("state global not present");
    state.mesh = null;
    state.slots = [];
    state.activeSlot = -1;
    state.selectedBone = -1;
    state.selectedBonesForWeight = [];
    state.selectedIK = -1;
    state.selectedTransform = -1;
    state.selectedPath = -1;
    state.boneMode = "edit";
    state.editMode = "skeleton";
    state.uiPage = "rig";
    state.imageWidth = 0;
    state.imageHeight = 0;
    state.sourceCanvas = null;
    if (typeof updateWorkspaceUI === "function") updateWorkspaceUI();
  }

  // ── Preset: blank ────────────────────────────────────────────────────
  // Explicit "no setup" preset. Useful for recipes that already start from a
  // clean editor and want to be re-runnable in the same page.
  function presetBlank() {
    reset();
  }

  // ── Preset: mesh-default ─────────────────────────────────────────────
  // One slot, one image, default-grid mesh. Equivalent to importing a tiny
  // PNG via the file picker. After this, `state.mesh` is truthy, `state.slots`
  // has 1 entry, and the active slot has a region attachment converted to a
  // mesh (default behavior of rebuildMesh).
  function presetMeshDefault() {
    reset();
    const canvas = buildSyntheticCanvas(64, 64);
    state.imageWidth = canvas.width;
    state.imageHeight = canvas.height;
    state.sourceCanvas = canvas;
    if (typeof addSlotEntry !== "function") throw new Error("addSlotEntry not in scope");
    addSlotEntry({
      name: "fixture_slot_0",
      canvas,
      docWidth: canvas.width,
      docHeight: canvas.height,
      rect: { x: 0, y: 0, w: canvas.width, h: canvas.height },
      // Default to mesh attachment so weight-* recipes can find meshData
      // without an extra "convert region to mesh" step. Region is what
      // import-PSD usually produces; mesh is what most automated recipes
      // assume.
      defaultAttachmentType: "mesh",
    }, true);
    if (typeof syncSourceCanvasToActiveAttachment === "function") {
      syncSourceCanvasToActiveAttachment(state.slots[0]);
    }
    if (typeof rebuildMesh === "function") rebuildMesh();
    // Some recipes also need the slot's active attachment to be a mesh
    // attachment with meshData populated. Make sure of that explicitly:
    // if the slot has a region attachment by default, swap it.
    const slot0 = state.slots[0];
    if (slot0 && Array.isArray(slot0.attachments)) {
      for (const att of slot0.attachments) {
        if (att && att.type !== "mesh") att.type = "mesh";
      }
    }
    if (typeof ensureSlotMeshData === "function" && state.mesh && slot0) {
      ensureSlotMeshData(slot0, state.mesh);
    }
    if (typeof updateWorkspaceUI === "function") updateWorkspaceUI();
  }

  // ── Preset: mesh-edit-mode ───────────────────────────────────────────
  // mesh-default + leftToolTab="slotmesh" + editMode="mesh". This is what
  // most slot-mesh-editing recipes need before their hotkeys (P/U/Delete/X)
  // do anything — the mesh-edit hotkey path is gated on
  // isSlotMeshEditTabActive().
  function presetMeshEditMode() {
    presetMeshDefault();
    state.editMode = "mesh";
    state.leftToolTab = "slotmesh";
    if (typeof updateWorkspaceUI === "function") updateWorkspaceUI();
  }

  // ── Preset: mesh-with-bones ──────────────────────────────────────────
  // mesh-default + 2 bones (root + connected child). Lets weight/bone-edit
  // recipes operate on a real skeleton.
  function presetMeshWithBones() {
    presetMeshDefault();
    if (typeof addBone !== "function") throw new Error("addBone not in scope");
    state.boneMode = "edit";
    // Root bone.
    addBone({ parent: -1, connected: false });
    state.selectedBone = state.mesh.rigBones.length - 1;
    // Connected child.
    addBone({ parent: state.selectedBone, connected: true });
    if (typeof updateBoneUI === "function") updateBoneUI();
    if (typeof updateWorkspaceUI === "function") updateWorkspaceUI();
  }

  // ── Preset: mesh-with-weights ────────────────────────────────────────
  // mesh-with-bones + auto-weighted bind on the active slot. Many weight-*
  // recipes need attachment.meshData.weights to exist and be non-empty.
  function presetMeshWithWeights() {
    presetMeshWithBones();
    if (typeof autoWeightActiveSlot === "function") {
      // Default mode "weighted" produces multi-bone weights matching the
      // recipe expectations; "single" would put 100% on one bone.
      autoWeightActiveSlot("weighted");
    }
    if (typeof updateWorkspaceUI === "function") updateWorkspaceUI();
  }

  // ── Preset: two-slots-linkedmesh ─────────────────────────────────────
  // mesh-default plus a second slot. Slot[0] keeps its mesh; slot[1] gets a
  // linkedmesh attachment that points back at slot[0]'s active attachment.
  // Covers `linkedmesh-create` and friends.
  function presetTwoSlotsLinkedmesh() {
    presetMeshDefault();
    const canvas2 = buildSyntheticCanvas(64, 64);
    addSlotEntry({
      name: "fixture_slot_1",
      canvas: canvas2,
      docWidth: canvas2.width,
      docHeight: canvas2.height,
      rect: { x: 0, y: 0, w: canvas2.width, h: canvas2.height },
    }, true);
    // Attempt to convert slot[1]'s attachment to a linkedmesh whose source
    // is slot[0]. Different code paths exist; prefer the explicit one if
    // it's exposed, else fall back to setting fields directly.
    const slot1 = state.slots[1];
    if (slot1 && Array.isArray(slot1.attachments) && slot1.attachments[0]) {
      const att = slot1.attachments[0];
      att.type = "linkedmesh";
      att.linkedParent = state.slots[0].name;
      att.linkedAttachment = state.slots[0].attachmentName || "main";
      att.inheritTimelines = true;
    }
    if (typeof updateWorkspaceUI === "function") updateWorkspaceUI();
  }

  // ── Preset: render-warmed ────────────────────────────────────────────
  // mesh-default + nudge the render loop a few times. Several recipes
  // (timing-populated-after-frames, gpu-weight-heatmap-program-compiles)
  // assume the render loop has ticked at least once. The actual editor
  // exposes `render()` as a top-level function; calling it repeatedly is
  // cheap and avoids relying on Chromium scheduling.
  async function presetRenderWarmed() {
    presetMeshDefault();
    if (typeof render === "function") {
      for (let i = 0; i < 4; i += 1) {
        try { render(); } catch (_e) { /* don't let render crashes mask the recipe */ }
        await new Promise((r) => setTimeout(r, 16));
      }
    }
  }

  const PRESETS = {
    "blank":                 presetBlank,
    "mesh-default":          presetMeshDefault,
    "mesh-edit-mode":        presetMeshEditMode,
    "mesh-with-bones":       presetMeshWithBones,
    "mesh-with-weights":     presetMeshWithWeights,
    "two-slots-linkedmesh":  presetTwoSlotsLinkedmesh,
    "render-warmed":         presetRenderWarmed,
  };

  async function apply(name) {
    if (!Object.prototype.hasOwnProperty.call(PRESETS, name)) {
      throw new Error(`unknown fixture preset: ${name}`);
    }
    const fn = PRESETS[name];
    const result = fn();
    if (result && typeof result.then === "function") await result;
    return {
      preset: name,
      hasMesh: !!(typeof state !== "undefined" && state.mesh),
      slots: typeof state !== "undefined" ? state.slots.length : 0,
      bones: typeof state !== "undefined" && state.mesh && Array.isArray(state.mesh.rigBones)
        ? state.mesh.rigBones.length
        : 0,
    };
  }

  function list() { return Object.keys(PRESETS); }

  global.headlessFixtures = { apply, list, reset };
})(typeof window !== "undefined" ? window : globalThis);
