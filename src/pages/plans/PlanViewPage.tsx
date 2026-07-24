import { useParams, Link } from 'react-router-dom'
import { useWeeklyPlanView, useDownloadPlanPdf } from '../../hooks/useWeeklyPlans'
import type { PlanViewDay } from '../../types'

// ─── 요일 카드 ────────────────────────────────────────────────────────────────
function DayCard({ day }: { day: PlanViewDay }) {
  const isWeekend = day.dayOfWeek >= 6
  const doneCount = day.items.filter((i) => i.completed).length

  return (
    <section className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
      <header className="flex items-center justify-between px-4 py-2.5 border-b border-gray-50">
        <div className="flex items-baseline gap-2">
          <span
            className={[
              'text-sm font-bold',
              isWeekend ? 'text-rose-400' : 'text-gray-700',
            ].join(' ')}
          >
            {day.weekday}
          </span>
          <span className="text-xs text-gray-300">{day.date.slice(5)}</span>
        </div>
        {day.items.length > 0 && (
          <span className="text-[11px] text-gray-300">
            {doneCount}/{day.items.length} · {day.totalMinutes}분
          </span>
        )}
      </header>

      {day.items.length === 0 ? (
        <p className="px-4 py-3 text-xs text-gray-300">계획 없음</p>
      ) : (
        <ul className="flex flex-col divide-y divide-gray-50">
          {day.items.map((item) => (
            <li key={item.id} className="flex items-center gap-2.5 px-4 py-2.5">
              <span
                className={[
                  'shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center',
                  item.completed ? 'bg-indigo-400 border-indigo-400' : 'border-gray-200',
                ].join(' ')}
                aria-hidden
              >
                {item.completed && (
                  <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <span
                className={[
                  'flex-1 min-w-0 text-sm',
                  item.completed ? 'line-through text-gray-300' : 'text-gray-800',
                ].join(' ')}
              >
                {item.title}
              </span>
              {item.estimatedMinutes != null && (
                <span className="shrink-0 text-xs text-gray-300">{item.estimatedMinutes}분</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

// ─── 메인 페이지 ──────────────────────────────────────────────────────────────
export default function PlanViewPage() {
  const { id } = useParams<{ id: string }>()

  const { data: view, isLoading } = useWeeklyPlanView(id!)
  const { mutate: download, isPending: isDownloading } = useDownloadPlanPdf()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (!view) {
    return (
      <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">계획표를 찾을 수 없습니다.</p>
          <Link to="/goals" className="text-sm font-semibold text-indigo-500 hover:underline">
            목표 목록으로
          </Link>
        </div>
      </div>
    )
  }

  const { percent, completed, total } = view.progress

  return (
    <div className="min-h-screen bg-[#F7F5F0]">
      <div className="max-w-xl mx-auto px-4 py-12">

        {/* 헤더 */}
        <header className="mb-8">
          <Link
            to={`/plans/${view.id}`}
            className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 mb-4 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            계획 편집으로
          </Link>
          <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-2">F-03</p>
          <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-serif)' }}>
            주간 계획표
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            {view.weekStart} ~ {view.weekEnd}
          </p>
        </header>

        {/* 진행률 + 다운로드 */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-xs p-5 mb-5">
          <div className="flex justify-between items-end mb-3">
            <div>
              <p className="text-xs font-semibold text-gray-400 mb-0.5">전체 진행률</p>
              <p className="text-xs text-gray-300">{completed} / {total}개 완료</p>
            </div>
            <span className="text-3xl font-bold text-gray-900">{percent}%</span>
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden mb-4">
            <div
              className={[
                'h-full rounded-full transition-all duration-700',
                percent === 100 ? 'bg-emerald-400' : 'bg-indigo-400',
              ].join(' ')}
              style={{ width: `${percent}%` }}
            />
          </div>

          <button
            type="button"
            disabled={isDownloading}
            onClick={() => download({ id: view.id, weekStart: view.weekStart })}
            className="w-full py-2.5 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M7.5 1.5v8m0 0L4.5 6.5m3 3l3-3M2 12h11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {isDownloading ? 'PDF 생성 중...' : 'PDF로 다운로드'}
          </button>
        </div>

        {/* 요일별 계획표 */}
        <div className="flex flex-col gap-3">
          {view.days.map((day) => (
            <DayCard key={day.date} day={day} />
          ))}
        </div>
      </div>
    </div>
  )
}
