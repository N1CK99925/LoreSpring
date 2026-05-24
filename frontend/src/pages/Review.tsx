/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getReview, resume } from '../api/review'

export default function Review() {
  const { thread_id } = useParams()
  const navigate = useNavigate()
  const [reviewData, setReviewData] = useState<any>(null)

  useEffect(() => {
    if (!thread_id) return
    getReview(thread_id).then(setReviewData)
  }, [thread_id])

  const handleDecision = async (approved: boolean) => {
    await resume(thread_id!, approved)
    // thread_id format is projectId_chapterNumber
    // thread_id = "{project_id}-chapter-{chapter_number}"
    const projectId = thread_id!.split('-chapter-')[0]
    navigate(`/project/${projectId}`)
  }

  return (
    <div className="min-h-screen bg-[#080D0A] flex">
      {/* Sidebar */}
      <div className="w-[220px] bg-[#0F1A12] border-r border-[#1A3320] p-4">
        <h1
          className="text-[#00A86B] text-xl font-bold cursor-pointer"
          style={{ fontFamily: 'Fraunces, serif' }}
          onClick={() => navigate('/dashboard')}
        >
          LoreSpring
        </h1>
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
      <div className="w-[300px] bg-[#0F1A12] border-l border-[#1A3320] p-4 flex flex-col gap-4">
        <h2 className="text-white text-sm font-semibold">Review Decision</h2>
        <p className="text-[#A8C5B0] text-xs">Approve to save this chapter, or reject to regenerate.</p>

        <button
          className="bg-[#00A86B] text-white rounded-lg py-3 text-sm cursor-pointer hover:shadow-[0_0_12px_rgba(0,168,107,0.4)] transition-all"
          onClick={() => handleDecision(true)}
        >
          Approve
        </button>
        <button
          className="bg-red-900 border border-red-700 text-red-300 rounded-lg py-3 text-sm cursor-pointer hover:bg-red-800 transition-all"
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