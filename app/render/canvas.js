// ROLE: Per-frame render loop entry — orchestrates WebGL slot draw,
// stencil clipping, base reference quad, onion skins, and the Canvas2D
// overlay (handles/gizmos/weight overlay). render() is called by
// requestRender() in runtime.js.
// EXPORTS:
//   - render (the per-frame entry; wired to rAF in runtime.js)
//   - buildRenderableAttachmentGeometry, drawOverlay, drawOnionSkins2D
//   - beginGLStencilClip, endGLStencilClip, drawBaseImageReferenceGL
//   - renderSlots2DWithClipping (still used by onion overlay + no-GL
//     fallback)
//   - shouldRenderOnionSkin, shouldRenderBaseImageReference
//   - pickVertex, pickHandleAtScreen (mouse hit testing)
// ============================================================
function buildRenderableAttachmentGeometry(slot, poseWorld) {
  if (!slot) return null;
  const activeAttachment = getActiveAttachment(slot);
  const activeType = normalizeAttachmentType(activeAttachment && activeAttachment.type);
  if (activeType === ATTACHMENT_TYPES.REGION) return buildRegionAttachmentGeometry(slot, poseWorld);
  if (activeType === ATTACHMENT_TYPES.MESH || activeType === ATTACHMENT_TYPES.LINKED_MESH) return buildSlotGeometry(slot, poseWorld);
  return null;
}

function renderSlots2DWithClipping(ctx, slots, poseWorld, options = null) {
  if (!ctx) return;
  const opts = options && typeof options === "object" ? options : {};
  const alphaMul = math.clamp(Number(opts.alphaMul) || 1, 0, 1);
  const tintMul = opts.tintMul && typeof opts.tintMul === "object" ? opts.tintMul : null;
  let activeClip = null;
  for (const slot of slots) {
    if (!slot) continue;
    ensureSlotClipState(slot);
    ensureSlotVisualState(slot);
    const activeAttachment = getActiveAttachment(slot);
    const activeType = normalizeAttachmentType(activeAttachment && activeAttachment.type);
    if (activeAttachment && activeAttachment.clipEnabled) {
      const poly = getSlotClipPolygonScreen(slot, poseWorld);
      activeClip = poly.length >= 3
        ? {
          points: poly,
          endSlotId: activeAttachment.clipEndSlotId ? String(activeAttachment.clipEndSlotId) : null,
        }
        : null;
      continue;
    }
    if (!activeAttachment || activeType === ATTACHMENT_TYPES.BOUNDING_BOX || activeType === ATTACHMENT_TYPES.POINT) {
      if (activeClip && activeClip.endSlotId && slot.id && String(slot.id) === activeClip.endSlotId) activeClip = null;
      continue;
    }
    if (!activeAttachment.canvas || !hasRenderableAttachment(slot)) {
      if (activeClip && activeClip.endSlotId && slot.id && String(slot.id) === activeClip.endSlotId) activeClip = null;
      continue;
    }
    const geom = buildRenderableAttachmentGeometry(slot, poseWorld);
    if (!geom || !geom.screen || !geom.indices || geom.indices.length <= 0) {
      if (activeClip && activeClip.endSlotId && slot.id && String(slot.id) === activeClip.endSlotId) activeClip = null;
      continue;
    }
    if (activeClip && activeClip.points && activeClip.points.length >= 3) {
      ctx.save();
      if (drawClipPath2D(ctx, activeClip.points)) ctx.clip();
      drawMeshOnContext(
        ctx,
        activeAttachment.canvas,
        (Number(slot.alpha) || 1) * alphaMul,
        {
          r: (Number(slot.r) || 1) * (tintMul ? Number(tintMul.r) || 1 : 1),
          g: (Number(slot.g) || 1) * (tintMul ? Number(tintMul.g) || 1 : 1),
          b: (Number(slot.b) || 1) * (tintMul ? Number(tintMul.b) || 1 : 1),
        },
        geom.screen,
        geom.indices || state.mesh.indices,
        geom.uvs || state.mesh.uvs,
        slot.blend
      );
      ctx.restore();
    } else {
      drawMeshOnContext(
        ctx,
        activeAttachment.canvas,
        (Number(slot.alpha) || 1) * alphaMul,
        {
          r: (Number(slot.r) || 1) * (tintMul ? Number(tintMul.r) || 1 : 1),
          g: (Number(slot.g) || 1) * (tintMul ? Number(tintMul.g) || 1 : 1),
          b: (Number(slot.b) || 1) * (tintMul ? Number(tintMul.b) || 1 : 1),
        },
        geom.screen,
        geom.indices || state.mesh.indices,
        geom.uvs || state.mesh.uvs,
        slot.blend
      );
    }
    if (activeClip && activeClip.endSlotId && slot.id && String(slot.id) === activeClip.endSlotId) {
      activeClip = null;
    }
  }
}

// ----------------------------------------------------------------
// GL stencil-based clipping (Phase 2 of WebGL migration).
//
// Replaces the 2D fallback that runs whenever a clip slot is present.
// Approach: fill the clip polygon into the stencil buffer using INVERT
// (handles concave polygons via even-odd rule — same as ctx.clip()'s
// nonzero default behaves for simple polygons), then enable stencil
// test EQUAL ref=1 so subsequent slot draws only land inside the mask.
//
// Reuses the main shader + VBO/IBO; we just feed dummy UVs and disable
// color/alpha writes during the mask pass. The texture binding is
// untouched — the shader still samples it but writes get masked.
// ----------------------------------------------------------------
const _glStencilClip = {
  active: false,
  endSlotId: null,
  // Scratch buffers reused frame-to-frame.
  vertScratch: null, // Float32Array
  idxScratch: null,  // Uint16Array
};

function _glClipPolygonToInterleaved(points) {
  // 4 floats per vertex (pos.xy + uv.xy). UVs unused during mask write.
  const n = points.length;
  if (!_glStencilClip.vertScratch || _glStencilClip.vertScratch.length < n * 4) {
    _glStencilClip.vertScratch = new Float32Array(Math.max(n * 4, 64));
  }
  const arr = _glStencilClip.vertScratch;
  for (let i = 0; i < n; i += 1) {
    const p = points[i];
    const o = i * 4;
    arr[o] = Number(p.x) || 0;
    arr[o + 1] = Number(p.y) || 0;
    arr[o + 2] = 0;
    arr[o + 3] = 0;
  }
  return arr;
}

function _glClipPolygonFanIndices(n) {
  const triCount = n - 2;
  const need = triCount * 3;
  if (!_glStencilClip.idxScratch || _glStencilClip.idxScratch.length < need) {
    _glStencilClip.idxScratch = new Uint16Array(Math.max(need, 64));
  }
  const idx = _glStencilClip.idxScratch;
  for (let t = 0; t < triCount; t += 1) {
    idx[t * 3] = 0;
    idx[t * 3 + 1] = t + 1;
    idx[t * 3 + 2] = t + 2;
  }
  return { idx, count: need };
}

