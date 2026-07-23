import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authApi } from '../api/auth'
import { supabase } from '../lib/supabase'

export function useSignup() {
  return useMutation({ mutationFn: authApi.signup })
}

export function useLogin() {
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: async (data) => {
      // 서버가 발급한 Supabase 세션 토큰을 클라이언트 세션에 저장한다.
      // 이후 api 인터셉터가 getSession()으로 access_token을 읽어 Bearer로 실어 보낸다.
      await supabase.auth.setSession({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      })
    },
  })
}

export function useLogout() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: async () => {
      await supabase.auth.signOut()
      qc.clear()
    },
  })
}
