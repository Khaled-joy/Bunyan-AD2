# Replit Agent Prompt — Bunyan Telemetry Layer

Paste everything below the line into Replit Agent. Upload `telemetry-catalog.json` and `indicators.json` into the repo first, at `/config/`.

---

Build the behavioral telemetry layer for Bunyan, an educational game platform for children aged 6–17 in Abu Dhabi. Games emit raw behavioral events through a shared SDK; the platform derives variables, then indicators. **Games must never write to the database or compute an indicator.**

Stack: Next.js (App Router), TypeScript, Postgres, Drizzle ORM.

Read `/config/telemetry-catalog.json` for event payload schemas and game archetypes. Read `/config/indicators.json` for indicator formulas. Do not hardcode anything that lives in those files.

## 1. Database

Create these tables with Drizzle migrations:

- `sessions` — session_id (uuid pk), player_id, game_id, game_version, age_band (cycle1|cycle2|cycle3), lang (ar|en), device_class, input_type, started_at, ended_at, duration_ms, end_reason, is_guest
- `events` — event_id (uuid pk), session_id, player_id, game_id, seq (int), t_client_ms (int), ts_server (timestamptz default now), event_type, item_id (nullable), payload (jsonb). **Range-partition on ts_server by month.**
- `item_attempts` — one row per item attempt with: t_hesitation_ms, t_deliberation_ms, t_total_ms, n_changes, changed_to_correct, correct, hint_used, n_options_hovered, dwell_chosen_ms, dwell_rejected_ms, off_task_ms, repeat_of_prior_err, moves_used, optimal_moves, difficulty, item_ordinal, attempt_number, strategy_signature, custom (jsonb)
- `movement_features` — gesture_id, session_id, item_id, gesture_type, duration_ms, path_length, straight_distance, directness, n_reversals, n_pauses, pause_total_ms, peak_velocity, time_to_peak_velocity_ms, n_zones_entered, near_miss (bool), jitter
- `session_metrics` — session_id (pk), player_id, game_id, age_band, n_items, metrics (jsonb), computed_at, compute_version
- `indicator_scores` — player_id, session_id, indicator_id, component, raw_value, z_score, score (0–100 smallint), confidence (real), n_observations, provisional (bool), formula_version, computed_at
- `norm_tables` — indicator_id, age_band, median, mad, n_sessions, built_at (composite pk)
- `player_profile` — player_id + indicator_id (composite pk), current_score, confidence, trend_30d, n_sessions, n_games, cross_game_var, updated_at
- `game_registry` — game_id (pk), game_version, manifest (jsonb), registered_at, active (bool)

Indexes: `events(session_id, seq)`, `events(event_type, ts_server)`, `item_attempts(session_id, item_ordinal)`, `item_attempts(player_id, game_id)`, `sessions(player_id, started_at desc)`, `indicator_scores(player_id, indicator_id, computed_at desc)`.

## 2. Ingest endpoint

`POST /api/telemetry/batch` accepting `{ session_id, events: [] }`.

- Validate each event against the schema in `telemetry-catalog.json`. Reject the batch on a schema violation and return which event failed.
- **Idempotent on `event_id`** — use `ON CONFLICT (event_id) DO NOTHING`. Re-sent batches must be safe.
- Rate limit per session.
- Return `{ accepted: n, rejected: [] }`.

## 3. Client SDK — `packages/telemetry`

Export a `GameContext` with this exact interface:

```ts
interface GameContext {
  session: { playerId, sessionId, gameId, ageBand, lang };
  startLevel(levelId: string, meta?: object): void;
  endLevel(levelId: string, meta?: object): void;
  startItem(itemId: string, meta: {
    difficulty: number;
    modality: 'text'|'audio'|'image'|'mixed';
    optimalMoves?: number;
    optionCount?: number;
  }): ItemHandle;
  trackPointer(element: HTMLElement, zoneId?: string): () => void;
  hintRequested(itemId: string, hintLevel: number): void;
  languageSwitched(to: 'ar'|'en'): void;
  difficultySelected(level: number, wasVoluntary: boolean): void;
  custom(name: string, value: number|string|boolean): void;
}

interface ItemHandle {
  firstInput(): void;
  change(value: unknown): void;
  submit(value: unknown): void;
  resolve(result: { correct: boolean; value?: unknown; movesUsed?: number; strategySignature?: string }): void;
  skip(): void;
  timeout(): void;
}
```

