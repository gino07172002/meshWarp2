# Icons

`tauri build` requires the icons listed in `tauri.conf.json` → `bundle.icon`:

- `32x32.png`
- `128x128.png`
- `128x128@2x.png`
- `icon.icns` (macOS)
- `icon.ico` (Windows)

To generate all of them from a single 1024×1024 source PNG:

```bash
npx @tauri-apps/cli icon path/to/source.png
```

`tauri dev` does NOT require these files — only `tauri build` does.
