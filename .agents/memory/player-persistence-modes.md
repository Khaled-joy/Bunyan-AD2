---
name: Player persistence modes
description: Rules for protecting named player progress when guest play is available on a shared device.
---

Named player state and guest player state must use separate browser storage lifetimes: named profiles and progress persist locally, while guest profiles and progress are session-scoped.

**Why:** A child using guest mode on a shared device must not inherit, overwrite, or expose another named player's progress. Also, a profile update immediately followed by navigation must be persisted before the page can unmount.

This local demo supports one named player at a time. Replacing that named player must reset the prior named player's gameplay, currency, and rewards; returning as the same name preserves them.

**Why:** Device-local progress cannot be safely attributed across multiple names without a profile-scoped storage model.

**How to apply:** For new player-facing state, use the active persistence mode consistently across profile and progress keys. Persist named-profile changes synchronously before route transitions, clear the guest selector when returning to named registration, and reset all player-earned state when the submitted name changes.