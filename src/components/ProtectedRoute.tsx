import { Navigate, Outlet } from 'react-router-dom'
import { useSession } from '../hooks/useSession'

// 세션이 없으면 /login 으로 튕긴다. 세션 확인 전(loading)에는 잠깐 로딩 화면을 보여준다.
export default function ProtectedRoute() {
  const { session, loading } = useSession()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center text-sm text-gray-400">
        불러오는 중...
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
