/* eslint-disable @typescript-eslint/no-explicit-any */
// pages/Register.tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { register } from '../api/auth'

export default function Register() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await register(username, email, password)
      if (res.id) {
        navigate('/login')
      } else {
        setError('Registration failed')
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f7faf7] flex items-center justify-center relative overflow-hidden">
      <svg className="absolute top-[-80px] left-[-60px] opacity-10" width="350" height="350" viewBox="0 0 350 350">
        <path d="M175 25L230 90L310 70L265 155L340 175L260 205L290 290L175 245L60 290L90 205L10 175L85 155L40 70L120 90Z" fill="#22c9a0"/>
      </svg>

      <div className="bg-white border border-[#c8e6cc] rounded-2xl p-11 w-[380px] relative z-10 shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <LogoIcon />
          <h1 className="font-serif text-[28px] font-semibold text-[#0d8c4a]">LoreSpring</h1>
        </div>
        <p className="text-[#3d6b48] text-sm mb-6">Begin your story</p>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[#3d6b48] text-xs font-medium">Username</label>
            <input
              type="text"
              placeholder="your_username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="bg-[#eef6ef] border border-[#c8e6cc] rounded-lg px-4 py-2.5 text-[#1a3320] text-sm outline-none focus:border-[#8ec99a] focus:ring-2 focus:ring-[#0d8c4a]/10 transition-all"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[#3d6b48] text-xs font-medium">Email</label>
            <input
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
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
              className="bg-[#eef6ef] border border-[#c8e6cc] rounded-lg px-4 py-2.5 text-[#1a3320] text-sm outline-none focus:border-[#8ec99a] focus:ring-2 focus:ring-[#0d8c4a]/10 transition-all"
            />
          </div>

          {error && <p className="text-red-500 text-xs">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-[#0d8c4a] text-white rounded-lg py-3 text-sm font-semibold cursor-pointer hover:shadow-[0_4px_16px_rgba(13,140,74,0.3)] transition-all disabled:opacity-50 mt-1"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>

          <p className="text-[#3d6b48] text-xs text-center">
            Already have an account?{' '}
            <a href="/login" className="text-[#0d8c4a] hover:underline">Sign in</a>
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