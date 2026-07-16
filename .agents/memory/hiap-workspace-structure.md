---
name: HIAP workspace structure
description: How node_modules, pnpm, and npm coexist in this monorepo — critical for any install/lockfile work.
---

## Rule
Each artifact (`app/artifacts/hiap`, `app/artifacts/api-server`) installs its own dependencies by running `pnpm install` **directly inside that artifact directory**. There is no `pnpm-workspace.yaml` at `app/` — pnpm's `pnpm-lock.yaml` at `app/` only tracks root devDependencies (prettier, typescript).

**Why:** The repo historically symlinked `app/artifacts/hiap/node_modules` → `/home/runner/workspace/artifacts/hiap/node_modules` (a stale flat copy). Those symlinks are gone. The correct install location is the artifact directory itself.

## How to apply
- To restore a broken hiap install: `cd app/artifacts/hiap && pnpm install`
- To restore a broken api-server install: `cd app/artifacts/api-server && pnpm install`
- Never `mv` or `rm` the `node_modules` symlinks/dirs in artifact directories — they break the running Vite/Node processes and cannot be restored by `pnpm install` from `app/`.
- **NEVER move pnpm node_modules aside** during lockfile operations — use a temp copy or regenerate in a clean environment instead.

## npm lockfile (app/package-lock.json) regeneration
The CI uses `npm ci` in `app/` on Node 24 / npm 11. Generating a clean lockfile requires:
1. Both `app/artifacts/hiap/node_modules` and `app/artifacts/api-server/node_modules` must be absent (not just moved).
2. Run: `cd app && npm install --package-lock-only --ignore-scripts --registry https://registry.npmjs.org`
3. Replit's internal firewall bakes `http://package-firewall.replit.local/npm/` URLs even with `--registry` flag only when node_modules exist. With them absent, the public registry URLs are written directly.
4. Strip any remaining hiap pnpm-store entries (keys starting `../artifacts/hiap/`) and phantom entries (no version + no resolved + no link) with a node script.
5. Reinstall artifact deps after: `cd app/artifacts/hiap && pnpm install && cd ../api-server && pnpm install`

## npm 11 / Node 24 lockfile pitfalls
- Entries with `workspace:*` in devDependencies fields → npm 11 throws "Invalid Version"
- Phantom entries (version=undefined, no resolved, no link) → npm 11 throws "Invalid Version"  
- Entries from pnpm's `.pnpm` virtual store (`../artifacts/hiap/node_modules/.pnpm/…`) → "Invalid Version"
- Replit internal registry URLs (`http://package-firewall.replit.local/npm/`) → CI cannot reach them
