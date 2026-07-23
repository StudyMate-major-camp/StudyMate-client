import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

// 현재 로그인 세션을 구독한다.
// - loading: 초기 세션 조회가 끝나기 전까지 true (가드가 깜빡이며 리다이렉트하는 것을 방지)
// - session: 로그인 상태면 Supabase 세션, 아니면 null
export function useSession() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
    })

    return () => sub.subscription.unsubscribe()
  }, [])

  return { session, loading, isAuthenticated: !!session }
}
