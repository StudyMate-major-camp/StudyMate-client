import axios from 'axios'
import { supabase } from './supabase'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
})

// 요청마다 인증 헤더 주입
// dev: x-user-id 헤더 (백엔드 stub 인증)
// F-07 완료 후: Authorization: Bearer <jwt> 로 교체
api.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession()
  const userId = data.session?.user.id

  if (userId) {
    config.headers['x-user-id'] = userId
  }

  return config
})
