import { api } from '../lib/api'
import type { Goal, GoalProgress, WeeklyPlanDetail } from '../types'

export const goalsApi = {
  list: () => api.get<Goal[]>('/goals').then((r) => r.data),

  getById: (id: string) => api.get<Goal>(`/goals/${id}`).then((r) => r.data),

  getProgress: (id: string) =>
    api.get<GoalProgress>(`/goals/${id}/progress`).then((r) => r.data),

  create: (body: {
    subject: string
    description?: string
    target_date: string
    available_time: Partial<Record<string, number>>
  }) => api.post<Goal>('/goals', body).then((r) => r.data),

  update: (
    id: string,
    body: Partial<{
      subject: string
      description: string
      target_date: string
      available_time: Partial<Record<string, number>>
    }>,
  ) => api.patch<Goal>(`/goals/${id}`, body).then((r) => r.data),

  remove: (id: string) => api.delete(`/goals/${id}`),

  // F-04: AI 학습 계획 생성. 지정한 주(월요일 시작)에 대해 weekly_plan+items 를 만들어 반환.
  generatePlan: (id: string, body: { week_start_date: string }) =>
    api.post<WeeklyPlanDetail>(`/goals/${id}/generate-plan`, body).then((r) => r.data),
}
