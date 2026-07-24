import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

// 현재 Supabase 세션을 구독한다. 로그인/로그아웃 시 onAuthStateChange 로 즉시 반영된다.
// loading=true 동안에는 세션 존재 여부가 아직 확정되지 않았으므로 가드에서 리다이렉트를 보류한다.
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

  return { session, loading }
}