function beginGLStencilClip(points, endSlotId) {
  if (!hasGL) return false;
  if (!Array.isArray(points) || points.length < 3) return false;
  // Clear stencil to 0, then write 1's inside the polygon via INVERT.
  // INVERT toggles the stencil bit per fragment, so any pixel covered
  // by an odd number of fan triangles (i.e. inside the polygon under
  // the even-odd rule) ends up with stencil=1. Concave polygons work.
  gl.enable(gl.STENCIL_TEST);
  gl.clearStencil(0);
  gl.clear(gl.STENCIL_BUFFER_BIT);
  gl.stencilFunc(gl.ALWAYS, 1, 0xFF);
  gl.stencilOp(gl.KEEP, gl.KEEP, gl.INVERT);
  gl.stencilMask(0xFF);
  gl.colorMask(false, false, false, false);
  // Upload polygon geometry through the same VBO/IBO. The mesh shader
  // will run; texture sampling is harmless because color writes are off.
  const verts = _glClipPolygonToInterleaved(points);
  const fan = _glClipPolygonFanIndices(points.length);
  gl.bufferData(gl.ARRAY_BUFFER, verts, gl.DYNAMIC_DRAW);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, fan.idx, gl.DYNAMIC_DRAW);
  gl.drawElements(gl.TRIANGLES, fan.count, gl.UNSIGNED_SHORT, 0);
  // Switch to "draw only where stencil == 1".
  gl.colorMask(true, true, true, true);
  gl.stencilFunc(gl.EQUAL, 1, 0xFF);
  gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
  gl.stencilMask(0x00);
  _glStencilClip.active = true;
  _glStencilClip.endSlotId = endSlotId || null;
  return true;
}

function endGLStencilClip() {
  if (!hasGL) return;
  if (!_glStencilClip.active) return;
  gl.disable(gl.STENCIL_TEST);
  gl.stencilMask(0xFF);
  _glStencilClip.active = false;
  _glStencilClip.endSlotId = null;
}

// Draw the imported reference image as a single textured quad through
// the main mesh shader (Phase 3 of WebGL migration). Mirrors the affine
// transform chain that drawBaseImageReference2D uses, but feeds the
// result as 4 screen-space corners + UVs into the existing VBO/IBO.
//
// Returns true if it drew anything. Called inline at the start of the
// GL slot pass; assumes program/VBO/IBO/uniforms are already bound.
const _glBaseRef = {
  verts: new Float32Array(16),  // 4 verts × (pos.xy + uv.xy)
  idx: new Uint16Array([0, 1, 2, 0, 2, 3]),
};

function drawBaseImageReferenceGL() {
  if (!hasGL) return false;
  if (!shouldRenderBaseImageReference()) return false;
  const docW = Math.max(1, Number(state.imageWidth) || Number(state.sourceCanvas && state.sourceCanvas.width) || 1);
  const docH = Math.max(1, Number(state.imageHeight) || Number(state.sourceCanvas && state.sourceCanvas.height) || 1);
  const activeSlot = getActiveSlot();
  const poseWorld = state.mesh ? getSolvedPoseWorld(state.mesh) : null;
  let drawTm = getBaseImageTransformMatrix(activeSlot, poseWorld, docW, docH);
  if (state.mesh && activeSlot) {
    const bi = getSlotBaseSpaceBoneIndex(activeSlot, state.mesh);
    const invBind = getDisplayInvBind(state.mesh);
    if (Number.isFinite(bi) && bi >= 0 && Array.isArray(poseWorld) && poseWorld[bi] && invBind && invBind[bi]) {
      const delta = mul(poseWorld[bi], invBind[bi]);
      drawTm = mul(drawTm, delta);
    }
  }
  // Apply drawTm in image-local space, then localToScreen for the four corners.
  const corners = [
    transformPoint(drawTm, 0, 0),
    transformPoint(drawTm, docW, 0),
    transformPoint(drawTm, docW, docH),
    transformPoint(drawTm, 0, docH),
  ].map((p) => localToScreen(p.x, p.y));
  // Match the 2D path's alpha policy: full opacity until slots exist,
  // then fade to 0.35 unless we're on the Base Image Edit tab.
  const alpha = isBaseImageEditTabActive() ? 1 : (state.slots.length > 0 ? 0.35 : 1);
  const tex = ensureGLTextureForCanvas(state.sourceCanvas);
  if (!tex) return false;
  const v = _glBaseRef.verts;
  // [sx, sy, u, v] × 4
  v[0]  = corners[0].x; v[1]  = corners[0].y; v[2]  = 0; v[3]  = 0;
  v[4]  = corners[1].x; v[5]  = corners[1].y; v[6]  = 1; v[7]  = 0;
  v[8]  = corners[2].x; v[9]  = corners[2].y; v[10] = 1; v[11] = 1;
  v[12] = corners[3].x; v[13] = corners[3].y; v[14] = 0; v[15] = 1;
  gl.bufferData(gl.ARRAY_BUFFER, v, gl.DYNAMIC_DRAW);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, _glBaseRef.idx, gl.DYNAMIC_DRAW);
  gl.bindTexture(gl.TEXTURE_2D, tex);
  applyGLBlendMode("normal");
  gl.uniform1f(loc.uAlpha, alpha);
  if (loc.uTint) gl.uniform3f(loc.uTint, 1, 1, 1);
  if (loc.uDark) gl.uniform3f(loc.uDark, 0, 0, 0);
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
  return true;
}

function shouldRenderOnionSkin() {
  const onion = ensureOnionSkinSettings();
  if (!state.mesh || !onion.enabled) return false;
  if (onion.alpha <= 0.001) return false;
  if (onion.prevFrames <= 0 && onion.nextFrames <= 0) return false;
  if (!getCurrentAnimation()) return false;
  if (state.anim.mix && state.anim.mix.active) return false;
  return true;
}

function drawOnionSkins2D(ctx, slots) {
  if (!ctx || !shouldRenderOnionSkin()) return false;
  const anim = getCurrentAnimation();
  if (!anim) return false;
  const onion = ensureOnionSkinSettings();
  const baseTime = Number(state.anim.time) || 0;
  const duration = getPlaybackDurationForCurrentState(anim);
  const prevTint = { r: 1, g: 0.58, b: 0.58 };
  const nextTint = { r: 0.58, g: 0.9, b: 1 };
  let drawn = false;

  // Spine "Ghosting" px-per-frame offset: shifts the ghost so a walk-cycle
  // previewed in-place can show forward locomotion. Applied as a 2D canvas
  // translation (ghost canvas is the same surface as the main, so the
  // translation only affects this draw call).
  const px = Number(onion.pxPerFrameX) || 0;
  const py = Number(onion.pxPerFrameY) || 0;
  const offsets = typeof getOnionSkinFrameOffsets === "function" ? getOnionSkinFrameOffsets(anim) : null;
  const fallbackOffsets = [];
  if (!offsets || offsets.length === 0) {
    for (let i = onion.prevFrames; i >= 1; i -= 1) fallbackOffsets.push(-i);
    for (let i = onion.nextFrames; i >= 1; i -= 1) fallbackOffsets.push(i);
  }
  const useOffsets = offsets && offsets.length > 0 ? offsets : fallbackOffsets;
  // Sort so "farthest in time" draws first (back), nearest last (front).
  useOffsets.sort((a, b) => Math.abs(b) - Math.abs(a));
  const orderCount = Math.max(onion.prevFrames, onion.nextFrames, 1);

  const drawGhost = (offset, tint) => {
    const sampleTime = getOnionSampleTime(baseTime, offset, duration);
    samplePoseAtTime(state.mesh, sampleTime, { applyStateParamTracks: false });
    updateDeformation();
    const poseWorld = getSolvedPoseWorld(state.mesh);
    const fade = 1 - (Math.abs(offset) - 1) / Math.max(1, orderCount + 1);
    const shiftX = px * offset;
    const shiftY = py * offset;
    if (shiftX !== 0 || shiftY !== 0) {
      ctx.save();
      ctx.translate(shiftX, shiftY);
    }
    renderSlots2DWithClipping(ctx, slots, poseWorld, {
      alphaMul: math.clamp(onion.alpha * fade, 0, 1),
      tintMul: tint,
    });
    if (shiftX !== 0 || shiftY !== 0) ctx.restore();
    drawn = true;
  };

  for (const off of useOffsets) {
    drawGhost(off, off < 0 ? prevTint : nextTint);
  }

  samplePoseAtTime(state.mesh, baseTime);
  updateDeformation();
  return drawn;
}

