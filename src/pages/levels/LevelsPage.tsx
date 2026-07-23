import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useUserLevels, useUpsertUserLevels, useDeleteUserLevel } from '../../hooks/useUserLevels'
import type { Level, UserLevel } from '../../types'

const LEVELS: { value: Level; label: string; color: string; bg: string; ring: string }[] = [
  { value: 'HIGH', label: '상', color: 'text-emerald-700', bg: 'bg-emerald-50', ring: 'ring-emerald-400' },
  { value: 'MID',  label: '중', color: 'text-amber-700',   bg: 'bg-amber-50',   ring: 'ring-amber-400'   },
  { value: 'LOW',  label: '하', color: 'text-rose-700',    bg: 'bg-rose-50',    ring: 'ring-rose-400'    },
]

const addSchema = z.object({
  subject: z
    .string()
    .min(1, '과목명을 입력하세요')
    .max(50, '최대 50자까지 가능합니다'),
})
type AddForm = z.infer<typeof addSchema>

// ─── 수준 토글 버튼 ────────────────────────────────────────────────────────────
function LevelToggle({
  current,
  onChange,
  disabled,
}: {
  current: Level
  onChange: (l: Level) => void
  disabled?: boolean
}) {
  return (
    <div className="flex gap-1">
      {LEVELS.map(({ value, label, color, bg, ring }) => {
        const selected = current === value
        return (
          <button
            key={value}
            type="button"
            disabled={disabled}
            onClick={() => onChange(value)}
            className={[
              'w-9 h-9 rounded-lg text-sm font-semibold transition-all duration-150',
              selected
                ? `${bg} ${color} ring-2 ${ring} shadow-sm`
                : 'bg-gray-100 text-gray-400 hover:bg-gray-200',
              disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
            ].join(' ')}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}

// ─── 과목 행 ───────────────────────────────────────────────────────────────────
function LevelRow({
  item,
  onLevelChange,
  onDelete,
  isMutating,
}: {
  item: UserLevel
  onLevelChange: (subject: string, level: Level) => void
  onDelete: (subject: string) => void
  isMutating: boolean
}) {
  const meta = LEVELS.find((l) => l.value === item.level)!

  return (
    <li className="flex items-center justify-between px-5 py-4 bg-white rounded-xl border border-gray-100 shadow-xs hover:shadow-sm transition-shadow">
      <div className="flex items-center gap-3 min-w-0">
        <span
          className={`shrink-0 w-2 h-2 rounded-full ${
            item.level === 'HIGH' ? 'bg-emerald-400'
            : item.level === 'MID'  ? 'bg-amber-400'
            : 'bg-rose-400'
          }`}
        />
        <span className="font-medium text-gray-800 truncate">{item.subject}</span>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${meta.bg} ${meta.color}`}>
          {meta.label}
        </span>
      </div>

      <div className="flex items-center gap-3 shrink-0 ml-4">
        <LevelToggle
          current={item.level}
          onChange={(level) => onLevelChange(item.subject, level)}
          disabled={isMutating}
        />
        <button
          type="button"
          onClick={() => onDelete(item.subject)}
          disabled={isMutating}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-300 hover:text-rose-500 hover:bg-rose-50 transition-colors disabled:opacity-40 cursor-pointer"
          aria-label={`${item.subject} 삭제`}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 2h4M2 4h12M5.5 4v8a.5.5 0 00.5.5h4a.5.5 0 00.5-.5V4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </li>
  )
}

// ─── 메인 페이지 ──────────────────────────────────────────────────────────────
export default function LevelsPage() {
  const { data: levels = [], isLoading } = useUserLevels()
  const { mutate: upsert, isPending: isUpserting } = useUpsertUserLevels()
  const { mutate: remove, isPending: isDeleting } = useDeleteUserLevel()

  const isMutating = isUpserting || isDeleting

  const [selectedNewLevel, setSelectedNewLevel] = useState<Level>('MID')
  const [mutateError, setMutateError] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<AddForm>({
    resolver: zodResolver(addSchema),
  })

  const handleLevelChange = (subject: string, level: Level) => {
    setMutateError('')
    const updated = levels.map((l) =>
      l.subject === subject ? { subject: l.subject, level } : { subject: l.subject, level: l.level },
    )
    upsert(updated, {
      onError: () => setMutateError('수준 변경에 실패했습니다'),
    })
  }

  const handleDelete = (subject: string) => {
    setMutateError('')
    remove(subject, {
      onError: () => setMutateError('삭제에 실패했습니다'),
    })
  }

  const onAdd = (data: AddForm) => {
    const trimmed = data.subject.trim()
    const isDuplicate = levels.some(
      (l) => l.subject.toLowerCase() === trimmed.toLowerCase(),
    )
    if (isDuplicate) {
      setError('subject', { message: '이미 등록된 과목입니다' })
      return
    }

    const current = levels.map((l) => ({ subject: l.subject, level: l.level }))
    upsert([...current, { subject: trimmed, level: selectedNewLevel }], {
      onSuccess: () => {
        reset()
        setSelectedNewLevel('MID')
      },
    })
  }

  return (
    <div className="min-h-screen bg-[#F7F5F0]">
      <div className="max-w-xl mx-auto px-4 py-12">

        {/* 헤더 */}
        <header className="mb-10">
          <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-2">
            F-11
          </p>
          <h1
            className="text-3xl font-bold text-gray-900 mb-1"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            학습 수준 설정
          </h1>
          <p className="text-sm text-gray-500">
            과목별 현재 수준을 설정하면 AI가 맞춤형 학습 계획을 생성합니다.
          </p>
        </header>

        {/* 수준 범례 */}
        <div className="flex gap-3 mb-8">
          {LEVELS.map(({ value, label, color, bg }) => (
            <div key={value} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${bg}`}>
              <span className={`text-xs font-semibold ${color}`}>{label} ({value})</span>
            </div>
          ))}
        </div>

        {/* 과목 목록 */}
        <section className="mb-6">
          {isLoading ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : levels.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-gray-400 text-sm">등록된 과목이 없습니다.</p>
              <p className="text-gray-300 text-xs mt-1">아래 폼에서 과목을 추가해보세요.</p>
            </div>
          ) : (
            <ul className="flex flex-col gap-2.5">
              {levels.map((item) => (
                <LevelRow
                  key={item.id}
                  item={item}
                  onLevelChange={handleLevelChange}
                  onDelete={handleDelete}
                  isMutating={isMutating}
                />
              ))}
            </ul>
          )}
        </section>

        {/* 구분선 */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400 font-medium">과목 추가</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* 추가 폼 */}
        <form
          onSubmit={handleSubmit(onAdd)}
          className="bg-white rounded-xl border border-gray-100 shadow-xs p-5"
        >
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                과목명
              </label>
              <input
                {...register('subject')}
                placeholder="예: 수학, 영어, 국어..."
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 bg-gray-50 text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:bg-white transition"
              />
              {errors.subject && (
                <p className="mt-1 text-xs text-rose-500">{errors.subject.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                현재 수준
              </label>
              <LevelToggle
                current={selectedNewLevel}
                onChange={setSelectedNewLevel}
              />
            </div>

            <button
              type="submit"
              disabled={isMutating}
              className="w-full py-2.5 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isUpserting ? '저장 중...' : '추가하기'}
            </button>
          </div>
        </form>

        {isMutating && (
          <p className="mt-4 text-center text-xs text-gray-400 animate-pulse">저장 중...</p>
        )}
        {mutateError && (
          <p className="mt-2 text-center text-xs text-rose-500">{mutateError}</p>
        )}
      </div>
    </div>
  )
}
