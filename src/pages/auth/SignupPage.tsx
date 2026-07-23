import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useSignup } from '../../hooks/useAuth'
import type { Grade } from '../../types'

const GRADES: Grade[] = ['고1', '고2', '고3']

const schema = z.object({
  email: z.string().min(1, '이메일을 입력하세요').email('올바른 이메일 형식이 아닙니다'),
  password: z.string().min(8, '비밀번호는 8자 이상이어야 합니다'),
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
    // 빈 문자열 대신 undefined 로 보내 선택 항목을 생략한다.
    const body = {
      ...data,
      school: data.school || undefined,
      grade: data.grade || undefined,
    }
    signup(body, {
      onSuccess: () => navigate('/login', { replace: true }),
      onError: (e: unknown) => {
        const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
        setSubmitError(msg ?? '회원가입에 실패했습니다')
      },
    })
  }

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <header className="mb-8 text-center">
          <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-2">
            StudyMate
          </p>
          <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-serif)' }}>
            회원가입
          </h1>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-xs p-5 flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                이메일 <span className="text-rose-400">*</span>
              </label>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 bg-gray-50 text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:bg-white transition"
              />
              {errors.email && <p className="mt-1.5 text-xs text-rose-500">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                비밀번호 <span className="text-rose-400">*</span>
              </label>
              <input
                {...register('password')}
                type="password"
                autoComplete="new-password"
                placeholder="8자 이상"
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 bg-gray-50 text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:bg-white transition"
              />
              {errors.password && <p className="mt-1.5 text-xs text-rose-500">{errors.password.message}</p>}
            </div>

            <div>
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

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                학교 <span className="text-gray-300">(선택)</span>
              </label>
              <input
                {...register('school')}
                placeholder="○○고등학교"
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 bg-gray-50 text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                학년 <span className="text-gray-300">(선택)</span>
              </label>
              <select
                {...register('grade')}
                defaultValue=""
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:bg-white transition"
              >
                <option value="">선택 안 함</option>
                {GRADES.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
          </div>

          {submitError && <p className="text-xs text-rose-500 text-center">{submitError}</p>}

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isPending ? '가입 중...' : '회원가입'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          이미 계정이 있으신가요?{' '}
          <Link to="/login" className="font-semibold text-indigo-500 hover:underline">
            로그인
          </Link>
        </p>
      </div>
    </div>
  )
}
