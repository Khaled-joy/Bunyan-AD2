---
name: Player persistence modes
description: Rules for protecting named player progress when guest play is available on a shared device.
---

Named player state and guest player state must use separate browser storage lifetimes: named profiles and progress persist locally, while guest profiles and progress are session-scoped.

**Why:** A child using guest mode on a shared device must not inherit, overwrite, or expose another named player's progress. Also, a profile update immediately followed by navigation must be persisted before the page can unmount.

**How to apply:** For new player-facing state, use the active persistence mode consistently across profile and progress keys. Persist named-profile changes synchronously before route transitions, and clear the guest selector when returning to named registration.