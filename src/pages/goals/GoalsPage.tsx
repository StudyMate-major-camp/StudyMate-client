import { Link } from 'react-router-dom'
import { useGoals, useGoalProgress } from '../../hooks/useGoals'
import type { Goal } from '../../types'

const DAY_KO: Record<string, string> = {
  MON: '월', TUE: '화', WED: '수', THU: '목', FRI: '금', SAT: '토', SUN: '일',
}

function daysLeft(targetDate: string) {
  const diff = new Date(targetDate).getTime() - new Date().setHours(0, 0, 0, 0)
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

// ─── 진행률 바 (개별 fetch) ────────────────────────────────────────────────────
function GoalProgressBar({ goalId }: { goalId: string }) {
  const { data } = useGoalProgress(goalId)
  const pct = data?.percentage ?? 0

  return (
    <div className="mt-3">
      <div className="flex justify-between text-xs text-gray-400 mb-1">
        <span>진행률</span>
        <span className="font-semibold text-gray-600">{pct}%</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-400 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

// ─── 목표 카드 ────────────────────────────────────────────────────────────────
function GoalCard({ goal }: { goal: Goal }) {
  const remaining = daysLeft(goal.target_date)
  const activeDays = Object.entries(goal.available_time)
    .filter(([, mins]) => mins && mins > 0)
    .map(([day]) => DAY_KO[day] ?? day)

  return (
    <Link
      to={`/goals/${goal.id}`}
      className="block bg-white rounded-xl border border-gray-100 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-semibold text-gray-900 text-base truncate">{goal.subject}</h2>
          {goal.description && (
            <p className="text-sm text-gray-400 mt-0.5 line-clamp-1">{goal.description}</p>
          )}
        </div>
        <span
          className={[
            'shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full',
            remaining < 0
              ? 'bg-gray-100 text-gray-400'
              : remaining <= 7
              ? 'bg-rose-50 text-rose-600'
              : remaining <= 30
              ? 'bg-amber-50 text-amber-600'
              : 'bg-indigo-50 text-indigo-600',
          ].join(' ')}
        >
          {remaining < 0 ? '기간 종료' : `D-${remaining}`}
        </span>
      </div>

      {activeDays.length > 0 && (
        <div className="flex gap-1 mt-3">
          {activeDays.map((d) => (
            <span key={d} className="text-xs bg-gray-50 text-gray-500 px-2 py-0.5 rounded-md border border-gray-100">
              {d}
            </span>
          ))}
        </div>
      )}

      <GoalProgressBar goalId={goal.id} />
    </Link>
  )
}

// ─── 메인 페이지 ──────────────────────────────────────────────────────────────
export default function GoalsPage() {
  const { data: goals = [], isLoading } = useGoals()

  return (
    <div className="min-h-screen bg-[#F7F5F0]">
      <div className="max-w-xl mx-auto px-4 py-12">

        <header className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-2">
              F-01
            </p>
            <h1
              className="text-3xl font-bold text-gray-900"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              목표 관리
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/me"
              aria-label="마이페이지"
              className="flex items-center justify-center w-9 h-9 text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 active:scale-[0.97] transition-all"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.6" />
                <path d="M5 20c0-3.3 3.1-6 7-6s7 2.7 7 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </Link>
            <Link
              to="/levels"
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 active:scale-[0.97] transition-all"
            >
              학습 수준
            </Link>
            <Link
              to="/goals/new"
              className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-700 active:scale-[0.97] transition-all"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
              새 목표
            </Link>
          </div>
        </header>

        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : goals.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-gray-400 text-sm">등록된 목표가 없습니다.</p>
            <Link
              to="/goals/new"
              className="inline-block mt-4 text-sm font-semibold text-indigo-500 hover:underline"
            >
              첫 번째 목표 만들기 →
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {goals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