SDK requirements:

- **All timing derives from `t_client_ms`**, milliseconds since `session.start` via `performance.now()`. Never use server timestamps for latency.
- Buffer events in memory; flush every 5s or 50 events. Mirror the buffer to **IndexedDB** so a crash or reload does not lose the session — on init, replay any unflushed buffer.
- Flush on `visibilitychange` and `beforeunload` using `navigator.sendBeacon`.
- Auto-emit `focus.lost` / `focus.gained` from the Page Visibility API, and `idle.start` / `idle.end` from an inactivity timer (threshold from the game manifest, default 3000ms).
- **`firstInput()` is critical.** If an item resolves without it, log a loud console warning in development mode naming the item_id. Four indicators degrade silently otherwise.

### `trackPointer` behavior

- Sample pointer/touch at **20 Hz, only while a gesture is active** (pointer down, or hovering an interactive element). Never sample continuously.
- Normalize coordinates to **0–1 against the game canvas bounding box**, not the viewport, so screen size does not contaminate the data.
- On gesture end, compute movement features client-side and emit them with `drag.drop` or `drag.cancel`:
  - `directness` = straight-line distance ÷ path length
  - `n_reversals` = direction changes greater than 90°
  - `n_pauses` = velocity below threshold for more than 250ms; also sum `pause_total_ms`
  - `peak_velocity` and `time_to_peak_velocity_ms`
  - `n_zones_entered` = distinct drop zones touched before commit
  - `near_miss` = entered a wrong zone and exited without dropping
  - `jitter` = mean absolute curvature along the path
- Emit the downsampled raw path as a single batched `pointer.sample` event per gesture.

## 4. Game registration

`POST /api/games/register` accepts a `telemetry.manifest.json`. Validate against `manifest_schema` in the catalog:

- Every archetype listed must exist in the catalog.
- Every entry in `custom_variables[].feeds` must be a real indicator id.
- If `capture.pointer_path` is false, reject `drag_sort`, `construction`, and `navigation_maze`.

**A game with no valid manifest cannot register and cannot emit events.** This is what keeps the data comparable across games.

## 5. Layer 1 worker — events → variables

Background job triggered on `session.end` (also runnable as a backfill over any date range).

Read the event stream for a session in `seq` order and write `item_attempts`:

- `t_hesitation_ms` = `item.first_input` − `item.present`
- `t_deliberation_ms` = `item.submit` − `item.first_input`
- `t_total_ms` = `item.resolve` − `item.present`
- `n_changes` = count of `item.change`; `changed_to_correct` = last change flipped wrong to right
- `n_options_hovered`, `dwell_chosen_ms`, `dwell_rejected_ms` from hover events
- `off_task_ms` = focus-lost and idle time falling inside the item window
- `repeat_of_prior_err` = same wrong value as the previous attempt on that item

Write `movement_features` from `drag.drop` and `drag.cancel` payloads.

Must be **idempotent and re-runnable** — deleting and recomputing Layer 1 for a session from Layer 0 must produce identical rows.

## 6. Layer 2 worker — session metrics

Compute and store in `session_metrics.metrics` (jsonb): `rt_median`, `rt_cv`, `accuracy`, `accuracy_by_difficulty`, `speed_accuracy_slope`, `error_recovery_ms`, `strategy_shift_rate`, `perseveration_rate`, `persistence_index`, `resilience_slope`, `within_session_slope`, `self_correction_rate`, `exploration_breadth`, `challenge_seeking`, `off_task_rate`, `mean_directness`, `mean_reversals`.

Notes:
- `within_session_slope`: regress `correct` on `item_ordinal` **with difficulty as a covariate**, or it measures level design rather than the child.
- `error_recovery_ms`: exclude any interval containing a `focus.lost` event.
- `strategy_shift_rate`: compare `strategy_signature` across post-error attempts. Skip the metric when signatures are null.