function shouldKeepRenderLoopAlive() {
  return !!(
    state.drag ||
    (state.anim && (state.anim.playing || (state.anim.mix && state.anim.mix.active)))
  );
}

function render(ts = 0) {
  const loop = getRenderLoopState();
  loop.rafId = 0;
  loop.requested = false;
  updateAnimationPlayback(ts);
  if (ts - (Number(state.history.lastCaptureTs) || 0) > 220) {
    pushUndoCheckpoint(false);
    state.history.lastCaptureTs = ts;
  }
  resize();
  // Per-frame perf timing: bracket each major phase with performance.now()
  // and roll into a 60-frame ring buffer. debug.timing() reads averages.
  const perfTimingEnabled = !!(state.renderPerf && state.renderPerf.timing && state.renderPerf.timing.enabled);
  const tFrameStart = perfTimingEnabled ? performance.now() : 0;
  const tDeformStart = tFrameStart;
  if (state.mesh) {
    updateDeformation();
  }
  const tDeformEnd = perfTimingEnabled ? performance.now() : 0;
  drawBackdrop();

  const slots = getRenderableSlots();
  const wantsOnion = shouldRenderOnionSkin();

  // Self-heal viewport: if state.view is stuck at the default (0,0,1)
  // but we have a real image, auto-fit so the loaded content shows up.
  // This catches the autosave-restore path where state.view didn't get
  // reset to fit even after load (the explicit resetViewToFit call may
  // run before resize() expands the canvas to its real CSS size).
  if (state.imageWidth > 0 && state.imageHeight > 0
      && (Number(state.view.cx) || 0) === 0
      && (Number(state.view.cy) || 0) === 0
      && Math.abs((Number(state.view.scale) || 1) - 1) < 1e-6
      && typeof resetViewToFit === "function") {
    resetViewToFit();
  }

  // Authoritative lost-state: prefer the sticky toolkit flag because
  // gl.isContextLost() can flip back to false transiently in Edge while
  // the GPU process is recovering, before webglcontextrestored actually
  // fires. Trusting that transient false would cause GL commands to
  // silently fail.
  const toolkitSaysLost = !!(typeof window !== "undefined" && window.glToolkit && typeof window.glToolkit.isMainContextLost === "function" && window.glToolkit.isMainContextLost());
  const glLost = hasGL && (toolkitSaysLost || (gl.isContextLost && gl.isContextLost()));

  // Self-heal path: if the GL context was lost and is now restored but
  // the rebuild listener didn't fire (timing/registration race), rebuild
  // GL handles here before any draw call uses them. Without this, render
  // would call useProgram/bindVertexArray on dead objects from the old
  // context and emit a flood of "object does not belong to this context"
  // errors, leaving the canvas blank.
  if (hasGL && !glLost) {
    let needsRebuild = typeof isMainGLNeedingRebuild === "function" && isMainGLNeedingRebuild();
    // Belt and braces: even if the lost-flag wasn't set (e.g. the lost
    // event was missed somehow), validate the program belongs to the
    // current context. After a lost/restored cycle, the old program
    // handle becomes invalid; gl.isProgram returns false for it.
    if (!needsRebuild && program && typeof gl.isProgram === "function" && !gl.isProgram(program)) {
      needsRebuild = true;
    }
    if (needsRebuild && typeof rebuildMainGLAfterRestore === "function") {
      rebuildMainGLAfterRestore();
    }
  }

  // While the GL context is lost (Edge GPU process under pressure, driver
  // reset, etc.), the GL canvas can't be drawn to. Render slots into the
  // backdrop 2D canvas (a separate DOM element below the GL canvas) so the
  // user still sees their image instead of a blank stage. The GL canvas
  // is hidden via the lost-event handler so the backdrop shows through.
  if (glLost) {
    if (backdropCtx) {
      try {
        // Clear backdrop every frame during the outage. drawBackdrop()'s
        // signature cache won't necessarily clear it for us (the sig
        // doesn't change while the user pans/moves), so without an
        // explicit clear here, slot images smear across the canvas as
        // they move. Re-paint the grid afterwards so the stage doesn't
        // look empty.
        backdropCtx.setTransform(1, 0, 0, 1, 0, 0);
        backdropCtx.clearRect(0, 0, els.backdropCanvas.width, els.backdropCanvas.height);
        if (typeof drawBackdropGridAndRuler === "function") {
          drawBackdropGridAndRuler(backdropCtx, { drawGrid: true, drawRuler: true });
        }
        // First try the regular skinned/mesh path. If the slot is a mesh
        // attachment with no bones (rigBones.length === 0), this still
        // works -- buildSlotGeometry uses raw positions when boneCount=0.
        const poseWorld = state.mesh ? getSolvedPoseWorld(state.mesh) : [];
        renderSlots2DWithClipping(backdropCtx, slots, poseWorld);
        // Belt-and-braces: a flat drawImage of every slot's attachment
        // canvas at its rect, transformed to screen space via the slot's
        // composite transform (so it lands where the GL path would put
        // it). 50% alpha so the user knows it's the fallback view.
        for (const s of slots) {
          if (!s) continue;
          const att = typeof getActiveAttachment === "function" ? getActiveAttachment(s) : null;
          if (!att || !att.canvas) continue;
          const rect = att.rect || s.rect;
          if (!rect) {
            // No rect -- draw at image origin to at least show something
            const tl = localToScreen(0, 0);
            const w = att.canvas.width;
            const h = att.canvas.height;
            if (w > 0 && h > 0) {
              backdropCtx.save();
              backdropCtx.globalAlpha = 0.5;
              const scale = Math.max(1e-6, Number(state.view.scale) || 1);
              backdropCtx.drawImage(att.canvas, tl.x, tl.y, w * scale, h * scale);
              backdropCtx.restore();
            }
            continue;
          }
          try {
            const x0 = Number(rect.x) || 0;
            const y0 = Number(rect.y) || 0;
            const rw = Number(rect.w) || att.canvas.width;
            const rh = Number(rect.h) || att.canvas.height;
            const tl = localToScreen(x0, y0);
            const br = localToScreen(x0 + rw, y0 + rh);
            const w = br.x - tl.x;
            const h = br.y - tl.y;
            if (w > 0 && h > 0) {
              backdropCtx.save();
              backdropCtx.globalAlpha = 0.5;
              backdropCtx.drawImage(att.canvas, tl.x, tl.y, w, h);
              backdropCtx.restore();
            }
          } catch { /* per-slot ignore */ }
        }
      } catch (err) {
        console.warn("[render] gl-lost fallback draw failed", err);
      }
    }
    drawOverlay();
    // Force backdrop to redraw next frame (otherwise its sig-cache could
    // skip the redraw and we'd lose the fallback content).
    if (state.renderPerf) state.renderPerf.backdropSig = "";
    // During the outage we still need responsive frame updates -- if the
    // user is dragging or panning we want the fallback to follow without
    // stutter. Use RAF-pacing (matches the keepalive loop), then a longer
    // timeout poll as backstop in case neither RAF nor an event drives
    // us once the user stops interacting.
    if (shouldKeepRenderLoopAlive() || state.drag) {
      requestRender("gl-lost-active");
    } else {
      setTimeout(() => requestRender("gl-lost-poll"), 250);
    }
    return;
  }

  const tSlotStart = perfTimingEnabled ? performance.now() : 0;
  if (hasGL) {
    state.overlayScene.enabled = false;
    if (wantsOnion) {
      const onionCtx = ensureOverlaySceneCanvas();
      if (onionCtx) {
        onionCtx.setTransform(1, 0, 0, 1, 0, 0);
        onionCtx.clearRect(0, 0, els.glCanvas.width, els.glCanvas.height);
        state.overlayScene.enabled = drawOnionSkins2D(onionCtx, slots);
      }
    }
    gl.enable(gl.BLEND);
    applyGLBlendMode("normal");
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
    // Always set up the program; even if there's no mesh, base reference
    // alone may still need to draw.
    gl.useProgram(program);
    bindGeometry();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.activeTexture(gl.TEXTURE0);
    gl.uniform2f(loc.uResolution, els.glCanvas.width, els.glCanvas.height);
    // Base reference: shown at full opacity when no slots exist (initial
    // setup), faded once slots exist (unless on the Canvas tab, full opacity).
    drawBaseImageReferenceGL();
    if (state.mesh) {
      const poseWorld = getSolvedPoseWorld(state.mesh);
      const renderTime = typeof getCurrentRenderTime === "function" ? getCurrentRenderTime() : 0;
      const _diag = window.__renderDiagOnce !== false;
      let _slotsExamined = 0;
      let _slotsDrawn = 0;
      let _firstSkipReason = null;
      for (const slot of slots) {
        if (!slot) continue;
        _slotsExamined += 1;
        ensureSlotClipState(slot);
        const activeAttachment = getActiveAttachment(slot);
        // 1) Clip-start slot: write the polygon to the stencil buffer
        //    and skip drawing this slot itself (Spine semantics).
        if (activeAttachment && activeAttachment.clipEnabled) {
          const poly = getSlotClipPolygonScreen(slot, poseWorld);
          if (poly && poly.length >= 3) {
            beginGLStencilClip(
              poly,
              activeAttachment.clipEndSlotId ? String(activeAttachment.clipEndSlotId) : null
            );
          }
          if (_diag && !_firstSkipReason) _firstSkipReason = "clip-start";
          continue;
        }
        const baseCanvas = (activeAttachment || {}).canvas;
        const attachmentCanvas = activeAttachment && typeof getEffectiveAttachmentCanvas === "function"
          ? (getEffectiveAttachmentCanvas(activeAttachment, renderTime) || baseCanvas)
          : baseCanvas;
        // 2) Slot that ends a clip range — handled after the draw below.
        const isClipEnd = !!(_glStencilClip.active && _glStencilClip.endSlotId
          && slot.id && String(slot.id) === _glStencilClip.endSlotId);
        if (!attachmentCanvas || !hasRenderableAttachment(slot)) {
          if (isClipEnd) endGLStencilClip();
          if (_diag && !_firstSkipReason) _firstSkipReason = !attachmentCanvas ? "no-attachment-canvas" : "not-renderable";
          continue;
        }
        const texture = ensureGLTextureForCanvas(attachmentCanvas);
        if (!texture) {
          if (isClipEnd) endGLStencilClip();
          if (_diag && !_firstSkipReason) _firstSkipReason = "no-texture";
          continue;
        }
        ensureSlotVisualState(slot);
        const geom = buildRenderableAttachmentGeometry(slot, poseWorld);
        if (!geom || !geom.interleaved || !geom.indices || geom.indices.length <= 0) {
          if (isClipEnd) endGLStencilClip();
          if (_diag && !_firstSkipReason) {
            if (!geom) _firstSkipReason = "geom-null";
            else if (!geom.interleaved) _firstSkipReason = "no-interleaved";
            else if (!geom.indices) _firstSkipReason = "no-indices";
            else _firstSkipReason = "indices-empty";
          }
          continue;
        }
        _slotsDrawn += 1;
        gl.bufferData(gl.ARRAY_BUFFER, geom.interleaved, gl.DYNAMIC_DRAW);
        const drawIndices = geom.indices || state.mesh.indices;
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, drawIndices, gl.DYNAMIC_DRAW);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        applyGLBlendMode(slot.blend);
        gl.uniform1f(loc.uAlpha, math.clamp(Number(slot.alpha) || 1, 0, 1));
        if (loc.uTint) {
          gl.uniform3f(
            loc.uTint,
            math.clamp(Number(slot.r) || 1, 0, 1),
            math.clamp(Number(slot.g) || 1, 0, 1),
            math.clamp(Number(slot.b) || 1, 0, 1)
          );
        }
        if (loc.uDark) {
          // Dark color is enabled per slot. Hex format "rrggbb"; default "000000".
          let dr = 0, dg = 0, db = 0;
          if (slot.darkEnabled) {
            const hex = String(slot.dark || "000000").trim().toLowerCase();
            const norm = hex.startsWith("#") ? hex.slice(1) : hex;
            if (norm.length >= 6) {
              dr = parseInt(norm.slice(0, 2), 16) / 255;
              dg = parseInt(norm.slice(2, 4), 16) / 255;
              db = parseInt(norm.slice(4, 6), 16) / 255;
              if (!Number.isFinite(dr)) dr = 0;
              if (!Number.isFinite(dg)) dg = 0;
              if (!Number.isFinite(db)) db = 0;
            }
          }
          gl.uniform3f(loc.uDark, dr, dg, db);
        }
        gl.drawElements(gl.TRIANGLES, drawIndices.length, gl.UNSIGNED_SHORT, 0);
        if (isClipEnd) endGLStencilClip();
      }
      // Safety: if a clip range opened but never reached its end slot,
      // tear it down so the next frame starts clean.
      if (_glStencilClip.active) endGLStencilClip();
      applyGLBlendMode("normal");
      if (_diag) {
        // Sample the screen-space bounds of the first drawn slot so we
        // can tell whether "no image" really means "drawn off-screen".
        let bbox = "n/a";
        let canvasInfo = "n/a";
        let alphaInfo = "n/a";
        let pixelSample = "n/a";
        try {
          const s0 = slots && slots[0];
          if (s0) {
            const g = buildRenderableAttachmentGeometry(s0, poseWorld);
            if (g && g.screen && g.screen.length >= 2) {
              let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
              for (let i = 0; i < g.screen.length; i += 2) {
                const x = g.screen[i], y = g.screen[i + 1];
                if (x < minX) minX = x; if (x > maxX) maxX = x;
                if (y < minY) minY = y; if (y > maxY) maxY = y;
              }
              bbox = `[${minX.toFixed(1)},${minY.toFixed(1)} -> ${maxX.toFixed(1)},${maxY.toFixed(1)}]`;
            }
            const att0 = getActiveAttachment(s0);
            if (att0 && att0.canvas) {
              canvasInfo = `${att0.canvas.width}x${att0.canvas.height}`;
              // Read a center pixel to verify the canvas isn't blank
              try {
                const cv = att0.canvas;
                const cx2d = cv.getContext && cv.getContext("2d", { willReadFrequently: true });
                if (cx2d) {
                  const cx = Math.floor(cv.width / 2);
                  const cy = Math.floor(cv.height / 2);
                  const data = cx2d.getImageData(cx, cy, 1, 1).data;
                  pixelSample = `rgba(${data[0]},${data[1]},${data[2]},${data[3]})`;
                }
              } catch (e) { pixelSample = "read-failed:" + (e && e.message); }
            }
            alphaInfo = `slotAlpha=${Number(s0.alpha) || 1} blend=${s0.blend || "normal"} visible=${s0.visible !== false}`;
          }
        } catch { /* ignore */ }
        const cw = els.glCanvas ? els.glCanvas.width : 0;
        const ch = els.glCanvas ? els.glCanvas.height : 0;
        // Read back a pixel from the GL canvas at the slot center to confirm
        // whether GL really emitted color (vs a silent draw failure).
        let glPixel = "n/a";
        try {
          if (gl && !gl.isContextLost()) {
            const buf = new Uint8Array(4);
            gl.readPixels(Math.floor(cw / 2), Math.floor(ch / 2), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, buf);
            glPixel = `rgba(${buf[0]},${buf[1]},${buf[2]},${buf[3]})`;
          }
        } catch (e) { glPixel = "read-failed:" + (e && e.message); }
        console.info(`[render-diag] examined=${_slotsExamined} drawn=${_slotsDrawn} firstSkip=${_firstSkipReason || "none"} rigBones=${state.mesh.rigBones.length} canvas=${cw}x${ch} slot0Screen=${bbox} viewScale=${(Number(state.view.scale) || 0).toFixed(3)} viewC=(${Math.round(state.view.cx)},${Math.round(state.view.cy)}) attCanvas=${canvasInfo} ${alphaInfo} attPixelCenter=${pixelSample} glPixelCenter=${glPixel}`);
        window.__renderDiagOnce = false;
      }
    }
  } else {
    // No-WebGL fallback: browser doesn't support WebGL at all. Draw
    // everything onto the stage 2D context. Modern browsers always have
    // WebGL, so this path is effectively a safety net.
    const ctx = stage2dCtx;
    state.overlayScene.enabled = false;
    if (!ctx) {
      drawOverlay();
      if (shouldKeepRenderLoopAlive()) requestRender("keepalive");
      return;
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, els.glCanvas.width, els.glCanvas.height);
    if (shouldRenderBaseImageReference() && state.slots.length === 0) drawBaseImageReference2D(ctx);
    if (wantsOnion) drawOnionSkins2D(ctx, slots);
    const poseWorld = state.mesh ? getSolvedPoseWorld(state.mesh) : [];
    renderSlots2DWithClipping(ctx, slots, poseWorld);
  }
  const tOverlayStart = perfTimingEnabled ? performance.now() : 0;

  drawOverlay();
  if (perfTimingEnabled) {
    const tOverlayEnd = performance.now();
    recordRenderTiming(
      tDeformEnd - tDeformStart,
      tOverlayStart - tSlotStart,
      tOverlayEnd - tOverlayStart,
      tOverlayEnd - tFrameStart
    );
  }
  if (shouldKeepRenderLoopAlive()) requestRender("keepalive");
}

