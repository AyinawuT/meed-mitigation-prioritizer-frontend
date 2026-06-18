---
name: HIAP artifact router routing fix
description: How the HIAP artifact routing was broken and the actual fix applied.
---

## Architecture (no artifact router binary)

There is NO separate artifact router process in this container. Routing is done entirely by the Replit proxy infrastructure (outside the container). The `.replit` port mappings are direct:

```
localPort 20040 → externalPort 80   ← Vite must run HERE for preview to work
localPort  8080 → externalPort 8080 ← API server
localPort  3000 → externalPort 3001 ← (free)
localPort 20041 → externalPort 3000 ← (alternate mapping, was used during debugging)
```

## Root cause of preview not loading

The migration left a stale Vite process (PID from previous session) running on port 20040 from `/home/runner/workspace/artifacts/hiap/` (the OLD flat copy). That process had no `vite.config.ts` so Vite used defaults which block all external hosts → 403/404 for preview.

Meanwhile the current `app/artifacts/hiap: web` workflow was configured to run on port 20041 (mapped to external:3000), not port 20040 (external:80).

## Fix applied

1. Kill old stale Vite process: `kill <PID>`
2. Update `artifact.toml` + `PORT` env: `localPort = 20040`, `PORT = "20040"`
3. Restart `app/artifacts/hiap: web` workflow → Vite starts on 20040
4. `vite.config.ts` already has `allowedHosts: true` (fixed earlier in session)

## Key rule

**Vite must always run on port 20040** for the main preview (external:80) to work. If a stale process occupies 20040, Vite will pick another port (20041, 5173, etc.) and the preview will be blank. Always verify `Local: http://localhost:20040/` in workflow logs.

## Workflow run command (pnpm not in PATH)

```
bash -c 'PATH=/nix/store/bl6iwirn83qj9r8wng43kfdqd5mfahj8-nodejs-22.22.0/bin:$PATH node node_modules/vite/bin/vite.js --config vite.config.ts --host 0.0.0.0'
```

## Stale OLD flat copies

- `/home/runner/workspace/artifacts/hiap/` — stale, no vite.config.ts, node_modules symlinked from new path
- `/home/runner/workspace/artifacts/api-server/` — old api-server still running on 8080 from prev session
- Real source is in `app/artifacts/hiap/src/`
