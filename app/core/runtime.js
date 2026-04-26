// ROLE: Foundation — DOM ref registry (`els`), shared mutable state
// object (`state`), math helpers, GL program/VBO/IBO setup, dock layout,
// AI capture registry. Loaded first; everything else assumes its globals
// exist.
// EXPORTS (globals):
//   - els: { [id]: HTMLElement }  — registered with getElementById per
//     control. Add new ids here when wiring HTML.
//   - state: object  — single source of truth for editor state
//     (state.mesh, state.slots, state.anim, state.export, etc.)
//   - gl, hasGL, isWebGL2, hasVAO, program, vbo, ibo, vao, loc
//   - setStatus, requestRender, scheduleDraw, math.* (clamp, degToRad…)
//   - createProgram, ensureGLTextureForCanvas, applyGLBlendMode,
//     bindGeometry, setupVertexLayout, finishMainGLSetup,
//     initMainGLResources
//   - registerAICaptureDomain, runAICaptureCommand
// HEAVY FILE (~5000 lines). Candidate split: els-registry,
//   state-init, math, gl-setup, ai-capture.
const els = {
  appRoot: document.getElementById("appRoot"),
  fileNewBtn: document.getElementById("fileNewBtn"),
  fileOpenBtn: document.getElementById("fileOpenBtn"),
  fileSaveBtn: document.getElementById("fileSaveBtn"),
  fileLoadBtn: document.getElementById("fileLoadBtn"),
  fileExportSpineBtn: document.getElementById("fileExportSpineBtn"),
  spineImportBtn: document.getElementById("spineImportBtn"),
  spineImportInput: document.getElementById("spineImportInput"),
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
  slotSelectWrap: document.getElementById("slotSelectWrap"),
  slotViewWrap: document.getElementById("slotViewWrap"),
  activeSkinWrap: document.getElementById("activeSkinWrap"),
  activeSkinSelect: document.getElementById("activeSkinSelect"),
  activeSkinQuickWrap: document.getElementById("activeSkinQuickWrap"),
  activeSkinAddBtn: document.getElementById("activeSkinAddBtn"),
  activeSkinCaptureBtn: document.getElementById("activeSkinCaptureBtn"),
  activeSkinApplyBtn: document.getElementById("activeSkinApplyBtn"),
  spineCompatWrap: document.getElementById("spineCompatWrap"),
  spineCompat: document.getElementById("spineCompat"),
  atlasMaxWidth: document.getElementById("atlasMaxWidth"),
  atlasMaxHeight: document.getElementById("atlasMaxHeight"),
  atlasPadding: document.getElementById("atlasPadding"),
  atlasBleed: document.getElementById("atlasBleed"),
  atlasAllowRotate: document.getElementById("atlasAllowRotate"),
  atlasAllowTrim: document.getElementById("atlasAllowTrim"),
  atlasMultiPage: document.getElementById("atlasMultiPage"),
  viewZoomWrap: document.getElementById("viewZoomWrap"),
  viewPanToggleBtn: document.getElementById("viewPanToggleBtn"),
  viewFitAllBtn: document.getElementById("viewFitAllBtn"),
  viewZoomOutBtn: document.getElementById("viewZoomOutBtn"),
  viewZoomResetBtn: document.getElementById("viewZoomResetBtn"),
  viewZoomInBtn: document.getElementById("viewZoomInBtn"),
  workspaceModeLabel: document.getElementById("workspaceModeLabel"),
  objectPanelMoveBtn: document.getElementById("objectPanelMoveBtn"),
  objectPanelRotateBtn: document.getElementById("objectPanelRotateBtn"),
  leftToolModeHint: document.getElementById("leftToolModeHint"),
  leftToolTabs: document.getElementById("leftToolTabs"),
  leftTabCanvas: document.getElementById("leftTabCanvas"),
  leftTabSetup: document.getElementById("leftTabSetup"),
  leftTabRig: document.getElementById("leftTabRig"),
  leftTabObject: document.getElementById("leftTabObject"),
  leftTabIK: document.getElementById("leftTabIK"),
  leftTabConstraint: document.getElementById("leftTabConstraint"),
  leftTabPath: document.getElementById("leftTabPath"),
  leftTabPhysics: document.getElementById("leftTabPhysics"),
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
  leftPhysicsTools: document.getElementById("leftPhysicsTools"),
  leftSkinTools: document.getElementById("leftSkinTools"),
  leftGeneralTools: document.getElementById("leftGeneralTools"),
  webglSupportDialogWrap: document.getElementById("webglSupportDialogWrap"),
  webglSupportDialogBackdrop: document.getElementById("webglSupportDialogBackdrop"),
  webglSupportDialogPanel: document.getElementById("webglSupportDialogPanel"),
  webglSupportCloseBtn: document.getElementById("webglSupportCloseBtn"),
  webglSupportCheckBtn: document.getElementById("webglSupportCheckBtn"),
  webglSupportCopyBtn: document.getElementById("webglSupportCopyBtn"),
  webglSupportVerdict: document.getElementById("webglSupportVerdict"),
  webglSupportSummary: document.getElementById("webglSupportSummary"),
  webglSupportBlockers: document.getElementById("webglSupportBlockers"),
  webglSupportWarnings: document.getElementById("webglSupportWarnings"),
  webglSupportReport: document.getElementById("webglSupportReport"),
  leftDockSide: document.getElementById("leftDockSide"),
  leftTools: document.getElementById("leftTools"),
  rightCol: document.getElementById("rightCol"),
  rightTree: document.getElementById("rightTree"),
  rightProps: document.getElementById("rightProps"),
  boneTreeOnlyActiveSlotBtn: document.getElementById("boneTreeOnlyActiveSlotBtn"),
  boneTreeAddBoneBtn: document.getElementById("boneTreeAddBoneBtn"),
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
  setupHumanoidBoneBtn: document.getElementById("setupHumanoidBoneBtn"),
  setupHumanoidSourceMode: document.getElementById("setupHumanoidSourceMode"),
  setupHumanoidMinScore: document.getElementById("setupHumanoidMinScore"),
  setupHumanoidSmoothing: document.getElementById("setupHumanoidSmoothing"),
  setupHumanoidFallback: document.getElementById("setupHumanoidFallback"),
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
  physicsAddBtn: document.getElementById("physicsAddBtn"),
  physicsRemoveBtn: document.getElementById("physicsRemoveBtn"),
  physicsResetBtn: document.getElementById("physicsResetBtn"),
  physicsMoveUpBtn: document.getElementById("physicsMoveUpBtn"),
  physicsMoveDownBtn: document.getElementById("physicsMoveDownBtn"),
  physicsList: document.getElementById("physicsList"),
  physicsSelect: document.getElementById("physicsSelect"),
  physicsName: document.getElementById("physicsName"),
  physicsBone: document.getElementById("physicsBone"),
  physicsEnabled: document.getElementById("physicsEnabled"),
  physicsX: document.getElementById("physicsX"),
  physicsY: document.getElementById("physicsY"),
  physicsRotate: document.getElementById("physicsRotate"),
  physicsScaleX: document.getElementById("physicsScaleX"),
  physicsShearX: document.getElementById("physicsShearX"),
  physicsMix: document.getElementById("physicsMix"),
  physicsInertia: document.getElementById("physicsInertia"),
  physicsStrength: document.getElementById("physicsStrength"),
  physicsDamping: document.getElementById("physicsDamping"),
  physicsMassInverse: document.getElementById("physicsMassInverse"),
  physicsStep: document.getElementById("physicsStep"),
  physicsWind: document.getElementById("physicsWind"),
  physicsGravity: document.getElementById("physicsGravity"),
  physicsLimit: document.getElementById("physicsLimit"),
  physicsSkinRequired: document.getElementById("physicsSkinRequired"),
  physicsHint: document.getElementById("physicsHint"),
  boneName: document.getElementById("boneName"),
  boneColor: document.getElementById("boneColor"),
  boneColorClearBtn: document.getElementById("boneColorClearBtn"),
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
  skinDupBtn: document.getElementById("skinDupBtn"),
  skinDeleteBtn: document.getElementById("skinDeleteBtn"),
  skinMoveUpBtn: document.getElementById("skinMoveUpBtn"),
  skinMoveDownBtn: document.getElementById("skinMoveDownBtn"),
  skinSelect: document.getElementById("skinSelect"),
  skinName: document.getElementById("skinName"),
  skinCaptureBtn: document.getElementById("skinCaptureBtn"),
  skinApplyBtn: document.getElementById("skinApplyBtn"),
  skinDiffList: document.getElementById("skinDiffList"),
  skinFolderInput: document.getElementById("skinFolderInput"),
  skinBonesList: document.getElementById("skinBonesList"),
  skinBoneAddBtn: document.getElementById("skinBoneAddBtn"),
  skinBoneRemoveBtn: document.getElementById("skinBoneRemoveBtn"),
  activeSkinLabel: document.getElementById("activeSkinLabel"),
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
  onionKeyFramesOnly: document.getElementById("onionKeyFramesOnly"),
  onionPxPerFrameX: document.getElementById("onionPxPerFrameX"),
  onionPxPerFrameY: document.getElementById("onionPxPerFrameY"),
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
  eventAudio: document.getElementById("eventAudio"),
  eventVolume: document.getElementById("eventVolume"),
  eventBalance: document.getElementById("eventBalance"),
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
  treeCtxAttachmentAddBtn: document.getElementById("treeCtxAttachmentAddBtn"),
  treeCtxAttachmentDupBtn: document.getElementById("treeCtxAttachmentDupBtn"),
  treeCtxAttachmentChangeTypeBtn: document.getElementById("treeCtxAttachmentChangeTypeBtn"),
  treeCtxAttachmentDeleteBtn: document.getElementById("treeCtxAttachmentDeleteBtn"),
  treeCtxAttachmentRenameBtn: document.getElementById("treeCtxAttachmentRenameBtn"),
  treeCtxAttachmentSetActiveBtn: document.getElementById("treeCtxAttachmentSetActiveBtn"),
  treeCtxAttachmentCopyToSlotBtn: document.getElementById("treeCtxAttachmentCopyToSlotBtn"),
  treeCtxAttachmentLoadImageBtn: document.getElementById("treeCtxAttachmentLoadImageBtn"),
  boneEditHintBar:  document.getElementById("boneEditHintBar"),
  boneEditHintText: document.getElementById("boneEditHintText"),
  treeCtxBoneDeleteBtn: document.getElementById("treeCtxBoneDeleteBtn"),
  treeCtxBoneDeleteWithSlotsBtn: document.getElementById("treeCtxBoneDeleteWithSlotsBtn"),
  treeCtxSlotLoadImageBtn: document.getElementById("treeCtxSlotLoadImageBtn"),
  attTypePickerWrap: document.getElementById("attTypePickerWrap"),
  attTypePickerBackdrop: document.getElementById("attTypePickerBackdrop"),
  attTypePickerPanel: document.getElementById("attTypePickerPanel"),
  attTypePickerCloseBtn: document.getElementById("attTypePickerCloseBtn"),
  attTypePickerTitle: document.getElementById("attTypePickerTitle"),
  attTypePickerGrid: document.getElementById("attTypePickerGrid"),
  boneTree: document.getElementById("boneTree"),
  slotName: document.getElementById("slotName"),
  slotAttachment: document.getElementById("slotAttachment"),
  slotAttachmentVisible: document.getElementById("slotAttachmentVisible"),
  slotAttachmentName: document.getElementById("slotAttachmentName"),
  slotAttachmentType: document.getElementById("slotAttachmentType"),
  slotAttachmentLinkedParent: document.getElementById("slotAttachmentLinkedParent"),
  slotAttachmentInheritTimelines: document.getElementById("slotAttachmentInheritTimelines"),
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
  slotSequenceLoadFramesBtn: document.getElementById("slotSequenceLoadFramesBtn"),
  slotSequenceClearFramesBtn: document.getElementById("slotSequenceClearFramesBtn"),
  slotSequenceFramesHint: document.getElementById("slotSequenceFramesHint"),
  slotSequenceFramesInput: document.getElementById("slotSequenceFramesInput"),
  slotAttachmentAddBtn: document.getElementById("slotAttachmentAddBtn"),
  slotAttachmentDuplicateBtn: document.getElementById("slotAttachmentDuplicateBtn"),
  slotAttachmentDeleteBtn: document.getElementById("slotAttachmentDeleteBtn"),
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
  slotMeshBoundaryEditBtn: document.getElementById("slotMeshBoundaryEditBtn"),
  slotMeshGridEditBtn: document.getElementById("slotMeshGridEditBtn"),
  slotMeshEditTargetHint: document.getElementById("slotMeshEditTargetHint"),
  slotMeshNewBtn: document.getElementById("slotMeshNewBtn"),
  slotMeshToolModeHint: document.getElementById("slotMeshToolModeHint"),
  slotMeshCloseBtn: document.getElementById("slotMeshCloseBtn"),
  slotMeshTriangulateBtn: document.getElementById("slotMeshTriangulateBtn"),
  slotMeshGridFillBtn: document.getElementById("slotMeshGridFillBtn"),
  slotMeshAutoForegroundBtn: document.getElementById("slotMeshAutoForegroundBtn"),
  autoFgAlphaThreshold: document.getElementById("autoFgAlphaThreshold"),
  autoFgPadding: document.getElementById("autoFgPadding"),
  autoFgDetail: document.getElementById("autoFgDetail"),
  slotMeshGridReplaceContour: document.getElementById("slotMeshGridReplaceContour"),
  slotMeshContourRefHint: document.getElementById("slotMeshContourRefHint"),
  slotMeshLinkEdgeBtn: document.getElementById("slotMeshLinkEdgeBtn"),
  slotMeshUnlinkEdgeBtn: document.getElementById("slotMeshUnlinkEdgeBtn"),
  slotMeshApplyBtn: document.getElementById("slotMeshApplyBtn"),
  slotMeshCreateApplyBtn: document.getElementById("slotMeshCreateApplyBtn"),
  slotMeshResetBtn: document.getElementById("slotMeshResetBtn"),
  slotMeshAddVertexBtn: document.getElementById("slotMeshAddVertexBtn"),
  slotMeshDeleteVertexBtn: document.getElementById("slotMeshDeleteVertexBtn"),
  slotMeshPinBtn: document.getElementById("slotMeshPinBtn"),
  slotMeshUnpinBtn: document.getElementById("slotMeshUnpinBtn"),
  slotMeshRelaxBtn: document.getElementById("slotMeshRelaxBtn"),
  slotMeshSubdivideBtn: document.getElementById("slotMeshSubdivideBtn"),
  slotMeshAddCentroidBtn: document.getElementById("slotMeshAddCentroidBtn"),
  slotMeshFlipEdgeBtn: document.getElementById("slotMeshFlipEdgeBtn"),
  slotMeshGenerateBtn: document.getElementById("slotMeshGenerateBtn"),
  slotMeshGenerateRatio: document.getElementById("slotMeshGenerateRatio"),
  slotMeshCopyWeightsBtn: document.getElementById("slotMeshCopyWeightsBtn"),
  slotMeshPasteWeightsBtn: document.getElementById("slotMeshPasteWeightsBtn"),
  slotMeshCaptureStartBtn: document.getElementById("slotMeshCaptureStartBtn"),
  slotMeshCaptureMarkBtn: document.getElementById("slotMeshCaptureMarkBtn"),
  slotMeshCaptureCopyBtn: document.getElementById("slotMeshCaptureCopyBtn"),
  weightBrushToggle: document.getElementById("weightBrushToggle"),
  weightBrushAddBtn: document.getElementById("weightBrushAddBtn"),
  weightBrushRemoveBtn: document.getElementById("weightBrushRemoveBtn"),
  weightBrushReplaceBtn: document.getElementById("weightBrushReplaceBtn"),
  weightBrushSmoothBtn: document.getElementById("weightBrushSmoothBtn"),
  weightBrushSize: document.getElementById("weightBrushSize"),
  weightBrushStrength: document.getElementById("weightBrushStrength"),
  weightBrushFeather: document.getElementById("weightBrushFeather"),
  weightPruneThreshold: document.getElementById("weightPruneThreshold"),
  weightPrunePreviewBtn: document.getElementById("weightPrunePreviewBtn"),
  weightPrunePreview: document.getElementById("weightPrunePreview"),
  weightPruneApplyBtn: document.getElementById("weightPruneApplyBtn"),
  weightWeldFromBone: document.getElementById("weightWeldFromBone"),
  weightWeldToBone: document.getElementById("weightWeldToBone"),
  weightWeldApplyBtn: document.getElementById("weightWeldApplyBtn"),
  weightSwapApplyBtn: document.getElementById("weightSwapApplyBtn"),
  weightWeldHint: document.getElementById("weightWeldHint"),
  weightOverlayQuickBtn: document.getElementById("weightOverlayQuickBtn"),
  setupUpdateBindingsBtn: document.getElementById("setupUpdateBindingsBtn"),
  boneCompensationToggle: document.getElementById("boneCompensationToggle"),
  stage: document.getElementById("stage"),
  backdropCanvas: document.getElementById("backdropCanvas"),
  glCanvas: document.getElementById("glCanvas"),
  glOverlayCanvas: document.getElementById("glOverlayCanvas"),
  overlay: document.getElementById("overlay"),
};

