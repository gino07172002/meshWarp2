# Web Spine-like Mesh Deformer

以 `WebGL + HTML + JavaScript` 實作的 2D 骨架/網格動畫編輯器，工作流接近 Spine 2D。
支援骨架、Slot、Mesh、權重、三種約束（IK/Transform/Path）、時間軸動畫、狀態機與 Spine 資料匯出。

## 快速開始

```bash
python -m http.server 5173
# 開啟 http://localhost:5173
```

檔案操作（上方工具列）：`New` · `Import Image/PSD` · `Save` · `Load` · `Export Spine` · `Export...`

---

## 工作區說明

頂端有四個工作區 tab，點擊後自動切換到對應模式：

| 工作區 | 用途 | 左側可用工具 |
|---|---|---|
| **Rig** | 骨架建置、IK、約束、蒙皮 | Bones · Rig · IK · Constraint · Path · Skin · Tools |
| **Mesh** | 網格輪廓、頂點編輯、權重 | Mesh · Base Transform |
| **Object** | 整體物件平移/縮放/旋轉 | Object · Tools |
| **Animate** | 時間軸動畫、圖層、狀態機 | Bones · IK · Constraint · Path · Skin · Tools · Base Transform |

頂端工具列右側會顯示目前所在工作區的名稱標籤（如 `Rig — Edit`、`Animate — Pose`）。

---

## 功能對照表（Spine 2D 視角）

### ✅ 已實作

**骨架系統**
- 多層骨骼階層（拖放重排、rename、delete）
- 全 5 種繼承模式：`normal` / `onlyTranslation` / `noRotationOrReflection` / `noScale` / `noScaleOrReflection`
- 全通道：position (x/y)、rotation、length、scaleX/Y、shearX/Y

**Slot / Attachment**
- Slot 建立、刪除、z-order 管理
- Alpha、Color、Dark Color（兩色 tint）
- 4 種 Blend Mode：normal / additive / multiply / screen
- 6 種 Attachment 類型：Image、Mesh、Weighted Mesh、Clipping Path、Bounding Box、Point

**網格 / FFD**
- 頂點編輯、Proportional Edit、Mirror Edit
- 自動三角化、Grid Fill、Auto Foreground Mesh
- Weighted binding（多骨權重）；Auto Weight（single/multi bone）
- 權重 Heatmap 視覺化

**約束（Constraints）**
- IK：1-bone / 2-bone；mix / softness / compress / stretch / uniform
- Transform Constraint：rotate/translate/scale/shear mix 與 offset
- Path Constraint：Bezier path；position/spacing/rotation mix

**動畫 / Timeline**
- 全軌道類型：bone / slot / constraint / deform / drawOrder / event
- 插值：linear / stepped / bezier（含控制把手）
- Auto-key、Onion Skin、Loop helper（seam / ping-pong）
- Animation Layers（含骨骼遮罩混合）
- 狀態機（State / Transition / Parameter / Condition）+ export bridge code

**Skins**
- 建立、刪除、apply、capture

**匯出**
- Spine JSON（4.1 / 4.2）、SKEL binary、ATLAS、PNG
- 預覽：WebM、GIF、PNG 序列
- Export 前驗證與 auto-fix

**其他**
- Undo / Redo、Autosave + 啟動復原
- PSD 匯入（ag-psd）
- Humanoid Auto-Rig（TensorFlow.js + MediaPipe pose detection）
- Command Palette（Ctrl/Cmd+K）

### ❌ 缺少（尚未實作）

- **Spine Import（round-trip）** — 無法讀入 .json/.skel/.atlas
- **Physics Constraints** — Spine 4.0+ 的布料/彈性物理
- **Audio Track** — 音訊波形 / lip-sync 工具
- **Multi-page Atlas** — 目前只支援單頁
- **Atlas 進階選項** — 無 trim/padding/rotation 控制

### ⚠️ 已知問題

- Clipping Path + Mesh 同時作用時，世界座標轉換有 edge case
- SKEL binary export：大量頂點 deform 時 offset buffer 有已知問題
- State Machine 只能 export JSON，無法在工具內模擬執行
- Auto-key 在 mode 切換時偶有漏 key
- Constraint 排序：UI 排序與 runtime resolve 順序可能不一致
- Path Constraint mix 插值在 Animate 播放時偶有不連續

---

## 建議工作流

1. `Import Image/PSD` 匯入素材
2. 切到 **Mesh** 工作區建立網格輪廓
3. 切到 **Rig** 建立骨架、設定 IK / Constraint / Skin
4. 右側 `Bone / Slot Tree` 整理層級與 Slot
5. 切到 **Object** 微調整體姿態（可選）
6. 切到 **Animate** 製作 key、分層動畫、狀態機
7. `Export Spine` 輸出到遊戲引擎

---

## 常用快捷鍵

| 分類 | 按鍵 |
|---|---|
| 視圖 zoom | `+` / `-` / `0` |
| 骨架操作 | `G` (move head) · `T` (move tail) · `R` (rotate) · `C` (connect) · `P` (pick parent) |
| 新增骨骼 | `Shift+A` |
| 動畫 key | `I` (insert key) · `K` (delete key) · `Space` (play) |
| 時間軸移動 | `,` / `.` (prev/next frame) |
| 網格編輯 | `V` (select/add mode toggle) · `L`/`U` (link/unlink edge) · `Del`/`X` (delete vertex) |
| 頂點調整 | `O` (proportional) · `H` (mirror) · `P` (pin) · `M` (relax) |
| 全域 | `Ctrl+Z` / `Ctrl+Y` (undo/redo) · `Ctrl+K` (command palette) |

---

## 開發文件

- 功能差距追蹤：`SPINE_FEATURE_GAP.md`
- 驗證流程：`DEVELOPMENT_VERIFICATION_GUIDE.md`
- Pose Runtime 設定：`POSE_RUNTIME_SETUP.md`
