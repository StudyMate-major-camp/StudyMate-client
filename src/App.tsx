import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'
import GoalsPage from './pages/goals/GoalsPage'
import GoalNewPage from './pages/goals/GoalNewPage'
import GoalDetailPage from './pages/goals/GoalDetailPage'
import LevelsPage from './pages/levels/LevelsPage'
import PlanDetailPage from './pages/plans/PlanDetailPage'
import PlanViewPage from './pages/plans/PlanViewPage'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* 공개 라우트 */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* 로그인이 필요한 라우트 */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Navigate to="/goals" replace />} />
            <Route path="/goals" element={<GoalsPage />} />
            <Route path="/goals/new" element={<GoalNewPage />} />
            <Route path="/goals/:id" element={<GoalDetailPage />} />
            <Route path="/levels" element={<LevelsPage />} />
            <Route path="/plans/:id" element={<PlanDetailPage />} />
            <Route path="/plans/:id/view" element={<PlanViewPage />} />
          </Route>

          {/* 알 수 없는 경로는 로그인으로 */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
