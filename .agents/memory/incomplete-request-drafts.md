---
name: Incomplete request drafts
description: How to preserve truly incomplete drafts when the persisted workflow contract uses required enum fields.
---

An incomplete draft must retain an explicit list of required fields that were not supplied; placeholder enum values used only to satisfy storage constraints must never make the draft appear complete.

**Why:** Drafts are intentionally saveable without validation, while submitted requests require valid non-null enum values. Without separate completeness state, storage placeholders can silently pass later submission checks.

**How to apply:** Any requester or reviewer path that resubmits an editable draft must validate both the persisted values and the explicit missing-field state before changing status.