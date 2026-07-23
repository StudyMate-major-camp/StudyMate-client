import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { usersApi } from '../api/users'
import { supabase } from '../lib/supabase'

const ME_KEY = ['users', 'me'] as const

export function useMe() {
  return useQuery({
    queryKey: ME_KEY,
    queryFn: usersApi.getMe,
  })
}

export function useUpdateMe() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: usersApi.updateMe,
    onSuccess: () => qc.invalidateQueries({ queryKey: ME_KEY }),
  })
}

export function useChangePassword() {
  return useMutation({ mutationFn: usersApi.changePassword })
}

export function useDeleteAccount() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: usersApi.deleteAccount,
    onSuccess: async () => {
      // 계정이 삭제되었으므로 로컬 세션과 캐시를 모두 비운다.
      await supabase.auth.signOut()
      qc.clear()
    },
  })
}
