---
name: Safe analysis file exchange
description: Privacy and spreadsheet-safety rules for Bunayn Analysis Workbench imports, exports, and chart labels.
---

Analysis file exchange must only accept and emit approved aggregate schemas. Exported chart rows must omit suppressed cells entirely, and category labels must come from trusted allowlists rather than arbitrary telemetry strings.

**Why:** A valid-looking arbitrary game label can carry an identifier into an aggregate result, while formula-leading text can execute when a CSV or XLSX file is opened. Field-name checks alone do not establish that a file is privacy-safe.

**How to apply:** For future dimensions or file formats, validate complete row schemas and allowed categorical values after flattening nested payloads, enforce the current minimum aggregate count, normalize unknown labels to a generic bucket, and escape formula-leading strings in spreadsheet serializations.