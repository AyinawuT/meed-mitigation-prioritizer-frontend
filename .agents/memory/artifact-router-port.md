---
name: Replit artifact-router port collision
description: Why vite cannot use the same port as the artifact's externally-mapped localPort (20040)
---

In the `app/` artifact system, the Replit artifact-router pre-binds the `localPort` declared in `.replit` (`localPort = 20040 → externalPort = 80`) before starting the workflow. Vite then fails with "Port 20040 is in use".

**Why:** The artifact-router owns the external-facing port and proxies inbound traffic to the actual service. The service must bind to a DIFFERENT internal port.

**How to apply:** Set `localPort = 3000` (or any free port) in `artifact.toml` `[[services]]`, and set `PORT = "3000"` in `[services.env]`. The artifact-router reads `localPort` to know where to proxy, and the vite config reads `PORT` to know what port to bind.

Do NOT set `localPort` to the same value as the `.replit` external port mapping (20040).
