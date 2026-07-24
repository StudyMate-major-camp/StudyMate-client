import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { goalsApi } from '../api/goals'

const GOALS_KEY = ['goals'] as const
const goalKey = (id: string) => ['goals', id] as const
const progressKey = (id: string) => ['goals', id, 'progress'] as const

export function useGoals() {
  return useQuery({
    queryKey: GOALS_KEY,
    queryFn: goalsApi.list,
  })
}

export function useGoal(id: string) {
  return useQuery({
    queryKey: goalKey(id),
    queryFn: () => goalsApi.getById(id),
    enabled: !!id,
  })
}

export function useGoalProgress(id: string) {
  return useQuery({
    queryKey: progressKey(id),
    queryFn: () => goalsApi.getProgress(id),
    enabled: !!id,
  })
}

export function useCreateGoal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: goalsApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: GOALS_KEY }),
  })
}

export function useUpdateGoal(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: Parameters<typeof goalsApi.update>[1]) =>
      goalsApi.update(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: goalKey(id) })
      qc.invalidateQueries({ queryKey: GOALS_KEY })
    },
  })
}

export function useDeleteGoal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: goalsApi.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: GOALS_KEY }),
  })
}

// F-04: AI 학습 계획 생성. 성공 시 해당 목표의 주간 계획 목록을 무효화한다.
export function useGenerateStudyPlan(goalId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { week_start_date: string }) =>
      goalsApi.generatePlan(goalId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['weekly-plans', 'goal', goalId] })
      qc.invalidateQueries({ queryKey: progressKey(goalId) })
    },
  })
}
