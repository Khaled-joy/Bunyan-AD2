---
name: Bunyan Studio persistence
description: Why Studio project persistence follows the shared backend rather than its original standalone database suggestion.
---

Bunyan Studio project save/load should remain on the workspace's shared PostgreSQL and Drizzle API architecture, even when an imported product brief mentions SQLite or Prisma.

**Why:** Studio is a separate frontend product but part of the same deployed workspace. Reusing the managed API and database preserves artifact routing, deployment consistency, generated clients, and one operational persistence layer.

**How to apply:** Extend the shared OpenAPI contract and server for future Studio persistence. Do not introduce a second embedded database or ORM unless the user explicitly chooses a separate runtime architecture.