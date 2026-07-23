import { api } from '../lib/api'
import type { UserLevel, Level } from '../types'

export const userLevelsApi = {
  list: () => api.get<UserLevel[]>('/user-levels').then((r) => r.data),

  upsert: (levels: { subject: string; level: Level }[]) =>
    api.put<UserLevel[]>('/user-levels', levels).then((r) => r.data),

  remove: (subject: string) => api.delete(`/user-levels/${encodeURIComponent(subject)}`),
}
