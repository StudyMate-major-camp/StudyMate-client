import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useSession } from '../hooks/useSession'

// 로그인하지 않은 사용자를 /login 으로 보낸다.
// 로그인 후 원래 가려던 곳으로 되돌아올 수 있도록 현재 경로를 state.from 으로 넘긴다.
export default function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useSession()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center">
        <div className="h-6 w-6 rounded-full border-2 border-gray-200 border-t-gray-500 animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <>{children}</>
}
