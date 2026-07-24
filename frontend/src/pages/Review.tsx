// pages/Review.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getReview, resume, checkPipelineStatus } from '../api/review'
import { ErrorBanner } from '../components/ErrorBanner'


export default function Review() {
  const { thread_id } = useParams()
  const navigate = useNavigate()
  const [reviewData, setReviewData] = useState<any>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [chapterText, setChapterText] = useState("")

  useEffect(() => {
    if (!thread_id) return
    const loadReview = async () => {
      try {
        const data = await getReview(thread_id)
        setReviewData(data)
      } catch (error: any) {
        setError(error.message || "Failed to load review")
      }
    }
    loadReview()
  }, [thread_id])

  useEffect(() => {
    if (reviewData?.final_chapter) {
      setChapterText(reviewData.final_chapter)
    }
  }, [reviewData])

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
      const projectId = thread_id!.split("-chapter-")[0]
      navigate(`/project/${projectId}`)
    } catch (err: any) {
      setError(err.message || "Error processing decision")
    } finally { setLoading(false) }
  }

  const qualityScore = reviewData?.quality_score || 0
  const feedback = reviewData?.feedback || {}
  const getScoreWidth = (score: number) => `${Math.min(100, (score / 10) * 100)}%`

  return (
    <div className="min-h-screen bg-surface flex flex-col h-screen overflow-hidden">
      <div className="grain-overlay" />
      <div className="h-12 bg-surface-card border-b border-border-subtle flex items-center px-5 gap-2 shrink-0 relative z-10">
        <span className="font-serif text-base text-emerald-700 font-semibold cursor-pointer flex items-center gap-2"
          onClick={() => navigate('/dashboard')}>
          <img src="/lorespring-assets/lorespring-logo.png" alt="LoreSpring" className="w-6 h-6 object-contain" /> LoreSpring
        </span>
        <span className="text-text-muted text-sm mx-1">/</span>
        <span className="text-text-secondary text-sm">Review · {reviewData ? `Chapter ${reviewData.chapter_number}` : 'Loading...'}</span>
        <div className="flex-1"></div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
          <span className="text-xs text-text-secondary">Awaiting decision</span>
        </div>
      </div>

      {error && <ErrorBanner message={error} onDismiss={() => setError('')} variant="modal" />}

      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        <div className="w-[195px] bg-surface-card border-r border-border-subtle flex flex-col p-4 gap-3 shrink-0 relative z-10">
          <div className="flex items-center gap-2 text-emerald-700 text-lg font-semibold font-serif cursor-pointer" onClick={() => navigate('/dashboard')}>
            <img src="/lorespring-assets/lorespring-logo.png" alt="LoreSpring" className="w-6 h-6 object-contain anim-float" />
            LoreSpring
          </div>
          <p className="text-text-muted text-xs">Review Mode</p>
          {reviewData && (
            <div className="bg-surface-muted border border-border-subtle rounded-xl p-3 mt-2">
              <div className="text-text-muted text-[10px] uppercase tracking-wide">Chapter {reviewData.chapter_number}</div>
              <div className="text-text-primary text-sm font-serif mt-1">Chapter Draft</div>
              <div className="text-emerald-700 text-xs mt-1">Score: {qualityScore}</div>
            </div>
          )}
          <div className="mt-auto pt-4">
            <button className="bg-transparent border-none text-text-muted text-xs cursor-pointer hover:text-red-500 transition-colors"
              onClick={() => { const projectId = thread_id?.split("-chapter-")[0]; navigate(`/project/${projectId}`) }}>
              &larr; Back to Project
            </button>
          </div>
        </div>

        {/* Main content - Draft */}
        <div className="flex-1 overflow-y-auto p-8 relative z-10">
          <h2 className="font-serif text-2xl font-light text-text-primary mb-2">Draft Chapter</h2>
          <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-full px-3 py-1 text-xs text-emerald-700 mb-5">
            Quality score: {reviewData?.quality_score || '—'} / 10
          </div>
          {reviewData ? (
            <>
              <textarea value={chapterText} onChange={(e) => setChapterText(e.target.value)}
                className="w-full h-96 text-text-secondary text-sm leading-relaxed whitespace-pre-wrap font-serif font-light tracking-wide mb-4 p-3 border border-border-subtle rounded" />
              {reviewData.chapter_summary && (
                <div className="mt-4 pt-4 border-t border-border-subtle">
                  <div className="text-text-muted text-[10px] uppercase mb-1">Chapter Summary</div>
                  <p className="text-text-secondary text-sm">{reviewData.chapter_summary}</p>
                </div>
              )}
            </>
          ) : (
            <p className="text-text-muted text-sm">Loading review...</p>
          )}
        </div>

        {/* Right panel - Review Decision */}
        <div className="w-[280px] bg-surface-card border-l border-border-subtle p-5 flex flex-col gap-3 shrink-0 overflow-y-auto relative z-10">
          <div className="text-text-muted text-[10px] uppercase tracking-wider">Review Decision</div>
          <p className="text-text-secondary text-xs leading-relaxed">Approve to save this chapter, or reject to regenerate.</p>
          <button className="bg-emerald-700 text-white rounded-lg py-3 text-sm font-medium cursor-pointer hover:shadow-[0_4px_16px_rgba(13,140,74,0.3)] transition-all disabled:opacity-50"
            disabled={loading || !reviewData} onClick={() => handleDecision(true)}>
            Approve chapter
          </button>
          <button className="bg-red-50 border border-red-200 rounded-lg py-3 text-sm text-red-600 cursor-pointer hover:bg-red-100 transition-all disabled:opacity-50"
            disabled={loading || !reviewData} onClick={() => handleDecision(false)}>
            Reject &amp; regenerate
          </button>
          {Object.keys(feedback).length > 0 && (
            <div className="border-t border-border-subtle pt-3 mt-1">
              <div className="text-text-muted text-[10px] uppercase tracking-wider mb-3">AI Feedback</div>
              <div className="flex flex-col gap-3">
                {Object.entries(feedback).map(([key, value]) => (
                  <div key={key}>
                    <div className="text-text-muted text-[10px] uppercase">{key}</div>
                    <div className="h-1 bg-surface-muted rounded-full overflow-hidden mt-1 mb-1">
                      <div className="h-full rounded-full bg-linear-to-r from-emerald-700 to-emerald-400"
                        style={{ width: getScoreWidth(typeof value === 'number' ? value : 0) }} />
                    </div>
                    <div className="text-text-secondary text-xs mt-1">{String(value)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
