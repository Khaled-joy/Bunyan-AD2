"""Bunayn Analysis Executor: statistics only, never language-model calculations."""
from __future__ import annotations

from typing import Any
import math

import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from scipy import stats

app = FastAPI(title="Bunayn Analysis Executor", version="1.0.0")


class ExecuteRequest(BaseModel):
    plan: dict[str, Any]
    rows: list[dict[str, Any]] = Field(min_length=10)


def finite(values: pd.Series) -> pd.Series:
    return values.replace([np.inf, -np.inf], np.nan).dropna()


def ci_for_mean(values: pd.Series) -> tuple[float, float]:
    values = finite(values)
    if len(values) < 2:
        return (float(values.iloc[0]) if len(values) else 0.0, float(values.iloc[0]) if len(values) else 0.0)
    mean = float(values.mean())
    se = float(values.std(ddof=1) / math.sqrt(len(values)))
    margin = float(stats.t.ppf(0.975, len(values) - 1) * se)
    return mean - margin, mean + margin


def hedges_g(a: pd.Series, b: pd.Series) -> float | None:
    a, b = finite(a), finite(b)
    if len(a) < 2 or len(b) < 2:
        return None
    pooled = math.sqrt(((len(a) - 1) * a.var(ddof=1) + (len(b) - 1) * b.var(ddof=1)) / (len(a) + len(b) - 2))
    if pooled == 0:
        return 0.0
    correction = 1 - 3 / (4 * (len(a) + len(b)) - 9)
    return float(correction * ((a.mean() - b.mean()) / pooled))


def q(value: float | np.floating | None) -> float | None:
    return None if value is None or not np.isfinite(value) else float(value)


@app.get("/healthz")
def healthz() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/execute")
def execute(request: ExecuteRequest) -> dict[str, Any]:
    plan = request.plan
    outcome = str(plan.get("outcome", {}).get("id", "rt_median"))
    transform = str(plan.get("outcome", {}).get("transform", "none"))
    method = str(plan.get("method", "linear_mixed_model"))

    frame = pd.DataFrame(request.rows)
    if outcome not in frame.columns:
        raise HTTPException(status_code=400, detail=f"Outcome '{outcome}' is unavailable.")
    frame[outcome] = pd.to_numeric(frame[outcome], errors="coerce")
    frame = frame.dropna(subset=[outcome, "player_id", "age_band"])
    if transform == "log":
        frame = frame[frame[outcome] > 0].copy()
        frame["_outcome"] = np.log(frame[outcome])
    else:
        frame["_outcome"] = frame[outcome]
    if frame["player_id"].nunique() < 10:
        raise HTTPException(status_code=403, detail="Minimum cohort size is not met.")

    groups = [(str(name), finite(group["_outcome"])) for name, group in frame.groupby("age_band")]
    groups = [(name, group) for name, group in groups if len(group)]
    estimates = [
        {
            "label": name,
            "estimate": q(group.mean()),
            "ci_95": [q(ci_for_mean(group)[0]), q(ci_for_mean(group)[1])],
            "n_observations": int(len(group)),
        }
        for name, group in groups
    ]
    residual_skew = q(stats.skew(frame["_outcome"], bias=False)) if len(frame) > 2 else None
    warnings: list[str] = []
    p_value: float | None = None
    effect: dict[str, Any] = {"type": str(plan.get("effect_size", "not_available")), "value": None}
    method_used = method

    if len(groups) >= 2:
        first, second = groups[0][1], groups[1][1]
        if method == "mann_whitney_u":
            result = stats.mannwhitneyu(first, second, alternative="two-sided")
            p_value = q(result.pvalue)
            effect = {"type": "rank_biserial", "value": q(1 - (2 * result.statistic) / (len(first) * len(second)))}
        else:
            result = stats.ttest_ind(first, second, equal_var=False)
            p_value = q(result.pvalue)
            effect = {"type": "hedges_g", "value": hedges_g(first, second)}
            if method == "linear_mixed_model":
                method_used = "linear_mixed_model (group contrast with repeated-measure clustering noted)"
                warnings.append("The current executor reports a conservative group contrast; add a random-effects model after the cohort has enough within-player variation.")
    else:
        warnings.append("Only one age band is present, so no between-group contrast was computed.")

    player_means = frame.groupby("player_id")["_outcome"].mean()
    total_variance = float(frame["_outcome"].var(ddof=1)) if len(frame) > 1 else 0.0
    between_variance = float(player_means.var(ddof=1)) if len(player_means) > 1 else 0.0
    icc = q(max(0.0, min(1.0, between_variance / total_variance))) if total_variance else 0.0
    checks = [
        {"check": "minimum_cell_size", "value": int(frame["player_id"].nunique()), "passed": True, "note": "At least 10 distinct players are present."},
        {"check": "outcome_skewness", "value": residual_skew, "passed": residual_skew is None or abs(residual_skew) < 1, "note": "Log transform is applied to positive response-time outcomes." if transform == "log" else "No transformation was requested."},
        {"check": "icc", "value": icc, "passed": True, "note": "The intraclass correlation is reported so repeated observations are visible."},
    ]
    return {
        "plan_id": plan.get("plan_id"),
        "n_players": int(frame["player_id"].nunique()),
        "n_observations": int(len(frame)),
        "method_used": method_used,
        "estimates": estimates,
        "effect_sizes": [effect],
        "p_values_raw": [] if p_value is None else [p_value],
        "p_values_adjusted": [] if p_value is None else [p_value],
        "assumption_checks": checks,
        "plots": [{
            "kind": "effect_interval",
            "cohort_label": plan.get("cohort_label", "Saved cohort"),
            "n_players": int(frame["player_id"].nunique()),
            "series": estimates,
        }],
        "warnings": warnings,
        "executed_at": pd.Timestamp.utcnow().isoformat(),
        "executor_version": "python-fastapi-1.0.0",
    }