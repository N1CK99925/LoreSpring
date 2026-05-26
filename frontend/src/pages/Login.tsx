/* eslint-disable @typescript-eslint/no-explicit-any */
// pages/Login.tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../api/auth'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await login(username, password)
      if (res.access_token) {
        localStorage.setItem('access_token', res.access_token)
        navigate('/dashboard')
      } else {
        setError('Invalid credentials')
      }
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f7faf7] flex items-center justify-center relative overflow-hidden">
      {/* Decorative blobs */}
      <svg className="absolute top-[-80px] right-[-60px] opacity-10" width="400" height="400" viewBox="0 0 400 400">
        <path d="M200 30L260 100L340 80L290 160L360 200L280 230L310 320L200 270L90 320L120 230L40 200L110 160L60 80L140 100Z" fill="#22c9a0"/>
        <circle cx="200" cy="200" r="60" fill="#0d8c4a" opacity="0.4"/>
      </svg>
      <svg className="absolute bottom-[-60px] left-[-40px] opacity-8" width="300" height="300" viewBox="0 0 300 300">
        <path d="M150 20L200 80L270 60L230 140L290 160L210 185L240 260L150 220L60 260L90 185L10 160L70 140L30 60L100 80Z" fill="#0d8c4a"/>
      </svg>

      <div className="bg-white border border-[#c8e6cc] rounded-2xl p-11 w-[380px] relative z-10 shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <LogoIcon />
          <h1 className="font-serif text-[28px] font-semibold text-[#0d8c4a]">LoreSpring</h1>
        </div>
        <p className="text-[#3d6b48] text-sm mb-6">Sign in to your writing world</p>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[#3d6b48] text-xs font-medium">Username</label>
            <input
              type="text"
              placeholder="your_username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              className="bg-[#eef6ef] border border-[#c8e6cc] rounded-lg px-4 py-2.5 text-[#1a3320] text-sm outline-none focus:border-[#8ec99a] focus:ring-2 focus:ring-[#0d8c4a]/10 transition-all"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[#3d6b48] text-xs font-medium">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              className="bg-[#eef6ef] border border-[#c8e6cc] rounded-lg px-4 py-2.5 text-[#1a3320] text-sm outline-none focus:border-[#8ec99a] focus:ring-2 focus:ring-[#0d8c4a]/10 transition-all"
            />
          </div>

          {error && <p className="text-red-500 text-xs">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-[#0d8c4a] text-white rounded-lg py-3 text-sm font-semibold cursor-pointer hover:shadow-[0_4px_16px_rgba(13,140,74,0.3)] transition-all disabled:opacity-50 mt-1"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          <div className="flex items-center gap-3 my-2">
            <div className="flex-1 h-px bg-[#c8e6cc]"></div>
            <span className="text-[#9ec8a2] text-xs">or</span>
            <div className="flex-1 h-px bg-[#c8e6cc]"></div>
          </div>

          <p className="text-[#3d6b48] text-xs text-center">
            No account?{' '}
            <a href="/register" className="text-[#0d8c4a] hover:underline">Create one</a>
          </p>
          <p className="text-[#3d6b48] text-xs text-center">
            <a href="/" className="hover:underline">← Back to home</a>
          </p>
        </div>
      </div>
    </div>
  )
}

const LogoIcon = () => (
  <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
    <path d="M15 3L20 10L27 8L23 15L29 17L22 20L25 27L15 22L5 27L8 20L1 17L7 15L3 8L10 10Z" fill="#22c9a0" opacity="0.85"/>
    <path d="M15 15L13 26L15 28L17 26Z" fill="#0d8c4a"/>
    <ellipse cx="15" cy="12" rx="4" ry="4" fill="#b8f0e0" opacity="0.9"/>
    <ellipse cx="15" cy="12" rx="2" ry="2" fill="#fff" opacity="0.7"/>
  </svg>
)