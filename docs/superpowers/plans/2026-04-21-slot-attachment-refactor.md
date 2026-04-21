# Slot → Attachment 架構重構計畫(Spine2D 風格)

**日期**: 2026-04-21
**目的**: 將「slot == mesh」的舊設計完整轉換為 Spine2D 的「slot 擁有多個 attachment、mesh 是 attachment 的一種類型」架構
**交付對象**: Codex 實作

---

## 1. 背景與現況

目前專案處於**混合架構**:slot 上同時存在舊式的 `slot.meshData` / `slot.meshContour` 與現代的 `slot.attachments[]`(每個 attachment 各自帶 `meshData` / `meshContour`)。序列化與載入流程已經有 legacy 升級邏輯(`promoteLegacySlotMeshState` in [workspace.js:542](app/workspace/workspace.js#L542)),顯示這個方向是早已規劃的。

現在要做的是**完成這個轉換**:徹底把 mesh/contour/weights 移到 attachment 上,slot 只負責「容器」職責(顏色、blend、可見性、目前啟用的 attachment 名稱),並補齊對應的 UI 操作(新增/刪除/切換類型)與使用者體驗。

### 1.1 Spine2D 標準設計(目標)

```
Slot {
  name, bone, color, alpha, blend, dark,
  visible,
  activeAttachment: string | null      // 當前顯示的 attachment 名稱
  attachments: Attachment[]            // 容器
}

Attachment (abstract) {
  name, placeholder, type
}

  ├─ RegionAttachment     { canvas, rect, baseImageTransform }
  ├─ MeshAttachment       { canvas, rect, meshData, meshContour, useWeights, weightMode, influenceBones, weightBindMode }
  ├─ LinkedMeshAttachment { canvas, linkedParent, deformable }
  ├─ BoundingBoxAttachment{ meshContour(僅 contour), bboxSource }
  ├─ ClippingAttachment   { meshContour, clipEndSlotId }
  └─ PointAttachment      { pointX, pointY, pointRot }
```

### 1.2 現況痛點(要解決)

| 痛點 | 現況 | 目標 |
|------|------|------|
| Mesh 被綁死在 slot | `slot.meshData` 與 `slot.meshContour` 存在 | 完全移到 attachment;slot 上這兩欄位徹底移除 |
| 一個 slot 只能有一個 mesh | 雖有 attachments 陣列,但編輯 UI 大多操作「目前的 mesh」 | 可為同一 slot 新增多個 mesh/region attachment,自由切換 |
| Attachment 類型只有 region 被真正支援 | type 欄位存在但 mesh/boundingbox/clipping/point 的 UI 與行為零散 | 每種類型有對應 UI、能新增與轉換 |
| UI 混淆「slot 屬性」與「attachment 屬性」 | 同一 panel 放了 slot 顏色與 mesh 權重 | 拆成「Slot 屬性」與「Attachment 屬性」兩個區塊 |
| Tree 只能折疊顯示 attachment,不能新增/刪除/拖曳 | 右鍵選單沒有 attachment 選項 | Tree 上可直接增刪、重命名、拖曳 attachment |

---

## 2. 重構範圍總覽

| 層級 | 影響 | 估計檔案 |
|------|------|---------|
| **資料模型** | slot 拆解、attachment 類型化 | `app/workspace/workspace.js`, `app/workspace/slots.js`, `app/core/bones.js` |
| **序列化/載入** | 移除 legacy 雙寫,輸出新結構 | `app/io/project-export.js`, `app/io/project-actions.js` |
| **渲染/Runtime** | 改以「當前 attachment」為資料來源 | `app/render/canvas.js`, `app/render/constraints.js`, `app/core/runtime.js` |
| **UI 面板** | Slot/Attachment 面板拆分、類型選擇 | `app/ui/editor-panels.js`, `app/ui/constraint-panels.js`, `index.html`, `styles.css` |
| **Tree 互動** | 新增右鍵選單、拖曳、多選 | `app/io/tree-bindings.js` |
| **快捷鍵** | 新增 attachment 操作快捷鍵 | `app/ui/hotkeys.js` |
| **動畫軌** | attachment 切換 key 已存在,檢查類型變更的行為 | `app/core/runtime.js`(timeline 部分) |
| **約束** | IK/Transform/Path 對 mesh 的引用要改為 attachment 層級 | `app/render/constraints.js`, `app/ui/constraint-panels.js` |

---

## 3. 分階段實作步驟

### **Phase 0 — 準備(1 commit)**

**目的**: 不改行為,只新增 helper、加上棄用警告,讓後續階段可遞增式改動。

1. 在 `app/workspace/slots.js` 新增 **attachment 類型常數與工具**:
   ```js
   export const ATTACHMENT_TYPES = Object.freeze({
     REGION: "region",
     MESH: "mesh",
     LINKED_MESH: "linkedmesh",
     BOUNDING_BOX: "boundingbox",
     CLIPPING: "clipping",
     POINT: "point",
   });

   export function isDeformableAttachment(att) { /* mesh | linkedmesh */ }
   export function isVisualAttachment(att)     { /* region | mesh | linkedmesh */ }
   export function attachmentHasMesh(att)      { /* mesh | linkedmesh | boundingbox | clipping */ }
   ```

2. 在 `bones.js` / `slots.js` 中**所有讀取 `slot.meshData` / `slot.meshContour` 的地方**改成呼叫新 helper:
   ```js
   function readSlotMeshData(slot)    { return getActiveAttachment(slot)?.meshData ?? null; }
   function readSlotMeshContour(slot) { return getActiveAttachment(slot)?.meshContour ?? null; }
   ```
   這兩個 helper **暫時仍 fallback 到 `slot.meshData` 以保持相容性**,但在開發模式(`window.__DEV__`)加 `console.warn("legacy slot.meshData access")`。

3. 搜尋並列出所有直接寫入 `slot.meshData = ...` 或 `slot.meshContour = ...` 的位置,改為寫入 active attachment(但同時仍寫 slot,不改行為)。

**驗收**: 功能完全不變;開啟 DevTools 在各種操作下**不應**看到 legacy 警告。若有,表示 Phase 0 漏抓,要補齊。

---

### **Phase 1 — 資料模型正式化(1-2 commits)**

**目的**: slot 上的 mesh 欄位移除,attachment 成為唯一來源。

1. **修改 `addSlotEntry`** ([workspace.js:189](app/workspace/workspace.js#L189)):
   - 移除 `slot._indices`、`slot.meshData` 欄位(或保留為 getter,讀時去 active attachment 取)
   - 確保每個 slot 至少有一個 attachment(預設 `type: "region"` 或 `"mesh"` 依來源決定)
   - 對於匯入的 legacy 資料:若 entry 本身有 `meshData` 但沒 `attachments[0].meshData`,升級邏輯搬到 `attachments[0]`

2. **修改 `normalizeSlotAttachmentRecord`**:
   - 依 `type` 欄位執行不同的 normalization:
     - `region`: canvas、rect、baseImageTransform
     - `mesh`: 上面全部 + meshData、meshContour、useWeights、weightMode、influenceBones、weightBindMode
     - `linkedmesh`: 記錄 `linkedParent`,runtime 讀取時從 parent 複製 mesh 資料
     - `boundingbox`: 只保留 meshContour,meshData 為 null
     - `clipping`: meshContour + clipEndSlotId
     - `point`: pointX/Y/Rot
   - 各欄位在非對應類型時設為 null / 不帶

3. **移除 `promoteLegacySlotMeshState`** 之外的 legacy 雙寫。保留 promote 作為載入時的單向升級。

4. **`ensureSlotMeshData`** ([slots.js:1716](app/workspace/slots.js#L1716)):
   - 第一行加 early-return:若 `att.type !== "mesh" && att.type !== "linkedmesh"` 直接 return,不建立 meshData
   - `linkedmesh` 情況:轉為讀取 parent mesh 的 positions/indices/uvs,只存 override 的 offsets

5. 把 `slot._indices`、`slot.meshData`、`slot.meshContour` 的讀取點收斂到 helper,然後刪除 slot 上的這些欄位。

**驗收**:
- 新開一個檔案,加入圖片,mesh 正常顯示
- 載入舊存檔,能自動升級並正常顯示
- `slot.meshData === undefined` 應為所有 slot 的新常態(可用 `console.assert` 暫時驗證)

---

### **Phase 2 — 序列化 / 載入(1 commit)**

**目的**: 輸出新結構,讀取容忍新舊兩種。

1. **`buildProjectPayload`** ([project-export.js:53](app/io/project-export.js#L53)):
   - Slot 輸出**不再包含** `meshData` / `meshContour` / `useWeights` / `weightMode` / `influenceBones` / `weightBindMode`(這些全都只在 attachment 下)
   - Attachment 輸出依 `type` 帶對應欄位,其餘欄位不輸出(減少 JSON 體積)
   - 新增 schema 版本欄位:`projectVersion: 2`

2. **`handleProjectLoadInputChange`** ([project-actions.js:35](app/io/project-actions.js#L35)):
   - 讀到 `projectVersion: undefined` 或 `< 2` 時呼叫 `upgradeLegacyProject(payload)`:
     - 把 slot 上的 mesh 欄位搬到 `attachments[0]`(依 `activeAttachment` 指向的 attachment,若無則第一個)
     - 把 `attachments[0]` 的 type 設為 `"mesh"`(若有 meshData)或 `"region"`
   - 讀完後 `projectVersion` 一律寫成 2

3. 寫**升級測試腳本** `tools/check-legacy-project-upgrade.js`:讀一個 fixture 舊檔,確認升級後 slot 上沒有 mesh 欄位、attachment 有。

**驗收**: 舊存檔用新版開啟 → 存檔 → 重新開啟,行為一致。

---

### **Phase 3 — 渲染 & 變形(1 commit)**

**目的**: 渲染與變形完全以 attachment 為單位。

1. **`renderSlots2DWithClipping`** ([canvas.js:8](app/render/canvas.js#L8)):
   - 每個 slot 取 `getActiveAttachment(slot)`
   - 依 attachment.type 分派:
     - `region` → 用 canvas + rect + baseImageTransform 做單一四邊形繪製(沒有 deform 需求時可走快速路徑)
     - `mesh` / `linkedmesh` → 現有的 `buildSlotGeometry` + `drawMeshOnContext`
     - `boundingbox` → 只有在「顯示輔助圖形」時畫輪廓線
     - `clipping` → 建立 path clip,影響後續 slots 直到 `clipEndSlotId`
     - `point` → 只畫一個標記(編輯模式)
   - `region` 類型在沒有 mesh 的情況下**不得**呼叫 `ensureSlotMeshData`

2. **`buildSlotGeometry`** ([constraints.js:1417](app/render/constraints.js#L1417)):
   - 第一行加 `if (!isDeformableAttachment(att)) return null;`,呼叫端處理 null
   - LinkedMesh:從 `linkedParent` 的 slot/attachment 讀 positions/indices/uvs,只套自己的 offsets

3. **Clipping 實作**:目前 clipEndSlotId 已存在,把它從「slot clipping」改成「clipping attachment」驅動。掃描 slot 陣列時若遇到 active attachment type 是 clipping,`ctx.save()`+建立 path+`ctx.clip()`,到指定 end slot 後 `ctx.restore()`。

**驗收**: 所有既有動畫、pose 匯入後畫面完全一致。Region attachment 效能應**變快**(省略 mesh 路徑)。

---

### **Phase 4 — UI 拆分:Slot 面板 vs Attachment 面板(2-3 commits,UI 最重)**

**目的**: 讓使用者清楚知道自己在編輯什麼;支援類型切換與新增。

#### 4.1 Panel 結構

在 `index.html` 把右側現有的「Slot/Mesh 屬性」面板拆成**兩個 section**:

```
┌─────── SLOT ─────────┐
│ Name:        ______  │
│ Bone:        [ ▼ ]   │
│ Blend:       [ ▼ ]   │
│ Color / Dark / Alpha │
│ Visible:     [ ✓ ]   │
│                      │
│ Active Attachment:   │
│ [ ▼ face_happy ]     │
│ [+ Add] [× Delete]   │
└──────────────────────┘

┌───── ATTACHMENT ─────┐
│ Name:       _______  │
│ Type:       [ ▼ ]    │   ← region / mesh / boundingbox / clipping / point / linkedmesh
│ Placeholder: ______  │
│                      │
│ (依類型動態顯示欄位) │
│   region:  baseImageTransform
│   mesh:    weight mode, influence bones, mesh edit 按鈕, sequence
│   linkedm: parent 選擇, deform 勾選
│   bbox:    bbox source (fill/contour)
│   clip:    endSlotId, clipSource
│   point:   X/Y/rotation
└──────────────────────┘
```

#### 4.2 檔案改動

- `index.html`:拆出 `<section id="slotPropsPanel">` 與 `<section id="attachmentPropsPanel">`,attachment 面板內用 `data-att-type` 屬性隱藏/顯示子區塊
- `styles.css`:為兩個面板加視覺區分(標題列、邊框)
- `app/ui/editor-panels.js`:
  - `refreshSlotUI()` 拆成 `refreshSlotPanel()` + `refreshAttachmentPanel()`
  - 依當前 attachment type 顯示/隱藏對應子區塊 (`element.dataset.visibleFor = "mesh"` 之類)
  - `setRightPropsFocus("slot" | "attachment" | "bone")` 新增 "attachment" 焦點,決定哪個 panel 展開

#### 4.3 類型切換

Attachment `Type` 下拉切換時:
- 彈出確認對話框(若會丟失資料,如 mesh → region 會丟 mesh 資料)
- 呼叫新函式 `convertAttachmentType(slot, attName, nextType)`,內部:
  1. 先序列化當前 attachment 為 plain object
  2. 建立新 attachment 物件(保留 name、canvas、placeholder)
  3. 依新 type 初始化對應欄位(如 mesh → 呼叫 `createSlotMeshData`)
  4. 原地替換 `slot.attachments[i]`
  5. 清除動畫軌上與此 attachment 的不相容 key(例如 point attachment 不該有 deform key)

#### 4.4 新增 Attachment 類型選擇

現有 `addAttachmentToActiveSlot` ([tree-bindings.js:1000](app/io/tree-bindings.js#L1000)) 只會複製當前 canvas。改為:
- 新增時彈出小對話框(或 UI 上的一組按鈕)讓使用者選類型
- `addAttachmentOfType(slot, type, opts)`:
  - `region` / `mesh`:需要 canvas(從當前、從檔案載入、或空白)
  - `boundingbox`:預設 contour 為 slot bounding rect 的四個角
  - `clipping`:同 boundingbox,另外開 end slot picker
  - `point`:不需要 canvas,pointX/Y 預設為 slot 中心
  - `linkedmesh`:需選一個 parent(另一個 slot 的 mesh attachment)

---

### **Phase 5 — Tree UI 增強(1-2 commits)**

**目的**: Tree 上能直接管理 attachment,不只是顯示。

1. **Attachment 右鍵選單** ([tree-bindings.js:274](app/io/tree-bindings.js#L274)):
   - 在 contextmenu handler 內偵測 `ev.target.closest(".tree-item.tree-attachment")`
   - 新增 `state.boneTreeMenuContextKind = "attachment"`
   - 選單項目:Rename / Delete / Duplicate / Change Type... / Set as Active
   - 在 `openBoneTreeContextMenu` 的 item 渲染邏輯內加入 `"attachment"` kind 的分支

2. **Attachment inline rename**:雙擊 attachment 列,建立 input 蓋上去,失焦或 Enter 呼叫 `renameAttachment`。

3. **Attachment 拖曳排序**(選做但建議):
   - dragstart 記錄 `{kind: "attachment", slotIndex, attachmentName}`
   - drop 目標為同 slot 的另一 attachment → 重排
   - drop 目標為其他 slot → 視為「移動 attachment 到該 slot」(確認對話框)

4. **Tree 圖示**:
   - Region:方塊圖示
   - Mesh:網格圖示
   - BoundingBox:虛線方塊
   - Clipping:剪刀/梯形
   - Point:點
   - LinkedMesh:連結圖示
   以 CSS class 加小 icon 放在 `.tree-attachment` 列前面。

---

### **Phase 6 — 快捷鍵與編輯器行為(1 commit)**

檔案:`app/ui/hotkeys.js`

1. **新增快捷鍵**:
   - `A`:新增 attachment(類型彈窗)
   - `Shift+A`:複製當前 attachment
   - `Delete`(在 attachment tree item 選中時):刪除 attachment
   - `Tab`:切到下一個 attachment
   - `Shift+Tab`:切到上一個 attachment

2. **Mesh 編輯模式**:
   - 進入 mesh 編輯時檢查 active attachment type;非 mesh 類型則自動切換或提示
   - 編輯結束返回時保留在同一個 attachment

3. **畫布上 attachment 視覺提示**:
   - 非 active attachment 用半透明或虛線輪廓畫出(Spine2D 行為)
   - 可從 view menu 關閉

---

### **Phase 7 — 約束與動畫(1 commit)**

#### 7.1 約束(constraints)

現有 IK/Transform/Path 約束 skinRequired 已存在,但沒有 `attachmentRequired`。本次**不新增 attachmentRequired**(超出範圍),但要確認:

- 約束在計算時不直接碰 `slot.meshData`(改走 attachment)
- Deform 約束(若未來要加)預留 `attachmentName` 欄位位置

#### 7.2 動畫軌

- `attachment` prop 的 track 已存在(keyframe value = attachment name)
- **新增**`deform` track,key path 為 `slot:<idx>:attachment:<name>:deform`,value 為 offsets 陣列
  - 若 attachment 改名,timeline 要同步改(已存在邏輯 at [tree-bindings.js:1055](app/io/tree-bindings.js#L1055))
  - 若 attachment 刪除,對應 deform track 移除
  - 若 attachment 類型轉換到不支援 deform(如 region、point),deform track 清除

---

### **Phase 8 — 清理 & 驗收(1 commit)**

1. **移除 Phase 0 的 legacy fallback warning** 與 fallback 讀取,預期 slot 上永遠沒有 meshData。
2. **新增靜態檢查工具** `tools/check-legacy-slot-mesh.js`:grep 全 codebase 看是否還有 `slot.meshData` / `slot.meshContour` 的直接存取,找到就 fail CI。
3. **更新 `docs/` 內的開發者說明**(若存在)。
4. **手動測試清單**(詳見 §5)。

---

## 4. 關鍵 API / 函式表(Codex 實作參考)

### 4.1 新增

| 函式 | 檔案 | 職責 |
|------|------|------|
| `ATTACHMENT_TYPES` | slots.js | 型別常數 |
| `isDeformableAttachment(att)` | slots.js | mesh / linkedmesh 回 true |
| `isVisualAttachment(att)` | slots.js | region / mesh / linkedmesh 回 true |
| `convertAttachmentType(slot, name, nextType, opts)` | slots.js | 原地轉換類型 |
| `addAttachmentOfType(slot, type, opts)` | slots.js | 新增指定類型 attachment |
| `duplicateAttachment(slot, name)` | slots.js | 複製 |
| `resolveLinkedMeshSource(slot, attachment)` | slots.js | 解析 linkedmesh parent |
| `upgradeLegacyProject(payload)` | project-actions.js | v1 → v2 |
| `readSlotMeshData(slot)` / `readSlotMeshContour(slot)` | slots.js | 取 active attachment 的資料 |
| `refreshAttachmentPanel()` | editor-panels.js | 單獨刷新 attachment 面板 |
| `openAttachmentTypeDialog()` | editor-panels.js | 新增/切換時的類型選擇對話框 |

### 4.2 修改

| 函式 | 檔案 | 改動 |
|------|------|------|
| `addSlotEntry` | workspace.js:189 | 移除 slot-level mesh 欄位 |
| `normalizeSlotAttachmentRecord` | workspace.js | 依 type 正規化 |
| `ensureSlotMeshData` | slots.js:1716 | 非 deformable 直接 return |
| `buildProjectPayload` | project-export.js:53 | 不寫 slot 上的 mesh 欄位、加版本號 |
| `handleProjectLoadInputChange` | project-actions.js:35 | 升級 legacy |
| `renderSlots2DWithClipping` | canvas.js:8 | 依 type 分派渲染 |
| `buildSlotGeometry` | constraints.js:1417 | 非 deformable 回 null |
| `addAttachmentToActiveSlot` | tree-bindings.js:1000 | 支援類型選擇 |
| Bone tree click/contextmenu | tree-bindings.js:46-427 | 支援 attachment 操作 |

### 4.3 移除

- `slot.meshData`、`slot.meshContour`、`slot._indices` 欄位
- `slot.useWeights` / `slot.weightBindMode` / `slot.weightMode` / `slot.influenceBones`(移到 attachment;不過部分 API 已經做了,要檢查是否完全乾淨)
- `promoteLegacySlotMeshState`(load 時升級完就不再需要,改由 `upgradeLegacyProject` 取代)

---

## 5. 手動測試 Checklist(交付前必跑)

- [ ] 新專案:匯入圖片 → 自動產生 slot + 一個 region attachment(或 mesh,看現行預設)
- [ ] 一個 slot 新增第二、第三個 attachment(每種類型至少一個)
- [ ] 切換 active attachment,畫面正確更新
- [ ] 重新命名 attachment,timeline track 名稱同步
- [ ] 刪除 attachment(保留最少 1 個的限制)
- [ ] Region → Mesh 類型轉換,mesh 資料正確建立
- [ ] Mesh → Region 類型轉換,跳確認後 mesh 資料清除
- [ ] LinkedMesh:選 parent,parent 做 mesh 編輯,linked 跟著變形
- [ ] BoundingBox:顯示輪廓,拖點可編輯
- [ ] Clipping:影響後續 slot 範圍正確,到 endSlot 停止
- [ ] Point:畫布上可看到並拖動
- [ ] 舊存檔載入 → 視覺一致 → 再存 → 開啟 → 一致
- [ ] Tree 右鍵選單 / 雙擊改名 / 拖曳排序
- [ ] 快捷鍵(A / Shift+A / Tab / Delete)
- [ ] IK / Transform / Path 約束仍正常運作
- [ ] 動畫:attachment 切換 key 正常;deform key 正常;attachment 刪除後對應 key 被清
- [ ] `tools/check-legacy-slot-mesh.js` 通過(無殘留直接存取)
- [ ] DevTools 無 "legacy slot.meshData access" 警告(Phase 0 工具,Phase 8 移除前跑最後一次)

---

## 6. 風險與緩解

| 風險 | 緩解 |
|------|------|
| 舊存檔無法升級 | Phase 2 先以 fixture 寫升級測試;線上先讓升級只發生於讀取時,存檔仍暫容忍舊格式 3 個版本後再移除 |
| LinkedMesh parent 不存在或被刪 | 刪除 parent 時自動把所有 linkedmesh 的「該 parent」轉成一般 mesh(複製 parent mesh 資料) |
| Clipping 範圍錯誤影響整個畫面 | Clipping 結束點預設為「同 slot 陣列內的下一個 slot」;UI 上強制要求選 endSlot |
| 類型切換誤刪資料 | 所有破壞性切換都有確認對話框;提供 Undo(至少一層) |
| UI 重構打破既有肌肉記憶 | Slot 面板保留在原位置;Attachment 面板出現在它下方,不平行移位 |
| 大 refactor 單 PR 風險高 | 分 Phase 0-8 提交,每個 Phase 可獨立驗收 |

---

## 7. 交付給 Codex 的建議順序

建議依 **Phase 0 → 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8** 順序,每個 Phase 一個 commit(必要時再拆)。每個 Phase 要求 Codex:

1. 先閱讀本計畫對應章節
2. 在實作前列出**預計改動的檔案清單**並與你確認
3. 實作後回報**實際改動清單 + 測試結果**
4. 若遇到計畫未涵蓋的邊界情境,暫停並詢問而非自行決定

---

## 8. 不在本次範圍

- WebGL 渲染路徑(另有 spec)
- Skin 系統的深化(現有 skin 已會同步 attachment 改名/刪除,夠用)
- Animation curve 類型擴充(deform 用既有 linear/step 即可)
- Skeleton 匯出為 Spine 官方 JSON 格式(未來若要做,資料模型已對齊)
