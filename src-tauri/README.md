# Tauri desktop wrapper

This folder packages the static editor (`index.html` + `app/` + `styles.css` + `vendor/`) as a native desktop app via [Tauri v2](https://tauri.app/).

No editor source code is changed by the wrapper — Tauri just hosts the same `index.html` inside a webview window. `localStorage`, autosave, file inputs and download blobs all keep working.

## One-time install

1. **Rust toolchain** — install via [rustup](https://rustup.rs/). Make sure `cargo --version` works.
2. **Platform deps** — Windows: install the [WebView2 Runtime](https://developer.microsoft.com/microsoft-edge/webview2/) (preinstalled on Win11). macOS/Linux: see [tauri prerequisites](https://tauri.app/start/prerequisites/).
3. **Node + Tauri CLI** — from the repo root:
   ```bash
   npm install
   ```

## Run in dev

From the repo root (`d:\claude`):

```bash
npm run dev
```

This launches a desktop window pointed at `index.html`. Hot-reload of frontend files works because Tauri serves them as static assets.

## Build installer

```bash
npm run build
```

Output: `src-tauri/target/release/bundle/` (msi/exe on Windows, dmg on macOS, deb/AppImage on Linux).

**Before first build**, generate icons:
```bash
npx @tauri-apps/cli icon path/to/your-1024.png
```
(see `icons/README.md`)

## What's bundled / what's not

`.tauriignore` (repo root) excludes `node_modules/`, `tools/`, `docs/`, `mcp-server/`, `runs/`, etc. so they don't bloat the installer. The shipped bundle contains:

- `index.html`, `styles.css`
- `app/` (all editor JS)
- `vendor/` (sparse-cholesky, vendored pose-runtime, mediapipe)

## CSP notes

Current CSP in `tauri.conf.json` allows `https://cdn.jsdelivr.net` for:
- `app/image/image-bg-removal.js` — `@imgly/background-removal` ESM
- `app/core/runtime-pose-autorig.js` (fallback when local vendor unavailable)

To go fully offline-capable, vendor those too and tighten CSP to `default-src 'self' tauri:`.

## Architecture note

There is **no IPC** between the webview and Rust — the editor is pure client-side. `src/lib.rs` is the minimum boilerplate. Add Tauri commands here only if you later need native filesystem write access (current download-blob path already works).
