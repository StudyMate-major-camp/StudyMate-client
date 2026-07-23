import { api } from '../lib/api'
import type { AuthTokens, Grade, LoginResult, UserProfile } from '../types'

export const authApi = {
  signup: (body: {
    email: string
    password: string
    name: string
    school?: string
    grade?: Grade
  }) => api.post<UserProfile>('/auth/signup', body).then((r) => r.data),

  login: (body: { email: string; password: string }) =>
    api.post<LoginResult>('/auth/login', body).then((r) => r.data),

  refresh: (refresh_token: string) =>
    api.post<AuthTokens>('/auth/refresh', { refresh_token }).then((r) => r.data),

  logout: () => api.post('/auth/logout'),
}
