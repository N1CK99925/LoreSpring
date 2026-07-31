/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useReveal } from '../hooks/useReveal'
import { login } from '../api/auth'

const ease = 'ease-[cubic-bezier(0.32,0.72,0,1)]'

/* ──────────────────────────────────────────────
   Icons
   ────────────────────────────────────────────── */

function ArrowUpRight({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 17L17 7" />
      <path d="M8 7h9v9" />
    </svg>
  )
}

function ArrowLeft({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5" />
      <path d="M12 19l-7-7 7-7" />
    </svg>
  )
}

function Constellation({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 400 300"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M40 44L112 82M112 82L72 150M112 82L182 118M182 118L224 208M182 118L300 68M224 208L282 240M300 68L342 158M342 158L282 240" className="text-amber-900/25" />
      <path d="M96 60L182 118M182 118L336 96" className="text-emerald-800/25" />
      <circle cx="40" cy="44" r="3" className="fill-amber-800/40" />
      <circle cx="112" cy="82" r="3" className="fill-amber-800/50" />
      <circle cx="72" cy="150" r="2" className="fill-amber-800/40" />
      <circle cx="182" cy="118" r="3.5" className="fill-emerald-700/50" />
      <circle cx="224" cy="208" r="2.5" className="fill-emerald-700/40" />
      <circle cx="300" cy="68" r="3" className="fill-amber-800/40" />
      <circle cx="342" cy="158" r="2.5" className="fill-amber-800/40" />
      <circle cx="282" cy="240" r="2" className="fill-emerald-700/40" />
      <circle cx="96" cy="60" r="1.5" className="fill-emerald-700/40" />
      <circle cx="336" cy="96" r="1.5" className="fill-amber-800/30" />
    </svg>
  )
}

/* ──────────────────────────────────────────────
   Nav — floating glass island
   ────────────────────────────────────────────── */

function IslandNav({ onNavigate }: { onNavigate: (path: string) => void }) {
  return (
    <nav className="fixed left-1/2 top-4 z-50 w-max max-w-[calc(100vw-1.5rem)] -translate-x-1/2 md:top-5">
      <div className="flex items-center gap-1.5 rounded-full border border-black/[0.07] bg-[#FDFBF7]/80 py-2 pl-4 pr-2 shadow-[0_16px_50px_-28px_rgba(26,24,20,0.4)] backdrop-blur-2xl">
        <button
          className="flex cursor-pointer items-center gap-2.5 border-none bg-transparent no-underline"
          onClick={() => onNavigate('/')}
        >
          <img
            src="/lorespring-assets/lorespring-logo.png"
            alt="LoreSpring"
            className="h-7 w-7 object-contain md:h-8 md:w-8"
          />
          <span className="font-serif text-lg font-bold tracking-[0.06em] text-emerald-800 md:text-xl">
            LoreSpring
          </span>
        </button>

        <button
          aria-label="Back to home"
          onClick={() => onNavigate('/')}
          className="ml-1.5 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-black/[0.07] bg-white/60 text-[#6B6559] transition-colors duration-300 hover:bg-white hover:text-emerald-800"
        >
          <ArrowLeft />
        </button>
      </div>
    </nav>
  )
}

/* ──────────────────────────────────────────────
   Double-Bezel form field
   ────────────────────────────────────────────── */

interface BezelFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
}

