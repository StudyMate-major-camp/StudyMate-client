import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useSignup } from '../../hooks/useAuth'
import type { Grade } from '../../types'

const grades: Grade[] = ['고1', '고2', '고3']

const schema = z.object({
  email: z.string().email('올바른 이메일을 입력하세요'),
  password: z.string().min(6, '비밀번호는 6자 이상이어야 합니다'),
  name: z.string().min(1, '이름을 입력하세요').max(50),
  school: z.string().max(100).optional(),
  grade: z.enum(['고1', '고2', '고3']).optional(),
})
type FormData = z.infer<typeof schema>

export default function SignupPage() {
  const navigate = useNavigate()
  const { mutate: signup, isPending } = useSignup()
  const [submitError, setSubmitError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = (data: FormData) => {
    setSubmitError('')
    // 빈 문자열 옵션 값은 서버로 보내지 않는다.
    const body = {
      email: data.email,
      password: data.password,
      name: data.name,
      ...(data.school ? { school: data.school } : {}),
      ...(data.grade ? { grade: data.grade } : {}),
    }
    signup(body, {
      onSuccess: () => navigate('/login', { replace: true }),
      onError: (e: unknown) => {
        const msg = (e as { response?: { data?: { message?: string } } })
          ?.response?.data?.message
        setSubmitError(msg ?? '회원가입에 실패했습니다')
      },
    })
  }

  return (
    <div className="min-h-screen bg-[#F7F5F0]">
      <div className="max-w-sm mx-auto px-4 py-16">

        <header className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-serif)' }}>
            회원가입
          </h1>
          <p className="mt-2 text-sm text-gray-400">StudyMate 계정을 만들어보세요</p>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">

          <div className="bg-white rounded-xl border border-gray-100 shadow-xs p-5">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">
              이메일 <span className="text-rose-400">*</span>
            </label>
            <input
              {...register('email')}
              type="email"
              placeholder="you@example.com"
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 bg-gray-50 text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:bg-white transition"
            />
            {errors.email && <p className="mt-1.5 text-xs text-rose-500">{errors.email.message}</p>}
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-xs p-5">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">
              비밀번호 <span className="text-rose-400">*</span>
            </label>
            <input
              {...register('password')}
              type="password"
              placeholder="6자 이상"
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 bg-gray-50 text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:bg-white transition"
            />
            {errors.password && <p className="mt-1.5 text-xs text-rose-500">{errors.password.message}</p>}
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-xs p-5">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">
              이름 <span className="text-rose-400">*</span>
            </label>
            <input
              {...register('name')}
              placeholder="홍길동"
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 bg-gray-50 text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:bg-white transition"
            />
            {errors.name && <p className="mt-1.5 text-xs text-rose-500">{errors.name.message}</p>}
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-xs p-5">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">
              학교 <span className="text-gray-300">(선택)</span>
            </label>
            <input
              {...register('school')}
              placeholder="예: OO고등학교"
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 bg-gray-50 text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:bg-white transition"
            />
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-xs p-5">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">
              학년 <span className="text-gray-300">(선택)</span>
            </label>
            <select
              {...register('grade')}
              defaultValue=""
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:bg-white transition"
            >
              <option value="">선택 안 함</option>
              {grades.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {submitError && (
            <p className="text-xs text-rose-500 text-center">{submitError}</p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isPending ? '가입 중...' : '회원가입'}
          </button>

          <p className="text-center text-xs text-gray-400">
            이미 계정이 있으신가요?{' '}
            <Link to="/login" className="font-semibold text-gray-700 hover:text-gray-900 transition-colors">
              로그인
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
