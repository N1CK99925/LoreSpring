// pages/Review.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getReview, resume, checkPipelineStatus } from '../api/review'
import { ErrorBanner } from '../components/ErrorBanner'

const EASE = 'ease-[cubic-bezier(0.32,0.72,0,1)]'
const ENTER = 'ease-[cubic-bezier(0.16,1,0.3,1)]'

const Icon = ({ d, className = '', strokeWidth = 1.5 }: { d: string; className?: string; strokeWidth?: number }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}
    strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d={d} />
  </svg>
)

const Spinner = ({ className = '' }: { className?: string }) => (
  <svg className={`animate-spin ${className}`} width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
)

const Eyebrow = ({ children }: { children: ReactNode }) => (
  <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/10 bg-emerald-500/[0.03] px-3 py-1">
    <span className="h-1 w-1 rounded-full bg-emerald-500" />
    <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-emerald-700">{children}</span>
  </span>
)

const ScoreRing = ({ score }: { score: number }) => {
  const r = 26
  const c = 2 * Math.PI * r
  const pct = Math.min(1, Math.max(0, (score || 0) / 10))
  return (
    <div className="relative h-16 w-16 shrink-0">
      <svg viewBox="0 0 64 64" className="h-16 w-16 -rotate-90">
        <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(5,150,105,0.1)" strokeWidth="3" />
        <circle cx="32" cy="32" r={r} fill="none" stroke="#047857" strokeWidth="3" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - pct)}
          className={`transition-[stroke-dashoffset] duration-1000 ${ENTER}`} />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-serif text-xl font-light text-emerald-800">
        {score || '—'}
      </span>
    </div>
  )
}

const StatusChip = () => (
  <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/[0.06] px-3.5 py-1.5">
    <span className="relative flex h-1.5 w-1.5">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-600" />
    </span>
    <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-emerald-700">Awaiting decision</span>
  </span>
)

interface ContextProps {
  reviewData: any
  qualityScore: number
  onBack: () => void
  onClose?: () => void
}

function ChapterContextPanel({ reviewData, qualityScore, onBack, onClose }: ContextProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between">
        <Eyebrow>Review mode</Eyebrow>
        {onClose && (
          <button onClick={onClose} aria-label="Close chapter overview"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border-subtle text-text-muted transition-all duration-300 hover:rotate-90 hover:border-border-hover hover:text-text-primary cursor-pointer">
            <Icon d="M18 6 6 18M6 6l12 12" strokeWidth={1.5} />
          </button>
        )}
      </div>

      {reviewData ? (
        <>
          <div className="mt-6 flex items-start justify-between gap-4">
            <div>
              <div className="text-[9px] font-medium uppercase tracking-[0.2em] text-text-muted">Chapter</div>
              <div className="mt-1 font-serif text-4xl font-light leading-none text-text-primary">
                {reviewData.chapter_number}
              </div>
            </div>
            <ScoreRing score={qualityScore} />
          </div>

          <div className="mt-6">
            <div className="text-[9px] font-medium uppercase tracking-[0.2em] text-text-muted">Chapter summary</div>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              {reviewData.chapter_summary || 'No summary provided for this draft.'}
            </p>
          </div>
        </>
      ) : (
        <div className="mt-8 space-y-3">
          <div className="h-3 w-24 animate-pulse rounded-full bg-black/[0.06]" />
          <div className="h-3 w-16 animate-pulse rounded-full bg-black/[0.06]" />
          <div className="mt-6 h-20 animate-pulse rounded-xl bg-black/[0.04]" />
        </div>
      )}

      <div className="mt-auto pt-8">
        <button onClick={onBack}
          className="group flex w-full items-center justify-between rounded-full border-[1.5px] border-black/10 px-5 py-3 text-sm text-text-secondary transition-all duration-500 ${EASE} hover:border-emerald-600 hover:text-emerald-700 active:scale-[0.98] cursor-pointer">
          <span className="font-medium">Back to project</span>
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black/[0.05] text-text-secondary transition-all duration-500 ${EASE} group-hover:-translate-x-0.5 group-hover:scale-105 group-hover:bg-emerald-700 group-hover:text-white">
            <Icon d="M19 12H5M11 18l-6-6 6-6" strokeWidth={1.5} />
          </span>
        </button>
      </div>
    </div>
  )
}

