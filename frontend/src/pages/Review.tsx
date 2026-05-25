/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getReview, resume } from '../api/review'
import { ErrorBanner } from '../components/ErrorBanner'

export default function Review() {
  const { thread_id } = useParams()
  const navigate = useNavigate()
  const [reviewData, setReviewData] = useState<any>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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

 const handleDecision = async (approved: boolean) => {
  try {
    setLoading(true)
    const token = localStorage.getItem('token')
    console.log('Starting resume with approved:', approved)
    
    await resume(thread_id!, approved)
    console.log('Resume returned, starting poll')
    
    const checkPipelineComplete = async () => {
      const response = await fetch(
        `/review/${thread_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      console.log('Poll check - status:', response.status)
      return !response.ok
    }

    let isComplete = false
    let pollCount = 0
    const startTime = Date.now()
    while (!isComplete && Date.now() - startTime < 300000) {
      await new Promise(r => setTimeout(r, 2000))
      isComplete = await checkPipelineComplete()
      pollCount++
      console.log(`Poll #${pollCount}: isComplete=${isComplete}`)
    }

    console.log('Exited poll loop after', pollCount, 'checks')
    const projectId = thread_id!.split('-chapter-')[0]
    navigate(`/project/${projectId}`)
  } catch (err: any) {
    console.error('Error:', err)
    setError(err.message || "Error processing decision")
  } finally {
    setLoading(false)
  }
}

  return (
    <div className="min-h-screen bg-[#080D0A] flex">
      {/* Sidebar */}
      <div className="w-55 bg-[#0F1A12] border-r border-[#1A3320] p-4">
        <h1
          className="text-[#00A86B] text-xl font-bold cursor-pointer"
          style={{ fontFamily: 'Fraunces, serif' }}
          onClick={() => navigate('/dashboard')}
        >
          LoreSpring
        </h1>
        {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}
        <p className="text-[#A8C5B0] text-xs mt-2">Review Mode</p>
      </div>

      {/* Center — draft content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <h2 className="text-white text-xl font-semibold mb-4">Draft Chapter</h2>
        {reviewData ? (
          <p className="text-[#A8C5B0] text-sm leading-relaxed whitespace-pre-wrap">
            {reviewData.final_chapter}
            <p className="text-[#A8C5B0] text-xs">Score: {reviewData.quality_score}</p>
            <p className="text-[#A8C5B0] text-xs mt-2">{reviewData.chapter_summary}</p>
          </p>
          
        ) : (
          <p className="text-[#A8C5B0] text-sm">Loading review...</p>
        )}
      </div>

      {/* Right — approve/reject */}
      <div className="w-75 bg-[#0F1A12] border-l border-[#1A3320] p-4 flex flex-col gap-4">
        <h2 className="text-white text-sm font-semibold">Review Decision</h2>
        <p className="text-[#A8C5B0] text-xs">Approve to save this chapter, or reject to regenerate.</p>

        <button
          className="bg-[#00A86B] text-white rounded-lg py-3 text-sm cursor-pointer hover:shadow-[0_0_12px_rgba(0,168,107,0.4)] transition-all"
          disabled={loading || !reviewData}
          onClick={() => handleDecision(true)}
        >
          Approve
        </button>
        <button
          className="bg-red-900 border border-red-700 text-red-300 rounded-lg py-3 text-sm cursor-pointer hover:bg-red-800 transition-all"
          disabled={loading || !reviewData}
          onClick={() => handleDecision(false)}
        >
          Reject
        </button>

        {reviewData?.feedback && (
          <div className="mt-4 flex flex-col gap-2">
            <p className="text-[#A8C5B0] text-xs font-semibold">Feedback</p>
            {Object.entries(reviewData.feedback).map(([k, v]) => (
              <p key={k} className="text-[#A8C5B0] text-xs">{k}: {String(v)}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}