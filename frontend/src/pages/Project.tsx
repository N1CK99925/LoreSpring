import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProject } from '../api/projects'
import { getChapters } from '../api/chapters'
import { generateChapter } from '../api/generate'
import type { Chapter, Project as ProjectType } from '../types'

export default function Project() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState<ProjectType | null>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null)
  const [status, setStatus] = useState('')

  // generation form state
  const [direction, setDirection] = useState('')
  const [styleType, setStyleType] = useState('MOOD')
  const [styleInput, setStyleInput] = useState('')
  const [chapterNumber, setChapterNumber] = useState(1)

  useEffect(() => {
    if (!id) return
    getProject(id).then(setProject)
    getChapters(id).then(setChapters)
  }, [id])

  const handleGenerate = async () => {
    if (!id) return
    setStatus('running')
    await generateChapter(id, chapterNumber, direction, styleType, styleInput)
    setStatus('awaiting_review')
  }

  return (
    <div className="min-h-screen bg-[#080D0A] flex">
      {/* Sidebar — chapter list */}
      <div className="w-[220px] bg-[#0F1A12] border-r border-[#1A3320] flex flex-col p-4 gap-3">
        <h1
          className="text-[#00A86B] text-xl font-bold cursor-pointer"
          style={{ fontFamily: 'Fraunces, serif' }}
          onClick={() => navigate('/dashboard')}
        >
          LoreSpring
        </h1>
        <p className="text-[#A8C5B0] text-xs">{project?.title}</p>
        <div className="flex flex-col gap-2 mt-2">
          {chapters.map(c => (
            <div
              key={c.chapter_number}
              onClick={() => setSelectedChapter(c)}
              className="bg-[#080D0A] border border-[#1A3320] rounded-lg px-3 py-2 text-[#A8C5B0] text-sm cursor-pointer hover:border-[#00A86B] transition-colors"
            >
              <p className="text-white text-xs font-semibold">Chapter {c.chapter_number}</p>
              <p className="text-[#A8C5B0] text-xs">Score: {c.quality_score ?? 'N/A'}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Center — chapter content */}
      <div className="flex-1 p-8 overflow-y-auto">
        {selectedChapter ? (
          <>
            <h2 className="text-white text-xl font-semibold mb-4">Chapter {selectedChapter.chapter_number}</h2>
            <p className="text-[#A8C5B0] text-sm leading-relaxed whitespace-pre-wrap">{selectedChapter.final_chapter}</p>
            <button
              className="mt-6 border border-[#00A86B] text-[#00A86B] rounded-lg px-4 py-2 text-sm cursor-pointer hover:bg-[#00A86B] hover:text-white transition-all"
              onClick={() => navigate(`/review/${id}-chapter-${selectedChapter.chapter_number}`)}
            >
              Go to Review
            </button>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-[#A8C5B0] text-sm">Select a chapter or generate a new one</p>
          </div>
        )}
      </div>

      {/* Right — generation console */}
      <div className="w-[300px] bg-[#0F1A12] border-l border-[#1A3320] p-4 flex flex-col gap-4">
        <h2 className="text-white text-sm font-semibold">Generation Console</h2>

        <div className="flex flex-col gap-1">
          <label className="text-[#A8C5B0] text-xs">Chapter Number</label>
          <input
            type="number"
            className="bg-[#080D0A] border border-[#1A3320] rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-[#00A86B]"
            value={chapterNumber}
            onChange={e => setChapterNumber(Number(e.target.value))}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[#A8C5B0] text-xs">User Direction</label>
          <textarea
            className="bg-[#080D0A] border border-[#1A3320] rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-[#00A86B] resize-none h-28"
            placeholder="What should happen in this chapter?"
            value={direction}
            onChange={e => setDirection(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[#A8C5B0] text-xs">Style Type</label>
          <select
            className="bg-[#080D0A] border border-[#1A3320] rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-[#00A86B]"
            value={styleType}
            onChange={e => setStyleType(e.target.value)}
          >
            <option value="MOOD">MOOD</option>
            <option value="SAMPLE">SAMPLE</option>
            <option value="REFERENCE">REFERENCE</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[#A8C5B0] text-xs">Style Input</label>
          <input
            className="bg-[#080D0A] border border-[#1A3320] rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-[#00A86B]"
            placeholder="e.g. epic fantasy"
            value={styleInput}
            onChange={e => setStyleInput(e.target.value)}
          />
        </div>

        <button
          className="bg-[#00A86B] text-white rounded-lg py-2 text-sm cursor-pointer hover:shadow-[0_0_12px_rgba(0,168,107,0.4)] transition-all"
          onClick={handleGenerate}
        >
          Generate
        </button>

        {status === 'running' && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#00A86B] animate-pulse" />
            <p className="text-[#A8C5B0] text-xs">Pipeline running...</p>
          </div>
        )}
        {status === 'awaiting_review' && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
            <p className="text-[#A8C5B0] text-xs">Awaiting your review</p>
          </div>
        )}
      </div>
    </div>
  )
}