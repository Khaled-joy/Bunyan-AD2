import rawContentPack from '../../../attached_assets/content-pack-v1_1787217142864.json';
import { z } from 'zod';

const copySchema = z.object({ en: z.string(), ar: z.string() });
const optionSchema = copySchema.extend({ id: z.string() });
const stepSchema = copySchema.extend({ id: z.string() });
const baseItemSchema = z.object({ id: z.string(), sparks: z.number().positive() });

const heritageItemSchema = z.discriminatedUnion('type', [
  baseItemSchema.extend({ type: z.literal('order'), prompt: copySchema, steps: z.array(stepSchema).min(2), answer: z.array(z.string()).min(2), explain: copySchema }),
  baseItemSchema.extend({ type: z.literal('mcq'), prompt: copySchema, options: z.array(optionSchema).min(2), answer: z.string(), explain: copySchema }),
  baseItemSchema.extend({ type: z.literal('memory_match'), prompt: copySchema, pairs: z.array(z.object({ a: copySchema, b: copySchema })).min(2) }),
]);
const wordItemSchema = baseItemSchema.extend({
  lang: z.enum(['en', 'ar']),
  type: z.enum(['missing_letter', 'picture_word', 'complete_sentence', 'spelling', 'odd_one_out', 'synonym', 'comprehension']),
  prompt: copySchema,
  options: z.array(z.string()).min(2),
  answer: z.string(),
  explain: copySchema.optional(),
  passage: copySchema.optional(),
  display: z.string().optional(),
  word: z.string().optional(),
  image: z.string().optional(),
});
const numeracyItemSchema = baseItemSchema.extend({ prompt: copySchema, options: z.array(z.string()).min(2), answer: z.string() });
const menuItemSchema = baseItemSchema.extend({ type: z.literal('mcq'), prompt: copySchema, options: z.array(optionSchema).min(2), answer: z.string(), explain: copySchema.optional() });
const truthItemSchema = z.discriminatedUnion('type', [
  baseItemSchema.extend({ type: z.literal('sort3'), claim: copySchema, answer: z.enum(['true', 'false', 'not_sure']), explain: copySchema.optional() }),
  baseItemSchema.extend({ type: z.literal('evidence_match'), claim: copySchema, evidence: z.array(optionSchema).min(2), answer: z.string(), explain: copySchema.optional() }),
  baseItemSchema.extend({ type: z.literal('newsroom'), story: copySchema, sources: z.array(optionSchema).min(2), verdict_options: z.array(optionSchema).min(2), answer_verdict: z.string(), answer_sources: z.array(z.string()).min(1) }),
]);
const trainingSetSchema = baseItemSchema.extend({
  category_a: copySchema,
  category_b: copySchema,
  icons: z.array(z.object({ icon: z.string(), answer: z.enum(['a', 'b']) })).min(2),
});
const rulePartSchema = copySchema.extend({ id: z.string() });
const edgeCaseSchema = copySchema.extend({
  id: z.string(),
  required_rule_ids: z.array(z.string()),
  requires_human_fallback: z.boolean(),
});
const findFlawSchema = baseItemSchema.extend({
  type: z.literal('find_the_flaw'), scenario: copySchema, prompt: copySchema, options: z.array(optionSchema).min(2), answer: z.string(), explain: copySchema.optional(),
  fix_task: copySchema.optional(), fix_options: z.array(z.string()).min(3).optional(), fix_answer: z.array(z.string()).min(3).optional(),
});
const ruleBuilderSchema = baseItemSchema.extend({
  type: z.literal('rule_builder'),
  mission: copySchema,
  rule_parts: z.object({ conditions: z.array(rulePartSchema).min(2), actions: z.array(rulePartSchema).min(2) }),
  edge_cases: z.array(edgeCaseSchema).min(1),
  note: z.string(),
}).superRefine((item, context) => {
  const conditionIds = item.rule_parts.conditions.map((part) => part.id);
  const actionIds = item.rule_parts.actions.map((part) => part.id);
  const edgeIds = item.edge_cases.map((edge) => edge.id);
  if (new Set(conditionIds).size !== conditionIds.length) context.addIssue({ code: z.ZodIssueCode.custom, path: ['rule_parts', 'conditions'], message: 'Rule condition IDs must be unique.' });
  if (new Set(actionIds).size !== actionIds.length) context.addIssue({ code: z.ZodIssueCode.custom, path: ['rule_parts', 'actions'], message: 'Rule action IDs must be unique.' });
  if (new Set(edgeIds).size !== edgeIds.length) context.addIssue({ code: z.ZodIssueCode.custom, path: ['edge_cases'], message: 'Edge-case IDs must be unique.' });
  const allowedRules = new Set(conditionIds.flatMap((condition) => actionIds.map((action) => `${condition}:${action}`)));
  item.edge_cases.forEach((edge, index) => edge.required_rule_ids.forEach((ruleId, ruleIndex) => {
    if (!allowedRules.has(ruleId)) context.addIssue({ code: z.ZodIssueCode.custom, path: ['edge_cases', index, 'required_rule_ids', ruleIndex], message: `Unknown rule reference: ${ruleId}` });
  }));
});
const innovationItemSchema = z.union([findFlawSchema, ruleBuilderSchema]);
const cycleSchema = z.union([z.literal(1), z.literal(2), z.literal(3)]);
const typedLevel = <T extends z.ZodTypeAny>(item: T) => z.object({ level: z.number(), cycle: cycleSchema, items: z.array(item).min(1), task: copySchema.optional() });
const innovationLevelSchema = z.union([
  z.object({ level: z.number(), cycle: cycleSchema, task: copySchema, training_sets: z.array(trainingSetSchema).min(1) }),
  typedLevel(innovationItemSchema),
]);
const colorLevelSchema = z.object({
  level: z.number(), cycle: cycleSchema, palette: z.array(z.string().regex(/^#/)).min(4),
  start_speed: z.number(), speed_step_pct: z.number(), speed_step_seconds: z.number(), decoy_ratio: z.number(), target_switches: z.number(), obstacles: z.array(z.string()), sparks_per_1000_score: z.number(),
}).passthrough();

const contentPackSchema = z.object({
  meta: z.object({
    cycles: z.record(z.string(), z.object({ grades: z.array(z.number()), ages: z.string() })),
  }).passthrough(),
  our_heritage: z.object({ levels: z.array(typedLevel(heritageItemSchema)).length(3) }),
  word_journey: z.object({ levels: z.array(typedLevel(wordItemSchema)).length(3) }),
  numeracy_marathon: z.object({ banks: z.array(z.object({ cycle: cycleSchema, grades: z.array(z.number()), items: z.array(numeracyItemSchema).min(1) })).length(3) }),
  balance_basket: z.object({ levels: z.array(typedLevel(menuItemSchema)).length(3) }),
  truth_lab: z.object({ levels: z.array(typedLevel(truthItemSchema)).length(3) }),
  innovation_lab: z.object({ levels: z.array(innovationLevelSchema).length(3) }),
  color_focus: z.object({ levels: z.array(colorLevelSchema).length(3), round_seconds: z.number() }),
}).passthrough();

export type PackCopy = z.infer<typeof copySchema>;
export type PackOption = z.infer<typeof optionSchema>;
export type HeritageItem = z.infer<typeof heritageItemSchema>;
export type WordItem = z.infer<typeof wordItemSchema>;
export type NumeracyItem = z.infer<typeof numeracyItemSchema>;
export type MenuItem = z.infer<typeof menuItemSchema>;
export type TruthItem = z.infer<typeof truthItemSchema>;
export type InnovationItem = z.infer<typeof innovationItemSchema> | z.infer<typeof trainingSetSchema>;
export type ColorLevel = z.infer<typeof colorLevelSchema>;

// Content is parsed once at the boundary. Invalid bilingual copy, cycles, activity
// fields, options, answers, rules or accessibility palettes fail loudly at startup.
const contentPack = contentPackSchema.parse(rawContentPack);

/** Cycle 1 is intentionally the safe choice for guests and incomplete profiles. */
export function getContentCycle(grade?: string): 1 | 2 | 3 {
  const numericGrade = Number.parseInt(grade ?? '', 10);
  if (!Number.isFinite(numericGrade)) return 1;
  if (numericGrade >= 9 && numericGrade <= 12) return 3;
  if (numericGrade >= 5 && numericGrade <= 8) return 2;
  return 1;
}

function itemAt<T>(items: readonly T[], index: number): T {
  const item = items[index % items.length];
  if (!item) throw new Error('Content pack contains an empty activity bank.');
  return item;
}

/** Keep every playable round kid-sized and consistent: three prompts per level. */
function playableCount(count: number) {
  return Math.max(3, Math.ceil(count / 3) * 3);
}

export function getPackCopy(value: PackCopy | undefined, fallback: PackCopy): PackCopy {
  return value ?? fallback;
}

export function getHeritageItem(cycle: 1 | 2 | 3, index: number) { return itemAt(contentPack.our_heritage.levels.find((level) => level.cycle === cycle)!.items, index); }
export function getHeritageItemCount(cycle: 1 | 2 | 3) { return playableCount(contentPack.our_heritage.levels.find((level) => level.cycle === cycle)!.items.length); }
export function getWordItem(cycle: 1 | 2 | 3, index: number, lang: 'en' | 'ar') {
  const items = contentPack.word_journey.levels.find((level) => level.cycle === cycle)!.items.filter((item) => item.lang === lang);
  return itemAt(items, index);
}
export function getWordItemCount(cycle: 1 | 2 | 3, lang: 'en' | 'ar') { return playableCount(contentPack.word_journey.levels.find((level) => level.cycle === cycle)!.items.filter((item) => item.lang === lang).length); }
export function getNumeracyItem(cycle: 1 | 2 | 3, index: number) { return itemAt(contentPack.numeracy_marathon.banks.find((bank) => bank.cycle === cycle)!.items, index); }
export function getNumeracyItemCount(cycle: 1 | 2 | 3) { return playableCount(contentPack.numeracy_marathon.banks.find((bank) => bank.cycle === cycle)!.items.length); }
export function getMenuItem(cycle: 1 | 2 | 3, index: number) { return itemAt(contentPack.balance_basket.levels.find((level) => level.cycle === cycle)!.items, index); }
export function getMenuItemCount(cycle: 1 | 2 | 3) { return playableCount(contentPack.balance_basket.levels.find((level) => level.cycle === cycle)!.items.length); }
export function getMenuTask(cycle: 1 | 2 | 3) { return contentPack.balance_basket.levels.find((level) => level.cycle === cycle)!.task!; }
export function getTruthItem(cycle: 1 | 2 | 3, index: number) { return itemAt(contentPack.truth_lab.levels.find((level) => level.cycle === cycle)!.items, index); }
export function getTruthItemCount(cycle: 1 | 2 | 3) { return playableCount(contentPack.truth_lab.levels.find((level) => level.cycle === cycle)!.items.length); }
export function getInnovationItem(cycle: 1 | 2 | 3, index: number): InnovationItem {
  const level = contentPack.innovation_lab.levels.find((entry) => entry.cycle === cycle)!;
  return 'training_sets' in level ? itemAt(level.training_sets, index) : itemAt(level.items, index);
}
export function getInnovationItemCount(cycle: 1 | 2 | 3) {
  const level = contentPack.innovation_lab.levels.find((entry) => entry.cycle === cycle)!;
  return playableCount('training_sets' in level ? level.training_sets.length : level.items.length);
}
export function getColorFocusLevel(cycle: 1 | 2 | 3) { return contentPack.color_focus.levels.find((level) => level.cycle === cycle)!; }

export const contentPackMeta = contentPack.meta;