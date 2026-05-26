// pages/Project.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProject } from '../api/projects'
import { getChapters } from '../api/chapters'
import { generateChapter } from '../api/generate'
import type { Chapter, Project as ProjectType } from '../types'
import { ErrorBanner } from '../components/ErrorBanner'

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

  useEffect(() => {
    if (!id) return
    
    const loadData = async () => {
      try {
        const [proj, chaps] = await Promise.all([
          getProject(id),
          getChapters(id)
        ])
        setProject(proj)
        setChapters(chaps)
        if (chaps.length > 0 && !selectedChapter) {
          setSelectedChapter(chaps[chaps.length - 1])
        }
      } catch (err: any) {
        setError(err.message || "Failed to load project")
      }
    }
    
    loadData()
  }, [id])

  const handleGenerate = async () => {
    if (!id || !project) return
    
    if (!direction.trim()) {
      setError("Please enter a direction")
      return
    }
    
    if (direction.trim().length < 10) {
      setError("Direction must be at least 10 characters")
      return
    }
    
    if (!project.genre || !project.tone) {
      setError("Project metadata missing. Refresh the page.")
      return
    }
    
    try {
      setStatus('running')
      setError('')
      
      await generateChapter(
        id,
        chapterNumber,
        direction,
        {
          genre: project.genre,
          tone: project.tone,
          style: project.style
        },
        qualityThreshold,
        maxRevisions
      )
      setStatus('awaiting_review')
      const threadId = `${id}-chapter-${chapterNumber}`
      navigate(`/review/${threadId}`)
    } catch (err: any) {
      setStatus('error')
      setError(err.message || "Generation failed")
    }
  }

  return (
    <div className="min-h-screen bg-[#f7faf7] flex flex-col h-screen overflow-hidden">
      {error && (
        <ErrorBanner 
          message={error} 
          onDismiss={() => setError('')} 
        />
      )}

      {/* Topbar */}
      <div className="h-12 bg-white border-b border-[#c8e6cc] flex items-center px-5 gap-2 flex-shrink-0">
        <span 
          className="font-serif text-base text-[#0d8c4a] font-semibold cursor-pointer"
          onClick={() => navigate('/dashboard')}
        >
          LoreSpring
        </span>
        <span className="text-[#6a9e72] text-sm mx-1">/</span>
        <span className="text-[#3d6b48] text-sm">{project?.title}</span>
        <div className="w-px h-5 bg-[#c8e6cc] mx-1"></div>
        <button className="border border-[#c8e6cc] rounded-full px-3.5 py-1 text-xs text-[#3d6b48] cursor-pointer hover:border-[#8ec99a] hover:bg-[#eef6ef] transition-all bg-[#eef6ef] border-[#8ec99a] text-[#0d8c4a]">
          ✦ Write
        </button>
        <button className="border border-[#c8e6cc] rounded-full px-3.5 py-1 text-xs text-[#3d6b48] cursor-pointer hover:border-[#8ec99a] hover:bg-[#eef6ef] transition-all">
          ↺ Rewrite
        </button>
        <button className="border border-[#c8e6cc] rounded-full px-3.5 py-1 text-xs text-[#3d6b48] cursor-pointer hover:border-[#8ec99a] hover:bg-[#eef6ef] transition-all">
          ◎ Describe
        </button>
        <button 
          className="border border-[#c8e6cc] rounded-full px-3.5 py-1 text-xs text-[#3d6b48] cursor-pointer hover:border-[#8ec99a] hover:bg-[#eef6ef] transition-all"
          onClick={() => navigate(`/graph/${id}`)}
        >
          ⬡ Graph
        </button>
        <div className="flex-1"></div>
        <span className="text-xs text-[#0d8c4a]">✓ Saved</span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar - Chapters */}
        <div className="w-[195px] bg-white border-r border-[#c8e6cc] flex flex-col p-4 gap-2 flex-shrink-0 overflow-y-auto">
          <div className="text-[#6a9e72] text-[10px] uppercase tracking-wider">Chapters</div>
          <div className="flex flex-col gap-1.5">
            {chapters.map(c => (
              <div
                key={c.chapter_number}
                onClick={() => setSelectedChapter(c)}
                className={`bg-[#f7faf7] border rounded-lg px-3 py-2 text-sm cursor-pointer transition-all ${
                  selectedChapter?.chapter_number === c.chapter_number
                    ? 'border-[#8ec99a] bg-[#eef6ef]'
                    : 'border-[#c8e6cc] hover:border-[#8ec99a] hover:bg-[#eef6ef]'
                }`}
              >
                <div className="text-[#1a3320] text-xs font-medium">Chapter {c.chapter_number}</div>
                <div className="text-[#6a9e72] text-xs">Score: {c.quality_score ?? 'N/A'}</div>
              </div>
            ))}
          </div>
          <div className="mt-auto pt-4">
            <div 
              className="border border-[#c8e6cc] rounded-lg px-3 py-2 text-xs text-[#3d6b48] cursor-pointer hover:border-[#8ec99a] hover:bg-[#eef6ef] transition-all mb-2"
              onClick={() => navigate(`/graph/${id}`)}
            >
              ⬡ Story graph
            </div>
            <button 
              className="bg-transparent border-none text-[#6a9e72] text-xs cursor-pointer hover:text-red-500 transition-colors"
              onClick={() => navigate('/dashboard')}
            >
              ← Dashboard
            </button>
          </div>
        </div>

        {/* Main content - Chapter text */}
        <div className="flex-1 overflow-y-auto p-8">
          {selectedChapter ? (
            <>
              <h2 className="font-serif text-2xl font-light text-[#1a3320] mb-2">
                Chapter {selectedChapter.chapter_number}
              </h2>
              <div className="inline-flex items-center gap-1.5 bg-[#d4f5ed] border border-[#22c9a0]/30 rounded-full px-3 py-1 text-xs text-[#0d8c6a] mb-5">
                <span className="text-[#22c9a0]">◆</span> Quality score: {selectedChapter.quality_score}
              </div>
              <p className="text-[#3d6b48] text-sm leading-relaxed whitespace-pre-wrap font-serif font-light tracking-wide">
                {selectedChapter.final_chapter}
              </p>
              {status === 'awaiting_review' && selectedChapter.chapter_number === chapterNumber && (
                <button
                  className="mt-6 border border-[#0d8c4a] text-[#0d8c4a] rounded-lg px-4 py-2 text-sm cursor-pointer hover:bg-[#0d8c4a] hover:text-white transition-all"
                  onClick={() => navigate(`/review/${id}-chapter-${selectedChapter.chapter_number}`)}
                >
                  Go to Review →
                </button>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-[#6a9e72] text-sm">Select a chapter or generate a new one</p>
            </div>
          )}
        </div>

        {/* Right panel - Generation Console */}
        <div className="w-[280px] bg-white border-l border-[#c8e6cc] p-5 flex flex-col gap-3 flex-shrink-0 overflow-y-auto">
          <div className="text-[#6a9e72] text-[10px] uppercase tracking-wider">Generation Console</div>

          <div className="flex flex-col gap-1">
            <label className="text-[#3d6b48] text-xs font-medium">Chapter number</label>
            <input
              type="number"
              className="bg-[#eef6ef] border border-[#c8e6cc] rounded-lg px-3 py-2 text-[#1a3320] text-sm outline-none focus:border-[#8ec99a] focus:ring-2 focus:ring-[#0d8c4a]/10 transition-all"
              value={chapterNumber}
              onChange={e => setChapterNumber(Number(e.target.value))}
              disabled={status === 'running'}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[#3d6b48] text-xs font-medium">Direction</label>
            <textarea
              rows={5}
              className="bg-[#eef6ef] border border-[#c8e6cc] rounded-lg px-3 py-2 text-[#1a3320] text-sm outline-none focus:border-[#8ec99a] focus:ring-2 focus:ring-[#0d8c4a]/10 transition-all resize-none"
              placeholder="What should happen in this chapter?"
              value={direction}
              onChange={e => setDirection(e.target.value)}
              disabled={status === 'running'}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-[#3d6b48] text-xs font-medium">Quality min</label>
              <input
                type="number"
                step="0.5"
                className="bg-[#eef6ef] border border-[#c8e6cc] rounded-lg px-3 py-2 text-[#1a3320] text-sm outline-none focus:border-[#8ec99a] focus:ring-2 focus:ring-[#0d8c4a]/10 transition-all"
                value={qualityThreshold}
                onChange={e => setQualityThreshold(Number(e.target.value))}
                disabled={status === 'running'}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[#3d6b48] text-xs font-medium">Max revisions</label>
              <input
                type="number"
                className="bg-[#eef6ef] border border-[#c8e6cc] rounded-lg px-3 py-2 text-[#1a3320] text-sm outline-none focus:border-[#8ec99a] focus:ring-2 focus:ring-[#0d8c4a]/10 transition-all"
                value={maxRevisions}
                onChange={e => setMaxRevisions(Number(e.target.value))}
                disabled={status === 'running'}
              />
            </div>
          </div>

          <button
            className="bg-[#0d8c4a] text-white rounded-lg py-2.5 text-sm font-medium cursor-pointer hover:shadow-[0_4px_16px_rgba(13,140,74,0.3)] transition-all disabled:opacity-50 mt-1"
            onClick={handleGenerate}
            disabled={status === 'running'}
          >
            {status === 'running' ? 'Generating...' : 'Generate chapter'}
          </button>

          <div className="flex items-center gap-2 text-xs">
            {status === 'running' && (
              <>
                <div className="w-2 h-2 rounded-full bg-[#0d8c4a] animate-pulse" />
                <span className="text-[#3d6b48]">Pipeline running...</span>
              </>
            )}
            {status === 'awaiting_review' && (
              <>
                <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                <span className="text-[#3d6b48]">Awaiting your review</span>
              </>
            )}
            {status === 'idle' && (
              <>
                <div className="w-2 h-2 rounded-full bg-[#0d8c4a]" />
                <span className="text-[#3d6b48]">Pipeline ready</span>
              </>
            )}
            {status === 'error' && (
              <>
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-red-500 text-xs">Generation failed</span>
              </>
            )}
          </div>

          <div className="border-t border-[#c8e6cc] pt-3 mt-1">
            <div className="text-[#6a9e72] text-[10px] uppercase tracking-wider mb-2.5">Project Info</div>
            <div className="flex flex-col gap-1.5">
              <div>
                <div className="text-[#6a9e72] text-[10px] uppercase">Genre</div>
                <div className="text-[#3d6b48] text-sm">{project?.genre || '—'}</div>
              </div>
              <div>
                <div className="text-[#6a9e72] text-[10px] uppercase">Tone</div>
                <div className="text-[#3d6b48] text-sm">{project?.tone || '—'}</div>
              </div>
              <div>
                <div className="text-[#6a9e72] text-[10px] uppercase">Style</div>
                <div className="text-[#3d6b48] text-sm">{project?.style || '—'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}