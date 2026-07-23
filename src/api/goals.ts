import { api } from '../lib/api'
import type { Goal, GoalProgress } from '../types'

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
}
