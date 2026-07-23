export type Day = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN'
export type Level = 'HIGH' | 'MID' | 'LOW'

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
