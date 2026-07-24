import { api } from '../lib/api'
import type { Grade, UserProfile } from '../types'

export const usersApi = {
  getMe: () => api.get<UserProfile>('/users/me').then((r) => r.data),

  updateMe: (body: Partial<{ name: string; school: string; grade: Grade }>) =>
    api.patch<UserProfile>('/users/me', body).then((r) => r.data),

  changePassword: (body: { current_password: string; new_password: string }) =>
    api.patch('/users/me/password', body),

  // DELETE에 본문(비밀번호 확인)을 실어야 하므로 axios config의 data 옵션을 사용한다.
  deleteAccount: (password: string) =>
    api.delete('/users/me', { data: { password } }),
}
