---
name: Analysis executor workflow
description: Operational constraints for the private statistics executor workflow.
---

The Python analysis executor must bind to `0.0.0.0` for the Replit workflow monitor to detect its port. Its HTTP execution endpoint must still require a server-generated HMAC signature, and the API should call it through loopback.

**Why:** Binding only to loopback makes Uvicorn start successfully but leaves the workflow marked failed because the platform health check cannot see the port. Binding broadly without service authentication exposes arbitrary computation.

**How to apply:** Keep the workflow listener on all interfaces, route requests from the API to its local address, and preserve the signed request check when altering the executor or its workflow.