function BezelField({ label, className = '', ...props }: BezelFieldProps) {
  return (
    <div className={`rounded-2xl bg-black/[0.05] p-1 ring-1 ring-black/[0.06] transition-all duration-700 ${ease} focus-within:bg-emerald-800/[0.05] focus-within:ring-emerald-800/20 ${className}`}>
      <div className="relative overflow-hidden rounded-[calc(1rem-0.25rem)] bg-white/60 px-4 py-3 shadow-[inset_0_1px_1px_rgba(255,255,255,0.7)] transition-colors duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] focus-within:bg-white">
        <label className="block font-mono text-[9px] font-medium uppercase tracking-[0.24em] text-[#A49C8B]">
          {label}
        </label>
        <input
          className="mt-1.5 w-full bg-transparent text-[15px] font-medium text-[#221D14] outline-none placeholder:text-[#A49C8B]/50"
          {...props}
        />
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────
   Page
   ────────────────────────────────────────────── */

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  useReveal()

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
    <div className="relative isolate min-h-[100dvh] overflow-x-hidden bg-[#F4EFE4] text-[#221D14]">
      <div className="grain-overlay" />

      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="anim-drift absolute -right-40 -top-48 h-[34rem] w-[34rem] rounded-full bg-emerald-200/25 blur-[120px] will-change-transform" />
        <div className="anim-drift-delayed absolute -left-44 bottom-[-12rem] h-[32rem] w-[32rem] rounded-full bg-amber-200/20 blur-[120px] will-change-transform" />
      </div>

      <IslandNav onNavigate={navigate} />

      <main className="relative mx-auto grid w-full max-w-[1180px] grid-cols-1 gap-14 px-4 pb-20 pt-28 md:px-8 md:pt-36 lg:min-h-[100dvh] lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center lg:gap-24 lg:pb-0">
        {/* Editorial split — left */}
        <div className="relative flex flex-col justify-center">
          <Constellation className="pointer-events-none absolute -left-12 bottom-0 hidden w-[22rem] -rotate-6 text-amber-900 opacity-60 lg:block" />

          <div className="relative">
            <span className="reveal-lift inline-flex w-max items-center gap-2 rounded-full border border-black/[0.08] bg-white/50 px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8A857D]">
              <span className="h-1 w-1 rounded-full bg-emerald-700" />
              Welcome back
            </span>

            <div className="reveal-lift reveal-delay-1 mt-8 h-px w-10 bg-emerald-800/40" />

            <h1 className="reveal-lift reveal-delay-1 mt-6 max-w-xl font-serif font-medium leading-[0.95] tracking-[-0.015em] text-[#221D14] text-[42px] sm:text-6xl md:text-7xl lg:text-[5rem]">
              Continue the <em className="italic text-emerald-800">story</em> you set down.
            </h1>

            <p className="reveal-lift reveal-delay-2 mt-7 max-w-md text-[15px] leading-relaxed text-[#6B6559] md:text-base">
              Sign in to return to the loom — every chapter, memory, and thread of your world
              awaits exactly where you left it.
            </p>

            <div className="reveal-lift reveal-delay-3 mt-14 hidden items-center gap-3 lg:flex">
              <span className="font-mono text-[9px] uppercase tracking-[0.26em] text-[#A49C8B]">
                Your world, remembered
              </span>
              <span className="h-px w-16 bg-black/[0.08]" />
            </div>
          </div>
        </div>

        {/* Editorial split — right, the auth card */}
        <div className="reveal-lift reveal-delay-2 w-full lg:w-[420px]">
          <div className="rounded-[2rem] bg-black/[0.05] p-2 ring-1 ring-black/[0.06] shadow-[0_30px_70px_-38px_rgba(26,24,20,0.4)]">
            <div className="relative overflow-hidden rounded-[calc(2rem-0.5rem)] bg-[#FDFBF7] px-7 py-10 md:px-9">
              <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
              <span className="pointer-events-none absolute -right-3 -top-8 select-none font-serif italic leading-none text-[6.5rem] text-black/[0.04]">
                01
              </span>

              <div className="relative mb-1.5 flex items-center gap-3">
                <img
                  src="/lorespring-assets/lorespring-logo.png"
                  alt=""
                  className="h-6 w-6 object-contain"
                />
                <span className="font-serif text-xl font-semibold tracking-[0.04em] text-[#221D14]">
                  Sign in
                </span>
              </div>
              <p className="relative mb-8 font-mono text-[10px] uppercase tracking-[0.2em] text-[#A49C8B]">
                Return to your writing world
              </p>

              <div className="relative flex flex-col gap-4">
                <BezelField
                  label="Username"
                  type="text"
                  placeholder="your_username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  autoComplete="username"
                />
                <BezelField
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  autoComplete="current-password"
                />

                {error && (
                  <p role="alert" className="font-mono text-[10px] uppercase tracking-[0.18em] text-red-700/80">
                    {error}
                  </p>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="group mt-2 flex w-full items-center justify-between rounded-full bg-emerald-800 py-3 pl-7 pr-3 text-[15px] font-medium text-[#F7F4EC] cursor-pointer border-none transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-emerald-700 hover:shadow-[0_18px_50px_-18px_rgba(5,150,105,0.55)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? 'Signing in…' : 'Sign in'}
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:scale-105">
                    <ArrowUpRight className="text-[#F7F4EC]/90" />
                  </span>
                </button>

                <div className="flex items-center gap-4">
                  <span className="h-px flex-1 bg-black/[0.07]" />
                  <span className="font-mono text-[9px] uppercase tracking-[0.26em] text-[#A49C8B]">
                    or
                  </span>
                  <span className="h-px flex-1 bg-black/[0.07]" />
                </div>

                <button
                  onClick={() => navigate('/register')}
                  className="group flex w-full items-center justify-between rounded-full border border-black/[0.1] bg-white/40 py-3 pl-7 pr-3 text-[15px] font-medium text-[#221D14] cursor-pointer transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-emerald-800/25 hover:bg-white hover:shadow-[0_16px_45px_-22px_rgba(26,24,20,0.35)] active:scale-[0.98]"
                >
                  Create an account
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black/[0.05] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:scale-105 group-hover:bg-emerald-800">
                    <ArrowUpRight className="text-[#8A857D] transition-colors duration-500 group-hover:text-white" />
                  </span>
                </button>

                <button
                  onClick={() => navigate('/')}
                  className="group mx-auto mt-2 flex cursor-pointer items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-[#A49C8B] border-none bg-transparent transition-colors duration-300 hover:text-emerald-800"
                >
                  <ArrowLeft className="transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:-translate-x-1" />
                  Back to home
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
