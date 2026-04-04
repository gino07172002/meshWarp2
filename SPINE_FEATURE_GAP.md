# Spine 2D Feature Gap

Tracks parity status against Spine editor/runtime workflows.
Last updated: `2026-04-04`

---

## ✅ 已實作（Implemented）

### Authoring
- Undo/redo command stack
- Autosave snapshots + startup recovery
- Diagnostics panel (integrity checks + export validation + auto-fix)
- Command palette (Ctrl/Cmd+K)

### Skeleton
- Multi-bone hierarchy with drag-drop reorder
- All 5 inherit modes: `normal` / `onlyTranslation` / `noRotationOrReflection` / `noScale` / `noScaleOrReflection`
- Full bone channels: x/y, rotation, length, scaleX/Y, shearX/Y
- Rig edit vs pose animate separation

### Slots & Attachments
- Slot management (create/delete/z-order)
- Slot alpha, color, dark color (two-color tint)
- Blend modes: normal / additive / multiply / screen
- Attachment types: Image, Mesh, Weighted Mesh, Clipping Path, Bounding Box, Point
- Sequence attachment metadata

### Mesh / FFD
- Vertex editing with Proportional Edit + Mirror Edit
- Auto-triangulate, Grid Fill, Auto Foreground Mesh
- Hard / Soft / Free vertex binding
- Auto Weight (single bone / multi-bone strategies)
- Weight heatmap + Blender-style gradient overlay

### Constraints
- IK: 1-bone & 2-bone; mix/softness/compress/stretch/uniform
- Transform Constraint: per-channel mix, offsets, local mode
- Path Constraint: Bezier path, position/spacing/rotation mix

### Animation
- Timeline tracks: bone / slot / constraint / deform / drawOrder / event
- Interpolation: linear / stepped / bezier (with control handles)
- Auto-key, Onion Skin, Loop helpers (seam / ping-pong)
- Animation Layers (with bone mask blending)
- State Machine (states / transitions / parameters / conditions) + bridge export

### Skins
- Create, delete, apply, capture

### Export
- Spine JSON (4.1 / 4.2), SKEL binary, ATLAS, PNG
- Preview: WebM, GIF, PNG sequence (batch)
- Slot visual export: blend mode + two-color (twoColor JSON rows)

### Import
- PNG / JPG / WebP / PSD (via ag-psd)
- Humanoid Auto-Rig (TensorFlow.js + MediaPipe)

---

## ❌ 缺少（Missing — 高優先）

| 功能 | 說明 |
|---|---|
| **Spine Import (round-trip)** | 無法讀入 .json/.skel/.atlas；無法做往返測試 |
| **Physics Constraints** | Spine 4.0+ 布料/彈性物理，完全未實作 |
| **Audio Track** | Timeline 上無音訊波形 / lip-sync 工具 |
| **Multi-page Atlas** | 目前只能輸出單頁 texture |
| **Atlas 進階打包** | 無 trim / padding / rotation / bleed 控制 |
| **Sequence 完整流程** | 資料結構存在，但 timeline 控制不完整 |

---

## ⚠️ 已實作但有問題（Broken / Incomplete）

| 問題 | 詳細 | 優先 |
|---|---|---|
| Clipping Path + Mesh 組合 | 裁切遮罩與 FFD 同時作用時世界座標轉換有 edge case | 高 |
| SKEL binary export | 大量頂點 deform 時 offset buffer 計算有已知問題 | 高 |
| State Machine 模擬 | 只能 export JSON，工具內無法模擬/預覽執行 | 中 |
| Auto-key 漏 key | Mode 切換時偶爾沒有正確寫入當前 pose | 中 |
| Constraint 排序 | UI 排序 ≠ runtime resolve 順序（DEVELOPMENT_VERIFICATION_GUIDE 有記錄） | 中 |
| Path Constraint mix 插值 | Animate 播放時 mix 軌道插值偶有不連續 | 低 |

---

## 中低優先（Medium / Low Priority）

- Physics / 次要動態（彈簧、慣性）
- 進階 atlas 打包（多頁、旋轉、trim）
- 音訊輔助時機工具
- `app.js` 模組化分割
- 大型 rig（1000+ bone）的 UI 效能

---

## Compatibility Notes

- 目標格式：Spine 4.1 / 4.2
- 下列組合仍需按專案驗證：
  - slot 視覺通道（blend mode / two-color 在 JSON 與 binary path 的差異）
  - clip + deform 組合
  - 由 contour 產生的 path constraint
  - 分層動畫混合假設

---

## Reference Docs

- Bones: https://esotericsoftware.com/spine-bones
- Constraints: https://esotericsoftware.com/spine-constraints
- IK constraints: https://esotericsoftware.com/spine-ik-constraints
- Transform constraints: https://esotericsoftware.com/spine-transform-constraints
- Path constraints: https://esotericsoftware.com/spine-path-constraints
- JSON format: https://esotericsoftware.com/spine-json-format
- Inherit modes: https://esotericsoftware.com/spine-api-reference
