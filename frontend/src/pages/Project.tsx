// pages/Project.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import type { ReactNode } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProject } from '../api/projects'
import { getChapters } from '../api/chapters'
import { streamGenerateChapter } from '../api/generate'
import type { Chapter, Project as ProjectType } from '../types'
import { ErrorBanner } from '../components/ErrorBanner'

interface PipelineStep { node: string; label: string; state: 'active' | 'done' }

const EASE = 'ease-[cubic-bezier(0.32,0.72,0,1)]'
const ENTER = 'ease-[cubic-bezier(0.16,1,0.3,1)]'
const isMac = typeof navigator !== 'undefined' && /Mac/i.test(navigator.platform)

const QUICK_PROMPTS = [
  'Raise the stakes',
  'Introduce a twist',
  'Deepen a character',
  'Advance the plot',
]

/* ───────────────────────────── Small building blocks ───────────────────────────── */

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 border border-emerald-500/10 bg-emerald-500/[0.03]">
      <span className="w-1 h-1 rounded-full bg-emerald-500" />
      <span className="text-[10px] uppercase tracking-[0.22em] font-medium text-emerald-700">{children}</span>
    </span>
  )
}

function MetaChip({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="inline-flex items-baseline gap-1.5 rounded-full border border-border-subtle bg-surface-card px-3 py-1.5">
      <span className="text-[9px] uppercase tracking-[0.18em] text-text-muted font-medium">{label}</span>
      <span className="text-xs text-text-primary tabular-nums">{value}</span>
    </div>
  )
}

const Icon = ({ d, className = '', strokeWidth = 1.5 }: { d: string; className?: string; strokeWidth?: number }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}
    strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d={d} />
  </svg>
)

const CheckIcon = ({ className = '' }: { className?: string }) => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const CopyIcon = ({ className = '' }: { className?: string }) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
    strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
)

const Spinner = ({ className = '' }: { className?: string }) => (
  <svg className={`animate-spin ${className}`} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
)

/* ───────────────────────────── Live pipeline view ───────────────────────────── */