// Roll a frame's phase timings into the renderPerf ring buffer. The ring
// stores 4 floats per slot [deform, slotDraw, overlay, total]; debug.timing()
// reads it back as averages over the ring. Cheap (<1µs) so we don't need
// a sample rate; instrument every frame.
function recordRenderTiming(deformMs, slotDrawMs, overlayMs, totalMs) {
  const t = state.renderPerf && state.renderPerf.timing;
  if (!t || !t.ring) return;
  t.lastFrame.deform = deformMs;
  t.lastFrame.slotDraw = slotDrawMs;
  t.lastFrame.overlay = overlayMs;
  t.lastFrame.total = totalMs;
  const off = (t.ringIdx % t.ringSize) * 4;
  t.ring[off] = deformMs;
  t.ring[off + 1] = slotDrawMs;
  t.ring[off + 2] = overlayMs;
  t.ring[off + 3] = totalMs;
  t.ringIdx += 1;
}

function pickVertex(mx, my) {
  const m = state.mesh;
  if (!m) return -1;
  if (state.slots.length > 0) {
    const poseWorld = getSolvedPoseWorld(m);
    let best = -1;
    let bestDist2 = 11 * 11;
    let bestSlotIndex = -1;
    const searchSlots = getRenderableSlotItems();
    for (const it of searchSlots) {
      if (!it || !it.slot || !hasRenderableAttachment(it.slot)) continue;
      const slot = it.slot;
      ensureSlotMeshData(slot, m);
      const geom = buildSlotGeometry(slot, poseWorld);
      const screen = geom.screen || m.deformedScreen;
      for (let i = 0; i < screen.length / 2; i += 1) {
        const dx = screen[i * 2] - mx;
        const dy = screen[i * 2 + 1] - my;
        const d2 = dx * dx + dy * dy;
        if (d2 < bestDist2) {
          bestDist2 = d2;
          best = i;
          bestSlotIndex = it.idx;
        }
      }
    }
    if (best >= 0 && Number.isFinite(bestSlotIndex) && bestSlotIndex >= 0 && bestSlotIndex !== state.activeSlot) {
      setActiveSlot(bestSlotIndex);
    }
    return best;
  }
  let best = -1;
  let bestDist2 = 11 * 11;
  for (let i = 0; i < m.deformedScreen.length / 2; i += 1) {
    const dx = m.deformedScreen[i * 2] - mx;
    const dy = m.deformedScreen[i * 2 + 1] - my;
    const d2 = dx * dx + dy * dy;
    if (d2 < bestDist2) {
      bestDist2 = d2;
      best = i;
    }
  }
  return best;
}