const gl =
  els.glCanvas.getContext("webgl2", { alpha: true, premultipliedAlpha: false, stencil: true }) ||
  els.glCanvas.getContext("webgl", { alpha: true, premultipliedAlpha: false, stencil: true }) ||
  els.glCanvas.getContext("experimental-webgl", { alpha: true, premultipliedAlpha: false, stencil: true });
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
const DOCK_LAYOUT_STORAGE_KEY = "uiLayout:v3";
const DOCK_PANEL_IDS = ["leftTools", "rightTree", "rightProps", "timelineDock"];

// "native" = timeline stays in its original CSS grid row (default state)
const DOCK_VALID_SIDES = ["left", "right", "bottom"];
const DOCK_ALL_SIDES   = ["left", "right", "bottom", "native"];

function getDefaultDockLayout() {
  return {
    version: 3,
    sides: {
      left:   { collapsed: false, expandedWidth: 260 },
      right:  { collapsed: false, expandedWidth: 340 },
      bottom: { collapsed: false, expandedHeight: 280 },
    },
    panels: {
      leftTools:    { side: "left",   order: 0, column: 0, colWidth: null, float: null },
      rightTree:    { side: "right",  order: 0, column: 0, colWidth: null, float: null },
      rightProps:   { side: "right",  order: 1, column: 0, colWidth: null, float: null },
      timelineDock: { side: "native", order: 0, column: 0, colWidth: null, float: null },
    },
  };
}

function normalizeDockLayout(raw) {
  const fallback = getDefaultDockLayout();
  const source = raw && typeof raw === "object" ? raw : null;
  const panelSource = source && source.panels && typeof source.panels === "object" ? source.panels : null;

  function normSide(key, minW, maxW, defaultW, isHeight) {
    const s = source && source.sides && source.sides[key] ? source.sides[key] : null;
    const dim = isHeight ? "expandedHeight" : "expandedWidth";
    const raw2 = s && Number.isFinite(s[dim]) ? s[dim] : defaultW;
    return {
      collapsed: !!(s && s.collapsed),
      [dim]: math.clamp(Math.round(raw2), minW, maxW),
    };
  }

  const normalized = {
    version: 3,
    sides: {
      left:   normSide("left",   150, 800, 260, false),
      right:  normSide("right",  200, 800, 340, false),
      bottom: normSide("bottom", 80,  600, 280, true),
    },
    panels: Object.create(null),
  };

  for (const id of DOCK_PANEL_IDS) {
    const base = fallback.panels[id];
    const entry = panelSource && panelSource[id] ? panelSource[id] : base;
    const floatEntry = entry && entry.float && typeof entry.float === "object" ? entry.float : null;
    const isFloat = !!(floatEntry);
    const rawSide = entry && entry.side;
    const side = (!isFloat && DOCK_ALL_SIDES.includes(rawSide)) ? rawSide : base.side;
    const order = Number.isFinite(entry && entry.order) ? Math.max(0, Math.floor(entry.order)) : base.order;
    const floatNorm = isFloat ? {
      x: Number.isFinite(floatEntry.x) ? Math.round(floatEntry.x) : 100,
      y: Number.isFinite(floatEntry.y) ? Math.round(floatEntry.y) : 100,
      w: Number.isFinite(floatEntry.w) ? math.clamp(Math.round(floatEntry.w), 180, 1200) : 640,
      h: Number.isFinite(floatEntry.h) ? math.clamp(Math.round(floatEntry.h), 120, 900) : 320,
    } : null;
    const column = Number.isFinite(entry && entry.column) ? Math.max(0, Math.floor(entry.column)) : 0;
    const colWidth = Number.isFinite(entry && entry.colWidth) ? math.clamp(Math.round(entry.colWidth), 80, 1200) : null;
    normalized.panels[id] = { side, order, column, colWidth, float: floatNorm };
  }
  return normalized;
}

function setDockPanelFloat(panelId, floatRect) {
  const layout = normalizeDockLayout(state.uiLayout);
  if (!layout.panels[panelId]) return layout;
  layout.panels[panelId].float = floatRect
    ? { x: Math.round(floatRect.x), y: Math.round(floatRect.y), w: Math.round(floatRect.w), h: Math.round(floatRect.h) }
    : null;
  writeDockLayout(layout);
  return layout;
}

function readDockLayout() {
  try {
    const raw = localStorage.getItem(DOCK_LAYOUT_STORAGE_KEY);
    return normalizeDockLayout(raw ? JSON.parse(raw) : null);
  } catch {
    return getDefaultDockLayout();
  }
}

function writeDockLayout(layout) {
  const normalized = normalizeDockLayout(layout);
  state.uiLayout = normalized;
  try {
    localStorage.setItem(DOCK_LAYOUT_STORAGE_KEY, JSON.stringify(normalized));
  } catch {
    // localStorage full or disabled (QuotaExceededError, private mode, etc.)
    // Keep in-memory state anyway so the current session works
  }
  return normalized;
}

function resetDockLayout() {
  const layout = getDefaultDockLayout();
  localStorage.removeItem(DOCK_LAYOUT_STORAGE_KEY);
  // Also clear any legacy storage keys from previous versions
  try { localStorage.removeItem("uiLayout:v1"); } catch { /**/ }
  try { localStorage.removeItem("uiLayout:v2"); } catch { /**/ }
  state.uiLayout = layout;
  // Force-strip any residual float / inline styling from all dock panels
  if (typeof DOCK_PANEL_IDS !== "undefined") {
    for (const id of DOCK_PANEL_IDS) {
      const el = document.getElementById(id);
      if (!el) continue;
      el.classList.remove("dock-panel-floating", "dragging-float", "dragging");
      el.style.position = "";
      el.style.left = "";
      el.style.top = "";
      el.style.width = "";
      el.style.height = "";
      el.style.zIndex = "";
      el.style.order = "";
      el.style.flex = "";
      const rh = el.querySelector(".dock-float-resize-handle");
      if (rh) rh.remove();
    }
  }
  if (typeof applyDockLayout === "function") applyDockLayout(layout);
  return layout;
}

function setDockSideCollapsed(side, collapsed) {
  const layout = normalizeDockLayout(state.uiLayout);
  const key = DOCK_VALID_SIDES.includes(side) ? side : "right";
  layout.sides[key].collapsed = !!collapsed;
  writeDockLayout(layout);
  return layout;
}

function rememberDockSideWidth(side, width) {
  const layout = normalizeDockLayout(state.uiLayout);
  const key = side === "left" ? "left" : "right";
  const next = key === "left"
    ? math.clamp(Math.round(width), 150, 800)
    : math.clamp(Math.round(width), 200, 800);
  layout.sides[key].expandedWidth = next;
  writeDockLayout(layout);
  return layout;
}

