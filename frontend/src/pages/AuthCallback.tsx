import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

export default function AuthCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    const token = searchParams.get('token')
    if (token) {
      localStorage.setItem('access_token', token)
      navigate('/dashboard')
    } else {
      navigate('/login')
    }
  }, [searchParams, navigate])

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#F4EFE4]">
      <div className="text-center">
        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-emerald-800 border-t-transparent mx-auto" />
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#A49C8B]">
          Signing you in…
        </p>
      </div>
    </div>
  )
}
