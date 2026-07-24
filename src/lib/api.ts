import axios from 'axios'
import { supabase } from './supabase'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
})

// 요청마다 인증 헤더 주입
// F-07 완료로 백엔드 requireAuth 가 실제 JWT 검증으로 전환됨 → Authorization: Bearer <jwt>
api.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token

  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }

  return config
})

// 응답마다 { success, data } 래퍼를 벗겨 response.data 가 곧 payload 가 되도록 한다.
// blob/arraybuffer(예: PDF 다운로드)는 JSON 래퍼가 아니므로 그대로 통과시킨다.
api.interceptors.response.use((response) => {
  const responseType = response.config.responseType
  if (responseType === 'blob' || responseType === 'arraybuffer' || responseType === 'stream') {
    return response
  }

  const body = response.data
  if (body && typeof body === 'object' && 'success' in body && 'data' in body) {
    response.data = (body as { data: unknown }).data
  }

  return response
})
