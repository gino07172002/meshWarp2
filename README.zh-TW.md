# Web 版類 Spine 2D 網格動畫編輯器

[English](README.md) · **中文**

瀏覽器內執行的 2D 骨架動畫編輯器,工作流程仿照 Spine 2D。
純 JavaScript + WebGL + HTML5 Canvas,**沒有打包工具、不用 build step** ——
打開 `index.html`(透過本地 HTTP server)就能跑。

支援完整 Spine 4.x 綁骨流程:骨骼、Slot、Mesh attachment(含加權蒙皮)、
四種約束(IK / Transform / Path / Physics)、含骨骼範圍的 Skin、含 deform /
event / draw-order 軌道的時間軸動畫,以及 Spine JSON / .skel 二進位 / .atlas
完整匯入匯出。

## 快速開始

```bash
python -m http.server 5173
# 開啟 http://localhost:5173
```

就這樣。**不需要 `npm install`,不需要打包**。

## 專案結構

```
app/
  core/            els 註冊表、state、math、GL 設定、rig math、debug 接口
  workspace/       slot 資料模型、attachment、約束 normalization
  render/          每幀渲染 loop、約束 solver、權重工具
  animation/       時間軸 UI、動畫 runtime、autosave / persistence
  io/              專案存檔讀檔、Spine 匯入匯出、atlas packer
  ui/              面板、快捷鍵、dock layout、bootstrap
docs/
  superpowers/
    specs/         功能規格 + 主測試案例清單
    runbooks/      操作指引(測試、AI capture)
    plans/         設計計畫(保留追溯歷史)
  legacy/          舊版 handoff 筆記,保留 git 歷史脈絡
tools/             25+ 個 Node 靜態檢查工具(`node tools/check-*.js`)
```

## 已實作的功能

**骨架**:多層骨骼階層、5 種繼承模式全到齊、所有 transform 通道、拖拉重排。

**Slot 與 attachment**:6 種 attachment 類型 —— Region、Mesh、Linked Mesh、
Bounding Box、Clipping、Point。雙色 tint(light + dark)。4 種 blend mode。
含骨骼範圍的 Skin scope 與 runtime 可見性過濾。

**Mesh 編輯**:proportional / mirror 兩種頂點編輯模式、依 alpha 自動描邊
(auto-foreground)、自動三角化、grid fill、subdivide / centroid /
flip-edge / generate-by-area 微工具、加權綁定、權重筆刷(4 種模式 + 鎖骨 +
平滑)、prune / weld / swap / update bindings。

**約束**:IK 1-bone & 2-bone、Transform、Path(drawn / slot / bone-chain
三種來源),以及 **Spine 4.2 Physics constraint**(semi-implicit Euler solver
+ 彈簧 + damping + 風/重力 + 個別 bone 狀態 reset)。

**動畫**:時間軸支援 bone / slot / constraint / deform / drawOrder / event
全軌道類型。Linear / stepped / bezier 三種插值。Auto-key。Onion skin(含
keyframes-only 模式 + pixels-per-frame 動向預覽)。動畫 layer 含 bone mask
混合。狀態機(states / transitions / parameters / conditions)+ runtime
bridge code 匯出。**音訊事件含波形顯示**在 event 軌道上。

**渲染**(WebGL 為主):
- Stencil-based clip slot 遮罩 —— 不再退回 Canvas2D
- Base reference 圖以貼圖矩形繪製
- 雙色 tint shader
- GPU 權重 heatmap

**匯入 / 匯出**:
- 原生專案 JSON(嵌入圖片 data URL)
- Spine 4.x JSON 匯出 —— 骨骼、slot、加權 mesh、4 種約束、deform 軌道、
  雙色 tint、sequence 影格
- Spine SKEL 二進位匯出
- **Atlas 進階打包** —— 多頁、旋轉、trim、bleed、可調 padding(shelf packer)
- Spine 4.x JSON 匯入(v1) —— 骨骼、slot、加權 mesh、動畫
- WebM / GIF / PNG 序列的預覽匯出 + 批次匯出

