import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMe, useUpdateMe, useChangePassword, useDeleteAccount } from '../../hooks/useUsers'
import { useLogout } from '../../hooks/useAuth'
import type { Grade } from '../../types'

const GRADES: Grade[] = ['고1', '고2', '고3']

function errMsg(e: unknown, fallback: string) {
  return (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback
}

// ─── 프로필 수정 카드 ─────────────────────────────────────────────────────────
function ProfileSection() {
  const { data: me, isLoading } = useMe()
  const { mutate: updateMe, isPending } = useUpdateMe()
  const [name, setName] = useState('')
  const [school, setSchool] = useState('')
  const [grade, setGrade] = useState<Grade | ''>('')
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')

  // 서버 데이터가 도착하면 폼 초기값을 채운다.
  useEffect(() => {
    if (me) {
      setName(me.name ?? '')
      setSchool(me.school ?? '')
      setGrade(me.grade ?? '')
    }
  }, [me])

  const onSave = () => {
    setMsg('')
    setError('')
    updateMe(
      { name, school: school || undefined, grade: grade || undefined },
      {
        onSuccess: () => setMsg('저장되었습니다'),
        onError: (e) => setError(errMsg(e, '저장에 실패했습니다')),
      },
    )
  }

  if (isLoading) {
    return <div className="h-40 bg-gray-100 rounded-xl animate-pulse" />
  }

  return (
    <section className="bg-white rounded-xl border border-gray-100 shadow-xs p-5 flex flex-col gap-4">
      <h2 className="text-sm font-semibold text-gray-700">프로필</h2>

      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1.5">이메일</label>
        <p className="px-3.5 py-2.5 text-sm rounded-lg bg-gray-50 text-gray-400 border border-gray-100">
          {me?.email}
        </p>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1.5">이름</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:bg-white transition"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1.5">학교</label>
        <input
          value={school}
          onChange={(e) => setSchool(e.target.value)}
          placeholder="○○고등학교"
          className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 bg-gray-50 text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:bg-white transition"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1.5">학년</label>
        <select
          value={grade}
          onChange={(e) => setGrade(e.target.value as Grade | '')}
          className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:bg-white transition"
        >
          <option value="">선택 안 함</option>
          {GRADES.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </div>

      {msg && <p className="text-xs text-emerald-600">{msg}</p>}
      {error && <p className="text-xs text-rose-500">{error}</p>}

      <button
        onClick={onSave}
        disabled={isPending || name.trim() === ''}
        className="self-start px-5 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {isPending ? '저장 중...' : '프로필 저장'}
      </button>
    </section>
  )
}

// ─── 비밀번호 변경 카드 ───────────────────────────────────────────────────────
function PasswordSection() {
  const { mutate: changePassword, isPending } = useChangePassword()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')

  const onSubmit = () => {
    setMsg('')
    setError('')
    if (next.length < 8) {
      setError('새 비밀번호는 8자 이상이어야 합니다')
      return
    }
    changePassword(
      { current_password: current, new_password: next },
      {
        onSuccess: () => {
          setMsg('비밀번호가 변경되었습니다')
          setCurrent('')
          setNext('')
        },
        onError: (e) => setError(errMsg(e, '비밀번호 변경에 실패했습니다')),
      },
    )
  }

  return (
    <section className="bg-white rounded-xl border border-gray-100 shadow-xs p-5 flex flex-col gap-4">
      <h2 className="text-sm font-semibold text-gray-700">비밀번호 변경</h2>

      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1.5">현재 비밀번호</label>
        <input
          type="password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          autoComplete="current-password"
          className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:bg-white transition"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1.5">새 비밀번호</label>
        <input
          type="password"
          value={next}
          onChange={(e) => setNext(e.target.value)}
          autoComplete="new-password"
          placeholder="8자 이상"
          className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 bg-gray-50 text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:bg-white transition"
        />
      </div>

      {msg && <p className="text-xs text-emerald-600">{msg}</p>}
      {error && <p className="text-xs text-rose-500">{error}</p>}

      <button
        onClick={onSubmit}
        disabled={isPending || current === '' || next === ''}
        className="self-start px-5 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {isPending ? '변경 중...' : '비밀번호 변경'}
      </button>
    </section>
  )
}

// ─── 위험 구역: 회원 탈퇴 ─────────────────────────────────────────────────────
function DangerSection() {
  const navigate = useNavigate()
  const { mutate: deleteAccount, isPending } = useDeleteAccount()
  const [open, setOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const onDelete = () => {
    setError('')
    deleteAccount(password, {
      onSuccess: () => navigate('/login', { replace: true }),
      onError: (e) => setError(errMsg(e, '회원 탈퇴에 실패했습니다')),
    })
  }

  return (
    <section className="bg-white rounded-xl border border-rose-100 shadow-xs p-5 flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-rose-600">회원 탈퇴</h2>
      <p className="text-xs text-gray-400">
        탈퇴 시 계정과 모든 목표·계획 데이터가 삭제되며 되돌릴 수 없습니다.
      </p>

      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="self-start px-5 py-2.5 rounded-lg border border-rose-200 text-rose-600 text-sm font-semibold hover:bg-rose-50 active:scale-[0.98] transition-all cursor-pointer"
        >
          회원 탈퇴
        </button>
      ) : (
        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">
              확인을 위해 비밀번호를 입력하세요
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:bg-white transition"
            />
          </div>
          {error && <p className="text-xs text-rose-500">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={onDelete}
              disabled={isPending || password === ''}
              className="px-5 py-2.5 rounded-lg bg-rose-600 text-white text-sm font-semibold hover:bg-rose-500 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isPending ? '처리 중...' : '영구 삭제'}
            </button>
            <button
              onClick={() => { setOpen(false); setPassword(''); setError('') }}
              className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-500 text-sm font-semibold hover:bg-gray-50 active:scale-[0.98] transition-all cursor-pointer"
            >
              취소
            </button>
          </div>
        </div>
      )}
    </section>
  )
}

// ─── 마이페이지 ───────────────────────────────────────────────────────────────
export default function MyPage() {
  const navigate = useNavigate()
  const { mutate: logout, isPending: loggingOut } = useLogout()

  const onLogout = () => {
    logout(undefined, {
      // 서버 로그아웃이 실패해도 클라이언트 세션은 정리되므로 로그인 화면으로 보낸다.
      onSettled: () => navigate('/login', { replace: true }),
    })
  }

  return (
    <div className="min-h-screen bg-[#F7F5F0]">
      <div className="max-w-xl mx-auto px-4 py-12">
        <header className="mb-10">
          <Link
            to="/goals"
            className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 mb-4 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            목표 목록
          </Link>
          <div className="flex items-end justify-between">
            <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-serif)' }}>
              마이페이지
            </h1>
            <button
              onClick={onLogout}
              disabled={loggingOut}
              className="px-4 py-2 text-sm font-semibold text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 active:scale-[0.97] transition-all disabled:opacity-50 cursor-pointer"
            >
              {loggingOut ? '로그아웃 중...' : '로그아웃'}
            </button>
          </div>
        </header>

        <div className="flex flex-col gap-5">
          <ProfileSection />
          <PasswordSection />
          <DangerSection />
        </div>
      </div>
    </div>
  )
}
