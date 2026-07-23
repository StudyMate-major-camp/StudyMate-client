import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateGoal } from '../../hooks/useGoals'
import type { Day } from '../../types'

const DAYS: { value: Day; label: string }[] = [
  { value: 'MON', label: '월' },
  { value: 'TUE', label: '화' },
  { value: 'WED', label: '수' },
  { value: 'THU', label: '목' },
  { value: 'FRI', label: '금' },
  { value: 'SAT', label: '토' },
  { value: 'SUN', label: '일' },
]

const today = new Date().toISOString().slice(0, 10)

const schema = z.object({
  subject: z.string().min(1, '과목명을 입력하세요').max(100),
  description: z.string().max(500).optional(),
  target_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD 형식으로 입력하세요')
    .refine((v) => v >= today, { message: '오늘 이후 날짜를 선택하세요' }),
})
type FormData = z.infer<typeof schema>

// ─── 요일별 가용 시간 입력 ────────────────────────────────────────────────────
function AvailableTimeInput({
  value,
  onChange,
}: {
  value: Partial<Record<Day, number>>
  onChange: (v: Partial<Record<Day, number>>) => void
}) {
  const toggleDay = (day: Day) => {
    const next = { ...value }
    if (next[day] !== undefined) {
      delete next[day]
    } else {
      next[day] = 60
    }
    onChange(next)
  }

  const setHours = (day: Day, hours: number) => {
    const mins = Math.round(Math.min(24, Math.max(0, hours)) * 60)
    onChange({ ...value, [day]: mins })
  }

  return (
    <div className="flex flex-col gap-2">
      {/* 요일 토글 */}
      <div className="flex gap-1.5">
        {DAYS.map(({ value: day, label }) => {
          const active = value[day] !== undefined
          return (
            <button
              key={day}
              type="button"
              onClick={() => toggleDay(day)}
              className={[
                'flex-1 h-9 rounded-lg text-sm font-semibold transition-all',
                active
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200',
              ].join(' ')}
            >
              {label}
            </button>
          )
        })}
      </div>

      {/* 선택된 요일 시간 입력 */}
      {DAYS.filter(({ value: day }) => value[day] !== undefined).map(({ value: day, label }) => (
        <div key={day} className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 rounded-lg border border-gray-100">
          <span className="text-sm font-semibold text-gray-700 w-4">{label}</span>
          <input
            type="number"
            min={0}
            max={24}
            step={0.5}
            value={(value[day]! / 60).toFixed(1).replace('.0', '')}
            onChange={(e) => setHours(day, parseFloat(e.target.value) || 0)}
            className="w-20 px-2.5 py-1 text-sm text-center rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white"
          />
          <span className="text-sm text-gray-400">시간</span>
          <span className="text-xs text-gray-300 ml-auto">({value[day]}분)</span>
        </div>
      ))}

      {Object.keys(value).length === 0 && (
        <p className="text-xs text-gray-400 px-1">최소 1개 요일을 선택하세요</p>
      )}
    </div>
  )
}

// ─── 메인 페이지 ──────────────────────────────────────────────────────────────
export default function GoalNewPage() {
  const navigate = useNavigate()
  const { mutate: create, isPending } = useCreateGoal()
  const [availableTime, setAvailableTime] = useState<Partial<Record<Day, number>>>({})
  const [timeError, setTimeError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = (data: FormData) => {
    if (Object.keys(availableTime).length === 0) {
      setTimeError('최소 1개 요일을 선택하세요')
      return
    }
    setTimeError('')

    create(
      { ...data, available_time: availableTime },
      { onSuccess: (goal) => navigate(`/goals/${goal.id}`) },
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F5F0]">
      <div className="max-w-xl mx-auto px-4 py-12">

        {/* 헤더 */}
        <header className="mb-10">
          <Link
            to="/goals"
            className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 mb-4 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            목표 목록
          </Link>
          <h1
            className="text-3xl font-bold text-gray-900"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            새 목표 등록
          </h1>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">

          {/* 과목명 */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-xs p-5">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">
              과목명 <span className="text-rose-400">*</span>
            </label>
            <input
              {...register('subject')}
              placeholder="예: 수학, 영어, 국어"
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 bg-gray-50 text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:bg-white transition"
            />
            {errors.subject && (
              <p className="mt-1.5 text-xs text-rose-500">{errors.subject.message}</p>
            )}
          </div>

          {/* 설명 */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-xs p-5">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">
              설명 <span className="text-gray-300">(선택)</span>
            </label>
            <textarea
              {...register('description')}
              placeholder="목표에 대한 간단한 설명을 입력하세요"
              rows={3}
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 bg-gray-50 text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:bg-white transition resize-none"
            />
            {errors.description && (
              <p className="mt-1.5 text-xs text-rose-500">{errors.description.message}</p>
            )}
          </div>

          {/* 목표 달성일 */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-xs p-5">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">
              목표 달성일 <span className="text-rose-400">*</span>
            </label>
            <input
              {...register('target_date')}
              type="date"
              min={today}
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:bg-white transition"
            />
            {errors.target_date && (
              <p className="mt-1.5 text-xs text-rose-500">{errors.target_date.message}</p>
            )}
          </div>

          {/* 가용 시간 */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-xs p-5">
            <label className="block text-xs font-semibold text-gray-500 mb-3">
              요일별 가용 시간 <span className="text-rose-400">*</span>
            </label>
            <AvailableTimeInput value={availableTime} onChange={setAvailableTime} />
            {timeError && (
              <p className="mt-2 text-xs text-rose-500">{timeError}</p>
            )}
          </div>

          {/* 제출 */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isPending ? '저장 중...' : '목표 등록하기'}
          </button>
        </form>
      </div>
    </div>
  )
}