function angleTo(a, b) {
  return Math.atan2(b.y - a.y, b.x - a.x);
}

function pickSkeletonHandle(mx, my, pickRadiusPx = 11) {
  const m = state.mesh;
  if (!m) return null;
  const radius = Number(pickRadiusPx);
  if (!Number.isFinite(radius) || radius <= 0) return null;
  const bones = getActiveBones(m);
  enforceConnectedHeads(bones);

  const world = state.boneMode === "pose" ? getSolvedPoseWorld(m) : getEditAwareWorld(bones);
  let best = radius * radius;
  let hit = null;

  for (let i = 0; i < bones.length; i += 1) {
    const b = bones[i];
    if (!isBoneVisibleInWorkspace(m, bones, i)) continue;
    const s = transformPoint(world[i], 0, 0);
    const t = transformPoint(world[i], b.length, 0);
    const ss = localToScreen(s.x, s.y);
    const ts = localToScreen(t.x, t.y);

    const dsx = ss.x - mx;
    const dsy = ss.y - my;
    const dtx = ts.x - mx;
    const dty = ts.y - my;
    const ds2 = dsx * dsx + dsy * dsy;
    const dt2 = dtx * dtx + dty * dty;

    if (dt2 < best) {
      best = dt2;
      hit = { type: "bone_tip", boneIndex: i };
    }

    if (ds2 < best) {
      best = ds2;
      hit = { type: "bone_joint", boneIndex: i };
    }
  }

  return hit;
}

