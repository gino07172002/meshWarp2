// ROLE: Image workspace IO — drag/drop, file picker, PNG download,
// "send back to attachment" round-trip. Wired on DOM ready.
//
// Loaded after image-workspace.js (depends on window.ImageWorkspace).
//
// EXPORTS (under window.ImageIO):
//   downloadCurrentAsPng(filename?)
//   applyToAttachment()         writes work canvas back to source attachment
//   sendToNewSlot()             creates a new slot from work canvas
//   loadFromFileDialog()        opens the hidden file input
//   wire()                      wires drop zone, file input, buttons

(function buildImageIO() {
  if (typeof window === "undefined") return;
  if (window.ImageIO && window.ImageIO.__installed) return;

  function downloadCurrentAsPng(filename) {
    const c = window.ImageWorkspace ? window.ImageWorkspace.getWorkCanvas() : null;
    if (!c) {
      if (typeof setStatus === "function") setStatus("No image to download.");
      return false;
    }
    const name = String(filename || "image.png");
    c.toBlob((blob) => {
      if (!blob) {
        if (typeof setStatus === "function") setStatus("PNG encode failed.");
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      // Defer revoke so the click has a chance to be handled
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, "image/png");
    return true;
  }

  function applyToAttachment() {
    const ie = state.imageEditor;
    if (!ie) return false;
    const src = ie.source;
    if (src.origin !== "attachment") return false;
    const slot = state.slots[src.slotIndex];
    if (!slot) return false;
    const att = (typeof getSlotAttachmentEntry === "function")
      ? getSlotAttachmentEntry(slot, src.attachmentName)
      : null;
    if (!att) {
      if (typeof setStatus === "function") setStatus("Apply failed: attachment not found.");
      return false;
    }
    const newCanvas = ie.workCanvas;
    if (!newCanvas) return false;
    if (att.canvas && typeof releaseGLTextureForCanvas === "function") {
      try { releaseGLTextureForCanvas(att.canvas); } catch (_) { /* tolerate */ }
    }
    att.canvas = newCanvas;
    if (typeof syncSourceCanvasToActiveAttachment === "function") {
      syncSourceCanvasToActiveAttachment(slot);
    }
    if (typeof refreshSlotUI === "function") refreshSlotUI();
    if (typeof pushUndoCheckpoint === "function") pushUndoCheckpoint(true);
    if (typeof requestRender === "function") requestRender("image_apply");
    if (typeof setStatus === "function") setStatus(`Applied to attachment: ${src.attachmentName}`);
    // Switch back to mesh workspace
    if (typeof applyWorkspace === "function") applyWorkspace("mesh", "edit");
    return true;
  }

  function sendToNewSlot() {
    const ie = state.imageEditor;
    if (!ie || !ie.workCanvas) return false;
    if (typeof addSlotEntry !== "function") {
      if (typeof setStatus === "function") setStatus("Cannot create slot: addSlotEntry unavailable.");
      return false;
    }
    const c = window.ImageWorkspace._cloneCanvas(ie.workCanvas);
    addSlotEntry({
      name: ie.source.attachmentName || "image",
      canvas: c,
      docWidth: c.width,
      docHeight: c.height,
      rect: { x: 0, y: 0, w: c.width, h: c.height },
    }, true);
    if (typeof pushUndoCheckpoint === "function") pushUndoCheckpoint(true);
    if (typeof setStatus === "function") setStatus("Image sent to new slot.");
    if (typeof applyWorkspace === "function") applyWorkspace("mesh", "edit");
    return true;
  }

  function loadFromFileDialog() {
    if (els.imageFileInput) els.imageFileInput.click();
  }

  // -- Wiring ---------------------------------------------------------------
  function preventDefaults(ev) {
    ev.preventDefault();
    ev.stopPropagation();
  }

  function wire() {
    if (window.ImageIO.__wired) return;
    window.ImageIO.__wired = true;

    // Drop zone
    if (els.imageDropZone) {
      ["dragenter", "dragover"].forEach((evName) => {
        els.imageDropZone.addEventListener(evName, (ev) => {
          preventDefaults(ev);
          els.imageDropZone.classList.add("dragover");
        });
      });
      ["dragleave", "drop"].forEach((evName) => {
        els.imageDropZone.addEventListener(evName, (ev) => {
          preventDefaults(ev);
          els.imageDropZone.classList.remove("dragover");
        });
      });
      els.imageDropZone.addEventListener("drop", async (ev) => {
        const files = ev.dataTransfer && ev.dataTransfer.files;
        if (!files || !files.length) return;
        const file = files[0];
        if (!file.type.startsWith("image/")) {
          if (typeof setStatus === "function") setStatus("Drop an image file.");
          return;
        }
        await window.ImageWorkspace.loadFromBlob(file, "drop");
      });
      els.imageDropZone.addEventListener("click", loadFromFileDialog);
    }

    // File input
    if (els.imageFileInput) {
      els.imageFileInput.addEventListener("change", async (ev) => {
        const file = ev.target.files && ev.target.files[0];
        if (file) await window.ImageWorkspace.loadFromBlob(file, "file");
        ev.target.value = "";
      });
    }

    // Toolbar buttons
    if (els.imageDownloadBtn) {
      els.imageDownloadBtn.addEventListener("click", () => {
        const ie = state.imageEditor;
        const name = ie && ie.source && ie.source.attachmentName ? `${ie.source.attachmentName}.png` : "image.png";
        downloadCurrentAsPng(name);
      });
    }
    if (els.imageApplyBtn) {
      els.imageApplyBtn.addEventListener("click", applyToAttachment);
    }
    if (els.imageSendNewSlotBtn) {
      els.imageSendNewSlotBtn.addEventListener("click", sendToNewSlot);
    }
    if (els.imageUndoBtn) {
      els.imageUndoBtn.addEventListener("click", () => window.ImageWorkspace.undo());
    }
    if (els.imageRedoBtn) {
      els.imageRedoBtn.addEventListener("click", () => window.ImageWorkspace.redo());
    }
    if (els.imageResetBtn) {
      els.imageResetBtn.addEventListener("click", () => window.ImageWorkspace.resetToSource());
    }
    if (els.imageOpenFileBtn) {
      els.imageOpenFileBtn.addEventListener("click", loadFromFileDialog);
    }

    // History list (delegate clicks on rows)
    if (els.imageHistoryList) {
      els.imageHistoryList.addEventListener("click", (ev) => {
        const row = ev.target && ev.target.closest && ev.target.closest("[data-history-index]");
        if (!row) return;
        const i = Number(row.getAttribute("data-history-index"));
        const ie = state.imageEditor;
        if (!ie || !Number.isFinite(i) || i < 0 || i >= ie.history.length) return;
        ie.historyIndex = i;
        ie.workCanvas = window.ImageWorkspace._cloneCanvas(ie.history[i].canvas);
        window.ImageWorkspace.refreshUI();
      });
    }
  }

  if (typeof window !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", wire);
    } else {
      setTimeout(wire, 0);
    }
  }

  window.ImageIO = {
    __installed: true,
    version: 1,
    downloadCurrentAsPng,
    applyToAttachment,
    sendToNewSlot,
    loadFromFileDialog,
    wire,
  };
})();
