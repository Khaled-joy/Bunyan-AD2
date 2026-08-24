import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { analysisAuditLog, analysisCohorts, analysisExecutions, analysisPlans, db } from "@workspace/db";
import { requireAdmin } from "../lib/admin-auth";
import { advisorConfig, compactRowsForExecutor, dataShape, parseCohortFilter, resolveCohortRows, xaiPlotConfig } from "../lib/analysis-workbench";

const router: IRouter = Router();
router.use(["/cohorts", "/advisor", "/executions", "/interpreter"], requireAdmin);

async function audit(action: string, detail: Record<string, unknown>, ids: { cohortId?: string; planId?: string; executionId?: string } = {}) {
  await db.insert(analysisAuditLog).values({ action, actorRole: "admin", detail, ...ids });
}

router.post("/cohorts", async (request, response): Promise<void> => {
  const filters = parseCohortFilter(request.body?.filters ?? request.body);
  const label = typeof request.body?.label === "string" ? request.body.label.trim() : "";
  if (!filters || !label || label.length > 160) {
    response.status(400).json({ error: "Provide a label and non-sensitive cohort filters." });
    return;
  }
  const [cohort] = await db.insert(analysisCohorts).values({ label, filters }).returning();
  await audit("cohort.created", { label }, { cohortId: cohort!.id });
  response.status(201).json({ cohort_id: cohort!.id, label: cohort!.label, filters: cohort!.filters });
});

router.post("/cohorts/:id/probe", async (request, response): Promise<void> => {
  const cohortId = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id;
  const [cohort] = await db.select().from(analysisCohorts).where(eq(analysisCohorts.id, cohortId));
  if (!cohort) {
    response.status(404).json({ error: "Cohort not found." });
    return;
  }
  const filters = parseCohortFilter(cohort.filters);
  if (!filters) {
    response.status(400).json({ error: "Cohort uses unsupported sensitive filters." });
    return;
  }
  const rows = await resolveCohortRows(filters);
  const shape = dataShape(rows);
  const minimum = cohort.sensitive ? advisorConfig.sensitive_minimum_cell_size : advisorConfig.minimum_cell_size;
  await audit("cohort.probed", { n_players: shape.n_players, suppressed: shape.n_players < minimum }, { cohortId });
  if (shape.n_players < minimum) {
    response.json({ cohort_id: cohortId, n_players: shape.n_players, suppressed: true, notice: `This cohort is below the minimum size of ${minimum} distinct players. No rows or summaries are available.` });
    return;
  }
  response.json({ cohort_id: cohortId, cohort_label: cohort.label, suppressed: false, ...shape });
});

router.post("/advisor/plan", async (request, response): Promise<void> => {
  const cohortId = typeof request.body?.cohort_id === "string" ? request.body.cohort_id : "";
  const question = typeof request.body?.question === "string" ? request.body.question.trim() : "";
  if (!cohortId || question.length < 8 || question.length > 1000) {
    response.status(400).json({ error: "Provide a saved cohort and a clear research question." });
    return;
  }
  const [cohort] = await db.select().from(analysisCohorts).where(eq(analysisCohorts.id, cohortId));
  if (!cohort) {
    response.status(404).json({ error: "Cohort not found." });
    return;
  }
  const filters = parseCohortFilter(cohort.filters);
  if (!filters) {
    response.status(400).json({ error: "Cohort filters are not supported." });
    return;
  }
  const shape = dataShape(await resolveCohortRows(filters));
  if (shape.n_players < advisorConfig.minimum_cell_size) {
    response.status(403).json({ error: "This cohort is below the privacy threshold; no plan can be proposed.", n_players: shape.n_players });
    return;
  }
  const lowered = question.toLowerCase();
  const outcomeId = lowered.includes("accuracy") ? "accuracy" : "rt_median";
  const repeated = shape.obs_per_player_median > 1;
  const transform = outcomeId === "rt_median" ? "log" : "none";
  const plan = {
    question,
    cohort_id: cohortId,
    cohort_label: cohort.label,
    design: repeated ? "repeated_measures" : "independent_groups",
    outcome: { type: "session_metric", id: outcomeId, transform },
    predictors: ["age_band"],
    covariates: ["game_id"],
    nesting: repeated ? ["player_id"] : [],
    method: repeated ? "linear_mixed_model" : "welch_t_test",
    random_effects: repeated ? { intercept: ["player_id"], slope: [] } : { intercept: [], slope: [] },
    assumptions_to_check: ["minimum_cell_size", "outcome_skewness", ...(repeated ? ["icc"] : ["variance_check"])],
    effect_size: repeated ? "marginal_r2_and_beta" : "hedges_g",
    multiple_comparison: "benjamini_hochberg",
    plots: xaiPlotConfig.audience_gating.admin,
    power_estimate: { n_players: shape.n_players, detectable_d: Number((2.8 / Math.sqrt(shape.n_players)).toFixed(2)) },
    caveats: [
      "Gameplay telemetry is observational and cannot establish causation.",
      "The plan must be approved before computation.",
      ...(repeated ? ["Repeated observations are present, so independence-assuming tests are blocked."] : []),
    ],
  };
  const [saved] = await db.insert(analysisPlans).values({ cohortId, question, plan }).returning();
  const returnedPlan = { ...plan, plan_id: saved!.id };
  await audit("plan.proposed", { method: plan.method, design: plan.design }, { cohortId, planId: saved!.id });
  response.status(201).json(returnedPlan);
});

