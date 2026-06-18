---
name: Deployment config quirks
description: How .replit deployment section gets lost and how to restore it; production build CWD; artifact path conventions for publishing.
---

## `.replit` deployment section

`.replit` MUST have a `[deployment]` section with `deploymentTarget = "autoscale"` and `[[artifacts]]` entries listing every artifact. Without it the build fails with `.replit is missing the deployment section`.

This section can be silently lost when a tool rewrites `.replit` (e.g. `setEnvVars` / `requestEnvVar`) without preserving all sections. The symptom is `D .replit` + `?? .replit` in git status — the committed version (with `[deployment]`) is deleted from the index and a new untracked version replaces it.

**Fix:** use `verifyAndReplaceDotReplit({ tempFilePath })` — the only callback that can write `.replit`. Direct file edits and `write`/`edit` tools are blocked for `.replit`.

**Correct `[[artifacts]]` ids** point to the `app/artifacts/` paths:
```toml
[[artifacts]]
id = "app/artifacts/api-server"

[[artifacts]]
id = "app/artifacts/hiap"

[[artifacts]]
id = "app/artifacts/mockup-sandbox"

[deployment]
router = "application"
deploymentTarget = "autoscale"
```

**Why:** Replit's publish flow commits the working tree state, then builds from that commit. The deployment reads the committed `.replit` for topology/target. If `[deployment]` is absent the build fails before even running artifact builds.

## Production build CWD

The deployment container always builds from the **workspace root** `/home/runner/workspace/`. All build/run command paths must be workspace-root-relative, not artifact-relative.

- API server build: `node app/artifacts/api-server/build.mjs`
- HIAP build: `cd app/artifacts/hiap && node node_modules/vite/bin/vite.js build --config vite.config.ts`
- HIAP publicDir: `app/artifacts/hiap/dist/public`
- pnpm is NOT in PATH in the build container; use the explicit nix node path: `PATH=/nix/store/bl6iwirn83qj9r8wng43kfdqd5mfahj8-nodejs-22.22.0/bin:$PATH`

**How to apply:** any time a build command uses a relative path like `./build.mjs` or `node_modules/vite`, prefix it with the artifact directory or use `cd artifact-dir &&` first.

## zod symlink for dev builds

In the dev environment `app/lib/api-zod/node_modules/zod` does not exist (pnpm never ran). Build fails with `Could not resolve "zod"`. Fix: `mkdir -p app/lib/api-zod/node_modules && ln -s /home/runner/workspace/node_modules/.pnpm/zod@3.25.76/node_modules/zod app/lib/api-zod/node_modules/zod`. Production pnpm install handles this automatically.
