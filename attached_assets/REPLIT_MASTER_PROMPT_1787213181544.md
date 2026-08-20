# REPLIT BUILD BRIEF — "Masar" · مسار
### A bilingual lifelong-learning game suite for ages 6–17

> Paste this whole file into Replit Agent as your build brief. Build in the **phases** at the bottom — do not attempt all ten games in one pass.

---

## 0. One-paragraph product summary

Masar is a bilingual (Arabic RTL / English LTR) web game suite for learners aged 6–17. Ten mini-games, each with three levels mapped to UAE school cycles. Every game feeds one shared learner profile with six skill meters, one currency (**Sparks / شرارات**), a cosmetic store, and an exportable Growth Passport. The visual language is *desert-futurism*: bold flat vector shapes, warm sand-and-teal gradients, chunky 3D-feel characters — Subway Surfers energy with Emirati motifs (ghaf trees, barjeel wind towers, dhows, falcons, souq lanterns).

---

## 1. Non-negotiable global rules

1. **Bilingual from line one.** Every string lives in `content/*.json` under `{en, ar}`. No hardcoded text in components, ever. A language toggle in the top bar flips `<html dir>` between `rtl` and `ltr` and swaps fonts. Use Tailwind **logical properties only** (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`) — never `ml-`/`mr-`/`left-`/`right-`.
2. **No losing screens.** A wrong answer costs a heart/spark and re-queues a variant. Levels end in Bronze / Silver / Gold. The words "fail" and "wrong" never appear — use "not yet" / "ليس بعد".
3. **Cycle bands, not locked ages.** Level 1 = Cycle 1 (grades 1–4, ages 6–9). Level 2 = Cycle 2 (grades 5–8, ages 10–13). Level 3 = Cycle 3 (grades 9–12, ages 14–17). The learner picks their grade at onboarding, which *suggests* a starting level but never locks the others.
4. **Store is cosmetic-first.** Boosters exist but are disabled on any level marked `"assessed": true`. Nothing costs real money.
5. **Every interaction emits an analytics event** (schema in §6).
6. **Accessibility floor:** full keyboard play, 16px+ body text, colorblind-safe palette (never red/green alone — always pair with an icon and a shape), captions on all audio, `prefers-reduced-motion` respected in the runners.

---

## 2. Tech stack

```
React 18 + Vite + TypeScript
Tailwind CSS            → all UI chrome
Phaser 3                → Color Focus + Numeracy Marathon only (arcade physics)
@dnd-kit/core           → all sorting / ordering / matching games
Framer Motion           → card flips, transitions, store animations
Zustand                 → global store: profile, sparks, meters, language
Howler.js               → SFX + music (mutable, off by default on first load)
localStorage (v1)       → wrap ALL reads/writes in engine/persistence.ts
                          so swapping to Replit DB is a one-file change
```

Fonts: **Tajawal** or **IBM Plex Sans Arabic** for Arabic, **Baloo 2** or **Nunito** for English. Load both; switch by `dir`.

---

## 3. File structure

```
/src
  /engine
    profile.ts          learner object, grade, cycle, streak
    meters.ts           six skill meters, XP curve
    economy.ts          spark earning rules, daily cap, store purchases
    spacedRepetition.ts resurfaces items from 3+ days ago
    persistence.ts      ONLY file that touches storage
    analytics.ts        event emitter + local event log buffer
    i18n.ts             t(key), dir(), font switching
  /games
    colorFocus/  ourHeritage/  wordJourney/  numeracyMarathon/
    balanceBasket/  innovationLab/  botWorkshop/  truthLab/
    commonGround/  sparkStudio/
  /ui
    MeterHexagon  LevelCard  SparkCounter  StoreGrid  ReflectionCard
    PassportExport  LanguageToggle  ResultBanner
  /content
    content-pack-v1.json      ← the question banks (provided separately)
    store-catalog.json
```

---

## 4. Art direction

- **Palette:** sand `#F4E4C1`, dune `#E0B87A`, deep teal `#0E6E6E`, oasis green `#2FA36B`, sunset coral `#FF7A59`, night indigo `#1B2A4A`, gold accent `#D4A537`.
- **Shapes:** thick 3–4px outlines, rounded corners (16–24px), soft drop shadows. Everything should look *tappable*.
- **Characters:** four playable avatars with Emirati-inspired outfits + a falcon companion that reacts to results (flaps on Gold, tilts its head on "not yet"). No facial features on background crowds — keep them silhouettes.
- **Backgrounds:** three parallax layers minimum in the runners — dunes, a skyline (mixing barjeel wind towers with futuristic towers), and foreground grass/sand particles.
- **Motion:** every score change counts up, never snaps. Every card flip is 250ms with a slight overshoot.

---

## 5. Points, progression, and the store

### Sparks (شرارات) — the single currency
| Action | Sparks |
|---|---|
| Complete a level (Bronze) | 10 |
| Silver | 20 |
| Gold | 35 |
| First Gold on a level (one-time) | +50 |
| Daily streak day 2 / 5 / 10 | +15 / +40 / +100 |
| Reflection card submitted | +5 |
| Spaced-repetition warm-up cleared | +10 |

**Daily earning cap: 400 Sparks.** Past the cap, play still raises skill meters but earns no currency — this kills grinding without punishing enthusiasm.

### Six skill meters (never spendable)
`coreLifeSkills · cognitive · practical · personalGrowth · socialCohesion · transformative`

Each level completion adds heavily to its primary component and lightly to its secondary. Display as a hexagon radar chart. **Never rank learners against each other on meters** — leaderboards use Sparks only, and are opt-in.

### Store catalog (`store-catalog.json`)
| Category | Items | Price range |
|---|---|---|
| Avatars | 6 characters + outfit variants | 150–600 |
| Companions | Falcon, oryx calf, sand cat, robot pup | 300–800 |
| Runner trails | Pearl sparkle, sand cloud, gold comet, ink | 100–350 |
| Themes | Desert Dawn, Pearl Diver, Space Souq, Night Majlis | 400–900 |
| My Majlis (room decor) | Rug, lantern, plant, poster, trophy shelf | 50–250 |
| Passport frames | 8 cosmetic borders | 200 |
| Boosters | +5s timer, 50/50 hint, skip-one | 40–80 each, **disabled on assessed levels** |

Rarity tiers: Common → Rare → Heritage (Heritage items unlock only via Our Heritage Gold, not purchase).

---

## 6. Analytics event schema (required — the client asked for this explicitly)

Every event: `analytics.emit(eventName, payload)`. Buffer to localStorage, expose a **"Download events (CSV/JSON)"** button in a hidden `/admin` route.

```ts
{
  event_id: uuid,
  ts: ISO8601,
  learner_id: string,          // anonymous, generated locally
  grade: number, cycle: 1|2|3,
  lang: "ar" | "en",
  game: "word_journey",
  level: 1|2|3,
  item_id: "WJ-AR-L2-03",      // maps to content pack
  event: "item_shown" | "answer_submitted" | "hint_used"
         | "level_started" | "level_completed" | "store_purchase"
         | "reflection_saved" | "session_start" | "session_end",
  correct: boolean | null,
  response_ms: number,
  attempts: number,
  score: number,
  component: "cognitive",
  meta: {}                     // game-specific
}
```

Minimum reports the `/admin` route should render: accuracy by item, median response time by item, drop-off point per level, AR vs EN accuracy gap, and items with <40% accuracy flagged for rewrite.

---

## 7. The ten games

### 🏃 ARCADE TIER

**1. Color Focus · تركيز الألوان** — *Cognitive (primary) · Personal Growth*
Endless runner, three lanes, Subway-Surfers control scheme: swipe/arrow to change lane, up to jump, down to slide. **60-second rounds.** At the start of each round a target color is announced with a full-screen flash + audio cue. The player collects **only** that color; collecting a decoy color costs focus. Every 15 seconds the run speeds up by 12% and decoy density rises. Mid-round the target color can **switch** (L2+) — the real skill being trained is attention-shifting, not reflexes.

| | Speed start | Target switches | Decoy ratio | Obstacles |
|---|---|---|---|---|
| L1 | 1.0× | none | 30% | jumps only |
| L2 | 1.3× | once at 30s | 50% | jumps + slides |
| L3 | 1.6× | twice, random | 65% | + moving barriers, near-shade decoys |

End screen shows **Focus Score** = correct collects ÷ total collects, framed as "you stayed on target X% of the run."

**2. Numeracy Marathon · ماراثون الأرقام** — *Cognitive (primary) · Practical*
A side-view running race against three AI rivals. A math question hovers ahead; answering correctly = a speed burst, and answering *faster* = a bigger burst. Wrong answers don't stop the runner, they just don't boost — momentum decays. Each question has a per-question timer that shortens as the race progresses. Questions are pulled by **grade**, not level, from the numeracy bank. Finish line at 20 questions.

---

### 🧩 SORTING · MATCHING · MEMORY TIER

**3. Our Heritage · تراثنا** — *Core Life Skills + Social Cohesion*
Three mechanics rotating inside one game, 4 items per level:
- **Wudu Ordering** — drag steps into correct sequence (`@dnd-kit` vertical sortable). 5 steps at L1 → 8 at L2 → 10 at L3 with right-before-left precision.
- **Heritage Memory Match** — flip cards, match landmark ↔ emirate, craft ↔ description.
- **Knowledge cards** — MCQ on UAE and Islam, cycle-appropriate.

Gold on any level unlocks a **Heritage-tier** store item that cannot be bought.

> Content care: keep all religious content to mainstream, factual, universally-agreed practice. Where schools of thought differ, omit the item rather than pick a side.

**4. Word Journey · رحلة الكلمات** — *Core Life Skills (literacy) · Cognitive*
Four item types, both languages, each in its own visual "station" on a map:
- **Missing letter** — tap the letter that completes the word (Arabic renders the word with correct connected forms; the blank must not break the ligature — pre-render each word as three segments).
- **Picture → word** — pick the word matching the illustration.
- **Complete the sentence** — drag a word into the gap.
- **Odd one out / synonym** (L3).

Arabic and English tracks run in parallel; the learner can play either or both. Log accuracy per language separately — this comparison is one of the most valuable outputs of the whole suite.

**5. Truth Lab · مختبر الحقيقة** — *Core Life Skills (primary) · Cognitive*
As specified: L1 sort into ✅ / ❌ / 🤔 with "Not Sure" scored positively on genuinely ambiguous claims; L2 match claim → strongest of 3 evidence cards; L3 newsroom, 4 partly-contradicting sources, 90s clock, verdict scored 40% / justification 60%.

**6. Balance Basket · سلة التوازن** — *Personal Growth · Core Life Skills*
Build a full day of meals by dragging foods onto four plates (breakfast / lunch / dinner / snack). The plate shows a **live food-group balance ring** (grains, protein, dairy, fruit & veg, water) — not a calorie number. After building, 4 comparison questions: which food carries more energy, which is a protein source, how often is a fizzy drink a good idea.

> ⚠️ **Hard safety rules for this game — implement exactly:**
> - Never display a personal calorie target, daily budget, or running total for the player.
> - Never ask what the child actually ate, and never store it.
> - No body imagery, no weight, no BMI, no "good food / bad food" labels — use "everyday" and "sometimes".
> - Never show a negative result for a built plate. Unbalanced plates get "try adding something green" — never "too many calories".
> - Calorie questions compare *foods to each other* as general knowledge only.

---

### 🤖 BUILDING · LOGIC TIER

**7. Innovation Lab · مختبر الابتكار** — *Transformative (primary) · Practical*
The player trains a robot by teaching it, and this is the suite's stealth AI-literacy game.
- **L1 — Teach the Robot.** Icons appear; drag each into the right box (fruit / not fruit, safe / not safe). After 10 examples the robot takes a test in front of the player and its accuracy is *the player's score*.
- **L2 — Find the Flaw.** The robot has been trained badly on purpose (every "bird" example was a falcon, so it fails on a penguin). The player identifies the gap and adds the 3 examples that fix it. Teaches training-data bias without ever using the word.
- **L3 — Write the Rules.** The player gives the robot 3 IF/THEN rules from a rule-builder, then watches 5 edge cases run. Each failing edge case can be fixed by one rule amendment. Ends with a "robot report card" the player must interpret.

**8. Bot Workshop · ورشة الروبوت** — *Practical (primary) · Cognitive*
As specified: L1 forward/turn/pickup on 4×4; L2 loops + conditions with a block budget where under-budget = Gold; L3 two bots, split program, live-link co-op or async inherit, custom function blocks.

---

### 🌍 SOCIAL · CREATIVE TIER

**9. Common Ground · أرض مشتركة** — *Social Cohesion (primary) · Core Life Skills*
As specified: L1 Fair Shares (12 items, 4 characters, equal ≠ top score); L2 The Council (100 credits, 6 proposals, 4 stakeholders, one-year outcome reveal); L3 Write the Rule (subject + condition + exception builder, 3 objections, live vote threshold).

**10. Spark Studio · استوديو الشرارة** — *Transformative (primary) · Practical*
As specified: L1 Mash-Up; L2 Under Constraint with the "For [who], this [what] so that [why]" pitch; L3 Design Sprint with character-helper assignment as the leadership mechanic, ending in a gallery voted on useful / surprising / kind.

---

## 8. Shared screens to build

1. **Onboarding** — language pick → avatar pick → grade pick → name. 30 seconds, no account, no email.
2. **Home / Oasis map** — the ten games as locations on an illustrated map, each showing 3 level pips (locked / bronze / silver / gold).
3. **Warm-up** — 2 resurfaced items before entering any game, if the learner has history.
4. **Result banner** — medal, sparks earned counting up, meter deltas, reflection card.
5. **Store** — grid with category tabs, preview-on-hover, confirm-purchase modal.
6. **Growth Passport** — hexagon radar, badge shelf, reflections list, streak calendar, Export JSON / Print buttons.
7. **/admin** (unlisted) — event log table + the five reports in §6 + "Download events".

---

## 9. Build order — do these as separate passes

**Phase 1 — Spine.** i18n + RTL, profile, meters, economy, persistence, analytics, home map, result banner, store shell. No games yet. *Verify: language toggle flips the entire UI and layout mirrors correctly.*

**Phase 2 — Two contrasting games.** Color Focus (proves Phaser + arcade loop) and Our Heritage (proves dnd-kit + the content-pack pipeline).

**Phase 3 — Content-heavy games.** Word Journey, Numeracy Marathon, Balance Basket, Truth Lab.

**Phase 4 — Logic + creative.** Innovation Lab, Bot Workshop, Common Ground, Spark Studio.

**Phase 5 — Passport, admin reports, store catalog fill, audio, polish pass.**

Load `content/content-pack-v1.json` at boot. Every question, claim, food item, and store item comes from content files — adding a new pack must require zero code changes.
