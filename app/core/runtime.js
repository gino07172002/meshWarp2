// Split from app.js
// Part: DOM refs, canvas setup, shared state, math, UI core
// Original lines: 1-3215
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
  workspaceSwitcher: document.getElementById("workspaceSwitcher"),
  workspaceTabSlot: document.getElementById("workspaceTabSlot"),
  workspaceTabRig: document.getElementById("workspaceTabRig"),
  workspaceTabObject: document.getElementById("workspaceTabObject"),
  wsModeSelect: document.getElementById("wsModeSelect"),
  animateSubTabs: document.getElementById("animateSubTabs"),
  animSubTabTimeline: document.getElementById("animSubTabTimeline"),
  animSubTabLayers: document.getElementById("animSubTabLayers"),
  animSubTabState: document.getElementById("animSubTabState"),
  editModeWrap: document.getElementById("editModeWrap"),
  boneModeWrap: document.getElementById("boneModeWrap"),
  slotSelectWrap: document.getElementById("slotSelectWrap"),
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
  viewPanToggleBtn: document.getElementById("viewPanToggleBtn"),
  viewFitAllBtn: document.getElementById("viewFitAllBtn"),
  viewZoomOutBtn: document.getElementById("viewZoomOutBtn"),
  viewZoomResetBtn: document.getElementById("viewZoomResetBtn"),
  viewZoomInBtn: document.getElementById("viewZoomInBtn"),
  workspaceModeLabel: document.getElementById("workspaceModeLabel"),
  objectPanelMoveBtn: document.getElementById("objectPanelMoveBtn"),
  objectPanelRotateBtn: document.getElementById("objectPanelRotateBtn"),
  workspaceMode: document.getElementById("workspaceMode"),
  leftToolModeHint: document.getElementById("leftToolModeHint"),
  leftToolTabs: document.getElementById("leftToolTabs"),
  leftTabCanvas: document.getElementById("leftTabCanvas"),
  leftTabSetup: document.getElementById("leftTabSetup"),
  leftTabRig: document.getElementById("leftTabRig"),
  leftTabObject: document.getElementById("leftTabObject"),
  leftTabIK: document.getElementById("leftTabIK"),
  leftTabConstraint: document.getElementById("leftTabConstraint"),
  leftTabPath: document.getElementById("leftTabPath"),
  leftTabSkin: document.getElementById("leftTabSkin"),
  leftTabTools: document.getElementById("leftTabTools"),
  leftTabSlotMesh: document.getElementById("leftTabSlotMesh"),
  leftCanvasTools: document.getElementById("leftCanvasTools"),
  leftMeshSetup: document.getElementById("leftMeshSetup"),
  leftRigBuild: document.getElementById("leftRigBuild"),
  leftObjectTools: document.getElementById("leftObjectTools"),
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
  boneTreeAddBoneBtn: document.getElementById("boneTreeAddBoneBtn"),
  boneTreeHumanoidBoneBtn: document.getElementById("boneTreeHumanoidBoneBtn"),
  boneTreeDeleteBoneBtn: document.getElementById("boneTreeDeleteBoneBtn"),
  boneTreeDeleteBoneMenuBtn: document.getElementById("boneTreeDeleteBoneMenuBtn"),
  boneTreeDeleteBoneMenu: document.getElementById("boneTreeDeleteBoneMenu"),
  boneTreeDeleteBoneToStagingBtn: document.getElementById("boneTreeDeleteBoneToStagingBtn"),
  boneTreeDeleteBoneWithSlotsBtn: document.getElementById("boneTreeDeleteBoneWithSlotsBtn"),
  boneTreeBindSelectedUnassignedBtn: document.getElementById("boneTreeBindSelectedUnassignedBtn"),
  boneTreeHideScopeBtn: document.getElementById("boneTreeHideScopeBtn"),
  slotPropsGroup: document.getElementById("slotPropsGroup"),
  bonePropsGroup: document.getElementById("bonePropsGroup"),
  slotSelect: document.getElementById("slotSelect"),
  slotViewMode: document.getElementById("slotViewMode"),
  gridX: document.getElementById("gridX"),
  gridY: document.getElementById("gridY"),
  remeshBtn: document.getElementById("remeshBtn"),
  setupAddBoneBtn: document.getElementById("setupAddBoneBtn"),
  setupDeleteBoneBtn: document.getElementById("setupDeleteBoneBtn"),
  setupHumanoidBoneBtn: document.getElementById("setupHumanoidBoneBtn"),
  setupHumanoidSourceMode: document.getElementById("setupHumanoidSourceMode"),
  setupHumanoidMinScore: document.getElementById("setupHumanoidMinScore"),
  setupHumanoidSmoothing: document.getElementById("setupHumanoidSmoothing"),
  setupHumanoidFallback: document.getElementById("setupHumanoidFallback"),
  setupBindBoneBtn: document.getElementById("setupBindBoneBtn"),
  setupBindWeightedBtn: document.getElementById("setupBindWeightedBtn"),
  setupAutoWeightSingleBtn: document.getElementById("setupAutoWeightSingleBtn"),
  setupAutoWeightMultiBtn: document.getElementById("setupAutoWeightMultiBtn"),
  setupEditWeightsBtn: document.getElementById("setupEditWeightsBtn"),
  setupAutoWeightSelectionSummary: document.getElementById("setupAutoWeightSelectionSummary"),
  baseImageTx: document.getElementById("baseImageTx"),
  baseImageTy: document.getElementById("baseImageTy"),
  baseImageScale: document.getElementById("baseImageScale"),
  baseImageRot: document.getElementById("baseImageRot"),
  baseImageTransformResetBtn: document.getElementById("baseImageTransformResetBtn"),
  baseImageTransformHint: document.getElementById("baseImageTransformHint"),
  systemMode: document.getElementById("systemMode"),
  editMode: document.getElementById("editMode"),
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
  boneWorkHidden: document.getElementById("boneWorkHidden"),
  boneAnimHidden: document.getElementById("boneAnimHidden"),
  boneAnimHideSetKeyBtn: document.getElementById("boneAnimHideSetKeyBtn"),
  boneAnimHideDelKeyBtn: document.getElementById("boneAnimHideDelKeyBtn"),
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
  vertexWeightVizToggle: document.getElementById("vertexWeightVizToggle"),
  vertexWeightVizMode: document.getElementById("vertexWeightVizMode"),
  vertexWeightVizOpacity: document.getElementById("vertexWeightVizOpacity"),
  vertexProportionalRadius: document.getElementById("vertexProportionalRadius"),
  vertexProportionalFalloff: document.getElementById("vertexProportionalFalloff"),
  animTime: document.getElementById("animTime"),
  animDuration: document.getElementById("animDuration"),
  animRangeStart: document.getElementById("animRangeStart"),
  animRangeEnd: document.getElementById("animRangeEnd"),
  animSelect: document.getElementById("animSelect"),
  animName: document.getElementById("animName"),
  animActionSelect: document.getElementById("animActionSelect"),
  animActionBtn: document.getElementById("animActionBtn"),
  animLoop: document.getElementById("animLoop"),
  animSnap: document.getElementById("animSnap"),
  animFps: document.getElementById("animFps"),
  animTimeStep: document.getElementById("animTimeStep"),
  timelineZoomOutBtn: document.getElementById("timelineZoomOutBtn"),
  timelineZoomResetBtn: document.getElementById("timelineZoomResetBtn"),
  timelineZoomInBtn: document.getElementById("timelineZoomInBtn"),
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
  timelineCollapseBtn: document.getElementById("timelineCollapseBtn"),
  exportDock: document.getElementById("exportDock"),
  stateDock: document.getElementById("stateDock"),
  layerDock: document.getElementById("layerDock"),
  undoBtn: document.getElementById("undoBtn"),
  redoBtn: document.getElementById("redoBtn"),
  addKeyBtn: document.getElementById("addKeyBtn"),
  autoKeyBtn: document.getElementById("autoKeyBtn"),
  addSpecialKeySelect: document.getElementById("addSpecialKeySelect"),
  addSpecialKeyBtn: document.getElementById("addSpecialKeyBtn"),
  timelineLoopToolSelect: document.getElementById("timelineLoopToolSelect"),
  timelineLoopToolBtn: document.getElementById("timelineLoopToolBtn"),
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
  cutKeyBtn: document.getElementById("cutKeyBtn"),
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
  timelineKeyContextMenu: document.getElementById("timelineKeyContextMenu"),
  timelineCtxCutBtn: document.getElementById("timelineCtxCutBtn"),
  timelineCtxCopyBtn: document.getElementById("timelineCtxCopyBtn"),
  timelineCtxPasteBtn: document.getElementById("timelineCtxPasteBtn"),
  timelineCtxDeleteBtn: document.getElementById("timelineCtxDeleteBtn"),
  treeCtxSlotAddBtn: document.getElementById("treeCtxSlotAddBtn"),
  treeCtxSlotDupBtn: document.getElementById("treeCtxSlotDupBtn"),
  treeCtxSlotRenameBtn: document.getElementById("treeCtxSlotRenameBtn"),
  treeCtxSlotDeleteBtn: document.getElementById("treeCtxSlotDeleteBtn"),
  treeCtxBoneDeleteBtn: document.getElementById("treeCtxBoneDeleteBtn"),
  treeCtxBoneDeleteWithSlotsBtn: document.getElementById("treeCtxBoneDeleteWithSlotsBtn"),
  treeCtxSlotLoadImageBtn: document.getElementById("treeCtxSlotLoadImageBtn"),
  boneTree: document.getElementById("boneTree"),
  slotName: document.getElementById("slotName"),
  slotAttachment: document.getElementById("slotAttachment"),
  slotAttachmentVisible: document.getElementById("slotAttachmentVisible"),
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
  slotAttachmentSequenceSetupIndex: document.getElementById("slotAttachmentSequenceSetupIndex"),
  slotAttachmentSequenceMode: document.getElementById("slotAttachmentSequenceMode"),
  slotAttachmentSequencePath: document.getElementById("slotAttachmentSequencePath"),
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
  slotWeightQuickBar: document.getElementById("slotWeightQuickBar"),
  slotWeightQuickWeightedBtn: document.getElementById("slotWeightQuickWeightedBtn"),
  slotWeightQuickSingleBtn: document.getElementById("slotWeightQuickSingleBtn"),
  slotWeightQuickFreeBtn: document.getElementById("slotWeightQuickFreeBtn"),
  slotWeightQuickEditBtn: document.getElementById("slotWeightQuickEditBtn"),
  slotVisible: document.getElementById("slotVisible"),
  slotAlpha: document.getElementById("slotAlpha"),
  slotColor: document.getElementById("slotColor"),
  slotBlend: document.getElementById("slotBlend"),
  slotDarkEnabled: document.getElementById("slotDarkEnabled"),
  slotDarkColor: document.getElementById("slotDarkColor"),
  slotWeightMode: document.getElementById("slotWeightMode"),
  slotWeightModeHint: document.getElementById("slotWeightModeHint"),
  slotBindSelectionSummary: document.getElementById("slotBindSelectionSummary"),
  slotInfluenceBones: document.getElementById("slotInfluenceBones"),
  slotTx: document.getElementById("slotTx"),
  slotTy: document.getElementById("slotTy"),
  slotRot: document.getElementById("slotRot"),
  slotOrderUp: document.getElementById("slotOrderUp"),
  slotOrderDown: document.getElementById("slotOrderDown"),
  slotMeshTools: document.getElementById("slotMeshTools"),
  slotMeshNewBtn: document.getElementById("slotMeshNewBtn"),
  slotMeshToolModeHint: document.getElementById("slotMeshToolModeHint"),
  slotMeshCloseBtn: document.getElementById("slotMeshCloseBtn"),
  slotMeshTriangulateBtn: document.getElementById("slotMeshTriangulateBtn"),
  slotMeshGridFillBtn: document.getElementById("slotMeshGridFillBtn"),
  slotMeshAutoForegroundBtn: document.getElementById("slotMeshAutoForegroundBtn"),
  slotMeshGridReplaceContour: document.getElementById("slotMeshGridReplaceContour"),
  slotMeshContourRefHint: document.getElementById("slotMeshContourRefHint"),
  slotMeshLinkEdgeBtn: document.getElementById("slotMeshLinkEdgeBtn"),
  slotMeshUnlinkEdgeBtn: document.getElementById("slotMeshUnlinkEdgeBtn"),
  slotMeshApplyBtn: document.getElementById("slotMeshApplyBtn"),
  slotMeshCreateApplyBtn: document.getElementById("slotMeshCreateApplyBtn"),
  slotMeshResetBtn: document.getElementById("slotMeshResetBtn"),
  stage: document.getElementById("stage"),
  backdropCanvas: document.getElementById("backdropCanvas"),
  glCanvas: document.getElementById("glCanvas"),
  overlay: document.getElementById("overlay"),
};

