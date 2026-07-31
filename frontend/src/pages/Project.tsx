// pages/Project.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProject } from '../api/projects'
import { getChapters } from '../api/chapters'
import { streamGenerateChapter } from '../api/generate'
import type { Chapter, Project as ProjectType } from '../types'
import { ErrorBanner } from '../components/ErrorBanner'

interface PipelineStep { node: string; label: string; state: 'active' | 'done' }


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
  const [pipelineSteps, setPipelineSteps] = useState<PipelineStep[]>([])

  const loadChapters = async (projectId: string) => {
    try {
      setLoadingChapters(true)
      const chaps = await getChapters(projectId)
      setChapters(chaps)
      if (chaps.length > 0) {
        setSelectedChapter(chaps[chaps.length - 1])
      }
    } catch (err: any) {
      setError(err.message || "Failed to load chapters")
    } finally {
      setLoadingChapters(false)
    }
  }

  useEffect(() => {
    if (!id) return
    const loadData = async () => {
      try {
        const proj = await getProject(id)
        setProject(proj)
        await loadChapters(id)
      } catch (err: any) {
        setError(err.message || "Failed to load project")
      }
    }
    loadData()
  }, [id])

  const handleGenerate = async () => {
    if (!id || !project) return
    if (!direction.trim()) { setError("Please enter a direction"); return }
    if (direction.trim().length < 10) { setError("Direction must be at least 10 characters"); return }
    if (!project.genre || !project.tone) { setError("Project metadata missing. Refresh the page."); return }
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
          if (idx !== -1) {
            steps[steps.length - 1 - idx] = { ...steps[steps.length - 1 - idx], state: 'done' }
          }
        }
        setPipelineSteps([...steps])
      }

      await loadChapters(id)
      setDirection('')
      if (!interrupted) setStatus('awaiting_review')
      navigate(`/review/${id}-chapter-${chapterNumber}`)
    } catch (err: any) {
      setStatus('error'); setError(err.message || "Generation failed")
    }
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col h-screen overflow-hidden">
      <div className="grain-overlay" />
      {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}

      {/* Topbar */}
      <div className="h-12 bg-surface-card border-b border-border-subtle flex items-center px-3 md:px-5 gap-1 md:gap-2 shrink-0 relative z-10">
        <button className="md:hidden bg-transparent border border-border-subtle rounded-lg p-1.5 cursor-pointer hover:bg-surface-muted transition-colors mr-1"
          onClick={() => setShowChapters(!showChapters)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-secondary">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="font-serif text-sm md:text-base text-emerald-700 font-semibold cursor-pointer flex items-center gap-2"
          onClick={() => navigate('/dashboard')}>
          <img src="/lorespring-assets/lorespring-logo.png" alt="LoreSpring" className="w-5 md:w-6 h-5 md:h-6 object-contain" /> <span className="hidden md:inline">LoreSpring</span>
        </span>
        <span className="text-text-muted text-sm mx-1">/</span>
        <span className="text-text-secondary text-xs md:text-sm truncate max-w-[100px] md:max-w-none">{project?.title}</span>
        <div className="w-px h-5 bg-border-subtle mx-1"></div>
        <button className="border border-emerald-500 rounded-full px-2 md:px-3.5 py-1 text-[10px] md:text-xs text-text-secondary cursor-pointer hover:bg-surface-muted transition-all bg-surface-muted">
          Write
        </button>
        <button disabled className="border border-border-subtle rounded-full px-3.5 py-1 text-xs text-text-muted cursor-not-allowed opacity-50">
          Rewrite
        </button>
        <button disabled className="border border-border-subtle rounded-full px-3.5 py-1 text-xs text-text-muted cursor-not-allowed opacity-50">
          Describe
        </button>
        <button className="border border-border-subtle rounded-full px-2 md:px-3.5 py-1 text-[10px] md:text-xs text-text-secondary cursor-pointer hover:border-emerald-500 hover:bg-surface-muted transition-all"
          onClick={() => navigate(`/graph/${id}`)}>
          Graph
        </button>
        <div className="flex-1"></div>
        <button className="md:hidden bg-transparent border border-border-subtle rounded-lg p-1.5 cursor-pointer hover:bg-surface-muted transition-colors mr-1"
          onClick={() => setShowConsole(!showConsole)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-700">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
        <span className="text-xs text-emerald-700">Saved</span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar - Chapters */}
        {showChapters && <div className="sidebar-backdrop md:hidden" onClick={() => setShowChapters(false)} />}
        <div className={`w-[194px] bg-surface-card border-r border-border-subtle flex flex-col p-4 gap-2 shrink-0 overflow-y-auto relative z-10 sidebar-overlay md:!static md:!transform-none ${showChapters ? 'open' : ''}`}>
          <div className="text-text-muted text-[10px] uppercase tracking-wider">Chapters</div>
          <div className="flex flex-col gap-1.5">
            {chapters.map(c => (
              <div key={c.chapter_number} onClick={() => setSelectedChapter(c)}
                className={`bg-surface border rounded-lg px-3 py-2 text-sm cursor-pointer transition-all ${
                  selectedChapter?.chapter_number === c.chapter_number
                    ? 'border-emerald-500 bg-surface-muted'
                    : 'border-border-subtle hover:border-emerald-500 hover:bg-surface-muted'
                }`}>
                <div className="text-text-primary text-xs font-medium">Chapter {c.chapter_number}</div>
                <div className="text-text-muted text-xs">Score: {c.quality_score ?? 'N/A'}</div>
              </div>
            ))}
          </div>
          <div className="mt-auto pt-4">
            <div className="border border-border-subtle rounded-lg px-3 py-2 text-xs text-text-secondary cursor-pointer hover:border-emerald-500 hover:bg-surface-muted transition-all mb-2"
              onClick={() => navigate(`/graph/${id}`)}>
              Story graph
            </div>
            <button className="bg-transparent border-none text-text-muted text-xs cursor-pointer hover:text-red-500 transition-colors"
              onClick={() => navigate('/dashboard')}>
              &larr; Dashboard
            </button>
          </div>
        </div>

        {/* Main content - Chapter text */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10">
          {loadingChapters ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-text-muted text-sm">Loading chapters...</p>
            </div>
          ) : selectedChapter ? (
            <>
              <h2 className="font-serif text-2xl font-light text-text-primary mb-2">
                Chapter {selectedChapter.chapter_number}
              </h2>
              <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-full px-3 py-1 text-xs text-emerald-700 mb-5">
                <span className="text-emerald-500">Quality score: {selectedChapter.quality_score}</span>
              </div>
              <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-wrap font-serif font-light tracking-wide">
                {selectedChapter.final_chapter || "Chapter not yet generated"}
              </p>
              {status === 'awaiting_review' && selectedChapter.chapter_number === chapterNumber && (
                <button className="mt-6 border border-emerald-700 text-emerald-700 rounded-lg px-4 py-2 text-sm cursor-pointer hover:bg-emerald-700 hover:text-white transition-all"
                  onClick={() => navigate(`/review/${id}-chapter-${chapterNumber}`)}>
                  Go to Review &rarr;
                </button>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-text-muted text-sm">Select a chapter or generate a new one</p>
            </div>
          )}
        </div>

        {/* Right panel - Generation Console */}
        {showConsole && <div className="sidebar-backdrop md:hidden" onClick={() => setShowConsole(false)} />}
        <div className={`w-[280px] bg-surface-card border-l border-border-subtle p-5 flex flex-col gap-3 shrink-0 overflow-y-auto relative z-10 panel-drawer md:!static md:!transform-none ${showConsole ? 'open' : ''}`}>
          <div className="text-text-muted text-[10px] uppercase tracking-wider">Generation Console</div>
          <div className="flex flex-col gap-1">
            <label className="text-text-secondary text-xs font-medium">Chapter number</label>
            <input type="number" value={chapterNumber}
              onChange={e => setChapterNumber(Number(e.target.value))} disabled={status === 'running'}
              className="bg-surface-muted border border-border-subtle rounded-lg px-3 py-2 text-text-primary text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-700/10 transition-all" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-text-secondary text-xs font-medium">Direction</label>
            <textarea rows={5} placeholder="What should happen in this chapter?" value={direction}
              onChange={e => setDirection(e.target.value)} disabled={status === 'running'}
              className="bg-surface-muted border border-border-subtle rounded-lg px-3 py-2 text-text-primary text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-700/10 transition-all resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-text-secondary text-xs font-medium">Quality min</label>
              <input type="number" step="0.5" min="0" max="10" value={qualityThreshold}
                onChange={e => setQualityThreshold(Number(e.target.value))} disabled={status === 'running'}
                className="bg-surface-muted border border-border-subtle rounded-lg px-3 py-2 text-text-primary text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-700/10 transition-all" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-text-secondary text-xs font-medium">Max revisions</label>
              <input type="number" value={maxRevisions}
                onChange={e => setMaxRevisions(Number(e.target.value))} disabled={status === 'running'}
                className="bg-surface-muted border border-border-subtle rounded-lg px-3 py-2 text-text-primary text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-700/10 transition-all" />
            </div>
          </div>
          <button className="bg-emerald-700 text-white rounded-lg py-2.5 text-sm font-medium cursor-pointer hover:shadow-[0_4px_16px_rgba(13,140,74,0.3)] transition-all disabled:opacity-50 mt-1"
            onClick={handleGenerate} disabled={status === 'running'}>
            {status === 'running' ? 'Generating...' : 'Generate chapter'}
          </button>
          {pipelineSteps.length > 0 && (
            <div className="border-t border-border-subtle pt-3 mt-1">
              <div className="text-text-muted text-[10px] uppercase tracking-wider mb-2.5">Pipeline</div>
              <div className="flex flex-col gap-1.5">
                {pipelineSteps.map((step, i) => (
                  <div key={i} className={`flex items-center gap-2 text-xs ${step.state === 'active' ? 'text-emerald-700' : 'text-text-muted'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${step.state === 'active' ? 'bg-emerald-700 animate-pulse' : 'bg-emerald-500/50'}`} />
                    <span className="truncate">{step.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs">
            {status === 'running' && (<><div className="w-2 h-2 rounded-full bg-emerald-700 animate-pulse" /><span className="text-text-secondary">Pipeline running...</span></>)}
            {status === 'awaiting_review' && (<><div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" /><span className="text-text-secondary">Awaiting your review</span></>)}
            {status === 'idle' && (<><div className="w-2 h-2 rounded-full bg-emerald-700" /><span className="text-text-secondary">Pipeline ready</span></>)}
            {status === 'error' && (<><div className="w-2 h-2 rounded-full bg-red-500" /><span className="text-red-500 text-xs">Generation failed</span></>)}
          </div>
          <div className="border-t border-border-subtle pt-3 mt-1">
            <div className="text-text-muted text-[10px] uppercase tracking-wider mb-2.5">Project Info</div>
            <div className="flex flex-col gap-1.5">
              <div><div className="text-text-muted text-[10px] uppercase">Genre</div><div className="text-text-secondary text-sm">{project?.genre || '—'}</div></div>
              <div><div className="text-text-muted text-[10px] uppercase">Tone</div><div className="text-text-secondary text-sm">{project?.tone || '—'}</div></div>
              <div><div className="text-text-muted text-[10px] uppercase">Style</div><div className="text-text-secondary text-sm">{project?.style || '—'}</div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
