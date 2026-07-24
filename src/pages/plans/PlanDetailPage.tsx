import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  useWeeklyPlan,
  useWeeklyPlanProgress,
  useCreatePlanItem,
  useSetPlanItemCompletion,
  useDeletePlanItem,
  useWeeklyPlanAnalysis,
  useRetrospectiveSummary,
} from '../../hooks/useWeeklyPlans'
import type { PlanItem } from '../../types'

// axios 에러에서 서버 메시지({ error: { details } })를 추출한다.
function errMsg(e: unknown, fallback: string) {
  return (
    (e as { response?: { data?: { error?: { details?: string } } } })?.response?.data
      ?.error?.details ?? fallback
  )
}

const itemSchema = z.object({
  title: z.string().min(1, '항목명을 입력하세요').max(200),
  scheduled_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD 형식'),
})
type ItemForm = z.infer<typeof itemSchema>

function dayLabel(date: string) {
  const day = new Date(date + 'T12:00:00').getDay()
  return ['일', '월', '화', '수', '목', '금', '토'][day]
}

// ─── 개별 항목 행 ──────────────────────────────────────────────────────────────
function PlanItemRow({
  item,
  planId,
}: {
  item: PlanItem
  planId: string
}) {
  const { mutate: setCompletion, isPending: isToggling } = useSetPlanItemCompletion(planId)
  const { mutate: remove } = useDeletePlanItem(planId)

  return (
    <li
      className={[
        'flex items-center gap-3 px-4 py-3 rounded-lg border transition-all',
        item.completed
          ? 'bg-gray-50 border-gray-100'
          : 'bg-white border-gray-100 hover:border-gray-200',
      ].join(' ')}
    >
      {/* 체크박스 */}
      <button
        type="button"
        disabled={isToggling}
        onClick={() => setCompletion({ id: item.id, completed: !item.completed })}
        className={[
          'shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer',
          item.completed
            ? 'bg-indigo-400 border-indigo-400'
            : 'border-gray-300 hover:border-indigo-300',
          isToggling ? 'opacity-50' : '',
        ].join(' ')}
        aria-label={item.completed ? '완료 취소' : '완료 체크'}
      >
        {item.completed && (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>

      {/* 내용 */}
      <div className="flex-1 min-w-0">
        <span
          className={[
            'text-sm',
            item.completed ? 'line-through text-gray-300' : 'text-gray-800',
          ].join(' ')}
        >
          {item.title}
        </span>
        {item.estimated_minutes && (
          <span className="ml-2 text-xs text-gray-400">{item.estimated_minutes}분</span>
        )}
      </div>

      {/* 삭제 */}
      <button
        type="button"
        onClick={() => remove(item.id)}
        className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-gray-200 hover:text-rose-400 hover:bg-rose-50 transition-colors cursor-pointer"
        aria-label="항목 삭제"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M5 2h4M2 4h10M4.5 4v7a.5.5 0 00.5.5h4a.5.5 0 00.5-.5V4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </li>
  )
}

// ─── 메인 페이지 ──────────────────────────────────────────────────────────────
export default function PlanDetailPage() {
  const { id } = useParams<{ id: string }>()

  const { data: plan, isLoading } = useWeeklyPlan(id!)
  const { data: progress } = useWeeklyPlanProgress(id!)
  const { mutate: createItem, isPending: isCreating } = useCreatePlanItem(id!)

  // F-05 진도 분석
  const {
    mutate: runAnalysis,
    data: analysis,
    isPending: isAnalyzing,
    error: analysisError,
  } = useWeeklyPlanAnalysis(id!)

  // F-06 회고 요약
  const {
    mutate: summarize,
    data: retroSummary,
    isPending: isSummarizing,
    error: retroError,
  } = useRetrospectiveSummary(id!)

  const [showForm, setShowForm] = useState(false)
  const [estimatedMinutes, setEstimatedMinutes] = useState('')
  const [retroText, setRetroText] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ItemForm>({ resolver: zodResolver(itemSchema) })

  const onAddItem = (data: ItemForm) => {
    const mins = parseInt(estimatedMinutes, 10)
    createItem(
      { ...data, estimated_minutes: !isNaN(mins) && mins > 0 ? mins : undefined },
      {
        onSuccess: () => {
          reset()
          setEstimatedMinutes('')
          setShowForm(false)
        },
      },
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">주간 계획을 찾을 수 없습니다.</p>
          <Link to="/goals" className="text-sm font-semibold text-indigo-500 hover:underline">
            목표 목록으로
          </Link>
        </div>
      </div>
    )
  }

  const pct = progress?.percentage ?? 0

  // 날짜별로 항목 그룹핑
  const itemsByDate = (plan.plan_items ?? []).reduce<Record<string, PlanItem[]>>(
    (acc, item) => {
      const d = item.scheduled_date
      if (!acc[d]) acc[d] = []
      acc[d].push(item)
      return acc
    },
    {},
  )
  const sortedDates = Object.keys(itemsByDate).sort()

  return (
    <div className="min-h-screen bg-[#F7F5F0]">
      <div className="max-w-xl mx-auto px-4 py-12">

        {/* 헤더 */}
        <header className="mb-8">
          <Link
            to={`/goals/${plan.goal_id}`}
            className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 mb-4 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            목표로 돌아가기
          </Link>
          <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-2">F-02</p>
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-serif)' }}>
              {plan.week_start_date} 주
            </h1>
            <Link
              to={`/plans/${plan.id}/view`}
              className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-gray-200 text-xs font-semibold text-gray-600 hover:border-gray-300 hover:text-gray-800 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 2.5h10v9H2zM2 5h10M5 5v6.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              계획표 · PDF
            </Link>
          </div>
        </header>

        {/* 진행률 */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-xs p-5 mb-5">
          <div className="flex justify-between items-end mb-3">
            <div>
              <p className="text-xs font-semibold text-gray-400 mb-0.5">이번 주 진행률</p>
              {progress && (
                <p className="text-xs text-gray-300">{progress.completed} / {progress.total}개 완료</p>
              )}
            </div>
            <span className="text-3xl font-bold text-gray-900">{pct}%</span>
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={[
                'h-full rounded-full transition-all duration-700',
                pct === 100 ? 'bg-emerald-400' : 'bg-indigo-400',
              ].join(' ')}
              style={{ width: `${pct}%` }}
            />
          </div>
          {pct === 100 && (
            <p className="text-xs text-emerald-500 font-semibold mt-2 text-center">
              이번 주 계획을 모두 완료했습니다!
            </p>
          )}
        </div>

        {/* 날짜별 항목 */}
        {sortedDates.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-gray-400 text-sm">등록된 계획 항목이 없습니다.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 mb-5">
            {sortedDates.map((date) => (
              <section key={date}>
                <h2 className="text-xs font-semibold text-gray-400 mb-2 px-1">
                  {date} ({dayLabel(date)})
                </h2>
                <ul className="flex flex-col gap-1.5">
                  {itemsByDate[date].map((item) => (
                    <PlanItemRow key={item.id} item={item} planId={id!} />
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}

        {/* 항목 추가 */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-xs p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-gray-500">항목 추가</p>
            <button
              type="button"
              onClick={() => setShowForm((v) => !v)}
              className="text-xs font-semibold text-indigo-500 hover:text-indigo-700 transition cursor-pointer"
            >
              {showForm ? '접기' : '펼치기'}
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit(onAddItem)} className="flex flex-col gap-3">
              <div>
                <input
                  {...register('title')}
                  placeholder="학습 항목명"
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 bg-gray-50 text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:bg-white transition"
                />
                {errors.title && <p className="mt-1 text-xs text-rose-500">{errors.title.message}</p>}
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <input
                    {...register('scheduled_date')}
                    type="date"
                    min={plan.week_start_date}
                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:bg-white transition"
                  />
                  {errors.scheduled_date && (
                    <p className="mt-1 text-xs text-rose-500">{errors.scheduled_date.message}</p>
                  )}
                </div>
                <div className="w-28">
                  <input
                    type="number"
                    min={1}
                    max={1440}
                    value={estimatedMinutes}
                    onChange={(e) => setEstimatedMinutes(e.target.value)}
                    placeholder="분 (선택)"
                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 bg-gray-50 text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:bg-white transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isCreating}
                className="w-full py-2.5 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
              >
                {isCreating ? '추가 중...' : '항목 추가'}
              </button>
            </form>
          )}
        </div>

        {/* F-05: AI 진도 분석 */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-xs p-5 mt-5">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-semibold text-gray-700">✨ AI 진도 분석</p>
            <button
              type="button"
              disabled={isAnalyzing || sortedDates.length === 0}
              onClick={() => runAnalysis()}
              className="px-3 py-1.5 rounded-lg bg-indigo-500 text-white text-xs font-semibold hover:bg-indigo-600 disabled:opacity-40 transition cursor-pointer"
            >
              {isAnalyzing ? '분석 중...' : analysis ? '다시 분석' : '분석하기'}
            </button>
          </div>
          <p className="text-xs text-gray-400 mb-3">이번 주 계획과 완료 현황을 바탕으로 지연/조정안을 제안합니다.</p>

          {sortedDates.length === 0 && (
            <p className="text-xs text-gray-300">계획 항목이 있어야 분석할 수 있습니다.</p>
          )}
          {analysisError && (
            <p className="text-xs text-rose-500">{errMsg(analysisError, 'AI 분석에 실패했습니다')}</p>
          )}

          {analysis && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span
                  className={[
                    'text-xs font-semibold px-2.5 py-1 rounded-lg',
                    analysis.status === '지연'
                      ? 'bg-rose-50 text-rose-500'
                      : analysis.status === '초과달성'
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-indigo-50 text-indigo-500',
                  ].join(' ')}
                >
                  {analysis.status}
                </span>
                <span className="text-xs text-gray-400">
                  완료율 {Math.round(analysis.completionRate * 100)}%
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 mb-1">분석</p>
                <p className="text-sm text-gray-700 whitespace-pre-line">{analysis.analysis}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 mb-1">다음 주 조정안</p>
                <p className="text-sm text-gray-700 whitespace-pre-line">{analysis.nextPlanAdjustment}</p>
              </div>
              {analysis.delayedTasks.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 mb-1.5">지연 항목</p>
                  <ul className="flex flex-col gap-1">
                    {analysis.delayedTasks.map((t, i) => (
                      <li key={i} className="text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                        <span className="text-gray-400">{t.date}</span> · {t.task}
                        {t.reasonHint && <span className="text-gray-400"> — {t.reasonHint}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* F-06: AI 회고 요약 */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-xs p-5 mt-5">
          <p className="text-sm font-semibold text-gray-700 mb-1">✨ AI 회고 요약</p>
          <p className="text-xs text-gray-400 mb-3">이번 주 회고를 자유롭게 작성하면 핵심과 개선점을 요약해 드립니다.</p>

          <textarea
            value={retroText}
            onChange={(e) => setRetroText(e.target.value)}
            rows={4}
            placeholder="이번 주 학습은 어땠나요? 잘된 점, 아쉬운 점을 자유롭게 적어보세요."
            className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 bg-gray-50 text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:bg-white transition resize-none"
          />
          <button
            type="button"
            disabled={isSummarizing || retroText.trim().length === 0}
            onClick={() => summarize(retroText.trim())}
            className="w-full mt-2.5 py-2.5 rounded-lg bg-indigo-500 text-white text-sm font-semibold hover:bg-indigo-600 disabled:opacity-40 transition cursor-pointer"
          >
            {isSummarizing ? '요약 중...' : '회고 요약하기'}
          </button>

          {retroError && (
            <p className="mt-2 text-xs text-rose-500">{errMsg(retroError, 'AI 요약에 실패했습니다')}</p>
          )}

          {retroSummary && (
            <div className="flex flex-col gap-3 mt-4">
              <div>
                <p className="text-xs font-semibold text-gray-400 mb-1">요약</p>
                <p className="text-sm text-gray-700 whitespace-pre-line">{retroSummary.summary}</p>
              </div>
              {retroSummary.achievements.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 mb-1.5">잘한 점</p>
                  <ul className="flex flex-col gap-1">
                    {retroSummary.achievements.map((a, i) => (
                      <li key={i} className="text-sm text-gray-700 flex gap-1.5">
                        <span className="text-emerald-400">•</span> {a}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {retroSummary.improvements.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 mb-1.5">개선할 점</p>
                  <ul className="flex flex-col gap-1">
                    {retroSummary.improvements.map((a, i) => (
                      <li key={i} className="text-sm text-gray-700 flex gap-1.5">
                        <span className="text-rose-300">•</span> {a}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div>
                <p className="text-xs font-semibold text-gray-400 mb-1">다음 주 제안</p>
                <p className="text-sm text-gray-700 whitespace-pre-line">{retroSummary.nextWeekSuggestion}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
