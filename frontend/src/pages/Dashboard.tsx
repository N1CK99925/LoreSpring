/* eslint-disable @typescript-eslint/no-explicit-any */
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
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) { navigate('/login'); return }
    fetchProjects()
  }, [navigate, fetchProjects])

  const handleCreateProject = async () => {
    setCreateLoading(true)
    const newProject = await addProject(form.title, form.description, form.genre, form.tone, form.style)
    setCreateLoading(false)
    if (newProject) { setShowModal(false); form.reset() }
  }

  const handleLogout = () => { localStorage.clear(); navigate('/login') }
  const handleOpenModal = () => { clearError(); form.reset(); setShowModal(true) }
  const handleCloseModal = () => { setShowModal(false); clearError(); form.reset() }

  return (
    <div className="min-h-screen bg-surface flex">
      <div className="grain-overlay" />
      {error && !showModal && (
        <ErrorBanner message={error} onDismiss={clearError} variant="page" />
      )}
      <DashboardSidebar projects={projects} loading={loading}
        onNewProject={handleOpenModal} onLogout={handleLogout}
        isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="flex items-center gap-3 mb-7">
          <button className="md:hidden bg-transparent border border-border-subtle rounded-lg p-2 cursor-pointer hover:bg-surface-muted transition-colors"
            onClick={() => setSidebarOpen(true)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-secondary">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>
          <h1 className="font-serif text-[22px] md:text-[26px] font-light text-text-primary tracking-tight">Your Projects</h1>
          <p className="text-text-secondary text-sm mt-1">
            {projects.length} {projects.length === 1 ? 'story' : 'stories'} in progress
          </p>
        </div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-3.5">
          {projects.map(project => (
            <div key={project.id} onClick={() => navigate(`/project/${project.id}`)}
              className="bg-surface-card border border-border-subtle rounded-2xl p-5 cursor-pointer transition-all hover:border-emerald-500 hover:shadow-[0_4px_20px_rgba(13,140,74,0.1)] hover:-translate-y-0.5">
              <div className="mb-2.5"><img src="/lorespring-assets/lorespring-logo.png" alt="" className="w-6 h-6 object-contain" /></div>
              <div className="font-serif text-base font-normal text-text-primary mb-1">{project.title}</div>
              <div className="text-text-muted text-xs">{project.genre} · {project.tone}</div>
              <span className="inline-block bg-emerald-500/20 border border-emerald-500/30 rounded-full px-2 py-0.5 text-[10px] text-emerald-700 mt-2">Active</span>
            </div>
          ))}
          <button onClick={handleOpenModal}
            className="bg-surface-card border border-dashed border-border-subtle rounded-2xl p-5 min-h-[130px] flex flex-col items-center justify-center gap-2 text-text-muted text-sm hover:border-emerald-500 hover:bg-surface-muted transition-all cursor-pointer">
            <span className="text-2xl text-emerald-500/50">+</span>
            New project
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
          <div className="bg-surface-card border border-border-subtle rounded-xl p-4 shadow-sm">
            <div className="text-text-muted text-xs">Projects</div>
            <div className="font-serif text-[28px] font-light text-text-primary mt-1">{projects.length}</div>
          </div>
          <div className="bg-surface-card border border-border-subtle rounded-xl p-4 shadow-sm">
            <div className="text-text-muted text-xs">Active</div>
            <div className="font-serif text-[28px] font-light text-text-primary mt-1">{projects.filter(p => (p as any).status !== 'completed').length}</div>
          </div>
        </div>
      </div>
      <CreateProjectModal isOpen={showModal} onClose={handleCloseModal}
        onSubmit={handleCreateProject} title={form.title} onTitleChange={form.setTitle}
        description={form.description} onDescriptionChange={form.setDescription}
        genre={form.genre} onGenreChange={form.setGenre} tone={form.tone}
        onToneChange={form.setTone} style={form.style} onStyleChange={form.setStyle}
        loading={createLoading} error={error} onErrorDismiss={clearError} />
    </div>
  )
}
