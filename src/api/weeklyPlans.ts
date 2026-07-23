import { api } from '../lib/api'
import type {
  WeeklyPlan,
  WeeklyPlanDetail,
  PlanItem,
  WeeklyPlanProgress,
  WeeklyPlanView,
} from '../types'

export const weeklyPlansApi = {
  list: (goalId?: string) =>
    api
      .get<WeeklyPlan[]>('/weekly-plans', { params: goalId ? { goal_id: goalId } : undefined })
      .then((r) => r.data),

  getById: (id: string) =>
    api.get<WeeklyPlanDetail>(`/weekly-plans/${id}`).then((r) => r.data),

  getProgress: (id: string) =>
    api.get<WeeklyPlanProgress>(`/weekly-plans/${id}/progress`).then((r) => r.data),

  // F-03: 화면 출력용 계획표(JSON)
  getView: (id: string) =>
    api.get<WeeklyPlanView>(`/weekly-plans/${id}/view`).then((r) => r.data),

  // F-03: 계획표 PDF 다운로드 (attachment 바이너리)
  downloadPdf: (id: string) =>
    api
      .get(`/weekly-plans/${id}/download`, { responseType: 'blob' })
      .then((r) => r.data as Blob),

  create: (body: { goal_id: string; week_start_date: string }) =>
    api.post<WeeklyPlan>('/weekly-plans', body).then((r) => r.data),

  createItem: (
    planId: string,
    body: { title: string; scheduled_date: string; estimated_minutes?: number },
  ) => api.post<PlanItem>(`/weekly-plans/${planId}/items`, body).then((r) => r.data),
}

export const planItemsApi = {
  setCompletion: (id: string, completed: boolean) =>
    api.patch<PlanItem>(`/plan-items/${id}/completion`, { completed }).then((r) => r.data),

  remove: (id: string) => api.delete(`/plan-items/${id}`),
}
