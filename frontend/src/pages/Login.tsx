/* eslint-disable @typescript-eslint/no-explicit-any */
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
    setLoading(true); setError('')
    try {
      const res = await login(username, password)
      if (res.access_token) {
        localStorage.setItem('access_token', res.access_token)
        navigate('/dashboard')
      } else { setError('Invalid credentials') }
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center relative overflow-hidden">
      <div className="grain-overlay" />
      <div className="absolute top-[-20%] right-[-15%] w-[70vw] h-[70vw] bg-[radial-gradient(circle,rgba(5,150,105,0.07)_0%,transparent_60%)] pointer-events-none" />
      <div className="absolute bottom-[-15%] left-[-10%] w-[50vw] h-[50vw] bg-[radial-gradient(circle,rgba(176,137,71,0.05)_0%,transparent_55%)] pointer-events-none" />

      <svg className="absolute top-[-80px] right-[-60px] opacity-[0.07]" width="400" height="400" viewBox="0 0 400 400">
        <path d="M200 30L260 100L340 80L290 160L360 200L280 230L310 320L200 270L90 320L120 230L40 200L110 160L60 80L140 100Z" fill="#34d399"/>
        <circle cx="200" cy="200" r="60" fill="#047857" opacity="0.4"/>
      </svg>

      <div className="bg-surface-card border border-border-subtle rounded-2xl p-11 w-[380px] relative z-10 shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <img src="/lorespring-assets/lorespring-logo.png" alt="LoreSpring" className="w-12 h-12 object-contain anim-float" />
          <h1 className="font-serif text-[28px] font-semibold text-emerald-700">LoreSpring</h1>
        </div>
        <p className="text-text-secondary text-sm mb-6">Sign in to your writing world</p>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-text-secondary text-xs font-medium">Username</label>
            <input type="text" placeholder="your_username" value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              className="bg-surface-muted border border-border-subtle rounded-lg px-4 py-2.5 text-text-primary text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-700/10 transition-all" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-text-secondary text-xs font-medium">Password</label>
            <input type="password" placeholder="••••••••" value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              className="bg-surface-muted border border-border-subtle rounded-lg px-4 py-2.5 text-text-primary text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-700/10 transition-all" />
          </div>
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button onClick={handleSubmit} disabled={loading}
            className="bg-emerald-700 text-white rounded-lg py-3 text-sm font-semibold cursor-pointer hover:shadow-[0_4px_16px_rgba(5,150,105,0.3)] transition-all disabled:opacity-50 mt-1">
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
          <div className="flex items-center gap-3 my-2">
            <div className="flex-1 h-px bg-border-subtle"></div>
            <span className="text-text-muted text-xs">or</span>
            <div className="flex-1 h-px bg-border-subtle"></div>
          </div>
          <p className="text-text-secondary text-xs text-center">
            No account? <a href="/register" className="text-emerald-700 hover:underline">Create one</a>
          </p>
          <p className="text-text-secondary text-xs text-center">
            <a href="/" className="hover:underline">&larr; Back to home</a>
          </p>
        </div>
      </div>
    </div>
  )
}
