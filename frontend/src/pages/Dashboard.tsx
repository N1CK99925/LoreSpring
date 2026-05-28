
/* eslint-disable @typescript-eslint/no-explicit-any */
// pages/Dashboard.tsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProjects } from '../hooks/useProjects'
import { useProjectForm } from '../hooks/useProjectForm'
import { DashboardSidebar } from '../components/DashboardSidebar'
import { CreateProjectModal } from '../components/CreateProjectModal'
import { ErrorBanner } from '../components/ErrorBanner'

export default function Dashboard() {
  const { projects, loading, error, fetchProjects, addProject, clearError } = useProjects()
  const form = useProjectForm()
  const [showModal, setShowModal] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      navigate('/login')
      return
    }
    fetchProjects()
  }, [navigate, fetchProjects])

  const handleCreateProject = async () => {
    setCreateLoading(true)
    const newProject = await addProject(
      form.title,
      form.description,
      form.genre,
      form.tone,
      form.style
    )
    setCreateLoading(false)
    if (newProject) {
      setShowModal(false)
      form.reset()
    }
  }

  const handleLogout = () => {
    localStorage.clear()
    navigate('/login')
  }

  const handleOpenModal = () => {
    clearError()
    form.reset()
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    clearError()
    form.reset()
  }

  // Calculate stats

  // const totalChapters = projects.reduce((sum, p) => sum + (p as any).chapter_count || 0, 0)
  // const totalWords = projects.reduce((sum, p) => sum + (p as any).word_count || 0, 0)

  return (
    <div className="min-h-screen bg-[#f7faf7] flex">
      {error && !showModal && (
        <ErrorBanner
          message={error}
          onDismiss={clearError}
          variant="page"
        />
      )}

      <DashboardSidebar
        projects={projects}
        loading={loading}
        onNewProject={handleOpenModal}
        onLogout={handleLogout}
      />

      <div className="flex-1 overflow-y-auto p-8">
        <div className="mb-7">
          <h1 className="font-serif text-[26px] font-light text-[#1a3320] tracking-tight">Your Projects</h1>
          <p className="text-[#3d6b48] text-sm mt-1">
            {projects.length} {projects.length === 1 ? 'story' : 'stories'} in progress
          </p>
        </div>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-3.5">
          {projects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => navigate(`/project/${project.id}`)}
            />
          ))}
          <button
            onClick={handleOpenModal}
            className="bg-white border border-dashed border-[#c8e6cc] rounded-2xl p-5 min-h-32.5 flex flex-col items-center justify-center gap-2 text-[#6a9e72] text-sm hover:border-[#8ec99a] hover:bg-[#eef6ef] transition-all cursor-pointer"
          >
            <span className="text-2xl text-[#8ec99a]">+</span>
            New project
          </button>
        </div>

        <div className="grid grid-cols-4 gap-3 mt-8">
          {/* <StatCard label="Total chapters" value={totalChapters.toString()} /> */}
          {/* <StatCard label="Words written" value={totalWords.toLocaleString()} /> */}
          <StatCard label="Projects" value={projects.length.toString()} />
          <StatCard label="Active" value={projects.filter(p => (p as any).status !== 'completed').length.toString()} />
        </div>
      </div>

      <CreateProjectModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={handleCreateProject}
        title={form.title}
        onTitleChange={form.setTitle}
        description={form.description}
        onDescriptionChange={form.setDescription}
        genre={form.genre}
        onGenreChange={form.setGenre}
        tone={form.tone}
        onToneChange={form.setTone}
        style={form.style}
        onStyleChange={form.setStyle}
        loading={createLoading}
        error={error}
        onErrorDismiss={clearError}
      />
    </div>
  )
}

const ProjectCard = ({ project, onClick }: { project: any; onClick: () => void }) => (
  <div
    onClick={onClick}
    className="bg-white border border-[#c8e6cc] rounded-2xl p-5 cursor-pointer transition-all hover:border-[#8ec99a] hover:shadow-[0_4px_20px_rgba(13,140,74,0.1)] hover:-translate-y-0.5"
  >
    <div className="mb-2.5">
      <ProjectIcon />
    </div>
    <div className="font-serif text-base font-normal text-[#1a3320] mb-1">{project.title}</div>
    <div className="text-[#6a9e72] text-xs">{project.genre} · {project.tone}</div>
    <div className="text-[#6a9e72] text-xs mt-1">
      {/* {(project as any).chapter_count || 0} idk ill add this later chapters */}
      {/* TODO */}
    </div>
    <span className="inline-block bg-[#d4f5ed] border border-[#22c9a0]/30 rounded-full px-2 py-0.5 text-[10px] text-[#0d8c6a] mt-2">
      Active
    </span>
  </div>
)

const StatCard = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-white border border-[#c8e6cc] rounded-xl p-4 shadow-sm">
    <div className="text-[#6a9e72] text-xs">{label}</div>
    <div className="font-serif text-[28px] font-light text-[#1a3320] mt-1">{value}</div>
  </div>
)

const ProjectIcon = () => (
  <svg width="32" height="32" viewBox="0 0 30 30" fill="none" opacity="0.75">
    <path d="M15 3L20 10L27 8L23 15L29 17L22 20L25 27L15 22L5 27L8 20L1 17L7 15L3 8L10 10Z" fill="#22c9a0"/>
    <path d="M15 15L13 26L15 28L17 26Z" fill="#0d8c4a"/>
  </svg>
)