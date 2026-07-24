import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useLogin } from '../../hooks/useAuth'

const schema = z.object({
  email: z.string().email('올바른 이메일을 입력하세요'),
  password: z.string().min(1, '비밀번호를 입력하세요'),
})
type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const navigate = useNavigate()
  const { mutate: login, isPending } = useLogin()
  const [submitError, setSubmitError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = (data: FormData) => {
    setSubmitError('')
    login(data, {
      onSuccess: () => navigate('/goals', { replace: true }),
      onError: (e: unknown) => {
        const msg = (e as { response?: { data?: { message?: string } } })
          ?.response?.data?.message
        setSubmitError(msg ?? '로그인에 실패했습니다')
      },
    })
  }

  return (
    <div className="min-h-screen bg-[#F7F5F0]">
      <div className="max-w-sm mx-auto px-4 py-20">

        <header className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-serif)' }}>
            로그인
          </h1>
          <p className="mt-2 text-sm text-gray-400">StudyMate에 오신 것을 환영합니다</p>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">

          <div className="bg-white rounded-xl border border-gray-100 shadow-xs p-5">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">이메일</label>
            <input
              {...register('email')}
              type="email"
              placeholder="you@example.com"
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 bg-gray-50 text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:bg-white transition"
            />
            {errors.email && <p className="mt-1.5 text-xs text-rose-500">{errors.email.message}</p>}
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-xs p-5">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">비밀번호</label>
            <input
              {...register('password')}
              type="password"
              placeholder="비밀번호를 입력하세요"
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 bg-gray-50 text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:bg-white transition"
            />
            {errors.password && <p className="mt-1.5 text-xs text-rose-500">{errors.password.message}</p>}
          </div>

          {submitError && (
            <p className="text-xs text-rose-500 text-center">{submitError}</p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isPending ? '로그인 중...' : '로그인'}
          </button>

          <p className="text-center text-xs text-gray-400">
            아직 계정이 없으신가요?{' '}
            <Link to="/signup" className="font-semibold text-gray-700 hover:text-gray-900 transition-colors">
              회원가입
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