function selectBonesByRect(x0, y0, x1, y1, append = false) {
  const m = state.mesh;
  if (!m) return;
  const bones = getActiveBones(m);
  if (!bones || bones.length === 0) return;
  const left = Math.min(x0, x1);
  const right = Math.max(x0, x1);
  const top = Math.min(y0, y1);
  const bottom = Math.max(y0, y1);
  const world = state.boneMode === "pose" ? getSolvedPoseWorld(m) : getEditAwareWorld(bones);
  const pickedBones = [];
  const pickedParts = [];
  for (let i = 0; i < bones.length; i += 1) {
    if (!isBoneVisibleInWorkspace(m, bones, i)) continue;
    const ep = getBoneWorldEndpointsFromBones(bones, i, world);
    const hs = localToScreen(ep.head.x, ep.head.y);
    const ts = localToScreen(ep.tip.x, ep.tip.y);
    const headInside = hs.x >= left && hs.x <= right && hs.y >= top && hs.y <= bottom;
    const tailInside = ts.x >= left && ts.x <= right && ts.y >= top && ts.y <= bottom;
    const segmentInside = segmentIntersectsRect(hs.x, hs.y, ts.x, ts.y, left, top, right, bottom);

    if (headInside) pickedParts.push({ index: i, type: "head" });
    if (tailInside) pickedParts.push({ index: i, type: "tail" });
    if (headInside || tailInside || segmentInside) pickedBones.push(i);
  }
  if (pickedBones.length === 0) {
    if (!append) {
      clearBoneSelection(false);
    }
    return 0;
  }
  if (append) {
    state.selectedBonesForWeight = [...new Set([...getSelectedBonesForWeight(m), ...pickedBones])];
    const existing = state.selectedBoneParts || [];
    for (const p of pickedParts) {
      if (!existing.some(e => e.index === p.index && e.type === p.type)) {
        existing.push(p);
      }
    }
    state.selectedBoneParts = existing;
  } else {
    state.selectedBonesForWeight = pickedBones;
    state.selectedBoneParts = pickedParts;
  }
  state.selectedBone = pickedBones[pickedBones.length - 1];
  updateBoneUI();
  return pickedBones.length;
}

function toggleSelectAllBones() {
  const m = state.mesh;
  if (!m || !m.rigBones || m.rigBones.length === 0) return;
  const all = m.rigBones.map((_, i) => i);
  const curr = getSelectedBonesForWeight(m);
  if (curr.length === all.length) {
    clearBoneSelection(true);
  } else {
    state.selectedBonesForWeight = all;
    state.selectedBone = all[all.length - 1];
    setStatus(`All bones selected (${all.length}).`);
  }
  updateBoneUI();
}

function moveBoneJointToLocal(bones, boneIndex, localTarget) {
  const b = bones[boneIndex];
  if (!b) return false;
  const snapshot = state.boneMode === "edit" ? captureEditBoneSnapshot(bones) : null;
  if (b.parent >= 0 && b.connected) {
    if (state.boneMode === "pose" && state.mesh) {
      return !!steerIKTargetFromBoneEdit(state.mesh, boneIndex, localTarget, "head");
    }
    if (state.boneMode === "edit") {
      const parentIndex = Number(b.parent);
      if (Number.isFinite(parentIndex) && parentIndex >= 0 && parentIndex < bones.length) {
        const parentEp = getBoneWorldEndpointsFromBones(bones, parentIndex);
        const nextTip = {
          x: Number.isFinite(Number(localTarget && localTarget.x)) ? Number(localTarget.x) : parentEp.tip.x,
          y: Number.isFinite(Number(localTarget && localTarget.y)) ? Number(localTarget.y) : parentEp.tip.y,
        };
        setBoneFromWorldEndpoints(bones, parentIndex, parentEp.head, nextTip);
        preserveConnectedChildTipsAfterEdit(bones, snapshot, [parentIndex]);
        markRigEditDirty();
      }
      return false;
    }
    return false;
  }
  if (b.parent < 0) {
    b.tx = localTarget.x;
    b.ty = localTarget.y;
    preserveConnectedChildTipsAfterEdit(bones, snapshot, [boneIndex]);
    markRigEditDirty();
    return false;
  }
  if (state.boneMode === "edit") {
    b.tx = localTarget.x;
    b.ty = localTarget.y;
    preserveConnectedChildTipsAfterEdit(bones, snapshot, [boneIndex]);
    markRigEditDirty();
    return false;
  }

  const parentWorld = computeWorld(bones)[b.parent];
  const invParent = invert(parentWorld);
  const p = transformPoint(invParent, localTarget.x, localTarget.y);
  b.tx = p.x;
  b.ty = p.y;
  return false;
}

function canEditLengthInCurrentMode(bones, boneIndex) {
  // In Animate mode (any sub-mode: rig/pose, object) bone length is part of
  // the rest pose and must NOT change via drag. Blender / Spine 2D follow the
  // same rule: vertices are bound in the bone's local frame so changing
  // `length` mid-animation desynchronises mesh deform from rig.
  // Setup-mode + Edit boneMode keeps length editable so the rig builder can
  // adjust rest length freely.
  // The per-bone `b.poseLenEditable === true` opt-in from the right Properties
  // panel still allows length edits in Pose mode for users who explicitly
  // unlock it, matching Spine's "Pose Length" checkbox.
  const sysMode = typeof getCurrentSystemMode === "function" ? getCurrentSystemMode() : "setup";
  if (sysMode === "animate") {
    const b = bones[boneIndex];
    return !!(b && b.poseLenEditable === true);
  }
  if (state.boneMode === "pose") {
    const b = bones[boneIndex];
    return !!(b && b.poseLenEditable !== false);
  }
  return true;
}

function rotatePointAroundPivot(point, pivot, delta) {
  const px = Number(point && point.x) || 0;
  const py = Number(point && point.y) || 0;
  const ox = Number(pivot && pivot.x) || 0;
  const oy = Number(pivot && pivot.y) || 0;
  const c = Math.cos(delta);
  const s = Math.sin(delta);
  const dx = px - ox;
  const dy = py - oy;
  return {
    x: ox + dx * c - dy * s,
    y: oy + dx * s + dy * c,
  };
}

