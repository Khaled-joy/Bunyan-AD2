import { useMutation, useQuery } from '@tanstack/react-query';

const fetcher = async (url: string, options?: RequestInit) => {
  const response = await fetch(url, { ...options, credentials: 'include' });
  if (!response.ok) {
    let message = 'Network error';
    try {
      const err = await response.json();
       message = err.error || message;
    } catch {}
    throw new Error(message);
  }
  return response.json();
};

export function useCreateCohort() {
  return useMutation({
    mutationFn: (data: any) =>
      fetcher('/api/cohorts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
  });
}

export function useProbeCohort() {
  return useMutation({
    mutationFn: (id: string) =>
      fetcher(`/api/cohorts/${id}/probe`, { method: 'POST' }),
  });
}

export function useGameCoverage(cohortId: string | null, enabled: boolean) {
  return useQuery({
    queryKey: ['game-coverage', cohortId],
    queryFn: () => fetcher(`/api/cohorts/${cohortId}/game-coverage`),
    enabled: Boolean(cohortId && enabled),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useComparison(
  cohortId: string | null,
  options: { groupBy: string; compareBy: string; metric: string },
  enabled: boolean,
) {
  return useQuery({
    queryKey: ['comparison', cohortId, options.groupBy, options.compareBy, options.metric],
    queryFn: () => fetcher('/api/comparisons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cohort_id: cohortId,
        group_by: options.groupBy,
        compare_by: options.compareBy,
        metric: options.metric,
      }),
    }),
    enabled: Boolean(cohortId && enabled),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useCreatePlan() {
  return useMutation({
    mutationFn: (data: { cohortId: string; question: string }) =>
      fetcher('/api/advisor/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cohort_id: data.cohortId, question: data.question }),
      }),
  });
}

export function useExecutePlan() {
  return useMutation({
    mutationFn: (planId: string) =>
      fetcher('/api/executions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan_id: planId }),
      }),
  });
}

export function useApprovePlan() {
  return useMutation({
    mutationFn: (planId: string) =>
      fetcher(`/api/plans/${planId}/approve`, { method: 'POST' }),
  });
}

export function useGetExecution(id: string | null) {
  return useQuery({
    queryKey: ['execution', id],
    queryFn: () => fetcher(`/api/executions/${id}`),
    enabled: !!id,
  });
}
