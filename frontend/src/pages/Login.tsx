import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../api/auth'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async () => {
    const res = await login(username, password)
    if (res.access_token) {
      localStorage.setItem('access_token', res.access_token)
      navigate('/dashboard')
    } else {
      setError('Invalid credentials')
    }
  }

  return (
    <div className="min-h-screen bg-[#080D0A] flex items-center justify-center">
      <div className="bg-[#0F1A12] border border-[#1A3320] rounded-xl p-10 w-90 flex flex-col gap-4">
        
        <h1 className="text-[#00A86B] text-3xl font-bold" style={{ fontFamily: 'Fraunces, serif' }}>
          LoreSpring
        </h1>
        <p className="text-[#A8C5B0] text-sm">Sign in to continue</p>

        <input
          className="bg-[#080D0A] border border-[#1A3320] rounded-lg px-4 py-2 text-white text-sm outline-none focus:border-[#00A86B] transition-colors"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <input
          className="bg-[#080D0A] border border-[#1A3320] rounded-lg px-4 py-2 text-white text-sm outline-none focus:border-[#00A86B] transition-colors"
          placeholder="Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        {error && <p className="text-red-400 text-xs">{error}</p>}

        <button
          className="bg-[#00A86B] hover:shadow-[0_0_12px_rgba(0,168,107,0.4)] text-white rounded-lg py-3 text-sm font-semibold cursor-pointer transition-all mt-1"
          onClick={handleSubmit}
        >
          Login
        </button>

        <p className="text-[#A8C5B0] text-xs text-center">
          No account?{' '}
          <a href="/register" className="text-[#00A86B] hover:underline">Register</a>
        </p>
      </div>
    </div>
  )
}