function rotateBoneTipToLocal(bones, boneIndex, localTarget) {
  const snapshot = state.boneMode === "edit" ? captureEditBoneSnapshot(bones) : null;
  const ik = state.mesh ? findEnabledIKForBone(state.mesh, boneIndex) : null;
  if (state.boneMode === "pose" && ik && (ik.bones || []).length === 1) {
    return { ikDriven: !!steerIKTargetFromBoneEdit(state.mesh, boneIndex, localTarget, "tip"), movedHead: false };
  }
  if (state.boneMode === "pose" && ik && (ik.bones || []).length >= 2) {
    const a = Number((ik.bones || [])[0]);
    const bEnd = Number((ik.bones || [])[1]);
    if (boneIndex === bEnd) {
      // For 2-bone IK, end-bone interaction should drive IK target, not directly rewrite child local pose.
      return { ikDriven: !!steerIKTargetFromBoneEdit(state.mesh, boneIndex, localTarget, "tip"), movedHead: false };
    }
    if (boneIndex === a && ik.endMode !== "tail") {
      // Parent tip overlaps child head; treat as end-head manipulation in head mode.
      return { ikDriven: !!steerIKTargetFromBoneEdit(state.mesh, bEnd, localTarget, "head"), movedHead: false };
    }
  }
  const b = bones[boneIndex];
  if (!b) return { ikDriven: false, movedHead: false };
  if (state.boneMode === "edit") {
    const ep = getBoneWorldEndpointsFromBones(bones, boneIndex);
    setBoneFromWorldEndpoints(bones, boneIndex, ep.head, localTarget);
    preserveConnectedChildTipsAfterEdit(bones, snapshot, [boneIndex]);
    steerIKTargetFromBoneEdit(state.mesh, boneIndex, localTarget, "tip");
    return { ikDriven: false, movedHead: false };
  }
  if (state.boneMode === "pose") {
    const ep = getBoneWorldEndpointsFromBones(bones, boneIndex);
    const nextTip = canEditLengthInCurrentMode(bones, boneIndex)
      ? localTarget
      : (() => {
        const a = angleTo(ep.head, localTarget);
        return {
          x: ep.head.x + Math.cos(a) * b.length,
          y: ep.head.y + Math.sin(a) * b.length,
        };
      })();
    setBoneFromWorldEndpoints(bones, boneIndex, ep.head, nextTip);
    steerIKTargetFromBoneEdit(state.mesh, boneIndex, nextTip, "tip");
    return { ikDriven: false, movedHead: false };
  }
  const ep = getBoneWorldEndpointsFromBones(bones, boneIndex);
  const nextTip = canEditLengthInCurrentMode(bones, boneIndex)
    ? localTarget
    : (() => {
      const a = angleTo(ep.head, localTarget);
      return {
        x: ep.head.x + Math.cos(a) * b.length,
        y: ep.head.y + Math.sin(a) * b.length,
      };
    })();
  setBoneFromWorldEndpoints(bones, boneIndex, ep.head, nextTip);
  steerIKTargetFromBoneEdit(state.mesh, boneIndex, nextTip, "tip");
  return { ikDriven: false, movedHead: false };
}

function setDragTool(tool) {
  state.dragTool = tool;
  const objectMode = state.boneMode === "object";
  const label =
    tool === "move_head"
      ? objectMode
        ? "Tool: Object Move / Scale (G/T, Shift+Drag to scale)"
        : "Tool: Move Head (G)"
      : tool === "move_tail"
        ? objectMode
          ? "Tool: Object Move / Scale (G/T, Shift+Drag to scale)"
          : "Tool: Move Tail (T)"
        : tool === "rotate"
          ? objectMode
            ? "Tool: Object Rotate (R)"
            : "Tool: Rotate/Length (R)"
          : "Tool: Auto";
  setStatus(label);
  refreshCanvasInteractionAffordance();
}

function isObjectMoveScaleTool(tool = state.dragTool) {
  return tool === "auto" || tool === "move_head" || tool === "move_tail";
}

function refreshObjectTransformToolUI() {
  const objectModeActive = !!(state.mesh && (state.editMode === "skeleton" || state.editMode === "object") && state.boneMode === "object");
  const moveActive = objectModeActive && isObjectMoveScaleTool();
  const rotateActive = objectModeActive && state.dragTool === "rotate";
  if (els.objectPanelMoveBtn) {
    els.objectPanelMoveBtn.classList.toggle("active", moveActive);
    els.objectPanelMoveBtn.disabled = !objectModeActive;
    els.objectPanelMoveBtn.setAttribute("aria-pressed", moveActive ? "true" : "false");
  }
  if (els.objectPanelRotateBtn) {
    els.objectPanelRotateBtn.classList.toggle("active", rotateActive);
    els.objectPanelRotateBtn.disabled = !objectModeActive;
    els.objectPanelRotateBtn.setAttribute("aria-pressed", rotateActive ? "true" : "false");
  }
}

function refreshCanvasInteractionAffordance() {
  if (!els.stage) return;
  const objectModeActive = !!(state.mesh && (state.editMode === "skeleton" || state.editMode === "object") && state.boneMode === "object");
  const objectMoveTool = objectModeActive && isObjectMoveScaleTool();
  const objectRotateTool = objectModeActive && state.dragTool === "rotate";
  const objectDragging =
    objectModeActive &&
    !!state.drag &&
    (state.drag.type === "bone_object_move" || state.drag.type === "bone_object_rotate" || state.drag.type === "bone_object_scale");
  els.stage.classList.toggle("object-mode", objectModeActive);
  els.stage.classList.toggle("object-tool-move", objectMoveTool);
  els.stage.classList.toggle("object-tool-rotate", objectRotateTool);
  els.stage.classList.toggle("object-dragging", objectDragging);
  if (objectModeActive) {
    const draggingType = String(state.drag && state.drag.type ? state.drag.type : "");
    const toolText = objectRotateTool ? "Object Rotate" : "Object Move/Scale";
    const keyText = objectRotateTool ? "R" : "G/T + Shift-drag scale";
    const bones = state.mesh ? getBonesForCurrentMode(state.mesh) : [];
    const selectedRoots = getSelectedObjectRootSet(state.mesh, bones);
    const rootIndex = selectedRoots.size > 0 ? [...selectedRoots][0] : getBoneRootIndexFromBones(bones, state.selectedBone);
    const rootName =
      Number.isFinite(rootIndex) && rootIndex >= 0 && rootIndex < bones.length && bones[rootIndex] && bones[rootIndex].name
        ? bones[rootIndex].name
        : "";
    const selectedText = rootName ? ` | Selected: ${rootName}` : "";
    const draggingText =
      draggingType === "bone_object_scale"
        ? "Object Scale - Dragging"
        : draggingType === "bone_object_rotate"
          ? "Object Rotate - Dragging"
          : `${toolText} - Dragging`;
    els.stage.dataset.objectTool = (objectDragging ? draggingText : `${toolText} (${keyText})`) + selectedText;
  } else {
    delete els.stage.dataset.objectTool;
  }
  refreshObjectTransformToolUI();
}

function getIKEndBoneIndex(ik) {
  if (!ik || !Array.isArray(ik.bones) || ik.bones.length === 0) return -1;
  const bi = Number(ik.bones[ik.bones.length - 1]);
  return Number.isFinite(bi) ? bi : -1;
}

function selectActiveIKEndBone(updateUI = true) {
  const m = state.mesh;
  const ik = getActiveIKConstraint();
  if (!m || !ik) return false;
  const endBi = getIKEndBoneIndex(ik);
  if (!Number.isFinite(endBi) || endBi < 0 || endBi >= m.rigBones.length) return false;
  state.selectedBone = endBi;
  state.selectedBonesForWeight = [endBi];
  if (updateUI) updateBoneUI();
  return true;
}