const gl =
  els.glCanvas.getContext("webgl2", { alpha: true, premultipliedAlpha: false }) ||
  els.glCanvas.getContext("webgl", { alpha: true, premultipliedAlpha: false }) ||
  els.glCanvas.getContext("experimental-webgl", { alpha: true, premultipliedAlpha: false });
const backdropCtx = els.backdropCanvas ? els.backdropCanvas.getContext("2d") : null;
const overlayCtx = els.overlay.getContext("2d");
const stage2dCtx = !gl ? els.glCanvas.getContext("2d") : null;
const AUTOSAVE_STORAGE_KEY = "mesh_deformer_autosave_v1";
const AUTOSAVE_INTERVAL_MS = 15000;
const AUTOSAVE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

if (!backdropCtx || !overlayCtx || (!gl && !stage2dCtx)) {
  throw new Error("2D canvas context unavailable.");
}

const hasGL = !!gl;
const isWebGL2 = hasGL && typeof WebGL2RenderingContext !== "undefined" && gl instanceof WebGL2RenderingContext;
const hasVAO = hasGL && typeof gl.createVertexArray === "function";
const TIMELINE_MIN_STEP = 0.1;
const TIMELINE_ZOOM_MIN = 0.5;
const TIMELINE_ZOOM_MAX = 8;