Stamp `compute_version`.

## 7. Layer 3 — indicators

For each indicator in `indicators.json`:

1. Pull its `source_metrics` from `session_metrics`.
2. Check `min_observations` and any `requires` condition. Skip if unmet — a skipped indicator is missing, not zero.
3. Robust z against `norm_tables` for that `(indicator_id, age_band)`: `z = (raw − median) / (1.4826 × mad)`, clipped to ±3.
4. `score = round(50 + z × 15 × direction)`.
5. `confidence = min(1, n_obs/min_observations) × min(1, n_sessions/3) × min(1, n_games/2)`.
6. Store with `formula_version` and `provisional`.

**Calibration mode:** until a band has ≥200 sessions, use `seed_norm` from `indicators.json` and set `provisional = true`. A nightly job rebuilds `norm_tables` per band once the threshold is met, then recomputes Layer 3 from stored Layer 2. Never discard Layer 0 or Layer 2 — every layer above them must be fully recomputable.

Then update `player_profile` with rolling score, `trend_30d`, and `cross_game_var` (variance of z across contributing games). If `cross_game_var > 1.0`, mark the indicator unstable for that player and suppress it rather than averaging over the conflict.

## 8. Child data protection — implement as code, not policy

1. `events`, `item_attempts`, `movement_features`, `indicator_scores` store `player_id` only. Name, school, and grade live in `players`, behind separate access control. No joins to `players` from analytics queries.
2. **Scheduled job strips raw `pointer.sample` paths at 30 days.** Derived features are retained permanently. Analysis reads features anyway.
3. **No clinical language anywhere.** Indicator IDs are a fixed enum from `indicators.json`. Add a CI check that fails the build if these strings appear in indicator IDs, display strings, or report templates: `ADHD`, `dyslexia`, `autism`, `disorder`, `deficit`, `impairment`, `diagnosis`, `screening`, `at-risk`, `delayed`.
4. **Child-facing display shows three bands only** — `not yet` / `growing` / `strong`, bilingual per `indicators.json`. Never a number, never a percentile, never a comparison to another child. This extends the platform-wide no-failure framing to the analytics layer.
5. `confidence < 0.5` is filtered out at the API layer, so it cannot render anywhere for anyone.
6. `is_guest = true` sessions contribute to norm tables but create no `player_profile` row, and purge at 90 days.
7. Consent gates profile creation, not gameplay. A child without parental consent plays fully; events are stored for norms, no profile row is created.
8. **No indicator may derive from body, weight, calorie, or food-intake variables.** This binds the Balance Basket game specifically — it must not compute or store any nutrition-total or body-related derived variable.

## 9. Admin analytics API

`GET /api/analytics/player/:id`, `/api/analytics/class/:id`, `/api/analytics/game/:id`.

**Server-side authentication is required on all of these.** The current admin dashboard uses a browser-side credential gate that is explicitly dev-only — do not extend it to these endpoints. Implement real session-based auth with role checks (`admin`, `teacher`, `researcher`) before any of this ships. Teacher role returns class aggregates only, never individual child profiles, unless a consented pathway flag is set. Researcher role returns de-identified data with no link to `players`.

## 10. Build order

1. Event envelope, ingest endpoint, `sessions` and `events` tables with partitioning
2. Client SDK with IndexedDB buffer and `sendBeacon` flush
3. `trackPointer` and movement feature extraction
4. Manifest registration and validation
5. Layer 1 worker
6. Layer 2 worker
7. Calibration mode with seeded norms
8. Layer 3 indicators with confidence gating
9. Nightly norm rebuild and Layer 3 recompute
10. Admin analytics API with server-side auth

## 11. Reference implementation

Include one worked example game module, `color_focus`, that uses only the SDK — no direct database access, no analytics imports. It declares the `timed_selection` archetype and demonstrates `startItem`, `firstInput`, `resolve`, and `trackPointer`. It should serve as the template every other game copies.

Also include a seed script that generates ~50 synthetic sessions with realistic behavioral variation across the three age bands, so Layers 1–3 can be tested end to end before real children ever touch the platform.
