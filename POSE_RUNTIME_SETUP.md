# Pose Runtime Local Setup

The humanoid bone auto-rig now tries these runtime sources in order:

1. `./vendor/mediapipe/pose`
2. `./vendor/pose-runtime`
3. CDN fallback

If you want to avoid waiting for repeated downloads, put the runtime files in the local folders below and serve the project from HTTP as usual.

## Recommended local setup

Create these files:

```text
vendor/
  mediapipe/
    pose/
      pose.js
      pose_solution_packed_assets_loader.js
      pose_solution_simd_wasm_bin.js
      pose_solution_simd_wasm_bin.wasm
      pose_solution_wasm_bin.js
      pose_solution_wasm_bin.wasm
  pose-runtime/
    pose-detection.js
```

This lets the app use the MediaPipe runtime entirely from local files.

## Optional TFJS local fallback

You can also place these files in `vendor/pose-runtime/`:

```text
tfjs-core.js
tfjs-converter.js
tfjs-backend-webgl.js
pose-detection.js
```

If the local MediaPipe runtime is missing, the app will try this TFJS set next.

## Notes

- File names are expected exactly as shown above.
- Keep the folder structure unchanged because `solutionPath` points to `./vendor/mediapipe/pose`.
- If local files are missing, the app falls back to jsDelivr CDN automatically.
