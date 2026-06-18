---
name: HIAP workspace structure
description: Where HIAP source files actually live and how the dev server is launched
---

**Real source:** `/home/runner/workspace/app/artifacts/hiap/` — this is the registered artifact dir and the workflow CWD.

**Stale copy:** `/home/runner/workspace/artifacts/hiap/` — old flat artifact path, has the populated node_modules but is not what the workflow uses.

**Node modules:** `app/artifacts/hiap/node_modules` is symlinked → `/home/runner/workspace/artifacts/hiap/node_modules` (32 packages incl. vite, react, @vitejs/plugin-react, @tailwindcss/vite).

**Run command (artifact.toml):** Direct node invocation — no pnpm/npm needed:
```
bash -c 'PATH=/nix/store/bl6iwirn83qj9r8wng43kfdqd5mfahj8-nodejs-22.22.0/bin:$PATH node node_modules/vite/bin/vite.js --config vite.config.ts --host 0.0.0.0'
```

**Why:** pnpm is not in the workflow PATH; node is only available via explicit nix store path. The project uses npm workspaces (package-lock.json) not pnpm.

**vite.config.ts:** Reads `PORT` env var (required, not optional) for the dev server port. `BASE_PATH` also required. API proxy hardcoded to `localhost:8080`.

**Port config:** `localPort = 3000` in artifact.toml, `PORT = "3000"` in env. The artifact-router owns port 20040 externally.
