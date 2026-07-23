import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useGoal, useGoalProgress, useUpdateGoal, useDeleteGoal } from '../../hooks/useGoals'
import type { Day } from '../../types'
import AvailableTimeInput from '../../components/AvailableTimeInput'

const DAY_KO: Record<string, string> = {
  MON: '월', TUE: '화', WED: '수', THU: '목', FRI: '금', SAT: '토', SUN: '일',
}

const today = new Date().toISOString().slice(0, 10)

const editSchema = z.object({
  subject: z.string().min(1, '과목명을 입력하세요').max(100),
  description: z.string().max(500).optional(),
  target_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD 형식으로 입력하세요')
    .refine((v) => v >= today, { message: '오늘 이후 날짜를 선택하세요' }),
})
type EditForm = z.infer<typeof editSchema>

// ─── 메인 페이지 ──────────────────────────────────────────────────────────────
export default function GoalDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: goal, isLoading } = useGoal(id!)
  const { data: progress } = useGoalProgress(id!)
  const { mutate: update, isPending: isUpdating } = useUpdateGoal(id!)
  const { mutate: remove, isPending: isDeleting } = useDeleteGoal()

  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [availableTime, setAvailableTime] = useState<Partial<Record<Day, number>>>({})

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditForm>({ resolver: zodResolver(editSchema) })

  const startEdit = () => {
    if (!goal) return
    reset({
      subject: goal.subject,
      description: goal.description ?? '',
      target_date: goal.target_date,
    })
    setAvailableTime(goal.available_time as Partial<Record<Day, number>>)
    setIsEditing(true)
  }

  const cancelEdit = () => {
    setIsEditing(false)
    setShowDeleteConfirm(false)
  }

  const onSave = (data: EditForm) => {
    update(
      { ...data, available_time: availableTime },
      { onSuccess: () => setIsEditing(false) },
    )
  }

  const onDelete = () => {
    remove(id!, { onSuccess: () => navigate('/goals') })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (!goal) {
    return (
      <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">목표를 찾을 수 없습니다.</p>
          <Link to="/goals" className="text-sm font-semibold text-indigo-500 hover:underline">
            목록으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  const pct = progress?.percentage ?? 0
  const activeDays = Object.entries(goal.available_time)
    .filter(([, mins]) => mins && (mins as number) > 0)
    .map(([day]) => DAY_KO[day] ?? day)

  return (
    <div className="min-h-screen bg-[#F7F5F0]">
      <div className="max-w-xl mx-auto px-4 py-12">

        {/* 헤더 */}
        <header className="mb-8">
          <Link
            to="/goals"
            className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 mb-4 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            목표 목록
          </Link>

          <div className="flex items-start justify-between gap-3">
            <h1
              className="text-3xl font-bold text-gray-900"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              {goal.subject}
            </h1>
            {!isEditing && (
              <button
                type="button"
                onClick={startEdit}
                className="shrink-0 px-3 py-1.5 text-xs font-semibold text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition cursor-pointer"
              >
                수정
              </button>
            )}
          </div>
        </header>

        {isEditing ? (
          /* ── 수정 폼 ── */
          <form onSubmit={handleSubmit(onSave)} className="flex flex-col gap-5">
            <div className="bg-white rounded-xl border border-gray-100 shadow-xs p-5 flex flex-col gap-4">

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">과목명</label>
                <input
                  {...register('subject')}
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:bg-white transition"
                />
                {errors.subject && <p className="mt-1 text-xs text-rose-500">{errors.subject.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">설명</label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:bg-white transition resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">목표 달성일</label>
                <input
                  {...register('target_date')}
                  type="date"
                  min={today}
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:bg-white transition"
                />
                {errors.target_date && <p className="mt-1 text-xs text-rose-500">{errors.target_date.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2">요일별 가용 시간</label>
                <AvailableTimeInput value={availableTime} onChange={setAvailableTime} />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={cancelEdit}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition cursor-pointer"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isUpdating}
                className="flex-1 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isUpdating ? '저장 중...' : '저장'}
              </button>
            </div>

            {/* 삭제 */}
            <div className="pt-2">
              {!showDeleteConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full py-2.5 rounded-xl border border-rose-200 text-sm font-semibold text-rose-500 hover:bg-rose-50 transition cursor-pointer"
                >
                  목표 삭제
                </button>
              ) : (
                <div className="bg-rose-50 rounded-xl border border-rose-100 p-4 text-center">
                  <p className="text-sm text-rose-700 font-medium mb-3">
                    정말 삭제하시겠습니까? 연결된 주간 계획도 함께 삭제됩니다.
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 py-2 rounded-lg border border-rose-200 text-sm font-semibold text-rose-400 hover:bg-white transition cursor-pointer"
                    >
                      취소
                    </button>
                    <button
                      type="button"
                      onClick={onDelete}
                      disabled={isDeleting}
                      className="flex-1 py-2 rounded-lg bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 disabled:opacity-50 transition cursor-pointer"
                    >
                      {isDeleting ? '삭제 중...' : '삭제 확인'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </form>
        ) : (
          /* ── 상세 보기 ── */
          <div className="flex flex-col gap-4">

            {/* 진행률 카드 */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-xs p-5">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-semibold text-gray-500">전체 진행률</span>
                <span className="text-2xl font-bold text-gray-900">{pct}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-400 rounded-full transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
              {progress && (
                <p className="text-xs text-gray-400 mt-2">
                  {progress.completed} / {progress.total}개 완료
                </p>
              )}
            </div>

            {/* 목표 정보 */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-xs p-5 flex flex-col gap-4">
              {goal.description && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 mb-1">설명</p>
                  <p className="text-sm text-gray-700">{goal.description}</p>
                </div>
              )}
              <div>
                <p className="text-xs font-semibold text-gray-400 mb-1">목표 달성일</p>
                <p className="text-sm text-gray-700">{goal.target_date}</p>
              </div>
              {activeDays.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 mb-2">가용 요일</p>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(goal.available_time)
                      .filter(([, mins]) => mins && (mins as number) > 0)
                      .map(([day, mins]) => (
                        <span
                          key={day}
                          className="text-xs bg-gray-50 text-gray-600 px-2.5 py-1 rounded-lg border border-gray-100"
                        >
                          {DAY_KO[day]} · {((mins as number) / 60).toFixed(1).replace('.0', '')}시간
                        </span>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* 주간 계획 섹션 (F-02 연동 예정) */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-xs p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-gray-500">주간 계획</p>
              </div>
              <p className="text-sm text-gray-300 text-center py-4">
                주간 계획은 F-02에서 연동됩니다.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
