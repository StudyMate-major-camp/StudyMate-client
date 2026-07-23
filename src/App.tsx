import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
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
          <Route path="/" element={<Navigate to="/goals" replace />} />
          <Route path="/goals" element={<GoalsPage />} />
          <Route path="/goals/new" element={<GoalNewPage />} />
          <Route path="/goals/:id" element={<GoalDetailPage />} />
          <Route path="/levels" element={<LevelsPage />} />
          <Route path="/plans/:id" element={<PlanDetailPage />} />
          <Route path="/plans/:id/view" element={<PlanViewPage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
