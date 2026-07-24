export type Day = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN'
export type Level = 'HIGH' | 'MID' | 'LOW'
export type Grade = '고1' | '고2' | '고3'

// F-07/F-12: 인증 및 마이페이지. profiles 테이블(name/school/grade)과 auth.users를 합친 형태.
export interface UserProfile {
  id: string
  email: string
  name: string
  school?: string
  grade?: Grade
}

// 로그인/토큰갱신 응답의 토큰 묶음. Supabase 세션 토큰이 그대로 내려온다.
export interface AuthTokens {
  access_token: string
  refresh_token: string
  expires_in: number
}

export interface LoginResult extends AuthTokens {
  user: UserProfile
}

export interface Goal {
  id: string
  user_id: string
  subject: string
  description?: string
  target_date: string
  available_time: Partial<Record<Day, number>>
  created_at: string
  updated_at: string
}

export interface GoalProgress {
  total: number
  completed: number
  percentage: number
}

export interface UserLevel {
  id: string
  user_id: string
  subject: string
  level: Level
  created_at: string
  updated_at: string
}

export interface WeeklyPlan {
  id: string
  user_id: string
  goal_id: string
  week_start_date: string
  created_at: string
  updated_at: string
}

export interface PlanItem {
  id: string
  weekly_plan_id: string
  title: string
  scheduled_date: string
  estimated_minutes?: number
  completed: boolean
  completed_at?: string
  created_at: string
  updated_at: string
}

export interface WeeklyPlanDetail extends WeeklyPlan {
  plan_items: PlanItem[]
}

export interface WeeklyPlanProgress {
  total: number
  completed: number
  percentage: number
}

// F-03: 계획표 조회(/weekly-plans/:id/view) 응답. 서버가 camelCase로 내려준다.
export interface PlanViewItem {
  id: string
  title: string
  estimatedMinutes: number | null
  completed: boolean
  completedAt: string | null
}

export interface PlanViewDay {
  date: string
  dayOfWeek: number // 1=월 .. 7=일
  weekday: string // '월' .. '일'
  items: PlanViewItem[]
  totalMinutes: number
}

export interface WeeklyPlanView {
  id: string
  goalId: string
  weekStart: string
  weekEnd: string
  progress: { total: number; completed: number; percent: number }
  days: PlanViewDay[]
}

// F-05: AI 진도 분석 응답. completionRate 는 서버에서 계산한 0~1 값.
export interface ProgressAnalysis {
  completionRate: number
  status: '지연' | '정상' | '초과달성'
  delayedTasks: { date: string; task: string; reasonHint: string | null }[]
  analysis: string
  nextPlanAdjustment: string
}

// F-06: AI 회고 요약 응답.
export interface RetrospectiveSummary {
  summary: string
  achievements: string[]
  improvements: string[]
  nextWeekSuggestion: string
}
