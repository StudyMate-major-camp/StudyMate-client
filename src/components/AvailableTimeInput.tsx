import type { Day } from '../types'

const DAYS: { value: Day; label: string }[] = [
  { value: 'MON', label: '월' },
  { value: 'TUE', label: '화' },
  { value: 'WED', label: '수' },
  { value: 'THU', label: '목' },
  { value: 'FRI', label: '금' },
  { value: 'SAT', label: '토' },
  { value: 'SUN', label: '일' },
]

interface Props {
  value: Partial<Record<Day, number>>
  onChange: (v: Partial<Record<Day, number>>) => void
}

export default function AvailableTimeInput({ value, onChange }: Props) {
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
                active ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400 hover:bg-gray-200',
              ].join(' ')}
            >
              {label}
            </button>
          )
        })}
      </div>

      {DAYS.filter(({ value: day }) => value[day] !== undefined).map(({ value: day, label }) => (
        <div
          key={day}
          className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 rounded-lg border border-gray-100"
        >
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
