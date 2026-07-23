import { api } from '../lib/api'
import type { WeeklyPlan, PlanItem, WeeklyPlanProgress } from '../types'

export const weeklyPlansApi = {
  list: () => api.get<WeeklyPlan[]>('/weekly-plans').then((r) => r.data),

  getById: (id: string) =>
    api.get<WeeklyPlan>(`/weekly-plans/${id}`).then((r) => r.data),

  getProgress: (id: string) =>
    api.get<WeeklyPlanProgress>(`/weekly-plans/${id}/progress`).then((r) => r.data),

  create: (body: { goal_id: string; week_start_date: string }) =>
    api.post<WeeklyPlan>('/weekly-plans', body).then((r) => r.data),

  createItem: (
    planId: string,
    body: { title: string; scheduled_date: string; estimated_minutes?: number },
  ) =>
    api.post<PlanItem>(`/weekly-plans/${planId}/items`, body).then((r) => r.data),
}
