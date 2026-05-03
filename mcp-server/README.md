# animation-editor-mcp

MCP server that lets an AI agent (Claude Code, Cursor, any MCP client) drive
the editor headlessly. No browser window, no clicks, no DOM scraping.

## How it works

```
[ MCP client (Claude Code) ]
         │  stdio JSON-RPC
         ▼
[ animation-editor-mcp.js ]
         │  Playwright CDP
         ▼
[ headless Chromium ]
         │
         ▼
[ index.html → window.ai → editor logic ]
```

Tool list is fetched live from `window.ai.tools()` at MCP `initialize` time —
no hand-written tool catalog. New palette commands in the editor become MCP
tools automatically the next time the server starts.

## Run it

The server is zero-config; it bundles a tiny static server so you don't need
`python -m http.server`.

```bash
node mcp-server/animation-editor-mcp.js --repo /abs/path/to/repo
```

(`--repo` defaults to the parent of `mcp-server/`, so running from the repo
root needs no args.)

## Add to Claude Code

```bash
claude mcp add anim-editor -- node /abs/path/to/mcp-server/animation-editor-mcp.js
```

After that, Claude Code lists every editor command (file.*, mode.*, ai.*) as
callable tools. The editor stays alive across tool calls, so iterative edits
preserve state.

## Demo without a real MCP client

```bash
node mcp-server/demo-client.js
```

Spawns the server, runs the full handshake, lists tools, calls a few
representative ones (import image, mode change, animation time, screenshot,
project export), and proves the error path on a missing tool. Useful for
verifying changes without spinning up Claude Code.

## Tool surface

All `ai.*` tools take structured args (validated by JSON schema). Headless I/O:

| Tool | Args | Effect |
|---|---|---|
| `ai.import_image` | `dataUrl` or `url`, optional `name` | Adds a slot from raw image bytes — no file picker |
| `ai.export_spine_json` | — | Returns the Spine 4.x JSON tree as a structured object |
| `ai.export_project_json` | — | Returns the native project payload (round-trippable) |
| `ai.load_project` | `json` (object) or `jsonString` | Loads a project payload — no file picker |
| `ai.screenshot` | optional `format` | Returns a composite PNG/JPEG of the canvas |
| `ai.export_animation_frame` | `time`, optional `format` | Sets pose to time `t` then screenshots |
| `ai.select_slot` | `name` or `index` | Activates a slot |
| `ai.select_bone` | `name` or `index` | Selects a bone |
| `ai.set_animation_time` | `time` | Scrub the timeline |
| `ai.set_active_animation` | `name` or `index` | Switch active animation |

Plus every command-palette entry (file.new, mode.skeleton, edit.undo, …) is
exposed verbatim.

## Files

| File | Role |
|---|---|
| `animation-editor-mcp.js` | The MCP server — stdio JSON-RPC, persistent Chromium |
| `demo-client.js` | Pretends to be Claude Code; useful for end-to-end testing |

## When this isn't the right answer

If your target is "user opens the website and chats with an AI", you don't
need MCP at all — `window.ai` is already a complete in-page agent surface.
This server is specifically for "AI agent in another process drives the
editor".