router.post("/executions", async (request, response): Promise<void> => {
  const planId = typeof request.body?.plan_id === "string" ? request.body.plan_id : "";
  if (!planId || request.body?.approved !== true) {
    response.status(400).json({ error: "A saved plan must be explicitly approved before execution." });
    return;
  }
  const [savedPlan] = await db.select().from(analysisPlans).where(eq(analysisPlans.id, planId));
  if (!savedPlan) {
    response.status(404).json({ error: "Plan not found." });
    return;
  }
  const [cohort] = await db.select().from(analysisCohorts).where(eq(analysisCohorts.id, savedPlan.cohortId));
  const filters = cohort ? parseCohortFilter(cohort.filters) : null;
  if (!cohort || !filters) {
    response.status(404).json({ error: "Cohort not found." });
    return;
  }
  const plan = savedPlan.plan as Record<string, any>;
  const rows = await resolveCohortRows(filters);
  const shape = dataShape(rows);
  if (shape.n_players < advisorConfig.minimum_cell_size) {
    response.status(403).json({ error: "This cohort is now below the privacy threshold." });
    return;
  }
  const outcome = String((plan.outcome as Record<string, unknown>)?.id ?? "rt_median");
  const executorResponse = await fetch(process.env.ANALYSIS_EXECUTOR_URL ?? "http://127.0.0.1:8000/execute", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ plan: { ...plan, plan_id: savedPlan.id }, rows: compactRowsForExecutor(rows, outcome) }),
  });
  if (!executorResponse.ok) {
    request.log.error({ status: executorResponse.status }, "Analysis executor rejected the plan");
    response.status(502).json({ error: "The statistics executor could not run this plan." });
    return;
  }
  const results = await executorResponse.json() as Record<string, unknown>;
  const [execution] = await db.insert(analysisExecutions).values({
    planId: savedPlan.id,
    cohortId: cohort.id,
    status: "completed",
    results,
    executorVersion: String(results.executor_version ?? "python-fastapi-1.0.0"),
  }).returning();
  await db.update(analysisPlans).set({ approvedAt: new Date() }).where(eq(analysisPlans.id, savedPlan.id));
  await audit("plan.executed", { n_players: shape.n_players }, { cohortId: cohort.id, planId: savedPlan.id, executionId: execution!.id });
  response.status(201).json({ execution_id: execution!.id, ...results });
});

router.get("/executions/:id", async (request, response): Promise<void> => {
  const executionId = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id;
  const [execution] = await db.select().from(analysisExecutions).where(eq(analysisExecutions.id, executionId));
  if (!execution || !execution.results) {
    response.status(404).json({ error: "Execution not found." });
    return;
  }
  response.json({ execution_id: execution.id, ...execution.results });
});

router.post("/interpreter", async (request, response): Promise<void> => {
  const executionId = typeof request.body?.execution_id === "string" ? request.body.execution_id : "";
  const [execution] = await db.select().from(analysisExecutions).where(eq(analysisExecutions.id, executionId)).orderBy(desc(analysisExecutions.executedAt));
  if (!execution?.results) {
    response.status(404).json({ error: "Completed execution not found." });
    return;
  }
  const result = execution.results as Record<string, any>;
  const nPlayers = Number(result.n_players);
  const effect = Array.isArray(result.effect_sizes) ? result.effect_sizes[0] : null;
  const pValue = Array.isArray(result.p_values_adjusted) ? result.p_values_adjusted[0] : null;
  const effectText = effect?.value == null ? "No between-group effect estimate was available." : `The reported ${effect.type} is ${Number(effect.value).toFixed(3)}.`;
  const pText = typeof pValue === "number" ? `The adjusted p-value is ${pValue.toFixed(4)}.` : "No adjusted p-value was produced for this comparison.";
  const interpretation = `This cohort analysis includes ${nPlayers} players. ${effectText} ${pText} This is an association in gameplay data, not a causal finding. Limitations: the result cannot establish what would happen under a different learning condition, and it should be considered alongside the method checks and confidence information.`;
  const banned = ["adhd", "dyslexia", "autism", "disorder", "deficit", "impairment", "diagnosis", "screening", "at-risk", "delayed"];
  if (banned.some((term) => interpretation.toLowerCase().includes(term))) {
    response.status(500).json({ error: "Interpretation safety validation failed." });
    return;
  }
  await audit("execution.interpreted", { execution_id: executionId }, { cohortId: execution.cohortId, planId: execution.planId, executionId });
  response.json({ execution_id: executionId, interpretation, limitations: "Observational gameplay data cannot establish causation." });
});

export default router;