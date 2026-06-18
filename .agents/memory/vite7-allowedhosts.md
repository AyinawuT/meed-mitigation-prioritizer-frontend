---
name: Vite 7 allowedHosts bug
description: In Vite 7.3.1 the string "all" for allowedHosts is broken; the boolean true is required.
---

In Vite 7.3.1, `server.allowedHosts: "all"` (string) does NOT bypass host checking. The internal code does:

```js
allowedHosts === true ? bypass : Object.freeze([...allowedHosts])
```

Spreading `"all"` gives `['a','l','l']` — useless. Only the boolean `true` triggers the bypass.

**Why:** The Vite 7 migration guide says to use `"all"` string, but the actual 7.3.1 runtime checks `=== true`. This is a discrepancy between docs and implementation.

**How to apply:** Always use `allowedHosts: true` (boolean) in both `server` and `preview` blocks in vite.config.ts for Replit environments. Do not use the string `"all"`.