**Diagnostic 接口**(打開瀏覽器 console,輸入 `debug.help()`):
- `debug.snapshot()` —— 一眼看主要狀態
- `debug.timing()` —— 每幀渲染分階段耗時(deform / slotDraw / overlay)
- `debug.actionLog()` —— 最近 N 個使用者操作,bug 重現用
- `debug.errors()` —— 自動捕獲的 exception + 手動回報
- `debug.findSlot(name)` / `debug.findBone(name)` —— 快速查找

## 已知限制

- **Spine 匯入 v1** 是用名稱對應到既有專案的 slot —— 不會從 atlas 自動建立
  slot。Linked-mesh 繼承關係、IK / Transform / Path / Physics 約束匯入、
  以及 `default` 以外的 skin 會印 warning 跳過。
- **音訊波形** 用 Web Audio 的 `decodeAudioData` —— 第一次 decode 是非同步的,
  SVG 等 decode 完才會出現。
- **約束 Move Up / Down** 用 `order` 欄位,runtime resolve 順序 follow Spine
  (Path → Transform → IK → Physics),但 UI 排序是各約束類型內部各自排。
- **人形 Auto-Rig** 需要在 runtime 載 TensorFlow.js / MediaPipe ——
  第一次跑會下載 ~5 MB。

## 測試

完整驗證流程見 [TESTING.md](TESTING.md)。

簡版:

```bash
# 25 個靜態檢查,全部要過
for f in tools/check-*.js; do node "$f"; done

# 測試案例規格驗證(115 recipes / 31 sections)
node tools/test-spec-runner.js --validate
```

瀏覽器端 test runner 的 DSL 在 [TESTING.md](TESTING.md) 「Running test
recipes」段。

## 文件導覽

| 對象 | 該看的 |
|---|---|
| AI agent 接手寫 code | [AGENTS.md](AGENTS.md) |
| 貢獻者 | [CONTRIBUTING.md](CONTRIBUTING.md) |
| 測試 / 驗證 | [TESTING.md](TESTING.md) |
| Spine 功能對標 | [SPINE_FEATURE_GAP.md](SPINE_FEATURE_GAP.md) |
| 功能規格 + 測試案例 | [docs/superpowers/specs/](docs/superpowers/specs/) |
| 設計決策記錄 | [docs/superpowers/plans/](docs/superpowers/plans/) |
| 舊版 handoff 筆記 | [docs/legacy/](docs/legacy/) |

## 建議工作流

1. **Import** 圖片或 PSD(頂端 `Import Image/PSD`)
2. **Mesh** 工作區 —— 描出每個 slot 的 mesh 輪廓 + 自動三角化
3. **Rig** 工作區 —— 建骨骼階層、設 IK / 約束
4. **Object** 工作區 —— 整體姿態微調(可選)
5. **Animate** 工作區 —— 時間軸、layer、狀態機
6. **Export Spine** —— 匯出 JSON / .skel / .atlas / PNG bundle

## 常用快捷鍵

| 分類 | 按鍵 |
|---|---|
| 視圖 | `+` / `-` / `0` 縮放 · 中鍵拖曳 pan |
| 骨骼編輯 | `G` 移動 head · `T` 移動 tail · `R` 旋轉 · `C` 連接 · `P` parent picker |
| 新增骨骼 | `Shift+A` |
| 網格編輯 | `V` select/add 切換 · `L` 連邊 · `U` 斷邊 · `Del` / `X` 刪頂點 |
| 頂點調整 | `O` proportional · `H` mirror · `P` pin · `M` relax |
| 動畫 | `I` 插 key · `K` 刪 key · `Space` 播放/暫停 · `,` `.` 上/下一 frame |
| 權重筆刷 | `W` 切換 |
| 全域 | `Ctrl+Z` / `Ctrl+Y` · `Ctrl+K` 命令面板 · `F11` 全螢幕 |
| 選取 | `A` 全選(Blender 風格) |

## License

見 [LICENSE](LICENSE)。
