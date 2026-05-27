// pages/Review.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getReview, resume } from '../api/review'
import { ErrorBanner } from '../components/ErrorBanner'
import { checkPipelineStatus } from '../api/review'

export default function Review() {
  const { thread_id } = useParams()
  const navigate = useNavigate()
  const [reviewData, setReviewData] = useState<any>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [chapterText,setChapterText] = useState("")

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
      setLoading(true)
      setError("")
      
      await resume(thread_id!, approved,chapterText)
      
      const MAX_RETRIES = 90
      const MAX_DELAY_MS = 30000
      let pollCount = 0
      let isComplete = false
      
      while (pollCount < MAX_RETRIES && !isComplete) {
        const delay = Math.min(MAX_DELAY_MS, 1000 * Math.pow(2, pollCount))
        await new Promise(resolve => setTimeout(resolve, delay))
        
        try {
          const status = await checkPipelineStatus(thread_id!)
          if (status.isComplete) {
            isComplete = true
            break
          }
        } catch (pollError: any) {
          if (pollError.message?.includes("401")) {
            setError("Session expired. Please login again.")
            return
          }
          if (pollError.message?.includes("403")) {
            setError("You don't have permission to access this project.")
            return
          }
        }
        pollCount++
      }
      
      if (!isComplete) {
        setError("Generation is taking longer than expected. Check back in a few minutes.")
        return
      }
      
      const projectId = thread_id!.split("-chapter-")[0]
      navigate(`/project/${projectId}`)
      
    } catch (err: any) {
      setError(err.message || "Error processing decision")
    } finally {
      setLoading(false)
    }
  }

  const qualityScore = reviewData?.quality_score || 0
  const feedback = reviewData?.feedback || {}

  const getScoreWidth = (score: number) => `${Math.min(100, (score / 10) * 100)}%`

  return (
    <div className="min-h-screen bg-[#f7faf7] flex flex-col h-screen overflow-hidden">
      <div className="h-12 bg-white border-b border-[#c8e6cc] flex items-center px-5 gap-2 flex-shrink-0">
        <span 
          className="font-serif text-base text-[#0d8c4a] font-semibold cursor-pointer"
          onClick={() => navigate('/dashboard')}
        >
          LoreSpring
        </span>
        <span className="text-[#6a9e72] text-sm mx-1">/</span>
        <span className="text-[#3d6b48] text-sm">Review · {reviewData ? `Chapter ${reviewData.chapter_number}` : 'Loading...'}</span>
        <div className="flex-1"></div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
          <span className="text-xs text-[#3d6b48]">Awaiting decision</span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        <div className="w-48.75 bg-white border-r border-[#c8e6cc] flex flex-col p-4 gap-3 shrink-0">
          <div className="flex items-center gap-2 text-[#0d8c4a] text-lg font-semibold font-serif cursor-pointer" onClick={() => navigate('/dashboard')}>
            <svg width="18" height="18" viewBox="0 0 30 30" fill="none">
              <path d="M15 3L20 10L27 8L23 15L29 17L22 20L25 27L15 22L5 27L8 20L1 17L7 15L3 8L10 10Z" fill="#22c9a0" opacity="0.85"/>
              <path d="M15 15L13 26L15 28L17 26Z" fill="#0d8c4a"/>
            </svg>
            LoreSpring
          </div>
          <p className="text-[#6a9e72] text-xs">Review Mode</p>
          
          {reviewData && (
            <div className="bg-[#eef6ef] border border-[#c8e6cc] rounded-xl p-3 mt-2">
              <div className="text-[#6a9e72] text-[10px] uppercase tracking-wide">Chapter {reviewData.chapter_number}</div>
              <div className="text-[#1a3320] text-sm font-serif mt-1">Chapter Draft</div>
              <div className="text-[#0d8c4a] text-xs mt-1">Score: {reviewData.quality_score}</div>
            </div>
          )}
          
          <div className="mt-auto pt-4">
            <button 
              className="bg-transparent border-none text-[#6a9e72] text-xs cursor-pointer hover:text-red-500 transition-colors"
              onClick={() => {
                const projectId = thread_id?.split("-chapter-")[0]
                navigate(`/project/${projectId}`)
              }}
            >
              ← Back to Project
            </button>
          </div>
        </div>

        {/* Main content - Draft */}
        <div className="flex-1 overflow-y-auto p-8">
          <h2 className="font-serif text-2xl font-light text-[#1a3320] mb-2">Draft Chapter</h2>
          <div className="inline-flex items-center gap-1.5 bg-[#d4f5ed] border border-[#22c9a0]/30 rounded-full px-3 py-1 text-xs text-[#0d8c6a] mb-5">
            <span className="text-[#22c9a0]">◆</span> Quality score: {reviewData?.quality_score || '—'} / 10
          </div>
          
          {reviewData ? (
            <>
              <textarea 
                 value={chapterText}
                  onChange={(e) => setChapterText(e.target.value)}
                  className="w-full h-96 text-[#3d6b48] text-sm leading-relaxed whitespace-pre-wrap font-serif font-light tracking-wide mb-4 p-3 border border-[#c8e6cc] rounded"
/>
                
              
              {reviewData.chapter_summary && (
                <div className="mt-4 pt-4 border-t border-[#c8e6cc]">
                  <div className="text-[#6a9e72] text-[10px] uppercase mb-1">Chapter Summary</div>
                  <p className="text-[#3d6b48] text-sm">{reviewData.chapter_summary}</p>
                </div>
              )}
            </>
          ) : (
            <p className="text-[#6a9e72] text-sm">Loading review...</p>
          )}
        </div>

        {/* Right panel - Review Decision */}
        <div className="w-70 bg-white border-l border-[#c8e6cc] p-5 flex flex-col gap-3 shrink-0 overflow-y-auto">
          <div className="text-[#6a9e72] text-[10px] uppercase tracking-wider">Review Decision</div>
          <p className="text-[#3d6b48] text-xs leading-relaxed">Approve to save this chapter, or reject to regenerate.</p>
          
          <button
            className="bg-[#0d8c4a] text-white rounded-lg py-3 text-sm font-medium cursor-pointer hover:shadow-[0_4px_16px_rgba(13,140,74,0.3)] transition-all disabled:opacity-50"
            disabled={loading || !reviewData}
            onClick={() => handleDecision(true)}
          >
            ✓ Approve chapter
          </button>
          
          <button
            className="bg-[#fff5f5] border border-[#fcc] rounded-lg py-3 text-sm text-[#c0392b] cursor-pointer hover:bg-[#fee] transition-all disabled:opacity-50"
            disabled={loading || !reviewData}
            onClick={() => handleDecision(false)}
          >
            ✗ Reject &amp; regenerate
          </button>

          {Object.keys(feedback).length > 0 && (
            <>
              <div className="border-t border-[#c8e6cc] pt-3 mt-1">
                <div className="text-[#6a9e72] text-[10px] uppercase tracking-wider mb-3">AI Feedback</div>
                <div className="flex flex-col gap-3">
                  {Object.entries(feedback).map(([key, value]) => (
                    <div key={key}>
                      <div className="text-[#6a9e72] text-[10px] uppercase">{key}</div>
                      <div className="h-1 bg-[#eef6ef] rounded-full overflow-hidden mt-1 mb-1">
                        <div 
                          className="h-full rounded-full bg-linear-to-r from-[#0d8c4a] to-[#22c9a0]"
                          style={{ width: getScoreWidth(typeof value === 'number' ? value : 0) }}
                        />
                      </div>
                      <div className="text-[#3d6b48] text-xs mt-1">{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}