/* eslint-disable @typescript-eslint/no-explicit-any */
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
    setLoading(true); setError('')
    try {
      const res = await register(username, email, password)
      if (res.id) { navigate('/login') }
      else { setError('Registration failed') }
    } catch (err: any) {
      setError(err.message || 'Registration failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center relative overflow-hidden">
      <div className="grain-overlay" />
      <div className="absolute top-[-20%] left-[-15%] w-[70vw] h-[70vw] bg-[radial-gradient(circle,rgba(5,150,105,0.07)_0%,transparent_60%)] pointer-events-none" />

      <svg className="absolute top-[-80px] left-[-60px] opacity-[0.07]" width="350" height="350" viewBox="0 0 350 350">
        <path d="M175 25L230 90L310 70L265 155L340 175L260 205L290 290L175 245L60 290L90 205L10 175L85 155L40 70L120 90Z" fill="#34d399"/>
      </svg>

      <div className="bg-surface-card border border-border-subtle rounded-2xl p-11 w-[380px] relative z-10 shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <img src="/lorespring-assets/lorespring-logo.png" alt="LoreSpring" className="w-12 h-12 object-contain anim-float" />
          <h1 className="font-serif text-[28px] font-semibold text-emerald-700">LoreSpring</h1>
        </div>
        <p className="text-text-secondary text-sm mb-6">Begin your story</p>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-text-secondary text-xs font-medium">Username</label>
            <input type="text" placeholder="your_username" value={username}
              onChange={e => setUsername(e.target.value)}
              className="bg-surface-muted border border-border-subtle rounded-lg px-4 py-2.5 text-text-primary text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-700/10 transition-all" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-text-secondary text-xs font-medium">Email</label>
            <input type="email" placeholder="you@email.com" value={email}
              onChange={e => setEmail(e.target.value)}
              className="bg-surface-muted border border-border-subtle rounded-lg px-4 py-2.5 text-text-primary text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-700/10 transition-all" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-text-secondary text-xs font-medium">Password</label>
            <input type="password" placeholder="••••••••" value={password}
              onChange={e => setPassword(e.target.value)}
              className="bg-surface-muted border border-border-subtle rounded-lg px-4 py-2.5 text-text-primary text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-700/10 transition-all" />
          </div>
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button onClick={handleSubmit} disabled={loading}
            className="bg-emerald-700 text-white rounded-lg py-3 text-sm font-semibold cursor-pointer hover:shadow-[0_4px_16px_rgba(5,150,105,0.3)] transition-all disabled:opacity-50 mt-1">
            {loading ? 'Creating account...' : 'Create account'}
          </button>
          <p className="text-text-secondary text-xs text-center">
            Already have an account? <a href="/login" className="text-emerald-700 hover:underline">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  )
}