// ============================================================
// SECTION: Application State
// Central state object. All persistent UI and runtime data lives here.
// ============================================================
const state = {
  sourceCanvas: null,
  texture: null,
  imageWidth: 0,
  imageHeight: 0,
  slots: [],
  activeSlot: -1,
  slotViewMode: "all",
  leftToolTab: "setup",
  leftToolTabBySystemMode: {
    setup: "setup",
    animate: "canvas",
  },
  currentSystemMode: "setup",
  workspaceMode: "rig",
  uiPage: "rig",
  animSubPanel: "timeline",
  exportPanelOpen: false,
  mesh: null,
  editMode: "skeleton",
  selectedBone: 0,
  selectedBonesForWeight: [],
  selectedBoneParts: [],
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
  objectHoverRoot: -1,
  objectScaleHoverRoot: -1,
  addBoneArmed: false,
  addBoneDraft: null,
  treeSlotDrag: null,
  treeSlotLastClickIndex: -1,
  treeSlotLastClickTs: 0,
  treeBoneLastClickIndex: -1,
  treeBoneLastClickTs: 0,
  boneTreeOnlyActiveSlot: false,
  boneTreeWorkHideMode: "bone_only",
  boneTreeSelectedUnassignedSlotIds: [],
  boneTreeSelectedSlotByBone: Object.create(null),
  boneTreeSlotCollapse: Object.create(null),
  boneTreeChildCollapse: Object.create(null),
  boneTreeAttachmentCollapse: Object.create(null),
  boneTreeInlineRename: { kind: "", index: -1 },
  boneTreeMenuOpen: false,
  boneTreeMenuContextKind: "",
  rightPropsFocus: "slot",
  rigEditPreviewWorld: null,
  rigEditPreviewInvBind: null,
  rigEditNeedsRuntimeNormalize: false,
  rigCoordinateSpace: "runtime",
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
    timelineContextMenuOpen: false,
    timelineContextTrackId: "",
    timelineContextTime: 0,
    timelineDrag: null,
    timelineMarqueeEl: null,
    timelineScaleHeld: false,
    timelineMinimized: false,
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
    timeStep: TIMELINE_MIN_STEP,
    timelineZoom: 1,
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
  view: { scale: 1, cx: 0, cy: 0, fitScale: 1, initialized: false, lastW: 0, lastH: 0, panMode: false },
  renderPerf: {
    maxPixelRatio: hasGL ? 1.5 : 2,
    needsResize: true,
    stageCssWidth: 0,
    stageCssHeight: 0,
    stagePixelRatio: 1,
    backdropSig: "",
  },
  renderLoop: {
    rafId: 0,
    requested: false,
  },
  baseImageTransform: {
    enabled: false,
    tx: 0,
    ty: 0,
    rot: 0,
    scale: 1,
  },
  drag: null,
  slotMesh: {
    activePoint: -1,
    activeSet: "contour",
    edgeSelection: [],
    edgeSelectionSet: "contour",
    selectedPoints: { contour: [], fill: [] },
    toolMode: "select",
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
    weightViz: false,
    weightVizMode: "selected",
    weightVizOpacity: 0.75,
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
  glTextureCache: hasGL ? new WeakMap() : null,
  export: {
    spineCompat: "4.2",
  },
  poseAutoRig: {
    sourceMode: "auto",
    minScore: 0.2,
    smoothing: true,
    allowFallback: true,
  },
};

// ============================================================
// SECTION: Math Utilities & Left Tool Tab Helpers
// ============================================================
const math = {
  degToRad: (d) => (d * Math.PI) / 180,
  radToDeg: (r) => (r * 180) / Math.PI,
  clamp: (v, lo, hi) => Math.max(lo, Math.min(hi, v)),
};

const LEFT_TOOL_TABS = new Set(["canvas", "setup", "rig", "object", "ik", "constraint", "path", "skin", "tools", "slotmesh"]);

function getCurrentSystemMode() {
  return els.systemMode && els.systemMode.value === "animate" ? "animate" : "setup";
}

function getDefaultLeftToolTab(systemMode = getCurrentSystemMode()) {
  return systemMode === "animate" ? "canvas" : "setup";
}

function normalizeLeftToolTab(tab, systemMode = getCurrentSystemMode()) {
  const value = typeof tab === "string" ? tab : "";
  return LEFT_TOOL_TABS.has(value) ? value : getDefaultLeftToolTab(systemMode);
}

function persistLeftToolTabForSystemMode(systemMode, tab) {
  if (systemMode !== "setup" && systemMode !== "animate") return;
  state.leftToolTabBySystemMode[systemMode] = normalizeLeftToolTab(tab, systemMode);
}

function restoreLeftToolTabForSystemMode(systemMode) {
  const mode = systemMode === "animate" ? "animate" : "setup";
  state.leftToolTab = normalizeLeftToolTab(state.leftToolTabBySystemMode[mode], mode);
  return state.leftToolTab;
}

function setLeftToolTab(tab, systemMode = getCurrentSystemMode()) {
  const next = normalizeLeftToolTab(tab, systemMode);
  state.leftToolTab = next;
  persistLeftToolTabForSystemMode(systemMode, next);
  return next;
}

function normalizeBaseImageTransform(raw) {
  const src = raw && typeof raw === "object" ? raw : {};
  const scaleRaw = Number(src.scale);
  return {
    enabled: src.enabled === true,
    tx: Number(src.tx) || 0,
    ty: Number(src.ty) || 0,
    rot: Number(src.rot) || 0,
    scale: math.clamp(Number.isFinite(scaleRaw) ? scaleRaw : 1, 0.01, 100),
  };
}

function getSlotBaseImageTransform(slot = null) {
  const targetSlot = slot || getActiveSlot();
  if (targetSlot && typeof targetSlot === "object") {
    const tr = normalizeBaseImageTransform(targetSlot.baseImageTransform);
    targetSlot.baseImageTransform = tr;
    return tr;
  }
  const fallback = normalizeBaseImageTransform(state.baseImageTransform);
  state.baseImageTransform = fallback;
  return fallback;
}

function setSlotBaseImageTransform(next, slot = null) {
  const tr = normalizeBaseImageTransform(next);
  const targetSlot = slot || getActiveSlot();
  if (targetSlot && typeof targetSlot === "object") {
    targetSlot.baseImageTransform = tr;
    return tr;
  }
  state.baseImageTransform = tr;
  return tr;
}

function isSlotMeshModeActive() {
  return state.editMode === "mesh";
}

function isSlotMeshEditTabActive() {
  return state.editMode === "mesh" && state.leftToolTab === "slotmesh" && state.uiPage !== "anim";
}

function isBaseImageEditTabActive() {
  return state.editMode === "mesh" && state.leftToolTab === "canvas";
}

function isVertexDeformInteractionActive() {
  return state.editMode === "mesh" && !isBaseImageEditTabActive() && !isSlotMeshEditTabActive();
}

function isBaseImageTransformEditable() {
  return isBaseImageEditTabActive();
}

function getSlotBaseSpaceBoneIndex(slot, m = state.mesh) {
  if (!slot || !m || !Array.isArray(m.rigBones)) return -1;
  const boneCount = m.rigBones.length;
  const mode = getSlotWeightMode(slot);
  const inf = getSlotInfluenceBones(slot, m);
  const pickDominantWeightedBone = () => {
    const sm = slot && (getActiveAttachment(slot) || {}).meshData ? (getActiveAttachment(slot) || {}).meshData : null;
    if (!sm || !sm.weights || !sm.positions) return -1;
    const vCount = Math.floor((Number(sm.positions.length) || 0) / 2);
    if (vCount <= 0) return -1;
    const weights = sm.weights;
    if ((Number(weights.length) || 0) !== vCount * boneCount) return -1;
    const candidateSet = new Set();
    if (Array.isArray(inf) && inf.length > 0) {
      for (const biRaw of inf) {
        const bi = Number(biRaw);
        if (Number.isFinite(bi) && bi >= 0 && bi < boneCount) candidateSet.add(bi);
      }
    }
    if (candidateSet.size <= 0) {
      for (let bi = 0; bi < boneCount; bi += 1) candidateSet.add(bi);
    }
    let best = -1;
    let bestSum = 1e-8;
    for (const bi of candidateSet) {
      let sum = 0;
      for (let vi = 0; vi < vCount; vi += 1) {
        sum += Number(weights[vi * boneCount + bi]) || 0;
      }
      if (sum > bestSum) {
        bestSum = sum;
        best = bi;
      }
    }
    return best;
  };
  if (mode === "weighted") {
    const dominant = pickDominantWeightedBone();
    if (dominant >= 0) return dominant;
    for (const biRaw of inf) {
      const bi = Number(biRaw);
      if (Number.isFinite(bi) && bi >= 0 && bi < boneCount) return bi;
    }
  }
  const direct = Number(slot.bone);
  if (Number.isFinite(direct) && direct >= 0 && direct < boneCount) return direct;
  for (const biRaw of inf) {
    const bi = Number(biRaw);
    if (Number.isFinite(bi) && bi >= 0 && bi < boneCount) return bi;
  }
  return -1;
}

function getSlotTreeBoneIndex(slot, m = state.mesh) {
  if (!slot || !m || !Array.isArray(m.rigBones)) return -1;
  const bi = getSlotBaseSpaceBoneIndex(slot, m);
  return Number.isFinite(bi) && bi >= 0 && bi < m.rigBones.length ? bi : -1;
}

function shouldRenderBaseImageReference() {
  // Base image is the same source used for slot binding, always visible when source exists.
  if (!state.sourceCanvas) return false;
  if (!(Number(state.imageWidth) > 0 && Number(state.imageHeight) > 0)) return false;
  return true;
}

function drawBaseImageReference2D(ctx) {
  if (!ctx || !shouldRenderBaseImageReference()) return false;
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

  const scale = Math.max(1e-6, Number(state.view.scale) || 1);
  const alpha = isBaseImageEditTabActive() ? 1 : state.slots.length > 0 ? 0.35 : 1;

  ctx.save();
  ctx.translate(state.view.cx, state.view.cy);
  ctx.scale(scale, scale);
  ctx.translate(-docW * 0.5, -docH * 0.5);
  ctx.transform(drawTm[0], drawTm[2], drawTm[1], drawTm[3], drawTm[4], drawTm[5]);
  ctx.globalAlpha = alpha;
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(state.sourceCanvas, 0, 0, docW, docH);
  ctx.restore();
  return true;
}

function refreshBaseImageTransformUI() {
  const tr = getSlotBaseImageTransform();
  const hasSource = !!state.sourceCanvas && Number(state.imageWidth) > 0 && Number(state.imageHeight) > 0;
  const editable = hasSource && isBaseImageTransformEditable();
  if (els.baseImageTx) {
    els.baseImageTx.value = String(Math.round(tr.tx));
    els.baseImageTx.disabled = !editable;
  }
  if (els.baseImageTy) {
    els.baseImageTy.value = String(Math.round(tr.ty));
    els.baseImageTy.disabled = !editable;
  }
  if (els.baseImageScale) {
    els.baseImageScale.value = String(Number(tr.scale).toFixed(3));
    els.baseImageScale.disabled = !editable;
  }
  if (els.baseImageRot) {
    els.baseImageRot.value = String(Math.round(math.radToDeg(tr.rot)));
    els.baseImageRot.disabled = !editable;
  }
  if (els.baseImageTransformResetBtn) {
    els.baseImageTransformResetBtn.disabled = !editable;
  }
  if (els.baseImageTransformHint) {
    if (!hasSource) {
      els.baseImageTransformHint.textContent = "Import image/PSD first.";
    } else if (!editable) {
      els.baseImageTransformHint.textContent = "Switch to Slot Mesh mode and open Base Transform tab to edit base image transform.";
    } else {
      els.baseImageTransformHint.textContent =
        "Setup-style base transform in owner-bone local space: directly affects bound slot rendering, not keyed in animation timeline.";
    }
  }
}

function applyBaseImageTransformFromInputs() {
  const tr = getSlotBaseImageTransform();
  tr.enabled = true;
  tr.tx = Number(els.baseImageTx && els.baseImageTx.value) || 0;
  tr.ty = Number(els.baseImageTy && els.baseImageTy.value) || 0;
  tr.scale = math.clamp(Number(els.baseImageScale && els.baseImageScale.value) || 1, 0.01, 100);
  tr.rot = math.degToRad(Number(els.baseImageRot && els.baseImageRot.value) || 0);
  setSlotBaseImageTransform(tr);
  refreshBaseImageTransformUI();
}

function syncBaseImageTransformInputs() {
  const tr = getSlotBaseImageTransform();
  if (els.baseImageTx) els.baseImageTx.value = String(Math.round(tr.tx));
  if (els.baseImageTy) els.baseImageTy.value = String(Math.round(tr.ty));
  if (els.baseImageScale) els.baseImageScale.value = String(Number(tr.scale).toFixed(3));
  if (els.baseImageRot) els.baseImageRot.value = String(Math.round(math.radToDeg(tr.rot)));
}

function syncActiveSlotTransformInputs() {
  const s = getActiveSlot();
  if (!s) return;
  if (els.slotTx) els.slotTx.value = String(Math.round(Number(s.tx) || 0));
  if (els.slotTy) els.slotTy.value = String(Math.round(Number(s.ty) || 0));
  if (els.slotRot) els.slotRot.value = String(Math.round(math.radToDeg(Number(s.rot) || 0)));
}

function isVertexWeightVizActive() {
  if (state.editMode !== "mesh") return false;
  if (state.leftToolTab !== "slotmesh") return false;
  return !!state.vertexDeform.weightViz;
}

function isCanvasTransformGizmoAllowed() {
  if (state.uiPage === "anim") return false;
  if (state.editMode === "mesh" && isVertexWeightVizActive()) return false; // Added condition
  if (state.editMode === "skeleton" && state.leftToolTab === "path") return false;
  const baseTab = isBaseImageEditTabActive();
  if (!baseTab && !state.mesh) return false;
  if (!baseTab && (state.ikPickArmed || state.parentPickArmed || state.pathEdit.drawArmed || state.addBoneArmed)) return false;
  return true;
}

function getSlotBoneOriginLocal(slot, poseWorld = null) {
  if (!slot || !state.mesh) return null;
  const bi = getSlotBaseSpaceBoneIndex(slot, state.mesh);
  if (!Number.isFinite(bi) || bi < 0) return null;
  const world = Array.isArray(poseWorld) ? poseWorld : getSolvedPoseWorld(state.mesh);
  if (!Array.isArray(world) || bi >= world.length || !world[bi]) return null;
  const p = transformPoint(world[bi], 0, 0);
  return { x: Number(p.x) || 0, y: Number(p.y) || 0 };
}

function getBaseImagePivotLocal(slot = null, poseWorld = null, docW = null, docH = null) {
  const width = Math.max(1, Number(docW) || Number(state.imageWidth) || Number(state.sourceCanvas && state.sourceCanvas.width) || 1);
  const height = Math.max(1, Number(docH) || Number(state.imageHeight) || Number(state.sourceCanvas && state.sourceCanvas.height) || 1);
  const targetSlot = slot || getActiveSlot();
  const bonePivot = getSlotBoneOriginLocal(targetSlot, poseWorld);
  if (bonePivot) return bonePivot;
  return { x: width * 0.5, y: height * 0.5 };
}

function getBaseImageSpaceWorldMatrix(slot = null, poseWorld = null, docW = null, docH = null) {
  const width = Math.max(1, Number(docW) || Number(state.imageWidth) || Number(state.sourceCanvas && state.sourceCanvas.width) || 1);
  const height = Math.max(1, Number(docH) || Number(state.imageHeight) || Number(state.sourceCanvas && state.sourceCanvas.height) || 1);
  const targetSlot = slot || getActiveSlot();
  const bi = getSlotBaseSpaceBoneIndex(targetSlot, state.mesh);
  const world = Array.isArray(poseWorld) ? poseWorld : state.mesh ? getSolvedPoseWorld(state.mesh) : null;
  if (Array.isArray(world) && Number.isFinite(bi) && bi >= 0 && bi < world.length && world[bi]) {
    return world[bi].slice(0, 6);
  }
  const pivot = getBaseImagePivotLocal(targetSlot, world, width, height);
  return matFromTR(Number(pivot.x) || width * 0.5, Number(pivot.y) || height * 0.5, 0);
}

function getBaseImageLocalTransformMatrix(slot = null) {
  const tr = getSlotBaseImageTransform(slot);
  const scale = Number(tr && tr.scale) || 1;
  const rot = Number(tr && tr.rot) || 0;
  const tx = Number(tr && tr.tx) || 0;
  const ty = Number(tr && tr.ty) || 0;
  if (Math.abs(tx) < 1e-6 && Math.abs(ty) < 1e-6 && Math.abs(rot) < 1e-6 && Math.abs(scale - 1) < 1e-6) {
    return createIdentity();
  }
  const scaleM = [scale, 0, 0, scale, 0, 0];
  return mul(matFromTR(tx, ty, rot), scaleM);
}

function transformBaseImageLocalPoint(x, y, baseMatrix) {
  return transformPoint(baseMatrix, Number(x) || 0, Number(y) || 0);
}

function getBaseImageTransformMatrix(slot = null, poseWorld = null, docW = null, docH = null) {
  if (!state.sourceCanvas) return createIdentity();
  const spaceWorld = getBaseImageSpaceWorldMatrix(slot, poseWorld, docW, docH);
  const local = getBaseImageLocalTransformMatrix(slot);
  return mul(mul(spaceWorld, local), invert(spaceWorld));
}

function worldDeltaToBaseLocal(delta, spaceWorld = null) {
  const dx = Number(delta && delta.x) || 0;
  const dy = Number(delta && delta.y) || 0;
  const space = Array.isArray(spaceWorld) ? spaceWorld : null;
  if (!space) return { x: dx, y: dy };
  const inv = invert(space);
  return {
    x: inv[0] * dx + inv[1] * dy,
    y: inv[2] * dx + inv[3] * dy,
  };
}

function getCanvasTransformGizmos(poseWorld = null) {
  const out = { slot: null, base: null };
  if (!isCanvasTransformGizmoAllowed()) return out;
  if (isBaseImageEditTabActive() && shouldRenderBaseImageReference() && isBaseImageTransformEditable()) {
    const activeSlot = getActiveSlot();
    const docW = Math.max(1, Number(state.imageWidth) || Number(state.sourceCanvas && state.sourceCanvas.width) || 1);
    const docH = Math.max(1, Number(state.imageHeight) || Number(state.sourceCanvas && state.sourceCanvas.height) || 1);
    const pivotBase = getBaseImagePivotLocal(activeSlot, poseWorld, docW, docH);

    let drawTm = getBaseImageTransformMatrix(activeSlot, poseWorld, docW, docH);
    if (state.mesh && activeSlot) {
      const bi = getSlotBaseSpaceBoneIndex(activeSlot, state.mesh);
      const invBind = getDisplayInvBind(state.mesh);
      if (Number.isFinite(bi) && bi >= 0 && Array.isArray(poseWorld) && poseWorld[bi] && invBind && invBind[bi]) {
        const delta = mul(poseWorld[bi], invBind[bi]);
        drawTm = mul(drawTm, delta);
      }
    }

    const pivotLocal = transformPoint(drawTm, Number(pivotBase.x) || 0, Number(pivotBase.y) || 0);
    const pivot = localToScreen(pivotLocal.x, pivotLocal.y);
    const cornersLocal = [
      transformBaseImageLocalPoint(0, 0, drawTm),
      transformBaseImageLocalPoint(docW, 0, drawTm),
      transformBaseImageLocalPoint(docW, docH, drawTm),
      transformBaseImageLocalPoint(0, docH, drawTm),
    ];
    const cornersScreen = cornersLocal.map((p) => localToScreen(p.x, p.y));
    const topMidScreen = {
      x: (cornersScreen[0].x + cornersScreen[1].x) * 0.5,
      y: (cornersScreen[0].y + cornersScreen[1].y) * 0.5,
    };
    const vx = topMidScreen.x - pivot.x;
    const vy = topMidScreen.y - pivot.y;
    const vLen = Math.hypot(vx, vy);
    const ux = vLen > 1e-6 ? vx / vLen : 0;
    const uy = vLen > 1e-6 ? vy / vLen : -1;
    const stemLen = 28;
    const rotateStemEnd = {
      x: topMidScreen.x + ux * stemLen,
      y: topMidScreen.y + uy * stemLen,
    };
    out.base = {
      pivotLocal,
      pivot,
      spaceWorld: getBaseImageSpaceWorldMatrix(activeSlot, poseWorld, docW, docH),
      cornersLocal,
      cornersScreen,
      cornerHandles: cornersScreen.map((p, index) => ({ x: p.x, y: p.y, size: 10, index })),
      rotateStemStart: topMidScreen,
      rotateStemEnd,
      rotateHandle: { x: rotateStemEnd.x, y: rotateStemEnd.y, r: 9 },
    };
  }
  return out;
}

function pickCanvasTransformHandle(mx, my, poseWorld = null) {
  const giz = getCanvasTransformGizmos(poseWorld);
  const local = screenToLocal(mx, my);
  const picks = [];
  const pushCirclePick = (key, handle, meta, priority) => {
    if (!handle) return;
    const dx = Number(handle.x) - mx;
    const dy = Number(handle.y) - my;
    const r = Number(handle.r) || 8;
    const d2 = dx * dx + dy * dy;
    if (d2 > r * r) return;
    picks.push({ key, h: handle, meta, priority, d2 });
  };
  const pushSquarePick = (key, handle, meta, priority) => {
    if (!handle) return;
    const half = Math.max(3, (Number(handle.size) || 10) * 0.5);
    const dx = Math.abs(Number(handle.x) - mx);
    const dy = Math.abs(Number(handle.y) - my);
    if (dx > half || dy > half) return;
    picks.push({ key, h: handle, meta, priority, d2: dx * dx + dy * dy });
  };
  if (giz.base) {
    pushCirclePick("base_rotate", giz.base.rotateHandle, giz.base, 8);
    if (Array.isArray(giz.base.cornerHandles)) {
      for (const c of giz.base.cornerHandles) {
        pushSquarePick("base_scale", c, { ...giz.base, cornerIndex: Number(c.index) || 0 }, 7);
      }
    }
    if (Array.isArray(giz.base.cornersLocal) && giz.base.cornersLocal.length >= 3 && pointInPolygon2D(local, giz.base.cornersLocal)) {
      picks.push({ key: "base_move", h: null, meta: giz.base, priority: 4, d2: 0 });
    }
  }
  let best = null;
  for (const p of picks) {
    if (!best || p.priority > best.priority || (p.priority === best.priority && p.d2 < best.d2)) {
      best = p;
    }
  }
  return best;
}

function drawCanvasTransformGizmos(ctx, poseWorld = null) {
  if (!ctx) return;
  const giz = getCanvasTransformGizmos(poseWorld);
  const drawBase = (g, color) => {
    if (!g || !Array.isArray(g.cornersScreen) || g.cornersScreen.length < 4) return;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 1.8;
    ctx.globalAlpha = 0.96;
    ctx.beginPath();
    ctx.moveTo(g.cornersScreen[0].x, g.cornersScreen[0].y);
    for (let i = 1; i < g.cornersScreen.length; i += 1) {
      ctx.lineTo(g.cornersScreen[i].x, g.cornersScreen[i].y);
    }
    ctx.closePath();
    ctx.stroke();
    if (g.rotateStemStart && g.rotateStemEnd) {
      ctx.beginPath();
      ctx.moveTo(g.rotateStemStart.x, g.rotateStemStart.y);
      ctx.lineTo(g.rotateStemEnd.x, g.rotateStemEnd.y);
      ctx.stroke();
    }
    if (Array.isArray(g.cornerHandles)) {
      for (const h of g.cornerHandles) {
        const size = Number(h.size) || 10;
        const half = size * 0.5;
        ctx.fillStyle = "rgba(24, 31, 39, 0.95)";
        ctx.fillRect(h.x - half, h.y - half, size, size);
        ctx.strokeStyle = color;
        ctx.strokeRect(h.x - half, h.y - half, size, size);
      }
    }
    if (g.rotateHandle) {
      ctx.beginPath();
      ctx.arc(g.rotateHandle.x, g.rotateHandle.y, g.rotateHandle.r || 8, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(24, 31, 39, 0.96)";
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.stroke();
    }
    ctx.fillStyle = color;
    ctx.font = "10px Segoe UI, sans-serif";
    ctx.fillText("BASE", g.cornersScreen[0].x + 8, g.cornersScreen[0].y - 10);
    ctx.restore();
  };
  drawBase(giz.base, "rgba(255, 184, 92, 0.92)");
}

function setStatus(text) {
  els.status.textContent = text;
  if (typeof requestRender === "function") requestRender("status");
}

function getRenderLoopState() {
  return state.renderLoop || (state.renderLoop = { rafId: 0, requested: false });
}

function requestRender(reason = "") {
  const loop = getRenderLoopState();
  loop.requested = true;
  if (loop.rafId) return;
  if (typeof render !== "function") return;
  loop.rafId = requestAnimationFrame(render);
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
    {
      id: "mode.mesh.canvas",
      label: "Mode: Mesh (Base Transform)",
      group: "Mode",
      hotkey: "",
      action: () => {
        setSelectValueAndTrigger(els.editMode, "mesh");
        setLeftToolTab("canvas");
        updateWorkspaceUI();
      },
    },
    { id: "mode.mesh", label: "Mode: Mesh", group: "Mode", hotkey: "", action: () => setSelectValueAndTrigger(els.editMode, "mesh") },
    { id: "mode.rig", label: "Bone Mode: Edit Rig", group: "Mode", hotkey: "", action: () => { const prevMode = state.boneMode; state.boneMode = "edit"; applyBoneModeTransition(prevMode, state.boneMode); if (els.systemMode) els.systemMode.value = "setup"; updateWorkspaceUI(); updateBoneUI(); } },
    { id: "mode.object", label: "Bone Mode: Object", group: "Mode", hotkey: "", action: () => { if (els.editMode) setSelectValueAndTrigger(els.editMode, "object"); else { const prevMode = state.boneMode; state.editMode = "object"; state.boneMode = "object"; applyBoneModeTransition(prevMode, state.boneMode); updateWorkspaceUI(); updateBoneUI(); } } },
    { id: "mode.pose", label: "Bone Mode: Pose Animate", group: "Mode", hotkey: "", action: () => { const prevMode = state.boneMode; state.boneMode = "pose"; applyBoneModeTransition(prevMode, state.boneMode); if (els.systemMode) els.systemMode.value = "animate"; if (state.mesh) { syncPoseFromRig(state.mesh); samplePoseAtTime(state.mesh, state.anim.time); } updateWorkspaceUI(); updateBoneUI(); } },
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
    { id: "key.delete", label: "Key: Delete Selected", group: "Timeline", hotkey: "Delete / K", action: () => triggerButtonAction(els.deleteKeyBtn) },
    { id: "key.cut", label: "Key: Cut", group: "Timeline", hotkey: "Ctrl/Cmd+X", action: () => triggerButtonAction(els.cutKeyBtn) },
    { id: "key.copy", label: "Key: Copy", group: "Timeline", hotkey: "Ctrl/Cmd+C", action: () => triggerButtonAction(els.copyKeyBtn) },
    { id: "key.paste", label: "Key: Paste", group: "Timeline", hotkey: "Ctrl/Cmd+V", action: () => triggerButtonAction(els.pasteKeyBtn) },
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

function sanitizeVertexFalloff(v) {
  const s = String(v || "").toLowerCase();
  return s === "linear" || s === "sharp" ? s : "smooth";
}

function sanitizeWeightVizMode(v) {
  const s = String(v || "").toLowerCase();
  return s === "dominant" ? "dominant" : "selected";
}

function sanitizePoseAutoRigSourceMode(v) {
  const s = String(v || "").toLowerCase();
  if (s === "project") return "project";
  if (s === "active_slot") return "active_slot";
  return "auto";
}

function sanitizePoseAutoRigMinScore(v) {
  const n = Number(v);
  return math.clamp(Number.isFinite(n) ? n : 0.2, 0.05, 0.95);
}

function syncPoseAutoRigOptionsToUI() {
  if (els.setupHumanoidSourceMode) {
    els.setupHumanoidSourceMode.value = sanitizePoseAutoRigSourceMode(state.poseAutoRig && state.poseAutoRig.sourceMode);
  }
  if (els.setupHumanoidMinScore) {
    const ms = sanitizePoseAutoRigMinScore(state.poseAutoRig && state.poseAutoRig.minScore);
    els.setupHumanoidMinScore.value = ms.toFixed(2);
  }
  if (els.setupHumanoidSmoothing) {
    els.setupHumanoidSmoothing.checked = state.poseAutoRig ? state.poseAutoRig.smoothing !== false : true;
  }
  if (els.setupHumanoidFallback) {
    els.setupHumanoidFallback.checked = state.poseAutoRig ? state.poseAutoRig.allowFallback !== false : true;
  }
}

function readPoseAutoRigOptionsFromUI() {
  const curr = state.poseAutoRig && typeof state.poseAutoRig === "object" ? state.poseAutoRig : {};
  const next = {
    sourceMode: sanitizePoseAutoRigSourceMode(els.setupHumanoidSourceMode ? els.setupHumanoidSourceMode.value : curr.sourceMode),
    minScore: sanitizePoseAutoRigMinScore(els.setupHumanoidMinScore ? els.setupHumanoidMinScore.value : curr.minScore),
    smoothing: els.setupHumanoidSmoothing ? !!els.setupHumanoidSmoothing.checked : curr.smoothing !== false,
    allowFallback: els.setupHumanoidFallback ? !!els.setupHumanoidFallback.checked : curr.allowFallback !== false,
  };
  state.poseAutoRig = next;
  syncPoseAutoRigOptionsToUI();
  return { ...next };
}

function bindPoseAutoRigOptionListeners() {
  if (els.setupHumanoidSourceMode && els.setupHumanoidSourceMode.dataset.poseAutoRigBound !== "1") {
    els.setupHumanoidSourceMode.dataset.poseAutoRigBound = "1";
    els.setupHumanoidSourceMode.addEventListener("change", () => {
      readPoseAutoRigOptionsFromUI();
    });
  }
  if (els.setupHumanoidMinScore && els.setupHumanoidMinScore.dataset.poseAutoRigBound !== "1") {
    els.setupHumanoidMinScore.dataset.poseAutoRigBound = "1";
    els.setupHumanoidMinScore.addEventListener("input", () => {
      readPoseAutoRigOptionsFromUI();
    });
    els.setupHumanoidMinScore.addEventListener("change", () => {
      readPoseAutoRigOptionsFromUI();
    });
  }
  if (els.setupHumanoidSmoothing && els.setupHumanoidSmoothing.dataset.poseAutoRigBound !== "1") {
    els.setupHumanoidSmoothing.dataset.poseAutoRigBound = "1";
    els.setupHumanoidSmoothing.addEventListener("change", () => {
      readPoseAutoRigOptionsFromUI();
    });
  }
  if (els.setupHumanoidFallback && els.setupHumanoidFallback.dataset.poseAutoRigBound !== "1") {
    els.setupHumanoidFallback.dataset.poseAutoRigBound = "1";
    els.setupHumanoidFallback.addEventListener("change", () => {
      readPoseAutoRigOptionsFromUI();
    });
  }
}

function setupApplicationMenuBar() {
  const bar = document.getElementById("appMenuBar");
  if (!bar) return;
  const triggers = [...bar.querySelectorAll("[data-menu-trigger]")];
  const panels = [...bar.querySelectorAll("[data-menu-panel]")];
  let openKey = "";
  const setOpen = (key = "") => {
    openKey = String(key || "");
    for (const t of triggers) {
      const k = String(t.getAttribute("data-menu-trigger") || "");
      const active = !!openKey && k === openKey;
      t.classList.toggle("active", active);
      t.setAttribute("aria-expanded", active ? "true" : "false");
    }
    for (const p of panels) {
      const k = String(p.getAttribute("data-menu-panel") || "");
      p.classList.toggle("open", !!openKey && k === openKey);
    }
  };
  const runAction = (action) => {
    const click = (el) => {
      if (el && !el.disabled) el.click();
    };
    switch (String(action || "")) {
      case "file.new":
        click(els.fileNewBtn);
        return;
      case "file.import":
        click(els.fileOpenBtn);
        return;
      case "file.save":
        click(els.fileSaveBtn);
        return;
      case "file.load":
        click(els.fileLoadBtn);
        return;
      case "file.export":
        click(els.fileExportSpineBtn);
        return;
      case "edit.undo":
        click(els.undoBtn);
        return;
      case "edit.redo":
        click(els.redoBtn);
        return;
      case "edit.palette":
        click(els.commandPaletteBtn);
        return;
      case "view.zoomin":
        click(els.viewZoomInBtn);
        return;
      case "view.zoomout":
        click(els.viewZoomOutBtn);
        return;
      case "view.zoomreset":
        click(els.viewZoomResetBtn);
        return;
      case "tools.resetpose":
        click(els.resetPoseBtn);
        return;
      case "tools.resetvertex":
        click(els.resetVertexBtn);
        return;
      case "help.quick":
        setStatus("Quick Help: File/Edit/View/Tools menus are available from the top menu bar.");
        return;
      default:
        return;
    }
  };
  for (const t of triggers) {
    t.addEventListener("click", (ev) => {
      ev.preventDefault();
      const key = String(t.getAttribute("data-menu-trigger") || "");
      if (!key) return;
      setOpen(openKey === key ? "" : key);
    });
    t.addEventListener("mouseenter", () => {
      const key = String(t.getAttribute("data-menu-trigger") || "");
      if (!openKey || !key) return;
      if (openKey !== key) setOpen(key);
    });
  }
  bar.addEventListener("click", (ev) => {
    const item = ev.target instanceof Element ? ev.target.closest("[data-menu-action]") : null;
    if (!item) return;
    ev.preventDefault();
    const action = String(item.getAttribute("data-menu-action") || "");
    if (!action) return;
    setOpen("");
    runAction(action);
  });
  document.addEventListener("pointerdown", (ev) => {
    const target = ev.target;
    if (!(target instanceof Element)) {
      setOpen("");
      return;
    }
    if (target.closest("#appMenuBar")) return;
    setOpen("");
  });
  window.addEventListener("blur", () => {
    setOpen("");
  });
  window.addEventListener("keydown", (ev) => {
    if (String(ev.key || "").toLowerCase() === "escape" && openKey) setOpen("");
  });
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
  if (els.vertexWeightVizToggle) els.vertexWeightVizToggle.checked = !!state.vertexDeform.weightViz;
  if (els.vertexWeightVizMode) els.vertexWeightVizMode.value = sanitizeWeightVizMode(state.vertexDeform.weightVizMode);
  if (els.vertexWeightVizOpacity) els.vertexWeightVizOpacity.value = String((Number(state.vertexDeform.weightVizOpacity) || 0.75).toFixed(2));
  if (els.vertexProportionalRadius) els.vertexProportionalRadius.value = String(Math.round(state.vertexDeform.radius));
  if (els.vertexProportionalFalloff) els.vertexProportionalFalloff.value = sanitizeVertexFalloff(state.vertexDeform.falloff);
  if (els.vertexWeightVizMode) els.vertexWeightVizMode.disabled = !state.vertexDeform.weightViz;
  if (els.vertexWeightVizOpacity) els.vertexWeightVizOpacity.disabled = !state.vertexDeform.weightViz;
  if (els.vertexDeformTools) {
    const show = state.editMode === "mesh" && (state.uiPage === "rig" || state.uiPage === "anim");
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
    screen = geom.screen || ((getActiveAttachment(slot) || {}).meshData && (getActiveAttachment(slot) || {}).meshData.deformedScreen) || null;
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
    const slot = getActiveSlot();
    const slotId = slot && slot.id != null ? String(slot.id) : String(Number(state.activeSlot));
    const attName = slot ? String(getSlotCurrentAttachmentName(slot) || "__none__") : "__none__";
    return `slot:${slotId}:attachment:${attName}`;
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
    const screen = geom.screen || ((getActiveAttachment(slot) || {}).meshData && (getActiveAttachment(slot) || {}).meshData.deformedScreen) || m.deformedScreen || null;
    const indices = ((getActiveAttachment(slot) || {}).meshData && (getActiveAttachment(slot) || {}).meshData.indices) || m.indices || null;
    return { screen, indices, vCount: screen ? Math.floor(screen.length / 2) : 0 };
  }
  const screen = m.deformedScreen || null;
  return { screen, indices: m.indices || null, vCount: screen ? Math.floor(screen.length / 2) : 0 };
}

function getActiveVertexBasePositions(m = state.mesh) {
  if (!m) return null;
  if (state.slots.length > 0) {
    const slot = getActiveSlot();
    if (!slot || !(getActiveAttachment(slot) || {}).meshData || !(getActiveAttachment(slot) || {}).meshData.positions) return null;
    return (getActiveAttachment(slot) || {}).meshData.positions;
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

function getHeatmapColorParts(t) {
  const u = math.clamp(Number(t) || 0, 0, 1);
  const stops = [
    { t: 0.0, c: [34, 54, 186] },
    { t: 0.2, c: [52, 136, 255] },
    { t: 0.42, c: [44, 214, 176] },
    { t: 0.68, c: [237, 220, 72] },
    { t: 1.0, c: [236, 74, 54] },
  ];
  let a = stops[0];
  let b = stops[stops.length - 1];
  for (let i = 0; i < stops.length - 1; i += 1) {
    if (u >= stops[i].t && u <= stops[i + 1].t) {
      a = stops[i];
      b = stops[i + 1];
      break;
    }
  }
  const span = Math.max(1e-6, b.t - a.t);
  const f = math.clamp((u - a.t) / span, 0, 1);
  const lerp = (x, y) => Math.round(x + (y - x) * f);
  return {
    r: lerp(a.c[0], b.c[0]),
    g: lerp(a.c[1], b.c[1]),
    b: lerp(a.c[2], b.c[2]),
    value: u,
  };
}

function getHeatmapColor(t) {
  const parts = getHeatmapColorParts(t);
  return `rgba(${parts.r}, ${parts.g}, ${parts.b}, ${0.2 + 0.65 * parts.value})`;
}

function getHeatmapColorWithAlpha(t, alphaScale = 1) {
  const parts = getHeatmapColorParts(t);
  const scale = Number(alphaScale) || 0;
  if (scale <= 0) return `rgba(${parts.r}, ${parts.g}, ${parts.b}, 0)`;
  const a = math.clamp((0.2 + 0.65 * parts.value) * scale, 0.05, 1);
  return `rgba(${parts.r}, ${parts.g}, ${parts.b}, ${a})`;
}

function getBoneVizColorParts(index, strength = 1) {
  const i = Number(index);
  const s = math.clamp(Number(strength) || 0, 0, 1);
  return {
    h: ((Number.isFinite(i) ? i : 0) * 57) % 360,
    s: Math.round(62 + 30 * s),
    l: Math.round(42 + 16 * s),
  };
}

function getBoneVizColor(index, alpha = 0.72, strength = 1) {
  const parts = getBoneVizColorParts(index, strength);
  const a = math.clamp(Number(alpha) || 0.72, 0, 1);
  return `hsla(${parts.h}, ${parts.s}%, ${parts.l}%, ${a})`;
}

function getWeightOverlayVertexInfo(weights, vertexIndex, boneCount, selectedBone) {
  let domBone = 0;
  let domW = -1;
  let selectedW = 0;
  for (let b = 0; b < boneCount; b += 1) {
    const w = Number(weights[vertexIndex * boneCount + b]) || 0;
    if (w > domW) {
      domW = w;
      domBone = b;
    }
    if (b === selectedBone) selectedW = w;
  }
  return {
    domBone,
    domW: math.clamp(domW, 0, 1),
    selectedW: math.clamp(selectedW, 0, 1),
  };
}

function drawWeightTriangleGradient(ctx, points, paints, baseFillStyle) {
  if (!ctx || !Array.isArray(points) || points.length !== 3 || !Array.isArray(paints) || paints.length !== 3) return;
  const minX = Math.min(points[0].x, points[1].x, points[2].x);
  const minY = Math.min(points[0].y, points[1].y, points[2].y);
  const maxX = Math.max(points[0].x, points[1].x, points[2].x);
  const maxY = Math.max(points[0].y, points[1].y, points[2].y);
  if (!Number.isFinite(minX) || !Number.isFinite(minY) || !Number.isFinite(maxX) || !Number.isFinite(maxY)) return;
  const w = maxX - minX;
  const h = maxY - minY;
  if (w < 1 || h < 1) return;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  ctx.lineTo(points[1].x, points[1].y);
  ctx.lineTo(points[2].x, points[2].y);
  ctx.closePath();
  ctx.clip();
  ctx.fillStyle = baseFillStyle;
  ctx.fillRect(minX, minY, w, h);
  for (let i = 0; i < 3; i += 1) {
    const p = points[i];
    const a = points[(i + 1) % 3];
    const b = points[(i + 2) % 3];
    const radius = Math.max(18, Math.max(Math.hypot(p.x - a.x, p.y - a.y), Math.hypot(p.x - b.x, p.y - b.y)) * 0.95);
    const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
    g.addColorStop(0, paints[i].hot);
    g.addColorStop(0.58, paints[i].mid);
    g.addColorStop(1, paints[i].soft);
    ctx.fillStyle = g;
    ctx.fillRect(minX, minY, w, h);
  }
  ctx.restore();
}

function drawWeightOverlayLegend(ctx, mode, selectedBone, selectedValid, m, alphaBase) {
  if (!ctx) return;
  const x = 14;
  const y = 44;
  const w = 172;
  const h = 12;
  ctx.save();
  ctx.fillStyle = "rgba(8, 13, 20, 0.82)";
  ctx.fillRect(x - 8, y - 20, w + 16, 54);
  ctx.strokeStyle = "rgba(160, 176, 194, 0.28)";
  ctx.lineWidth = 1;
  ctx.strokeRect(x - 8, y - 20, w + 16, 54);
  ctx.font = "12px Segoe UI, sans-serif";
  ctx.fillStyle = "rgba(235,245,255,0.96)";
  if (mode === "dominant" || !selectedValid) {
    ctx.fillText("Weight Gradient: Dominant Bone", x, y - 8);
  } else {
    const name =
      Number.isFinite(selectedBone) &&
      selectedBone >= 0 &&
      selectedBone < m.rigBones.length &&
      m.rigBones[selectedBone]
        ? String(m.rigBones[selectedBone].name || `bone_${selectedBone}`)
        : "None";
    ctx.fillText(`Weight Gradient: ${name}`, x, y - 8);
  }
  const g = ctx.createLinearGradient(x, y, x + w, y);
  for (let i = 0; i <= 8; i += 1) {
    const t = i / 8;
    g.addColorStop(t, getHeatmapColorWithAlpha(t, Math.max(0.9, alphaBase)));
  }
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = "rgba(255,255,255,0.24)";
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, w, h);
  ctx.fillStyle = "rgba(215, 226, 237, 0.92)";
  ctx.fillText("0.0", x, y + 25);
  ctx.fillText("1.0", x + w - 18, y + 25);
  ctx.restore();
}

function drawWeightMeshOutline(ctx, meshData, screenPoints) {
  if (!ctx || !meshData || !screenPoints) return;
  const idx = meshData.indices;
  if (!Array.isArray(idx) && !(idx && typeof idx.length === "number")) return;
  if (!idx || idx.length < 3) return;
  ctx.save();
  ctx.strokeStyle = "rgba(245, 249, 255, 0.22)";
  ctx.lineWidth = 1;
  for (let t = 0; t + 2 < idx.length; t += 3) {
    const i0 = Number(idx[t]);
    const i1 = Number(idx[t + 1]);
    const i2 = Number(idx[t + 2]);
    if (!Number.isFinite(i0) || !Number.isFinite(i1) || !Number.isFinite(i2)) continue;
    ctx.beginPath();
    ctx.moveTo(Number(screenPoints[i0 * 2]) || 0, Number(screenPoints[i0 * 2 + 1]) || 0);
    ctx.lineTo(Number(screenPoints[i1 * 2]) || 0, Number(screenPoints[i1 * 2 + 1]) || 0);
    ctx.lineTo(Number(screenPoints[i2 * 2]) || 0, Number(screenPoints[i2 * 2 + 1]) || 0);
    ctx.closePath();
    ctx.stroke();
  }
  ctx.restore();
}

function getMeshTriangleIndexArray(meshData) {
  const idx = meshData && meshData.indices;
  if (Array.isArray(idx)) return idx;
  if (idx instanceof Uint16Array || idx instanceof Uint32Array || idx instanceof Int32Array) return idx;
  if (idx && typeof idx.length === "number") return idx;
  return null;
}

function drawWeightOverlayForMesh(ctx, m, meshData, screenPoints) {
  if (!ctx || !m || !meshData || !screenPoints) return;
  const weights = meshData.weights;
  const boneCount = Array.isArray(m.rigBones) ? m.rigBones.length : 0;
  const vCount = Math.floor((Number(screenPoints.length) || 0) / 2);
  if (!weights || boneCount <= 0 || vCount <= 0 || weights.length !== vCount * boneCount) return;
  const mode = sanitizeWeightVizMode(state.vertexDeform.weightVizMode);
  const alphaBase = math.clamp(Number(state.vertexDeform.weightVizOpacity) || 0.75, 0.05, 1);
  const selectedBone = getPrimarySelectedBoneIndex();
  const selectedValid = Number.isFinite(selectedBone) && selectedBone >= 0 && selectedBone < boneCount;
  const vertexInfos = new Array(vCount);
  for (let i = 0; i < vCount; i += 1) {
    vertexInfos[i] = getWeightOverlayVertexInfo(weights, i, boneCount, selectedBone);
  }
  drawWeightMeshOutline(ctx, meshData, screenPoints);
  const triIndices = getMeshTriangleIndexArray(meshData);
  if (triIndices && triIndices.length >= 3) {
    for (let t = 0; t + 2 < triIndices.length; t += 3) {
      const i0 = Number(triIndices[t]);
      const i1 = Number(triIndices[t + 1]);
      const i2 = Number(triIndices[t + 2]);
      if (!Number.isFinite(i0) || !Number.isFinite(i1) || !Number.isFinite(i2)) continue;
      if (i0 < 0 || i1 < 0 || i2 < 0 || i0 >= vCount || i1 >= vCount || i2 >= vCount) continue;
      const infos = [vertexInfos[i0], vertexInfos[i1], vertexInfos[i2]];
      const pts = [
        { x: Number(screenPoints[i0 * 2]) || 0, y: Number(screenPoints[i0 * 2 + 1]) || 0 },
        { x: Number(screenPoints[i1 * 2]) || 0, y: Number(screenPoints[i1 * 2 + 1]) || 0 },
        { x: Number(screenPoints[i2 * 2]) || 0, y: Number(screenPoints[i2 * 2 + 1]) || 0 },
      ];
      let paints;
      let baseFillStyle;
      if (mode === "dominant" || !selectedValid) {
        const triScores = new Map();
        let triBone = infos[0].domBone;
        let triScore = -1;
        let avgStrength = 0;
        for (const info of infos) {
          const next = (triScores.get(info.domBone) || 0) + info.domW;
          triScores.set(info.domBone, next);
          if (next > triScore) {
            triScore = next;
            triBone = info.domBone;
          }
          avgStrength += info.domW;
        }
        avgStrength /= 3;
        paints = infos.map((info) => ({
          hot: getBoneVizColor(info.domBone, alphaBase * (0.62 + 0.28 * info.domW), info.domW),
          mid: getBoneVizColor(info.domBone, alphaBase * (0.34 + 0.22 * info.domW), info.domW),
          soft: getBoneVizColor(info.domBone, 0, info.domW),
        }));
        baseFillStyle = getBoneVizColor(triBone, alphaBase * (0.18 + 0.22 * avgStrength), avgStrength);
      } else {
        const avgWeight = (infos[0].selectedW + infos[1].selectedW + infos[2].selectedW) / 3;
        paints = infos.map((info) => ({
          hot: getHeatmapColorWithAlpha(info.selectedW, alphaBase * 1.12),
          mid: getHeatmapColorWithAlpha(info.selectedW, alphaBase * 0.5),
          soft: getHeatmapColorWithAlpha(info.selectedW, 0),
        }));
        baseFillStyle = getHeatmapColorWithAlpha(avgWeight, alphaBase * 0.42);
      }
      drawWeightTriangleGradient(ctx, pts, paints, baseFillStyle);
    }
  }
  for (let i = 0; i < vCount; i += 1) {
    const info = vertexInfos[i];
    const sx = Number(screenPoints[i * 2]) || 0;
    const sy = Number(screenPoints[i * 2 + 1]) || 0;
    if (mode === "dominant" || !selectedValid) {
      const a = alphaBase * (0.14 + 0.42 * info.domW);
      ctx.fillStyle = getBoneVizColor(info.domBone, a, info.domW);
    } else {
      ctx.fillStyle = getHeatmapColorWithAlpha(info.selectedW, alphaBase * 0.75);
    }
    ctx.beginPath();
    ctx.arc(sx, sy, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }
  drawWeightOverlayLegend(ctx, mode, selectedBone, selectedValid, m, alphaBase);
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

// ============================================================
// SECTION: UI Refresh — Mode & Workspace
// refreshContextUI: called on systemMode change (setup↔animate).
// updateWorkspaceUI / refreshWorkspacePageUI: full UI state sync,
//   controls workspace tab active state, left panel tab visibility,
//   timeline/layer/state dock visibility.
// ============================================================
function refreshContextUI() {
  const prevMode = state.boneMode;
  const isSetup = els.systemMode && els.systemMode.value === "setup";
  const isAnim = !isSetup;

  // Workspace tabs are always visible; active state is set in refreshWorkspacePageUI.

  if (isAnim) {
    if (state.leftToolTab === "canvas" || state.leftToolTab === "setup" || state.leftToolTab === "rig") {
      switchLeftToolTab("object");
    }
    // Setup Internal logic for Pose / Object mode
    if (state.editMode === "object") {
      state.boneMode = "object";
    } else if (state.editMode === "skeleton") {
      state.boneMode = "pose";
    }
  } else {
    if (state.leftToolTab === "object" || state.leftToolTab === "animate") {
      switchLeftToolTab("canvas");
    }
    // Setup Internal logic for Rig / Object mode
    if (state.editMode === "object") {
      state.boneMode = "object";
    } else if (state.editMode === "skeleton") {
      state.boneMode = "edit";
    }
  }
  applyBoneModeTransition(prevMode, state.boneMode);
}
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
  if (typeof b.workHidden !== "boolean") b.workHidden = false;
  if (typeof b.workHideSlots !== "boolean") b.workHideSlots = false;
  if (typeof b.animHidden !== "boolean") b.animHidden = false;
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

const POSE_AUTO_RIG_RUNTIME_CANDIDATES = [
  {
    key: "mediapipe-local",
    runtime: "mediapipe",
    label: "MediaPipe local",
    solutionPath: "./vendor/mediapipe/pose",
    scriptUrls: [
      "./vendor/pose-runtime/tfjs-core.js",
      "./vendor/pose-runtime/tfjs-converter.js",
      "./vendor/pose-runtime/tfjs-backend-webgl.js",
      "./vendor/mediapipe/pose/pose.js",
      "./vendor/pose-runtime/pose-detection.js",
    ],
  },
  {
    key: "mediapipe-cdn",
    runtime: "mediapipe",
    label: "MediaPipe CDN",
    solutionPath: "https://cdn.jsdelivr.net/npm/@mediapipe/pose",
    scriptUrls: [
      "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-core",
      "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-converter",
      "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-webgl",
      "https://cdn.jsdelivr.net/npm/@mediapipe/pose",
      "https://cdn.jsdelivr.net/npm/@tensorflow-models/pose-detection",
    ],
  },
  {
    key: "tfjs-local",
    runtime: "tfjs",
    label: "TFJS local",
    scriptUrls: [
      "./vendor/pose-runtime/tfjs-core.js",
      "./vendor/pose-runtime/tfjs-converter.js",
      "./vendor/pose-runtime/tfjs-backend-webgl.js",
      "./vendor/pose-runtime/pose-detection.js",
    ],
  },
  {
    key: "tfjs-cdn",
    runtime: "tfjs",
    label: "TFJS CDN",
    scriptUrls: [
      "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-core",
      "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-converter",
      "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-webgl",
      "https://cdn.jsdelivr.net/npm/@tensorflow-models/pose-detection",
    ],
  },
];

const BLAZEPOSE_KP = Object.freeze({
  nose: 0,
  left_ear: 7,
  right_ear: 8,
  mouth_left: 9,
  mouth_right: 10,
  left_shoulder: 11,
  right_shoulder: 12,
  left_elbow: 13,
  right_elbow: 14,
  left_wrist: 15,
  right_wrist: 16,
  left_pinky: 17,
  right_pinky: 18,
  left_index: 19,
  right_index: 20,
  left_thumb: 21,
  right_thumb: 22,
  left_hip: 23,
  right_hip: 24,
  left_knee: 25,
  right_knee: 26,
  left_ankle: 27,
  right_ankle: 28,
  left_heel: 29,
  right_heel: 30,
  left_foot_index: 31,
  right_foot_index: 32,
});

let poseAutoRigDepsPromise = null;
let poseAutoRigDetectorPromise = null;
let poseAutoRigDetector = null;
let poseAutoRigDetectorConfigKey = "";
let poseAutoRigRuntimeInfo = null;
let poseAutoRigBusy = false;

function loadExternalScriptOnce(url) {
  return new Promise((resolve, reject) => {
    if (!url) {
      reject(new Error("Invalid script url."));
      return;
    }
    const existing = [...document.querySelectorAll("script[src]")].find((s) => String(s.src || "") === url || String(s.getAttribute("src") || "") === url);
    if (existing) {
      if (existing.dataset.loaded === "1") {
        resolve();
        return;
      }
      const looksReady =
        (url.includes("pose-detection") && !!window.poseDetection) ||
        (url.includes("tfjs") && !!window.tf);
      if (looksReady) {
        existing.dataset.loaded = "1";
        resolve();
        return;
      }
      existing.addEventListener("load", () => {
        existing.dataset.loaded = "1";
        resolve();
      }, { once: true });
      existing.addEventListener("error", () => reject(new Error(`Failed to load script: ${url}`)), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = url;
    script.async = false;
    script.defer = false;
    script.dataset.poseAutoRig = "1";
    script.addEventListener("load", () => {
      script.dataset.loaded = "1";
      resolve();
    }, { once: true });
    script.addEventListener("error", () => reject(new Error(`Failed to load script: ${url}`)), { once: true });
    document.head.appendChild(script);
  });
}

async function ensurePoseAutoRigRuntime() {
  if (poseAutoRigRuntimeInfo) return poseAutoRigRuntimeInfo;
  if (!poseAutoRigDepsPromise) {
    poseAutoRigDepsPromise = (async () => {
      const errors = [];
      for (const candidate of POSE_AUTO_RIG_RUNTIME_CANDIDATES) {
        try {
          for (const url of candidate.scriptUrls) {
            await loadExternalScriptOnce(url);
          }
          if (!window.poseDetection) throw new Error("pose-detection library is unavailable.");
          if (candidate.runtime === "mediapipe") {
            const hasPoseCtor = typeof window.Pose === "function" || !!(window.pose && typeof window.pose.Pose === "function");
            if (!hasPoseCtor) throw new Error("MediaPipe Pose runtime is unavailable.");
            if (!window.tf) throw new Error("TensorFlow.js runtime is unavailable.");
            poseAutoRigRuntimeInfo = candidate;
            return candidate;
          }
          if (!window.tf) throw new Error("TensorFlow.js runtime is unavailable.");
          if (typeof window.tf.ready === "function") {
            try {
              if (typeof window.tf.setBackend === "function") {
                try {
                  await window.tf.setBackend("webgl");
                } catch {
                  // Keep default backend.
                }
              }
              await window.tf.ready();
            } catch {
              // Continue; detector init will report final failure if runtime is still invalid.
            }
          }
          poseAutoRigRuntimeInfo = candidate;
          return candidate;
        } catch (err) {
          errors.push(`${candidate.label}: ${(err && err.message) || "unknown error"}`);
        }
      }
      throw new Error(
        `Pose runtime is unavailable. Tried local vendor files and CDN fallbacks. ${errors.join(" | ")}`
      );
    })().catch((err) => {
      poseAutoRigDepsPromise = null;
      poseAutoRigRuntimeInfo = null;
      throw err;
    });
  }
  return poseAutoRigDepsPromise;
}

async function ensurePoseAutoRigDetector(options = null) {
  const opts = options && typeof options === "object" ? options : {};
  const smoothing = opts.smoothing !== false;
  const runtimeInfo = await ensurePoseAutoRigRuntime();
  const runtimeKey = runtimeInfo && runtimeInfo.key ? runtimeInfo.key : "unknown";
  const detectorKey = `${runtimeKey}:smooth:${smoothing ? 1 : 0}`;
  if (poseAutoRigDetector && poseAutoRigDetectorConfigKey === detectorKey) return poseAutoRigDetector;
  if (poseAutoRigDetector && poseAutoRigDetectorConfigKey !== detectorKey) {
    try {
      if (typeof poseAutoRigDetector.dispose === "function") poseAutoRigDetector.dispose();
    } catch {
      // ignore dispose errors
    }
    poseAutoRigDetector = null;
    poseAutoRigDetectorPromise = null;
    poseAutoRigDetectorConfigKey = "";
  }
  await ensurePoseAutoRigRuntime();
  if (!poseAutoRigDetectorPromise) {
    poseAutoRigDetectorPromise = (async () => {
      const pd = window.poseDetection;
      if (!pd || !pd.SupportedModels || !pd.SupportedModels.BlazePose) {
        throw new Error("BlazePose runtime not found.");
      }
      const config = runtimeInfo && runtimeInfo.runtime === "mediapipe"
        ? {
          runtime: "mediapipe",
          enableSmoothing: smoothing,
          modelType: "heavy",
          solutionPath: runtimeInfo.solutionPath,
        }
        : {
          runtime: "tfjs",
          enableSmoothing: smoothing,
          modelType: "heavy",
        };
      const detector = await pd.createDetector(pd.SupportedModels.BlazePose, config);
      poseAutoRigDetector = detector;
      poseAutoRigDetectorConfigKey = detectorKey;
      return detector;
    })().catch((err) => {
      poseAutoRigDetectorPromise = null;
      throw err;
    });
  }
  return poseAutoRigDetectorPromise;
}

function getPoseAutoRigInputSource(sourceModeRaw = null) {
  const sourceMode = sanitizePoseAutoRigSourceMode(
    sourceModeRaw == null ? (state.poseAutoRig && state.poseAutoRig.sourceMode) : sourceModeRaw
  );
  const allowProject = sourceMode === "auto" || sourceMode === "project";
  const allowSlot = sourceMode === "auto" || sourceMode === "active_slot";
  if (allowProject && state.sourceCanvas && state.imageWidth > 0 && state.imageHeight > 0) {
    return {
      source: state.sourceCanvas,
      mapPoint: (p) => ({ x: Number(p.x) || 0, y: Number(p.y) || 0 }),
      docW: state.imageWidth,
      docH: state.imageHeight,
    };
  }
  if (!allowSlot) return null;
  const slot = getActiveSlot() || state.slots.find((s) => !!getSlotCanvas(s));
  if (!slot || !(getActiveAttachment(slot) || {}).canvas) return null;
  const rect = (getActiveAttachment(slot) || {}).rect || { x: 0, y: 0, w: (getActiveAttachment(slot) || {}).canvas.width, h: (getActiveAttachment(slot) || {}).canvas.height };
  const rw = Math.max(1, Number(rect.w) || (getActiveAttachment(slot) || {}).canvas.width || 1);
  const rh = Math.max(1, Number(rect.h) || (getActiveAttachment(slot) || {}).canvas.height || 1);
  const sx = rw / Math.max(1, Number((getActiveAttachment(slot) || {}).canvas.width) || 1);
  const sy = rh / Math.max(1, Number((getActiveAttachment(slot) || {}).canvas.height) || 1);
  return {
    source: (getActiveAttachment(slot) || {}).canvas,
    mapPoint: (p) => ({
      x: (Number(rect.x) || 0) + (Number(p.x) || 0) * sx,
      y: (Number(rect.y) || 0) + (Number(p.y) || 0) * sy,
    }),
    docW: Math.max(1, Number(state.imageWidth) || rw),
    docH: Math.max(1, Number(state.imageHeight) || rh),
  };
}

function pointLerp(a, b, t) {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

function pointMid(a, b) {
  return { x: (a.x + b.x) * 0.5, y: (a.y + b.y) * 0.5 };
}

function pointAdd(a, vx, vy, scale = 1) {
  return { x: a.x + vx * scale, y: a.y + vy * scale };
}

function pointDist(a, b) {
  return Math.hypot((b.x || 0) - (a.x || 0), (b.y || 0) - (a.y || 0));
}

function normalizeVec(dx, dy, fallbackX = 1, fallbackY = 0) {
  const len = Math.hypot(dx, dy);
  if (len <= 1e-6) {
    const fLen = Math.hypot(fallbackX, fallbackY) || 1;
    return { x: fallbackX / fLen, y: fallbackY / fLen };
  }
  return { x: dx / len, y: dy / len };
}

function averagePoints(points) {
  let sx = 0;
  let sy = 0;
  let count = 0;
  for (const p of Array.isArray(points) ? points : []) {
    if (!p || !Number.isFinite(p.x) || !Number.isFinite(p.y)) continue;
    sx += p.x;
    sy += p.y;
    count += 1;
  }
  if (count <= 0) return null;
  return { x: sx / count, y: sy / count };
}

function getPosePointByIndex(pose, idx, mapPoint, minScore = 0.2) {
  const list = Array.isArray(pose && pose.keypoints) ? pose.keypoints : [];
  const kp = list[idx];
  if (!kp) return null;
  const score = Number(kp.score);
  if (Number.isFinite(score) && score < minScore) return null;
  const x = Number(kp.x);
  const y = Number(kp.y);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  const mapped = typeof mapPoint === "function" ? mapPoint({ x, y }) : { x, y };
  if (!mapped || !Number.isFinite(mapped.x) || !Number.isFinite(mapped.y)) return null;
  return { x: mapped.x, y: mapped.y };
}

function buildHumanoidTemplateFromPose(pose, mapPoint, docW, docH, options = null) {
  const opts = options && typeof options === "object" ? options : {};
  const minScore = sanitizePoseAutoRigMinScore(opts.minScore);
  const allowFallback = opts.allowFallback !== false;
  const p = (idx) => getPosePointByIndex(pose, idx, mapPoint, minScore);
  const pick = (primary, fallback) => (primary ? primary : allowFallback ? fallback : null);
  const lShoulder = p(BLAZEPOSE_KP.left_shoulder);
  const rShoulder = p(BLAZEPOSE_KP.right_shoulder);
  const lHip = p(BLAZEPOSE_KP.left_hip);
  const rHip = p(BLAZEPOSE_KP.right_hip);
  if (!lShoulder || !rShoulder || !lHip || !rHip) return null;

  const shoulderMid = pointMid(lShoulder, rShoulder);
  const hipMid = pointMid(lHip, rHip);
  const torsoVec = normalizeVec(shoulderMid.x - hipMid.x, shoulderMid.y - hipMid.y, 0, -1);
  const down = { x: -torsoVec.x, y: -torsoVec.y };
  const sideRight = { x: -torsoVec.y, y: torsoVec.x };
  const sideLeft = { x: -sideRight.x, y: -sideRight.y };
  const shoulderWidth = Math.max(8, pointDist(lShoulder, rShoulder));
  const torsoLen = Math.max(16, pointDist(hipMid, shoulderMid));

  const spine0Tip = pointLerp(hipMid, shoulderMid, 1 / 3);
  const spine1Tip = pointLerp(hipMid, shoulderMid, 2 / 3);
  const spine2Tip = { x: shoulderMid.x, y: shoulderMid.y };

  const headRef =
    p(BLAZEPOSE_KP.nose) ||
    averagePoints([p(BLAZEPOSE_KP.left_ear), p(BLAZEPOSE_KP.right_ear)]) ||
    averagePoints([p(BLAZEPOSE_KP.mouth_left), p(BLAZEPOSE_KP.mouth_right)]) ||
    (allowFallback ? pointAdd(spine2Tip, torsoVec.x, torsoVec.y, torsoLen * 0.35) : null);
  if (!headRef) return null;
  const neckTip = pointLerp(spine2Tip, headRef, 0.38);
  const headDir = normalizeVec(headRef.x - neckTip.x, headRef.y - neckTip.y, torsoVec.x, torsoVec.y);
  const headLen = Math.max(18, shoulderWidth * 0.42, torsoLen * 0.24);
  const headTip = pointAdd(neckTip, headDir.x, headDir.y, headLen);

  const lElbow = pick(p(BLAZEPOSE_KP.left_elbow), pointAdd(lShoulder, sideLeft.x + down.x * 0.4, sideLeft.y + down.y * 0.4, shoulderWidth * 0.5));
  const lWrist = lElbow ? pick(p(BLAZEPOSE_KP.left_wrist), pointAdd(lElbow, sideLeft.x + down.x * 0.25, sideLeft.y + down.y * 0.25, shoulderWidth * 0.55)) : null;
  if (!lElbow || !lWrist) return null;
  const lHandRef = averagePoints([p(BLAZEPOSE_KP.left_pinky), p(BLAZEPOSE_KP.left_index), p(BLAZEPOSE_KP.left_thumb)]);
  const lForeDir = normalizeVec(lWrist.x - lElbow.x, lWrist.y - lElbow.y, sideLeft.x, sideLeft.y);
  const lHand = lHandRef || (allowFallback ? pointAdd(lWrist, lForeDir.x, lForeDir.y, Math.max(12, shoulderWidth * 0.22)) : null);
  if (!lHand) return null;

  const rElbow = pick(p(BLAZEPOSE_KP.right_elbow), pointAdd(rShoulder, sideRight.x + down.x * 0.4, sideRight.y + down.y * 0.4, shoulderWidth * 0.5));
  const rWrist = rElbow ? pick(p(BLAZEPOSE_KP.right_wrist), pointAdd(rElbow, sideRight.x + down.x * 0.25, sideRight.y + down.y * 0.25, shoulderWidth * 0.55)) : null;
  if (!rElbow || !rWrist) return null;
  const rHandRef = averagePoints([p(BLAZEPOSE_KP.right_pinky), p(BLAZEPOSE_KP.right_index), p(BLAZEPOSE_KP.right_thumb)]);
  const rForeDir = normalizeVec(rWrist.x - rElbow.x, rWrist.y - rElbow.y, sideRight.x, sideRight.y);
  const rHand = rHandRef || (allowFallback ? pointAdd(rWrist, rForeDir.x, rForeDir.y, Math.max(12, shoulderWidth * 0.22)) : null);
  if (!rHand) return null;

  const lKnee = pick(p(BLAZEPOSE_KP.left_knee), pointAdd(lHip, down.x, down.y, torsoLen * 0.58));
  const lAnkle = lKnee ? pick(p(BLAZEPOSE_KP.left_ankle), pointAdd(lKnee, down.x, down.y, torsoLen * 0.55)) : null;
  if (!lKnee || !lAnkle) return null;
  const lToe = p(BLAZEPOSE_KP.left_foot_index);
  const lHeel = p(BLAZEPOSE_KP.left_heel);
  const lFoot =
    lToe ||
    (lHeel
      ? pointAdd(lHeel, sideLeft.x, sideLeft.y, Math.max(12, shoulderWidth * 0.2))
      : allowFallback
        ? pointAdd(lAnkle, sideLeft.x + down.x * 0.08, sideLeft.y + down.y * 0.08, Math.max(12, shoulderWidth * 0.2))
        : null);
  if (!lFoot) return null;

  const rKnee = pick(p(BLAZEPOSE_KP.right_knee), pointAdd(rHip, down.x, down.y, torsoLen * 0.58));
  const rAnkle = rKnee ? pick(p(BLAZEPOSE_KP.right_ankle), pointAdd(rKnee, down.x, down.y, torsoLen * 0.55)) : null;
  if (!rKnee || !rAnkle) return null;
  const rToe = p(BLAZEPOSE_KP.right_foot_index);
  const rHeel = p(BLAZEPOSE_KP.right_heel);
  const rFoot =
    rToe ||
    (rHeel
      ? pointAdd(rHeel, sideRight.x, sideRight.y, Math.max(12, shoulderWidth * 0.2))
      : allowFallback
        ? pointAdd(rAnkle, sideRight.x + down.x * 0.08, sideRight.y + down.y * 0.08, Math.max(12, shoulderWidth * 0.2))
        : null);
  if (!rFoot) return null;

  const cx = Math.max(1, Number(docW) || 1) * 0.5;
  const cy = Math.max(1, Number(docH) || 1) * 0.5;
  const safe = (pt, fallback = { x: cx, y: cy }) => ({
    x: Number.isFinite(pt && pt.x) ? pt.x : fallback.x,
    y: Number.isFinite(pt && pt.y) ? pt.y : fallback.y,
  });

  const rootHead = safe(hipMid);
  const rootTip = pointAdd(rootHead, down.x, down.y, Math.max(10, torsoLen * 0.08));

  return [
    { name: "root", parent: -1, connected: false, head: rootHead, tip: rootTip },
    { name: "hips", parent: 0, connected: false, head: safe(hipMid), tip: safe(spine0Tip) },
    { name: "spine_1", parent: 1, connected: true, head: safe(spine0Tip), tip: safe(spine1Tip) },
    { name: "spine_2", parent: 2, connected: true, head: safe(spine1Tip), tip: safe(spine2Tip) },
    { name: "neck", parent: 3, connected: true, head: safe(spine2Tip), tip: safe(neckTip) },
    { name: "head", parent: 4, connected: true, head: safe(neckTip), tip: safe(headTip) },
    { name: "shoulder_l", parent: 3, connected: true, head: safe(spine2Tip), tip: safe(lShoulder) },
    { name: "upper_arm_l", parent: 6, connected: true, head: safe(lShoulder), tip: safe(lElbow) },
    { name: "lower_arm_l", parent: 7, connected: true, head: safe(lElbow), tip: safe(lWrist) },
    { name: "hand_l", parent: 8, connected: true, head: safe(lWrist), tip: safe(lHand) },
    { name: "shoulder_r", parent: 3, connected: true, head: safe(spine2Tip), tip: safe(rShoulder) },
    { name: "upper_arm_r", parent: 10, connected: true, head: safe(rShoulder), tip: safe(rElbow) },
    { name: "lower_arm_r", parent: 11, connected: true, head: safe(rElbow), tip: safe(rWrist) },
    { name: "hand_r", parent: 12, connected: true, head: safe(rWrist), tip: safe(rHand) },
    { name: "upper_leg_l", parent: 1, connected: false, head: safe(lHip), tip: safe(lKnee) },
    { name: "lower_leg_l", parent: 14, connected: true, head: safe(lKnee), tip: safe(lAnkle) },
    { name: "foot_l", parent: 15, connected: true, head: safe(lAnkle), tip: safe(lFoot) },
    { name: "upper_leg_r", parent: 1, connected: false, head: safe(rHip), tip: safe(rKnee) },
    { name: "lower_leg_r", parent: 17, connected: true, head: safe(rKnee), tip: safe(rAnkle) },
    { name: "foot_r", parent: 18, connected: true, head: safe(rAnkle), tip: safe(rFoot) },
  ];
}

function getSlotDocumentCenter(slot) {
  if (!slot) return null;
  if ((getActiveAttachment(slot) || {}).rect) {
    const x = Number((getActiveAttachment(slot) || {}).rect.x);
    const y = Number((getActiveAttachment(slot) || {}).rect.y);
    const w = Number((getActiveAttachment(slot) || {}).rect.w);
    const h = Number((getActiveAttachment(slot) || {}).rect.h);
    if (Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(w) && Number.isFinite(h)) {
      return { x: x + w * 0.5, y: y + h * 0.5 };
    }
  }
  const canvas = (getActiveAttachment(slot) || {}).canvas;
  const w = canvas ? Number(canvas.width) || 0 : 0;
  const h = canvas ? Number(canvas.height) || 0 : 0;
  return {
    x: (Number(slot.tx) || 0) + w * 0.5,
    y: (Number(slot.ty) || 0) + h * 0.5,
  };
}

function findBestHumanoidBoneForSlot(slot, bones) {
  if (!slot || !Array.isArray(bones) || bones.length === 0) return -1;
  const center = getSlotDocumentCenter(slot);
  if (!center) return -1;
  let bestIndex = -1;
  let bestDist = Infinity;
  for (let i = 0; i < bones.length; i += 1) {
    const ep = getBoneWorldEndpointsFromBones(bones, i);
    if (!ep || !ep.head || !ep.tip) continue;
    const dist = pointToSegmentDistanceSquared(
      Number(center.x) || 0,
      Number(center.y) || 0,
      Number(ep.head.x) || 0,
      Number(ep.head.y) || 0,
      Number(ep.tip.x) || 0,
      Number(ep.tip.y) || 0
    );
    if (dist < bestDist) {
      bestDist = dist;
      bestIndex = i;
    }
  }
  return bestIndex;
}

function findHumanoidAutoBindRootBoneIndex(bones) {
  if (!Array.isArray(bones) || bones.length === 0) return -1;
  const namedRoot = bones.findIndex((b) => {
    if (!b) return false;
    const name = String(b.name || "").trim().toLowerCase();
    return name === "root" && Number(b.parent) < 0;
  });
  if (namedRoot >= 0) return namedRoot;
  const firstRoot = bones.findIndex((b) => Number(b && b.parent) < 0);
  if (firstRoot >= 0) return firstRoot;
  return 0;
}

function autoBindUnassignedSlotsToHumanoidBones(m) {
  if (!m || !Array.isArray(m.rigBones) || m.rigBones.length === 0) return 0;
  const rootBone = findHumanoidAutoBindRootBoneIndex(m.rigBones);
  let bound = 0;
  for (const slot of state.slots) {
    if (!slot || getSlotTreeBoneIndex(slot, m) !== -1) continue;
    const targetBone =
      Number.isFinite(rootBone) && rootBone >= 0
        ? rootBone
        : findBestHumanoidBoneForSlot(slot, m.rigBones);
    if (!Number.isFinite(targetBone) || targetBone < 0) continue;
    if (!applySlotBoneAssignment(slot, targetBone, m)) continue;
    bound += 1;
  }
  return bound;
}

function applyHumanoidTemplateToRig(m, template, width, height) {
  if (!m || !Array.isArray(template) || template.length <= 0) return { ok: false, reason: "template" };
  const replaced = Array.isArray(m.rigBones) ? m.rigBones.length : 0;
  m.rigBones = [];
  state.boneTreeSelectedSlotByBone = Object.create(null);
  state.boneTreeSelectedUnassignedSlotIds = [];
  state.selectedBone = -1;
  state.selectedBonesForWeight = [];

  for (let i = 0; i < template.length; i += 1) {
    const spec = template[i] || {};
    const safeParent = Number.isFinite(spec.parent) && spec.parent >= 0 && spec.parent < m.rigBones.length ? spec.parent : -1;
    const connected = !!spec.connected && safeParent >= 0;
    m.rigBones.push({
      name: String(spec.name || `bone_${i}`),
      parent: safeParent,
      inherit: "normal",
      tx: 0,
      ty: 0,
      rot: 0,
      length: 32,
      sx: 1,
      sy: 1,
      shx: 0,
      shy: 0,
      connected,
      poseLenEditable: false,
    });
    const parentTip =
      safeParent >= 0 ? getBoneWorldEndpointsFromBones(m.rigBones, safeParent).tip : { x: width * 0.5, y: height * 0.5 };
    const head =
      connected
        ? parentTip
        : {
          x: Number(spec.head && spec.head.x),
          y: Number(spec.head && spec.head.y),
        };
    if (!Number.isFinite(head.x) || !Number.isFinite(head.y)) {
      head.x = parentTip.x;
      head.y = parentTip.y;
    }
    const tip = {
      x: Number(spec.tip && spec.tip.x),
      y: Number(spec.tip && spec.tip.y),
    };
    if (!Number.isFinite(tip.x) || !Number.isFinite(tip.y)) {
      tip.x = head.x + Math.max(1, Number(m.rigBones[i].length) || 1);
      tip.y = head.y;
    }
    setBoneFromWorldEndpoints(m.rigBones, i, head, tip);
  }

  enforceConnectedHeads(m.rigBones);
  ensureSlotsHaveBoneBinding();
  const autoBoundSlots = autoBindUnassignedSlotsToHumanoidBones(m);
  syncPoseFromRig(m);
  syncBindPose(m);
  refreshWeightsForBoneCount();
  state.selectedBone = m.rigBones.length > 0 ? 0 : -1;
  state.selectedBonesForWeight = state.selectedBone >= 0 ? [state.selectedBone] : [];
  updateBoneUI();
  pushUndoCheckpoint(true);
  return { ok: true, count: m.rigBones.length, replaced, autoBoundSlots };
}

async function rebuildHumanoidRig(options = null) {
  const opts = options && typeof options === "object" ? options : readPoseAutoRigOptionsFromUI();
  const m = state.mesh;
  if (!m || state.boneMode !== "edit") return { ok: false, reason: "mode" };
  const source = getPoseAutoRigInputSource(opts.sourceMode);
  if (!source || !source.source) return { ok: false, reason: "source" };
  const detector = await ensurePoseAutoRigDetector(opts);
  const poses = await detector.estimatePoses(source.source, { maxPoses: 1, flipHorizontal: false });
  if (!Array.isArray(poses) || poses.length <= 0) return { ok: false, reason: "no_pose" };
  const best = poses[0];
  const docW = Math.max(1, Number(source.docW) || Number(state.imageWidth) || 256);
  const docH = Math.max(1, Number(source.docH) || Number(state.imageHeight) || 256);
  const template = buildHumanoidTemplateFromPose(best, source.mapPoint, docW, docH, opts);
  if (!template || template.length <= 0) {
    return { ok: false, reason: opts.allowFallback === false ? "pose_incomplete_no_fallback" : "pose_incomplete" };
  }
  return applyHumanoidTemplateToRig(m, template, docW, docH);
}

async function handleSetupHumanoidBoneBuild() {
  if (poseAutoRigBusy) {
    setStatus("Humanoid bone: pose detection is already running...");
    return;
  }
  if (!state.mesh || state.boneMode !== "edit") {
    setStatus("Switch to Skeleton/Edit mode to build humanoid bones.");
    return;
  }
  const existing = Array.isArray(state.mesh.rigBones) ? state.mesh.rigBones.length : 0;
  if (existing > 0 && !window.confirm(`Replace current rig bones (${existing}) with detected humanoid bones?`)) {
    setStatus("Humanoid bone generation canceled.");
    return;
  }
  const opts = readPoseAutoRigOptionsFromUI();
  poseAutoRigBusy = true;
  setStatus("Humanoid bone: running BlazePose Heavy detection...");
  try {
    const result = await rebuildHumanoidRig(opts);
    if (!result.ok) {
      if (result.reason === "source") {
        if (opts.sourceMode === "project") setStatus("Humanoid bone failed: project image source unavailable. Switch source to Auto or Active Slot.");
        else if (opts.sourceMode === "active_slot") setStatus("Humanoid bone failed: active slot source unavailable.");
        else setStatus("Humanoid bone failed: no source image to detect. Import image first.");
      }
      else if (result.reason === "no_pose") setStatus("Humanoid bone failed: no clear human pose detected in image.");
      else if (result.reason === "pose_incomplete_no_fallback") setStatus("Humanoid bone failed: missing required keypoints (fallback disabled).");
      else if (result.reason === "pose_incomplete") setStatus("Humanoid bone failed: pose keypoints are incomplete.");
      else setStatus("Humanoid bone generation failed.");
      return;
    }
    const replacedText = result.replaced > 0 ? `, replaced ${result.replaced}` : "";
    const autoBindText = result.autoBoundSlots > 0 ? `, auto-bound ${result.autoBoundSlots} staging slot(s)` : "";
    setStatus(`Humanoid bone generated from pose: ${result.count} bones${replacedText}${autoBindText}.`);
  } catch (err) {
    setStatus(`Humanoid bone failed: ${(err && err.message) || "unknown error"}`);
  } finally {
    poseAutoRigBusy = false;
  }
}

function bindSetupHumanoidBoneButton() {
  const btn = document.getElementById("setupHumanoidBoneBtn");
  if (!btn) return;
  els.setupHumanoidBoneBtn = btn;
}

function bindBoneTreeHumanoidBoneButton() {
  const btn = document.getElementById("boneTreeHumanoidBoneBtn");
  if (!btn) return;
  els.boneTreeHumanoidBoneBtn = btn;
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

function computeWorldEditNoInheritRotation(bones) {
  const world = bones.map(() => createIdentity());
  for (let i = 0; i < bones.length; i += 1) {
    const b = normalizeBoneChannels(bones[i]);
    if (b.parent >= 0 && b.parent < bones.length) {
      const parentWorld = world[b.parent];
      let head;
      if (b.connected) {
        const parent = bones[b.parent];
        const parentLen = Number(parent && parent.length) || 0;
        head = transformPoint(parentWorld, parentLen, 0);
      } else {
        head = {
          x: Number(b.tx) || 0,
          y: Number(b.ty) || 0,
        };
      }
      const localNoTrans = matFromBone({ ...b, tx: 0, ty: 0 });
      world[i] = [localNoTrans[0], localNoTrans[1], localNoTrans[2], localNoTrans[3], head.x, head.y];
    } else {
      world[i] = matFromBone(b);
    }
  }
  return world;
}

function computeRigWorldForCurrentSpace(bones) {
  if (!Array.isArray(bones)) return [];
  return state.rigCoordinateSpace === "edit" ? computeWorldEditNoInheritRotation(bones) : computeWorld(bones);
}

function getEditAwareWorld(bones) {
  if (!Array.isArray(bones)) return [];
  if (state.boneMode === "edit") return computeWorldEditNoInheritRotation(bones);
  return computeWorld(bones);
}

function clearRigEditPreviewCache() {
  state.rigEditPreviewWorld = null;
  state.rigEditPreviewInvBind = null;
}

function markRigEditDirty() {
  if (state.boneMode === "edit") {
    state.rigEditNeedsRuntimeNormalize = true;
    state.rigCoordinateSpace = "edit";
  }
}

function ensureRigEditPreviewCache(force = false) {
  if (!state.mesh || state.boneMode !== "edit") return;
  const rig = getRigBones(state.mesh);
  if (!Array.isArray(rig)) return;
  const needRebuild =
    force ||
    !Array.isArray(state.rigEditPreviewWorld) ||
    !Array.isArray(state.rigEditPreviewInvBind) ||
    state.rigEditPreviewWorld.length !== rig.length ||
    state.rigEditPreviewInvBind.length !== rig.length;
  if (!needRebuild) return;
  const clone = cloneBones(rig);
  enforceConnectedHeads(clone);
  const world = computeWorldEditNoInheritRotation(clone);
  state.rigEditPreviewWorld = world;
  state.rigEditPreviewInvBind = world.map(invert);
}

function getDisplayInvBind(m) {
  if (!m) return [];
  if (
    state.boneMode === "edit" &&
    Array.isArray(state.rigEditPreviewInvBind) &&
    state.rigEditPreviewInvBind.length === (Array.isArray(m.rigBones) ? m.rigBones.length : 0)
  ) {
    return state.rigEditPreviewInvBind;
  }
  return m.invBind;
}

function normalizeRigEditForRuntime(m) {
  if (!m) return false;
  const bones = getRigBones(m);
  if (!Array.isArray(bones) || bones.length <= 0) return false;
  enforceConnectedHeads(bones);
  const editWorld = computeWorldEditNoInheritRotation(bones);
  for (let i = 0; i < bones.length; i += 1) {
    const b = bones[i];
    if (!b) continue;
    normalizeBoneChannels(b);
    const worldAngle = matrixAngle(editWorld[i]);
    if (b.parent >= 0 && b.parent < bones.length) {
      const parentAngle = matrixAngle(editWorld[b.parent]);
      b.rot = shortestAngleDelta(parentAngle, worldAngle);
      if (b.connected) {
        const parent = bones[b.parent];
        b.tx = Number(parent && parent.length) || 0;
        b.ty = 0;
      } else {
        const parentWorld = editWorld[b.parent];
        const parentForInherit = getParentMatrixForInherit(parentWorld, b.inherit);
        const inv = invert(parentForInherit);
        const localHead = transformPoint(inv, b.tx, b.ty);
        b.tx = localHead.x;
        b.ty = localHead.y;
      }
    } else {
      b.rot = worldAngle;
    }
  }
  clearRigEditPreviewCache();
  state.rigEditNeedsRuntimeNormalize = false;
  state.rigCoordinateSpace = "runtime";
  syncPoseFromRig(m);
  syncBindPose(m);
  return true;
}

function normalizeRigRuntimeForEdit(m) {
  if (!m) return false;
  const bones = getRigBones(m);
  if (!Array.isArray(bones) || bones.length <= 0) return false;
  enforceConnectedHeads(bones);
  const runtimeWorld = computeWorld(bones);
  for (let i = 0; i < bones.length; i += 1) {
    const b = bones[i];
    if (!b) continue;
    normalizeBoneChannels(b);
    const ep = getBoneWorldEndpointsFromBones(bones, i, runtimeWorld);
    const worldAngle = Math.atan2(ep.tip.y - ep.head.y, ep.tip.x - ep.head.x);
    b.rot = worldAngle;
    if (b.parent >= 0 && b.connected) {
      const parent = bones[b.parent];
      b.tx = Number(parent && parent.length) || 0;
      b.ty = 0;
    } else {
      b.tx = Number(ep.head.x) || 0;
      b.ty = Number(ep.head.y) || 0;
    }
  }
  clearRigEditPreviewCache();
  state.rigEditNeedsRuntimeNormalize = false;
  state.rigCoordinateSpace = "edit";
  syncPoseFromRig(m);
  syncBindPose(m);
  return true;
}
