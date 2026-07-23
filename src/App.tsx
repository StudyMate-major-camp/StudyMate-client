import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import RequireAuth from './components/RequireAuth'
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'
import MyPage from './pages/me/MyPage'
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
          <Route path="/" element={<Navigate to="/goals" replace />} />
          <Route path="/me" element={<RequireAuth><MyPage /></RequireAuth>} />
          <Route path="/goals" element={<RequireAuth><GoalsPage /></RequireAuth>} />
          <Route path="/goals/new" element={<RequireAuth><GoalNewPage /></RequireAuth>} />
          <Route path="/goals/:id" element={<RequireAuth><GoalDetailPage /></RequireAuth>} />
          <Route path="/levels" element={<RequireAuth><LevelsPage /></RequireAuth>} />
          <Route path="/plans/:id" element={<RequireAuth><PlanDetailPage /></RequireAuth>} />
          <Route path="/plans/:id/view" element={<RequireAuth><PlanViewPage /></RequireAuth>} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