interface VerdictProps {
  loading: boolean
  disabled: boolean
  feedback: Record<string, number>
  getScoreWidth: (score: number) => string
  onApprove: () => void
  onReject: () => void
  onClose?: () => void
}

function VerdictPanel({ loading, disabled, feedback, getScoreWidth, onApprove, onReject, onClose }: VerdictProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between">
        <Eyebrow>The verdict</Eyebrow>
        {onClose && (
          <button onClick={onClose} aria-label="Close review decision"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border-subtle text-text-muted transition-all duration-300 hover:rotate-90 hover:border-border-hover hover:text-text-primary cursor-pointer">
            <Icon d="M18 6 6 18M6 6l12 12" strokeWidth={1.5} />
          </button>
        )}
      </div>

      <h3 className="mt-6 font-serif text-3xl font-light leading-snug text-text-primary">
        Does this draft earn its place?
      </h3>
      <p className="mt-2 text-xs leading-relaxed text-text-secondary">
        Approve to seal the chapter, or reject to send it back through the writing pipeline.
      </p>

      <div className="mt-7 flex flex-col gap-3">
        <button onClick={onApprove} disabled={loading || disabled}
          className="group relative w-full overflow-hidden rounded-full bg-emerald-700 px-6 py-4 text-white transition-all duration-500 ${EASE} hover:bg-emerald-600 hover:shadow-[0_20px_44px_-16px_rgba(5,150,105,0.5)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40 cursor-pointer">
          <span className="relative z-10 flex items-center justify-between">
            <span className="flex items-center gap-2.5 text-sm font-medium tracking-wide">
              {loading && <Spinner className="text-white/70" />}
              {loading ? 'Committing chapter…' : 'Approve chapter'}
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 transition-all duration-500 ${EASE} group-hover:translate-x-0.5 group-hover:scale-105">
              <Icon d="M20 6 9 17l-5-5" strokeWidth={2} className="h-3.5 w-3.5" />
            </span>
          </span>
        </button>

        <button onClick={onReject} disabled={loading || disabled}
          className="group flex w-full items-center justify-between rounded-full border-[1.5px] border-red-200/70 bg-red-500/[0.04] px-6 py-4 text-red-600 transition-all duration-500 ${EASE} hover:border-red-300 hover:bg-red-500/10 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40 cursor-pointer">
          <span className="text-sm font-medium">Reject &amp; regenerate</span>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/10 text-red-500 transition-all duration-500 ${EASE} group-hover:rotate-90 group-hover:scale-105">
            <Icon d="M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6" strokeWidth={1.5} />
          </span>
        </button>
      </div>

      {Object.keys(feedback).length > 0 && (
        <div className="mt-8 border-t border-border-subtle pt-6">
          <div className="text-[9px] font-medium uppercase tracking-[0.22em] text-text-muted">AI feedback</div>
          <div className="mt-4 flex flex-col gap-5">
            {Object.entries(feedback).map(([key, value]) => {
              const numeric = typeof value === 'number' ? value : 0
              return (
                <div key={key}>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-text-secondary">{key}</span>
                    <span className="font-serif text-sm text-emerald-800">{numeric}/10</span>
                  </div>
                  <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-emerald-700/10">
                    <div className="h-full rounded-full bg-linear-to-r from-emerald-700 to-emerald-400 transition-all duration-1000 ${ENTER}"
                      style={{ width: getScoreWidth(numeric) }} />
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-text-muted">{String(value)}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default function Review() {
  const { thread_id } = useParams()
  const navigate = useNavigate()
  const [reviewData, setReviewData] = useState<any>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [chapterText, setChapterText] = useState("")
  const [showSidebar, setShowSidebar] = useState(false)
  const [showDecision, setShowDecision] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (!thread_id) return
    const loadReview = async () => {
      try {
        const data = await getReview(thread_id)
        setReviewData(data)
        if (data?.final_chapter) setChapterText(data.final_chapter)
      } catch (error: any) {
        setError(error.message || "Failed to load review")
      }
    }
    loadReview()
  }, [thread_id])

  const backToProject = () => {
    const projectId = thread_id?.split("-chapter-")[0]
    navigate(`/project/${projectId}`)
  }

  const handleDecision = async (approved: boolean) => {
    try {
      setLoading(true); setError("")
      await resume(thread_id!, approved, chapterText)
      const MAX_RETRIES = 90
      const MAX_DELAY_MS = 30000
      let pollCount = 0
      let isComplete = false
      while (pollCount < MAX_RETRIES && !isComplete) {
        const delay = Math.min(MAX_DELAY_MS, 1000 * Math.pow(2, pollCount))
        await new Promise(resolve => setTimeout(resolve, delay))
        try {
          const status = await checkPipelineStatus(thread_id!)
          if (status.isComplete) { isComplete = true; break }
        } catch (pollError: any) {
          if (pollError.message?.includes("401")) { setError("Session expired. Please login again."); return }
          if (pollError.message?.includes("403")) { setError("You don't have permission to access this project."); return }
        }
        pollCount++
      }
      if (!isComplete) { setError("Generation is taking longer than expected. Check back in a few minutes."); return }
      navigate(`/project/${thread_id!.split("-chapter-")[0]}`)
    } catch (err: any) {
      setError(err.message || "Error processing decision")
    } finally { setLoading(false) }
  }

  const qualityScore = reviewData?.quality_score || 0
  const feedback = reviewData?.feedback || {}
  const getScoreWidth = (score: number) => `${Math.min(100, (score / 10) * 100)}%`
  const wordCount = chapterText.trim() ? chapterText.trim().split(/\s+/).length : 0

  const menuActions: Record<string, () => void> = {
    sidebar: () => { setMenuOpen(false); setShowSidebar(true) },
    decision: () => { setMenuOpen(false); setShowDecision(true) },
    project: () => { setMenuOpen(false); backToProject() },
  }
  const overlayLinks = [
    { label: 'Chapter overview', hint: 'Context, score & summary', action: 'sidebar' },
    { label: 'The verdict', hint: 'Approve or regenerate', action: 'decision' },
    { label: 'Back to project', hint: 'Return to the writing desk', action: 'project' },
  ]

  return (
    <div className="relative min-h-[100dvh] bg-surface">
      {/* Ambient studio light */}
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(58%_44%_at_50%_-8%,rgba(5,150,105,0.10),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(36%_36%_at_92%_108%,rgba(176,137,71,0.07),transparent_70%)]" />
      </div>
      <div className="grain-overlay" />

      {/* ── Fluid island nav ── */}
      <header className="sticky top-3 z-30 px-3 md:top-6 md:px-6">
        <div className={`mx-auto flex h-14 max-w-[1440px] items-center gap-3 rounded-full border border-border-subtle bg-surface-card/85 px-3 shadow-[0_20px_50px_-30px_rgba(28,25,23,0.25)] backdrop-blur-2xl md:gap-4 md:px-5 hero-enter`}>
          <button onClick={() => navigate('/dashboard')}
            className="flex cursor-pointer items-center gap-2.5 transition-opacity duration-300 hover:opacity-80"
            aria-label="Go to dashboard">
            <img src="/lorespring-assets/lorespring-logo.png" alt="LoreSpring" className="h-6 w-6 object-contain" />
            <span className="font-serif text-base font-semibold text-emerald-800">LoreSpring</span>
          </button>

          <span className="text-text-muted text-sm">/</span>
          <span className="truncate text-xs text-text-secondary md:max-w-none md:text-sm">
            Review<span className="hidden sm:inline"> · </span>
            <span className="hidden sm:inline">{reviewData ? `Ch ${reviewData.chapter_number}` : 'Loading…'}</span>
          </span>

          <div className="flex-1" />

          <div className="hidden md:block">
            <StatusChip />
          </div>

          <button onClick={backToProject}
            className="hidden rounded-full border-[1.5px] border-black/10 px-4 py-2 text-xs font-medium text-text-secondary transition-all duration-500 ${EASE} hover:border-emerald-600 hover:text-emerald-700 active:scale-[0.97] md:block cursor-pointer">
            Back to desk
          </button>

          {/* Hamburger morph */}
          <button aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen}
            onClick={() => setMenuOpen(v => !v)}
            className={`relative flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-500 ${EASE} md:hidden cursor-pointer ${menuOpen ? 'border-emerald-600/40 bg-emerald-500/10 text-emerald-700' : 'border-black/10 text-text-primary hover:border-black/20'}`}>
            <span className={`absolute left-1/2 top-1/2 block h-[1.5px] w-[18px] rounded-full bg-current transition-transform duration-500 ${EASE} ${menuOpen ? '-translate-x-1/2 -translate-y-1/2 rotate-45' : '-translate-x-1/2 -translate-y-[5px]'}`} />
            <span className={`absolute left-1/2 top-1/2 block h-[1.5px] w-[18px] rounded-full bg-current transition-transform duration-500 ${EASE} ${menuOpen ? '-translate-x-1/2 -translate-y-1/2 -rotate-45' : '-translate-x-1/2 translate-y-[3px]'}`} />
          </button>
        </div>
      </header>

      {/* ── Fullscreen mobile menu ── */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-surface/90 backdrop-blur-3xl" onClick={() => setMenuOpen(false)} />
          <div className="relative flex h-full flex-col justify-between px-8 pb-10 pt-6">
            <div className="flex items-center justify-between">
              <span className="font-serif text-lg font-semibold text-emerald-800">LoreSpring</span>
              <span className="text-[10px] uppercase tracking-[0.22em] text-text-muted">Review</span>
            </div>
            <nav className="flex flex-col">
              {overlayLinks.map((link, i) => (
                <button key={link.action} onClick={menuActions[link.action]}
                  style={{ animationDelay: `${120 + i * 100}ms` }}
                  className="group flex items-center justify-between border-b border-border-subtle py-6 text-left hero-enter cursor-pointer">
                  <span>
                    <span className="block font-serif text-4xl font-light leading-tight text-text-primary transition-colors duration-300 group-hover:text-emerald-700 md:text-5xl">
                      {link.label}
                    </span>
                    <span className="mt-1 block text-xs text-text-muted">{link.hint}</span>
                  </span>
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-border-subtle text-text-muted transition-all duration-500 ${EASE} group-hover:border-emerald-600 group-hover:text-emerald-700 group-hover:rotate-45">
                    <Icon d="M7 17 17 7M7 7h10v10" strokeWidth={1.25} />
                  </span>
                </button>
              ))}
            </nav>
            <div className="flex items-center justify-between">
              <StatusChip />
              <button onClick={() => setMenuOpen(false)}
                className="text-[10px] uppercase tracking-[0.2em] text-text-muted transition-colors hover:text-text-primary cursor-pointer">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {error && <div className="relative z-30 px-4 pt-4"><ErrorBanner message={error} onDismiss={() => setError('')} variant="modal" /></div>}

      {/* ── The desk: context · manuscript · verdict ── */}
      <main className="relative z-10 mx-auto grid w-full max-w-[1440px] gap-6 px-3 pb-20 pt-8 md:px-6 md:pb-24 md:pt-12 md:grid-cols-[200px_minmax(0,1fr)_280px] lg:grid-cols-[240px_minmax(0,1fr)_320px] xl:grid-cols-[260px_minmax(0,1fr)_340px]">
        {/* Left rail — chapter context */}
        <aside className="hidden md:flex">
          <div className="w-full rounded-[1.75rem] bg-black/[0.04] p-1.5 ring-1 ring-black/[0.04] hero-enter-delay-1">
            <div className="h-full rounded-[calc(1.75rem-0.375rem)] bg-surface-card p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
              <ChapterContextPanel reviewData={reviewData} qualityScore={qualityScore} onBack={backToProject} />
            </div>
          </div>
        </aside>

        {/* Center — the manuscript sheet */}
        <section className={`rounded-[2rem] bg-black/[0.04] p-1.5 ring-1 ring-black/[0.04] md:p-2 hero-enter-delay-2`}>
          <div className="rounded-[calc(2rem-0.375rem)] bg-surface-card p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] md:p-8 xl:p-12">
            {reviewData ? (
              <>
                <div className="flex flex-wrap items-end justify-between gap-6 border-b border-border-subtle pb-7">
                  <div>
                    <Eyebrow>Chapter {reviewData.chapter_number} · Draft</Eyebrow>
                    <h1 className="mt-4 font-serif text-4xl font-light leading-tight tracking-tight text-text-primary md:text-5xl">
                      The Manuscript
                    </h1>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-[9px] font-medium uppercase tracking-[0.2em] text-text-muted">Quality</div>
                      <div className="mt-1 font-serif text-2xl font-light text-text-primary">{qualityScore}<span className="text-sm text-text-muted">/10</span></div>
                    </div>
                    <div className="h-12 w-px bg-border-subtle" />
                    <ScoreRing score={qualityScore} />
                  </div>
                </div>

                <textarea
                  value={chapterText}
                  onChange={(e) => setChapterText(e.target.value)}
                  spellCheck={false}
                  placeholder="The draft will unfurl here…"
                  aria-label="Chapter manuscript text"
                  className="ls-scroll mt-7 min-h-[420px] w-full resize-y bg-transparent font-serif text-base font-light leading-[1.95] tracking-wide text-text-primary transition-colors duration-500 placeholder:text-text-muted/60 focus:outline-none md:min-h-[52vh] md:text-lg"
                />

                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border-subtle pt-5">
                  <div className="flex items-center gap-2 text-text-muted">
                    <Icon d="M5 18h14M5 18v-5l3-8h8l3 8v5" strokeWidth={1.25} className="h-3.5 w-3.5" />
                    <span className="text-[10px] uppercase tracking-[0.18em]">{wordCount} words</span>
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.18em] text-text-muted">Editable draft</span>
                </div>
              </>
            ) : (
              <div className="flex min-h-[420px] flex-col items-center justify-center gap-5 md:min-h-[52vh]">
                <div className="h-16 w-16">
                  <ScoreRing score={0} />
                </div>
                <p className="font-serif text-xl font-light text-text-secondary">Preparing the manuscript…</p>
                <div className="flex gap-1.5">
                  {[0, 1, 2].map(i => (
                    <span key={i} style={{ animationDelay: `${i * 140}ms` }}
                      className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500/70" />
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Right rail — the verdict */}
        <aside className="hidden md:flex">
          <div className="w-full rounded-[1.75rem] bg-black/[0.04] p-1.5 ring-1 ring-black/[0.04] hero-enter-delay-3">
            <div className="h-full rounded-[calc(1.75rem-0.375rem)] bg-surface-card p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
              <VerdictPanel loading={loading} disabled={!reviewData} feedback={feedback} getScoreWidth={getScoreWidth}
                onApprove={() => handleDecision(true)} onReject={() => handleDecision(false)} />
            </div>
          </div>
        </aside>
      </main>

      {/* ── Mobile drawers ── */}
      {showSidebar && <div className="sidebar-backdrop md:hidden" onClick={() => setShowSidebar(false)} />}
      <div className={`sidebar-overlay bg-surface-card p-4 md:hidden ${showSidebar ? 'open' : ''}`}>
        <ChapterContextPanel reviewData={reviewData} qualityScore={qualityScore} onBack={backToProject}
          onClose={() => setShowSidebar(false)} />
      </div>

      {showDecision && <div className="sidebar-backdrop md:hidden" onClick={() => setShowDecision(false)} />}
      <div className={`panel-drawer bg-surface-card p-5 pb-8 md:hidden ${showDecision ? 'open' : ''}`}>
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-black/10" />
        <VerdictPanel loading={loading} disabled={!reviewData} feedback={feedback} getScoreWidth={getScoreWidth}
          onApprove={() => handleDecision(true)} onReject={() => handleDecision(false)}
          onClose={() => setShowDecision(false)} />
      </div>
    </div>
  )
}
