# Web Spine-like Mesh Deformer

以 `WebGL + HTML + JavaScript` 實作的 2D 骨架/網格動畫編輯器原型，工作流接近 Spine 2D：
可做骨架、Slot、Mesh、權重、約束、時間軸動畫、狀態機與 Spine 資料匯出。

## 專案介紹

這個專案的目標是提供一套「瀏覽器內即可使用」的 Spine-like 製作流程：

1. 匯入圖片或 PSD 建立素材。
2. 建骨架、綁 Slot 與調整 Mesh。
3. 設定 IK / Transform / Path 約束。
4. 在 Timeline 製作動畫、做混合與分層。
5. 匯出 Spine 相容資料（JSON / SKEL / ATLAS / PNG）。

適合用途：
- 原型驗證與技術研究
- 小型 2D 角色動畫製作
- Spine 匯出流程測試與工具鏈整合

## 快速開始

### 1. 啟動本地靜態伺服器

在專案目錄執行：

```bash
python -m http.server 5173
```

### 2. 開啟編輯器

瀏覽器進入：

```text
http://localhost:5173
```

### 3. 基本檔案操作

上方工具列：
- `New`：新專案
- `Import Image/PSD`：匯入素材
- `Save` / `Load`：儲存與讀取專案 JSON
- `Export Spine` 或 `Export...`：輸出 Spine/預覽檔案

## 使用說明

### 工作區與模式

- System Mode：
  - `Setup`：建模/綁骨/調整
  - `Animate`：時間軸與動畫製作
- Target：
  - `Skeleton`：骨架編輯
  - `Mesh`：頂點/網格編輯
  - `Object`：整組骨架物件操作
- Workspace Tabs：
  - `Slot Build`
  - `Rig`
  - `Object`
  - `Animate`

### 建議工作流

1. 匯入圖片（File -> Import Image/PSD）。
2. 到 `Setup` 先建立 Mesh、骨架與基本綁定。
3. 在 `Bone / Slot Tree` 整理層級與 Slot。
4. 進入 `Rig / IK / Constraint / Path / Skin` 微調結構。
5. 切到 `Animate` 製作 key 與動畫狀態機。
6. 匯出 Spine 或預覽影片/GIF/批次輸出。

## 功能操作說明

### Setup（左側 Setup）

- `Rebuild Mesh`：重建網格。
- `Add Bone` / `Delete Bone`：快速骨架操作。
- `Auto Weight (Single Bone)`：
  - 會切到單骨權重策略（hard）。
  - 若 slot 原本沒骨，會以權重最重骨作為 slot 主 bone。
- `Auto Weight (Multi Bone)`：
  - 會切到多骨權重策略（soft）。
  - 若 slot 原本沒骨，會先自動建立一根以 slot 中心為基準的新 bone，再做 multi-bone 綁定。
- `Edit Weights (Vertex)`：進入權重/頂點細修流程。
- `Humanoid Auto Rig / Bind` 區：
  - `humanoid bone`：以姿態估計自動建立人形骨架。
  - `Pose Source / Min Score / Smoothing / Fallback`：自動建骨參數。
  - `Bind Slot -> Selected Bone(s)`：快速綁定所選骨架。

### Rig / Bone Tree

- 右側 `Bone / Slot Tree`：
  - `+ Bone` 新增骨頭
  - `Delete Bone`（含子選單：移到 staging 或連 Slot 一起刪）
  - `Only Active Slot` / `Hide Scope` / `Bind Selected Staging`
- 支援樹狀拖放、Slot 重排、未綁定 staging 管理。

### IK / Transform / Path / Skin

- IK：
  - 1-bone / 2-bone
  - 目標骨與混合參數
- Transform Constraint：
  - 多骨約束清單、offset 與 mix
- Path Constraint：
  - Drawn Path 或 Slot path
  - Path 跟隨與旋轉/位移混合
- Skin：
  - 建立、套用、快照捕捉

### Animation / Timeline / State Machine

- 多動畫管理、加減 key、插值（linear/stepped/bezier）。
- 追蹤骨頭變形、slot、約束、事件、draw order。
- 支援 Layer 與骨頭遮罩混合。
- 內建 State Machine（state/transition/parameter/condition）。

## 匯出與相容性

- Spine 匯出：
  - `.json`
  - `.skel`
  - `.atlas`
  - `.png`
- Spine 相容版本：
  - `4.2`
  - `4.1`
- 預覽輸出：
  - WebM
  - GIF
  - PNG 序列（含批次）

## 常用快捷鍵（節錄）

- 視圖：`+` / `-` / `0`
- 骨架：`G` / `T` / `R`、`C`、`P`、`Shift+A`
- 時間軸：`I` / `K`、`Space`、`,` / `.`
- 網格：`L`/`U` 邊連結、`Del/X` 刪點

## 已知限制

- 目前仍以單檔 `app.js` 為主，模組化程度有限。
- 尚未提供完整 Spine 專案反向匯入（json/skel/atlas -> 編輯場景）。
- 物理約束與進階骨肉效果尚未完整。
- Atlas 打包目前以基本流程為主（進階多頁/旋轉/trim 待補）。
- PSD 匯入依賴 `ag-psd` 載入可用性。

## 開發文件

- 功能差距追蹤：`SPINE_FEATURE_GAP.md`
- 驗證流程：`DEVELOPMENT_VERIFICATION_GUIDE.md`
- PR 模板：`.github/PULL_REQUEST_TEMPLATE.md`