function rememberDockBottomHeight(height) {
  const layout = normalizeDockLayout(state.uiLayout);
  layout.sides.bottom.expandedHeight = math.clamp(Math.round(height), 80, 600);
  writeDockLayout(layout);
  return layout;
}

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
  uiLayout: getDefaultDockLayout(),
  uiResizing: null,
  mesh: null,
  editMode: "skeleton",
  selectedBone: 0,
  selectedBonesForWeight: [],
  selectedBoneParts: [],
  selectedIK: -1,
  selectedTransform: -1,
  selectedPath: -1,
  selectedPhysics: -1,
  skinSets: [],
  selectedSkinSet: -1,
  activeSkinSetId: null,
  ikPickArmed: false,
  ikHoverBone: -1,
  grabArmed: false,
  grabLive: false,
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
  treeAttachmentDrag: null,
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
  boneTreeInlineRename: { kind: "", index: -1, attachmentName: "" },
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
  aiCapture: {
    active: false,
    domain: "",
    startedAt: 0,
    endedAt: 0,
    eventSeq: 0,
    events: [],
    marks: [],
    rawEventCount: 0,
    rawDroppedCount: 0,
    lastRawMoveAt: Object.create(null),
    startSnapshot: null,
    lastReportText: "",
  },
  webglSupport: {
    lastCheckedAt: 0,
    summary: "No WebGL support report yet.",
    reportText: "Run the check to inspect browser WebGL support.",
    analysis: {
      verdict: "neutral",
      verdictLabel: "Not checked",
      summary: "No WebGL support report yet.",
      blockers: [],
      warnings: [],
    },
    raw: null,
    open: false,
    lastFocus: null,
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
    editTarget: "boundary",
    toolRestoreTarget: "boundary",
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
  weightBrush: {
    active: false,
    mode: "add",
    size: 80,
    strength: 0.5,
    feather: 0.5,
    lockedBones: [],
  },
  // Spine "Bone compensation": when ON, edit-mode bone drag preserves the
  // world transforms of all descendants so they don't visually move with
  // the parent. OFF (default) keeps the legacy behaviour where children
  // inherit parent motion.
  boneCompensation: false,
  overlayScene: {
    canvas: null,
    ctx: null,
    enabled: false,
  },
  glTextureCache: hasGL ? new WeakMap() : null,
  export: {
    spineCompat: "4.2",
    atlas: {
      maxWidth: 2048,
      maxHeight: 2048,
      padding: 2,
      bleed: 0,
      allowRotate: false,
      allowTrim: false,
      allowMultiPage: true,
    },
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

const AI_CAPTURE_DOMAIN_REGISTRY = {};
const AI_CAPTURE_RAW_EVENT_LIMIT = 1000;
const AI_CAPTURE_RAW_MOVE_INTERVAL_MS = 120;
const MESH_DEBUG_EVENT_LIMIT = 500;

function registerAICaptureDomain(domain, adapter = {}) {
  const key = String(domain || "").trim();
  if (!key) return null;
  const normalized = {
    id: key,
    label: adapter.label || key,
    snapshot: typeof adapter.snapshot === "function" ? adapter.snapshot : () => null,
    diff: typeof adapter.diff === "function" ? adapter.diff : () => [],
    invariants: typeof adapter.invariants === "function" ? adapter.invariants : () => [],
    suspicions: typeof adapter.suspicions === "function" ? adapter.suspicions : () => [],
    commands: Array.isArray(adapter.commands) ? adapter.commands.slice() : [],
  };
  AI_CAPTURE_DOMAIN_REGISTRY[key] = normalized;
  return normalized;
}

function getAICaptureDomain(domain) {
  return AI_CAPTURE_DOMAIN_REGISTRY[String(domain || "")] || null;
}

function listAICaptureDomains() {
  return Object.keys(AI_CAPTURE_DOMAIN_REGISTRY).sort();
}

function getAICaptureDomainSnapshot(domain) {
  const adapter = getAICaptureDomain(domain);
  return adapter ? adapter.snapshot() : null;
}

function getAICaptureDomainDiffs(domain, startSnapshot = null, finalSnapshot = null, timeline = []) {
  const adapter = getAICaptureDomain(domain);
  return adapter ? adapter.diff(startSnapshot, finalSnapshot, timeline) : [];
}

function getAICaptureDomainInvariants(domain, finalSnapshot = null, context = {}) {
  const adapter = getAICaptureDomain(domain);
  return adapter ? adapter.invariants(finalSnapshot, context) : [];
}

function getAICaptureDomainSuspicions(domain, context = {}) {
  const adapter = getAICaptureDomain(domain);
  return adapter ? adapter.suspicions(context) : [];
}

function buildAICaptureDomainCoverage(timeline = []) {
  const capturedCommands = new Set(
    (Array.isArray(timeline) ? timeline : [])
      .filter((event) => event && event.category === "command")
      .map((event) => event.id)
  );
  const out = {};
  for (const domain of listAICaptureDomains()) {
    const adapter = getAICaptureDomain(domain);
    const commands = adapter.commands.slice();
    out[domain] = {
      label: adapter.label,
      capabilities: ["snapshot", "diff", "invariants", "suspicions"],
      commandCatalog: commands,
      capturedCommands: commands.filter((id) => capturedCommands.has(id)),
      capturedCommandCount: commands.filter((id) => capturedCommands.has(id)).length,
      registeredCommandCount: commands.length,
    };
  }
  return out;
}

function resolveAICaptureEventDomain(kind, details = {}) {
  if (details && details.domain) return String(details.domain);
  const text = String(kind || "");
  if (text.startsWith("mesh_") || text.startsWith("slot_mesh_")) return "mesh";
  if (text.startsWith("timeline_")) return "timeline";
  if (text.startsWith("bone_")) return "bone";
  if (text.startsWith("attachment_")) return "attachment";
  return "app";
}

function resolveAICaptureEventCategory(kind, details = {}) {
  const text = String(kind || "");
  if (text === "command" || text.endsWith("_command") || details.command) return "command";
  if (text.startsWith("capture_") || text.startsWith("ai_capture_")) return "capture";
  if (text.includes("pointer") || text.includes("pick")) return "pointer";
  if (text.includes("drag")) return "drag";
  if (text.includes("target") || text.includes("mode")) return "state_change";
  return "event";
}

function resolveAICaptureIntent(kind, details = {}) {
  if (details && details.command) return String(details.command);
  const text = String(kind || "");
  if (text === "mesh_pointerdown") return "begin_interaction";
  if (text === "slot_mesh_pick") return "pick_vertex";
  if (text === "mesh_drag_start") return "start_drag";
  if (text === "mesh_drag_first_move") return "move_vertex";
  if (text === "mesh_drag_end") return "finish_drag";
  if (text === "slot_mesh_reset_to_grid") return "reset_grid";
  if (text === "slot_mesh_edit_target") return "change_edit_target";
  if (text === "slot_mesh_tool_mode") return "change_tool_mode";
  if (text === "capture_start" || text === "ai_capture_start") return "capture_start";
  if (text === "capture_mark" || text === "ai_capture_mark") return "capture_mark";
  return text || "unknown";
}

function buildAICaptureEventId(kind, details = {}, domain = "app") {
  if (details && details.command) return String(details.command);
  const safeDomain = String(domain || "app").replace(/[^a-z0-9_]+/gi, "_").toLowerCase();
  const safeKind = String(kind || "event").replace(/[^a-z0-9_]+/gi, "_").toLowerCase();
  return `${safeDomain}.${safeKind}`;
}

function buildAICaptureEntity(details = {}) {
  const entity = {};
  if (Number.isFinite(Number(details.slotIndex))) entity.slotIndex = Number(details.slotIndex);
  if (details.pointSet) entity.pointSet = String(details.pointSet);
  if (Number.isFinite(Number(details.pointIndex))) entity.pointIndex = Number(details.pointIndex);
  if (Array.isArray(details.pointIndices)) entity.pointCount = details.pointIndices.length;
  if (details.targetSet) entity.targetSet = String(details.targetSet);
  if (details.activeSet) entity.activeSet = String(details.activeSet);
  if (Number.isFinite(Number(details.activePoint))) entity.activePoint = Number(details.activePoint);
  return entity;
}

function sanitizeAICaptureRawTarget(target) {
  const el = target && target.nodeType === 1 ? target : null;
  if (!el) return { tag: "" };
  const rect = typeof el.getBoundingClientRect === "function" ? el.getBoundingClientRect() : null;
  const text = String(el.innerText || el.textContent || "").replace(/\s+/g, " ").trim();
  return {
    tag: String(el.tagName || "").toLowerCase(),
    id: String(el.id || ""),
    classes: String(el.className || "").split(/\s+/).filter(Boolean).slice(0, 6),
    role: String(el.getAttribute && el.getAttribute("role") || ""),
    ariaLabel: String(el.getAttribute && el.getAttribute("aria-label") || ""),
    name: String(el.getAttribute && el.getAttribute("name") || ""),
    type: String(el.getAttribute && el.getAttribute("type") || ""),
    text: text.slice(0, 40),
    rect: rect ? {
      x: Math.round(rect.x),
      y: Math.round(rect.y),
      w: Math.round(rect.width),
      h: Math.round(rect.height),
    } : null,
  };
}

function sanitizeAICaptureKey(event) {
  if (!event) return "";
  if (event.key && event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) return "character";
  return String(event.key || "");
}

function summarizeAICaptureRawEvent(event) {
  const type = String(event && event.type || "");
  const data = {
    target: sanitizeAICaptureRawTarget(event && event.target),
    ui: {
      workspaceMode: state.workspaceMode,
      uiPage: state.uiPage,
      editMode: state.editMode,
      toolMode: state.slotMesh && state.slotMesh.toolMode,
      editTarget: state.slotMesh && state.slotMesh.editTarget,
    },
  };
  if (type.startsWith("pointer") || type === "click" || type === "dblclick" || type === "contextmenu") {
    data.pointer = {
      x: Math.round(Number(event.clientX) || 0),
      y: Math.round(Number(event.clientY) || 0),
      button: Number(event.button) || 0,
      buttons: Number(event.buttons) || 0,
      pointerType: String(event.pointerType || ""),
    };
  }
  if (type === "wheel") {
    data.wheel = {
      x: Math.round(Number(event.clientX) || 0),
      y: Math.round(Number(event.clientY) || 0),
      deltaX: Math.round(Number(event.deltaX) || 0),
      deltaY: Math.round(Number(event.deltaY) || 0),
    };
  }
  if (type === "keydown" || type === "keyup") {
    data.key = {
      key: sanitizeAICaptureKey(event),
      ctrlKey: !!event.ctrlKey,
      shiftKey: !!event.shiftKey,
      altKey: !!event.altKey,
      metaKey: !!event.metaKey,
    };
  }
  if (type === "input" || type === "change") {
    const target = event && event.target;
    data.input = {
      valueLength: target && target.value != null ? String(target.value).length : 0,
      checked: target && "checked" in target ? !!target.checked : undefined,
      selectedIndex: target && "selectedIndex" in target ? Number(target.selectedIndex) : undefined,
    };
  }
  return data;
}

function pushAICaptureRawInputEvent(event) {
  if (!state || !state.aiCapture || !state.aiCapture.active || !event) return null;
  const type = String(event.type || "");
  const now = Date.now();
  if ((type === "pointermove" || type === "wheel") && now - (Number(state.aiCapture.lastRawMoveAt[type]) || 0) < AI_CAPTURE_RAW_MOVE_INTERVAL_MS) {
    state.aiCapture.rawDroppedCount += 1;
    return null;
  }
  if (type === "pointermove" || type === "wheel") state.aiCapture.lastRawMoveAt[type] = now;
  if (state.aiCapture.rawEventCount >= AI_CAPTURE_RAW_EVENT_LIMIT) {
    state.aiCapture.rawDroppedCount += 1;
    return null;
  }
  state.aiCapture.rawEventCount += 1;
  return pushAICaptureEvent(`raw_${type}`, summarizeAICaptureRawEvent(event), {
    id: `raw.${type}`,
    category: "raw_input",
    domain: state.aiCapture.domain || "app",
    intent: type,
  });
}

function installAICaptureRawInputRecorder() {
  if (window.__aiCaptureRawInputRecorderInstalled) return;
  window.__aiCaptureRawInputRecorderInstalled = true;
  for (const eventName of [
    "pointerdown",
    "pointermove",
    "pointerup",
    "click",
    "dblclick",
    "contextmenu",
    "keydown",
    "keyup",
    "wheel",
    "change",
    "input",
    "focus",
    "blur",
  ]) {
    document.addEventListener(eventName, pushAICaptureRawInputEvent, true);
  }
}

function sanitizeAICaptureData(details = {}) {
  const data = {};
  for (const [key, value] of Object.entries(details || {})) {
    if (key === "before" || key === "after") continue;
    if (key === "ok" || key === "error" || key === "reason") continue;
    if (typeof value === "function") continue;
    data[key] = value;
  }
  return data;
}

function pushAICaptureEvent(kind, details = {}, options = {}) {
  if (!state || !state.aiCapture || !state.aiCapture.active) return null;
  const domain = options.domain || resolveAICaptureEventDomain(kind, details);
  const captureDomain = state.aiCapture.domain || domain;
  if (captureDomain !== "all" && captureDomain !== domain) return null;
  const now = Date.now();
  const seq = Number(options.seq) || ((Number(state.aiCapture.eventSeq) || 0) + 1);
  state.aiCapture.eventSeq = Math.max(Number(state.aiCapture.eventSeq) || 0, seq);
  const event = {
    t: now - (Number(state.aiCapture.startedAt) || now),
    seq,
    at: options.at || new Date(now).toISOString(),
    id: options.id || buildAICaptureEventId(kind, details, domain),
    kind: String(kind || ""),
    category: options.category || resolveAICaptureEventCategory(kind, details),
    domain,
    entity: options.entity || buildAICaptureEntity(details),
    intent: options.intent || resolveAICaptureIntent(kind, details),
    topologyCommand: !!(options.topologyCommand || details.topologyCommand),
    data: sanitizeAICaptureData(details),
  };
  const okSource = options.ok !== undefined ? options : details;
  if (okSource.ok !== undefined) event.ok = !!okSource.ok;
  if (okSource.error !== undefined) event.error = String(okSource.error);
  if (okSource.reason !== undefined) event.reason = String(okSource.reason);
  if (Number.isFinite(options.duration)) event.duration = options.duration;
  if (options.before) event.before = options.before;
  if (options.after) event.after = options.after;
  state.aiCapture.events.push(event);
  return event;
}

function beginAICaptureCommand(command, details = {}, options = {}) {
  const domain = options.domain || "mesh";
  const before = state.aiCapture && state.aiCapture.active ? getAICaptureDomainSnapshot(domain) : null;
  const startedAt = Date.now();
  return (result = {}) => pushAICaptureEvent("command", {
    command,
    ...details,
  }, {
    category: "command",
    domain,
    intent: command,
    topologyCommand: !!options.topologyCommand,
    before,
    after: state.aiCapture && state.aiCapture.active ? getAICaptureDomainSnapshot(domain) : null,
    ok: result.ok,
    error: result.error,
    reason: result.reason,
    duration: Date.now() - startedAt,
  });
}

function runAICaptureCommand(command, details = {}, options = {}, action = null) {
  const run = typeof action === "function" ? action : options;
  const captureOptions = typeof action === "function" ? options : {};
  const finishCapture = beginAICaptureCommand(command, details, captureOptions);
  try {
    const result = typeof run === "function" ? run() : undefined;
    if (result && typeof result.then === "function") {
      return result.then(
        (value) => {
          finishCapture({ ok: true });
          return value;
        },
        (err) => {
          finishCapture({ ok: false, error: err && err.message || String(err) });
          throw err;
        }
      );
    }
    finishCapture({ ok: true });
    return result;
  } catch (err) {
    finishCapture({ ok: false, error: err && err.message || String(err) });
    throw err;
  }
}

function pushMeshDebugEvent(kind, details = {}) {
  const list = Array.isArray(window.__meshDebugEvents) ? window.__meshDebugEvents : [];
  if (list !== window.__meshDebugEvents) window.__meshDebugEvents = list;
  const seq = (Number(window.__meshDebugSeq) || 0) + 1;
  window.__meshDebugSeq = seq;
  const entry = {
    seq,
    at: new Date().toISOString(),
    kind: String(kind || ""),
    ...details,
  };
  list.push(entry);
  if (list.length > MESH_DEBUG_EVENT_LIMIT) {
    list.splice(0, list.length - MESH_DEBUG_EVENT_LIMIT);
  }
  pushAICaptureEvent(kind, details, { domain: "mesh", seq, at: entry.at });
  if (window.__meshDebugEnabled !== false && typeof console !== "undefined" && typeof console.debug === "function") {
    console.debug("[mesh-debug]", entry);
  }
  return entry;
}

if (!Array.isArray(window.__meshDebugEvents)) window.__meshDebugEvents = [];
if (!Number.isFinite(window.__meshDebugSeq)) window.__meshDebugSeq = 0;
if (typeof window.__meshDebugEnabled !== "boolean") window.__meshDebugEnabled = true;
window.__dumpMeshDebugLog = function __dumpMeshDebugLog() {
  return JSON.stringify(window.__meshDebugEvents, null, 2);
};
window.__clearMeshDebugLog = function __clearMeshDebugLog() {
  window.__meshDebugEvents.length = 0;
  window.__meshDebugSeq = 0;
  return 0;
};

function summarizeNumericArray(values, sampleSize = 8) {
  if (!values || typeof values.length !== "number") return { length: 0, sample: [] };
  const length = Number(values.length) || 0;
  const sample = [];
  for (let i = 0; i < Math.min(length, sampleSize); i += 1) {
    sample.push(Number(values[i]) || 0);
  }
  let hash = 2166136261;
  for (let i = 0; i < length; i += 1) {
    hash ^= Math.round((Number(values[i]) || 0) * 1000);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return { length, sample, hash: hash.toString(16).padStart(8, "0") };
}

function summarizePoints(points, sampleSize = 6) {
  const list = Array.isArray(points) ? points : [];
  return {
    count: list.length,
    sample: list.slice(0, sampleSize).map((p) => ({
      x: Number(p && p.x) || 0,
      y: Number(p && p.y) || 0,
    })),
  };
}

function buildMeshCaptureSnapshot() {
  const slot = typeof getActiveSlot === "function" ? getActiveSlot() : null;
  const att = slot && typeof getActiveAttachment === "function" ? getActiveAttachment(slot) : null;
  const contour = slot && typeof ensureSlotContour === "function" ? ensureSlotContour(slot) : null;
  const meshData = att && att.meshData ? att.meshData : null;
  const positions = meshData && meshData.positions;
  const uvs = meshData && meshData.uvs;
  const indices = meshData && meshData.indices;
  return {
    ui: {
      workspaceMode: state.workspaceMode,
      uiPage: state.uiPage,
      editMode: state.editMode,
      toolMode: typeof normalizeSlotMeshToolMode === "function"
        ? normalizeSlotMeshToolMode(state.slotMesh && state.slotMesh.toolMode)
        : state.slotMesh && state.slotMesh.toolMode,
      editTarget: typeof normalizeSlotMeshEditTarget === "function"
        ? normalizeSlotMeshEditTarget(state.slotMesh && state.slotMesh.editTarget)
        : state.slotMesh && state.slotMesh.editTarget,
      activeSet: state.slotMesh && state.slotMesh.activeSet,
      activePoint: state.slotMesh && state.slotMesh.activePoint,
      selectedPoints: state.slotMesh && state.slotMesh.selectedPoints,
      view: {
        scale: Number(state.view && state.view.scale) || 1,
        cx: Number(state.view && state.view.cx) || 0,
        cy: Number(state.view && state.view.cy) || 0,
      },
    },
    slot: slot ? {
      index: Number(state.activeSlot),
      id: slot.id || "",
      name: slot.name || "",
      activeAttachment: slot.activeAttachment || "",
    } : null,
    attachment: att ? {
      name: att.name || "",
      type: att.type || "",
      rect: att.rect || null,
    } : null,
    mesh: meshData ? {
      cols: Number(meshData.cols) || 0,
      rows: Number(meshData.rows) || 0,
      vertexCount: positions ? Math.floor(positions.length / 2) : 0,
      uvCount: uvs ? Math.floor(uvs.length / 2) : 0,
      triangleCount: indices ? Math.floor(indices.length / 3) : 0,
      positions: summarizeNumericArray(positions),
      uvs: summarizeNumericArray(uvs),
      indices: summarizeNumericArray(indices, 12),
    } : null,
    contour: contour ? {
      closed: !!contour.closed,
      dirty: !!contour.dirty,
      fillFromMeshData: !!contour.fillFromMeshData,
      boundary: summarizePoints(contour.points),
      fill: summarizePoints(contour.fillPoints),
      fillTriangles: summarizeNumericArray(contour.fillTriangles, 12),
    } : null,
  };
}

function buildMeshCaptureDiffs(startSnapshot = null, finalSnapshot = null, timeline = []) {
  const startMesh = startSnapshot && startSnapshot.mesh;
  const finalMesh = finalSnapshot && finalSnapshot.mesh;
  if (!startMesh || !finalMesh) return [];
  const topologyCommandCount = Array.isArray(timeline) ? timeline.filter((e) => e && e.topologyCommand).length : 0;
  const add = (id, label, before, after) => ({
    id,
    label,
    changed: before !== after,
    before,
    after,
  });
  return [
    add("mesh.vertex_count_changed", "Vertex count changed", startMesh.vertexCount, finalMesh.vertexCount),
    add("mesh.triangle_count_changed", "Triangle count changed", startMesh.triangleCount, finalMesh.triangleCount),
    add("mesh.position_hash_changed", "Position hash changed", startMesh.positions && startMesh.positions.hash, finalMesh.positions && finalMesh.positions.hash),
    add("mesh.uv_hash_changed", "UV hash changed", startMesh.uvs && startMesh.uvs.hash, finalMesh.uvs && finalMesh.uvs.hash),
    add("mesh.index_hash_changed", "Index hash changed", startMesh.indices && startMesh.indices.hash, finalMesh.indices && finalMesh.indices.hash),
    add("mesh.grid_cols_changed", "Grid column metadata changed", startMesh.cols, finalMesh.cols),
    add("mesh.grid_rows_changed", "Grid row metadata changed", startMesh.rows, finalMesh.rows),
    {
      id: "capture.topology_command_count",
      label: "Topology command count",
      changed: topologyCommandCount > 0,
      before: 0,
      after: topologyCommandCount,
    },
  ];
}

function hasAICaptureGridDrag(timeline = []) {
  return Array.isArray(timeline) && timeline.some((event) => {
    const data = event && event.data || {};
    return event && event.domain === "mesh"
      && event.category === "drag"
      && data.pointSet === "fill"
      && (data.dragType === "slot_mesh_point" || data.dragType === "slot_mesh_multi_move");
  });
}

function buildAICaptureSuspicions({ timeline = [], diffs = [] } = {}) {
  const topologyCommandCount = Array.isArray(timeline) ? timeline.filter((e) => e && e.topologyCommand).length : 0;
  const changed = (id) => diffs.some((d) => d && d.id === id && d.changed);
  const suspicions = [];
  if (hasAICaptureGridDrag(timeline) && topologyCommandCount === 0
    && (changed("mesh.vertex_count_changed") || changed("mesh.uv_hash_changed") || changed("mesh.index_hash_changed"))) {
    suspicions.push({
      id: "mesh.grid_drag_changed_topology_without_command",
      severity: "warning",
      label: "Grid drag changed topology-like data without a topology command",
      evidence: {
        vertexCountChanged: changed("mesh.vertex_count_changed"),
        uvHashChanged: changed("mesh.uv_hash_changed"),
        indexHashChanged: changed("mesh.index_hash_changed"),
      },
    });
  }
  return suspicions;
}

function buildAICaptureHealth(timeline = [], captureDomain = "mesh", startSnapshot = null, finalSnapshot = null) {
  const list = Array.isArray(timeline) ? timeline : [];
  const rawEvents = list.filter((e) => e && e.category === "raw_input");
  const commandEvents = list.filter((e) => e && e.category === "command");
  const captureEvents = list.filter((e) => e && e.category === "capture");
  const semanticEvents = list.filter((e) => e && e.category !== "raw_input" && e.category !== "capture");
  const pointerEvents = rawEvents.filter((e) => String(e.intent || "").startsWith("pointer") || e.intent === "click" || e.intent === "dblclick").length;
  const keyEvents = rawEvents.filter((e) => String(e.intent || "").startsWith("key")).length;
  const durationMs = (Number(state.aiCapture.endedAt) || Date.now()) - (Number(state.aiCapture.startedAt) || Date.now());
  const startUi = startSnapshot && startSnapshot.ui || {};
  const finalUi = finalSnapshot && finalSnapshot.ui || {};
  const meshModeActive = captureDomain !== "mesh"
    || startUi.workspaceMode === "slotmesh"
    || startUi.uiPage === "slot"
    || startUi.editMode === "mesh"
    || finalUi.workspaceMode === "slotmesh"
    || finalUi.uiPage === "slot"
    || finalUi.editMode === "mesh";
  return {
    durationMs: Math.max(0, Math.round(durationMs)),
    rawEventCount: rawEvents.length,
    rawDroppedCount: Number(state.aiCapture.rawDroppedCount) || 0,
    semanticEventCount: semanticEvents.length,
    commandCount: commandEvents.length,
    captureEventCount: captureEvents.length,
    pointerEventCount: pointerEvents,
    keyEventCount: keyEvents,
    likelyUseful: rawEvents.length > 0 || semanticEvents.length > 1 || commandEvents.length > 0,
    domainModeMatches: meshModeActive,
  };
}

function buildAICaptureHealthSuspicions(captureHealth, captureDomain = "mesh") {
  const suspicions = [];
  if (!captureHealth) return suspicions;
  if (captureHealth.rawEventCount === 0 && captureHealth.durationMs > 1000) {
    suspicions.push({
      id: "capture.no_raw_input_events_recorded",
      severity: "warning",
      label: "Capture recorded no raw input events after start",
      evidence: {
        durationMs: captureHealth.durationMs,
        rawEventCount: captureHealth.rawEventCount,
        semanticEventCount: captureHealth.semanticEventCount,
        commandCount: captureHealth.commandCount,
      },
    });
  }
  if (captureHealth.rawEventCount > 0 && captureHealth.semanticEventCount <= 1 && captureHealth.commandCount === 0) {
    suspicions.push({
      id: "capture.raw_input_without_semantic_events",
      severity: "warning",
      label: "Raw input was recorded, but no semantic command or feature events were captured",
      evidence: {
        rawEventCount: captureHealth.rawEventCount,
        semanticEventCount: captureHealth.semanticEventCount,
        commandCount: captureHealth.commandCount,
      },
    });
  }
  if (captureDomain === "mesh" && !captureHealth.domainModeMatches) {
    suspicions.push({
      id: "capture.domain_mode_mismatch",
      severity: "warning",
      label: "Capture domain is mesh, but snapshots do not show Mesh edit mode",
      evidence: {
        domain: captureDomain,
        domainModeMatches: captureHealth.domainModeMatches,
      },
    });
  }
  return suspicions;
}

function runMeshCaptureInvariants(snapshot = buildMeshCaptureSnapshot(), context = {}) {
  const mesh = snapshot && snapshot.mesh;
  const checks = [];
  const add = (id, label, ok, details = {}) => checks.push({ id, label, ok: !!ok, ...details });
  if (!mesh) {
    add("mesh.active_attachment_has_mesh_data", "Active attachment has meshData", false);
    return checks;
  }
  add("mesh.active_attachment_has_mesh_data", "Active attachment has meshData", true);
  add("mesh.uv_count_matches_vertex_count", "UV count matches vertex count", mesh.uvCount === mesh.vertexCount, {
    vertexCount: mesh.vertexCount,
    uvCount: mesh.uvCount,
  });
  const indexLength = mesh.indices && Number(mesh.indices.length) || 0;
  const indexSample = mesh.indices && Array.isArray(mesh.indices.sample) ? mesh.indices.sample : [];
  const sampleInRange = indexSample.every((v) => Number(v) >= 0 && Number(v) < mesh.vertexCount);
  add("mesh.sampled_indices_in_range", "Sampled indices are in range", sampleInRange, { sampled: indexSample.length, vertexCount: mesh.vertexCount });
  add("mesh.triangle_count_nonzero", "Triangle count is nonzero", mesh.triangleCount > 0, { triangleCount: mesh.triangleCount, indexLength });
  const timeline = Array.isArray(context.timeline) ? context.timeline : [];
  const diffs = Array.isArray(context.diffs) ? context.diffs : [];
  const topologyCommandCount = timeline.filter((e) => e && e.topologyCommand).length;
  const changed = (id) => diffs.some((d) => d && d.id === id && d.changed);
  const shouldCheckTopologyPreserve = hasAICaptureGridDrag(timeline) && topologyCommandCount === 0;
  add(
    "mesh.grid_drag_preserves_topology_without_topology_command",
    "Grid drag preserves topology when no topology command ran",
    !shouldCheckTopologyPreserve || (!changed("mesh.vertex_count_changed") && !changed("mesh.uv_hash_changed") && !changed("mesh.index_hash_changed")),
    {
      skipped: !shouldCheckTopologyPreserve,
      topologyCommandCount,
      vertexCountChanged: changed("mesh.vertex_count_changed"),
      uvHashChanged: changed("mesh.uv_hash_changed"),
      indexHashChanged: changed("mesh.index_hash_changed"),
    }
  );
  return checks;
}

registerAICaptureDomain("mesh", {
  label: "Slot Mesh Editor",
  snapshot: buildMeshCaptureSnapshot,
  diff: buildMeshCaptureDiffs,
  invariants: runMeshCaptureInvariants,
  suspicions: buildAICaptureSuspicions,
  commands: [
    "mesh.tool.toggle_add_vertex",
    "mesh.edit_target.boundary",
    "mesh.edit_target.grid",
    "mesh.close_loop",
    "mesh.triangulate_preview",
    "mesh.grid_fill_preview",
    "mesh.auto_foreground_preview",
    "mesh.apply",
    "mesh.create_slot_and_apply",
    "mesh.link_edge",
    "mesh.unlink_edge",
    "mesh.reset_to_grid",
    "mesh.hotkey.toggle_add_vertex",
    "mesh.hotkey.triangulate_preview",
    "mesh.hotkey.delete_vertex",
  ],
});

function startAICapture(domain = "mesh") {
  state.aiCapture.active = true;
  state.aiCapture.domain = String(domain || "mesh");
  state.aiCapture.startedAt = Date.now();
  state.aiCapture.endedAt = 0;
  state.aiCapture.events = [];
  state.aiCapture.marks = [];
  state.aiCapture.eventSeq = 0;
  state.aiCapture.rawEventCount = 0;
  state.aiCapture.rawDroppedCount = 0;
  state.aiCapture.lastRawMoveAt = Object.create(null);
  state.aiCapture.startSnapshot = getAICaptureDomainSnapshot(domain);
  state.aiCapture.lastReportText = "";
  pushAICaptureEvent("capture_start", { domain }, { category: "capture", domain, intent: "capture_start" });
  setStatus("AI Capture started.");
  return state.aiCapture;
}

function markAICaptureIssue(label = "Issue marked") {
  if (!state.aiCapture.active) startAICapture("mesh");
  const mark = {
    t: Date.now() - (Number(state.aiCapture.startedAt) || Date.now()),
    label: String(label || "Issue marked"),
    snapshot: getAICaptureDomainSnapshot(state.aiCapture.domain || "mesh"),
  };
  state.aiCapture.marks.push(mark);
  pushAICaptureEvent("capture_mark", { label: mark.label }, {
    category: "capture",
    domain: state.aiCapture.domain || "mesh",
    intent: "capture_mark",
  });
  setStatus("AI Capture mark added.");
  return mark;
}

function formatAICaptureTargetLabel(target = {}) {
  const tag = target.tag || "unknown";
  const id = target.id ? `#${target.id}` : "";
  const text = target.text ? ` "${target.text}"` : "";
  return `${tag}${id}${text}`;
}

function buildAICaptureGestureSummary(timeline = []) {
  const gestures = [];
  let current = null;
  const raw = (Array.isArray(timeline) ? timeline : []).filter((ev) => ev && ev.category === "raw_input");
  const point = (ev) => {
    const p = ev && ev.data && ev.data.pointer || {};
    return { x: Number(p.x) || 0, y: Number(p.y) || 0, t: Number(ev.t) || 0 };
  };
  const closeCurrent = (fallbackKind = "pointer_drag") => {
    if (!current) return;
    const dx = current.end.x - current.start.x;
    const dy = current.end.y - current.start.y;
    const distance = Math.round(Math.hypot(dx, dy));
    gestures.push({
      id: `raw.gesture.${distance > 3 ? fallbackKind : "pointer_click"}`,
      kind: distance > 3 ? fallbackKind : "pointer_click",
      target: current.target,
      start: current.start,
      end: current.end,
      durationMs: Math.max(0, current.end.t - current.start.t),
      distance,
      sampleCount: current.sampleCount,
      samples: current.samples,
      ui: current.ui,
    });
    current = null;
  };
  for (const ev of raw) {
    const intent = String(ev.intent || "");
    if (intent === "pointerdown") {
      closeCurrent();
      current = {
        target: ev.data && ev.data.target || {},
        start: point(ev),
        end: point(ev),
        sampleCount: 1,
        samples: [point(ev)],
        ui: ev.data && ev.data.ui || {},
      };
      continue;
    }
    if (intent === "pointermove" && current) {
      current.end = point(ev);
      current.sampleCount += 1;
      if (current.samples.length < 5) current.samples.push(point(ev));
      continue;
    }
    if (intent === "pointerup" && current) {
      current.end = point(ev);
      current.sampleCount += 1;
      closeCurrent();
      continue;
    }
    if (intent === "click" && !current) {
      gestures.push({
        id: "raw.gesture.click",
        kind: "click",
        target: ev.data && ev.data.target || {},
        at: point(ev),
        durationMs: 0,
        distance: 0,
        sampleCount: 1,
        ui: ev.data && ev.data.ui || {},
      });
    }
  }
  closeCurrent();
  return gestures;
}

function buildAICaptureCompactMachineData(report, rawGestures = []) {
  const changedDiffs = (report.diffs || []).filter((d) => d && d.changed);
  return {
    version: 3,
    schemaVersion: 3,
    domain: report.capture && report.capture.domain,
    durationMs: report.captureHealth && report.captureHealth.durationMs,
    health: report.captureHealth,
    commandIds: (report.operationLog || []).map((op) => op.id),
    gestureCount: rawGestures.length,
    rawGestureCount: rawGestures.length,
    rawDroppedCount: report.capture && report.capture.rawDroppedCount,
    compressionRatio: report.capture && report.capture.rawEventCount
      ? Number((rawGestures.length / report.capture.rawEventCount).toFixed(3))
      : 0,
    changedDiffs,
    suspicionIds: (report.suspicions || []).map((s) => s.id),
    invariantFailures: (report.invariants || []).filter((i) => i && !i.ok).map((i) => i.id),
  };
}

function formatAICaptureSummaryReport(report, rawGestures = []) {
  const health = report.captureHealth || {};
  const startUi = report.startSnapshot && report.startSnapshot.ui || {};
  const finalUi = report.finalSnapshot && report.finalSnapshot.ui || {};
  const changedDiffs = (report.diffs || []).filter((d) => d && d.changed);
  const machineData = buildAICaptureCompactMachineData(report, rawGestures);
  const lines = [
    "AI_DEBUG_CAPTURE v3",
    "",
    "SUMMARY",
    `- Duration: ${Math.round(Number(health.durationMs) || 0)}ms`,
    `- Domain: ${report.capture && report.capture.domain || ""}`,
    `- UI: ${startUi.workspaceMode || "?"}/${startUi.editMode || "?"} -> ${finalUi.workspaceMode || "?"}/${finalUi.editMode || "?"}`,
    `- Raw input: ${report.capture && report.capture.rawEventCount || 0} events compressed into ${rawGestures.length} gestures; dropped ${report.capture && report.capture.rawDroppedCount || 0}`,
    `- Commands: ${report.capture && report.capture.commandCount || 0}`,
    `- Semantic events: ${health.semanticEventCount || 0}`,
    `- Likely useful: ${health.likelyUseful ? "yes" : "no"}`,
    "",
    "GESTURES",
  ];
  if (rawGestures.length === 0) {
    lines.push("- none");
  } else {
    rawGestures.slice(0, 20).forEach((g, index) => {
      const target = formatAICaptureTargetLabel(g.target);
      if (g.kind === "click") {
        lines.push(`${index + 1}. click ${target} at ${g.at.x},${g.at.y}`);
      } else {
        lines.push(`${index + 1}. ${g.kind} ${target} ${g.start.x},${g.start.y} -> ${g.end.x},${g.end.y}, ${g.durationMs}ms, distance ${g.distance}`);
      }
    });
    if (rawGestures.length > 20) lines.push(`- ${rawGestures.length - 20} more gestures omitted`);
  }
  lines.push("", "SUSPICIONS");
  if ((report.suspicions || []).length === 0) {
    lines.push("- none");
  } else {
    for (const s of report.suspicions || []) lines.push(`- ${s.id}: ${s.label}`);
  }
  lines.push("", "STATE_DIFF");
  if (changedDiffs.length === 0) {
    lines.push("- no tracked state diffs changed");
  } else {
    for (const d of changedDiffs) lines.push(`- ${d.id}: ${d.before} -> ${d.after}`);
  }
  lines.push("", "MACHINE_DATA", JSON.stringify(machineData));
  return lines.join("\n");
}

function buildAICaptureReport({ stop = true } = {}) {
  if (!state.aiCapture.startedAt) startAICapture("mesh");
  if (stop) {
    state.aiCapture.active = false;
    state.aiCapture.endedAt = Date.now();
  }
  const captureDomain = state.aiCapture.domain || "mesh";
  const finalSnapshot = getAICaptureDomainSnapshot(captureDomain);
  const timeline = state.aiCapture.events.slice();
  const diffs = getAICaptureDomainDiffs(captureDomain, state.aiCapture.startSnapshot, finalSnapshot, timeline);
  const captureHealth = buildAICaptureHealth(timeline, captureDomain, state.aiCapture.startSnapshot, finalSnapshot);
  const suspicions = [
    ...getAICaptureDomainSuspicions(captureDomain, { timeline, diffs, startSnapshot: state.aiCapture.startSnapshot, finalSnapshot }),
    ...buildAICaptureHealthSuspicions(captureHealth, captureDomain),
  ];
  const invariants = getAICaptureDomainInvariants(captureDomain, finalSnapshot, {
    timeline,
    diffs,
    startSnapshot: state.aiCapture.startSnapshot,
    finalSnapshot,
  });
  const operationLog = timeline
    .filter((ev) => ev && ev.category === "command")
    .map((ev) => {
      const entry = {
        seq: ev.seq,
        t: ev.t,
        id: ev.id,
        domain: ev.domain,
        intent: ev.intent,
        topologyCommand: ev.topologyCommand,
        ok: ev.ok,
      };
      if (ev.duration !== undefined) entry.duration = ev.duration;
      if (ev.error !== undefined) entry.error = ev.error;
      if (ev.reason !== undefined) entry.reason = ev.reason;
      if (ev.entity && Object.keys(ev.entity).length) entry.entity = ev.entity;
      return entry;
    });
  const rawGestures = buildAICaptureGestureSummary(timeline);
  captureHealth.rawGestureCount = rawGestures.length;
  captureHealth.compressionRatio = captureHealth.rawEventCount
    ? Number((rawGestures.length / captureHealth.rawEventCount).toFixed(3))
    : 0;
  const report = {
    version: 3,
    schemaVersion: 3,
    header: "AI_DEBUG_CAPTURE v3",
    project: "skeletal-editor",
    capture: {
      domain: captureDomain,
      startedAt: new Date(Number(state.aiCapture.startedAt) || Date.now()).toISOString(),
      endedAt: new Date(Number(state.aiCapture.endedAt) || Date.now()).toISOString(),
      eventCount: state.aiCapture.events.length,
      commandCount: operationLog.length,
      markCount: state.aiCapture.marks.length,
      rawEventCount: captureHealth.rawEventCount,
      rawDroppedCount: captureHealth.rawDroppedCount,
    },
    environment: {
      url: String(location && location.href || ""),
      viewport: { w: window.innerWidth, h: window.innerHeight },
      devicePixelRatio: Number(window.devicePixelRatio) || 1,
    },
    operationLog,
    captureHealth,
    rawGestures,
    marks: state.aiCapture.marks.slice(),
    domains: buildAICaptureDomainCoverage(timeline),
    startSnapshot: state.aiCapture.startSnapshot,
    finalSnapshot,
    diffs,
    suspicions,
    invariants,
  };
  const text = formatAICaptureSummaryReport(report, rawGestures);
  state.aiCapture.lastReportText = text;
  return text;
}

async function copyAICaptureReport() {
  const text = buildAICaptureReport({ stop: true });
  if (!navigator.clipboard || typeof navigator.clipboard.writeText !== "function") {
    setStatus("Clipboard API unavailable. AI Capture report built in memory.");
    return false;
  }
  try {
    await navigator.clipboard.writeText(text);
    setStatus("AI Capture report copied.");
    return true;
  } catch (err) {
    console.warn("AI Capture report copy failed.", err);
    setStatus("AI Capture report copy failed.");
    return false;
  }
}

window.__buildAICaptureReport = buildAICaptureReport;
window.__copyAICaptureReport = copyAICaptureReport;
window.__registerAICaptureDomain = registerAICaptureDomain;
window.__listAICaptureDomains = listAICaptureDomains;
installAICaptureRawInputRecorder();

function collectWebGLSupportContextInfo(canvas, contextName) {
  const result = {
    contextName,
    ok: false,
    error: "",
    version: "",
    shadingLanguageVersion: "",
    vendor: "",
    renderer: "",
    unmaskedVendor: "",
    unmaskedRenderer: "",
    maxTextureSize: "unavailable",
    maxViewportDims: "unavailable",
    maxVertexAttribs: "unavailable",
    maxTextureImageUnits: "unavailable",
    extensions: [],
  };
  try {
    const ctx = canvas.getContext(contextName, { alpha: true, premultipliedAlpha: false });
    if (!ctx) {
      result.error = "Context creation returned null.";
      return result;
    }
    result.ok = true;
    result.version = String(ctx.getParameter(ctx.VERSION) || "");
    result.shadingLanguageVersion = String(ctx.getParameter(ctx.SHADING_LANGUAGE_VERSION) || "");
    result.vendor = String(ctx.getParameter(ctx.VENDOR) || "");
    result.renderer = String(ctx.getParameter(ctx.RENDERER) || "");
    result.maxTextureSize = Number(ctx.getParameter(ctx.MAX_TEXTURE_SIZE) || 0);
    result.maxViewportDims = Array.from(ctx.getParameter(ctx.MAX_VIEWPORT_DIMS) || []).join(" x ");
    result.maxVertexAttribs = Number(ctx.getParameter(ctx.MAX_VERTEX_ATTRIBS) || 0);
    result.maxTextureImageUnits = Number(ctx.getParameter(ctx.MAX_TEXTURE_IMAGE_UNITS) || 0);
    const extNames = [
      "WEBGL_debug_renderer_info",
      "OES_element_index_uint",
      "OES_standard_derivatives",
      "OES_vertex_array_object",
      "WEBGL_lose_context",
    ];
    result.extensions = extNames.map((name) => ({ name, supported: !!ctx.getExtension(name) }));
    const dbg = ctx.getExtension("WEBGL_debug_renderer_info");
    if (dbg) {
      result.unmaskedVendor = String(ctx.getParameter(dbg.UNMASKED_VENDOR_WEBGL) || "");
      result.unmaskedRenderer = String(ctx.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || "");
    }
    return result;
  } catch (err) {
    result.error = err && err.message ? err.message : String(err);
    return result;
  }
}

function collectWebGLSupportReport() {
  const canvas = document.createElement("canvas");
  const contexts = ["webgl2", "webgl", "experimental-webgl"].map((name) =>
    collectWebGLSupportContextInfo(canvas, name)
  );
  return {
    checkedAt: new Date().toISOString(),
    userAgent: navigator.userAgent || "",
    platform: navigator.platform || "",
    bootstrap: {
      hasGL,
      isWebGL2,
      hasVAO,
    },
    contexts,
  };
}

function summarizeWebGLSupport(report) {
  const contexts = report && Array.isArray(report.contexts) ? report.contexts : [];
  const webgl2 = contexts.find((item) => item.contextName === "webgl2" && item.ok);
  if (webgl2) return "WebGL2 available.";
  const webgl1 = contexts.find(
    (item) => (item.contextName === "webgl" || item.contextName === "experimental-webgl") && item.ok
  );
  if (webgl1) return "WebGL1 available, WebGL2 unavailable.";
  return "No WebGL context available.";
}

function getPrimaryWebGLSupportContext(report) {
  const contexts = report && Array.isArray(report.contexts) ? report.contexts : [];
  return (
    contexts.find((item) => item.contextName === "webgl2" && item.ok) ||
    contexts.find((item) => (item.contextName === "webgl" || item.contextName === "experimental-webgl") && item.ok) ||
    null
  );
}

function isLikelySoftwareRenderer(entry) {
  if (!entry || !entry.ok) return false;
  const rendererText = [
    entry.unmaskedRenderer,
    entry.unmaskedVendor,
    entry.renderer,
    entry.vendor,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return [
    "swiftshader",
    "llvmpipe",
    "software rasterizer",
    "softpipe",
    "lavapipe",
    "basic render driver",
  ].some((keyword) => rendererText.includes(keyword));
}

function getWebGLSupportExtension(entry, name) {
  return !!(entry && Array.isArray(entry.extensions) && entry.extensions.some((ext) => ext && ext.name === name && ext.supported));
}

function analyzeWebGLSupportReport(report) {
  const contexts = report && Array.isArray(report.contexts) ? report.contexts : [];
  const okContexts = contexts.filter((entry) => entry && entry.ok);
  const best = getPrimaryWebGLSupportContext(report);
  const blockers = [];
  const warnings = [];

  if (!report.bootstrap.hasGL) {
    if (okContexts.length > 0) {
      blockers.push(
        "This browser can create WebGL in the diagnostic probe, but the app did not start with WebGL in this session. The app is currently running on its 2D fallback instead of the WebGL rendering path."
      );
    } else {
      blockers.push(
        "This browser session could not create any WebGL context for the app, so the WebGL rendering path is blocked here."
      );
    }
  }

  if (okContexts.length <= 0) {
    warnings.push(
      "Likely causes: hardware acceleration disabled, GPU/driver blocklist, privacy/security policy, or a remote desktop / virtualization path."
    );
  }

  if (best && best.contextName !== "webgl2") {
    warnings.push("This browser is limited to the older WebGL1 path, so rendering compatibility is lower than a normal WebGL2 session.");
  }

  if (report.bootstrap.hasGL && !report.bootstrap.hasVAO) {
    warnings.push("Vertex array objects are unavailable in this session, so the app falls back to a legacy vertex setup path that may be slower.");
  }

  if (best && isLikelySoftwareRenderer(best)) {
    const rendererName = best.unmaskedRenderer || best.renderer || "software renderer";
    warnings.push(`WebGL is running through ${rendererName}, so interaction and larger scenes may feel noticeably slower.`);
  }

  if (best) {
    const maxTextureSize = Number(best.maxTextureSize);
    if (Number.isFinite(maxTextureSize) && maxTextureSize > 0) {
      if (maxTextureSize < 2048) {
        warnings.push("MAX_TEXTURE_SIZE is below 2048, so larger source images are likely to fail outright or look heavily downscaled.");
      } else if (maxTextureSize < 4096) {
        warnings.push("MAX_TEXTURE_SIZE is below 4096, so larger source images may hit upload limits or reduced quality.");
      }
    }

    const maxTextureImageUnits = Number(best.maxTextureImageUnits);
    if (Number.isFinite(maxTextureImageUnits) && maxTextureImageUnits > 0 && maxTextureImageUnits < 8) {
      warnings.push("MAX_TEXTURE_IMAGE_UNITS is low, which suggests a weaker GPU path with less headroom for heavier rendering workloads.");
    }

    if (best.contextName !== "webgl2" && !getWebGLSupportExtension(best, "OES_vertex_array_object")) {
      warnings.push("WebGL1 is available without OES_vertex_array_object, so this browser is on an older compatibility path that may perform worse.");
    }

    const hasMaskedDetails = !!(best.renderer || best.vendor);
    const hasUnmaskedDetails = !!(best.unmaskedRenderer || best.unmaskedVendor);
    if (!hasMaskedDetails && !hasUnmaskedDetails) {
      warnings.push("Renderer and vendor details are hidden, so driver-specific root causes will be harder to identify in this browser.");
    }
  }

  const verdict = blockers.length > 0 ? "blocked" : warnings.length > 0 ? "degraded" : "supported";
  const verdictLabel = verdict === "blocked" ? "Blocked" : verdict === "degraded" ? "Degraded" : "Supported";
  let summary = "";
  if (verdict === "blocked") {
    summary = blockers[0];
  } else if (verdict === "degraded") {
    summary = warnings[0];
  } else if (report.bootstrap.isWebGL2) {
    summary = "This browser is running the app on its normal WebGL2 path with no obvious blocker detected.";
  } else if (report.bootstrap.hasGL) {
    summary = "This browser is running the app on a compatible WebGL path with no obvious blocker detected.";
  } else {
    summary = summarizeWebGLSupport(report);
  }

  return {
    verdict,
    verdictLabel,
    summary,
    blockers,
    warnings,
  };
}

function formatWebGLSupportReport(report, analysis = analyzeWebGLSupportReport(report)) {
  const lines = [
    `Checked: ${report.checkedAt}`,
    `User agent: ${report.userAgent}`,
    `Platform: ${report.platform}`,
    `Bootstrap: hasGL=${report.bootstrap.hasGL}, isWebGL2=${report.bootstrap.isWebGL2}, hasVAO=${report.bootstrap.hasVAO}`,
    "",
    `Verdict: ${analysis.verdictLabel}`,
    `Summary: ${analysis.summary}`,
    "",
  ];
  if (analysis.blockers.length > 0) {
    lines.push("Critical blockers:");
    for (const item of analysis.blockers) lines.push(`  - ${item}`);
    lines.push("");
  }
  if (analysis.warnings.length > 0) {
    lines.push("Warnings / degraded experience:");
    for (const item of analysis.warnings) lines.push(`  - ${item}`);
    lines.push("");
  }
  lines.push("Raw capability report:");
  lines.push("");
  for (const entry of report.contexts) {
    lines.push(`[${entry.contextName}] ${entry.ok ? "OK" : "FAIL"}`);
    if (entry.error) lines.push(`  Error: ${entry.error}`);
    if (entry.ok) {
      lines.push(`  Version: ${entry.version}`);
      lines.push(`  GLSL: ${entry.shadingLanguageVersion}`);
      lines.push(`  Vendor: ${entry.vendor}`);
      lines.push(`  Renderer: ${entry.renderer}`);
      lines.push(`  Unmasked Vendor: ${entry.unmaskedVendor || "unavailable"}`);
      lines.push(`  Unmasked Renderer: ${entry.unmaskedRenderer || "unavailable"}`);
      lines.push(`  MAX_TEXTURE_SIZE: ${entry.maxTextureSize}`);
      lines.push(`  MAX_VIEWPORT_DIMS: ${entry.maxViewportDims}`);
      lines.push(`  MAX_VERTEX_ATTRIBS: ${entry.maxVertexAttribs}`);
      lines.push(`  MAX_TEXTURE_IMAGE_UNITS: ${entry.maxTextureImageUnits}`);
      lines.push("  Extensions:");
      for (const ext of entry.extensions) {
        lines.push(`    - ${ext.name}: ${ext.supported ? "yes" : "no"}`);
      }
    }
    lines.push("");
  }
  lines.push(`Conclusion: ${summarizeWebGLSupport(report)}`);
  return lines.join("\n");
}

function renderWebGLSupportFindings(listEl, items, emptyText) {
  if (!listEl) return;
  listEl.innerHTML = "";
  listEl.classList.toggle("muted", !items || items.length <= 0);
  const sourceItems = Array.isArray(items) && items.length > 0 ? items : [emptyText];
  for (const item of sourceItems) {
    const li = document.createElement("li");
    li.textContent = item;
    listEl.appendChild(li);
  }
}

function refreshWebGLSupportUI() {
  const analysis = state.webglSupport.analysis || {
    verdict: "neutral",
    verdictLabel: "Not checked",
    summary: "No WebGL support report yet.",
    blockers: [],
    warnings: [],
  };
  if (els.webglSupportVerdict) {
    els.webglSupportVerdict.textContent = analysis.verdictLabel || "Not checked";
    els.webglSupportVerdict.className = `webgl-support-verdict webgl-support-verdict-${analysis.verdict || "neutral"}`;
  }
  if (els.webglSupportSummary) {
    els.webglSupportSummary.textContent = analysis.summary || state.webglSupport.summary || "No WebGL support report yet.";
  }
  renderWebGLSupportFindings(
    els.webglSupportBlockers,
    analysis.blockers,
    "No critical blocker is highlighted for this browser session."
  );
  renderWebGLSupportFindings(
    els.webglSupportWarnings,
    analysis.warnings,
    "No obvious degraded-experience warning is highlighted for this browser session."
  );
  if (els.webglSupportReport) {
    els.webglSupportReport.textContent =
      state.webglSupport.reportText || "Run the check to inspect browser WebGL support.";
    els.webglSupportReport.classList.toggle("muted", !state.webglSupport.raw);
  }
  if (els.webglSupportCopyBtn) {
    els.webglSupportCopyBtn.disabled = !state.webglSupport.raw;
  }
}

function runWebGLSupportCheck() {
  try {
    const report = collectWebGLSupportReport();
    const analysis = analyzeWebGLSupportReport(report);
    state.webglSupport.lastCheckedAt = Date.now();
    state.webglSupport.summary = analysis.summary;
    state.webglSupport.analysis = analysis;
    state.webglSupport.reportText = formatWebGLSupportReport(report, analysis);
    state.webglSupport.raw = report;
    refreshWebGLSupportUI();
    setStatus(`WebGL support checked. ${analysis.verdictLabel}. ${analysis.summary}`);
    return report;
  } catch (err) {
    const message = err && err.message ? err.message : String(err);
    console.warn("WebGL support check failed.", err);
    state.webglSupport.lastCheckedAt = Date.now();
    state.webglSupport.summary = "WebGL support check failed.";
    state.webglSupport.analysis = {
      verdict: "blocked",
      verdictLabel: "Blocked",
      summary: "WebGL support check failed before the browser capabilities could be analyzed.",
      blockers: [`Diagnostic failure: ${message}`],
      warnings: [],
    };
    state.webglSupport.reportText = `Failed to inspect WebGL support.\nError: ${message}`;
    state.webglSupport.raw = null;
    refreshWebGLSupportUI();
    setStatus("WebGL support check failed. See report for details.");
    return null;
  }
}

async function copyWebGLSupportReport() {
  if (!state.webglSupport.raw || !state.webglSupport.reportText) {
    setStatus("Run the WebGL support check first.");
    return false;
  }
  if (!navigator.clipboard || typeof navigator.clipboard.writeText !== "function") {
    setStatus("Clipboard API unavailable in this browser.");
    return false;
  }
  try {
    await navigator.clipboard.writeText(state.webglSupport.reportText);
    setStatus("WebGL support report copied.");
    return true;
  } catch (err) {
    console.warn("WebGL support report copy failed.", err);
    setStatus("WebGL support report copy failed.");
    return false;
  }
}

function openWebGLSupportDialog(runCheck = false) {
  if (!els.webglSupportDialogWrap) return;
  if (!state.webglSupport.open) {
    state.webglSupport.lastFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  }
  state.webglSupport.open = true;
  refreshWebGLSupportUI();
  els.webglSupportDialogWrap.classList.remove("collapsed");
  els.webglSupportDialogWrap.setAttribute("aria-hidden", "false");
  if (runCheck) {
    runWebGLSupportCheck();
  } else if (els.webglSupportCheckBtn && typeof els.webglSupportCheckBtn.focus === "function") {
    els.webglSupportCheckBtn.focus();
  }
}

function closeWebGLSupportDialog() {
  if (!state.webglSupport.open || !els.webglSupportDialogWrap) return;
  state.webglSupport.open = false;
  els.webglSupportDialogWrap.classList.add("collapsed");
  els.webglSupportDialogWrap.setAttribute("aria-hidden", "true");
  const prevFocus = state.webglSupport.lastFocus;
  state.webglSupport.lastFocus = null;
  if (prevFocus && typeof prevFocus.focus === "function") prevFocus.focus();
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
      case "view.resetlayout":
        resetDockLayout();
        setStatus("Layout reset.");
        return;
      case "tools.resetpose":
        click(els.resetPoseBtn);
        return;
      case "tools.resetvertex":
        click(els.resetVertexBtn);
        return;
      case "tools.webglsupport":
        openWebGLSupportDialog(true);
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
    if (String(ev.key || "").toLowerCase() === "escape") {
      if (openKey) setOpen("");
      if (state.webglSupport && state.webglSupport.open) closeWebGLSupportDialog();
    }
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
  if (typeof refreshWeightOverlayQuickBtn === "function") refreshWeightOverlayQuickBtn();
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

function clampOverlayByte(value) {
  return math.clamp(Math.round(Number(value) || 0), 0, 255);
}

function hslToRgbParts(h, s, l) {
  const hue = ((((Number(h) || 0) % 360) + 360) % 360) / 360;
  const sat = math.clamp(Number(s) || 0, 0, 100) / 100;
  const light = math.clamp(Number(l) || 0, 0, 100) / 100;
  if (sat <= 1e-6) {
    const gray = clampOverlayByte(light * 255);
    return { r: gray, g: gray, b: gray };
  }
  const q = light < 0.5 ? light * (1 + sat) : light + sat - light * sat;
  const p = 2 * light - q;
  const hueToRgb = (t) => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };
  return {
    r: clampOverlayByte(hueToRgb(hue + 1 / 3) * 255),
    g: clampOverlayByte(hueToRgb(hue) * 255),
    b: clampOverlayByte(hueToRgb(hue - 1 / 3) * 255),
  };
}

function getWeightOverlayAlphaByte(value, alphaScale = 1) {
  const scale = Number(alphaScale) || 0;
  if (scale <= 0) return 0;
  const clampedValue = math.clamp(Number(value) || 0, 0, 1);
  const alpha = math.clamp((0.2 + 0.65 * clampedValue) * scale, 0.05, 1);
  return clampOverlayByte(alpha * 255);
}

function getHeatmapColorRgba(t, alphaScale = 1) {
  const parts = getHeatmapColorParts(t);
  return {
    r: parts.r,
    g: parts.g,
    b: parts.b,
    a: getWeightOverlayAlphaByte(parts.value, alphaScale),
  };
}

function getBoneVizColorRgba(index, alpha = 0.72, strength = 1) {
  const parts = getBoneVizColorParts(index, strength);
  const rgb = hslToRgbParts(parts.h, parts.s, parts.l);
  return {
    r: rgb.r,
    g: rgb.g,
    b: rgb.b,
    a: clampOverlayByte(math.clamp(Number(alpha) || 0, 0, 1) * 255),
  };
}

function getWeightHeatmapCanvas(width, height) {
  const w = Math.max(1, Math.ceil(Number(width) || 1));
  const h = Math.max(1, Math.ceil(Number(height) || 1));
  if (!state.weightHeatmapCanvas) state.weightHeatmapCanvas = makeCanvas(w, h);
  if (state.weightHeatmapCanvas.width !== w) state.weightHeatmapCanvas.width = w;
  if (state.weightHeatmapCanvas.height !== h) state.weightHeatmapCanvas.height = h;
  return state.weightHeatmapCanvas;
}

function rasterizeWeightHeatmapTriangle(imageData, stride, bounds, points, colorize) {
  if (!imageData || !bounds || !Array.isArray(points) || points.length !== 3 || typeof colorize !== "function") return;
  const edge = (ax, ay, bx, by, px, py) => (px - ax) * (by - ay) - (py - ay) * (bx - ax);
  const p0 = points[0];
  const p1 = points[1];
  const p2 = points[2];
  const area = edge(p0.x, p0.y, p1.x, p1.y, p2.x, p2.y);
  if (!Number.isFinite(area) || Math.abs(area) < 1e-6) return;
  const invArea = 1 / area;
  for (let y = bounds.minY; y <= bounds.maxY; y += 1) {
    for (let x = bounds.minX; x <= bounds.maxX; x += 1) {
      const px = x + 0.5;
      const py = y + 0.5;
      const w0 = edge(p1.x, p1.y, p2.x, p2.y, px, py) * invArea;
      const w1 = edge(p2.x, p2.y, p0.x, p0.y, px, py) * invArea;
      const w2 = edge(p0.x, p0.y, p1.x, p1.y, px, py) * invArea;
      if (w0 < -1e-5 || w1 < -1e-5 || w2 < -1e-5) continue;
      const rgba = colorize(w0, w1, w2, px, py);
      if (!rgba) continue;
      const alpha = clampOverlayByte(rgba.a);
      if (alpha <= 0) continue;
      const idx = (y * stride + x) * 4;
      imageData[idx] = clampOverlayByte(rgba.r);
      imageData[idx + 1] = clampOverlayByte(rgba.g);
      imageData[idx + 2] = clampOverlayByte(rgba.b);
      imageData[idx + 3] = alpha;
    }
  }
}

function drawContinuousWeightHeatmap(ctx, m, meshData, screenPoints, vertexInfos, mode, selectedBone, selectedValid, alphaBase) {
  if (!ctx || !m || !meshData || !screenPoints || !Array.isArray(vertexInfos) || vertexInfos.length === 0) return;
  const triIndices = getMeshTriangleIndexArray(meshData);
  const weights = meshData.weights;
  const boneCount = Array.isArray(m.rigBones) ? m.rigBones.length : 0;
  const vCount = Math.floor((Number(screenPoints.length) || 0) / 2);
  if (!triIndices || triIndices.length < 3 || !weights || boneCount <= 0 || vCount <= 0) return;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (let i = 0; i < vCount; i += 1) {
    const sx = Number(screenPoints[i * 2]);
    const sy = Number(screenPoints[i * 2 + 1]);
    if (!Number.isFinite(sx) || !Number.isFinite(sy)) continue;
    if (sx < minX) minX = sx;
    if (sy < minY) minY = sy;
    if (sx > maxX) maxX = sx;
    if (sy > maxY) maxY = sy;
  }
  if (!Number.isFinite(minX) || !Number.isFinite(minY) || !Number.isFinite(maxX) || !Number.isFinite(maxY)) return;
  const originX = Math.floor(minX);
  const originY = Math.floor(minY);
  const width = Math.max(1, Math.ceil(maxX) - originX + 1);
  const height = Math.max(1, Math.ceil(maxY) - originY + 1);
  const canvas = getWeightHeatmapCanvas(width, height);
  const heatCtx = canvas && typeof canvas.getContext === "function" ? canvas.getContext("2d") : null;
  if (!heatCtx || typeof heatCtx.createImageData !== "function") return;
  const image = heatCtx.createImageData(width, height);
  const data = image.data;
  const isDominant = mode === "dominant" || !selectedValid;
  for (let t = 0; t + 2 < triIndices.length; t += 3) {
    const i0 = Number(triIndices[t]);
    const i1 = Number(triIndices[t + 1]);
    const i2 = Number(triIndices[t + 2]);
    if (!Number.isFinite(i0) || !Number.isFinite(i1) || !Number.isFinite(i2)) continue;
    if (i0 < 0 || i1 < 0 || i2 < 0 || i0 >= vCount || i1 >= vCount || i2 >= vCount) continue;
    const points = [
      { x: (Number(screenPoints[i0 * 2]) || 0) - originX, y: (Number(screenPoints[i0 * 2 + 1]) || 0) - originY },
      { x: (Number(screenPoints[i1 * 2]) || 0) - originX, y: (Number(screenPoints[i1 * 2 + 1]) || 0) - originY },
      { x: (Number(screenPoints[i2 * 2]) || 0) - originX, y: (Number(screenPoints[i2 * 2 + 1]) || 0) - originY },
    ];
    const bounds = {
      minX: Math.max(0, Math.floor(Math.min(points[0].x, points[1].x, points[2].x))),
      minY: Math.max(0, Math.floor(Math.min(points[0].y, points[1].y, points[2].y))),
      maxX: Math.min(width - 1, Math.ceil(Math.max(points[0].x, points[1].x, points[2].x))),
      maxY: Math.min(height - 1, Math.ceil(Math.max(points[0].y, points[1].y, points[2].y))),
    };
    if (bounds.maxX < bounds.minX || bounds.maxY < bounds.minY) continue;
    if (isDominant) {
      rasterizeWeightHeatmapTriangle(data, width, bounds, points, (w0, w1, w2) => {
        let domBone = 0;
        let domWeight = -1;
        for (let b = 0; b < boneCount; b += 1) {
          const weight =
            (Number(weights[i0 * boneCount + b]) || 0) * w0 +
            (Number(weights[i1 * boneCount + b]) || 0) * w1 +
            (Number(weights[i2 * boneCount + b]) || 0) * w2;
          if (weight > domWeight) {
            domWeight = weight;
            domBone = b;
          }
        }
        const alpha = alphaBase * (0.16 + 0.56 * math.clamp(domWeight, 0, 1));
        return getBoneVizColorRgba(domBone, alpha, domWeight);
      });
    } else {
      const values = [vertexInfos[i0].selectedW, vertexInfos[i1].selectedW, vertexInfos[i2].selectedW];
      rasterizeWeightHeatmapTriangle(data, width, bounds, points, (w0, w1, w2) => {
        const value = values[0] * w0 + values[1] * w1 + values[2] * w2;
        return getHeatmapColorRgba(value, alphaBase);
      });
    }
  }
  heatCtx.putImageData(image, 0, 0);
  ctx.drawImage(canvas, originX, originY);
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
  // Prefer the GPU heatmap (dedicated #glOverlayCanvas). It handles both brush
  // strokes and steady state at full resolution; the legacy CPU fallbacks
  // remain only for the no-WebGL case.
  let gpuOk = false;
  if (typeof weightHeatmapGPU !== "undefined" && weightHeatmapGPU && typeof weightHeatmapGPU.draw === "function") {
    try {
      gpuOk = weightHeatmapGPU.draw(m, meshData, screenPoints, vertexInfos, mode, selectedBone, selectedValid, alphaBase);
    } catch (err) {
      console.warn("[weightHeatmapGPU] draw failed; falling back to CPU", err);
      gpuOk = false;
    }
  }
  if (!gpuOk) {
    const stroking = !!(state.drag && state.drag.type === "weight_brush");
    if (stroking) {
      drawWeightOverlayFastTriangles(ctx, meshData, screenPoints, vertexInfos, mode, selectedValid, alphaBase);
    } else {
      drawContinuousWeightHeatmap(ctx, m, meshData, screenPoints, vertexInfos, mode, selectedBone, selectedValid, alphaBase);
    }
  }
  drawWeightMeshOutline(ctx, meshData, screenPoints);
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

// Cheap fallback: one fill per triangle using averaged corner colour.
// O(triangles), no per-pixel work. Used during brush strokes.
function drawWeightOverlayFastTriangles(ctx, meshData, screenPoints, vertexInfos, mode, selectedValid, alphaBase) {
  const triIndices = getMeshTriangleIndexArray(meshData);
  const vCount = vertexInfos.length;
  if (!triIndices || triIndices.length < 3) return;
  const isDominant = mode === "dominant" || !selectedValid;
  ctx.save();
  for (let t = 0; t + 2 < triIndices.length; t += 3) {
    const i0 = Number(triIndices[t]);
    const i1 = Number(triIndices[t + 1]);
    const i2 = Number(triIndices[t + 2]);
    if (!Number.isFinite(i0) || !Number.isFinite(i1) || !Number.isFinite(i2)) continue;
    if (i0 < 0 || i1 < 0 || i2 < 0 || i0 >= vCount || i1 >= vCount || i2 >= vCount) continue;
    const a0 = vertexInfos[i0];
    const a1 = vertexInfos[i1];
    const a2 = vertexInfos[i2];
    let fill;
    if (isDominant) {
      // Pick the dominant bone of the corner with the highest weight (cheap; biased toward strongest).
      const winner = a0.domW >= a1.domW && a0.domW >= a2.domW ? a0 : a1.domW >= a2.domW ? a1 : a2;
      const avgW = (a0.domW + a1.domW + a2.domW) / 3;
      const alpha = alphaBase * (0.14 + 0.42 * avgW);
      fill = getBoneVizColor(winner.domBone, alpha, avgW);
    } else {
      const avg = (a0.selectedW + a1.selectedW + a2.selectedW) / 3;
      fill = getHeatmapColorWithAlpha(avg, alphaBase * 0.75);
    }
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.moveTo(Number(screenPoints[i0 * 2]) || 0, Number(screenPoints[i0 * 2 + 1]) || 0);
    ctx.lineTo(Number(screenPoints[i1 * 2]) || 0, Number(screenPoints[i1 * 2 + 1]) || 0);
    ctx.lineTo(Number(screenPoints[i2 * 2]) || 0, Number(screenPoints[i2 * 2 + 1]) || 0);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
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
// updateWorkspaceUI / refreshWorkspacePageUI: full UI state sync,
//   controls workspace tab active state, left panel tab visibility,
//   timeline/layer/state dock visibility.
// ============================================================
let loc = null;
let vbo = null;
let ibo = null;
let vao = null;

// Wrapped so we can rebuild after a webglcontextlost/webglcontextrestored cycle.
function initMainGLResources() {
  if (!hasGL) return;
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
  uniform vec3 uDark;
  out vec4 outColor;
  void main() {
    vec4 c = texture(uTex, vUv);
    // Spine-style two-color tint: light*tex.rgb + (1-tex.rgb)*dark*tex.a
    // When dark = (0,0,0) this collapses to tex.rgb * light, so legacy slots
    // (no dark color set) render identically to the original single-color path.
    vec3 rgb = c.rgb * uTint + (vec3(1.0) - c.rgb) * uDark * c.a;
    outColor = vec4(rgb, c.a * uAlpha);
  }`
      : `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uTex;
  uniform float uAlpha;
  uniform vec3 uTint;
  uniform vec3 uDark;
  void main() {
    vec4 c = texture2D(uTex, vUv);
    vec3 rgb = c.rgb * uTint + (vec3(1.0) - c.rgb) * uDark * c.a;
    gl_FragColor = vec4(rgb, c.a * uAlpha);
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
    uDark: gl.getUniformLocation(program, "uDark"),
  };

  vbo = gl.createBuffer();
  ibo = gl.createBuffer();
  vao = hasVAO ? gl.createVertexArray() : null;
}
initMainGLResources();

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

function finishMainGLSetup() {
  if (!hasGL) return;
  setupVertexLayout();
  if (hasVAO) {
    gl.bindVertexArray(null);
  }
  gl.uniform1i(loc.uTex, 0);
  gl.uniform1f(loc.uAlpha, 1);
  if (loc.uTint) gl.uniform3f(loc.uTint, 1, 1, 1);
  if (loc.uDark) gl.uniform3f(loc.uDark, 0, 0, 0);
}
finishMainGLSetup();

// Rebuild path on context restore — runs after webglcontextrestored fires and
// the toolkit has cleared its caches. The texture cache is invalidated too,
// so subsequent ensureGLTextureForCanvas() calls will re-upload.
function rebuildMainGLAfterRestore() {
  if (!hasGL) return;
  try {
    initMainGLResources();
    finishMainGLSetup();
    if (typeof resetGLTextureCache === "function") resetGLTextureCache();
    console.info("[main-gl] resources rebuilt after context restore");
  } catch (err) {
    console.error("[main-gl] rebuild after restore failed", err);
  }
}
// Register the restore callback once gl-toolkit (which loads AFTER this file)
// has populated window.glToolkit. We use the next macrotask so toolkit's IIFE
// has run by then.
if (typeof window !== "undefined" && hasGL) {
  setTimeout(() => {
    if (window.glToolkit && typeof window.glToolkit.onContextRestored === "function") {
      window.glToolkit.onContextRestored((label) => {
        if (label === "main") rebuildMainGLAfterRestore();
      });
    }
  }, 0);
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