function toggleSelectedConnect() {
  const m = state.mesh;
  if (!m) return;
  const i = state.selectedBone;
  if (i < 0) return;
  const rig = m.rigBones[i];
  const pose = m.poseBones[i];
  if (!rig || rig.parent < 0) return;
  const next = !rig.connected;
  rig.connected = next;
  if (pose) pose.connected = next;
  enforceConnectedHeads(m.rigBones);
  enforceConnectedHeads(m.poseBones);
  if (state.boneMode === "edit") {
    commitRigEdit(m, true);
  }
  updateBoneUI();
  setStatus(`Bone ${i} link: ${next ? "Connected" : "Disconnected"}`);
}

function selectBoneDelta(delta) {
  const m = state.mesh;
  if (!m) return;
  const count = getActiveBones(m).length;
  if (count <= 0) return;
  state.selectedBone = (state.selectedBone + delta + count) % count;
  state.selectedBonesForWeight = [state.selectedBone];
  updateBoneUI();
}

function clearBoneSelection(updateStatus = false) {
  state.selectedBonesForWeight = [];
  state.selectedBoneParts = [];
  state.selectedBone = -1;
  updateBoneUI();
  if (updateStatus) setStatus("Bone selection cleared.");
}

function getSelectedBonesForWeight(m) {
  if (!m || !m.rigBones) return [];
  const count = m.rigBones.length;
  const raw =
    Array.isArray(state.selectedBonesForWeight) && state.selectedBonesForWeight.length > 0
      ? state.selectedBonesForWeight
      : [state.selectedBone];
  const out = [];
  for (const i of raw) {
    if (Number.isFinite(i) && i >= 0 && i < count && !out.includes(i)) {
      out.push(i);
    }
  }
  return out;
}

function expandSelectedBonesToSubtrees(m, picked) {
  if (!m || !Array.isArray(m.rigBones)) return [];
  const bones = m.rigBones;
  const out = [];
  const seen = new Set();
  for (const raw of Array.isArray(picked) ? picked : []) {
    const bi = Number(raw);
    if (!Number.isFinite(bi) || bi < 0 || bi >= bones.length) continue;
    const subtree = getBoneSubtreeIndices(bones, bi);
    for (const si of subtree) {
      if (seen.has(si)) continue;
      seen.add(si);
      out.push(si);
    }
  }
  return out;
}

function makeAnimId() {
  return `anim_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function makeLayerTrackId() {
  return `layer_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function createAnimation(name = "Anim") {
  return normalizeAnimationRecord({
    id: makeAnimId(),
    name,
    duration: 5,
    rangeStart: 0,
    rangeEnd: 5,
    tracks: {},
  });
}

function normalizeAnimationRecord(anim, fallbackName = "Anim") {
  const out = anim && typeof anim === "object" ? anim : {};
  out.id = out.id ? String(out.id) : makeAnimId();
  out.name = out.name ? String(out.name) : fallbackName;
  out.duration = Math.max(0.1, Number(out.duration) || 5);
  const minSpan = 0.01;
  const maxStart = Math.max(0, out.duration - minSpan);
  const rawStart = Number.isFinite(Number(out.rangeStart)) ? Number(out.rangeStart) : 0;
  const start = math.clamp(rawStart, 0, maxStart);
  const rawEnd = Number.isFinite(Number(out.rangeEnd)) ? Number(out.rangeEnd) : out.duration;
  const end = math.clamp(rawEnd, Math.min(out.duration, start + minSpan), out.duration);
  out.rangeStart = start;
  out.rangeEnd = end;
  out.tracks = out.tracks && typeof out.tracks === "object" ? out.tracks : {};
  return out;
}

function getAnimationActiveRange(anim) {
  const a = normalizeAnimationRecord(anim);
  return {
    start: Number(a.rangeStart) || 0,
    end: Number(a.rangeEnd) || a.duration,
    duration: Number(a.duration) || 0.1,
  };
}

function createAnimLayerTrack(name = "Layer") {
  return {
    id: makeLayerTrackId(),
    name,
    enabled: true,
    animId: "",
    loop: true,
    speed: 1,
    offset: 0,
    alpha: 1,
    mode: "replace",
    maskMode: "all",
    maskBones: [],
  };
}

function makeStateId() {
  return `st_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function makeStateTransitionId() {
  return `tr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function makeStateParamId() {
  return `pm_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function makeStateConditionId() {
  return `cd_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function getStateParamTrackId(paramId) {
  return `smparam:${String(paramId || "")}`;
}

function parseStateParamRawValue(raw, type = "float") {
  if (type === "bool") {
    const s = String(raw == null ? "" : raw).trim().toLowerCase();
    return s === "true" || s === "1" || s === "yes" || s === "on";
  }
  return Number(raw) || 0;
}

function getStateParamById(sm, id) {
  if (!sm || !Array.isArray(sm.parameters)) return null;
  return sm.parameters.find((p) => p.id === String(id || "")) || null;
}

function getStateParamByName(sm, name) {
  if (!sm || !Array.isArray(sm.parameters)) return null;
  const key = String(name || "").trim();
  if (!key) return null;
  return sm.parameters.find((p) => String(p.name || "") === key) || null;
}

function setStateMachineParamValue(name, rawValue, options = null) {
  const sm = ensureStateMachine();
  const param = getStateParamByName(sm, name);
  if (!param) return false;
  const opts = options && typeof options === "object" ? options : {};
  param.value = parseStateParamRawValue(rawValue, param.type);
  if (opts.refresh !== false) refreshStateMachineUI();
  if (opts.sample !== false && state.mesh) {
    if (!state.anim.mix.active) tryRunAutoOrConditionalTransition({});
    samplePoseAtTime(state.mesh, state.anim.time);
    renderTimelineTracks();
  }
  return true;
}

function buildStateMachineBridgePayload() {
  const sm = ensureStateMachine();
  const states = Array.isArray(sm.states) ? sm.states : [];
  const params = Array.isArray(sm.parameters) ? sm.parameters : [];
  const out = {
    version: 1,
    api: {
      set: "window.setAnimParam(name, value)",
      get: "window.getAnimParam(name)",
      list: "window.listAnimParams()",
    },
    stateMachine: {
      enabled: sm.enabled !== false,
      currentStateId: String(sm.currentStateId || ""),
      states: states.map((s) => ({
        id: String(s.id || ""),
        name: String(s.name || ""),
        animId: String(s.animId || ""),
        transitions: Array.isArray(s.transitions)
          ? s.transitions.map((t) => ({
            id: String(t.id || ""),
            toStateId: String(t.toStateId || ""),
            duration: Number(t.duration) || 0.2,
            auto: t.auto === true,
            conditions: Array.isArray(t.conditions)
              ? t.conditions.map((c) => {
                const p = getStateParamById(sm, c.paramId);
                return {
                  id: String(c.id || ""),
                  paramId: String(c.paramId || ""),
                  paramName: p ? String(p.name || "") : "",
                  op: String(c.op || "eq"),
                  value: c.value,
                };
              })
              : [],
          }))
          : [],
      })),
      parameters: params.map((p) => ({
        id: String(p.id || ""),
        name: String(p.name || ""),
        type: p.type === "bool" ? "bool" : "float",
        defaultValue: p.defaultValue,
        value: p.value,
      })),
    },
  };
  return out;
}

// ============================================================
