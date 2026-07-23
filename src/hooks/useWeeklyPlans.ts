import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { weeklyPlansApi, planItemsApi } from '../api/weeklyPlans'

const plansKey = (goalId?: string) =>
  goalId ? ['weekly-plans', 'goal', goalId] : ['weekly-plans']
const planKey = (id: string) => ['weekly-plans', id] as const
const progressKey = (id: string) => ['weekly-plans', id, 'progress'] as const
const viewKey = (id: string) => ['weekly-plans', id, 'view'] as const

export function useWeeklyPlans(goalId?: string) {
  return useQuery({
    queryKey: plansKey(goalId),
    queryFn: () => weeklyPlansApi.list(goalId),
  })
}

export function useWeeklyPlan(id: string) {
  return useQuery({
    queryKey: planKey(id),
    queryFn: () => weeklyPlansApi.getById(id),
    enabled: !!id,
  })
}

export function useWeeklyPlanProgress(id: string) {
  return useQuery({
    queryKey: progressKey(id),
    queryFn: () => weeklyPlansApi.getProgress(id),
    enabled: !!id,
  })
}

// F-03: 화면 출력용 계획표(JSON) 조회
export function useWeeklyPlanView(id: string) {
  return useQuery({
    queryKey: viewKey(id),
    queryFn: () => weeklyPlansApi.getView(id),
    enabled: !!id,
  })
}

// F-03: 계획표 PDF 다운로드 (브라우저 저장까지 트리거)
export function useDownloadPlanPdf() {
  return useMutation({
    mutationFn: async ({ id, weekStart }: { id: string; weekStart: string }) => {
      const blob = await weeklyPlansApi.downloadPdf(id)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `weekly-plan-${weekStart}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    },
  })
}

export function useCreateWeeklyPlan(goalId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: weeklyPlansApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: plansKey(goalId) }),
  })
}

export function useCreatePlanItem(planId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { title: string; scheduled_date: string; estimated_minutes?: number }) =>
      weeklyPlansApi.createItem(planId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: planKey(planId) })
      qc.invalidateQueries({ queryKey: progressKey(planId) })
    },
  })
}

export function useSetPlanItemCompletion(planId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      planItemsApi.setCompletion(id, completed),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: planKey(planId) })
      qc.invalidateQueries({ queryKey: progressKey(planId) })
    },
  })
}

export function useDeletePlanItem(planId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => planItemsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: planKey(planId) })
      qc.invalidateQueries({ queryKey: progressKey(planId) })
    },
  })
}
