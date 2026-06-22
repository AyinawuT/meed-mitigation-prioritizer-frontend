---
name: HIAP artifact port routing
description: How Replit's proxy determines which port to route to for each artifact service, and the bash/pnpm PATH issue.
---

## Proxy port routing rule
Replit's global proxy routes to the port declared in `[services.env] PORT = "..."` (or the bash run command's `PORT=...`), NOT by scanning openPorts or using localPort directly. However, `localPort` in artifact.toml controls what PORT value the system injects into the workflow environment when no explicit PORT is set.

**Rule:** Set `localPort` and `PORT` (in [services.env] + bash cmd) to the SAME value. Make the service actually listen on that port.

**Why:** The proxy saw `PORT=3000` from HIAP's old [services.env] and routed `/` to port 3000 (where the API server was), ignoring localPort=20040 (Vite).

**Fix applied:**
- HIAP: `localPort=3000`, bash cmd `PORT=3000`, Vite listens on `PORT` env var → proxy routes `/` to Vite on 3000 ✓  
- API server: `localPort=8080`, system injects `PORT=8080`, Express listens on 8080 → Vite proxies `/api` to 8080 ✓

## pnpm in bash -c after artifact.toml mutations
After multiple `verifyAndReplaceArtifactToml` calls, the workflow runner switches from direct exec mode (pnpm on PATH) to bash mode (pnpm NOT on PATH). This affects both HIAP and the API server.

**Symptom:** `bash: pnpm: command not found` even for commands that previously worked.

**Fix:** Switch ALL run commands to use the full Nix node path directly:
```bash
bash -c 'export PATH=/nix/store/bl6iwirn83qj9r8wng43kfdqd5mfahj8-nodejs-22.22.0/bin:$PATH; ...'
```
Use `export PATH=...;` (semicolon, not inline) so PATH persists for all subsequent commands in the same bash session.

## API server dev run command (current working state)
```toml
[services.development]
run = "bash -c 'export PATH=/nix/store/bl6iwirn83qj9r8wng43kfdqd5mfahj8-nodejs-22.22.0/bin:$PATH; node ./build.mjs && node --enable-source-maps ./dist/index.mjs'"
```
CWD is `app/artifacts/api-server/`. PORT defaults to 8080 (system-injected based on localPort=8080).

## HIAP Vite dev run command (current working state)
```toml
[services.development]
run = "bash -c 'export PATH=/nix/store/bl6iwirn83qj9r8wng43kfdqd5mfahj8-nodejs-22.22.0/bin:$PATH; PORT=3000 VITE_API_PORT=8080 BASE_PATH=/ node node_modules/vite/bin/vite.js --config vite.config.ts --host 0.0.0.0'"
```
CWD is `app/artifacts/hiap/`. Vite listens on PORT=3000, proxies /api+/v1 to localhost:8080.

## API server port defaulting
`app/artifacts/api-server/src/index.ts` defaults PORT to "3001" as a fallback (but in practice Replit injects PORT=8080 based on localPort=8080, so the default is rarely hit).
