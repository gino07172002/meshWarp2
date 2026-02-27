const els = {
  appRoot: document.getElementById("appRoot"),
  fileNewBtn: document.getElementById("fileNewBtn"),
  fileOpenBtn: document.getElementById("fileOpenBtn"),
  fileSaveBtn: document.getElementById("fileSaveBtn"),
  fileLoadBtn: document.getElementById("fileLoadBtn"),
  fileExportSpineBtn: document.getElementById("fileExportSpineBtn"),
  openExportPanelBtn: document.getElementById("openExportPanelBtn"),
  commandPaletteBtn: document.getElementById("commandPaletteBtn"),
  fileInput: document.getElementById("fileInput"),
  projectLoadInput: document.getElementById("projectLoadInput"),
  workspaceTabs: document.getElementById("workspaceTabs"),
  workspaceTabSlot: document.getElementById("workspaceTabSlot"),
  workspaceTabRig: document.getElementById("workspaceTabRig"),
  workspaceTabAnimate: document.getElementById("workspaceTabAnimate"),
  animateSubTabs: document.getElementById("animateSubTabs"),
  animSubTabTimeline: document.getElementById("animSubTabTimeline"),
  animSubTabLayers: document.getElementById("animSubTabLayers"),
  animSubTabState: document.getElementById("animSubTabState"),
  editModeWrap: document.getElementById("editModeWrap"),
  boneModeWrap: document.getElementById("boneModeWrap"),
  slotSelectWrap: document.getElementById("slotSelectWrap"),
  slotQuickWrap: document.getElementById("slotQuickWrap"),
  slotQuickAddBtn: document.getElementById("slotQuickAddBtn"),
  slotQuickDupBtn: document.getElementById("slotQuickDupBtn"),
  slotQuickDeleteBtn: document.getElementById("slotQuickDeleteBtn"),
  slotViewWrap: document.getElementById("slotViewWrap"),
  activeSkinWrap: document.getElementById("activeSkinWrap"),
  activeSkinSelect: document.getElementById("activeSkinSelect"),
  activeSkinQuickWrap: document.getElementById("activeSkinQuickWrap"),
  activeSkinAddBtn: document.getElementById("activeSkinAddBtn"),
  activeSkinCaptureBtn: document.getElementById("activeSkinCaptureBtn"),
  activeSkinApplyBtn: document.getElementById("activeSkinApplyBtn"),
  spineCompatWrap: document.getElementById("spineCompatWrap"),
  spineCompat: document.getElementById("spineCompat"),
  viewZoomWrap: document.getElementById("viewZoomWrap"),
  viewZoomOutBtn: document.getElementById("viewZoomOutBtn"),
  viewZoomResetBtn: document.getElementById("viewZoomResetBtn"),
  viewZoomInBtn: document.getElementById("viewZoomInBtn"),
  workspaceMode: document.getElementById("workspaceMode"),
  leftToolModeHint: document.getElementById("leftToolModeHint"),
  leftToolTabs: document.getElementById("leftToolTabs"),
  leftTabSetup: document.getElementById("leftTabSetup"),
  leftTabRig: document.getElementById("leftTabRig"),
  leftTabIK: document.getElementById("leftTabIK"),
  leftTabConstraint: document.getElementById("leftTabConstraint"),
  leftTabPath: document.getElementById("leftTabPath"),
  leftTabSkin: document.getElementById("leftTabSkin"),
  leftTabTools: document.getElementById("leftTabTools"),
  leftTabSlotMesh: document.getElementById("leftTabSlotMesh"),
  leftMeshSetup: document.getElementById("leftMeshSetup"),
  leftRigBuild: document.getElementById("leftRigBuild"),
  leftIKTools: document.getElementById("leftIKTools"),
  leftConstraintTools: document.getElementById("leftConstraintTools"),
  leftPathTools: document.getElementById("leftPathTools"),
  leftSkinTools: document.getElementById("leftSkinTools"),
  leftGeneralTools: document.getElementById("leftGeneralTools"),
  leftTools: document.getElementById("leftTools"),
  rightCol: document.getElementById("rightCol"),
  rightTree: document.getElementById("rightTree"),
  rightProps: document.getElementById("rightProps"),
  boneTreeOnlyActiveSlotBtn: document.getElementById("boneTreeOnlyActiveSlotBtn"),
  slotPropsGroup: document.getElementById("slotPropsGroup"),
  bonePropsGroup: document.getElementById("bonePropsGroup"),
  slotSelect: document.getElementById("slotSelect"),
  slotViewMode: document.getElementById("slotViewMode"),
  gridX: document.getElementById("gridX"),
  gridY: document.getElementById("gridY"),
  remeshBtn: document.getElementById("remeshBtn"),
  editMode: document.getElementById("editMode"),
  boneMode: document.getElementById("boneMode"),
  boneSelect: document.getElementById("boneSelect"),
  addBoneBtn: document.getElementById("addBoneBtn"),
  deleteBoneBtn: document.getElementById("deleteBoneBtn"),
  addBoneParent: document.getElementById("addBoneParent"),
  addBoneConnect: document.getElementById("addBoneConnect"),
  ikTools: document.getElementById("leftIKTools"),
  ikAdd1Btn: document.getElementById("ikAdd1Btn"),
  ikAdd2Btn: document.getElementById("ikAdd2Btn"),
  ikMoveUpBtn: document.getElementById("ikMoveUpBtn"),
  ikMoveDownBtn: document.getElementById("ikMoveDownBtn"),
  ikPickTargetBtn: document.getElementById("ikPickTargetBtn"),
  ikRemoveBtn: document.getElementById("ikRemoveBtn"),
  ikList: document.getElementById("ikList"),
  ikSelect: document.getElementById("ikSelect"),
  ikName: document.getElementById("ikName"),
  ikEnabled: document.getElementById("ikEnabled"),
  ikTargetBone: document.getElementById("ikTargetBone"),
  ikBendDir: document.getElementById("ikBendDir"),
  ikEndMode: document.getElementById("ikEndMode"),
  ikBoneA: document.getElementById("ikBoneA"),
  ikBoneB: document.getElementById("ikBoneB"),
  ikMix: document.getElementById("ikMix"),
  ikSoftness: document.getElementById("ikSoftness"),
  ikCompress: document.getElementById("ikCompress"),
  ikStretch: document.getElementById("ikStretch"),
  ikUniform: document.getElementById("ikUniform"),
  ikSkinRequired: document.getElementById("ikSkinRequired"),
  ikHint: document.getElementById("ikHint"),
  tfcAddBtn: document.getElementById("tfcAddBtn"),
  tfcRemoveBtn: document.getElementById("tfcRemoveBtn"),
  tfcMoveUpBtn: document.getElementById("tfcMoveUpBtn"),
  tfcMoveDownBtn: document.getElementById("tfcMoveDownBtn"),
  tfcList: document.getElementById("tfcList"),
  tfcSelect: document.getElementById("tfcSelect"),
  tfcName: document.getElementById("tfcName"),
  tfcEnabled: document.getElementById("tfcEnabled"),
  tfcTargetBone: document.getElementById("tfcTargetBone"),
  tfcBoneSearch: document.getElementById("tfcBoneSearch"),
  tfcBones: document.getElementById("tfcBones"),
  tfcBonesAllBtn: document.getElementById("tfcBonesAllBtn"),
  tfcBonesClearBtn: document.getElementById("tfcBonesClearBtn"),
  tfcBonesInvertBtn: document.getElementById("tfcBonesInvertBtn"),
  tfcLocal: document.getElementById("tfcLocal"),
  tfcRelative: document.getElementById("tfcRelative"),
  tfcRotateMix: document.getElementById("tfcRotateMix"),
  tfcTranslateMix: document.getElementById("tfcTranslateMix"),
  tfcScaleMix: document.getElementById("tfcScaleMix"),
  tfcShearMix: document.getElementById("tfcShearMix"),
  tfcOffsetX: document.getElementById("tfcOffsetX"),
  tfcOffsetY: document.getElementById("tfcOffsetY"),
  tfcOffsetRot: document.getElementById("tfcOffsetRot"),
  tfcOffsetScaleX: document.getElementById("tfcOffsetScaleX"),
  tfcOffsetScaleY: document.getElementById("tfcOffsetScaleY"),
  tfcOffsetShearY: document.getElementById("tfcOffsetShearY"),
  tfcSkinRequired: document.getElementById("tfcSkinRequired"),
  tfcHint: document.getElementById("tfcHint"),
  pathAddBtn: document.getElementById("pathAddBtn"),
  pathRemoveBtn: document.getElementById("pathRemoveBtn"),
  pathMoveUpBtn: document.getElementById("pathMoveUpBtn"),
  pathMoveDownBtn: document.getElementById("pathMoveDownBtn"),
  pathList: document.getElementById("pathList"),
  pathSelect: document.getElementById("pathSelect"),
  pathName: document.getElementById("pathName"),
  pathTargetBone: document.getElementById("pathTargetBone"),
  pathSourceType: document.getElementById("pathSourceType"),
  pathDrawBtn: document.getElementById("pathDrawBtn"),
  pathStopDrawBtn: document.getElementById("pathStopDrawBtn"),
  pathCloseShapeBtn: document.getElementById("pathCloseShapeBtn"),
  pathClearShapeBtn: document.getElementById("pathClearShapeBtn"),
  pathHandleMode: document.getElementById("pathHandleMode"),
  pathApplyHandleModeBtn: document.getElementById("pathApplyHandleModeBtn"),
  pathTargetSlot: document.getElementById("pathTargetSlot"),
  pathEnabled: document.getElementById("pathEnabled"),
  pathBones: document.getElementById("pathBones"),
  pathPositionMode: document.getElementById("pathPositionMode"),
  pathSpacingMode: document.getElementById("pathSpacingMode"),
  pathRotateMode: document.getElementById("pathRotateMode"),
  pathPosition: document.getElementById("pathPosition"),
  pathSpacing: document.getElementById("pathSpacing"),
  pathRotateMix: document.getElementById("pathRotateMix"),
  pathTranslateMix: document.getElementById("pathTranslateMix"),
  pathSkinRequired: document.getElementById("pathSkinRequired"),
  pathClosed: document.getElementById("pathClosed"),
  pathHint: document.getElementById("pathHint"),
  boneName: document.getElementById("boneName"),
  boneParent: document.getElementById("boneParent"),
  boneInherit: document.getElementById("boneInherit"),
  boneConnect: document.getElementById("boneConnect"),
  bonePoseLen: document.getElementById("bonePoseLen"),
  boneTx: document.getElementById("boneTx"),
  boneTy: document.getElementById("boneTy"),
  boneRot: document.getElementById("boneRot"),
  boneLen: document.getElementById("boneLen"),
  boneScaleX: document.getElementById("boneScaleX"),
  boneScaleY: document.getElementById("boneScaleY"),
  boneShearX: document.getElementById("boneShearX"),
  boneShearY: document.getElementById("boneShearY"),
  boneHeadX: document.getElementById("boneHeadX"),
  boneHeadY: document.getElementById("boneHeadY"),
  boneTipX: document.getElementById("boneTipX"),
  boneTipY: document.getElementById("boneTipY"),
  skinAddBtn: document.getElementById("skinAddBtn"),
  skinDeleteBtn: document.getElementById("skinDeleteBtn"),
  skinSelect: document.getElementById("skinSelect"),
  skinName: document.getElementById("skinName"),
  skinCaptureBtn: document.getElementById("skinCaptureBtn"),
  skinApplyBtn: document.getElementById("skinApplyBtn"),
  weightMode: document.getElementById("weightMode"),
  autoWeightBtn: document.getElementById("autoWeightBtn"),
  resetPoseBtn: document.getElementById("resetPoseBtn"),
  resetVertexBtn: document.getElementById("resetVertexBtn"),
  vertexDeformTools: document.getElementById("vertexDeformTools"),
  vertexProportionalToggle: document.getElementById("vertexProportionalToggle"),
  vertexMirrorToggle: document.getElementById("vertexMirrorToggle"),
  vertexHeatmapToggle: document.getElementById("vertexHeatmapToggle"),
  vertexProportionalRadius: document.getElementById("vertexProportionalRadius"),
  vertexProportionalFalloff: document.getElementById("vertexProportionalFalloff"),
  animTime: document.getElementById("animTime"),
  animDuration: document.getElementById("animDuration"),
  animSelect: document.getElementById("animSelect"),
  animName: document.getElementById("animName"),
  animLoop: document.getElementById("animLoop"),
  animSnap: document.getElementById("animSnap"),
  animFps: document.getElementById("animFps"),
  animTimeStep: document.getElementById("animTimeStep"),
  addAnimBtn: document.getElementById("addAnimBtn"),
  deleteAnimBtn: document.getElementById("deleteAnimBtn"),
  duplicateAnimBtn: document.getElementById("duplicateAnimBtn"),
  trackSelect: document.getElementById("trackSelect"),
  timelineFilter: document.getElementById("timelineFilter"),
  timelineOnlyKeyed: document.getElementById("timelineOnlyKeyed"),
  timelineClearSoloMuteBtn: document.getElementById("timelineClearSoloMuteBtn"),
  keyInterp: document.getElementById("keyInterp"),
  keyInterpApplySelectedBtn: document.getElementById("keyInterpApplySelectedBtn"),
  curveToggleBtn: document.getElementById("curveToggleBtn"),
  keyInfo: document.getElementById("keyInfo"),
  animMixTo: document.getElementById("animMixTo"),
  animMixDur: document.getElementById("animMixDur"),
  animMixBtn: document.getElementById("animMixBtn"),
  animMixInfo: document.getElementById("animMixInfo"),
  onionEnabled: document.getElementById("onionEnabled"),
  onionPrev: document.getElementById("onionPrev"),
  onionNext: document.getElementById("onionNext"),
  onionAlpha: document.getElementById("onionAlpha"),
  exportPreviewWebmBtn: document.getElementById("exportPreviewWebmBtn"),
  exportPreviewGifBtn: document.getElementById("exportPreviewGifBtn"),
  batchExportToggleBtn: document.getElementById("batchExportToggleBtn"),
  batchExportPanel: document.getElementById("batchExportPanel"),
  batchExportFormat: document.getElementById("batchExportFormat"),
  batchExportFps: document.getElementById("batchExportFps"),
  batchExportPrefix: document.getElementById("batchExportPrefix"),
  batchExportRetries: document.getElementById("batchExportRetries"),
  batchExportDelayMs: document.getElementById("batchExportDelayMs"),
  batchExportZipPng: document.getElementById("batchExportZipPng"),
  batchExportAnimList: document.getElementById("batchExportAnimList"),
  batchExportSelectAllBtn: document.getElementById("batchExportSelectAllBtn"),
  batchExportSelectNoneBtn: document.getElementById("batchExportSelectNoneBtn"),
  batchExportRunBtn: document.getElementById("batchExportRunBtn"),
  smEnabled: document.getElementById("smEnabled"),
  smStateSelect: document.getElementById("smStateSelect"),
  smStateAddBtn: document.getElementById("smStateAddBtn"),
  smStateDeleteBtn: document.getElementById("smStateDeleteBtn"),
  smStateName: document.getElementById("smStateName"),
  smStateAnim: document.getElementById("smStateAnim"),
  smTransitionTo: document.getElementById("smTransitionTo"),
  smTransitionDur: document.getElementById("smTransitionDur"),
  smTransitionAddBtn: document.getElementById("smTransitionAddBtn"),
  smTransitionList: document.getElementById("smTransitionList"),
  smTransitionDeleteBtn: document.getElementById("smTransitionDeleteBtn"),
  smTransitionGoBtn: document.getElementById("smTransitionGoBtn"),
  smParamSelect: document.getElementById("smParamSelect"),
  smParamAddBtn: document.getElementById("smParamAddBtn"),
  smParamDeleteBtn: document.getElementById("smParamDeleteBtn"),
  smParamName: document.getElementById("smParamName"),
  smParamType: document.getElementById("smParamType"),
  smParamDefault: document.getElementById("smParamDefault"),
  smParamValue: document.getElementById("smParamValue"),
  smParamSetBtn: document.getElementById("smParamSetBtn"),
  smParamKeyBtn: document.getElementById("smParamKeyBtn"),
  smTransitionAuto: document.getElementById("smTransitionAuto"),
  smCondParam: document.getElementById("smCondParam"),
  smCondOp: document.getElementById("smCondOp"),
  smCondValue: document.getElementById("smCondValue"),
  smCondAddBtn: document.getElementById("smCondAddBtn"),
  smCondList: document.getElementById("smCondList"),
  smCondDeleteBtn: document.getElementById("smCondDeleteBtn"),
  smBridgeExportBtn: document.getElementById("smBridgeExportBtn"),
  smBridgeCodeBtn: document.getElementById("smBridgeCodeBtn"),
  smBridgeParamSelect: document.getElementById("smBridgeParamSelect"),
  smBridgeParamValue: document.getElementById("smBridgeParamValue"),
  smBridgeSetBtn: document.getElementById("smBridgeSetBtn"),
  smBridgeApiInfo: document.getElementById("smBridgeApiInfo"),
  layerTrackSelect: document.getElementById("layerTrackSelect"),
  layerTrackAddBtn: document.getElementById("layerTrackAddBtn"),
  layerTrackDeleteBtn: document.getElementById("layerTrackDeleteBtn"),
  layerTrackEnabled: document.getElementById("layerTrackEnabled"),
  layerTrackAnim: document.getElementById("layerTrackAnim"),
  layerTrackLoop: document.getElementById("layerTrackLoop"),
  layerTrackSpeed: document.getElementById("layerTrackSpeed"),
  layerTrackOffset: document.getElementById("layerTrackOffset"),
  layerTrackAlpha: document.getElementById("layerTrackAlpha"),
  layerTrackMode: document.getElementById("layerTrackMode"),
  layerTrackMaskMode: document.getElementById("layerTrackMaskMode"),
  layerTrackBone: document.getElementById("layerTrackBone"),
  layerTrackBoneAddBtn: document.getElementById("layerTrackBoneAddBtn"),
  layerTrackBoneClearBtn: document.getElementById("layerTrackBoneClearBtn"),
  layerTrackBoneList: document.getElementById("layerTrackBoneList"),
  eventName: document.getElementById("eventName"),
  eventInt: document.getElementById("eventInt"),
  eventFloat: document.getElementById("eventFloat"),
  eventString: document.getElementById("eventString"),
  eventKeyList: document.getElementById("eventKeyList"),
  eventJumpBtn: document.getElementById("eventJumpBtn"),
  eventDeleteSelBtn: document.getElementById("eventDeleteSelBtn"),
  addEventBtn: document.getElementById("addEventBtn"),
  deleteEventBtn: document.getElementById("deleteEventBtn"),
  curveEditorWrap: document.getElementById("curveEditorWrap"),
  curveEditor: document.getElementById("curveEditor"),
  timelineTracks: document.getElementById("timelineTracks"),
  timelineResizer: document.getElementById("timelineResizer"),
  timelineDock: document.getElementById("timelineDock"),
  exportDock: document.getElementById("exportDock"),
  stateDock: document.getElementById("stateDock"),
  layerDock: document.getElementById("layerDock"),
  undoBtn: document.getElementById("undoBtn"),
  redoBtn: document.getElementById("redoBtn"),
  addKeyBtn: document.getElementById("addKeyBtn"),
  autoKeyBtn: document.getElementById("autoKeyBtn"),
  addAttachmentKeyBtn: document.getElementById("addAttachmentKeyBtn"),
  addClipKeyBtn: document.getElementById("addClipKeyBtn"),
  addClipSourceKeyBtn: document.getElementById("addClipSourceKeyBtn"),
  addClipComboKeyBtn: document.getElementById("addClipComboKeyBtn"),
  addClipEndKeyBtn: document.getElementById("addClipEndKeyBtn"),
  addDrawOrderKeyBtn: document.getElementById("addDrawOrderKeyBtn"),
  loopMakeSeamBtn: document.getElementById("loopMakeSeamBtn"),
  loopPingPongBtn: document.getElementById("loopPingPongBtn"),
  drawOrderToggleBtn: document.getElementById("drawOrderToggleBtn"),
  drawOrderEditor: document.getElementById("drawOrderEditor"),
  drawOrderList: document.getElementById("drawOrderList"),
  drawOrderUpBtn: document.getElementById("drawOrderUpBtn"),
  drawOrderDownBtn: document.getElementById("drawOrderDownBtn"),
  drawOrderApplyBtn: document.getElementById("drawOrderApplyBtn"),
  drawOrderApplyKeyBtn: document.getElementById("drawOrderApplyKeyBtn"),
  deleteKeyBtn: document.getElementById("deleteKeyBtn"),
  copyKeyBtn: document.getElementById("copyKeyBtn"),
  pasteKeyBtn: document.getElementById("pasteKeyBtn"),
  playBtn: document.getElementById("playBtn"),
  pauseBtn: document.getElementById("pauseBtn"),
  stopBtn: document.getElementById("stopBtn"),
  diagnosticsRunBtn: document.getElementById("diagnosticsRunBtn"),
  diagnosticsAutoFixBtn: document.getElementById("diagnosticsAutoFixBtn"),
  diagnosticsClearBtn: document.getElementById("diagnosticsClearBtn"),
  diagnosticsExportCheck: document.getElementById("diagnosticsExportCheck"),
  diagnosticsErrorsCount: document.getElementById("diagnosticsErrorsCount"),
  diagnosticsWarningsCount: document.getElementById("diagnosticsWarningsCount"),
  diagnosticsList: document.getElementById("diagnosticsList"),
  commandPaletteWrap: document.getElementById("commandPaletteWrap"),
  commandPaletteBackdrop: document.getElementById("commandPaletteBackdrop"),
  commandPalettePanel: document.getElementById("commandPalettePanel"),
  commandPaletteMode: document.getElementById("commandPaletteMode"),
  commandPaletteInput: document.getElementById("commandPaletteInput"),
  commandPaletteHint: document.getElementById("commandPaletteHint"),
  commandPaletteList: document.getElementById("commandPaletteList"),
  status: document.getElementById("status"),
  boneTreeContextMenu: document.getElementById("boneTreeContextMenu"),
  treeCtxSlotAddBtn: document.getElementById("treeCtxSlotAddBtn"),
  treeCtxSlotDupBtn: document.getElementById("treeCtxSlotDupBtn"),
  treeCtxSlotRenameBtn: document.getElementById("treeCtxSlotRenameBtn"),
  treeCtxSlotDeleteBtn: document.getElementById("treeCtxSlotDeleteBtn"),
  treeCtxSlotLoadImageBtn: document.getElementById("treeCtxSlotLoadImageBtn"),
  boneTree: document.getElementById("boneTree"),
  slotName: document.getElementById("slotName"),
  slotAttachment: document.getElementById("slotAttachment"),
  slotAttachmentName: document.getElementById("slotAttachmentName"),
  slotPlaceholderName: document.getElementById("slotPlaceholderName"),
  slotAttachmentPlaceholderName: document.getElementById("slotAttachmentPlaceholderName"),
  slotAttachmentType: document.getElementById("slotAttachmentType"),
  slotAttachmentLinkedParent: document.getElementById("slotAttachmentLinkedParent"),
  slotAttachmentPointX: document.getElementById("slotAttachmentPointX"),
  slotAttachmentPointY: document.getElementById("slotAttachmentPointY"),
  slotAttachmentPointRot: document.getElementById("slotAttachmentPointRot"),
  slotAttachmentBBoxSource: document.getElementById("slotAttachmentBBoxSource"),
  slotAttachmentSequenceEnabled: document.getElementById("slotAttachmentSequenceEnabled"),
  slotAttachmentSequenceCount: document.getElementById("slotAttachmentSequenceCount"),
  slotAttachmentSequenceStart: document.getElementById("slotAttachmentSequenceStart"),
  slotAttachmentSequenceDigits: document.getElementById("slotAttachmentSequenceDigits"),
  slotAttachmentAddBtn: document.getElementById("slotAttachmentAddBtn"),
  slotAttachmentDeleteBtn: document.getElementById("slotAttachmentDeleteBtn"),
  slotAttachmentRenameBtn: document.getElementById("slotAttachmentRenameBtn"),
  slotAttachmentLoadBtn: document.getElementById("slotAttachmentLoadBtn"),
  slotAttachmentFileInput: document.getElementById("slotAttachmentFileInput"),
  slotClipEnabled: document.getElementById("slotClipEnabled"),
  slotClipSource: document.getElementById("slotClipSource"),
  slotClipEnd: document.getElementById("slotClipEnd"),
  slotClipSetKeyBtn: document.getElementById("slotClipSetKeyBtn"),
  slotClipDelKeyBtn: document.getElementById("slotClipDelKeyBtn"),
  slotClipSourceSetKeyBtn: document.getElementById("slotClipSourceSetKeyBtn"),
  slotClipSourceDelKeyBtn: document.getElementById("slotClipSourceDelKeyBtn"),
  slotClipComboSetKeyBtn: document.getElementById("slotClipComboSetKeyBtn"),
  slotClipEndSetKeyBtn: document.getElementById("slotClipEndSetKeyBtn"),
  slotClipEndDelKeyBtn: document.getElementById("slotClipEndDelKeyBtn"),
  slotBone: document.getElementById("slotBone"),
  slotBindBoneBtn: document.getElementById("slotBindBoneBtn"),
  slotBindWeightedBtn: document.getElementById("slotBindWeightedBtn"),
  slotVisible: document.getElementById("slotVisible"),
  slotAlpha: document.getElementById("slotAlpha"),
  slotColor: document.getElementById("slotColor"),
  slotBlend: document.getElementById("slotBlend"),
  slotDarkEnabled: document.getElementById("slotDarkEnabled"),
  slotDarkColor: document.getElementById("slotDarkColor"),
  slotWeightMode: document.getElementById("slotWeightMode"),
  slotInfluenceBones: document.getElementById("slotInfluenceBones"),
  slotTx: document.getElementById("slotTx"),
  slotTy: document.getElementById("slotTy"),
  slotRot: document.getElementById("slotRot"),
  slotOrderUp: document.getElementById("slotOrderUp"),
  slotOrderDown: document.getElementById("slotOrderDown"),
  slotMeshTools: document.getElementById("slotMeshTools"),
  slotMeshNewMode: document.getElementById("slotMeshNewMode"),
  slotMeshNewBtn: document.getElementById("slotMeshNewBtn"),
  slotMeshCloseBtn: document.getElementById("slotMeshCloseBtn"),
  slotMeshTriangulateBtn: document.getElementById("slotMeshTriangulateBtn"),
  slotMeshGridFillBtn: document.getElementById("slotMeshGridFillBtn"),
  slotMeshGridReplaceContour: document.getElementById("slotMeshGridReplaceContour"),
  slotMeshLinkEdgeBtn: document.getElementById("slotMeshLinkEdgeBtn"),
  slotMeshUnlinkEdgeBtn: document.getElementById("slotMeshUnlinkEdgeBtn"),
  slotMeshApplyBtn: document.getElementById("slotMeshApplyBtn"),
  slotMeshResetBtn: document.getElementById("slotMeshResetBtn"),
  stage: document.getElementById("stage"),
  glCanvas: document.getElementById("glCanvas"),
  overlay: document.getElementById("overlay"),
};

const gl =
  els.glCanvas.getContext("webgl2", { alpha: true, premultipliedAlpha: false }) ||
  els.glCanvas.getContext("webgl", { alpha: true, premultipliedAlpha: false }) ||
  els.glCanvas.getContext("experimental-webgl", { alpha: true, premultipliedAlpha: false });
const overlayCtx = els.overlay.getContext("2d");
const stage2dCtx = !gl ? els.glCanvas.getContext("2d") : null;
const AUTOSAVE_STORAGE_KEY = "mesh_deformer_autosave_v1";
const AUTOSAVE_INTERVAL_MS = 15000;
const AUTOSAVE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

if (!overlayCtx || (!gl && !stage2dCtx)) {
  throw new Error("2D canvas context unavailable.");
}

const hasGL = !!gl;
const isWebGL2 = hasGL && typeof WebGL2RenderingContext !== "undefined" && gl instanceof WebGL2RenderingContext;
const hasVAO = hasGL && typeof gl.createVertexArray === "function";

const state = {
  sourceCanvas: null,
  texture: null,
  imageWidth: 0,
  imageHeight: 0,
  slots: [],
  activeSlot: -1,
  slotViewMode: "single",
  leftToolTab: "setup",
  workspaceMode: "rig",
  uiPage: "rig",
  animSubPanel: "timeline",
  exportPanelOpen: false,
  mesh: null,
  editMode: "skeleton",
  selectedBone: 0,
  selectedBonesForWeight: [],
  selectedIK: -1,
  selectedTransform: -1,
  selectedPath: -1,
  skinSets: [],
  selectedSkinSet: -1,
  ikPickArmed: false,
  ikHoverBone: -1,
  boneMode: "edit",
  weightMode: "hard",
  dragTool: "auto",
  parentPickArmed: false,
  parentHoverBone: -1,
  addBoneArmed: false,
  addBoneDraft: null,
  treeSlotDrag: null,
  treeSlotLastClickIndex: -1,
  treeSlotLastClickTs: 0,
  treeBoneLastClickIndex: -1,
  treeBoneLastClickTs: 0,
  boneTreeOnlyActiveSlot: false,
  boneTreeSlotCollapse: Object.create(null),
  boneTreeChildCollapse: Object.create(null),
  boneTreeInlineRename: { kind: "", index: -1 },
  boneTreeMenuOpen: false,
  rightPropsFocus: "slot",
  anim: {
    duration: 5,
    time: 0,
    playing: false,
    lastTs: 0,
    animations: [],
    currentAnimId: null,
    selectedTrack: "",
    selectedKey: null,
    selectedKeys: [],
    keyClipboard: null,
    timelineDrag: null,
    timelineMarqueeEl: null,
    drawOrderEditorOpen: false,
    dirtyTracks: [],
    trackExpanded: {},
    groupMute: {},
    groupSolo: {},
    onlyKeyed: false,
    filterText: "",
    loop: true,
    snap: false,
    onionSkin: {
      enabled: false,
      prevFrames: 2,
      nextFrames: 2,
      alpha: 0.22,
    },
    autoKey: false,
    autoKeyPending: false,
    fps: 30,
    timeStep: 0.01,
    mix: {
      active: false,
      fromAnimId: null,
      toAnimId: null,
      duration: 0.2,
      elapsed: 0,
      fromTime: 0,
      toTime: 0,
    },
    curveOpen: false,
    curveDrag: null,
    batchExportOpen: false,
    batchExport: {
      format: "webm",
      fps: 15,
      prefix: "batch",
      retries: 1,
      delayMs: 120,
      zipPng: true,
    },
    resizing: null,
    layerTracks: [],
    selectedLayerTrackId: "",
    stateMachine: {
      enabled: true,
      states: [],
      parameters: [],
      currentStateId: "",
      selectedParamId: "",
      selectedTransitionId: "",
      selectedConditionId: "",
      pendingStateId: "",
      pendingDuration: 0.2,
    },
  },
  history: {
    undo: [],
    redo: [],
    lastSig: "",
    lastCaptureTs: 0,
    suspend: false,
  },
  autosave: {
    ready: false,
    lastSig: "",
    timerId: 0,
    lastErrorAt: 0,
  },
  diagnostics: {
    issues: [],
    lastRunAt: 0,
  },
  commandPalette: {
    open: false,
    hotkeysOnly: false,
    query: "",
    selectedIndex: 0,
    filtered: [],
    lastFocus: null,
  },
  view: { scale: 1, cx: 0, cy: 0, fitScale: 1, initialized: false, lastW: 0, lastH: 0 },
  drag: null,
  slotMesh: {
    activePoint: -1,
    activeSet: "contour",
    edgeSelection: [],
    edgeSelectionSet: "contour",
    newContourMode: "new_slot",
    gridReplaceContour: false,
  },
  pathEdit: {
    drawArmed: false,
    activePoint: -1,
    activeHandle: "",
  },
  vertexDeform: {
    proportional: true,
    mirror: false,
    heatmap: false,
    radius: 80,
    falloff: "smooth",
    cursorX: 0,
    cursorY: 0,
    hasCursor: false,
    selectionByKey: {},
    pinnedByKey: {},
  },
  overlayScene: {
    canvas: null,
    ctx: null,
    enabled: false,
  },
  export: {
    spineCompat: "4.2",
  },
};

const math = {
  degToRad: (d) => (d * Math.PI) / 180,
  radToDeg: (r) => (r * 180) / Math.PI,
  clamp: (v, lo, hi) => Math.max(lo, Math.min(hi, v)),
};

function setStatus(text) {
  els.status.textContent = text;
}

function triggerButtonAction(btn) {
  if (!btn || btn.disabled) return;
  btn.click();
}

function setSelectValueAndTrigger(selectEl, value) {
  if (!selectEl) return;
  selectEl.value = String(value);
  selectEl.dispatchEvent(new Event("change", { bubbles: true }));
}

function buildCommandPaletteItems() {
  return [
    { id: "file.new", label: "File: New Project", group: "File", hotkey: "", action: () => triggerButtonAction(els.fileNewBtn) },
    { id: "file.open", label: "File: Import Image/PSD", group: "File", hotkey: "", action: () => triggerButtonAction(els.fileOpenBtn) },
    { id: "file.save", label: "File: Save Project JSON", group: "File", hotkey: "", action: () => triggerButtonAction(els.fileSaveBtn) },
    { id: "file.load", label: "File: Load Project JSON", group: "File", hotkey: "", action: () => triggerButtonAction(els.fileLoadBtn) },
    { id: "file.export", label: "File: Export Spine Bundle", group: "File", hotkey: "", action: () => triggerButtonAction(els.fileExportSpineBtn) },
    { id: "edit.undo", label: "Edit: Undo", group: "Edit", hotkey: "Ctrl/Cmd+Z", action: async () => undoAction() },
    { id: "edit.redo", label: "Edit: Redo", group: "Edit", hotkey: "Ctrl/Cmd+Y", action: async () => redoAction() },
    { id: "mode.skeleton", label: "Mode: Skeleton", group: "Mode", hotkey: "", action: () => setSelectValueAndTrigger(els.editMode, "skeleton") },
    { id: "mode.vertex", label: "Mode: Vertex", group: "Mode", hotkey: "", action: () => setSelectValueAndTrigger(els.editMode, "vertex") },
    { id: "mode.slotmesh", label: "Mode: Slot Mesh", group: "Mode", hotkey: "", action: () => setSelectValueAndTrigger(els.editMode, "slotmesh") },
    { id: "mode.rig", label: "Bone Mode: Edit Rig", group: "Mode", hotkey: "", action: () => setSelectValueAndTrigger(els.boneMode, "edit") },
    { id: "mode.pose", label: "Bone Mode: Pose Animate", group: "Mode", hotkey: "", action: () => setSelectValueAndTrigger(els.boneMode, "pose") },
    { id: "view.fit", label: "View: Fit (100%)", group: "View", hotkey: "0", action: () => resetViewToFit() },
    {
      id: "view.zoom.in",
      label: "View: Zoom In",
      group: "View",
      hotkey: "+",
      action: () => {
        const sx = Math.max(1, Number(els.overlay.width) || 1) * 0.5;
        const sy = Math.max(1, Number(els.overlay.height) || 1) * 0.5;
        zoomViewBy(1.12, sx, sy);
      },
    },
    {
      id: "view.zoom.out",
      label: "View: Zoom Out",
      group: "View",
      hotkey: "-",
      action: () => {
        const sx = Math.max(1, Number(els.overlay.width) || 1) * 0.5;
        const sy = Math.max(1, Number(els.overlay.height) || 1) * 0.5;
        zoomViewBy(1 / 1.12, sx, sy);
      },
    },
    { id: "play.play", label: "Playback: Play", group: "Timeline", hotkey: "Space", action: () => triggerButtonAction(els.playBtn) },
    { id: "play.pause", label: "Playback: Pause", group: "Timeline", hotkey: "", action: () => triggerButtonAction(els.pauseBtn) },
    { id: "play.stop", label: "Playback: Stop", group: "Timeline", hotkey: "", action: () => triggerButtonAction(els.stopBtn) },
    { id: "key.add", label: "Key: Add/Update Key", group: "Timeline", hotkey: "I", action: () => triggerButtonAction(els.addKeyBtn) },
    { id: "key.delete", label: "Key: Delete Selected", group: "Timeline", hotkey: "K", action: () => triggerButtonAction(els.deleteKeyBtn) },
    { id: "key.copy", label: "Key: Copy", group: "Timeline", hotkey: "", action: () => triggerButtonAction(els.copyKeyBtn) },
    { id: "key.paste", label: "Key: Paste", group: "Timeline", hotkey: "", action: () => triggerButtonAction(els.pasteKeyBtn) },
    {
      id: "onion.toggle",
      label: `Onion Skin: ${ensureOnionSkinSettings().enabled ? "Disable" : "Enable"}`,
      group: "Timeline",
      hotkey: "",
      action: () => {
        if (!els.onionEnabled) return;
        els.onionEnabled.checked = !els.onionEnabled.checked;
        els.onionEnabled.dispatchEvent(new Event("change", { bubbles: true }));
      },
    },
    { id: "batch.toggle", label: "Batch Export: Toggle Panel", group: "Timeline", hotkey: "", action: () => triggerButtonAction(els.batchExportToggleBtn) },
    { id: "diag.run", label: "Diagnostics: Run", group: "Diagnostics", hotkey: "", action: () => triggerButtonAction(els.diagnosticsRunBtn) },
    { id: "diag.fix", label: "Diagnostics: Auto Fix (Safe)", group: "Diagnostics", hotkey: "", action: () => triggerButtonAction(els.diagnosticsAutoFixBtn) },
    { id: "diag.clear", label: "Diagnostics: Clear", group: "Diagnostics", hotkey: "", action: () => triggerButtonAction(els.diagnosticsClearBtn) },
    { id: "help.hotkeys", label: "Help: Hotkeys Only View", group: "Help", hotkey: "?", action: () => openCommandPalette(true) },
  ];
}

function getFilteredCommandPaletteItems() {
  const cfg = state.commandPalette || {};
  const q = String(cfg.query || "").trim().toLowerCase();
  const hotkeysOnly = !!cfg.hotkeysOnly;
  const items = buildCommandPaletteItems().map((item) => ({
    ...item,
    _search: `${item.label} ${item.group} ${item.hotkey || ""} ${item.id}`.toLowerCase(),
  }));
  return items.filter((item) => {
    if (hotkeysOnly && !item.hotkey) return false;
    if (!q) return true;
    return item._search.includes(q);
  });
}

function ensureCommandPaletteSelectionVisible() {
  if (!els.commandPaletteList) return;
  const i = state.commandPalette.selectedIndex | 0;
  const row = els.commandPaletteList.querySelector(`.command-item[data-cp-index="${i}"]`);
  if (row && typeof row.scrollIntoView === "function") row.scrollIntoView({ block: "nearest" });
}

function renderCommandPalette() {
  if (!els.commandPaletteList) return;
  const items = getFilteredCommandPaletteItems();
  state.commandPalette.filtered = items;
  if (!Number.isFinite(state.commandPalette.selectedIndex)) state.commandPalette.selectedIndex = 0;
  if (items.length <= 0) state.commandPalette.selectedIndex = 0;
  else state.commandPalette.selectedIndex = math.clamp(state.commandPalette.selectedIndex | 0, 0, items.length - 1);
  if (els.commandPaletteMode) els.commandPaletteMode.textContent = state.commandPalette.hotkeysOnly ? "Hotkeys Only" : "All Commands";
  if (els.commandPaletteHint) {
    els.commandPaletteHint.textContent = state.commandPalette.hotkeysOnly
      ? "Showing commands with hotkeys. Enter run, Esc close."
      : "Enter run, Esc close, ? hotkeys only.";
  }
  els.commandPaletteList.innerHTML = "";
  if (items.length <= 0) {
    const empty = document.createElement("div");
    empty.className = "muted";
    empty.style.padding = "10px";
    empty.textContent = "No commands match.";
    els.commandPaletteList.appendChild(empty);
    return;
  }
  const frag = document.createDocumentFragment();
  for (let i = 0; i < items.length; i += 1) {
    const item = items[i];
    const row = document.createElement("button");
    row.type = "button";
    row.className = `command-item${i === state.commandPalette.selectedIndex ? " active" : ""}`;
    row.dataset.cpIndex = String(i);
    const left = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = item.label;
    left.appendChild(title);
    const sub = document.createElement("small");
    sub.textContent = item.group;
    left.appendChild(sub);
    row.appendChild(left);
    const hot = document.createElement("kbd");
    hot.textContent = item.hotkey || "-";
    row.appendChild(hot);
    row.addEventListener("mouseenter", () => {
      state.commandPalette.selectedIndex = i;
      renderCommandPalette();
    });
    row.addEventListener("click", async () => {
      state.commandPalette.selectedIndex = i;
      await runCommandPaletteSelected();
    });
    frag.appendChild(row);
  }
  els.commandPaletteList.appendChild(frag);
  ensureCommandPaletteSelectionVisible();
}

function openCommandPalette(hotkeysOnly = false) {
  if (!els.commandPaletteWrap) return;
  if (!state.commandPalette.open) {
    state.commandPalette.lastFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  }
  state.commandPalette.open = true;
  state.commandPalette.hotkeysOnly = !!hotkeysOnly;
  state.commandPalette.query = "";
  state.commandPalette.selectedIndex = 0;
  els.commandPaletteWrap.classList.remove("collapsed");
  els.commandPaletteWrap.setAttribute("aria-hidden", "false");
  if (els.commandPaletteInput) els.commandPaletteInput.value = "";
  renderCommandPalette();
  if (els.commandPaletteInput && typeof els.commandPaletteInput.focus === "function") els.commandPaletteInput.focus();
}

function closeCommandPalette() {
  if (!state.commandPalette.open || !els.commandPaletteWrap) return;
  state.commandPalette.open = false;
  state.commandPalette.hotkeysOnly = false;
  state.commandPalette.query = "";
  state.commandPalette.filtered = [];
  els.commandPaletteWrap.classList.add("collapsed");
  els.commandPaletteWrap.setAttribute("aria-hidden", "true");
  const prevFocus = state.commandPalette.lastFocus;
  state.commandPalette.lastFocus = null;
  if (prevFocus && typeof prevFocus.focus === "function") prevFocus.focus();
}

async function runCommandPaletteSelected() {
  const items = Array.isArray(state.commandPalette.filtered) ? state.commandPalette.filtered : [];
  const i = state.commandPalette.selectedIndex | 0;
  if (i < 0 || i >= items.length) return;
  const item = items[i];
  closeCommandPalette();
  try {
    const ret = item && typeof item.action === "function" ? item.action() : null;
    if (ret && typeof ret.then === "function") await ret;
    if (item && item.label) setStatus(`Command: ${item.label}`);
  } catch (err) {
    console.warn(err);
    setStatus("Command failed. Check console.");
  }
}

function moveCommandPaletteSelection(dir) {
  const items = Array.isArray(state.commandPalette.filtered) ? state.commandPalette.filtered : [];
  if (items.length <= 0) return;
  const base = state.commandPalette.selectedIndex | 0;
  const next = math.clamp(base + dir, 0, items.length - 1);
  state.commandPalette.selectedIndex = next;
  renderCommandPalette();
}

function sanitizeVertexFalloff(v) {
  const s = String(v || "").toLowerCase();
  return s === "linear" || s === "sharp" ? s : "smooth";
}

function getVertexFalloffWeight(normDist, mode = state.vertexDeform.falloff) {
  const t = math.clamp(Number(normDist) || 0, 0, 1);
  const k = sanitizeVertexFalloff(mode);
  if (k === "linear") return 1 - t;
  if (k === "sharp") return (1 - t) * (1 - t);
  // Smoothstep-like falloff (Blender proportional-like smooth response).
  return 1 - (3 * t * t - 2 * t * t * t);
}

function refreshVertexDeformUI() {
  if (els.vertexProportionalToggle) els.vertexProportionalToggle.checked = !!state.vertexDeform.proportional;
  if (els.vertexMirrorToggle) els.vertexMirrorToggle.checked = !!state.vertexDeform.mirror;
  if (els.vertexHeatmapToggle) els.vertexHeatmapToggle.checked = !!state.vertexDeform.heatmap;
  if (els.vertexProportionalRadius) els.vertexProportionalRadius.value = String(Math.round(state.vertexDeform.radius));
  if (els.vertexProportionalFalloff) els.vertexProportionalFalloff.value = sanitizeVertexFalloff(state.vertexDeform.falloff);
  if (els.vertexDeformTools) {
    const show = state.editMode === "vertex" && (state.uiPage === "rig" || state.uiPage === "anim");
    els.vertexDeformTools.style.display = show ? "" : "none";
  }
}

function gatherVertexDragInfluences(anchorIndex, mx, my) {
  const m = state.mesh;
  if (!m) return [];
  const idx = Number(anchorIndex);
  if (!Number.isFinite(idx) || idx < 0) return [];
  const proportional = !!state.vertexDeform.proportional;
  const radius = Math.max(4, Number(state.vertexDeform.radius) || 80);
  const r2 = radius * radius;
  if (!proportional) return [{ index: idx, weight: 1 }];

  let screen = null;
  if (state.slots.length > 0) {
    const slot = getActiveSlot();
    if (!slot) return [{ index: idx, weight: 1 }];
    const poseWorld = getSolvedPoseWorld(m);
    const geom = buildSlotGeometry(slot, poseWorld);
    screen = geom.screen || (slot.meshData && slot.meshData.deformedScreen) || null;
  } else {
    screen = m.deformedScreen || null;
  }
  if (!screen || screen.length < 2) return [{ index: idx, weight: 1 }];

  const out = [];
  for (let i = 0; i < screen.length / 2; i += 1) {
    const dx = screen[i * 2] - mx;
    const dy = screen[i * 2 + 1] - my;
    const d2 = dx * dx + dy * dy;
    if (d2 > r2) continue;
    const w = getVertexFalloffWeight(Math.sqrt(d2) / radius);
    if (w <= 1e-4) continue;
    out.push({ index: i, weight: w });
  }
  if (!out.some((it) => it.index === idx)) out.push({ index: idx, weight: 1 });
  return out;
}

function getActiveVertexSelectionKey() {
  if (state.slots.length > 0 && Number.isFinite(state.activeSlot) && state.activeSlot >= 0) {
    return `slot:${Number(state.activeSlot)}`;
  }
  return "mesh";
}

function getActiveVertexContext(m = state.mesh) {
  if (!m) return { screen: null, indices: null, vCount: 0 };
  if (state.slots.length > 0) {
    const slot = getActiveSlot();
    if (!slot) return { screen: m.deformedScreen || null, indices: m.indices || null, vCount: (m.deformedScreen || []).length / 2 };
    ensureSlotMeshData(slot, m);
    const poseWorld = getSolvedPoseWorld(m);
    const geom = buildSlotGeometry(slot, poseWorld);
    const screen = geom.screen || (slot.meshData && slot.meshData.deformedScreen) || m.deformedScreen || null;
    const indices = (slot.meshData && slot.meshData.indices) || m.indices || null;
    return { screen, indices, vCount: screen ? Math.floor(screen.length / 2) : 0 };
  }
  const screen = m.deformedScreen || null;
  return { screen, indices: m.indices || null, vCount: screen ? Math.floor(screen.length / 2) : 0 };
}

function getActiveVertexBasePositions(m = state.mesh) {
  if (!m) return null;
  if (state.slots.length > 0) {
    const slot = getActiveSlot();
    if (!slot || !slot.meshData || !slot.meshData.positions) return null;
    return slot.meshData.positions;
  }
  return m.positions || null;
}

function getMirrorAxisX() {
  return (Number(state.imageWidth) || 0) * 0.5;
}

function buildMirrorIndexMap(vCount = null) {
  const positions = getActiveVertexBasePositions(state.mesh);
  if (!positions) return new Map();
  const count = Number.isFinite(vCount) ? Number(vCount) : Math.floor(positions.length / 2);
  if (count <= 0) return new Map();
  const axisX = getMirrorAxisX();
  const map = new Map();
  for (let i = 0; i < count; i += 1) {
    const x = Number(positions[i * 2]) || 0;
    const y = Number(positions[i * 2 + 1]) || 0;
    const tx = axisX * 2 - x;
    let best = -1;
    let bestD2 = Infinity;
    for (let j = 0; j < count; j += 1) {
      const jx = Number(positions[j * 2]) || 0;
      const jy = Number(positions[j * 2 + 1]) || 0;
      const dx = jx - tx;
      const dy = jy - y;
      const d2 = dx * dx + dy * dy;
      if (d2 < bestD2) {
        bestD2 = d2;
        best = j;
      }
    }
    if (best >= 0) map.set(i, best);
  }
  return map;
}

function getHeatmapColor(t) {
  const u = math.clamp(Number(t) || 0, 0, 1);
  const r = Math.round(40 + 215 * u);
  const g = Math.round(190 - 150 * u);
  const b = Math.round(255 - 235 * u);
  return `rgba(${r}, ${g}, ${b}, ${0.2 + 0.65 * u})`;
}

function sanitizeVertexIndexArray(list, vCount) {
  const out = [];
  const max = Math.max(0, Number(vCount) || 0);
  for (const raw of Array.isArray(list) ? list : []) {
    const i = Number(raw);
    if (!Number.isFinite(i) || i < 0 || i >= max) continue;
    if (!out.includes(i)) out.push(i);
  }
  out.sort((a, b) => a - b);
  return out;
}

function getActiveVertexSelection(vCount = null) {
  const key = getActiveVertexSelectionKey();
  const max = Number.isFinite(vCount) ? Number(vCount) : getActiveVertexContext().vCount;
  const curr = sanitizeVertexIndexArray(state.vertexDeform.selectionByKey[key], max);
  state.vertexDeform.selectionByKey[key] = curr;
  return curr;
}

function setActiveVertexSelection(indices, vCount = null) {
  const key = getActiveVertexSelectionKey();
  const max = Number.isFinite(vCount) ? Number(vCount) : getActiveVertexContext().vCount;
  state.vertexDeform.selectionByKey[key] = sanitizeVertexIndexArray(indices, max);
}

function clearActiveVertexSelection() {
  const key = getActiveVertexSelectionKey();
  state.vertexDeform.selectionByKey[key] = [];
}

function toggleVertexSelectionIndex(index, vCount = null) {
  const curr = getActiveVertexSelection(vCount);
  if (curr.includes(index)) {
    setActiveVertexSelection(curr.filter((v) => v !== index), vCount);
  } else {
    curr.push(index);
    setActiveVertexSelection(curr, vCount);
  }
  return getActiveVertexSelection(vCount);
}

function getActivePinnedVertexSet(vCount = null) {
  const key = getActiveVertexSelectionKey();
  const max = Number.isFinite(vCount) ? Number(vCount) : getActiveVertexContext().vCount;
  const curr = sanitizeVertexIndexArray(state.vertexDeform.pinnedByKey[key], max);
  state.vertexDeform.pinnedByKey[key] = curr;
  return new Set(curr);
}

function setActivePinnedVertices(indices, vCount = null) {
  const key = getActiveVertexSelectionKey();
  const max = Number.isFinite(vCount) ? Number(vCount) : getActiveVertexContext().vCount;
  state.vertexDeform.pinnedByKey[key] = sanitizeVertexIndexArray(indices, max);
}

function selectVerticesByRect(x0, y0, x1, y1, append = false) {
  const m = state.mesh;
  if (!m) return 0;
  const ctx = getActiveVertexContext(m);
  const screen = ctx.screen;
  const vCount = ctx.vCount;
  if (!screen || vCount <= 0) {
    if (!append) clearActiveVertexSelection();
    return 0;
  }
  const left = Math.min(x0, x1);
  const right = Math.max(x0, x1);
  const top = Math.min(y0, y1);
  const bottom = Math.max(y0, y1);
  const picked = [];
  for (let i = 0; i < vCount; i += 1) {
    const sx = screen[i * 2];
    const sy = screen[i * 2 + 1];
    if (sx >= left && sx <= right && sy >= top && sy <= bottom) picked.push(i);
  }
  if (picked.length === 0) {
    if (!append) clearActiveVertexSelection();
    return 0;
  }
  if (append) {
    setActiveVertexSelection([...getActiveVertexSelection(vCount), ...picked], vCount);
  } else {
    setActiveVertexSelection(picked, vCount);
  }
  return getActiveVertexSelection(vCount).length;
}

function toggleSelectAllVertices() {
  const ctx = getActiveVertexContext();
  const vCount = ctx.vCount;
  if (vCount <= 0) return;
  const curr = getActiveVertexSelection(vCount);
  if (curr.length === vCount) {
    clearActiveVertexSelection();
    setStatus("Vertex selection cleared.");
    return;
  }
  setActiveVertexSelection(Array.from({ length: vCount }, (_, i) => i), vCount);
  setStatus(`All vertices selected (${vCount}).`);
}

function relaxSelectedVertices(strength = 0.45) {
  const m = state.mesh;
  if (!m) return 0;
  const ctx = getActiveVertexContext(m);
  const indices = Array.isArray(ctx.indices) || ctx.indices instanceof Uint16Array ? ctx.indices : null;
  const vCount = ctx.vCount;
  if (!indices || vCount <= 0) return 0;
  const selected = getActiveVertexSelection(vCount);
  if (selected.length === 0) return 0;
  const pinned = getActivePinnedVertexSet(vCount);
  const offsets = getActiveOffsets(m);
  const neighbors = Array.from({ length: vCount }, () => new Set());
  for (let t = 0; t + 2 < indices.length; t += 3) {
    const a = Number(indices[t]);
    const b = Number(indices[t + 1]);
    const c = Number(indices[t + 2]);
    if (a < 0 || b < 0 || c < 0 || a >= vCount || b >= vCount || c >= vCount) continue;
    neighbors[a].add(b).add(c);
    neighbors[b].add(a).add(c);
    neighbors[c].add(a).add(b);
  }
  let moved = 0;
  const alpha = math.clamp(Number(strength) || 0, 0, 1);
  const next = new Float32Array(offsets);
  for (const i of selected) {
    if (pinned.has(i)) continue;
    const ring = neighbors[i];
    if (!ring || ring.size === 0) continue;
    let sx = 0;
    let sy = 0;
    let c = 0;
    for (const n of ring) {
      sx += offsets[n * 2] || 0;
      sy += offsets[n * 2 + 1] || 0;
      c += 1;
    }
    if (c <= 0) continue;
    const ax = sx / c;
    const ay = sy / c;
    const ox = offsets[i * 2] || 0;
    const oy = offsets[i * 2 + 1] || 0;
    next[i * 2] = ox + (ax - ox) * alpha;
    next[i * 2 + 1] = oy + (ay - oy) * alpha;
    moved += 1;
  }
  if (moved > 0) {
    offsets.set(next);
    markDirtyVertexTrack(state.activeSlot);
  }
  return moved;
}

function createShader(type, src) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) || "Shader compilation failed");
  }
  return shader;
}

function createProgram(vsSrc, fsSrc) {
  const program = gl.createProgram();
  const vs = createShader(gl.VERTEX_SHADER, vsSrc);
  const fs = createShader(gl.FRAGMENT_SHADER, fsSrc);
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program) || "Program link failed");
  }
  return program;
}

let program = null;
let loc = null;
let vbo = null;
let ibo = null;
let vao = null;

if (hasGL) {
  program = createProgram(
    isWebGL2
      ? `#version 300 es
  in vec2 aPos;
  in vec2 aUv;
  uniform vec2 uResolution;
  out vec2 vUv;
  void main() {
    vec2 z = aPos / uResolution;
    vec2 clip = z * 2.0 - 1.0;
    gl_Position = vec4(clip * vec2(1.0, -1.0), 0.0, 1.0);
    vUv = aUv;
  }`
      : `
  attribute vec2 aPos;
  attribute vec2 aUv;
  uniform vec2 uResolution;
  varying vec2 vUv;
  void main() {
    vec2 z = aPos / uResolution;
    vec2 clip = z * 2.0 - 1.0;
    gl_Position = vec4(clip * vec2(1.0, -1.0), 0.0, 1.0);
    vUv = aUv;
  }`,
    isWebGL2
      ? `#version 300 es
  precision highp float;
  in vec2 vUv;
  uniform sampler2D uTex;
  uniform float uAlpha;
  uniform vec3 uTint;
  out vec4 outColor;
  void main() {
    vec4 c = texture(uTex, vUv);
    outColor = vec4(c.rgb * uTint, c.a * uAlpha);
  }`
      : `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uTex;
  uniform float uAlpha;
  uniform vec3 uTint;
  void main() {
    vec4 c = texture2D(uTex, vUv);
    gl_FragColor = vec4(c.rgb * uTint, c.a * uAlpha);
  }`
  );

  gl.useProgram(program);

  loc = {
    aPos: gl.getAttribLocation(program, "aPos"),
    aUv: gl.getAttribLocation(program, "aUv"),
    uResolution: gl.getUniformLocation(program, "uResolution"),
    uTex: gl.getUniformLocation(program, "uTex"),
    uAlpha: gl.getUniformLocation(program, "uAlpha"),
    uTint: gl.getUniformLocation(program, "uTint"),
  };

  vbo = gl.createBuffer();
  ibo = gl.createBuffer();
  vao = hasVAO ? gl.createVertexArray() : null;
}

function setupVertexLayout() {
  if (!hasGL) return;
  if (hasVAO) {
    gl.bindVertexArray(vao);
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.enableVertexAttribArray(loc.aPos);
  gl.vertexAttribPointer(loc.aPos, 2, gl.FLOAT, false, 16, 0);
  gl.enableVertexAttribArray(loc.aUv);
  gl.vertexAttribPointer(loc.aUv, 2, gl.FLOAT, false, 16, 8);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
}

if (hasGL) {
  setupVertexLayout();
  if (hasVAO) {
    gl.bindVertexArray(null);
  }
  gl.uniform1i(loc.uTex, 0);
  gl.uniform1f(loc.uAlpha, 1);
  if (loc.uTint) gl.uniform3f(loc.uTint, 1, 1, 1);
}

function bindGeometry() {
  if (!hasGL) return;
  if (hasVAO) {
    gl.bindVertexArray(vao);
  } else {
    setupVertexLayout();
  }
}

function createIdentity() {
  return [1, 0, 0, 1, 0, 0];
}

function matFromTR(tx, ty, r) {
  const c = Math.cos(r);
  const s = Math.sin(r);
  return [c, -s, s, c, tx, ty];
}

function normalizeBoneChannels(b) {
  if (!b) return b;
  if (!Number.isFinite(b.sx)) b.sx = 1;
  if (!Number.isFinite(b.sy)) b.sy = 1;
  if (!Number.isFinite(b.shx)) b.shx = 0;
  if (!Number.isFinite(b.shy)) b.shy = 0;
  b.inherit = normalizeBoneInheritValue(b.inherit);
  return b;
}

const BONE_INHERIT_MODES = new Set(["normal", "onlyTranslation", "noRotationOrReflection", "noScale", "noScaleOrReflection"]);

function normalizeBoneInheritValue(v) {
  const s = String(v || "normal");
  return BONE_INHERIT_MODES.has(s) ? s : "normal";
}

function matFromBone(b) {
  const tx = Number(b.tx) || 0;
  const ty = Number(b.ty) || 0;
  const rot = Number(b.rot) || 0;
  const sx = Number(b.sx) || 0;
  const sy = Number(b.sy) || 0;
  const shx = Number(b.shx) || 0;
  const shy = Number(b.shy) || 0;
  const rx = rot + shx;
  const ry = rot + Math.PI * 0.5 + shy;
  return [Math.cos(rx) * sx, Math.cos(ry) * sy, Math.sin(rx) * sx, Math.sin(ry) * sy, tx, ty];
}

function mul(a, b) {
  return [
    a[0] * b[0] + a[1] * b[2],
    a[0] * b[1] + a[1] * b[3],
    a[2] * b[0] + a[3] * b[2],
    a[2] * b[1] + a[3] * b[3],
    a[0] * b[4] + a[1] * b[5] + a[4],
    a[2] * b[4] + a[3] * b[5] + a[5],
  ];
}

function invert(m) {
  const det = m[0] * m[3] - m[1] * m[2];
  if (Math.abs(det) < 1e-8) return createIdentity();
  const inv = 1 / det;
  const a = m[3] * inv;
  const b = -m[1] * inv;
  const c = -m[2] * inv;
  const d = m[0] * inv;
  const tx = -(a * m[4] + b * m[5]);
  const ty = -(c * m[4] + d * m[5]);
  return [a, b, c, d, tx, ty];
}

function transformPoint(m, x, y) {
  return {
    x: m[0] * x + m[1] * y + m[4],
    y: m[2] * x + m[3] * y + m[5],
  };
}

function matrixAngle(m) {
  return Math.atan2(m[2], m[0]);
}

function createDefaultBones(w, h) {
  const len = Math.max(24, Math.round(w * 0.22));
  return [
    { name: "root", parent: -1, inherit: "normal", tx: w * 0.2, ty: h * 0.55, rot: 0, length: len, sx: 1, sy: 1, shx: 0, shy: 0, connected: true, poseLenEditable: false },
    { name: "bone_1", parent: 0, inherit: "normal", tx: len, ty: 0, rot: 0, length: len, sx: 1, sy: 1, shx: 0, shy: 0, connected: true, poseLenEditable: false },
    { name: "bone_2", parent: 1, inherit: "normal", tx: len, ty: 0, rot: 0, length: len, sx: 1, sy: 1, shx: 0, shy: 0, connected: true, poseLenEditable: false },
  ];
}

function computeWorld(bones) {
  const world = bones.map(() => createIdentity());
  for (let i = 0; i < bones.length; i += 1) {
    const b = normalizeBoneChannels(bones[i]);
    const local = matFromBone(b);
    if (b.parent >= 0 && b.parent < bones.length) {
      const parentWorld = world[b.parent];
      const parentForInherit = getParentMatrixForInherit(parentWorld, b.inherit);
      world[i] = mul(parentForInherit, local);
    } else {
      world[i] = local;
    }
  }
  return world;
}

function getParentMatrixForInherit(parentWorld, inheritMode) {
  const mode = normalizeBoneInheritValue(inheritMode);
  if (!parentWorld || mode === "normal") return parentWorld || createIdentity();
  const a = Number(parentWorld[0]) || 0;
  const b = Number(parentWorld[1]) || 0;
  const c = Number(parentWorld[2]) || 0;
  const d = Number(parentWorld[3]) || 0;
  const tx = Number(parentWorld[4]) || 0;
  const ty = Number(parentWorld[5]) || 0;

  if (mode === "onlyTranslation") return [1, 0, 0, 1, tx, ty];

  const lenX = Math.hypot(a, c);
  const lenY = Math.hypot(b, d);

  if (mode === "noRotationOrReflection") {
    const sx = lenX > 1e-8 ? lenX : 1;
    const sy = lenY > 1e-8 ? lenY : 1;
    return [sx, 0, 0, sy, tx, ty];
  }

  if (mode === "noScale" || mode === "noScaleOrReflection") {
    const ux = lenX > 1e-8 ? a / lenX : 1;
    const uy = lenX > 1e-8 ? c / lenX : 0;
    const det = a * d - b * c;
    const reflect = mode === "noScale" && det < 0 ? -1 : 1;
    const vx = -uy * reflect;
    const vy = ux * reflect;
    return [ux, vx, uy, vy, tx, ty];
  }

  return parentWorld;
}

function cloneBones(bones) {
  return bones.map((b) => ({ ...b }));
}

function enforceConnectedHeads(bones) {
  for (let i = 0; i < bones.length; i += 1) {
    const b = bones[i];
    if (!b) continue;
    normalizeBoneChannels(b);
    if (typeof b.poseLenEditable !== "boolean") {
      b.poseLenEditable = false;
    }
    if (b.parent >= 0 && typeof b.connected !== "boolean") {
      b.connected = true;
    }
    if (b.parent < 0 || !b.connected) continue;
    const parent = bones[b.parent];
    if (!parent) continue;
    b.tx = parent.length;
    b.ty = 0;
  }
}

function getRigBones(m) {
  return m.rigBones;
}

function getPoseBones(m) {
  return m.poseBones;
}

function getActiveBones(m) {
  return state.boneMode === "pose" ? getPoseBones(m) : getRigBones(m);
}

function syncPoseFromRig(m) {
  m.poseBones = cloneBones(m.rigBones);
  enforceConnectedHeads(m.poseBones);
}

function getVertexCount(m) {
  return m.positions.length / 2;
}

function allocWeights(vCount, boneCount) {
  return new Float32Array(vCount * boneCount);
}

function pointToSegmentDistanceSquared(px, py, ax, ay, bx, by) {
  const vx = bx - ax;
  const vy = by - ay;
  const wx = px - ax;
  const wy = py - ay;
  const vv = vx * vx + vy * vy;
  const t = vv > 1e-8 ? math.clamp((wx * vx + wy * vy) / vv, 0, 1) : 0;
  const cx = ax + vx * t;
  const cy = ay + vy * t;
  const dx = px - cx;
  const dy = py - cy;
  return dx * dx + dy * dy;
}

function getBoneWorldEndpointsFromBones(bones, i, world = null) {
  const w = world || computeWorld(bones);
  const b = bones[i];
  const head = transformPoint(w[i], 0, 0);
  const tip = transformPoint(w[i], b.length, 0);
  return { head, tip };
}

function setBoneFromWorldEndpoints(bones, boneIndex, head, tip) {
  const b = bones[boneIndex];
  const world = computeWorld(bones);
  const parentWorld = b.parent >= 0 ? world[b.parent] : createIdentity();
  const invParent = invert(parentWorld);

  const localHead = transformPoint(invParent, head.x, head.y);
  b.tx = localHead.x;
  b.ty = localHead.y;

  const dx = tip.x - head.x;
  const dy = tip.y - head.y;
  b.length = Math.max(1, Math.hypot(dx, dy));
  const worldAngle = Math.atan2(dy, dx);
  b.rot = worldAngle - matrixAngle(parentWorld);
}

function autoWeightMesh(m) {
  const vCount = getVertexCount(m);
  const bones = getRigBones(m);
  enforceConnectedHeads(bones);
  const boneCount = bones.length;
  if (boneCount === 0) {
    m.weights = new Float32Array(0);
    return;
  }
  const world = computeWorld(bones);
  const segments = bones.map((b, i) => {
    const a = transformPoint(world[i], 0, 0);
    const e = transformPoint(world[i], b.length, 0);
    return { ax: a.x, ay: a.y, bx: e.x, by: e.y, len: Math.max(10, b.length) };
  });

  m.weights = allocWeights(vCount, boneCount);

  const hardMode = state.weightMode === "hard";
  for (let i = 0; i < vCount; i += 1) {
    const px = m.positions[i * 2];
    const py = m.positions[i * 2 + 1];

    let bestBone = 0;
    let bestD2 = Number.POSITIVE_INFINITY;
    let sum = 0;
    for (let b = 0; b < boneCount; b += 1) {
      const s = segments[b];
      const d2 = pointToSegmentDistanceSquared(px, py, s.ax, s.ay, s.bx, s.by);
      if (d2 < bestD2) {
        bestD2 = d2;
        bestBone = b;
      }
      if (hardMode) continue;
      const falloff = 0.35 * s.len;
      const w = 1 / (1 + d2 / (falloff * falloff));
      m.weights[i * boneCount + b] = w;
      sum += w;
    }

    if (hardMode) {
      m.weights[i * boneCount + bestBone] = 1;
      continue;
    }

    if (sum < 1e-8) {
      m.weights[i * boneCount] = 1;
      continue;
    }

    for (let b = 0; b < boneCount; b += 1) {
      m.weights[i * boneCount + b] /= sum;
    }
  }
}

function autoWeightForPositions(positions, bones, allowedBones = null) {
  const vCount = positions.length / 2;
  enforceConnectedHeads(bones);
  const boneCount = bones.length;
  if (boneCount === 0) return new Float32Array(0);
  const allowSet = allowedBones && allowedBones.length > 0 ? new Set(allowedBones) : null;
  const world = computeWorld(bones);
  const segments = bones.map((b, i) => {
    const a = transformPoint(world[i], 0, 0);
    const e = transformPoint(world[i], b.length, 0);
    return { ax: a.x, ay: a.y, bx: e.x, by: e.y, len: Math.max(10, b.length) };
  });
  const weights = allocWeights(vCount, boneCount);
  const hardMode = state.weightMode === "hard";
  for (let i = 0; i < vCount; i += 1) {
    const px = positions[i * 2];
    const py = positions[i * 2 + 1];
    let bestBone = 0;
    let bestD2 = Number.POSITIVE_INFINITY;
    let sum = 0;
    for (let b = 0; b < boneCount; b += 1) {
      if (allowSet && !allowSet.has(b)) continue;
      const s = segments[b];
      const d2 = pointToSegmentDistanceSquared(px, py, s.ax, s.ay, s.bx, s.by);
      if (d2 < bestD2) {
        bestD2 = d2;
        bestBone = b;
      }
      if (hardMode) continue;
      const falloff = 0.35 * s.len;
      const w = 1 / (1 + d2 / (falloff * falloff));
      weights[i * boneCount + b] = w;
      sum += w;
    }
    if (hardMode) {
      const hb = allowSet && !allowSet.has(bestBone) ? [...allowSet][0] : bestBone;
      if (hb != null) weights[i * boneCount + hb] = 1;
      continue;
    }
    if (sum < 1e-8) {
      const fb = allowSet ? [...allowSet][0] : 0;
      if (fb != null) weights[i * boneCount + fb] = 1;
      continue;
    }
    for (let b = 0; b < boneCount; b += 1) {
      weights[i * boneCount + b] /= sum;
    }
  }
  return weights;
}

function setSlotSingleBoneWeight(slot, m, boneIndex) {
  if (!slot || !m) return;
  ensureSlotMeshData(slot, m);
  const sm = slot.meshData;
  const vCount = sm.positions.length / 2;
  const boneCount = m.rigBones.length;
  const weights = allocWeights(vCount, boneCount);
  if (boneIndex >= 0 && boneIndex < boneCount) {
    for (let i = 0; i < vCount; i += 1) {
      weights[i * boneCount + boneIndex] = 1;
    }
  }
  sm.weights = weights;
  slot.useWeights = true;
  slot.weightBindMode = "single";
  slot.weightMode = "single";
  slot.influenceBones = boneIndex >= 0 ? [boneIndex] : [];
}

function getSlotWeightMode(slot) {
  if (!slot) return "single";
  if (slot.weightMode === "single" || slot.weightMode === "weighted" || slot.weightMode === "free") {
    return slot.weightMode;
  }
  if (slot.useWeights === false || slot.weightBindMode === "none") return "free";
  if (slot.weightBindMode === "auto") return "weighted";
  return "single";
}

function getSlotInfluenceBones(slot, m) {
  if (!slot || !m) return [];
  const boneCount = m.rigBones.length;
  if (Array.isArray(slot.influenceBones) && slot.influenceBones.length > 0) {
    const filtered = slot.influenceBones.filter((i) => Number.isFinite(i) && i >= 0 && i < boneCount);
    if (filtered.length > 0) return [...new Set(filtered)];
  }
  const b = Number(slot.bone);
  if (Number.isFinite(b) && b >= 0 && b < boneCount) return [b];
  return boneCount > 0 ? [0] : [];
}

function rebuildSlotWeights(slot, m) {
  if (!slot || !m) return;
  ensureSlotMeshData(slot, m);
  const mode = getSlotWeightMode(slot);
  if (mode === "free") {
    slot.useWeights = false;
    slot.weightBindMode = "none";
    slot.weightMode = "free";
    slot.meshData.weights = new Float32Array(0);
    return;
  }
  if (mode === "single") {
    const bi = Number(slot.bone);
    setSlotSingleBoneWeight(slot, m, Number.isFinite(bi) ? bi : -1);
    slot.influenceBones = Number.isFinite(bi) && bi >= 0 && bi < m.rigBones.length ? [bi] : [];
    return;
  }
  slot.useWeights = true;
  const allowed = getSlotInfluenceBones(slot, m);
  slot.influenceBones = allowed;
  slot.meshData.weights = autoWeightForPositions(slot.meshData.positions, m.rigBones, allowed);
  slot.weightBindMode = "auto";
  slot.weightMode = "weighted";
}

function createSlotMeshData(rect, docW, docH, baseCols, baseRows) {
  const cellW = Math.max(1, docW / Math.max(2, baseCols));
  const cellH = Math.max(1, docH / Math.max(2, baseRows));
  const cols = Math.max(1, Math.round(rect.w / cellW));
  const rows = Math.max(1, Math.round(rect.h / cellH));
  const vCount = (cols + 1) * (rows + 1);
  const positions = new Float32Array(vCount * 2);
  const uvs = new Float32Array(vCount * 2);
  const offsets = new Float32Array(vCount * 2);
  const index = [];
  let idx = 0;
  for (let y = 0; y <= rows; y += 1) {
    const ty = y / rows;
    for (let x = 0; x <= cols; x += 1) {
      const tx = x / cols;
      positions[idx * 2] = rect.x + tx * rect.w;
      positions[idx * 2 + 1] = rect.y + ty * rect.h;
      uvs[idx * 2] = tx;
      uvs[idx * 2 + 1] = ty;
      idx += 1;
    }
  }
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      const i0 = y * (cols + 1) + x;
      const i1 = i0 + 1;
      const i2 = i0 + (cols + 1);
      const i3 = i2 + 1;
      index.push(i0, i2, i1, i1, i2, i3);
    }
  }
  return {
    cols,
    rows,
    positions,
    uvs,
    offsets,
    baseOffsets: new Float32Array(offsets),
    weights: new Float32Array(0),
    indices: new Uint16Array(index),
    deformedLocal: new Float32Array(vCount * 2),
    deformedScreen: new Float32Array(vCount * 2),
    interleaved: new Float32Array(vCount * 4),
  };
}

function createMesh(cols, rows, w, h) {
  const vCount = (cols + 1) * (rows + 1);
  const positions = new Float32Array(vCount * 2);
  const uvs = new Float32Array(vCount * 2);
  const offsets = new Float32Array(vCount * 2);

  let idx = 0;
  for (let y = 0; y <= rows; y += 1) {
    const ty = y / rows;
    for (let x = 0; x <= cols; x += 1) {
      const tx = x / cols;
      positions[idx * 2] = tx * w;
      positions[idx * 2 + 1] = ty * h;
      uvs[idx * 2] = tx;
      uvs[idx * 2 + 1] = ty;
      idx += 1;
    }
  }

  const index = [];
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      const i0 = y * (cols + 1) + x;
      const i1 = i0 + 1;
      const i2 = i0 + (cols + 1);
      const i3 = i2 + 1;
      index.push(i0, i2, i1, i1, i2, i3);
    }
  }

  const rigBones = [];
  const mesh = {
    cols,
    rows,
    positions,
    uvs,
    offsets,
    baseOffsets: new Float32Array(offsets),
    weights: allocWeights(vCount, rigBones.length),
    indices: new Uint16Array(index),
    rigBones,
    poseBones: cloneBones(rigBones),
    bindWorld: null,
    invBind: null,
    deformedLocal: new Float32Array(vCount * 2),
    skinnedLocal: new Float32Array(vCount * 2),
    deformedScreen: new Float32Array(vCount * 2),
    interleaved: new Float32Array(vCount * 4),
    ikConstraints: [],
    transformConstraints: [],
    pathConstraints: [],
  };

  syncBindPose(mesh);
  return mesh;
}

function syncBindPose(m) {
  enforceConnectedHeads(m.rigBones);
  const world = computeWorld(m.rigBones);
  m.bindWorld = world;
  m.invBind = world.map(invert);
}

function rebuildMesh() {
  if (!state.sourceCanvas) return;
  const cols = math.clamp(Number(els.gridX.value) || 24, 2, 120);
  const rows = math.clamp(Number(els.gridY.value) || 24, 2, 120);
  state.mesh = createMesh(cols, rows, state.imageWidth, state.imageHeight);
  state.selectedBone = 0;
  state.selectedBonesForWeight = [];
  state.selectedIK = -1;
  state.selectedTransform = -1;
  state.selectedPath = -1;
  state.boneMode = els.boneMode.value || "edit";
  state.weightMode = els.weightMode.value || "hard";
  state.anim.animations = [createAnimation("Anim 1")];
  state.anim.currentAnimId = state.anim.animations[0].id;
  state.anim.selectedTrack = "";
  state.anim.selectedKey = null;
  state.anim.selectedKeys = [];
  state.anim.trackExpanded = {};
  state.anim.playing = false;
  state.anim.mix.active = false;
  state.anim.dirtyTracks = [];
  state.addBoneArmed = false;
  state.addBoneDraft = null;
  els.addBoneBtn.textContent = "Add Bone";
  setAnimTime(0);
  refreshAnimationUI();
  updatePlaybackButtons();
  for (const s of state.slots) {
    if (!s) continue;
    s.meshData = null;
    ensureSlotMeshData(s, state.mesh);
  }
  rebuildSlotTriangleIndices();
  if (hasGL) {
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, state.mesh.indices, gl.STATIC_DRAW);
  }
  updateBoneUI();
  setStatus(`Mesh rebuilt: ${cols} x ${rows}, bones: ${state.mesh.rigBones.length}`);
}

function refreshWeightsForBoneCount() {
  const m = state.mesh;
  if (!m) return;
  const vCount = getVertexCount(m);
  m.weights = allocWeights(vCount, m.rigBones.length);
  autoWeightMesh(m);
  for (const s of state.slots) {
    if (!s) continue;
    rebuildSlotWeights(s, m);
  }
}

function autoWeightActiveSlot() {
  const m = state.mesh;
  if (!m) return false;
  if (state.slots.length === 0) {
    autoWeightMesh(m);
    return true;
  }
  const slot = getActiveSlot();
  if (!slot) return false;
  ensureSlotMeshData(slot, m);
  const picked = getSelectedBonesForWeight(m);
  // Auto-bind should follow current multi-selection explicitly.
  // If no multi-selection exists, fallback to slot's current influence set.
  slot.influenceBones = picked.length > 0 ? [...new Set(picked)] : getSlotInfluenceBones(slot, m);
  slot.useWeights = true;
  slot.weightBindMode = "auto";
  slot.weightMode = "weighted";
  slot.meshData.weights = autoWeightForPositions(slot.meshData.positions, m.rigBones, getSlotInfluenceBones(slot, m));
  refreshSlotUI();
  return true;
}

function isValidParent(bones, index, parent) {
  if (parent < 0 || parent >= bones.length) return true;
  if (parent === index) return false;
  let p = parent;
  while (p >= 0) {
    if (p === index) return false;
    p = bones[p].parent;
  }
  return true;
}

function ensureSelectedBoneInRange() {
  const m = state.mesh;
  if (!m) return;
  if (m.rigBones.length === 0) {
    state.selectedBone = -1;
    state.selectedBonesForWeight = [];
  } else {
    if (!Number.isFinite(state.selectedBone) || state.selectedBone < -1) {
      state.selectedBone = -1;
    } else if (state.selectedBone >= m.rigBones.length) {
      state.selectedBone = m.rigBones.length - 1;
    }
    state.selectedBonesForWeight = getSelectedBonesForWeight(m);
    if (state.selectedBone >= 0 && state.selectedBonesForWeight.length === 0) {
      state.selectedBonesForWeight = [state.selectedBone];
    }
  }
}

function updateBoneSelectors() {
  const m = state.mesh;
  els.boneSelect.innerHTML = "";
  els.boneParent.innerHTML = "";
  els.addBoneParent.innerHTML = "";
  if (!m) return;
  const bones = getActiveBones(m);

  for (let i = 0; i < bones.length; i += 1) {
    const b = bones[i];
    const opt = document.createElement("option");
    opt.value = String(i);
    opt.textContent = `${i}: ${b.name}${b.connected ? " [C]" : " [D]"}`;
    els.boneSelect.appendChild(opt);
  }

  const none = document.createElement("option");
  none.value = "-1";
  none.textContent = "-1: None (Root)";
  els.boneParent.appendChild(none);
  const addNone = document.createElement("option");
  addNone.value = "-1";
  addNone.textContent = "-1: None (Root)";
  els.addBoneParent.appendChild(addNone);

  for (let i = 0; i < bones.length; i += 1) {
    const b = bones[i];
    const opt = document.createElement("option");
    opt.value = String(i);
    opt.textContent = `${i}: ${b.name}`;
    els.boneParent.appendChild(opt);
    const addOpt = document.createElement("option");
    addOpt.value = String(i);
    addOpt.textContent = `${i}: ${b.name}`;
    els.addBoneParent.appendChild(addOpt);
  }
  refreshIKUI();
  refreshTransformUI();
  refreshPathUI();
}

function refreshBoneTreeFilterUI() {
  if (!els.boneTreeOnlyActiveSlotBtn) return;
  const on = !!state.boneTreeOnlyActiveSlot;
  els.boneTreeOnlyActiveSlotBtn.classList.toggle("active", on);
  els.boneTreeOnlyActiveSlotBtn.textContent = on ? "Show All Slots" : "Only Active Slot";
  els.boneTreeOnlyActiveSlotBtn.title = on ? "Currently showing only active slot in tree." : "Show only current active slot in tree.";
  els.boneTreeOnlyActiveSlotBtn.disabled = state.slots.length <= 1;
}

function isBoneTreeInlineRename(kind, index) {
  const rename = state.boneTreeInlineRename || { kind: "", index: -1 };
  return rename.kind === kind && Number(rename.index) === Number(index);
}

function focusBoneTreeInlineRenameInput(kind, index) {
  if (!els.boneTree) return;
  const idx = Number(index);
  if (!Number.isFinite(idx)) return;
  const selector = `input.tree-rename-input[data-rename-kind="${kind}"][data-rename-index="${idx}"]`;
  const input = els.boneTree.querySelector(selector);
  if (!(input instanceof HTMLInputElement)) return;
  input.focus();
  input.select();
}

function clearBoneTreeInlineRename(skipRender = false) {
  state.boneTreeInlineRename = { kind: "", index: -1 };
  if (!skipRender) renderBoneTree();
}

function commitBoneTreeInlineRename(kind, index, nextRaw) {
  const idx = Number(index);
  if (!Number.isFinite(idx) || idx < 0) {
    clearBoneTreeInlineRename();
    return false;
  }
  const next = String(nextRaw || "").trim();
  if (!next) {
    setStatus("Name cannot be empty.");
    requestAnimationFrame(() => focusBoneTreeInlineRenameInput(kind, idx));
    return false;
  }

  if (kind === "slot") {
    if (idx >= state.slots.length || !state.slots[idx]) {
      clearBoneTreeInlineRename();
      return false;
    }
    const slot = state.slots[idx];
    const current = String(slot.name || "").trim() || `slot_${idx}`;
    if (next === current) {
      clearBoneTreeInlineRename();
      return false;
    }
    slot.name = next;
    clearBoneTreeInlineRename(true);
    refreshSlotUI();
    renderBoneTree();
    pushUndoCheckpoint(true);
    setStatus(`Slot renamed: ${next}`);
    return true;
  }

  if (kind === "bone") {
    const m = state.mesh;
    if (!m || !Array.isArray(m.rigBones) || idx >= m.rigBones.length || !m.rigBones[idx]) {
      clearBoneTreeInlineRename();
      return false;
    }
    const bone = m.rigBones[idx];
    const current = String(bone.name || "").trim() || `bone_${idx}`;
    if (next === current) {
      clearBoneTreeInlineRename();
      return false;
    }
    bone.name = next;
    clearBoneTreeInlineRename(true);
    updateBoneUI();
    pushUndoCheckpoint(true);
    setStatus(`Bone renamed: ${next}`);
    return true;
  }

  clearBoneTreeInlineRename();
  return false;
}

function startBoneTreeInlineRename(kind, index) {
  const idx = Number(index);
  if (!Number.isFinite(idx) || idx < 0) return false;
  if (kind === "slot") {
    if (idx >= state.slots.length || !state.slots[idx]) return false;
    if (state.activeSlot !== idx) setActiveSlot(idx);
    setRightPropsFocus("slot");
  } else if (kind === "bone") {
    const m = state.mesh;
    if (!m || !Array.isArray(m.rigBones) || idx >= m.rigBones.length || !m.rigBones[idx]) return false;
    if (state.selectedBone !== idx) {
      state.selectedBone = idx;
      state.selectedBonesForWeight = [idx];
      updateBoneUI();
    }
    setRightPropsFocus("bone");
  } else {
    return false;
  }
  state.boneTreeInlineRename = { kind, index: idx };
  renderBoneTree();
  requestAnimationFrame(() => focusBoneTreeInlineRenameInput(kind, idx));
  return true;
}

function renderBoneTree() {
  const m = state.mesh;
  if (!els.boneTree) return;
  els.boneTree.innerHTML = "";
  refreshBoneTreeFilterUI();
  const bones = m && m.rigBones ? m.rigBones : [];
  const hasBones = bones.length > 0;
  if (!hasBones && state.slots.length === 0) {
    els.boneTree.innerHTML = "<div class='muted'>No bones or slots yet.</div>";
    return;
  }

  const slotsByBone = new Map();
  for (let i = 0; i < state.slots.length; i += 1) {
    const s = state.slots[i];
    const b = Number.isFinite(s.bone) && s.bone >= 0 && s.bone < bones.length ? s.bone : -1;
    if (!slotsByBone.has(b)) slotsByBone.set(b, []);
    slotsByBone.get(b).push(i);
  }
  const byParent = new Map();
  const ikBones = getIkConstrainedBoneSet(m);
  const ikTargets = getIkTargetBoneSet(m);
  const tfcBones = getTransformConstrainedBoneSet(m);
  const tfcTargets = getTransformTargetBoneSet(m);
  const pathBones = getPathConstrainedBoneSet(m);
  const pathTargets = getPathTargetBoneSet(m);
  for (let i = 0; i < bones.length; i += 1) {
    const p = bones[i].parent;
    if (!byParent.has(p)) byParent.set(p, []);
    byParent.get(p).push(i);
  }

  const isTreeSlotVisible = (slotIndex) => {
    if (!state.boneTreeOnlyActiveSlot) return true;
    return Number(slotIndex) === Number(state.activeSlot);
  };

  const makeRenameInput = (kind, index, currentValue) => {
    const input = document.createElement("input");
    input.type = "text";
    input.className = "tree-rename-input";
    input.dataset.renameKind = kind;
    input.dataset.renameIndex = String(index);
    input.value = String(currentValue || "");
    input.autocomplete = "off";
    input.spellcheck = false;
    input.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter") {
        ev.preventDefault();
        commitBoneTreeInlineRename(kind, index, input.value);
        return;
      }
      if (ev.key === "Escape") {
        ev.preventDefault();
        clearBoneTreeInlineRename();
      }
    });
    input.addEventListener("blur", () => {
      commitBoneTreeInlineRename(kind, index, input.value);
    });
    return input;
  };

  function appendSlotRows(parentBone, depth) {
    const list = slotsByBone.get(parentBone) || [];
    for (const si of list) {
      if (!isTreeSlotVisible(si)) continue;
      const s = state.slots[si];
      const row = document.createElement("div");
      row.className = `tree-item tree-slot${state.activeSlot === si ? " selected" : ""}`;
      row.style.marginLeft = `${depth * 14 + 16}px`;
      row.dataset.slotIndex = String(si);
      row.dataset.slotDraggable = "1";
      row.draggable = true;
      row.title = "Drag onto bone/slot row to reorder or reassign. Double-click to rename.";
      const eye = document.createElement("button");
      eye.type = "button";
      eye.className = "slot-eye";
      eye.dataset.slotEye = String(si);
      eye.title = isSlotEditorVisible(s) ? "Hide slot in editor" : "Show slot in editor";
      eye.textContent = isSlotEditorVisible(s) ? "◉" : "◌";
      const editing = isBoneTreeInlineRename("slot", si);
      const prefix = document.createElement("span");
      prefix.className = "tree-slot-prefix";
      prefix.textContent = "Slot:";
      row.appendChild(eye);
      row.appendChild(prefix);
      if (editing) {
        const input = makeRenameInput("slot", si, s.name || `slot_${si}`);
        row.appendChild(input);
      } else {
        const name = document.createElement("span");
        name.className = "tree-slot-name";
        name.textContent = s.name;
        row.appendChild(name);
      }
      els.boneTree.appendChild(row);
    }
  }

  function walk(parent, depth) {
    const kids = byParent.get(parent) || [];
    for (const i of kids) {
      const b = bones[i];
      const row = document.createElement("div");
      const picked = state.selectedBonesForWeight && state.selectedBonesForWeight.includes(i);
      const parentCandidate = state.parentPickArmed && state.parentHoverBone === i;
      const ikTargetCandidate = state.ikPickArmed && state.ikHoverBone === i;
      const isIK = ikBones.has(i);
      const isIKTarget = ikTargets.has(i);
      const isTFC = tfcBones.has(i);
      const isTFCTarget = tfcTargets.has(i);
      const isPath = pathBones.has(i);
      const isPathTarget = pathTargets.has(i);
      row.className = `tree-item${state.selectedBone === i ? " selected" : ""}${picked ? " weight-picked" : ""}${
        parentCandidate ? " parent-candidate" : ""
      }${ikTargetCandidate ? " ik-target-candidate" : ""}${isIK ? " ik-bone" : ""}${isIKTarget ? " ik-target-bone" : ""}${
        isTFC ? " ik-bone" : ""
      }${isTFCTarget ? " ik-target-bone" : ""}${isPath ? " ik-bone" : ""}${isPathTarget ? " ik-target-bone" : ""}`;
      row.style.marginLeft = `${depth * 14}px`;
      row.dataset.boneIndex = String(i);
      const slotCount = (slotsByBone.get(i) || []).length;
      const childCount = (byParent.get(i) || []).length;
      const slotCollapsed = !!state.boneTreeSlotCollapse[i];
      const childCollapsed = !!state.boneTreeChildCollapse[i];
      const slotBtn = document.createElement("button");
      slotBtn.type = "button";
      slotBtn.className = "tree-bone-slot-toggle";
      slotBtn.dataset.boneSlotToggle = String(i);
      slotBtn.textContent = slotCollapsed ? "S+" : "S-";
      slotBtn.title =
        slotCount > 0
          ? slotCollapsed
            ? `Expand ${slotCount} slot(s) under this bone`
            : `Collapse ${slotCount} slot(s) under this bone`
          : "No slots under this bone";
      slotBtn.disabled = slotCount <= 0;
      row.appendChild(slotBtn);

      const childBtn = document.createElement("button");
      childBtn.type = "button";
      childBtn.className = "tree-bone-child-toggle";
      childBtn.dataset.boneChildToggle = String(i);
      childBtn.textContent = childCollapsed ? "B+" : "B-";
      childBtn.title =
        childCount > 0
          ? childCollapsed
            ? `Expand ${childCount} child bone(s)`
            : `Collapse ${childCount} child bone(s)`
          : "No child bones";
      childBtn.disabled = childCount <= 0;
      row.appendChild(childBtn);

      const badgeText = `${isIK ? " [IK]" : ""}${isIKTarget ? " [IK-T]" : ""}${isTFC ? " [TC]" : ""}${
        isTFCTarget ? " [TC-T]" : ""
      }${isPath ? " [PATH]" : ""}${isPathTarget ? " [PATH-T]" : ""}`;
      if (isBoneTreeInlineRename("bone", i)) {
        const input = makeRenameInput("bone", i, b.name || `bone_${i}`);
        row.appendChild(input);
        if (badgeText) {
          const badges = document.createElement("span");
          badges.className = "tree-bone-badges";
          badges.textContent = badgeText;
          row.appendChild(badges);
        }
      } else {
        const label = document.createElement("span");
        label.className = "tree-bone-name";
        label.textContent = `Bone: ${b.name}${badgeText}`;
        row.appendChild(label);
      }
      els.boneTree.appendChild(row);
      if (!slotCollapsed) appendSlotRows(i, depth);
      if (!childCollapsed) walk(i, depth + 1);
    }
  }

  if (hasBones) {
    walk(-1, 0);
    appendSlotRows(-1, 0);
  } else {
    appendSlotRows(-1, 0);
  }
}

function updateBoneUI() {
  const m = state.mesh;
  if (!m) return;

  ensureSelectedBoneInRange();
  updateBoneSelectors();
  const bones = getActiveBones(m);

  const i = state.selectedBone;
  const b = bones[i];
  if (!b) {
    els.boneName.value = "";
    els.boneParent.value = "-1";
    if (els.boneInherit) els.boneInherit.value = "normal";
    els.boneConnect.value = "true";
    els.bonePoseLen.value = "false";
    els.boneTx.value = "0";
    els.boneTy.value = "0";
    els.boneRot.value = "0";
    els.boneLen.value = "1";
    if (els.boneScaleX) els.boneScaleX.value = "1";
    if (els.boneScaleY) els.boneScaleY.value = "1";
    if (els.boneShearX) els.boneShearX.value = "0";
    if (els.boneShearY) els.boneShearY.value = "0";
    els.boneHeadX.value = "0";
    els.boneHeadY.value = "0";
    els.boneTipX.value = "0";
    els.boneTipY.value = "0";
    refreshIKUI();
    refreshAnimationLayerUI();
    refreshTrackSelect();
    renderTimelineTracks();
    refreshSlotUI();
    renderBoneTree();
    return;
  }
  normalizeBoneChannels(b);
  state.anim.trackExpanded[i] = true;

  els.boneSelect.value = String(i);
  els.boneName.value = b.name;
  els.boneParent.value = String(b.parent);
  if (els.boneInherit) els.boneInherit.value = normalizeBoneInheritValue(b.inherit);
  if (!els.addBoneParent.value) {
    els.addBoneParent.value = String(i);
  }
  els.boneConnect.value = b.connected ? "true" : "false";
  els.bonePoseLen.value = b.poseLenEditable === false ? "false" : "true";
  els.boneTx.value = String(Math.round(b.tx));
  els.boneTy.value = String(Math.round(b.ty));
  els.boneRot.value = String(Math.round(math.radToDeg(b.rot)));
  els.boneLen.value = String(Math.max(1, Math.round(b.length)));
  if (els.boneScaleX) els.boneScaleX.value = String((Number(b.sx) || 1).toFixed(3));
  if (els.boneScaleY) els.boneScaleY.value = String((Number(b.sy) || 1).toFixed(3));
  if (els.boneShearX) els.boneShearX.value = String(math.radToDeg(Number(b.shx) || 0).toFixed(2));
  if (els.boneShearY) els.boneShearY.value = String(math.radToDeg(Number(b.shy) || 0).toFixed(2));
  const ep = getBoneWorldEndpointsFromBones(bones, i);
  els.boneHeadX.value = String(Math.round(ep.head.x));
  els.boneHeadY.value = String(Math.round(ep.head.y));
  els.boneTipX.value = String(Math.round(ep.tip.x));
  els.boneTipY.value = String(Math.round(ep.tip.y));

  const poseMode = state.boneMode === "pose";
  const connectedToParent = b.parent >= 0 && b.connected;
  const poseLenLocked = poseMode && b.poseLenEditable === false;
  els.boneConnect.disabled = b.parent < 0;
  els.boneParent.disabled = poseMode;
  if (els.boneInherit) els.boneInherit.disabled = poseMode;
  els.addBoneBtn.disabled = poseMode;
  els.addBoneParent.disabled = poseMode;
  els.addBoneConnect.disabled = poseMode;
  els.deleteBoneBtn.disabled = poseMode;
  els.weightMode.disabled = poseMode;
  els.autoWeightBtn.disabled = poseMode;
  els.boneTx.disabled = connectedToParent;
  els.boneTy.disabled = connectedToParent;
  els.boneHeadX.disabled = connectedToParent;
  els.boneHeadY.disabled = connectedToParent;
  els.boneLen.disabled = poseLenLocked;
  if (els.boneScaleX) els.boneScaleX.disabled = false;
  if (els.boneScaleY) els.boneScaleY.disabled = false;
  if (els.boneShearX) els.boneShearX.disabled = false;
  if (els.boneShearY) els.boneShearY.disabled = false;
  refreshIKUI();
  refreshAnimationLayerUI();
  refreshTrackSelect();
  renderTimelineTracks();
  refreshSlotUI();
  renderBoneTree();
}

function resetPose() {
  if (!state.mesh) return;
  if (state.boneMode === "edit") {
    state.mesh.rigBones = [];
    syncPoseFromRig(state.mesh);
    syncBindPose(state.mesh);
    refreshWeightsForBoneCount();
    state.selectedBone = -1;
    updateBoneUI();
    return;
  }
  syncPoseFromRig(state.mesh);
  updateBoneUI();
}

function resetVertexOffsets() {
  if (!state.mesh) return;
  if (state.slots.length > 0) {
    const slot = getActiveSlot();
    if (!slot) return;
    ensureSlotMeshData(slot, state.mesh);
    slot.meshData.offsets.set(slot.meshData.baseOffsets);
  } else {
    state.mesh.offsets.set(state.mesh.baseOffsets);
  }
  markDirtyVertexTrack();
}

function addBone(opts = null) {
  const m = state.mesh;
  if (!m || state.boneMode !== "edit") return;
  const bones = getRigBones(m);

  const parent =
    opts && typeof opts.parent === "number"
      ? opts.parent
      : state.selectedBone >= 0
        ? state.selectedBone
        : -1;
  const safeParent = parent >= 0 && parent < bones.length ? parent : -1;
  const parentBone = safeParent >= 0 ? bones[safeParent] : null;
  const len = Math.max(16, Math.round(state.imageWidth * 0.16));
  const connected = opts && typeof opts.connected === "boolean" ? opts.connected : parent >= 0;

  bones.push({
    name: `bone_${bones.length}`,
    parent: safeParent,
    inherit: "normal",
    tx: parentBone ? parentBone.length : state.imageWidth * 0.5,
    ty: 0,
    rot: 0,
    length: len,
    sx: 1,
    sy: 1,
    shx: 0,
    shy: 0,
    connected,
    poseLenEditable: false,
  });

  const idx = bones.length - 1;
  if (opts && opts.head && opts.tail) {
    const world = computeWorld(bones);
    const head = safeParent >= 0 && connected ? transformPoint(world[safeParent], bones[safeParent].length, 0) : opts.head;
    setBoneFromWorldEndpoints(bones, idx, head, opts.tail);
  }

  state.selectedBone = idx;
  syncPoseFromRig(m);
  syncBindPose(m);
  refreshWeightsForBoneCount();
  updateBoneUI();
  pushUndoCheckpoint(true);
  return idx;
}

function deleteBone() {
  const m = state.mesh;
  if (!m || state.boneMode !== "edit") return;
  const bones = getRigBones(m);
  if (bones.length <= 1) return;

  const removed = state.selectedBone;
  bones.splice(removed, 1);

  for (const b of bones) {
    if (b.parent === removed) {
      b.parent = -1;
    } else if (b.parent > removed) {
      b.parent -= 1;
    }
  }
  for (const s of state.slots) {
    if (!s) continue;
    if (s.bone === removed) s.bone = -1;
    else if (s.bone > removed) s.bone -= 1;
  }
  remapIKAfterBoneRemoved(m, removed);
  ensureSlotsHaveBoneBinding();

  state.selectedBone = Math.max(0, removed - 1);
  state.selectedBonesForWeight = [state.selectedBone];
  syncPoseFromRig(m);
  syncBindPose(m);
  refreshWeightsForBoneCount();
  updateBoneUI();
  pushUndoCheckpoint(true);
}

function commitRigEdit(m, reweight = false) {
  syncPoseFromRig(m);
  syncBindPose(m);
  if (reweight) {
    autoWeightMesh(m);
    for (const s of state.slots) {
      if (!s) continue;
      rebuildSlotWeights(s, m);
    }
  }
}

function getBonesForCurrentMode(m) {
  return state.boneMode === "pose" ? getPoseBones(m) : getRigBones(m);
}

function updateTexture() {
  if (!state.sourceCanvas) return;
  if (!hasGL) return;
  if (!state.texture) state.texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, state.texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, state.sourceCanvas);
}

function makeCanvas(w, h) {
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.round(w));
  c.height = Math.max(1, Math.round(h));
  return c;
}

function normalizeSlotCanvas(src, targetW, targetH) {
  const c = makeCanvas(targetW, targetH);
  const ctx = c.getContext("2d");
  if (!ctx) return c;
  if (src.width === targetW && src.height === targetH) {
    ctx.drawImage(src, 0, 0);
    return c;
  }
  ctx.drawImage(src, 0, 0, src.width, src.height, 0, 0, targetW, targetH);
  return c;
}

function getCanvasAlphaBounds(canvas) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const w = canvas.width;
  const h = canvas.height;
  const img = ctx.getImageData(0, 0, w, h).data;
  let minX = w;
  let minY = h;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const a = img[(y * w + x) * 4 + 3];
      if (a <= 0) continue;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
  if (maxX < minX || maxY < minY) return null;
  return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
}

function refreshSlotUI() {
  const activeSlot = getActiveSlot();
  if (els.slotQuickAddBtn) {
    els.slotQuickAddBtn.disabled = !state.mesh && state.slots.length === 0 && !state.sourceCanvas;
  }
  if (els.slotQuickDupBtn) {
    els.slotQuickDupBtn.disabled = !activeSlot;
  }
  if (els.slotQuickDeleteBtn) {
    els.slotQuickDeleteBtn.disabled = !activeSlot;
  }
  refreshBoneTreeContextMenuUI();
  if (els.slotSelect) {
    els.slotSelect.innerHTML = "";
    for (let i = 0; i < state.slots.length; i += 1) {
      const s = state.slots[i];
      const opt = document.createElement("option");
      opt.value = String(i);
      opt.textContent = `${i}: ${s.name}`;
      els.slotSelect.appendChild(opt);
    }
    if (state.activeSlot >= 0 && state.activeSlot < state.slots.length) {
      els.slotSelect.value = String(state.activeSlot);
    }
  }
  if (els.slotViewMode) {
    els.slotViewMode.value = state.slotViewMode;
  }
  if (els.slotMeshNewMode) {
    els.slotMeshNewMode.value = state.slotMesh.newContourMode === "reset_current" ? "reset_current" : "new_slot";
  }
  if (els.slotMeshGridReplaceContour) {
    els.slotMeshGridReplaceContour.checked = !!state.slotMesh.gridReplaceContour;
  }
  if (els.slotBone) {
    els.slotBone.innerHTML = "";
    const none = document.createElement("option");
    none.value = "-1";
    none.textContent = "-1: Unbound";
    els.slotBone.appendChild(none);
    if (state.mesh && state.mesh.rigBones) {
      for (let i = 0; i < state.mesh.rigBones.length; i += 1) {
        const b = state.mesh.rigBones[i];
        const opt = document.createElement("option");
        opt.value = String(i);
        opt.textContent = `${i}: ${b.name}`;
        els.slotBone.appendChild(opt);
      }
    }
  }
  if (els.slotInfluenceBones) {
    els.slotInfluenceBones.innerHTML = "";
    if (state.mesh && state.mesh.rigBones) {
      for (let i = 0; i < state.mesh.rigBones.length; i += 1) {
        const b = state.mesh.rigBones[i];
        const opt = document.createElement("option");
        opt.value = String(i);
        opt.textContent = `${i}: ${b.name}`;
        els.slotInfluenceBones.appendChild(opt);
      }
    }
  }
  const s = activeSlot;
  if (s) {
    ensureSlotAttachmentState(s);
    ensureSlotAttachments(s);
    ensureSlotVisualState(s);
  }
  if (els.slotName) els.slotName.value = s ? s.name : "";
  if (els.slotAttachment) {
    els.slotAttachment.innerHTML = "";
    const none = document.createElement("option");
    none.value = "__none__";
    none.textContent = "(none)";
    els.slotAttachment.appendChild(none);
    if (s) {
      for (const a of ensureSlotAttachments(s)) {
        const opt = document.createElement("option");
        opt.value = a.name;
        opt.textContent = a.name;
        els.slotAttachment.appendChild(opt);
      }
    } else {
      const opt = document.createElement("option");
      opt.value = "main";
      opt.textContent = "main";
      els.slotAttachment.appendChild(opt);
    }
    const current = s ? getSlotCurrentAttachmentName(s) : null;
    els.slotAttachment.value = current ? current : "__none__";
    els.slotAttachment.disabled = !s;
  }
  if (els.slotAttachmentAddBtn) els.slotAttachmentAddBtn.disabled = !s;
  if (els.slotAttachmentDeleteBtn) {
    const canDelete = !!(s && ensureSlotAttachments(s).length > 1 && getSlotCurrentAttachmentName(s));
    els.slotAttachmentDeleteBtn.disabled = !canDelete;
  }
  if (els.slotAttachmentRenameBtn) els.slotAttachmentRenameBtn.disabled = !s || !getSlotCurrentAttachmentName(s);
  if (els.slotAttachmentLoadBtn) els.slotAttachmentLoadBtn.disabled = !s || !getSlotCurrentAttachmentName(s);
  if (els.slotAttachmentName) {
    const name = s ? getSlotCurrentAttachmentName(s) || "" : "";
    els.slotAttachmentName.value = name;
    els.slotAttachmentName.disabled = !s || !name;
  }
  if (els.slotPlaceholderName) {
    const ph = s ? String(s.placeholderName || s.attachmentName || "main") : "";
    els.slotPlaceholderName.value = ph;
    els.slotPlaceholderName.disabled = !s;
  }
  if (els.slotAttachmentPlaceholderName) {
    const aph = s ? getSlotCurrentAttachmentPlaceholder(s) : "";
    els.slotAttachmentPlaceholderName.value = aph;
    els.slotAttachmentPlaceholderName.disabled = !s || !getSlotCurrentAttachmentName(s);
  }
  const activeAttachmentEntry = s ? getSlotAttachmentEntry(s, getSlotCurrentAttachmentName(s)) : null;
  if (els.slotAttachmentType) {
    const t = activeAttachmentEntry ? normalizeAttachmentType(activeAttachmentEntry.type) : "region";
    els.slotAttachmentType.value = t;
    els.slotAttachmentType.disabled = !activeAttachmentEntry;
  }
  if (els.slotAttachmentLinkedParent) {
    els.slotAttachmentLinkedParent.innerHTML = "";
    const none = document.createElement("option");
    none.value = "";
    none.textContent = "(none)";
    els.slotAttachmentLinkedParent.appendChild(none);
    if (s && activeAttachmentEntry) {
      for (const a of ensureSlotAttachments(s)) {
        if (!a || a.name === activeAttachmentEntry.name) continue;
        if (normalizeAttachmentType(a.type) !== "mesh" && normalizeAttachmentType(a.type) !== "region") continue;
        const opt = document.createElement("option");
        opt.value = String(a.name);
        opt.textContent = String(a.name);
        els.slotAttachmentLinkedParent.appendChild(opt);
      }
      els.slotAttachmentLinkedParent.value = activeAttachmentEntry.linkedParent ? String(activeAttachmentEntry.linkedParent) : "";
    } else {
      els.slotAttachmentLinkedParent.value = "";
    }
    const can = !!(activeAttachmentEntry && normalizeAttachmentType(activeAttachmentEntry.type) === "linkedmesh");
    els.slotAttachmentLinkedParent.disabled = !can;
  }
  if (els.slotAttachmentPointX) {
    els.slotAttachmentPointX.value = String(activeAttachmentEntry ? Number(activeAttachmentEntry.pointX) || 0 : 0);
    const can = !!(activeAttachmentEntry && normalizeAttachmentType(activeAttachmentEntry.type) === "point");
    els.slotAttachmentPointX.disabled = !can;
  }
  if (els.slotAttachmentPointY) {
    els.slotAttachmentPointY.value = String(activeAttachmentEntry ? Number(activeAttachmentEntry.pointY) || 0 : 0);
    const can = !!(activeAttachmentEntry && normalizeAttachmentType(activeAttachmentEntry.type) === "point");
    els.slotAttachmentPointY.disabled = !can;
  }
  if (els.slotAttachmentPointRot) {
    els.slotAttachmentPointRot.value = String(activeAttachmentEntry ? Number(activeAttachmentEntry.pointRot) || 0 : 0);
    const can = !!(activeAttachmentEntry && normalizeAttachmentType(activeAttachmentEntry.type) === "point");
    els.slotAttachmentPointRot.disabled = !can;
  }
  if (els.slotAttachmentBBoxSource) {
    els.slotAttachmentBBoxSource.value = activeAttachmentEntry && activeAttachmentEntry.bboxSource === "contour" ? "contour" : "fill";
    const can = !!(activeAttachmentEntry && normalizeAttachmentType(activeAttachmentEntry.type) === "boundingbox");
    els.slotAttachmentBBoxSource.disabled = !can;
  }
  if (els.slotAttachmentSequenceEnabled) {
    const seq = activeAttachmentEntry && activeAttachmentEntry.sequence ? activeAttachmentEntry.sequence : { enabled: false };
    els.slotAttachmentSequenceEnabled.checked = !!seq.enabled;
    const can = !!(activeAttachmentEntry && (normalizeAttachmentType(activeAttachmentEntry.type) === "region" || normalizeAttachmentType(activeAttachmentEntry.type) === "mesh" || normalizeAttachmentType(activeAttachmentEntry.type) === "linkedmesh"));
    els.slotAttachmentSequenceEnabled.disabled = !can;
  }
  if (els.slotAttachmentSequenceCount) {
    const seq = activeAttachmentEntry && activeAttachmentEntry.sequence ? activeAttachmentEntry.sequence : { count: 1 };
    els.slotAttachmentSequenceCount.value = String(Math.max(1, Math.round(Number(seq.count) || 1)));
    const can = !!(activeAttachmentEntry && (normalizeAttachmentType(activeAttachmentEntry.type) === "region" || normalizeAttachmentType(activeAttachmentEntry.type) === "mesh" || normalizeAttachmentType(activeAttachmentEntry.type) === "linkedmesh"));
    els.slotAttachmentSequenceCount.disabled = !can;
  }
  if (els.slotAttachmentSequenceStart) {
    const seq = activeAttachmentEntry && activeAttachmentEntry.sequence ? activeAttachmentEntry.sequence : { start: 0 };
    els.slotAttachmentSequenceStart.value = String(Math.max(0, Math.round(Number(seq.start) || 0)));
    const can = !!(activeAttachmentEntry && (normalizeAttachmentType(activeAttachmentEntry.type) === "region" || normalizeAttachmentType(activeAttachmentEntry.type) === "mesh" || normalizeAttachmentType(activeAttachmentEntry.type) === "linkedmesh"));
    els.slotAttachmentSequenceStart.disabled = !can;
  }
  if (els.slotAttachmentSequenceDigits) {
    const seq = activeAttachmentEntry && activeAttachmentEntry.sequence ? activeAttachmentEntry.sequence : { digits: 2 };
    els.slotAttachmentSequenceDigits.value = String(Math.max(1, Math.round(Number(seq.digits) || 2)));
    const can = !!(activeAttachmentEntry && (normalizeAttachmentType(activeAttachmentEntry.type) === "region" || normalizeAttachmentType(activeAttachmentEntry.type) === "mesh" || normalizeAttachmentType(activeAttachmentEntry.type) === "linkedmesh"));
    els.slotAttachmentSequenceDigits.disabled = !can;
  }
  if (els.slotClipEnabled) {
    els.slotClipEnabled.checked = !!(s && s.clipEnabled);
    els.slotClipEnabled.disabled = !s;
  }
  if (els.slotClipSource) {
    els.slotClipSource.value = s && s.clipSource === "contour" ? "contour" : "fill";
    els.slotClipSource.disabled = !s || !(s && s.clipEnabled);
  }
  if (els.slotClipEnd) {
    els.slotClipEnd.innerHTML = "";
    const none = document.createElement("option");
    none.value = "";
    none.textContent = "(to end)";
    els.slotClipEnd.appendChild(none);
    const activeIdx = Number(state.activeSlot);
    for (let i = 0; i < (state.slots || []).length; i += 1) {
      if (Number.isFinite(activeIdx) && activeIdx >= 0 && i <= activeIdx) continue;
      const sl = state.slots[i];
      if (!sl || !sl.id) continue;
      const opt = document.createElement("option");
      opt.value = String(sl.id);
      opt.textContent = sl.name || String(sl.id);
      els.slotClipEnd.appendChild(opt);
    }
    const endId = s && s.clipEndSlotId ? String(s.clipEndSlotId) : "";
    const hasEnd = endId && [...els.slotClipEnd.options].some((o) => o.value === endId);
    els.slotClipEnd.value = hasEnd ? endId : "";
    if (s && !hasEnd) s.clipEndSlotId = null;
    els.slotClipEnd.disabled = !s || !(s && s.clipEnabled);
  }
  if (els.slotClipSetKeyBtn) els.slotClipSetKeyBtn.disabled = !s || state.activeSlot < 0;
  if (els.slotClipDelKeyBtn) els.slotClipDelKeyBtn.disabled = !s || state.activeSlot < 0;
  if (els.slotClipSourceSetKeyBtn) els.slotClipSourceSetKeyBtn.disabled = !s || state.activeSlot < 0;
  if (els.slotClipSourceDelKeyBtn) els.slotClipSourceDelKeyBtn.disabled = !s || state.activeSlot < 0;
  if (els.slotClipComboSetKeyBtn) els.slotClipComboSetKeyBtn.disabled = !s || state.activeSlot < 0;
  if (els.slotClipEndSetKeyBtn) els.slotClipEndSetKeyBtn.disabled = !s || state.activeSlot < 0;
  if (els.slotClipEndDelKeyBtn) els.slotClipEndDelKeyBtn.disabled = !s || state.activeSlot < 0;
  if (els.slotBone) els.slotBone.value = String(s ? s.bone : -1);
  if (els.slotVisible) els.slotVisible.checked = !!(s ? isSlotEditorVisible(s) : true);
  if (els.slotAlpha) els.slotAlpha.value = String(s ? math.clamp(Number(s.alpha) || 1, 0, 1) : 1);
  if (els.slotColor) {
    els.slotColor.value = s ? rgb01ToHex(Number(s.r) || 1, Number(s.g) || 1, Number(s.b) || 1) : "#ffffff";
  }
  if (els.slotBlend) {
    els.slotBlend.value = s ? normalizeSlotBlendMode(s.blend) : "normal";
    els.slotBlend.disabled = !s;
  }
  if (els.slotDarkEnabled) {
    els.slotDarkEnabled.checked = !!(s && s.darkEnabled);
    els.slotDarkEnabled.disabled = !s;
  }
  if (els.slotDarkColor) {
    els.slotDarkColor.value = s ? rgb01ToHex(Number(s.dr) || 0, Number(s.dg) || 0, Number(s.db) || 0) : "#000000";
    els.slotDarkColor.disabled = !s || !(s && s.darkEnabled);
  }
  if (els.slotWeightMode) els.slotWeightMode.value = getSlotWeightMode(s);
  if (els.slotInfluenceBones && s && state.mesh) {
    const allow = new Set(getSlotInfluenceBones(s, state.mesh).map((x) => String(x)));
    for (const opt of els.slotInfluenceBones.options) {
      opt.selected = allow.has(opt.value);
    }
    els.slotInfluenceBones.disabled = getSlotWeightMode(s) !== "weighted";
  } else if (els.slotInfluenceBones) {
    els.slotInfluenceBones.disabled = true;
  }
  if (els.slotTx) els.slotTx.value = String(Math.round(s ? Number(s.tx) || 0 : 0));
  if (els.slotTy) els.slotTy.value = String(Math.round(s ? Number(s.ty) || 0 : 0));
  if (els.slotRot) els.slotRot.value = String(Math.round(math.radToDeg(s ? Number(s.rot) || 0 : 0)));
  refreshSkinUI();
  refreshDrawOrderUI();
  refreshRightPropsPanelVisibility();
  refreshBoneTreeFilterUI();
}

function getRightPropsFocus() {
  const preferred = state.rightPropsFocus === "bone" ? "bone" : "slot";
  const hasSlot = Number.isFinite(state.activeSlot) && state.activeSlot >= 0 && state.activeSlot < state.slots.length;
  const hasBone = !!(state.mesh && Number.isFinite(state.selectedBone) && state.selectedBone >= 0);
  if (preferred === "bone" && hasBone) return "bone";
  if (preferred === "slot" && hasSlot) return "slot";
  if (hasSlot) return "slot";
  if (hasBone) return "bone";
  return "slot";
}

function refreshRightPropsPanelVisibility() {
  const focus = getRightPropsFocus();
  const showBone = focus === "bone" && state.uiPage !== "slot";
  if (els.slotPropsGroup) els.slotPropsGroup.style.display = focus === "slot" ? "" : "none";
  if (els.bonePropsGroup) els.bonePropsGroup.style.display = showBone ? "" : "none";
}

function setRightPropsFocus(mode) {
  state.rightPropsFocus = mode === "bone" ? "bone" : "slot";
  refreshRightPropsPanelVisibility();
}

function updateWorkspaceUI() {
  const page = state.uiPage === "slot" || state.uiPage === "anim" ? state.uiPage : "rig";
  const sub = state.animSubPanel === "layers" || state.animSubPanel === "state" ? state.animSubPanel : "timeline";
  const animAuxMode = page === "anim" && (sub === "layers" || sub === "state");
  const isSlotMesh = state.editMode === "slotmesh";
  const setVisible = (el, show) => {
    if (!el) return;
    el.style.display = show ? "" : "none";
  };
  if (els.appRoot) {
    els.appRoot.classList.toggle("page-slot", page === "slot");
    els.appRoot.classList.toggle("page-rig", page === "rig");
    els.appRoot.classList.toggle("page-anim", page === "anim");
  }
  if (els.workspaceTabSlot) els.workspaceTabSlot.classList.toggle("active", page === "slot");
  if (els.workspaceTabRig) els.workspaceTabRig.classList.toggle("active", page === "rig");
  if (els.workspaceTabAnimate) els.workspaceTabAnimate.classList.toggle("active", page === "anim");
  if (els.editModeWrap) setVisible(els.editModeWrap, true);
  if (els.boneModeWrap) setVisible(els.boneModeWrap, page !== "slot");
  if (els.slotSelectWrap) setVisible(els.slotSelectWrap, true);
  if (els.slotViewWrap) setVisible(els.slotViewWrap, true);
  if (els.editMode) els.editMode.value = state.editMode;
  const isSkeleton = state.editMode === "skeleton";
  const isVertex = state.editMode === "vertex";
  const isRigEdit = !isSlotMesh && isSkeleton && state.boneMode === "edit";
  const isRigPose = !isSlotMesh && isSkeleton && state.boneMode === "pose";
  const isRigVertex = !isSlotMesh && isVertex;

  const tabVisible = {
    setup: page !== "slot" && !isSlotMesh && !animAuxMode,
    rig: page !== "slot" && isRigEdit && !animAuxMode,
    ik: page !== "slot" && !isSlotMesh && isSkeleton && !animAuxMode,
    constraint: page !== "slot" && !isSlotMesh && isSkeleton && !animAuxMode,
    path: page !== "slot" && !isSlotMesh && isSkeleton && !animAuxMode,
    skin: page !== "slot" && (isRigEdit || isRigVertex) && !animAuxMode,
    tools: page !== "slot" && !isSlotMesh && !animAuxMode,
    slotmesh: page === "slot" || isSlotMesh,
  };
  const visibleTabs = Object.keys(tabVisible).filter((k) => tabVisible[k]);
  if (!animAuxMode && !visibleTabs.includes(state.leftToolTab)) state.leftToolTab = visibleTabs[0] || "setup";

  const tabButtonById = {
    setup: els.leftTabSetup,
    rig: els.leftTabRig,
    ik: els.leftTabIK,
    constraint: els.leftTabConstraint,
    path: els.leftTabPath,
    skin: els.leftTabSkin,
    tools: els.leftTabTools,
    slotmesh: els.leftTabSlotMesh,
  };
  const tabPanelById = {
    setup: els.leftMeshSetup,
    rig: els.leftRigBuild,
    ik: els.leftIKTools,
    constraint: els.leftConstraintTools,
    path: els.leftPathTools,
    skin: els.leftSkinTools,
    tools: els.leftGeneralTools,
    slotmesh: els.slotMeshTools,
  };
  if (els.leftToolTabs) setVisible(els.leftToolTabs, !animAuxMode && visibleTabs.length > 1);
  for (const [tab, btn] of Object.entries(tabButtonById)) {
    const show = !!tabVisible[tab];
    setVisible(btn, show);
    if (btn) btn.classList.toggle("active", show && tab === state.leftToolTab);
  }
  for (const [tab, panel] of Object.entries(tabPanelById)) {
    setVisible(panel, !animAuxMode && !!tabVisible[tab] && tab === state.leftToolTab);
  }
  if (els.timelineDock) setVisible(els.timelineDock, page === "anim" && sub === "timeline");
  if (els.layerDock) els.layerDock.style.display = page === "anim" && sub === "layers" ? "flex" : "none";
  if (els.stateDock) els.stateDock.style.display = page === "anim" && sub === "state" ? "flex" : "none";
  if (els.timelineResizer) setVisible(els.timelineResizer, page === "anim");
  if (els.exportDock) els.exportDock.style.display = state.exportPanelOpen ? "flex" : "none";
  if (els.animSubTabTimeline) els.animSubTabTimeline.classList.toggle("active", page === "anim" && sub === "timeline");
  if (els.animSubTabLayers) els.animSubTabLayers.classList.toggle("active", page === "anim" && sub === "layers");
  if (els.animSubTabState) els.animSubTabState.classList.toggle("active", page === "anim" && sub === "state");
  if (els.animateSubTabs) setVisible(els.animateSubTabs, page === "anim");
  refreshRightPropsPanelVisibility();

  if (els.leftToolModeHint) {
    if (page === "slot") {
      els.leftToolModeHint.textContent = "Slot Build page: import image/attachments and edit slot mesh.";
    } else if (page === "anim" && sub === "layers") {
      els.leftToolModeHint.textContent = "Animate > Animation Layers: tools are shown below in Canvas Tools.";
    } else if (page === "anim" && sub === "state") {
      els.leftToolModeHint.textContent = "Animate > State Machine: tools are shown below in Canvas Tools.";
    } else if (isSlotMesh) {
      els.leftToolModeHint.textContent = "Slot Mesh mode: only slot mesh related tabs are shown.";
    } else if (isRigEdit) {
      els.leftToolModeHint.textContent = "Rig Edit mode: rig, IK, constraint, path, skin, and tools tabs are shown.";
    } else if (isRigPose) {
      els.leftToolModeHint.textContent = "Pose mode: IK, constraint, path, setup, and tools tabs are shown.";
    } else if (isRigVertex) {
      els.leftToolModeHint.textContent = "Vertex mode: skin/tools tabs are shown.";
    } else {
      els.leftToolModeHint.textContent = "Mode-aware tabs";
    }
  }
  refreshVertexDeformUI();
}

function setWorkspacePage(page) {
  const next = page === "slot" || page === "anim" ? page : "rig";
  state.uiPage = next;
  if (next === "slot") {
    state.editMode = "slotmesh";
    state.leftToolTab = "slotmesh";
  } else if (state.editMode === "slotmesh") {
    state.editMode = "skeleton";
    if (state.leftToolTab === "slotmesh") state.leftToolTab = "setup";
  }
  if (els.editMode) els.editMode.value = state.editMode;
  state.workspaceMode = state.editMode === "slotmesh" ? "slotmesh" : "rig";
  if (state.editMode !== "skeleton") state.pathEdit.drawArmed = false;
  if (next !== "anim") {
    state.animSubPanel = "timeline";
    state.exportPanelOpen = false;
  }
  updateWorkspaceUI();
  renderTimelineTracks();
}

function setupLeftToolTabs() {
  const bind = (el, tab) => {
    if (!el) return;
    el.addEventListener("click", () => {
      state.leftToolTab = tab;
      updateWorkspaceUI();
    });
  };
  bind(els.leftTabSetup, "setup");
  bind(els.leftTabRig, "rig");
  bind(els.leftTabIK, "ik");
  bind(els.leftTabConstraint, "constraint");
  bind(els.leftTabPath, "path");
  bind(els.leftTabSkin, "skin");
  bind(els.leftTabTools, "tools");
  bind(els.leftTabSlotMesh, "slotmesh");
}

function setupWorkspaceTabs() {
  const bind = (el, page) => {
    if (!el) return;
    el.addEventListener("click", () => {
      setWorkspacePage(page);
    });
  };
  bind(els.workspaceTabSlot, "slot");
  bind(els.workspaceTabRig, "rig");
  bind(els.workspaceTabAnimate, "anim");
}

function setupAnimateSubTabs() {
  const bind = (el, panel) => {
    if (!el) return;
    el.addEventListener("click", () => {
      setWorkspacePage("anim");
      state.animSubPanel = panel;
      updateWorkspaceUI();
      renderTimelineTracks();
      if ((panel === "layers" || panel === "state") && els.leftTools) {
        els.leftTools.scrollTop = 0;
      }
    });
  };
  bind(els.animSubTabTimeline, "timeline");
  bind(els.animSubTabLayers, "layers");
  bind(els.animSubTabState, "state");
  if (els.openExportPanelBtn) {
    els.openExportPanelBtn.addEventListener("click", () => {
      setWorkspacePage("anim");
      state.animSubPanel = "timeline";
      state.exportPanelOpen = !state.exportPanelOpen;
      updateWorkspaceUI();
    });
  }
}

function mountAnimateAuxPanelsInLeftTools() {
  if (!els.leftTools) return;
  const anchor = els.leftToolTabs || els.leftMeshSetup || null;
  if (els.stateDock && els.stateDock.parentElement !== els.leftTools) {
    if (anchor) els.leftTools.insertBefore(els.stateDock, anchor);
    else els.leftTools.appendChild(els.stateDock);
  }
  if (els.layerDock && els.layerDock.parentElement !== els.leftTools) {
    if (anchor) els.leftTools.insertBefore(els.layerDock, anchor);
    else els.leftTools.appendChild(els.layerDock);
  }
}

function setActiveSlot(index) {
  if (!Number.isFinite(index) || index < 0 || index >= state.slots.length) return;
  state.activeSlot = index;
  setRightPropsFocus("slot");
  const slot = state.slots[index];
  ensureSlotContour(slot);
  state.slotMesh.activePoint = -1;
  state.slotMesh.activeSet = "contour";
  state.slotMesh.edgeSelection = [];
  state.slotMesh.edgeSelectionSet = "contour";
  state.sourceCanvas = slot.canvas;
  state.imageWidth = Number.isFinite(slot.docWidth) ? slot.docWidth : slot.canvas.width;
  state.imageHeight = Number.isFinite(slot.docHeight) ? slot.docHeight : slot.canvas.height;
  updateTexture();
  refreshSlotUI();
  renderBoneTree();
}

function addSlotEntry(entry, activate = true) {
  const hasProjectSize = state.imageWidth > 0 && state.imageHeight > 0;
  const docW = Number.isFinite(entry.docWidth) ? entry.docWidth : entry.canvas.width;
  const docH = Number.isFinite(entry.docHeight) ? entry.docHeight : entry.canvas.height;
  const targetW = hasProjectSize ? state.imageWidth : docW;
  const targetH = hasProjectSize ? state.imageHeight : docH;
  const sx = docW > 0 ? targetW / docW : 1;
  const sy = docH > 0 ? targetH / docH : 1;
  const srcRect = entry.rect || { x: 0, y: 0, w: docW, h: docH };
  const rect = {
    x: srcRect.x * sx,
    y: srcRect.y * sy,
    w: Math.max(1, srcRect.w * sx),
    h: Math.max(1, srcRect.h * sy),
  };
  const canvas = normalizeSlotCanvas(entry.canvas, Math.max(1, rect.w), Math.max(1, rect.h));
  const defaultBone = state.mesh && state.selectedBone >= 0 ? state.selectedBone : -1;
  const slot = {
    id: entry.id || makeSlotId(),
    name: entry.name || `slot_${state.slots.length}`,
    attachmentName: String(entry.attachmentName || "main"),
    placeholderName: String(entry.placeholderName || entry.attachmentName || "main"),
    activeAttachment:
      entry && Object.prototype.hasOwnProperty.call(entry, "activeAttachment")
        ? entry.activeAttachment == null
          ? null
          : String(entry.activeAttachment)
        : String(entry.attachmentName || "main"),
    editorVisible:
      entry && Object.prototype.hasOwnProperty.call(entry, "editorVisible") ? entry.editorVisible !== false : entry.visible !== false,
    canvas,
    bone: Number.isFinite(entry.bone) ? entry.bone : defaultBone,
    visible: entry.visible !== false,
    alpha: Number.isFinite(entry.alpha) ? math.clamp(entry.alpha, 0, 1) : 1,
    r: Number.isFinite(entry.r) ? math.clamp(entry.r, 0, 1) : 1,
    g: Number.isFinite(entry.g) ? math.clamp(entry.g, 0, 1) : 1,
    b: Number.isFinite(entry.b) ? math.clamp(entry.b, 0, 1) : 1,
    blend: normalizeSlotBlendMode(entry && entry.blend),
    darkEnabled: !!(entry && entry.darkEnabled),
    dr: Number.isFinite(entry && entry.dr) ? math.clamp(entry.dr, 0, 1) : 0,
    dg: Number.isFinite(entry && entry.dg) ? math.clamp(entry.dg, 0, 1) : 0,
    db: Number.isFinite(entry && entry.db) ? math.clamp(entry.db, 0, 1) : 0,
    tx: Number.isFinite(entry.tx) ? entry.tx : 0,
    ty: Number.isFinite(entry.ty) ? entry.ty : 0,
    rot: Number.isFinite(entry.rot) ? entry.rot : 0,
    rect,
    docWidth: targetW,
    docHeight: targetH,
    _indices: null,
    meshData: null,
    attachments: Array.isArray(entry.attachments)
      ? entry.attachments
          .map((a) => ({
            name: String(a && a.name ? a.name : "").trim(),
            placeholder: String(a && a.placeholder ? a.placeholder : entry.placeholderName || entry.attachmentName || "main").trim(),
            canvas: a && a.canvas ? normalizeSlotCanvas(a.canvas, Math.max(1, rect.w), Math.max(1, rect.h)) : canvas,
            type: normalizeAttachmentType(a && a.type),
            linkedParent: a && a.linkedParent != null ? String(a.linkedParent) : "",
            pointX: Number(a && a.pointX) || 0,
            pointY: Number(a && a.pointY) || 0,
            pointRot: Number(a && a.pointRot) || 0,
            bboxSource: a && a.bboxSource === "contour" ? "contour" : "fill",
            sequence:
              a && a.sequence
                ? {
                    enabled: !!a.sequence.enabled,
                    count: Math.max(1, Math.round(Number(a.sequence.count) || 1)),
                    start: Math.max(0, Math.round(Number(a.sequence.start) || 0)),
                    digits: Math.max(1, Math.round(Number(a.sequence.digits) || 2)),
                  }
                : { enabled: false, count: 1, start: 0, digits: 2 },
          }))
          .filter((a) => a.name.length > 0 && (a.canvas || a.type === "point" || a.type === "boundingbox"))
      : [
          {
            name: String(entry.attachmentName || "main"),
            placeholder: String(entry.placeholderName || entry.attachmentName || "main"),
            canvas,
            type: "region",
            linkedParent: "",
            pointX: 0,
            pointY: 0,
            pointRot: 0,
            bboxSource: "fill",
            sequence: { enabled: false, count: 1, start: 0, digits: 2 },
          },
        ],
    useWeights: entry.useWeights === true,
    weightBindMode: entry.weightBindMode || (entry.useWeights ? "single" : "none"),
    weightMode:
      entry.weightMode ||
      (entry.weightBindMode === "auto" ? "weighted" : entry.useWeights === false ? "free" : "single"),
    influenceBones: Array.isArray(entry.influenceBones) ? entry.influenceBones.filter((v) => Number.isFinite(v)) : [],
    clipEnabled: !!entry.clipEnabled,
    clipSource: entry && entry.clipSource === "contour" ? "contour" : "fill",
    clipEndSlotId:
      entry && Object.prototype.hasOwnProperty.call(entry, "clipEndSlotId")
        ? entry.clipEndSlotId == null
          ? null
          : String(entry.clipEndSlotId)
        : null,
  };
  if (state.mesh) {
    slot.meshData = createSlotMeshData(rect, targetW, targetH, state.mesh.cols, state.mesh.rows);
    rebuildSlotWeights(slot, state.mesh);
  }
  ensureSlotAttachments(slot);
  ensureSlotAttachmentState(slot);
  ensureSlotClipState(slot);
  ensureSlotVisualState(slot);
  state.slots.push(slot);
  rebuildSlotTriangleIndices();
  if (activate) setActiveSlot(state.slots.length - 1);
}

function buildEmptySlotEntryForQuickAdd() {
  const source = getActiveSlot();
  const projectW = Math.max(
    1,
    Math.round(
      Number(state.imageWidth) ||
        Number(source && source.docWidth) ||
        Number(source && source.canvas && source.canvas.width) ||
        512
    )
  );
  const projectH = Math.max(
    1,
    Math.round(
      Number(state.imageHeight) ||
        Number(source && source.docHeight) ||
        Number(source && source.canvas && source.canvas.height) ||
        512
    )
  );
  const rectW = Math.max(
    1,
    Math.round(Number(source && source.rect && source.rect.w) || Math.min(256, projectW))
  );
  const rectH = Math.max(
    1,
    Math.round(Number(source && source.rect && source.rect.h) || Math.min(256, projectH))
  );
  const rectXBase = Number(source && source.rect && source.rect.x) || 0;
  const rectYBase = Number(source && source.rect && source.rect.y) || 0;
  const selectedBone = getPrimarySelectedBoneIndex();
  const sourceBone = Number(source && source.bone);
  const bindBone =
    Number.isFinite(selectedBone) && selectedBone >= 0
      ? selectedBone
      : Number.isFinite(sourceBone) && sourceBone >= 0
        ? sourceBone
        : -1;
  const canvas = makeCanvas(rectW, rectH);
  const placeholder = "main";
  const baseName = source && source.name ? `${source.name}_slot` : "slot";
  return {
    name: makeUniqueSlotName(baseName),
    canvas,
    docWidth: projectW,
    docHeight: projectH,
    rect: {
      x: rectXBase + 8,
      y: rectYBase + 8,
      w: rectW,
      h: rectH,
    },
    attachmentName: "main",
    placeholderName: placeholder,
    activeAttachment: "main",
    editorVisible: true,
    visible: true,
    bone: bindBone,
    alpha: 1,
    r: 1,
    g: 1,
    b: 1,
    blend: "normal",
    darkEnabled: false,
    dr: 0,
    dg: 0,
    db: 0,
    tx: Number(source && source.tx) || 0,
    ty: Number(source && source.ty) || 0,
    rot: Number(source && source.rot) || 0,
    useWeights: bindBone >= 0,
    weightBindMode: bindBone >= 0 ? "single" : "none",
    weightMode: bindBone >= 0 ? "single" : "free",
    influenceBones: bindBone >= 0 ? [bindBone] : [],
    clipEnabled: false,
    clipSource: "fill",
    clipEndSlotId: null,
    attachments: [
      {
        name: "main",
        placeholder,
        canvas,
        type: "region",
        linkedParent: "",
        pointX: 0,
        pointY: 0,
        pointRot: 0,
        bboxSource: "fill",
        sequence: { enabled: false, count: 1, start: 0, digits: 2 },
      },
    ],
  };
}

function addEmptySlotQuick() {
  if (!state.mesh && state.slots.length === 0 && !state.sourceCanvas) return null;
  const entry = buildEmptySlotEntryForQuickAdd();
  addSlotEntry(entry, true);
  refreshAnimationUI();
  return getActiveSlot();
}

function cloneCanvasLike(src) {
  if (!src) return null;
  const out = makeCanvas(src.width, src.height);
  const ctx = out.getContext("2d");
  if (ctx) ctx.drawImage(src, 0, 0);
  return out;
}

function cloneSlotContourData(src) {
  const c = src && typeof src === "object" ? src : {};
  const clonePoints = (arr) =>
    Array.isArray(arr) ? arr.map((p) => ({ x: Number(p && p.x) || 0, y: Number(p && p.y) || 0 })) : [];
  const cloneEdges = (arr) =>
    Array.isArray(arr)
      ? arr
          .filter((e) => Array.isArray(e) && e.length >= 2)
          .map((e) => [Number(e[0]) || 0, Number(e[1]) || 0])
      : [];
  return {
    points: clonePoints(c.points),
    closed: !!c.closed,
    triangles: Array.isArray(c.triangles) ? c.triangles.map((v) => Number(v) || 0) : [],
    fillPoints: clonePoints(c.fillPoints),
    fillTriangles: Array.isArray(c.fillTriangles) ? c.fillTriangles.map((v) => Number(v) || 0) : [],
    manualEdges: cloneEdges(c.manualEdges),
    fillManualEdges: cloneEdges(c.fillManualEdges),
  };
}

function cloneSlotMeshData(src) {
  if (!src || typeof src !== "object") return null;
  return {
    cols: Number(src.cols) || 0,
    rows: Number(src.rows) || 0,
    positions: src.positions ? new Float32Array(src.positions) : new Float32Array(0),
    uvs: src.uvs ? new Float32Array(src.uvs) : new Float32Array(0),
    offsets: src.offsets ? new Float32Array(src.offsets) : new Float32Array(0),
    baseOffsets: src.baseOffsets ? new Float32Array(src.baseOffsets) : src.offsets ? new Float32Array(src.offsets) : new Float32Array(0),
    weights: src.weights ? new Float32Array(src.weights) : new Float32Array(0),
    indices: src.indices ? new Uint16Array(src.indices) : new Uint16Array(0),
    deformedScreen: null,
    interleaved: null,
  };
}

function duplicateActiveSlotQuick() {
  const source = getActiveSlot();
  if (!source) return null;
  ensureSlotAttachmentState(source);
  const rect = source.rect || { x: 0, y: 0, w: source.canvas ? source.canvas.width : 1, h: source.canvas ? source.canvas.height : 1 };
  const canvasMap = new Map();
  const getClonedCanvas = (cv) => {
    if (!cv) return null;
    if (canvasMap.has(cv)) return canvasMap.get(cv);
    const copied = cloneCanvasLike(cv);
    canvasMap.set(cv, copied);
    return copied;
  };
  const sourceCanvasClone = getClonedCanvas(source.canvas) || makeCanvas(Math.max(1, Number(rect.w) || 1), Math.max(1, Number(rect.h) || 1));
  const entry = {
    name: makeUniqueSlotName(`${source.name || "slot"}_copy`),
    attachmentName: String(source.attachmentName || "main"),
    placeholderName: String(source.placeholderName || source.attachmentName || "main"),
    activeAttachment:
      Object.prototype.hasOwnProperty.call(source, "activeAttachment")
        ? source.activeAttachment == null
          ? null
          : String(source.activeAttachment)
        : String(source.attachmentName || "main"),
    editorVisible: isSlotEditorVisible(source),
    canvas: sourceCanvasClone,
    bone: Number(source.bone),
    visible: source.visible !== false,
    alpha: Number(source.alpha),
    r: Number(source.r),
    g: Number(source.g),
    b: Number(source.b),
    blend: normalizeSlotBlendMode(source.blend),
    darkEnabled: !!source.darkEnabled,
    dr: Number(source.dr),
    dg: Number(source.dg),
    db: Number(source.db),
    tx: Number(source.tx) || 0,
    ty: Number(source.ty) || 0,
    rot: Number(source.rot) || 0,
    rect: {
      x: Number(rect.x) || 0,
      y: Number(rect.y) || 0,
      w: Math.max(1, Number(rect.w) || 1),
      h: Math.max(1, Number(rect.h) || 1),
    },
    docWidth: Number(source.docWidth) || Math.max(1, Number(state.imageWidth) || sourceCanvasClone.width),
    docHeight: Number(source.docHeight) || Math.max(1, Number(state.imageHeight) || sourceCanvasClone.height),
    useWeights: source.useWeights === true,
    weightBindMode: source.weightBindMode || "none",
    weightMode: source.weightMode || getSlotWeightMode(source),
    influenceBones: Array.isArray(source.influenceBones) ? source.influenceBones.filter((v) => Number.isFinite(v)) : [],
    clipEnabled: !!source.clipEnabled,
    clipSource: source.clipSource === "contour" ? "contour" : "fill",
    clipEndSlotId:
      Object.prototype.hasOwnProperty.call(source, "clipEndSlotId")
        ? source.clipEndSlotId == null
          ? null
          : String(source.clipEndSlotId)
        : null,
    attachments: ensureSlotAttachments(source).map((a) => ({
      name: String(a && a.name ? a.name : "").trim(),
      placeholder: String(a && a.placeholder ? a.placeholder : source.placeholderName || source.attachmentName || "main").trim(),
      canvas: getClonedCanvas(a && a.canvas) || sourceCanvasClone,
      type: normalizeAttachmentType(a && a.type),
      linkedParent: a && a.linkedParent != null ? String(a.linkedParent) : "",
      pointX: Number(a && a.pointX) || 0,
      pointY: Number(a && a.pointY) || 0,
      pointRot: Number(a && a.pointRot) || 0,
      bboxSource: a && a.bboxSource === "contour" ? "contour" : "fill",
      sequence:
        a && a.sequence
          ? {
              enabled: !!a.sequence.enabled,
              count: Math.max(1, Math.round(Number(a.sequence.count) || 1)),
              start: Math.max(0, Math.round(Number(a.sequence.start) || 0)),
              digits: Math.max(1, Math.round(Number(a.sequence.digits) || 2)),
            }
          : { enabled: false, count: 1, start: 0, digits: 2 },
    })),
  };
  addSlotEntry(entry, true);
  const dst = getActiveSlot();
  if (!dst) return null;
  dst.meshContour = cloneSlotContourData(source.meshContour);
  if (source.meshData) {
    dst.meshData = cloneSlotMeshData(source.meshData);
  } else if (state.mesh) {
    ensureSlotMeshData(dst, state.mesh);
    rebuildSlotWeights(dst, state.mesh);
  }
  ensureSlotClipState(dst);
  ensureSlotVisualState(dst);
  rebuildSlotTriangleIndices();
  refreshSlotUI();
  renderBoneTree();
  refreshAnimationUI();
  return dst;
}

function remapTrackIdAfterSlotRemoved(trackId, removedSlotIndex) {
  const parsed = parseTrackId(trackId);
  if (!parsed) return trackId;
  if (parsed.type === "slot") {
    const si = Number(parsed.slotIndex);
    if (!Number.isFinite(si)) return trackId;
    if (si === removedSlotIndex) return null;
    return getSlotTrackId(si > removedSlotIndex ? si - 1 : si, parsed.prop);
  }
  if (parsed.type === "vertex" && Number.isFinite(parsed.slotIndex)) {
    const si = Number(parsed.slotIndex);
    if (si === removedSlotIndex) return null;
    return getVertexTrackId(si > removedSlotIndex ? si - 1 : si);
  }
  return trackId;
}

function remapAnimationTracksForRemovedSlot(removedSlotIndex, removedSlotId) {
  const removedId = removedSlotId == null ? "" : String(removedSlotId);
  for (const anim of state.anim.animations || []) {
    if (!anim || !anim.tracks || typeof anim.tracks !== "object") continue;
    const outTracks = {};
    for (const [trackId, rawKeys] of Object.entries(anim.tracks)) {
      const nextTrackId = remapTrackIdAfterSlotRemoved(trackId, removedSlotIndex);
      if (!nextTrackId) continue;
      const parsed = parseTrackId(trackId);
      const keys = Array.isArray(rawKeys) ? rawKeys : [];
      const remappedKeys = [];
      for (const src of keys) {
        if (!src || typeof src !== "object") continue;
        const row = { ...src };
        if (trackId === VERTEX_TRACK_ID || (parsed && parsed.type === "vertex" && !Number.isFinite(parsed.slotIndex))) {
          const ksi = Number(row.slotIndex);
          if (Number.isFinite(ksi)) {
            if (ksi === removedSlotIndex) continue;
            if (ksi > removedSlotIndex) row.slotIndex = ksi - 1;
          }
        }
        if (trackId === DRAWORDER_TRACK_ID && Array.isArray(row.value) && removedId) {
          row.value = row.value.map((v) => String(v)).filter((id) => id !== removedId);
        }
        if (parsed && parsed.type === "slot" && parsed.prop === "clipEnd" && removedId) {
          if (row.value != null && String(row.value) === removedId) row.value = "";
        }
        remappedKeys.push(row);
      }
      if (remappedKeys.length <= 0) continue;
      if (!outTracks[nextTrackId]) outTracks[nextTrackId] = [];
      outTracks[nextTrackId].push(...remappedKeys);
    }
    anim.tracks = outTracks;
    for (const trackId of Object.keys(anim.tracks)) {
      normalizeTrackKeys(anim, trackId);
    }
  }
}

function removeSlotReferencesFromSkins(removedSlotId) {
  const sid = removedSlotId == null ? "" : String(removedSlotId);
  if (!sid) return;
  for (const skin of ensureSkinSets()) {
    if (!skin || typeof skin !== "object") continue;
    if (skin.slotAttachments && typeof skin.slotAttachments === "object") {
      delete skin.slotAttachments[sid];
    }
    if (skin.slotPlaceholderAttachments && typeof skin.slotPlaceholderAttachments === "object") {
      delete skin.slotPlaceholderAttachments[sid];
    }
  }
}

function deleteActiveSlotQuick() {
  if (!Array.isArray(state.slots) || state.slots.length <= 0) return null;
  const idxRaw = Number(state.activeSlot);
  const idx = Number.isFinite(idxRaw) && idxRaw >= 0 && idxRaw < state.slots.length ? idxRaw : state.slots.length - 1;
  const removed = state.slots[idx];
  const removedId = removed && removed.id ? String(removed.id) : "";
  state.slots.splice(idx, 1);
  removeSlotReferencesFromSkins(removedId);
  remapAnimationTracksForRemovedSlot(idx, removedId);
  if (removedId) {
    for (const s of state.slots) {
      if (!s) continue;
      if (s.clipEndSlotId && String(s.clipEndSlotId) === removedId) s.clipEndSlotId = null;
    }
  }
  clearTimelineKeySelection();
  state.anim.selectedTrack = "";
  state.anim.dirtyTracks = [];
  if (state.slots.length > 0) {
    setActiveSlot(Math.max(0, Math.min(idx, state.slots.length - 1)));
    ensureSlotsHaveBoneBinding();
  } else {
    state.activeSlot = -1;
    state.sourceCanvas = null;
    refreshSlotUI();
    renderBoneTree();
  }
  refreshAnimationUI();
  return removed || null;
}

function assignSlotToBone(slotIndex, boneIndex) {
  const si = Number(slotIndex);
  const bi = Number(boneIndex);
  const m = state.mesh;
  if (!Number.isFinite(si) || si < 0 || si >= state.slots.length) return false;
  const slot = state.slots[si];
  if (!slot) return false;
  const ok = applySlotBoneAssignment(slot, bi, m);
  if (!ok) return false;
  if (state.activeSlot === si) refreshSlotUI();
  renderBoneTree();
  return true;
}

function applySlotBoneAssignment(slot, boneIndex, mesh = state.mesh) {
  const bi = Number(boneIndex);
  const m = mesh;
  if (!slot) return false;
  if (!m || !Array.isArray(m.rigBones) || m.rigBones.length <= 0) return false;
  if (!Number.isFinite(bi) || bi < 0 || bi >= m.rigBones.length) return false;
  slot.bone = bi;
  const mode = getSlotWeightMode(slot);
  if (mode === "single") {
    slot.weightMode = "single";
    slot.weightBindMode = "single";
    slot.useWeights = true;
    slot.influenceBones = [bi];
  } else if (mode === "weighted") {
    slot.weightMode = "weighted";
    slot.weightBindMode = "auto";
    slot.useWeights = true;
    const current = Array.isArray(slot.influenceBones) ? slot.influenceBones.filter((v) => Number.isFinite(v)) : [];
    slot.influenceBones = current.length > 0 ? current : [bi];
  }
  rebuildSlotWeights(slot, m);
  return true;
}

function moveSlotToIndex(sourceIndex, insertIndex) {
  const from = Number(sourceIndex);
  const rawInsert = Number(insertIndex);
  if (!Number.isFinite(from) || !Number.isFinite(rawInsert)) return from;
  if (from < 0 || from >= state.slots.length) return from;
  const len = state.slots.length;
  let insert = math.clamp(Math.round(rawInsert), 0, len);
  // Same visual position (drop before itself / after itself) -> no-op.
  if (insert === from || insert === from + 1) return from;
  const [moved] = state.slots.splice(from, 1);
  if (!moved) return from;
  if (from < insert) insert -= 1;
  insert = math.clamp(insert, 0, state.slots.length);
  state.slots.splice(insert, 0, moved);

  const active = Number(state.activeSlot);
  if (Number.isFinite(active) && active >= 0 && active < len) {
    if (active === from) {
      state.activeSlot = insert;
    } else if (from < active && active <= insert) {
      state.activeSlot = active - 1;
    } else if (insert <= active && active < from) {
      state.activeSlot = active + 1;
    }
  }
  return insert;
}

function clearBoneTreeDropIndicators() {
  if (!els.boneTree) return;
  for (const row of els.boneTree.querySelectorAll(".tree-item.drop-target")) {
    row.classList.remove("drop-target");
    row.classList.remove("drop-before");
    row.classList.remove("drop-after");
  }
}

function setBoneTreeDropIndicator(boneIndex) {
  clearBoneTreeDropIndicators();
  if (!els.boneTree) return;
  const idx = Number(boneIndex);
  if (!Number.isFinite(idx) || idx < 0) return;
  const row = els.boneTree.querySelector(`.tree-item[data-bone-index="${idx}"]`);
  if (row) row.classList.add("drop-target");
}

function setBoneTreeSlotDropIndicator(slotIndex, placeAfter) {
  clearBoneTreeDropIndicators();
  if (!els.boneTree) return;
  const idx = Number(slotIndex);
  if (!Number.isFinite(idx) || idx < 0) return;
  const row = els.boneTree.querySelector(`.tree-item[data-slot-index="${idx}"]`);
  if (!row) return;
  row.classList.add("drop-target");
  row.classList.add(placeAfter ? "drop-after" : "drop-before");
}

function renameSlotByIndexFromTree(slotIndex) {
  const si = Number(slotIndex);
  return startBoneTreeInlineRename("slot", si);
}

function openLoadImageForActiveSlotFromTree() {
  const slot = getActiveSlot();
  if (!slot) return false;
  ensureSlotAttachmentState(slot);
  ensureSlotAttachments(slot);
  let current = getSlotCurrentAttachmentName(slot);
  if (!current) {
    current = String(slot.attachmentName || (slot.attachments[0] && slot.attachments[0].name) || "").trim();
    if (!current) return false;
    slot.activeAttachment = current;
  }
  refreshSlotUI();
  if (!els.slotAttachmentFileInput) return false;
  els.slotAttachmentFileInput.click();
  return true;
}

function refreshBoneTreeContextMenuUI() {
  const active = getActiveSlot();
  if (els.treeCtxSlotAddBtn) {
    els.treeCtxSlotAddBtn.disabled = !state.mesh && state.slots.length === 0 && !state.sourceCanvas;
  }
  if (els.treeCtxSlotDupBtn) {
    els.treeCtxSlotDupBtn.disabled = !active;
  }
  if (els.treeCtxSlotRenameBtn) {
    els.treeCtxSlotRenameBtn.disabled = !active;
  }
  if (els.treeCtxSlotDeleteBtn) {
    els.treeCtxSlotDeleteBtn.disabled = !active;
  }
  if (els.treeCtxSlotLoadImageBtn) {
    els.treeCtxSlotLoadImageBtn.disabled = !active;
  }
}

function closeBoneTreeContextMenu() {
  state.boneTreeMenuOpen = false;
  if (els.boneTreeContextMenu) {
    els.boneTreeContextMenu.classList.add("collapsed");
  }
}

function openBoneTreeContextMenu(clientX, clientY) {
  if (!els.boneTreeContextMenu) return;
  refreshBoneTreeContextMenuUI();
  els.boneTreeContextMenu.classList.remove("collapsed");
  state.boneTreeMenuOpen = true;
  const menuRect = els.boneTreeContextMenu.getBoundingClientRect();
  const vw = window.innerWidth || document.documentElement.clientWidth || 0;
  const vh = window.innerHeight || document.documentElement.clientHeight || 0;
  const margin = 8;
  let left = Number(clientX) || 0;
  let top = Number(clientY) || 0;
  if (left + menuRect.width + margin > vw) left = Math.max(margin, vw - menuRect.width - margin);
  if (top + menuRect.height + margin > vh) top = Math.max(margin, vh - menuRect.height - margin);
  els.boneTreeContextMenu.style.left = `${Math.round(left)}px`;
  els.boneTreeContextMenu.style.top = `${Math.round(top)}px`;
}

function normalizeSlotBlendMode(mode) {
  const v = String(mode || "").toLowerCase();
  if (v === "additive") return "additive";
  if (v === "multiply") return "multiply";
  if (v === "screen") return "screen";
  return "normal";
}

function ensureSlotVisualState(slot) {
  if (!slot) return;
  slot.blend = normalizeSlotBlendMode(slot.blend);
  slot.darkEnabled = !!slot.darkEnabled;
  slot.dr = math.clamp(Number(slot.dr) || 0, 0, 1);
  slot.dg = math.clamp(Number(slot.dg) || 0, 0, 1);
  slot.db = math.clamp(Number(slot.db) || 0, 0, 1);
}

function getCanvasCompositeForBlendMode(mode) {
  const v = normalizeSlotBlendMode(mode);
  if (v === "additive") return "lighter";
  if (v === "multiply") return "multiply";
  if (v === "screen") return "screen";
  return "source-over";
}

function applyGLBlendMode(mode) {
  if (!hasGL || !gl) return;
  const v = normalizeSlotBlendMode(mode);
  if (v === "additive") {
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    return;
  }
  if (v === "multiply") {
    gl.blendFunc(gl.DST_COLOR, gl.ONE_MINUS_SRC_ALPHA);
    return;
  }
  if (v === "screen") {
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_COLOR);
    return;
  }
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
}

function getActiveSlot() {
  if (state.activeSlot < 0 || state.activeSlot >= state.slots.length) return null;
  return state.slots[state.activeSlot];
}

function makeUniqueSlotName(base) {
  const used = new Set((state.slots || []).map((s) => (s && s.name ? s.name : "")));
  const stem = (base || "slot").trim() || "slot";
  if (!used.has(stem)) return stem;
  let i = 1;
  let next = `${stem}_${i}`;
  while (used.has(next)) {
    i += 1;
    next = `${stem}_${i}`;
  }
  return next;
}

function ensureSlotAttachmentState(slot) {
  if (!slot) return null;
  const base = String(slot.attachmentName || "main").trim() || "main";
  slot.attachmentName = base;
  const ph = String(slot.placeholderName || slot.attachmentName || "main").trim() || "main";
  slot.placeholderName = ph;
  if (!("activeAttachment" in slot)) {
    slot.activeAttachment = base;
  }
  if (slot.activeAttachment != null) {
    const name = String(slot.activeAttachment).trim();
    slot.activeAttachment = name.length > 0 ? name : base;
  }
  return slot.activeAttachment != null ? String(slot.activeAttachment) : null;
}

function normalizeAttachmentType(type) {
  const t = String(type || "").toLowerCase();
  if (t === "mesh") return "mesh";
  if (t === "linkedmesh") return "linkedmesh";
  if (t === "boundingbox") return "boundingbox";
  if (t === "point") return "point";
  return "region";
}

function normalizeSlotAttachmentRecord(slot, a, fallbackName, fallbackPlaceholder, fallbackCanvas) {
  const rec = a && typeof a === "object" ? a : {};
  const name = String(rec.name || fallbackName || "att").trim() || String(fallbackName || "att");
  const placeholder = String(rec.placeholder || fallbackPlaceholder || "main").trim() || "main";
  const type = normalizeAttachmentType(rec.type);
  const out = {
    name,
    placeholder,
    type,
    canvas: rec.canvas || fallbackCanvas || null,
    linkedParent: rec && rec.linkedParent != null ? String(rec.linkedParent) : "",
    pointX: Number(rec && rec.pointX) || 0,
    pointY: Number(rec && rec.pointY) || 0,
    pointRot: Number(rec && rec.pointRot) || 0,
    bboxSource: rec && rec.bboxSource === "contour" ? "contour" : "fill",
    sequence:
      rec && rec.sequence && typeof rec.sequence === "object"
        ? {
            enabled: !!rec.sequence.enabled,
            count: Math.max(1, Math.round(Number(rec.sequence.count) || 1)),
            start: Math.max(0, Math.round(Number(rec.sequence.start) || 0)),
            digits: Math.max(1, Math.round(Number(rec.sequence.digits) || 2)),
          }
        : { enabled: false, count: 1, start: 0, digits: 2 },
  };
  if ((out.type === "region" || out.type === "mesh" || out.type === "linkedmesh") && !out.canvas) {
    out.canvas = slot && slot.canvas ? slot.canvas : null;
  }
  return out;
}

function ensureSlotAttachments(slot) {
  if (!slot) return [];
  const base = String(slot.attachmentName || "main").trim() || "main";
  const basePh = String(slot.placeholderName || base || "main").trim() || "main";
  if (!Array.isArray(slot.attachments) || slot.attachments.length === 0) {
    slot.attachments = [normalizeSlotAttachmentRecord(slot, { name: String(slot.attachmentName || "main"), placeholder: basePh, canvas: slot.canvas }, base, basePh, slot.canvas)];
  }
  const out = [];
  const used = new Set();
  for (const a of slot.attachments) {
    const rawName = String(a && a.name ? a.name : "").trim();
    let name = rawName || `att_${out.length}`;
    if (used.has(name)) {
      let i = 2;
      let next = `${name}_${i}`;
      while (used.has(next)) {
        i += 1;
        next = `${name}_${i}`;
      }
      name = next;
    }
    used.add(name);
    const rec = normalizeSlotAttachmentRecord(slot, a, name, basePh, slot.canvas);
    rec.name = name;
    if ((rec.type === "region" || rec.type === "mesh" || rec.type === "linkedmesh") && !rec.canvas) continue;
    out.push(rec);
  }
  if (out.length === 0 && slot.canvas) {
    out.push(normalizeSlotAttachmentRecord(slot, { name: base, placeholder: basePh, canvas: slot.canvas }, base, basePh, slot.canvas));
  }
  slot.attachments = out;
  if (!slot.attachments.some((a) => a.name === slot.attachmentName)) {
    slot.attachmentName = slot.attachments[0] ? slot.attachments[0].name : base;
  }
  if (slot.activeAttachment != null && !slot.attachments.some((a) => a.name === String(slot.activeAttachment))) {
    slot.activeAttachment = slot.attachmentName || (slot.attachments[0] ? slot.attachments[0].name : null);
  }
  const active = slot.activeAttachment != null ? String(slot.activeAttachment) : null;
  const activeEntry = active ? slot.attachments.find((a) => a.name === active) : null;
  if (activeEntry) slot.canvas = activeEntry.canvas;
  return slot.attachments;
}

function getSlotAttachmentEntry(slot, name) {
  if (!slot) return null;
  const list = ensureSlotAttachments(slot);
  const key = name == null ? null : String(name);
  if (key == null) return null;
  return list.find((a) => a.name === key) || null;
}

function getSlotCurrentAttachmentPlaceholder(slot) {
  if (!slot) return "main";
  ensureSlotAttachmentState(slot);
  const current = getSlotCurrentAttachmentName(slot);
  const entry = current ? getSlotAttachmentEntry(slot, current) : null;
  if (entry && entry.placeholder) return String(entry.placeholder);
  return String(slot.placeholderName || slot.attachmentName || "main");
}

function getSlotCurrentAttachmentName(slot) {
  ensureSlotAttachmentState(slot);
  ensureSlotAttachments(slot);
  return slot.activeAttachment != null ? String(slot.activeAttachment) : null;
}

function isSlotEditorVisible(slot) {
  if (!slot) return false;
  if (Object.prototype.hasOwnProperty.call(slot, "editorVisible")) return slot.editorVisible !== false;
  return slot.visible !== false;
}

function hasActiveAttachment(slot) {
  return !!(slot && getSlotCurrentAttachmentName(slot));
}

function hasRenderableAttachment(slot) {
  if (!slot || !isSlotEditorVisible(slot)) return false;
  const name = getSlotCurrentAttachmentName(slot);
  if (!name) return false;
  const att = getSlotAttachmentEntry(slot, name);
  if (!att) return false;
  const type = normalizeAttachmentType(att.type);
  if (type === "point" || type === "boundingbox") return false;
  return !!att.canvas;
}

function ensureSlotClipState(slot) {
  if (!slot) return;
  slot.clipEnabled = !!slot.clipEnabled;
  slot.clipSource = slot.clipSource === "contour" ? "contour" : "fill";
  if (slot.clipEndSlotId == null || slot.clipEndSlotId === "") slot.clipEndSlotId = null;
  else slot.clipEndSlotId = String(slot.clipEndSlotId);
}

function getSlotClipPointsLocal(slot) {
  if (!slot || !slot.clipEnabled) return [];
  ensureSlotClipState(slot);
  const c = ensureSlotContour(slot);
  if (!c || !c.closed) return [];
  const src =
    slot.clipSource === "contour"
      ? Array.isArray(c.points)
        ? c.points
        : []
      : Array.isArray(c.fillPoints) && c.fillPoints.length >= 3
        ? c.fillPoints
        : Array.isArray(c.points)
          ? c.points
          : [];
  if (!Array.isArray(src) || src.length < 3) return [];
  return src.map((p) => ({ x: Number(p && p.x) || 0, y: Number(p && p.y) || 0 }));
}

function addContourSlotFromActiveSlot(sourceSlot) {
  if (!sourceSlot) return null;
  const rectSrc = sourceSlot.rect || { x: 0, y: 0, w: sourceSlot.canvas.width, h: sourceSlot.canvas.height };
  const rect = {
    x: Number(rectSrc.x) || 0,
    y: Number(rectSrc.y) || 0,
    w: Math.max(1, Number(rectSrc.w) || 1),
    h: Math.max(1, Number(rectSrc.h) || 1),
  };
  const slot = {
    id: makeSlotId(),
    name: makeUniqueSlotName(`${sourceSlot.name || "slot"}_contour`),
    attachmentName: String(sourceSlot.attachmentName || "main"),
    placeholderName: String(sourceSlot.placeholderName || sourceSlot.attachmentName || "main"),
    activeAttachment:
      sourceSlot && Object.prototype.hasOwnProperty.call(sourceSlot, "activeAttachment")
        ? sourceSlot.activeAttachment == null
          ? null
          : String(sourceSlot.activeAttachment)
        : String(sourceSlot.attachmentName || "main"),
    editorVisible:
      sourceSlot && Object.prototype.hasOwnProperty.call(sourceSlot, "editorVisible")
        ? sourceSlot.editorVisible !== false
        : sourceSlot.visible !== false,
    canvas: sourceSlot.canvas,
    bone: Number.isFinite(sourceSlot.bone) ? sourceSlot.bone : -1,
    visible: sourceSlot.visible !== false,
    alpha: Number.isFinite(sourceSlot.alpha) ? math.clamp(sourceSlot.alpha, 0, 1) : 1,
    r: Number.isFinite(sourceSlot.r) ? math.clamp(sourceSlot.r, 0, 1) : 1,
    g: Number.isFinite(sourceSlot.g) ? math.clamp(sourceSlot.g, 0, 1) : 1,
    b: Number.isFinite(sourceSlot.b) ? math.clamp(sourceSlot.b, 0, 1) : 1,
    blend: normalizeSlotBlendMode(sourceSlot && sourceSlot.blend),
    darkEnabled: !!(sourceSlot && sourceSlot.darkEnabled),
    dr: Number.isFinite(sourceSlot && sourceSlot.dr) ? math.clamp(sourceSlot.dr, 0, 1) : 0,
    dg: Number.isFinite(sourceSlot && sourceSlot.dg) ? math.clamp(sourceSlot.dg, 0, 1) : 0,
    db: Number.isFinite(sourceSlot && sourceSlot.db) ? math.clamp(sourceSlot.db, 0, 1) : 0,
    tx: Number(sourceSlot.tx) || 0,
    ty: Number(sourceSlot.ty) || 0,
    rot: Number(sourceSlot.rot) || 0,
    rect,
    docWidth: Number.isFinite(sourceSlot.docWidth) ? sourceSlot.docWidth : state.imageWidth,
    docHeight: Number.isFinite(sourceSlot.docHeight) ? sourceSlot.docHeight : state.imageHeight,
    _indices: null,
    meshData: null,
    attachments: Array.isArray(sourceSlot.attachments) && sourceSlot.attachments.length > 0
      ? sourceSlot.attachments
          .map((a) => ({
            name: String(a && a.name ? a.name : "").trim(),
            placeholder: String(a && a.placeholder ? a.placeholder : sourceSlot.placeholderName || sourceSlot.attachmentName || "main").trim(),
            canvas: a && a.canvas ? a.canvas : sourceSlot.canvas,
            type: normalizeAttachmentType(a && a.type),
            linkedParent: a && a.linkedParent != null ? String(a.linkedParent) : "",
            pointX: Number(a && a.pointX) || 0,
            pointY: Number(a && a.pointY) || 0,
            pointRot: Number(a && a.pointRot) || 0,
            bboxSource: a && a.bboxSource === "contour" ? "contour" : "fill",
            sequence:
              a && a.sequence
                ? {
                    enabled: !!a.sequence.enabled,
                    count: Math.max(1, Math.round(Number(a.sequence.count) || 1)),
                    start: Math.max(0, Math.round(Number(a.sequence.start) || 0)),
                    digits: Math.max(1, Math.round(Number(a.sequence.digits) || 2)),
                  }
                : { enabled: false, count: 1, start: 0, digits: 2 },
          }))
          .filter((a) => a.name.length > 0 && (a.canvas || a.type === "point" || a.type === "boundingbox"))
      : [
          {
            name: String(sourceSlot.attachmentName || "main"),
            placeholder: String(sourceSlot.placeholderName || sourceSlot.attachmentName || "main"),
            canvas: sourceSlot.canvas,
            type: "region",
            linkedParent: "",
            pointX: 0,
            pointY: 0,
            pointRot: 0,
            bboxSource: "fill",
            sequence: { enabled: false, count: 1, start: 0, digits: 2 },
          },
        ],
    useWeights: sourceSlot.useWeights !== false,
    weightBindMode: sourceSlot.weightBindMode || "single",
    weightMode: sourceSlot.weightMode || getSlotWeightMode(sourceSlot),
    influenceBones: Array.isArray(sourceSlot.influenceBones) ? sourceSlot.influenceBones.filter((v) => Number.isFinite(v)) : [],
    clipEnabled: !!sourceSlot.clipEnabled,
    clipSource: sourceSlot && sourceSlot.clipSource === "contour" ? "contour" : "fill",
    clipEndSlotId:
      sourceSlot && Object.prototype.hasOwnProperty.call(sourceSlot, "clipEndSlotId")
        ? sourceSlot.clipEndSlotId == null
          ? null
          : String(sourceSlot.clipEndSlotId)
        : null,
    meshContour: {
      points: [],
      closed: false,
      triangles: [],
      fillPoints: [],
      fillTriangles: [],
      manualEdges: [],
      fillManualEdges: [],
    },
  };
  if (state.mesh) {
    slot.meshData = createSlotMeshData(rect, slot.docWidth || rect.w, slot.docHeight || rect.h, state.mesh.cols, state.mesh.rows);
    rebuildSlotWeights(slot, state.mesh);
  }
  ensureSlotAttachments(slot);
  ensureSlotAttachmentState(slot);
  ensureSlotClipState(slot);
  ensureSlotVisualState(slot);
  state.slots.push(slot);
  rebuildSlotTriangleIndices();
  setActiveSlot(state.slots.length - 1);
  return slot;
}

function getPrimarySelectedBoneIndex() {
  const m = state.mesh;
  if (!m || !Array.isArray(m.rigBones) || m.rigBones.length === 0) return -1;
  const primary = Number(state.selectedBone);
  if (Number.isFinite(primary) && primary >= 0 && primary < m.rigBones.length) return primary;
  const picked = getSelectedBonesForWeight(m);
  if (picked.length > 0) return picked[0];
  return -1;
}

function bindActiveSlotToSelectedBone() {
  const m = state.mesh;
  const slot = getActiveSlot();
  if (!m || !slot) return false;
  const bone = getPrimarySelectedBoneIndex();
  if (bone < 0) return false;
  slot.bone = bone;
  const mode = getSlotWeightMode(slot);
  if (mode === "single") {
    slot.weightMode = "single";
    slot.weightBindMode = "single";
    slot.useWeights = true;
    slot.influenceBones = [bone];
  } else if (mode === "weighted") {
    slot.weightMode = "weighted";
    slot.weightBindMode = "auto";
    slot.useWeights = true;
    slot.influenceBones = [...new Set([bone, ...(Array.isArray(slot.influenceBones) ? slot.influenceBones : [])])];
  } else {
    slot.influenceBones = [bone];
  }
  rebuildSlotWeights(slot, m);
  refreshSlotUI();
  renderBoneTree();
  return true;
}

function bindActiveSlotWeightedToSelectedBones() {
  const m = state.mesh;
  const slot = getActiveSlot();
  if (!m || !slot) return false;
  const picked = getSelectedBonesForWeight(m);
  if (!Array.isArray(picked) || picked.length === 0) return false;
  slot.bone = picked[0];
  slot.weightMode = "weighted";
  slot.weightBindMode = "auto";
  slot.useWeights = true;
  slot.influenceBones = [...new Set(picked)];
  rebuildSlotWeights(slot, m);
  refreshSlotUI();
  renderBoneTree();
  return true;
}

function normalizeEdgePairs(edges, pointCount) {
  if (!Array.isArray(edges) || pointCount <= 1) return [];
  const out = [];
  const used = new Set();
  for (const e of edges) {
    if (!Array.isArray(e) || e.length < 2) continue;
    let a = Number(e[0]);
    let b = Number(e[1]);
    if (!Number.isFinite(a) || !Number.isFinite(b)) continue;
    a = Math.floor(a);
    b = Math.floor(b);
    if (a === b || a < 0 || b < 0 || a >= pointCount || b >= pointCount) continue;
    if (a > b) [a, b] = [b, a];
    const key = `${a}:${b}`;
    if (used.has(key)) continue;
    used.add(key);
    out.push([a, b]);
  }
  return out;
}

function linkSelectedSlotMeshEdge(shouldLink) {
  const slot = getActiveSlot();
  if (!slot) return false;
  const contour = ensureSlotContour(slot);
  const activeSet = state.slotMesh.activeSet === "fill" ? "fill" : "contour";
  const activeEdges = activeSet === "fill" ? contour.fillManualEdges : contour.manualEdges;
  if (state.slotMesh.edgeSelectionSet !== activeSet || state.slotMesh.edgeSelection.length !== 2) return false;
  const [a0, b0] = state.slotMesh.edgeSelection;
  const a = Math.min(a0, b0);
  const b = Math.max(a0, b0);
  if (!shouldLink) {
    const prevLen = activeEdges.length;
    const filtered = activeEdges.filter((e) => {
      const lo = Math.min(e[0], e[1]);
      const hi = Math.max(e[0], e[1]);
      return lo !== a || hi !== b;
    });
    activeEdges.length = 0;
    for (const e of filtered) activeEdges.push(e);
    if (activeSet === "contour" && contour.triangles.length >= 3) {
      contour.triangles = applyManualEdgesToTriangles(contour.points, contour.triangles, contour.manualEdges);
    } else if (activeSet === "fill" && contour.fillTriangles.length >= 3) {
      contour.fillTriangles = applyManualEdgesToTriangles(contour.fillPoints, contour.fillTriangles, contour.fillManualEdges);
    }
    return prevLen !== activeEdges.length;
  }
  const key = `${a}:${b}`;
  const had = new Set(activeEdges.map((e) => `${Math.min(e[0], e[1])}:${Math.max(e[0], e[1])}`)).has(key);
  if (!had) activeEdges.push([a, b]);
  if (activeSet === "contour" && contour.triangles.length >= 3) {
    contour.triangles = applyManualEdgesToTriangles(contour.points, contour.triangles, contour.manualEdges);
  } else if (activeSet === "fill" && contour.fillTriangles.length >= 3) {
    contour.fillTriangles = applyManualEdgesToTriangles(contour.fillPoints, contour.fillTriangles, contour.fillManualEdges);
  }
  return !had;
}

function ensureSlotContour(slot) {
  if (!slot) return { points: [], closed: false, triangles: [] };
  if (!slot.meshContour || !Array.isArray(slot.meshContour.points)) {
    slot.meshContour = { points: [], closed: false, triangles: [], fillPoints: [], fillTriangles: [], manualEdges: [], fillManualEdges: [] };
  }
  if (!Array.isArray(slot.meshContour.triangles)) slot.meshContour.triangles = [];
  if (!Array.isArray(slot.meshContour.fillPoints)) slot.meshContour.fillPoints = [];
  if (!Array.isArray(slot.meshContour.fillTriangles)) slot.meshContour.fillTriangles = [];
  if (!Array.isArray(slot.meshContour.manualEdges)) slot.meshContour.manualEdges = [];
  if (!Array.isArray(slot.meshContour.fillManualEdges)) slot.meshContour.fillManualEdges = [];
  slot.meshContour.manualEdges = normalizeEdgePairs(slot.meshContour.manualEdges, slot.meshContour.points.length);
  slot.meshContour.fillManualEdges = normalizeEdgePairs(slot.meshContour.fillManualEdges, slot.meshContour.fillPoints.length);
  slot.meshContour.closed = !!slot.meshContour.closed;
  return slot.meshContour;
}

function pointInPolygon2D(p, poly) {
  if (!Array.isArray(poly) || poly.length < 3) return false;
  const x = Number(p.x) || 0;
  const y = Number(p.y) || 0;
  const onSeg = (ax, ay, bx, by, px, py) => {
    const vx = bx - ax;
    const vy = by - ay;
    const wx = px - ax;
    const wy = py - ay;
    const cross = vx * wy - vy * wx;
    if (Math.abs(cross) > 1e-6) return false;
    const dot = wx * vx + wy * vy;
    if (dot < -1e-6) return false;
    const vv = vx * vx + vy * vy;
    return dot <= vv + 1e-6;
  };
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const pi = poly[i];
    const pj = poly[j];
    const yi = Number(pi.y) || 0;
    const yj = Number(pj.y) || 0;
    const xi = Number(pi.x) || 0;
    const xj = Number(pj.x) || 0;
    if (onSeg(xi, yi, xj, yj, x, y)) return true;
    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / ((yj - yi) || 1e-8) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function polygonSignedArea(points) {
  if (!Array.isArray(points) || points.length < 3) return 0;
  let sum = 0;
  for (let i = 0; i < points.length; i += 1) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    sum += a.x * b.y - b.x * a.y;
  }
  return sum * 0.5;
}

function pointInTriangle2D(p, a, b, c) {
  const s1 = (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);
  const s2 = (c.x - b.x) * (p.y - b.y) - (c.y - b.y) * (p.x - b.x);
  const s3 = (a.x - c.x) * (p.y - c.y) - (a.y - c.y) * (p.x - c.x);
  const hasNeg = s1 < 0 || s2 < 0 || s3 < 0;
  const hasPos = s1 > 0 || s2 > 0 || s3 > 0;
  return !(hasNeg && hasPos);
}

function triangulatePolygon(points) {
  if (!Array.isArray(points) || points.length < 3) return [];
  const n = points.length;
  const area = polygonSignedArea(points);
  const ccw = area >= 0;
  const verts = [];
  for (let i = 0; i < n; i += 1) verts.push(i);
  const out = [];
  let guard = 0;
  while (verts.length > 2 && guard < 10000) {
    guard += 1;
    let earFound = false;
    for (let i = 0; i < verts.length; i += 1) {
      const i0 = verts[(i - 1 + verts.length) % verts.length];
      const i1 = verts[i];
      const i2 = verts[(i + 1) % verts.length];
      const a = points[i0];
      const b = points[i1];
      const c = points[i2];
      const cross = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
      if ((ccw && cross <= 1e-7) || (!ccw && cross >= -1e-7)) continue;
      let hasInside = false;
      for (let j = 0; j < verts.length; j += 1) {
        const vi = verts[j];
        if (vi === i0 || vi === i1 || vi === i2) continue;
        if (pointInTriangle2D(points[vi], a, b, c)) {
          hasInside = true;
          break;
        }
      }
      if (hasInside) continue;
      if (ccw) out.push(i0, i1, i2);
      else out.push(i0, i2, i1);
      verts.splice(i, 1);
      earFound = true;
      break;
    }
    if (!earFound) return [];
  }
  return out;
}

function makePointKey(x, y) {
  return `${Math.round(x * 1000)}:${Math.round(y * 1000)}`;
}

function circumcircleContains(a, b, c, p) {
  const ax = a.x - p.x;
  const ay = a.y - p.y;
  const bx = b.x - p.x;
  const by = b.y - p.y;
  const cx = c.x - p.x;
  const cy = c.y - p.y;
  const det =
    (ax * ax + ay * ay) * (bx * cy - by * cx) -
    (bx * bx + by * by) * (ax * cy - ay * cx) +
    (cx * cx + cy * cy) * (ax * by - ay * bx);
  const orient = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
  return orient >= 0 ? det > 1e-8 : det < -1e-8;
}

function delaunayTriangulate(points) {
  if (!Array.isArray(points) || points.length < 3) return [];
  const pts = points.map((p) => ({ x: Number(p.x) || 0, y: Number(p.y) || 0 }));
  let minX = pts[0].x;
  let minY = pts[0].y;
  let maxX = pts[0].x;
  let maxY = pts[0].y;
  for (const p of pts) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }
  const dx = maxX - minX;
  const dy = maxY - minY;
  const d = Math.max(dx, dy) || 1;
  const midX = (minX + maxX) * 0.5;
  const midY = (minY + maxY) * 0.5;
  const s0 = { x: midX - 20 * d, y: midY - d };
  const s1 = { x: midX, y: midY + 20 * d };
  const s2 = { x: midX + 20 * d, y: midY - d };
  const i0 = pts.length;
  const i1 = pts.length + 1;
  const i2 = pts.length + 2;
  pts.push(s0, s1, s2);
  let tris = [[i0, i1, i2]];
  for (let i = 0; i < points.length; i += 1) {
    const p = pts[i];
    const bad = [];
    for (let t = 0; t < tris.length; t += 1) {
      const tri = tris[t];
      if (circumcircleContains(pts[tri[0]], pts[tri[1]], pts[tri[2]], p)) bad.push(t);
    }
    const edgeMap = new Map();
    for (const bi of bad) {
      const tri = tris[bi];
      const edges = [
        [tri[0], tri[1]],
        [tri[1], tri[2]],
        [tri[2], tri[0]],
      ];
      for (const [a, b] of edges) {
        const lo = Math.min(a, b);
        const hi = Math.max(a, b);
        const key = `${lo}:${hi}`;
        edgeMap.set(key, (edgeMap.get(key) || 0) + 1);
      }
    }
    tris = tris.filter((_, idx) => !bad.includes(idx));
    for (const [key, count] of edgeMap.entries()) {
      if (count !== 1) continue;
      const [a, b] = key.split(":").map((v) => Number(v) || 0);
      tris.push([a, b, i]);
    }
  }
  const out = [];
  for (const tri of tris) {
    if (tri[0] >= points.length || tri[1] >= points.length || tri[2] >= points.length) continue;
    out.push(tri[0], tri[1], tri[2]);
  }
  return out;
}

function hasTriangleEdge(triangles, a, b) {
  if (!Array.isArray(triangles) || triangles.length < 3) return false;
  for (let i = 0; i + 2 < triangles.length; i += 3) {
    const t0 = triangles[i];
    const t1 = triangles[i + 1];
    const t2 = triangles[i + 2];
    if ((t0 === a && t1 === b) || (t1 === a && t0 === b)) return true;
    if ((t1 === a && t2 === b) || (t2 === a && t1 === b)) return true;
    if ((t2 === a && t0 === b) || (t0 === a && t2 === b)) return true;
  }
  return false;
}

function forceEdgeByFlip(points, triangles, edgeA, edgeB) {
  if (!Array.isArray(triangles) || triangles.length < 6 || edgeA === edgeB) return triangles;
  if (hasTriangleEdge(triangles, edgeA, edgeB)) return triangles;
  const triList = [];
  for (let i = 0; i + 2 < triangles.length; i += 3) triList.push([triangles[i], triangles[i + 1], triangles[i + 2]]);
  let changed = false;
  for (let i = 0; i < triList.length; i += 1) {
    for (let j = i + 1; j < triList.length; j += 1) {
      const ta = triList[i];
      const tb = triList[j];
      const common = [];
      for (const v of ta) {
        if (tb.includes(v)) common.push(v);
      }
      if (common.length !== 2) continue;
      const oa = ta.find((v) => v !== common[0] && v !== common[1]);
      const ob = tb.find((v) => v !== common[0] && v !== common[1]);
      if (oa == null || ob == null) continue;
      const match = (oa === edgeA && ob === edgeB) || (oa === edgeB && ob === edgeA);
      if (!match) continue;
      const c0 = common[0];
      const c1 = common[1];
      triList[i] = [edgeA, edgeB, c0];
      triList[j] = [edgeB, edgeA, c1];
      changed = true;
      break;
    }
    if (changed) break;
  }
  if (!changed) return triangles;
  const out = [];
  for (const tri of triList) out.push(tri[0], tri[1], tri[2]);
  return out;
}

function applyManualEdgesToTriangles(points, triangles, manualEdges) {
  if (!Array.isArray(triangles) || triangles.length < 3) return [];
  const edges = normalizeEdgePairs(manualEdges, Array.isArray(points) ? points.length : 0);
  let out = triangles.slice();
  for (const e of edges) {
    out = forceEdgeByFlip(points, out, e[0], e[1]);
  }
  return out;
}

function sanitizeTriangles(points, triangles, poly = null) {
  if (!Array.isArray(points) || points.length < 3 || !Array.isArray(triangles) || triangles.length < 3) return [];
  const out = [];
  const used = new Set();
  const triArea2 = (a, b, c) => (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
  let minX = points[0].x;
  let minY = points[0].y;
  let maxX = points[0].x;
  let maxY = points[0].y;
  for (const p of points) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }
  const span = Math.max(maxX - minX, maxY - minY, 1);
  // Keep very thin triangles to avoid visual cracks near constrained/manual edges.
  const areaEps = Math.max(1e-10, span * span * 1e-14);
  for (let i = 0; i + 2 < triangles.length; i += 3) {
    const a = Math.floor(Number(triangles[i]));
    const b = Math.floor(Number(triangles[i + 1]));
    const c = Math.floor(Number(triangles[i + 2]));
    if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(c)) continue;
    if (a < 0 || b < 0 || c < 0 || a >= points.length || b >= points.length || c >= points.length) continue;
    if (a === b || b === c || c === a) continue;
    const pa = points[a];
    const pb = points[b];
    const pc = points[c];
    if (!pa || !pb || !pc) continue;
    if (Math.abs(triArea2(pa, pb, pc)) < areaEps) continue;
    if (Array.isArray(poly) && poly.length >= 3) {
      const cen = { x: (pa.x + pb.x + pc.x) / 3, y: (pa.y + pb.y + pc.y) / 3 };
      if (!pointInPolygon2D(cen, poly)) continue;
    }
    const key = [a, b, c].sort((x, y) => x - y).join(":");
    if (used.has(key)) continue;
    used.add(key);
    out.push(a, b, c);
  }
  return out;
}

function snapContourPointsToUniformGrid(poly, minX, minY, stepX, stepY, cols, rows) {
  const src = Array.isArray(poly) ? poly : [];
  if (src.length < 3) return [];
  const candidates = [];
  // Expand one ring around bbox grid so nearest contour approximation can fall slightly outside.
  for (let iy = -1; iy <= rows + 1; iy += 1) {
    for (let ix = -1; ix <= cols + 1; ix += 1) {
      candidates.push({
        x: minX + ix * stepX,
        y: minY + iy * stepY,
      });
    }
  }
  const used = new Set();
  const picked = [];
  for (let i = 0; i < src.length; i += 1) {
    const p = src[i];
    if (!p) continue;
    const px = Number(p.x) || 0;
    const py = Number(p.y) || 0;
    let best = -1;
    let bestD2 = Infinity;
    for (let ci = 0; ci < candidates.length; ci += 1) {
      if (used.has(ci)) continue;
      const c = candidates[ci];
      const dx = c.x - px;
      const dy = c.y - py;
      const d2 = dx * dx + dy * dy;
      if (d2 < bestD2) {
        bestD2 = d2;
        best = ci;
      }
    }
    if (best < 0) {
      // Fallback when candidates are exhausted.
      for (let ci = 0; ci < candidates.length; ci += 1) {
        const c = candidates[ci];
        const dx = c.x - px;
        const dy = c.y - py;
        const d2 = dx * dx + dy * dy;
        if (d2 < bestD2) {
          bestD2 = d2;
          best = ci;
        }
      }
    }
    if (best < 0) continue;
    used.add(best);
    const cp = candidates[best];
    picked.push({ x: cp.x, y: cp.y });
  }
  // Remove duplicate points caused by close original contour points snapping to same grid node.
  const out = [];
  const seen = new Set();
  for (const p of picked) {
    const k = makePointKey(p.x, p.y);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(p);
  }
  return out;
}

function buildUniformGridFillForContour(contour, colsHint, rowsHint, includeContourPoints = true) {
  if (!contour || !contour.closed || contour.points.length < 3) return { points: [], triangles: [] };
  const poly = contour.points;
  let minX = poly[0].x;
  let minY = poly[0].y;
  let maxX = poly[0].x;
  let maxY = poly[0].y;
  for (const p of poly) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }
  const cols = math.clamp(Number(colsHint) || 24, 3, 80);
  const rows = math.clamp(Number(rowsHint) || 24, 3, 80);
  const stepX = (maxX - minX) / cols || 1;
  const stepY = (maxY - minY) / rows || 1;
  const pts = [];
  const used = new Set();
  const contourPoints = [];
  const seed = includeContourPoints
    ? poly.map((p) => ({ x: Number(p.x) || 0, y: Number(p.y) || 0 }))
    : snapContourPointsToUniformGrid(poly, minX, minY, stepX, stepY, cols, rows);
  for (const p of seed) {
    const px = Number(p.x) || 0;
    const py = Number(p.y) || 0;
    const k = makePointKey(px, py);
    if (used.has(k)) continue;
    used.add(k);
    const cp = { x: px, y: py };
    contourPoints.push(cp);
    pts.push(cp);
  }
  for (let iy = 0; iy <= rows; iy += 1) {
    for (let ix = 0; ix <= cols; ix += 1) {
      const x = minX + ix * stepX;
      const y = minY + iy * stepY;
      if (!pointInPolygon2D({ x, y }, poly)) continue;
      const k = makePointKey(x, y);
      if (used.has(k)) continue;
      used.add(k);
      pts.push({ x, y });
    }
  }
  if (pts.length < 3 || contourPoints.length < 3) return { points: [], triangles: [], contourPoints: [] };
  const raw = delaunayTriangulate(pts);
  let filtered = [];
  for (let i = 0; i + 2 < raw.length; i += 3) {
    const a = pts[raw[i]];
    const b = pts[raw[i + 1]];
    const c = pts[raw[i + 2]];
    const cen = { x: (a.x + b.x + c.x) / 3, y: (a.y + b.y + c.y) / 3 };
    const m0 = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    const m1 = { x: (b.x + c.x) / 2, y: (b.y + c.y) / 2 };
    const m2 = { x: (c.x + a.x) / 2, y: (c.y + a.y) / 2 };
    if (!pointInPolygon2D(cen, poly)) continue;
    if (!pointInPolygon2D(m0, poly)) continue;
    if (!pointInPolygon2D(m1, poly)) continue;
    if (!pointInPolygon2D(m2, poly)) continue;
    filtered.push(raw[i], raw[i + 1], raw[i + 2]);
  }
  filtered = sanitizeTriangles(pts, filtered, poly);
  if (filtered.length < 3) {
    const fallback = [];
    for (let i = 0; i + 2 < raw.length; i += 3) {
      const a = pts[raw[i]];
      const b = pts[raw[i + 1]];
      const c = pts[raw[i + 2]];
      if (!a || !b || !c) continue;
      const cen = { x: (a.x + b.x + c.x) / 3, y: (a.y + b.y + c.y) / 3 };
      if (!pointInPolygon2D(cen, poly)) continue;
      fallback.push(raw[i], raw[i + 1], raw[i + 2]);
    }
    filtered = sanitizeTriangles(pts, fallback, poly);
  }
  return { points: pts, triangles: filtered, contourPoints };
}

function reindexTrianglesAfterPointRemoved(triangles, index) {
  if (!Array.isArray(triangles) || triangles.length < 3) return [];
  const out = [];
  for (let i = 0; i + 2 < triangles.length; i += 3) {
    const a = Number(triangles[i]);
    const b = Number(triangles[i + 1]);
    const c = Number(triangles[i + 2]);
    if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(c)) continue;
    if (a === index || b === index || c === index) continue;
    out.push(a > index ? a - 1 : a, b > index ? b - 1 : b, c > index ? c - 1 : c);
  }
  return out;
}

function removePointAtIndex(points, index) {
  if (!Array.isArray(points) || index < 0 || index >= points.length) return false;
  points.splice(index, 1);
  return true;
}

function applyContourMeshToSlot(slot) {
  const m = state.mesh;
  if (!m || !slot) return false;
  const contour = ensureSlotContour(slot);
  if (!contour.closed || contour.points.length < 3) return false;
  const useFill = Array.isArray(contour.fillPoints) && contour.fillPoints.length >= 3;
  const pts = useFill ? contour.fillPoints : contour.points;
  const manualEdges = useFill ? contour.fillManualEdges : contour.manualEdges;
  let triangles = useFill ? contour.fillTriangles : contour.triangles;
  if (!Array.isArray(triangles) || triangles.length < 3) {
    triangles = applyManualEdgesToTriangles(pts, triangulatePolygon(pts), manualEdges);
    if (useFill) contour.fillTriangles = triangles;
    else contour.triangles = triangles;
  }
  triangles = applyManualEdgesToTriangles(pts, triangles, manualEdges);
  triangles = sanitizeTriangles(pts, triangles, contour.points);
  if (!Array.isArray(triangles) || triangles.length < 3) return false;
  const rect = slot.rect || { x: 0, y: 0, w: Math.max(1, state.imageWidth), h: Math.max(1, state.imageHeight) };
  const rw = Math.max(1, Number(rect.w) || 1);
  const rh = Math.max(1, Number(rect.h) || 1);
  const positions = new Float32Array(pts.length * 2);
  const uvs = new Float32Array(pts.length * 2);
  for (let i = 0; i < pts.length; i += 1) {
    const p = pts[i];
    positions[i * 2] = Number(p.x) || 0;
    positions[i * 2 + 1] = Number(p.y) || 0;
    uvs[i * 2] = math.clamp(((Number(p.x) || 0) - (Number(rect.x) || 0)) / rw, 0, 1);
    uvs[i * 2 + 1] = math.clamp(((Number(p.y) || 0) - (Number(rect.y) || 0)) / rh, 0, 1);
  }
  const vCount = pts.length;
  slot.meshData = {
    cols: 0,
    rows: 0,
    positions,
    uvs,
    offsets: new Float32Array(vCount * 2),
    baseOffsets: new Float32Array(vCount * 2),
    weights: new Float32Array(0),
    indices: new Uint16Array(triangles),
    deformedLocal: new Float32Array(vCount * 2),
    deformedScreen: new Float32Array(vCount * 2),
    interleaved: new Float32Array(vCount * 4),
  };
  rebuildSlotWeights(slot, m);
  rebuildSlotTriangleIndices();
  return true;
}

function resetSlotMeshToGrid(slot) {
  const m = state.mesh;
  if (!m || !slot) return false;
  const r = slot.rect || { x: 0, y: 0, w: state.imageWidth || 64, h: state.imageHeight || 64 };
  slot.meshData = createSlotMeshData(r, state.imageWidth || r.w, state.imageHeight || r.h, m.cols, m.rows);
  rebuildSlotWeights(slot, m);
  return true;
}

function pickSlotContourPoint(slot, mx, my, radius = 10) {
  const contour = ensureSlotContour(slot);
  const r2 = radius * radius;
  let best = { set: "contour", index: -1 };
  let bestD2 = r2;
  const sets = [];
  const preferFill = state.slotMesh.activeSet === "fill";
  if (preferFill) sets.push(["fill", contour.fillPoints || []], ["contour", contour.points || []]);
  else sets.push(["contour", contour.points || []], ["fill", contour.fillPoints || []]);
  for (const [setName, list] of sets) {
    for (let i = 0; i < list.length; i += 1) {
      const p = list[i];
      const s = localToScreen(p.x, p.y);
      const dx = s.x - mx;
      const dy = s.y - my;
      const d2 = dx * dx + dy * dy;
      if (d2 <= bestD2) {
        bestD2 = d2;
        best = { set: setName, index: i };
      }
    }
  }
  return best.index >= 0 ? best : null;
}

function ensureSlotMeshData(slot, m) {
  if (!slot || !m) return;
  if (!slot.meshData) {
    const r = slot.rect || { x: 0, y: 0, w: state.imageWidth || 64, h: state.imageHeight || 64 };
    slot.meshData = createSlotMeshData(r, state.imageWidth || r.w, state.imageHeight || r.h, m.cols, m.rows);
  }
  if (!slot.meshData.weights || slot.meshData.weights.length !== (slot.meshData.positions.length / 2) * m.rigBones.length) {
    const mode = getSlotWeightMode(slot);
    if (mode === "free") {
      slot.useWeights = false;
      slot.weightBindMode = "none";
      slot.weightMode = "free";
      slot.meshData.weights = new Float32Array(0);
      return;
    }
    if (mode === "single") {
      const vCount = slot.meshData.positions.length / 2;
      const boneCount = m.rigBones.length;
      const bi = Number(slot.bone);
      const weights = allocWeights(vCount, boneCount);
      if (Number.isFinite(bi) && bi >= 0 && bi < boneCount) {
        for (let i = 0; i < vCount; i += 1) {
          weights[i * boneCount + bi] = 1;
        }
      }
      slot.meshData.weights = weights;
      slot.weightBindMode = "single";
      slot.weightMode = "single";
    } else {
      const allowed = getSlotInfluenceBones(slot, m);
      slot.influenceBones = allowed;
      slot.meshData.weights = autoWeightForPositions(slot.meshData.positions, m.rigBones, allowed);
      slot.weightBindMode = "auto";
      slot.weightMode = "weighted";
    }
  }
}

const modelSlotOffsetsStore = new WeakMap();

function getModelSlotOffsetMap(m) {
  let map = modelSlotOffsetsStore.get(m);
  if (!map) {
    map = new Map();
    modelSlotOffsetsStore.set(m, map);
  }
  return map;
}

function getModelSlotOffsets(m, slotIndex) {
  if (!m || !Number.isFinite(slotIndex) || slotIndex < 0 || slotIndex >= state.slots.length) return null;
  const si = Number(slotIndex);
  const slot = state.slots[si];
  if (!slot) return null;
  ensureSlotMeshData(slot, m);
  const src = slot.meshData && slot.meshData.offsets ? slot.meshData.offsets : null;
  const base = slot.meshData && slot.meshData.baseOffsets ? slot.meshData.baseOffsets : null;
  if (!src || !base) return null;
  if (m === state.mesh) return src;
  const map = getModelSlotOffsetMap(m);
  const existing = map.get(si);
  if (existing && existing.length === src.length) return existing;
  const created = new Float32Array(src.length);
  created.set(base);
  map.set(si, created);
  return created;
}

function resetModelSlotOffsetsToBase(m) {
  if (!m) return;
  if (state.slots.length > 0) {
    if (m === state.mesh) {
      for (const slot of state.slots) {
        if (!slot) continue;
        ensureSlotMeshData(slot, m);
        if (slot.meshData && slot.meshData.offsets && slot.meshData.baseOffsets) {
          slot.meshData.offsets.set(slot.meshData.baseOffsets);
        }
      }
      return;
    }
    for (let si = 0; si < state.slots.length; si += 1) {
      const slot = state.slots[si];
      if (!slot) continue;
      ensureSlotMeshData(slot, m);
      const dst = getModelSlotOffsets(m, si);
      if (dst && slot.meshData && slot.meshData.baseOffsets && dst.length === slot.meshData.baseOffsets.length) {
        dst.set(slot.meshData.baseOffsets);
      }
    }
    return;
  }
  if (m.baseOffsets && m.offsets) m.offsets.set(m.baseOffsets);
}

function getSlotOffsets(slot, m) {
  ensureSlotMeshData(slot, m);
  return slot && slot.meshData ? slot.meshData.offsets : null;
}

function getActiveOffsets(m) {
  if (state.slots.length === 0) return m.offsets;
  const slot = getActiveSlot();
  if (!slot) return m.offsets;
  if (m === state.mesh) return getSlotOffsets(slot, m) || m.offsets;
  const si = state.activeSlot;
  return getModelSlotOffsets(m, si) || m.offsets;
}

function getRenderableSlots() {
  if (state.slots.length === 0) {
    if (!state.sourceCanvas) return [];
    return [{ name: "base", canvas: state.sourceCanvas, alpha: 1, visible: true }];
  }
  const canRenderSlot = (s) => {
    if (!s || !isSlotEditorVisible(s)) return false;
    if (s.clipEnabled) return true;
    return hasActiveAttachment(s);
  };
  if (state.slotViewMode !== "all") {
    const s = getActiveSlot();
    return s && canRenderSlot(s) ? [s] : [];
  }
  return state.slots.filter((s) => canRenderSlot(s));
}

function ensureDefaultSlotBone() {
  const m = state.mesh;
  if (!m) return -1;
  if (m.rigBones.length > 0) return 0;
  const len = Math.max(24, Math.round((state.imageWidth || 256) * 0.22));
  m.rigBones.push({
    name: "slot_root",
    parent: -1,
    inherit: "normal",
    tx: (state.imageWidth || 256) * 0.5,
    ty: (state.imageHeight || 256) * 0.5,
    rot: -Math.PI * 0.5,
    length: len,
    sx: 1,
    sy: 1,
    shx: 0,
    shy: 0,
    connected: true,
    poseLenEditable: false,
  });
  state.selectedBone = 0;
  syncPoseFromRig(m);
  syncBindPose(m);
  refreshWeightsForBoneCount();
  return 0;
}

function createTempBoneForSlot(slot, label = "slot_bone") {
  const m = state.mesh;
  if (!m) return -1;
  const r = slot && slot.rect ? slot.rect : { x: state.imageWidth * 0.5, y: state.imageHeight * 0.5, w: 48, h: 48 };
  const cx = r.x + r.w * 0.5;
  const cy = r.y + r.h * 0.5;
  const len = Math.max(16, Math.min(120, Math.max(r.w, r.h) * 0.4));
  m.rigBones.push({
    name: `${label}_${m.rigBones.length}`,
    parent: -1,
    inherit: "normal",
    tx: cx,
    ty: cy,
    rot: -Math.PI * 0.5,
    length: len,
    sx: 1,
    sy: 1,
    shx: 0,
    shy: 0,
    connected: true,
    poseLenEditable: false,
  });
  const idx = m.rigBones.length - 1;
  syncPoseFromRig(m);
  syncBindPose(m);
  refreshWeightsForBoneCount();
  return idx;
}

function ensureSlotsHaveBoneBinding() {
  if (state.slots.length === 0) return;
  const m = state.mesh;
  if (!m) return;
  if (m.rigBones.length === 0) {
    for (const s of state.slots) {
      if (!s) continue;
      ensureSlotClipState(s);
      const bi = createTempBoneForSlot(s, "slot_root");
      s.bone = bi;
      if (getSlotWeightMode(s) === "single") {
        setSlotSingleBoneWeight(s, m, bi);
      } else {
        rebuildSlotWeights(s, m);
      }
    }
    return;
  }
  const defaultBone = ensureDefaultSlotBone();
  for (const s of state.slots) {
    if (!s) continue;
    ensureSlotClipState(s);
    const valid = Number.isFinite(s.bone) && s.bone >= 0 && s.bone < m.rigBones.length;
    if (!valid) {
      const bi = createTempBoneForSlot(s, "slot_auto");
      s.bone = bi;
      if (getSlotWeightMode(s) === "single") {
        setSlotSingleBoneWeight(s, m, bi);
      } else {
        rebuildSlotWeights(s, m);
      }
    }
  }
  if (state.slots.length > 0 && state.slots.every((s) => !Number.isFinite(s.bone) || s.bone < 0)) {
    state.slots[0].bone = defaultBone;
  }
}

function ensureIKConstraints(m) {
  if (!m) return [];
  if (!Array.isArray(m.ikConstraints)) m.ikConstraints = [];
  const count = Array.isArray(m.rigBones) ? m.rigBones.length : 0;
  m.ikConstraints = m.ikConstraints
    .map((c, i) => {
      const bones = Array.isArray(c && c.bones) ? c.bones.map((v) => Number(v)).filter((v) => Number.isFinite(v)) : [];
      const target = Number(c && c.target);
      const targetX = Number(c && c.targetX);
      const targetY = Number(c && c.targetY);
      const name = c && c.name ? String(c.name) : `ik_${i}`;
      return {
        name,
        bones: bones.slice(0, 2),
        target: Number.isFinite(target) && target >= 0 && target < count ? target : -1,
        targetX: Number.isFinite(targetX) ? targetX : null, // legacy project compatibility
        targetY: Number.isFinite(targetY) ? targetY : null, // legacy project compatibility
        mix: math.clamp(Number(c && c.mix) || 1, 0, 1),
        softness: Math.max(0, Number(c && c.softness) || 0),
        bendPositive: c && c.bendPositive !== false,
        compress: !!(c && c.compress),
        stretch: !!(c && c.stretch),
        uniform: !!(c && c.uniform),
        order: getConstraintOrder(c, i),
        skinRequired: !!(c && c.skinRequired),
        enabled: c ? c.enabled !== false : true,
        endMode: c && c.endMode === "tail" ? "tail" : "head",
      };
    })
    .filter((c) => c.bones.length >= 1 && c.bones.every((b) => b >= 0 && b < count));
  if (!Number.isFinite(state.selectedIK) || state.selectedIK < 0 || state.selectedIK >= m.ikConstraints.length) {
    state.selectedIK = m.ikConstraints.length > 0 ? 0 : -1;
  }
  return m.ikConstraints;
}

function ensureTransformConstraints(m) {
  if (!m) return [];
  if (!Array.isArray(m.transformConstraints)) m.transformConstraints = [];
  const count = Array.isArray(m.rigBones) ? m.rigBones.length : 0;
  m.transformConstraints = m.transformConstraints
    .map((c, i) => {
      const bones = Array.isArray(c && c.bones) ? c.bones.map((v) => Number(v)).filter((v) => Number.isFinite(v)) : [];
      const target = Number(c && c.target);
      return {
        name: c && c.name ? String(c.name) : `transform_${i}`,
        bones: [...new Set(bones)].filter((b) => b >= 0 && b < count),
        target: Number.isFinite(target) && target >= 0 && target < count ? target : -1,
        rotateMix: math.clamp(Number(c && c.rotateMix) || 0, 0, 1),
        translateMix: math.clamp(Number(c && c.translateMix) || 0, 0, 1),
        scaleMix: math.clamp(Number(c && c.scaleMix) || 0, 0, 1),
        shearMix: math.clamp(Number(c && c.shearMix) || 0, 0, 1),
        offsetX: Number(c && c.offsetX) || 0,
        offsetY: Number(c && c.offsetY) || 0,
        offsetRot: Number(c && c.offsetRot) || 0,
        offsetScaleX: Number(c && c.offsetScaleX) || 0,
        offsetScaleY: Number(c && c.offsetScaleY) || 0,
        offsetShearY: Number(c && c.offsetShearY) || 0,
        local: !!(c && c.local),
        relative: !!(c && c.relative),
        order: getConstraintOrder(c, i),
        skinRequired: !!(c && c.skinRequired),
        enabled: c ? c.enabled !== false : true,
      };
    })
    .filter((c) => c.bones.length > 0 && c.target >= 0);
  if (
    !Number.isFinite(state.selectedTransform) ||
    state.selectedTransform < 0 ||
    state.selectedTransform >= m.transformConstraints.length
  ) {
    state.selectedTransform = m.transformConstraints.length > 0 ? 0 : -1;
  }
  return m.transformConstraints;
}

function getActiveTransformConstraint() {
  const m = state.mesh;
  if (!m) return null;
  const list = ensureTransformConstraints(m);
  sortConstraintListByOrder(list);
  if (state.selectedTransform < 0 || state.selectedTransform >= list.length) return null;
  return list[state.selectedTransform];
}

function getTransformConstrainedBoneSet(m) {
  const out = new Set();
  if (!m) return out;
  for (const c of ensureTransformConstraints(m)) {
    if (!c || c.enabled === false) continue;
    for (const bi of c.bones || []) out.add(bi);
  }
  return out;
}

function getTransformTargetBoneSet(m) {
  const out = new Set();
  if (!m) return out;
  for (const c of ensureTransformConstraints(m)) {
    if (!c || c.enabled === false) continue;
    const t = Number(c.target);
    if (Number.isFinite(t) && t >= 0) out.add(t);
  }
  return out;
}

function ensurePathConstraints(m) {
  if (!m) return [];
  if (!Array.isArray(m.pathConstraints)) m.pathConstraints = [];
  const count = Array.isArray(m.rigBones) ? m.rigBones.length : 0;
  m.pathConstraints = m.pathConstraints
    .map((c, i) => {
      const bones = Array.isArray(c && c.bones) ? c.bones.map((v) => Number(v)).filter((v) => Number.isFinite(v)) : [];
      const target = Number(c && c.target);
      return {
        name: c && c.name ? String(c.name) : `path_${i}`,
        bones: [...new Set(bones)].filter((b) => b >= 0 && b < count),
        target: Number.isFinite(target) && target >= 0 && target < count ? target : -1,
        sourceType:
          c && c.sourceType === "bone_chain"
            ? "bone_chain"
            : c && c.sourceType === "slot"
              ? "slot"
              : "drawn",
        targetSlot: Number.isFinite(Number(c && c.targetSlot)) ? Number(c.targetSlot) : -1,
        points: Array.isArray(c && c.points)
          ? c.points.map((p) => normalizePathNode(p)).filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y))
          : [],
        positionMode: c && c.positionMode === "percent" ? "percent" : "fixed",
        spacingMode:
          c && c.spacingMode === "fixed"
            ? "fixed"
            : c && c.spacingMode === "percent"
              ? "percent"
              : c && c.spacingMode === "proportional"
                ? "proportional"
                : "length",
        rotateMode: c && c.rotateMode === "chain" ? "chain" : c && c.rotateMode === "chainScale" ? "chainScale" : "tangent",
        position: Number(c && c.position) || 0,
        spacing: Number(c && c.spacing) || 40,
        rotateMix: math.clamp(Number(c && c.rotateMix) || 0, 0, 1),
        translateMix: math.clamp(Number(c && c.translateMix) || 0, 0, 1),
        skinRequired: !!(c && c.skinRequired),
        closed: !!(c && c.closed),
        order: getConstraintOrder(c, i),
        enabled: c ? c.enabled !== false : true,
      };
    })
    .filter((c) => c.bones.length > 0 && (c.sourceType !== "bone_chain" || c.target >= 0));
  if (!Number.isFinite(state.selectedPath) || state.selectedPath < 0 || state.selectedPath >= m.pathConstraints.length) {
    state.selectedPath = m.pathConstraints.length > 0 ? 0 : -1;
  }
  return m.pathConstraints;
}

function getActivePathConstraint() {
  const m = state.mesh;
  if (!m) return null;
  const list = ensurePathConstraints(m);
  sortConstraintListByOrder(list);
  if (state.selectedPath < 0 || state.selectedPath >= list.length) return null;
  return list[state.selectedPath];
}

function getPathConstrainedBoneSet(m) {
  const out = new Set();
  if (!m) return out;
  for (const c of ensurePathConstraints(m)) {
    if (!c || c.enabled === false) continue;
    for (const bi of c.bones || []) out.add(bi);
  }
  return out;
}

function getPathTargetBoneSet(m) {
  const out = new Set();
  if (!m) return out;
  for (const c of ensurePathConstraints(m)) {
    if (!c || c.enabled === false) continue;
    if (c.sourceType !== "bone_chain") continue;
    const t = Number(c.target);
    if (Number.isFinite(t) && t >= 0) out.add(t);
  }
  return out;
}

function addPathConstraint() {
  const m = state.mesh;
  if (!m || !Array.isArray(m.rigBones) || m.rigBones.length < 1) return false;
  const nextOrder = getNextGlobalConstraintOrder(m);
  const list = ensurePathConstraints(m);
  const target = Number.isFinite(state.selectedBone) && state.selectedBone >= 0 ? state.selectedBone : 0;
  const bone = Number.isFinite(target) && target >= 0 && target < m.rigBones.length ? target : 0;
  list.push({
    name: `path_${list.length}`,
    bones: [bone],
    target,
    sourceType: "drawn",
    targetSlot: state.activeSlot >= 0 ? state.activeSlot : 0,
    points: [],
    positionMode: "fixed",
    spacingMode: "length",
    rotateMode: "tangent",
    position: 0,
    spacing: 40,
    rotateMix: 1,
    translateMix: 1,
    skinRequired: false,
    closed: false,
    order: nextOrder,
    enabled: true,
  });
  state.selectedPath = list.length - 1;
  refreshPathUI();
  refreshTrackSelect();
  renderTimelineTracks();
  return true;
}

function removeSelectedPathConstraint() {
  const m = state.mesh;
  if (!m) return false;
  const list = ensurePathConstraints(m);
  if (state.selectedPath < 0 || state.selectedPath >= list.length) return false;
  list.splice(state.selectedPath, 1);
  state.selectedPath = list.length > 0 ? Math.min(state.selectedPath, list.length - 1) : -1;
  refreshPathUI();
  refreshTrackSelect();
  renderTimelineTracks();
  return true;
}

function getConstraintOrder(c, fallback = 0) {
  const o = Number(c && c.order);
  return Math.max(0, Number.isFinite(o) ? o : fallback);
}

function getNextGlobalConstraintOrder(m) {
  if (!m) return 0;
  let maxOrder = -1;
  const take = (list) => {
    for (const c of list || []) {
      if (!c) continue;
      const o = getConstraintOrder(c, 0);
      if (o > maxOrder) maxOrder = o;
    }
  };
  take(ensureIKConstraints(m));
  take(ensureTransformConstraints(m));
  take(ensurePathConstraints(m));
  return Math.max(0, maxOrder + 1);
}

function sortConstraintListByOrder(list) {
  if (!Array.isArray(list) || list.length <= 1) return;
  list.sort((a, b) => {
    const ao = getConstraintOrder(a, 0);
    const bo = getConstraintOrder(b, 0);
    if (ao !== bo) return ao - bo;
    return 0;
  });
}

function swapConstraintOrder(list, i, j) {
  if (!Array.isArray(list)) return false;
  if (!Number.isFinite(i) || !Number.isFinite(j) || i < 0 || j < 0 || i >= list.length || j >= list.length) return false;
  const a = list[i];
  const b = list[j];
  if (!a || !b) return false;
  const ao = Number.isFinite(Number(a.order)) ? Number(a.order) : i;
  const bo = Number.isFinite(Number(b.order)) ? Number(b.order) : j;
  a.order = bo;
  b.order = ao;
  return true;
}

function buildConstraintExecutionPlan(m) {
  if (!m) return [];
  const ikList = ensureIKConstraints(m);
  const tfcList = ensureTransformConstraints(m);
  const pthList = ensurePathConstraints(m);
  const out = [];
  let seq = 0;
  for (let i = 0; i < ikList.length; i += 1) {
    const c = ikList[i];
    if (!c || c.enabled === false) continue;
    out.push({ type: "ik", order: getConstraintOrder(c, i), seq: seq++, ref: c });
  }
  for (let i = 0; i < tfcList.length; i += 1) {
    const c = tfcList[i];
    if (!c || c.enabled === false) continue;
    out.push({ type: "tfc", order: getConstraintOrder(c, i), seq: seq++, ref: c });
  }
  for (let i = 0; i < pthList.length; i += 1) {
    const c = pthList[i];
    if (!c || c.enabled === false) continue;
    out.push({ type: "pth", order: getConstraintOrder(c, i), seq: seq++, ref: c });
  }
  out.sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order;
    return a.seq - b.seq;
  });
  return out;
}

function collectPathChainPoints(bones, targetBone, closed = false) {
  const pts = [];
  const world = computeWorld(bones);
  let curr = targetBone;
  const visited = new Set();
  while (Number.isFinite(curr) && curr >= 0 && curr < bones.length && !visited.has(curr)) {
    visited.add(curr);
    const head = transformPoint(world[curr], 0, 0);
    const tip = transformPoint(world[curr], Number(bones[curr].length) || 0, 0);
    if (pts.length === 0) pts.push(head);
    pts.push(tip);
    let next = -1;
    for (let i = 0; i < bones.length; i += 1) {
      if (Number(bones[i] && bones[i].parent) === curr) {
        next = i;
        break;
      }
    }
    if (next < 0) break;
    curr = next;
  }
  if (closed && pts.length >= 2) pts.push({ ...pts[0] });
  return pts;
}

function collectSlotContourPathPoints(m, bones, slotIndex, closed = false) {
  if (!m || !Array.isArray(state.slots) || slotIndex < 0 || slotIndex >= state.slots.length) return [];
  const slot = state.slots[slotIndex];
  if (!slot) return [];
  const contour = ensureSlotContour(slot);
  const src = Array.isArray(contour && contour.fillPoints) && contour.fillPoints.length >= 2 ? contour.fillPoints : contour.points;
  if (!Array.isArray(src) || src.length < 2) return [];
  const world = computeWorld(bones);
  const tm = getSlotTransformMatrix(slot, world);
  const pts = src.map((p) => transformPoint(tm, Number(p.x) || 0, Number(p.y) || 0));
  if (closed && pts.length >= 2) pts.push({ ...pts[0] });
  return pts;
}

function samplePolylineAtDistance(points, d, closed = false) {
  if (!Array.isArray(points) || points.length < 2) return null;
  const segs = [];
  let total = 0;
  const n = points.length - 1;
  for (let i = 0; i < n; i += 1) {
    const a = points[i];
    const b = points[i + 1];
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    if (len <= 1e-6) continue;
    segs.push({ a, b, len, start: total, end: total + len });
    total += len;
  }
  if (total <= 1e-6 || segs.length === 0) return null;
  let t = Number(d) || 0;
  if (closed) {
    t = ((t % total) + total) % total;
  } else {
    t = math.clamp(t, 0, total);
  }
  let seg = segs[segs.length - 1];
  for (const s of segs) {
    if (t >= s.start && t <= s.end) {
      seg = s;
      break;
    }
  }
  const u = math.clamp((t - seg.start) / Math.max(1e-6, seg.len), 0, 1);
  const x = seg.a.x + (seg.b.x - seg.a.x) * u;
  const y = seg.a.y + (seg.b.y - seg.a.y) * u;
  const ang = Math.atan2(seg.b.y - seg.a.y, seg.b.x - seg.a.x);
  return { x, y, angle: ang, total };
}

function applySinglePathConstraintToBones(m, bones, c) {
  if (!m || !bones || !c || c.enabled === false) return;
  const ti = Number(c.target);
  if (c.sourceType === "bone_chain" && (!Number.isFinite(ti) || ti < 0 || ti >= bones.length)) return;
  const pathPts =
    c.sourceType === "bone_chain"
      ? collectPathChainPoints(bones, ti, !!c.closed)
      : c.sourceType === "slot"
        ? collectSlotContourPathPoints(m, bones, Number(c.targetSlot), !!c.closed)
        : collectDrawnPathPoints(c, !!c.closed);
  if (!pathPts || pathPts.length < 2) return;
  const tMix = math.clamp(Number(c.translateMix) || 0, 0, 1);
  const rMix = math.clamp(Number(c.rotateMix) || 0, 0, 1);
  for (let k = 0; k < c.bones.length; k += 1) {
    const bi = Number(c.bones[k]);
    if (!Number.isFinite(bi) || bi < 0 || bi >= bones.length || (c.sourceType === "bone_chain" && bi === ti)) continue;
    const smp = samplePolylineAtDistance(pathPts, (Number(c.position) || 0) + k * (Number(c.spacing) || 0), !!c.closed);
    if (!smp) continue;
    const world = computeWorld(bones);
    const ep = getBoneWorldEndpointsFromBones(bones, bi, world);
    const currAngle = Math.atan2(ep.tip.y - ep.head.y, ep.tip.x - ep.head.x);
    const len = Math.max(1, Number(bones[bi].length) || Math.hypot(ep.tip.x - ep.head.x, ep.tip.y - ep.head.y));
    const nx = ep.head.x + (smp.x - ep.head.x) * tMix;
    const ny = ep.head.y + (smp.y - ep.head.y) * tMix;
    const na = lerpAngle(currAngle, smp.angle, rMix);
    const tip = { x: nx + Math.cos(na) * len, y: ny + Math.sin(na) * len };
    setBoneFromWorldEndpoints(bones, bi, { x: nx, y: ny }, tip);
  }
}

function applyPathConstraintsToBones(m, bones) {
  if (!m || !bones || bones.length === 0) return;
  const list = ensurePathConstraints(m);
  if (list.length === 0) return;
  const ordered = [...list].sort((a, b) => getConstraintOrder(a, 0) - getConstraintOrder(b, 0));
  for (const c of ordered) applySinglePathConstraintToBones(m, bones, c);
}

function refreshPathUI() {
  const m = state.mesh;
  if (!els.pathSelect) return;
  if (!m || !Array.isArray(m.rigBones) || m.rigBones.length === 0) {
    els.pathSelect.innerHTML = "";
    if (els.pathList) els.pathList.innerHTML = "<div class='muted'>No bones.</div>";
    return;
  }
  const list = ensurePathConstraints(m);
  const prevSelected = state.selectedPath >= 0 && state.selectedPath < list.length ? list[state.selectedPath] : null;
  sortConstraintListByOrder(list);
  if (prevSelected) state.selectedPath = list.indexOf(prevSelected);
  if (state.selectedPath < 0 || state.selectedPath >= list.length) state.selectedPath = list.length > 0 ? 0 : -1;
  const fillBoneSelect = (sel, allowNone = false) => {
    if (!sel) return;
    sel.innerHTML = "";
    if (allowNone) {
      const none = document.createElement("option");
      none.value = "-1";
      none.textContent = "-1: None";
      sel.appendChild(none);
    }
    for (let i = 0; i < m.rigBones.length; i += 1) {
      const opt = document.createElement("option");
      opt.value = String(i);
      opt.textContent = `${i}: ${m.rigBones[i].name}`;
      sel.appendChild(opt);
    }
  };
  fillBoneSelect(els.pathTargetBone, true);
  fillBoneSelect(els.pathBones, false);
  if (els.pathTargetSlot) {
    els.pathTargetSlot.innerHTML = "";
    for (let i = 0; i < state.slots.length; i += 1) {
      const s = state.slots[i];
      const opt = document.createElement("option");
      opt.value = String(i);
      opt.textContent = `${i}: ${s && s.name ? s.name : `slot_${i}`}`;
      els.pathTargetSlot.appendChild(opt);
    }
  }
  els.pathSelect.innerHTML = "";
  for (let i = 0; i < list.length; i += 1) {
    const c = list[i];
    const opt = document.createElement("option");
    opt.value = String(i);
    opt.textContent = `${i}: ${c.name}`;
    els.pathSelect.appendChild(opt);
  }
  if (els.pathList) {
    els.pathList.innerHTML = "";
    if (list.length === 0) {
      els.pathList.innerHTML = "<div class='muted'>No Path constraints yet.</div>";
    } else {
      for (let i = 0; i < list.length; i += 1) {
        const c = list[i];
        const row = document.createElement("div");
        row.className = `tree-item${state.selectedPath === i ? " selected" : ""}`;
        row.dataset.pathIndex = String(i);
        row.textContent = `${i}: ${c.name}${c.enabled === false ? " (off)" : ""}`;
        els.pathList.appendChild(row);
      }
    }
  }
  const c = getActivePathConstraint();
  if (els.pathMoveUpBtn) els.pathMoveUpBtn.disabled = !c || state.selectedPath <= 0;
  if (els.pathMoveDownBtn) els.pathMoveDownBtn.disabled = !c || state.selectedPath >= list.length - 1;
  if (els.pathRemoveBtn) els.pathRemoveBtn.disabled = !c;
  if (els.pathDrawBtn) els.pathDrawBtn.disabled = !c;
  if (els.pathStopDrawBtn) els.pathStopDrawBtn.disabled = !state.pathEdit.drawArmed;
  if (els.pathCloseShapeBtn) els.pathCloseShapeBtn.disabled = !c;
  if (els.pathClearShapeBtn) els.pathClearShapeBtn.disabled = !c;
  if (els.pathApplyHandleModeBtn) els.pathApplyHandleModeBtn.disabled = !c;
  if (!c) {
    if (els.pathTargetBone) els.pathTargetBone.disabled = true;
    if (els.pathTargetSlot) els.pathTargetSlot.disabled = true;
    if (els.pathPositionMode) els.pathPositionMode.disabled = true;
    if (els.pathSpacingMode) els.pathSpacingMode.disabled = true;
    if (els.pathRotateMode) els.pathRotateMode.disabled = true;
    if (els.pathSkinRequired) els.pathSkinRequired.disabled = true;
    if (els.pathHandleMode) els.pathHandleMode.disabled = true;
    if (els.pathApplyHandleModeBtn) els.pathApplyHandleModeBtn.disabled = true;
    if (els.pathHint) els.pathHint.textContent = "No Path constraint. Add one.";
    return;
  }
  if (els.pathSelect) els.pathSelect.value = String(state.selectedPath);
  if (els.pathName) els.pathName.value = c.name || `path_${state.selectedPath}`;
  if (els.pathTargetBone) els.pathTargetBone.value = String(c.target);
  if (els.pathSourceType) {
    if (c.sourceType === "bone_chain") els.pathSourceType.value = "bone_chain";
    else if (c.sourceType === "slot") els.pathSourceType.value = "slot";
    else els.pathSourceType.value = "drawn";
  }
  if (els.pathTargetSlot && state.slots.length > 0) {
    const si = Number.isFinite(Number(c.targetSlot)) ? Math.max(0, Math.min(state.slots.length - 1, Number(c.targetSlot))) : 0;
    els.pathTargetSlot.value = String(si);
  }
  if (els.pathTargetBone) els.pathTargetBone.disabled = c.sourceType !== "bone_chain";
  if (els.pathTargetSlot) els.pathTargetSlot.disabled = c.sourceType !== "slot";
  if (els.pathPositionMode) els.pathPositionMode.disabled = false;
  if (els.pathSpacingMode) els.pathSpacingMode.disabled = false;
  if (els.pathRotateMode) els.pathRotateMode.disabled = false;
  if (els.pathSkinRequired) els.pathSkinRequired.disabled = false;
  if (els.pathHandleMode) {
    const i = Number(state.pathEdit.activePoint);
    const hasPoint = c.sourceType === "drawn" && Array.isArray(c.points) && i >= 0 && i < c.points.length;
    els.pathHandleMode.disabled = !hasPoint;
    const mode = hasPoint ? normalizePathNode(c.points[i]).handleMode : "aligned";
    els.pathHandleMode.value = mode;
  }
  if (els.pathEnabled) els.pathEnabled.value = c.enabled === false ? "false" : "true";
  if (els.pathPositionMode) els.pathPositionMode.value = c.positionMode === "percent" ? "percent" : "fixed";
  if (els.pathSpacingMode) {
    els.pathSpacingMode.value =
      c.spacingMode === "fixed" ? "fixed" : c.spacingMode === "percent" ? "percent" : c.spacingMode === "proportional" ? "proportional" : "length";
  }
  if (els.pathRotateMode) {
    els.pathRotateMode.value = c.rotateMode === "chain" ? "chain" : c.rotateMode === "chainScale" ? "chainScale" : "tangent";
  }
  if (els.pathPosition) els.pathPosition.value = String(Number(c.position) || 0);
  if (els.pathSpacing) els.pathSpacing.value = String(Number(c.spacing) || 0);
  if (els.pathRotateMix) els.pathRotateMix.value = String(Number(c.rotateMix || 0).toFixed(3));
  if (els.pathTranslateMix) els.pathTranslateMix.value = String(Number(c.translateMix || 0).toFixed(3));
  if (els.pathSkinRequired) els.pathSkinRequired.checked = !!c.skinRequired;
  if (els.pathClosed) els.pathClosed.value = c.closed ? "true" : "false";
  if (els.pathBones) {
    const set = new Set((c.bones || []).map((v) => Number(v)));
    for (const opt of els.pathBones.options) opt.selected = set.has(Number(opt.value));
  }
  if (els.pathHint) {
    const tName = m.rigBones[c.target] ? m.rigBones[c.target].name : c.target;
    const slotName =
      Number.isFinite(Number(c.targetSlot)) && Number(c.targetSlot) >= 0 && Number(c.targetSlot) < state.slots.length
        ? state.slots[Number(c.targetSlot)]?.name || `slot_${Number(c.targetSlot)}`
        : "(none)";
    const bNames = (c.bones || []).map((bi) => m.rigBones[bi]?.name || bi).join(", ");
    const sourceText =
      c.sourceType === "bone_chain"
        ? `${tName} chain`
        : c.sourceType === "slot"
          ? `slot "${slotName}" contour`
          : `drawn path (${Array.isArray(c.points) ? c.points.length : 0} pts)`;
    const drawState = state.pathEdit.drawArmed ? " | draw: armed" : "";
    const selInfo =
      c.sourceType === "drawn" && Number.isFinite(Number(state.pathEdit.activePoint)) && Number(state.pathEdit.activePoint) >= 0
        ? ` | sel:${Number(state.pathEdit.activePoint)}`
        : "";
    els.pathHint.textContent = `Path ${c.name}: [${bNames}] along ${sourceText}, pos ${Number(c.position).toFixed(
      1
    )}, spacing ${Number(c.spacing).toFixed(1)} (${c.positionMode}/${c.spacingMode}/${c.rotateMode})${drawState}${selInfo}. Drag node/handles (orange=in, green=out).`;
  }
}

function applyActivePathFromUI(updateBones = false) {
  const m = state.mesh;
  const c = getActivePathConstraint();
  if (!m || !c) return false;
  const prev = {
    position: Number(c.position) || 0,
    spacing: Number(c.spacing) || 0,
    rotateMix: Number(c.rotateMix) || 0,
    translateMix: Number(c.translateMix) || 0,
  };
  c.name = els.pathName ? els.pathName.value.trim() || c.name : c.name;
  c.target = Number(els.pathTargetBone ? els.pathTargetBone.value : c.target);
  c.sourceType =
    els.pathSourceType && els.pathSourceType.value === "bone_chain"
      ? "bone_chain"
      : els.pathSourceType && els.pathSourceType.value === "slot"
        ? "slot"
        : "drawn";
  if (c.sourceType !== "drawn") {
    state.pathEdit.drawArmed = false;
    state.pathEdit.activePoint = -1;
    state.pathEdit.activeHandle = "";
  }
  c.targetSlot = Number(els.pathTargetSlot ? els.pathTargetSlot.value : c.targetSlot);
  c.enabled = !els.pathEnabled || els.pathEnabled.value !== "false";
  c.positionMode = els.pathPositionMode && els.pathPositionMode.value === "percent" ? "percent" : "fixed";
  c.spacingMode =
    els.pathSpacingMode && els.pathSpacingMode.value === "fixed"
      ? "fixed"
      : els.pathSpacingMode && els.pathSpacingMode.value === "percent"
        ? "percent"
        : els.pathSpacingMode && els.pathSpacingMode.value === "proportional"
          ? "proportional"
          : "length";
  c.rotateMode =
    els.pathRotateMode && els.pathRotateMode.value === "chain"
      ? "chain"
      : els.pathRotateMode && els.pathRotateMode.value === "chainScale"
        ? "chainScale"
        : "tangent";
  c.position = Number(els.pathPosition ? els.pathPosition.value : c.position) || 0;
  c.spacing = Number(els.pathSpacing ? els.pathSpacing.value : c.spacing) || 0;
  c.rotateMix = math.clamp(Number(els.pathRotateMix ? els.pathRotateMix.value : c.rotateMix) || 0, 0, 1);
  c.translateMix = math.clamp(Number(els.pathTranslateMix ? els.pathTranslateMix.value : c.translateMix) || 0, 0, 1);
  c.skinRequired = !!(els.pathSkinRequired && els.pathSkinRequired.checked);
  c.closed = !!(els.pathClosed && els.pathClosed.value === "true");
  if (updateBones && els.pathBones) {
    const picked = Array.from(els.pathBones.selectedOptions)
      .map((o) => Number(o.value))
      .filter((v) => Number.isFinite(v));
    c.bones = [...new Set(picked)].filter((bi) => (c.sourceType === "bone_chain" ? bi !== c.target : true));
  }
  ensurePathConstraints(m);
  if (Math.abs((Number(c.position) || 0) - prev.position) > 1e-6) markDirtyTrack(getPathTrackId(state.selectedPath, "position"));
  if (Math.abs((Number(c.spacing) || 0) - prev.spacing) > 1e-6) markDirtyTrack(getPathTrackId(state.selectedPath, "spacing"));
  if (Math.abs((Number(c.rotateMix) || 0) - prev.rotateMix) > 1e-6) markDirtyTrack(getPathTrackId(state.selectedPath, "rotateMix"));
  if (Math.abs((Number(c.translateMix) || 0) - prev.translateMix) > 1e-6)
    markDirtyTrack(getPathTrackId(state.selectedPath, "translateMix"));
  refreshPathUI();
  refreshTrackSelect();
  renderTimelineTracks();
  return true;
}

function addPointToActivePath(x, y) {
  const c = getActivePathConstraint();
  if (!c) return false;
  if (!Array.isArray(c.points)) c.points = [];
  const px = Number(x) || 0;
  const py = Number(y) || 0;
  if (c.points.length > 0) {
    const last = normalizePathNode(c.points[c.points.length - 1]);
    if (Math.hypot(px - (Number(last.x) || 0), py - (Number(last.y) || 0)) <= 0.5) return false;
    const dx = px - last.x;
    const dy = py - last.y;
    // Keep a visible 3-point node shape (in/anchor/out) like Spine.
    last.houtx = last.x + dx / 3;
    last.houty = last.y + dy / 3;
    if (!last.broken) {
      last.hinx = last.x - dx / 3;
      last.hiny = last.y - dy / 3;
    }
    c.points[c.points.length - 1] = last;
    c.points.push({
      x: px,
      y: py,
      hinx: px - dx / 3,
      hiny: py - dy / 3,
      houtx: px + dx / 3,
      houty: py + dy / 3,
      broken: false,
      handleMode: "aligned",
    });
  } else {
    c.points.push({ x: px, y: py, hinx: px, hiny: py, houtx: px, houty: py, broken: false, handleMode: "auto" });
  }
  if (c.points.length >= 2) c.sourceType = "drawn";
  applyAutoHandlesForConstraint(c);
  state.pathEdit.activePoint = c.points.length - 1;
  state.pathEdit.activeHandle = "point";
  refreshPathUI();
  return true;
}

function clearActivePathShape() {
  const c = getActivePathConstraint();
  if (!c) return false;
  c.points = [];
  c.closed = false;
  state.pathEdit.activePoint = -1;
  state.pathEdit.activeHandle = "";
  if (els.pathClosed) els.pathClosed.value = "false";
  refreshPathUI();
  renderTimelineTracks();
  return true;
}

function closeActivePathShape() {
  const c = getActivePathConstraint();
  if (!c) return false;
  const pts = Array.isArray(c.points) ? c.points : [];
  if (pts.length < 3) return false;
  c.closed = true;
  c.sourceType = "drawn";
  applyAutoHandlesForConstraint(c);
  if (els.pathClosed) els.pathClosed.value = "true";
  refreshPathUI();
  renderTimelineTracks();
  return true;
}

function applyHandleModeToSelectedPathPoint(mode) {
  const c = getActivePathConstraint();
  if (!c || c.sourceType !== "drawn" || !Array.isArray(c.points)) return false;
  const i = Number(state.pathEdit.activePoint);
  if (!Number.isFinite(i) || i < 0 || i >= c.points.length) return false;
  const p = normalizePathNode(c.points[i]);
  const m = mode === "auto" ? "auto" : mode === "broken" ? "broken" : "aligned";
  p.handleMode = m;
  p.broken = m === "broken";
  if (m === "auto") {
    c.points[i] = p;
    applyAutoHandlesForConstraint(c);
  } else {
    c.points[i] = p;
  }
  refreshPathUI();
  return true;
}

function normalizePathNode(p) {
  const x = Number(p && p.x) || 0;
  const y = Number(p && p.y) || 0;
  const hinx = Number.isFinite(Number(p && p.hinx)) ? Number(p.hinx) : x;
  const hiny = Number.isFinite(Number(p && p.hiny)) ? Number(p.hiny) : y;
  const houtx = Number.isFinite(Number(p && p.houtx)) ? Number(p.houtx) : x;
  const houty = Number.isFinite(Number(p && p.houty)) ? Number(p.houty) : y;
  const handleMode = p && p.handleMode === "auto" ? "auto" : p && p.handleMode === "broken" ? "broken" : "aligned";
  return { x, y, hinx, hiny, houtx, houty, broken: handleMode === "broken", handleMode };
}

function getDrawnPathNodes(pathConstraint) {
  const src = Array.isArray(pathConstraint && pathConstraint.points) ? pathConstraint.points : [];
  return src.map((p) => normalizePathNode(p));
}

function normalizeVec(x, y) {
  const l = Math.hypot(x, y);
  if (l <= 1e-6) return { x: 1, y: 0, len: 0 };
  return { x: x / l, y: y / l, len: l };
}

function applyAutoHandleForNode(nodes, i, closed) {
  if (!Array.isArray(nodes) || i < 0 || i >= nodes.length) return;
  const n = nodes.length;
  const curr = nodes[i];
  if (!curr || curr.handleMode !== "auto") return;
  const prevIndex = i > 0 ? i - 1 : closed ? n - 1 : -1;
  const nextIndex = i < n - 1 ? i + 1 : closed ? 0 : -1;
  if (prevIndex < 0 && nextIndex < 0) return;
  const prev = prevIndex >= 0 ? nodes[prevIndex] : null;
  const next = nextIndex >= 0 ? nodes[nextIndex] : null;
  const toPrev = prev ? normalizeVec(curr.x - prev.x, curr.y - prev.y) : null;
  const toNext = next ? normalizeVec(next.x - curr.x, next.y - curr.y) : null;
  let tx = 1;
  let ty = 0;
  if (toPrev && toNext) {
    tx = toPrev.x + toNext.x;
    ty = toPrev.y + toNext.y;
    const t = normalizeVec(tx, ty);
    tx = t.x;
    ty = t.y;
  } else if (toNext) {
    tx = toNext.x;
    ty = toNext.y;
  } else if (toPrev) {
    tx = toPrev.x;
    ty = toPrev.y;
  }
  const inLen = toPrev ? Math.max(8, toPrev.len / 3) : Math.max(8, (toNext ? toNext.len : 24) / 3);
  const outLen = toNext ? Math.max(8, toNext.len / 3) : Math.max(8, (toPrev ? toPrev.len : 24) / 3);
  curr.hinx = curr.x - tx * inLen;
  curr.hiny = curr.y - ty * inLen;
  curr.houtx = curr.x + tx * outLen;
  curr.houty = curr.y + ty * outLen;
}

function applyAutoHandlesForConstraint(c) {
  if (!c || !Array.isArray(c.points) || c.points.length === 0) return;
  const nodes = c.points.map((p) => normalizePathNode(p));
  for (let i = 0; i < nodes.length; i += 1) applyAutoHandleForNode(nodes, i, !!c.closed);
  c.points = nodes;
}

function cubicBezierPoint(p0, c1, c2, p1, t) {
  const u = 1 - t;
  const uu = u * u;
  const tt = t * t;
  const uuu = uu * u;
  const ttt = tt * t;
  return {
    x: uuu * p0.x + 3 * uu * t * c1.x + 3 * u * tt * c2.x + ttt * p1.x,
    y: uuu * p0.y + 3 * uu * t * c1.y + 3 * u * tt * c2.y + ttt * p1.y,
  };
}

function collectDrawnPathPoints(pathConstraint, closed = false) {
  const nodes = getDrawnPathNodes(pathConstraint);
  if (nodes.length < 2) return [];
  const out = [{ x: nodes[0].x, y: nodes[0].y }];
  const segCount = closed ? nodes.length : nodes.length - 1;
  const steps = 12;
  for (let i = 0; i < segCount; i += 1) {
    const a = nodes[i];
    const b = nodes[(i + 1) % nodes.length];
    const p0 = { x: a.x, y: a.y };
    const c1 = { x: a.houtx, y: a.houty };
    const c2 = { x: b.hinx, y: b.hiny };
    const p1 = { x: b.x, y: b.y };
    for (let s = 1; s <= steps; s += 1) {
      out.push(cubicBezierPoint(p0, c1, c2, p1, s / steps));
    }
  }
  return out;
}

function pickActivePathDrawControl(mx, my) {
  if (state.editMode !== "skeleton" || state.leftToolTab !== "path") return null;
  const c = getActivePathConstraint();
  if (!c || c.sourceType !== "drawn") return null;
  const nodes = getDrawnPathNodes(c);
  if (nodes.length === 0) return null;
  const maxD2 = 10 * 10;
  let best = null;
  const test = (kind, index, x, y, pri) => {
    const s = localToScreen(x, y);
    const dx = s.x - mx;
    const dy = s.y - my;
    const d2 = dx * dx + dy * dy;
    if (d2 > maxD2) return;
    if (!best || d2 < best.d2 || (Math.abs(d2 - best.d2) < 0.001 && pri < best.pri)) {
      best = { kind, index, d2, pri };
    }
  };
  for (let i = 0; i < nodes.length; i += 1) {
    const p = nodes[i];
    // Prefer handle picking over anchor when overlap is close.
    test("in", i, p.hinx, p.hiny, 0);
    test("out", i, p.houtx, p.houty, 0);
    test("point", i, p.x, p.y, 1);
  }
  return best;
}

function getActiveIKConstraint() {
  const m = state.mesh;
  if (!m) return null;
  const list = ensureIKConstraints(m);
  sortConstraintListByOrder(list);
  if (state.selectedIK < 0 || state.selectedIK >= list.length) return null;
  return list[state.selectedIK];
}

function getIkConstrainedBoneSet(m) {
  const out = new Set();
  if (!m) return out;
  const list = ensureIKConstraints(m);
  for (const ik of list) {
    if (!ik || ik.enabled === false) continue;
    for (const bi of ik.bones || []) out.add(bi);
  }
  return out;
}

function getIkTargetBoneSet(m) {
  const out = new Set();
  if (!m) return out;
  const list = ensureIKConstraints(m);
  for (const ik of list) {
    if (!ik || ik.enabled === false) continue;
    const t = Number(ik.target);
    if (Number.isFinite(t) && t >= 0) out.add(t);
  }
  return out;
}

function resolveTwoBoneChain(m, selectedIndex) {
  if (!m || !Array.isArray(m.rigBones) || m.rigBones.length === 0) return null;
  const bones = m.rigBones;
  const sel = Number.isFinite(selectedIndex) ? selectedIndex : -1;
  if (sel < 0 || sel >= bones.length) return null;
  const parent = Number(bones[sel] && bones[sel].parent);
  if (Number.isFinite(parent) && parent >= 0 && parent < bones.length) {
    // Prefer parent->selected, so selecting a mid-chain bone gives the expected upper segment IK.
    return [parent, sel];
  }
  for (let i = 0; i < bones.length; i += 1) {
    if (Number(bones[i] && bones[i].parent) === sel) return [sel, i];
  }
  return null;
}

function addIKConstraint(twoBone = false) {
  const m = state.mesh;
  if (!m || !Array.isArray(m.rigBones) || m.rigBones.length === 0) return false;
  const nextOrder = getNextGlobalConstraintOrder(m);
  const list = ensureIKConstraints(m);
  const uiSel = Number(els.boneSelect ? els.boneSelect.value : state.selectedBone);
  const sel = Number.isFinite(uiSel) ? uiSel : Number(state.selectedBone);
  let a = Number.isFinite(sel) && sel >= 0 && sel < m.rigBones.length ? sel : 0;
  let b = -1;
  if (twoBone) {
    const chain = resolveTwoBoneChain(m, a);
    if (!chain) return false;
    a = chain[0];
    b = chain[1];
  }
  const chain = twoBone ? [a, b] : [a];
  const target = Number.isFinite(sel) && sel >= 0 && sel < m.rigBones.length && !chain.includes(sel) ? sel : -1;
  const pose = getPoseBones(m);
  const tempIK = { bones: chain, endMode: twoBone ? "head" : "tail" };
  const tp = getIKConstraintEndPointWorld(pose, tempIK) || { x: 0, y: 0 };
  const ik = {
    name: `ik_${list.length}`,
    bones: chain,
    target,
    targetX: tp.x,
    targetY: tp.y,
    mix: 1,
    softness: 0,
    bendPositive: true,
    compress: false,
    stretch: false,
    uniform: false,
    order: nextOrder,
    skinRequired: false,
    enabled: true,
    endMode: twoBone ? "head" : "tail",
  };
  list.push(ik);
  state.selectedIK = list.length - 1;
  refreshIKUI();
  refreshTrackSelect();
  renderTimelineTracks();
  renderBoneTree();
  return true;
}

function removeSelectedIKConstraint() {
  const m = state.mesh;
  if (!m) return false;
  const list = ensureIKConstraints(m);
  if (state.selectedIK < 0 || state.selectedIK >= list.length) return false;
  list.splice(state.selectedIK, 1);
  state.selectedIK = list.length > 0 ? Math.min(state.selectedIK, list.length - 1) : -1;
  refreshIKUI();
  refreshTrackSelect();
  renderTimelineTracks();
  renderBoneTree();
  return true;
}

function remapIKAfterBoneRemoved(m, removed) {
  if (!m || !Array.isArray(m.ikConstraints)) return;
  const out = [];
  for (const c of m.ikConstraints) {
    if (!c) continue;
    const bones = (c.bones || []).map((bi) => {
      if (bi === removed) return -1;
      return bi > removed ? bi - 1 : bi;
    });
    const target = c.target === removed ? -1 : c.target > removed ? c.target - 1 : c.target;
    if (bones.some((bi) => bi < 0)) continue;
    if (bones.length >= 2 && Number(m.rigBones[bones[1]] && m.rigBones[bones[1]].parent) !== bones[0]) continue;
    out.push({ ...c, bones, target });
  }
  m.ikConstraints = out;
  if (state.selectedIK >= out.length) state.selectedIK = out.length - 1;
}

function solveOneBoneIK(bones, boneIndex, target, mix = 1) {
  if (!bones || boneIndex < 0 || boneIndex >= bones.length) return;
  const b = bones[boneIndex];
  if (!b) return;
  normalizeBoneChannels(b);
  const world = computeWorld(bones);
  const head = transformPoint(world[boneIndex], 0, 0);
  const parentWorld = b.parent >= 0 ? world[b.parent] : createIdentity();
  const desiredWorld = Math.atan2(target.y - head.y, target.x - head.x);
  const desiredLocal = desiredWorld - matrixAngle(parentWorld) - (Number(b.shx) || 0);
  b.rot = lerpAngle(Number(b.rot) || 0, desiredLocal, math.clamp(mix, 0, 1));
}

function solveTwoBoneIK(bones, parentIndex, childIndex, target, mix = 1, bendPositive = true) {
  if (!bones || parentIndex < 0 || childIndex < 0 || parentIndex >= bones.length || childIndex >= bones.length) return;
  const parent = bones[parentIndex];
  const child = bones[childIndex];
  if (!parent || !child) return;
  if (Number(child.parent) !== parentIndex) return;
  normalizeBoneChannels(parent);
  normalizeBoneChannels(child);
  const world = computeWorld(bones);
  const head = transformPoint(world[parentIndex], 0, 0);
  const joint = transformPoint(world[parentIndex], Number(parent.length) || 0, 0);
  const tip = transformPoint(world[childIndex], Number(child.length) || 0, 0);
  const l1 = Math.max(1e-6, Math.hypot(joint.x - head.x, joint.y - head.y));
  const l2 = Math.max(1e-6, Math.hypot(tip.x - joint.x, tip.y - joint.y));
  const dx = target.x - head.x;
  const dy = target.y - head.y;
  const dd = Math.hypot(dx, dy);
  const d = math.clamp(dd, Math.abs(l1 - l2) + 1e-6, l1 + l2 - 1e-6);
  const cos2 = math.clamp((d * d - l1 * l1 - l2 * l2) / (2 * l1 * l2), -1, 1);
  const a2 = Math.acos(cos2) * (bendPositive ? 1 : -1);
  const base = Math.atan2(dy, dx);
  const cosOff = math.clamp((d * d + l1 * l1 - l2 * l2) / (2 * Math.max(1e-6, d) * l1), -1, 1);
  const off = Math.acos(cosOff);
  const a1 = bendPositive ? base - off : base + off;
  const ppWorld = parent.parent >= 0 ? world[parent.parent] : createIdentity();
  const desiredParentLocal = a1 - matrixAngle(ppWorld) - (Number(parent.shx) || 0);
  parent.rot = lerpAngle(Number(parent.rot) || 0, desiredParentLocal, math.clamp(mix, 0, 1));
  const world2 = computeWorld(bones);
  const pWorld = world2[parentIndex];
  const desiredChildLocal = a1 + a2 - matrixAngle(pWorld) - (Number(child.shx) || 0);
  child.rot = lerpAngle(Number(child.rot) || 0, desiredChildLocal, math.clamp(mix, 0, 1));
}

function solveTwoBoneHeadTarget(bones, parentIndex, childIndex, target, mix = 1) {
  if (!bones || parentIndex < 0 || childIndex < 0 || parentIndex >= bones.length || childIndex >= bones.length) return;
  const parent = bones[parentIndex];
  const child = bones[childIndex];
  if (!parent || !child) return;
  if (Number(child.parent) !== parentIndex) return;
  normalizeBoneChannels(parent);
  const world = computeWorld(bones);
  const head = transformPoint(world[parentIndex], 0, 0);
  const ppWorld = parent.parent >= 0 ? world[parent.parent] : createIdentity();
  const desiredWorld = Math.atan2(target.y - head.y, target.x - head.x);
  const desiredParentLocal = desiredWorld - matrixAngle(ppWorld) - (Number(parent.shx) || 0);
  parent.rot = lerpAngle(Number(parent.rot) || 0, desiredParentLocal, math.clamp(mix, 0, 1));
}

function headTargetToTailTarget(bones, childIndex, headTarget) {
  if (!bones || childIndex < 0 || childIndex >= bones.length || !headTarget) return headTarget;
  const child = bones[childIndex];
  if (!child) return headTarget;
  const world = computeWorld(bones);
  const m = world[childIndex];
  const ang = matrixAngle(m);
  const len = Number(child.length) || 0;
  return {
    x: headTarget.x + Math.cos(ang) * len,
    y: headTarget.y + Math.sin(ang) * len,
  };
}

function applySingleTransformConstraintToBones(m, bones, c) {
  if (!m || !bones || !c || c.enabled === false) return;
  const ti = Number(c.target);
  if (!Number.isFinite(ti) || ti < 0 || ti >= bones.length) return;
  const tb = bones[ti];
  if (!tb) return;
  normalizeBoneChannels(tb);
  const rMix = math.clamp(Number(c.rotateMix) || 0, 0, 1);
  const tMix = math.clamp(Number(c.translateMix) || 0, 0, 1);
  const sMix = math.clamp(Number(c.scaleMix) || 0, 0, 1);
  const shMix = math.clamp(Number(c.shearMix) || 0, 0, 1);
  const offRot = math.degToRad(Number(c.offsetRot) || 0);
  const offShearY = math.degToRad(Number(c.offsetShearY) || 0);
  const offX = Number(c.offsetX) || 0;
  const offY = Number(c.offsetY) || 0;
  const offSX = Number(c.offsetScaleX) || 0;
  const offSY = Number(c.offsetScaleY) || 0;
  const relative = !!c.relative;
  const useLocal = !!c.local;
  for (const bi of c.bones || []) {
    if (!Number.isFinite(bi) || bi < 0 || bi >= bones.length || bi === ti) continue;
    const b = bones[bi];
    if (!b) continue;
    normalizeBoneChannels(b);
    if (!useLocal) {
      const world = computeWorld(bones);
      const tw = world[ti];
      const pw = Number(b.parent) >= 0 ? world[b.parent] : createIdentity();
      const targetHead = transformPoint(tw, 0, 0);
      const targetRotW = matrixAngle(tw);
      if (relative) {
        if (tMix > 0) {
          b.tx += (targetHead.x + offX) * tMix;
          b.ty += (targetHead.y + offY) * tMix;
        }
        if (rMix > 0) b.rot += (targetRotW + offRot) * rMix;
      } else {
        if (tMix > 0) {
          const desiredWorld = { x: targetHead.x + offX, y: targetHead.y + offY };
          const desiredLocal = transformPoint(invert(pw), desiredWorld.x, desiredWorld.y);
          b.tx += (desiredLocal.x - b.tx) * tMix;
          b.ty += (desiredLocal.y - b.ty) * tMix;
        }
        if (rMix > 0) {
          const desiredLocalRot = targetRotW + offRot - matrixAngle(pw) - (Number(b.shx) || 0);
          b.rot = lerpAngle(b.rot, desiredLocalRot, rMix);
        }
      }
      if (sMix > 0) {
        b.sx += ((tb.sx + offSX) - b.sx) * sMix;
        b.sy += ((tb.sy + offSY) - b.sy) * sMix;
      }
      if (shMix > 0) {
        b.shx += (tb.shx - b.shx) * shMix;
        b.shy += ((tb.shy + offShearY) - b.shy) * shMix;
      }
      continue;
    }
    if (relative) {
      if (tMix > 0) {
        b.tx += (tb.tx + offX) * tMix;
        b.ty += (tb.ty + offY) * tMix;
      }
      if (rMix > 0) b.rot += (tb.rot + offRot) * rMix;
      if (sMix > 0) {
        b.sx += ((tb.sx - 1) + offSX) * sMix;
        b.sy += ((tb.sy - 1) + offSY) * sMix;
      }
      if (shMix > 0) {
        b.shx += tb.shx * shMix;
        b.shy += (tb.shy + offShearY) * shMix;
      }
    } else {
      if (tMix > 0) {
        b.tx += ((tb.tx + offX) - b.tx) * tMix;
        b.ty += ((tb.ty + offY) - b.ty) * tMix;
      }
      if (rMix > 0) b.rot = lerpAngle(b.rot, tb.rot + offRot, rMix);
      if (sMix > 0) {
        b.sx += ((tb.sx + offSX) - b.sx) * sMix;
        b.sy += ((tb.sy + offSY) - b.sy) * sMix;
      }
      if (shMix > 0) {
        b.shx += (tb.shx - b.shx) * shMix;
        b.shy += ((tb.shy + offShearY) - b.shy) * shMix;
      }
    }
  }
}

function applyTransformConstraintsToBones(m, bones) {
  if (!m || !bones || bones.length === 0) return;
  const list = ensureTransformConstraints(m);
  if (list.length === 0) return;
  const ordered = [...list].sort((a, b) => getConstraintOrder(a, 0) - getConstraintOrder(b, 0));
  for (const c of ordered) applySingleTransformConstraintToBones(m, bones, c);
}

function applySingleIKConstraintToBones(bones, ik) {
  if (!bones || !ik || ik.enabled === false) return;
  const tp = getIKSolveTargetWorld(bones, ik);
  if (!tp) return;
  const mix = math.clamp(Number(ik.mix) || 0, 0, 1);
  if (mix <= 0) return;
  const softness = Math.max(0, Number(ik.softness) || 0);
  const compress = !!ik.compress;
  const stretch = !!ik.stretch;
  const uniform = !!ik.uniform;
  const softenDistance = (dist, limit) => {
    if (!(softness > 1e-6) || dist <= limit) return dist;
    const over = dist - limit;
    const softened = limit + over * (1 - Math.exp(-over / Math.max(1e-6, softness)));
    return softened;
  };
  if ((ik.bones || []).length >= 2) {
    const aIdx = Number(ik.bones[0]);
    const bIdx = Number(ik.bones[1]);
    if (Number.isFinite(aIdx) && Number.isFinite(bIdx) && aIdx >= 0 && bIdx >= 0 && aIdx < bones.length && bIdx < bones.length) {
      const world = computeWorld(bones);
      const head = transformPoint(world[aIdx], 0, 0);
      const l1 = Math.max(1e-6, Number(bones[aIdx].length) || 0);
      const l2 = Math.max(1e-6, Number(bones[bIdx].length) || 0);
      const dx = tp.x - head.x;
      const dy = tp.y - head.y;
      const rawDist = Math.hypot(dx, dy);
      const total = l1 + l2;
      const minD = Math.abs(l1 - l2);
      const dist = softenDistance(rawDist, total);
      if (stretch && dist > total + 1e-6) {
        const s = dist / Math.max(1e-6, total);
        if (uniform) {
          bones[aIdx].length = l1 * s;
          bones[bIdx].length = l2 * s;
        } else {
          bones[bIdx].length = l2 * s;
        }
      } else if (compress && dist < minD - 1e-6) {
        const denom = Math.max(1e-6, minD);
        const s = dist / denom;
        if (uniform) {
          bones[aIdx].length = l1 * s;
          bones[bIdx].length = l2 * s;
        } else {
          bones[bIdx].length = l2 * s;
        }
      }
    }
    if (ik.endMode === "tail") {
      solveTwoBoneIK(bones, Number(ik.bones[0]), Number(ik.bones[1]), tp, mix, ik.bendPositive !== false);
    } else {
      const childIndex = Number(ik.bones[1]);
      const tailTarget = headTargetToTailTarget(bones, childIndex, tp);
      solveTwoBoneIK(bones, Number(ik.bones[0]), childIndex, tailTarget, mix, ik.bendPositive !== false);
    }
  } else if ((ik.bones || []).length === 1) {
    const bi = Number(ik.bones[0]);
    if (Number.isFinite(bi) && bi >= 0 && bi < bones.length) {
      const world = computeWorld(bones);
      const head = transformPoint(world[bi], 0, 0);
      const len = Math.max(1e-6, Number(bones[bi].length) || 0);
      const rawDist = Math.hypot(tp.x - head.x, tp.y - head.y);
      const dist = softenDistance(rawDist, len);
      if (stretch && dist > len + 1e-6) bones[bi].length = len * (dist / len);
      else if (compress && dist < len - 1e-6) bones[bi].length = dist;
    }
    solveOneBoneIK(bones, bi, tp, mix);
  }
}

function applyIKConstraintsToBones(m, bones) {
  if (!m || !bones || bones.length === 0) return;
  const list = ensureIKConstraints(m);
  if (list.length === 0) return;
  const ordered = [...list].sort((a, b) => getConstraintOrder(a, 0) - getConstraintOrder(b, 0));
  for (const ik of ordered) applySingleIKConstraintToBones(bones, ik);
}

function findEnabledIKForBone(m, boneIndex) {
  if (!m) return null;
  const active = getActiveIKConstraint();
  if (active && active.enabled !== false && Array.isArray(active.bones) && active.bones.includes(boneIndex)) {
    return active;
  }
  const list = ensureIKConstraints(m);
  for (const ik of list) {
    if (!ik || ik.enabled === false) continue;
    if (Array.isArray(ik.bones) && ik.bones.includes(boneIndex)) return ik;
  }
  return null;
}

function getIKTargetPointWorld(bones, boneIndex) {
  if (!bones || boneIndex < 0 || boneIndex >= bones.length) return null;
  const b = bones[boneIndex];
  if (!b) return null;
  const world = computeWorld(bones);
  const mat = world[boneIndex];
  if (!mat) return null;
  // Connected targets cannot move their head independently; use tip as effective IK target point.
  if (Number(b.parent) >= 0 && b.connected) {
    return transformPoint(mat, Number(b.length) || 0, 0);
  }
  return transformPoint(mat, 0, 0);
}

function getIKConstraintEndPointWorld(bones, ik) {
  if (!bones || !ik) return null;
  const chain = Array.isArray(ik.bones) ? ik.bones : [];
  const endBi = chain.length >= 2 ? chain[1] : chain[0];
  if (!Number.isFinite(endBi) || endBi < 0 || endBi >= bones.length) return null;
  const world = computeWorld(bones);
  if (chain.length >= 2 && ik.endMode !== "tail") {
    return transformPoint(world[endBi], 0, 0);
  }
  return transformPoint(world[endBi], Number(bones[endBi].length) || 0, 0);
}

function getIKSolveTargetWorld(bones, ik) {
  if (!bones || !ik) return null;
  const tIdx = Number(ik.target);
  if (Number.isFinite(tIdx) && tIdx >= 0 && tIdx < bones.length) {
    return getIKTargetPointWorld(bones, tIdx);
  }
  const tx = ik.targetX;
  const ty = ik.targetY;
  if (Number.isFinite(tx) && Number.isFinite(ty)) return { x: tx, y: ty };
  return getIKConstraintEndPointWorld(bones, ik);
}

function setPoseBoneHeadWorld(bones, boneIndex, headWorld) {
  if (!bones || boneIndex < 0 || boneIndex >= bones.length) return false;
  const ep = getBoneWorldEndpointsFromBones(bones, boneIndex);
  const dx = ep.tip.x - ep.head.x;
  const dy = ep.tip.y - ep.head.y;
  const nextTip = { x: headWorld.x + dx, y: headWorld.y + dy };
  setBoneFromWorldEndpoints(bones, boneIndex, headWorld, nextTip);
  return true;
}

function setPoseBoneTipWorld(bones, boneIndex, tipWorld) {
  if (!bones || boneIndex < 0 || boneIndex >= bones.length) return false;
  const ep = getBoneWorldEndpointsFromBones(bones, boneIndex);
  setBoneFromWorldEndpoints(bones, boneIndex, ep.head, tipWorld);
  return true;
}

function steerIKTargetFromBoneEdit(m, editedBoneIndex, desiredPointWorld = null, handle = "tip") {
  if (!m || state.boneMode !== "pose") return false;
  const ik = findEnabledIKForBone(m, editedBoneIndex);
  if (!ik) return false;
  const targetIndex = Number(ik.target);
  const hasTargetBone = Number.isFinite(targetIndex) && targetIndex >= 0 && targetIndex < m.poseBones.length;
  if (hasTargetBone && targetIndex === editedBoneIndex) return false;
  const bones = getPoseBones(m);
  const world = computeWorld(bones);
  const chain = Array.isArray(ik.bones) ? ik.bones : [];
  const endBi = chain.length >= 2 ? chain[1] : chain[0];
  let desired = desiredPointWorld;
  if (!desired) {
    if (!Number.isFinite(endBi) || endBi < 0 || endBi >= bones.length) return false;
    if ((ik.bones || []).length >= 2 && ik.endMode !== "tail") {
      desired = transformPoint(world[endBi], 0, 0);
    } else {
      desired = transformPoint(world[endBi], Number(bones[endBi].length) || 0, 0);
    }
  }
  if ((ik.bones || []).length >= 2 && ik.endMode !== "tail" && handle === "tip") {
    if (!Number.isFinite(endBi) || endBi < 0 || endBi >= bones.length) return false;
    const ep = getBoneWorldEndpointsFromBones(bones, endBi, world);
    const dx = desired.x - ep.tip.x;
    const dy = desired.y - ep.tip.y;
    desired = { x: ep.head.x + dx, y: ep.head.y + dy };
  }
  if (!desired) return false;
  if (!hasTargetBone) {
    ik.targetX = desired.x;
    ik.targetY = desired.y;
    const ikIdx = getIKIndexByRef(m, ik);
    markDirtyByIKProp(ikIdx, "target");
    return true;
  }
  const target = bones[targetIndex];
  if (!target) return false;
  const connectedTarget = Number(target.parent) >= 0 && target.connected;
  const ok = connectedTarget
    ? setPoseBoneTipWorld(bones, targetIndex, desired)
    : setPoseBoneHeadWorld(bones, targetIndex, desired);
  if (!ok) return false;
  markDirtyByBoneProp(targetIndex, connectedTarget ? "rotate" : "translate");
  return true;
}

function refreshIKUI() {
  const m = state.mesh;
  if (!els.ikTools) return;
  if (!m || !Array.isArray(m.rigBones) || m.rigBones.length === 0) {
    els.ikTools.style.opacity = "0.65";
    if (els.ikSelect) els.ikSelect.innerHTML = "";
    return;
  }
  els.ikTools.style.opacity = "1";
  const list = ensureIKConstraints(m);
  const prevSelected = state.selectedIK >= 0 && state.selectedIK < list.length ? list[state.selectedIK] : null;
  sortConstraintListByOrder(list);
  if (prevSelected) state.selectedIK = list.indexOf(prevSelected);
  const fillBoneSelect = (sel, allowNone = false) => {
    if (!sel) return;
    sel.innerHTML = "";
    if (allowNone) {
      const none = document.createElement("option");
      none.value = "-1";
      none.textContent = "-1: None";
      sel.appendChild(none);
    }
    for (let i = 0; i < m.rigBones.length; i += 1) {
      const opt = document.createElement("option");
      opt.value = String(i);
      opt.textContent = `${i}: ${m.rigBones[i].name}`;
      sel.appendChild(opt);
    }
  };
  fillBoneSelect(els.ikTargetBone, true);
  fillBoneSelect(els.ikBoneA, false);
  fillBoneSelect(els.ikBoneB, true);
  if (els.ikSelect) {
    els.ikSelect.innerHTML = "";
    for (let i = 0; i < list.length; i += 1) {
      const c = list[i];
      const opt = document.createElement("option");
      opt.value = String(i);
      opt.textContent = `${i}: ${c.name} (${(c.bones || []).length >= 2 ? "2-bone" : "1-bone"})`;
      els.ikSelect.appendChild(opt);
    }
  }
  if (els.ikList) {
    els.ikList.innerHTML = "";
    if (list.length === 0) {
      els.ikList.innerHTML = "<div class='muted'>No IK constraints yet.</div>";
    } else {
      for (let i = 0; i < list.length; i += 1) {
        const c = list[i];
        const row = document.createElement("div");
        row.className = `tree-item${state.selectedIK === i ? " selected" : ""}`;
        row.dataset.ikIndex = String(i);
        row.textContent = `${i}: ${c.name} [${(c.bones || []).length >= 2 ? "2-bone" : "1-bone"}] ${
          c.enabled === false ? "(off)" : ""
        }`;
        els.ikList.appendChild(row);
      }
    }
  }
  if (state.selectedIK < 0 || state.selectedIK >= list.length) state.selectedIK = list.length > 0 ? 0 : -1;
  const c = getActiveIKConstraint();
  if (els.ikRemoveBtn) els.ikRemoveBtn.disabled = !c;
  if (els.ikMoveUpBtn) els.ikMoveUpBtn.disabled = !c || state.selectedIK <= 0;
  if (els.ikMoveDownBtn) {
    const len = ensureIKConstraints(m).length;
    els.ikMoveDownBtn.disabled = !c || state.selectedIK < 0 || state.selectedIK >= len - 1;
  }
  if (els.ikPickTargetBtn) {
    els.ikPickTargetBtn.disabled = !c;
    els.ikPickTargetBtn.textContent = state.ikPickArmed ? "Cancel Target Pick" : "Pick Target in Canvas";
  }
  if (!c) {
    if (els.ikName) els.ikName.value = "";
    if (els.ikSkinRequired) els.ikSkinRequired.disabled = true;
    if (els.ikHint) els.ikHint.textContent = "No IK constraint. Add IK 1-Bone or 2-Bone.";
    return;
  }
  if (els.ikSkinRequired) els.ikSkinRequired.disabled = false;
  if (els.ikSelect) els.ikSelect.value = String(state.selectedIK);
  if (els.ikName) els.ikName.value = c.name || `ik_${state.selectedIK}`;
  if (els.ikEnabled) els.ikEnabled.value = c.enabled === false ? "false" : "true";
  if (els.ikTargetBone) els.ikTargetBone.value = String(Number.isFinite(Number(c.target)) ? Number(c.target) : -1);
  if (els.ikBoneA) els.ikBoneA.value = String(Number((c.bones || [0])[0]));
  if (els.ikBoneB) els.ikBoneB.value = (c.bones || []).length >= 2 ? String(Number(c.bones[1])) : "-1";
  if (els.ikEndMode) {
    const twoBone = (c.bones || []).length >= 2;
    els.ikEndMode.disabled = !twoBone;
    els.ikEndMode.value = c.endMode === "tail" ? "tail" : "head";
    const wrap = els.ikEndMode.closest("label");
    if (wrap) wrap.style.display = "";
  }
  if (els.ikMix) els.ikMix.value = String(math.clamp(Number(c.mix) || 0, 0, 1));
  if (els.ikSoftness) els.ikSoftness.value = String(Math.max(0, Number(c.softness) || 0));
  if (els.ikCompress) els.ikCompress.checked = !!c.compress;
  if (els.ikStretch) els.ikStretch.checked = !!c.stretch;
  if (els.ikUniform) els.ikUniform.checked = !!c.uniform;
  if (els.ikSkinRequired) els.ikSkinRequired.checked = !!c.skinRequired;
  if (els.ikBendDir) els.ikBendDir.value = c.bendPositive === false ? "-1" : "1";
  if (els.ikHint) {
    const bList = (c.bones || []).map((bi) => m.rigBones[bi]?.name || bi).join(" -> ");
    const tName =
      Number.isFinite(Number(c.target)) && Number(c.target) >= 0 && Number(c.target) < m.rigBones.length
        ? m.rigBones[c.target]?.name || c.target
        : `point(${Number(c.targetX || 0).toFixed(1)}, ${Number(c.targetY || 0).toFixed(1)})`;
    els.ikHint.textContent = `IK ${c.name}: ${bList} -> target ${tName}, mix ${Number(c.mix).toFixed(2)} (${c.enabled === false ? "off" : "on"})${
      state.ikPickArmed ? " | target-pick: click a bone in canvas" : ""
    }`;
  }
}

function addTransformConstraint() {
  const m = state.mesh;
  if (!m || !Array.isArray(m.rigBones) || m.rigBones.length < 2) return false;
  const nextOrder = getNextGlobalConstraintOrder(m);
  const list = ensureTransformConstraints(m);
  const selected = Number.isFinite(state.selectedBone) && state.selectedBone >= 0 ? state.selectedBone : 0;
  const target = Math.max(0, Math.min(m.rigBones.length - 1, selected));
  let bone = target;
  if (Number.isFinite(m.rigBones[target] && m.rigBones[target].parent) && Number(m.rigBones[target].parent) >= 0) {
    bone = Number(m.rigBones[target].parent);
  } else {
    for (let i = 0; i < m.rigBones.length; i += 1) {
      if (i !== target) {
        bone = i;
        break;
      }
    }
  }
  const c = {
    name: `transform_${list.length}`,
    bones: bone === target ? [] : [bone],
    target,
    rotateMix: 1,
    translateMix: 1,
    scaleMix: 0,
    shearMix: 0,
    offsetX: 0,
    offsetY: 0,
    offsetRot: 0,
    offsetScaleX: 0,
    offsetScaleY: 0,
    offsetShearY: 0,
    local: false,
    relative: false,
    order: nextOrder,
    skinRequired: false,
    enabled: true,
  };
  if (c.bones.length === 0) return false;
  list.push(c);
  state.selectedTransform = list.length - 1;
  refreshTransformUI();
  refreshTrackSelect();
  renderTimelineTracks();
  renderBoneTree();
  return true;
}

function removeSelectedTransformConstraint() {
  const m = state.mesh;
  if (!m) return false;
  const list = ensureTransformConstraints(m);
  if (state.selectedTransform < 0 || state.selectedTransform >= list.length) return false;
  list.splice(state.selectedTransform, 1);
  state.selectedTransform = list.length > 0 ? Math.min(state.selectedTransform, list.length - 1) : -1;
  refreshTransformUI();
  refreshTrackSelect();
  renderTimelineTracks();
  renderBoneTree();
  return true;
}

function refreshTransformUI() {
  const m = state.mesh;
  if (!els.tfcSelect) return;
  if (!m || !Array.isArray(m.rigBones) || m.rigBones.length === 0) {
    els.tfcSelect.innerHTML = "";
    if (els.tfcList) els.tfcList.innerHTML = "<div class='muted'>No bones.</div>";
    return;
  }
  const list = ensureTransformConstraints(m);
  const prevSelected = state.selectedTransform >= 0 && state.selectedTransform < list.length ? list[state.selectedTransform] : null;
  sortConstraintListByOrder(list);
  if (prevSelected) state.selectedTransform = list.indexOf(prevSelected);
  if (state.selectedTransform < 0 || state.selectedTransform >= list.length) {
    state.selectedTransform = list.length > 0 ? 0 : -1;
  }
  const filterText = (els.tfcBoneSearch && els.tfcBoneSearch.value ? els.tfcBoneSearch.value : "").trim().toLowerCase();
  const fillBoneSelect = (sel, allowNone = false, withFilter = false) => {
    if (!sel) return;
    const prevSelected = new Set(Array.from(sel.selectedOptions || []).map((o) => String(o.value)));
    sel.innerHTML = "";
    if (allowNone) {
      const none = document.createElement("option");
      none.value = "-1";
      none.textContent = "-1: None";
      sel.appendChild(none);
    }
    for (let i = 0; i < m.rigBones.length; i += 1) {
      const label = `${i}: ${m.rigBones[i].name}`;
      if (withFilter && filterText.length > 0 && !label.toLowerCase().includes(filterText)) continue;
      const opt = document.createElement("option");
      opt.value = String(i);
      opt.textContent = label;
      if (prevSelected.has(opt.value)) opt.selected = true;
      sel.appendChild(opt);
    }
  };
  fillBoneSelect(els.tfcTargetBone, true, false);
  fillBoneSelect(els.tfcBones, false, true);
  els.tfcSelect.innerHTML = "";
  for (let i = 0; i < list.length; i += 1) {
    const c = list[i];
    const opt = document.createElement("option");
    opt.value = String(i);
    opt.textContent = `${i}: ${c.name}`;
    els.tfcSelect.appendChild(opt);
  }
  if (els.tfcList) {
    els.tfcList.innerHTML = "";
    if (list.length === 0) {
      els.tfcList.innerHTML = "<div class='muted'>No Transform constraints yet.</div>";
    } else {
      for (let i = 0; i < list.length; i += 1) {
        const c = list[i];
        const row = document.createElement("div");
        row.className = `tree-item${state.selectedTransform === i ? " selected" : ""}`;
        row.dataset.tfcIndex = String(i);
        row.textContent = `${i}: ${c.name}${c.enabled === false ? " (off)" : ""}`;
        els.tfcList.appendChild(row);
      }
    }
  }
  const c = getActiveTransformConstraint();
  if (els.tfcMoveUpBtn) els.tfcMoveUpBtn.disabled = !c || state.selectedTransform <= 0;
  if (els.tfcMoveDownBtn) els.tfcMoveDownBtn.disabled = !c || state.selectedTransform >= list.length - 1;
  if (els.tfcRemoveBtn) els.tfcRemoveBtn.disabled = !c;
  if (!c) {
    if (els.tfcName) els.tfcName.value = "";
    if (els.tfcSkinRequired) els.tfcSkinRequired.disabled = true;
    if (els.tfcHint) els.tfcHint.textContent = "No Transform constraint. Add one.";
    return;
  }
  if (els.tfcSkinRequired) els.tfcSkinRequired.disabled = false;
  if (els.tfcSelect) els.tfcSelect.value = String(state.selectedTransform);
  if (els.tfcName) els.tfcName.value = c.name || `transform_${state.selectedTransform}`;
  if (els.tfcEnabled) els.tfcEnabled.value = c.enabled === false ? "false" : "true";
  if (els.tfcTargetBone) els.tfcTargetBone.value = String(c.target);
  if (els.tfcLocal) els.tfcLocal.value = c.local ? "true" : "false";
  if (els.tfcRelative) els.tfcRelative.value = c.relative ? "true" : "false";
  if (els.tfcRotateMix) els.tfcRotateMix.value = String(Number(c.rotateMix || 0).toFixed(3));
  if (els.tfcTranslateMix) els.tfcTranslateMix.value = String(Number(c.translateMix || 0).toFixed(3));
  if (els.tfcScaleMix) els.tfcScaleMix.value = String(Number(c.scaleMix || 0).toFixed(3));
  if (els.tfcShearMix) els.tfcShearMix.value = String(Number(c.shearMix || 0).toFixed(3));
  if (els.tfcOffsetX) els.tfcOffsetX.value = String(Number(c.offsetX) || 0);
  if (els.tfcOffsetY) els.tfcOffsetY.value = String(Number(c.offsetY) || 0);
  if (els.tfcOffsetRot) els.tfcOffsetRot.value = String(Number(c.offsetRot) || 0);
  if (els.tfcOffsetScaleX) els.tfcOffsetScaleX.value = String(Number(c.offsetScaleX) || 0);
  if (els.tfcOffsetScaleY) els.tfcOffsetScaleY.value = String(Number(c.offsetScaleY) || 0);
  if (els.tfcOffsetShearY) els.tfcOffsetShearY.value = String(Number(c.offsetShearY) || 0);
  if (els.tfcSkinRequired) els.tfcSkinRequired.checked = !!c.skinRequired;
  if (els.tfcBones) {
    const set = new Set((c.bones || []).map((v) => Number(v)));
    for (const opt of els.tfcBones.options) opt.selected = set.has(Number(opt.value));
  }
  if (els.tfcHint) {
    const tName = m.rigBones[c.target] ? m.rigBones[c.target].name : c.target;
    const bNames = (c.bones || []).map((bi) => m.rigBones[bi]?.name || bi).join(", ");
    els.tfcHint.textContent = `Transform ${c.name}: [${bNames}] -> ${tName}, mix r${Number(c.rotateMix).toFixed(
      2
    )}/t${Number(c.translateMix).toFixed(2)}/s${Number(c.scaleMix).toFixed(2)}/h${Number(c.shearMix).toFixed(2)}`;
  }
}

function applyActiveTransformFromUI(updateBones = false) {
  const m = state.mesh;
  const c = getActiveTransformConstraint();
  if (!m || !c) return false;
  const prev = {
    rotateMix: Number(c.rotateMix) || 0,
    translateMix: Number(c.translateMix) || 0,
    scaleMix: Number(c.scaleMix) || 0,
    shearMix: Number(c.shearMix) || 0,
  };
  c.enabled = !els.tfcEnabled || els.tfcEnabled.value !== "false";
  c.name = els.tfcName ? els.tfcName.value.trim() || c.name : c.name;
  c.target = Number(els.tfcTargetBone ? els.tfcTargetBone.value : c.target);
  c.local = !!(els.tfcLocal && els.tfcLocal.value === "true");
  c.relative = !!(els.tfcRelative && els.tfcRelative.value === "true");
  c.rotateMix = math.clamp(Number(els.tfcRotateMix ? els.tfcRotateMix.value : c.rotateMix) || 0, 0, 1);
  c.translateMix = math.clamp(Number(els.tfcTranslateMix ? els.tfcTranslateMix.value : c.translateMix) || 0, 0, 1);
  c.scaleMix = math.clamp(Number(els.tfcScaleMix ? els.tfcScaleMix.value : c.scaleMix) || 0, 0, 1);
  c.shearMix = math.clamp(Number(els.tfcShearMix ? els.tfcShearMix.value : c.shearMix) || 0, 0, 1);
  c.offsetX = Number(els.tfcOffsetX ? els.tfcOffsetX.value : c.offsetX) || 0;
  c.offsetY = Number(els.tfcOffsetY ? els.tfcOffsetY.value : c.offsetY) || 0;
  c.offsetRot = Number(els.tfcOffsetRot ? els.tfcOffsetRot.value : c.offsetRot) || 0;
  c.offsetScaleX = Number(els.tfcOffsetScaleX ? els.tfcOffsetScaleX.value : c.offsetScaleX) || 0;
  c.offsetScaleY = Number(els.tfcOffsetScaleY ? els.tfcOffsetScaleY.value : c.offsetScaleY) || 0;
  c.offsetShearY = Number(els.tfcOffsetShearY ? els.tfcOffsetShearY.value : c.offsetShearY) || 0;
  c.skinRequired = !!(els.tfcSkinRequired && els.tfcSkinRequired.checked);
  if (updateBones && els.tfcBones) {
    const picked = Array.from(els.tfcBones.selectedOptions)
      .map((o) => Number(o.value))
      .filter((v) => Number.isFinite(v));
    c.bones = [...new Set(picked)].filter((bi) => bi !== c.target);
  }
  if (!Number.isFinite(c.target) || c.target < 0 || c.target >= m.rigBones.length || (c.bones || []).length === 0) {
    ensureTransformConstraints(m);
  }
  if (Math.abs((Number(c.rotateMix) || 0) - prev.rotateMix) > 1e-6) markDirtyTrack(getTransformTrackId(state.selectedTransform, "rotateMix"));
  if (Math.abs((Number(c.translateMix) || 0) - prev.translateMix) > 1e-6)
    markDirtyTrack(getTransformTrackId(state.selectedTransform, "translateMix"));
  if (Math.abs((Number(c.scaleMix) || 0) - prev.scaleMix) > 1e-6) markDirtyTrack(getTransformTrackId(state.selectedTransform, "scaleMix"));
  if (Math.abs((Number(c.shearMix) || 0) - prev.shearMix) > 1e-6) markDirtyTrack(getTransformTrackId(state.selectedTransform, "shearMix"));
  refreshTransformUI();
  refreshTrackSelect();
  renderTimelineTracks();
  renderBoneTree();
  return true;
}

function applyActiveIKFromUI() {
  const m = state.mesh;
  const c = getActiveIKConstraint();
  if (!m || !c) return false;
  const prevMix = Number(c.mix) || 0;
  const prevSoftness = Math.max(0, Number(c.softness) || 0);
  const prevBend = c.bendPositive !== false;
  const prevCompress = !!c.compress;
  const prevStretch = !!c.stretch;
  const prevUniform = !!c.uniform;
  c.enabled = !els.ikEnabled || els.ikEnabled.value !== "false";
  c.target = Number(els.ikTargetBone ? els.ikTargetBone.value : c.target);
  c.mix = math.clamp(Number(els.ikMix ? els.ikMix.value : c.mix) || 0, 0, 1);
  c.softness = Math.max(0, Number(els.ikSoftness ? els.ikSoftness.value : c.softness) || 0);
  c.compress = !!(els.ikCompress && els.ikCompress.checked);
  c.stretch = !!(els.ikStretch && els.ikStretch.checked);
  c.uniform = !!(els.ikUniform && els.ikUniform.checked);
  c.skinRequired = !!(els.ikSkinRequired && els.ikSkinRequired.checked);
  c.bendPositive = !els.ikBendDir || els.ikBendDir.value !== "-1";
  c.endMode = !els.ikEndMode || els.ikEndMode.value !== "tail" ? "head" : "tail";
  const a = Number(els.ikBoneA ? els.ikBoneA.value : c.bones[0]);
  const b = Number(els.ikBoneB ? els.ikBoneB.value : -1);
  if (Number.isFinite(a) && a >= 0 && a < m.rigBones.length) {
    if (Number.isFinite(b) && b >= 0 && b < m.rigBones.length && Number(m.rigBones[b] && m.rigBones[b].parent) === a) {
      c.bones = [a, b];
    } else {
      c.bones = [a];
    }
  }
  if (Array.isArray(c.bones) && c.bones.includes(c.target)) {
    c.target = -1;
  }
  if (!Number.isFinite(c.target) || c.target < 0 || c.target >= m.rigBones.length) {
    c.target = -1;
    if (!Number.isFinite(c.targetX) || !Number.isFinite(c.targetY)) {
      const tp = getIKConstraintEndPointWorld(getPoseBones(m), c);
      if (tp) {
        c.targetX = tp.x;
        c.targetY = tp.y;
      } else {
        c.targetX = 0;
        c.targetY = 0;
      }
    }
  }
  if ((c.bones || []).length < 2) c.endMode = "tail";
  if (Math.abs((Number(c.mix) || 0) - prevMix) > 1e-6) markDirtyByIKProp(state.selectedIK, "mix");
  if (Math.abs((Number(c.softness) || 0) - prevSoftness) > 1e-6) markDirtyByIKProp(state.selectedIK, "softness");
  if ((c.bendPositive !== false) !== prevBend) markDirtyByIKProp(state.selectedIK, "bend");
  if (c.compress !== prevCompress) markDirtyByIKProp(state.selectedIK, "compress");
  if (c.stretch !== prevStretch) markDirtyByIKProp(state.selectedIK, "stretch");
  if (c.uniform !== prevUniform) markDirtyByIKProp(state.selectedIK, "uniform");
  ensureIKConstraints(m);
  refreshIKUI();
  refreshTrackSelect();
  renderTimelineTracks();
  renderBoneTree();
  return true;
}

function getSlotTransformMatrix(slot, poseWorld) {
  const m = state.mesh;
  if (!m || !slot) return createIdentity();
  const tx = Number(slot.tx) || 0;
  const ty = Number(slot.ty) || 0;
  const rot = Number(slot.rot) || 0;
  if (Math.abs(tx) < 1e-6 && Math.abs(ty) < 1e-6 && Math.abs(rot) < 1e-6) return createIdentity();
  const boneIdx = Number(slot.bone);
  if (Number.isFinite(boneIdx) && boneIdx >= 0 && boneIdx < poseWorld.length) {
    const bw = poseWorld[boneIdx];
    return mul(mul(bw, matFromTR(tx, ty, rot)), invert(bw));
  }
  const pivot = matFromTR((state.imageWidth || 0) * 0.5, (state.imageHeight || 0) * 0.5, 0);
  return mul(mul(pivot, matFromTR(tx, ty, rot)), invert(pivot));
}

function rebuildSlotTriangleIndices() {
  const m = state.mesh;
  if (!m) return;
  for (const s of state.slots) {
    if (!s) continue;
    ensureSlotMeshData(s, m);
    s._indices = null;
  }
}

function buildSlotGeometry(slot, poseWorld) {
  const m = state.mesh;
  if (!m) return { interleaved: null, screen: null };
  ensureSlotMeshData(slot, m);
  const sm = slot && slot.meshData ? slot.meshData : null;
  if (!sm) return { interleaved: null, screen: null };
  const offsets = sm.offsets;
  const tm = getSlotTransformMatrix(slot, poseWorld);
  const vCount = sm.positions.length / 2;
  const mode = getSlotWeightMode(slot);
  const boneCount = mode === "free" ? 0 : m.rigBones.length;
  if (!sm.interleaved || sm.interleaved.length !== vCount * 4) sm.interleaved = new Float32Array(vCount * 4);
  if (!sm.deformedScreen || sm.deformedScreen.length !== vCount * 2) sm.deformedScreen = new Float32Array(vCount * 2);
  if (!sm.deformedLocal || sm.deformedLocal.length !== vCount * 2) sm.deformedLocal = new Float32Array(vCount * 2);
  for (let i = 0; i < vCount; i += 1) {
    const x = sm.positions[i * 2];
    const y = sm.positions[i * 2 + 1];
    let sx = x;
    let sy = y;
    if (boneCount > 0) {
      sx = 0;
      sy = 0;
      for (let b = 0; b < boneCount; b += 1) {
        const w = sm.weights[i * boneCount + b];
        if (w <= 0) continue;
        const skinned = transformPoint(mul(poseWorld[b], m.invBind[b]), x, y);
        sx += skinned.x * w;
        sy += skinned.y * w;
      }
    }
    const lx = sx + (offsets[i * 2] || 0);
    const ly = sy + (offsets[i * 2 + 1] || 0);
    sm.deformedLocal[i * 2] = lx;
    sm.deformedLocal[i * 2 + 1] = ly;
    const p = transformPoint(tm, lx, ly);
    const s = localToScreen(p.x, p.y);
    sm.deformedScreen[i * 2] = s.x;
    sm.deformedScreen[i * 2 + 1] = s.y;
    sm.interleaved[i * 4] = s.x;
    sm.interleaved[i * 4 + 1] = s.y;
    sm.interleaved[i * 4 + 2] = sm.uvs[i * 2];
    sm.interleaved[i * 4 + 3] = sm.uvs[i * 2 + 1];
  }
  return { interleaved: sm.interleaved, screen: sm.deformedScreen, indices: sm.indices, uvs: sm.uvs };
}

function collectPsdLayerSlots(children, out, docW, docH, prefix = "") {
  if (!Array.isArray(children)) return;
  for (const layer of children) {
    const layerName = layer && layer.name ? layer.name : "Layer";
    const fullName = prefix ? `${prefix}/${layerName}` : layerName;
    if (Array.isArray(layer.children) && layer.children.length > 0) {
      collectPsdLayerSlots(layer.children, out, docW, docH, fullName);
    }
    if (layer && layer.canvas) {
      const b = getCanvasAlphaBounds(layer.canvas);
      if (!b) continue;
      const cropped = makeCanvas(b.w, b.h);
      const cctx = cropped.getContext("2d");
      if (!cctx) continue;
      cctx.drawImage(layer.canvas, b.x, b.y, b.w, b.h, 0, 0, b.w, b.h);
      const lx = Number.isFinite(layer.left) ? layer.left : 0;
      const ly = Number.isFinite(layer.top) ? layer.top : 0;
      out.push({
        name: fullName,
        canvas: cropped,
        useWeights: true,
        weightBindMode: "single",
        weightMode: "single",
        docWidth: docW,
        docHeight: docH,
        rect: { x: lx + b.x, y: ly + b.y, w: b.w, h: b.h },
      });
    }
  }
}

async function loadFileSlots(file) {
  const name = file.name.toLowerCase();
  if (name.endsWith(".psd")) {
    setStatus("Loading PSD via ag-psd from CDN...");
    const mod = await import("https://esm.sh/ag-psd@28.4.1");
    const psd = mod.readPsd(await file.arrayBuffer());
    const docW =
      (Number.isFinite(psd.width) ? psd.width : 0) ||
      (psd.canvas ? psd.canvas.width : 0) ||
      (psd.imageData ? psd.imageData.width : 0);
    const docH =
      (Number.isFinite(psd.height) ? psd.height : 0) ||
      (psd.canvas ? psd.canvas.height : 0) ||
      (psd.imageData ? psd.imageData.height : 0);
    const slots = [];
    collectPsdLayerSlots(psd.children, slots, docW, docH);
    if (slots.length > 0) return slots;
    let src = psd.canvas;
    if (!src && psd.imageData) {
      src = makeCanvas(psd.imageData.width, psd.imageData.height);
      src.getContext("2d").putImageData(psd.imageData, 0, 0);
    }
    if (!src) throw new Error("PSD loaded but no raster canvas found.");
    return [
      {
        name: file.name.replace(/\.psd$/i, ""),
        canvas: src,
        useWeights: true,
        weightBindMode: "single",
        weightMode: "single",
        docWidth: src.width,
        docHeight: src.height,
        rect: { x: 0, y: 0, w: src.width, h: src.height },
      },
    ];
  }

  const bmp = await createImageBitmap(file);
  const c = makeCanvas(bmp.width, bmp.height);
  c.width = bmp.width;
  c.height = bmp.height;
  c.getContext("2d").drawImage(bmp, 0, 0);
  const base = file.name.replace(/\.[^.]+$/, "");
  return [
    {
      name: base,
      canvas: c,
      bone: -1,
      useWeights: true,
      weightBindMode: "auto",
      weightMode: "weighted",
      docWidth: c.width,
      docHeight: c.height,
      rect: { x: 0, y: 0, w: c.width, h: c.height },
    },
  ];
}

function resize() {
  const rect = els.stage.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const w = Math.max(1, Math.floor(rect.width * dpr));
  const h = Math.max(1, Math.floor(rect.height * dpr));
  const prevW = Math.max(1, Number(els.glCanvas.width) || 1);
  const prevH = Math.max(1, Number(els.glCanvas.height) || 1);

  if (els.glCanvas.width !== w || els.glCanvas.height !== h) {
    els.glCanvas.width = w;
    els.glCanvas.height = h;
    els.overlay.width = w;
    els.overlay.height = h;
  }

  if (hasGL) {
    gl.viewport(0, 0, w, h);
  }

  if (state.imageWidth > 0 && state.imageHeight > 0) {
    const fit = Math.min(w / state.imageWidth, h / state.imageHeight) * 0.92;
    state.view.fitScale = fit;
    if (!state.view.initialized || !Number.isFinite(state.view.scale) || state.view.scale <= 0) {
      state.view.scale = fit;
      state.view.cx = w * 0.5;
      state.view.cy = h * 0.5;
      state.view.initialized = true;
    } else {
      state.view.cx += (w - prevW) * 0.5;
      state.view.cy += (h - prevH) * 0.5;
    }
  }
  state.view.lastW = w;
  state.view.lastH = h;
  refreshViewZoomUI();
}

function refreshViewZoomUI() {
  if (!els.viewZoomResetBtn) return;
  const fit = Math.max(1e-6, Number(state.view.fitScale) || 1);
  const scale = Math.max(1e-6, Number(state.view.scale) || fit);
  const percent = Math.round((scale / fit) * 100);
  els.viewZoomResetBtn.textContent = `${percent}%`;
}

function clampViewScale(nextScale) {
  const fit = Math.max(1e-6, Number(state.view.fitScale) || 1);
  return math.clamp(Number(nextScale) || fit, fit * 0.1, fit * 40);
}

function setViewScaleAtScreenPoint(nextScale, sx, sy) {
  const prev = Math.max(1e-6, Number(state.view.scale) || 1);
  const scale = clampViewScale(nextScale);
  if (!Number.isFinite(scale) || scale <= 0) return;
  const ax = Number.isFinite(sx) ? sx : state.view.cx;
  const ay = Number.isFinite(sy) ? sy : state.view.cy;
  const local = screenToLocal(ax, ay);
  state.view.scale = scale;
  state.view.cx = ax - (local.x - state.imageWidth * 0.5) * scale;
  state.view.cy = ay - (local.y - state.imageHeight * 0.5) * scale;
  refreshViewZoomUI();
}

function zoomViewBy(factor, sx = null, sy = null) {
  if (!state.mesh && !(state.imageWidth > 0 && state.imageHeight > 0)) return;
  const k = Number(factor);
  if (!Number.isFinite(k) || k <= 0) return;
  setViewScaleAtScreenPoint(state.view.scale * k, sx, sy);
}

function resetViewToFit() {
  const w = Math.max(1, Number(els.overlay.width) || 1);
  const h = Math.max(1, Number(els.overlay.height) || 1);
  if (!(state.imageWidth > 0 && state.imageHeight > 0)) return;
  state.view.fitScale = Math.min(w / state.imageWidth, h / state.imageHeight) * 0.92;
  state.view.scale = state.view.fitScale;
  state.view.cx = w * 0.5;
  state.view.cy = h * 0.5;
  state.view.initialized = true;
  refreshViewZoomUI();
}

function ensureOverlaySceneCanvas() {
  if (!state.overlayScene.canvas) {
    state.overlayScene.canvas = makeCanvas(1, 1);
    state.overlayScene.ctx = state.overlayScene.canvas.getContext("2d");
  }
  if (!state.overlayScene.ctx) return null;
  const w = Math.max(1, Number(els.overlay.width) || 1);
  const h = Math.max(1, Number(els.overlay.height) || 1);
  if (state.overlayScene.canvas.width !== w || state.overlayScene.canvas.height !== h) {
    state.overlayScene.canvas.width = w;
    state.overlayScene.canvas.height = h;
  }
  return state.overlayScene.ctx;
}

function localToScreen(x, y) {
  return {
    x: state.view.cx + (x - state.imageWidth * 0.5) * state.view.scale,
    y: state.view.cy + (y - state.imageHeight * 0.5) * state.view.scale,
  };
}

function screenToLocal(x, y) {
  return {
    x: (x - state.view.cx) / state.view.scale + state.imageWidth * 0.5,
    y: (y - state.view.cy) / state.view.scale + state.imageHeight * 0.5,
  };
}

function getGridMajorStepLocal() {
  const scale = Math.max(1e-6, Number(state.view.scale) || 1);
  const targetPx = 44;
  const raw = targetPx / scale;
  const exp = Math.floor(Math.log10(Math.max(raw, 1e-6)));
  const base = Math.pow(10, exp);
  const choices = [1, 2, 5, 10];
  let step = base;
  for (const c of choices) {
    step = base * c;
    if (step >= raw) break;
  }
  return Math.max(1e-6, step);
}

function drawBackdropGridAndRuler(ctx) {
  const w = Math.max(1, Number(els.overlay.width) || 1);
  const h = Math.max(1, Number(els.overlay.height) || 1);
  if (!Number.isFinite(state.view.scale) || state.view.scale <= 0) return;
  const major = getGridMajorStepLocal();
  const minor = major / 5;
  const minL = screenToLocal(0, h).x;
  const maxL = screenToLocal(w, 0).x;
  const minT = screenToLocal(0, 0).y;
  const maxT = screenToLocal(w, h).y;
  const x0 = Math.min(minL, maxL);
  const x1 = Math.max(minL, maxL);
  const y0 = Math.min(minT, maxT);
  const y1 = Math.max(minT, maxT);

  const firstMinorX = Math.floor(x0 / minor) * minor;
  const firstMinorY = Math.floor(y0 / minor) * minor;
  const firstMajorX = Math.floor(x0 / major) * major;
  const firstMajorY = Math.floor(y0 / major) * major;

  ctx.save();
  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(125, 170, 196, 0.08)";
  for (let x = firstMinorX; x <= x1 + 1e-6; x += minor) {
    const sx = localToScreen(x, 0).x;
    ctx.beginPath();
    ctx.moveTo(sx, 0);
    ctx.lineTo(sx, h);
    ctx.stroke();
  }
  for (let y = firstMinorY; y <= y1 + 1e-6; y += minor) {
    const sy = localToScreen(0, y).y;
    ctx.beginPath();
    ctx.moveTo(0, sy);
    ctx.lineTo(w, sy);
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(140, 198, 228, 0.17)";
  for (let x = firstMajorX; x <= x1 + 1e-6; x += major) {
    const sx = localToScreen(x, 0).x;
    ctx.beginPath();
    ctx.moveTo(sx, 0);
    ctx.lineTo(sx, h);
    ctx.stroke();
  }
  for (let y = firstMajorY; y <= y1 + 1e-6; y += major) {
    const sy = localToScreen(0, y).y;
    ctx.beginPath();
    ctx.moveTo(0, sy);
    ctx.lineTo(w, sy);
    ctx.stroke();
  }

  const axisX = localToScreen(0, 0).x;
  const axisY = localToScreen(0, 0).y;
  ctx.strokeStyle = "rgba(220, 240, 255, 0.52)";
  ctx.lineWidth = 1.8;
  if (axisX >= -2 && axisX <= w + 2) {
    ctx.beginPath();
    ctx.moveTo(axisX, 0);
    ctx.lineTo(axisX, h);
    ctx.stroke();
  }
  if (axisY >= -2 && axisY <= h + 2) {
    ctx.beginPath();
    ctx.moveTo(0, axisY);
    ctx.lineTo(w, axisY);
    ctx.stroke();
  }

  const ruler = 18;
  ctx.fillStyle = "rgba(10, 18, 24, 0.82)";
  ctx.fillRect(0, 0, w, ruler);
  ctx.fillRect(0, 0, ruler, h);
  ctx.strokeStyle = "rgba(160, 198, 220, 0.45)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, ruler + 0.5);
  ctx.lineTo(w, ruler + 0.5);
  ctx.moveTo(ruler + 0.5, 0);
  ctx.lineTo(ruler + 0.5, h);
  ctx.stroke();

  ctx.fillStyle = "rgba(194, 220, 236, 0.95)";
  ctx.font = "10px Segoe UI, sans-serif";
  ctx.strokeStyle = "rgba(176, 208, 228, 0.5)";
  ctx.lineWidth = 1;
  for (let x = firstMinorX; x <= x1 + 1e-6; x += minor) {
    const sx = localToScreen(x, 0).x;
    if (sx < ruler + 2 || sx > w - 2) continue;
    const ratio = Math.abs((x / major) - Math.round(x / major));
    if (ratio <= 1e-4) continue;
    ctx.beginPath();
    ctx.moveTo(sx, ruler - 3);
    ctx.lineTo(sx, ruler);
    ctx.stroke();
  }
  for (let y = firstMinorY; y <= y1 + 1e-6; y += minor) {
    const sy = localToScreen(0, y).y;
    if (sy < ruler + 2 || sy > h - 2) continue;
    const ratio = Math.abs((y / major) - Math.round(y / major));
    if (ratio <= 1e-4) continue;
    ctx.beginPath();
    ctx.moveTo(ruler - 3, sy);
    ctx.lineTo(ruler, sy);
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(206, 228, 242, 0.8)";
  for (let x = firstMajorX; x <= x1 + 1e-6; x += major) {
    const sx = localToScreen(x, 0).x;
    if (sx < ruler + 2 || sx > w - 2) continue;
    ctx.beginPath();
    ctx.moveTo(sx, ruler - 6);
    ctx.lineTo(sx, ruler);
    ctx.stroke();
    ctx.fillText(`${Math.round(x)}`, sx + 2, 10);
  }
  for (let y = firstMajorY; y <= y1 + 1e-6; y += major) {
    const sy = localToScreen(0, y).y;
    if (sy < ruler + 2 || sy > h - 2) continue;
    ctx.beginPath();
    ctx.moveTo(ruler - 6, sy);
    ctx.lineTo(ruler, sy);
    ctx.stroke();
    ctx.fillText(`${Math.round(y)}`, 2, sy - 2);
  }
  ctx.restore();
}

function updateDeformation(offsetsOverride = null) {
  const m = state.mesh;
  if (!m) return;
  const offsets = offsetsOverride || getActiveOffsets(m);

  const poseBones = getPoseBones(m);
  enforceConnectedHeads(poseBones);
  const world = state.boneMode === "pose" ? getSolvedPoseWorld(m) : computeWorld(poseBones);
  const vCount = getVertexCount(m);
  const boneCount = poseBones.length;

  for (let i = 0; i < vCount; i += 1) {
    const x = m.positions[i * 2];
    const y = m.positions[i * 2 + 1];
    let sx = x;
    let sy = y;
    if (boneCount > 0) {
      sx = 0;
      sy = 0;
      for (let b = 0; b < boneCount; b += 1) {
        const w = m.weights[i * boneCount + b];
        if (w <= 0) continue;
        const skinned = transformPoint(mul(world[b], m.invBind[b]), x, y);
        sx += skinned.x * w;
        sy += skinned.y * w;
      }
    }

    m.skinnedLocal[i * 2] = sx;
    m.skinnedLocal[i * 2 + 1] = sy;

    const lx = sx + (offsets[i * 2] || 0);
    const ly = sy + (offsets[i * 2 + 1] || 0);

    m.deformedLocal[i * 2] = lx;
    m.deformedLocal[i * 2 + 1] = ly;

    const s = localToScreen(lx, ly);
    m.deformedScreen[i * 2] = s.x;
    m.deformedScreen[i * 2 + 1] = s.y;

    m.interleaved[i * 4] = s.x;
    m.interleaved[i * 4 + 1] = s.y;
    m.interleaved[i * 4 + 2] = m.uvs[i * 2];
    m.interleaved[i * 4 + 3] = m.uvs[i * 2 + 1];
  }
}

function getSolvedPoseWorld(m) {
  if (!m) return [];
  const pose = cloneBones(getPoseBones(m));
  enforceConnectedHeads(pose);
  if (state.boneMode === "pose") {
    const plan = buildConstraintExecutionPlan(m);
    for (const step of plan) {
      if (!step || !step.ref) continue;
      if (step.type === "pth") applySinglePathConstraintToBones(m, pose, step.ref);
      else if (step.type === "tfc") applySingleTransformConstraintToBones(m, pose, step.ref);
      else if (step.type === "ik") applySingleIKConstraintToBones(pose, step.ref);
      enforceConnectedHeads(pose);
    }
  }
  return computeWorld(pose);
}

function drawOverlay() {
  const m = state.mesh;
  const ctx = overlayCtx;
  ctx.clearRect(0, 0, els.overlay.width, els.overlay.height);
  if (state.overlayScene.enabled && state.overlayScene.canvas) {
    ctx.drawImage(state.overlayScene.canvas, 0, 0);
  }
  drawBackdropGridAndRuler(ctx);
  if (!m) return;

  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(80, 180, 220, 0.28)";
  let meshForOverlay = m;
  let screenForOverlay = m.deformedScreen;
  if (state.slots.length > 0) {
    const slot = getActiveSlot();
    if (slot) {
      const poseWorld = getSolvedPoseWorld(m);
      const geom = buildSlotGeometry(slot, poseWorld);
      if (slot.meshData && geom.screen) {
        meshForOverlay = slot.meshData;
        screenForOverlay = geom.screen;
      }
    }
  }
  const isGridMesh =
    Number.isFinite(meshForOverlay.cols) &&
    Number.isFinite(meshForOverlay.rows) &&
    meshForOverlay.cols > 0 &&
    meshForOverlay.rows > 0 &&
    (meshForOverlay.cols + 1) * (meshForOverlay.rows + 1) === screenForOverlay.length / 2;

  if (state.editMode === "slotmesh") {
    const slot = getActiveSlot();
    if (slot) {
      const contour = ensureSlotContour(slot);
      if (contour.closed && contour.points.length >= 3) {
        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.42)";
        ctx.fillRect(0, 0, els.overlay.width, els.overlay.height);
        ctx.globalCompositeOperation = "destination-out";
        ctx.beginPath();
        for (let i = 0; i < contour.points.length; i += 1) {
          const p = contour.points[i];
          const s = localToScreen(p.x, p.y);
          if (i === 0) ctx.moveTo(s.x, s.y);
          else ctx.lineTo(s.x, s.y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }
  }

  const poseWorldForClip = getSolvedPoseWorld(m);
  for (const s of state.slots || []) {
    if (!s || !s.clipEnabled || !isSlotEditorVisible(s)) continue;
    const poly = getSlotClipPolygonScreen(s, poseWorldForClip);
    if (poly.length < 3) continue;
    ctx.save();
    ctx.setLineDash([6, 4]);
    ctx.strokeStyle = "rgba(255, 120, 200, 0.92)";
    ctx.lineWidth = 1.8;
    if (drawClipPath2D(ctx, poly)) ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "rgba(255, 140, 210, 0.95)";
    ctx.font = "12px Segoe UI, sans-serif";
    const p0 = poly[0];
    const endName =
      s.clipEndSlotId && state.slots.find((x) => x && x.id && String(x.id) === String(s.clipEndSlotId))
        ? state.slots.find((x) => x && x.id && String(x.id) === String(s.clipEndSlotId)).name
        : "end";
    ctx.fillText(`CLIP ${s.name || ""} -> ${endName}`, p0.x + 8, p0.y - 8);
    ctx.restore();
  }

  if (isGridMesh) {
    for (let y = 0; y <= meshForOverlay.rows; y += 1) {
      ctx.beginPath();
      for (let x = 0; x <= meshForOverlay.cols; x += 1) {
        const i = y * (meshForOverlay.cols + 1) + x;
        const px = screenForOverlay[i * 2];
        const py = screenForOverlay[i * 2 + 1];
        if (x === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
    for (let x = 0; x <= meshForOverlay.cols; x += 1) {
      ctx.beginPath();
      for (let y = 0; y <= meshForOverlay.rows; y += 1) {
        const i = y * (meshForOverlay.cols + 1) + x;
        const px = screenForOverlay[i * 2];
        const py = screenForOverlay[i * 2 + 1];
        if (y === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
  } else if (meshForOverlay.indices && meshForOverlay.indices.length > 0) {
    const idx = meshForOverlay.indices;
    for (let t = 0; t + 2 < idx.length; t += 3) {
      const i0 = idx[t];
      const i1 = idx[t + 1];
      const i2 = idx[t + 2];
      const p0x = screenForOverlay[i0 * 2];
      const p0y = screenForOverlay[i0 * 2 + 1];
      const p1x = screenForOverlay[i1 * 2];
      const p1y = screenForOverlay[i1 * 2 + 1];
      const p2x = screenForOverlay[i2 * 2];
      const p2y = screenForOverlay[i2 * 2 + 1];
      ctx.beginPath();
      ctx.moveTo(p0x, p0y);
      ctx.lineTo(p1x, p1y);
      ctx.lineTo(p2x, p2y);
      ctx.closePath();
      ctx.stroke();
    }
  }

  if (state.editMode !== "slotmesh") {
    const bones = getActiveBones(m);
    const world = state.boneMode === "pose" ? getSolvedPoseWorld(m) : (enforceConnectedHeads(bones), computeWorld(bones));
    const ikBones = getIkConstrainedBoneSet(m);
    const ikTargets = getIkTargetBoneSet(m);
    const tfcBones = getTransformConstrainedBoneSet(m);
    const tfcTargets = getTransformTargetBoneSet(m);
    const pathBones = getPathConstrainedBoneSet(m);
    const pathTargets = getPathTargetBoneSet(m);
    const pList = ensurePathConstraints(m);
    const activePathIndex = Number.isFinite(state.selectedPath) ? Number(state.selectedPath) : -1;
    for (let pi = 0; pi < pList.length; pi += 1) {
      const p = pList[pi];
      if (!p || p.enabled === false) continue;
      const isActive = pi === activePathIndex;
      if (p.sourceType === "drawn") {
        const nodes = getDrawnPathNodes(p);
        if (nodes.length < 2) continue;
        ctx.strokeStyle = isActive ? "rgba(125, 211, 252, 0.95)" : "rgba(125, 211, 252, 0.55)";
        ctx.lineWidth = isActive ? 2.6 : 1.4;
        ctx.beginPath();
        const s0 = localToScreen(nodes[0].x, nodes[0].y);
        ctx.moveTo(s0.x, s0.y);
        const segCount = p.closed ? nodes.length : nodes.length - 1;
        for (let i = 0; i < segCount; i += 1) {
          const a = nodes[i];
          const b = nodes[(i + 1) % nodes.length];
          const c1 = localToScreen(a.houtx, a.houty);
          const c2 = localToScreen(b.hinx, b.hiny);
          const e = localToScreen(b.x, b.y);
          ctx.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, e.x, e.y);
        }
        ctx.stroke();
        for (let i = 0; i < nodes.length; i += 1) {
          const s = localToScreen(nodes[i].x, nodes[i].y);
          const activePoint = isActive && state.pathEdit.activePoint === i && state.pathEdit.activeHandle === "point";
          ctx.fillStyle = activePoint ? "#ffe46e" : isActive ? "#9ed8ff" : "rgba(158,216,255,0.6)";
          ctx.beginPath();
          ctx.arc(s.x, s.y, activePoint ? 5.1 : isActive ? 4.2 : 3.1, 0, Math.PI * 2);
          ctx.fill();
        }
        if (isActive) {
          for (let i = 0; i < nodes.length; i += 1) {
            const n = nodes[i];
            const ps = localToScreen(n.x, n.y);
            const ins = localToScreen(n.hinx, n.hiny);
            const outs = localToScreen(n.houtx, n.houty);
            ctx.strokeStyle = "rgba(158,216,255,0.45)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(ps.x, ps.y);
            ctx.lineTo(ins.x, ins.y);
            ctx.moveTo(ps.x, ps.y);
            ctx.lineTo(outs.x, outs.y);
            ctx.stroke();
            const inActive = state.pathEdit.activePoint === i && state.pathEdit.activeHandle === "in";
            const outActive = state.pathEdit.activePoint === i && state.pathEdit.activeHandle === "out";
            ctx.fillStyle = inActive ? "#ffb36a" : "rgba(255,179,106,0.85)";
            ctx.beginPath();
            ctx.arc(ins.x, ins.y, inActive ? 4.4 : 3.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = outActive ? "#90ff9b" : "rgba(144,255,155,0.85)";
            ctx.beginPath();
            ctx.arc(outs.x, outs.y, outActive ? 4.4 : 3.4, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      } else {
        const pts =
          p.sourceType === "bone_chain"
            ? collectPathChainPoints(bones, Number(p.target), !!p.closed)
            : collectSlotContourPathPoints(m, bones, Number(p.targetSlot), !!p.closed);
        if (!Array.isArray(pts) || pts.length < 2) continue;
        ctx.strokeStyle = isActive ? "rgba(125, 211, 252, 0.95)" : "rgba(125, 211, 252, 0.55)";
        ctx.lineWidth = isActive ? 2.6 : 1.4;
        ctx.beginPath();
        for (let i = 0; i < pts.length; i += 1) {
          const s = localToScreen(Number(pts[i].x) || 0, Number(pts[i].y) || 0);
          if (i === 0) ctx.moveTo(s.x, s.y);
          else ctx.lineTo(s.x, s.y);
        }
        ctx.stroke();
      }
    }
    for (let i = 0; i < bones.length; i += 1) {
      const b = bones[i];
      const start = transformPoint(world[i], 0, 0);
      const end = transformPoint(world[i], b.length, 0);
      const ss = localToScreen(start.x, start.y);
      const es = localToScreen(end.x, end.y);

    const isPrimarySelected = i === state.selectedBone;
    const isMultiSelected = Array.isArray(state.selectedBonesForWeight) && state.selectedBonesForWeight.includes(i);
    const isParentCandidate = state.parentPickArmed && state.parentHoverBone === i;
    const isIkTargetCandidate = state.ikPickArmed && state.ikHoverBone === i;
    const isIKBone = ikBones.has(i);
    const isIKTarget = ikTargets.has(i);
    const isTFCBone = tfcBones.has(i);
    const isTFCTarget = tfcTargets.has(i);
    const isPathBone = pathBones.has(i);
    const isPathTarget = pathTargets.has(i);
    if (isPrimarySelected) {
      ctx.strokeStyle = "rgba(255, 236, 153, 0.28)";
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(ss.x, ss.y);
      ctx.lineTo(es.x, es.y);
      ctx.stroke();
    } else if (isMultiSelected) {
      ctx.strokeStyle = "rgba(125, 211, 252, 0.25)";
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(ss.x, ss.y);
      ctx.lineTo(es.x, es.y);
      ctx.stroke();
    }

    ctx.strokeStyle = isParentCandidate
      ? "#ff7ad9"
      : isPrimarySelected
        ? "#ffe46e"
        : isMultiSelected
          ? "#7dd3fc"
          : isIKBone
            ? "#5df5ff"
          : isIKTarget
            ? "#6effd8"
          : isTFCBone
            ? "#f8a3ff"
          : isTFCTarget
            ? "#ffcc66"
          : isPathBone
            ? "#7ea4ff"
          : isPathTarget
            ? "#9ac4ff"
          : state.addBoneArmed
            ? "rgba(246,184,76,0.55)"
            : b.connected
              ? "#f6b84c"
              : "#7dd3fc";
    ctx.lineWidth = isPrimarySelected || isParentCandidate ? 4 : isMultiSelected ? 3 : 2;
    ctx.beginPath();
    ctx.moveTo(ss.x, ss.y);
    ctx.lineTo(es.x, es.y);
    ctx.stroke();

    ctx.fillStyle = isParentCandidate
      ? "#ffd0f5"
      : isPrimarySelected
        ? "#fff0b8"
        : isMultiSelected
          ? "#d3f2ff"
          : isIKTarget
            ? "#b8ffea"
            : "#ffd9a0";
    ctx.beginPath();
    ctx.arc(ss.x, ss.y, isPrimarySelected || isParentCandidate ? 6 : isMultiSelected ? 5.5 : 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(es.x, es.y, isPrimarySelected || isParentCandidate ? 8 : isMultiSelected ? 7 : 6, 0, Math.PI * 2);
    ctx.fill();

      if (isIkTargetCandidate) {
        ctx.strokeStyle = "#6effd8";
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(ss.x, ss.y, 10, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(es.x, es.y, 12, 0, Math.PI * 2);
        ctx.stroke();
      }

      if (isPrimarySelected) {
        ctx.fillStyle = "#ffe46e";
        ctx.font = "12px Segoe UI, sans-serif";
        ctx.fillText("SEL", es.x + 10, es.y - 8);
      } else if (isIkTargetCandidate) {
        ctx.fillStyle = "#84ffe0";
        ctx.font = "12px Segoe UI, sans-serif";
        ctx.fillText("IK TARGET", es.x + 10, es.y - 8);
      } else if (isIKBone) {
        ctx.fillStyle = "#8cf7ff";
        ctx.font = "12px Segoe UI, sans-serif";
        ctx.fillText("IK", es.x + 10, es.y - 8);
      } else if (isIKTarget) {
        ctx.fillStyle = "#9effee";
        ctx.font = "12px Segoe UI, sans-serif";
        ctx.fillText("IK-T", es.x + 10, es.y - 8);
      } else if (isTFCBone) {
        ctx.fillStyle = "#ffc1ff";
        ctx.font = "12px Segoe UI, sans-serif";
        ctx.fillText("TC", es.x + 10, es.y - 8);
      } else if (isTFCTarget) {
        ctx.fillStyle = "#ffe3a8";
        ctx.font = "12px Segoe UI, sans-serif";
        ctx.fillText("TC-T", es.x + 10, es.y - 8);
      } else if (isPathBone) {
        ctx.fillStyle = "#b7c9ff";
        ctx.font = "12px Segoe UI, sans-serif";
        ctx.fillText("PATH", es.x + 10, es.y - 8);
      } else if (isPathTarget) {
        ctx.fillStyle = "#cde0ff";
        ctx.font = "12px Segoe UI, sans-serif";
        ctx.fillText("PTH-T", es.x + 10, es.y - 8);
      } else if (isParentCandidate) {
        ctx.fillStyle = "#ff9de3";
        ctx.font = "12px Segoe UI, sans-serif";
        ctx.fillText("PARENT", es.x + 10, es.y - 8);
      }
    }

    if (state.boneMode === "pose") {
      const list = ensureIKConstraints(m).filter((c) => c && c.enabled !== false);
      const selected = getActiveIKConstraint();
      for (let ci = 0; ci < list.length; ci += 1) {
        const ik = list[ci];
        const tw = getIKSolveTargetWorld(bones, ik);
        if (!tw) continue;
        const ts = localToScreen(tw.x, tw.y);
        const isActive = selected && selected === ik;
        ctx.strokeStyle = isActive ? "#6effd8" : "rgba(110, 255, 216, 0.7)";
        ctx.fillStyle = isActive ? "#6effd8" : "rgba(110, 255, 216, 0.5)";
        ctx.lineWidth = isActive ? 2.2 : 1.4;
        ctx.beginPath();
        ctx.arc(ts.x, ts.y, isActive ? 7 : 5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(ts.x - 8, ts.y);
        ctx.lineTo(ts.x + 8, ts.y);
        ctx.moveTo(ts.x, ts.y - 8);
        ctx.lineTo(ts.x, ts.y + 8);
        ctx.stroke();
        const chain = Array.isArray(ik.bones) ? ik.bones : [];
        if (chain.length > 0) {
          const endBi = chain[chain.length - 1];
          if (Number.isFinite(endBi) && endBi >= 0 && endBi < bones.length) {
            const ep =
              chain.length >= 2 && ik.endMode !== "tail"
                ? transformPoint(world[endBi], 0, 0)
                : transformPoint(world[endBi], Number(bones[endBi].length) || 0, 0);
            const es = localToScreen(ep.x, ep.y);
            ctx.setLineDash([5, 5]);
            ctx.strokeStyle = isActive ? "rgba(110,255,216,0.95)" : "rgba(110,255,216,0.6)";
            ctx.beginPath();
            ctx.moveTo(es.x, es.y);
            ctx.lineTo(ts.x, ts.y);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        }
        if (isActive) {
          ctx.fillStyle = "#9effee";
          ctx.font = "12px Segoe UI, sans-serif";
          ctx.fillText(
            `IK ${ik.name} | mix ${Number(ik.mix).toFixed(2)} | ${ik.bendPositive === false ? "bend -" : "bend +"}`,
            ts.x + 10,
            ts.y + 16
          );
        }
      }
      const tList = ensureTransformConstraints(m).filter((c) => c && c.enabled !== false);
      const tSelected = getActiveTransformConstraint();
      for (const tc of tList) {
        if (!tc) continue;
        const ti = Number(tc.target);
        if (!Number.isFinite(ti) || ti < 0 || ti >= bones.length) continue;
        const tHead = transformPoint(world[ti], 0, 0);
        const ts = localToScreen(tHead.x, tHead.y);
        const isActive = !!(tSelected && tSelected === tc);
        ctx.strokeStyle = isActive ? "#ffc1ff" : "rgba(255, 193, 255, 0.65)";
        ctx.lineWidth = isActive ? 2 : 1.2;
        ctx.beginPath();
        ctx.rect(ts.x - 5, ts.y - 5, 10, 10);
        ctx.stroke();
        for (const bi of tc.bones || []) {
          if (!Number.isFinite(bi) || bi < 0 || bi >= bones.length) continue;
          const bh = transformPoint(world[bi], 0, 0);
          const bs = localToScreen(bh.x, bh.y);
          ctx.setLineDash([4, 3]);
          ctx.strokeStyle = isActive ? "rgba(255,193,255,0.95)" : "rgba(255,193,255,0.55)";
          ctx.beginPath();
          ctx.moveTo(ts.x, ts.y);
          ctx.lineTo(bs.x, bs.y);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }
    }
  }

  if (state.editMode === "vertex") {
    const vCount = Math.floor((screenForOverlay && screenForOverlay.length ? screenForOverlay.length : 0) / 2);
    const selectedVerts = getActiveVertexSelection(vCount);
    const selectedSet = new Set(selectedVerts);
    const pinnedSet = getActivePinnedVertexSet(vCount);
    if (state.vertexDeform.heatmap && state.vertexDeform.hasCursor && vCount > 0) {
      const r = Math.max(4, Number(state.vertexDeform.radius) || 80);
      for (let i = 0; i < vCount; i += 1) {
        const dx = screenForOverlay[i * 2] - state.vertexDeform.cursorX;
        const dy = screenForOverlay[i * 2 + 1] - state.vertexDeform.cursorY;
        const d2 = dx * dx + dy * dy;
        if (d2 > r * r) continue;
        const w = getVertexFalloffWeight(Math.sqrt(d2) / r);
        if (w <= 1e-4) continue;
        ctx.fillStyle = getHeatmapColor(w);
        ctx.beginPath();
        ctx.arc(screenForOverlay[i * 2], screenForOverlay[i * 2 + 1], 5.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    if (state.vertexDeform.proportional && state.vertexDeform.hasCursor) {
      const r = Math.max(4, Number(state.vertexDeform.radius) || 80);
      ctx.strokeStyle = "rgba(122, 214, 255, 0.85)";
      ctx.lineWidth = 1.4;
      ctx.setLineDash([6, 5]);
      ctx.beginPath();
      ctx.arc(state.vertexDeform.cursorX, state.vertexDeform.cursorY, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.fillStyle = "rgba(220, 245, 255, 0.92)";
    for (let i = 0; i < screenForOverlay.length / 2; i += 1) {
      ctx.beginPath();
      ctx.arc(screenForOverlay[i * 2], screenForOverlay[i * 2 + 1], 2.1, 0, Math.PI * 2);
      ctx.fill();
      if (selectedSet.has(i)) {
        ctx.strokeStyle = "rgba(255, 224, 112, 0.96)";
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(screenForOverlay[i * 2], screenForOverlay[i * 2 + 1], 5.6, 0, Math.PI * 2);
        ctx.stroke();
      }
      if (pinnedSet.has(i)) {
        ctx.strokeStyle = "rgba(255, 146, 92, 0.95)";
        ctx.lineWidth = 2.1;
        ctx.beginPath();
        ctx.arc(screenForOverlay[i * 2], screenForOverlay[i * 2 + 1], 8.2, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }

  if (state.editMode === "slotmesh") {
    const slot = getActiveSlot();
    if (slot) {
      const contour = ensureSlotContour(slot);
      const activeSet = state.slotMesh.activeSet === "fill" ? "fill" : "contour";
      const triIdx =
        Array.isArray(contour.fillTriangles) && contour.fillTriangles.length >= 3 ? contour.fillTriangles : contour.triangles;
      const triPts =
        Array.isArray(contour.fillPoints) && contour.fillPoints.length >= 3 ? contour.fillPoints : contour.points;
      if (Array.isArray(triIdx) && triIdx.length >= 3) {
        ctx.strokeStyle = "rgba(63, 208, 162, 0.65)";
        ctx.lineWidth = 1.2;
        for (let t = 0; t + 2 < triIdx.length; t += 3) {
          const a = triPts[triIdx[t]];
          const b = triPts[triIdx[t + 1]];
          const c = triPts[triIdx[t + 2]];
          if (!a || !b || !c) continue;
          const sa = localToScreen(a.x, a.y);
          const sb = localToScreen(b.x, b.y);
          const sc = localToScreen(c.x, c.y);
          ctx.beginPath();
          ctx.moveTo(sa.x, sa.y);
          ctx.lineTo(sb.x, sb.y);
          ctx.lineTo(sc.x, sc.y);
          ctx.closePath();
          ctx.stroke();
        }
      }
      const drawManualEdges = (points, edges, color) => {
        if (!Array.isArray(points) || !Array.isArray(edges) || points.length === 0) return;
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.2;
        for (const e of edges) {
          if (!Array.isArray(e) || e.length < 2) continue;
          const a = points[e[0]];
          const b = points[e[1]];
          if (!a || !b) continue;
          const sa = localToScreen(a.x, a.y);
          const sb = localToScreen(b.x, b.y);
          ctx.beginPath();
          ctx.moveTo(sa.x, sa.y);
          ctx.lineTo(sb.x, sb.y);
          ctx.stroke();
        }
      };
      drawManualEdges(contour.points, contour.manualEdges, "rgba(255, 158, 80, 0.95)");
      drawManualEdges(contour.fillPoints, contour.fillManualEdges, "rgba(255, 120, 168, 0.95)");

      ctx.strokeStyle = contour.closed ? "#66f2cc" : "#7dd3fc";
      ctx.lineWidth = 2;
      if (contour.points.length > 0) {
        ctx.beginPath();
        for (let i = 0; i < contour.points.length; i += 1) {
          const p = contour.points[i];
          const s = localToScreen(p.x, p.y);
          if (i === 0) ctx.moveTo(s.x, s.y);
          else ctx.lineTo(s.x, s.y);
        }
        if (contour.closed) ctx.closePath();
        ctx.stroke();
      }
      for (let i = 0; i < contour.fillPoints.length; i += 1) {
        const p = contour.fillPoints[i];
        const s = localToScreen(p.x, p.y);
        const active = activeSet === "fill" && i === state.slotMesh.activePoint;
        ctx.fillStyle = active ? "#ff8fd0" : "#88e9ff";
        ctx.beginPath();
        ctx.arc(s.x, s.y, active ? 5.8 : 3.2, 0, Math.PI * 2);
        ctx.fill();
      }
      for (let i = 0; i < contour.points.length; i += 1) {
        const p = contour.points[i];
        const s = localToScreen(p.x, p.y);
        const active = activeSet === "contour" && i === state.slotMesh.activePoint;
        ctx.fillStyle = active ? "#ffe46e" : i === 0 ? "#66f2cc" : "#d3f2ff";
        ctx.beginPath();
        ctx.arc(s.x, s.y, active ? 6 : 4.5, 0, Math.PI * 2);
        ctx.fill();
      }
      if (state.slotMesh.edgeSelectionSet && state.slotMesh.edgeSelection.length > 0) {
        const points = state.slotMesh.edgeSelectionSet === "fill" ? contour.fillPoints : contour.points;
        for (const i of state.slotMesh.edgeSelection) {
          const p = points[i];
          if (!p) continue;
          const s = localToScreen(p.x, p.y);
          ctx.strokeStyle = "#ff8a55";
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.arc(s.x, s.y, 8.5, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    }
  }

  if (state.drag && state.drag.type === "vertex") {
    const i = state.drag.index;
    const influences = Array.isArray(state.drag.influences) ? state.drag.influences : [];
    if (influences.length > 1) {
      for (const it of influences) {
        const vi = Number(it && it.index);
        if (!Number.isFinite(vi) || vi < 0 || vi >= screenForOverlay.length / 2 || vi === i) continue;
        const w = math.clamp(Number(it && it.weight) || 0, 0, 1);
        ctx.strokeStyle = `rgba(122, 214, 255, ${0.2 + w * 0.6})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(screenForOverlay[vi * 2], screenForOverlay[vi * 2 + 1], 4.2, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.strokeStyle = "#ff7272";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(screenForOverlay[i * 2], screenForOverlay[i * 2 + 1], 8, 0, Math.PI * 2);
    ctx.stroke();
  }

  if (state.drag && state.drag.type === "bone_marquee") {
    const x = Math.min(state.drag.startX, state.drag.curX);
    const y = Math.min(state.drag.startY, state.drag.curY);
    const w = Math.abs(state.drag.curX - state.drag.startX);
    const h = Math.abs(state.drag.curY - state.drag.startY);
    ctx.fillStyle = "rgba(125, 211, 252, 0.12)";
    ctx.strokeStyle = "rgba(125, 211, 252, 0.9)";
    ctx.lineWidth = 1.5;
    ctx.fillRect(x, y, w, h);
    ctx.strokeRect(x, y, w, h);
  }

  if (state.drag && state.drag.type === "vertex_marquee") {
    const x = Math.min(state.drag.startX, state.drag.curX);
    const y = Math.min(state.drag.startY, state.drag.curY);
    const w = Math.abs(state.drag.curX - state.drag.startX);
    const h = Math.abs(state.drag.curY - state.drag.startY);
    ctx.fillStyle = "rgba(255, 214, 112, 0.12)";
    ctx.strokeStyle = "rgba(255, 214, 112, 0.92)";
    ctx.lineWidth = 1.5;
    ctx.fillRect(x, y, w, h);
    ctx.strokeRect(x, y, w, h);
  }

  if (state.addBoneDraft) {
    const hs = localToScreen(state.addBoneDraft.head.x, state.addBoneDraft.head.y);
    const ts = localToScreen(state.addBoneDraft.tail.x, state.addBoneDraft.tail.y);
    ctx.strokeStyle = "#7dd3fc";
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.moveTo(hs.x, hs.y);
    ctx.lineTo(ts.x, ts.y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#d1f4ff";
    ctx.beginPath();
    ctx.arc(hs.x, hs.y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(ts.x, ts.y, 6, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawMeshOnContext(ctx, drawCanvas = state.sourceCanvas, alpha = 1, tint = null, screen = null, indices = null, uvs = null, blendMode = "normal") {
  if (!ctx) return;
  const m = state.mesh;
  if (!m || !drawCanvas) return;
  const tr = tint && Number.isFinite(tint.r) ? math.clamp(Number(tint.r), 0, 1) : 1;
  const tg = tint && Number.isFinite(tint.g) ? math.clamp(Number(tint.g), 0, 1) : 1;
  const tb = tint && Number.isFinite(tint.b) ? math.clamp(Number(tint.b), 0, 1) : 1;
  const useTint = Math.abs(tr - 1) > 1e-4 || Math.abs(tg - 1) > 1e-4 || Math.abs(tb - 1) > 1e-4;
  const composite = getCanvasCompositeForBlendMode(blendMode);

  const iw = drawCanvas.width;
  const ih = drawCanvas.height;
  const index = indices || m.indices;
  const uvData = uvs || m.uvs;
  const expandForClip = (x0, y0, x1, y1, x2, y2, overlapPx = 0.6) => {
    const cx = (x0 + x1 + x2) / 3;
    const cy = (y0 + y1 + y2) / 3;
    const v0x = x0 - cx;
    const v0y = y0 - cy;
    const v1x = x1 - cx;
    const v1y = y1 - cy;
    const v2x = x2 - cx;
    const v2y = y2 - cy;
    const l0 = Math.hypot(v0x, v0y) || 1;
    const l1 = Math.hypot(v1x, v1y) || 1;
    const l2 = Math.hypot(v2x, v2y) || 1;
    return {
      x0: x0 + (v0x / l0) * overlapPx,
      y0: y0 + (v0y / l0) * overlapPx,
      x1: x1 + (v1x / l1) * overlapPx,
      y1: y1 + (v1y / l1) * overlapPx,
      x2: x2 + (v2x / l2) * overlapPx,
      y2: y2 + (v2y / l2) * overlapPx,
    };
  };

  for (let t = 0; t < index.length; t += 3) {
    const i0 = index[t];
    const i1 = index[t + 1];
    const i2 = index[t + 2];

    const sp = screen || m.deformedScreen;
    const sx0 = sp[i0 * 2];
    const sy0 = sp[i0 * 2 + 1];
    const sx1 = sp[i1 * 2];
    const sy1 = sp[i1 * 2 + 1];
    const sx2 = sp[i2 * 2];
    const sy2 = sp[i2 * 2 + 1];
    const screenArea2 = (sx1 - sx0) * (sy2 - sy0) - (sy1 - sy0) * (sx2 - sx0);
    if (Math.abs(screenArea2) < 1e-4) continue;

    const u0 = uvData[i0 * 2] * iw;
    const v0 = uvData[i0 * 2 + 1] * ih;
    const u1 = uvData[i1 * 2] * iw;
    const v1 = uvData[i1 * 2 + 1] * ih;
    const u2 = uvData[i2 * 2] * iw;
    const v2 = uvData[i2 * 2 + 1] * ih;

    const den = u0 * (v1 - v2) + u1 * (v2 - v0) + u2 * (v0 - v1);
    if (Math.abs(den) < 1e-8) continue;

    const a = (sx0 * (v1 - v2) + sx1 * (v2 - v0) + sx2 * (v0 - v1)) / den;
    const b = (sx0 * (u2 - u1) + sx1 * (u0 - u2) + sx2 * (u1 - u0)) / den;
    const c = (sx0 * (u1 * v2 - u2 * v1) + sx1 * (u2 * v0 - u0 * v2) + sx2 * (u0 * v1 - u1 * v0)) / den;
    const d = (sy0 * (v1 - v2) + sy1 * (v2 - v0) + sy2 * (v0 - v1)) / den;
    const e = (sy0 * (u2 - u1) + sy1 * (u0 - u2) + sy2 * (u1 - u0)) / den;
    const f = (sy0 * (u1 * v2 - u2 * v1) + sy1 * (u2 * v0 - u0 * v2) + sy2 * (u0 * v1 - u1 * v0)) / den;
    const exp = expandForClip(sx0, sy0, sx1, sy1, sx2, sy2, 0.55);

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(exp.x0, exp.y0);
    ctx.lineTo(exp.x1, exp.y1);
    ctx.lineTo(exp.x2, exp.y2);
    ctx.closePath();
    ctx.clip();
    ctx.setTransform(a, d, b, e, c, f);
    ctx.globalAlpha = math.clamp(alpha, 0, 1);
    ctx.globalCompositeOperation = composite;
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(drawCanvas, 0, 0);
    if (useTint) {
      ctx.globalCompositeOperation = "multiply";
      ctx.fillStyle = `rgb(${Math.round(tr * 255)}, ${Math.round(tg * 255)}, ${Math.round(tb * 255)})`;
      ctx.fillRect(0, 0, iw, ih);
      ctx.globalCompositeOperation = "destination-atop";
      ctx.drawImage(drawCanvas, 0, 0);
      ctx.globalCompositeOperation = "source-over";
    }
    ctx.restore();
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
}

function drawMesh2D(drawCanvas = state.sourceCanvas, alpha = 1, tint = null, screen = null, indices = null, uvs = null, blendMode = "normal") {
  if (!stage2dCtx) return;
  drawMeshOnContext(stage2dCtx, drawCanvas, alpha, tint, screen, indices, uvs, blendMode);
}

function getSlotClipPolygonScreen(slot, poseWorld) {
  const localPts = getSlotClipPointsLocal(slot);
  if (!Array.isArray(localPts) || localPts.length < 3) return [];
  const tm = getSlotTransformMatrix(slot, poseWorld);
  const out = [];
  for (const p of localPts) {
    const w = transformPoint(tm, Number(p.x) || 0, Number(p.y) || 0);
    const s = localToScreen(w.x, w.y);
    out.push(s);
  }
  return out.length >= 3 ? out : [];
}

function drawClipPath2D(ctx, points) {
  if (!ctx || !Array.isArray(points) || points.length < 3) return false;
  ctx.beginPath();
  for (let i = 0; i < points.length; i += 1) {
    const p = points[i];
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  }
  ctx.closePath();
  return true;
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
    if (slot.clipEnabled) {
      const poly = getSlotClipPolygonScreen(slot, poseWorld);
      activeClip = poly.length >= 3
        ? {
            points: poly,
            endSlotId: slot.clipEndSlotId ? String(slot.clipEndSlotId) : null,
          }
        : null;
      continue;
    }
    if (!slot.canvas || !hasRenderableAttachment(slot)) {
      if (activeClip && activeClip.endSlotId && slot.id && String(slot.id) === activeClip.endSlotId) activeClip = null;
      continue;
    }
    const geom = buildSlotGeometry(slot, poseWorld);
    if (activeClip && activeClip.points && activeClip.points.length >= 3) {
      ctx.save();
      if (drawClipPath2D(ctx, activeClip.points)) ctx.clip();
      drawMeshOnContext(
        ctx,
        slot.canvas,
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
        slot.canvas,
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

  const drawGhost = (offset, tint, orderCount) => {
    const sampleTime = getOnionSampleTime(baseTime, offset, duration);
    samplePoseAtTime(state.mesh, sampleTime, { applyStateParamTracks: false });
    updateDeformation();
    const poseWorld = getSolvedPoseWorld(state.mesh);
    const fade = 1 - (Math.abs(offset) - 1) / Math.max(1, orderCount + 1);
    renderSlots2DWithClipping(ctx, slots, poseWorld, {
      alphaMul: math.clamp(onion.alpha * fade, 0, 1),
      tintMul: tint,
    });
    drawn = true;
  };

  for (let i = onion.prevFrames; i >= 1; i -= 1) {
    drawGhost(-i, prevTint, onion.prevFrames);
  }
  for (let i = onion.nextFrames; i >= 1; i -= 1) {
    drawGhost(i, nextTint, onion.nextFrames);
  }

  samplePoseAtTime(state.mesh, baseTime);
  updateDeformation();
  return drawn;
}

function render(ts = 0) {
  updateAnimationPlayback(ts);
  if (ts - (Number(state.history.lastCaptureTs) || 0) > 220) {
    pushUndoCheckpoint(false);
    state.history.lastCaptureTs = ts;
  }
  resize();
  if (state.mesh) {
    updateDeformation();
  }

  const slots = getRenderableSlots();
  const hasClipSlot = slots.some((s) => s && s.clipEnabled);
  const wantsOnion = shouldRenderOnionSkin();

  if (hasGL && !hasClipSlot) {
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
    gl.clearColor(0.04, 0.06, 0.08, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    if (state.mesh && state.texture) {
      gl.useProgram(program);
      bindGeometry();
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
      gl.uniform2f(loc.uResolution, els.glCanvas.width, els.glCanvas.height);
      const poseWorld = getSolvedPoseWorld(state.mesh);
      for (const slot of slots) {
        if (!slot || !slot.canvas || !hasRenderableAttachment(slot)) continue;
        ensureSlotVisualState(slot);
        const geom = buildSlotGeometry(slot, poseWorld);
        if (!geom.interleaved) continue;
        gl.bufferData(gl.ARRAY_BUFFER, geom.interleaved, gl.DYNAMIC_DRAW);
        const drawIndices = geom.indices || state.mesh.indices;
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, drawIndices, gl.DYNAMIC_DRAW);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, state.texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, slot.canvas);
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
        gl.drawElements(gl.TRIANGLES, drawIndices.length, gl.UNSIGNED_SHORT, 0);
      }
      applyGLBlendMode("normal");
    }
  } else {
    const ctx = hasGL ? ensureOverlaySceneCanvas() : stage2dCtx;
    if (hasGL) {
      state.overlayScene.enabled = true;
      gl.clearColor(0.04, 0.06, 0.08, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
    } else {
      state.overlayScene.enabled = false;
    }
    if (!ctx) {
      drawOverlay();
      requestAnimationFrame(render);
      return;
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, els.glCanvas.width, els.glCanvas.height);
    ctx.fillStyle = "rgb(10, 15, 20)";
    ctx.fillRect(0, 0, els.glCanvas.width, els.glCanvas.height);
    if (wantsOnion) drawOnionSkins2D(ctx, slots);
    const poseWorld = state.mesh ? getSolvedPoseWorld(state.mesh) : [];
    renderSlots2DWithClipping(ctx, slots, poseWorld);
  }

  drawOverlay();
  requestAnimationFrame(render);
}

function pickVertex(mx, my) {
  const m = state.mesh;
  if (!m) return -1;
  if (state.slots.length > 0) {
    const poseWorld = getSolvedPoseWorld(m);
    let best = -1;
    let bestDist2 = 11 * 11;
    let bestSlotIndex = -1;
    const searchSlots =
      state.slotViewMode === "all" ? state.slots.map((slot, idx) => ({ slot, idx })) : [{ slot: getActiveSlot(), idx: state.activeSlot }];
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

function pickSkeletonHandle(mx, my) {
  const m = state.mesh;
  if (!m) return null;
  const bones = getActiveBones(m);
  enforceConnectedHeads(bones);

  const world = state.boneMode === "pose" ? getSolvedPoseWorld(m) : computeWorld(bones);
  let best = 11 * 11;
  let hit = null;

  for (let i = 0; i < bones.length; i += 1) {
    const b = bones[i];
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
  const world = computeWorld(bones);
  const picked = [];
  for (let i = 0; i < bones.length; i += 1) {
    const ep = getBoneWorldEndpointsFromBones(bones, i, world);
    const hs = localToScreen(ep.head.x, ep.head.y);
    const ts = localToScreen(ep.tip.x, ep.tip.y);
    const cx = (hs.x + ts.x) * 0.5;
    const cy = (hs.y + ts.y) * 0.5;
    const inside =
      (hs.x >= left && hs.x <= right && hs.y >= top && hs.y <= bottom) ||
      (ts.x >= left && ts.x <= right && ts.y >= top && ts.y <= bottom) ||
      (cx >= left && cx <= right && cy >= top && cy <= bottom);
    if (inside) picked.push(i);
  }
  if (picked.length === 0) {
    if (!append) {
      state.selectedBonesForWeight = [];
      state.selectedBone = -1;
      updateBoneUI();
    }
    return 0;
  }
  if (append) {
    state.selectedBonesForWeight = [...new Set([...getSelectedBonesForWeight(m), ...picked])];
  } else {
    state.selectedBonesForWeight = picked;
  }
  state.selectedBone = picked[picked.length - 1];
  updateBoneUI();
  return picked.length;
}

function toggleSelectAllBones() {
  const m = state.mesh;
  if (!m || !m.rigBones || m.rigBones.length === 0) return;
  const all = m.rigBones.map((_, i) => i);
  const curr = getSelectedBonesForWeight(m);
  if (curr.length === all.length) {
    state.selectedBonesForWeight = [];
    state.selectedBone = -1;
    setStatus("Bone selection cleared.");
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
  if (b.parent >= 0 && b.connected) {
    if (state.boneMode === "pose" && state.mesh) {
      return !!steerIKTargetFromBoneEdit(state.mesh, boneIndex, localTarget, "head");
    }
    return false;
  }
  if (b.parent < 0) {
    b.tx = localTarget.x;
    b.ty = localTarget.y;
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
  if (state.boneMode !== "pose") return true;
  const b = bones[boneIndex];
  return !!(b && b.poseLenEditable !== false);
}

function rotateBoneTipToLocal(bones, boneIndex, localTarget) {
  const ik = state.mesh ? findEnabledIKForBone(state.mesh, boneIndex) : null;
  if (state.boneMode === "pose" && ik && (ik.bones || []).length === 1) {
    return !!steerIKTargetFromBoneEdit(state.mesh, boneIndex, localTarget, "tip");
  }
  if (state.boneMode === "pose" && ik && (ik.bones || []).length >= 2) {
    const a = Number((ik.bones || [])[0]);
    const bEnd = Number((ik.bones || [])[1]);
    if (boneIndex === bEnd) {
      // For 2-bone IK, end-bone interaction should drive IK target, not directly rewrite child local pose.
      return !!steerIKTargetFromBoneEdit(state.mesh, boneIndex, localTarget, "tip");
    }
    if (boneIndex === a && ik.endMode !== "tail") {
      // Parent tip overlaps child head; treat as end-head manipulation in head mode.
      return !!steerIKTargetFromBoneEdit(state.mesh, bEnd, localTarget, "head");
    }
  }
  const b = bones[boneIndex];
  if (!b) return;
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
  return false;
}

function setDragTool(tool) {
  state.dragTool = tool;
  const label =
    tool === "move_head"
      ? "Tool: Move Head (G)"
      : tool === "move_tail"
        ? "Tool: Move Tail (T)"
        : tool === "rotate"
          ? "Tool: Rotate/Length (R)"
          : "Tool: Auto";
  setStatus(label);
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

function makeAnimId() {
  return `anim_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function makeLayerTrackId() {
  return `layer_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function createAnimation(name = "Anim") {
  return {
    id: makeAnimId(),
    name,
    duration: 5,
    tracks: {},
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

function exportStateMachineBridgeJson() {
  const payload = buildStateMachineBridgePayload();
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const name = "stateMachineBridge.json";
  downloadBlobFile(blob, name);
  setStatus(`Bridge exported: ${name}`);
}

function exportStateMachineBridgeCode() {
  const payload = buildStateMachineBridgePayload();
  const names = payload.stateMachine.parameters.map((p) => p.name);
  const jsSample = `// Web runtime sample
// Available params: ${names.join(", ") || "(none)"}
window.setAnimParam("speed", 1.0);
window.setAnimParam("isExcited", true);
`;
  const unitySample = `// Unity C# sample (conceptual bridge)
// Available params: ${names.join(", ") || "(none)"}
public void SetParam(string name, object value) {
    // Call into your WebView / bridge binding:
    // webView.EvaluateJS($\"window.setAnimParam('{name}', {value});\");
}
`;
  const content = `# State Machine Bridge Samples\n\n## JavaScript\n\`\`\`js\n${jsSample}\`\`\`\n\n## Unity (C#)\n\`\`\`csharp\n${unitySample}\`\`\`\n`;
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const name = "stateMachineBridgeSamples.txt";
  downloadBlobFile(blob, name);
  setStatus(`Bridge code exported: ${name}`);
}

function installStateMachineBridgeApi() {
  const api = {
    setAnimParam: (name, value) => {
      const ok = setStateMachineParamValue(name, value, { refresh: true, sample: true });
      if (!ok) {
        setStatus(`Bridge setAnimParam failed: "${String(name || "")}" not found.`);
        return false;
      }
      return true;
    },
    getAnimParam: (name) => {
      const sm = ensureStateMachine();
      const p = getStateParamByName(sm, name);
      if (!p) return null;
      return p.type === "bool" ? (p.value === true) : (Number(p.value) || 0);
    },
    listAnimParams: () => {
      const sm = ensureStateMachine();
      return (sm.parameters || []).map((p) => ({
        id: String(p.id || ""),
        name: String(p.name || ""),
        type: p.type === "bool" ? "bool" : "float",
        defaultValue: p.defaultValue,
        value: p.value,
      }));
    },
  };
  window.setAnimParam = api.setAnimParam;
  window.getAnimParam = api.getAnimParam;
  window.listAnimParams = api.listAnimParams;
  window.animBridge = api;
}

function getStateParamCurrentValue(param) {
  if (!param) return 0;
  if (param.type === "bool") return param.value === true;
  return Number(param.value);
}

function evaluateStateTransitionCondition(cond, sm) {
  if (!cond || !sm) return false;
  const param = getStateParamById(sm, cond.paramId);
  if (!param) return false;
  const op = String(cond.op || "eq");
  const left = param.type === "bool" ? (param.value === true) : (Number(param.value) || 0);
  const right = parseStateParamRawValue(cond.value, param.type);
  if (param.type === "bool") {
    if (op === "neq") return left !== right;
    return left === right;
  }
  if (op === "gt") return left > right;
  if (op === "gte") return left >= right;
  if (op === "lt") return left < right;
  if (op === "lte") return left <= right;
  if (op === "neq") return left !== right;
  return left === right;
}

function transitionIsTriggered(tr, sm, playbackInfo = null) {
  if (!tr || !sm) return false;
  const conditions = Array.isArray(tr.conditions) ? tr.conditions : [];
  const byCondition = conditions.length > 0 && conditions.every((c) => evaluateStateTransitionCondition(c, sm));
  const info = playbackInfo && typeof playbackInfo === "object" ? playbackInfo : {};
  const byAuto = tr.auto === true && (info.looped === true || info.reachedEnd === true);
  return byCondition || byAuto;
}

function ensureStateMachine() {
  const sm = state.anim.stateMachine || {};
  if (!Array.isArray(sm.states)) sm.states = [];
  if (!Array.isArray(sm.parameters)) sm.parameters = [];
  const validAnimIds = new Set((state.anim.animations || []).map((a) => String(a.id)));
  const validParamIds = new Set();
  sm.parameters = sm.parameters
    .map((p, i) => {
      const type = p && p.type === "bool" ? "bool" : "float";
      const id = p && p.id ? String(p.id) : makeStateParamId();
      const defaultValue = parseStateParamRawValue(p && p.defaultValue, type);
      const value = parseStateParamRawValue(
        p && Object.prototype.hasOwnProperty.call(p, "value") ? p.value : defaultValue,
        type
      );
      validParamIds.add(id);
      return {
        id,
        name: p && p.name ? String(p.name) : `Param ${i + 1}`,
        type,
        defaultValue,
        value,
      };
    })
    .filter((p) => !!p.id);
  sm.states = sm.states
    .map((s, i) => ({
      id: s && s.id ? String(s.id) : makeStateId(),
      name: s && s.name ? String(s.name) : `State ${i + 1}`,
      animId: s && validAnimIds.has(String(s.animId || "")) ? String(s.animId) : "",
      transitions: Array.isArray(s && s.transitions)
        ? s.transitions
            .map((t) => ({
              id: t && t.id ? String(t.id) : makeStateTransitionId(),
              toStateId: t && t.toStateId ? String(t.toStateId) : "",
              duration: Math.max(0.01, Number(t && t.duration) || 0.2),
              auto: !!(t && t.auto),
              conditions: Array.isArray(t && t.conditions)
                ? t.conditions
                    .map((c) => ({
                      id: c && c.id ? String(c.id) : makeStateConditionId(),
                      paramId: c && c.paramId ? String(c.paramId) : "",
                      op:
                        c && (c.op === "eq" || c.op === "neq" || c.op === "gt" || c.op === "gte" || c.op === "lt" || c.op === "lte")
                          ? c.op
                          : "eq",
                      value: c && Object.prototype.hasOwnProperty.call(c, "value") ? c.value : 0,
                    }))
                    .filter((c) => validParamIds.has(c.paramId))
                : [],
            }))
            .filter((t) => !!t.toStateId)
        : [],
    }))
    .filter((s) => !!s.id);

  if (sm.states.length === 0) {
    const current = getCurrentAnimation() || (state.anim.animations && state.anim.animations[0]) || null;
    sm.states.push({
      id: makeStateId(),
      name: "State 1",
      animId: current ? String(current.id) : "",
      transitions: [],
    });
  }

  if (!sm.currentStateId || !sm.states.some((s) => s.id === sm.currentStateId)) {
    sm.currentStateId = sm.states[0].id;
  }
  if (!sm.selectedParamId || !sm.parameters.some((p) => p.id === sm.selectedParamId)) {
    sm.selectedParamId = sm.parameters[0] ? sm.parameters[0].id : "";
  }
  if (!sm.selectedTransitionId) sm.selectedTransitionId = "";
  if (!sm.selectedConditionId) sm.selectedConditionId = "";
  sm.enabled = sm.enabled !== false;
  sm.pendingDuration = Math.max(0.01, Number(sm.pendingDuration) || 0.2);
  if (!sm.pendingStateId || !sm.states.some((s) => s.id === sm.pendingStateId)) sm.pendingStateId = "";
  state.anim.stateMachine = sm;
  return sm;
}

function getCurrentStateMachineState() {
  const sm = ensureStateMachine();
  return sm.states.find((s) => s.id === sm.currentStateId) || sm.states[0] || null;
}

function getSelectedStateTransition() {
  const sm = ensureStateMachine();
  const st = getCurrentStateMachineState();
  if (!st || !Array.isArray(st.transitions)) return null;
  return st.transitions.find((t) => t.id === sm.selectedTransitionId) || null;
}

function transitionToState(stateId, durationSec = 0.2, fromState = null) {
  const sm = ensureStateMachine();
  const toState = sm.states.find((s) => s.id === stateId);
  if (!toState) return false;
  const prev = fromState || getCurrentStateMachineState();
  sm.currentStateId = toState.id;
  sm.pendingStateId = toState.id;
  sm.pendingDuration = Math.max(0.01, Number(durationSec) || 0.2);
  if (toState.animId && toState.animId !== state.anim.currentAnimId) {
    if (!beginAnimationMix(toState.animId, sm.pendingDuration)) {
      state.anim.currentAnimId = toState.animId;
      setAnimTime(0);
      if (state.mesh) samplePoseAtTime(state.mesh, state.anim.time);
      refreshAnimationUI();
    }
  } else {
    setAnimTime(0);
    if (state.mesh) samplePoseAtTime(state.mesh, state.anim.time);
    refreshAnimationUI();
  }
  setStatus(`State: ${(prev && prev.name) || "(none)"} -> ${toState.name}`);
  return true;
}

function tryRunAutoOrConditionalTransition(playbackInfo = null) {
  const sm = ensureStateMachine();
  if (!sm.enabled) return false;
  const from = getCurrentStateMachineState();
  if (!from || !Array.isArray(from.transitions) || from.transitions.length <= 0) return false;
  const tr = from.transitions.find((row) => transitionIsTriggered(row, sm, playbackInfo));
  if (!tr) return false;
  return transitionToState(tr.toStateId, tr.duration, from);
}

function captureUndoSnapshot() {
  return JSON.stringify(buildProjectPayload());
}

async function loadProjectFromJsonText(jsonText, suspendHistory = false) {
  const text = String(jsonText || "{}");
  const fakeInput = {
    value: "",
    files: [
      {
        text: async () => text,
      },
    ],
  };
  const prevSuspend = state.history.suspend;
  state.history.suspend = suspendHistory ? true : prevSuspend;
  try {
    await handleProjectLoadInputChange({ target: fakeInput });
  } finally {
    state.history.suspend = prevSuspend;
  }
}

async function restoreUndoSnapshot(text) {
  await loadProjectFromJsonText(text, true);
}

function getAutosaveEnvelope() {
  try {
    const raw = localStorage.getItem(AUTOSAVE_STORAGE_KEY);
    if (!raw) return null;
    const env = JSON.parse(raw);
    if (!env || typeof env !== "object") return null;
    if (!env.project || typeof env.project !== "object") return null;
    return env;
  } catch {
    return null;
  }
}

function clearAutosaveSnapshot() {
  try {
    localStorage.removeItem(AUTOSAVE_STORAGE_KEY);
  } catch {
    // ignore
  }
}

function saveAutosaveFromSnapshotText(snapshotText, reason = "checkpoint", force = false) {
  if (state.history.suspend) return false;
  const text = String(snapshotText || "");
  if (!text) return false;
  if (!force && text === state.autosave.lastSig) return false;
  try {
    const envelope = {
      version: 1,
      savedAt: Date.now(),
      reason: String(reason || "checkpoint"),
      project: JSON.parse(text),
    };
    localStorage.setItem(AUTOSAVE_STORAGE_KEY, JSON.stringify(envelope));
    state.autosave.lastSig = text;
    return true;
  } catch (err) {
    const now = Date.now();
    if (now - (Number(state.autosave.lastErrorAt) || 0) > 10000) {
      state.autosave.lastErrorAt = now;
      setStatus(`Autosave failed: ${err && err.message ? err.message : "storage unavailable/quota exceeded"}`);
    }
    return false;
  }
}

function saveAutosaveSnapshot(reason = "interval", force = false) {
  if (state.history.suspend) return false;
  try {
    const project = buildProjectPayload();
    const payloadText = JSON.stringify(project);
    if (!force && payloadText === state.autosave.lastSig) return false;
    const envelope = {
      version: 1,
      savedAt: Date.now(),
      reason: String(reason || "interval"),
      project,
    };
    localStorage.setItem(AUTOSAVE_STORAGE_KEY, JSON.stringify(envelope));
    state.autosave.lastSig = payloadText;
    return true;
  } catch (err) {
    const now = Date.now();
    if (now - (Number(state.autosave.lastErrorAt) || 0) > 10000) {
      state.autosave.lastErrorAt = now;
      setStatus(`Autosave failed: ${err && err.message ? err.message : "storage unavailable/quota exceeded"}`);
    }
    return false;
  }
}

function startAutosaveLoop() {
  if (state.autosave.timerId) clearInterval(state.autosave.timerId);
  state.autosave.timerId = window.setInterval(() => {
    saveAutosaveSnapshot("interval", false);
  }, AUTOSAVE_INTERVAL_MS);
}

async function tryRestoreAutosaveAtStartup() {
  const env = getAutosaveEnvelope();
  if (!env) return;
  const ts = Number(env.savedAt) || 0;
  if (ts <= 0 || Date.now() - ts > AUTOSAVE_MAX_AGE_MS) {
    clearAutosaveSnapshot();
    return;
  }
  const savedAtText = new Date(ts).toLocaleString();
  const ok = window.confirm(`Found autosave snapshot (${savedAtText}). Restore it now?`);
  if (!ok) {
    const discard = window.confirm("Discard this autosave snapshot?");
    if (discard) clearAutosaveSnapshot();
    return;
  }
  await loadProjectFromJsonText(JSON.stringify(env.project), false);
  state.autosave.lastSig = JSON.stringify(env.project);
  setStatus(`Recovered autosave from ${savedAtText}.`);
}

function pushUndoCheckpoint(force = false) {
  if (state.history.suspend) return;
  const snap = captureUndoSnapshot();
  if (!force && snap === state.history.lastSig) return;
  state.history.lastSig = snap;
  if (state.history.undo.length === 0 || state.history.undo[state.history.undo.length - 1] !== snap) {
    state.history.undo.push(snap);
    if (state.history.undo.length > 80) state.history.undo.shift();
  }
  state.history.redo = [];
  if (els.undoBtn) els.undoBtn.disabled = state.history.undo.length <= 1;
  if (els.redoBtn) els.redoBtn.disabled = state.history.redo.length <= 0;
  if (state.autosave.ready) saveAutosaveFromSnapshotText(snap, "checkpoint", false);
}

async function undoAction() {
  if (state.history.undo.length <= 1) return false;
  const current = state.history.undo.pop();
  if (current) state.history.redo.push(current);
  const prev = state.history.undo[state.history.undo.length - 1];
  if (!prev) return false;
  await restoreUndoSnapshot(prev);
  state.history.lastSig = prev;
  if (els.undoBtn) els.undoBtn.disabled = state.history.undo.length <= 1;
  if (els.redoBtn) els.redoBtn.disabled = state.history.redo.length <= 0;
  setStatus("Undo.");
  return true;
}

async function redoAction() {
  if (state.history.redo.length <= 0) return false;
  const snap = state.history.redo.pop();
  if (!snap) return false;
  state.history.undo.push(snap);
  await restoreUndoSnapshot(snap);
  state.history.lastSig = snap;
  if (els.undoBtn) els.undoBtn.disabled = state.history.undo.length <= 1;
  if (els.redoBtn) els.redoBtn.disabled = state.history.redo.length <= 0;
  setStatus("Redo.");
  return true;
}

function getCurrentAnimation() {
  if (!state.anim.currentAnimId) return null;
  return state.anim.animations.find((a) => a.id === state.anim.currentAnimId) || null;
}

function ensureCurrentAnimation() {
  if (state.anim.animations.length === 0) {
    const a = createAnimation("Anim 1");
    state.anim.animations.push(a);
    state.anim.currentAnimId = a.id;
  } else if (!getCurrentAnimation()) {
    state.anim.currentAnimId = state.anim.animations[0].id;
  }
  migrateLegacyVertexTracksAllAnimations();
  ensureStateMachine();
}

function ensureAnimLayerTracks() {
  if (!Array.isArray(state.anim.layerTracks)) state.anim.layerTracks = [];
  const validAnimIds = new Set((state.anim.animations || []).map((a) => a.id));
  const bones = state.mesh && Array.isArray(state.mesh.rigBones) ? state.mesh.rigBones : [];
  state.anim.layerTracks = state.anim.layerTracks
    .map((t, i) => ({
      id: t && t.id ? String(t.id) : makeLayerTrackId(),
      name: t && t.name ? String(t.name) : `Layer ${i + 1}`,
      enabled: t ? t.enabled !== false : true,
      animId: t && validAnimIds.has(t.animId) ? String(t.animId) : "",
      loop: t ? t.loop !== false : true,
      speed: Number.isFinite(Number(t && t.speed)) ? math.clamp(Number(t && t.speed), -10, 10) : 1,
      offset: Number(t && t.offset) || 0,
      alpha: math.clamp(Number(t && t.alpha) || 0, 0, 1),
      mode: t && t.mode === "add" ? "add" : "replace",
      maskMode: t && (t.maskMode === "include" || t.maskMode === "exclude") ? t.maskMode : "all",
      maskBones: Array.isArray(t && t.maskBones)
        ? [...new Set(t.maskBones.map((v) => Number(v)).filter((v) => Number.isFinite(v) && v >= 0 && v < bones.length))]
        : [],
    }))
    .filter((t) => !!t.id);
  if (state.anim.layerTracks.length === 0) {
    state.anim.selectedLayerTrackId = "";
    return state.anim.layerTracks;
  }
  if (!state.anim.layerTracks.some((t) => t.id === state.anim.selectedLayerTrackId)) {
    state.anim.selectedLayerTrackId = state.anim.layerTracks[0].id;
  }
  return state.anim.layerTracks;
}

function getSelectedLayerTrack() {
  ensureAnimLayerTracks();
  const id = String(state.anim.selectedLayerTrackId || "");
  if (!id) return null;
  return state.anim.layerTracks.find((t) => t.id === id) || null;
}

function getTrackId(boneIndex, prop) {
  return `bone:${boneIndex}:${prop}`;
}

function getSlotTrackId(slotIndex, prop) {
  return `slot:${slotIndex}:${prop}`;
}

function getIKTrackId(ikIndex, prop) {
  return `ik:${ikIndex}:${prop}`;
}

function getTransformTrackId(transformIndex, prop) {
  return `tfc:${transformIndex}:${prop}`;
}

function getPathTrackId(pathIndex, prop) {
  return `pth:${pathIndex}:${prop}`;
}

function getVertexTrackId(slotIndex) {
  return `deform:${slotIndex}`;
}

function getLayerTrackId(layerId, prop) {
  return `layer:${String(layerId || "")}:${prop}`;
}

function getAnimLayerTrackById(layerId) {
  const id = String(layerId || "");
  if (!id) return null;
  return ensureAnimLayerTracks().find((t) => t.id === id) || null;
}

const VERTEX_TRACK_ID = "vertex:deform";
const EVENT_TRACK_ID = "event:timeline";
const DRAWORDER_TRACK_ID = "draworder:timeline";

function migrateLegacyVertexTracksInAnimation(anim) {
  if (!anim || !anim.tracks || !Array.isArray(anim.tracks[VERTEX_TRACK_ID])) return;
  const legacy = anim.tracks[VERTEX_TRACK_ID];
  if (legacy.length <= 0) {
    delete anim.tracks[VERTEX_TRACK_ID];
    return;
  }
  const keepLegacy = [];
  const touched = new Set();
  for (const k of legacy) {
    const si = Number.isFinite(k && k.slotIndex) ? Number(k.slotIndex) : -1;
    if (si < 0 || si >= state.slots.length) {
      keepLegacy.push(k);
      continue;
    }
    const trackId = getVertexTrackId(si);
    if (!anim.tracks[trackId]) anim.tracks[trackId] = [];
    anim.tracks[trackId].push({
      id: k && k.id ? String(k.id) : `k_${Math.random().toString(36).slice(2, 10)}`,
      time: Number(k && k.time) || 0,
      value: cloneTrackValue(k && k.value),
      interp: (k && k.interp) || "linear",
      curve: Array.isArray(k && k.curve) ? k.curve.slice(0, 4) : undefined,
      slotIndex: si,
    });
    touched.add(trackId);
  }
  if (keepLegacy.length > 0) anim.tracks[VERTEX_TRACK_ID] = keepLegacy;
  else delete anim.tracks[VERTEX_TRACK_ID];
  for (const trackId of touched) normalizeTrackKeys(anim, trackId);
}

function migrateLegacyVertexTracksAllAnimations() {
  for (const a of state.anim.animations || []) {
    migrateLegacyVertexTracksInAnimation(a);
  }
}

function makeSlotId() {
  return `slot_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function makeSkinSetId() {
  return `skin_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function captureCurrentSkinMap() {
  const out = {};
  for (const s of state.slots || []) {
    if (!s || !s.id) continue;
    const name = getSlotCurrentAttachmentName(s);
    if (!name) continue;
    out[String(s.id)] = String(name);
  }
  return out;
}

function captureCurrentSkinPlaceholderMap() {
  const out = {};
  for (const s of state.slots || []) {
    if (!s || !s.id) continue;
    const name = getSlotCurrentAttachmentName(s);
    if (!name) continue;
    const ph = String(s.placeholderName || s.attachmentName || "main");
    if (!out[String(s.id)] || typeof out[String(s.id)] !== "object") out[String(s.id)] = {};
    out[String(s.id)][ph] = String(name);
  }
  return out;
}

function captureCurrentSkinConstraintMap() {
  const out = { ik: [], transform: [], path: [] };
  const m = state.mesh;
  if (!m) return out;
  const ikList = ensureIKConstraints(m);
  for (const c of ikList) {
    if (!c || !c.name || !c.skinRequired) continue;
    if (c.enabled !== false) out.ik.push(String(c.name));
  }
  const tfcList = ensureTransformConstraints(m);
  for (const c of tfcList) {
    if (!c || !c.name || !c.skinRequired) continue;
    if (c.enabled !== false) out.transform.push(String(c.name));
  }
  const pathList = ensurePathConstraints(m);
  for (const c of pathList) {
    if (!c || !c.name || !c.skinRequired) continue;
    if (c.enabled !== false) out.path.push(String(c.name));
  }
  return out;
}

function normalizeSkinConstraintMap(src) {
  const map = src && typeof src === "object" ? src : {};
  return {
    ik: Array.isArray(map.ik) ? map.ik.map((v) => String(v || "").trim()).filter(Boolean) : [],
    transform: Array.isArray(map.transform) ? map.transform.map((v) => String(v || "").trim()).filter(Boolean) : [],
    path: Array.isArray(map.path) ? map.path.map((v) => String(v || "").trim()).filter(Boolean) : [],
  };
}

function ensureSkinSets() {
  if (!Array.isArray(state.skinSets)) state.skinSets = [];
  state.skinSets = state.skinSets
    .map((s, i) => ({
      id: s && s.id ? String(s.id) : makeSkinSetId(),
      name: s && s.name ? String(s.name) : `skin_${i}`,
      slotAttachments:
        s && s.slotAttachments && typeof s.slotAttachments === "object" ? { ...s.slotAttachments } : {},
      slotPlaceholderAttachments:
        s && s.slotPlaceholderAttachments && typeof s.slotPlaceholderAttachments === "object"
          ? Object.fromEntries(
              Object.entries(s.slotPlaceholderAttachments).map(([slotId, map]) => [
                String(slotId),
                map && typeof map === "object"
                  ? Object.fromEntries(Object.entries(map).map(([ph, v]) => [String(ph), v == null ? null : String(v)]))
                  : {},
              ])
            )
          : {},
      constraints: normalizeSkinConstraintMap(s && s.constraints),
    }))
    .filter((s) => !!s.id);
  for (const s of state.skinSets) {
    if (!s.slotPlaceholderAttachments || typeof s.slotPlaceholderAttachments !== "object") s.slotPlaceholderAttachments = {};
    if (s.slotAttachments && typeof s.slotAttachments === "object") {
      for (const [slotId, att] of Object.entries(s.slotAttachments)) {
        if (att == null || att === "") continue;
        if (!s.slotPlaceholderAttachments[slotId] || typeof s.slotPlaceholderAttachments[slotId] !== "object") {
          s.slotPlaceholderAttachments[slotId] = {};
        }
        if (!s.slotPlaceholderAttachments[slotId].main) s.slotPlaceholderAttachments[slotId].main = String(att);
      }
    }
  }
  if (state.skinSets.length === 0) {
    state.skinSets.push({
      id: makeSkinSetId(),
      name: "default",
      slotAttachments: captureCurrentSkinMap(),
      slotPlaceholderAttachments: captureCurrentSkinPlaceholderMap(),
      constraints: captureCurrentSkinConstraintMap(),
    });
  }
  if (
    !Number.isFinite(state.selectedSkinSet) ||
    state.selectedSkinSet < 0 ||
    state.selectedSkinSet >= state.skinSets.length
  ) {
    state.selectedSkinSet = 0;
  }
  return state.skinSets;
}

function getSelectedSkinSet() {
  const list = ensureSkinSets();
  const i = Number(state.selectedSkinSet);
  if (!Number.isFinite(i) || i < 0 || i >= list.length) return null;
  return list[i];
}

function applySkinSetToSlots(skin) {
  if (!skin) return false;
  const bySlot = skin.slotPlaceholderAttachments && typeof skin.slotPlaceholderAttachments === "object"
    ? skin.slotPlaceholderAttachments
    : null;
  const legacy = skin.slotAttachments && typeof skin.slotAttachments === "object" ? skin.slotAttachments : null;
  if (!bySlot && !legacy) return false;
  let changed = false;
  for (const s of state.slots || []) {
    if (!s || !s.id) continue;
    ensureSlotAttachmentState(s);
    const slotId = String(s.id);
    const ph = String(s.placeholderName || s.attachmentName || "main");
    const map = bySlot && bySlot[slotId] && typeof bySlot[slotId] === "object" ? bySlot[slotId] : null;
    const target = map && Object.prototype.hasOwnProperty.call(map, ph)
      ? map[ph]
      : legacy && Object.prototype.hasOwnProperty.call(legacy, slotId)
        ? legacy[slotId]
        : null;
    const next = target == null ? null : String(target);
    if (!next) continue;
    const att = getSlotAttachmentEntry(s, next);
    if (!att || !att.canvas) continue;
    if (s.activeAttachment !== next) changed = true;
    s.activeAttachment = next;
    s.canvas = att.canvas;
  }
  if (changed) {
    refreshSlotUI();
    renderBoneTree();
  }
  const m = state.mesh;
  if (m && skin && skin.constraints && typeof skin.constraints === "object") {
    const cs = normalizeSkinConstraintMap(skin.constraints);
    const ikSet = new Set(cs.ik);
    const tfcSet = new Set(cs.transform);
    const pathSet = new Set(cs.path);
    for (const c of ensureIKConstraints(m)) {
      if (!c || !c.skinRequired) continue;
      c.enabled = ikSet.has(String(c.name || ""));
    }
    for (const c of ensureTransformConstraints(m)) {
      if (!c || !c.skinRequired) continue;
      c.enabled = tfcSet.has(String(c.name || ""));
    }
    for (const c of ensurePathConstraints(m)) {
      if (!c || !c.skinRequired) continue;
      c.enabled = pathSet.has(String(c.name || ""));
    }
    refreshIKUI();
    refreshTransformUI();
    refreshPathUI();
  }
  return changed;
}

function refreshSkinUI() {
  const list = ensureSkinSets();
  const active = getSelectedSkinSet();
  if (els.skinSelect) {
    els.skinSelect.innerHTML = "";
    for (let i = 0; i < list.length; i += 1) {
      const s = list[i];
      const opt = document.createElement("option");
      opt.value = String(i);
      opt.textContent = s.name || `skin_${i}`;
      els.skinSelect.appendChild(opt);
    }
    els.skinSelect.value = String(Math.max(0, Number(state.selectedSkinSet) || 0));
  }
  if (els.activeSkinSelect) {
    els.activeSkinSelect.innerHTML = "";
    for (let i = 0; i < list.length; i += 1) {
      const s = list[i];
      const opt = document.createElement("option");
      opt.value = String(i);
      opt.textContent = s.name || `skin_${i}`;
      els.activeSkinSelect.appendChild(opt);
    }
    els.activeSkinSelect.value = String(Math.max(0, Number(state.selectedSkinSet) || 0));
  }
  if (els.skinName) {
    els.skinName.value = active ? active.name || "" : "";
    els.skinName.disabled = !active;
  }
  if (els.skinDeleteBtn) els.skinDeleteBtn.disabled = list.length <= 1;
  if (els.skinCaptureBtn) els.skinCaptureBtn.disabled = !active || state.slots.length === 0;
  if (els.skinApplyBtn) els.skinApplyBtn.disabled = !active || state.slots.length === 0;
  if (els.activeSkinCaptureBtn) els.activeSkinCaptureBtn.disabled = !active || state.slots.length === 0;
  if (els.activeSkinApplyBtn) els.activeSkinApplyBtn.disabled = !active || state.slots.length === 0;
}

function addSkinSetFromCurrentState() {
  const list = ensureSkinSets();
  const skin = {
    id: makeSkinSetId(),
    name: `skin_${list.length}`,
    slotAttachments: captureCurrentSkinMap(),
    slotPlaceholderAttachments: captureCurrentSkinPlaceholderMap(),
    constraints: captureCurrentSkinConstraintMap(),
  };
  list.push(skin);
  state.selectedSkinSet = list.length - 1;
  refreshSkinUI();
  return skin;
}

function captureSelectedSkinSetFromCurrentState() {
  const skin = getSelectedSkinSet();
  if (!skin) return null;
  skin.slotAttachments = captureCurrentSkinMap();
  skin.slotPlaceholderAttachments = captureCurrentSkinPlaceholderMap();
  skin.constraints = captureCurrentSkinConstraintMap();
  refreshSkinUI();
  return skin;
}

function applySelectedSkinSetWithStatus() {
  const skin = getSelectedSkinSet();
  if (!skin) {
    setStatus("No active skin.");
    return false;
  }
  if (applySkinSetToSlots(skin)) {
    setStatus(`Skin applied: ${skin.name}`);
    return true;
  }
  setStatus(`Skin apply: no slot attachment changed (${skin.name}).`);
  return false;
}

function colorHexToRgb01(hex) {
  const s = String(hex || "#ffffff").trim();
  const m = s.match(/^#?([0-9a-fA-F]{6})$/);
  if (!m) return { r: 1, g: 1, b: 1 };
  const n = Number.parseInt(m[1], 16);
  return {
    r: ((n >> 16) & 0xff) / 255,
    g: ((n >> 8) & 0xff) / 255,
    b: (n & 0xff) / 255,
  };
}

function rgb01ToHex(r, g, b) {
  const to = (v) => Math.max(0, Math.min(255, Math.round((Number(v) || 0) * 255)));
  const n = (to(r) << 16) | (to(g) << 8) | to(b);
  return `#${n.toString(16).padStart(6, "0")}`;
}

function markDirtyTrack(trackId) {
  if (!trackId) return;
  if (!state.anim.dirtyTracks.includes(trackId)) {
    state.anim.dirtyTracks.push(trackId);
  }
  scheduleAutoKeyFromDirty();
}

function scheduleAutoKeyFromDirty() {
  if (!state.anim.autoKey || state.anim.playing || state.anim.autoKeyPending) return;
  state.anim.autoKeyPending = true;
  requestAnimationFrame(() => {
    state.anim.autoKeyPending = false;
    if (!state.anim.autoKey || state.anim.playing || !state.mesh) return;
    const anim = getCurrentAnimation();
    if (!anim) return;
    addAutoKeyframeFromDirty(true);
  });
}

function markDirtyByBoneProp(boneIndex, prop) {
  if (!Number.isFinite(boneIndex) || boneIndex < 0) return;
  markDirtyTrack(getTrackId(boneIndex, prop));
}

function markDirtyByIKProp(ikIndex, prop) {
  if (!Number.isFinite(ikIndex) || ikIndex < 0) return;
  markDirtyTrack(getIKTrackId(ikIndex, prop));
}

function markDirtyBySlotProp(slotIndex, prop) {
  if (!Number.isFinite(slotIndex) || slotIndex < 0) return;
  markDirtyTrack(getSlotTrackId(slotIndex, prop));
}

function markDirtyVertexTrack(slotIndex = state.activeSlot) {
  const si = Number(slotIndex);
  if (state.slots.length > 0 && Number.isFinite(si) && si >= 0 && si < state.slots.length) {
    markDirtyTrack(getVertexTrackId(si));
    return;
  }
  markDirtyTrack(VERTEX_TRACK_ID);
}

function markDirtyDrawOrder() {
  markDirtyTrack(DRAWORDER_TRACK_ID);
}

function markDirtyByLayerProp(layerId, prop) {
  if (!layerId) return;
  markDirtyTrack(getLayerTrackId(layerId, prop));
}

function getIKIndexByRef(m, ikRef) {
  if (!m || !ikRef) return -1;
  const list = ensureIKConstraints(m);
  return list.indexOf(ikRef);
}

function parseTrackId(trackId) {
  const p = String(trackId || "").split(":");
  if (p.length === 2 && p[0] === "deform") {
    const slotIndex = Number(p[1]);
    if (Number.isFinite(slotIndex)) return { type: "vertex", prop: "deform", slotIndex };
    return null;
  }
  if (p.length === 2 && (p[0] === "vertex" || p[0] === "ffd") && p[1] === "deform") {
    return { type: "vertex", prop: "deform" };
  }
  if (p.length === 2 && p[0] === "event" && p[1] === "timeline") {
    return { type: "event", prop: "timeline" };
  }
  if (p.length === 2 && p[0] === "draworder" && p[1] === "timeline") {
    return { type: "draworder", prop: "timeline" };
  }
  if (p.length === 2 && p[0] === "smparam") {
    const paramId = String(p[1] || "");
    if (!paramId) return null;
    return { type: "smparam", paramId, prop: "value" };
  }
  if (p.length === 3 && p[0] === "slot") {
    const slotIndex = Number(p[1]);
    const prop = p[2];
    if (!Number.isFinite(slotIndex)) return null;
    return { type: "slot", slotIndex, prop };
  }
  if (p.length === 3 && p[0] === "bone") {
    const boneIndex = Number(p[1]);
    const prop = p[2];
    if (!Number.isFinite(boneIndex)) return null;
    return { type: "bone", boneIndex, prop };
  }
  if (p.length === 3 && p[0] === "ik") {
    const ikIndex = Number(p[1]);
    const prop = p[2];
    if (!Number.isFinite(ikIndex)) return null;
    return { type: "ik", ikIndex, prop };
  }
  if (p.length === 3 && p[0] === "tfc") {
    const transformIndex = Number(p[1]);
    const prop = p[2];
    if (!Number.isFinite(transformIndex)) return null;
    return { type: "tfc", transformIndex, prop };
  }
  if (p.length === 3 && p[0] === "pth") {
    const pathIndex = Number(p[1]);
    const prop = p[2];
    if (!Number.isFinite(pathIndex)) return null;
    return { type: "pth", pathIndex, prop };
  }
  if (p.length === 3 && p[0] === "layer") {
    const layerId = String(p[1] || "");
    const prop = p[2];
    if (!layerId) return null;
    return { type: "layer", layerId, prop };
  }
  return null;
}

function getTrackValueFromBones(bones, boneIndex, prop) {
  const b = bones[boneIndex];
  if (!b) return null;
  normalizeBoneChannels(b);
  if (prop === "translate") return { x: b.tx, y: b.ty };
  if (prop === "rotate") return b.rot;
  if (prop === "scale" || prop === "length") return b.length;
  if (prop === "scaleX") return b.sx;
  if (prop === "scaleY") return b.sy;
  if (prop === "shearX") return b.shx;
  if (prop === "shearY") return b.shy;
  return 0;
}

function setTrackValueToBones(bones, boneIndex, prop, value) {
  const b = bones[boneIndex];
  if (!b) return;
  normalizeBoneChannels(b);
  if (prop === "translate" && value && typeof value === "object") {
    b.tx = Number(value.x) || 0;
    b.ty = Number(value.y) || 0;
  } else if (prop === "rotate") b.rot = Number(value) || 0;
  else if (prop === "scale" || prop === "length") b.length = Math.max(1, Number(value) || 1);
  else if (prop === "scaleX") b.sx = Number(value) || 1;
  else if (prop === "scaleY") b.sy = Number(value) || 1;
  else if (prop === "shearX") b.shx = Number(value) || 0;
  else if (prop === "shearY") b.shy = Number(value) || 0;
}

function getEventDraftFromUI() {
  return {
    name: (els.eventName && els.eventName.value ? els.eventName.value : "event").trim() || "event",
    int: Number(els.eventInt && els.eventInt.value) || 0,
    float: Number(els.eventFloat && els.eventFloat.value) || 0,
    string: (els.eventString && els.eventString.value ? els.eventString.value : "").trim(),
  };
}

function applyEventDraftToUI(v) {
  const e = v && typeof v === "object" ? v : {};
  if (els.eventName) els.eventName.value = (e.name || "event").trim() || "event";
  if (els.eventInt) els.eventInt.value = String(Number(e.int) || 0);
  if (els.eventFloat) els.eventFloat.value = String(Number(e.float) || 0);
  if (els.eventString) els.eventString.value = e.string != null ? String(e.string) : "";
}

function refreshEventKeyListUI() {
  if (!els.eventKeyList) return;
  const anim = getCurrentAnimation();
  els.eventKeyList.innerHTML = "";
  if (!anim) return;
  const keys = getTrackKeys(anim, EVENT_TRACK_ID).slice().sort((a, b) => (Number(a.time) || 0) - (Number(b.time) || 0));
  for (const k of keys) {
    if (!k.id) k.id = `k_${Math.random().toString(36).slice(2, 10)}`;
    const v = k.value && typeof k.value === "object" ? k.value : {};
    const t = Number(k.time) || 0;
    const opt = document.createElement("option");
    opt.value = k.id;
    opt.textContent = `${t.toFixed(3)}s  ${(v.name || "event").toString()}`;
    if (state.anim.selectedKey && state.anim.selectedKey.trackId === EVENT_TRACK_ID && state.anim.selectedKey.keyId === k.id) {
      opt.selected = true;
    }
    els.eventKeyList.appendChild(opt);
  }
}

function getTrackValue(m, parsed) {
  if (!parsed) return null;
  if (parsed.type === "smparam") {
    const sm = ensureStateMachine();
    const param = getStateParamById(sm, parsed.paramId);
    if (!param) return null;
    return param.type === "bool" ? (param.value === true) : (Number(param.value) || 0);
  }
  if (!m) return null;
  if (parsed.type === "bone") {
    return getTrackValueFromBones(m.poseBones, parsed.boneIndex, parsed.prop);
  }
  if (parsed.type === "ik") {
    const list = ensureIKConstraints(m);
    const c = list[parsed.ikIndex];
    if (!c) return null;
    if (parsed.prop === "mix") return math.clamp(Number(c.mix) || 0, 0, 1);
    if (parsed.prop === "softness") return Math.max(0, Number(c.softness) || 0);
    if (parsed.prop === "bend") return c.bendPositive !== false;
    if (parsed.prop === "compress") return !!c.compress;
    if (parsed.prop === "stretch") return !!c.stretch;
    if (parsed.prop === "uniform") return !!c.uniform;
    if (parsed.prop === "target") {
      const tx = Number(c.targetX);
      const ty = Number(c.targetY);
      if (Number.isFinite(tx) && Number.isFinite(ty)) return { x: tx, y: ty };
      const p = getIKConstraintEndPointWorld(getPoseBones(m), c);
      return p ? { x: p.x, y: p.y } : { x: 0, y: 0 };
    }
    return null;
  }
  if (parsed.type === "tfc") {
    const list = ensureTransformConstraints(m);
    const c = list[parsed.transformIndex];
    if (!c) return null;
    if (parsed.prop === "rotateMix") return math.clamp(Number(c.rotateMix) || 0, 0, 1);
    if (parsed.prop === "translateMix") return math.clamp(Number(c.translateMix) || 0, 0, 1);
    if (parsed.prop === "scaleMix") return math.clamp(Number(c.scaleMix) || 0, 0, 1);
    if (parsed.prop === "shearMix") return math.clamp(Number(c.shearMix) || 0, 0, 1);
    return null;
  }
  if (parsed.type === "pth") {
    const list = ensurePathConstraints(m);
    const c = list[parsed.pathIndex];
    if (!c) return null;
    if (parsed.prop === "position") return Number(c.position) || 0;
    if (parsed.prop === "spacing") return Number(c.spacing) || 0;
    if (parsed.prop === "rotateMix") return math.clamp(Number(c.rotateMix) || 0, 0, 1);
    if (parsed.prop === "translateMix") return math.clamp(Number(c.translateMix) || 0, 0, 1);
    return null;
  }
  if (parsed.type === "layer") {
    const layer = getAnimLayerTrackById(parsed.layerId);
    if (!layer) return null;
    if (parsed.prop === "alpha") return math.clamp(Number(layer.alpha) || 0, 0, 1);
    if (parsed.prop === "enabled") return layer.enabled !== false;
    if (parsed.prop === "speed") return math.clamp(Number(layer.speed) || 0, -10, 10);
    if (parsed.prop === "offset") return math.clamp(Number(layer.offset) || 0, -9999, 9999);
    return null;
  }
  if (parsed.type === "vertex") {
    const si = Number.isFinite(parsed.slotIndex) ? Number(parsed.slotIndex) : state.activeSlot;
    if (state.slots.length > 0 && Number.isFinite(si) && si >= 0 && si < state.slots.length) {
      const offsets = getModelSlotOffsets(m, si);
      return offsets ? Array.from(offsets) : null;
    }
    return Array.from(getActiveOffsets(m));
  }
  if (parsed.type === "event") {
    return getEventDraftFromUI();
  }
  if (parsed.type === "draworder") {
    return state.slots.map((s, i) => (s && s.id ? s.id : `slot_i_${i}`));
  }
  if (parsed.type === "slot") {
    const s = state.slots[parsed.slotIndex];
    if (!s) return null;
    if (parsed.prop === "attachment") {
      return getSlotCurrentAttachmentName(s);
    }
    if (parsed.prop === "clip") {
      return !!s.clipEnabled;
    }
    if (parsed.prop === "clipSource") {
      return s.clipSource === "contour" ? "contour" : "fill";
    }
    if (parsed.prop === "clipEnd") {
      return s.clipEndSlotId ? String(s.clipEndSlotId) : "";
    }
    if (parsed.prop === "color") {
      return {
        r: math.clamp(Number(s.r) || 1, 0, 1),
        g: math.clamp(Number(s.g) || 1, 0, 1),
        b: math.clamp(Number(s.b) || 1, 0, 1),
        a: math.clamp(Number(s.alpha) || 1, 0, 1),
        darkEnabled: !!s.darkEnabled,
        dr: math.clamp(Number(s.dr) || 0, 0, 1),
        dg: math.clamp(Number(s.dg) || 0, 0, 1),
        db: math.clamp(Number(s.db) || 0, 0, 1),
      };
    }
  }
  return null;
}

function setTrackValue(m, parsed, value) {
  if (!parsed) return;
  if (parsed.type === "smparam") {
    const sm = ensureStateMachine();
    const param = getStateParamById(sm, parsed.paramId);
    if (!param) return;
    param.value = parseStateParamRawValue(value, param.type);
    return;
  }
  if (!m) return;
  if (parsed.type === "bone") {
    setTrackValueToBones(m.poseBones, parsed.boneIndex, parsed.prop, value);
    return;
  }
  if (parsed.type === "ik") {
    const list = ensureIKConstraints(m);
    const c = list[parsed.ikIndex];
    if (!c) return;
    if (parsed.prop === "mix") {
      c.mix = math.clamp(Number(value) || 0, 0, 1);
    } else if (parsed.prop === "softness") {
      c.softness = Math.max(0, Number(value) || 0);
    } else if (parsed.prop === "bend") {
      c.bendPositive = value === true || Number(value) >= 0;
    } else if (parsed.prop === "compress") {
      c.compress = value === true || Number(value) > 0;
    } else if (parsed.prop === "stretch") {
      c.stretch = value === true || Number(value) > 0;
    } else if (parsed.prop === "uniform") {
      c.uniform = value === true || Number(value) > 0;
    } else if (parsed.prop === "target" && value && typeof value === "object") {
      c.targetX = Number(value.x) || 0;
      c.targetY = Number(value.y) || 0;
    }
    return;
  }
  if (parsed.type === "tfc") {
    const list = ensureTransformConstraints(m);
    const c = list[parsed.transformIndex];
    if (!c) return;
    if (parsed.prop === "rotateMix") c.rotateMix = math.clamp(Number(value) || 0, 0, 1);
    else if (parsed.prop === "translateMix") c.translateMix = math.clamp(Number(value) || 0, 0, 1);
    else if (parsed.prop === "scaleMix") c.scaleMix = math.clamp(Number(value) || 0, 0, 1);
    else if (parsed.prop === "shearMix") c.shearMix = math.clamp(Number(value) || 0, 0, 1);
    return;
  }
  if (parsed.type === "pth") {
    const list = ensurePathConstraints(m);
    const c = list[parsed.pathIndex];
    if (!c) return;
    if (parsed.prop === "position") c.position = Number(value) || 0;
    else if (parsed.prop === "spacing") c.spacing = Number(value) || 0;
    else if (parsed.prop === "rotateMix") c.rotateMix = math.clamp(Number(value) || 0, 0, 1);
    else if (parsed.prop === "translateMix") c.translateMix = math.clamp(Number(value) || 0, 0, 1);
    return;
  }
  if (parsed.type === "layer") {
    const layer = getAnimLayerTrackById(parsed.layerId);
    if (!layer) return;
    if (parsed.prop === "alpha") {
      layer.alpha = math.clamp(Number(value) || 0, 0, 1);
    } else if (parsed.prop === "enabled") {
      layer.enabled = value === true || Number(value) > 0;
    } else if (parsed.prop === "speed") {
      layer.speed = math.clamp(Number(value) || 0, -10, 10);
    } else if (parsed.prop === "offset") {
      layer.offset = math.clamp(Number(value) || 0, -9999, 9999);
    }
    return;
  }
  if (parsed.type === "vertex" && Array.isArray(value)) {
    const si = Number.isFinite(parsed.slotIndex) ? Number(parsed.slotIndex) : state.activeSlot;
    let offsets = null;
    if (state.slots.length > 0 && Number.isFinite(si) && si >= 0 && si < state.slots.length) {
      offsets = getModelSlotOffsets(m, si);
    }
    if (!offsets) offsets = getActiveOffsets(m);
    const n = Math.min(offsets.length, value.length);
    for (let i = 0; i < n; i += 1) {
      offsets[i] = Number(value[i]) || 0;
    }
    for (let i = n; i < offsets.length; i += 1) {
      offsets[i] = 0;
    }
  }
  if (parsed.type === "event") {
    // Event track does not directly drive pose values.
  }
  if (parsed.type === "draworder" && Array.isArray(value) && value.length > 0) {
    const activeSlotObj = getActiveSlot();
    const idToSlot = new Map();
    for (const s of state.slots) {
      if (!s) continue;
      if (!s.id) s.id = makeSlotId();
      idToSlot.set(s.id, s);
    }
    const out = [];
    const used = new Set();
    for (const id of value) {
      const s = idToSlot.get(String(id));
      if (!s || used.has(s)) continue;
      used.add(s);
      out.push(s);
    }
    for (const s of state.slots) {
      if (!s || used.has(s)) continue;
      out.push(s);
    }
    if (out.length === state.slots.length) {
      state.slots = out;
      if (activeSlotObj) {
        const idx = state.slots.indexOf(activeSlotObj);
        if (idx >= 0) state.activeSlot = idx;
      }
    }
    return;
  }
  if (parsed.type === "layer") {
    const layer = getAnimLayerTrackById(parsed.layerId);
    if (!layer) return;
    if (parsed.prop === "alpha") {
      layer.alpha = math.clamp(Number(value) || 0, 0, 1);
    } else if (parsed.prop === "enabled") {
      layer.enabled = value === true || Number(value) > 0;
    } else if (parsed.prop === "speed") {
      layer.speed = math.clamp(Number(value) || 0, -10, 10);
    } else if (parsed.prop === "offset") {
      layer.offset = math.clamp(Number(value) || 0, -9999, 9999);
    }
    return;
  }
  if (parsed.type === "slot") {
    const s = state.slots[parsed.slotIndex];
    if (!s) return;
    if (parsed.prop === "attachment") {
      if (value == null || value === false || value === "") {
        s.activeAttachment = null;
      } else if (value === true) {
        s.activeAttachment = String(s.attachmentName || "main");
      } else {
        s.activeAttachment = String(value);
      }
      ensureSlotAttachmentState(s);
      return;
    }
    if (parsed.prop === "clip") {
      s.clipEnabled = value === true || Number(value) > 0;
      ensureSlotClipState(s);
      return;
    }
    if (parsed.prop === "clipSource") {
      s.clipSource = String(value || "") === "contour" ? "contour" : "fill";
      ensureSlotClipState(s);
      return;
    }
    if (parsed.prop === "clipEnd") {
      if (value == null || value === false || value === "") s.clipEndSlotId = null;
      else s.clipEndSlotId = String(value);
      ensureSlotClipState(s);
      return;
    }
    if (parsed.prop === "color" && value && typeof value === "object") {
      s.r = math.clamp(Number(value.r) || 1, 0, 1);
      s.g = math.clamp(Number(value.g) || 1, 0, 1);
      s.b = math.clamp(Number(value.b) || 1, 0, 1);
      s.alpha = math.clamp(Number(value.a) || 1, 0, 1);
      if (Object.prototype.hasOwnProperty.call(value, "darkEnabled")) {
        s.darkEnabled = !!value.darkEnabled;
      }
      if (Object.prototype.hasOwnProperty.call(value, "dr")) {
        s.dr = math.clamp(Number(value.dr) || 0, 0, 1);
      }
      if (Object.prototype.hasOwnProperty.call(value, "dg")) {
        s.dg = math.clamp(Number(value.dg) || 0, 0, 1);
      }
      if (Object.prototype.hasOwnProperty.call(value, "db")) {
        s.db = math.clamp(Number(value.db) || 0, 0, 1);
      }
      ensureSlotVisualState(s);
    }
    return;
  }
}

function getTrackKeys(anim, trackId) {
  if (!anim.tracks[trackId]) anim.tracks[trackId] = [];
  return anim.tracks[trackId];
}

function sortTrackKeys(anim, trackId) {
  getTrackKeys(anim, trackId).sort((a, b) => a.time - b.time);
}

function normalizeTrackKeys(anim, trackId) {
  sortTrackKeys(anim, trackId);
  const keys = getTrackKeys(anim, trackId);
  const parsed = parseTrackId(trackId);
  const parsedVertexSlot = parsed && parsed.type === "vertex" && Number.isFinite(parsed.slotIndex) ? Number(parsed.slotIndex) : null;
  const duration = getTimelineDisplayDuration(anim);
  if (keys.length <= 1) {
    if (keys[0]) {
      keys[0].time = sanitizeTimelineTime(snapTimeIfNeeded(Number(keys[0].time) || 0), duration);
      if (parsedVertexSlot != null) keys[0].slotIndex = parsedVertexSlot;
    }
    return;
  }
  const out = [];
  for (const k of keys) {
    if (!k.id) k.id = `k_${Math.random().toString(36).slice(2, 10)}`;
    k.time = sanitizeTimelineTime(snapTimeIfNeeded(Number(k.time) || 0), duration);
    const prev = out[out.length - 1];
    const prevSlot = Number.isFinite(prev && prev.slotIndex) ? Number(prev.slotIndex) : null;
    const curSlot = Number.isFinite(k && k.slotIndex) ? Number(k.slotIndex) : parsedVertexSlot;
    const canMerge = !(parsed && parsed.type === "vertex") || prevSlot === curSlot;
    if (prev && Math.abs(prev.time - k.time) < 1e-4 && canMerge) {
      prev.value = k.value;
      prev.interp = k.interp || prev.interp || "linear";
      if (Array.isArray(k.curve) && k.curve.length >= 4) prev.curve = k.curve.slice(0, 4);
      if (Number.isFinite(curSlot)) prev.slotIndex = Number(curSlot);
    } else {
      const nk = { id: k.id, time: k.time, value: k.value, interp: k.interp || "linear" };
      if (Array.isArray(k.curve) && k.curve.length >= 4) nk.curve = k.curve.slice(0, 4);
      if (Number.isFinite(curSlot)) nk.slotIndex = Number(curSlot);
      out.push(nk);
    }
  }
  anim.tracks[trackId] = out;
}

function cloneTrackValue(v) {
  if (Array.isArray(v)) return v.slice();
  if (v && typeof v === "object") return { ...v };
  return v;
}

function ensureOnionSkinSettings() {
  if (!state.anim.onionSkin || typeof state.anim.onionSkin !== "object") {
    state.anim.onionSkin = { enabled: false, prevFrames: 2, nextFrames: 2, alpha: 0.22 };
  }
  const o = state.anim.onionSkin;
  o.enabled = !!o.enabled;
  o.prevFrames = math.clamp(Math.round(Number(o.prevFrames) || 0), 0, 12);
  o.nextFrames = math.clamp(Math.round(Number(o.nextFrames) || 0), 0, 12);
  o.alpha = math.clamp(Number(o.alpha) || 0.22, 0.01, 1);
  return o;
}

function getOnionSampleTime(baseTime, frameOffset, duration) {
  const d = Math.max(0.1, Number(duration) || 0.1);
  const step = Math.max(0.001, getTimelineTimeStep());
  const t = Number(baseTime) + Number(frameOffset) * step;
  if (state.anim.loop) return wrapTime(t, d);
  return math.clamp(t, 0, d);
}

function getTimelineTimeStep() {
  const base = Math.max(0.001, Number(state.anim.timeStep) || 0.01);
  const frameStep = 1 / Math.max(1, Number(state.anim.fps) || 30);
  return Math.max(base, frameStep);
}

function quantizeTimelineTime(t) {
  const step = getTimelineTimeStep();
  return Math.round((Number(t) || 0) / step) * step;
}

function getTimelineTimeDigits() {
  const step = getTimelineTimeStep();
  const s = step.toFixed(6).replace(/0+$/, "");
  const dot = s.indexOf(".");
  return dot < 0 ? 0 : s.length - dot - 1;
}

function sanitizeTimelineTime(t, duration) {
  const d = Math.max(0.1, Number(duration) || 5);
  const clamped = math.clamp(Number(t) || 0, 0, d);
  const q = quantizeTimelineTime(clamped);
  return math.clamp(q, 0, d);
}

function snapTimeIfNeeded(t) {
  let out = Number(t) || 0;
  if (state.anim.snap) {
    const fps = Math.max(1, state.anim.fps || 30);
    out = Math.round(out * fps) / fps;
  }
  return quantizeTimelineTime(out);
}

function setAnimTime(value, durationOverride = null) {
  ensureCurrentAnimation();
  const anim = getCurrentAnimation();
  if (!anim) return;
  const baseDuration = Math.max(0.1, Number(els.animDuration.value) || anim.duration || 5);
  anim.duration = baseDuration;
  const effectiveDuration = Number.isFinite(Number(durationOverride))
    ? Math.max(baseDuration, Number(durationOverride))
    : Math.max(baseDuration, Number(state.anim.duration) || baseDuration);
  state.anim.duration = effectiveDuration;
  state.anim.time = sanitizeTimelineTime(value, effectiveDuration);
  els.animDuration.value = String(baseDuration);
  els.animTime.step = String(getTimelineTimeStep());
  els.animTime.value = state.anim.time.toFixed(getTimelineTimeDigits());
  renderTimelineTracks();
}

function getTimelineDisplayDuration(anim) {
  const base = Math.max(0.1, Number(anim && anim.duration) || 0.1);
  const curr = Math.max(0.1, Number(state.anim.duration) || base);
  return Math.max(base, curr);
}

function getVisibleTrackDefinitions() {
  const m = state.mesh;
  if (!m) return [];
  const out = [];
  out.push({
    id: "group:vertex",
    kind: "group",
    groupKey: "vertex",
    label: "Deform",
    expanded: state.anim.trackExpanded.vertex !== false,
    children:
      state.slots && state.slots.length > 0
        ? state.slots.map((s, si) => ({
            id: getVertexTrackId(si),
            kind: "track",
            slotIndex: si,
            prop: "deform",
            label: `${s && s.name ? s.name : `slot_${si}`}.Deform`,
          }))
        : [{ id: VERTEX_TRACK_ID, kind: "track", label: "Deform" }],
  });
  out.push({
    id: "group:event",
    kind: "group",
    groupKey: "event",
    label: "Event",
    expanded: state.anim.trackExpanded.event !== false,
    children: [{ id: EVENT_TRACK_ID, kind: "track", label: "Events" }],
  });
  out.push({
    id: "group:draworder",
    kind: "group",
    groupKey: "draworder",
    label: "Draw Order",
    expanded: state.anim.trackExpanded.draworder !== false,
    children: [{ id: DRAWORDER_TRACK_ID, kind: "track", label: "Timeline" }],
  });
  const sm = ensureStateMachine();
  if (Array.isArray(sm.parameters) && sm.parameters.length > 0) {
    out.push({
      id: "group:smparam",
      kind: "group",
      groupKey: "smparam",
      label: "State Params",
      expanded: state.anim.trackExpanded.smparam !== false,
      children: sm.parameters.map((p) => ({
        id: getStateParamTrackId(p.id),
        kind: "track",
        paramId: p.id,
        prop: "value",
        label: `${p.name}.${p.type}`,
      })),
    });
  }
  if (state.slots && state.slots.length > 0) {
    for (let si = 0; si < state.slots.length; si += 1) {
      const s = state.slots[si];
      out.push({
        id: `group:slot:${si}`,
        kind: "group",
        groupKey: `slot:${si}`,
        label: `Slot ${si}: ${s && s.name ? s.name : `slot_${si}`}`,
        expanded: state.anim.trackExpanded[`slot:${si}`] === true,
        children: [
          { id: `slot:${si}:attachment`, kind: "track", slotIndex: si, prop: "attachment", label: "Attachment" },
          { id: `slot:${si}:clip`, kind: "track", slotIndex: si, prop: "clip", label: "Clip" },
          { id: `slot:${si}:clipSource`, kind: "track", slotIndex: si, prop: "clipSource", label: "Clip Source" },
          { id: `slot:${si}:clipEnd`, kind: "track", slotIndex: si, prop: "clipEnd", label: "Clip End" },
          { id: `slot:${si}:color`, kind: "track", slotIndex: si, prop: "color", label: "Color/Alpha" },
        ],
      });
    }
  }
  for (let idx = 0; idx < m.rigBones.length; idx += 1) {
    const b = m.rigBones[idx];
    out.push({
      id: `group:${idx}`,
      kind: "group",
      groupKey: String(idx),
      boneIndex: idx,
      label: b.name,
      expanded: !!state.anim.trackExpanded[idx],
      children: [
        { id: getTrackId(idx, "translate"), kind: "track", boneIndex: idx, prop: "translate", label: "Translate" },
        { id: getTrackId(idx, "rotate"), kind: "track", boneIndex: idx, prop: "rotate", label: "Rotate" },
        { id: getTrackId(idx, "scale"), kind: "track", boneIndex: idx, prop: "scale", label: "Length" },
        { id: getTrackId(idx, "scaleX"), kind: "track", boneIndex: idx, prop: "scaleX", label: "Scale X" },
        { id: getTrackId(idx, "scaleY"), kind: "track", boneIndex: idx, prop: "scaleY", label: "Scale Y" },
        { id: getTrackId(idx, "shearX"), kind: "track", boneIndex: idx, prop: "shearX", label: "Shear X" },
        { id: getTrackId(idx, "shearY"), kind: "track", boneIndex: idx, prop: "shearY", label: "Shear Y" },
      ],
    });
  }
  const ikList = ensureIKConstraints(m);
  if (ikList.length > 0) {
    out.push({
      id: "group:ik",
      kind: "group",
      groupKey: "ik",
      label: "IK",
      expanded: state.anim.trackExpanded.ik !== false,
      children: ikList.flatMap((c, i) => {
        const name = c && c.name ? c.name : `ik_${i}`;
        return [
          { id: getIKTrackId(i, "mix"), kind: "track", ikIndex: i, prop: "mix", label: `${name}.Mix` },
          { id: getIKTrackId(i, "softness"), kind: "track", ikIndex: i, prop: "softness", label: `${name}.Softness` },
          { id: getIKTrackId(i, "bend"), kind: "track", ikIndex: i, prop: "bend", label: `${name}.Bend` },
          { id: getIKTrackId(i, "compress"), kind: "track", ikIndex: i, prop: "compress", label: `${name}.Compress` },
          { id: getIKTrackId(i, "stretch"), kind: "track", ikIndex: i, prop: "stretch", label: `${name}.Stretch` },
          { id: getIKTrackId(i, "uniform"), kind: "track", ikIndex: i, prop: "uniform", label: `${name}.Uniform` },
          { id: getIKTrackId(i, "target"), kind: "track", ikIndex: i, prop: "target", label: `${name}.Target` },
        ];
      }),
    });
  }
  const tfcList = ensureTransformConstraints(m);
  if (tfcList.length > 0) {
    out.push({
      id: "group:tfc",
      kind: "group",
      groupKey: "tfc",
      label: "Transform",
      expanded: state.anim.trackExpanded.tfc !== false,
      children: tfcList.flatMap((c, i) => {
        const name = c && c.name ? c.name : `transform_${i}`;
        return [
          { id: getTransformTrackId(i, "rotateMix"), kind: "track", transformIndex: i, prop: "rotateMix", label: `${name}.RotateMix` },
          { id: getTransformTrackId(i, "translateMix"), kind: "track", transformIndex: i, prop: "translateMix", label: `${name}.TranslateMix` },
          { id: getTransformTrackId(i, "scaleMix"), kind: "track", transformIndex: i, prop: "scaleMix", label: `${name}.ScaleMix` },
          { id: getTransformTrackId(i, "shearMix"), kind: "track", transformIndex: i, prop: "shearMix", label: `${name}.ShearMix` },
        ];
      }),
    });
  }
  const pthList = ensurePathConstraints(m);
  if (pthList.length > 0) {
    out.push({
      id: "group:pth",
      kind: "group",
      groupKey: "pth",
      label: "Path",
      expanded: state.anim.trackExpanded.pth !== false,
      children: pthList.flatMap((c, i) => {
        const name = c && c.name ? c.name : `path_${i}`;
        return [
          { id: getPathTrackId(i, "position"), kind: "track", pathIndex: i, prop: "position", label: `${name}.Position` },
          { id: getPathTrackId(i, "spacing"), kind: "track", pathIndex: i, prop: "spacing", label: `${name}.Spacing` },
          { id: getPathTrackId(i, "rotateMix"), kind: "track", pathIndex: i, prop: "rotateMix", label: `${name}.RotateMix` },
          { id: getPathTrackId(i, "translateMix"), kind: "track", pathIndex: i, prop: "translateMix", label: `${name}.TranslateMix` },
        ];
      }),
    });
  }
  const layerList = ensureAnimLayerTracks();
  if (layerList.length > 0) {
    out.push({
      id: "group:layer",
      kind: "group",
      groupKey: "layer",
      label: "Layers",
      expanded: state.anim.trackExpanded.layer !== false,
      children: layerList.flatMap((l) => [
        {
          id: getLayerTrackId(l.id, "alpha"),
          kind: "track",
          layerId: l.id,
          prop: "alpha",
          label: `${l.name || "Layer"}.Alpha`,
        },
        {
          id: getLayerTrackId(l.id, "enabled"),
          kind: "track",
          layerId: l.id,
          prop: "enabled",
          label: `${l.name || "Layer"}.On`,
        },
        {
          id: getLayerTrackId(l.id, "speed"),
          kind: "track",
          layerId: l.id,
          prop: "speed",
          label: `${l.name || "Layer"}.Speed`,
        },
        {
          id: getLayerTrackId(l.id, "offset"),
          kind: "track",
          layerId: l.id,
          prop: "offset",
          label: `${l.name || "Layer"}.Offset`,
        },
      ]),
    });
  }
  return out;
}

function getTrackGroupKey(trackId) {
  if (!trackId) return "";
  if (trackId === VERTEX_TRACK_ID) return "vertex";
  if (trackId === EVENT_TRACK_ID) return "event";
  if (trackId === DRAWORDER_TRACK_ID) return "draworder";
  const p = parseTrackId(trackId);
  if (!p) return "";
  if (p.type === "vertex") return "vertex";
  if (p.type === "slot") return `slot:${p.slotIndex}`;
  if (p.type === "bone") return String(p.boneIndex);
  if (p.type === "ik") return "ik";
  if (p.type === "tfc") return "tfc";
  if (p.type === "pth") return "pth";
  if (p.type === "layer") return "layer";
  if (p.type === "smparam") return "smparam";
  return "";
}

function hasAnySoloGroups() {
  const s = state.anim.groupSolo || {};
  return Object.keys(s).some((k) => s[k]);
}

function isGroupPlayable(groupKey) {
  const gk = String(groupKey || "");
  if (!gk) return true;
  const muted = !!(state.anim.groupMute && state.anim.groupMute[gk]);
  if (muted) return false;
  if (hasAnySoloGroups()) {
    return !!(state.anim.groupSolo && state.anim.groupSolo[gk]);
  }
  return true;
}

function isTrackPlayable(trackId) {
  return isGroupPlayable(getTrackGroupKey(trackId));
}

function clearTimelineSoloMuteFlags(silent = false) {
  state.anim.groupMute = {};
  state.anim.groupSolo = {};
  renderTimelineTracks();
  if (!silent) setStatus("Cleared all Solo/Mute groups.");
}

function getTimelineGroupsForView(anim) {
  const query = String(state.anim.filterText || "").trim().toLowerCase();
  const onlyKeyed = !!state.anim.onlyKeyed;
  const src = getVisibleTrackDefinitions();
  const out = [];
  for (const g of src) {
    const baseChildren = Array.isArray(g.children) ? g.children : [];
    let children = baseChildren;
    if (onlyKeyed && anim) {
      children = children.filter((c) => {
        const keys = getTrackKeys(anim, c.id);
        return Array.isArray(keys) && keys.length > 0;
      });
    }
    if (query) {
      const gMatch = String(g.label || "").toLowerCase().includes(query);
      if (gMatch) {
        // keep children as-is after only-keyed filtering
      } else {
        children = children.filter((c) => {
          const t = `${String(c.label || "")} ${String(c.id || "")}`.toLowerCase();
          return t.includes(query);
        });
      }
    }
    if (children.length <= 0) continue;
    out.push({ ...g, children });
  }
  return out;
}

function refreshTrackSelect() {
  const anim = getCurrentAnimation();
  const groups = getTimelineGroupsForView(anim);
  const tracks = [];
  for (const g of groups) {
    for (const c of g.children) tracks.push(c);
  }
  els.trackSelect.innerHTML = "";
  for (const t of tracks) {
    const opt = document.createElement("option");
    opt.value = t.id;
    const parsed = parseTrackId(t.id);
    if (parsed && parsed.type === "vertex") {
      if (Number.isFinite(parsed.slotIndex)) {
        const s = state.slots[parsed.slotIndex];
        const slotName = s && s.name ? s.name : `slot_${parsed.slotIndex}`;
        opt.textContent = `${slotName}.deform`;
      } else {
        opt.textContent = "deform";
      }
    } else if (t.id === DRAWORDER_TRACK_ID) {
      opt.textContent = "drawOrder.timeline";
    } else if (t.id.startsWith("slot:")) {
      const s = state.slots[t.slotIndex];
      const slotName = s && s.name ? s.name : `slot_${t.slotIndex}`;
      opt.textContent = `${slotName}.${t.label}`;
    } else if (t.id === EVENT_TRACK_ID) {
      opt.textContent = "event.timeline";
    } else if (t.id.startsWith("ik:")) {
      opt.textContent = t.label;
    } else if (t.id.startsWith("tfc:")) {
      opt.textContent = t.label;
    } else if (t.id.startsWith("pth:")) {
      opt.textContent = t.label;
    } else if (t.id.startsWith("layer:")) {
      opt.textContent = t.label;
    } else if (t.id.startsWith("smparam:")) {
      opt.textContent = t.label;
    } else {
      const boneName = state.mesh && state.mesh.rigBones[t.boneIndex] ? state.mesh.rigBones[t.boneIndex].name : `bone_${t.boneIndex}`;
      opt.textContent = `${boneName}.${t.label}`;
    }
    els.trackSelect.appendChild(opt);
  }
  if (tracks.length === 0) {
    state.anim.selectedTrack = "";
    return;
  }
  if (!tracks.find((t) => t.id === state.anim.selectedTrack)) {
    state.anim.selectedTrack = tracks[0].id;
  }
  els.trackSelect.value = state.anim.selectedTrack;
}

function refreshAnimationUI() {
  ensureCurrentAnimation();
  const current = getCurrentAnimation();
  els.animSelect.innerHTML = "";
  for (const a of state.anim.animations) {
    const opt = document.createElement("option");
    opt.value = a.id;
    opt.textContent = a.name;
    els.animSelect.appendChild(opt);
  }
  if (current) {
    els.animSelect.value = current.id;
    els.animName.value = current.name;
    els.animDuration.value = String(current.duration);
    state.anim.duration = current.duration;
  }
  els.animLoop.checked = !!state.anim.loop;
  els.animSnap.checked = !!state.anim.snap;
  const onion = ensureOnionSkinSettings();
  if (els.onionEnabled) els.onionEnabled.checked = !!onion.enabled;
  if (els.onionPrev) els.onionPrev.value = String(onion.prevFrames);
  if (els.onionNext) els.onionNext.value = String(onion.nextFrames);
  if (els.onionAlpha) els.onionAlpha.value = String(onion.alpha);
  els.animFps.value = String(Math.max(1, state.anim.fps || 30));
  if (els.animTimeStep) {
    els.animTimeStep.value = String(getTimelineTimeStep());
    els.animTimeStep.step = "0.001";
  }
  if (els.timelineFilter) els.timelineFilter.value = String(state.anim.filterText || "");
  if (els.timelineOnlyKeyed) els.timelineOnlyKeyed.checked = !!state.anim.onlyKeyed;
  refreshAnimationMixUI();
  refreshAnimationLayerUI();
  refreshStateMachineUI();
  refreshAutoKeyUI();
  refreshEventKeyListUI();
  refreshDrawOrderUI();
  refreshBatchExportUI();
  refreshTrackSelect();
  if (els.undoBtn) els.undoBtn.disabled = state.history.undo.length <= 1;
  if (els.redoBtn) els.redoBtn.disabled = state.history.redo.length <= 0;
  renderTimelineTracks();
  renderCurveEditor();
}

function refreshBatchExportUI() {
  if (!els.batchExportPanel) return;
  els.batchExportPanel.classList.toggle("collapsed", !state.anim.batchExportOpen);
  const be = state.anim.batchExport || {};
  if (els.batchExportFormat) els.batchExportFormat.value = be.format === "gif" || be.format === "pngseq" ? be.format : "webm";
  if (els.batchExportFps) els.batchExportFps.value = String(Math.max(1, Math.min(60, Math.round(Number(be.fps) || 15))));
  if (els.batchExportPrefix) els.batchExportPrefix.value = String(be.prefix || "batch");
  if (els.batchExportRetries) els.batchExportRetries.value = String(Math.max(0, Math.min(5, Math.round(Number(be.retries) || 1))));
  if (els.batchExportDelayMs) els.batchExportDelayMs.value = String(Math.max(0, Math.min(5000, Math.round(Number(be.delayMs) || 120))));
  if (els.batchExportZipPng) {
    els.batchExportZipPng.checked = be.zipPng !== false;
    els.batchExportZipPng.disabled = (els.batchExportFormat ? els.batchExportFormat.value : be.format) !== "pngseq";
  }
  if (!els.batchExportAnimList) return;
  const prevSelected = new Set(Array.from(els.batchExportAnimList.selectedOptions || []).map((o) => String(o.value)));
  const currentAnimId = getCurrentAnimation() ? String(getCurrentAnimation().id) : "";
  els.batchExportAnimList.innerHTML = "";
  for (const a of state.anim.animations || []) {
    const opt = document.createElement("option");
    opt.value = a.id;
    opt.textContent = `${a.name} (${Math.max(0.1, Number(a.duration) || 0.1).toFixed(2)}s)`;
    if (prevSelected.has(String(a.id)) || (!prevSelected.size && currentAnimId && String(a.id) === currentAnimId)) {
      opt.selected = true;
    }
    els.batchExportAnimList.appendChild(opt);
  }
}

function refreshStateMachineUI() {
  if (!els.smStateSelect) return;
  const sm = ensureStateMachine();
  const states = sm.states || [];
  const selectedState = getCurrentStateMachineState();
  const params = sm.parameters || [];

  if (els.smEnabled) els.smEnabled.checked = sm.enabled !== false;

  els.smStateSelect.innerHTML = "";
  for (const s of states) {
    const opt = document.createElement("option");
    opt.value = s.id;
    opt.textContent = s.name || s.id;
    els.smStateSelect.appendChild(opt);
  }
  els.smStateSelect.value = selectedState ? selectedState.id : "";
  if (els.smStateDeleteBtn) els.smStateDeleteBtn.disabled = states.length <= 1;

  if (els.smStateName) {
    els.smStateName.value = selectedState ? selectedState.name : "";
    els.smStateName.disabled = !selectedState;
  }

  if (els.smStateAnim) {
    els.smStateAnim.innerHTML = "";
    const none = document.createElement("option");
    none.value = "";
    none.textContent = "(none)";
    els.smStateAnim.appendChild(none);
    for (const a of state.anim.animations || []) {
      const opt = document.createElement("option");
      opt.value = a.id;
      opt.textContent = a.name;
      els.smStateAnim.appendChild(opt);
    }
    els.smStateAnim.value = selectedState && selectedState.animId ? selectedState.animId : "";
    els.smStateAnim.disabled = !selectedState;
  }

  if (els.smTransitionTo) {
    els.smTransitionTo.innerHTML = "";
    for (const s of states) {
      if (selectedState && s.id === selectedState.id) continue;
      const opt = document.createElement("option");
      opt.value = s.id;
      opt.textContent = s.name || s.id;
      els.smTransitionTo.appendChild(opt);
    }
    if (!els.smTransitionTo.value && els.smTransitionTo.options.length > 0) {
      els.smTransitionTo.value = els.smTransitionTo.options[0].value;
    }
    els.smTransitionTo.disabled = !selectedState || els.smTransitionTo.options.length <= 0;
  }

  if (els.smTransitionDur) {
    els.smTransitionDur.value = String(sm.pendingDuration || 0.2);
    els.smTransitionDur.disabled = !selectedState;
  }

  if (els.smTransitionList) {
    els.smTransitionList.innerHTML = "";
    const rows = selectedState && Array.isArray(selectedState.transitions) ? selectedState.transitions : [];
    for (const t of rows) {
      const to = states.find((s) => s.id === t.toStateId);
      const opt = document.createElement("option");
      opt.value = t.id;
      const condCount = Array.isArray(t.conditions) ? t.conditions.length : 0;
      const autoTag = t.auto === true ? " auto" : "";
      opt.textContent = `${selectedState.name} -> ${(to && to.name) || t.toStateId} (${Number(t.duration || 0.2).toFixed(2)}s${autoTag}, c${condCount})`;
      els.smTransitionList.appendChild(opt);
    }
    if (rows.length > 0) {
      const has = rows.some((t) => t.id === sm.selectedTransitionId);
      els.smTransitionList.value = has ? sm.selectedTransitionId : rows[0].id;
      sm.selectedTransitionId = els.smTransitionList.value;
    } else {
      sm.selectedTransitionId = "";
    }
    els.smTransitionList.disabled = rows.length <= 0;
  }

  const selectedTransition =
    selectedState && Array.isArray(selectedState.transitions)
      ? selectedState.transitions.find((t) => t.id === sm.selectedTransitionId) || null
      : null;

  if (els.smTransitionAddBtn) els.smTransitionAddBtn.disabled = !selectedState || !els.smTransitionTo || !els.smTransitionTo.value;
  if (els.smTransitionDeleteBtn) els.smTransitionDeleteBtn.disabled = !sm.selectedTransitionId;
  if (els.smTransitionGoBtn) els.smTransitionGoBtn.disabled = !sm.selectedTransitionId || sm.enabled === false;

  if (els.smParamSelect) {
    els.smParamSelect.innerHTML = "";
    for (const p of params) {
      const opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = `${p.name} (${p.type})`;
      els.smParamSelect.appendChild(opt);
    }
    if (params.length > 0) {
      const has = params.some((p) => p.id === sm.selectedParamId);
      els.smParamSelect.value = has ? sm.selectedParamId : params[0].id;
      sm.selectedParamId = els.smParamSelect.value;
    } else {
      sm.selectedParamId = "";
    }
    els.smParamSelect.disabled = params.length <= 0;
  }

  const selectedParam = getStateParamById(sm, sm.selectedParamId);
  if (els.smParamDeleteBtn) els.smParamDeleteBtn.disabled = !selectedParam;
  if (els.smParamName) {
    els.smParamName.value = selectedParam ? selectedParam.name : "";
    els.smParamName.disabled = !selectedParam;
  }
  if (els.smParamType) {
    els.smParamType.value = selectedParam ? selectedParam.type : "float";
    els.smParamType.disabled = !selectedParam;
  }
  if (els.smParamDefault) {
    els.smParamDefault.value = selectedParam
      ? (selectedParam.type === "bool" ? (selectedParam.defaultValue ? "true" : "false") : String(Number(selectedParam.defaultValue) || 0))
      : "0";
    els.smParamDefault.disabled = !selectedParam;
  }
  if (els.smParamValue) {
    els.smParamValue.value = selectedParam
      ? (selectedParam.type === "bool" ? (selectedParam.value === true ? "true" : "false") : String(Number(selectedParam.value) || 0))
      : "0";
    els.smParamValue.disabled = !selectedParam;
  }
  if (els.smParamSetBtn) els.smParamSetBtn.disabled = !selectedParam;
  if (els.smParamKeyBtn) els.smParamKeyBtn.disabled = !selectedParam;

  if (els.smTransitionAuto) {
    els.smTransitionAuto.checked = !!(selectedTransition && selectedTransition.auto === true);
    els.smTransitionAuto.disabled = !selectedTransition;
  }

  if (els.smCondParam) {
    els.smCondParam.innerHTML = "";
    for (const p of params) {
      const opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = p.name;
      els.smCondParam.appendChild(opt);
    }
    if (params.length > 0 && !els.smCondParam.value) els.smCondParam.value = params[0].id;
    els.smCondParam.disabled = !selectedTransition || params.length <= 0;
  }
  if (els.smCondOp) els.smCondOp.disabled = !selectedTransition;
  if (els.smCondValue) els.smCondValue.disabled = !selectedTransition;
  if (els.smCondAddBtn) els.smCondAddBtn.disabled = !selectedTransition || params.length <= 0;

  if (els.smCondList) {
    els.smCondList.innerHTML = "";
    const rows = selectedTransition && Array.isArray(selectedTransition.conditions) ? selectedTransition.conditions : [];
    for (const c of rows) {
      const p = getStateParamById(sm, c.paramId);
      const opt = document.createElement("option");
      opt.value = c.id;
      opt.textContent = `${p ? p.name : c.paramId} ${c.op || "eq"} ${String(c.value)}`;
      els.smCondList.appendChild(opt);
    }
    if (rows.length > 0) {
      const has = rows.some((c) => c.id === sm.selectedConditionId);
      els.smCondList.value = has ? sm.selectedConditionId : rows[0].id;
      sm.selectedConditionId = els.smCondList.value;
    } else {
      sm.selectedConditionId = "";
    }
    els.smCondList.disabled = rows.length <= 0;
  }
  if (els.smCondDeleteBtn) els.smCondDeleteBtn.disabled = !sm.selectedConditionId;
  if (els.smBridgeExportBtn) els.smBridgeExportBtn.disabled = params.length <= 0;
  if (els.smBridgeCodeBtn) els.smBridgeCodeBtn.disabled = params.length <= 0;
  if (els.smBridgeParamSelect) {
    els.smBridgeParamSelect.innerHTML = "";
    for (const p of params) {
      const opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = p.name;
      els.smBridgeParamSelect.appendChild(opt);
    }
    const bridgeParamId = selectedParam ? selectedParam.id : (params[0] ? params[0].id : "");
    if (bridgeParamId && params.some((p) => p.id === bridgeParamId)) els.smBridgeParamSelect.value = bridgeParamId;
    els.smBridgeParamSelect.disabled = params.length <= 0;
  }
  if (els.smBridgeParamValue) {
    const bridgeParam = getStateParamById(sm, String(els.smBridgeParamSelect ? els.smBridgeParamSelect.value : ""));
    if (bridgeParam) {
      els.smBridgeParamValue.value =
        bridgeParam.type === "bool" ? (bridgeParam.value === true ? "true" : "false") : String(Number(bridgeParam.value) || 0);
    }
    els.smBridgeParamValue.disabled = params.length <= 0;
  }
  if (els.smBridgeSetBtn) els.smBridgeSetBtn.disabled = params.length <= 0;
  if (els.smBridgeApiInfo) {
    els.smBridgeApiInfo.value = "window.setAnimParam(name, value), getAnimParam(name), listAnimParams()";
  }
}

function refreshAnimationMixUI() {
  if (!els.animMixTo) return;
  const current = getCurrentAnimation();
  const currentId = current ? current.id : "";
  els.animMixTo.innerHTML = "";
  for (const a of state.anim.animations) {
    const opt = document.createElement("option");
    opt.value = a.id;
    opt.textContent = a.name;
    els.animMixTo.appendChild(opt);
  }
  const fallback = state.anim.animations.find((a) => a.id !== currentId) || state.anim.animations[0] || null;
  if (fallback) els.animMixTo.value = fallback.id;
  if (els.animMixDur) {
    const dur = Math.max(0.01, Number(state.anim.mix.duration) || 0.2);
    state.anim.mix.duration = dur;
    els.animMixDur.value = String(dur);
  }
  if (els.animMixInfo) {
    if (state.anim.mix.active) {
      const p = Math.round(math.clamp((state.anim.mix.elapsed / Math.max(1e-6, state.anim.mix.duration)) * 100, 0, 100));
      els.animMixInfo.value = `Mixing ${p}%`;
    } else {
      els.animMixInfo.value = "State: idle";
    }
  }
}

function refreshAnimationLayerUI() {
  if (!els.layerTrackSelect) return;
  const layers = ensureAnimLayerTracks();
  const bones = state.mesh && Array.isArray(state.mesh.rigBones) ? state.mesh.rigBones : [];
  const currentAnim = getCurrentAnimation();
  const selected = getSelectedLayerTrack();

  els.layerTrackSelect.innerHTML = "";
  for (const t of layers) {
    const opt = document.createElement("option");
    opt.value = t.id;
    opt.textContent = t.name || "Layer";
    els.layerTrackSelect.appendChild(opt);
  }
  els.layerTrackSelect.value = selected ? selected.id : "";
  els.layerTrackSelect.disabled = layers.length === 0;
  if (els.layerTrackDeleteBtn) els.layerTrackDeleteBtn.disabled = layers.length === 0;

  if (els.layerTrackAnim) {
    els.layerTrackAnim.innerHTML = "";
    const none = document.createElement("option");
    none.value = "";
    none.textContent = "(none)";
    els.layerTrackAnim.appendChild(none);
    for (const a of state.anim.animations) {
      const opt = document.createElement("option");
      opt.value = a.id;
      opt.textContent = a.name;
      els.layerTrackAnim.appendChild(opt);
    }
    const fallbackAnim = state.anim.animations.find((a) => a.id !== (currentAnim && currentAnim.id)) || state.anim.animations[0];
    const val = selected && selected.animId ? selected.animId : fallbackAnim ? fallbackAnim.id : "";
    els.layerTrackAnim.value = val;
    if (selected && !selected.animId && val) selected.animId = val;
    els.layerTrackAnim.disabled = !selected;
  }

  if (els.layerTrackEnabled) {
    els.layerTrackEnabled.checked = selected ? selected.enabled !== false : false;
    els.layerTrackEnabled.disabled = !selected;
  }
  if (els.layerTrackLoop) {
    els.layerTrackLoop.checked = selected ? selected.loop !== false : true;
    els.layerTrackLoop.disabled = !selected;
  }
  if (els.layerTrackSpeed) {
    els.layerTrackSpeed.value = selected ? String(Number(selected.speed) || 1) : "1";
    els.layerTrackSpeed.disabled = !selected;
  }
  if (els.layerTrackOffset) {
    els.layerTrackOffset.value = selected ? String(Number(selected.offset) || 0) : "0";
    els.layerTrackOffset.disabled = !selected;
  }
  if (els.layerTrackAlpha) {
    els.layerTrackAlpha.value = selected ? String(math.clamp(Number(selected.alpha) || 0, 0, 1)) : "1";
    els.layerTrackAlpha.disabled = !selected;
  }
  if (els.layerTrackMode) {
    els.layerTrackMode.value = selected && selected.mode === "add" ? "add" : "replace";
    els.layerTrackMode.disabled = !selected;
  }
  if (els.layerTrackMaskMode) {
    els.layerTrackMaskMode.value =
      selected && (selected.maskMode === "include" || selected.maskMode === "exclude") ? selected.maskMode : "all";
    els.layerTrackMaskMode.disabled = !selected;
  }

  if (els.layerTrackBone) {
    els.layerTrackBone.innerHTML = "";
    for (let i = 0; i < bones.length; i += 1) {
      const b = bones[i];
      const opt = document.createElement("option");
      opt.value = String(i);
      opt.textContent = b && b.name ? `${i}: ${b.name}` : `bone_${i}`;
      els.layerTrackBone.appendChild(opt);
    }
    els.layerTrackBone.disabled = !selected || bones.length === 0;
  }
  if (els.layerTrackBoneAddBtn) {
    els.layerTrackBoneAddBtn.disabled = !selected || bones.length === 0;
  }
  if (els.layerTrackBoneClearBtn) {
    els.layerTrackBoneClearBtn.disabled = !selected || !selected.maskBones || selected.maskBones.length === 0;
  }
  if (els.layerTrackBoneList) {
    const names = selected
      ? (selected.maskBones || []).map((bi) => (bones[bi] && bones[bi].name ? bones[bi].name : `bone_${bi}`))
      : [];
    els.layerTrackBoneList.value = names.join(", ");
    els.layerTrackBoneList.disabled = !selected;
  }
}

function refreshDrawOrderUI() {
  if (!els.drawOrderList) return;
  const prevSel = String(els.drawOrderList.value || "");
  const selectedSlot = getActiveSlot();
  const selectedId = selectedSlot && selectedSlot.id ? String(selectedSlot.id) : "";
  els.drawOrderList.innerHTML = "";
  for (let i = 0; i < state.slots.length; i += 1) {
    const s = state.slots[i];
    if (!s) continue;
    if (!s.id) s.id = makeSlotId();
    const opt = document.createElement("option");
    opt.value = String(s.id);
    opt.textContent = `${i}. ${s.name || `slot_${i}`}`;
    els.drawOrderList.appendChild(opt);
  }
  const preferred = prevSel || selectedId;
  if (preferred && [...els.drawOrderList.options].some((o) => o.value === preferred)) {
    els.drawOrderList.value = preferred;
  } else if (els.drawOrderList.options.length > 0) {
    els.drawOrderList.selectedIndex = 0;
  }
  refreshDrawOrderEditorButtonState();
  if (els.drawOrderEditor) {
    els.drawOrderEditor.classList.toggle("collapsed", !state.anim.drawOrderEditorOpen);
  }
}

function refreshDrawOrderEditorButtonState() {
  if (!els.drawOrderList) return;
  const hasSel = els.drawOrderList.selectedIndex >= 0;
  const hasItems = els.drawOrderList.options.length > 0;
  if (els.drawOrderUpBtn) els.drawOrderUpBtn.disabled = !hasSel || els.drawOrderList.selectedIndex <= 0;
  if (els.drawOrderDownBtn) {
    els.drawOrderDownBtn.disabled =
      !hasSel || els.drawOrderList.selectedIndex < 0 || els.drawOrderList.selectedIndex >= els.drawOrderList.options.length - 1;
  }
  if (els.drawOrderApplyBtn) els.drawOrderApplyBtn.disabled = !hasItems;
  if (els.drawOrderApplyKeyBtn) els.drawOrderApplyKeyBtn.disabled = !hasItems;
}

function moveDrawOrderSelection(dir) {
  if (!els.drawOrderList) return;
  const list = els.drawOrderList;
  const idx = list.selectedIndex;
  if (idx < 0) return;
  const next = idx + dir;
  if (next < 0 || next >= list.options.length) return;
  const opt = list.options[idx];
  const ref = dir < 0 ? list.options[next] : list.options[next].nextSibling;
  list.insertBefore(opt, ref || null);
  list.selectedIndex = next;
  refreshDrawOrderEditorButtonState();
}

function applyDrawOrderFromUI(writeKey = false) {
  if (!els.drawOrderList || els.drawOrderList.options.length <= 0) return false;
  const ids = [...els.drawOrderList.options].map((o) => String(o.value || ""));
  const activeSlotObj = getActiveSlot();
  const idMap = new Map();
  for (const s of state.slots) {
    if (!s) continue;
    if (!s.id) s.id = makeSlotId();
    idMap.set(String(s.id), s);
  }
  const out = [];
  const used = new Set();
  for (const id of ids) {
    const s = idMap.get(id);
    if (!s || used.has(s)) continue;
    used.add(s);
    out.push(s);
  }
  for (const s of state.slots) {
    if (!s || used.has(s)) continue;
    out.push(s);
  }
  if (out.length !== state.slots.length) return false;
  state.slots = out;
  if (activeSlotObj) {
    const idx = state.slots.indexOf(activeSlotObj);
    if (idx >= 0) state.activeSlot = idx;
  }
  markDirtyDrawOrder();
  renderBoneTree();
  refreshSlotUI();
  refreshTrackSelect();
  renderTimelineTracks();
  if (state.mesh) samplePoseAtTime(state.mesh, state.anim.time);
  if (writeKey) {
    state.anim.selectedTrack = DRAWORDER_TRACK_ID;
    if (els.trackSelect) els.trackSelect.value = DRAWORDER_TRACK_ID;
    addOrUpdateKeyframeForTrack(DRAWORDER_TRACK_ID, false);
  } else {
    setStatus("Draw order applied.");
  }
  return true;
}

function addAnimationLayerTrack() {
  ensureAnimLayerTracks();
  const current = getCurrentAnimation();
  const fallback = state.anim.animations.find((a) => !current || a.id !== current.id) || state.anim.animations[0] || null;
  const layer = createAnimLayerTrack(`Layer ${state.anim.layerTracks.length + 1}`);
  if (fallback) layer.animId = fallback.id;
  state.anim.layerTracks.push(layer);
  state.anim.selectedLayerTrackId = layer.id;
  refreshAnimationLayerUI();
  return layer;
}

function removeSelectedAnimationLayerTrack() {
  ensureAnimLayerTracks();
  const sel = getSelectedLayerTrack();
  if (!sel) return false;
  state.anim.layerTracks = state.anim.layerTracks.filter((t) => t.id !== sel.id);
  if (state.anim.layerTracks.length > 0) {
    state.anim.selectedLayerTrackId = state.anim.layerTracks[Math.max(0, state.anim.layerTracks.length - 1)].id;
  } else {
    state.anim.selectedLayerTrackId = "";
  }
  refreshAnimationLayerUI();
  return true;
}

function timelineXForTime(t, width, duration) {
  return math.clamp((t / Math.max(0.1, duration)) * width, 0, width);
}

function timeForTimelineX(x, width, duration) {
  if (width <= 1) return 0;
  return math.clamp((x / width) * Math.max(0.1, duration), 0, Math.max(0.1, duration));
}

function collectUniqueKeyTimes(anim, trackIds) {
  const bag = [];
  for (const trackId of trackIds) {
    for (const k of getTrackKeys(anim, trackId)) bag.push(k.time);
  }
  bag.sort((a, b) => a - b);
  const out = [];
  for (let i = 0; i < bag.length; i += 1) {
    if (i > 0 && Math.abs(bag[i] - bag[i - 1]) < 1e-4) continue;
    out.push(bag[i]);
  }
  return out;
}

function clearTimelineKeySelection() {
  state.anim.selectedKeys = [];
  state.anim.selectedKey = null;
}

function keySelectionHas(trackId, keyId) {
  return state.anim.selectedKeys.some((s) => s && s.trackId === trackId && s.keyId === keyId);
}

function normalizeSelectedKeys(anim) {
  const out = [];
  for (const s of state.anim.selectedKeys || []) {
    if (!s || !s.trackId || !s.keyId) continue;
    const keys = getTrackKeys(anim, s.trackId);
    if (keys.some((k) => k.id === s.keyId)) out.push({ trackId: s.trackId, keyId: s.keyId });
  }
  state.anim.selectedKeys = out;
  if (state.anim.selectedKey && !keySelectionHas(state.anim.selectedKey.trackId, state.anim.selectedKey.keyId)) {
    state.anim.selectedKey = out.length > 0 ? { ...out[0] } : null;
  }
}

function setSingleTimelineSelection(trackId, keyId) {
  state.anim.selectedKeys = [{ trackId, keyId }];
  state.anim.selectedKey = { trackId, keyId };
}

function focusTimelineTrack(trackId, preferNearestKey = true) {
  const anim = getCurrentAnimation();
  if (!anim || !trackId) return;
  state.anim.selectedTrack = trackId;
  if (els.trackSelect) els.trackSelect.value = trackId;
  if (!preferNearestKey) {
    clearTimelineKeySelection();
    renderTimelineTracks();
    return;
  }
  const keys = getTrackKeys(anim, trackId).slice().sort((a, b) => (Number(a.time) || 0) - (Number(b.time) || 0));
  if (keys.length <= 0) {
    clearTimelineKeySelection();
    renderTimelineTracks();
    return;
  }
  const t = Number(state.anim.time) || 0;
  let best = keys[0];
  let bestDist = Math.abs((Number(best.time) || 0) - t);
  for (let i = 1; i < keys.length; i += 1) {
    const d = Math.abs((Number(keys[i].time) || 0) - t);
    if (d < bestDist) {
      best = keys[i];
      bestDist = d;
    }
  }
  setSingleTimelineSelection(trackId, best.id);
  renderTimelineTracks();
}

function syncLayerPanelFromSelectedTrack() {
  const parsed = parseTrackId(state.anim.selectedTrack);
  if (!parsed || parsed.type !== "layer") return;
  state.anim.selectedLayerTrackId = parsed.layerId;
  refreshAnimationLayerUI();
}

function toggleTimelineSelection(trackId, keyId) {
  if (keySelectionHas(trackId, keyId)) {
    state.anim.selectedKeys = state.anim.selectedKeys.filter((s) => !(s.trackId === trackId && s.keyId === keyId));
    if (state.anim.selectedKey && state.anim.selectedKey.trackId === trackId && state.anim.selectedKey.keyId === keyId) {
      state.anim.selectedKey = state.anim.selectedKeys.length > 0 ? { ...state.anim.selectedKeys[0] } : null;
    }
    return;
  }
  state.anim.selectedKeys.push({ trackId, keyId });
  state.anim.selectedKey = { trackId, keyId };
}

function getDragSeedFromSelection(anim, selected) {
  const seed = [];
  for (const s of selected) {
    const keys = getTrackKeys(anim, s.trackId);
    const k = keys.find((it) => it.id === s.keyId);
    if (!k) continue;
    seed.push({ trackId: s.trackId, keyId: s.keyId, time: Number(k.time) || 0 });
  }
  return seed;
}

function collectKeysAtTime(anim, t) {
  const out = [];
  for (const trackId of Object.keys(anim.tracks || {})) {
    if (!parseTrackId(trackId)) continue;
    const keys = getTrackKeys(anim, trackId);
    for (const k of keys) {
      if (Math.abs((Number(k.time) || 0) - t) < 1e-4) out.push({ trackId, keyId: k.id });
    }
  }
  return out;
}

function applyTimelineSelectionClasses() {
  const selected = new Set((state.anim.selectedKeys || []).map((s) => `${s.trackId}::${s.keyId}`));
  const nodes = els.timelineTracks.querySelectorAll(".track-key[data-track-id][data-key-id]");
  for (const el of nodes) {
    const key = `${el.dataset.trackId || ""}::${el.dataset.keyId || ""}`;
    el.classList.toggle("selected", selected.has(key));
  }
}

function renderTimelineTracks() {
  const anim = getCurrentAnimation();
  const groups = getTimelineGroupsForView(anim);
  const root = els.timelineTracks;
  root.innerHTML = "";
  if (!anim) return;
  const timelineDuration = getTimelineDisplayDuration(anim);
  const ruler = document.createElement("div");
  ruler.className = "timeline-ruler";
  const rulerLabel = document.createElement("div");
  rulerLabel.className = "track-label";
  rulerLabel.textContent = "Time";
  const rulerLane = document.createElement("div");
  rulerLane.className = "track-lane selected";
  rulerLane.dataset.trackId = "__ruler__";
  const rulerPlayhead = document.createElement("div");
  rulerPlayhead.className = "timeline-playhead handle";
  rulerPlayhead.dataset.playhead = "1";
  rulerPlayhead.style.left = `${(timelineXForTime(state.anim.time, 100, timelineDuration)).toFixed(4)}%`;
  const tickStep = getTimelineTimeStep();
  const tickCount = Math.floor(timelineDuration / tickStep) + 1;
  const majorEvery = Math.max(1, Math.round(1 / tickStep));
  if (tickCount <= 600) {
    for (let i = 0; i <= tickCount; i += 1) {
      const tt = i * tickStep;
      if (tt > timelineDuration + 1e-6) break;
      const tick = document.createElement("div");
      tick.className = `timeline-tick${i % majorEvery === 0 ? " major" : ""}`;
      tick.style.left = `${(timelineXForTime(tt, 100, timelineDuration)).toFixed(4)}%`;
      rulerLane.appendChild(tick);
    }
  }
  rulerLane.appendChild(rulerPlayhead);
  ruler.appendChild(rulerLabel);
  ruler.appendChild(rulerLane);
  root.appendChild(ruler);

  const allTrackIds = groups.flatMap((g) => (Array.isArray(g.children) ? g.children.map((c) => c.id) : []));
  const allRow = document.createElement("div");
  allRow.className = "track-row track-group";
  const allLabel = document.createElement("div");
  allLabel.className = "track-label";
  allLabel.textContent = "All";
  const allLane = document.createElement("div");
  allLane.className = "track-lane";
  allLane.dataset.trackId = "__all__";
  const allPlayhead = document.createElement("div");
  allPlayhead.className = "timeline-playhead";
  allPlayhead.style.left = `${(timelineXForTime(state.anim.time, 100, timelineDuration)).toFixed(4)}%`;
  allLane.appendChild(allPlayhead);
  for (const t of collectUniqueKeyTimes(anim, allTrackIds)) {
    const mk = document.createElement("div");
    mk.className = "track-key";
    mk.dataset.allTime = String(Number(t).toFixed(6));
    mk.style.left = `${(timelineXForTime(t, 100, timelineDuration)).toFixed(4)}%`;
    mk.style.opacity = "0.55";
    allLane.appendChild(mk);
  }
  allRow.appendChild(allLabel);
  allRow.appendChild(allLane);
  root.appendChild(allRow);

  for (const g of groups) {
    const groupKey = String(g.groupKey ?? g.boneIndex ?? "");
    const groupPlayable = isGroupPlayable(groupKey);
    const groupMuted = !!(state.anim.groupMute && state.anim.groupMute[groupKey]);
    const groupSolo = !!(state.anim.groupSolo && state.anim.groupSolo[groupKey]);
    const row = document.createElement("div");
    row.className = "track-row track-group";
    if (groupSolo) row.classList.add("group-solo");
    if (groupMuted) row.classList.add("group-muted");
    if (!groupPlayable) row.classList.add("dimmed");
    const label = document.createElement("div");
    label.className = "track-label";
    label.dataset.groupKey = groupKey;
    const head = document.createElement("div");
    head.className = "track-group-head";
    const titleWrap = document.createElement("span");
    titleWrap.className = "track-group-title-wrap";
    const arrow = document.createElement("span");
    arrow.className = "track-group-arrow";
    arrow.textContent = g.expanded ? "▼" : "▶";
    const visDot = document.createElement("span");
    visDot.className = `track-group-visdot${groupSolo ? " solo" : ""}${groupMuted ? " muted" : ""}`;
    visDot.title = groupMuted ? "Muted group" : groupSolo ? "Solo group" : "Group visible";
    const title = document.createElement("span");
    title.className = "track-group-title";
    title.textContent = `${g.label}`;
    titleWrap.appendChild(arrow);
    titleWrap.appendChild(visDot);
    titleWrap.appendChild(title);
    const tools = document.createElement("span");
    tools.className = "track-group-tools";
    const soloBtn = document.createElement("button");
    soloBtn.type = "button";
    soloBtn.className = `track-group-dot solo-eye${groupSolo ? " active" : ""}`;
    soloBtn.dataset.groupAction = "solo";
    soloBtn.dataset.groupKey = groupKey;
    soloBtn.title = "Solo (show only this group)";
    soloBtn.setAttribute("aria-label", `Solo ${g.label}`);
    soloBtn.textContent = "";
    const muteBtn = document.createElement("button");
    muteBtn.type = "button";
    muteBtn.className = `track-group-dot mute-lock${groupMuted ? " active" : ""}`;
    muteBtn.dataset.groupAction = "mute";
    muteBtn.dataset.groupKey = groupKey;
    muteBtn.title = "Mute (hide this group)";
    muteBtn.setAttribute("aria-label", `Mute ${g.label}`);
    muteBtn.textContent = "";
    tools.appendChild(soloBtn);
    tools.appendChild(muteBtn);
    head.appendChild(titleWrap);
    head.appendChild(tools);
    label.appendChild(head);
    const lane = document.createElement("div");
    lane.className = "track-lane";
    lane.dataset.trackId = g.id;
    const playhead = document.createElement("div");
    playhead.className = "timeline-playhead";
    playhead.style.left = `${(timelineXForTime(state.anim.time, 100, timelineDuration)).toFixed(4)}%`;
    lane.appendChild(playhead);
    row.appendChild(label);
    row.appendChild(lane);
    root.appendChild(row);

    if (!g.expanded) continue;
    for (const td of g.children) {
      const trackPlayable = isTrackPlayable(td.id);
      const crow = document.createElement("div");
      crow.className = "track-row child";
      if (!trackPlayable) crow.classList.add("dimmed");
      const clabel = document.createElement("div");
      clabel.className = "track-label";
      clabel.textContent = td.label;
      const clane = document.createElement("div");
      clane.className = `track-lane${state.anim.selectedTrack === td.id ? " selected" : ""}`;
      clane.dataset.trackId = td.id;

      const cplay = document.createElement("div");
      cplay.className = "timeline-playhead";
      cplay.style.left = `${(timelineXForTime(state.anim.time, 100, timelineDuration)).toFixed(4)}%`;
      clane.appendChild(cplay);

      const keys = getTrackKeys(anim, td.id);
      for (const k of keys) {
        if (!k.id) k.id = `k_${Math.random().toString(36).slice(2, 10)}`;
        const mk = document.createElement("div");
        mk.className = "track-key";
        if (keySelectionHas(td.id, k.id)) mk.classList.add("selected");
        mk.dataset.trackId = td.id;
        mk.dataset.keyId = k.id;
        mk.style.left = `${(timelineXForTime(k.time, 100, timelineDuration)).toFixed(4)}%`;
        clane.appendChild(mk);
      }

      crow.appendChild(clabel);
      crow.appendChild(clane);
      root.appendChild(crow);
    }
  }

  if (state.anim.selectedKeys && state.anim.selectedKeys.length > 1) {
    els.keyInfo.value = `${state.anim.selectedKeys.length} keys selected`;
    if (els.keyInterp) els.keyInterp.disabled = false;
  } else if (state.anim.selectedKey) {
    els.keyInfo.value = `${state.anim.selectedKey.trackId} @ ${state.anim.time.toFixed(2)}s`;
    const keys = getTrackKeys(anim, state.anim.selectedKey.trackId);
    const k = keys.find((x) => x.id === state.anim.selectedKey.keyId);
    if (k) {
      els.keyInterp.value = k.interp || "linear";
      if (els.keyInterp) {
        const parsed = parseTrackId(state.anim.selectedKey.trackId);
        const slotAttachmentTrack = !!(parsed && parsed.type === "slot" && parsed.prop === "attachment");
        const slotClipTrack = !!(
          parsed &&
          parsed.type === "slot" &&
          (parsed.prop === "clip" || parsed.prop === "clipSource" || parsed.prop === "clipEnd")
        );
        const layerEnabledTrack = !!(parsed && parsed.type === "layer" && parsed.prop === "enabled");
        const smParamBoolTrack = !!(
          parsed &&
          parsed.type === "smparam" &&
          (() => {
            const sm = ensureStateMachine();
            const param = getStateParamById(sm, parsed.paramId);
            return !!(param && param.type === "bool");
          })()
        );
        els.keyInterp.disabled =
          state.anim.selectedKey.trackId === EVENT_TRACK_ID ||
          state.anim.selectedKey.trackId === DRAWORDER_TRACK_ID ||
          slotAttachmentTrack ||
          slotClipTrack ||
          layerEnabledTrack ||
          smParamBoolTrack;
      }
      if (state.anim.selectedKey.trackId === EVENT_TRACK_ID) {
        applyEventDraftToUI(k.value);
      }
    }
  } else {
    els.keyInfo.value = "(none)";
    if (els.keyInterp) els.keyInterp.disabled = false;
  }
  refreshEventKeyListUI();
  renderCurveEditor();
}

function getCurveEditTarget() {
  const anim = getCurrentAnimation();
  const sk = state.anim.selectedKey;
  if (!anim || !sk) return null;
  const keys = getTrackKeys(anim, sk.trackId).slice().sort((a, b) => a.time - b.time);
  const i = keys.findIndex((k) => k.id === sk.keyId);
  if (i < 0 || keys.length < 2) return null;
  if (i < keys.length - 1) {
    const k0 = keys[i];
    const k1 = keys[i + 1];
    return { anim, trackId: sk.trackId, key: k0, next: k1, segment: "forward" };
  }
  // If selecting the last key, edit the previous segment instead.
  const k0 = keys[i - 1];
  const k1 = keys[i];
  return { anim, trackId: sk.trackId, key: k0, next: k1, segment: "backward" };
}

function ensureBezierCurveOnKey(k) {
  if (!k) return;
  if (!Array.isArray(k.curve) || k.curve.length < 4) {
    k.curve = [0.25, 0.25, 0.75, 0.75];
  }
}

function renderCurveEditor() {
  const cv = els.curveEditor;
  if (!cv) return;
  const wrap = els.curveEditorWrap;
  if (wrap) wrap.classList.toggle("collapsed", !state.anim.curveOpen);
  if (els.curveToggleBtn) {
    els.curveToggleBtn.classList.toggle("active", !!state.anim.curveOpen);
    els.curveToggleBtn.textContent = state.anim.curveOpen ? "Curve On" : "Curve";
  }
  if (!state.anim.curveOpen) return;
  const ctx = cv.getContext("2d");
  if (!ctx) return;
  const target = getCurveEditTarget();
  const w = cv.width;
  const h = cv.height;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#0a1218";
  ctx.fillRect(0, 0, w, h);
  const pad = 16;
  const gx0 = pad;
  const gy0 = pad;
  const gw = w - pad * 2;
  const gh = h - pad * 2;
  ctx.strokeStyle = "rgba(120,150,168,0.35)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i += 1) {
    const x = gx0 + (gw * i) / 4;
    const y = gy0 + (gh * i) / 4;
    ctx.beginPath();
    ctx.moveTo(x, gy0);
    ctx.lineTo(x, gy0 + gh);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(gx0, y);
    ctx.lineTo(gx0 + gw, y);
    ctx.stroke();
  }
  if (!target) {
    ctx.fillStyle = "#9eb1ba";
    ctx.font = "12px Segoe UI";
    ctx.fillText("Select a key segment to edit curve.", 16, Math.floor(h * 0.52));
    return;
  }
  const k = target.key;
  const interp = k.interp || "linear";
  if (interp === "bezier") ensureBezierCurveOnKey(k);
  const curve = Array.isArray(k.curve) && k.curve.length >= 4 ? k.curve : [0.25, 0.25, 0.75, 0.75];
  const toX = (u) => gx0 + math.clamp(u, 0, 1) * gw;
  const toY = (v) => gy0 + (1 - math.clamp(v, 0, 1)) * gh;

  ctx.strokeStyle = "rgba(255,255,255,0.35)";
  ctx.beginPath();
  ctx.moveTo(toX(0), toY(0));
  if (interp === "stepped") {
    ctx.lineTo(toX(1), toY(0));
    ctx.lineTo(toX(1), toY(1));
  } else if (interp === "bezier") {
    ctx.bezierCurveTo(toX(curve[0]), toY(curve[1]), toX(curve[2]), toY(curve[3]), toX(1), toY(1));
  } else {
    ctx.lineTo(toX(1), toY(1));
  }
  ctx.stroke();

  if (interp === "bezier") {
    const p0 = { x: toX(0), y: toY(0) };
    const p1 = { x: toX(curve[0]), y: toY(curve[1]) };
    const p2 = { x: toX(curve[2]), y: toY(curve[3]) };
    const p3 = { x: toX(1), y: toY(1) };
    ctx.strokeStyle = "rgba(125,211,252,0.55)";
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.moveTo(p3.x, p3.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
    ctx.fillStyle = "#7dd3fc";
    for (const p of [p1, p2]) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.fillStyle = "#9eb1ba";
  ctx.font = "11px Segoe UI";
  ctx.fillText(`${target.trackId} | ${interp}`, 10, 12);
}

function addOrUpdateKeyframeAtCurrentTime() {
  const m = state.mesh;
  const anim = getCurrentAnimation();
  if (!m || !anim) return;
  if (!state.anim.selectedTrack) refreshTrackSelect();
  const trackId = state.anim.selectedTrack;
  addOrUpdateKeyframeForTrack(trackId, false);
}

function addOrUpdateClipBundleKeyForActiveSlot(silent = false) {
  if (!state.mesh || state.activeSlot < 0) return false;
  const clipTrackId = getSlotTrackId(state.activeSlot, "clip");
  const clipSourceTrackId = getSlotTrackId(state.activeSlot, "clipSource");
  const clipEndTrackId = getSlotTrackId(state.activeSlot, "clipEnd");
  addOrUpdateKeyframeForTrack(clipTrackId, true);
  addOrUpdateKeyframeForTrack(clipSourceTrackId, true);
  addOrUpdateKeyframeForTrack(clipEndTrackId, true);
  state.anim.selectedTrack = clipTrackId;
  if (els.trackSelect) els.trackSelect.value = clipTrackId;
  renderTimelineTracks();
  if (!silent) setStatus(`Clip+Src+End key saved @ ${state.anim.time.toFixed(2)}s`);
  return true;
}

function addOrUpdateKeyframeForTrack(trackId, silent = false) {
  const m = state.mesh;
  const anim = getCurrentAnimation();
  if (!anim) return;
  if (!trackId) return;
  const p = parseTrackId(trackId);
  if (!p) return;
  if (!m && p.type !== "smparam") return;
  const t = snapTimeIfNeeded(state.anim.time);
  const v = getTrackValue(m, p);
  const keys = getTrackKeys(anim, trackId);
  const vertexSlotIndex =
    p.type === "vertex"
      ? Number.isFinite(p.slotIndex)
        ? Number(p.slotIndex)
        : state.activeSlot
      : null;
  const existing = keys.find((k) => {
    if (Math.abs(k.time - t) >= 1e-4) return false;
    if (p.type !== "vertex") return true;
    if (!Number.isFinite(vertexSlotIndex) || vertexSlotIndex < 0) return true;
    return Number.isFinite(k.slotIndex) ? Number(k.slotIndex) === Number(vertexSlotIndex) : false;
  });
  const forceStepped =
    trackId === EVENT_TRACK_ID ||
    trackId === DRAWORDER_TRACK_ID ||
    (p.type === "slot" && (p.prop === "attachment" || p.prop === "clip" || p.prop === "clipSource" || p.prop === "clipEnd")) ||
    (p.type === "layer" && p.prop === "enabled") ||
    (p.type === "smparam" && (() => {
      const sm = ensureStateMachine();
      const param = getStateParamById(sm, p.paramId);
      return !!(param && param.type === "bool");
    })());
  const interp = forceStepped ? "stepped" : els.keyInterp.value || "linear";
  if (existing) {
    existing.value = cloneTrackValue(v);
    existing.interp = interp;
    if (interp === "bezier") {
      ensureBezierCurveOnKey(existing);
    } else {
      delete existing.curve;
    }
    if (Number.isFinite(vertexSlotIndex) && vertexSlotIndex >= 0) existing.slotIndex = Number(vertexSlotIndex);
    setSingleTimelineSelection(trackId, existing.id);
  } else {
    const nk = { id: `k_${Math.random().toString(36).slice(2, 10)}`, time: t, value: cloneTrackValue(v), interp };
    if (interp === "bezier") nk.curve = [0.25, 0.25, 0.75, 0.75];
    if (Number.isFinite(vertexSlotIndex) && vertexSlotIndex >= 0) nk.slotIndex = Number(vertexSlotIndex);
    keys.push(nk);
    setSingleTimelineSelection(trackId, nk.id);
  }
  normalizeTrackKeys(anim, trackId);
  setAnimTime(t);
  renderTimelineTracks();
  if (!silent) setStatus(`Key saved: ${trackId} @ ${t.toFixed(2)}s`);
}

function deleteKeyframeAtCurrentTimeForTrack(trackId) {
  const anim = getCurrentAnimation();
  if (!anim || !trackId) return false;
  const keys = getTrackKeys(anim, trackId);
  const t = state.anim.time;
  const before = keys.length;
  anim.tracks[trackId] = keys.filter((k) => Math.abs((Number(k.time) || 0) - t) >= 1e-4);
  if (anim.tracks[trackId].length === before) return false;
  clearTimelineKeySelection();
  renderTimelineTracks();
  return true;
}

function collectChangedTracksAtCurrentTime() {
  const m = state.mesh;
  const anim = getCurrentAnimation();
  if (!m || !anim) return [];
  ensureIKConstraints(m);
  const slotOffsetSnapshots = new Map();
  const slotStateSnapshots = new Map();
  if (state.slots.length > 0) {
    for (let si = 0; si < state.slots.length; si += 1) {
      const slot = state.slots[si];
      if (!slot) continue;
      slotStateSnapshots.set(si, {
        activeAttachment: slot.activeAttachment,
        clipEnabled: slot.clipEnabled,
        clipSource: slot.clipSource,
        clipEndSlotId: slot.clipEndSlotId,
        blend: slot.blend,
        darkEnabled: slot.darkEnabled,
        dr: slot.dr,
        dg: slot.dg,
        db: slot.db,
        r: slot.r,
        g: slot.g,
        b: slot.b,
        alpha: slot.alpha,
      });
      ensureSlotMeshData(slot, m);
      if (slot.meshData && slot.meshData.offsets) {
        slotOffsetSnapshots.set(si, new Float32Array(slot.meshData.offsets));
      }
    }
  }
  const offsets = getActiveOffsets(m);
  const temp = {
    rigBones: cloneBones(m.rigBones),
    poseBones: cloneBones(m.rigBones),
    offsets: new Float32Array(offsets),
    baseOffsets: new Float32Array(offsets),
    ikConstraints: JSON.parse(JSON.stringify(m.ikConstraints || [])),
    transformConstraints: JSON.parse(JSON.stringify(m.transformConstraints || [])),
    pathConstraints: JSON.parse(JSON.stringify(m.pathConstraints || [])),
  };
  ensureIKConstraints(temp);
  ensureTransformConstraints(temp);
  ensurePathConstraints(temp);
  samplePoseAtTime(temp, state.anim.time);
  const out = [];
  const eps = 1e-4;
  for (let i = 0; i < m.poseBones.length; i += 1) {
    const cur = m.poseBones[i];
    const base = temp.poseBones[i];
    if (!cur || !base) continue;
    if (Math.abs(cur.tx - base.tx) > eps || Math.abs(cur.ty - base.ty) > eps) {
      out.push(getTrackId(i, "translate"));
    }
    if (Math.abs(cur.rot - base.rot) > eps) {
      out.push(getTrackId(i, "rotate"));
    }
    if (Math.abs(cur.length - base.length) > eps) {
      out.push(getTrackId(i, "scale"));
    }
    if (Math.abs((Number(cur.sx) || 1) - (Number(base.sx) || 1)) > eps) {
      out.push(getTrackId(i, "scaleX"));
    }
    if (Math.abs((Number(cur.sy) || 1) - (Number(base.sy) || 1)) > eps) {
      out.push(getTrackId(i, "scaleY"));
    }
    if (Math.abs((Number(cur.shx) || 0) - (Number(base.shx) || 0)) > eps) {
      out.push(getTrackId(i, "shearX"));
    }
    if (Math.abs((Number(cur.shy) || 0) - (Number(base.shy) || 0)) > eps) {
      out.push(getTrackId(i, "shearY"));
    }
  }
  if (state.slots.length > 0) {
    for (const [si, saved] of slotOffsetSnapshots.entries()) {
      const sampled = getModelSlotOffsets(temp, si);
      let changed = false;
      if (sampled && sampled.length === saved.length) {
        for (let i = 0; i < saved.length; i += 1) {
          if (Math.abs(saved[i] - sampled[i]) > eps) {
            changed = true;
            break;
          }
        }
      }
      if (changed) out.push(getVertexTrackId(si));
      const slot = state.slots[si];
      const current = slot && slot.meshData ? slot.meshData.offsets : null;
      if (current && current.length === saved.length) current.set(saved);
    }
  } else if (temp.offsets && temp.offsets.length === offsets.length) {
    let changed = false;
    for (let i = 0; i < offsets.length; i += 1) {
      if (Math.abs(offsets[i] - temp.offsets[i]) > eps) {
        changed = true;
        break;
      }
    }
    if (changed) out.push(VERTEX_TRACK_ID);
  }
  const nowIK = ensureIKConstraints(m);
  const baseIK = ensureIKConstraints(temp);
  const ikN = Math.min(nowIK.length, baseIK.length);
  for (let i = 0; i < ikN; i += 1) {
    if (Math.abs((Number(nowIK[i].mix) || 0) - (Number(baseIK[i].mix) || 0)) > eps) {
      out.push(getIKTrackId(i, "mix"));
    }
    if (Math.abs((Math.max(0, Number(nowIK[i].softness) || 0)) - (Math.max(0, Number(baseIK[i].softness) || 0))) > eps) {
      out.push(getIKTrackId(i, "softness"));
    }
    if ((nowIK[i].bendPositive !== false) !== (baseIK[i].bendPositive !== false)) {
      out.push(getIKTrackId(i, "bend"));
    }
    if (!!nowIK[i].compress !== !!baseIK[i].compress) out.push(getIKTrackId(i, "compress"));
    if (!!nowIK[i].stretch !== !!baseIK[i].stretch) out.push(getIKTrackId(i, "stretch"));
    if (!!nowIK[i].uniform !== !!baseIK[i].uniform) out.push(getIKTrackId(i, "uniform"));
    const nx = Number(nowIK[i].targetX);
    const ny = Number(nowIK[i].targetY);
    const bx = Number(baseIK[i].targetX);
    const by = Number(baseIK[i].targetY);
    const xChanged =
      (Number.isFinite(nx) && !Number.isFinite(bx)) ||
      (!Number.isFinite(nx) && Number.isFinite(bx)) ||
      (Number.isFinite(nx) && Number.isFinite(bx) && Math.abs(nx - bx) > eps);
    const yChanged =
      (Number.isFinite(ny) && !Number.isFinite(by)) ||
      (!Number.isFinite(ny) && Number.isFinite(by)) ||
      (Number.isFinite(ny) && Number.isFinite(by) && Math.abs(ny - by) > eps);
    if (xChanged || yChanged) {
      out.push(getIKTrackId(i, "target"));
    }
  }
  const nowT = ensureTransformConstraints(m);
  const baseT = ensureTransformConstraints(temp);
  const tN = Math.min(nowT.length, baseT.length);
  for (let i = 0; i < tN; i += 1) {
    if (Math.abs((Number(nowT[i].rotateMix) || 0) - (Number(baseT[i].rotateMix) || 0)) > eps) out.push(getTransformTrackId(i, "rotateMix"));
    if (Math.abs((Number(nowT[i].translateMix) || 0) - (Number(baseT[i].translateMix) || 0)) > eps)
      out.push(getTransformTrackId(i, "translateMix"));
    if (Math.abs((Number(nowT[i].scaleMix) || 0) - (Number(baseT[i].scaleMix) || 0)) > eps) out.push(getTransformTrackId(i, "scaleMix"));
    if (Math.abs((Number(nowT[i].shearMix) || 0) - (Number(baseT[i].shearMix) || 0)) > eps) out.push(getTransformTrackId(i, "shearMix"));
  }
  const nowP = ensurePathConstraints(m);
  const baseP = ensurePathConstraints(temp);
  const pN = Math.min(nowP.length, baseP.length);
  for (let i = 0; i < pN; i += 1) {
    if (Math.abs((Number(nowP[i].position) || 0) - (Number(baseP[i].position) || 0)) > eps) out.push(getPathTrackId(i, "position"));
    if (Math.abs((Number(nowP[i].spacing) || 0) - (Number(baseP[i].spacing) || 0)) > eps) out.push(getPathTrackId(i, "spacing"));
    if (Math.abs((Number(nowP[i].rotateMix) || 0) - (Number(baseP[i].rotateMix) || 0)) > eps) out.push(getPathTrackId(i, "rotateMix"));
    if (Math.abs((Number(nowP[i].translateMix) || 0) - (Number(baseP[i].translateMix) || 0)) > eps)
      out.push(getPathTrackId(i, "translateMix"));
  }
  for (const [si, snap] of slotStateSnapshots.entries()) {
    const slot = state.slots[si];
    if (!slot || !snap) continue;
    slot.activeAttachment = snap.activeAttachment;
    slot.clipEnabled = snap.clipEnabled;
    slot.clipSource = snap.clipSource;
    slot.clipEndSlotId = snap.clipEndSlotId;
    slot.blend = snap.blend;
    slot.darkEnabled = snap.darkEnabled;
    slot.dr = snap.dr;
    slot.dg = snap.dg;
    slot.db = snap.db;
    slot.r = snap.r;
    slot.g = snap.g;
    slot.b = snap.b;
    slot.alpha = snap.alpha;
    ensureSlotVisualState(slot);
  }
  return [...new Set(out)];
}

function addAutoKeyframeFromDirty(silent = false) {
  if (!state.mesh) return;
  let dirty = [...state.anim.dirtyTracks];
  if (dirty.length === 0) dirty = collectChangedTracksAtCurrentTime();
  if (dirty.length === 0 && state.boneMode === "pose" && state.selectedIK >= 0) {
    const list = ensureIKConstraints(state.mesh);
    const ik = list[state.selectedIK];
    if (ik && (!Number.isFinite(Number(ik.target)) || Number(ik.target) < 0)) {
      dirty = [getIKTrackId(state.selectedIK, "target")];
    }
  }
  if (dirty.length === 0) dirty = [state.anim.selectedTrack].filter(Boolean);
  if (dirty.length === 0) {
    addOrUpdateKeyframeAtCurrentTime();
    return;
  }
  for (const trackId of dirty) {
    addOrUpdateKeyframeForTrack(trackId, true);
  }
  state.anim.dirtyTracks = [];
  if (!silent) setStatus(`Auto key on ${dirty.length} track(s) @ ${state.anim.time.toFixed(2)}s`);
}

function refreshAutoKeyUI() {
  if (!els.autoKeyBtn) return;
  const on = !!state.anim.autoKey;
  els.autoKeyBtn.classList.toggle("recording", on);
  els.autoKeyBtn.textContent = on ? "● Rec On" : "● Rec";
  els.autoKeyBtn.title = on ? "Auto Key: On" : "Auto Key: Off";
}

function updatePlaybackButtons() {
  const playing = !!state.anim.playing;
  if (els.playBtn) {
    els.playBtn.classList.toggle("playing", playing);
    els.playBtn.classList.toggle("paused", !playing);
    els.playBtn.textContent = playing ? "Pause" : "Play";
  }
  refreshAutoKeyUI();
}

function deleteSelectedOrCurrentKeyframe() {
  const anim = getCurrentAnimation();
  if (!anim) return;
  const sk = state.anim.selectedKey;
  if (!sk) {
    setStatus("No selected key.");
    return;
  }
  const selectedSet = new Set((state.anim.selectedKeys || []).map((s) => `${s.trackId}::${s.keyId}`));
  const keySet = new Set([...selectedSet, `${sk.trackId}::${sk.keyId}`]);
  let removed = 0;
  for (const trackId of Object.keys(anim.tracks || {})) {
    const list = getTrackKeys(anim, trackId);
    const next = list.filter((k) => {
      const keep = !keySet.has(`${trackId}::${k.id}`);
      if (!keep) removed += 1;
      return keep;
    });
    anim.tracks[trackId] = next;
  }
  if (removed <= 0) {
    setStatus("No key removed.");
    return;
  }
  clearTimelineKeySelection();
  renderTimelineTracks();
  setStatus(removed > 1 ? `${removed} keys deleted.` : "Key deleted.");
}

function copySelectedKeyframe() {
  const anim = getCurrentAnimation();
  const sk = state.anim.selectedKey;
  if (!anim || !sk) return;
  const keys = getTrackKeys(anim, sk.trackId);
  const k = keys.find((x) => x.id === sk.keyId);
  if (!k) return;
  state.anim.keyClipboard = {
    trackId: sk.trackId,
    value: cloneTrackValue(k.value),
    interp: k.interp || "linear",
    curve: Array.isArray(k.curve) && k.curve.length >= 4 ? k.curve.slice(0, 4) : null,
    slotIndex: Number.isFinite(k.slotIndex) ? Number(k.slotIndex) : null,
  };
  setStatus("Key copied.");
}

function pasteKeyframeAtCurrentTime() {
  const anim = getCurrentAnimation();
  if (!anim || !state.anim.keyClipboard) return;
  const trackId = state.anim.selectedTrack || state.anim.keyClipboard.trackId;
  const parsed = parseTrackId(trackId);
  const pasteSlotIndex =
    parsed && parsed.type === "vertex"
      ? Number.isFinite(parsed.slotIndex)
        ? Number(parsed.slotIndex)
        : Number.isFinite(state.anim.keyClipboard.slotIndex)
          ? Number(state.anim.keyClipboard.slotIndex)
          : state.activeSlot
      : null;
  const keys = getTrackKeys(anim, trackId);
  const t = snapTimeIfNeeded(state.anim.time);
  const existing = keys.find((k) => {
    if (Math.abs(k.time - t) >= 1e-4) return false;
    if (!(parsed && parsed.type === "vertex")) return true;
    if (!Number.isFinite(pasteSlotIndex) || pasteSlotIndex < 0) return true;
    return Number.isFinite(k.slotIndex) ? Number(k.slotIndex) === Number(pasteSlotIndex) : false;
  });
  if (existing) {
    existing.value = cloneTrackValue(state.anim.keyClipboard.value);
    existing.interp = state.anim.keyClipboard.interp || "linear";
    if (Array.isArray(state.anim.keyClipboard.curve) && state.anim.keyClipboard.curve.length >= 4) {
      existing.curve = state.anim.keyClipboard.curve.slice(0, 4);
    } else {
      delete existing.curve;
    }
    if (parsed && parsed.type === "vertex" && Number.isFinite(pasteSlotIndex) && pasteSlotIndex >= 0) {
      existing.slotIndex = Number(pasteSlotIndex);
    }
    setSingleTimelineSelection(trackId, existing.id);
  } else {
    const nk = {
      id: `k_${Math.random().toString(36).slice(2, 10)}`,
      time: t,
      value: cloneTrackValue(state.anim.keyClipboard.value),
      interp: state.anim.keyClipboard.interp || "linear",
    };
    if (Array.isArray(state.anim.keyClipboard.curve) && state.anim.keyClipboard.curve.length >= 4) {
      nk.curve = state.anim.keyClipboard.curve.slice(0, 4);
    }
    if (parsed && parsed.type === "vertex" && Number.isFinite(pasteSlotIndex) && pasteSlotIndex >= 0) {
      nk.slotIndex = Number(pasteSlotIndex);
    }
    keys.push(nk);
    setSingleTimelineSelection(trackId, nk.id);
  }
  normalizeTrackKeys(anim, trackId);
  setAnimTime(t);
  renderTimelineTracks();
  setStatus("Key pasted/overwritten.");
}

function jumpToNeighborKey(direction) {
  const anim = getCurrentAnimation();
  if (!anim || !state.anim.selectedTrack) return;
  const keys = getTrackKeys(anim, state.anim.selectedTrack);
  if (!keys || keys.length === 0) return;
  const t = state.anim.time;
  const ordered = [...keys].sort((a, b) => a.time - b.time);
  let target = null;
  if (direction > 0) {
    target = ordered.find((k) => k.time > t + 1e-5) || ordered[0];
  } else {
    for (let i = ordered.length - 1; i >= 0; i -= 1) {
      if (ordered[i].time < t - 1e-5) {
        target = ordered[i];
        break;
      }
    }
    if (!target) target = ordered[ordered.length - 1];
  }
  setAnimTime(target.time);
  setSingleTimelineSelection(state.anim.selectedTrack, target.id);
  if (state.mesh) {
    samplePoseAtTime(state.mesh, state.anim.time);
    if (state.boneMode === "pose") updateBoneUI();
  }
  renderTimelineTracks();
}

function applyLoopSeamOnSelectedTrack() {
  const anim = getCurrentAnimation();
  if (!anim || !state.anim.selectedTrack) return false;
  const trackId = state.anim.selectedTrack;
  if (!parseTrackId(trackId)) return false;
  const keys = getTrackKeys(anim, trackId);
  if (!Array.isArray(keys) || keys.length <= 0) return false;
  normalizeTrackKeys(anim, trackId);
  const sorted = getTrackKeys(anim, trackId);
  if (sorted.length <= 0) return false;
  const duration = Math.max(0.1, Number(anim.duration) || 0.1);
  const first = sorted[0];
  let endKey = sorted.find((k) => Math.abs((Number(k.time) || 0) - duration) < 1e-4);
  if (!endKey) {
    endKey = { id: `k_${Math.random().toString(36).slice(2, 10)}`, time: duration, value: cloneTrackValue(first.value), interp: "linear" };
    sorted.push(endKey);
  } else {
    endKey.value = cloneTrackValue(first.value);
  }
  endKey.time = duration;
  endKey.value = cloneTrackValue(first.value);
  endKey.interp = first.interp || "linear";
  if (Array.isArray(first.curve) && first.curve.length >= 4) endKey.curve = first.curve.slice(0, 4);
  else delete endKey.curve;
  normalizeTrackKeys(anim, trackId);
  setSingleTimelineSelection(trackId, endKey.id);
  setStatus(`Loop seam applied on ${trackId}.`);
  renderTimelineTracks();
  return true;
}

function applyLoopPingPongOnSelectedTrack() {
  const anim = getCurrentAnimation();
  if (!anim || !state.anim.selectedTrack) return false;
  const trackId = state.anim.selectedTrack;
  if (!parseTrackId(trackId)) return false;
  const keys = getTrackKeys(anim, trackId);
  if (!Array.isArray(keys) || keys.length < 2) return false;
  normalizeTrackKeys(anim, trackId);
  const sorted = getTrackKeys(anim, trackId).slice().sort((a, b) => (Number(a.time) || 0) - (Number(b.time) || 0));
  const duration = Math.max(0.1, Number(anim.duration) || 0.1);
  const base = sorted.filter((k) => (Number(k.time) || 0) <= duration + 1e-4);
  if (base.length < 2) return false;
  const out = base.map((k) => ({
    id: String(k.id || `k_${Math.random().toString(36).slice(2, 10)}`),
    time: Number(k.time) || 0,
    value: cloneTrackValue(k.value),
    interp: k.interp || "linear",
    curve: Array.isArray(k.curve) && k.curve.length >= 4 ? k.curve.slice(0, 4) : undefined,
    slotIndex: Number.isFinite(k.slotIndex) ? Number(k.slotIndex) : undefined,
  }));
  for (let i = base.length - 2; i >= 1; i -= 1) {
    const src = base[i];
    const t = duration + (duration - (Number(src.time) || 0));
    out.push({
      id: `k_${Math.random().toString(36).slice(2, 10)}`,
      time: t,
      value: cloneTrackValue(src.value),
      interp: src.interp || "linear",
      curve: Array.isArray(src.curve) && src.curve.length >= 4 ? src.curve.slice(0, 4) : undefined,
      slotIndex: Number.isFinite(src.slotIndex) ? Number(src.slotIndex) : undefined,
    });
  }
  const first = base[0];
  out.push({
    id: `k_${Math.random().toString(36).slice(2, 10)}`,
    time: duration * 2,
    value: cloneTrackValue(first.value),
    interp: first.interp || "linear",
    curve: Array.isArray(first.curve) && first.curve.length >= 4 ? first.curve.slice(0, 4) : undefined,
    slotIndex: Number.isFinite(first.slotIndex) ? Number(first.slotIndex) : undefined,
  });
  anim.tracks[trackId] = out;
  anim.duration = duration * 2;
  state.anim.duration = anim.duration;
  if (els.animDuration) els.animDuration.value = String(anim.duration);
  normalizeTrackKeys(anim, trackId);
  setAnimTime(math.clamp(state.anim.time, 0, anim.duration), anim.duration);
  setStatus(`Loop pingpong applied on ${trackId}; duration ${anim.duration.toFixed(3)}s.`);
  renderTimelineTracks();
  return true;
}

function addOrUpdateEventAtCurrentTime() {
  const anim = getCurrentAnimation();
  if (!anim) return;
  const t = snapTimeIfNeeded(state.anim.time);
  const keys = getTrackKeys(anim, EVENT_TRACK_ID);
  const existing = keys.find((k) => Math.abs((Number(k.time) || 0) - t) < 1e-4);
  const value = getEventDraftFromUI();
  if (existing) {
    existing.value = value;
    existing.interp = "stepped";
    setSingleTimelineSelection(EVENT_TRACK_ID, existing.id);
  } else {
    const nk = { id: `k_${Math.random().toString(36).slice(2, 10)}`, time: t, value, interp: "stepped" };
    keys.push(nk);
    setSingleTimelineSelection(EVENT_TRACK_ID, nk.id);
  }
  normalizeTrackKeys(anim, EVENT_TRACK_ID);
  setAnimTime(t);
  renderTimelineTracks();
  setStatus(`Event key saved @ ${t.toFixed(3)}s`);
}

function updateSelectedEventKeyFromUI() {
  const anim = getCurrentAnimation();
  const sk = state.anim.selectedKey;
  if (!anim || !sk || sk.trackId !== EVENT_TRACK_ID) return;
  const keys = getTrackKeys(anim, EVENT_TRACK_ID);
  const k = keys.find((it) => it.id === sk.keyId);
  if (!k) return;
  k.value = getEventDraftFromUI();
  renderTimelineTracks();
}

function deleteSelectedEventKey() {
  const anim = getCurrentAnimation();
  const sk = state.anim.selectedKey;
  if (!anim || !sk || sk.trackId !== EVENT_TRACK_ID) return false;
  const keys = getTrackKeys(anim, EVENT_TRACK_ID);
  const before = keys.length;
  anim.tracks[EVENT_TRACK_ID] = keys.filter((k) => k.id !== sk.keyId);
  if (anim.tracks[EVENT_TRACK_ID].length === before) return false;
  clearTimelineKeySelection();
  renderTimelineTracks();
  return true;
}

function lerpAngle(a, b, t) {
  let d = b - a;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return a + d * t;
}

function lerpArray(a, b, t) {
  const n = Math.min(Array.isArray(a) ? a.length : 0, Array.isArray(b) ? b.length : 0);
  const out = new Array(n);
  for (let i = 0; i < n; i += 1) {
    const av = Number(a[i]) || 0;
    const bv = Number(b[i]) || 0;
    out[i] = av + (bv - av) * t;
  }
  return out;
}

function evalBezier1D(u, p1, p2) {
  const omt = 1 - u;
  return 3 * omt * omt * u * p1 + 3 * omt * u * u * p2 + u * u * u;
}

function evalBezierEase(alpha, curve) {
  const c = Array.isArray(curve) && curve.length >= 4 ? curve : [0.25, 0.25, 0.75, 0.75];
  const x1 = math.clamp(Number(c[0]) || 0, 0, 1);
  const y1 = math.clamp(Number(c[1]) || 0, 0, 1);
  const x2 = math.clamp(Number(c[2]) || 1, 0, 1);
  const y2 = math.clamp(Number(c[3]) || 1, 0, 1);
  const x = math.clamp(alpha, 0, 1);
  let lo = 0;
  let hi = 1;
  let u = x;
  for (let i = 0; i < 18; i += 1) {
    const xu = evalBezier1D(u, x1, x2);
    if (Math.abs(xu - x) < 1e-5) break;
    if (xu > x) hi = u;
    else lo = u;
    u = (lo + hi) * 0.5;
  }
  return math.clamp(evalBezier1D(u, y1, y2), 0, 1);
}

function sampleTrackValueAtTime(keys, parsed, t) {
  if (!keys || keys.length === 0) return null;
  if (keys.length === 1 || t <= keys[0].time) return cloneTrackValue(keys[0].value);
  if (t >= keys[keys.length - 1].time) return cloneTrackValue(keys[keys.length - 1].value);
  let i1 = 1;
  while (i1 < keys.length && keys[i1].time < t) i1 += 1;
  const k0 = keys[i1 - 1];
  const k1 = keys[i1];
  const span = Math.max(1e-6, k1.time - k0.time);
  let alpha = (t - k0.time) / span;
  const interp = k0.interp || "linear";
  if (interp === "stepped") return cloneTrackValue(k0.value);
  if (interp === "bezier") alpha = evalBezierEase(alpha, k0.curve);
  if (parsed.type === "vertex") return lerpArray(k0.value, k1.value, alpha);
  if (parsed.type === "ik" && parsed.prop === "target") {
    return {
      x: (Number(k0.value && k0.value.x) || 0) + ((Number(k1.value && k1.value.x) || 0) - (Number(k0.value && k0.value.x) || 0)) * alpha,
      y: (Number(k0.value && k0.value.y) || 0) + ((Number(k1.value && k1.value.y) || 0) - (Number(k0.value && k0.value.y) || 0)) * alpha,
    };
  }
  if (parsed.type === "ik" && parsed.prop === "bend") return alpha < 0.5 ? k0.value : k1.value;
  if (parsed.type === "ik" && (parsed.prop === "compress" || parsed.prop === "stretch" || parsed.prop === "uniform")) {
    return alpha < 0.5 ? k0.value : k1.value;
  }
  if (parsed.type === "layer" && parsed.prop === "enabled") return alpha < 0.5 ? cloneTrackValue(k0.value) : cloneTrackValue(k1.value);
  if (parsed.type === "smparam") {
    const sm = ensureStateMachine();
    const param = getStateParamById(sm, parsed.paramId);
    if (param && param.type === "bool") return alpha < 0.5 ? cloneTrackValue(k0.value) : cloneTrackValue(k1.value);
  }
  if (parsed.type === "draworder") return alpha < 0.5 ? cloneTrackValue(k0.value) : cloneTrackValue(k1.value);
  if (parsed.type === "slot" && parsed.prop === "attachment") return alpha < 0.5 ? cloneTrackValue(k0.value) : cloneTrackValue(k1.value);
  if (parsed.type === "slot" && parsed.prop === "clip") return alpha < 0.5 ? cloneTrackValue(k0.value) : cloneTrackValue(k1.value);
  if (parsed.type === "slot" && parsed.prop === "clipSource") return alpha < 0.5 ? cloneTrackValue(k0.value) : cloneTrackValue(k1.value);
  if (parsed.type === "slot" && parsed.prop === "clipEnd") return alpha < 0.5 ? cloneTrackValue(k0.value) : cloneTrackValue(k1.value);
  if (parsed.type === "slot" && parsed.prop === "color") {
    const a0 = k0.value && typeof k0.value === "object" ? k0.value : {};
    const a1 = k1.value && typeof k1.value === "object" ? k1.value : {};
    const d0 = !!a0.darkEnabled;
    const d1 = !!a1.darkEnabled;
    return {
      r: (Number(a0.r) || 1) + ((Number(a1.r) || 1) - (Number(a0.r) || 1)) * alpha,
      g: (Number(a0.g) || 1) + ((Number(a1.g) || 1) - (Number(a0.g) || 1)) * alpha,
      b: (Number(a0.b) || 1) + ((Number(a1.b) || 1) - (Number(a0.b) || 1)) * alpha,
      a: (Number(a0.a) || 1) + ((Number(a1.a) || 1) - (Number(a0.a) || 1)) * alpha,
      darkEnabled: alpha < 0.5 ? d0 : d1,
      dr: (Number(a0.dr) || 0) + ((Number(a1.dr) || 0) - (Number(a0.dr) || 0)) * alpha,
      dg: (Number(a0.dg) || 0) + ((Number(a1.dg) || 0) - (Number(a0.dg) || 0)) * alpha,
      db: (Number(a0.db) || 0) + ((Number(a1.db) || 0) - (Number(a0.db) || 0)) * alpha,
    };
  }
  if (parsed.prop === "rotate") return lerpAngle(k0.value, k1.value, alpha);
  if (parsed.prop === "translate") {
    return { x: k0.value.x + (k1.value.x - k0.value.x) * alpha, y: k0.value.y + (k1.value.y - k0.value.y) * alpha };
  }
  return k0.value + (k1.value - k0.value) * alpha;
}

function sampleAnimationToModelAtTime(m, anim, t, opts = null) {
  if (!m || !anim) return;
  const options = opts && typeof opts === "object" ? opts : {};
  const applyLayerStateTracks = options.applyLayerStateTracks !== false;
  const applySlotTracks = options.applySlotTracks !== false;
  const applyStateParamTracks = options.applyStateParamTracks !== false;
  syncPoseFromRig(m);
  resetModelSlotOffsetsToBase(m);
  const tracks = anim.tracks;
  for (const trackId of Object.keys(tracks)) {
    if (!isTrackPlayable(trackId)) continue;
    const keys = tracks[trackId];
    if (!keys || keys.length === 0) continue;
    const parsed = parseTrackId(trackId);
    if (!parsed) continue;
    if (!applyLayerStateTracks && parsed.type === "layer") continue;
    if (!applySlotTracks && parsed.type === "slot") continue;
    if (!applyStateParamTracks && parsed.type === "smparam") continue;
    const sampled = sampleTrackValueAtTime(keys, parsed, t);
    setTrackValue(m, parsed, sampled);
  }
  for (let i = 0; i < m.poseBones.length; i += 1) {
    if (m.rigBones[i] && m.rigBones[i].poseLenEditable === false) {
      m.poseBones[i].length = m.rigBones[i].length;
    }
  }
  enforceConnectedHeads(m.poseBones);
}

function shortestAngleDelta(from, to) {
  let d = (Number(to) || 0) - (Number(from) || 0);
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

function isBoneAffectedByLayerMask(layer, boneIndex, bones) {
  if (!layer) return true;
  const mode = layer.maskMode || "all";
  if (mode === "all") return true;
  const set = new Set(Array.isArray(layer.maskBones) ? layer.maskBones : []);
  let hit = false;
  let curr = boneIndex;
  const visited = new Set();
  while (Number.isFinite(curr) && curr >= 0 && curr < bones.length && !visited.has(curr)) {
    visited.add(curr);
    if (set.has(curr)) {
      hit = true;
      break;
    }
    curr = Number(bones[curr] && bones[curr].parent);
  }
  return mode === "include" ? hit : !hit;
}

function blendBoneByMode(out, sampled, rig, alpha, mode) {
  const a = math.clamp(Number(alpha) || 0, 0, 1);
  if (!out || !sampled || a <= 0) return;
  if (mode === "add") {
    const base = rig || out;
    out.tx = (Number(out.tx) || 0) + ((Number(sampled.tx) || 0) - (Number(base.tx) || 0)) * a;
    out.ty = (Number(out.ty) || 0) + ((Number(sampled.ty) || 0) - (Number(base.ty) || 0)) * a;
    out.rot = (Number(out.rot) || 0) + shortestAngleDelta(base.rot, sampled.rot) * a;
    out.length = (Number(out.length) || 0) + ((Number(sampled.length) || 0) - (Number(base.length) || 0)) * a;
    out.sx = (Number(out.sx) || 0) + ((Number(sampled.sx) || 0) - (Number(base.sx) || 0)) * a;
    out.sy = (Number(out.sy) || 0) + ((Number(sampled.sy) || 0) - (Number(base.sy) || 0)) * a;
    out.shx = (Number(out.shx) || 0) + ((Number(sampled.shx) || 0) - (Number(base.shx) || 0)) * a;
    out.shy = (Number(out.shy) || 0) + ((Number(sampled.shy) || 0) - (Number(base.shy) || 0)) * a;
    return;
  }
  out.tx = (Number(out.tx) || 0) + ((Number(sampled.tx) || 0) - (Number(out.tx) || 0)) * a;
  out.ty = (Number(out.ty) || 0) + ((Number(sampled.ty) || 0) - (Number(out.ty) || 0)) * a;
  out.rot = lerpAngle(Number(out.rot) || 0, Number(sampled.rot) || 0, a);
  out.length = (Number(out.length) || 0) + ((Number(sampled.length) || 0) - (Number(out.length) || 0)) * a;
  out.sx = (Number(out.sx) || 0) + ((Number(sampled.sx) || 0) - (Number(out.sx) || 0)) * a;
  out.sy = (Number(out.sy) || 0) + ((Number(sampled.sy) || 0) - (Number(out.sy) || 0)) * a;
  out.shx = (Number(out.shx) || 0) + ((Number(sampled.shx) || 0) - (Number(out.shx) || 0)) * a;
  out.shy = (Number(out.shy) || 0) + ((Number(sampled.shy) || 0) - (Number(out.shy) || 0)) * a;
}

function wrapTime(t, duration) {
  const d = Math.max(0.001, Number(duration) || 0.001);
  let out = Number(t) || 0;
  out %= d;
  if (out < 0) out += d;
  return out;
}

function getLayerSampleTime(layer, anim, baseTime) {
  const dur = Math.max(0.001, Number(anim && anim.duration) || 0.001);
  const speed = Number(layer && layer.speed);
  const s = Number.isFinite(speed) ? math.clamp(speed, -10, 10) : 1;
  const offset = Number(layer && layer.offset) || 0;
  const raw = (Number(baseTime) || 0) * s + offset;
  if (layer && layer.loop !== false) return wrapTime(raw, dur);
  return math.clamp(raw, 0, dur);
}

function getPlaybackDurationForCurrentState(baseAnim) {
  let out = Math.max(0.1, Number(baseAnim && baseAnim.duration) || 0.1);
  for (const layer of ensureAnimLayerTracks()) {
    if (!layer || layer.enabled === false || layer.loop !== false) continue;
    const la = state.anim.animations.find((a) => a.id === layer.animId);
    if (!la) continue;
    const speed = Number(layer.speed);
    const absSpeed = Math.abs(Number.isFinite(speed) ? speed : 1);
    if (absSpeed < 1e-6) continue;
    const offset = Number(layer.offset) || 0;
    const doneTime = (Math.max(0, offset) + Math.max(0, Number(la.duration) || 0)) / absSpeed;
    out = Math.max(out, doneTime);
  }
  return Math.max(0.1, out);
}

function applyAnimationLayersToModelAtTime(m, baseAnim, t, opts = null) {
  if (!m || !baseAnim) return;
  const options = opts && typeof opts === "object" ? opts : {};
  const applyLayerStateTracks = options.applyLayerStateTracks !== false;
  sampleAnimationToModelAtTime(m, baseAnim, t, { applyLayerStateTracks });
  const layers = ensureAnimLayerTracks();
  if (!layers || layers.length === 0) return;
  const rig = cloneBones(m.rigBones || []);
  const bones = m.rigBones || [];
  const offsets = getActiveOffsets(m);
  for (const layer of layers) {
    if (!layer || layer.enabled === false) continue;
    const alpha = math.clamp(Number(layer.alpha) || 0, 0, 1);
    if (alpha <= 1e-6) continue;
    const anim = state.anim.animations.find((a) => a.id === layer.animId);
    if (!anim || anim.id === baseAnim.id) continue;
    const layerTime = getLayerSampleTime(layer, anim, t);
    const temp = {
      rigBones: cloneBones(m.rigBones),
      poseBones: cloneBones(m.rigBones),
      offsets: new Float32Array(offsets),
      baseOffsets: new Float32Array(offsets),
      ikConstraints: JSON.parse(JSON.stringify(m.ikConstraints || [])),
      transformConstraints: JSON.parse(JSON.stringify(m.transformConstraints || [])),
      pathConstraints: JSON.parse(JSON.stringify(m.pathConstraints || [])),
    };
    sampleAnimationToModelAtTime(temp, anim, layerTime, { applyLayerStateTracks: false, applySlotTracks: false, applyStateParamTracks: false });
    for (let i = 0; i < m.poseBones.length; i += 1) {
      if (!isBoneAffectedByLayerMask(layer, i, bones)) continue;
      blendBoneByMode(m.poseBones[i], temp.poseBones[i], rig[i], alpha, layer.mode || "replace");
    }
    if (layer.maskMode === "all") {
      if (state.slots.length > 0) {
        for (let si = 0; si < state.slots.length; si += 1) {
          const outOffsets = getModelSlotOffsets(m, si);
          const sampledOffsets = getModelSlotOffsets(temp, si);
          const slot = state.slots[si];
          const baseOffsets = slot && slot.meshData ? slot.meshData.baseOffsets : null;
          if (!outOffsets || !sampledOffsets || outOffsets.length !== sampledOffsets.length) continue;
          for (let i = 0; i < outOffsets.length; i += 1) {
            if ((layer.mode || "replace") === "add") {
              const base = Number(baseOffsets && baseOffsets[i]) || 0;
              outOffsets[i] = (Number(outOffsets[i]) || 0) + ((Number(sampledOffsets[i]) || 0) - base) * alpha;
            } else {
              outOffsets[i] = (Number(outOffsets[i]) || 0) + ((Number(sampledOffsets[i]) || 0) - (Number(outOffsets[i]) || 0)) * alpha;
            }
          }
        }
      } else if (m.offsets && temp.offsets && m.offsets.length === temp.offsets.length) {
        for (let i = 0; i < m.offsets.length; i += 1) {
          if ((layer.mode || "replace") === "add") {
            const base = Number(m.baseOffsets && m.baseOffsets[i]) || 0;
            m.offsets[i] = (Number(m.offsets[i]) || 0) + ((Number(temp.offsets[i]) || 0) - base) * alpha;
          } else {
            m.offsets[i] = (Number(m.offsets[i]) || 0) + ((Number(temp.offsets[i]) || 0) - (Number(m.offsets[i]) || 0)) * alpha;
          }
        }
      }
    }
  }
  enforceConnectedHeads(m.poseBones);
}

function samplePoseAtTime(m, t, opts = null) {
  const anim = getCurrentAnimation();
  if (!m || !anim) return;
  applyAnimationLayersToModelAtTime(m, anim, t, opts);
}

function blendTwoAnimationSamples(m, fromAnim, fromTime, toAnim, toTime, alpha) {
  if (!m || !fromAnim || !toAnim) return;
  const mixAlpha = math.clamp(alpha, 0, 1);
  const offsets = getActiveOffsets(m);
  const tempA = {
    rigBones: cloneBones(m.rigBones),
    poseBones: cloneBones(m.rigBones),
    offsets: new Float32Array(offsets),
    baseOffsets: new Float32Array(offsets),
    ikConstraints: JSON.parse(JSON.stringify(m.ikConstraints || [])),
    transformConstraints: JSON.parse(JSON.stringify(m.transformConstraints || [])),
    pathConstraints: JSON.parse(JSON.stringify(m.pathConstraints || [])),
  };
  const tempB = {
    rigBones: cloneBones(m.rigBones),
    poseBones: cloneBones(m.rigBones),
    offsets: new Float32Array(offsets),
    baseOffsets: new Float32Array(offsets),
    ikConstraints: JSON.parse(JSON.stringify(m.ikConstraints || [])),
    transformConstraints: JSON.parse(JSON.stringify(m.transformConstraints || [])),
    pathConstraints: JSON.parse(JSON.stringify(m.pathConstraints || [])),
  };
  sampleAnimationToModelAtTime(tempA, fromAnim, fromTime, { applyLayerStateTracks: false, applySlotTracks: false, applyStateParamTracks: false });
  sampleAnimationToModelAtTime(tempB, toAnim, toTime, { applyLayerStateTracks: false, applySlotTracks: false, applyStateParamTracks: false });

  const n = Math.min(m.poseBones.length, tempA.poseBones.length, tempB.poseBones.length);
  for (let i = 0; i < n; i += 1) {
    const out = m.poseBones[i];
    const a = tempA.poseBones[i];
    const b = tempB.poseBones[i];
    if (!out || !a || !b) continue;
    normalizeBoneChannels(out);
    out.tx = a.tx + (b.tx - a.tx) * mixAlpha;
    out.ty = a.ty + (b.ty - a.ty) * mixAlpha;
    out.rot = lerpAngle(a.rot, b.rot, mixAlpha);
    out.length = a.length + (b.length - a.length) * mixAlpha;
    out.sx = a.sx + (b.sx - a.sx) * mixAlpha;
    out.sy = a.sy + (b.sy - a.sy) * mixAlpha;
    out.shx = a.shx + (b.shx - a.shx) * mixAlpha;
    out.shy = a.shy + (b.shy - a.shy) * mixAlpha;
  }
  if (state.slots.length > 0) {
    for (let si = 0; si < state.slots.length; si += 1) {
      const outOffsets = getModelSlotOffsets(m, si);
      const aOffsets = getModelSlotOffsets(tempA, si);
      const bOffsets = getModelSlotOffsets(tempB, si);
      if (!outOffsets || !aOffsets || !bOffsets) continue;
      const n = Math.min(outOffsets.length, aOffsets.length, bOffsets.length);
      for (let i = 0; i < n; i += 1) {
        outOffsets[i] = aOffsets[i] + (bOffsets[i] - aOffsets[i]) * mixAlpha;
      }
    }
  } else if (m.offsets && tempA.offsets && tempB.offsets && m.offsets.length === tempA.offsets.length && m.offsets.length === tempB.offsets.length) {
    for (let i = 0; i < m.offsets.length; i += 1) {
      m.offsets[i] = tempA.offsets[i] + (tempB.offsets[i] - tempA.offsets[i]) * mixAlpha;
    }
  }
  const ikOut = ensureIKConstraints(m);
  const ikA = ensureIKConstraints(tempA);
  const ikB = ensureIKConstraints(tempB);
  const ikN = Math.min(ikOut.length, ikA.length, ikB.length);
  for (let i = 0; i < ikN; i += 1) {
    ikOut[i].mix = (Number(ikA[i].mix) || 0) + ((Number(ikB[i].mix) || 0) - (Number(ikA[i].mix) || 0)) * mixAlpha;
    ikOut[i].bendPositive = mixAlpha < 0.5 ? ikA[i].bendPositive !== false : ikB[i].bendPositive !== false;
    const ax = Number(ikA[i].targetX);
    const ay = Number(ikA[i].targetY);
    const bx = Number(ikB[i].targetX);
    const by = Number(ikB[i].targetY);
    if (Number.isFinite(ax) && Number.isFinite(bx)) ikOut[i].targetX = ax + (bx - ax) * mixAlpha;
    if (Number.isFinite(ay) && Number.isFinite(by)) ikOut[i].targetY = ay + (by - ay) * mixAlpha;
  }
  const tOut = ensureTransformConstraints(m);
  const tA = ensureTransformConstraints(tempA);
  const tB = ensureTransformConstraints(tempB);
  const tN = Math.min(tOut.length, tA.length, tB.length);
  for (let i = 0; i < tN; i += 1) {
    tOut[i].rotateMix = (Number(tA[i].rotateMix) || 0) + ((Number(tB[i].rotateMix) || 0) - (Number(tA[i].rotateMix) || 0)) * mixAlpha;
    tOut[i].translateMix =
      (Number(tA[i].translateMix) || 0) + ((Number(tB[i].translateMix) || 0) - (Number(tA[i].translateMix) || 0)) * mixAlpha;
    tOut[i].scaleMix = (Number(tA[i].scaleMix) || 0) + ((Number(tB[i].scaleMix) || 0) - (Number(tA[i].scaleMix) || 0)) * mixAlpha;
    tOut[i].shearMix = (Number(tA[i].shearMix) || 0) + ((Number(tB[i].shearMix) || 0) - (Number(tA[i].shearMix) || 0)) * mixAlpha;
  }
  const pOut = ensurePathConstraints(m);
  const pA = ensurePathConstraints(tempA);
  const pB = ensurePathConstraints(tempB);
  const pN = Math.min(pOut.length, pA.length, pB.length);
  for (let i = 0; i < pN; i += 1) {
    pOut[i].position = (Number(pA[i].position) || 0) + ((Number(pB[i].position) || 0) - (Number(pA[i].position) || 0)) * mixAlpha;
    pOut[i].spacing = (Number(pA[i].spacing) || 0) + ((Number(pB[i].spacing) || 0) - (Number(pA[i].spacing) || 0)) * mixAlpha;
    pOut[i].rotateMix = (Number(pA[i].rotateMix) || 0) + ((Number(pB[i].rotateMix) || 0) - (Number(pA[i].rotateMix) || 0)) * mixAlpha;
    pOut[i].translateMix =
      (Number(pA[i].translateMix) || 0) + ((Number(pB[i].translateMix) || 0) - (Number(pA[i].translateMix) || 0)) * mixAlpha;
  }
  enforceConnectedHeads(m.poseBones);
}

function updateAnimationPlayback(ts) {
  if (!state.anim.playing) {
    state.anim.lastTs = ts;
    updatePlaybackButtons();
    refreshAnimationMixUI();
    return;
  }
  const anim = getCurrentAnimation();
  if (!state.mesh || !anim) {
    state.anim.playing = false;
    updatePlaybackButtons();
    refreshAnimationMixUI();
    return;
  }
  const dt = state.anim.lastTs > 0 ? (ts - state.anim.lastTs) * 0.001 : 0;
  state.anim.lastTs = ts;

  if (state.anim.mix.active) {
    const fromAnim = state.anim.animations.find((a) => a.id === state.anim.mix.fromAnimId);
    const toAnim = state.anim.animations.find((a) => a.id === state.anim.mix.toAnimId);
    if (!fromAnim || !toAnim) {
      state.anim.mix.active = false;
      refreshAnimationMixUI();
      return;
    }
    const advanceTime = (curr, duration) => {
      const d = Math.max(0.1, Number(duration) || 0.1);
      let next = curr + dt;
      if (next > d) next = state.anim.loop ? 0 : d;
      return next;
    };
    const prevFrom = state.anim.mix.fromTime;
    const prevTo = state.anim.mix.toTime;
    state.anim.mix.fromTime = advanceTime(prevFrom, fromAnim.duration);
    state.anim.mix.toTime = advanceTime(prevTo, toAnim.duration);
    emitTimelineEventsBetween(fromAnim, prevFrom, state.anim.mix.fromTime, state.anim.mix.fromTime < prevFrom, "mix_from");
    emitTimelineEventsBetween(toAnim, prevTo, state.anim.mix.toTime, state.anim.mix.toTime < prevTo, "mix_to");
    state.anim.mix.elapsed += dt;
    const alpha = math.clamp(state.anim.mix.elapsed / Math.max(1e-6, state.anim.mix.duration), 0, 1);
    blendTwoAnimationSamples(state.mesh, fromAnim, state.anim.mix.fromTime, toAnim, state.anim.mix.toTime, alpha);
    setAnimTime(state.anim.mix.toTime);
    if (state.boneMode === "pose") updateBoneUI();
    if (alpha >= 1) {
      state.anim.mix.active = false;
      if (state.anim.stateMachine && state.anim.stateMachine.pendingStateId) {
        state.anim.stateMachine.currentStateId = String(state.anim.stateMachine.pendingStateId);
        state.anim.stateMachine.pendingStateId = "";
        refreshStateMachineUI();
      }
      setStatus(`Mix done: ${fromAnim.name} -> ${toAnim.name}`);
    }
    refreshAnimationMixUI();
    return;
  }

  const sm = ensureStateMachine();
  if (sm.enabled) {
    const smState = getCurrentStateMachineState();
    if (smState && smState.animId && smState.animId !== state.anim.currentAnimId) {
      transitionToState(smState.id, sm.pendingDuration || 0.2);
      refreshAnimationMixUI();
      return;
    }
  }

  let hasAnyKey = false;
  for (const k of Object.keys(anim.tracks)) {
    if (anim.tracks[k] && anim.tracks[k].length > 0) {
      hasAnyKey = true;
      break;
    }
  }
  if (!hasAnyKey) {
    const layers = ensureAnimLayerTracks();
    for (const layer of layers) {
      if (!layer || layer.enabled === false) continue;
      const la = state.anim.animations.find((a) => a.id === layer.animId);
      if (!la || !la.tracks) continue;
      if (Object.values(la.tracks).some((rows) => Array.isArray(rows) && rows.length > 0)) {
        hasAnyKey = true;
        break;
      }
    }
  }
  if (!hasAnyKey) {
    state.anim.playing = false;
    updatePlaybackButtons();
    refreshAnimationMixUI();
    return;
  }
  const prevTime = state.anim.time;
  const playbackDuration = getPlaybackDurationForCurrentState(anim);
  let next = prevTime + dt;
  let looped = false;
  let reachedEnd = false;
  if (next > playbackDuration) {
    if (state.anim.loop) next = 0;
    else {
      next = playbackDuration;
      state.anim.playing = false;
      updatePlaybackButtons();
      reachedEnd = true;
    }
    looped = state.anim.loop;
  }
  setAnimTime(next, playbackDuration);
  emitTimelineEventsBetween(anim, prevTime, next, next < prevTime, "play");
  for (const layer of ensureAnimLayerTracks()) {
    if (!layer || layer.enabled === false) continue;
    const la = state.anim.animations.find((a) => a.id === layer.animId);
    if (!la) continue;
    const prevLt = getLayerSampleTime(layer, la, prevTime);
    const nextLt = getLayerSampleTime(layer, la, next);
    const loopedLt = layer.loop !== false && nextLt < prevLt;
    emitTimelineEventsBetween(la, prevLt, nextLt, loopedLt, `layer:${layer.name || layer.id}`);
  }
  samplePoseAtTime(state.mesh, state.anim.time);
  if (state.boneMode === "pose") {
    updateBoneUI();
  }
  if (sm.enabled && tryRunAutoOrConditionalTransition({ looped, reachedEnd })) {
    refreshAnimationMixUI();
    return;
  }
  refreshAnimationMixUI();
}

function emitTimelineEventsBetween(anim, fromTime, toTime, looped = false, phase = "play") {
  if (!anim) return;
  const rows = getTrackKeys(anim, EVENT_TRACK_ID);
  if (!rows || rows.length === 0) return;
  const out = [];
  const t0 = Number(fromTime) || 0;
  const t1 = Number(toTime) || 0;
  for (const r of rows) {
    const tr = Number(r.time) || 0;
    if (!looped) {
      if (tr > t0 + 1e-6 && tr <= t1 + 1e-6) out.push(r);
    } else if (tr > t0 + 1e-6 || tr <= t1 + 1e-6) {
      out.push(r);
    }
  }
  if (out.length === 0) return;
  for (const r of out) {
    const v = r.value && typeof r.value === "object" ? r.value : {};
    const detail = {
      animationId: anim.id,
      animationName: anim.name,
      time: Number(r.time) || 0,
      name: String(v.name || "event"),
      int: Number(v.int) || 0,
      float: Number(v.float) || 0,
      string: v.string != null ? String(v.string) : "",
      phase,
    };
    window.dispatchEvent(new CustomEvent("timeline-event", { detail }));
  }
  const last = out[out.length - 1];
  const lv = last.value && typeof last.value === "object" ? last.value : {};
  setStatus(`Event: ${(lv.name || "event").toString()} @ ${(Number(last.time) || 0).toFixed(3)}s`);
}

els.fileInput.addEventListener("change", async (e) => {
  const files = Array.from(e.target.files || []);
  if (files.length === 0) return;
  try {
    const hadProject = !!state.mesh;
    const hadSlots = state.slots.length > 0;
    let added = 0;
    let importedPsd = false;
    for (const file of files) {
      if (file.name.toLowerCase().endsWith(".psd")) importedPsd = true;
      const slots = await loadFileSlots(file);
      for (const s of slots) {
        const wasEmpty = state.slots.length === 0;
        addSlotEntry(s, true);
        added += 1;
        if (wasEmpty) {
          const first = state.slots[state.activeSlot];
          state.sourceCanvas = first.canvas;
          state.imageWidth = Number.isFinite(first.docWidth) ? first.docWidth : first.canvas.width;
          state.imageHeight = Number.isFinite(first.docHeight) ? first.docHeight : first.canvas.height;
          updateTexture();
          rebuildMesh();
        }
      }
    }
    if (state.mesh) {
      ensureSlotsHaveBoneBinding();
      if (importedPsd) state.slotViewMode = "all";
      updateBoneUI();
    }
    if (state.activeSlot >= 0) {
      setActiveSlot(state.activeSlot);
    }
    const modeText = hadProject || hadSlots ? "Added" : "Imported";
    setStatus(`${modeText} ${added} slot(s). Current slot: ${state.slots[state.activeSlot]?.name || "-"}`);
  } catch (err) {
    console.error(err);
    setStatus(`Import failed: ${err.message}`);
  } finally {
    e.target.value = "";
  }
});

if (els.boneTree) {
  els.boneTree.addEventListener("click", (ev) => {
    if (state.boneTreeMenuOpen) closeBoneTreeContextMenu();
    if (ev.target.closest(".tree-rename-input")) return;
    const foldBtn = ev.target.closest(".tree-bone-slot-toggle[data-bone-slot-toggle]");
    if (foldBtn) {
      state.treeSlotLastClickIndex = -1;
      state.treeSlotLastClickTs = 0;
      state.treeBoneLastClickIndex = -1;
      state.treeBoneLastClickTs = 0;
      const bi = Number(foldBtn.dataset.boneSlotToggle);
      if (Number.isFinite(bi) && bi >= 0) {
        state.boneTreeSlotCollapse[bi] = !state.boneTreeSlotCollapse[bi];
        renderBoneTree();
      }
      return;
    }
    const childFoldBtn = ev.target.closest(".tree-bone-child-toggle[data-bone-child-toggle]");
    if (childFoldBtn) {
      state.treeSlotLastClickIndex = -1;
      state.treeSlotLastClickTs = 0;
      state.treeBoneLastClickIndex = -1;
      state.treeBoneLastClickTs = 0;
      const bi = Number(childFoldBtn.dataset.boneChildToggle);
      if (Number.isFinite(bi) && bi >= 0) {
        state.boneTreeChildCollapse[bi] = !state.boneTreeChildCollapse[bi];
        renderBoneTree();
      }
      return;
    }
    const eyeBtn = ev.target.closest(".slot-eye[data-slot-eye]");
    if (eyeBtn) {
      state.treeSlotLastClickIndex = -1;
      state.treeSlotLastClickTs = 0;
      state.treeBoneLastClickIndex = -1;
      state.treeBoneLastClickTs = 0;
      const si = Number(eyeBtn.dataset.slotEye);
      if (Number.isFinite(si) && state.slots[si]) {
        const slot = state.slots[si];
        slot.editorVisible = !isSlotEditorVisible(slot);
        renderBoneTree();
        refreshSlotUI();
      }
      return;
    }
    const slotItem = ev.target.closest(".tree-item[data-slot-index]");
    if (slotItem) {
      const si = Number(slotItem.dataset.slotIndex);
      if (!Number.isFinite(si) || si < 0 || si >= state.slots.length) return;
      const now = (window.performance && typeof window.performance.now === "function" ? window.performance.now() : Date.now());
      const isDoubleClick = state.treeSlotLastClickIndex === si && now - Number(state.treeSlotLastClickTs || 0) <= 340;
      state.treeSlotLastClickIndex = si;
      state.treeSlotLastClickTs = now;
      state.treeBoneLastClickIndex = -1;
      state.treeBoneLastClickTs = 0;
      if (state.activeSlot !== si) {
        setActiveSlot(si);
        setStatus(`Switched to slot: ${state.slots[si].name}`);
      } else {
        setRightPropsFocus("slot");
      }
      if (isDoubleClick) {
        state.treeSlotLastClickIndex = -1;
        state.treeSlotLastClickTs = 0;
        state.treeBoneLastClickIndex = -1;
        state.treeBoneLastClickTs = 0;
        renameSlotByIndexFromTree(si);
      }
      return;
    }
    state.treeSlotLastClickIndex = -1;
    state.treeSlotLastClickTs = 0;
    const item = ev.target.closest(".tree-item[data-bone-index]");
    if (!item || !state.mesh) return;
    const i = Number(item.dataset.boneIndex);
    if (!Number.isFinite(i)) return;
    const now = (window.performance && typeof window.performance.now === "function" ? window.performance.now() : Date.now());
    const isDoubleClick = state.treeBoneLastClickIndex === i && now - Number(state.treeBoneLastClickTs || 0) <= 340;
    state.treeBoneLastClickIndex = i;
    state.treeBoneLastClickTs = now;
    if (ev.ctrlKey || ev.metaKey) {
      state.treeBoneLastClickIndex = -1;
      state.treeBoneLastClickTs = 0;
      const set = new Set(getSelectedBonesForWeight(state.mesh));
      if (set.has(i)) set.delete(i);
      else set.add(i);
      state.selectedBonesForWeight = [...set];
      state.selectedBone = i;
      setRightPropsFocus("bone");
      updateBoneUI();
      setStatus(`Weight bone selection: ${state.selectedBonesForWeight.join(", ") || "(none)"}`);
      return;
    }
    state.selectedBone = i;
    state.selectedBonesForWeight = [i];
    setRightPropsFocus("bone");
    updateBoneUI();
    if (isDoubleClick) {
      state.treeBoneLastClickIndex = -1;
      state.treeBoneLastClickTs = 0;
      startBoneTreeInlineRename("bone", i);
    }
  });

  els.boneTree.addEventListener("contextmenu", (ev) => {
    ev.preventDefault();
    const slotItem = ev.target.closest(".tree-item[data-slot-index]");
    if (slotItem) {
      const si = Number(slotItem.dataset.slotIndex);
      if (Number.isFinite(si) && si >= 0 && si < state.slots.length) {
        setActiveSlot(si);
        setRightPropsFocus("slot");
      }
    } else {
      const boneItem = ev.target.closest(".tree-item[data-bone-index]");
      if (boneItem && state.mesh) {
        const bi = Number(boneItem.dataset.boneIndex);
        if (Number.isFinite(bi) && bi >= 0) {
          state.selectedBone = bi;
          state.selectedBonesForWeight = [bi];
          setRightPropsFocus("bone");
          updateBoneUI();
        }
      }
    }
    openBoneTreeContextMenu(ev.clientX, ev.clientY);
  });

  els.boneTree.addEventListener("dragstart", (ev) => {
    state.treeSlotLastClickIndex = -1;
    state.treeSlotLastClickTs = 0;
    const slotItem = ev.target.closest(".tree-item[data-slot-index]");
    if (!slotItem) {
      ev.preventDefault();
      return;
    }
    const si = Number(slotItem.dataset.slotIndex);
    if (!Number.isFinite(si) || si < 0 || si >= state.slots.length) {
      ev.preventDefault();
      return;
    }
    state.treeSlotDrag = { slotIndex: si };
    slotItem.classList.add("dragging");
    if (ev.dataTransfer) {
      ev.dataTransfer.effectAllowed = "move";
      ev.dataTransfer.setData("text/plain", String(si));
    }
  });

  els.boneTree.addEventListener("dragover", (ev) => {
    if (!state.treeSlotDrag) return;
    const slotItem = ev.target.closest(".tree-item[data-slot-index]");
    if (slotItem) {
      const ti = Number(slotItem.dataset.slotIndex);
      if (!Number.isFinite(ti) || ti < 0 || ti >= state.slots.length) return;
      const rect = slotItem.getBoundingClientRect();
      const placeAfter = ev.clientY >= rect.top + rect.height * 0.5;
      ev.preventDefault();
      if (ev.dataTransfer) ev.dataTransfer.dropEffect = "move";
      setBoneTreeSlotDropIndicator(ti, placeAfter);
      return;
    }
    const boneItem = ev.target.closest(".tree-item[data-bone-index]");
    if (!boneItem) {
      clearBoneTreeDropIndicators();
      return;
    }
    const bi = Number(boneItem.dataset.boneIndex);
    if (!Number.isFinite(bi) || bi < 0) return;
    ev.preventDefault();
    if (ev.dataTransfer) ev.dataTransfer.dropEffect = "move";
    setBoneTreeDropIndicator(bi);
  });

  els.boneTree.addEventListener("drop", (ev) => {
    if (!state.treeSlotDrag) return;
    const slotItem = ev.target.closest(".tree-item[data-slot-index]");
    clearBoneTreeDropIndicators();
    const si = Number(state.treeSlotDrag.slotIndex);
    if (!Number.isFinite(si) || si < 0 || si >= state.slots.length) return;

    if (slotItem) {
      const ti = Number(slotItem.dataset.slotIndex);
      if (!Number.isFinite(ti) || ti < 0 || ti >= state.slots.length) return;
      ev.preventDefault();
      const rect = slotItem.getBoundingClientRect();
      const placeAfter = ev.clientY >= rect.top + rect.height * 0.5;
      const sourceSlot = state.slots[si];
      const targetSlot = state.slots[ti];
      if (!sourceSlot || !targetSlot) return;
      const targetBone = Number(targetSlot.bone);
      let boneChanged = false;
      if (
        state.mesh &&
        Number.isFinite(targetBone) &&
        targetBone >= 0 &&
        sourceSlot.bone !== targetBone
      ) {
        boneChanged = applySlotBoneAssignment(sourceSlot, targetBone, state.mesh);
      }
      const movedIndex = moveSlotToIndex(si, ti + (placeAfter ? 1 : 0));
      const orderChanged = movedIndex !== si;
      if (!boneChanged && !orderChanged) return;
      setActiveSlot(orderChanged ? movedIndex : si);
      if (orderChanged) markDirtyDrawOrder();
      pushUndoCheckpoint(true);
      const slotLabel = state.slots[state.activeSlot] && state.slots[state.activeSlot].name ? state.slots[state.activeSlot].name : "slot";
      if (boneChanged && orderChanged) {
        setStatus(`Slot "${slotLabel}" moved and assigned to bone ${targetBone}.`);
      } else if (boneChanged) {
        setStatus(`Slot "${slotLabel}" assigned to bone ${targetBone}.`);
      } else {
        setStatus(`Slot "${slotLabel}" order moved.`);
      }
      return;
    }

    const boneItem = ev.target.closest(".tree-item[data-bone-index]");
    if (!boneItem) return;
    const bi = Number(boneItem.dataset.boneIndex);
    if (!Number.isFinite(bi)) return;
    ev.preventDefault();
    const ok = assignSlotToBone(si, bi);
    if (!ok) return;
    setActiveSlot(si);
    pushUndoCheckpoint(true);
    setStatus(`Slot "${state.slots[si] ? state.slots[si].name : si}" assigned to bone ${bi}.`);
  });

  els.boneTree.addEventListener("dragend", () => {
    clearBoneTreeDropIndicators();
    for (const row of els.boneTree.querySelectorAll(".tree-item.tree-slot.dragging")) {
      row.classList.remove("dragging");
    }
    state.treeSlotDrag = null;
  });
}

if (els.boneTreeContextMenu) {
  els.boneTreeContextMenu.addEventListener("contextmenu", (ev) => {
    ev.preventDefault();
  });
}

document.addEventListener("pointerdown", (ev) => {
  if (!state.boneTreeMenuOpen) return;
  const target = ev.target;
  if (!(target instanceof Element)) {
    closeBoneTreeContextMenu();
    return;
  }
  if (target.closest("#boneTreeContextMenu")) return;
  closeBoneTreeContextMenu();
});

window.addEventListener("blur", () => {
  if (!state.boneTreeMenuOpen) return;
  closeBoneTreeContextMenu();
});

if (els.fileOpenBtn) {
  els.fileOpenBtn.addEventListener("click", () => {
    els.fileInput.click();
  });
}

if (els.slotSelect) {
  els.slotSelect.addEventListener("change", () => {
    const i = Number(els.slotSelect.value);
    if (!Number.isFinite(i)) return;
    setActiveSlot(i);
    setStatus(`Switched to slot: ${state.slots[i]?.name || i}`);
  });
}

if (els.slotViewMode) {
  els.slotViewMode.addEventListener("change", () => {
    state.slotViewMode = els.slotViewMode.value === "all" ? "all" : "single";
    refreshSlotUI();
    renderBoneTree();
    setStatus(state.slotViewMode === "all" ? "Slot view: all visible." : "Slot view: single slot.");
  });
}

if (els.boneTreeOnlyActiveSlotBtn) {
  els.boneTreeOnlyActiveSlotBtn.addEventListener("click", () => {
    state.boneTreeOnlyActiveSlot = !state.boneTreeOnlyActiveSlot;
    renderBoneTree();
    setStatus(state.boneTreeOnlyActiveSlot ? "Bone tree: showing active slot only." : "Bone tree: showing all slots.");
  });
}

if (els.spineCompat) {
  els.spineCompat.addEventListener("change", () => {
    const compat = getSpineCompatPreset(els.spineCompat.value);
    state.export.spineCompat = compat.id;
    setStatus(`Spine export compatibility: ${compat.version}`);
  });
}

if (els.viewZoomOutBtn) {
  els.viewZoomOutBtn.addEventListener("click", () => {
    const sx = Math.max(1, Number(els.overlay.width) || 1) * 0.5;
    const sy = Math.max(1, Number(els.overlay.height) || 1) * 0.5;
    zoomViewBy(1 / 1.15, sx, sy);
  });
}
if (els.viewZoomInBtn) {
  els.viewZoomInBtn.addEventListener("click", () => {
    const sx = Math.max(1, Number(els.overlay.width) || 1) * 0.5;
    const sy = Math.max(1, Number(els.overlay.height) || 1) * 0.5;
    zoomViewBy(1.15, sx, sy);
  });
}
if (els.viewZoomResetBtn) {
  els.viewZoomResetBtn.addEventListener("click", () => {
    resetViewToFit();
  });
}

if (els.slotName) {
  els.slotName.addEventListener("input", () => {
    const s = getActiveSlot();
    if (!s) return;
    s.name = els.slotName.value.trim() || `slot_${state.activeSlot}`;
    refreshSlotUI();
    renderBoneTree();
  });
}

if (els.slotBone) {
  els.slotBone.addEventListener("change", () => {
    const s = getActiveSlot();
    if (!s) return;
    const bone = Number(els.slotBone.value);
    s.bone = Number.isFinite(bone) ? bone : -1;
    if (!Number.isFinite(s.bone) || s.bone < 0) {
      ensureSlotsHaveBoneBinding();
    }
    if (state.mesh) {
      if (getSlotWeightMode(s) === "single") {
        s.weightBindMode = "single";
        s.influenceBones = Number.isFinite(s.bone) && s.bone >= 0 ? [s.bone] : [];
      } else if (!Array.isArray(s.influenceBones) || s.influenceBones.length === 0) {
        s.influenceBones = Number.isFinite(s.bone) && s.bone >= 0 ? [s.bone] : getSlotInfluenceBones(s, state.mesh);
      }
      rebuildSlotWeights(s, state.mesh);
    }
    refreshSlotUI();
    renderBoneTree();
  });
}

if (els.slotVisible) {
  els.slotVisible.addEventListener("change", () => {
    const s = getActiveSlot();
    if (!s) return;
    s.editorVisible = !!els.slotVisible.checked;
    refreshSlotUI();
    renderBoneTree();
  });
}

if (els.slotClipEnabled) {
  els.slotClipEnabled.addEventListener("change", () => {
    const s = getActiveSlot();
    if (!s) return;
    s.clipEnabled = !!els.slotClipEnabled.checked;
    ensureSlotClipState(s);
    markDirtyBySlotProp(state.activeSlot, "clip");
    refreshSlotUI();
    setStatus(s.clipEnabled ? "Slot clipping enabled." : "Slot clipping disabled.");
  });
}
if (els.slotClipSource) {
  els.slotClipSource.addEventListener("change", () => {
    const s = getActiveSlot();
    if (!s) return;
    s.clipSource = els.slotClipSource.value === "contour" ? "contour" : "fill";
    ensureSlotClipState(s);
    markDirtyBySlotProp(state.activeSlot, "clipSource");
    refreshSlotUI();
  });
}
if (els.slotClipEnd) {
  els.slotClipEnd.addEventListener("change", () => {
    const s = getActiveSlot();
    if (!s) return;
    const v = String(els.slotClipEnd.value || "").trim();
    s.clipEndSlotId = v ? v : null;
    ensureSlotClipState(s);
    markDirtyBySlotProp(state.activeSlot, "clipEnd");
    refreshSlotUI();
  });
}
if (els.slotClipSetKeyBtn) {
  els.slotClipSetKeyBtn.addEventListener("click", () => {
    if (!state.mesh || state.activeSlot < 0) return;
    const trackId = getSlotTrackId(state.activeSlot, "clip");
    state.anim.selectedTrack = trackId;
    if (els.trackSelect) els.trackSelect.value = trackId;
    addOrUpdateKeyframeForTrack(trackId);
  });
}
if (els.slotClipSourceSetKeyBtn) {
  els.slotClipSourceSetKeyBtn.addEventListener("click", () => {
    if (!state.mesh || state.activeSlot < 0) return;
    const trackId = getSlotTrackId(state.activeSlot, "clipSource");
    state.anim.selectedTrack = trackId;
    if (els.trackSelect) els.trackSelect.value = trackId;
    addOrUpdateKeyframeForTrack(trackId);
  });
}
if (els.slotClipComboSetKeyBtn) {
  els.slotClipComboSetKeyBtn.addEventListener("click", () => {
    addOrUpdateClipBundleKeyForActiveSlot();
  });
}
if (els.slotClipSourceDelKeyBtn) {
  els.slotClipSourceDelKeyBtn.addEventListener("click", () => {
    if (!state.mesh || state.activeSlot < 0) return;
    const trackId = getSlotTrackId(state.activeSlot, "clipSource");
    if (deleteKeyframeAtCurrentTimeForTrack(trackId)) {
      setStatus(`Clip source key deleted @ ${state.anim.time.toFixed(2)}s`);
    } else {
      setStatus("No clip source key at current time.");
    }
  });
}
if (els.slotClipDelKeyBtn) {
  els.slotClipDelKeyBtn.addEventListener("click", () => {
    if (!state.mesh || state.activeSlot < 0) return;
    const trackId = getSlotTrackId(state.activeSlot, "clip");
    if (deleteKeyframeAtCurrentTimeForTrack(trackId)) {
      setStatus(`Clip key deleted @ ${state.anim.time.toFixed(2)}s`);
    } else {
      setStatus("No clip key at current time.");
    }
  });
}
if (els.slotClipEndSetKeyBtn) {
  els.slotClipEndSetKeyBtn.addEventListener("click", () => {
    if (!state.mesh || state.activeSlot < 0) return;
    const trackId = getSlotTrackId(state.activeSlot, "clipEnd");
    state.anim.selectedTrack = trackId;
    if (els.trackSelect) els.trackSelect.value = trackId;
    addOrUpdateKeyframeForTrack(trackId);
  });
}
if (els.slotClipEndDelKeyBtn) {
  els.slotClipEndDelKeyBtn.addEventListener("click", () => {
    if (!state.mesh || state.activeSlot < 0) return;
    const trackId = getSlotTrackId(state.activeSlot, "clipEnd");
    if (deleteKeyframeAtCurrentTimeForTrack(trackId)) {
      setStatus(`Clip end key deleted @ ${state.anim.time.toFixed(2)}s`);
    } else {
      setStatus("No clip end key at current time.");
    }
  });
}

function applyActiveSlotAttachmentMetaFromUI() {
  const s = getActiveSlot();
  if (!s) return false;
  const current = getSlotCurrentAttachmentName(s);
  if (!current) return false;
  const att = getSlotAttachmentEntry(s, current);
  if (!att) return false;
  att.type = normalizeAttachmentType(els.slotAttachmentType ? els.slotAttachmentType.value : att.type);
  att.linkedParent = String(els.slotAttachmentLinkedParent ? els.slotAttachmentLinkedParent.value || "" : att.linkedParent || "");
  att.pointX = Number(els.slotAttachmentPointX ? els.slotAttachmentPointX.value : att.pointX) || 0;
  att.pointY = Number(els.slotAttachmentPointY ? els.slotAttachmentPointY.value : att.pointY) || 0;
  att.pointRot = Number(els.slotAttachmentPointRot ? els.slotAttachmentPointRot.value : att.pointRot) || 0;
  att.bboxSource = els.slotAttachmentBBoxSource && els.slotAttachmentBBoxSource.value === "contour" ? "contour" : "fill";
  const seqEnabled = !!(els.slotAttachmentSequenceEnabled && els.slotAttachmentSequenceEnabled.checked);
  const seqCount = Math.max(1, Math.round(Number(els.slotAttachmentSequenceCount ? els.slotAttachmentSequenceCount.value : 1) || 1));
  const seqStart = Math.max(0, Math.round(Number(els.slotAttachmentSequenceStart ? els.slotAttachmentSequenceStart.value : 0) || 0));
  const seqDigits = Math.max(1, Math.round(Number(els.slotAttachmentSequenceDigits ? els.slotAttachmentSequenceDigits.value : 2) || 2));
  att.sequence = { enabled: seqEnabled, count: seqCount, start: seqStart, digits: seqDigits };
  refreshSlotUI();
  renderBoneTree();
  return true;
}

if (els.slotAttachment) {
  els.slotAttachment.addEventListener("change", () => {
    const s = getActiveSlot();
    if (!s) return;
    ensureSlotAttachments(s);
    const v = String(els.slotAttachment.value || "__none__");
    if (v === "__none__") {
      s.activeAttachment = null;
    } else {
      s.activeAttachment = v;
      const att = getSlotAttachmentEntry(s, v);
      if (att && att.canvas) {
        s.canvas = att.canvas;
        if (att.placeholder) s.placeholderName = String(att.placeholder);
        // Keep setup attachment stable; selection here is for editing/preview.
        if (!getSlotAttachmentEntry(s, s.attachmentName)) {
          s.attachmentName = att.name;
        }
      }
    }
    ensureSlotAttachmentState(s);
    markDirtyBySlotProp(state.activeSlot, "attachment");
    refreshSlotUI();
    renderBoneTree();
  });
}
if (els.slotPlaceholderName) {
  const applySlotPlaceholder = () => {
    const s = getActiveSlot();
    if (!s) return;
    const raw = String((els.slotPlaceholderName && els.slotPlaceholderName.value) || "").trim();
    const ph = raw || "main";
    s.placeholderName = ph;
    refreshSlotUI();
  };
  els.slotPlaceholderName.addEventListener("change", applySlotPlaceholder);
  els.slotPlaceholderName.addEventListener("keydown", (ev) => {
    if (ev.key !== "Enter") return;
    ev.preventDefault();
    applySlotPlaceholder();
  });
}
if (els.slotAttachmentPlaceholderName) {
  const applyAttachmentPlaceholder = () => {
    const s = getActiveSlot();
    if (!s) return;
    const current = getSlotCurrentAttachmentName(s);
    if (!current) return;
    const att = getSlotAttachmentEntry(s, current);
    if (!att) return;
    const raw = String((els.slotAttachmentPlaceholderName && els.slotAttachmentPlaceholderName.value) || "").trim();
    att.placeholder = raw || "main";
    if (s.activeAttachment === current) s.placeholderName = String(att.placeholder);
    refreshSlotUI();
  };
  els.slotAttachmentPlaceholderName.addEventListener("change", applyAttachmentPlaceholder);
  els.slotAttachmentPlaceholderName.addEventListener("keydown", (ev) => {
    if (ev.key !== "Enter") return;
    ev.preventDefault();
    applyAttachmentPlaceholder();
  });
}
if (els.slotAttachmentName) {
  const applyName = () => {
    if (!getActiveSlot()) return;
    renameActiveAttachmentInSlot();
  };
  els.slotAttachmentName.addEventListener("change", applyName);
  els.slotAttachmentName.addEventListener("keydown", (ev) => {
    if (ev.key !== "Enter") return;
    ev.preventDefault();
    applyName();
  });
}
if (els.slotAttachmentType) {
  els.slotAttachmentType.addEventListener("change", applyActiveSlotAttachmentMetaFromUI);
}
if (els.slotAttachmentLinkedParent) {
  els.slotAttachmentLinkedParent.addEventListener("change", applyActiveSlotAttachmentMetaFromUI);
}
if (els.slotAttachmentPointX) {
  els.slotAttachmentPointX.addEventListener("input", applyActiveSlotAttachmentMetaFromUI);
}
if (els.slotAttachmentPointY) {
  els.slotAttachmentPointY.addEventListener("input", applyActiveSlotAttachmentMetaFromUI);
}
if (els.slotAttachmentPointRot) {
  els.slotAttachmentPointRot.addEventListener("input", applyActiveSlotAttachmentMetaFromUI);
}
if (els.slotAttachmentBBoxSource) {
  els.slotAttachmentBBoxSource.addEventListener("change", applyActiveSlotAttachmentMetaFromUI);
}
if (els.slotAttachmentSequenceEnabled) {
  els.slotAttachmentSequenceEnabled.addEventListener("change", applyActiveSlotAttachmentMetaFromUI);
}
if (els.slotAttachmentSequenceCount) {
  els.slotAttachmentSequenceCount.addEventListener("input", applyActiveSlotAttachmentMetaFromUI);
}
if (els.slotAttachmentSequenceStart) {
  els.slotAttachmentSequenceStart.addEventListener("input", applyActiveSlotAttachmentMetaFromUI);
}
if (els.slotAttachmentSequenceDigits) {
  els.slotAttachmentSequenceDigits.addEventListener("input", applyActiveSlotAttachmentMetaFromUI);
}

function cloneCanvas(src) {
  if (!src) return null;
  const c = makeCanvas(src.width, src.height);
  const cx = c.getContext("2d");
  if (!cx) return null;
  cx.drawImage(src, 0, 0);
  return c;
}

function makeUniqueAttachmentName(slot, base = "attachment") {
  const list = ensureSlotAttachments(slot);
  const used = new Set(list.map((a) => a.name));
  let stem = String(base || "attachment").trim() || "attachment";
  if (!used.has(stem)) return stem;
  let i = 2;
  let next = `${stem}_${i}`;
  while (used.has(next)) {
    i += 1;
    next = `${stem}_${i}`;
  }
  return next;
}

function addAttachmentToActiveSlot() {
  const s = getActiveSlot();
  if (!s) return false;
  const base = getSlotCurrentAttachmentName(s) || s.attachmentName || "attachment";
  const name = makeUniqueAttachmentName(s, base);
  const srcCanvas = s.canvas || (ensureSlotAttachments(s)[0] && ensureSlotAttachments(s)[0].canvas);
  const cloned = cloneCanvas(srcCanvas);
  if (!cloned) return false;
  ensureSlotAttachments(s).push(
    normalizeSlotAttachmentRecord(s, { name, placeholder: String(s.placeholderName || s.attachmentName || "main"), canvas: cloned }, name, String(s.placeholderName || s.attachmentName || "main"), cloned)
  );
  s.activeAttachment = name;
  s.canvas = cloned;
  ensureSlotAttachmentState(s);
  refreshSlotUI();
  renderBoneTree();
  if (els.slotAttachmentName) {
    els.slotAttachmentName.focus();
    els.slotAttachmentName.select();
  }
  setStatus(`Attachment added: ${name}`);
  return true;
}

function renameActiveAttachmentInSlot() {
  const s = getActiveSlot();
  if (!s) return false;
  const current = getSlotCurrentAttachmentName(s);
  if (!current) return false;
  const rawNext = String((els.slotAttachmentName && els.slotAttachmentName.value) || "").trim();
  if (!rawNext || rawNext === current) return false;
  const used = new Set(ensureSlotAttachments(s).map((a) => a.name).filter((n) => n !== current));
  let nextName = rawNext;
  if (used.has(nextName)) {
    let i = 2;
    let cand = `${rawNext}_${i}`;
    while (used.has(cand)) {
      i += 1;
      cand = `${rawNext}_${i}`;
    }
    nextName = cand;
  }
  const att = getSlotAttachmentEntry(s, current);
  if (!att) return false;
  att.name = nextName;
  if (s.attachmentName === current) s.attachmentName = nextName;
  if (s.activeAttachment === current) s.activeAttachment = nextName;
  if (s.id) {
    for (const skin of ensureSkinSets()) {
      if (!skin || !skin.slotAttachments || typeof skin.slotAttachments !== "object") continue;
      if (skin.slotAttachments[s.id] === current) skin.slotAttachments[s.id] = nextName;
    }
  }
  const anim = getCurrentAnimation();
  if (anim && anim.tracks) {
    for (const trackId of Object.keys(anim.tracks)) {
      const p = parseTrackId(trackId);
      if (!p || p.type !== "slot" || p.prop !== "attachment" || p.slotIndex !== state.activeSlot) continue;
      const keys = getTrackKeys(anim, trackId);
      for (const k of keys) {
        if (k && typeof k.value === "string" && k.value === current) k.value = nextName;
      }
      normalizeTrackKeys(anim, trackId);
    }
  }
  refreshSlotUI();
  renderTimelineTracks();
  setStatus(`Attachment renamed: ${current} -> ${nextName}`);
  return true;
}

function deleteActiveAttachmentInSlot() {
  const s = getActiveSlot();
  if (!s) return false;
  const current = getSlotCurrentAttachmentName(s);
  if (!current) return false;
  const list = ensureSlotAttachments(s);
  if (list.length <= 1) {
    setStatus("Keep at least one attachment.");
    return false;
  }
  const idx = list.findIndex((a) => a.name === current);
  if (idx < 0) return false;
  list.splice(idx, 1);
  const next = list[Math.max(0, Math.min(idx, list.length - 1))];
  s.activeAttachment = next ? next.name : null;
  if (s.attachmentName === current) s.attachmentName = next ? next.name : "main";
  if (next && next.canvas) s.canvas = next.canvas;
  if (s.id) {
    for (const skin of ensureSkinSets()) {
      if (!skin || !skin.slotAttachments || typeof skin.slotAttachments !== "object") continue;
      if (skin.slotAttachments[s.id] === current) {
        skin.slotAttachments[s.id] = next ? next.name : null;
      }
    }
  }
  const anim = getCurrentAnimation();
  if (anim && anim.tracks) {
    for (const trackId of Object.keys(anim.tracks)) {
      const p = parseTrackId(trackId);
      if (!p || p.type !== "slot" || p.prop !== "attachment" || p.slotIndex !== state.activeSlot) continue;
      const keys = getTrackKeys(anim, trackId);
      for (const k of keys) {
        if (k && typeof k.value === "string" && k.value === current) k.value = null;
      }
      normalizeTrackKeys(anim, trackId);
    }
  }
  refreshSlotUI();
  renderTimelineTracks();
  setStatus(`Attachment deleted: ${current}`);
  return true;
}

if (els.slotAttachmentAddBtn) {
  els.slotAttachmentAddBtn.addEventListener("click", () => {
    addAttachmentToActiveSlot();
  });
}
if (els.slotAttachmentRenameBtn) {
  els.slotAttachmentRenameBtn.addEventListener("click", () => {
    renameActiveAttachmentInSlot();
  });
}
if (els.slotAttachmentDeleteBtn) {
  els.slotAttachmentDeleteBtn.addEventListener("click", () => {
    deleteActiveAttachmentInSlot();
  });
}
if (els.slotAttachmentLoadBtn && els.slotAttachmentFileInput) {
  els.slotAttachmentLoadBtn.addEventListener("click", () => {
    if (!getActiveSlot()) return;
    els.slotAttachmentFileInput.click();
  });
  els.slotAttachmentFileInput.addEventListener("change", async () => {
    const s = getActiveSlot();
    const f = els.slotAttachmentFileInput.files && els.slotAttachmentFileInput.files[0];
    els.slotAttachmentFileInput.value = "";
    if (!s || !f) return;
    const current = getSlotCurrentAttachmentName(s);
    if (!current) {
      setStatus("Select an attachment (not none) first.");
      return;
    }
    try {
      const bmp = await createImageBitmap(f);
      const targetRect = s.rect || { w: bmp.width, h: bmp.height };
      const cv = makeCanvas(Math.max(1, Number(targetRect.w) || bmp.width), Math.max(1, Number(targetRect.h) || bmp.height));
      const cx = cv.getContext("2d");
      if (!cx) return;
      cx.drawImage(bmp, 0, 0, bmp.width, bmp.height, 0, 0, cv.width, cv.height);
      const att = getSlotAttachmentEntry(s, current);
      if (!att) return;
      att.canvas = cv;
      if (s.activeAttachment === current) s.canvas = cv;
      refreshSlotUI();
      setStatus(`Attachment image updated: ${current}`);
    } catch (err) {
      setStatus(`Load attachment image failed: ${err.message}`);
    }
  });
}

if (els.slotAlpha) {
  els.slotAlpha.addEventListener("input", () => {
    const s = getActiveSlot();
    if (!s) return;
    s.alpha = math.clamp(Number(els.slotAlpha.value) || 1, 0, 1);
    markDirtyBySlotProp(state.activeSlot, "color");
  });
}
if (els.slotColor) {
  els.slotColor.addEventListener("input", () => {
    const s = getActiveSlot();
    if (!s) return;
    const c = colorHexToRgb01(els.slotColor.value || "#ffffff");
    s.r = c.r;
    s.g = c.g;
    s.b = c.b;
    markDirtyBySlotProp(state.activeSlot, "color");
  });
}
if (els.slotBlend) {
  els.slotBlend.addEventListener("change", () => {
    const s = getActiveSlot();
    if (!s) return;
    s.blend = normalizeSlotBlendMode(els.slotBlend.value);
    refreshSlotUI();
  });
}
if (els.slotDarkEnabled) {
  els.slotDarkEnabled.addEventListener("change", () => {
    const s = getActiveSlot();
    if (!s) return;
    s.darkEnabled = !!els.slotDarkEnabled.checked;
    markDirtyBySlotProp(state.activeSlot, "color");
    refreshSlotUI();
  });
}
if (els.slotDarkColor) {
  els.slotDarkColor.addEventListener("input", () => {
    const s = getActiveSlot();
    if (!s) return;
    const c = colorHexToRgb01(els.slotDarkColor.value || "#000000");
    s.dr = c.r;
    s.dg = c.g;
    s.db = c.b;
    if (els.slotDarkEnabled && els.slotDarkEnabled.checked) s.darkEnabled = true;
    markDirtyBySlotProp(state.activeSlot, "color");
    refreshSlotUI();
  });
}

if (els.slotWeightMode) {
  els.slotWeightMode.addEventListener("change", () => {
    const s = getActiveSlot();
    if (!s || !state.mesh) return;
    const mode = els.slotWeightMode.value;
    s.weightMode = mode === "weighted" ? "weighted" : mode === "free" ? "free" : "single";
    if (s.weightMode === "weighted") {
      s.useWeights = true;
      s.weightBindMode = "auto";
    } else if (s.weightMode === "single") {
      s.useWeights = true;
      s.weightBindMode = "single";
    } else {
      s.useWeights = false;
      s.weightBindMode = "none";
    }
    rebuildSlotWeights(s, state.mesh);
    refreshSlotUI();
  });
}

if (els.slotInfluenceBones) {
  els.slotInfluenceBones.addEventListener("change", () => {
    const s = getActiveSlot();
    if (!s || !state.mesh) return;
    const mode = getSlotWeightMode(s);
    if (mode !== "weighted") return;
    const selected = Array.from(els.slotInfluenceBones.selectedOptions)
      .map((o) => Number(o.value))
      .filter((v) => Number.isFinite(v));
    s.influenceBones = selected.length > 0 ? [...new Set(selected)] : getSlotInfluenceBones(s, state.mesh);
    rebuildSlotWeights(s, state.mesh);
  });
}

function applySlotTransformFromInputs() {
  const s = getActiveSlot();
  if (!s) return;
  s.tx = Number(els.slotTx.value) || 0;
  s.ty = Number(els.slotTy.value) || 0;
  s.rot = math.degToRad(Number(els.slotRot.value) || 0);
}

if (els.slotTx) {
  els.slotTx.addEventListener("input", applySlotTransformFromInputs);
}
if (els.slotTy) {
  els.slotTy.addEventListener("input", applySlotTransformFromInputs);
}
if (els.slotRot) {
  els.slotRot.addEventListener("input", applySlotTransformFromInputs);
}

function moveActiveSlot(delta) {
  const i = state.activeSlot;
  const j = i + delta;
  if (i < 0 || j < 0 || j >= state.slots.length) return;
  const tmp = state.slots[i];
  state.slots[i] = state.slots[j];
  state.slots[j] = tmp;
  state.activeSlot = j;
  markDirtyDrawOrder();
  refreshSlotUI();
  renderBoneTree();
}

if (els.slotOrderUp) {
  els.slotOrderUp.addEventListener("click", () => {
    moveActiveSlot(-1);
  });
}
if (els.slotOrderDown) {
  els.slotOrderDown.addEventListener("click", () => {
    moveActiveSlot(1);
  });
}

  if (els.fileNewBtn) {
  els.fileNewBtn.addEventListener("click", () => {
    state.sourceCanvas = null;
    state.texture = null;
    state.imageWidth = 0;
    state.imageHeight = 0;
    state.slots = [];
    state.activeSlot = -1;
    state.slotViewMode = "single";
    state.mesh = null;
    state.selectedBone = -1;
    state.selectedBonesForWeight = [];
    state.selectedIK = -1;
    state.selectedTransform = -1;
    state.selectedPath = -1;
    state.skinSets = [];
    state.selectedSkinSet = -1;
    state.anim.animations = [createAnimation("Anim 1")];
    state.anim.currentAnimId = state.anim.animations[0].id;
    state.anim.selectedTrack = "";
    state.anim.selectedKey = null;
    state.anim.selectedKeys = [];
    state.anim.playing = false;
    state.anim.mix.active = false;
    state.anim.dirtyTracks = [];
    state.anim.groupMute = {};
    state.anim.groupSolo = {};
    state.anim.filterText = "";
    state.anim.onlyKeyed = false;
    state.anim.autoKey = false;
    state.anim.autoKeyPending = false;
    state.anim.batchExportOpen = false;
    state.anim.batchExport = {
      format: "webm",
      fps: 15,
      prefix: "batch",
      retries: 1,
      delayMs: 120,
      zipPng: true,
    };
    state.anim.onionSkin = {
      enabled: false,
      prevFrames: 2,
      nextFrames: 2,
      alpha: 0.22,
    };
    state.anim.layerTracks = [];
    state.anim.selectedLayerTrackId = "";
    state.anim.stateMachine = {
      enabled: true,
      states: [],
      parameters: [],
      currentStateId: "",
      selectedParamId: "",
      selectedTransitionId: "",
      selectedConditionId: "",
      pendingStateId: "",
      pendingDuration: 0.2,
    };
    state.history.undo = [];
    state.history.redo = [];
    state.history.lastSig = "";
    setAnimTime(0);
    refreshAnimationUI();
    pushUndoCheckpoint(true);
    refreshSlotUI();
    updatePlaybackButtons();
    renderBoneTree();
    saveAutosaveSnapshot("new_project", true);
    setStatus("New project created.");
  });
}

function sanitizeExportName(name, fallback) {
  const raw = String(name || "").trim();
  const cleaned = raw.replace(/[\\/:*?"<>|]+/g, "_").replace(/\s+/g, "_");
  return cleaned || fallback;
}

function makeUniqueName(base, used, fallback = "item") {
  const seed = sanitizeExportName(base, fallback);
  let out = seed;
  let i = 2;
  while (used.has(out)) {
    out = `${seed}_${i}`;
    i += 1;
  }
  used.add(out);
  return out;
}

function downloadBlobFile(blob, filename) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

function canvasToBlob(canvas, type = "image/png") {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Failed to encode canvas."));
        return;
      }
      resolve(blob);
    }, type);
  });
}

async function canvasFromDataUrl(dataUrl) {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const bmp = await createImageBitmap(blob);
  const c = makeCanvas(bmp.width, bmp.height);
  const ctx = c.getContext("2d");
  if (!ctx) throw new Error("Canvas context unavailable.");
  ctx.drawImage(bmp, 0, 0);
  return c;
}

function buildProjectPayload() {
  const canvasIndexMap = new Map();
  const slotImages = [];
  const registerCanvas = (canvas) => {
    if (!canvas) return -1;
    if (!canvasIndexMap.has(canvas)) {
      canvasIndexMap.set(canvas, slotImages.length);
      slotImages.push(canvas.toDataURL("image/png"));
    }
    return canvasIndexMap.get(canvas);
  };
  const slotRecords = state.slots.map((s) => {
    ensureSlotAttachmentState(s);
    ensureSlotAttachments(s);
    let imageIndex = -1;
    if (s && s.canvas) {
      imageIndex = registerCanvas(s.canvas);
    }
    const attachmentRecordsWithPlaceholder = ensureSlotAttachments(s).map((a) => ({
      name: a.name,
      placeholder: String(a && a.placeholder ? a.placeholder : s.placeholderName || s.attachmentName || "main"),
      imageIndex: registerCanvas(a.canvas),
      type: normalizeAttachmentType(a && a.type),
      linkedParent: a && a.linkedParent != null ? String(a.linkedParent) : "",
      pointX: Number(a && a.pointX) || 0,
      pointY: Number(a && a.pointY) || 0,
      pointRot: Number(a && a.pointRot) || 0,
      bboxSource: a && a.bboxSource === "contour" ? "contour" : "fill",
      sequence:
        a && a.sequence
          ? {
              enabled: !!a.sequence.enabled,
              count: Math.max(1, Math.round(Number(a.sequence.count) || 1)),
              start: Math.max(0, Math.round(Number(a.sequence.start) || 0)),
              digits: Math.max(1, Math.round(Number(a.sequence.digits) || 2)),
            }
          : { enabled: false, count: 1, start: 0, digits: 2 },
    }));
    return {
      id: s.id || makeSlotId(),
      name: s.name,
      attachmentName: s.attachmentName || "main",
      placeholderName: String(s.placeholderName || s.attachmentName || "main"),
      activeAttachment:
        s && Object.prototype.hasOwnProperty.call(s, "activeAttachment")
          ? s.activeAttachment == null
            ? null
            : String(s.activeAttachment)
          : String(s.attachmentName || "main"),
      editorVisible: isSlotEditorVisible(s),
      bone: s.bone,
      visible: isSlotEditorVisible(s),
      alpha: Number.isFinite(s.alpha) ? s.alpha : 1,
      r: Number.isFinite(s.r) ? s.r : 1,
      g: Number.isFinite(s.g) ? s.g : 1,
      b: Number.isFinite(s.b) ? s.b : 1,
      blend: normalizeSlotBlendMode(s && s.blend),
      darkEnabled: !!(s && s.darkEnabled),
      dr: Number.isFinite(s && s.dr) ? s.dr : 0,
      dg: Number.isFinite(s && s.dg) ? s.dg : 0,
      db: Number.isFinite(s && s.db) ? s.db : 0,
      tx: Number.isFinite(s.tx) ? s.tx : 0,
      ty: Number.isFinite(s.ty) ? s.ty : 0,
      rot: Number.isFinite(s.rot) ? s.rot : 0,
      useWeights: s.useWeights === true,
      weightBindMode: s.weightBindMode || (s.useWeights ? "single" : "none"),
      weightMode: getSlotWeightMode(s),
      influenceBones: Array.isArray(s.influenceBones) ? s.influenceBones : [],
      clipEnabled: !!s.clipEnabled,
      clipSource: s && s.clipSource === "contour" ? "contour" : "fill",
      clipEndSlotId: s && s.clipEndSlotId ? String(s.clipEndSlotId) : null,
      rect: s.rect || null,
      docWidth: s.docWidth || state.imageWidth,
      docHeight: s.docHeight || state.imageHeight,
      imageIndex,
      attachments: attachmentRecordsWithPlaceholder,
      meshContour:
        s.meshContour && Array.isArray(s.meshContour.points)
          ? {
              points: s.meshContour.points.map((p) => ({ x: Number(p.x) || 0, y: Number(p.y) || 0 })),
              closed: !!s.meshContour.closed,
              triangles: Array.isArray(s.meshContour.triangles) ? s.meshContour.triangles.map((v) => Number(v) || 0) : [],
              fillPoints: Array.isArray(s.meshContour.fillPoints)
                ? s.meshContour.fillPoints.map((p) => ({ x: Number(p.x) || 0, y: Number(p.y) || 0 }))
                : [],
              fillTriangles: Array.isArray(s.meshContour.fillTriangles)
                ? s.meshContour.fillTriangles.map((v) => Number(v) || 0)
                : [],
              manualEdges: Array.isArray(s.meshContour.manualEdges)
                ? s.meshContour.manualEdges
                    .filter((e) => Array.isArray(e) && e.length >= 2)
                    .map((e) => [Number(e[0]) || 0, Number(e[1]) || 0])
                : [],
              fillManualEdges: Array.isArray(s.meshContour.fillManualEdges)
                ? s.meshContour.fillManualEdges
                    .filter((e) => Array.isArray(e) && e.length >= 2)
                    .map((e) => [Number(e[0]) || 0, Number(e[1]) || 0])
                : [],
            }
          : null,
    };
  });

  return {
    version: 2,
    export: {
      spineCompat: getSpineCompatPreset(state.export && state.export.spineCompat).id,
    },
    slotMeshGridReplaceContour: !!state.slotMesh.gridReplaceContour,
    imageWidth: state.imageWidth,
    imageHeight: state.imageHeight,
    gridX: Number(els.gridX.value) || 24,
    gridY: Number(els.gridY.value) || 24,
    rigBones: state.mesh ? state.mesh.rigBones : [],
    ikConstraints:
      state.mesh && Array.isArray(state.mesh.ikConstraints)
        ? state.mesh.ikConstraints.map((c, i) => ({
            name: c && c.name ? c.name : `ik_${i}`,
            bones: Array.isArray(c && c.bones) ? c.bones.map((v) => Number(v) || 0) : [],
            target: Number(c && c.target),
            targetX: Number(c && c.targetX),
            targetY: Number(c && c.targetY),
            mix: math.clamp(Number(c && c.mix) || 1, 0, 1),
            softness: Math.max(0, Number(c && c.softness) || 0),
            bendPositive: c ? c.bendPositive !== false : true,
            compress: !!(c && c.compress),
            stretch: !!(c && c.stretch),
            uniform: !!(c && c.uniform),
            order: getConstraintOrder(c, i),
            skinRequired: !!(c && c.skinRequired),
            enabled: c ? c.enabled !== false : true,
            endMode: c && c.endMode === "tail" ? "tail" : "head",
          }))
        : [],
    transformConstraints:
      state.mesh && Array.isArray(state.mesh.transformConstraints)
        ? state.mesh.transformConstraints.map((c, i) => ({
            name: c && c.name ? c.name : `transform_${i}`,
            bones: Array.isArray(c && c.bones) ? c.bones.map((v) => Number(v) || 0) : [],
            target: Number(c && c.target),
            rotateMix: math.clamp(Number(c && c.rotateMix) || 0, 0, 1),
            translateMix: math.clamp(Number(c && c.translateMix) || 0, 0, 1),
            scaleMix: math.clamp(Number(c && c.scaleMix) || 0, 0, 1),
            shearMix: math.clamp(Number(c && c.shearMix) || 0, 0, 1),
            offsetX: Number(c && c.offsetX) || 0,
            offsetY: Number(c && c.offsetY) || 0,
            offsetRot: Number(c && c.offsetRot) || 0,
            offsetScaleX: Number(c && c.offsetScaleX) || 0,
            offsetScaleY: Number(c && c.offsetScaleY) || 0,
            offsetShearY: Number(c && c.offsetShearY) || 0,
            local: !!(c && c.local),
            relative: !!(c && c.relative),
            order: getConstraintOrder(c, i),
            skinRequired: !!(c && c.skinRequired),
            enabled: c ? c.enabled !== false : true,
          }))
        : [],
    pathConstraints:
      state.mesh && Array.isArray(state.mesh.pathConstraints)
        ? state.mesh.pathConstraints.map((c, i) => ({
            name: c && c.name ? c.name : `path_${i}`,
            bones: Array.isArray(c && c.bones) ? c.bones.map((v) => Number(v) || 0) : [],
            target: Number(c && c.target),
            sourceType: c && c.sourceType === "bone_chain" ? "bone_chain" : c && c.sourceType === "slot" ? "slot" : "drawn",
            targetSlot: Number(c && c.targetSlot),
            points: Array.isArray(c && c.points)
              ? c.points.map((p) => ({
                  x: Number(p && p.x) || 0,
                  y: Number(p && p.y) || 0,
                  hinx: Number.isFinite(Number(p && p.hinx)) ? Number(p.hinx) : Number(p && p.x) || 0,
                  hiny: Number.isFinite(Number(p && p.hiny)) ? Number(p.hiny) : Number(p && p.y) || 0,
                  houtx: Number.isFinite(Number(p && p.houtx)) ? Number(p.houtx) : Number(p && p.x) || 0,
                  houty: Number.isFinite(Number(p && p.houty)) ? Number(p.houty) : Number(p && p.y) || 0,
                  broken: !!(p && p.broken),
                  handleMode: p && p.handleMode === "auto" ? "auto" : p && p.handleMode === "broken" ? "broken" : "aligned",
                }))
              : [],
            positionMode: c && c.positionMode === "percent" ? "percent" : "fixed",
            spacingMode:
              c && c.spacingMode === "fixed"
                ? "fixed"
                : c && c.spacingMode === "percent"
                  ? "percent"
                  : c && c.spacingMode === "proportional"
                    ? "proportional"
                    : "length",
            rotateMode: c && c.rotateMode === "chain" ? "chain" : c && c.rotateMode === "chainScale" ? "chainScale" : "tangent",
            position: Number(c && c.position) || 0,
            spacing: Number(c && c.spacing) || 0,
            rotateMix: math.clamp(Number(c && c.rotateMix) || 0, 0, 1),
            translateMix: math.clamp(Number(c && c.translateMix) || 0, 0, 1),
            skinRequired: !!(c && c.skinRequired),
            closed: !!(c && c.closed),
            order: getConstraintOrder(c, i),
            enabled: c ? c.enabled !== false : true,
          }))
        : [],
    animations: state.anim.animations,
    animationState: {
      layerTracks: ensureAnimLayerTracks().map((t) => ({
        id: t.id,
        name: t.name,
        enabled: t.enabled !== false,
        animId: t.animId || "",
        loop: t.loop !== false,
        speed: Number.isFinite(Number(t.speed)) ? math.clamp(Number(t.speed), -10, 10) : 1,
        offset: Number(t.offset) || 0,
        alpha: math.clamp(Number(t.alpha) || 0, 0, 1),
        mode: t.mode === "add" ? "add" : "replace",
        maskMode: t.maskMode === "include" ? "include" : t.maskMode === "exclude" ? "exclude" : "all",
        maskBones: Array.isArray(t.maskBones) ? t.maskBones.map((v) => Number(v) || 0) : [],
      })),
      selectedLayerTrackId: String(state.anim.selectedLayerTrackId || ""),
      batchExportOpen: !!state.anim.batchExportOpen,
      batchExport: {
        format:
          state.anim.batchExport && (state.anim.batchExport.format === "gif" || state.anim.batchExport.format === "pngseq")
            ? state.anim.batchExport.format
            : "webm",
        fps: Math.max(1, Math.min(60, Math.round(Number(state.anim.batchExport && state.anim.batchExport.fps) || 15))),
        prefix: String((state.anim.batchExport && state.anim.batchExport.prefix) || "batch"),
        retries: Math.max(0, Math.min(5, Math.round(Number(state.anim.batchExport && state.anim.batchExport.retries) || 1))),
        delayMs: Math.max(0, Math.min(5000, Math.round(Number(state.anim.batchExport && state.anim.batchExport.delayMs) || 120))),
        zipPng: !!(state.anim.batchExport && state.anim.batchExport.zipPng),
      },
      stateMachine: JSON.parse(JSON.stringify(ensureStateMachine())),
      onionSkin: JSON.parse(JSON.stringify(ensureOnionSkinSettings())),
    },
    skinSets: ensureSkinSets().map((s) => ({
      id: s.id,
      name: s.name,
      slotAttachments: { ...(s.slotAttachments || {}) },
      slotPlaceholderAttachments:
        s && s.slotPlaceholderAttachments && typeof s.slotPlaceholderAttachments === "object"
          ? Object.fromEntries(
              Object.entries(s.slotPlaceholderAttachments).map(([slotId, map]) => [
                String(slotId),
                map && typeof map === "object"
                  ? Object.fromEntries(Object.entries(map).map(([ph, v]) => [String(ph), v == null ? null : String(v)]))
                  : {},
              ])
            )
          : {},
    })),
    selectedSkinSet: Number(state.selectedSkinSet) || 0,
    slotViewMode: state.slotViewMode,
    activeSlot: state.activeSlot,
    slotImages,
    slots: slotRecords,
  };
}

class SpineBinaryWriter {
  constructor() {
    this.bytes = [];
  }

  byte(v) {
    this.bytes.push(v & 0xff);
  }

  bool(v) {
    this.byte(v ? 1 : 0);
  }

  varint(value, optimizePositive = true) {
    let v = value | 0;
    if (!optimizePositive) v = (v << 1) ^ (v >> 31);
    while (v > 0x7f) {
      this.byte((v & 0x7f) | 0x80);
      v >>>= 7;
    }
    this.byte(v & 0x7f);
  }

  float(value) {
    const buf = new ArrayBuffer(4);
    const view = new DataView(buf);
    view.setFloat32(0, Number(value) || 0, false);
    this.byte(view.getUint8(0));
    this.byte(view.getUint8(1));
    this.byte(view.getUint8(2));
    this.byte(view.getUint8(3));
  }

  int(value) {
    const buf = new ArrayBuffer(4);
    const view = new DataView(buf);
    view.setInt32(0, value | 0, false);
    this.byte(view.getUint8(0));
    this.byte(view.getUint8(1));
    this.byte(view.getUint8(2));
    this.byte(view.getUint8(3));
  }

  string(text) {
    if (text == null) {
      this.byte(0);
      return;
    }
    const s = String(text);
    if (s.length === 0) {
      this.byte(1);
      return;
    }
    const data = new TextEncoder().encode(s);
    this.varint(data.length + 1, true);
    for (let i = 0; i < data.length; i += 1) this.byte(data[i]);
  }

  refString(text, sharedMap) {
    if (text == null) {
      this.varint(0, true);
      return;
    }
    const idx = sharedMap.get(String(text));
    if (!Number.isFinite(idx) || idx < 0) {
      this.varint(0, true);
      return;
    }
    this.varint(idx + 1, true);
  }

  toUint8Array() {
    return new Uint8Array(this.bytes);
  }
}

function toSpineColor(r, g, b, a, visible = true) {
  const rr = Math.round(math.clamp(Number(r), 0, 1) * 255)
    .toString(16)
    .padStart(2, "0");
  const gg = Math.round(math.clamp(Number(g), 0, 1) * 255)
    .toString(16)
    .padStart(2, "0");
  const bb = Math.round(math.clamp(Number(b), 0, 1) * 255)
    .toString(16)
    .padStart(2, "0");
  const aa = Math.round((visible === false ? 0 : math.clamp(Number(a), 0, 1)) * 255)
    .toString(16)
    .padStart(2, "0");
  return `${rr}${gg}${bb}${aa}`;
}

function toSpineRgb(r, g, b) {
  const rr = Math.round(math.clamp(Number(r) || 0, 0, 1) * 255)
    .toString(16)
    .padStart(2, "0");
  const gg = Math.round(math.clamp(Number(g) || 0, 0, 1) * 255)
    .toString(16)
    .padStart(2, "0");
  const bb = Math.round(math.clamp(Number(b) || 0, 0, 1) * 255)
    .toString(16)
    .padStart(2, "0");
  return `${rr}${gg}${bb}`;
}

function colorHexToInt(color) {
  const c = String(color || "").trim();
  if (!/^[0-9a-fA-F]{8}$/.test(c)) return 0xffffffff;
  return Number.parseInt(c, 16) >>> 0;
}

function darkColorHexToInt(color) {
  const c = String(color || "").trim();
  if (/^[0-9a-fA-F]{6}$/.test(c)) return Number.parseInt(`${c}ff`, 16) >>> 0;
  if (/^[0-9a-fA-F]{8}$/.test(c)) return Number.parseInt(c, 16) >>> 0;
  return -1;
}

function getSkinEntries(spineJson) {
  const skins = spineJson && spineJson.skins ? spineJson.skins : null;
  if (Array.isArray(skins)) {
    return skins.map((s, i) => ({
      name: s && s.name ? s.name : `skin_${i}`,
      attachments: (s && s.attachments) || {},
    }));
  }
  if (skins && typeof skins === "object") {
    return Object.entries(skins).map(([name, v]) => ({
      name,
      attachments: v && typeof v === "object" && v.attachments ? v.attachments : v || {},
    }));
  }
  return [];
}

function buildSharedStrings(spineJson) {
  const out = [];
  const map = new Map();
  function add(v) {
    if (v == null) return;
    const s = String(v);
    if (!s || map.has(s)) return;
    map.set(s, out.length);
    out.push(s);
  }
  for (const b of spineJson.bones || []) {
    add(b.name);
    add(b.parent);
  }
  for (const s of spineJson.slots || []) {
    add(s.name);
    add(s.bone);
    add(s.attachment);
  }
  for (const ik of spineJson.ik || []) {
    add(ik && ik.name);
    add(ik && ik.target);
    for (const bn of (ik && ik.bones) || []) add(bn);
  }
  for (const tc of spineJson.transform || []) {
    add(tc && tc.name);
    add(tc && tc.target);
    for (const bn of (tc && tc.bones) || []) add(bn);
  }
  for (const pc of spineJson.path || []) {
    add(pc && pc.name);
    add(pc && pc.target);
    for (const bn of (pc && pc.bones) || []) add(bn);
  }
  const skinEntries = getSkinEntries(spineJson);
  for (const skinEntry of skinEntries) {
    add(skinEntry.name);
    const skin = skinEntry.attachments || {};
    for (const slotName of Object.keys(skin)) {
      add(slotName);
      const attMap = skin[slotName] || {};
      for (const attName of Object.keys(attMap)) {
        add(attName);
        const att = attMap[attName] || {};
        add(att.path);
      }
    }
  }
  const anims = spineJson.animations || {};
  for (const animName of Object.keys(anims)) {
    add(animName);
    const a = anims[animName] || {};
    const bones = a.bones || {};
    for (const bName of Object.keys(bones)) add(bName);
    const ik = a.ik || {};
    for (const ikName of Object.keys(ik)) add(ikName);
    const tfc = a.transform || {};
    for (const tfcName of Object.keys(tfc)) add(tfcName);
    const pth = a.paths || {};
    for (const pthName of Object.keys(pth)) add(pthName);
  }
  return { strings: out, index: map };
}

function writeCurve(writer, key) {
  if (key && key.curve === "stepped") {
    writer.byte(1);
    return;
  }
  if (key && Array.isArray(key.curve) && key.curve.length >= 4) {
    writer.byte(2);
    writer.float(math.clamp(Number(key.curve[0]) || 0, 0, 1));
    writer.float(math.clamp(Number(key.curve[1]) || 0, 0, 1));
    writer.float(math.clamp(Number(key.curve[2]) || 0, 0, 1));
    writer.float(math.clamp(Number(key.curve[3]) || 0, 0, 1));
    return;
  }
  writer.byte(0);
}

function writeBoneTimelineList(writer, tl) {
  const keys = [];
  if (Array.isArray(tl.rotate) && tl.rotate.length > 0) keys.push({ type: 0, list: tl.rotate });
  if (Array.isArray(tl.translate) && tl.translate.length > 0) keys.push({ type: 1, list: tl.translate });
  if (Array.isArray(tl.scale) && tl.scale.length > 0) keys.push({ type: 2, list: tl.scale });
  if (Array.isArray(tl.shear) && tl.shear.length > 0) keys.push({ type: 3, list: tl.shear });
  writer.varint(keys.length, true);
  for (const k of keys) {
    writer.byte(k.type);
    writer.varint(k.list.length, true);
    writer.varint(0, true);
    for (let i = 0; i < k.list.length; i += 1) {
      const row = k.list[i] || {};
      writer.float(Number(row.time) || 0);
      if (k.type === 0) {
        writer.float(Number(row.value) || 0);
      } else {
        writer.float(Number(row.x) || 0);
        writer.float(Number(row.y) || 0);
      }
      if (i < k.list.length - 1) writeCurve(writer, row);
    }
  }
}

function writeSkelVertices(writer, vertices, vertexCount) {
  const arr = Array.isArray(vertices) ? vertices : [];
  if (arr.length === vertexCount * 2) {
    writer.bool(false);
    for (let i = 0; i < arr.length; i += 1) writer.float(Number(arr[i]) || 0);
    return;
  }
  writer.bool(true);
  let p = 0;
  for (let i = 0; i < vertexCount; i += 1) {
    const boneCount = Math.max(0, Number(arr[p++]) || 0);
    writer.varint(boneCount, true);
    for (let b = 0; b < boneCount; b += 1) {
      writer.varint(Math.max(0, Number(arr[p++]) || 0), true);
      writer.float(Number(arr[p++]) || 0);
      writer.float(Number(arr[p++]) || 0);
      writer.float(Number(arr[p++]) || 0);
    }
  }
}

function writeSkelAttachment(writer, attName, att, sharedMap) {
  const a = att || {};
  const type = String(a.type || "region");
  const typeCode = {
    region: 0,
    boundingbox: 1,
    mesh: 2,
    linkedmesh: 3,
    path: 4,
    point: 5,
    clipping: 6,
  }[type];
  writer.refString(attName, sharedMap);
  writer.string(a.name || attName);
  writer.byte(Number.isFinite(typeCode) ? typeCode : 0);

  if (type === "mesh") {
    writer.refString(a.path || null, sharedMap);
    writer.int(colorHexToInt(a.color || "ffffffff"));
    const uvs = Array.isArray(a.uvs) ? a.uvs : [];
    const triangles = Array.isArray(a.triangles) ? a.triangles : [];
    const vertexCount = Math.floor(uvs.length / 2);
    writer.varint(vertexCount, true);
    for (let i = 0; i < uvs.length; i += 1) writer.float(Number(uvs[i]) || 0);
    writer.varint(triangles.length, true);
    for (let i = 0; i < triangles.length; i += 1) writer.varint(Math.max(0, Number(triangles[i]) || 0), true);
    writeSkelVertices(writer, a.vertices, vertexCount);
    writer.varint(Math.max(0, Number(a.hull) || 0), true);
    writer.varint(0, true);
    writer.float(Number(a.width) || 0);
    writer.float(Number(a.height) || 0);
    return;
  }
  if (type === "path") {
    writer.bool(!!a.closed);
    writer.bool(a.constantSpeed !== false);
    const arr = Array.isArray(a.vertices) ? a.vertices : [];
    const vertexCount = Math.max(0, Number(a.vertexCount) || Math.floor(arr.length / 2));
    writer.varint(vertexCount, true);
    writeSkelVertices(writer, arr, vertexCount);
    const lens = Array.isArray(a.lengths) ? a.lengths : [];
    writer.varint(lens.length, true);
    for (let i = 0; i < lens.length; i += 1) writer.float(Number(lens[i]) || 0);
    return;
  }

  writer.refString(a.path || null, sharedMap);
  writer.float(Number(a.rotation) || 0);
  writer.float(Number(a.x) || 0);
  writer.float(Number(a.y) || 0);
  writer.float(Number(a.scaleX) || 1);
  writer.float(Number(a.scaleY) || 1);
  writer.float(Number(a.width) || 0);
  writer.float(Number(a.height) || 0);
  writer.int(colorHexToInt(a.color || "ffffffff"));
}

const SPINE_COMPAT_PRESETS = {
  "4.2": {
    id: "4.2",
    version: "4.2.22",
    stripIkUniform: false,
  },
  "4.1": {
    id: "4.1",
    version: "4.1.24",
    stripIkUniform: true,
  },
};

function getSpineCompatPreset(mode) {
  const key = String(mode || "");
  return SPINE_COMPAT_PRESETS[key] || SPINE_COMPAT_PRESETS["4.2"];
}

function exportSpineSkelBinary(spineJson) {
  const writer = new SpineBinaryWriter();
  const skel = spineJson.skeleton || {};
  const shared = buildSharedStrings(spineJson);
  const sharedMap = shared.index;

  writer.string(skel.hash || "");
  writer.string(skel.spine || getSpineCompatPreset(state.export && state.export.spineCompat).version);
  writer.float(Number(skel.x) || 0);
  writer.float(Number(skel.y) || 0);
  writer.float(Number(skel.width) || 0);
  writer.float(Number(skel.height) || 0);
  writer.bool(true);
  writer.float(30);
  writer.string(skel.images || "./");
  writer.string(skel.audio || "");

  writer.varint(shared.strings.length, true);
  for (const s of shared.strings) writer.string(s);

  const bones = spineJson.bones || [];
  writer.varint(bones.length, true);
  for (let i = 0; i < bones.length; i += 1) {
    const b = bones[i] || {};
    writer.string(b.name || `bone_${i}`);
    if (i > 0) writer.refString(b.parent || null, sharedMap);
    writer.float(Number(b.rotation) || 0);
    writer.float(Number(b.x) || 0);
    writer.float(Number(b.y) || 0);
    writer.float(Number(b.scaleX) || 1);
    writer.float(Number(b.scaleY) || 1);
    writer.float(Number(b.shearX) || 0);
    writer.float(Number(b.shearY) || 0);
    writer.float(Number(b.length) || 0);
    const inherit = normalizeBoneInheritValue(b.inherit);
    const inheritMap = {
      normal: 0,
      onlyTranslation: 1,
      noRotationOrReflection: 2,
      noScale: 3,
      noScaleOrReflection: 4,
    };
    writer.varint(inheritMap[inherit] ?? 0, true);
    writer.bool(!!b.skin);
    writer.int(colorHexToInt(b.color || "9b9b9bff"));
  }

  const slots = spineJson.slots || [];
  const slotNameToIndex = new Map();
  for (let i = 0; i < slots.length; i += 1) {
    const sn = slots[i] && slots[i].name ? slots[i].name : `slot_${i}`;
    slotNameToIndex.set(sn, i);
  }
  writer.varint(slots.length, true);
  for (let i = 0; i < slots.length; i += 1) {
    const s = slots[i] || {};
    writer.string(s.name || `slot_${i}`);
    writer.refString(s.bone || null, sharedMap);
    writer.int(colorHexToInt(s.color || "ffffffff"));
    writer.int(darkColorHexToInt(s.dark));
    writer.refString(s.attachment || null, sharedMap);
    const blendMode = normalizeSlotBlendMode(s.blend);
    const blendIndex = blendMode === "additive" ? 1 : blendMode === "multiply" ? 2 : blendMode === "screen" ? 3 : 0;
    writer.varint(blendIndex, true);
  }

  const boneNameToIndex = new Map();
  for (let i = 0; i < bones.length; i += 1) {
    boneNameToIndex.set(String(bones[i] && bones[i].name ? bones[i].name : `bone_${i}`), i);
  }
  const ikList = Array.isArray(spineJson.ik) ? spineJson.ik : [];
  writer.varint(ikList.length, true);
  for (let i = 0; i < ikList.length; i += 1) {
    const ik = ikList[i] || {};
    const chain = Array.isArray(ik.bones) ? ik.bones : [];
    writer.string(ik.name || `ik_${i}`);
    writer.varint(getConstraintOrder(ik, i), true);
    writer.bool(!!ik.skin);
    writer.varint(chain.length, true);
    for (const bn of chain) {
      const bi = boneNameToIndex.get(String(bn));
      writer.varint(Number.isFinite(bi) ? bi : 0, true);
    }
    const targetIndex = boneNameToIndex.get(String(ik.target || ""));
    writer.varint(Number.isFinite(targetIndex) ? targetIndex : 0, true);
    writer.float(Math.max(0, Number(ik.mix) || 0));
    writer.float(Math.max(0, Number(ik.softness) || 0));
    writer.byte(ik.bendPositive === false ? -1 : 1);
    writer.bool(!!ik.compress);
    writer.bool(!!ik.stretch);
    writer.bool(!!ik.uniform);
  }
  const tfcList = Array.isArray(spineJson.transform) ? spineJson.transform : [];
  writer.varint(tfcList.length, true);
  for (let i = 0; i < tfcList.length; i += 1) {
    const tc = tfcList[i] || {};
    const chain = Array.isArray(tc.bones) ? tc.bones : [];
    writer.string(tc.name || `transform_${i}`);
    writer.varint(getConstraintOrder(tc, i), true);
    writer.bool(!!tc.skin);
    writer.varint(chain.length, true);
    for (const bn of chain) {
      const bi = boneNameToIndex.get(String(bn));
      writer.varint(Number.isFinite(bi) ? bi : 0, true);
    }
    const targetIndex = boneNameToIndex.get(String(tc.target || ""));
    writer.varint(Number.isFinite(targetIndex) ? targetIndex : 0, true);
    writer.bool(!!tc.local);
    writer.bool(!!tc.relative);
    writer.float(Number(tc.rotation) || 0);
    writer.float(Number(tc.x) || 0);
    writer.float(Number(tc.y) || 0);
    writer.float(Number(tc.scaleX) || 0);
    writer.float(Number(tc.scaleY) || 0);
    writer.float(Number(tc.shearY) || 0);
    writer.float(math.clamp(Number(tc.rotateMix) || 0, 0, 1));
    writer.float(math.clamp(Number(tc.translateMix) || 0, 0, 1));
    writer.float(math.clamp(Number(tc.scaleMix) || 0, 0, 1));
    writer.float(math.clamp(Number(tc.shearMix) || 0, 0, 1));
  }
  const pathList = Array.isArray(spineJson.path) ? spineJson.path : [];
  writer.varint(pathList.length, true);
  for (let i = 0; i < pathList.length; i += 1) {
    const pc = pathList[i] || {};
    const chain = Array.isArray(pc.bones) ? pc.bones : [];
    writer.string(pc.name || `path_${i}`);
    writer.varint(getConstraintOrder(pc, i), true);
    writer.bool(!!pc.skin);
    writer.varint(chain.length, true);
    for (const bn of chain) {
      const bi = boneNameToIndex.get(String(bn));
      writer.varint(Number.isFinite(bi) ? bi : 0, true);
    }
    const targetSlotIndex = slotNameToIndex.get(String(pc.target || ""));
    writer.varint(Number.isFinite(targetSlotIndex) ? targetSlotIndex : 0, true);

    const positionModeMap = { fixed: 0, percent: 1 };
    const spacingModeMap = { length: 0, fixed: 1, percent: 2, proportional: 3 };
    const rotateModeMap = { tangent: 0, chain: 1, chainScale: 2 };
    writer.varint(positionModeMap[pc.positionMode] ?? 0, true);
    writer.varint(spacingModeMap[pc.spacingMode] ?? 0, true);
    writer.varint(rotateModeMap[pc.rotateMode] ?? 0, true);

    writer.float(Number(pc.rotation) || 0);
    writer.float(Number(pc.position) || 0);
    writer.float(Number(pc.spacing) || 0);
    writer.float(math.clamp(Number(pc.rotateMix) || 0, 0, 1));
    writer.float(math.clamp(Number(pc.translateMix) || 0, 0, 1));
  }

  const skinEntries = getSkinEntries(spineJson);
  const defaultEntry = skinEntries.find((s) => s.name === "default") || skinEntries[0] || { name: "default", attachments: {} };
  const defaultSkin = defaultEntry.attachments || {};
  const defaultSlots = Object.keys(defaultSkin);
  writer.varint(defaultSlots.length, true);
  for (const slotName of defaultSlots) {
    const attMap = defaultSkin[slotName] || {};
    const attNames = Object.keys(attMap);
    writer.refString(slotName, sharedMap);
    writer.varint(attNames.length, true);
    for (const attName of attNames) {
      const att = attMap[attName] || {};
      writeSkelAttachment(writer, attName, att, sharedMap);
    }
  }

  const extraSkins = skinEntries.filter((s) => s.name !== defaultEntry.name);
  writer.varint(extraSkins.length, true);
  for (const skinEntry of extraSkins) {
    const skin = skinEntry.attachments || {};
    writer.string(skinEntry.name);
    const slotNames = Object.keys(skin);
    writer.varint(slotNames.length, true);
    for (const slotName of slotNames) {
      const attMap = skin[slotName] || {};
      const attNames = Object.keys(attMap);
      writer.refString(slotName, sharedMap);
      writer.varint(attNames.length, true);
      for (const attName of attNames) {
        const att = attMap[attName] || {};
        writeSkelAttachment(writer, attName, att, sharedMap);
      }
    }
  }

  writer.varint(0, true);

  const anims = spineJson.animations || {};
  const animNames = Object.keys(anims);
  const skinNameToIndex = new Map();
  for (let i = 0; i < skinEntries.length; i += 1) {
    skinNameToIndex.set(skinEntries[i].name, i);
  }
  writer.varint(animNames.length, true);
  for (const animName of animNames) {
    writer.string(animName);
    const a = anims[animName] || {};

    writer.varint(0, true);

    const boneTimelines = a.bones || {};
    const boneEntries = Object.entries(boneTimelines).filter(([, tl]) => tl && typeof tl === "object");
    writer.varint(boneEntries.length, true);
    for (const [boneName, tl] of boneEntries) {
      writer.refString(boneName, sharedMap);
      writeBoneTimelineList(writer, tl);
    }

    const ikTimelines = a.ik || {};
    const ikEntries = Object.entries(ikTimelines).filter(([, rows]) => Array.isArray(rows) && rows.length > 0);
    writer.varint(ikEntries.length, true);
    for (const [ikName, rows] of ikEntries) {
      writer.refString(ikName, sharedMap);
      writer.varint(rows.length, true);
      for (let i = 0; i < rows.length; i += 1) {
        const row = rows[i] || {};
        writer.float(Number(row.time) || 0);
        writer.float(math.clamp(Number(row.mix) || 0, 0, 1));
        writer.float(Math.max(0, Number(row.softness) || 0));
        writer.byte(row.bendPositive === false ? -1 : 1);
        writer.bool(!!row.compress);
        writer.bool(!!row.stretch);
        writer.bool(!!row.uniform);
        if (i < rows.length - 1) writeCurve(writer, row);
      }
    }
    const tfcTimelines = a.transform || {};
    const tfcEntries = Object.entries(tfcTimelines).filter(([, rows]) => Array.isArray(rows) && rows.length > 0);
    writer.varint(tfcEntries.length, true);
    for (const [tfcName, rows] of tfcEntries) {
      writer.refString(tfcName, sharedMap);
      writer.varint(rows.length, true);
      for (let i = 0; i < rows.length; i += 1) {
        const row = rows[i] || {};
        writer.float(Number(row.time) || 0);
        writer.float(math.clamp(Number(row.rotateMix) || 0, 0, 1));
        writer.float(math.clamp(Number(row.translateMix) || 0, 0, 1));
        writer.float(math.clamp(Number(row.scaleMix) || 0, 0, 1));
        writer.float(math.clamp(Number(row.shearMix) || 0, 0, 1));
        if (i < rows.length - 1) writeCurve(writer, row);
      }
    }
    const pathTimelines = a.paths || {};
    const pathEntries = Object.entries(pathTimelines).filter(([, tl]) => tl && typeof tl === "object");
    writer.varint(pathEntries.length, true);
    for (const [pathName, tl] of pathEntries) {
      writer.refString(pathName, sharedMap);
      const timelines = [];
      if (Array.isArray(tl.position) && tl.position.length > 0) timelines.push({ type: 0, rows: tl.position });
      if (Array.isArray(tl.spacing) && tl.spacing.length > 0) timelines.push({ type: 1, rows: tl.spacing });
      if (Array.isArray(tl.mix) && tl.mix.length > 0) timelines.push({ type: 2, rows: tl.mix });
      writer.varint(timelines.length, true);
      for (const t of timelines) {
        writer.byte(t.type);
        writer.varint(t.rows.length, true);
        for (let i = 0; i < t.rows.length; i += 1) {
          const row = t.rows[i] || {};
          writer.float(Number(row.time) || 0);
          if (t.type === 2) {
            writer.float(math.clamp(Number(row.rotateMix) || 0, 0, 1));
            writer.float(math.clamp(Number(row.translateMix) || 0, 0, 1));
          } else {
            writer.float(Number(row.value) || 0);
          }
          if (i < t.rows.length - 1) writeCurve(writer, row);
        }
      }
    }
    const deform = a.deform || a.ffd || {};
    const deformSkinEntries = Object.entries(deform).filter(([, v]) => v && typeof v === "object");
    writer.varint(deformSkinEntries.length, true);
    for (const [skinName, slotMap] of deformSkinEntries) {
      writer.varint(Math.max(0, skinNameToIndex.get(skinName) || 0), true);
      const deformSlots = Object.entries(slotMap || {}).filter(([, v]) => v && typeof v === "object");
      writer.varint(deformSlots.length, true);
      for (const [slotName, attMap] of deformSlots) {
        writer.varint(Math.max(0, slotNameToIndex.get(slotName) || 0), true);
        const deformAtts = Object.entries(attMap || {}).filter(([, rows]) => Array.isArray(rows));
        writer.varint(deformAtts.length, true);
        for (const [attName, rows] of deformAtts) {
          writer.refString(attName, sharedMap);
          writer.varint(rows.length, true);
          for (let i = 0; i < rows.length; i += 1) {
            const row = rows[i] || {};
            writer.float(Number(row.time) || 0);
            const verts = Array.isArray(row.vertices) ? row.vertices : [];
            if (verts.length === 0) {
              writer.varint(0, true);
            } else {
              writer.varint(verts.length, true);
              const off = Math.max(0, Number(row.offset) || 0);
              if (off > 0) writer.varint(off + 1, true);
              for (let j = 0; j < verts.length; j += 1) writer.float(Number(verts[j]) || 0);
            }
            if (i < rows.length - 1) writeCurve(writer, row);
          }
        }
      }
    }
    writer.varint(0, true);
    writer.varint(0, true);
  }

  return writer.toUint8Array();
}

function packSlotsToAtlasPage(slotExportInfos, pageName, textureScale = 1) {
  const atlasSlots = slotExportInfos.filter(
    (it) => it && it.canvas && it.canvas.width > 0 && it.canvas.height > 0
  );
  if (atlasSlots.length === 0) throw new Error("No slot images to export.");

  const scale = math.clamp(Number(textureScale) || 1, 0.1, 1);
  const padding = 2;
  const maxW = 2048;
  let x = padding;
  let y = padding;
  let rowH = 0;
  let usedW = 0;
  let usedH = 0;
  const regions = [];
  for (const it of atlasSlots) {
    const w = Math.max(1, Math.round(it.canvas.width * scale));
    const h = Math.max(1, Math.round(it.canvas.height * scale));
    if (x + w + padding > maxW) {
      x = padding;
      y += rowH + padding;
      rowH = 0;
    }
    regions.push({ ...it, x, y, w, h });
    x += w + padding;
    rowH = Math.max(rowH, h);
    usedW = Math.max(usedW, x);
    usedH = Math.max(usedH, y + h + padding);
  }
  const pageW = Math.max(1, Math.ceil(usedW));
  const pageH = Math.max(1, Math.ceil(usedH));
  const canvas = document.createElement("canvas");
  canvas.width = pageW;
  canvas.height = pageH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D canvas context unavailable for atlas export.");
  for (const r of regions) {
    ctx.drawImage(r.canvas, 0, 0, r.canvas.width, r.canvas.height, r.x, r.y, r.w, r.h);
  }
  let atlas = `${pageName}\n`;
  atlas += `\tsize: ${pageW}, ${pageH}\n`;
  atlas += "\tformat: RGBA8888\n";
  atlas += "\tfilter: Linear, Linear\n";
  atlas += "\trepeat: none\n";
  for (const r of regions) {
    atlas += `${r.attachmentName}\n`;
    atlas += `\tbounds: ${r.x}, ${r.y}, ${r.w}, ${r.h}\n`;
  }
  return { canvas, atlas, scale };
}

function buildSpineJsonData(compatMode = state.export && state.export.spineCompat) {
  const compat = getSpineCompatPreset(compatMode);
  if (!state.mesh) throw new Error("No mesh data. Import image/PSD first.");
  const bones = Array.isArray(state.mesh.rigBones) ? state.mesh.rigBones : [];
  if (bones.length === 0) throw new Error("No bones to export.");
  if (!Array.isArray(state.slots) || state.slots.length === 0) throw new Error("No slots to export.");

  const boneUsed = new Set();
  const slotUsed = new Set();
  const attachmentUsed = new Set();
  const animUsed = new Set();
  const boneNames = bones.map((b, i) => makeUniqueName(b && b.name ? b.name : `bone_${i}`, boneUsed, `bone_${i}`));
  const slotInfos = state.slots.map((s, i) => {
    ensureSlotAttachmentState(s);
    const list = ensureSlotAttachments(s);
    const si = {
      slot: s,
      index: i,
      name: makeUniqueName(s && s.name ? s.name : `slot_${i}`, slotUsed, `slot_${i}`),
      attachments: [],
      sourceToExport: new Map(),
      exportToSource: new Map(),
      placeholderToExport: new Map(),
      setupAttachmentName: null,
      setupAttachmentKey: null,
      setupPlaceholderName: null,
      activeAttachmentName: null,
    };
    for (const a of list) {
      const srcName = String(a && a.name ? a.name : "").trim();
      if (!srcName) continue;
      const expName = makeUniqueName(srcName, attachmentUsed, `${si.name}_att`);
      const srcPlaceholder = String(a && a.placeholder ? a.placeholder : s && s.placeholderName ? s.placeholderName : srcName).trim() || srcName;
      si.attachments.push({
        sourceName: srcName,
        exportName: expName,
        sourcePlaceholder: srcPlaceholder,
        canvas: a.canvas,
        type: normalizeAttachmentType(a && a.type),
        linkedParent: a && a.linkedParent != null ? String(a.linkedParent) : "",
        pointX: Number(a && a.pointX) || 0,
        pointY: Number(a && a.pointY) || 0,
        pointRot: Number(a && a.pointRot) || 0,
        bboxSource: a && a.bboxSource === "contour" ? "contour" : "fill",
        sequence:
          a && a.sequence
            ? {
                enabled: !!a.sequence.enabled,
                count: Math.max(1, Math.round(Number(a.sequence.count) || 1)),
                start: Math.max(0, Math.round(Number(a.sequence.start) || 0)),
                digits: Math.max(1, Math.round(Number(a.sequence.digits) || 2)),
              }
            : { enabled: false, count: 1, start: 0, digits: 2 },
      });
      si.sourceToExport.set(srcName, expName);
      si.exportToSource.set(expName, srcName);
      if (srcPlaceholder && !si.placeholderToExport.has(srcPlaceholder)) si.placeholderToExport.set(srcPlaceholder, expName);
    }
    const setupSrc = String(s && s.attachmentName ? s.attachmentName : "").trim();
    const activeSrc = getSlotCurrentAttachmentName(s);
    si.setupAttachmentName =
      si.sourceToExport.get(setupSrc) || (si.attachments[0] ? si.attachments[0].exportName : null);
    const setupPlaceholderFromAttachment =
      (setupSrc && si.attachments.find((ae) => ae.sourceName === setupSrc)?.sourcePlaceholder) || "";
    si.setupPlaceholderName = String(s && s.placeholderName ? s.placeholderName : setupPlaceholderFromAttachment || setupSrc || "main");
    si.setupAttachmentKey = si.setupPlaceholderName || si.setupAttachmentName;
    si.activeAttachmentName = activeSrc ? si.sourceToExport.get(String(activeSrc)) || null : null;
    return si;
  });
  const clipTrackUsageBySlot = new Set();
  const clipEndTrackUsageBySlot = new Set();
  const clipEndValuesBySlot = new Map();
  for (const a of state.anim.animations || []) {
    const tracks = a && a.tracks ? a.tracks : {};
    for (const [trackId, keys] of Object.entries(tracks)) {
      const p = parseTrackId(trackId);
      if (!p || p.type !== "slot" || !Array.isArray(keys) || keys.length === 0) continue;
      if (p.prop === "clip") {
        clipTrackUsageBySlot.add(Number(p.slotIndex));
        continue;
      }
      if (p.prop === "clipEnd") {
        const si = Number(p.slotIndex);
        clipEndTrackUsageBySlot.add(si);
        if (!clipEndValuesBySlot.has(si)) clipEndValuesBySlot.set(si, new Set());
        const bucket = clipEndValuesBySlot.get(si);
        for (const k of keys) {
          const raw = k ? k.value : null;
          const endId = raw == null || raw === false || raw === "" ? "" : String(raw);
          bucket.add(endId);
        }
      }
    }
  }

  const outBones = bones.map((b, i) => {
    normalizeBoneChannels(b);
    const bone = { name: boneNames[i] };
    if (Number.isFinite(b.parent) && b.parent >= 0 && b.parent < bones.length) bone.parent = boneNames[b.parent];
    if (Number.isFinite(b.tx) && Math.abs(b.tx) > 1e-6) bone.x = Number(b.tx.toFixed(3));
    if (Number.isFinite(b.ty) && Math.abs(b.ty) > 1e-6) bone.y = Number(b.ty.toFixed(3));
    if (Number.isFinite(b.rot) && Math.abs(b.rot) > 1e-6) bone.rotation = Number(math.radToDeg(b.rot).toFixed(3));
    if (Number.isFinite(b.length) && b.length > 0) bone.length = Number(b.length.toFixed(3));
    if (Math.abs((Number(b.sx) || 1) - 1) > 1e-6) bone.scaleX = Number((Number(b.sx) || 1).toFixed(4));
    if (Math.abs((Number(b.sy) || 1) - 1) > 1e-6) bone.scaleY = Number((Number(b.sy) || 1).toFixed(4));
    if (Math.abs(Number(b.shx) || 0) > 1e-6) bone.shearX = Number(math.radToDeg(Number(b.shx) || 0).toFixed(4));
    if (Math.abs(Number(b.shy) || 0) > 1e-6) bone.shearY = Number(math.radToDeg(Number(b.shy) || 0).toFixed(4));
    const inheritMode = normalizeBoneInheritValue(b.inherit);
    if (inheritMode !== "normal") bone.inherit = inheritMode;
    return bone;
  });

  // Convert from canvas-style Y-down space to Spine Y-up space using a synthetic export root.
  const exportRootName = "__export_root_yup";
  outBones.unshift({
    name: exportRootName,
    y: Number((state.imageHeight || 0).toFixed(3)),
    scaleY: -1,
  });
  for (let i = 1; i < outBones.length; i += 1) {
    if (!outBones[i].parent) outBones[i].parent = exportRootName;
  }

  const outSlots = [];
  const outIk = [];
  const outTransform = [];
  const outPath = [];
  const slotExportInfos = [];
  let skippedPathForExport = 0;
  let skippedPathAttachmentForExport = 0;
  const skinDefault = {};
  const slotNameByIndex = new Map();
  const slotNameById = new Map();
  const clipVirtualBySlotIndex = new Map();
  const ikNameByIndex = new Map();
  const transformNameByIndex = new Map();
  const pathNameByIndex = new Map();
  const slotInfoByName = new Map();
  const ikUsed = new Set();
  const tfcUsed = new Set();
  const pthUsed = new Set();
  const virtualPathSlotUsed = new Set();
  const m = state.mesh;
  syncBindPose(m);
  const setupWorld = computeWorld(m.rigBones);
  const setupInvBind = setupWorld.map(invert);
  const hasVertexTrackByAnim = new Map();

  function round4(v) {
    return Number((Number(v) || 0).toFixed(4));
  }
  function applyCurveFromKey(row, key) {
    if (!row || !key) return;
    if (key.interp === "stepped") {
      row.curve = "stepped";
      return;
    }
    if (key.interp === "bezier" && Array.isArray(key.curve) && key.curve.length >= 4) {
      row.curve = [
        round4(math.clamp(Number(key.curve[0]) || 0, 0, 1)),
        round4(math.clamp(Number(key.curve[1]) || 0, 0, 1)),
        round4(math.clamp(Number(key.curve[2]) || 0, 0, 1)),
        round4(math.clamp(Number(key.curve[3]) || 0, 0, 1)),
      ];
    }
  }

  function getBoundaryHullCount(cols, rows) {
    const c = Math.max(1, Number(cols) || 1);
    const r = Math.max(1, Number(rows) || 1);
    return 2 * (c + r);
  }

  function canUseMeshAttachment(slot, sm, boneCount) {
    if (!slot || !sm) return false;
    const mode = getSlotWeightMode(slot);
    if (mode === "weighted") return true;
    if (mode === "single" && boneCount > 0 && sm.weights && sm.weights.length === (sm.positions.length / 2) * boneCount) {
      return true;
    }
    return false;
  }
  function buildPathAttachmentFromPoints(srcPoints, name, closed) {
    const src = Array.isArray(srcPoints) ? srcPoints : [];
    const pts = [];
    for (const p of src) {
      if (!p) continue;
      const np = normalizePathNode(p);
      const x = Number(np.x);
      const y = Number(np.y);
      if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
      if (pts.length > 0) {
        const prev = pts[pts.length - 1];
        if (Math.hypot(x - prev.x, y - prev.y) <= 1e-4) continue;
      }
      pts.push(np);
    }
    if (pts.length < 2) return null;
    const useClosed = !!closed;
    const curves = useClosed ? pts.length : pts.length - 1;
    if (curves <= 0) return null;
    const vertices = [round4(pts[0].x), round4(pts[0].y)];
    const lengths = [];
    for (let i = 0; i < curves; i += 1) {
      const a = pts[i];
      const b = pts[(i + 1) % pts.length];
      const c1x = Number.isFinite(Number(a.houtx)) ? Number(a.houtx) : a.x;
      const c1y = Number.isFinite(Number(a.houty)) ? Number(a.houty) : a.y;
      const c2x = Number.isFinite(Number(b.hinx)) ? Number(b.hinx) : b.x;
      const c2y = Number.isFinite(Number(b.hiny)) ? Number(b.hiny) : b.y;
      vertices.push(round4(c1x), round4(c1y), round4(c2x), round4(c2y), round4(b.x), round4(b.y));
      const l0 = Math.hypot(c1x - a.x, c1y - a.y);
      const l1 = Math.hypot(c2x - c1x, c2y - c1y);
      const l2 = Math.hypot(b.x - c2x, b.y - c2y);
      lengths.push(round4(l0 + l1 + l2));
    }
    return {
      name,
      type: "path",
      closed: useClosed,
      constantSpeed: false,
      vertexCount: 1 + curves * 3,
      vertices,
      lengths,
    };
  }
  function buildPathAttachmentFromSlotContour(slot, name, closed) {
    if (!slot) return null;
    const contour = ensureSlotContour(slot);
    const srcPointsLocal =
      Array.isArray(contour && contour.fillPoints) && contour.fillPoints.length >= 2
        ? contour.fillPoints
        : Array.isArray(contour && contour.points)
          ? contour.points
          : [];
    if (!Array.isArray(srcPointsLocal) || srcPointsLocal.length < 2) return null;
    // Convert slot-local contour to setup world (canvas space), then store under export-root path slot.
    const tm = getSlotTransformMatrix(slot, setupWorld);
    const srcPointsWorld = srcPointsLocal.map((p) => transformPoint(tm, Number(p && p.x) || 0, Number(p && p.y) || 0));
    return buildPathAttachmentFromPoints(srcPointsWorld, name, closed);
  }
  function buildPathAttachmentFromBoneChain(rigBones, targetBone, name, closed) {
    const pts = collectPathChainPoints(rigBones, Number(targetBone), !!closed);
    if (!Array.isArray(pts) || pts.length < 2) return null;
    return buildPathAttachmentFromPoints(pts, name, closed);
  }
  function buildBoundingBoxAttachmentFromSlot(slot, name, sourceMode = "fill") {
    if (!slot) return null;
    const contour = ensureSlotContour(slot);
    const srcLocal =
      sourceMode === "contour"
        ? Array.isArray(contour && contour.points)
          ? contour.points
          : []
        : Array.isArray(contour && contour.fillPoints) && contour.fillPoints.length >= 3
          ? contour.fillPoints
          : Array.isArray(contour && contour.points)
            ? contour.points
            : [];
    const tm = getSlotTransformMatrix(slot, setupWorld);
    const vertices = [];
    if (Array.isArray(srcLocal) && srcLocal.length >= 3) {
      for (const p of srcLocal) {
        const w = transformPoint(tm, Number(p && p.x) || 0, Number(p && p.y) || 0);
        vertices.push(round4(w.x), round4(w.y));
      }
    } else {
      const r = slot.rect || { x: 0, y: 0, w: slot.canvas ? slot.canvas.width : 1, h: slot.canvas ? slot.canvas.height : 1 };
      const pts = [
        { x: Number(r.x) || 0, y: Number(r.y) || 0 },
        { x: (Number(r.x) || 0) + (Number(r.w) || 1), y: Number(r.y) || 0 },
        { x: (Number(r.x) || 0) + (Number(r.w) || 1), y: (Number(r.y) || 0) + (Number(r.h) || 1) },
        { x: Number(r.x) || 0, y: (Number(r.y) || 0) + (Number(r.h) || 1) },
      ];
      for (const p of pts) {
        const w = transformPoint(tm, p.x, p.y);
        vertices.push(round4(w.x), round4(w.y));
      }
    }
    return {
      type: "boundingbox",
      vertexCount: Math.floor(vertices.length / 2),
      vertices,
    };
  }
  function buildPointAttachmentFromMeta(meta) {
    return {
      type: "point",
      x: round4(Number(meta && meta.pointX) || 0),
      y: round4(Number(meta && meta.pointY) || 0),
      rotation: round4(Number(meta && meta.pointRot) || 0),
      color: "ffd700ff",
    };
  }
  function applySequenceToAttachment(att, meta) {
    if (!att || !meta || !meta.sequence || !meta.sequence.enabled) return;
    att.sequence = {
      count: Math.max(1, Math.round(Number(meta.sequence.count) || 1)),
      start: Math.max(0, Math.round(Number(meta.sequence.start) || 0)),
      digits: Math.max(1, Math.round(Number(meta.sequence.digits) || 2)),
      setup: 0,
    };
  }
  function buildClippingAttachmentFromSlot(slot, endSlotName, name) {
    const ptsLocal = getSlotClipPointsLocal(slot);
    if (!Array.isArray(ptsLocal) || ptsLocal.length < 3) return null;
    const tm = getSlotTransformMatrix(slot, setupWorld);
    const vertices = [];
    for (const p of ptsLocal) {
      const w = transformPoint(tm, Number(p.x) || 0, Number(p.y) || 0);
      vertices.push(round4(w.x), round4(w.y));
    }
    const out = {
      name,
      type: "clipping",
      end: endSlotName || null,
      vertexCount: ptsLocal.length,
      vertices,
    };
    return out;
  }

  function buildMeshAttachment(slot, si, boneCount, boneIndexOffset = 0, canvasOverride = null) {
    ensureSlotMeshData(slot, m);
    const sm = slot.meshData;
    if (!sm) return null;
    const slotTm = getSlotTransformMatrix(slot, setupWorld);
    const vCount = sm.positions.length / 2;
    const weighted = boneCount > 0 && sm.weights && sm.weights.length === vCount * boneCount;
    const vertices = [];
    for (let i = 0; i < vCount; i += 1) {
      const x = sm.positions[i * 2];
      const y = sm.positions[i * 2 + 1];
      const p = transformPoint(slotTm, x, y);
      if (!weighted) {
        const boneIdx = Number.isFinite(slot.bone) && slot.bone >= 0 && slot.bone < boneCount ? slot.bone : 0;
        const local = boneCount > 0 ? transformPoint(setupInvBind[boneIdx], p.x, p.y) : p;
        vertices.push(round4(local.x), round4(local.y));
        continue;
      }
      const influences = [];
      let sum = 0;
      for (let b = 0; b < boneCount; b += 1) {
        const w = Number(sm.weights[i * boneCount + b]) || 0;
        if (w <= 1e-6) continue;
        const local = transformPoint(setupInvBind[b], p.x, p.y);
        influences.push({ bone: b, x: local.x, y: local.y, w });
        sum += w;
      }
      if (influences.length === 0) {
        const boneIdx = Number.isFinite(slot.bone) && slot.bone >= 0 && slot.bone < boneCount ? slot.bone : 0;
        const local = boneCount > 0 ? transformPoint(setupInvBind[boneIdx], p.x, p.y) : p;
        vertices.push(1, boneIdx + boneIndexOffset, round4(local.x), round4(local.y), 1);
      } else {
        const inv = sum > 1e-6 ? 1 / sum : 1;
        vertices.push(influences.length);
        for (const it of influences) {
          vertices.push(it.bone + boneIndexOffset, round4(it.x), round4(it.y), round4(it.w * inv));
        }
      }
    }
    const att = {
      type: "mesh",
      uvs: Array.from(sm.uvs, (v) => round4(v)),
      triangles: Array.from(sm.indices || [], (v) => Number(v) || 0),
      vertices,
      hull: getBoundaryHullCount(sm.cols, sm.rows),
      width: round4((canvasOverride || slot.canvas)?.width || (slot.rect?.w || 0)),
      height: round4((canvasOverride || slot.canvas)?.height || (slot.rect?.h || 0)),
    };
    slotInfoByName.set(si.name, { slot, si, sm, meshAttachment: att });
    return att;
  }

  for (const si of slotInfos) {
    const s = si.slot;
    if (s && s.id) slotNameById.set(String(s.id), si.name);
  }

  for (const si of slotInfos) {
    const s = si.slot;
    const bIdx = Number.isFinite(s.bone) && s.bone >= 0 && s.bone < bones.length ? s.bone : 0;
    const b = bones[bIdx] || bones[0];
    const rect = s.rect || { x: 0, y: 0, w: s.canvas ? s.canvas.width : 0, h: s.canvas ? s.canvas.height : 0 };
    const slotOut = {
      name: si.name,
      bone: boneNames[bIdx] || boneNames[0],
    };
    ensureSlotClipState(s);
    if (s.clipEnabled || clipTrackUsageBySlot.has(si.index) || clipEndTrackUsageBySlot.has(si.index)) {
      const clipSlotName = makeUniqueName(`${si.name}_clip`, slotUsed, `${si.name}_clip`);
      const setupEndId = s.clipEndSlotId ? String(s.clipEndSlotId) : "";
      const endIds = new Set([setupEndId]);
      const trackEndIds = clipEndValuesBySlot.get(si.index);
      if (trackEndIds) {
        for (const id of trackEndIds) endIds.add(String(id || ""));
      }
      const attachmentsByEnd = new Map();
      for (const endId of endIds) {
        const endSlotName = endId ? slotNameById.get(String(endId)) || null : null;
        const endToken = endSlotName || (endId ? `slot_${String(endId)}` : "end");
        const baseAttName = `${clipSlotName}_${endToken}_clip`;
        const clipAttName = makeUniqueName(baseAttName, attachmentUsed, `${clipSlotName}_clip`);
        const clipAtt = buildClippingAttachmentFromSlot(s, endSlotName, clipAttName);
        if (!clipAtt) continue;
        if (!skinDefault[clipSlotName]) skinDefault[clipSlotName] = {};
        skinDefault[clipSlotName][clipAttName] = clipAtt;
        attachmentsByEnd.set(String(endId || ""), clipAttName);
      }
      const defaultAttachmentName =
        attachmentsByEnd.get(setupEndId) || attachmentsByEnd.get("") || [...attachmentsByEnd.values()][0] || null;
      if (defaultAttachmentName) {
        clipVirtualBySlotIndex.set(si.index, {
          slotName: clipSlotName,
          setupEndId,
          defaultAttachmentName,
          attachmentsByEnd,
        });
        outSlots.push({
          name: clipSlotName,
          bone: exportRootName,
          attachment: defaultAttachmentName,
        });
      }
    }
    if (si.setupAttachmentKey) {
      slotOut.attachment = si.setupAttachmentKey;
    } else if (si.setupAttachmentName) {
      slotOut.attachment = si.setupAttachmentName;
    }
    const color = toSpineColor(
      Number.isFinite(s.r) ? s.r : 1,
      Number.isFinite(s.g) ? s.g : 1,
      Number.isFinite(s.b) ? s.b : 1,
      Number.isFinite(s.alpha) ? s.alpha : 1,
      true
    );
    if (color !== "ffffffff") slotOut.color = color;
    if (s.darkEnabled) {
      slotOut.dark = toSpineRgb(Number(s.dr) || 0, Number(s.dg) || 0, Number(s.db) || 0);
    }
    const slotBlend = normalizeSlotBlendMode(s && s.blend);
    if (slotBlend !== "normal") slotOut.blend = slotBlend;
    outSlots.push(slotOut);
    slotNameByIndex.set(si.index, si.name);

    if (!skinDefault[si.name]) skinDefault[si.name] = {};
    ensureSlotMeshData(s, m);
    const sm = s.meshData;
    const useMesh = canUseMeshAttachment(s, sm, m.rigBones.length);
    for (const ae of si.attachments) {
      const canvas = ae && ae.canvas ? ae.canvas : s.canvas;
      const aeType = normalizeAttachmentType(ae && ae.type);
      let att = null;
      if (aeType === "point") {
        att = buildPointAttachmentFromMeta(ae);
      } else if (aeType === "boundingbox") {
        att = buildBoundingBoxAttachmentFromSlot(s, ae.exportName, ae && ae.bboxSource === "contour" ? "contour" : "fill");
      } else if (aeType === "linkedmesh") {
        const parentSrc = String((ae && ae.linkedParent) || "").trim();
        const parentExport = parentSrc ? si.sourceToExport.get(parentSrc) || null : null;
        if (parentExport) {
          const width = canvas && canvas.width > 0 ? canvas.width : Math.max(1, rect.w || 1);
          const height = canvas && canvas.height > 0 ? canvas.height : Math.max(1, rect.h || 1);
          att = {
            type: "linkedmesh",
            parent: parentExport,
            skin: "default",
            deform: true,
            width: Number(width.toFixed(3)),
            height: Number(height.toFixed(3)),
          };
        }
      } else if ((aeType === "mesh" || aeType === "region") && useMesh) {
        att = buildMeshAttachment(s, si, m.rigBones.length, 1, canvas);
      }
      if (!att && (aeType === "region" || aeType === "mesh" || aeType === "linkedmesh")) {
        if (!canvas) continue;
        const width = canvas.width > 0 ? canvas.width : Math.max(1, rect.w || 1);
        const height = canvas.height > 0 ? canvas.height : Math.max(1, rect.h || 1);
        const cx = (Number(rect.x) || 0) + (Number(rect.w) || width) * 0.5 + (Number(s.tx) || 0);
        const cy = (Number(rect.y) || 0) + (Number(rect.h) || height) * 0.5 + (Number(s.ty) || 0);
        att = {
          x: Number((cx - (Number(b.tx) || 0)).toFixed(3)),
          y: Number((cy - (Number(b.ty) || 0)).toFixed(3)),
          rotation: Number(math.radToDeg(Number(s.rot) || 0).toFixed(3)),
          width: Number(width.toFixed(3)),
          height: Number(height.toFixed(3)),
        };
      }
      if (!att) continue;
      applySequenceToAttachment(att, ae);
      skinDefault[si.name][ae.exportName] = att;
      const phKey = String(ae.sourcePlaceholder || "").trim();
      if (phKey && !skinDefault[si.name][phKey]) {
        const aliasAtt = JSON.parse(JSON.stringify(att));
        if (phKey !== ae.exportName && aliasAtt && typeof aliasAtt === "object" && !Array.isArray(aliasAtt) && !aliasAtt.type) {
          aliasAtt.name = ae.exportName;
        }
        skinDefault[si.name][phKey] = aliasAtt;
      }
      if (canvas && (aeType === "region" || aeType === "mesh" || aeType === "linkedmesh")) {
        slotExportInfos.push({ slot: s, slotInfo: si, canvas, attachmentName: ae.exportName });
      }
    }
    if (si.setupAttachmentName && si.setupPlaceholderName && skinDefault[si.name][si.setupAttachmentName]) {
      const setupAlias = JSON.parse(JSON.stringify(skinDefault[si.name][si.setupAttachmentName]));
      if (
        si.setupPlaceholderName !== si.setupAttachmentName &&
        setupAlias &&
        typeof setupAlias === "object" &&
        !Array.isArray(setupAlias) &&
        !setupAlias.type
      ) {
        setupAlias.name = si.setupAttachmentName;
      }
      skinDefault[si.name][si.setupPlaceholderName] = setupAlias;
    }
  }

  if (Array.isArray(m.ikConstraints)) {
    for (let i = 0; i < m.ikConstraints.length; i += 1) {
      const c = m.ikConstraints[i];
      if (!c || c.enabled === false) continue;
      const chain = Array.isArray(c.bones) ? c.bones.filter((bi) => Number.isFinite(bi) && bi >= 0 && bi < bones.length) : [];
      const targetIdx = Number(c.target);
      if (chain.length === 0) continue;
      if (!Number.isFinite(targetIdx) || targetIdx < 0 || targetIdx >= bones.length) continue;
      if (chain.includes(targetIdx)) continue;
      const rawName = c.name || `ik_${i}`;
      const name = makeUniqueName(rawName, ikUsed, `ik_${i}`);
      ikNameByIndex.set(i, name);
      const item = {
        name,
        order: getConstraintOrder(c, i),
        bones: chain.map((bi) => boneNames[bi]),
        target: boneNames[targetIdx],
        mix: round4(math.clamp(Number(c.mix) || 0, 0, 1)),
        bendPositive: c.bendPositive !== false,
      };
      const softness = Math.max(0, Number(c.softness) || 0);
      if (softness > 1e-6) item.softness = round4(softness);
      if (c.compress) item.compress = true;
      if (c.stretch) item.stretch = true;
      if (!compat.stripIkUniform && c.uniform) item.uniform = true;
      if (c.skinRequired) item.skin = true;
      outIk.push(item);
    }
    outIk.sort((a, b) => getConstraintOrder(a, 0) - getConstraintOrder(b, 0));
  }
  if (Array.isArray(m.transformConstraints)) {
    const tList = ensureTransformConstraints(m);
    for (let i = 0; i < tList.length; i += 1) {
      const c = tList[i];
      if (!c || c.enabled === false) continue;
      const targetIdx = Number(c.target);
      if (!Number.isFinite(targetIdx) || targetIdx < 0 || targetIdx >= bones.length) continue;
      const chain = Array.isArray(c.bones) ? c.bones.filter((bi) => Number.isFinite(bi) && bi >= 0 && bi < bones.length) : [];
      if (chain.length === 0 || chain.includes(targetIdx)) continue;
      const name = makeUniqueName(c.name || `transform_${i}`, tfcUsed, `transform_${i}`);
      transformNameByIndex.set(i, name);
      outTransform.push({
        name,
        order: getConstraintOrder(c, i),
        skin: !!c.skinRequired,
        bones: chain.map((bi) => boneNames[bi]),
        target: boneNames[targetIdx],
        local: !!c.local,
        relative: !!c.relative,
        rotation: round4(Number(c.offsetRot) || 0),
        x: round4(Number(c.offsetX) || 0),
        y: round4(Number(c.offsetY) || 0),
        scaleX: round4(Number(c.offsetScaleX) || 0),
        scaleY: round4(Number(c.offsetScaleY) || 0),
        shearY: round4(Number(c.offsetShearY) || 0),
        rotateMix: round4(math.clamp(Number(c.rotateMix) || 0, 0, 1)),
        translateMix: round4(math.clamp(Number(c.translateMix) || 0, 0, 1)),
        scaleMix: round4(math.clamp(Number(c.scaleMix) || 0, 0, 1)),
        shearMix: round4(math.clamp(Number(c.shearMix) || 0, 0, 1)),
      });
    }
    outTransform.sort((a, b) => getConstraintOrder(a, 0) - getConstraintOrder(b, 0));
  }
  if (Array.isArray(m.pathConstraints)) {
    const pList = ensurePathConstraints(m);
    for (let i = 0; i < pList.length; i += 1) {
      const c = pList[i];
      if (!c || c.enabled === false) continue;
      const chain = Array.isArray(c.bones) ? c.bones.filter((bi) => Number.isFinite(bi) && bi >= 0 && bi < bones.length) : [];
      if (chain.length === 0) {
        skippedPathForExport += 1;
        continue;
      }
      const targetBoneIndex = Number(c.target);
      if (
        c.sourceType === "bone_chain" &&
        (!Number.isFinite(targetBoneIndex) || targetBoneIndex < 0 || targetBoneIndex >= bones.length)
      ) {
        skippedPathForExport += 1;
        continue;
      }
      const targetSlotIndex = Number(c.targetSlot);
      if (c.sourceType === "slot" && (!Number.isFinite(targetSlotIndex) || targetSlotIndex < 0 || targetSlotIndex >= slotInfos.length)) {
        skippedPathForExport += 1;
        continue;
      }
      const name = makeUniqueName(c.name || `path_${i}`, pthUsed, `path_${i}`);
      pathNameByIndex.set(i, name);
      const pathAttName = `${name}_path`;
      const srcSlotInfo =
        Number.isFinite(targetSlotIndex) && targetSlotIndex >= 0 && targetSlotIndex < slotInfos.length ? slotInfos[targetSlotIndex] : null;
      const pathSlotName = makeUniqueName(`${name}_slot`, virtualPathSlotUsed, `${name}_slot`);
      // Keep path data in a stable export-root space (Spine Y-up root inversion handled by exportRoot transform).
      const pathSlotBone = exportRootName;
      const pathAtt =
        c.sourceType === "drawn"
          ? buildPathAttachmentFromPoints(c.points, pathAttName, !!c.closed)
          : c.sourceType === "bone_chain"
            ? buildPathAttachmentFromBoneChain(m.rigBones, targetBoneIndex, pathAttName, !!c.closed)
          : srcSlotInfo
            ? buildPathAttachmentFromSlotContour(srcSlotInfo.slot, pathAttName, !!c.closed)
            : null;
      if (!pathAtt) {
        skippedPathAttachmentForExport += 1;
        skippedPathForExport += 1;
        continue;
      }
      outPath.push({
        name,
        order: getConstraintOrder(c, i),
        skin: !!c.skinRequired,
        bones: chain.map((bi) => boneNames[bi]),
        target: pathSlotName,
        positionMode: c.positionMode === "percent" ? "percent" : "fixed",
        spacingMode:
          c.spacingMode === "fixed"
            ? "fixed"
            : c.spacingMode === "percent"
              ? "percent"
              : c.spacingMode === "proportional"
                ? "proportional"
                : "length",
        rotateMode: c.rotateMode === "chain" ? "chain" : c.rotateMode === "chainScale" ? "chainScale" : "tangent",
        rotation: 0,
        position: round4(Number(c.position) || 0),
        spacing: round4(Number(c.spacing) || 0),
        rotateMix: round4(math.clamp(Number(c.rotateMix) || 0, 0, 1)),
        translateMix: round4(math.clamp(Number(c.translateMix) || 0, 0, 1)),
      });
      outSlots.push({
        name: pathSlotName,
        bone: pathSlotBone,
        attachment: pathAttName,
      });
      if (!skinDefault[pathSlotName]) skinDefault[pathSlotName] = {};
      skinDefault[pathSlotName][pathAttName] = pathAtt;
    }
    outPath.sort((a, b) => getConstraintOrder(a, 0) - getConstraintOrder(b, 0));
  }

  const animations = {};
  const eventDefs = {};
  let hasVertexTrack = false;
  let hasWeightedSlot = false;
  for (const s of state.slots || []) {
    if (!s) continue;
    const wm = getSlotWeightMode(s);
    if (wm === "weighted") {
      hasWeightedSlot = true;
      break;
    }
  }

  function pruneTimeline(rows, isDefault) {
    const list = Array.isArray(rows) ? rows : [];
    if (list.length === 0) return [];
    const EPS = 1e-4;
    const allDefault = list.every((r) => isDefault(r, EPS));
    if (allDefault) return [];
    if (list.length === 1) {
      const r = list[0];
      if ((Number(r.time) || 0) <= EPS && isDefault(r, EPS)) return [];
    }
    return list;
  }

  for (const a of state.anim.animations || []) {
    const animName = makeUniqueName(a && a.name ? a.name : "Anim", animUsed, "Anim");
    const animOut = {};
    const bonesOut = {};
    const eventRows = [];
    const tracks = a && a.tracks ? a.tracks : {};
    const vertexRowsBySlot = new Map();
    const ikRowsByConstraint = new Map();
    const tfcRowsByConstraint = new Map();
    const pthRowsByConstraint = new Map();
    const slotColorRowsBySlot = new Map();
    const slotAttachmentRowsBySlot = new Map();
    const slotClipRowsBySlot = new Map();
    const slotClipEndRowsBySlot = new Map();
    const drawOrderRows = [];
    for (const [trackId, keys] of Object.entries(tracks)) {
      const parsed = parseTrackId(trackId);
      if (parsed && parsed.type === "vertex" && Array.isArray(keys) && keys.length > 0) {
        hasVertexTrack = true;
        for (const k of keys) {
          const si = Number.isFinite(k.slotIndex)
            ? Number(k.slotIndex)
            : Number.isFinite(parsed.slotIndex)
              ? Number(parsed.slotIndex)
              : -1;
          if (si < 0 || si >= slotInfos.length) continue;
          if (!vertexRowsBySlot.has(si)) vertexRowsBySlot.set(si, []);
          vertexRowsBySlot.get(si).push(k);
        }
      }
      if (parsed && parsed.type === "ik" && Array.isArray(keys) && keys.length > 0) {
        const ikIdx = parsed.ikIndex;
        if (!Number.isFinite(ikIdx) || ikIdx < 0 || ikIdx >= m.ikConstraints.length) continue;
        const ikName = ikNameByIndex.get(ikIdx);
        if (!ikName) continue;
        if (!ikRowsByConstraint.has(ikName)) {
          ikRowsByConstraint.set(ikName, { mix: [], softness: [], bend: [], compress: [], stretch: [], uniform: [] });
        }
        const bucket = ikRowsByConstraint.get(ikName);
        const rows = keys
          .map((k) => ({
            time: Number((Number(k.time) || 0).toFixed(4)),
            value:
              parsed.prop === "mix"
                ? math.clamp(Number(k.value) || 0, 0, 1)
                : parsed.prop === "softness"
                  ? Math.max(0, Number(k.value) || 0)
                : parsed.prop === "bend"
                  ? k.value === true || Number(k.value) >= 0
                  : parsed.prop === "compress" || parsed.prop === "stretch" || parsed.prop === "uniform"
                    ? k.value === true || Number(k.value) > 0
                  : null,
            interp: k.interp === "stepped" ? "stepped" : k.interp === "bezier" ? "bezier" : "linear",
            curve: Array.isArray(k.curve) && k.curve.length >= 4 ? k.curve.slice(0, 4) : null,
          }))
          .filter((r) => r.value != null)
          .sort((a, b) => a.time - b.time);
        if (parsed.prop === "mix") bucket.mix.push(...rows);
        else if (parsed.prop === "softness") bucket.softness.push(...rows);
        else if (parsed.prop === "bend") bucket.bend.push(...rows);
        else if (parsed.prop === "compress") bucket.compress.push(...rows);
        else if (parsed.prop === "stretch") bucket.stretch.push(...rows);
        else if (parsed.prop === "uniform") bucket.uniform.push(...rows);
      }
      if (parsed && parsed.type === "tfc" && Array.isArray(keys) && keys.length > 0) {
        const tIdx = parsed.transformIndex;
        const cName = transformNameByIndex.get(tIdx);
        if (!cName) continue;
        if (!tfcRowsByConstraint.has(cName)) {
          tfcRowsByConstraint.set(cName, { rotateMix: [], translateMix: [], scaleMix: [], shearMix: [] });
        }
        const bucket = tfcRowsByConstraint.get(cName);
        const rows = keys
          .map((k) => ({
            time: Number((Number(k.time) || 0).toFixed(4)),
            value: math.clamp(Number(k.value) || 0, 0, 1),
            interp: k.interp === "stepped" ? "stepped" : k.interp === "bezier" ? "bezier" : "linear",
            curve: Array.isArray(k.curve) && k.curve.length >= 4 ? k.curve.slice(0, 4) : null,
          }))
          .sort((a, b) => a.time - b.time);
        if (parsed.prop === "rotateMix") bucket.rotateMix.push(...rows);
        else if (parsed.prop === "translateMix") bucket.translateMix.push(...rows);
        else if (parsed.prop === "scaleMix") bucket.scaleMix.push(...rows);
        else if (parsed.prop === "shearMix") bucket.shearMix.push(...rows);
      }
      if (parsed && parsed.type === "pth" && Array.isArray(keys) && keys.length > 0) {
        const pIdx = parsed.pathIndex;
        const cName = pathNameByIndex.get(pIdx);
        if (!cName) continue;
        if (!pthRowsByConstraint.has(cName)) {
          pthRowsByConstraint.set(cName, { position: [], spacing: [], rotateMix: [], translateMix: [] });
        }
        const bucket = pthRowsByConstraint.get(cName);
        const rows = keys
          .map((k) => ({
            time: Number((Number(k.time) || 0).toFixed(4)),
            value:
              parsed.prop === "rotateMix" || parsed.prop === "translateMix"
                ? math.clamp(Number(k.value) || 0, 0, 1)
                : Number(k.value) || 0,
            interp: k.interp === "stepped" ? "stepped" : k.interp === "bezier" ? "bezier" : "linear",
            curve: Array.isArray(k.curve) && k.curve.length >= 4 ? k.curve.slice(0, 4) : null,
          }))
          .sort((a, b) => a.time - b.time);
        if (parsed.prop === "position") bucket.position.push(...rows);
        else if (parsed.prop === "spacing") bucket.spacing.push(...rows);
        else if (parsed.prop === "rotateMix") bucket.rotateMix.push(...rows);
        else if (parsed.prop === "translateMix") bucket.translateMix.push(...rows);
      }
      if (parsed && parsed.type === "event" && Array.isArray(keys) && keys.length > 0) {
        const rows = keys
          .map((k) => {
            const v = k && k.value && typeof k.value === "object" ? k.value : {};
            const name = String(v.name || "event").trim() || "event";
            const row = { time: Number((Number(k.time) || 0).toFixed(4)), name };
            if (Number(v.int) || 0) row.int = Number(v.int) || 0;
            if (Math.abs(Number(v.float) || 0) > 1e-6) row.float = Number((Number(v.float) || 0).toFixed(4));
            if (v.string != null && String(v.string).length > 0) row.string = String(v.string);
            eventDefs[name] = eventDefs[name] || {};
            if ("int" in row) eventDefs[name].int = row.int;
            if ("float" in row) eventDefs[name].float = row.float;
            if ("string" in row) eventDefs[name].string = row.string;
            return row;
          })
          .sort((aa, bb) => aa.time - bb.time);
        eventRows.push(...rows);
      }
      if (parsed && parsed.type === "draworder" && Array.isArray(keys) && keys.length > 0) {
        const rows = keys
          .map((k) => ({
            time: Number((Number(k.time) || 0).toFixed(4)),
            value: Array.isArray(k.value) ? k.value.map((id) => String(id)) : [],
          }))
          .sort((aa, bb) => aa.time - bb.time);
        drawOrderRows.push(...rows);
      }
      if (parsed && parsed.type === "slot" && parsed.prop === "color" && Array.isArray(keys) && keys.length > 0) {
        const si = parsed.slotIndex;
        if (!Number.isFinite(si) || si < 0 || si >= slotInfos.length) continue;
        if (!slotColorRowsBySlot.has(si)) slotColorRowsBySlot.set(si, []);
        const rows = keys
          .map((k) => {
            const v = k && typeof k.value === "object" ? k.value : {};
            const row = {
              time: Number((Number(k.time) || 0).toFixed(4)),
              color: toSpineColor(Number(v.r) || 1, Number(v.g) || 1, Number(v.b) || 1, Number(v.a) || 1, true),
              darkEnabled: !!v.darkEnabled,
              dark: toSpineRgb(Number(v.dr) || 0, Number(v.dg) || 0, Number(v.db) || 0),
            };
            applyCurveFromKey(row, k);
            return row;
          })
          .sort((aa, bb) => aa.time - bb.time);
        slotColorRowsBySlot.get(si).push(...rows);
      }
      if (parsed && parsed.type === "slot" && parsed.prop === "attachment" && Array.isArray(keys) && keys.length > 0) {
        const si = parsed.slotIndex;
        if (!Number.isFinite(si) || si < 0 || si >= slotInfos.length) continue;
        if (!slotAttachmentRowsBySlot.has(si)) slotAttachmentRowsBySlot.set(si, []);
        const siInfo = slotInfos[si];
        const setupAttachment = siInfo ? siInfo.setupAttachmentKey || siInfo.setupAttachmentName : null;
        const rows = keys
          .map((k) => {
            const raw = k ? k.value : null;
            let name = null;
            if (raw == null || raw === false || raw === "") {
              name = null;
            } else if (raw === true) {
              name = setupAttachment;
            } else {
              const as = String(raw);
              name =
                (siInfo && siInfo.sourceToExport && siInfo.sourceToExport.get(as)) ||
                (siInfo && siInfo.placeholderToExport && siInfo.placeholderToExport.has(as) ? as : null) ||
                (siInfo && siInfo.exportToSource && siInfo.exportToSource.has(as) ? as : null);
            }
            return {
              time: Number((Number(k.time) || 0).toFixed(4)),
              name,
            };
          })
          .sort((aa, bb) => aa.time - bb.time);
        slotAttachmentRowsBySlot.get(si).push(...rows);
      }
      if (parsed && parsed.type === "slot" && parsed.prop === "clip" && Array.isArray(keys) && keys.length > 0) {
        const si = parsed.slotIndex;
        if (!Number.isFinite(si) || si < 0 || si >= slotInfos.length) continue;
        if (!slotClipRowsBySlot.has(si)) slotClipRowsBySlot.set(si, []);
        const rows = keys
          .map((k) => ({
            time: Number((Number(k.time) || 0).toFixed(4)),
            enabled: k && (k.value === true || Number(k.value) > 0),
          }))
          .sort((aa, bb) => aa.time - bb.time);
        slotClipRowsBySlot.get(si).push(...rows);
      }
      if (parsed && parsed.type === "slot" && parsed.prop === "clipEnd" && Array.isArray(keys) && keys.length > 0) {
        const si = parsed.slotIndex;
        if (!Number.isFinite(si) || si < 0 || si >= slotInfos.length) continue;
        if (!slotClipEndRowsBySlot.has(si)) slotClipEndRowsBySlot.set(si, []);
        const rows = keys
          .map((k) => {
            const raw = k ? k.value : null;
            const endId = raw == null || raw === false || raw === "" ? "" : String(raw);
            return {
              time: Number((Number(k.time) || 0).toFixed(4)),
              endId,
            };
          })
          .sort((aa, bb) => aa.time - bb.time);
        slotClipEndRowsBySlot.get(si).push(...rows);
      }
      if (!parsed || parsed.type !== "bone" || !Array.isArray(keys) || keys.length === 0) continue;
      const bi = parsed.boneIndex;
      if (!Number.isFinite(bi) || bi < 0 || bi >= bones.length) continue;
      const bName = boneNames[bi];
      if (!bonesOut[bName]) bonesOut[bName] = {};
      if (parsed.prop === "translate") {
        const setupX = Number(bones[bi].tx) || 0;
        const setupY = Number(bones[bi].ty) || 0;
        const rows = keys.map((k) => {
          const v = k && typeof k.value === "object" ? k.value : {};
          const row = {
            time: Number((Number(k.time) || 0).toFixed(4)),
            x: Number(((Number(v.x) || 0) - setupX).toFixed(4)),
            y: Number(((Number(v.y) || 0) - setupY).toFixed(4)),
          };
          applyCurveFromKey(row, k);
          return row;
        });
        const pruned = pruneTimeline(rows, (r, eps) => Math.abs(Number(r.x) || 0) <= eps && Math.abs(Number(r.y) || 0) <= eps);
        if (pruned.length > 0) bonesOut[bName].translate = pruned;
      } else if (parsed.prop === "rotate") {
        const setupRotDeg = math.radToDeg(Number(bones[bi].rot) || 0);
        const rows = keys.map((k) => {
          const row = {
            time: Number((Number(k.time) || 0).toFixed(4)),
            value: Number((math.radToDeg(Number(k.value) || 0) - setupRotDeg).toFixed(4)),
          };
          applyCurveFromKey(row, k);
          return row;
        });
        const pruned = pruneTimeline(rows, (r, eps) => Math.abs(Number(r.value) || 0) <= eps);
        if (pruned.length > 0) bonesOut[bName].rotate = pruned;
      } else if (parsed.prop === "scale") {
        const baseLen = Math.max(1e-6, Number(bones[bi].length) || 1);
        const rows = keys.map((k) => {
          const ratio = (Number(k.value) || baseLen) / baseLen;
          const row = {
            time: Number((Number(k.time) || 0).toFixed(4)),
            x: Number(ratio.toFixed(4)),
            y: Number(ratio.toFixed(4)),
          };
          applyCurveFromKey(row, k);
          return row;
        });
        const pruned = pruneTimeline(rows, (r, eps) => Math.abs((Number(r.x) || 1) - 1) <= eps && Math.abs((Number(r.y) || 1) - 1) <= eps);
        if (pruned.length > 0) bonesOut[bName].scale = pruned;
      } else if (parsed.prop === "scaleX" || parsed.prop === "scaleY") {
        const axis = parsed.prop === "scaleX" ? "x" : "y";
        const other = axis === "x" ? "y" : "x";
        const setup = Number(axis === "x" ? bones[bi].sx : bones[bi].sy);
        const setupSafe = Math.abs(setup) > 1e-6 ? setup : 1;
        const existing = Array.isArray(bonesOut[bName].scale) ? [...bonesOut[bName].scale] : [];
        const byTime = new Map(existing.map((r) => [Number((Number(r.time) || 0).toFixed(4)), { ...r }]));
        for (const k of keys) {
          const t = Number((Number(k.time) || 0).toFixed(4));
          const row = byTime.get(t) || { time: t, x: 1, y: 1 };
          row[axis] = Number(((Number(k.value) || setupSafe) / setupSafe).toFixed(4));
          applyCurveFromKey(row, k);
          byTime.set(t, row);
        }
        const merged = [...byTime.values()].sort((a, b) => a.time - b.time).map((r) => {
          const nr = { ...r };
          if (!Number.isFinite(nr[other])) nr[other] = 1;
          return nr;
        });
        const pruned = pruneTimeline(
          merged,
          (r, eps) => Math.abs((Number(r.x) || 1) - 1) <= eps && Math.abs((Number(r.y) || 1) - 1) <= eps
        );
        if (pruned.length > 0) bonesOut[bName].scale = pruned;
      } else if (parsed.prop === "shearX" || parsed.prop === "shearY") {
        const axis = parsed.prop === "shearX" ? "x" : "y";
        const other = axis === "x" ? "y" : "x";
        const setupDeg = math.radToDeg(Number(axis === "x" ? bones[bi].shx : bones[bi].shy) || 0);
        const existing = Array.isArray(bonesOut[bName].shear) ? [...bonesOut[bName].shear] : [];
        const byTime = new Map(existing.map((r) => [Number((Number(r.time) || 0).toFixed(4)), { ...r }]));
        for (const k of keys) {
          const t = Number((Number(k.time) || 0).toFixed(4));
          const row = byTime.get(t) || { time: t, x: 0, y: 0 };
          row[axis] = Number((math.radToDeg(Number(k.value) || 0) - setupDeg).toFixed(4));
          applyCurveFromKey(row, k);
          byTime.set(t, row);
        }
        const merged = [...byTime.values()].sort((a, b) => a.time - b.time).map((r) => {
          const nr = { ...r };
          if (!Number.isFinite(nr[other])) nr[other] = 0;
          return nr;
        });
        const pruned = pruneTimeline(
          merged,
          (r, eps) => Math.abs(Number(r.x) || 0) <= eps && Math.abs(Number(r.y) || 0) <= eps
        );
        if (pruned.length > 0) bonesOut[bName].shear = pruned;
      }
    }
    for (const [bn, t] of Object.entries(bonesOut)) {
      if (!t || Object.keys(t).length === 0) delete bonesOut[bn];
    }
    if (Object.keys(bonesOut).length > 0) animOut.bones = bonesOut;
    if (eventRows.length > 0) {
      const byTime = new Map();
      for (const r of eventRows) {
        const k = `${r.time}::${r.name}`;
        byTime.set(k, r);
      }
      animOut.events = [...byTime.values()].sort((aa, bb) => (Number(aa.time) || 0) - (Number(bb.time) || 0));
    }
    if (slotColorRowsBySlot.size > 0 || slotAttachmentRowsBySlot.size > 0 || slotClipRowsBySlot.size > 0 || slotClipEndRowsBySlot.size > 0) {
      const slotsOut = {};
      for (const [si, rows] of slotColorRowsBySlot.entries()) {
        const slotName = slotNameByIndex.get(si);
        if (!slotName) continue;
        const slotSetup = slotInfos[si] ? slotInfos[si].slot : null;
        const setupDarkEnabled = !!(slotSetup && slotSetup.darkEnabled);
        const setupDark = toSpineRgb(
          Number(slotSetup && slotSetup.dr) || 0,
          Number(slotSetup && slotSetup.dg) || 0,
          Number(slotSetup && slotSetup.db) || 0
        );
        const sorted = [...rows].sort((aa, bb) => (Number(aa.time) || 0) - (Number(bb.time) || 0));
        if (sorted.length > 0) {
          const byTime = new Map();
          for (const r of sorted) byTime.set(`${r.time}`, r);
          const uniq = [...byTime.values()];
          const hasDarkKeys = setupDarkEnabled || uniq.some((r) => r && r.darkEnabled);
          if (!slotsOut[slotName]) slotsOut[slotName] = {};
          if (hasDarkKeys) {
            slotsOut[slotName].twoColor = uniq.map((r) => {
              const row = {
                time: Number((Number(r.time) || 0).toFixed(4)),
                light: String(r && r.color ? r.color : "ffffffff"),
                dark: String(
                  r && r.darkEnabled ? (r.dark || setupDark || "000000") : (setupDarkEnabled ? setupDark : "000000")
                ),
              };
              if (r && r.curve != null) row.curve = r.curve;
              return row;
            });
          } else {
            slotsOut[slotName].color = uniq;
          }
        }
      }
      for (const [si, rows] of slotAttachmentRowsBySlot.entries()) {
        const slotName = slotNameByIndex.get(si);
        if (!slotName) continue;
        const sorted = [...rows].sort((aa, bb) => (Number(aa.time) || 0) - (Number(bb.time) || 0));
        if (sorted.length > 0) {
          const byTime = new Map();
          for (const r of sorted) byTime.set(`${r.time}`, r);
          if (!slotsOut[slotName]) slotsOut[slotName] = {};
          slotsOut[slotName].attachment = [...byTime.values()];
        }
      }
      const clipSlotsToProcess = new Set([...slotClipRowsBySlot.keys(), ...slotClipEndRowsBySlot.keys()]);
      for (const si of clipSlotsToProcess) {
        const clipRef = clipVirtualBySlotIndex.get(si);
        if (!clipRef) continue;
        const clipRows = [...(slotClipRowsBySlot.get(si) || [])].sort((aa, bb) => (Number(aa.time) || 0) - (Number(bb.time) || 0));
        const endRows = [...(slotClipEndRowsBySlot.get(si) || [])].sort((aa, bb) => (Number(aa.time) || 0) - (Number(bb.time) || 0));
        if (clipRows.length <= 0 && endRows.length <= 0) continue;
        const setupSlot = slotInfos[si] ? slotInfos[si].slot : null;
        const setupClipEnabled = !!(setupSlot && setupSlot.clipEnabled);
        const setupEndId = clipRef.setupEndId != null ? String(clipRef.setupEndId) : "";
        const sampleStepped = (rows, t, fallback, valueKey) => {
          let out = fallback;
          for (const row of rows) {
            const tt = Number(row && row.time);
            if (!Number.isFinite(tt) || tt > t + 1e-6) break;
            out = row[valueKey];
          }
          return out;
        };
        const times = [...new Set([...clipRows.map((r) => Number((Number(r.time) || 0).toFixed(4))), ...endRows.map((r) => Number((Number(r.time) || 0).toFixed(4)))])]
          .sort((a, b) => a - b);
        const outRows = [];
        let prevName = Symbol("init");
        for (const t of times) {
          const enabled = sampleStepped(clipRows, t, setupClipEnabled, "enabled");
          const endId = String(sampleStepped(endRows, t, setupEndId, "endId") || "");
          const clipAttName =
            clipRef.attachmentsByEnd.get(endId) ||
            clipRef.attachmentsByEnd.get("") ||
            clipRef.defaultAttachmentName ||
            null;
          const name = enabled ? clipAttName : null;
          if (name === prevName) continue;
          outRows.push({ time: Number((Number(t) || 0).toFixed(4)), name });
          prevName = name;
        }
        if (outRows.length <= 0) continue;
        if (!slotsOut[clipRef.slotName]) slotsOut[clipRef.slotName] = {};
        slotsOut[clipRef.slotName].attachment = outRows;
      }
      if (Object.keys(slotsOut).length > 0) animOut.slots = slotsOut;
    }
    if (drawOrderRows.length > 0) {
      const setupOrder = slotInfos.map((si) => si.slot && si.slot.id).filter(Boolean);
      const setupNameById = new Map();
      for (const si of slotInfos) {
        if (si && si.slot && si.slot.id) setupNameById.set(si.slot.id, si.name);
      }
      const outRows = [];
      for (const r of drawOrderRows.sort((aa, bb) => aa.time - bb.time)) {
        const ids = Array.isArray(r.value) ? r.value : [];
        const targetIds = ids.filter((id) => setupNameById.has(id));
        if (targetIds.length !== setupOrder.length) continue;
        const offsets = [];
        for (let ti = 0; ti < targetIds.length; ti += 1) {
          const id = targetIds[ti];
          const oi = setupOrder.indexOf(id);
          if (oi < 0 || oi === ti) continue;
          offsets.push({ slot: setupNameById.get(id), offset: ti - oi });
        }
        const row = { time: Number((Number(r.time) || 0).toFixed(4)) };
        if (offsets.length > 0) row.offsets = offsets;
        outRows.push(row);
      }
      if (outRows.length > 0) animOut.drawOrder = outRows;
    }

    if (ikRowsByConstraint.size > 0) {
      const ikOut = {};
      for (const [ikName, data] of ikRowsByConstraint.entries()) {
        const ikSetup = (m.ikConstraints || []).find((c) => c && c.name === ikName);
        const setupMix = math.clamp(Number(ikSetup && ikSetup.mix) || 0, 0, 1);
        const setupSoftness = Math.max(0, Number(ikSetup && ikSetup.softness) || 0);
        const setupBend = ikSetup ? ikSetup.bendPositive !== false : true;
        const setupCompress = !!(ikSetup && ikSetup.compress);
        const setupStretch = !!(ikSetup && ikSetup.stretch);
        const setupUniform = !!(ikSetup && ikSetup.uniform);
        const byTime = new Map();
        for (const r of data.mix || []) {
          const row = byTime.get(r.time) || { time: r.time };
          row.mix = Number((Number(r.value) || 0).toFixed(4));
          if (r.interp === "stepped") row.curve = "stepped";
          else if (r.interp === "bezier" && Array.isArray(r.curve) && r.curve.length >= 4) row.curve = r.curve.slice(0, 4);
          byTime.set(r.time, row);
        }
        for (const r of data.softness || []) {
          const row = byTime.get(r.time) || { time: r.time };
          row.softness = Number((Math.max(0, Number(r.value) || 0)).toFixed(4));
          if (r.interp === "stepped") row.curve = "stepped";
          else if (r.interp === "bezier" && Array.isArray(r.curve) && r.curve.length >= 4) row.curve = r.curve.slice(0, 4);
          byTime.set(r.time, row);
        }
        for (const r of data.bend || []) {
          const row = byTime.get(r.time) || { time: r.time };
          row.bendPositive = r.value === true;
          if (r.interp === "stepped") row.curve = "stepped";
          else if (r.interp === "bezier" && Array.isArray(r.curve) && r.curve.length >= 4) row.curve = r.curve.slice(0, 4);
          byTime.set(r.time, row);
        }
        for (const r of data.compress || []) {
          const row = byTime.get(r.time) || { time: r.time };
          row.compress = r.value === true;
          row.curve = "stepped";
          byTime.set(r.time, row);
        }
        for (const r of data.stretch || []) {
          const row = byTime.get(r.time) || { time: r.time };
          row.stretch = r.value === true;
          row.curve = "stepped";
          byTime.set(r.time, row);
        }
        for (const r of data.uniform || []) {
          const row = byTime.get(r.time) || { time: r.time };
          row.uniform = r.value === true;
          row.curve = "stepped";
          byTime.set(r.time, row);
        }
        const merged = [...byTime.values()]
          .sort((a, b) => a.time - b.time)
          .map((r) => {
            const out = { time: Number((Number(r.time) || 0).toFixed(4)) };
            if (r.mix != null) out.mix = Number((Number(r.mix) || 0).toFixed(4));
            if (r.softness != null) out.softness = Number(Math.max(0, Number(r.softness) || 0).toFixed(4));
            if (r.bendPositive != null) out.bendPositive = !!r.bendPositive;
            if (r.compress != null) out.compress = !!r.compress;
            if (r.stretch != null) out.stretch = !!r.stretch;
            if (r.uniform != null) out.uniform = !!r.uniform;
            if (r.curve === "stepped") out.curve = "stepped";
            else if (Array.isArray(r.curve) && r.curve.length >= 4) out.curve = r.curve.slice(0, 4);
            return out;
          });
        const pruned = pruneTimeline(
          merged,
          (r, eps) =>
            Math.abs((r.mix != null ? Number(r.mix) : setupMix) - setupMix) <= eps &&
            Math.abs((r.softness != null ? Number(r.softness) : setupSoftness) - setupSoftness) <= eps &&
            ((r.bendPositive != null ? !!r.bendPositive : setupBend) === setupBend) &&
            ((r.compress != null ? !!r.compress : setupCompress) === setupCompress) &&
            ((r.stretch != null ? !!r.stretch : setupStretch) === setupStretch) &&
            ((r.uniform != null ? !!r.uniform : setupUniform) === setupUniform)
        );
        if (pruned.length > 0) ikOut[ikName] = pruned;
      }
      if (Object.keys(ikOut).length > 0) animOut.ik = ikOut;
    }
    if (tfcRowsByConstraint.size > 0) {
      const tfcOut = {};
      for (const [name, data] of tfcRowsByConstraint.entries()) {
        const setup = (m.transformConstraints || []).find((c) => c && c.name === name);
        const byTime = new Map();
        const fold = (list, field, setupValue) => {
          for (const r of list || []) {
            const row = byTime.get(r.time) || { time: r.time };
            row[field] = Number((Number(r.value) || 0).toFixed(4));
            if (r.interp === "stepped") row.curve = "stepped";
            else if (r.interp === "bezier" && Array.isArray(r.curve) && r.curve.length >= 4) row.curve = r.curve.slice(0, 4);
            byTime.set(r.time, row);
          }
          return setupValue;
        };
        const sR = fold(data.rotateMix, "rotateMix", Number(setup && setup.rotateMix) || 0);
        const sT = fold(data.translateMix, "translateMix", Number(setup && setup.translateMix) || 0);
        const sS = fold(data.scaleMix, "scaleMix", Number(setup && setup.scaleMix) || 0);
        const sH = fold(data.shearMix, "shearMix", Number(setup && setup.shearMix) || 0);
        let cr = sR;
        let ct = sT;
        let cs = sS;
        let ch = sH;
        const merged = [...byTime.values()]
          .sort((a, b) => a.time - b.time)
          .map((r) => {
            if (r.rotateMix != null) cr = Number(r.rotateMix) || 0;
            if (r.translateMix != null) ct = Number(r.translateMix) || 0;
            if (r.scaleMix != null) cs = Number(r.scaleMix) || 0;
            if (r.shearMix != null) ch = Number(r.shearMix) || 0;
            const out = {
              time: Number((Number(r.time) || 0).toFixed(4)),
              rotateMix: Number(cr.toFixed(4)),
              translateMix: Number(ct.toFixed(4)),
              scaleMix: Number(cs.toFixed(4)),
              shearMix: Number(ch.toFixed(4)),
            };
            if (r.curve === "stepped") out.curve = "stepped";
            else if (Array.isArray(r.curve) && r.curve.length >= 4) out.curve = r.curve.slice(0, 4);
            return out;
          });
        const pruned = pruneTimeline(
          merged,
          (r, eps) =>
            Math.abs((Number(r.rotateMix) || 0) - sR) <= eps &&
            Math.abs((Number(r.translateMix) || 0) - sT) <= eps &&
            Math.abs((Number(r.scaleMix) || 0) - sS) <= eps &&
            Math.abs((Number(r.shearMix) || 0) - sH) <= eps
        );
        if (pruned.length > 0) tfcOut[name] = pruned;
      }
      if (Object.keys(tfcOut).length > 0) animOut.transform = tfcOut;
    }
    if (pthRowsByConstraint.size > 0) {
      const pthOut = {};
      for (const [name, data] of pthRowsByConstraint.entries()) {
        const setup = (outPath || []).find((c) => c && c.name === name);
        if (!setup) continue;
        const toScalar = (list, setupValue) => {
          const rows = (list || [])
            .map((r) => {
              const row = {
                time: Number((Number(r.time) || 0).toFixed(4)),
                value: Number((Number(r.value) || 0).toFixed(4)),
              };
              if (r.interp === "stepped") row.curve = "stepped";
              else if (r.interp === "bezier" && Array.isArray(r.curve) && r.curve.length >= 4) row.curve = r.curve.slice(0, 4);
              return row;
            })
            .sort((a, b) => a.time - b.time);
          return pruneTimeline(rows, (r, eps) => Math.abs((Number(r.value) || 0) - (Number(setupValue) || 0)) <= eps);
        };
        const posRows = toScalar(data.position, Number(setup.position) || 0);
        const spcRows = toScalar(data.spacing, Number(setup.spacing) || 0);

        const byTime = new Map();
        for (const r of data.rotateMix || []) {
          const row = byTime.get(r.time) || { time: Number((Number(r.time) || 0).toFixed(4)) };
          row.rotateMix = Number((Number(r.value) || 0).toFixed(4));
          if (r.interp === "stepped") row.curve = "stepped";
          else if (r.interp === "bezier" && Array.isArray(r.curve) && r.curve.length >= 4) row.curve = r.curve.slice(0, 4);
          byTime.set(r.time, row);
        }
        for (const r of data.translateMix || []) {
          const row = byTime.get(r.time) || { time: Number((Number(r.time) || 0).toFixed(4)) };
          row.translateMix = Number((Number(r.value) || 0).toFixed(4));
          if (r.interp === "stepped") row.curve = "stepped";
          else if (r.interp === "bezier" && Array.isArray(r.curve) && r.curve.length >= 4) row.curve = r.curve.slice(0, 4);
          byTime.set(r.time, row);
        }
        let cr = Number(setup.rotateMix) || 0;
        let ct = Number(setup.translateMix) || 0;
        const mixRows = [...byTime.values()]
          .sort((a, b) => a.time - b.time)
          .map((r) => {
            if (r.rotateMix != null) cr = Number(r.rotateMix) || 0;
            if (r.translateMix != null) ct = Number(r.translateMix) || 0;
            const out = {
              time: Number((Number(r.time) || 0).toFixed(4)),
              rotateMix: Number(cr.toFixed(4)),
              translateMix: Number(ct.toFixed(4)),
            };
            if (r.curve === "stepped") out.curve = "stepped";
            else if (Array.isArray(r.curve) && r.curve.length >= 4) out.curve = r.curve.slice(0, 4);
            return out;
          });
        const prunedMix = pruneTimeline(
          mixRows,
          (r, eps) =>
            Math.abs((Number(r.rotateMix) || 0) - (Number(setup.rotateMix) || 0)) <= eps &&
            Math.abs((Number(r.translateMix) || 0) - (Number(setup.translateMix) || 0)) <= eps
        );

        const block = {};
        if (posRows.length > 0) block.position = posRows;
        if (spcRows.length > 0) block.spacing = spcRows;
        if (prunedMix.length > 0) block.mix = prunedMix;
        if (Object.keys(block).length > 0) pthOut[name] = block;
      }
      if (Object.keys(pthOut).length > 0) animOut.paths = pthOut;
    }

    if (vertexRowsBySlot.size > 0) {
      const deformDefaultSkin = {};
      const eps = 1e-5;
      for (const [slotIdx, list] of vertexRowsBySlot.entries()) {
        const si = slotInfos[slotIdx];
        if (!si) continue;
        const slotName = si.name;
        const s = si.slot;
        const sm = s && s.meshData ? s.meshData : null;
        if (!sm) continue;
        const expectedLen = sm.positions.length;
        const setupAttachmentName = si.setupAttachmentName || null;
        const attachmentRows = [...(slotAttachmentRowsBySlot.get(slotIdx) || [])].sort(
          (aa, bb) => (Number(aa.time) || 0) - (Number(bb.time) || 0)
        );
        const resolveAttachmentAtTime = (t) => {
          let out = setupAttachmentName;
          for (const row of attachmentRows) {
            const rt = Number(row && row.time);
            if (!Number.isFinite(rt) || rt > t + 1e-6) break;
            out = row.name == null ? null : String(row.name);
          }
          return out;
        };
        const sorted = [...list].sort((a, b) => (Number(a.time) || 0) - (Number(b.time) || 0));
        const rowsByAttachment = new Map();
        for (const key of sorted) {
          const arr = Array.isArray(key.value) ? key.value : null;
          if (!arr || arr.length !== expectedLen) continue;
          const keyTime = round4(Number(key.time) || 0);
          const attName = resolveAttachmentAtTime(keyTime);
          if (!attName) continue;
          const att = skinDefault[slotName] && skinDefault[slotName][attName] ? skinDefault[slotName][attName] : null;
          if (!att || att.type !== "mesh") continue;
          const base = sm.baseOffsets || new Float32Array(expectedLen);
          const delta = new Array(expectedLen);
          let first = -1;
          let last = -1;
          for (let i = 0; i < expectedLen; i += 1) {
            const v = (Number(arr[i]) || 0) - (Number(base[i]) || 0);
            delta[i] = round4(v);
            if (Math.abs(v) > eps) {
              if (first < 0) first = i;
              last = i;
            }
          }
          const row = { time: keyTime };
          if (first >= 0 && last >= first) {
            if (first > 0) row.offset = first;
            row.vertices = delta.slice(first, last + 1);
          }
          applyCurveFromKey(row, key);
          if (!rowsByAttachment.has(attName)) rowsByAttachment.set(attName, []);
          rowsByAttachment.get(attName).push(row);
        }
        if (rowsByAttachment.size > 0) {
          if (!deformDefaultSkin[slotName]) deformDefaultSkin[slotName] = {};
          for (const [attName, rows] of rowsByAttachment.entries()) {
            if (rows.length > 0) deformDefaultSkin[slotName][attName] = rows;
          }
        }
      }
      if (Object.keys(deformDefaultSkin).length > 0) {
        animOut.deform = { default: deformDefaultSkin };
      }
    }

    if (Object.keys(animOut).length > 0) animations[animName] = animOut;
    if (vertexRowsBySlot.size > 0) hasVertexTrackByAnim.set(animName, true);
  }

  const outSkins = [{ name: "default", attachments: skinDefault }];
  const slotInfoById = new Map();
  for (const si of slotInfos) {
    if (si && si.slot && si.slot.id) slotInfoById.set(String(si.slot.id), si);
  }
  for (const skin of ensureSkinSets()) {
    const nameRaw = String((skin && skin.name) || "").trim();
    if (!nameRaw || nameRaw === "default") continue;
    const map = skin && skin.slotAttachments && typeof skin.slotAttachments === "object" ? skin.slotAttachments : null;
    const mapByPh =
      skin && skin.slotPlaceholderAttachments && typeof skin.slotPlaceholderAttachments === "object"
        ? skin.slotPlaceholderAttachments
        : null;
    if (!map && !mapByPh) continue;
    const attachments = {};
    if (mapByPh) {
      for (const [slotId, phMap] of Object.entries(mapByPh)) {
        const si = slotInfoById.get(String(slotId));
        if (!si || !phMap || typeof phMap !== "object") continue;
        const srcMap = skinDefault[si.name];
        if (!srcMap) continue;
        for (const [ph, srcAtt] of Object.entries(phMap)) {
          const key = String(ph || "").trim();
          if (!key) continue;
          const expAtt = si.sourceToExport.get(String(srcAtt || ""));
          if (!expAtt || !srcMap[expAtt]) continue;
          if (!attachments[si.name]) attachments[si.name] = {};
          const cloned = JSON.parse(JSON.stringify(srcMap[expAtt]));
          if (key !== expAtt && cloned && typeof cloned === "object" && !Array.isArray(cloned) && !cloned.type) {
            cloned.name = expAtt;
          }
          attachments[si.name][key] = cloned;
          if (key !== expAtt && !attachments[si.name][expAtt]) {
            attachments[si.name][expAtt] = JSON.parse(JSON.stringify(srcMap[expAtt]));
          }
        }
      }
    } else {
      for (const [slotId, srcAtt] of Object.entries(map)) {
        const si = slotInfoById.get(String(slotId));
        if (!si) continue;
        const expAtt = si.sourceToExport.get(String(srcAtt || ""));
        if (!expAtt) continue;
        const srcMap = skinDefault[si.name];
        if (!srcMap || !srcMap[expAtt]) continue;
        if (!attachments[si.name]) attachments[si.name] = {};
        attachments[si.name][expAtt] = JSON.parse(JSON.stringify(srcMap[expAtt]));
      }
    }
    if (Object.keys(attachments).length > 0) {
      outSkins.push({ name: nameRaw, attachments });
    }
  }

  return {
    json: {
      skeleton: {
        hash: "",
        spine: compat.version,
        x: 0,
        y: 0,
        width: Number((state.imageWidth || 0).toFixed(3)),
        height: Number((state.imageHeight || 0).toFixed(3)),
        images: "./",
        audio: "",
      },
      bones: outBones,
      slots: outSlots,
      ik: outIk,
      transform: outTransform,
      path: outPath,
      events: Object.keys(eventDefs).length > 0 ? eventDefs : undefined,
      skins: outSkins,
      animations,
    },
    slotExportInfos,
    hasVertexTrack,
    hasWeightedSlot,
    hasVertexTrackByAnim,
    skippedPathForExport,
    skippedPathAttachmentForExport,
  };
}

function validateSpineJsonForExport(spineJson, compatMode = state.export && state.export.spineCompat) {
  const errors = [];
  const warnings = [];
  const json = spineJson || {};
  const compat = getSpineCompatPreset(compatMode);
  const spineVersion = String((json.skeleton && json.skeleton.spine) || "");
  if (spineVersion && spineVersion !== compat.version) {
    warnings.push(
      `Skeleton spine version "${spineVersion}" differs from exporter version "${compat.version}".`
    );
  }
  const slots = Array.isArray(json.slots) ? json.slots : [];
  const slotNames = new Set(slots.map((s) => String(s && s.name ? s.name : "")));
  const skins = getSkinEntries(json);
  const skinByName = new Map(skins.map((s) => [String(s && s.name ? s.name : ""), s]));
  const defaultSkin = (skins.find((s) => s.name === "default") || skins[0] || { attachments: {} }).attachments || {};
  const pathList = Array.isArray(json.path) ? json.path : [];

  for (const p of pathList) {
    const name = String(p && p.name ? p.name : "(unnamed)");
    const target = String(p && p.target ? p.target : "");
    if (!target || !slotNames.has(target)) {
      errors.push(`Path constraint "${name}" target slot is missing.`);
      continue;
    }
    const attMap = defaultSkin[target] || {};
    const pathAtt = Object.values(attMap).find((a) => a && String(a.type || "region") === "path");
    if (!pathAtt) {
      errors.push(`Path constraint "${name}" target slot "${target}" has no path attachment in default skin.`);
    }
  }

  const anims = json.animations && typeof json.animations === "object" ? json.animations : {};
  const pathConstraintNames = new Set(pathList.map((p) => String(p && p.name ? p.name : "")));
  for (const [animName, anim] of Object.entries(anims)) {
    const pth = anim && anim.paths && typeof anim.paths === "object" ? anim.paths : null;
    if (pth) {
      for (const key of Object.keys(pth)) {
        if (!pathConstraintNames.has(String(key))) {
          warnings.push(`Animation "${animName}" references missing path constraint "${key}".`);
        }
      }
    }

    const ik = anim && anim.ik && typeof anim.ik === "object" ? anim.ik : null;
    if (ik) {
      for (const [ikName, rows] of Object.entries(ik)) {
        if (!Array.isArray(rows)) continue;
        for (const row of rows) {
          if (!row || typeof row !== "object") continue;
          if (Object.prototype.hasOwnProperty.call(row, "targetX") || Object.prototype.hasOwnProperty.call(row, "targetY")) {
            warnings.push(
              `Animation "${animName}" ik "${ikName}" contains targetX/targetY, which Spine runtime IK timelines do not use.`
            );
            break;
          }
        }
      }
    }

    const hasLegacyFfd = !!(anim && anim.ffd && !anim.deform);
    const deform =
      anim && typeof anim.deform === "object"
        ? anim.deform
        : hasLegacyFfd && typeof anim.ffd === "object"
          ? anim.ffd
          : null;
    if (deform) {
      for (const [skinName, slotMap] of Object.entries(deform)) {
        const skinEntry = skinByName.get(String(skinName));
        if (!skinEntry) {
          errors.push(`Animation "${animName}" deform references missing skin "${skinName}".`);
          continue;
        }
        if (!slotMap || typeof slotMap !== "object") continue;
        const skinAttachments = (skinEntry && skinEntry.attachments) || {};
        for (const [slotName, attMap] of Object.entries(slotMap)) {
          if (!slotNames.has(String(slotName))) {
            errors.push(`Animation "${animName}" deform references missing slot "${slotName}".`);
            continue;
          }
          if (!attMap || typeof attMap !== "object") continue;
          const slotAttMap = (skinAttachments && skinAttachments[slotName]) || null;
          if (!slotAttMap || typeof slotAttMap !== "object") {
            errors.push(`Animation "${animName}" deform slot "${slotName}" has no attachments in skin "${skinName}".`);
            continue;
          }
          for (const [attName, rows] of Object.entries(attMap)) {
            const att = slotAttMap[attName];
            if (!att || typeof att !== "object") {
              errors.push(
                `Animation "${animName}" deform references missing attachment "${slotName}/${attName}" in skin "${skinName}".`
              );
              continue;
            }
            if (!Array.isArray(rows)) {
              errors.push(`Animation "${animName}" deform "${slotName}/${attName}" must be an array of keyframes.`);
              continue;
            }
            const maxValues = Array.isArray(att.uvs) ? att.uvs.length : null;
            let prevTime = -Infinity;
            for (let i = 0; i < rows.length; i += 1) {
              const row = rows[i];
              if (!row || typeof row !== "object") {
                errors.push(`Animation "${animName}" deform "${slotName}/${attName}" key ${i} is invalid.`);
                continue;
              }
              const t = Number(row.time);
              if (!Number.isFinite(t) || t < 0) {
                errors.push(`Animation "${animName}" deform "${slotName}/${attName}" key ${i} has invalid time.`);
              }
              if (Number.isFinite(t) && t + 1e-6 < prevTime) {
                errors.push(`Animation "${animName}" deform "${slotName}/${attName}" keyframes are not time-sorted.`);
              }
              if (Number.isFinite(t)) prevTime = t;
              const off = Math.max(0, Number(row.offset) || 0);
              if (row.offset != null && (!Number.isInteger(Number(row.offset)) || Number(row.offset) < 0)) {
                errors.push(`Animation "${animName}" deform "${slotName}/${attName}" key ${i} has invalid offset.`);
              }
              const verts = Array.isArray(row.vertices) ? row.vertices : [];
              for (let vi = 0; vi < verts.length; vi += 1) {
                if (!Number.isFinite(Number(verts[vi]))) {
                  errors.push(`Animation "${animName}" deform "${slotName}/${attName}" key ${i} has non-numeric vertex data.`);
                  break;
                }
              }
              if (Number.isFinite(maxValues) && maxValues >= 0 && off + verts.length > maxValues) {
                errors.push(
                  `Animation "${animName}" deform "${slotName}/${attName}" key ${i} exceeds vertex range (${off + verts.length} > ${maxValues}).`
                );
              }
            }
          }
        }
      }
    }
    if (hasLegacyFfd) {
      warnings.push(`Animation "${animName}" uses legacy "ffd" timeline name; runtime-standard is "deform".`);
    }
  }

  return { errors, warnings };
}

function makeDiagnosticIssue(severity, message, action = null) {
  const s = severity === "error" ? "error" : "warning";
  return {
    severity: s,
    message: String(message || ""),
    action: action && typeof action === "object" ? action : null,
  };
}

function renderDiagnosticsUI() {
  if (!els.diagnosticsList) return;
  const rows = Array.isArray(state.diagnostics.issues) ? state.diagnostics.issues : [];
  let errors = 0;
  let warnings = 0;
  for (const r of rows) {
    if (!r) continue;
    if (r.severity === "error") errors += 1;
    else warnings += 1;
  }
  if (els.diagnosticsErrorsCount) els.diagnosticsErrorsCount.textContent = String(errors);
  if (els.diagnosticsWarningsCount) els.diagnosticsWarningsCount.textContent = String(warnings);
  els.diagnosticsList.innerHTML = "";
  if (rows.length === 0) {
    els.diagnosticsList.classList.add("muted");
    els.diagnosticsList.textContent = "No issues found.";
    return;
  }
  els.diagnosticsList.classList.remove("muted");
  const frag = document.createDocumentFragment();
  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    if (!row) continue;
    const item = document.createElement("div");
    item.className = `diag-item ${row.severity === "error" ? "error" : "warning"}`;
    if (row.action) {
      item.dataset.action = JSON.stringify(row.action);
      item.title = "Click to focus related object.";
    }
    const head = document.createElement("div");
    head.className = "diag-head";
    head.textContent = `${row.severity === "error" ? "Error" : "Warning"} ${i + 1}`;
    const msg = document.createElement("div");
    msg.className = "diag-msg";
    msg.textContent = row.message;
    item.appendChild(head);
    item.appendChild(msg);
    frag.appendChild(item);
  }
  els.diagnosticsList.appendChild(frag);
}

function focusDiagnosticsAction(action) {
  if (!action || typeof action !== "object") return false;
  const kind = String(action.kind || "");
  if (kind === "slot") {
    const si = Number(action.slotIndex);
    if (!Number.isFinite(si) || si < 0 || si >= state.slots.length) return false;
    setActiveSlot(si);
    setStatus(`Diagnostics focus: slot ${state.slots[si] && state.slots[si].name ? state.slots[si].name : si}`);
    return true;
  }
  if (kind === "bone") {
    const bi = Number(action.boneIndex);
    if (!state.mesh || !Number.isFinite(bi) || bi < 0 || bi >= state.mesh.rigBones.length) return false;
    state.selectedBone = bi;
    state.selectedBonesForWeight = [bi];
    updateBoneUI();
    renderBoneTree();
    setStatus(`Diagnostics focus: bone ${state.mesh.rigBones[bi] && state.mesh.rigBones[bi].name ? state.mesh.rigBones[bi].name : bi}`);
    return true;
  }
  if (kind === "track") {
    const trackId = String(action.trackId || "");
    if (!trackId) return false;
    focusTimelineTrack(trackId, true);
    setStatus(`Diagnostics focus: track ${trackId}`);
    return true;
  }
  if (kind === "animation") {
    const animId = String(action.animId || "");
    if (!animId) return false;
    const anim = state.anim.animations.find((a) => a.id === animId);
    if (!anim) return false;
    state.anim.currentAnimId = anim.id;
    refreshAnimationUI();
    if (state.mesh) samplePoseAtTime(state.mesh, state.anim.time);
    setStatus(`Diagnostics focus: animation ${anim.name}`);
    return true;
  }
  return false;
}

function runDiagnostics(options = null) {
  const opts = options && typeof options === "object" ? options : {};
  const includeExport = opts.includeExport !== false;
  const issues = [];
  const push = (severity, message, action = null) => {
    issues.push(makeDiagnosticIssue(severity, message, action));
  };
  const bones = state.mesh && Array.isArray(state.mesh.rigBones) ? state.mesh.rigBones : [];
  const slots = Array.isArray(state.slots) ? state.slots : [];
  const isBoneIndexValid = (v) => Number.isFinite(v) && Number(v) >= 0 && Number(v) < bones.length;
  const slotIdSet = new Set(slots.map((s) => (s && s.id ? String(s.id) : "")));

  if (!state.mesh) push("error", "Mesh is not initialized. Import image/PSD and rebuild mesh first.");
  if (bones.length <= 0) push("error", "No bones found.");
  if (slots.length <= 0) push("error", "No slots found.");

  for (let si = 0; si < slots.length; si += 1) {
    const slot = slots[si];
    if (!slot) continue;
    if (!isBoneIndexValid(slot.bone)) {
      push("error", `Slot "${slot.name || si}" is bound to an invalid bone index (${slot.bone}).`, {
        kind: "slot",
        slotIndex: si,
      });
    }
    if (slot.activeAttachment != null) {
      const hasAttachment = Array.isArray(slot.attachments) && slot.attachments.some((a) => a && a.name === slot.activeAttachment);
      if (!hasAttachment) {
        push("warning", `Slot "${slot.name || si}" active attachment "${String(slot.activeAttachment)}" is missing.`, {
          kind: "slot",
          slotIndex: si,
        });
      }
    }
    if (slot.clipEnabled && slot.clipEndSlotId) {
      const id = String(slot.clipEndSlotId);
      if (!slotIdSet.has(id)) {
        push("error", `Slot "${slot.name || si}" clip end slot id "${id}" does not exist.`, { kind: "slot", slotIndex: si });
      } else if (slot.id && String(slot.id) === id) {
        push("warning", `Slot "${slot.name || si}" clip end points to itself.`, { kind: "slot", slotIndex: si });
      }
    }
    if (slot.clipEnabled && slot.clipSource === "contour") {
      const contour = ensureSlotContour(slot);
      if (!contour.closed || !Array.isArray(contour.points) || contour.points.length < 3) {
        push("warning", `Slot "${slot.name || si}" uses contour clipping but contour is not closed/valid.`, {
          kind: "slot",
          slotIndex: si,
        });
      }
    }
  }

  for (let bi = 0; bi < bones.length; bi += 1) {
    const bone = bones[bi];
    const p = Number(bone && bone.parent);
    if (Number.isFinite(p) && p >= bones.length) {
      push("error", `Bone "${bone && bone.name ? bone.name : bi}" has invalid parent index ${p}.`, { kind: "bone", boneIndex: bi });
    }
  }

  const ikList = state.mesh ? ensureIKConstraints(state.mesh) : [];
  for (let i = 0; i < ikList.length; i += 1) {
    const c = ikList[i];
    if (!c) continue;
    if (!isBoneIndexValid(c.target)) {
      push("error", `IK "${c.name || i}" has invalid target bone index ${c.target}.`);
    }
    const bs = Array.isArray(c.bones) ? c.bones : [];
    if (bs.length <= 0 || bs.some((b) => !isBoneIndexValid(b))) {
      push("error", `IK "${c.name || i}" has invalid constrained bones.`);
    }
  }

  const tfcList = state.mesh ? ensureTransformConstraints(state.mesh) : [];
  for (let i = 0; i < tfcList.length; i += 1) {
    const c = tfcList[i];
    if (!c) continue;
    if (!isBoneIndexValid(c.target)) push("error", `Transform "${c.name || i}" has invalid target bone index ${c.target}.`);
    const bs = Array.isArray(c.bones) ? c.bones : [];
    if (bs.length <= 0 || bs.some((b) => !isBoneIndexValid(b))) push("error", `Transform "${c.name || i}" has invalid constrained bones.`);
  }

  const pathList = state.mesh ? ensurePathConstraints(state.mesh) : [];
  for (let i = 0; i < pathList.length; i += 1) {
    const c = pathList[i];
    if (!c) continue;
    if (!isBoneIndexValid(c.target)) push("error", `Path "${c.name || i}" has invalid target bone index ${c.target}.`);
    const bs = Array.isArray(c.bones) ? c.bones : [];
    if (bs.length <= 0 || bs.some((b) => !isBoneIndexValid(b))) push("error", `Path "${c.name || i}" has invalid constrained bones.`);
    if (c.sourceType === "slot") {
      const tsi = Number(c.targetSlot);
      if (!Number.isFinite(tsi) || tsi < 0 || tsi >= slots.length) {
        push("error", `Path "${c.name || i}" source slot index is invalid (${c.targetSlot}).`);
      }
    }
  }

  for (const layer of ensureAnimLayerTracks()) {
    if (!layer) continue;
    if (layer.enabled !== false && layer.animId && !state.anim.animations.some((a) => a.id === layer.animId)) {
      push("warning", `Layer "${layer.name || layer.id}" references missing animation "${layer.animId}".`, {
        kind: "track",
        trackId: getLayerTrackId(layer.id, "alpha"),
      });
    }
  }

  const sm = ensureStateMachine();
  for (const st of sm.states || []) {
    if (!st) continue;
    if (st.animId && !state.anim.animations.some((a) => a.id === st.animId)) {
      push("warning", `State "${st.name || st.id}" references missing animation "${st.animId}".`);
    }
    for (const tr of st.transitions || []) {
      if (!tr) continue;
      if (!sm.states.some((x) => x && x.id === tr.toStateId)) {
        push("error", `State "${st.name || st.id}" has transition to missing state "${tr.toStateId}".`);
      }
    }
  }

  if (includeExport) {
    try {
      const compat = getSpineCompatPreset(state.export && state.export.spineCompat);
      const { json, skippedPathForExport, skippedPathAttachmentForExport } = buildSpineJsonData(compat.id);
      const v = validateSpineJsonForExport(json, compat.id);
      for (const e of v.errors) push("error", `[Export] ${e}`);
      for (const w of v.warnings) push("warning", `[Export] ${w}`);
      if ((Number(skippedPathForExport) || 0) > 0) {
        push("warning", `[Export] ${Number(skippedPathForExport)} path constraint(s) were skipped.`);
      }
      if ((Number(skippedPathAttachmentForExport) || 0) > 0) {
        push("warning", `[Export] ${Number(skippedPathAttachmentForExport)} path attachment(s) could not be generated.`);
      }
    } catch (err) {
      push("error", `[Export] ${err && err.message ? err.message : "Export build failed."}`);
    }
  }

  state.diagnostics.issues = issues;
  state.diagnostics.lastRunAt = Date.now();
  renderDiagnosticsUI();
  const errorCount = issues.filter((r) => r && r.severity === "error").length;
  const warnCount = issues.filter((r) => r && r.severity !== "error").length;
  setStatus(`Diagnostics done: ${errorCount} error(s), ${warnCount} warning(s).`);
  return issues;
}

function applyDiagnosticsSafeFixes() {
  let fixed = 0;
  const bones = state.mesh && Array.isArray(state.mesh.rigBones) ? state.mesh.rigBones : [];
  const slots = Array.isArray(state.slots) ? state.slots : [];
  const validBone = (v) => Number.isFinite(v) && Number(v) >= 0 && Number(v) < bones.length;
  const fallbackBone = bones.length > 0 ? 0 : -1;
  const slotIdSet = new Set(slots.map((s) => (s && s.id ? String(s.id) : "")));

  for (let bi = 0; bi < bones.length; bi += 1) {
    const b = bones[bi];
    if (!b) continue;
    const p = Number(b.parent);
    if (!Number.isFinite(p) || p < 0) continue;
    if (p >= bones.length || p === bi) {
      b.parent = -1;
      fixed += 1;
    }
  }

  for (let si = 0; si < slots.length; si += 1) {
    const s = slots[si];
    if (!s) continue;
    if (!validBone(s.bone)) {
      s.bone = fallbackBone;
      fixed += 1;
    }
    if (s.activeAttachment != null) {
      const has = Array.isArray(s.attachments) && s.attachments.some((a) => a && a.name === s.activeAttachment);
      if (!has) {
        const first = Array.isArray(s.attachments) && s.attachments[0] && s.attachments[0].name ? String(s.attachments[0].name) : null;
        s.activeAttachment = first;
        if (first) s.attachmentName = first;
        fixed += 1;
      }
    }
    if (s.clipEnabled && s.clipEndSlotId) {
      const id = String(s.clipEndSlotId);
      if (!slotIdSet.has(id) || (s.id && String(s.id) === id)) {
        s.clipEndSlotId = null;
        fixed += 1;
      }
    }
    if (s.clipEnabled && s.clipSource === "contour") {
      const c = ensureSlotContour(s);
      if (!c.closed || !Array.isArray(c.points) || c.points.length < 3) {
        s.clipSource = "fill";
        fixed += 1;
      }
    }
  }

  if (state.mesh) {
    const ikList = ensureIKConstraints(state.mesh);
    for (const c of ikList) {
      if (!c) continue;
      const prevTarget = c.target;
      if (!validBone(c.target)) c.target = fallbackBone;
      const cleaned = Array.isArray(c.bones) ? [...new Set(c.bones.map((v) => Number(v)).filter((v) => validBone(v)))] : [];
      if (!Array.isArray(c.bones) || cleaned.length !== c.bones.length || cleaned.some((v, i) => v !== c.bones[i])) c.bones = cleaned;
      const shouldEnable = c.bones.length > 0 && validBone(c.target);
      if (c.enabled !== shouldEnable) c.enabled = shouldEnable;
      if (prevTarget !== c.target || !shouldEnable) fixed += 1;
    }

    const tfcList = ensureTransformConstraints(state.mesh);
    for (const c of tfcList) {
      if (!c) continue;
      const prevTarget = c.target;
      if (!validBone(c.target)) c.target = fallbackBone;
      const cleaned = Array.isArray(c.bones) ? [...new Set(c.bones.map((v) => Number(v)).filter((v) => validBone(v)))] : [];
      if (!Array.isArray(c.bones) || cleaned.length !== c.bones.length || cleaned.some((v, i) => v !== c.bones[i])) c.bones = cleaned;
      const shouldEnable = c.bones.length > 0 && validBone(c.target);
      if (c.enabled !== shouldEnable) c.enabled = shouldEnable;
      if (prevTarget !== c.target || !shouldEnable) fixed += 1;
    }

    const pathList = ensurePathConstraints(state.mesh);
    for (const c of pathList) {
      if (!c) continue;
      const prevTarget = c.target;
      if (!validBone(c.target)) c.target = fallbackBone;
      const cleaned = Array.isArray(c.bones) ? [...new Set(c.bones.map((v) => Number(v)).filter((v) => validBone(v)))] : [];
      if (!Array.isArray(c.bones) || cleaned.length !== c.bones.length || cleaned.some((v, i) => v !== c.bones[i])) c.bones = cleaned;
      if (c.sourceType === "slot") {
        const tsi = Number(c.targetSlot);
        if (!Number.isFinite(tsi) || tsi < 0 || tsi >= slots.length) {
          c.sourceType = "drawn";
          c.targetSlot = slots.length > 0 ? 0 : -1;
          fixed += 1;
        }
      }
      const shouldEnable = c.bones.length > 0 && validBone(c.target);
      if (c.enabled !== shouldEnable) c.enabled = shouldEnable;
      if (prevTarget !== c.target || !shouldEnable) fixed += 1;
    }
  }

  const animIds = new Set((state.anim.animations || []).map((a) => String(a.id)));
  for (const layer of ensureAnimLayerTracks()) {
    if (!layer) continue;
    if (layer.animId && !animIds.has(String(layer.animId))) {
      layer.animId = "";
      layer.enabled = false;
      fixed += 1;
    }
  }

  const sm = ensureStateMachine();
  const stateIds = new Set((sm.states || []).map((s) => String(s.id)));
  const paramIds = new Set((sm.parameters || []).map((p) => String(p.id)));
  for (const st of sm.states || []) {
    if (!st) continue;
    if (st.animId && !animIds.has(String(st.animId))) {
      st.animId = "";
      fixed += 1;
    }
    const beforeN = Array.isArray(st.transitions) ? st.transitions.length : 0;
    st.transitions = (Array.isArray(st.transitions) ? st.transitions : []).filter((tr) => tr && stateIds.has(String(tr.toStateId)));
    for (const tr of st.transitions) {
      if (!tr || !Array.isArray(tr.conditions)) continue;
      const prev = tr.conditions.length;
      tr.conditions = tr.conditions.filter((c) => c && paramIds.has(String(c.paramId || "")));
      if (tr.conditions.length !== prev) fixed += 1;
    }
    if (st.transitions.length !== beforeN) fixed += 1;
  }

  const validLayerIds = new Set(ensureAnimLayerTracks().map((l) => String(l.id)));
  const validParamIds = new Set((sm.parameters || []).map((p) => String(p.id)));
  const validTrackRef = (trackId) => {
    const p = parseTrackId(trackId);
    if (!p) return false;
    if (p.type === "bone") return Number.isFinite(p.boneIndex) && p.boneIndex >= 0 && p.boneIndex < bones.length;
    if (p.type === "vertex") return p.slotIndex == null || (Number.isFinite(p.slotIndex) && p.slotIndex >= 0 && p.slotIndex < slots.length);
    if (p.type === "slot") return Number.isFinite(p.slotIndex) && p.slotIndex >= 0 && p.slotIndex < slots.length;
    if (p.type === "ik") return state.mesh && Number.isFinite(p.ikIndex) && p.ikIndex >= 0 && p.ikIndex < ensureIKConstraints(state.mesh).length;
    if (p.type === "tfc") return state.mesh && Number.isFinite(p.transformIndex) && p.transformIndex >= 0 && p.transformIndex < ensureTransformConstraints(state.mesh).length;
    if (p.type === "pth") return state.mesh && Number.isFinite(p.pathIndex) && p.pathIndex >= 0 && p.pathIndex < ensurePathConstraints(state.mesh).length;
    if (p.type === "layer") return validLayerIds.has(String(p.layerId || ""));
    if (p.type === "smparam") return validParamIds.has(String(p.paramId || ""));
    if (p.type === "draworder" || p.type === "event") return true;
    return true;
  };
  for (const anim of state.anim.animations || []) {
    if (!anim || !anim.tracks || typeof anim.tracks !== "object") continue;
    for (const trackId of Object.keys(anim.tracks)) {
      if (!validTrackRef(trackId)) {
        delete anim.tracks[trackId];
        fixed += 1;
      }
    }
  }

  ensureSlotsHaveBoneBinding();
  refreshAnimationUI();
  refreshSlotUI();
  updateBoneUI();
  renderBoneTree();
  if (state.mesh) samplePoseAtTime(state.mesh, state.anim.time);

  if (fixed > 0) {
    pushUndoCheckpoint(true);
    setStatus(`Diagnostics auto-fix applied: ${fixed} change(s).`);
  } else {
    setStatus("Diagnostics auto-fix: no safe changes needed.");
  }
  return fixed;
}

async function exportSpineData() {
  const compat = getSpineCompatPreset(state.export && state.export.spineCompat);
  const asked = window.prompt("Export base name", "spine_export");
  if (asked == null) return;
  const baseName = sanitizeExportName(asked, "spine_export");
  const scaleAsked = window.prompt("Atlas texture scale (0.1~1.0, default 0.75)", "0.75");
  if (scaleAsked == null) return;
  const textureScale = math.clamp(Number(scaleAsked) || 0.75, 0.1, 1);
  const pageName = `${baseName}.png`;
  const { json, slotExportInfos, hasVertexTrack, hasWeightedSlot, skippedPathForExport, skippedPathAttachmentForExport } =
    buildSpineJsonData(compat.id);
  const validation = validateSpineJsonForExport(json, compat.id);
  if (validation.errors.length > 0) {
    throw new Error(`Spine JSON validation failed: ${validation.errors[0]}`);
  }
  const { canvas, atlas, scale } = packSlotsToAtlasPage(slotExportInfos, pageName, textureScale);
  const pngBlob = await canvasToBlob(canvas, "image/png");
  const skelBytes = exportSpineSkelBinary(json);
  const jsonBlob = new Blob([JSON.stringify(json, null, 2)], { type: "application/json" });
  const atlasBlob = new Blob([atlas], { type: "text/plain;charset=utf-8" });
  const skelBlob = new Blob([skelBytes], { type: "application/octet-stream" });
  downloadBlobFile(jsonBlob, `${baseName}.json`);
  downloadBlobFile(atlasBlob, `${baseName}.atlas`);
  downloadBlobFile(pngBlob, pageName);
  downloadBlobFile(skelBlob, `${baseName}.skel`);
  if (hasVertexTrack) {
    setStatus(
      `Exported ${baseName}.json/.atlas/.png/.skel (Spine ${compat.version}, atlas scale ${scale.toFixed(
        2
      )}; mesh deform exported in JSON and SKEL (experimental compatibility).`
    );
  } else if (hasWeightedSlot) {
    setStatus(
      `Exported ${baseName}.json/.atlas/.png/.skel (Spine ${compat.version}, atlas scale ${scale.toFixed(
        2
      )}; weighted slot needs mesh export for multi-bone motion).`
    );
  } else {
    setStatus(`Exported ${baseName}.json/.atlas/.png/.skel (Spine ${compat.version}, atlas scale ${scale.toFixed(2)}).`);
  }
  if ((Number(skippedPathForExport) || 0) > 0) {
    setStatus(
      `Export note: ${Number(skippedPathForExport)} path constraint(s) not written to Spine export (invalid target/source).`
    );
  }
  if ((Number(skippedPathAttachmentForExport) || 0) > 0) {
    setStatus(`Export note: ${Number(skippedPathAttachmentForExport)} path attachment(s) could not be generated from slot contour.`);
  }
  if (validation.warnings.length > 0) {
    setStatus(`Export warning: ${validation.warnings[0]}`);
  }
}

if (els.fileSaveBtn) {
  els.fileSaveBtn.addEventListener("click", () => {
    const payload = buildProjectPayload();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "mesh_deformer_project.json";
    a.click();
    URL.revokeObjectURL(a.href);
    saveAutosaveSnapshot("manual_save", true);
    setStatus(`Project saved (JSON, ${payload.slotImages.length} embedded image(s)).`);
  });
}

if (els.fileLoadBtn) {
  els.fileLoadBtn.addEventListener("click", () => {
    els.projectLoadInput.click();
  });
}

if (els.fileExportSpineBtn) {
  els.fileExportSpineBtn.addEventListener("click", async () => {
    try {
      await exportSpineData();
    } catch (err) {
      setStatus(`Spine export failed: ${err.message}`);
      console.error(err);
    }
  });
}

async function handleProjectLoadInputChange(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const data = JSON.parse(await f.text());
      if (Number.isFinite(Number(data.gridX))) els.gridX.value = String(math.clamp(Number(data.gridX), 2, 120));
      if (Number.isFinite(Number(data.gridY))) els.gridY.value = String(math.clamp(Number(data.gridY), 2, 120));
      state.slotMesh.gridReplaceContour = !!(data && data.slotMeshGridReplaceContour);
      if (els.slotMeshGridReplaceContour) els.slotMeshGridReplaceContour.checked = !!state.slotMesh.gridReplaceContour;
      const loadedCompat = getSpineCompatPreset(
        (data && data.export && data.export.spineCompat) || (data && data.spineCompat) || (state.export && state.export.spineCompat)
      );
      state.export.spineCompat = loadedCompat.id;
      if (els.spineCompat) els.spineCompat.value = loadedCompat.id;
      const hasEmbeddedImages = Array.isArray(data.slotImages) && data.slotImages.length > 0;
      if (hasEmbeddedImages) {
        const decoded = [];
        for (const src of data.slotImages) {
          if (typeof src !== "string" || src.length === 0) continue;
          decoded.push(await canvasFromDataUrl(src));
        }
        if (decoded.length === 0) throw new Error("Project has slotImages but none could be decoded.");
        state.mesh = null;
        state.slots = [];
        state.activeSlot = -1;
        state.sourceCanvas = null;
        state.imageWidth = Number(data.imageWidth) || decoded[0].width;
        state.imageHeight = Number(data.imageHeight) || decoded[0].height;
        const srcSlots = Array.isArray(data.slots) ? data.slots : [];
        if (srcSlots.length === 0) {
          addSlotEntry(
            {
              name: "base",
              canvas: decoded[0],
              docWidth: state.imageWidth,
              docHeight: state.imageHeight,
              rect: { x: 0, y: 0, w: decoded[0].width, h: decoded[0].height },
            },
            false
          );
        } else {
          for (const src of srcSlots) {
            const imgIdx = Number(src && src.imageIndex);
            const c = Number.isFinite(imgIdx) && imgIdx >= 0 && imgIdx < decoded.length ? decoded[imgIdx] : decoded[0];
            addSlotEntry(
              {
                name: src && src.name ? src.name : undefined,
                id: src && src.id ? String(src.id) : undefined,
                attachmentName: src && src.attachmentName ? String(src.attachmentName) : undefined,
                placeholderName: src && src.placeholderName ? String(src.placeholderName) : undefined,
                attachments:
                  src && Array.isArray(src.attachments)
                    ? src.attachments
                        .map((a) => {
                          const ai = Number(a && a.imageIndex);
                          const ac =
                            Number.isFinite(ai) && ai >= 0 && ai < decoded.length
                              ? decoded[ai]
                              : c;
                          return {
                            name: String(a && a.name ? a.name : "").trim(),
                            placeholder: String(a && a.placeholder ? a.placeholder : src && src.placeholderName ? src.placeholderName : src && src.attachmentName ? src.attachmentName : "main").trim(),
                            canvas: ac,
                            type: normalizeAttachmentType(a && a.type),
                            linkedParent: a && a.linkedParent != null ? String(a.linkedParent) : "",
                            pointX: Number(a && a.pointX) || 0,
                            pointY: Number(a && a.pointY) || 0,
                            pointRot: Number(a && a.pointRot) || 0,
                            bboxSource: a && a.bboxSource === "contour" ? "contour" : "fill",
                            sequence:
                              a && a.sequence
                                ? {
                                    enabled: !!a.sequence.enabled,
                                    count: Math.max(1, Math.round(Number(a.sequence.count) || 1)),
                                    start: Math.max(0, Math.round(Number(a.sequence.start) || 0)),
                                    digits: Math.max(1, Math.round(Number(a.sequence.digits) || 2)),
                                  }
                                : { enabled: false, count: 1, start: 0, digits: 2 },
                          };
                        })
                        .filter((a) => a.name.length > 0 && !!a.canvas)
                    : undefined,
                activeAttachment:
                  src && Object.prototype.hasOwnProperty.call(src, "activeAttachment")
                    ? src.activeAttachment == null
                      ? null
                      : String(src.activeAttachment)
                    : undefined,
                editorVisible:
                  src && Object.prototype.hasOwnProperty.call(src, "editorVisible")
                    ? src.editorVisible !== false
                    : src
                      ? src.visible !== false
                      : true,
                canvas: c,
                bone: Number(src && src.bone),
                visible: src ? src.visible !== false : true,
                alpha: src ? Number(src.alpha) : 1,
                r: src ? Number(src.r) : 1,
                g: src ? Number(src.g) : 1,
                b: src ? Number(src.b) : 1,
                blend: src ? normalizeSlotBlendMode(src.blend) : "normal",
                darkEnabled: !!(src && src.darkEnabled),
                dr: src ? Number(src.dr) : 0,
                dg: src ? Number(src.dg) : 0,
                db: src ? Number(src.db) : 0,
                tx: src ? Number(src.tx) : 0,
                ty: src ? Number(src.ty) : 0,
                rot: src ? Number(src.rot) : 0,
                useWeights: !!(src && src.useWeights),
                weightBindMode: src && src.weightBindMode ? src.weightBindMode : "none",
                weightMode: src && src.weightMode ? src.weightMode : "free",
                influenceBones: Array.isArray(src && src.influenceBones) ? src.influenceBones : [],
                clipEnabled: !!(src && src.clipEnabled),
                clipSource: src && src.clipSource === "contour" ? "contour" : "fill",
                clipEndSlotId:
                  src && Object.prototype.hasOwnProperty.call(src, "clipEndSlotId")
                    ? src.clipEndSlotId == null
                      ? null
                      : String(src.clipEndSlotId)
                    : null,
                rect:
                  src && src.rect && Number.isFinite(src.rect.w) && Number.isFinite(src.rect.h)
                    ? {
                        x: Number(src.rect.x) || 0,
                        y: Number(src.rect.y) || 0,
                        w: Math.max(1, Number(src.rect.w) || 1),
                        h: Math.max(1, Number(src.rect.h) || 1),
                      }
                    : { x: 0, y: 0, w: c.width, h: c.height },
                docWidth: Number(src && src.docWidth) || state.imageWidth,
                docHeight: Number(src && src.docHeight) || state.imageHeight,
              },
              false
            );
          }
        }
        const targetSlot = Number.isFinite(Number(data.activeSlot))
          ? math.clamp(Number(data.activeSlot), 0, Math.max(0, state.slots.length - 1))
          : 0;
        setActiveSlot(targetSlot);
      } else if (!state.sourceCanvas && state.slots.length === 0) {
        setStatus("No embedded images in file. Import image/PSD first, then load this legacy project json.");
        return;
      }

      rebuildMesh();
      if (state.mesh && Array.isArray(data.rigBones)) {
        state.mesh.rigBones = data.rigBones;
        syncPoseFromRig(state.mesh);
        syncBindPose(state.mesh);
        refreshWeightsForBoneCount();
      }
      if (state.mesh && Array.isArray(data.ikConstraints)) {
        state.mesh.ikConstraints = data.ikConstraints.map((c, i) => ({
          name: c && c.name ? String(c.name) : `ik_${i}`,
          bones: Array.isArray(c && c.bones) ? c.bones.map((v) => Number(v)).filter((v) => Number.isFinite(v)) : [],
          target: Number(c && c.target),
          targetX: Number(c && c.targetX),
          targetY: Number(c && c.targetY),
          mix: math.clamp(Number(c && c.mix) || 1, 0, 1),
          softness: Math.max(0, Number(c && c.softness) || 0),
          bendPositive: c ? c.bendPositive !== false : true,
          compress: !!(c && c.compress),
          stretch: !!(c && c.stretch),
          uniform: !!(c && c.uniform),
          order: getConstraintOrder(c, i),
          skinRequired: !!(c && c.skinRequired),
          enabled: c ? c.enabled !== false : true,
          endMode: c && c.endMode === "tail" ? "tail" : "head",
        }));
        ensureIKConstraints(state.mesh);
      }
      if (state.mesh && Array.isArray(data.transformConstraints)) {
        state.mesh.transformConstraints = data.transformConstraints.map((c, i) => ({
          name: c && c.name ? String(c.name) : `transform_${i}`,
          bones: Array.isArray(c && c.bones) ? c.bones.map((v) => Number(v)).filter((v) => Number.isFinite(v)) : [],
          target: Number(c && c.target),
          rotateMix: math.clamp(Number(c && c.rotateMix) || 0, 0, 1),
          translateMix: math.clamp(Number(c && c.translateMix) || 0, 0, 1),
          scaleMix: math.clamp(Number(c && c.scaleMix) || 0, 0, 1),
          shearMix: math.clamp(Number(c && c.shearMix) || 0, 0, 1),
          offsetX: Number(c && c.offsetX) || 0,
          offsetY: Number(c && c.offsetY) || 0,
          offsetRot: Number(c && c.offsetRot) || 0,
          offsetScaleX: Number(c && c.offsetScaleX) || 0,
          offsetScaleY: Number(c && c.offsetScaleY) || 0,
          offsetShearY: Number(c && c.offsetShearY) || 0,
          local: !!(c && c.local),
          relative: !!(c && c.relative),
          order: getConstraintOrder(c, i),
          skinRequired: !!(c && c.skinRequired),
          enabled: c ? c.enabled !== false : true,
        }));
        ensureTransformConstraints(state.mesh);
      }
      if (state.mesh && Array.isArray(data.pathConstraints)) {
        state.mesh.pathConstraints = data.pathConstraints.map((c, i) => ({
          name: c && c.name ? String(c.name) : `path_${i}`,
          bones: Array.isArray(c && c.bones) ? c.bones.map((v) => Number(v)).filter((v) => Number.isFinite(v)) : [],
          target: Number(c && c.target),
          sourceType: c && c.sourceType === "bone_chain" ? "bone_chain" : c && c.sourceType === "slot" ? "slot" : "drawn",
          targetSlot: Number(c && c.targetSlot),
          points: Array.isArray(c && c.points)
            ? c.points.map((p) => ({
                x: Number(p && p.x) || 0,
                y: Number(p && p.y) || 0,
                hinx: Number.isFinite(Number(p && p.hinx)) ? Number(p.hinx) : Number(p && p.x) || 0,
                hiny: Number.isFinite(Number(p && p.hiny)) ? Number(p.hiny) : Number(p && p.y) || 0,
                houtx: Number.isFinite(Number(p && p.houtx)) ? Number(p.houtx) : Number(p && p.x) || 0,
                houty: Number.isFinite(Number(p && p.houty)) ? Number(p.houty) : Number(p && p.y) || 0,
                broken: !!(p && p.broken),
                handleMode: p && p.handleMode === "auto" ? "auto" : p && p.handleMode === "broken" ? "broken" : "aligned",
              }))
            : [],
          positionMode: c && c.positionMode === "percent" ? "percent" : "fixed",
          spacingMode:
            c && c.spacingMode === "fixed"
              ? "fixed"
              : c && c.spacingMode === "percent"
                ? "percent"
                : c && c.spacingMode === "proportional"
                  ? "proportional"
                  : "length",
          rotateMode: c && c.rotateMode === "chain" ? "chain" : c && c.rotateMode === "chainScale" ? "chainScale" : "tangent",
          position: Number(c && c.position) || 0,
          spacing: Number(c && c.spacing) || 0,
          rotateMix: math.clamp(Number(c && c.rotateMix) || 0, 0, 1),
          translateMix: math.clamp(Number(c && c.translateMix) || 0, 0, 1),
          skinRequired: !!(c && c.skinRequired),
          closed: !!(c && c.closed),
          order: getConstraintOrder(c, i),
          enabled: c ? c.enabled !== false : true,
        }));
        ensurePathConstraints(state.mesh);
      }
      if (Array.isArray(data.animations) && data.animations.length > 0) {
        state.anim.animations = data.animations;
        state.anim.currentAnimId = data.animations[0].id;
      }
      if (data && data.animationState && Array.isArray(data.animationState.layerTracks)) {
        state.anim.layerTracks = data.animationState.layerTracks.map((t, i) => ({
          id: t && t.id ? String(t.id) : makeLayerTrackId(),
          name: t && t.name ? String(t.name) : `Layer ${i + 1}`,
          enabled: t ? t.enabled !== false : true,
          animId: t && t.animId ? String(t.animId) : "",
          loop: t ? t.loop !== false : true,
          speed: Number.isFinite(Number(t && t.speed)) ? math.clamp(Number(t && t.speed), -10, 10) : 1,
          offset: Number(t && t.offset) || 0,
          alpha: math.clamp(Number(t && t.alpha) || 0, 0, 1),
          mode: t && t.mode === "add" ? "add" : "replace",
          maskMode: t && (t.maskMode === "include" || t.maskMode === "exclude") ? t.maskMode : "all",
          maskBones: Array.isArray(t && t.maskBones) ? t.maskBones.map((v) => Number(v)).filter((v) => Number.isFinite(v)) : [],
        }));
        state.anim.selectedLayerTrackId = String(data.animationState.selectedLayerTrackId || "");
        state.anim.batchExportOpen = !!data.animationState.batchExportOpen;
        if (data.animationState.batchExport && typeof data.animationState.batchExport === "object") {
          const be = data.animationState.batchExport;
          state.anim.batchExport = {
            format: be.format === "gif" || be.format === "pngseq" ? be.format : "webm",
            fps: Math.max(1, Math.min(60, Math.round(Number(be.fps) || 15))),
            prefix: String(be.prefix || "batch"),
            retries: Math.max(0, Math.min(5, Math.round(Number(be.retries) || 1))),
            delayMs: Math.max(0, Math.min(5000, Math.round(Number(be.delayMs) || 120))),
            zipPng: be.zipPng !== false,
          };
        } else {
          state.anim.batchExport = {
            format: "webm",
            fps: 15,
            prefix: "batch",
            retries: 1,
            delayMs: 120,
            zipPng: true,
          };
        }
      } else {
        state.anim.layerTracks = [];
        state.anim.selectedLayerTrackId = "";
        state.anim.batchExportOpen = false;
        state.anim.batchExport = {
          format: "webm",
          fps: 15,
          prefix: "batch",
          retries: 1,
          delayMs: 120,
          zipPng: true,
        };
      }
      if (data && data.animationState && data.animationState.stateMachine && typeof data.animationState.stateMachine === "object") {
        state.anim.stateMachine = data.animationState.stateMachine;
      } else {
        state.anim.stateMachine = {
          enabled: true,
          states: [],
          parameters: [],
          currentStateId: "",
          selectedParamId: "",
          selectedTransitionId: "",
          selectedConditionId: "",
          pendingStateId: "",
          pendingDuration: 0.2,
        };
      }
      if (data && data.animationState && data.animationState.onionSkin && typeof data.animationState.onionSkin === "object") {
        state.anim.onionSkin = data.animationState.onionSkin;
      } else {
        state.anim.onionSkin = {
          enabled: false,
          prevFrames: 2,
          nextFrames: 2,
          alpha: 0.22,
        };
      }
      ensureOnionSkinSettings();
      state.anim.groupMute = {};
      state.anim.groupSolo = {};
      state.anim.filterText = "";
      state.anim.onlyKeyed = false;
      if (Array.isArray(data.slots) && state.slots.length > 0) {
        for (let i = 0; i < state.slots.length && i < data.slots.length; i += 1) {
          const src = data.slots[i] || {};
          const dst = state.slots[i];
          dst.name = src.name || dst.name;
          dst.id = src.id ? String(src.id) : dst.id || makeSlotId();
          dst.attachmentName = src.attachmentName ? String(src.attachmentName) : dst.attachmentName || "main";
          dst.placeholderName = src.placeholderName ? String(src.placeholderName) : dst.placeholderName || dst.attachmentName || "main";
          dst.activeAttachment =
            Object.prototype.hasOwnProperty.call(src, "activeAttachment")
              ? src.activeAttachment == null
                ? null
                : String(src.activeAttachment)
              : String(dst.attachmentName || "main");
          if (Array.isArray(src.attachments) && Array.isArray(dst.attachments)) {
            const srcByName = new Map(
              src.attachments
                .filter((a) => a && a.name)
                .map((a) => [
                  String(a.name),
                  {
                    placeholder: String(a.placeholder || dst.placeholderName || dst.attachmentName || "main"),
                    type: normalizeAttachmentType(a.type),
                    linkedParent: a.linkedParent != null ? String(a.linkedParent) : "",
                    pointX: Number(a.pointX) || 0,
                    pointY: Number(a.pointY) || 0,
                    pointRot: Number(a.pointRot) || 0,
                    bboxSource: a && a.bboxSource === "contour" ? "contour" : "fill",
                    sequence:
                      a && a.sequence
                        ? {
                            enabled: !!a.sequence.enabled,
                            count: Math.max(1, Math.round(Number(a.sequence.count) || 1)),
                            start: Math.max(0, Math.round(Number(a.sequence.start) || 0)),
                            digits: Math.max(1, Math.round(Number(a.sequence.digits) || 2)),
                          }
                        : { enabled: false, count: 1, start: 0, digits: 2 },
                  },
                ])
            );
            for (const a of dst.attachments) {
              if (!a || !a.name) continue;
              const meta = srcByName.get(String(a.name));
              a.placeholder = meta ? meta.placeholder : String(a.placeholder || dst.placeholderName || dst.attachmentName || "main");
              if (meta) {
                a.type = meta.type;
                a.linkedParent = meta.linkedParent;
                a.pointX = meta.pointX;
                a.pointY = meta.pointY;
                a.pointRot = meta.pointRot;
                a.bboxSource = meta.bboxSource;
                a.sequence = meta.sequence;
              }
            }
          }
          dst.editorVisible = Object.prototype.hasOwnProperty.call(src, "editorVisible")
            ? src.editorVisible !== false
            : src.visible !== false;
          dst.bone = Number.isFinite(src.bone) ? src.bone : dst.bone;
          dst.visible = dst.editorVisible;
          dst.alpha = Number.isFinite(src.alpha) ? math.clamp(src.alpha, 0, 1) : 1;
          dst.r = Number.isFinite(src.r) ? math.clamp(src.r, 0, 1) : 1;
          dst.g = Number.isFinite(src.g) ? math.clamp(src.g, 0, 1) : 1;
          dst.b = Number.isFinite(src.b) ? math.clamp(src.b, 0, 1) : 1;
          dst.blend = normalizeSlotBlendMode(src && src.blend);
          dst.darkEnabled = !!(src && src.darkEnabled);
          dst.dr = Number.isFinite(src && src.dr) ? math.clamp(src.dr, 0, 1) : 0;
          dst.dg = Number.isFinite(src && src.dg) ? math.clamp(src.dg, 0, 1) : 0;
          dst.db = Number.isFinite(src && src.db) ? math.clamp(src.db, 0, 1) : 0;
          dst.tx = Number.isFinite(src.tx) ? src.tx : 0;
          dst.ty = Number.isFinite(src.ty) ? src.ty : 0;
          dst.rot = Number.isFinite(src.rot) ? src.rot : 0;
          dst.useWeights = src.useWeights === true;
          dst.weightBindMode = src.weightBindMode || (dst.useWeights ? "single" : "none");
          dst.weightMode =
            src.weightMode ||
            (dst.weightBindMode === "auto" ? "weighted" : dst.useWeights ? "single" : "free");
          dst.influenceBones = Array.isArray(src.influenceBones)
            ? src.influenceBones.filter((v) => Number.isFinite(v))
            : [];
          dst.clipEnabled = !!src.clipEnabled;
          dst.clipSource = src && src.clipSource === "contour" ? "contour" : "fill";
          dst.clipEndSlotId =
            Object.prototype.hasOwnProperty.call(src, "clipEndSlotId")
              ? src.clipEndSlotId == null
                ? null
                : String(src.clipEndSlotId)
              : null;
          if (src.rect && Number.isFinite(src.rect.w) && Number.isFinite(src.rect.h)) {
            dst.rect = {
              x: Number(src.rect.x) || 0,
              y: Number(src.rect.y) || 0,
              w: Math.max(1, Number(src.rect.w) || 1),
              h: Math.max(1, Number(src.rect.h) || 1),
            };
          }
          if (src.meshContour && Array.isArray(src.meshContour.points)) {
            dst.meshContour = {
              points: src.meshContour.points.map((p) => ({ x: Number(p.x) || 0, y: Number(p.y) || 0 })),
              closed: !!src.meshContour.closed,
              triangles: Array.isArray(src.meshContour.triangles)
                ? src.meshContour.triangles.map((v) => Number(v) || 0)
                : [],
              fillPoints: Array.isArray(src.meshContour.fillPoints)
                ? src.meshContour.fillPoints.map((p) => ({ x: Number(p.x) || 0, y: Number(p.y) || 0 }))
                : [],
              fillTriangles: Array.isArray(src.meshContour.fillTriangles)
                ? src.meshContour.fillTriangles.map((v) => Number(v) || 0)
                : [],
              manualEdges: Array.isArray(src.meshContour.manualEdges)
                ? src.meshContour.manualEdges
                    .filter((e) => Array.isArray(e) && e.length >= 2)
                    .map((e) => [Number(e[0]) || 0, Number(e[1]) || 0])
                : [],
              fillManualEdges: Array.isArray(src.meshContour.fillManualEdges)
                ? src.meshContour.fillManualEdges
                    .filter((e) => Array.isArray(e) && e.length >= 2)
                    .map((e) => [Number(e[0]) || 0, Number(e[1]) || 0])
                : [],
            };
          } else {
            ensureSlotContour(dst);
          }
          dst.docWidth = Number.isFinite(src.docWidth) ? src.docWidth : state.imageWidth;
          dst.docHeight = Number.isFinite(src.docHeight) ? src.docHeight : state.imageHeight;
          ensureSlotVisualState(dst);
        }
        if (Number.isFinite(data.activeSlot)) {
          state.activeSlot = math.clamp(Number(data.activeSlot), 0, state.slots.length - 1);
        }
      }
      state.slotViewMode = data.slotViewMode === "all" ? "all" : "single";
      state.skinSets = Array.isArray(data.skinSets)
        ? data.skinSets.map((s, i) => ({
            id: s && s.id ? String(s.id) : makeSkinSetId(),
            name: s && s.name ? String(s.name) : `skin_${i}`,
            slotAttachments:
              s && s.slotAttachments && typeof s.slotAttachments === "object"
                ? Object.fromEntries(
                    Object.entries(s.slotAttachments).map(([k, v]) => [String(k), v == null ? null : String(v)])
                  )
                : {},
            slotPlaceholderAttachments:
              s && s.slotPlaceholderAttachments && typeof s.slotPlaceholderAttachments === "object"
                ? Object.fromEntries(
                    Object.entries(s.slotPlaceholderAttachments).map(([slotId, map]) => [
                      String(slotId),
                      map && typeof map === "object"
                        ? Object.fromEntries(Object.entries(map).map(([ph, v]) => [String(ph), v == null ? null : String(v)]))
                        : {},
                    ])
                  )
                : {},
          }))
        : [];
      state.selectedSkinSet = Number.isFinite(Number(data.selectedSkinSet)) ? Number(data.selectedSkinSet) : 0;
      ensureSkinSets();
      ensureSlotsHaveBoneBinding();
      rebuildSlotTriangleIndices();
      state.selectedBone = state.mesh && state.mesh.rigBones.length > 0 ? 0 : -1;
      refreshAnimationUI();
      refreshSlotUI();
      updateBoneUI();
      setStatus(`Project loaded${hasEmbeddedImages ? " (with embedded images)" : ""}.`);
      if (!state.history.suspend) {
        state.history.undo = [];
        state.history.redo = [];
        state.history.lastSig = "";
        pushUndoCheckpoint(true);
      }
      saveAutosaveSnapshot("project_load", true);
    } catch (err) {
      setStatus(`Project load failed: ${err.message}`);
    } finally {
      e.target.value = "";
    }
}

if (els.projectLoadInput) {
  els.projectLoadInput.addEventListener("change", handleProjectLoadInputChange);
}

if (els.diagnosticsRunBtn) {
  els.diagnosticsRunBtn.addEventListener("click", () => {
    const includeExport = els.diagnosticsExportCheck ? !!els.diagnosticsExportCheck.checked : true;
    runDiagnostics({ includeExport });
  });
}
if (els.diagnosticsAutoFixBtn) {
  els.diagnosticsAutoFixBtn.addEventListener("click", () => {
    applyDiagnosticsSafeFixes();
    const includeExport = els.diagnosticsExportCheck ? !!els.diagnosticsExportCheck.checked : true;
    runDiagnostics({ includeExport });
  });
}
if (els.diagnosticsClearBtn) {
  els.diagnosticsClearBtn.addEventListener("click", () => {
    state.diagnostics.issues = [];
    state.diagnostics.lastRunAt = Date.now();
    renderDiagnosticsUI();
    setStatus("Diagnostics list cleared.");
  });
}
if (els.diagnosticsList) {
  els.diagnosticsList.addEventListener("click", (ev) => {
    const row = ev.target.closest(".diag-item");
    if (!row || !row.dataset.action) return;
    try {
      const action = JSON.parse(row.dataset.action);
      focusDiagnosticsAction(action);
    } catch {
      // ignore
    }
  });
}

els.remeshBtn.addEventListener("click", rebuildMesh);
els.editMode.addEventListener("change", () => {
  const v = els.editMode.value;
  state.editMode = v === "vertex" ? "vertex" : v === "slotmesh" ? "slotmesh" : "skeleton";
  if (state.editMode === "slotmesh") {
    state.uiPage = "slot";
    state.leftToolTab = "slotmesh";
  } else if (state.uiPage === "slot") {
    state.uiPage = "rig";
    if (state.leftToolTab === "slotmesh") state.leftToolTab = "setup";
  }
  if (state.editMode !== "skeleton") state.pathEdit.drawArmed = false;
  state.workspaceMode = state.editMode === "slotmesh" ? "slotmesh" : "rig";
  updateWorkspaceUI();
});
els.boneMode.addEventListener("change", () => {
  if (!state.mesh) return;
  state.boneMode = els.boneMode.value;
  if (state.boneMode !== "edit") {
    state.addBoneArmed = false;
    state.addBoneDraft = null;
    els.addBoneBtn.textContent = "Add Bone";
  }
  if (state.boneMode === "pose") {
    syncPoseFromRig(state.mesh);
    samplePoseAtTime(state.mesh, state.anim.time);
  }
  updateWorkspaceUI();
  updateBoneUI();
});

els.boneSelect.addEventListener("change", () => {
  if (!state.mesh) return;
  const v = Number(els.boneSelect.value);
  state.selectedBone = Number.isFinite(v) ? v : -1;
  state.selectedBonesForWeight = state.selectedBone >= 0 ? [state.selectedBone] : [];
  setRightPropsFocus("bone");
  updateBoneUI();
});

els.addBoneBtn.addEventListener("click", () => {
  if (!state.mesh || state.boneMode !== "edit") return;
  state.addBoneArmed = !state.addBoneArmed;
  state.addBoneDraft = null;
  els.addBoneBtn.textContent = state.addBoneArmed ? "Cancel Add" : "Add Bone";
  setStatus(state.addBoneArmed ? "Add bone armed: drag in canvas to create." : "Add bone canceled.");
});
els.deleteBoneBtn.addEventListener("click", deleteBone);
els.autoWeightBtn.addEventListener("click", () => {
  if (!state.mesh) return;
  if (state.boneMode !== "edit") return;
  if (autoWeightActiveSlot()) {
    const picked = getSelectedBonesForWeight(state.mesh);
    setStatus(
      `Auto weights updated (${state.weightMode}) on ${state.slots.length > 0 ? "active slot" : "mesh"}; bones: ${
        picked.length > 0 ? picked.join(", ") : "(slot default)"
      }.`
    );
  }
});
els.weightMode.addEventListener("change", () => {
  state.weightMode = els.weightMode.value;
});
if (els.skinSelect) {
  els.skinSelect.addEventListener("change", () => {
    state.selectedSkinSet = Number(els.skinSelect.value) || 0;
    refreshSkinUI();
  });
}
if (els.activeSkinSelect) {
  els.activeSkinSelect.addEventListener("change", () => {
    state.selectedSkinSet = Number(els.activeSkinSelect.value) || 0;
    refreshSkinUI();
    applySelectedSkinSetWithStatus();
  });
}
if (els.skinName) {
  els.skinName.addEventListener("input", () => {
    const skin = getSelectedSkinSet();
    if (!skin) return;
    skin.name = String(els.skinName.value || "").trim() || skin.name || "skin";
    refreshSkinUI();
  });
}
if (els.skinAddBtn) {
  els.skinAddBtn.addEventListener("click", () => {
    const skin = addSkinSetFromCurrentState();
    setStatus(`Skin added: ${skin.name}`);
  });
}
if (els.activeSkinAddBtn) {
  els.activeSkinAddBtn.addEventListener("click", () => {
    const skin = addSkinSetFromCurrentState();
    setStatus(`Skin added: ${skin.name}`);
  });
}
if (els.skinDeleteBtn) {
  els.skinDeleteBtn.addEventListener("click", () => {
    const list = ensureSkinSets();
    if (list.length <= 1) {
      setStatus("Keep at least one skin.");
      return;
    }
    const idx = Number(state.selectedSkinSet) || 0;
    const removed = list.splice(Math.max(0, Math.min(idx, list.length - 1)), 1)[0];
    state.selectedSkinSet = Math.max(0, Math.min(idx, list.length - 1));
    refreshSkinUI();
    setStatus(`Skin deleted: ${removed && removed.name ? removed.name : "skin"}`);
  });
}
if (els.skinCaptureBtn) {
  els.skinCaptureBtn.addEventListener("click", () => {
    const skin = captureSelectedSkinSetFromCurrentState();
    if (!skin) return;
    setStatus(`Skin captured: ${skin.name}`);
  });
}
if (els.activeSkinCaptureBtn) {
  els.activeSkinCaptureBtn.addEventListener("click", () => {
    const skin = captureSelectedSkinSetFromCurrentState();
    if (!skin) return;
    setStatus(`Skin captured: ${skin.name}`);
  });
}
if (els.skinApplyBtn) {
  els.skinApplyBtn.addEventListener("click", () => {
    applySelectedSkinSetWithStatus();
  });
}
if (els.activeSkinApplyBtn) {
  els.activeSkinApplyBtn.addEventListener("click", () => {
    applySelectedSkinSetWithStatus();
  });
}
if (els.slotQuickAddBtn) {
  els.slotQuickAddBtn.addEventListener("click", () => {
    const slot = addEmptySlotQuick();
    if (!slot) {
      setStatus("Import image/PSD first, then add slot.");
      return;
    }
    pushUndoCheckpoint(true);
    setStatus(`Empty slot added: ${slot.name}`);
  });
}
if (els.treeCtxSlotAddBtn) {
  els.treeCtxSlotAddBtn.addEventListener("click", () => {
    const slot = addEmptySlotQuick();
    if (!slot) {
      setStatus("Import image/PSD first, then add slot.");
      closeBoneTreeContextMenu();
      return;
    }
    pushUndoCheckpoint(true);
    setStatus(`Empty slot added: ${slot.name}`);
    closeBoneTreeContextMenu();
  });
}
if (els.slotQuickDupBtn) {
  els.slotQuickDupBtn.addEventListener("click", () => {
    const slot = duplicateActiveSlotQuick();
    if (!slot) {
      setStatus("No active slot to duplicate.");
      return;
    }
    pushUndoCheckpoint(true);
    setStatus(`Slot duplicated: ${slot.name}`);
  });
}
if (els.treeCtxSlotDupBtn) {
  els.treeCtxSlotDupBtn.addEventListener("click", () => {
    const slot = duplicateActiveSlotQuick();
    if (!slot) {
      setStatus("No active slot to duplicate.");
      closeBoneTreeContextMenu();
      return;
    }
    pushUndoCheckpoint(true);
    setStatus(`Slot duplicated: ${slot.name}`);
    closeBoneTreeContextMenu();
  });
}
if (els.treeCtxSlotRenameBtn) {
  els.treeCtxSlotRenameBtn.addEventListener("click", () => {
    const active = getActiveSlot();
    if (!active) {
      setStatus("Select an active slot to rename.");
      closeBoneTreeContextMenu();
      return;
    }
    renameSlotByIndexFromTree(state.activeSlot);
    closeBoneTreeContextMenu();
  });
}
if (els.slotQuickDeleteBtn) {
  els.slotQuickDeleteBtn.addEventListener("click", () => {
    const removed = deleteActiveSlotQuick();
    if (!removed) {
      setStatus("No active slot to delete.");
      return;
    }
    pushUndoCheckpoint(true);
    setStatus(`Slot deleted: ${removed.name || "slot"}`);
  });
}
if (els.treeCtxSlotDeleteBtn) {
  els.treeCtxSlotDeleteBtn.addEventListener("click", () => {
    const removed = deleteActiveSlotQuick();
    if (!removed) {
      setStatus("No active slot to delete.");
      closeBoneTreeContextMenu();
      return;
    }
    pushUndoCheckpoint(true);
    setStatus(`Slot deleted: ${removed.name || "slot"}`);
    closeBoneTreeContextMenu();
  });
}
if (els.treeCtxSlotLoadImageBtn) {
  els.treeCtxSlotLoadImageBtn.addEventListener("click", () => {
    if (!openLoadImageForActiveSlotFromTree()) {
      setStatus("Select an active slot with a valid attachment first.");
    }
    closeBoneTreeContextMenu();
  });
}
els.resetPoseBtn.addEventListener("click", resetPose);
els.resetVertexBtn.addEventListener("click", resetVertexOffsets);
if (els.vertexProportionalToggle) {
  els.vertexProportionalToggle.addEventListener("change", () => {
    state.vertexDeform.proportional = !!els.vertexProportionalToggle.checked;
    refreshVertexDeformUI();
    setStatus(`Vertex proportional edit ${state.vertexDeform.proportional ? "ON" : "OFF"}.`);
  });
}
if (els.vertexMirrorToggle) {
  els.vertexMirrorToggle.addEventListener("change", () => {
    state.vertexDeform.mirror = !!els.vertexMirrorToggle.checked;
    refreshVertexDeformUI();
    setStatus(`Vertex mirror edit ${state.vertexDeform.mirror ? "ON" : "OFF"}.`);
  });
}
if (els.vertexHeatmapToggle) {
  els.vertexHeatmapToggle.addEventListener("change", () => {
    state.vertexDeform.heatmap = !!els.vertexHeatmapToggle.checked;
    refreshVertexDeformUI();
    setStatus(`Vertex heatmap preview ${state.vertexDeform.heatmap ? "ON" : "OFF"}.`);
  });
}
if (els.vertexProportionalRadius) {
  const applyVertexRadius = () => {
    state.vertexDeform.radius = math.clamp(Number(els.vertexProportionalRadius.value) || 80, 4, 400);
    refreshVertexDeformUI();
  };
  els.vertexProportionalRadius.addEventListener("input", applyVertexRadius);
  els.vertexProportionalRadius.addEventListener("change", applyVertexRadius);
}
if (els.vertexProportionalFalloff) {
  els.vertexProportionalFalloff.addEventListener("change", () => {
    state.vertexDeform.falloff = sanitizeVertexFalloff(els.vertexProportionalFalloff.value);
    refreshVertexDeformUI();
    setStatus(`Vertex falloff: ${state.vertexDeform.falloff}.`);
  });
}
if (els.ikAdd1Btn) {
  els.ikAdd1Btn.addEventListener("click", () => {
    if (!addIKConstraint(false)) {
      setStatus("Add IK 1-Bone failed. Need at least one bone.");
      return;
    }
    const c = getActiveIKConstraint();
    const m = state.mesh;
    if (c && m) {
      const a = Number(c.bones && c.bones[0]);
      const t = Number(c.target);
      setStatus(`IK 1-Bone added: ${m.rigBones[a]?.name || a} -> target ${m.rigBones[t]?.name || t}.`);
    } else {
      setStatus("IK 1-Bone added.");
    }
  });
}
if (els.ikAdd2Btn) {
  els.ikAdd2Btn.addEventListener("click", () => {
    if (!addIKConstraint(true)) {
      setStatus("Add IK 2-Bone failed. Select a bone in a valid parent-child chain.");
      return;
    }
    const c = getActiveIKConstraint();
    const m = state.mesh;
    if (c && m && Array.isArray(c.bones) && c.bones.length >= 2) {
      const a = Number(c.bones[0]);
      const b = Number(c.bones[1]);
      const t = Number(c.target);
      setStatus(
        `IK 2-Bone added: ${m.rigBones[a]?.name || a} -> ${m.rigBones[b]?.name || b}, target ${m.rigBones[t]?.name || t}.`
      );
    } else {
      setStatus("IK 2-Bone added.");
    }
  });
}
if (els.ikMoveUpBtn) {
  els.ikMoveUpBtn.addEventListener("click", () => {
    const m = state.mesh;
    if (!m) return;
    const list = ensureIKConstraints(m);
    const i = state.selectedIK;
    if (i <= 0 || i >= list.length) return;
    const current = list[i];
    swapConstraintOrder(list, i, i - 1);
    sortConstraintListByOrder(list);
    state.selectedIK = list.indexOf(current);
    refreshIKUI();
    setStatus("IK moved up.");
  });
}
if (els.ikMoveDownBtn) {
  els.ikMoveDownBtn.addEventListener("click", () => {
    const m = state.mesh;
    if (!m) return;
    const list = ensureIKConstraints(m);
    const i = state.selectedIK;
    if (i < 0 || i >= list.length - 1) return;
    const current = list[i];
    swapConstraintOrder(list, i, i + 1);
    sortConstraintListByOrder(list);
    state.selectedIK = list.indexOf(current);
    refreshIKUI();
    setStatus("IK moved down.");
  });
}
if (els.ikRemoveBtn) {
  els.ikRemoveBtn.addEventListener("click", () => {
    if (!removeSelectedIKConstraint()) {
      setStatus("No IK constraint selected.");
      return;
    }
    setStatus("IK removed.");
  });
}
if (els.ikList) {
  els.ikList.addEventListener("click", (ev) => {
    const row = ev.target.closest("[data-ik-index]");
    if (!row) return;
    const idx = Number(row.dataset.ikIndex);
    if (!Number.isFinite(idx)) return;
    state.selectedIK = idx;
    refreshIKUI();
    selectActiveIKEndBone(true);
  });
}
if (els.ikSelect) {
  els.ikSelect.addEventListener("change", () => {
    state.selectedIK = Number(els.ikSelect.value);
    refreshIKUI();
    selectActiveIKEndBone(true);
  });
}
if (els.ikName) {
  els.ikName.addEventListener("input", () => {
    const c = getActiveIKConstraint();
    if (!c) return;
    c.name = els.ikName.value.trim() || `ik_${state.selectedIK}`;
    refreshIKUI();
    refreshTrackSelect();
    renderTimelineTracks();
  });
}
if (els.ikPickTargetBtn) {
  els.ikPickTargetBtn.addEventListener("click", () => {
    const c = getActiveIKConstraint();
    if (!c) return;
    state.ikPickArmed = !state.ikPickArmed;
    state.ikHoverBone = -1;
    refreshIKUI();
    renderBoneTree();
    setStatus(state.ikPickArmed ? "IK target pick armed: click a bone in canvas." : "IK target pick canceled.");
  });
}
if (els.ikEnabled) els.ikEnabled.addEventListener("change", applyActiveIKFromUI);
if (els.ikTargetBone) els.ikTargetBone.addEventListener("change", applyActiveIKFromUI);
if (els.ikBoneA) els.ikBoneA.addEventListener("change", applyActiveIKFromUI);
if (els.ikBoneB) els.ikBoneB.addEventListener("change", applyActiveIKFromUI);
if (els.ikEndMode) els.ikEndMode.addEventListener("change", applyActiveIKFromUI);
if (els.ikMix) els.ikMix.addEventListener("input", applyActiveIKFromUI);
if (els.ikSoftness) els.ikSoftness.addEventListener("input", applyActiveIKFromUI);
if (els.ikCompress) els.ikCompress.addEventListener("change", applyActiveIKFromUI);
if (els.ikStretch) els.ikStretch.addEventListener("change", applyActiveIKFromUI);
if (els.ikUniform) els.ikUniform.addEventListener("change", applyActiveIKFromUI);
if (els.ikSkinRequired) els.ikSkinRequired.addEventListener("change", applyActiveIKFromUI);
if (els.ikBendDir) els.ikBendDir.addEventListener("change", applyActiveIKFromUI);
if (els.tfcAddBtn) {
  els.tfcAddBtn.addEventListener("click", () => {
    if (!addTransformConstraint()) {
      setStatus("Add Transform failed. Need at least 2 bones.");
      return;
    }
    setStatus("Transform constraint added.");
  });
}
if (els.tfcRemoveBtn) {
  els.tfcRemoveBtn.addEventListener("click", () => {
    if (!removeSelectedTransformConstraint()) {
      setStatus("No Transform constraint selected.");
      return;
    }
    setStatus("Transform constraint removed.");
  });
}
if (els.tfcMoveUpBtn) {
  els.tfcMoveUpBtn.addEventListener("click", () => {
    const m = state.mesh;
    if (!m) return;
    const list = ensureTransformConstraints(m);
    const i = state.selectedTransform;
    if (i <= 0 || i >= list.length) return;
    const current = list[i];
    swapConstraintOrder(list, i, i - 1);
    sortConstraintListByOrder(list);
    state.selectedTransform = list.indexOf(current);
    refreshTransformUI();
    refreshTrackSelect();
    renderTimelineTracks();
    setStatus("Transform moved up.");
  });
}
if (els.tfcMoveDownBtn) {
  els.tfcMoveDownBtn.addEventListener("click", () => {
    const m = state.mesh;
    if (!m) return;
    const list = ensureTransformConstraints(m);
    const i = state.selectedTransform;
    if (i < 0 || i >= list.length - 1) return;
    const current = list[i];
    swapConstraintOrder(list, i, i + 1);
    sortConstraintListByOrder(list);
    state.selectedTransform = list.indexOf(current);
    refreshTransformUI();
    refreshTrackSelect();
    renderTimelineTracks();
    setStatus("Transform moved down.");
  });
}
if (els.tfcList) {
  els.tfcList.addEventListener("click", (ev) => {
    const row = ev.target.closest("[data-tfc-index]");
    if (!row) return;
    const idx = Number(row.dataset.tfcIndex);
    if (!Number.isFinite(idx)) return;
    state.selectedTransform = idx;
    refreshTransformUI();
  });
}
if (els.tfcSelect) {
  els.tfcSelect.addEventListener("change", () => {
    state.selectedTransform = Number(els.tfcSelect.value);
    refreshTransformUI();
  });
}
if (els.tfcName) {
  els.tfcName.addEventListener("input", () => {
    const c = getActiveTransformConstraint();
    if (!c) return;
    c.name = els.tfcName.value.trim() || `transform_${state.selectedTransform}`;
    refreshTransformUI();
    refreshTrackSelect();
    renderTimelineTracks();
  });
}
if (els.tfcEnabled) els.tfcEnabled.addEventListener("change", () => applyActiveTransformFromUI(false));
if (els.tfcTargetBone) els.tfcTargetBone.addEventListener("change", () => applyActiveTransformFromUI(false));
if (els.tfcBones) els.tfcBones.addEventListener("change", () => applyActiveTransformFromUI(true));
if (els.tfcLocal) els.tfcLocal.addEventListener("change", () => applyActiveTransformFromUI(false));
if (els.tfcRelative) els.tfcRelative.addEventListener("change", () => applyActiveTransformFromUI(false));
if (els.tfcRotateMix) els.tfcRotateMix.addEventListener("input", () => applyActiveTransformFromUI(false));
if (els.tfcTranslateMix) els.tfcTranslateMix.addEventListener("input", () => applyActiveTransformFromUI(false));
if (els.tfcScaleMix) els.tfcScaleMix.addEventListener("input", () => applyActiveTransformFromUI(false));
if (els.tfcShearMix) els.tfcShearMix.addEventListener("input", () => applyActiveTransformFromUI(false));
if (els.tfcOffsetX) els.tfcOffsetX.addEventListener("input", () => applyActiveTransformFromUI(false));
if (els.tfcOffsetY) els.tfcOffsetY.addEventListener("input", () => applyActiveTransformFromUI(false));
if (els.tfcOffsetRot) els.tfcOffsetRot.addEventListener("input", () => applyActiveTransformFromUI(false));
if (els.tfcOffsetScaleX) els.tfcOffsetScaleX.addEventListener("input", () => applyActiveTransformFromUI(false));
if (els.tfcOffsetScaleY) els.tfcOffsetScaleY.addEventListener("input", () => applyActiveTransformFromUI(false));
if (els.tfcOffsetShearY) els.tfcOffsetShearY.addEventListener("input", () => applyActiveTransformFromUI(false));
if (els.tfcSkinRequired) els.tfcSkinRequired.addEventListener("change", () => applyActiveTransformFromUI(false));
if (els.tfcBoneSearch) {
  els.tfcBoneSearch.addEventListener("input", () => {
    refreshTransformUI();
  });
}
if (els.tfcBonesAllBtn) {
  els.tfcBonesAllBtn.addEventListener("click", () => {
    if (!els.tfcBones) return;
    for (const opt of els.tfcBones.options) opt.selected = true;
    applyActiveTransformFromUI(true);
  });
}
if (els.tfcBonesClearBtn) {
  els.tfcBonesClearBtn.addEventListener("click", () => {
    if (!els.tfcBones) return;
    for (const opt of els.tfcBones.options) opt.selected = false;
    applyActiveTransformFromUI(true);
  });
}
if (els.tfcBonesInvertBtn) {
  els.tfcBonesInvertBtn.addEventListener("click", () => {
    if (!els.tfcBones) return;
    for (const opt of els.tfcBones.options) opt.selected = !opt.selected;
    applyActiveTransformFromUI(true);
  });
}
if (els.pathAddBtn) {
  els.pathAddBtn.addEventListener("click", () => {
    if (!addPathConstraint()) {
      setStatus("Add Path failed. Need at least 1 bone.");
      return;
    }
    state.editMode = "skeleton";
    if (els.editMode) els.editMode.value = "skeleton";
    state.leftToolTab = "path";
    state.pathEdit.drawArmed = true;
    state.workspaceMode = "rig";
    updateWorkspaceUI();
    refreshTrackSelect();
    renderTimelineTracks();
    setStatus("Path constraint added. Draw mode armed: click canvas to add path points.");
  });
}
if (els.pathRemoveBtn) {
  els.pathRemoveBtn.addEventListener("click", () => {
    if (!removeSelectedPathConstraint()) {
      setStatus("No Path constraint selected.");
      return;
    }
    refreshTrackSelect();
    renderTimelineTracks();
    setStatus("Path constraint removed.");
  });
}
if (els.pathMoveUpBtn) {
  els.pathMoveUpBtn.addEventListener("click", () => {
    const m = state.mesh;
    if (!m) return;
    const list = ensurePathConstraints(m);
    const i = state.selectedPath;
    if (i <= 0 || i >= list.length) return;
    const current = list[i];
    swapConstraintOrder(list, i, i - 1);
    sortConstraintListByOrder(list);
    state.selectedPath = list.indexOf(current);
    refreshPathUI();
    refreshTrackSelect();
    renderTimelineTracks();
    setStatus("Path moved up.");
  });
}
if (els.pathMoveDownBtn) {
  els.pathMoveDownBtn.addEventListener("click", () => {
    const m = state.mesh;
    if (!m) return;
    const list = ensurePathConstraints(m);
    const i = state.selectedPath;
    if (i < 0 || i >= list.length - 1) return;
    const current = list[i];
    swapConstraintOrder(list, i, i + 1);
    sortConstraintListByOrder(list);
    state.selectedPath = list.indexOf(current);
    refreshPathUI();
    refreshTrackSelect();
    renderTimelineTracks();
    setStatus("Path moved down.");
  });
}
if (els.pathList) {
  els.pathList.addEventListener("click", (ev) => {
    const row = ev.target.closest("[data-path-index]");
    if (!row) return;
    const idx = Number(row.dataset.pathIndex);
    if (!Number.isFinite(idx)) return;
    state.selectedPath = idx;
    refreshPathUI();
  });
}
if (els.pathSelect) {
  els.pathSelect.addEventListener("change", () => {
    state.selectedPath = Number(els.pathSelect.value);
    refreshPathUI();
  });
}
if (els.pathName) {
  els.pathName.addEventListener("input", () => {
    const c = getActivePathConstraint();
    if (!c) return;
    c.name = els.pathName.value.trim() || `path_${state.selectedPath}`;
    refreshPathUI();
    refreshTrackSelect();
    renderTimelineTracks();
  });
}
if (els.pathTargetBone) els.pathTargetBone.addEventListener("change", () => applyActivePathFromUI(false));
if (els.pathSourceType) els.pathSourceType.addEventListener("change", () => applyActivePathFromUI(false));
if (els.pathTargetSlot) els.pathTargetSlot.addEventListener("change", () => applyActivePathFromUI(false));
if (els.pathEnabled) els.pathEnabled.addEventListener("change", () => applyActivePathFromUI(false));
if (els.pathBones) els.pathBones.addEventListener("change", () => applyActivePathFromUI(true));
if (els.pathPositionMode) els.pathPositionMode.addEventListener("change", () => applyActivePathFromUI(false));
if (els.pathSpacingMode) els.pathSpacingMode.addEventListener("change", () => applyActivePathFromUI(false));
if (els.pathRotateMode) els.pathRotateMode.addEventListener("change", () => applyActivePathFromUI(false));
if (els.pathPosition) els.pathPosition.addEventListener("input", () => applyActivePathFromUI(false));
if (els.pathSpacing) els.pathSpacing.addEventListener("input", () => applyActivePathFromUI(false));
if (els.pathRotateMix) els.pathRotateMix.addEventListener("input", () => applyActivePathFromUI(false));
if (els.pathTranslateMix) els.pathTranslateMix.addEventListener("input", () => applyActivePathFromUI(false));
if (els.pathSkinRequired) els.pathSkinRequired.addEventListener("change", () => applyActivePathFromUI(false));
if (els.pathClosed) els.pathClosed.addEventListener("change", () => applyActivePathFromUI(false));
if (els.pathDrawBtn) {
  els.pathDrawBtn.addEventListener("click", () => {
    if (!state.mesh || !getActivePathConstraint()) {
      setStatus("Select a Path constraint first.");
      return;
    }
    state.pathEdit.drawArmed = true;
    state.editMode = "skeleton";
    if (els.editMode) els.editMode.value = "skeleton";
    state.leftToolTab = "path";
    updateWorkspaceUI();
    setStatus("Path draw armed: click canvas to add points.");
  });
}
if (els.pathStopDrawBtn) {
  els.pathStopDrawBtn.addEventListener("click", () => {
    state.pathEdit.drawArmed = false;
    setStatus("Path draw stopped.");
  });
}
if (els.pathCloseShapeBtn) {
  els.pathCloseShapeBtn.addEventListener("click", () => {
    if (!closeActivePathShape()) {
      setStatus("Need at least 3 points to close path.");
      return;
    }
    setStatus("Path closed.");
  });
}
if (els.pathClearShapeBtn) {
  els.pathClearShapeBtn.addEventListener("click", () => {
    if (!clearActivePathShape()) {
      setStatus("No active path.");
      return;
    }
    setStatus("Path shape cleared.");
  });
}
if (els.pathApplyHandleModeBtn) {
  els.pathApplyHandleModeBtn.addEventListener("click", () => {
    const mode = els.pathHandleMode ? els.pathHandleMode.value : "aligned";
    if (!applyHandleModeToSelectedPathPoint(mode)) {
      setStatus("Select a drawn path point first.");
      return;
    }
    setStatus(`Handle mode applied: ${mode}.`);
  });
}
if (els.slotMeshNewBtn) {
  els.slotMeshNewBtn.addEventListener("click", () => {
    const source = getActiveSlot();
    if (!source) return;
    const mode = state.slotMesh.newContourMode === "reset_current" ? "reset_current" : "new_slot";
    if (mode === "reset_current") {
      source.meshContour = {
        points: [],
        closed: false,
        triangles: [],
        fillPoints: [],
        fillTriangles: [],
        manualEdges: [],
        fillManualEdges: [],
      };
      state.slotMesh.activePoint = -1;
      state.slotMesh.activeSet = "contour";
      state.slotMesh.edgeSelection = [];
      state.slotMesh.edgeSelectionSet = "contour";
      setStatus("Current slot contour reset. Click canvas to add contour points.");
      return;
    }
    const created = addContourSlotFromActiveSlot(source);
    if (!created) return;
    setStatus(`Created contour slot "${created.name}" from shared base texture.`);
  });
}
if (els.slotMeshNewMode) {
  els.slotMeshNewMode.addEventListener("change", () => {
    state.slotMesh.newContourMode = els.slotMeshNewMode.value === "reset_current" ? "reset_current" : "new_slot";
  });
}
if (els.slotMeshGridReplaceContour) {
  els.slotMeshGridReplaceContour.addEventListener("change", () => {
    state.slotMesh.gridReplaceContour = !!els.slotMeshGridReplaceContour.checked;
  });
}
if (els.slotMeshCloseBtn) {
  els.slotMeshCloseBtn.addEventListener("click", () => {
    const slot = getActiveSlot();
    if (!slot) return;
    const c = ensureSlotContour(slot);
    if (c.points.length < 3) {
      setStatus("Need at least 3 points to close contour.");
      return;
    }
    c.closed = true;
    c.triangles = [];
    c.fillPoints = [];
    c.fillTriangles = [];
    c.fillManualEdges = [];
    setStatus("Contour closed.");
  });
}
if (els.slotMeshTriangulateBtn) {
  els.slotMeshTriangulateBtn.addEventListener("click", () => {
    const slot = getActiveSlot();
    if (!slot) return;
    const c = ensureSlotContour(slot);
    if (!c.closed || c.points.length < 3) {
      setStatus("Close contour first, then triangulate.");
      return;
    }
    c.triangles = applyManualEdgesToTriangles(c.points, triangulatePolygon(c.points), c.manualEdges);
    c.fillPoints = [];
    c.fillTriangles = [];
    c.fillManualEdges = [];
    if (c.triangles.length < 3) {
      setStatus("Triangulation failed. Adjust contour (avoid self-intersection).");
      return;
    }
    setStatus(`Triangulated: ${c.triangles.length / 3} triangles.`);
  });
}
if (els.slotMeshGridFillBtn) {
  els.slotMeshGridFillBtn.addEventListener("click", () => {
    const slot = getActiveSlot();
    if (!slot) return;
    const c = ensureSlotContour(slot);
    if (!c.closed || c.points.length < 3) {
      setStatus("Close contour first, then run Grid Fill.");
      return;
    }
    const replaceContour = !!state.slotMesh.gridReplaceContour;
    const fill = buildUniformGridFillForContour(
      c,
      Number(els.gridX.value) || 24,
      Number(els.gridY.value) || 24,
      !replaceContour
    );
    c.fillPoints = fill.points;
    c.fillManualEdges = normalizeEdgePairs(c.fillManualEdges, c.fillPoints.length);
    c.fillTriangles = applyManualEdgesToTriangles(c.fillPoints, fill.triangles, c.fillManualEdges);
    c.fillTriangles = sanitizeTriangles(c.fillPoints, c.fillTriangles, c.points);
    if (c.fillTriangles.length < 3) {
      setStatus("Grid fill failed. Increase Grid X/Y or adjust contour.");
      return;
    }
    if (replaceContour) {
      const nextContour = Array.isArray(fill.contourPoints) ? fill.contourPoints : [];
      if (nextContour.length >= 3) {
        c.points = nextContour.map((p) => ({ x: Number(p.x) || 0, y: Number(p.y) || 0 }));
        c.manualEdges = [];
        c.triangles = [];
        c.closed = true;
        // Re-validate fill triangles against the replaced contour polygon.
        c.fillTriangles = sanitizeTriangles(c.fillPoints, c.fillTriangles, c.points);
        if (c.fillTriangles.length < 3) {
          c.fillPoints = [];
          c.fillManualEdges = [];
          setStatus("Grid fill contour replacement failed. Increase Grid X/Y or adjust contour.");
          return;
        }
        state.slotMesh.edgeSelection = [];
        state.slotMesh.edgeSelectionSet = "fill";
        state.slotMesh.activeSet = "fill";
        state.slotMesh.activePoint = Math.max(0, Math.min(state.slotMesh.activePoint, c.fillPoints.length - 1));
      }
      setStatus(
        `Grid fill generated: ${c.fillPoints.length} points, ${c.fillTriangles.length / 3} triangles. Contour replaced: ${c.points.length} points.`
      );
      return;
    }
    setStatus(`Grid fill generated: ${c.fillPoints.length} points, ${c.fillTriangles.length / 3} triangles.`);
  });
}
if (els.slotMeshApplyBtn) {
  els.slotMeshApplyBtn.addEventListener("click", () => {
    const slot = getActiveSlot();
    if (!slot) return;
    const ok = applyContourMeshToSlot(slot);
    if (!ok) {
      setStatus("Apply failed. Need a closed contour with valid triangulation.");
      return;
    }
    setStatus("Slot mesh applied from contour.");
  });
}
if (els.slotMeshLinkEdgeBtn) {
  els.slotMeshLinkEdgeBtn.addEventListener("click", () => {
    const slot = getActiveSlot();
    if (!slot) return;
    const ok = linkSelectedSlotMeshEdge(true);
    const activeSet = state.slotMesh.activeSet === "fill" ? "fill" : "contour";
    if (!ok) {
      setStatus("Select 2 vertices (Shift+Click) in the same set, then Link Edge.");
      return;
    }
    const [a0, b0] = state.slotMesh.edgeSelection;
    const a = Math.min(a0, b0);
    const b = Math.max(a0, b0);
    setStatus(`Edge linked (${activeSet}: ${a}-${b}).`);
  });
}
if (els.slotMeshUnlinkEdgeBtn) {
  els.slotMeshUnlinkEdgeBtn.addEventListener("click", () => {
    const slot = getActiveSlot();
    if (!slot) return;
    const ok = linkSelectedSlotMeshEdge(false);
    const activeSet = state.slotMesh.activeSet === "fill" ? "fill" : "contour";
    if (!ok) {
      setStatus("Select 2 linked vertices (Shift+Click) in the same set, then Unlink Edge.");
      return;
    }
    const [a0, b0] = state.slotMesh.edgeSelection;
    const a = Math.min(a0, b0);
    const b = Math.max(a0, b0);
    setStatus(`Edge unlinked (${activeSet}: ${a}-${b}).`);
  });
}
if (els.slotBindBoneBtn) {
  els.slotBindBoneBtn.addEventListener("click", () => {
    const ok = bindActiveSlotToSelectedBone();
    if (!ok) {
      setStatus("Bind failed. Select a bone first, and ensure an active slot exists.");
      return;
    }
    const slot = getActiveSlot();
    setStatus(`Slot "${slot ? slot.name : ""}" bound to bone ${slot ? slot.bone : -1}.`);
  });
}
if (els.slotBindWeightedBtn) {
  els.slotBindWeightedBtn.addEventListener("click", () => {
    const ok = bindActiveSlotWeightedToSelectedBones();
    if (!ok) {
      setStatus("Weighted bind failed. Select one or more bones first.");
      return;
    }
    const slot = getActiveSlot();
    setStatus(
      `Slot "${slot ? slot.name : ""}" weighted to bones: ${(slot && slot.influenceBones && slot.influenceBones.join(", ")) || "(none)"}`
    );
  });
}
if (els.slotMeshResetBtn) {
  els.slotMeshResetBtn.addEventListener("click", () => {
    const slot = getActiveSlot();
    if (!slot) return;
    if (resetSlotMeshToGrid(slot)) {
      setStatus("Slot mesh reset to grid.");
    }
  });
}

els.boneName.addEventListener("input", () => {
  const m = state.mesh;
  if (!m || state.boneMode !== "edit") return;
  const b = m.rigBones[state.selectedBone];
  if (!b) return;
  b.name = els.boneName.value.trim() || `bone_${state.selectedBone}`;
  if (m.poseBones[state.selectedBone]) {
    m.poseBones[state.selectedBone].name = b.name;
  }
  updateBoneSelectors();
  els.boneSelect.value = String(state.selectedBone);
  els.boneParent.value = String(b.parent);
});

els.boneParent.addEventListener("change", () => {
  const m = state.mesh;
  if (!m || state.boneMode !== "edit") return;
  const i = state.selectedBone;
  const newParent = Number(els.boneParent.value);
  if (!isValidParent(m.rigBones, i, newParent)) {
    updateBoneUI();
    setStatus("Invalid parent: would create a cycle.");
    return;
  }
  m.rigBones[i].parent = newParent;
  if (newParent >= 0) {
    m.rigBones[i].connected = true;
  }
  if (m.poseBones[i]) {
    m.poseBones[i].parent = newParent;
  }
  commitRigEdit(m, true);
  updateBoneUI();
});

if (els.boneInherit) {
  els.boneInherit.addEventListener("change", () => {
    const m = state.mesh;
    if (!m || state.boneMode !== "edit") return;
    const i = state.selectedBone;
    const b = m.rigBones[i];
    if (!b) return;
    b.inherit = normalizeBoneInheritValue(els.boneInherit.value);
    if (m.poseBones[i]) m.poseBones[i].inherit = b.inherit;
    commitRigEdit(m, false);
    updateBoneUI();
  });
}

els.boneTx.addEventListener("input", () => {
  const m = state.mesh;
  if (!m) return;
  const b = getBonesForCurrentMode(m)[state.selectedBone];
  if (!b) return;
  if (b.parent >= 0 && b.connected) return;
  b.tx = Number(els.boneTx.value) || 0;
  markDirtyByBoneProp(state.selectedBone, "translate");
  if (state.boneMode === "edit") {
    commitRigEdit(m, true);
  }
  updateBoneUI();
});

els.boneTy.addEventListener("input", () => {
  const m = state.mesh;
  if (!m) return;
  const b = getBonesForCurrentMode(m)[state.selectedBone];
  if (!b) return;
  if (b.parent >= 0 && b.connected) return;
  b.ty = Number(els.boneTy.value) || 0;
  markDirtyByBoneProp(state.selectedBone, "translate");
  if (state.boneMode === "edit") {
    commitRigEdit(m, true);
  }
  updateBoneUI();
});

els.boneRot.addEventListener("input", () => {
  const m = state.mesh;
  if (!m) return;
  const b = getBonesForCurrentMode(m)[state.selectedBone];
  if (!b) return;
  b.rot = math.degToRad(Number(els.boneRot.value) || 0);
  if (state.boneMode === "pose") {
    steerIKTargetFromBoneEdit(m, state.selectedBone, null);
  }
  markDirtyByBoneProp(state.selectedBone, "rotate");
  if (state.boneMode === "edit") {
    commitRigEdit(m, true);
  }
  updateBoneUI();
});

els.boneLen.addEventListener("input", () => {
  const m = state.mesh;
  if (!m) return;
  const b = getBonesForCurrentMode(m)[state.selectedBone];
  if (!b) return;
  if (state.boneMode === "pose" && b.poseLenEditable === false) return;
  b.length = Math.max(1, Number(els.boneLen.value) || 1);
  if (state.boneMode === "pose") {
    steerIKTargetFromBoneEdit(m, state.selectedBone, null);
  }
  markDirtyByBoneProp(state.selectedBone, "scale");
  if (state.boneMode === "edit") {
    commitRigEdit(m, true);
  }
  updateBoneUI();
});

if (els.boneScaleX) {
  els.boneScaleX.addEventListener("input", () => {
    const m = state.mesh;
    if (!m) return;
    const b = getBonesForCurrentMode(m)[state.selectedBone];
    if (!b) return;
    normalizeBoneChannels(b);
    b.sx = Number(els.boneScaleX.value) || 1;
    markDirtyByBoneProp(state.selectedBone, "scaleX");
    if (state.boneMode === "edit") commitRigEdit(m, true);
    updateBoneUI();
  });
}
if (els.boneScaleY) {
  els.boneScaleY.addEventListener("input", () => {
    const m = state.mesh;
    if (!m) return;
    const b = getBonesForCurrentMode(m)[state.selectedBone];
    if (!b) return;
    normalizeBoneChannels(b);
    b.sy = Number(els.boneScaleY.value) || 1;
    markDirtyByBoneProp(state.selectedBone, "scaleY");
    if (state.boneMode === "edit") commitRigEdit(m, true);
    updateBoneUI();
  });
}
if (els.boneShearX) {
  els.boneShearX.addEventListener("input", () => {
    const m = state.mesh;
    if (!m) return;
    const b = getBonesForCurrentMode(m)[state.selectedBone];
    if (!b) return;
    normalizeBoneChannels(b);
    b.shx = math.degToRad(Number(els.boneShearX.value) || 0);
    markDirtyByBoneProp(state.selectedBone, "shearX");
    if (state.boneMode === "edit") commitRigEdit(m, true);
    updateBoneUI();
  });
}
if (els.boneShearY) {
  els.boneShearY.addEventListener("input", () => {
    const m = state.mesh;
    if (!m) return;
    const b = getBonesForCurrentMode(m)[state.selectedBone];
    if (!b) return;
    normalizeBoneChannels(b);
    b.shy = math.degToRad(Number(els.boneShearY.value) || 0);
    markDirtyByBoneProp(state.selectedBone, "shearY");
    if (state.boneMode === "edit") commitRigEdit(m, true);
    updateBoneUI();
  });
}

els.boneConnect.addEventListener("change", () => {
  const m = state.mesh;
  if (!m) return;
  const i = state.selectedBone;
  const connected = els.boneConnect.value === "true";
  if (m.rigBones[i]) m.rigBones[i].connected = connected;
  if (m.poseBones[i]) m.poseBones[i].connected = connected;
  enforceConnectedHeads(m.rigBones);
  enforceConnectedHeads(m.poseBones);
  if (state.boneMode === "edit") {
    commitRigEdit(m, true);
  }
  updateBoneUI();
});

els.bonePoseLen.addEventListener("change", () => {
  const m = state.mesh;
  if (!m) return;
  const i = state.selectedBone;
  const editable = els.bonePoseLen.value === "true";
  if (m.rigBones[i]) m.rigBones[i].poseLenEditable = editable;
  if (m.poseBones[i]) m.poseBones[i].poseLenEditable = editable;
  updateBoneUI();
});

function applyHeadTipFromInputs() {
  const m = state.mesh;
  if (!m) return;
  const i = state.selectedBone;
  const bones = getBonesForCurrentMode(m);
  const b = bones[i];
  if (!b) return;
  const hx = Number(els.boneHeadX.value);
  const hy = Number(els.boneHeadY.value);
  const tx = Number(els.boneTipX.value);
  const ty = Number(els.boneTipY.value);
  const head = {
    x: Number.isFinite(hx) ? hx : 0,
    y: Number.isFinite(hy) ? hy : 0,
  };
  const tip = {
    x: Number.isFinite(tx) ? tx : head.x + Math.max(1, b.length),
    y: Number.isFinite(ty) ? ty : head.y,
  };
  const resolvedHead = b.parent >= 0 && b.connected ? getBoneWorldEndpointsFromBones(bones, i).head : head;
  if (state.boneMode === "pose" && b.poseLenEditable === false) {
    const a = angleTo(resolvedHead, tip);
    tip.x = resolvedHead.x + Math.cos(a) * b.length;
    tip.y = resolvedHead.y + Math.sin(a) * b.length;
  }
  setBoneFromWorldEndpoints(bones, i, resolvedHead, tip);
  if (state.boneMode === "pose") {
    steerIKTargetFromBoneEdit(m, i, tip);
  }
  markDirtyByBoneProp(i, "translate");
  markDirtyByBoneProp(i, "rotate");
  markDirtyByBoneProp(i, "scale");
  if (state.boneMode === "edit") {
    commitRigEdit(m, true);
  }
  updateBoneUI();
}

els.boneHeadX.addEventListener("input", applyHeadTipFromInputs);
els.boneHeadY.addEventListener("input", applyHeadTipFromInputs);
els.boneTipX.addEventListener("input", applyHeadTipFromInputs);
els.boneTipY.addEventListener("input", applyHeadTipFromInputs);

els.animDuration.addEventListener("input", () => {
  const anim = getCurrentAnimation();
  if (!anim) return;
  anim.duration = Math.max(0.1, Number(els.animDuration.value) || anim.duration || 5);
  setAnimTime(state.anim.time);
});
els.animTime.addEventListener("input", () => {
  setAnimTime(Number(els.animTime.value) || 0);
  if (state.mesh) {
    samplePoseAtTime(state.mesh, state.anim.time);
    if (state.boneMode === "pose") updateBoneUI();
  }
});
els.animSelect.addEventListener("change", () => {
  state.anim.mix.active = false;
  state.anim.currentAnimId = els.animSelect.value;
  const anim = getCurrentAnimation();
  if (!anim) return;
  clearTimelineKeySelection();
  setAnimTime(0);
  refreshAnimationUI();
  if (state.mesh) {
    samplePoseAtTime(state.mesh, 0);
    if (state.boneMode === "pose") updateBoneUI();
  }
});
els.animName.addEventListener("input", () => {
  const anim = getCurrentAnimation();
  if (!anim) return;
  anim.name = els.animName.value.trim() || "Anim";
  refreshAnimationUI();
});
els.addAnimBtn.addEventListener("click", () => {
  const idx = state.anim.animations.length + 1;
  const a = createAnimation(`Anim ${idx}`);
  state.anim.animations.push(a);
  state.anim.currentAnimId = a.id;
  state.anim.mix.active = false;
  clearTimelineKeySelection();
  setAnimTime(0);
  refreshAnimationUI();
});
els.duplicateAnimBtn.addEventListener("click", () => {
  const curr = getCurrentAnimation();
  if (!curr) return;
  const dup = {
    id: makeAnimId(),
    name: `${curr.name} Copy`,
    duration: curr.duration,
    tracks: JSON.parse(JSON.stringify(curr.tracks)),
  };
  state.anim.animations.push(dup);
  state.anim.currentAnimId = dup.id;
  state.anim.mix.active = false;
  clearTimelineKeySelection();
  refreshAnimationUI();
});
els.deleteAnimBtn.addEventListener("click", () => {
  if (state.anim.animations.length <= 1) return;
  state.anim.animations = state.anim.animations.filter((a) => a.id !== state.anim.currentAnimId);
  ensureCurrentAnimation();
  state.anim.mix.active = false;
  clearTimelineKeySelection();
  setAnimTime(0);
  refreshAnimationUI();
});
els.trackSelect.addEventListener("change", () => {
  state.anim.selectedTrack = els.trackSelect.value;
  syncLayerPanelFromSelectedTrack();
  clearTimelineKeySelection();
  renderTimelineTracks();
});
if (els.timelineFilter) {
  els.timelineFilter.addEventListener("input", () => {
    state.anim.filterText = String(els.timelineFilter.value || "");
    renderTimelineTracks();
  });
}
if (els.timelineOnlyKeyed) {
  els.timelineOnlyKeyed.addEventListener("change", () => {
    state.anim.onlyKeyed = !!els.timelineOnlyKeyed.checked;
    renderTimelineTracks();
  });
}
if (els.timelineClearSoloMuteBtn) {
  els.timelineClearSoloMuteBtn.addEventListener("click", () => {
    clearTimelineSoloMuteFlags();
  });
}
if (els.autoKeyBtn) {
  els.autoKeyBtn.addEventListener("click", () => {
    state.anim.autoKey = !state.anim.autoKey;
    refreshAutoKeyUI();
    if (state.anim.autoKey) {
      scheduleAutoKeyFromDirty();
      setStatus("Auto Key enabled.");
    } else {
      setStatus("Auto Key disabled.");
    }
  });
}
if (els.undoBtn) {
  els.undoBtn.addEventListener("click", async () => {
    await undoAction();
  });
}
if (els.redoBtn) {
  els.redoBtn.addEventListener("click", async () => {
    await redoAction();
  });
}
if (els.exportPreviewWebmBtn) {
  els.exportPreviewWebmBtn.addEventListener("click", async () => {
    try {
      await exportPreviewWebM();
    } catch (err) {
      setStatus(`Preview WebM failed: ${err.message}`);
    }
  });
}
if (els.exportPreviewGifBtn) {
  els.exportPreviewGifBtn.addEventListener("click", async () => {
    try {
      await exportPreviewGif();
    } catch (err) {
      setStatus(`Preview GIF failed: ${err.message}`);
    }
  });
}
if (els.batchExportToggleBtn) {
  els.batchExportToggleBtn.addEventListener("click", () => {
    state.anim.batchExportOpen = !state.anim.batchExportOpen;
    refreshBatchExportUI();
  });
}
if (els.batchExportFormat) {
  els.batchExportFormat.addEventListener("change", () => {
    syncBatchExportSettingsFromUI();
    refreshBatchExportUI();
  });
}
if (els.batchExportFps) {
  els.batchExportFps.addEventListener("input", () => {
    syncBatchExportSettingsFromUI();
  });
}
if (els.batchExportPrefix) {
  els.batchExportPrefix.addEventListener("input", () => {
    syncBatchExportSettingsFromUI();
  });
}
if (els.batchExportRetries) {
  els.batchExportRetries.addEventListener("input", () => {
    syncBatchExportSettingsFromUI();
  });
}
if (els.batchExportDelayMs) {
  els.batchExportDelayMs.addEventListener("input", () => {
    syncBatchExportSettingsFromUI();
  });
}
if (els.batchExportZipPng) {
  els.batchExportZipPng.addEventListener("change", () => {
    syncBatchExportSettingsFromUI();
  });
}
if (els.batchExportSelectAllBtn) {
  els.batchExportSelectAllBtn.addEventListener("click", () => {
    if (!els.batchExportAnimList) return;
    for (const opt of els.batchExportAnimList.options) opt.selected = true;
  });
}
if (els.batchExportSelectNoneBtn) {
  els.batchExportSelectNoneBtn.addEventListener("click", () => {
    if (!els.batchExportAnimList) return;
    for (const opt of els.batchExportAnimList.options) opt.selected = false;
  });
}
if (els.batchExportRunBtn) {
  els.batchExportRunBtn.addEventListener("click", async () => {
    await runBatchExport();
  });
}
if (els.smEnabled) {
  els.smEnabled.addEventListener("change", () => {
    const sm = ensureStateMachine();
    sm.enabled = !!els.smEnabled.checked;
    refreshStateMachineUI();
    pushUndoCheckpoint(true);
  });
}
if (els.smStateSelect) {
  els.smStateSelect.addEventListener("change", () => {
    const sm = ensureStateMachine();
    const id = String(els.smStateSelect.value || "");
    if (id && sm.states.some((s) => s.id === id)) {
      sm.currentStateId = id;
      sm.selectedTransitionId = "";
      sm.selectedConditionId = "";
    }
    refreshStateMachineUI();
  });
}
if (els.smStateAddBtn) {
  els.smStateAddBtn.addEventListener("click", () => {
    const sm = ensureStateMachine();
    const fallbackAnim = (state.anim.animations && state.anim.animations[0] && state.anim.animations[0].id) || "";
    const st = { id: makeStateId(), name: `State ${sm.states.length + 1}`, animId: fallbackAnim, transitions: [] };
    sm.states.push(st);
    sm.currentStateId = st.id;
    refreshStateMachineUI();
    pushUndoCheckpoint(true);
  });
}
if (els.smStateDeleteBtn) {
  els.smStateDeleteBtn.addEventListener("click", () => {
    const sm = ensureStateMachine();
    if (sm.states.length <= 1) return;
    const id = sm.currentStateId;
    sm.states = sm.states.filter((s) => s.id !== id);
    for (const s of sm.states) s.transitions = (s.transitions || []).filter((t) => t.toStateId !== id);
    sm.currentStateId = sm.states[0] ? sm.states[0].id : "";
    refreshStateMachineUI();
    pushUndoCheckpoint(true);
  });
}
if (els.smStateName) {
  els.smStateName.addEventListener("input", () => {
    const s = getCurrentStateMachineState();
    if (!s) return;
    s.name = String(els.smStateName.value || "").trim() || s.name || "State";
    refreshStateMachineUI();
    pushUndoCheckpoint(true);
  });
}
if (els.smStateAnim) {
  els.smStateAnim.addEventListener("change", () => {
    const s = getCurrentStateMachineState();
    if (!s) return;
    s.animId = String(els.smStateAnim.value || "");
    refreshStateMachineUI();
    pushUndoCheckpoint(true);
  });
}
if (els.smTransitionAddBtn) {
  els.smTransitionAddBtn.addEventListener("click", () => {
    const sm = ensureStateMachine();
    const from = getCurrentStateMachineState();
    const toId = String(els.smTransitionTo ? els.smTransitionTo.value : "");
    if (!from || !toId) return;
    const tr = {
      id: makeStateTransitionId(),
      toStateId: toId,
      duration: Math.max(0.01, Number(els.smTransitionDur ? els.smTransitionDur.value : 0.2) || 0.2),
      auto: false,
      conditions: [],
    };
    if (!Array.isArray(from.transitions)) from.transitions = [];
    from.transitions.push(tr);
    sm.selectedTransitionId = tr.id;
    sm.pendingDuration = tr.duration;
    refreshStateMachineUI();
    pushUndoCheckpoint(true);
  });
}
if (els.smTransitionDur) {
  els.smTransitionDur.addEventListener("input", () => {
    const sm = ensureStateMachine();
    sm.pendingDuration = Math.max(0.01, Number(els.smTransitionDur.value) || 0.2);
    els.smTransitionDur.value = String(sm.pendingDuration);
  });
}
if (els.smTransitionList) {
  els.smTransitionList.addEventListener("change", () => {
    const sm = ensureStateMachine();
    sm.selectedTransitionId = String(els.smTransitionList.value || "");
    sm.selectedConditionId = "";
    refreshStateMachineUI();
  });
}
if (els.smTransitionDeleteBtn) {
  els.smTransitionDeleteBtn.addEventListener("click", () => {
    const sm = ensureStateMachine();
    const from = getCurrentStateMachineState();
    if (!from || !sm.selectedTransitionId) return;
    from.transitions = (from.transitions || []).filter((t) => t.id !== sm.selectedTransitionId);
    sm.selectedTransitionId = "";
    sm.selectedConditionId = "";
    refreshStateMachineUI();
    pushUndoCheckpoint(true);
  });
}
if (els.smTransitionGoBtn) {
  els.smTransitionGoBtn.addEventListener("click", () => {
    const sm = ensureStateMachine();
    if (!sm.enabled) return;
    const from = getCurrentStateMachineState();
    if (!from) return;
    const tr = (from.transitions || []).find((t) => t.id === sm.selectedTransitionId);
    if (!tr) return;
    transitionToState(tr.toStateId, tr.duration, from);
    pushUndoCheckpoint(true);
  });
}
if (els.smParamSelect) {
  els.smParamSelect.addEventListener("change", () => {
    const sm = ensureStateMachine();
    sm.selectedParamId = String(els.smParamSelect.value || "");
    refreshStateMachineUI();
  });
}
if (els.smParamAddBtn) {
  els.smParamAddBtn.addEventListener("click", () => {
    const sm = ensureStateMachine();
    const p = {
      id: makeStateParamId(),
      name: `Param ${sm.parameters.length + 1}`,
      type: "float",
      defaultValue: 0,
      value: 0,
    };
    sm.parameters.push(p);
    sm.selectedParamId = p.id;
    refreshStateMachineUI();
    refreshTrackSelect();
    renderTimelineTracks();
    pushUndoCheckpoint(true);
  });
}
if (els.smParamDeleteBtn) {
  els.smParamDeleteBtn.addEventListener("click", () => {
    const sm = ensureStateMachine();
    const id = String(sm.selectedParamId || "");
    if (!id) return;
    sm.parameters = (sm.parameters || []).filter((p) => p.id !== id);
    for (const st of sm.states || []) {
      for (const tr of st.transitions || []) {
        tr.conditions = (tr.conditions || []).filter((c) => c.paramId !== id);
      }
    }
    for (const anim of state.anim.animations || []) {
      if (!anim || !anim.tracks) continue;
      delete anim.tracks[getStateParamTrackId(id)];
    }
    sm.selectedParamId = sm.parameters[0] ? sm.parameters[0].id : "";
    refreshStateMachineUI();
    refreshTrackSelect();
    renderTimelineTracks();
    pushUndoCheckpoint(true);
  });
}
if (els.smParamName) {
  els.smParamName.addEventListener("input", () => {
    const sm = ensureStateMachine();
    const p = getStateParamById(sm, sm.selectedParamId);
    if (!p) return;
    p.name = String(els.smParamName.value || "").trim() || p.name || "Param";
    refreshStateMachineUI();
    refreshTrackSelect();
    renderTimelineTracks();
    pushUndoCheckpoint(true);
  });
}
if (els.smParamType) {
  els.smParamType.addEventListener("change", () => {
    const sm = ensureStateMachine();
    const p = getStateParamById(sm, sm.selectedParamId);
    if (!p) return;
    p.type = els.smParamType.value === "bool" ? "bool" : "float";
    p.defaultValue = parseStateParamRawValue(p.defaultValue, p.type);
    p.value = parseStateParamRawValue(p.value, p.type);
    refreshStateMachineUI();
    refreshTrackSelect();
    renderTimelineTracks();
    pushUndoCheckpoint(true);
  });
}
if (els.smParamDefault) {
  els.smParamDefault.addEventListener("input", () => {
    const sm = ensureStateMachine();
    const p = getStateParamById(sm, sm.selectedParamId);
    if (!p) return;
    p.defaultValue = parseStateParamRawValue(els.smParamDefault.value, p.type);
  });
}
if (els.smParamSetBtn) {
  els.smParamSetBtn.addEventListener("click", () => {
    const sm = ensureStateMachine();
    const p = getStateParamById(sm, sm.selectedParamId);
    if (!p || !els.smParamValue) return;
    p.value = parseStateParamRawValue(els.smParamValue.value, p.type);
    refreshStateMachineUI();
    pushUndoCheckpoint(true);
  });
}
if (els.smParamKeyBtn) {
  els.smParamKeyBtn.addEventListener("click", () => {
    const sm = ensureStateMachine();
    const p = getStateParamById(sm, sm.selectedParamId);
    if (!p) return;
    const trackId = getStateParamTrackId(p.id);
    refreshTrackSelect();
    state.anim.selectedTrack = trackId;
    if (els.trackSelect) els.trackSelect.value = trackId;
    addOrUpdateKeyframeForTrack(trackId);
  });
}
if (els.smTransitionAuto) {
  els.smTransitionAuto.addEventListener("change", () => {
    const tr = getSelectedStateTransition();
    if (!tr) return;
    tr.auto = !!els.smTransitionAuto.checked;
    refreshStateMachineUI();
    pushUndoCheckpoint(true);
  });
}
if (els.smCondAddBtn) {
  els.smCondAddBtn.addEventListener("click", () => {
    const sm = ensureStateMachine();
    const tr = getSelectedStateTransition();
    if (!tr || !els.smCondParam || !els.smCondOp || !els.smCondValue) return;
    const paramId = String(els.smCondParam.value || "");
    const p = getStateParamById(sm, paramId);
    if (!p) return;
    const cond = {
      id: makeStateConditionId(),
      paramId: p.id,
      op:
        els.smCondOp.value === "neq" || els.smCondOp.value === "gt" || els.smCondOp.value === "gte" || els.smCondOp.value === "lt" || els.smCondOp.value === "lte"
          ? els.smCondOp.value
          : "eq",
      value: parseStateParamRawValue(els.smCondValue.value, p.type),
    };
    if (!Array.isArray(tr.conditions)) tr.conditions = [];
    tr.conditions.push(cond);
    sm.selectedConditionId = cond.id;
    refreshStateMachineUI();
    pushUndoCheckpoint(true);
  });
}
if (els.smCondList) {
  els.smCondList.addEventListener("change", () => {
    const sm = ensureStateMachine();
    sm.selectedConditionId = String(els.smCondList.value || "");
    refreshStateMachineUI();
  });
}
if (els.smCondDeleteBtn) {
  els.smCondDeleteBtn.addEventListener("click", () => {
    const sm = ensureStateMachine();
    const tr = getSelectedStateTransition();
    if (!tr || !sm.selectedConditionId) return;
    tr.conditions = (tr.conditions || []).filter((c) => c.id !== sm.selectedConditionId);
    sm.selectedConditionId = "";
    refreshStateMachineUI();
    pushUndoCheckpoint(true);
  });
}
if (els.smBridgeExportBtn) {
  els.smBridgeExportBtn.addEventListener("click", () => {
    exportStateMachineBridgeJson();
  });
}
if (els.smBridgeCodeBtn) {
  els.smBridgeCodeBtn.addEventListener("click", () => {
    exportStateMachineBridgeCode();
  });
}
if (els.smBridgeParamSelect) {
  els.smBridgeParamSelect.addEventListener("change", () => {
    refreshStateMachineUI();
  });
}
if (els.smBridgeSetBtn) {
  els.smBridgeSetBtn.addEventListener("click", () => {
    const sm = ensureStateMachine();
    const id = String(els.smBridgeParamSelect ? els.smBridgeParamSelect.value : "");
    const p = getStateParamById(sm, id);
    if (!p || !els.smBridgeParamValue) return;
    const ok = window.setAnimParam ? window.setAnimParam(p.name, els.smBridgeParamValue.value) : false;
    if (ok) {
      pushUndoCheckpoint(true);
      setStatus(`Bridge param applied: ${p.name}=${String(els.smBridgeParamValue.value)}`);
    }
  });
}
els.addKeyBtn.addEventListener("click", () => {
  if (!state.mesh) return;
  addAutoKeyframeFromDirty();
});
if (els.addAttachmentKeyBtn) {
  els.addAttachmentKeyBtn.addEventListener("click", () => {
    if (!state.mesh || state.activeSlot < 0) return;
    const trackId = getSlotTrackId(state.activeSlot, "attachment");
    state.anim.selectedTrack = trackId;
    if (els.trackSelect) els.trackSelect.value = trackId;
    addOrUpdateKeyframeForTrack(trackId);
  });
}
if (els.addClipKeyBtn) {
  els.addClipKeyBtn.addEventListener("click", () => {
    if (!state.mesh || state.activeSlot < 0) return;
    const trackId = getSlotTrackId(state.activeSlot, "clip");
    state.anim.selectedTrack = trackId;
    if (els.trackSelect) els.trackSelect.value = trackId;
    addOrUpdateKeyframeForTrack(trackId);
  });
}
if (els.addClipSourceKeyBtn) {
  els.addClipSourceKeyBtn.addEventListener("click", () => {
    if (!state.mesh || state.activeSlot < 0) return;
    const trackId = getSlotTrackId(state.activeSlot, "clipSource");
    state.anim.selectedTrack = trackId;
    if (els.trackSelect) els.trackSelect.value = trackId;
    addOrUpdateKeyframeForTrack(trackId);
  });
}
if (els.addClipComboKeyBtn) {
  els.addClipComboKeyBtn.addEventListener("click", () => {
    addOrUpdateClipBundleKeyForActiveSlot();
  });
}
if (els.addClipEndKeyBtn) {
  els.addClipEndKeyBtn.addEventListener("click", () => {
    if (!state.mesh || state.activeSlot < 0) return;
    const trackId = getSlotTrackId(state.activeSlot, "clipEnd");
    state.anim.selectedTrack = trackId;
    if (els.trackSelect) els.trackSelect.value = trackId;
    addOrUpdateKeyframeForTrack(trackId);
  });
}
if (els.addDrawOrderKeyBtn) {
  els.addDrawOrderKeyBtn.addEventListener("click", () => {
    if (!state.mesh) return;
    state.anim.selectedTrack = DRAWORDER_TRACK_ID;
    if (els.trackSelect) els.trackSelect.value = DRAWORDER_TRACK_ID;
    addOrUpdateKeyframeForTrack(DRAWORDER_TRACK_ID);
  });
}
if (els.loopMakeSeamBtn) {
  els.loopMakeSeamBtn.addEventListener("click", () => {
    if (!state.mesh) return;
    if (!applyLoopSeamOnSelectedTrack()) {
      setStatus("Loop Seam failed: select a keyed track first.");
    }
  });
}
if (els.loopPingPongBtn) {
  els.loopPingPongBtn.addEventListener("click", () => {
    if (!state.mesh) return;
    if (!applyLoopPingPongOnSelectedTrack()) {
      setStatus("Loop PingPong failed: need at least 2 keys on selected track.");
    }
  });
}
if (els.drawOrderToggleBtn) {
  els.drawOrderToggleBtn.addEventListener("click", () => {
    state.anim.drawOrderEditorOpen = !state.anim.drawOrderEditorOpen;
    refreshDrawOrderUI();
  });
}
if (els.drawOrderList) {
  els.drawOrderList.addEventListener("change", () => {
    refreshDrawOrderEditorButtonState();
    const id = String(els.drawOrderList.value || "");
    if (!id) return;
    const idx = state.slots.findIndex((s) => s && s.id && String(s.id) === id);
    if (idx >= 0) {
      state.activeSlot = idx;
      refreshSlotUI();
      renderBoneTree();
    } else {
      refreshDrawOrderUI();
    }
  });
}
if (els.drawOrderUpBtn) {
  els.drawOrderUpBtn.addEventListener("click", () => {
    moveDrawOrderSelection(-1);
  });
}
if (els.drawOrderDownBtn) {
  els.drawOrderDownBtn.addEventListener("click", () => {
    moveDrawOrderSelection(1);
  });
}
if (els.drawOrderApplyBtn) {
  els.drawOrderApplyBtn.addEventListener("click", () => {
    applyDrawOrderFromUI(false);
  });
}
if (els.drawOrderApplyKeyBtn) {
  els.drawOrderApplyKeyBtn.addEventListener("click", () => {
    applyDrawOrderFromUI(true);
  });
}
els.deleteKeyBtn.addEventListener("click", () => {
  deleteSelectedOrCurrentKeyframe();
});
els.copyKeyBtn.addEventListener("click", () => {
  copySelectedKeyframe();
});
els.pasteKeyBtn.addEventListener("click", () => {
  pasteKeyframeAtCurrentTime();
});
if (els.addEventBtn) {
  els.addEventBtn.addEventListener("click", () => {
    addOrUpdateEventAtCurrentTime();
  });
}
if (els.deleteEventBtn) {
  els.deleteEventBtn.addEventListener("click", () => {
    const anim = getCurrentAnimation();
    if (!anim) return;
    const keys = getTrackKeys(anim, EVENT_TRACK_ID);
    const t = state.anim.time;
    const before = keys.length;
    anim.tracks[EVENT_TRACK_ID] = keys.filter((k) => Math.abs((Number(k.time) || 0) - t) >= 1e-4);
    if (anim.tracks[EVENT_TRACK_ID].length === before) {
      setStatus("No event key at current time.");
      return;
    }
    clearTimelineKeySelection();
    renderTimelineTracks();
    setStatus("Event key deleted at current time.");
  });
}
if (els.eventKeyList) {
  els.eventKeyList.addEventListener("change", () => {
    const anim = getCurrentAnimation();
    if (!anim) return;
    const id = els.eventKeyList.value;
    const keys = getTrackKeys(anim, EVENT_TRACK_ID);
    const k = keys.find((it) => it.id === id);
    if (!k) return;
    setSingleTimelineSelection(EVENT_TRACK_ID, k.id);
    setAnimTime(Number(k.time) || 0);
    if (state.mesh) {
      samplePoseAtTime(state.mesh, state.anim.time);
      if (state.boneMode === "pose") updateBoneUI();
    }
    renderTimelineTracks();
  });
}
if (els.eventJumpBtn) {
  els.eventJumpBtn.addEventListener("click", () => {
    if (!els.eventKeyList || !els.eventKeyList.value) return;
    const anim = getCurrentAnimation();
    if (!anim) return;
    const id = els.eventKeyList.value;
    const k = getTrackKeys(anim, EVENT_TRACK_ID).find((it) => it.id === id);
    if (!k) return;
    setSingleTimelineSelection(EVENT_TRACK_ID, k.id);
    setAnimTime(Number(k.time) || 0);
    if (state.mesh) {
      samplePoseAtTime(state.mesh, state.anim.time);
      if (state.boneMode === "pose") updateBoneUI();
    }
    renderTimelineTracks();
  });
}
if (els.eventDeleteSelBtn) {
  els.eventDeleteSelBtn.addEventListener("click", () => {
    if (!deleteSelectedEventKey()) {
      setStatus("No selected event key.");
      return;
    }
    setStatus("Selected event key deleted.");
  });
}
if (els.eventName) els.eventName.addEventListener("input", updateSelectedEventKeyFromUI);
if (els.eventInt) els.eventInt.addEventListener("input", updateSelectedEventKeyFromUI);
if (els.eventFloat) els.eventFloat.addEventListener("input", updateSelectedEventKeyFromUI);
if (els.eventString) els.eventString.addEventListener("input", updateSelectedEventKeyFromUI);
els.animLoop.addEventListener("change", () => {
  state.anim.loop = !!els.animLoop.checked;
});
els.animSnap.addEventListener("change", () => {
  state.anim.snap = !!els.animSnap.checked;
});
els.animFps.addEventListener("input", () => {
  state.anim.fps = Math.max(1, Number(els.animFps.value) || 30);
  const anim = getCurrentAnimation();
  if (anim) {
    for (const trackId of Object.keys(anim.tracks || {})) {
      normalizeTrackKeys(anim, trackId);
    }
  }
  setAnimTime(state.anim.time);
  renderTimelineTracks();
});
if (els.animTimeStep) {
  els.animTimeStep.addEventListener("input", () => {
    const step = Math.max(0.001, Number(els.animTimeStep.value) || 0.01);
    state.anim.timeStep = step;
    els.animTimeStep.value = String(step);
    const anim = getCurrentAnimation();
    if (anim) {
      for (const trackId of Object.keys(anim.tracks || {})) {
        normalizeTrackKeys(anim, trackId);
      }
    }
    setAnimTime(state.anim.time);
    renderTimelineTracks();
  });
}
function applyInterpolationToPickedKeys(valueOverride = null) {
  const anim = getCurrentAnimation();
  if (!anim) return 0;
  const value = valueOverride || els.keyInterp.value || "linear";
  const picked = state.anim.selectedKeys && state.anim.selectedKeys.length > 0 ? state.anim.selectedKeys : [state.anim.selectedKey].filter(Boolean);
  if (picked.length === 0) return 0;
  let changed = 0;
  for (const sk of picked) {
    const keys = getTrackKeys(anim, sk.trackId);
    const k = keys.find((x) => x.id === sk.keyId);
    if (!k) continue;
    if (k.interp === value && !(value === "bezier" && (!Array.isArray(k.curve) || k.curve.length < 4))) continue;
    k.interp = value;
    if (value === "bezier") ensureBezierCurveOnKey(k);
    else delete k.curve;
    changed += 1;
  }
  if (changed > 0) {
    renderTimelineTracks();
    pushUndoCheckpoint(true);
  }
  return changed;
}

els.keyInterp.addEventListener("change", () => {
  applyInterpolationToPickedKeys();
});
if (els.keyInterpApplySelectedBtn) {
  els.keyInterpApplySelectedBtn.addEventListener("click", () => {
    const n = applyInterpolationToPickedKeys();
    setStatus(n > 0 ? `Applied interpolation to ${n} key(s).` : "No selected keys to apply interpolation.");
  });
}

function beginAnimationMix(toAnimId, durationSec) {
  const from = getCurrentAnimation();
  const to = state.anim.animations.find((a) => a.id === toAnimId);
  if (!state.mesh || !from || !to || from.id === to.id) return false;
  state.anim.mix.active = true;
  state.anim.mix.fromAnimId = from.id;
  state.anim.mix.toAnimId = to.id;
  state.anim.mix.duration = Math.max(0.01, Number(durationSec) || 0.2);
  state.anim.mix.elapsed = 0;
  state.anim.mix.fromTime = state.anim.time;
  state.anim.mix.toTime = 0;
  state.anim.currentAnimId = to.id;
  setAnimTime(0);
  state.anim.playing = true;
  state.anim.lastTs = 0;
  updatePlaybackButtons();
  refreshAnimationMixUI();
  setStatus(`Mix start: ${from.name} -> ${to.name} (${state.anim.mix.duration.toFixed(2)}s)`);
  return true;
}

function waitForFrame() {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

function sleepMs(ms) {
  return new Promise((resolve) => setTimeout(resolve, Math.max(0, Number(ms) || 0)));
}

function buildGif332Palette() {
  const out = new Uint8Array(256 * 3);
  let n = 0;
  for (let i = 0; i < 256; i += 1) {
    const r = (i >> 5) & 0x07;
    const g = (i >> 2) & 0x07;
    const b = i & 0x03;
    out[n++] = Math.round((r / 7) * 255);
    out[n++] = Math.round((g / 7) * 255);
    out[n++] = Math.round((b / 3) * 255);
  }
  return out;
}

function lzwEncode8(indices) {
  const minCodeSize = 8;
  const clearCode = 1 << minCodeSize;
  const endCode = clearCode + 1;
  let codeSize = minCodeSize + 1;
  let nextCode = endCode + 1;

  const dict = new Map();
  const resetDict = () => {
    dict.clear();
    for (let i = 0; i < clearCode; i += 1) dict.set(String(i), i);
    codeSize = minCodeSize + 1;
    nextCode = endCode + 1;
  };
  resetDict();

  const outBytes = [];
  let bitBuffer = 0;
  let bitCount = 0;
  const writeCode = (code) => {
    bitBuffer |= Number(code) << bitCount;
    bitCount += codeSize;
    while (bitCount >= 8) {
      outBytes.push(bitBuffer & 0xff);
      bitBuffer >>= 8;
      bitCount -= 8;
    }
  };

  writeCode(clearCode);
  let prefix = String(indices[0] || 0);
  for (let i = 1; i < indices.length; i += 1) {
    const k = Number(indices[i]) & 0xff;
    const pk = `${prefix},${k}`;
    if (dict.has(pk)) {
      prefix = pk;
      continue;
    }
    writeCode(dict.get(prefix));
    if (nextCode < 4096) {
      dict.set(pk, nextCode++);
      if (nextCode === 1 << codeSize && codeSize < 12) codeSize += 1;
    } else {
      writeCode(clearCode);
      resetDict();
    }
    prefix = String(k);
  }
  writeCode(dict.get(prefix));
  writeCode(endCode);
  if (bitCount > 0) outBytes.push(bitBuffer & 0xff);
  return new Uint8Array(outBytes);
}

function encodeGifFrames(frames, width, height, fps = 15) {
  const bytes = [];
  const pushByte = (b) => bytes.push(b & 0xff);
  const pushWord = (w) => {
    pushByte(w & 0xff);
    pushByte((w >> 8) & 0xff);
  };
  const pushString = (s) => {
    for (let i = 0; i < s.length; i += 1) pushByte(s.charCodeAt(i));
  };

  const palette = buildGif332Palette();
  pushString("GIF89a");
  pushWord(width);
  pushWord(height);
  pushByte(0xf7);
  pushByte(0);
  pushByte(0);
  for (let i = 0; i < palette.length; i += 1) pushByte(palette[i]);

  pushByte(0x21);
  pushByte(0xff);
  pushByte(0x0b);
  pushString("NETSCAPE2.0");
  pushByte(0x03);
  pushByte(0x01);
  pushWord(0);
  pushByte(0x00);

  const delay = Math.max(1, Math.round(100 / Math.max(1, fps)));

  for (const frame of frames) {
    const rgba = frame.data;
    const idx = new Uint8Array(width * height);
    let p = 0;
    for (let i = 0; i < rgba.length; i += 4) {
      const r = rgba[i] >> 5;
      const g = rgba[i + 1] >> 5;
      const b = rgba[i + 2] >> 6;
      idx[p++] = (r << 5) | (g << 2) | b;
    }

    pushByte(0x21);
    pushByte(0xf9);
    pushByte(0x04);
    pushByte(0x04);
    pushWord(delay);
    pushByte(0x00);
    pushByte(0x00);

    pushByte(0x2c);
    pushWord(0);
    pushWord(0);
    pushWord(width);
    pushWord(height);
    pushByte(0x00);

    pushByte(0x08);
    const lzw = lzwEncode8(idx);
    let off = 0;
    while (off < lzw.length) {
      const n = Math.min(255, lzw.length - off);
      pushByte(n);
      for (let i = 0; i < n; i += 1) pushByte(lzw[off + i]);
      off += n;
    }
    pushByte(0x00);
  }

  pushByte(0x3b);
  return new Blob([new Uint8Array(bytes)], { type: "image/gif" });
}

const crc32Table = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let c = i;
    for (let j = 0; j < 8; j += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c >>> 0;
  }
  return table;
})();

function crc32OfBytes(bytes) {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i += 1) {
    c = crc32Table[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

async function buildZipBlobFromNamedBlobs(items) {
  const files = [];
  for (const it of items) {
    if (!it || !it.blob || !it.name) continue;
    const data = new Uint8Array(await it.blob.arrayBuffer());
    const nameBytes = new TextEncoder().encode(String(it.name));
    files.push({ name: String(it.name), data, nameBytes, crc32: crc32OfBytes(data) });
  }
  const chunks = [];
  const central = [];
  let offset = 0;
  const pushU16 = (arr, v) => {
    arr.push(v & 0xff, (v >>> 8) & 0xff);
  };
  const pushU32 = (arr, v) => {
    arr.push(v & 0xff, (v >>> 8) & 0xff, (v >>> 16) & 0xff, (v >>> 24) & 0xff);
  };
  for (const f of files) {
    const local = [];
    pushU32(local, 0x04034b50);
    pushU16(local, 20);
    pushU16(local, 0);
    pushU16(local, 0);
    pushU16(local, 0);
    pushU16(local, 0);
    pushU32(local, f.crc32 >>> 0);
    pushU32(local, f.data.length >>> 0);
    pushU32(local, f.data.length >>> 0);
    pushU16(local, f.nameBytes.length);
    pushU16(local, 0);
    local.push(...f.nameBytes);
    chunks.push(new Uint8Array(local), f.data);

    const cent = [];
    pushU32(cent, 0x02014b50);
    pushU16(cent, 20);
    pushU16(cent, 20);
    pushU16(cent, 0);
    pushU16(cent, 0);
    pushU16(cent, 0);
    pushU16(cent, 0);
    pushU32(cent, f.crc32 >>> 0);
    pushU32(cent, f.data.length >>> 0);
    pushU32(cent, f.data.length >>> 0);
    pushU16(cent, f.nameBytes.length);
    pushU16(cent, 0);
    pushU16(cent, 0);
    pushU16(cent, 0);
    pushU16(cent, 0);
    pushU32(cent, 0);
    pushU32(cent, offset >>> 0);
    cent.push(...f.nameBytes);
    central.push(new Uint8Array(cent));

    offset += local.length + f.data.length;
  }
  let centralSize = 0;
  for (const c of central) centralSize += c.length;
  const end = [];
  pushU32(end, 0x06054b50);
  pushU16(end, 0);
  pushU16(end, 0);
  pushU16(end, files.length);
  pushU16(end, files.length);
  pushU32(end, centralSize >>> 0);
  pushU32(end, offset >>> 0);
  pushU16(end, 0);
  return new Blob([...chunks, ...central, new Uint8Array(end)], { type: "application/zip" });
}

function syncBatchExportSettingsFromUI() {
  if (!state.anim.batchExport || typeof state.anim.batchExport !== "object") {
    state.anim.batchExport = { format: "webm", fps: 15, prefix: "batch", retries: 1, delayMs: 120, zipPng: true };
  }
  const be = state.anim.batchExport;
  be.format = els.batchExportFormat && (els.batchExportFormat.value === "gif" || els.batchExportFormat.value === "pngseq") ? els.batchExportFormat.value : "webm";
  be.fps = Math.max(1, Math.min(60, Math.round(Number(els.batchExportFps && els.batchExportFps.value) || 15)));
  be.prefix = String((els.batchExportPrefix && els.batchExportPrefix.value) || "batch");
  be.retries = Math.max(0, Math.min(5, Math.round(Number(els.batchExportRetries && els.batchExportRetries.value) || 1)));
  be.delayMs = Math.max(0, Math.min(5000, Math.round(Number(els.batchExportDelayMs && els.batchExportDelayMs.value) || 120)));
  be.zipPng = els.batchExportZipPng ? !!els.batchExportZipPng.checked : true;
  if (els.batchExportFps) els.batchExportFps.value = String(be.fps);
  if (els.batchExportRetries) els.batchExportRetries.value = String(be.retries);
  if (els.batchExportDelayMs) els.batchExportDelayMs.value = String(be.delayMs);
}

async function exportPreviewWebM() {
  if (!window.MediaRecorder || !els.glCanvas || !els.glCanvas.captureStream) {
    setStatus("Preview WebM failed: MediaRecorder/captureStream not supported.");
    return;
  }
  const curr = getCurrentAnimation();
  if (!curr) {
    setStatus("Preview WebM failed: no animation selected.");
    return;
  }
  const fps = Math.max(1, Number(state.anim.fps) || 30);
  const dur = Math.max(0.1, Number(curr.duration) || 1);
  const asked = window.prompt("Preview export filename (without extension)", `${curr.name || "preview"}_preview`);
  const base = sanitizeExportName(asked, "preview");

  const prevPlaying = state.anim.playing;
  const prevTime = state.anim.time;
  const stream = els.glCanvas.captureStream(fps);
  const chunks = [];
  const rec = new MediaRecorder(stream, { mimeType: "video/webm;codecs=vp9" });
  rec.ondataavailable = (ev) => {
    if (ev.data && ev.data.size > 0) chunks.push(ev.data);
  };

  rec.start();
  setAnimTime(0);
  state.anim.playing = true;
  state.anim.lastTs = 0;
  await sleepMs(Math.ceil(dur * 1000) + 120);
  state.anim.playing = false;
  rec.stop();
  await new Promise((resolve) => (rec.onstop = resolve));

  const blob = new Blob(chunks, { type: "video/webm" });
  downloadBlobFile(blob, `${base}.webm`);
  state.anim.playing = prevPlaying;
  setAnimTime(prevTime);
  if (state.mesh) samplePoseAtTime(state.mesh, state.anim.time);
  setStatus(`Preview exported: ${base}.webm`);
}

async function exportPreviewGif() {
  const curr = getCurrentAnimation();
  if (!curr || !els.glCanvas) {
    setStatus("Preview GIF failed: no animation selected.");
    return;
  }
  const fps = Math.max(8, Math.min(20, Number(state.anim.fps) || 15));
  const dur = Math.max(0.1, Number(curr.duration) || 1);
  const frameCount = Math.max(2, Math.round(dur * fps));
  const asked = window.prompt("Preview export filename (without extension)", `${curr.name || "preview"}_preview`);
  const base = sanitizeExportName(asked, "preview");

  const prevPlaying = state.anim.playing;
  const prevTime = state.anim.time;
  state.anim.playing = false;
  state.anim.lastTs = 0;

  const w = Math.max(1, Number(els.glCanvas.width) || 1);
  const h = Math.max(1, Number(els.glCanvas.height) || 1);
  const capture = makeCanvas(w, h);
  const cctx = capture.getContext("2d");
  if (!cctx) throw new Error("Preview GIF failed: offscreen 2D context unavailable.");

  const frames = [];
  for (let i = 0; i < frameCount; i += 1) {
    const t = (i / Math.max(1, frameCount - 1)) * dur;
    setAnimTime(t);
    if (state.mesh) samplePoseAtTime(state.mesh, t);
    await waitForFrame();
    cctx.clearRect(0, 0, w, h);
    cctx.drawImage(els.glCanvas, 0, 0, w, h);
    frames.push(cctx.getImageData(0, 0, w, h));
  }

  const gif = encodeGifFrames(frames, w, h, fps);
  downloadBlobFile(gif, `${base}.gif`);
  state.anim.playing = prevPlaying;
  setAnimTime(prevTime);
  if (state.mesh) samplePoseAtTime(state.mesh, state.anim.time);
  setStatus(`Preview exported: ${base}.gif`);
}

function getBatchSelectedAnimations() {
  const out = [];
  if (els.batchExportAnimList) {
    const ids = new Set(Array.from(els.batchExportAnimList.selectedOptions || []).map((o) => String(o.value)));
    for (const a of state.anim.animations || []) {
      if (ids.has(String(a.id))) out.push(a);
    }
  }
  if (out.length === 0) {
    const curr = getCurrentAnimation();
    if (curr) out.push(curr);
  }
  return out;
}

async function runBatchExportForAnimation(anim, index, total, format, fps, prefix, options = null) {
  if (!anim) return;
  const opts = options && typeof options === "object" ? options : {};
  const retries = Math.max(0, Math.min(5, Math.round(Number(opts.retries) || 0)));
  const delayMs = Math.max(0, Math.min(5000, Math.round(Number(opts.delayMs) || 0)));
  const zipPng = !!opts.zipPng;
  const prevAnimId = state.anim.currentAnimId;
  const prevPlaying = state.anim.playing;
  const prevTime = state.anim.time;
  const prevLastTs = state.anim.lastTs;
  const safePrefix = sanitizeExportName(prefix, "batch");
  const safeAnim = sanitizeExportName(anim.name || "anim", `anim_${index + 1}`);
  const fileBase = `${safePrefix}_${String(index + 1).padStart(2, "0")}_${safeAnim}`;
  const dur = Math.max(0.1, Number(anim.duration) || 0.1);

  state.anim.playing = false;
  state.anim.lastTs = 0;
  state.anim.currentAnimId = anim.id;
  refreshAnimationUI();
  setAnimTime(0);
  if (state.mesh) samplePoseAtTime(state.mesh, 0);
  await waitForFrame();

  try {
    const exportOnce = async () => {
      if (format === "webm") {
        if (!window.MediaRecorder || !els.glCanvas || !els.glCanvas.captureStream) {
          throw new Error("MediaRecorder/captureStream not supported.");
        }
        const stream = els.glCanvas.captureStream(fps);
        const chunks = [];
        const rec = new MediaRecorder(stream, { mimeType: "video/webm;codecs=vp9" });
        rec.ondataavailable = (ev) => {
          if (ev.data && ev.data.size > 0) chunks.push(ev.data);
        };
        rec.start();
        state.anim.playing = true;
        state.anim.lastTs = 0;
        await sleepMs(Math.ceil(dur * 1000) + 120);
        state.anim.playing = false;
        rec.stop();
        await new Promise((resolve) => (rec.onstop = resolve));
        downloadBlobFile(new Blob(chunks, { type: "video/webm" }), `${fileBase}.webm`);
      } else if (format === "gif") {
        if (!els.glCanvas) throw new Error("canvas unavailable.");
        const frameCount = Math.max(2, Math.round(dur * fps));
        const w = Math.max(1, Number(els.glCanvas.width) || 1);
        const h = Math.max(1, Number(els.glCanvas.height) || 1);
        const capture = makeCanvas(w, h);
        const cctx = capture.getContext("2d");
        if (!cctx) throw new Error("offscreen 2D context unavailable.");
        const frames = [];
        for (let i = 0; i < frameCount; i += 1) {
          const t = (i / Math.max(1, frameCount - 1)) * dur;
          setAnimTime(t);
          if (state.mesh) samplePoseAtTime(state.mesh, t);
          await waitForFrame();
          cctx.clearRect(0, 0, w, h);
          cctx.drawImage(els.glCanvas, 0, 0, w, h);
          frames.push(cctx.getImageData(0, 0, w, h));
        }
        const gif = encodeGifFrames(frames, w, h, fps);
        downloadBlobFile(gif, `${fileBase}.gif`);
      } else {
        if (!els.glCanvas) throw new Error("canvas unavailable.");
        const frameCount = Math.max(2, Math.round(dur * fps));
        const w = Math.max(1, Number(els.glCanvas.width) || 1);
        const h = Math.max(1, Number(els.glCanvas.height) || 1);
        const capture = makeCanvas(w, h);
        const cctx = capture.getContext("2d");
        if (!cctx) throw new Error("offscreen 2D context unavailable.");
        const pngItems = [];
        for (let i = 0; i < frameCount; i += 1) {
          const t = (i / Math.max(1, frameCount - 1)) * dur;
          setAnimTime(t);
          if (state.mesh) samplePoseAtTime(state.mesh, t);
          await waitForFrame();
          cctx.clearRect(0, 0, w, h);
          cctx.drawImage(els.glCanvas, 0, 0, w, h);
          const blob = await canvasToBlob(capture, "image/png");
          const name = `${fileBase}_${String(i + 1).padStart(4, "0")}.png`;
          if (zipPng) pngItems.push({ name, blob });
          else downloadBlobFile(blob, name);
          await sleepMs(0);
        }
        if (zipPng) {
          const zip = await buildZipBlobFromNamedBlobs(pngItems);
          downloadBlobFile(zip, `${fileBase}.zip`);
        }
      }
    };

    let attempt = 0;
    while (true) {
      try {
        await exportOnce();
        break;
      } catch (err) {
        if (attempt >= retries) throw err;
        attempt += 1;
        setStatus(`Batch ${index + 1}/${total} retry ${attempt}/${retries}...`);
        state.anim.playing = false;
        await sleepMs(200);
      }
    }
    setStatus(`Batch ${index + 1}/${total}: ${anim.name}`);
    if (delayMs > 0) await sleepMs(delayMs);
  } finally {
    state.anim.currentAnimId = prevAnimId;
    state.anim.playing = prevPlaying;
    state.anim.lastTs = prevLastTs;
    refreshAnimationUI();
    setAnimTime(prevTime);
    if (state.mesh) samplePoseAtTime(state.mesh, state.anim.time);
  }
}

async function runBatchExport() {
  syncBatchExportSettingsFromUI();
  const list = getBatchSelectedAnimations();
  if (list.length <= 0) {
    setStatus("Batch export: no animation selected.");
    return;
  }
  const be = state.anim.batchExport || {};
  const format = be.format === "gif" || be.format === "pngseq" ? be.format : "webm";
  const fps = Math.max(1, Math.min(60, Math.round(Number(be.fps) || state.anim.fps || 15)));
  const prefix = String(be.prefix || "batch");
  const retries = Math.max(0, Math.min(5, Math.round(Number(be.retries) || 0)));
  const delayMs = Math.max(0, Math.min(5000, Math.round(Number(be.delayMs) || 0)));
  const zipPng = be.zipPng !== false;
  if (els.batchExportRunBtn) els.batchExportRunBtn.disabled = true;
  let done = 0;
  let failed = 0;
  try {
    for (let i = 0; i < list.length; i += 1) {
      try {
        await runBatchExportForAnimation(list[i], i, list.length, format, fps, prefix, {
          retries,
          delayMs,
          zipPng,
        });
        done += 1;
      } catch (err) {
        failed += 1;
        setStatus(`Batch ${i + 1}/${list.length} failed: ${err && err.message ? err.message : "unknown error"}`);
      }
    }
    setStatus(`Batch export done: ${done} ok, ${failed} failed, format ${format}.`);
  } catch (err) {
    setStatus(`Batch export failed: ${err && err.message ? err.message : "unknown error"}`);
  } finally {
    if (els.batchExportRunBtn) els.batchExportRunBtn.disabled = false;
  }
}

if (els.animMixDur) {
  els.animMixDur.addEventListener("input", () => {
    state.anim.mix.duration = Math.max(0.01, Number(els.animMixDur.value) || 0.2);
    els.animMixDur.value = String(state.anim.mix.duration);
    refreshAnimationMixUI();
  });
}
if (els.animMixBtn) {
  els.animMixBtn.addEventListener("click", () => {
    const toId = els.animMixTo ? els.animMixTo.value : "";
    const dur = els.animMixDur ? Number(els.animMixDur.value) : 0.2;
    if (!beginAnimationMix(toId, dur)) {
      setStatus("Mix failed: choose another animation as target.");
    }
  });
}

function applyOnionSkinInputs(commitUndo = false) {
  const onion = ensureOnionSkinSettings();
  if (els.onionEnabled) onion.enabled = !!els.onionEnabled.checked;
  if (els.onionPrev) onion.prevFrames = math.clamp(Math.round(Number(els.onionPrev.value) || 0), 0, 12);
  if (els.onionNext) onion.nextFrames = math.clamp(Math.round(Number(els.onionNext.value) || 0), 0, 12);
  if (els.onionAlpha) onion.alpha = math.clamp(Number(els.onionAlpha.value) || 0.22, 0.01, 1);
  if (els.onionPrev) els.onionPrev.value = String(onion.prevFrames);
  if (els.onionNext) els.onionNext.value = String(onion.nextFrames);
  if (els.onionAlpha) els.onionAlpha.value = String(onion.alpha);
  if (state.mesh) samplePoseAtTime(state.mesh, state.anim.time);
  if (commitUndo) pushUndoCheckpoint(true);
}

if (els.onionEnabled) {
  els.onionEnabled.addEventListener("change", () => {
    applyOnionSkinInputs(true);
  });
}
if (els.onionPrev) {
  els.onionPrev.addEventListener("input", () => {
    applyOnionSkinInputs(false);
  });
  els.onionPrev.addEventListener("change", () => {
    applyOnionSkinInputs(true);
  });
}
if (els.onionNext) {
  els.onionNext.addEventListener("input", () => {
    applyOnionSkinInputs(false);
  });
  els.onionNext.addEventListener("change", () => {
    applyOnionSkinInputs(true);
  });
}
if (els.onionAlpha) {
  els.onionAlpha.addEventListener("input", () => {
    applyOnionSkinInputs(false);
  });
  els.onionAlpha.addEventListener("change", () => {
    applyOnionSkinInputs(true);
  });
}

if (els.layerTrackSelect) {
  els.layerTrackSelect.addEventListener("change", () => {
    state.anim.selectedLayerTrackId = String(els.layerTrackSelect.value || "");
    if (state.anim.selectedLayerTrackId) focusTimelineTrack(getLayerTrackId(state.anim.selectedLayerTrackId, "alpha"), true);
    refreshAnimationLayerUI();
    refreshTrackSelect();
    if (state.mesh) {
      samplePoseAtTime(state.mesh, state.anim.time);
      if (state.boneMode === "pose") updateBoneUI();
    }
  });
}
if (els.layerTrackAddBtn) {
  els.layerTrackAddBtn.addEventListener("click", () => {
    const layer = addAnimationLayerTrack();
    focusTimelineTrack(getLayerTrackId(layer.id, "alpha"), true);
    refreshTrackSelect();
    setStatus(`Layer added: ${layer.name}`);
    if (state.mesh) samplePoseAtTime(state.mesh, state.anim.time);
  });
}
if (els.layerTrackDeleteBtn) {
  els.layerTrackDeleteBtn.addEventListener("click", () => {
    if (!removeSelectedAnimationLayerTrack()) return;
    setStatus("Layer removed.");
    if (state.mesh) samplePoseAtTime(state.mesh, state.anim.time);
  });
}
if (els.layerTrackEnabled) {
  els.layerTrackEnabled.addEventListener("change", () => {
    const layer = getSelectedLayerTrack();
    if (!layer) return;
    layer.enabled = !!els.layerTrackEnabled.checked;
    markDirtyByLayerProp(layer.id, "enabled");
    if (state.mesh) samplePoseAtTime(state.mesh, state.anim.time, { applyLayerStateTracks: false });
  });
}
if (els.layerTrackLoop) {
  els.layerTrackLoop.addEventListener("change", () => {
    const layer = getSelectedLayerTrack();
    if (!layer) return;
    layer.loop = !!els.layerTrackLoop.checked;
    if (state.mesh) samplePoseAtTime(state.mesh, state.anim.time);
  });
}
if (els.layerTrackSpeed) {
  els.layerTrackSpeed.addEventListener("input", () => {
    const layer = getSelectedLayerTrack();
    if (!layer) return;
    const v = Number(els.layerTrackSpeed.value);
    layer.speed = Number.isFinite(v) ? math.clamp(v, -10, 10) : 1;
    if (Math.abs(layer.speed) < 1e-4) layer.speed = 0;
    els.layerTrackSpeed.value = String(layer.speed);
    markDirtyByLayerProp(layer.id, "speed");
    if (state.mesh) samplePoseAtTime(state.mesh, state.anim.time, { applyLayerStateTracks: false });
  });
}
if (els.layerTrackOffset) {
  els.layerTrackOffset.addEventListener("input", () => {
    const layer = getSelectedLayerTrack();
    if (!layer) return;
    const v = Number(els.layerTrackOffset.value);
    layer.offset = Number.isFinite(v) ? math.clamp(v, -9999, 9999) : 0;
    els.layerTrackOffset.value = String(layer.offset);
    markDirtyByLayerProp(layer.id, "offset");
    if (state.mesh) samplePoseAtTime(state.mesh, state.anim.time, { applyLayerStateTracks: false });
  });
}
if (els.layerTrackAnim) {
  els.layerTrackAnim.addEventListener("change", () => {
    const layer = getSelectedLayerTrack();
    if (!layer) return;
    layer.animId = String(els.layerTrackAnim.value || "");
    if (state.mesh) samplePoseAtTime(state.mesh, state.anim.time);
  });
}
if (els.layerTrackAlpha) {
  els.layerTrackAlpha.addEventListener("input", () => {
    const layer = getSelectedLayerTrack();
    if (!layer) return;
    layer.alpha = math.clamp(Number(els.layerTrackAlpha.value) || 0, 0, 1);
    els.layerTrackAlpha.value = String(layer.alpha);
    markDirtyByLayerProp(layer.id, "alpha");
    if (state.mesh) samplePoseAtTime(state.mesh, state.anim.time, { applyLayerStateTracks: false });
  });
}
if (els.layerTrackMode) {
  els.layerTrackMode.addEventListener("change", () => {
    const layer = getSelectedLayerTrack();
    if (!layer) return;
    layer.mode = els.layerTrackMode.value === "add" ? "add" : "replace";
    if (state.mesh) samplePoseAtTime(state.mesh, state.anim.time);
  });
}
if (els.layerTrackMaskMode) {
  els.layerTrackMaskMode.addEventListener("change", () => {
    const layer = getSelectedLayerTrack();
    if (!layer) return;
    layer.maskMode = els.layerTrackMaskMode.value === "include" ? "include" : els.layerTrackMaskMode.value === "exclude" ? "exclude" : "all";
    refreshAnimationLayerUI();
    if (state.mesh) samplePoseAtTime(state.mesh, state.anim.time);
  });
}
if (els.layerTrackBoneAddBtn) {
  els.layerTrackBoneAddBtn.addEventListener("click", () => {
    const layer = getSelectedLayerTrack();
    if (!layer) return;
    const bi = Number(els.layerTrackBone ? els.layerTrackBone.value : -1);
    if (!Number.isFinite(bi) || bi < 0) return;
    if (!Array.isArray(layer.maskBones)) layer.maskBones = [];
    if (!layer.maskBones.includes(bi)) layer.maskBones.push(bi);
    refreshAnimationLayerUI();
    if (state.mesh) samplePoseAtTime(state.mesh, state.anim.time);
  });
}
if (els.layerTrackBoneClearBtn) {
  els.layerTrackBoneClearBtn.addEventListener("click", () => {
    const layer = getSelectedLayerTrack();
    if (!layer) return;
    layer.maskBones = [];
    refreshAnimationLayerUI();
    if (state.mesh) samplePoseAtTime(state.mesh, state.anim.time);
  });
}
if (els.curveToggleBtn) {
  els.curveToggleBtn.addEventListener("click", () => {
    state.anim.curveOpen = !state.anim.curveOpen;
    renderCurveEditor();
  });
}

if (els.curveEditor) {
  const cv = els.curveEditor;
  const fromScreen = (ev) => {
    const r = cv.getBoundingClientRect();
    const sx = (ev.clientX - r.left) * (cv.width / Math.max(1, r.width));
    const sy = (ev.clientY - r.top) * (cv.height / Math.max(1, r.height));
    const pad = 16;
    const x = math.clamp((sx - pad) / Math.max(1, cv.width - pad * 2), 0, 1);
    const y = math.clamp(1 - (sy - pad) / Math.max(1, cv.height - pad * 2), 0, 1);
    return { x, y };
  };
  const hitHandle = (ev) => {
    const t = getCurveEditTarget();
    if (!t || (t.key.interp || "linear") !== "bezier") return null;
    ensureBezierCurveOnKey(t.key);
    const r = cv.getBoundingClientRect();
    const sx = (ev.clientX - r.left) * (cv.width / Math.max(1, r.width));
    const sy = (ev.clientY - r.top) * (cv.height / Math.max(1, r.height));
    const pad = 16;
    const gw = cv.width - pad * 2;
    const gh = cv.height - pad * 2;
    const p1 = { x: pad + t.key.curve[0] * gw, y: pad + (1 - t.key.curve[1]) * gh };
    const p2 = { x: pad + t.key.curve[2] * gw, y: pad + (1 - t.key.curve[3]) * gh };
    const d1 = (sx - p1.x) * (sx - p1.x) + (sy - p1.y) * (sy - p1.y);
    const d2 = (sx - p2.x) * (sx - p2.x) + (sy - p2.y) * (sy - p2.y);
    if (d1 <= 64) return "c1";
    if (d2 <= 64) return "c2";
    return null;
  };
  cv.addEventListener("pointerdown", (ev) => {
    const t = getCurveEditTarget();
    if (!t) return;
    if ((t.key.interp || "linear") !== "bezier") {
      t.key.interp = "bezier";
      ensureBezierCurveOnKey(t.key);
      if (els.keyInterp) els.keyInterp.value = "bezier";
      renderTimelineTracks();
    }
    const handle = hitHandle(ev) || "c2";
    state.anim.curveDrag = { handle, trackId: t.trackId, keyId: t.key.id, pointerId: ev.pointerId };
    try {
      cv.setPointerCapture(ev.pointerId);
    } catch {
      // ignore
    }
    ev.preventDefault();
  });
  cv.addEventListener("pointermove", (ev) => {
    const drag = state.anim.curveDrag;
    if (!drag) return;
    const t = getCurveEditTarget();
    if (!t || t.trackId !== drag.trackId || t.key.id !== drag.keyId) return;
    ensureBezierCurveOnKey(t.key);
    const p = fromScreen(ev);
    if (drag.handle === "c1") {
      t.key.curve[0] = p.x;
      t.key.curve[1] = p.y;
    } else {
      t.key.curve[2] = p.x;
      t.key.curve[3] = p.y;
    }
    t.key.curve[0] = math.clamp(t.key.curve[0], 0, 1);
    t.key.curve[1] = math.clamp(t.key.curve[1], 0, 1);
    t.key.curve[2] = math.clamp(t.key.curve[2], 0, 1);
    t.key.curve[3] = math.clamp(t.key.curve[3], 0, 1);
    if (state.mesh) {
      samplePoseAtTime(state.mesh, state.anim.time);
      if (state.boneMode === "pose") updateBoneUI();
    }
    renderCurveEditor();
    ev.preventDefault();
  });
  const stopCurveDrag = (ev) => {
    if (!state.anim.curveDrag) return;
    try {
      cv.releasePointerCapture(ev.pointerId);
    } catch {
      // ignore
    }
    state.anim.curveDrag = null;
    renderTimelineTracks();
  };
  cv.addEventListener("pointerup", stopCurveDrag);
  cv.addEventListener("pointercancel", stopCurveDrag);
}
function ensureTimelineMarqueeEl() {
  if (state.anim.timelineMarqueeEl && state.anim.timelineMarqueeEl.isConnected) return state.anim.timelineMarqueeEl;
  const el = document.createElement("div");
  el.className = "timeline-marquee";
  state.anim.timelineMarqueeEl = el;
  els.timelineTracks.appendChild(el);
  return el;
}

function clearTimelineMarqueeEl() {
  const el = state.anim.timelineMarqueeEl;
  if (el && el.parentNode) el.parentNode.removeChild(el);
  state.anim.timelineMarqueeEl = null;
}

function rectsOverlap(a, b) {
  return a.left <= b.right && a.right >= b.left && a.top <= b.bottom && a.bottom >= b.top;
}

els.timelineTracks.addEventListener("pointerdown", (ev) => {
  const anim = getCurrentAnimation();
  if (!anim) return;
  const timelineDuration = getTimelineDisplayDuration(anim);
  const groupBtn = ev.target.closest("[data-group-action][data-group-key]");
  if (groupBtn) {
    ev.preventDefault();
    const action = String(groupBtn.dataset.groupAction || "");
    const groupKey = String(groupBtn.dataset.groupKey || "");
    if (!groupKey) return;
    if (action === "mute") {
      const next = !(state.anim.groupMute && state.anim.groupMute[groupKey]);
      state.anim.groupMute[groupKey] = next;
      setStatus(next ? `Muted ${groupKey}` : `Unmuted ${groupKey}`);
    } else if (action === "solo") {
      const next = !(state.anim.groupSolo && state.anim.groupSolo[groupKey]);
      state.anim.groupSolo[groupKey] = next;
      setStatus(next ? `Solo ${groupKey}` : `Unsolo ${groupKey}`);
    }
    renderTimelineTracks();
    return;
  }
  const groupLabel = ev.target.closest(".track-label[data-group-key]");
  if (groupLabel) {
    const gk = String(groupLabel.dataset.groupKey || "");
    const num = Number(gk);
    const isNumKey = Number.isFinite(num) && String(num) === gk;
    const key = isNumKey ? num : gk;
    state.anim.trackExpanded[key] = !state.anim.trackExpanded[key];
    renderTimelineTracks();
    return;
  }
  const keyEl = ev.target.closest(".track-key");
  const playheadEl = ev.target.closest(".timeline-playhead.handle");
  const laneEl = ev.target.closest(".track-lane");
  if (!laneEl) return;
  ev.preventDefault();
  const trackId = laneEl.dataset.trackId;
  if (!trackId) return;

  const rect = laneEl.getBoundingClientRect();
  const x = ev.clientX - rect.left;
  const t = snapTimeIfNeeded(timeForTimelineX(x, rect.width, timelineDuration));

  if (playheadEl || trackId === "__ruler__") {
    clearTimelineMarqueeEl();
    state.anim.timelineDrag = {
      mode: "playhead",
      laneTrackId: trackId,
      pointerId: ev.pointerId,
    };
    els.timelineTracks.setPointerCapture(ev.pointerId);
    setAnimTime(t, timelineDuration);
    if (state.mesh) {
      samplePoseAtTime(state.mesh, state.anim.time);
      if (state.boneMode === "pose") updateBoneUI();
    }
    renderTimelineTracks();
    return;
  }

  if (keyEl) {
    clearTimelineMarqueeEl();
    if (trackId === "__all__") {
      const allTime = Number(keyEl.dataset.allTime);
      if (!Number.isFinite(allTime)) return;
      const picked = collectKeysAtTime(anim, allTime);
      if (picked.length <= 0) return;
      state.anim.selectedKeys = picked;
      state.anim.selectedKey = { ...picked[0] };
      state.anim.timelineDrag = {
        mode: "key_set",
        laneTrackId: trackId,
        pointerId: ev.pointerId,
        anchorTime: allTime,
        seed: getDragSeedFromSelection(anim, picked),
      };
      els.timelineTracks.setPointerCapture(ev.pointerId);
      setAnimTime(allTime, timelineDuration);
      renderTimelineTracks();
      return;
    }
    if (!parseTrackId(trackId)) return;
    state.anim.selectedTrack = trackId;
    els.trackSelect.value = trackId;
    syncLayerPanelFromSelectedTrack();
    const keyId = keyEl.dataset.keyId;
    const keys = getTrackKeys(anim, trackId);
    const k = keys.find((kk) => kk.id === keyId);
    if (!k) return;
    const wantToggle = ev.ctrlKey || ev.metaKey;
    if (wantToggle) {
      toggleTimelineSelection(trackId, k.id);
    } else if (!keySelectionHas(trackId, k.id) || !(state.anim.selectedKeys && state.anim.selectedKeys.length > 1)) {
      setSingleTimelineSelection(trackId, k.id);
    } else {
      state.anim.selectedKey = { trackId, keyId: k.id };
    }
    const dragSelection =
      !wantToggle && keySelectionHas(trackId, k.id) && state.anim.selectedKeys && state.anim.selectedKeys.length > 1
        ? state.anim.selectedKeys
        : [{ trackId, keyId: k.id }];
    els.keyInterp.value = k.interp || "linear";
    state.anim.timelineDrag = {
      mode: "key_set",
      laneTrackId: trackId,
      pointerId: ev.pointerId,
      anchorTime: Number(k.time) || 0,
      seed: getDragSeedFromSelection(anim, dragSelection),
    };
    els.timelineTracks.setPointerCapture(ev.pointerId);
    setAnimTime(k.time, timelineDuration);
    renderTimelineTracks();
    return;
  }

  if (trackId !== "__ruler__") {
    clearTimelineMarqueeEl();
    state.anim.timelineDrag = {
      mode: "marquee_pending",
      pointerId: ev.pointerId,
      startClientX: ev.clientX,
      startClientY: ev.clientY,
      trackId,
      time: t,
      append: !!(ev.ctrlKey || ev.metaKey),
      started: false,
    };
    els.timelineTracks.setPointerCapture(ev.pointerId);
    return;
  }

  if (parseTrackId(trackId)) {
    state.anim.selectedTrack = trackId;
    els.trackSelect.value = trackId;
    syncLayerPanelFromSelectedTrack();
  }
  setAnimTime(t, timelineDuration);
  clearTimelineKeySelection();
  if (state.mesh) {
    samplePoseAtTime(state.mesh, state.anim.time);
    if (state.boneMode === "pose") updateBoneUI();
  }
  renderTimelineTracks();
});

// Prevent native context menu / text drag behaviors from interrupting timeline editing.
els.timelineTracks.addEventListener("contextmenu", (ev) => {
  ev.preventDefault();
});
els.timelineTracks.addEventListener("dragstart", (ev) => {
  ev.preventDefault();
});
els.timelineTracks.addEventListener("pointermove", (ev) => {
  const drag = state.anim.timelineDrag;
  const anim = getCurrentAnimation();
  if (!drag || !anim) return;
  const timelineDuration = getTimelineDisplayDuration(anim);
  if (drag.mode === "marquee_pending" || drag.mode === "marquee") {
    ev.preventDefault();
  }
  if (drag.mode === "marquee_pending") {
    const dx = ev.clientX - drag.startClientX;
    const dy = ev.clientY - drag.startClientY;
    if (dx * dx + dy * dy < 9) return;
    const baseSelection = drag.append ? [...(state.anim.selectedKeys || [])] : [];
    if (!drag.append) clearTimelineKeySelection();
    drag.mode = "marquee";
    drag.baseSelection = baseSelection;
    const rootRect = els.timelineTracks.getBoundingClientRect();
    const scrollLeft = els.timelineTracks.scrollLeft;
    const scrollTop = els.timelineTracks.scrollTop;
    const x = drag.startClientX - rootRect.left + scrollLeft;
    const y = drag.startClientY - rootRect.top + scrollTop;
    const mq = ensureTimelineMarqueeEl();
    mq.style.left = `${x}px`;
    mq.style.top = `${y}px`;
    mq.style.width = "0px";
    mq.style.height = "0px";
    applyTimelineSelectionClasses();
  }
  if (drag.mode === "marquee") {
    const rootRect = els.timelineTracks.getBoundingClientRect();
    const scrollLeft = els.timelineTracks.scrollLeft;
    const scrollTop = els.timelineTracks.scrollTop;
    const x0 = drag.startClientX - rootRect.left + scrollLeft;
    const y0 = drag.startClientY - rootRect.top + scrollTop;
    const x1 = ev.clientX - rootRect.left + scrollLeft;
    const y1 = ev.clientY - rootRect.top + scrollTop;
    const left = Math.min(x0, x1);
    const top = Math.min(y0, y1);
    const width = Math.abs(x1 - x0);
    const height = Math.abs(y1 - y0);
    const mq = ensureTimelineMarqueeEl();
    mq.style.left = `${left}px`;
    mq.style.top = `${top}px`;
    mq.style.width = `${width}px`;
    mq.style.height = `${height}px`;
    const pickRect = {
      left: Math.min(drag.startClientX, ev.clientX),
      right: Math.max(drag.startClientX, ev.clientX),
      top: Math.min(drag.startClientY, ev.clientY),
      bottom: Math.max(drag.startClientY, ev.clientY),
    };
    const hit = [];
    for (const keyNode of els.timelineTracks.querySelectorAll(".track-key[data-track-id][data-key-id]")) {
      const r = keyNode.getBoundingClientRect();
      if (rectsOverlap(pickRect, r)) {
        hit.push({ trackId: keyNode.dataset.trackId, keyId: keyNode.dataset.keyId });
      }
    }
    const out = [];
    const seen = new Set();
    for (const s of [...(drag.baseSelection || []), ...hit]) {
      const k = `${s.trackId}::${s.keyId}`;
      if (seen.has(k)) continue;
      seen.add(k);
      out.push({ trackId: s.trackId, keyId: s.keyId });
    }
    state.anim.selectedKeys = out;
    state.anim.selectedKey = out.length > 0 ? { ...out[0] } : null;
    applyTimelineSelectionClasses();
    return;
  }
  const laneEl = els.timelineTracks.querySelector(`.track-lane[data-track-id='${drag.laneTrackId}']`);
  if (!laneEl) return;
  const rect = laneEl.getBoundingClientRect();
  const x = ev.clientX - rect.left;
  const t = snapTimeIfNeeded(timeForTimelineX(x, rect.width, timelineDuration));
  if (drag.mode === "playhead") {
    setAnimTime(t, timelineDuration);
    if (state.mesh) {
      samplePoseAtTime(state.mesh, state.anim.time);
      if (state.boneMode === "pose") updateBoneUI();
    }
    renderTimelineTracks();
    return;
  }
  const delta = t - (Number(drag.anchorTime) || 0);
  const touched = new Set();
  let anchorSelection = null;
  for (const it of drag.seed || []) {
    const keys = getTrackKeys(anim, it.trackId);
    const keyObj = keys.find((kk) => kk.id === it.keyId);
    if (!keyObj) continue;
    keyObj.time = sanitizeTimelineTime(snapTimeIfNeeded((Number(it.time) || 0) + delta), timelineDuration);
    touched.add(it.trackId);
    if (!anchorSelection) anchorSelection = { trackId: it.trackId, keyId: it.keyId, time: keyObj.time };
  }
  drag.touchedTracks = [...touched];
  if (anchorSelection) {
    state.anim.selectedKey = { trackId: anchorSelection.trackId, keyId: anchorSelection.keyId };
  }
  setAnimTime(t, timelineDuration);
  renderTimelineTracks();
});
function clearTimelineDrag(ev) {
  const drag = state.anim.timelineDrag;
  if (!drag) return;
  try {
    els.timelineTracks.releasePointerCapture(ev.pointerId);
  } catch {
    // ignore
  }
  const anim = getCurrentAnimation();
  if (drag.mode === "marquee_pending") {
    if (anim && parseTrackId(drag.trackId)) {
      state.anim.selectedTrack = drag.trackId;
      if (els.trackSelect) els.trackSelect.value = drag.trackId;
    }
    if (!drag.append) clearTimelineKeySelection();
    setAnimTime(Number(drag.time) || 0);
    if (state.mesh) {
      samplePoseAtTime(state.mesh, state.anim.time);
      if (state.boneMode === "pose") updateBoneUI();
    }
    state.anim.timelineDrag = null;
    renderTimelineTracks();
    return;
  }
  if (anim && drag.mode === "key_set") {
    const touched = Array.isArray(drag.touchedTracks) ? drag.touchedTracks : [];
    for (const trackId of touched) {
      if (!trackId) continue;
      normalizeTrackKeys(anim, trackId);
    }
    normalizeSelectedKeys(anim);
  }
  if (drag.mode === "marquee" || drag.mode === "marquee_pending") {
    clearTimelineMarqueeEl();
  }
  state.anim.timelineDrag = null;
  renderTimelineTracks();
}
els.timelineTracks.addEventListener("pointerup", clearTimelineDrag);
els.timelineTracks.addEventListener("pointercancel", clearTimelineDrag);
els.timelineResizer.addEventListener("pointerdown", (ev) => {
  state.anim.resizing = {
    pointerId: ev.pointerId,
    startY: ev.clientY,
    startH: parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--timeline-h")) || 280,
  };
  els.timelineResizer.setPointerCapture(ev.pointerId);
});
els.timelineResizer.addEventListener("pointermove", (ev) => {
  const r = state.anim.resizing;
  if (!r) return;
  const delta = r.startY - ev.clientY;
  const next = math.clamp(r.startH + delta, 140, Math.max(180, window.innerHeight * 0.6));
  document.documentElement.style.setProperty("--timeline-h", `${Math.round(next)}px`);
});
function clearResize(ev) {
  if (!state.anim.resizing) return;
  try {
    els.timelineResizer.releasePointerCapture(ev.pointerId);
  } catch {
    // ignore
  }
  state.anim.resizing = null;
}
els.timelineResizer.addEventListener("pointerup", clearResize);
els.timelineResizer.addEventListener("pointercancel", clearResize);
if (els.playBtn) {
  els.playBtn.addEventListener("click", () => {
    state.anim.playing = !state.anim.playing;
    state.anim.lastTs = 0;
    updatePlaybackButtons();
  });
}
if (els.pauseBtn) {
  els.pauseBtn.addEventListener("click", () => {
    state.anim.playing = false;
    updatePlaybackButtons();
  });
}
els.stopBtn.addEventListener("click", () => {
  state.anim.playing = false;
  state.anim.lastTs = 0;
  updatePlaybackButtons();
  setAnimTime(0);
  if (state.mesh) {
    samplePoseAtTime(state.mesh, 0);
    if (state.boneMode === "pose") updateBoneUI();
  }
});

function isEditableHotkeyTarget(target) {
  if (!target || !(target instanceof Element)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName ? target.tagName.toLowerCase() : "";
  if (tag === "textarea" || tag === "select") return true;
  if (tag !== "input") return false;
  const input = target;
  if (input.disabled) return true;
  const t = String(input.type || "text").toLowerCase();
  const nonTextTypes = new Set(["button", "checkbox", "radio", "range", "color", "file", "image", "submit", "reset"]);
  if (nonTextTypes.has(t)) return false;
  return !input.readOnly;
}

window.addEventListener("keydown", async (ev) => {
  if (ev.isComposing) return;
  if (isEditableHotkeyTarget(ev.target)) return;
  const keyLower = String(ev.key || "").toLowerCase();
  if (keyLower === "escape" && state.boneTreeMenuOpen) {
    closeBoneTreeContextMenu();
    ev.preventDefault();
    return;
  }
  const modKey = (ev.ctrlKey || ev.metaKey) && !ev.altKey;
  if (modKey && keyLower === "z") {
    ev.preventDefault();
    if (ev.shiftKey) {
      if (state.history.redo.length > 0) await redoAction();
    } else if (state.history.undo.length > 1) {
      await undoAction();
    }
    return;
  }
  if (modKey && keyLower === "y") {
    ev.preventDefault();
    if (state.history.redo.length > 0) await redoAction();
    return;
  }
  if (ev.key === "+" || ev.key === "=") {
    const sx = Math.max(1, Number(els.overlay.width) || 1) * 0.5;
    const sy = Math.max(1, Number(els.overlay.height) || 1) * 0.5;
    zoomViewBy(1.12, sx, sy);
    ev.preventDefault();
    return;
  }
  if (ev.key === "-" || ev.key === "_") {
    const sx = Math.max(1, Number(els.overlay.width) || 1) * 0.5;
    const sy = Math.max(1, Number(els.overlay.height) || 1) * 0.5;
    zoomViewBy(1 / 1.12, sx, sy);
    ev.preventDefault();
    return;
  }
  if (ev.key === "0") {
    resetViewToFit();
    ev.preventDefault();
    return;
  }
  const hotkey = String(ev.key || "").toLowerCase();
  if (state.editMode === "vertex") {
    if (hotkey === "h" && !ev.ctrlKey && !ev.metaKey && !ev.altKey) {
      state.vertexDeform.mirror = !state.vertexDeform.mirror;
      refreshVertexDeformUI();
      setStatus(`Vertex mirror edit ${state.vertexDeform.mirror ? "ON" : "OFF"}.`);
      ev.preventDefault();
      return;
    }
    if (hotkey === "j" && !ev.ctrlKey && !ev.metaKey && !ev.altKey) {
      state.vertexDeform.heatmap = !state.vertexDeform.heatmap;
      refreshVertexDeformUI();
      setStatus(`Vertex heatmap preview ${state.vertexDeform.heatmap ? "ON" : "OFF"}.`);
      ev.preventDefault();
      return;
    }
    if (hotkey === "a" && !ev.ctrlKey && !ev.metaKey) {
      toggleSelectAllVertices();
      ev.preventDefault();
      return;
    }
    if (hotkey === "escape") {
      clearActiveVertexSelection();
      setStatus("Vertex selection cleared.");
      ev.preventDefault();
      return;
    }
    if (hotkey === "p" && !ev.ctrlKey && !ev.metaKey && !ev.altKey) {
      const ctx = getActiveVertexContext();
      const selected = getActiveVertexSelection(ctx.vCount);
      if (selected.length > 0) {
        const pinned = getActivePinnedVertexSet(ctx.vCount);
        const hasUnpinned = selected.some((i) => !pinned.has(i));
        if (hasUnpinned) {
          for (const i of selected) pinned.add(i);
          setStatus(`Pinned ${selected.length} vertex(es).`);
        } else {
          for (const i of selected) pinned.delete(i);
          setStatus(`Unpinned ${selected.length} vertex(es).`);
        }
        setActivePinnedVertices([...pinned], ctx.vCount);
      } else {
        setStatus("No selected vertices to pin/unpin.");
      }
      ev.preventDefault();
      return;
    }
    if (hotkey === "u" && !ev.ctrlKey && !ev.metaKey && !ev.altKey) {
      const ctx = getActiveVertexContext();
      const selected = getActiveVertexSelection(ctx.vCount);
      if (selected.length > 0) {
        const pinned = getActivePinnedVertexSet(ctx.vCount);
        for (const i of selected) pinned.delete(i);
        setActivePinnedVertices([...pinned], ctx.vCount);
        setStatus(`Unpinned ${selected.length} selected vertex(es).`);
      } else {
        setActivePinnedVertices([], ctx.vCount);
        setStatus("Cleared all pinned vertices.");
      }
      ev.preventDefault();
      return;
    }
    if (hotkey === "m" && !ev.ctrlKey && !ev.metaKey && !ev.altKey) {
      const moved = relaxSelectedVertices(ev.shiftKey ? 0.75 : 0.45);
      setStatus(moved > 0 ? `Relaxed ${moved} selected vertex(es).` : "Relax did nothing (select vertices first).");
      ev.preventDefault();
      return;
    }
    if (hotkey === "o" && !ev.ctrlKey && !ev.metaKey && !ev.altKey) {
      state.vertexDeform.proportional = !state.vertexDeform.proportional;
      refreshVertexDeformUI();
      setStatus(`Vertex proportional edit ${state.vertexDeform.proportional ? "ON" : "OFF"}.`);
      ev.preventDefault();
      return;
    }
    if (ev.key === "[" || ev.key === "{" || ev.key === "]" || ev.key === "}") {
      const step = ev.shiftKey ? 20 : 8;
      const dir = ev.key === "[" || ev.key === "{" ? -1 : 1;
      state.vertexDeform.radius = math.clamp((Number(state.vertexDeform.radius) || 80) + dir * step, 4, 400);
      refreshVertexDeformUI();
      setStatus(`Vertex proportional radius: ${Math.round(state.vertexDeform.radius)}px`);
      ev.preventDefault();
      return;
    }
  }
  if (state.editMode === "skeleton" && state.leftToolTab === "path") {
    if (ev.key === "Delete" || ev.key === "Backspace" || hotkey === "x") {
      const c = getActivePathConstraint();
      const i = Number(state.pathEdit.activePoint);
      if (c && c.sourceType === "drawn" && Array.isArray(c.points) && i >= 0 && i < c.points.length) {
        c.points.splice(i, 1);
        state.pathEdit.activePoint = Math.max(0, Math.min(i, c.points.length - 1));
        if (c.points.length === 0) state.pathEdit.activePoint = -1;
        state.pathEdit.activeHandle = c.points.length > 0 ? "point" : "";
        if (c.points.length < 3) c.closed = false;
        applyAutoHandlesForConstraint(c);
        refreshPathUI();
        setStatus(`Path point removed (${c.points.length}).`);
        ev.preventDefault();
        return;
      }
    }
  }
  if (state.editMode === "slotmesh") {
    const slot = getActiveSlot();
    if (!slot) return;
    const contour = ensureSlotContour(slot);
    const activeSet = state.slotMesh.activeSet === "fill" ? "fill" : "contour";
    const activePoints = activeSet === "fill" ? contour.fillPoints : contour.points;
    if (ev.key === "Enter") {
      if (!contour.closed && contour.points.length >= 3) contour.closed = true;
      contour.triangles = applyManualEdgesToTriangles(contour.points, triangulatePolygon(contour.points), contour.manualEdges);
      contour.fillPoints = [];
      contour.fillTriangles = [];
      contour.fillManualEdges = [];
      state.slotMesh.activeSet = "contour";
      setStatus(contour.triangles.length >= 3 ? `Triangulated: ${contour.triangles.length / 3} triangles.` : "Triangulation failed.");
      ev.preventDefault();
      return;
    }
    if ((ev.key === "Backspace" || ev.key === "Delete" || ev.key.toLowerCase() === "x") && activePoints.length > 0) {
      const index = state.slotMesh.activePoint >= 0 ? state.slotMesh.activePoint : activePoints.length - 1;
      if (removePointAtIndex(activePoints, index)) {
        if (activeSet === "contour") {
          contour.triangles = [];
          contour.fillPoints = [];
          contour.fillTriangles = [];
          contour.fillManualEdges = [];
          contour.manualEdges = normalizeEdgePairs(
            contour.manualEdges
              .filter((e) => e[0] !== index && e[1] !== index)
              .map((e) => [e[0] > index ? e[0] - 1 : e[0], e[1] > index ? e[1] - 1 : e[1]]),
            contour.points.length
          );
          if (contour.points.length < 3) contour.closed = false;
        } else {
          contour.fillTriangles = reindexTrianglesAfterPointRemoved(contour.fillTriangles, index);
          contour.fillManualEdges = normalizeEdgePairs(
            contour.fillManualEdges
              .filter((e) => e[0] !== index && e[1] !== index)
              .map((e) => [e[0] > index ? e[0] - 1 : e[0], e[1] > index ? e[1] - 1 : e[1]]),
            contour.fillPoints.length
          );
          contour.fillTriangles = applyManualEdgesToTriangles(contour.fillPoints, contour.fillTriangles, contour.fillManualEdges);
        }
      }
      state.slotMesh.edgeSelection = state.slotMesh.edgeSelection
        .filter((v) => v !== index)
        .map((v) => (v > index ? v - 1 : v));
      state.slotMesh.activePoint = Math.min(state.slotMesh.activePoint, activePoints.length - 1);
      setStatus(`${activeSet === "fill" ? "Fill" : "Contour"} vertex removed (${activePoints.length}).`);
      ev.preventDefault();
      return;
    }
    if (ev.key.toLowerCase() === "l") {
      if (!linkSelectedSlotMeshEdge(true)) {
        setStatus("Select 2 vertices (Shift+Click) in the same set, then press L.");
        ev.preventDefault();
        return;
      }
      const [a0, b0] = state.slotMesh.edgeSelection;
      const a = Math.min(a0, b0);
      const b = Math.max(a0, b0);
      setStatus(`Edge linked (${activeSet}: ${a}-${b}).`);
      ev.preventDefault();
      return;
    }
    if (ev.key.toLowerCase() === "u") {
      if (!linkSelectedSlotMeshEdge(false)) {
        setStatus("Select 2 linked vertices (Shift+Click) in the same set, then press U.");
        ev.preventDefault();
        return;
      }
      const [a0, b0] = state.slotMesh.edgeSelection;
      const a = Math.min(a0, b0);
      const b = Math.max(a0, b0);
      setStatus(`Edge unlinked (${activeSet}: ${a}-${b}).`);
      ev.preventDefault();
      return;
    }
    if (ev.key.toLowerCase() === "b" && !ev.shiftKey) {
      if (!bindActiveSlotToSelectedBone()) {
        setStatus("Bind failed. Select a bone first.");
      } else {
        const s = getActiveSlot();
        setStatus(`Slot "${s ? s.name : ""}" bound to bone ${s ? s.bone : -1}.`);
      }
      ev.preventDefault();
      return;
    }
    if (ev.key.toLowerCase() === "b" && ev.shiftKey) {
      if (!bindActiveSlotWeightedToSelectedBones()) {
        setStatus("Weighted bind failed. Select one or more bones first.");
      } else {
        const s = getActiveSlot();
        setStatus(
          `Slot "${s ? s.name : ""}" weighted to bones: ${(s && s.influenceBones && s.influenceBones.join(", ")) || "(none)"}`
        );
      }
      ev.preventDefault();
      return;
    }
    if (ev.key === "Escape") {
      state.drag = null;
      state.slotMesh.activePoint = -1;
      state.slotMesh.edgeSelection = [];
      state.ikPickArmed = false;
      state.ikHoverBone = -1;
      refreshIKUI();
      ev.preventDefault();
      return;
    }
  }
  if (!state.mesh || state.editMode !== "skeleton") return;

  const key = ev.key.toLowerCase();
  if (ev.ctrlKey && key === "c") {
    copySelectedKeyframe();
    ev.preventDefault();
    return;
  }
  if (ev.ctrlKey && key === "v") {
    pasteKeyframeAtCurrentTime();
    ev.preventDefault();
    return;
  }
  if (key === "shift" && state.boneMode === "edit" && state.selectedBone >= 0) {
    state.addBoneArmed = true;
    state.addBoneDraft = null;
    els.addBoneParent.value = String(state.selectedBone);
    els.addBoneConnect.value = "true";
    els.addBoneBtn.textContent = "Cancel Add";
    setStatus(`Chain add armed from parent bone ${state.selectedBone}. Drag in canvas to set new tail.`);
    ev.preventDefault();
    return;
  }
  if (key === "g") {
    setDragTool("move_head");
    ev.preventDefault();
    return;
  }
  if (key === "t") {
    setDragTool("move_tail");
    ev.preventDefault();
    return;
  }
  if (key === "r") {
    setDragTool("rotate");
    ev.preventDefault();
    return;
  }
  if (key === "escape") {
    state.parentPickArmed = false;
    state.parentHoverBone = -1;
    state.ikPickArmed = false;
    state.ikHoverBone = -1;
    refreshIKUI();
    renderBoneTree();
    setDragTool("auto");
    ev.preventDefault();
    return;
  }
  if (key === "c") {
    toggleSelectedConnect();
    ev.preventDefault();
    return;
  }
  if (key === "b" && !ev.shiftKey) {
    if (!bindActiveSlotToSelectedBone()) {
      setStatus("Bind failed. Need active slot and selected bone.");
    } else {
      const s = getActiveSlot();
      setStatus(`Slot "${s ? s.name : ""}" bound to bone ${s ? s.bone : -1}.`);
    }
    ev.preventDefault();
    return;
  }
  if (key === "b" && ev.shiftKey) {
    if (!bindActiveSlotWeightedToSelectedBones()) {
      setStatus("Weighted bind failed. Select one or more bones first.");
    } else {
      const s = getActiveSlot();
      setStatus(`Slot "${s ? s.name : ""}" weighted to bones: ${(s && s.influenceBones && s.influenceBones.join(", ")) || "(none)"}`);
    }
    ev.preventDefault();
    return;
  }
  if (key === "a" && !ev.shiftKey) {
    toggleSelectAllBones();
    ev.preventDefault();
    return;
  }
  if ((key === "a" && ev.shiftKey) || (key === "n" && state.boneMode === "edit")) {
    state.addBoneArmed = !state.addBoneArmed;
    state.addBoneDraft = null;
    els.addBoneBtn.textContent = state.addBoneArmed ? "Cancel Add" : "Add Bone";
    setStatus(state.addBoneArmed ? "Add bone armed: drag in canvas to create." : "Add bone canceled.");
    ev.preventDefault();
    return;
  }
  if ((ev.key === "Delete" || ev.key === "Backspace") && state.boneMode === "edit") {
    deleteBone();
    ev.preventDefault();
    return;
  }
  if (key === "w" && state.boneMode === "edit") {
    if (autoWeightActiveSlot()) {
      const picked = getSelectedBonesForWeight(state.mesh);
      setStatus(
        `Auto weights updated (${state.weightMode}) on ${state.slots.length > 0 ? "active slot" : "mesh"}; bones: ${
          picked.length > 0 ? picked.join(", ") : "(slot default)"
        }.`
      );
    }
    ev.preventDefault();
    return;
  }
  if (key === "i" && state.boneMode === "pose") {
    addAutoKeyframeFromDirty();
    ev.preventDefault();
    return;
  }
  if (key === "k" && ev.shiftKey && ev.altKey) {
    if (state.activeSlot >= 0) {
      const trackId = getSlotTrackId(state.activeSlot, "clipEnd");
      state.anim.selectedTrack = trackId;
      if (els.trackSelect) els.trackSelect.value = trackId;
      addOrUpdateKeyframeForTrack(trackId);
    }
    ev.preventDefault();
    return;
  }
  if (key === "k" && ev.shiftKey) {
    if (state.activeSlot >= 0) {
      const trackId = getSlotTrackId(state.activeSlot, "clip");
      state.anim.selectedTrack = trackId;
      if (els.trackSelect) els.trackSelect.value = trackId;
      addOrUpdateKeyframeForTrack(trackId);
    }
    ev.preventDefault();
    return;
  }
  if (key === "k") {
    addAutoKeyframeFromDirty();
    ev.preventDefault();
    return;
  }
  if (ev.key === ",") {
    jumpToNeighborKey(-1);
    ev.preventDefault();
    return;
  }
  if (ev.key === ".") {
    jumpToNeighborKey(1);
    ev.preventDefault();
    return;
  }
  if (key === " ") {
    state.anim.playing = !state.anim.playing;
    state.anim.lastTs = 0;
    updatePlaybackButtons();
    ev.preventDefault();
    return;
  }
  if (key === "p" && state.boneMode === "edit") {
    state.parentPickArmed = true;
    state.parentHoverBone = -1;
    renderBoneTree();
    setStatus("Parent pick armed: click target bone in canvas.");
    ev.preventDefault();
    return;
  }
  if (ev.key === "[") {
    selectBoneDelta(-1);
    ev.preventDefault();
    return;
  }
  if (ev.key === "]") {
    selectBoneDelta(1);
    ev.preventDefault();
    return;
  }
  if (key === "1") {
    state.boneMode = "edit";
    els.boneMode.value = "edit";
    updateBoneUI();
    ev.preventDefault();
    return;
  }
  if (key === "2") {
    state.boneMode = "pose";
    els.boneMode.value = "pose";
    syncPoseFromRig(state.mesh);
    updateBoneUI();
    ev.preventDefault();
  }
});

els.overlay.addEventListener("pointerdown", (ev) => {
  if (!state.mesh) return;

  const rect = els.overlay.getBoundingClientRect();
  const dpr = els.overlay.width / rect.width;
  const mx = (ev.clientX - rect.left) * dpr;
  const my = (ev.clientY - rect.top) * dpr;
  const local = screenToLocal(mx, my);

  if (state.editMode === "skeleton" && state.leftToolTab === "path") {
    const picked = pickActivePathDrawControl(mx, my);
    if (picked) {
      const c = getActivePathConstraint();
      const nodes = c ? getDrawnPathNodes(c) : [];
      if (c && picked.index >= 0 && picked.index < nodes.length) {
        c.points[picked.index] = nodes[picked.index];
        state.pathEdit.activePoint = picked.index;
        state.pathEdit.activeHandle = picked.kind;
        refreshPathUI();
        state.drag = {
          type: picked.kind === "point" ? "path_point" : "path_handle",
          handle: picked.kind === "point" ? "" : picked.kind,
          index: picked.index,
          pointerId: ev.pointerId,
          prevLocal: { x: local.x, y: local.y },
        };
        els.overlay.setPointerCapture(ev.pointerId);
        return;
      }
    }
    if (state.pathEdit.drawArmed) {
      const added = addPointToActivePath(local.x, local.y);
      if (added) {
        setStatus("Path point added.");
      } else {
        setStatus("Path point ignored.");
      }
      return;
    }
  }

  if (state.editMode === "slotmesh") {
    const slot = getActiveSlot();
    if (!slot) return;
    const contour = ensureSlotContour(slot);
    const hit = pickSlotContourPoint(slot, mx, my, 10);
    if (hit && hit.index >= 0) {
      state.slotMesh.activeSet = hit.set;
      state.slotMesh.activePoint = hit.index;
      if (ev.shiftKey) {
        if (state.slotMesh.edgeSelectionSet !== hit.set) {
          state.slotMesh.edgeSelection = [];
          state.slotMesh.edgeSelectionSet = hit.set;
        }
        if (state.slotMesh.edgeSelection.includes(hit.index)) {
          state.slotMesh.edgeSelection = state.slotMesh.edgeSelection.filter((v) => v !== hit.index);
        } else if (state.slotMesh.edgeSelection.length >= 2) {
          state.slotMesh.edgeSelection = [state.slotMesh.edgeSelection[1], hit.index];
        } else {
          state.slotMesh.edgeSelection.push(hit.index);
        }
        setStatus(
          `Selected ${state.slotMesh.edgeSelection.length}/2 vertex for edge link (${hit.set}). Use L to link, U to unlink.`
        );
        return;
      }
      state.slotMesh.edgeSelection = [hit.index];
      state.slotMesh.edgeSelectionSet = hit.set;
      state.drag = { type: "slot_mesh_point", pointerId: ev.pointerId, pointIndex: hit.index, pointSet: hit.set };
      els.overlay.setPointerCapture(ev.pointerId);
      return;
    }
    if (!contour.closed && contour.points.length >= 3) {
      const first = contour.points[0];
      const fs = localToScreen(first.x, first.y);
      const dx = fs.x - mx;
      const dy = fs.y - my;
      if (dx * dx + dy * dy <= 11 * 11) {
        contour.closed = true;
        contour.triangles = [];
        contour.fillPoints = [];
        contour.fillTriangles = [];
        contour.fillManualEdges = [];
        state.slotMesh.activeSet = "contour";
        state.slotMesh.activePoint = 0;
        setStatus("Contour closed. Triangulate to preview and Apply Mesh to commit.");
        return;
      }
    }
    if (contour.closed) {
      contour.closed = false;
      contour.triangles = [];
      contour.fillPoints = [];
      contour.fillTriangles = [];
      contour.fillManualEdges = [];
    }
    contour.points.push({ x: local.x, y: local.y });
    contour.manualEdges = normalizeEdgePairs(contour.manualEdges, contour.points.length);
    state.slotMesh.activeSet = "contour";
    state.slotMesh.activePoint = contour.points.length - 1;
    state.slotMesh.edgeSelection = [state.slotMesh.activePoint];
    state.slotMesh.edgeSelectionSet = "contour";
    setStatus(`Contour point added (${contour.points.length}).`);
    return;
  }

  if (state.addBoneArmed && state.editMode === "skeleton" && state.boneMode === "edit") {
    const parent = Number(els.addBoneParent.value);
    const connected = els.addBoneConnect.value === "true";
    const rigBones = state.mesh.rigBones;
    let head = { ...local };
    if (parent >= 0 && connected && rigBones[parent]) {
      const world = computeWorld(rigBones);
      head = transformPoint(world[parent], rigBones[parent].length, 0);
    }
    state.addBoneDraft = { parent, connected, head, tail: { ...local } };
    state.drag = { type: "add_bone_drag", pointerId: ev.pointerId };
    els.overlay.setPointerCapture(ev.pointerId);
    return;
  }

  if (state.editMode === "vertex") {
    state.vertexDeform.cursorX = mx;
    state.vertexDeform.cursorY = my;
    state.vertexDeform.hasCursor = true;
    const ctx = getActiveVertexContext(state.mesh);
    const vCount = ctx.vCount;
    const index = pickVertex(mx, my);
    if (index >= 0) {
      if (ev.shiftKey || ev.ctrlKey || ev.metaKey) {
        const next = toggleVertexSelectionIndex(index, vCount);
        setStatus(`Vertex selection: ${next.length} selected.`);
        return;
      }
      let selected = getActiveVertexSelection(vCount);
      if (!selected.includes(index)) {
        selected = [index];
        setActiveVertexSelection(selected, vCount);
      }
      const selectedForDrag = selected.length > 1 ? selected : [index];
      state.drag = {
        type: "vertex",
        index,
        prevX: mx,
        prevY: my,
        selectedIndices: selectedForDrag,
        mirrorMap: state.vertexDeform.mirror ? buildMirrorIndexMap(vCount) : null,
        influences: selectedForDrag.length > 1 ? null : gatherVertexDragInfluences(index, mx, my),
      };
      els.overlay.setPointerCapture(ev.pointerId);
    } else {
      state.drag = {
        type: "vertex_marquee",
        pointerId: ev.pointerId,
        startX: mx,
        startY: my,
        curX: mx,
        curY: my,
        append: !!(ev.shiftKey || ev.ctrlKey || ev.metaKey),
      };
      els.overlay.setPointerCapture(ev.pointerId);
    }
    return;
  }

  const hit = pickSkeletonHandle(mx, my);
  if (state.ikPickArmed && hit) {
    const c = getActiveIKConstraint();
    if (!c) {
      state.ikPickArmed = false;
      refreshIKUI();
      return;
    }
    c.target = hit.boneIndex;
    const tp = getIKSolveTargetWorld(getPoseBones(state.mesh), c);
    if (tp) {
      c.targetX = tp.x;
      c.targetY = tp.y;
    }
    state.ikPickArmed = false;
    state.ikHoverBone = -1;
    refreshIKUI();
    renderBoneTree();
    setStatus(`IK target set to bone ${hit.boneIndex}.`);
    return;
  }
  if (state.parentPickArmed && hit && state.boneMode === "edit") {
    const child = state.selectedBone;
    const parent = hit.boneIndex;
    if (child !== parent && isValidParent(state.mesh.rigBones, child, parent)) {
      state.mesh.rigBones[child].parent = parent;
      state.mesh.rigBones[child].connected = true;
      commitRigEdit(state.mesh, true);
      updateBoneUI();
      setStatus(`Parent set: bone ${child} -> ${parent}`);
    } else {
      setStatus("Invalid parent pick.");
    }
    state.parentPickArmed = false;
    state.parentHoverBone = -1;
    renderBoneTree();
    return;
  }

  if (state.dragTool !== "auto") {
    const targetBone = hit ? hit.boneIndex : state.selectedBone;
    if (targetBone >= 0) {
      state.selectedBone = targetBone;
      state.selectedBonesForWeight = [targetBone];
      updateBoneUI();
      const forcedType = state.dragTool === "move_head" ? "bone_joint" : "bone_tip";
      state.drag = { type: forcedType, boneIndex: targetBone, pointerId: ev.pointerId, needsReweight: state.boneMode === "edit" };
      els.overlay.setPointerCapture(ev.pointerId);
      return;
    }
  }

  if (hit) {
    if (ev.ctrlKey || ev.metaKey) {
      const set = new Set(getSelectedBonesForWeight(state.mesh));
      if (set.has(hit.boneIndex)) set.delete(hit.boneIndex);
      else set.add(hit.boneIndex);
      state.selectedBonesForWeight = [...set];
      state.selectedBone = hit.boneIndex;
      updateBoneUI();
      return;
    }
    state.selectedBone = hit.boneIndex;
    const selected = getSelectedBonesForWeight(state.mesh);
    // Node editing should stay responsive even under multi-select.
    // Hold Alt to move the whole selected bone set instead.
    const wantGroupMove = !!ev.altKey;
    if (!wantGroupMove || selected.length <= 1 || !selected.includes(hit.boneIndex)) {
      state.selectedBonesForWeight = [hit.boneIndex];
      updateBoneUI();
      state.drag = { ...hit, pointerId: ev.pointerId, needsReweight: state.boneMode === "edit" };
      els.overlay.setPointerCapture(ev.pointerId);
      return;
    }
    const bones = getBonesForCurrentMode(state.mesh);
    const world = computeWorld(bones);
    state.drag = {
      type: "bone_multi_move",
      pointerId: ev.pointerId,
      startLocal: local,
      needsReweight: state.boneMode === "edit",
      items: selected.map((bi) => {
        const ep = getBoneWorldEndpointsFromBones(bones, bi, world);
        return { boneIndex: bi, head: ep.head, tip: ep.tip };
      }),
    };
    els.overlay.setPointerCapture(ev.pointerId);
    updateBoneUI();
    return;
  }

  if (state.editMode === "skeleton") {
    state.drag = {
      type: "bone_marquee",
      pointerId: ev.pointerId,
      startX: mx,
      startY: my,
      curX: mx,
      curY: my,
      append: !!(ev.ctrlKey || ev.metaKey),
    };
    els.overlay.setPointerCapture(ev.pointerId);
  }
});

els.overlay.addEventListener("pointermove", (ev) => {
  if (!state.mesh) return;

  const rect = els.overlay.getBoundingClientRect();
  const dpr = els.overlay.width / rect.width;
  const mx = (ev.clientX - rect.left) * dpr;
  const my = (ev.clientY - rect.top) * dpr;
  const local = screenToLocal(mx, my);
  const m = state.mesh;
  if (state.editMode === "vertex") {
    state.vertexDeform.cursorX = mx;
    state.vertexDeform.cursorY = my;
    state.vertexDeform.hasCursor = true;
  }
  if (!state.ikPickArmed && state.ikHoverBone !== -1) {
    state.ikHoverBone = -1;
    renderBoneTree();
  }
  if (state.ikPickArmed && !state.drag) {
    const h = pickSkeletonHandle(mx, my);
    const next = h ? h.boneIndex : -1;
    if (next !== state.ikHoverBone) {
      state.ikHoverBone = next;
      renderBoneTree();
    }
  }
  if (!state.parentPickArmed && state.parentHoverBone !== -1) {
    state.parentHoverBone = -1;
    renderBoneTree();
  }
  if (state.parentPickArmed && !state.drag) {
    const h = pickSkeletonHandle(mx, my);
    const next = h ? h.boneIndex : -1;
    if (next !== state.parentHoverBone) {
      state.parentHoverBone = next;
      renderBoneTree();
    }
  }
  if (!state.drag) return;

  if (state.drag.type === "path_point") {
    const c = getActivePathConstraint();
    if (!c || c.sourceType !== "drawn" || !Array.isArray(c.points)) return;
    const i = Number(state.drag.index);
    if (!Number.isFinite(i) || i < 0 || i >= c.points.length) return;
    const p = normalizePathNode(c.points[i]);
    const dx = local.x - (Number(state.drag.prevLocal && state.drag.prevLocal.x) || local.x);
    const dy = local.y - (Number(state.drag.prevLocal && state.drag.prevLocal.y) || local.y);
    p.x += dx;
    p.y += dy;
    p.hinx += dx;
    p.hiny += dy;
    p.houtx += dx;
    p.houty += dy;
    c.points[i] = p;
    applyAutoHandlesForConstraint(c);
    state.drag.prevLocal = { x: local.x, y: local.y };
    return;
  }

  if (state.drag.type === "path_handle") {
    const c = getActivePathConstraint();
    if (!c || c.sourceType !== "drawn" || !Array.isArray(c.points)) return;
    const i = Number(state.drag.index);
    if (!Number.isFinite(i) || i < 0 || i >= c.points.length) return;
    const p = normalizePathNode(c.points[i]);
    const h = state.drag.handle === "in" ? "in" : "out";
    const mode = p.handleMode || (p.broken ? "broken" : "aligned");
    if (h === "in") {
      p.hinx = local.x;
      p.hiny = local.y;
      if (mode === "aligned" && !ev.altKey) {
        const vx = p.x - p.hinx;
        const vy = p.y - p.hiny;
        const dir = normalizeVec(vx, vy);
        const ox = p.houtx - p.x;
        const oy = p.houty - p.y;
        const olen = Math.max(1e-6, Math.hypot(ox, oy));
        p.houtx = p.x + dir.x * olen;
        p.houty = p.y + dir.y * olen;
      } else if (mode === "auto" || ev.altKey) {
        p.broken = true;
        p.handleMode = "broken";
      }
    } else {
      p.houtx = local.x;
      p.houty = local.y;
      if (mode === "aligned" && !ev.altKey) {
        const vx = p.x - p.houtx;
        const vy = p.y - p.houty;
        const dir = normalizeVec(vx, vy);
        const ix = p.hinx - p.x;
        const iy = p.hiny - p.y;
        const ilen = Math.max(1e-6, Math.hypot(ix, iy));
        p.hinx = p.x + dir.x * ilen;
        p.hiny = p.y + dir.y * ilen;
      } else if (mode === "auto" || ev.altKey) {
        p.broken = true;
        p.handleMode = "broken";
      }
    }
    c.points[i] = p;
    applyAutoHandlesForConstraint(c);
    return;
  }

  if (state.drag.type === "slot_mesh_point") {
    const slot = getActiveSlot();
    if (!slot) return;
    const contour = ensureSlotContour(slot);
    const setName = state.drag.pointSet === "fill" ? "fill" : "contour";
    const points = setName === "fill" ? contour.fillPoints : contour.points;
    const i = state.drag.pointIndex;
    if (i >= 0 && i < points.length) {
      points[i] = { x: local.x, y: local.y };
      if (setName === "contour") {
        contour.triangles = [];
        contour.fillPoints = [];
        contour.fillTriangles = [];
        contour.fillManualEdges = [];
      }
      state.slotMesh.activeSet = setName;
      state.slotMesh.activePoint = i;
    }
    return;
  }

  if (state.drag.type === "add_bone_drag") {
    const local = screenToLocal(mx, my);
    if (state.addBoneDraft) {
      state.addBoneDraft.tail = { ...local };
    }
    return;
  }

  if (state.drag.type === "vertex") {
    const dx = (mx - state.drag.prevX) / state.view.scale;
    const dy = (my - state.drag.prevY) / state.view.scale;
    const offsets = getActiveOffsets(m);
    const ctx = getActiveVertexContext(m);
    const pinned = getActivePinnedVertexSet(ctx.vCount);
    const mirrorMap = state.vertexDeform.mirror && state.drag.mirrorMap instanceof Map ? state.drag.mirrorMap : null;
    const applyDelta = (i, ddx, ddy) => {
      if (!Number.isFinite(i) || i < 0 || i >= ctx.vCount) return;
      if (pinned.has(i)) return;
      offsets[i * 2] += ddx;
      offsets[i * 2 + 1] += ddy;
      if (mirrorMap) {
        const mi = Number(mirrorMap.get(i));
        if (!Number.isFinite(mi) || mi < 0 || mi >= ctx.vCount || mi === i || pinned.has(mi)) return;
        offsets[mi * 2] += -ddx;
        offsets[mi * 2 + 1] += ddy;
      }
    };
    const selected = sanitizeVertexIndexArray(state.drag.selectedIndices, ctx.vCount);
    if (selected.length > 1) {
      for (const i of selected) {
        applyDelta(i, dx, dy);
      }
    } else {
      const influences =
        Array.isArray(state.drag.influences) && state.drag.influences.length > 0
          ? state.drag.influences
          : [{ index: state.drag.index, weight: 1 }];
      for (const it of influences) {
        const i = Number(it && it.index);
        if (!Number.isFinite(i) || i < 0) continue;
        const w = math.clamp(Number(it && it.weight) || 0, 0, 1);
        if (w <= 1e-5) continue;
        applyDelta(i, dx * w, dy * w);
      }
    }
    markDirtyVertexTrack(state.activeSlot);
    state.drag.prevX = mx;
    state.drag.prevY = my;
    return;
  }

  if (state.drag.type === "vertex_marquee") {
    state.drag.curX = mx;
    state.drag.curY = my;
    return;
  }

  if (state.drag.type === "bone_marquee") {
    state.drag.curX = mx;
    state.drag.curY = my;
    return;
  }

  const bones = getBonesForCurrentMode(m);
  if (state.drag.type === "bone_joint") {
    const ikDriven = moveBoneJointToLocal(bones, state.drag.boneIndex, local);
    if (!ikDriven) {
      markDirtyByBoneProp(state.drag.boneIndex, "translate");
    }
    if (state.boneMode === "edit") {
      commitRigEdit(m, false);
    }
    updateBoneUI();
    return;
  }

  if (state.drag.type === "bone_tip") {
    const ikDriven = rotateBoneTipToLocal(bones, state.drag.boneIndex, local);
    if (!ikDriven) {
      markDirtyByBoneProp(state.drag.boneIndex, "rotate");
      markDirtyByBoneProp(state.drag.boneIndex, "scale");
    }
    if (state.boneMode === "edit") {
      commitRigEdit(m, false);
    }
    updateBoneUI();
    return;
  }

  if (state.drag.type === "bone_multi_move") {
    const d = state.drag;
    const dx = local.x - d.startLocal.x;
    const dy = local.y - d.startLocal.y;
    for (const it of d.items) {
      const nh = { x: it.head.x + dx, y: it.head.y + dy };
      const nt = { x: it.tip.x + dx, y: it.tip.y + dy };
      setBoneFromWorldEndpoints(bones, it.boneIndex, nh, nt);
      markDirtyByBoneProp(it.boneIndex, "translate");
    }
    if (state.boneMode === "edit") {
      commitRigEdit(m, false);
    }
    updateBoneUI();
  }
});

function clearDrag(ev) {
  const drag = state.drag;
  const shiftHeld = !!(ev && ev.shiftKey);
  if (!state.drag) return;
  if (ev && ev.pointerId != null) {
    try {
      els.overlay.releasePointerCapture(ev.pointerId);
    } catch {
      // ignore
    }
  }
  state.drag = null;
  if (drag.type === "path_point" || drag.type === "path_handle") {
    pushUndoCheckpoint(true);
    return;
  }
  if (drag.type === "slot_mesh_point") {
    const slot = getActiveSlot();
    if (slot) {
      const contour = ensureSlotContour(slot);
      if (drag.pointSet === "contour") contour.triangles = [];
    }
    pushUndoCheckpoint(true);
    return;
  }
  if (drag.type === "bone_marquee") {
    const dx = drag.curX - drag.startX;
    const dy = drag.curY - drag.startY;
    if (dx * dx + dy * dy > 16) {
      selectBonesByRect(drag.startX, drag.startY, drag.curX, drag.curY, !!drag.append);
      setStatus(`Selected bones: ${state.selectedBonesForWeight.join(", ") || "(none)"}`);
    }
  }
  if (drag.type === "vertex_marquee") {
    const dx = drag.curX - drag.startX;
    const dy = drag.curY - drag.startY;
    if (dx * dx + dy * dy > 16) {
      const count = selectVerticesByRect(drag.startX, drag.startY, drag.curX, drag.curY, !!drag.append);
      setStatus(`Vertex selection: ${count} selected.`);
    } else if (!drag.append) {
      clearActiveVertexSelection();
      setStatus("Vertex selection cleared.");
    }
    return;
  }
  if (drag.type === "add_bone_drag" && state.addBoneDraft && state.mesh && state.boneMode === "edit") {
    const draft = state.addBoneDraft;
    const dx = draft.tail.x - draft.head.x;
    const dy = draft.tail.y - draft.head.y;
    let createdIdx = -1;
    if (dx * dx + dy * dy > 4) {
      createdIdx = addBone({
        parent: Number.isFinite(draft.parent) ? draft.parent : -1,
        connected: !!draft.connected,
        head: draft.head,
        tail: draft.tail,
      });
      setStatus("Bone created from canvas drag.");
    }
    state.addBoneDraft = null;
    if (shiftHeld && createdIdx >= 0) {
      state.addBoneArmed = true;
      els.addBoneParent.value = String(createdIdx);
      els.addBoneConnect.value = "true";
      els.addBoneBtn.textContent = "Cancel Add";
      setStatus(`Chain add: parent set to bone ${createdIdx}. Drag next tail.`);
    } else {
      state.addBoneArmed = false;
      els.addBoneBtn.textContent = "Add Bone";
    }
  }
  if (state.mesh && drag.type !== "vertex" && drag.needsReweight) {
    autoWeightMesh(state.mesh);
    for (const s of state.slots) {
      if (!s) continue;
      rebuildSlotWeights(s, state.mesh);
    }
  }
  if (
    drag.type === "bone_head" ||
    drag.type === "bone_tip" ||
    drag.type === "bone_multi_move" ||
    drag.type === "vertex"
  ) {
    pushUndoCheckpoint(true);
  }
}

els.overlay.addEventListener("pointerup", clearDrag);
els.overlay.addEventListener("pointercancel", clearDrag);
els.overlay.addEventListener("pointerleave", () => {
  state.vertexDeform.hasCursor = false;
});
els.overlay.addEventListener("contextmenu", (ev) => {
  ev.preventDefault();
});
els.overlay.addEventListener("dragstart", (ev) => {
  ev.preventDefault();
});
els.overlay.addEventListener(
  "wheel",
  (ev) => {
    if (!state.mesh && !(state.imageWidth > 0 && state.imageHeight > 0)) return;
    ev.preventDefault();
    const adjustVertexRadius =
      state.editMode === "vertex" &&
      state.vertexDeform.proportional &&
      ev.altKey &&
      !ev.ctrlKey &&
      !ev.metaKey;
    if (adjustVertexRadius) {
      const step = ev.shiftKey ? 20 : 8;
      const dir = ev.deltaY > 0 ? -1 : 1;
      state.vertexDeform.radius = math.clamp((Number(state.vertexDeform.radius) || 80) + dir * step, 4, 400);
      refreshVertexDeformUI();
      setStatus(`Vertex proportional radius: ${Math.round(state.vertexDeform.radius)}px`);
      return;
    }
    const rect = els.overlay.getBoundingClientRect();
    const dpr = els.overlay.width / Math.max(1, rect.width);
    const sx = (ev.clientX - rect.left) * dpr;
    const sy = (ev.clientY - rect.top) * dpr;
    const factor = ev.deltaY > 0 ? 1 / 1.1 : 1.1;
    zoomViewBy(factor, sx, sy);
  },
  { passive: false }
);
window.addEventListener("resize", resize);
window.addEventListener("resize", () => {
  if (!state.boneTreeMenuOpen) return;
  closeBoneTreeContextMenu();
});

setupLeftToolTabs();
setupWorkspaceTabs();
setupAnimateSubTabs();
mountAnimateAuxPanelsInLeftTools();
render();
state.editMode = els.editMode ? els.editMode.value || "skeleton" : "skeleton";
state.workspaceMode = state.editMode === "slotmesh" ? "slotmesh" : "rig";
state.uiPage = state.editMode === "slotmesh" ? "slot" : "rig";
state.boneMode = els.boneMode.value || "edit";
state.weightMode = els.weightMode.value || "hard";
state.anim.loop = !!els.animLoop.checked;
state.anim.snap = !!els.animSnap.checked;
state.anim.fps = Math.max(1, Number(els.animFps.value) || 30);
state.anim.timeStep = Math.max(0.001, Number(els.animTimeStep && els.animTimeStep.value) || 0.01);
state.slotViewMode = els.slotViewMode ? els.slotViewMode.value || "single" : "single";
state.vertexDeform.proportional = els.vertexProportionalToggle ? !!els.vertexProportionalToggle.checked : true;
state.vertexDeform.mirror = els.vertexMirrorToggle ? !!els.vertexMirrorToggle.checked : false;
state.vertexDeform.heatmap = els.vertexHeatmapToggle ? !!els.vertexHeatmapToggle.checked : false;
state.vertexDeform.radius = math.clamp(Number(els.vertexProportionalRadius && els.vertexProportionalRadius.value) || 80, 4, 400);
state.vertexDeform.falloff = sanitizeVertexFalloff(els.vertexProportionalFalloff && els.vertexProportionalFalloff.value);
state.export.spineCompat = getSpineCompatPreset(els.spineCompat && els.spineCompat.value).id;
if (els.spineCompat) els.spineCompat.value = state.export.spineCompat;
ensureCurrentAnimation();
ensureOnionSkinSettings();
installStateMachineBridgeApi();
setAnimTime(Number(els.animTime.value) || 0);
refreshAnimationUI();
refreshSlotUI();
updateWorkspaceUI();
refreshVertexDeformUI();
updatePlaybackButtons();
renderDiagnosticsUI();
pushUndoCheckpoint(true);
window.addEventListener("beforeunload", () => {
  saveAutosaveSnapshot("beforeunload", true);
});
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") saveAutosaveSnapshot("hidden", true);
});
setStatus(
  `${hasGL ? "WebGL" : "2D fallback"} ready. Hotkeys: +/- zoom, 0 fit view, wheel zoom at cursor (vertex mode: Alt+wheel radius), A select all, Shift+A add bone, Alt+drag selected bones move group, G/T/R tools, C connect, B bind slot to selected bone, Shift+B weighted bind, P parent pick, O proportional vertex toggle, [ ] radius, Vertex: H mirror, J heatmap, Shift/Ctrl+Click multi-select, drag box select, P pin, U unpin, M relax, Enter triangulate contour, L/U link edge, Del/X delete vertex, I/K key, Shift+K clip key, Shift+Alt+K clip end key, Space play, ,/. jump keys.`
);

void (async () => {
  await tryRestoreAutosaveAtStartup();
  state.autosave.ready = true;
  saveAutosaveSnapshot("startup", false);
  startAutosaveLoop();
})();