function LivePipeline({ steps }: { steps: PipelineStep[] }) {
  return (
    <div className="max-w-xl mx-auto hero-enter">
      <Eyebrow>In progress</Eyebrow>
      <h2 className="font-serif text-3xl md:text-4xl font-light text-text-primary mt-5 mb-3 leading-tight">
        Composing your chapter
      </h2>
      <p className="text-text-secondary text-sm md:text-base max-w-md leading-relaxed mb-10">
        The writing pipeline is running. Watch each stage unfold as it moves toward your review.
      </p>
      <div className="flex flex-col">
        {steps.length === 0 ? (
          <p className="text-text-muted text-sm animate-pulse">Waiting for the pipeline to begin…</p>
        ) : steps.map((step, i) => {
          const done = step.state === 'done'
          const active = step.state === 'active'
          return (
            <div key={i} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-500 ${EASE} ${
                  done
                    ? 'bg-emerald-700 border-emerald-700 text-white'
                    : active
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700'
                      : 'border-border-subtle text-transparent'
                }`}>
                  {done ? <CheckIcon /> : active ? <Spinner className="animate-spin" /> : <span className="w-1.5 h-1.5 rounded-full bg-current" />}
                </div>
                {i < steps.length - 1 && <div className="w-px flex-1 my-1 bg-border-subtle" />}
              </div>
              <div className="pb-8 pt-1.5">
                <div className={`text-sm leading-snug ${done || active ? 'text-text-primary' : 'text-text-muted'}`}>{step.label}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ───────────────────────────── Page ───────────────────────────── */

export default function Project() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState<ProjectType | null>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null)
  const [error, setError] = useState('')
  const [status, setStatus] = useState<'idle' | 'running' | 'awaiting_review' | 'error'>('idle')
  const [direction, setDirection] = useState('')
  const [chapterNumber, setChapterNumber] = useState(1)
  const [qualityThreshold, setQualityThreshold] = useState(7.0)
  const [maxRevisions, setMaxRevisions] = useState(2)
  const [loadingChapters, setLoadingChapters] = useState(false)
  const [showChapters, setShowChapters] = useState(false)
  const [showConsole, setShowConsole] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [pipelineSteps, setPipelineSteps] = useState<PipelineStep[]>([])
  const [copied, setCopied] = useState(false)
  const [ready, setReady] = useState(false)
  const chapterTouched = useRef(false)

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 40)
    return () => clearTimeout(t)
  }, [])

  const loadChapters = useCallback(async (projectId: string) => {
    try {
      setLoadingChapters(true)
      const chaps = await getChapters(projectId)
      setChapters(chaps)
      if (chaps.length > 0) setSelectedChapter(chaps[chaps.length - 1])
    } catch (err: any) {
      setError(err.message || 'Failed to load chapters')
    } finally {
      setLoadingChapters(false)
    }
  }, [])

  useEffect(() => {
    if (!id) return
    const loadData = async () => {
      try {
        const proj = await getProject(id)
        setProject(proj)
        await loadChapters(id)
      } catch (err: any) {
        setError(err.message || 'Failed to load project')
      }
    }
    loadData()
  }, [id, loadChapters])

  useEffect(() => {
    if (chapters.length > 0 && !chapterTouched.current) {
      setChapterNumber(chapters[chapters.length - 1].chapter_number + 1)
    }
  }, [chapters])

  const handleGenerate = useCallback(async () => {
    if (!id || !project) return
    if (!direction.trim()) { setError('Please enter a direction'); return }
    if (direction.trim().length < 10) { setError('Direction must be at least 10 characters'); return }
    if (!project.genre || !project.tone) { setError('Project metadata missing. Refresh the page.'); return }
    try {
      setStatus('running'); setError(''); setPipelineSteps([])
      const steps: PipelineStep[] = []
      let interrupted = false

      for await (const event of streamGenerateChapter(id, chapterNumber, direction, { genre: project.genre, tone: project.tone, style: project.style }, qualityThreshold, maxRevisions)) {
        if (event.event === 'interrupt') {
          steps.push({ node: 'human_review', label: event.status || 'Awaiting human review', state: 'active' })
          setPipelineSteps([...steps])
          setStatus('awaiting_review')
          interrupted = true
          break
        }
        if (event.event === 'on_chain_start') {
          steps.push({ node: event.node || '', label: event.status || '', state: 'active' })
        } else if (event.event === 'on_chain_end') {
          const idx = [...steps].reverse().findIndex(s => s.node === event.node && s.state === 'active')
          if (idx !== -1) steps[steps.length - 1 - idx] = { ...steps[steps.length - 1 - idx], state: 'done' }
        }
        setPipelineSteps([...steps])
      }

      await loadChapters(id)
      setDirection('')
      if (!interrupted) setStatus('awaiting_review')
      navigate(`/review/${id}-chapter-${chapterNumber}`)
    } catch (err: any) {
      setStatus('error'); setError(err.message || 'Generation failed')
    }
  }, [id, project, chapterNumber, direction, qualityThreshold, maxRevisions, loadChapters, navigate])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); handleGenerate() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleGenerate])

  const bumpChapter = (delta: number) => {
    chapterTouched.current = true
    setChapterNumber(n => Math.max(1, n + delta))
  }

  const copyChapter = async () => {
    if (!selectedChapter?.final_chapter) return
    try {
      await navigator.clipboard.writeText(selectedChapter.final_chapter)
      setCopied(true); setTimeout(() => setCopied(false), 1800)
    } catch { /* clipboard unavailable */ }
  }

  const wordCount = useMemo(() => {
    const text = selectedChapter?.final_chapter ?? ''
    return text.trim() ? text.trim().split(/\s+/).length : 0
  }, [selectedChapter])
  const readMinutes = Math.max(1, Math.round(wordCount / 200))

  const score = selectedChapter?.quality_score ?? null
  const scorePct = score != null ? `${Math.min(100, (score / 10) * 100)}%` : '0%'
  const sliderPct = `${(qualityThreshold / 10) * 100}%`
  const directionReady = direction.trim().length >= 10
  const canGenerate = status !== 'running' && directionReady && !!project?.genre && !!project?.tone

  const currentIndex = chapters.findIndex(c => c.chapter_number === selectedChapter?.chapter_number)
  const prevChapter = currentIndex > 0 ? chapters[currentIndex - 1] : null
  const nextChapter = currentIndex >= 0 && currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null

  const awaitingThis = status === 'awaiting_review' && selectedChapter?.chapter_number === chapterNumber

  return (
    <div className="h-[100dvh] bg-surface flex flex-col overflow-hidden">
      <div className="grain-overlay" />
      {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}

      {/* ── Topbar ── */}
      <header className="h-14 shrink-0 relative z-20 flex items-center gap-2 px-3 md:px-5 border-b border-border-subtle bg-surface-card/80 backdrop-blur-xl">
        <button
          className="md:hidden bg-transparent border border-border-subtle rounded-xl p-2 cursor-pointer hover:bg-surface-muted transition-colors mr-0.5"
          onClick={() => setShowChapters(s => !s)} aria-label="Toggle chapters"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-secondary" strokeLinecap="round">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>

        <span className="font-serif text-[15px] md:text-base text-emerald-800 font-semibold cursor-pointer flex items-center gap-2 tracking-tight"
          onClick={() => navigate('/dashboard')}>
          <img src="/lorespring-assets/lorespring-logo.png" alt="LoreSpring" className="w-5 md:w-6 h-5 md:h-6 object-contain" />
          <span className="hidden md:inline">LoreSpring</span>
        </span>
        <span className="text-text-muted text-sm mx-1 hidden md:inline">/</span>
        <span className="text-text-secondary text-xs md:text-sm truncate max-w-[110px] md:max-w-[260px]">{project?.title ?? 'Project'}</span>

        {/* Mode segmented control */}
        <div className="hidden md:flex items-center gap-1 ml-4 rounded-full bg-black/[0.03] p-1 ring-1 ring-black/5">
          <button className="px-4 py-1.5 text-xs rounded-full bg-surface-card text-text-primary font-medium cursor-pointer shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)]">Write</button>
          <button disabled className="px-4 py-1.5 text-xs rounded-full text-text-muted cursor-not-allowed">Rewrite</button>
          <button disabled className="px-4 py-1.5 text-xs rounded-full text-text-muted cursor-not-allowed">Describe</button>
        </div>

        <div className="flex-1" />

        <span className={`hidden md:inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] font-medium ${
          status === 'running' ? 'text-emerald-700' : status === 'awaiting_review' ? 'text-gold-500' : 'text-text-muted'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${status === 'running' ? 'bg-emerald-600 animate-pulse' : status === 'awaiting_review' ? 'bg-gold-500' : status === 'error' ? 'bg-red-500' : 'bg-emerald-600'}`} />
          {status === 'running' ? 'Writing' : status === 'awaiting_review' ? 'Awaiting review' : status === 'error' ? 'Failed' : 'Saved'}
        </span>

        <button
          onClick={() => navigate(`/graph/${id}`)}
          className="hidden md:inline-flex items-center gap-2 rounded-full border border-border-subtle px-3.5 py-1.5 text-xs text-text-secondary cursor-pointer transition-all duration-500 hover:border-emerald-500/40 hover:text-emerald-800 hover:bg-emerald-500/[0.03] active:scale-[0.97]"
        >
          <Icon d="M12 2 2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          Story graph
        </button>

        <button
          className="md:hidden bg-transparent border border-border-subtle rounded-xl p-2 cursor-pointer hover:bg-surface-muted transition-colors"
          onClick={() => setShowConsole(s => !s)} aria-label="Toggle generation console"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-emerald-700">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Left: Chapters ── */}
        {showChapters && <div className="sidebar-backdrop md:hidden" onClick={() => setShowChapters(false)} />}
        <aside
          className={`w-64 bg-surface-card/70 backdrop-blur-xl border-r border-border-subtle flex flex-col shrink-0 relative z-10 sidebar-overlay ls-scroll md:!static md:!transform-none ${showChapters ? 'open' : ''}`}
          style={{
            opacity: ready ? 1 : 0,
            transition: `opacity 0.7s ${ENTER} 0.05s, transform 0.35s cubic-bezier(0.16,1,0.3,1)`,
          }}
        >
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <span className="text-[10px] uppercase tracking-[0.24em] text-text-muted font-medium">Chapters</span>
            <span className="text-[10px] tabular-nums text-emerald-700 font-medium">{chapters.length}</span>
          </div>

          <div className="flex-1 overflow-y-auto px-3 ls-scroll flex flex-col gap-1.5">
            {loadingChapters ? (
              [0, 1, 2].map(n => <div key={n} className="h-20 rounded-[1.25rem] bg-surface-muted animate-pulse" />)
            ) : chapters.length === 0 ? (
              <p className="text-text-muted text-xs px-2 py-4 leading-relaxed">No chapters yet. Open the Story Studio and write your first one.</p>
            ) : chapters.map(c => {
              const active = selectedChapter?.chapter_number === c.chapter_number
              const cScore = c.quality_score ?? null
              return (
                <button
                  key={c.chapter_number}
                  onClick={() => setSelectedChapter(c)}
                  className={`group w-full text-left rounded-[1.25rem] p-[1px] transition-all duration-500 ${EASE} ${active ? 'bg-black/[0.05]' : 'hover:bg-black/[0.025]'}`}
                >
                  <div className={`rounded-[calc(1.25rem-1px)] px-3.5 py-3 transition-all duration-500 ${EASE} ${active ? 'bg-surface-card shadow-[inset_0_1px_1px_rgba(255,255,255,0.7)]' : 'bg-transparent'}`}>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className={`font-serif text-[15px] leading-none ${active ? 'text-emerald-800' : 'text-text-primary'}`}>Chapter {c.chapter_number}</span>
                      {cScore != null && (
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium tabular-nums transition-all duration-500 ${active ? 'bg-emerald-500/10 text-emerald-800' : 'bg-surface-muted text-text-muted'}`}>
                          {cScore.toFixed(1)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-text-muted">
                      <span className="truncate">{c.final_chapter ? `${c.final_chapter.split(/\s+/).slice(0, 4).join(' ')}…` : 'Draft'}</span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          <div className="p-4 border-t border-border-subtle/60 flex flex-col gap-1">
            <button
              onClick={() => navigate(`/graph/${id}`)}
              className="group/g w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-[12px] text-text-secondary cursor-pointer transition-all duration-500 hover:bg-surface-muted hover:pl-4 hover:text-text-primary"
            >
              <Icon d="M12 2 2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              Story graph
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="group/d w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-[12px] text-text-muted cursor-pointer transition-all duration-500 hover:bg-red-500/[0.04] hover:text-red-600"
            >
              <Icon d="M19 12H5M12 19l-7-7 7-7" />
              Back to Dashboard
            </button>
          </div>
        </aside>

        {/* ── Main: Reading pane ── */}
        <main
          className="flex-1 overflow-y-auto ls-scroll relative z-10"
          style={{
            opacity: ready ? 1 : 0,
            transform: ready ? 'translateY(0)' : 'translateY(18px)',
            transition: `opacity 0.7s ${ENTER} 0.1s, transform 0.7s ${ENTER} 0.1s`,
          }}
        >
          {loadingChapters ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-text-muted text-sm animate-pulse">Loading chapters…</p>
            </div>
          ) : status === 'running' ? (
            <div className="h-full flex items-start justify-center px-5 pt-12 md:pt-20 pb-10">
              <LivePipeline steps={pipelineSteps} />
            </div>
          ) : selectedChapter ? (
            <div className="px-4 md:px-10 py-8 md:py-12 max-w-3xl mx-auto">
              {awaitingThis && (
                <div className="hero-enter mb-8 rounded-[1.75rem] bg-black/[0.03] p-[1px]">
                  <div className="rounded-[calc(1.75rem-1px)] bg-surface-card p-5 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="w-9 h-9 rounded-full bg-gold-500/10 flex items-center justify-center shrink-0">
                        <span className="w-2 h-2 rounded-full bg-gold-500 animate-pulse" />
                      </span>
                      <div>
                        <div className="text-sm font-medium text-text-primary">Chapter {chapterNumber} is ready for review</div>
                        <div className="text-xs text-text-muted">Approve it, or ask for a rewrite.</div>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/review/${id}-chapter-${chapterNumber}`)}
                      className="group/btn inline-flex items-center gap-2.5 rounded-full bg-emerald-700 text-white pl-5 pr-2.5 py-2 text-sm font-medium cursor-pointer transition-all duration-500 hover:shadow-[0_10px_32px_rgba(13,140,74,0.25)] active:scale-[0.98]"
                    >
                      Review chapter
                      <span className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center transition-all duration-500 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 group-hover/btn:scale-105">
                        <Icon d="M5 12h14M12 5l7 7-7 7" strokeWidth={2} className="text-white/90" />
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* The chapter — editorial page */}
              <div className="rounded-[2rem] bg-black/[0.03] p-1.5 ring-1 ring-black/5" key={`shell-${selectedChapter.chapter_number}`}>
                <div className="rounded-[calc(2rem-0.375rem)] bg-surface-card shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)] p-6 md:p-10 lg:p-14 relative overflow-hidden">
                  <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-emerald-500/[0.05] blur-3xl pointer-events-none" />

                  <div className="relative">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5 mb-8">
                      <div>
                        <Eyebrow>Chapter {selectedChapter.chapter_number}</Eyebrow>
                        <h2 className="font-serif text-3xl md:text-4xl font-light text-text-primary mt-3 leading-tight tracking-tight">
                          {selectedChapter.final_chapter?.split(/\s+/).slice(0, 6).join(' ') || 'Untitled'}
                          <span className="text-emerald-700/70">.</span>
                        </h2>
                      </div>
                      <button
                        onClick={copyChapter}
                        aria-label="Copy chapter text"
                        className={`group/copy w-10 h-10 rounded-full border flex items-center justify-center cursor-pointer transition-all duration-500 active:scale-95 shrink-0 ${
                          copied
                            ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-700'
                            : 'border-border-subtle bg-surface-card text-text-muted hover:border-emerald-500/40 hover:text-emerald-800'
                        }`}
                      >
                        {copied ? <CheckIcon className="text-emerald-700" /> : <CopyIcon />}
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pb-8 mb-8 border-b border-border-subtle/60">
                      <div className="flex-1 min-w-[160px]">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[9px] uppercase tracking-[0.2em] text-text-muted font-medium">Quality</span>
                          <span className="text-xs text-emerald-800 font-medium tabular-nums">{score != null ? score.toFixed(1) : '—'} <span className="text-text-muted font-normal">/10</span></span>
                        </div>
                        <div className="h-1.5 bg-black/[0.04] rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-linear-to-r from-emerald-800 via-emerald-600 to-emerald-400 transition-all duration-700" style={{ width: scorePct }} />
                        </div>
                      </div>
                      <MetaChip label="Words" value={wordCount} />
                      <MetaChip label="Read" value={`${readMinutes} min`} />
                      {selectedChapter.revision_count != null && <MetaChip label="Revisions" value={selectedChapter.revision_count} />}
                    </div>

                    {selectedChapter.final_chapter ? (
                      <article key={`article-${selectedChapter.chapter_number}`} className="hero-enter">
                        <p className="drop-cap font-serif font-light text-lg md:text-[21px] leading-[1.85] md:leading-[1.9] text-text-primary/90 whitespace-pre-wrap tracking-wide">
                          {selectedChapter.final_chapter}
                        </p>
                      </article>
                    ) : (
                      <p className="text-text-muted text-sm">Chapter not yet generated.</p>
                    )}

                    {(prevChapter || nextChapter) && (
                      <div className="flex items-center justify-between gap-4 pt-8 mt-10 border-t border-border-subtle/60">
                        {prevChapter ? (
                          <button onClick={() => setSelectedChapter(prevChapter)}
                            className="group/p flex items-center gap-2.5 text-left cursor-pointer transition-all duration-500 hover:text-emerald-800">
                            <span className="w-8 h-8 rounded-full border border-border-subtle flex items-center justify-center text-text-muted transition-all duration-500 group-hover/p:border-emerald-500/40 group-hover/p:-translate-x-0.5">
                              <Icon d="M19 12H5M12 19l-7-7 7-7" />
                            </span>
                            <span>
                              <span className="block text-[9px] uppercase tracking-[0.18em] text-text-muted">Previous</span>
                              <span className="block font-serif text-sm text-text-primary">Chapter {prevChapter.chapter_number}</span>
                            </span>
                          </button>
                        ) : <span />}
                        {nextChapter && (
                          <button onClick={() => setSelectedChapter(nextChapter)}
                            className="group/n flex items-center gap-2.5 text-right cursor-pointer transition-all duration-500 hover:text-emerald-800">
                            <span>
                              <span className="block text-[9px] uppercase tracking-[0.18em] text-text-muted">Next</span>
                              <span className="block font-serif text-sm text-text-primary">Chapter {nextChapter.chapter_number}</span>
                            </span>
                            <span className="w-8 h-8 rounded-full border border-border-subtle flex items-center justify-center text-text-muted transition-all duration-500 group-hover/n:border-emerald-500/40 group-hover/n:translate-x-0.5">
                              <Icon d="M5 12h14M12 5l7 7-7 7" />
                            </span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center px-6">
              <Eyebrow>No chapters yet</Eyebrow>
              <h3 className="font-serif text-2xl md:text-3xl font-light text-text-primary mt-5 mb-2">Your first page awaits</h3>
              <p className="text-text-muted text-sm max-w-xs leading-relaxed mb-8">
                Open the Story Studio, describe what should happen, and let LoreSpring write it.
              </p>
              <button
                onClick={() => setShowConsole(true)}
                className="md:hidden group/btn inline-flex items-center gap-2.5 rounded-full bg-emerald-700 text-white pl-5 pr-2.5 py-2.5 text-sm font-medium cursor-pointer transition-all duration-500 active:scale-[0.98]"
              >
                Open Story Studio
                <span className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center">
                  <Icon d="M5 12h14M12 5l7 7-7 7" strokeWidth={2} className="text-white/90" />
                </span>
              </button>
            </div>
          )}
        </main>

        {/* ── Right: Story Studio (generation console) ── */}
        {showConsole && <div className="sidebar-backdrop md:hidden" onClick={() => setShowConsole(false)} />}
        <aside
          className={`w-[320px] bg-surface-card border-l border-border-subtle flex flex-col shrink-0 relative z-10 panel-drawer ls-scroll md:!static md:!transform-none ${showConsole ? 'open' : ''}`}
          style={{
            opacity: ready ? 1 : 0,
            transition: `opacity 0.7s ${ENTER} 0.15s, transform 0.35s cubic-bezier(0.16,1,0.3,1)`,
          }}
        >
          <div className="overflow-y-auto ls-scroll flex-1 px-5 pt-5 pb-4 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <Eyebrow>Story Studio</Eyebrow>
              <span className="hidden md:inline-flex items-center gap-1.5 text-[9px] uppercase tracking-[0.18em] text-text-muted font-medium">
                <span className="w-1 h-1 rounded-full bg-emerald-500" />
                Online
              </span>
            </div>

            {/* Direction */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] uppercase tracking-[0.2em] text-text-muted font-medium">Direction</label>
                <span className={`text-[10px] tabular-nums transition-colors duration-500 ${directionReady ? 'text-emerald-700' : 'text-text-muted'}`}>
                  {direction.length}/10
                </span>
              </div>
              <div className="rounded-[1.25rem] bg-black/[0.03] p-1 ring-1 ring-black/5 focus-within:ring-emerald-500/30 transition-all duration-500">
                <textarea
                  rows={5}
                  placeholder="What should happen in this chapter?"
                  value={direction}
                  onChange={e => setDirection(e.target.value)}
                  disabled={status === 'running'}
                  className="w-full bg-surface-card rounded-[calc(1.25rem-0.25rem)] px-4 py-3 text-text-primary text-sm outline-none resize-none placeholder:text-text-muted/70 focus:shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)] transition-shadow duration-500 disabled:opacity-60"
                />
              </div>
              <div className="flex flex-wrap gap-1.5 mt-0.5">
                {QUICK_PROMPTS.map(q => (
                  <button
                    key={q}
                    onClick={() => {
                      setDirection(prev => prev ? `${prev.trimEnd()} — ${q.toLowerCase()}` : q)
                      setError('')
                    }}
                    disabled={status === 'running'}
                    className="rounded-full border border-border-subtle bg-surface-card px-3 py-1.5 text-[11px] text-text-secondary cursor-pointer transition-all duration-500 hover:border-emerald-500/40 hover:text-emerald-800 hover:bg-emerald-500/[0.03] active:scale-95 disabled:opacity-50"
                  >
                    {q}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-text-muted tracking-wide leading-relaxed">
                {directionReady
                  ? 'Ready. Hit Generate or press'
                  : `${10 - direction.trim().length} more characters for a usable direction.`}
                <span className="text-text-secondary"> {isMac ? '⌘' : 'Ctrl'} + Enter</span>
              </p>
            </div>

            {/* Chapter number */}
            <div className="flex items-center justify-between rounded-[1.25rem] bg-black/[0.03] p-1 ring-1 ring-black/5">
              <button
                onClick={() => bumpChapter(-1)}
                disabled={chapterNumber <= 1 || status === 'running'}
                aria-label="Previous chapter"
                className="w-9 h-9 rounded-full border border-border-subtle bg-surface-card flex items-center justify-center text-text-secondary cursor-pointer transition-all duration-500 hover:border-emerald-500/40 hover:text-emerald-800 active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Icon d="M5 12h14" strokeWidth={1.75} />
              </button>
              <div className="flex items-baseline gap-1.5">
                <span className="font-serif text-2xl text-text-primary leading-none tabular-nums">{chapterNumber}</span>
                <span className="text-[10px] uppercase tracking-[0.18em] text-text-muted">Chapter</span>
              </div>
              <button
                onClick={() => bumpChapter(1)}
                disabled={status === 'running'}
                aria-label="Next chapter"
                className="w-9 h-9 rounded-full border border-border-subtle bg-surface-card flex items-center justify-center text-text-secondary cursor-pointer transition-all duration-500 hover:border-emerald-500/40 hover:text-emerald-800 active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Icon d="M12 5v14M5 12h14" strokeWidth={1.75} />
              </button>
            </div>

            {/* Quality threshold */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] uppercase tracking-[0.2em] text-text-muted font-medium">Quality minimum</label>
                <span className="font-serif text-lg text-emerald-800 leading-none tabular-nums">{qualityThreshold.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={10}
                step={0.5}
                value={qualityThreshold}
                onChange={e => setQualityThreshold(Number(e.target.value))}
                disabled={status === 'running'}
                aria-label="Quality threshold"
                className="ls-range disabled:opacity-50"
                style={{ background: `linear-gradient(to right, #047857 0%, #10b981 ${sliderPct}, rgba(5,150,105,0.12) ${sliderPct})` }}
              />
              <div className="flex justify-between text-[9px] uppercase tracking-[0.18em] text-text-muted">
                <span>Draft</span><span>Pub-ready</span>
              </div>
            </div>

            {/* Max revisions */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-text-muted font-medium">Max revisions</label>
              <div className="flex gap-1 rounded-full bg-black/[0.03] p-1 ring-1 ring-black/5">
                {[1, 2, 3, 4].map(n => (
                  <button
                    key={n}
                    onClick={() => setMaxRevisions(n)}
                    disabled={status === 'running'}
                    className={`flex-1 rounded-full py-1.5 text-xs cursor-pointer transition-all duration-500 ${EASE} ${
                      maxRevisions === n
                        ? 'bg-surface-card text-emerald-800 font-medium shadow-[inset_0_1px_1px_rgba(255,255,255,0.7)]'
                        : 'text-text-muted hover:text-text-secondary'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Pipeline */}
            {pipelineSteps.length > 0 && (
              <div className="rounded-[1.25rem] bg-black/[0.03] p-4 ring-1 ring-black/5">
                <div className="text-[10px] uppercase tracking-[0.22em] text-text-muted font-medium mb-3">Pipeline</div>
                <div className="flex flex-col gap-2.5">
                  {pipelineSteps.map((step, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-xs">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 ${
                        step.state === 'done' ? 'bg-emerald-700 text-white' : step.state === 'active' ? 'bg-emerald-500/10 text-emerald-700' : 'bg-surface-muted text-text-muted'
                      }`}>
                        {step.state === 'done' ? <CheckIcon /> : step.state === 'active' ? <Spinner /> : <span className="w-1 h-1 rounded-full bg-current" />}
                      </span>
                      <span className={`truncate ${step.state === 'active' ? 'text-emerald-800' : 'text-text-muted'}`}>{step.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Project info */}
            <div className="border-t border-border-subtle/60 pt-4">
              <button
                onClick={() => setShowInfo(s => !s)}
                className="w-full flex items-center justify-between cursor-pointer group"
                aria-expanded={showInfo}
              >
                <span className="text-[10px] uppercase tracking-[0.22em] text-text-muted font-medium group-hover:text-text-secondary transition-colors duration-500">Story DNA</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
                  className={`text-text-muted transition-transform duration-500 ${EASE} ${showInfo ? 'rotate-180' : ''}`}>
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              <div className="overflow-hidden transition-all duration-500" style={{ maxHeight: showInfo ? '180px' : '0', opacity: showInfo ? 1 : 0 }}>
                <div className="flex flex-col gap-2 pt-3">
                  <div className="flex justify-between text-xs"><span className="text-text-muted uppercase text-[9px] tracking-[0.18em] pt-0.5">Genre</span><span className="text-text-secondary">{project?.genre || '—'}</span></div>
                  <div className="flex justify-between text-xs"><span className="text-text-muted uppercase text-[9px] tracking-[0.18em] pt-0.5">Tone</span><span className="text-text-secondary">{project?.tone || '—'}</span></div>
                  <div className="flex justify-between text-xs"><span className="text-text-muted uppercase text-[9px] tracking-[0.18em] pt-0.5">Style</span><span className="text-text-secondary">{project?.style || '—'}</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Pinned generate footer */}
          <div className="shrink-0 border-t border-border-subtle/60 bg-surface-card p-4 px-5">
            <button
              onClick={handleGenerate}
              disabled={!canGenerate}
              className={`group/btn w-full flex items-center justify-between gap-3 rounded-full bg-emerald-700 text-white pl-5 pr-2.5 py-2.5 text-sm font-medium cursor-pointer transition-all duration-500 ${EASE} hover:shadow-[0_12px_40px_rgba(13,140,74,0.28)] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100`}
            >
              <span className="flex items-center gap-2">
                {status === 'running' && <Spinner className="text-white/80" />}
                {status === 'running' ? 'Writing…' : 'Generate chapter'}
              </span>
              <span className={`w-9 h-9 rounded-full bg-white/15 flex items-center justify-center transition-all duration-500 ${EASE} group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 group-hover/btn:scale-105`}>
                <Icon d="M5 12h14M12 5l7 7-7 7" strokeWidth={2} className="text-white/90" />
              </span>
            </button>
            <div className="flex items-center gap-2 mt-3">
              {status === 'running' && (<><span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" /><span className="text-[11px] text-text-secondary">Pipeline running…</span></>)}
              {status === 'awaiting_review' && (<><span className="w-1.5 h-1.5 rounded-full bg-gold-500 animate-pulse" /><span className="text-[11px] text-text-secondary">Awaiting your review</span></>)}
              {status === 'idle' && (<><span className="w-1.5 h-1.5 rounded-full bg-emerald-600" /><span className="text-[11px] text-text-secondary">Pipeline ready</span></>)}
              {status === 'error' && (<><span className="w-1.5 h-1.5 rounded-full bg-red-500" /><span className="text-[11px] text-red-600">Generation failed</span></>)}
              <div className="flex-1" />
              <span className="text-[10px] text-text-muted">{directionReady ? 'Ready' : 'Needs direction'}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
