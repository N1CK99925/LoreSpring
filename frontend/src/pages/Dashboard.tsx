/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProjects } from '../hooks/useProjects'
import { useProjectForm } from '../hooks/useProjectForm'
import { useReveal } from '../hooks/useReveal'
import { DashboardSidebar } from '../components/DashboardSidebar'
import { CreateProjectModal } from '../components/CreateProjectModal'
import { ErrorBanner } from '../components/ErrorBanner'


export default function Dashboard() {
  const { projects, loading, error, fetchProjects, addProject, clearError } = useProjects()
  const form = useProjectForm()
  const [showModal, setShowModal] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [cardsReady, setCardsReady] = useState(false)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const navigate = useNavigate()

  useReveal()

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) { navigate('/login'); return }
    fetchProjects()
  }, [navigate, fetchProjects])

  useEffect(() => {
    if (projects.length > 0) {
      const timer = setTimeout(() => setCardsReady(true), 60)
      return () => clearTimeout(timer)
    }
  }, [projects])

  const handleCreateProject = async () => {
    setCreateLoading(true)
    const newProject = await addProject(form.title, form.description, form.genre, form.tone, form.style)
    setCreateLoading(false)
    if (newProject) { setShowModal(false); form.reset() }
  }

  const handleLogout = () => { localStorage.clear(); navigate('/login') }
  const handleOpenModal = () => { clearError(); form.reset(); setShowModal(true) }
  const handleCloseModal = () => { setShowModal(false); clearError(); form.reset() }

  const activeCount = projects.filter(p => (p as any).status !== 'completed').length

  return (
    <div className="min-h-[100dvh] bg-surface flex">
      <div className="grain-overlay" />
      {error && !showModal && (
        <ErrorBanner message={error} onDismiss={clearError} variant="page" />
      )}
      <DashboardSidebar projects={projects} loading={loading}
        onNewProject={handleOpenModal} onLogout={handleLogout}
        isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[1400px] mx-auto px-4 md:px-10 py-6 md:py-10">

          {/* Mobile Menu Toggle */}
          <button className="md:hidden mb-5 bg-surface-card border border-border-subtle rounded-2xl p-3 cursor-pointer hover:bg-surface-muted transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group"
            onClick={() => setSidebarOpen(true)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-secondary group-hover:text-emerald-700 transition-colors duration-500">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>

          {/* ── Hero Section ── */}
          <section className="mb-8 md:mb-12 reveal">
            <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 mb-6 border border-emerald-500/10 bg-emerald-500/[0.03]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-emerald-700">Dashboard</span>
            </div>
            <h1 className="font-serif text-[36px] md:text-[48px] lg:text-[56px] font-light text-text-primary leading-[1.05] tracking-tight max-w-2xl">
              Your Stories,<br />
              <span className="text-emerald-700/80">In Motion</span>
            </h1>
            <p className="text-text-secondary text-sm md:text-base mt-3 max-w-md leading-relaxed">
              {projects.length === 0
                ? 'Begin your first narrative and watch it unfold.'
                : `You have ${projects.length} ${projects.length === 1 ? 'project' : 'projects'} — ${activeCount} currently active.`
              }
            </p>
          </section>

          {/* ── Stats Row ── */}
          <section className="grid grid-cols-2 gap-3 md:gap-4 mb-8 md:mb-10">
            <div className="reveal reveal-delay-1 group">
              <div className="rounded-[1.5rem] bg-black/[0.03] p-[1px]">
                <div className="bg-surface-card rounded-[calc(1.5rem-1px)] p-4 md:p-5 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.02] to-transparent" />
                  <div className="relative">
                    <div className="text-[10px] uppercase tracking-[0.18em] text-text-muted font-medium mb-2">Total Projects</div>
                    <div className="font-serif text-[28px] md:text-[36px] font-light text-text-primary leading-none">{projects.length}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="reveal reveal-delay-2 group">
              <div className="rounded-[1.5rem] bg-black/[0.03] p-[1px]">
                <div className="bg-surface-card rounded-[calc(1.5rem-1px)] p-4 md:p-5 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.02] to-transparent" />
                  <div className="relative">
                    <div className="text-[10px] uppercase tracking-[0.18em] text-text-muted font-medium mb-2">Active</div>
                    <div className="font-serif text-[28px] md:text-[36px] font-light text-emerald-700 leading-none">{activeCount}</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── Projects Header ── */}
          <section className="flex items-end justify-between mb-5 md:mb-6 reveal">
            <div>
              <h2 className="font-serif text-[22px] md:text-[28px] font-light text-text-primary">Projects</h2>
            </div>
            <button
              onClick={handleOpenModal}
              className="group/btn flex items-center gap-2.5 rounded-full bg-emerald-700 text-white px-5 py-2.5 text-sm font-medium cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-[0_8px_32px_rgba(13,140,74,0.25)] active:scale-[0.98]"
            >
              <span>New</span>
              <span className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 group-hover/btn:scale-105">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/80">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </span>
            </button>
          </section>

          {/* ── Project Grid ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 md:gap-4">
            {projects.map((project, i) => {
              const isHovered = hoveredId === project.id
              const somethingHovered = hoveredId !== null
              return (
                <div
                  key={project.id}
                  onClick={() => navigate(`/project/${project.id}`)}
                  onMouseEnter={() => setHoveredId(project.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className="cursor-pointer group/card"
                  style={{
                    opacity: cardsReady ? (somethingHovered && !isHovered ? 0.6 : 1) : 0,
                    transform: cardsReady
                      ? `translateY(0) scale(${isHovered ? 1.015 : 1})`
                      : 'translateY(24px)',
                    transition: `opacity 0.5s cubic-bezier(0.32,0.72,0,1), transform 0.5s cubic-bezier(0.32,0.72,0,1) ${i * 80}ms`,
                    zIndex: isHovered ? 2 : 1,
                  }}
                >
                  <div className="rounded-[1.5rem] bg-black/[0.03] p-[1px] h-full transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
                    style={{ boxShadow: isHovered ? '0 16px 56px rgba(13,140,74,0.08)' : 'none' }}>
                    <div className="bg-surface-card rounded-[calc(1.5rem-1px)] p-6 md:p-8 h-full relative overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
                      style={{ borderColor: isHovered ? 'rgba(16,185,129,0.2)' : undefined }}
                      >
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.02] to-transparent transition-opacity duration-500"
                        style={{ opacity: isHovered ? 1 : 0 }} />

                      <div className="relative flex flex-col h-full">
                        <div className="flex items-start justify-between mb-5">
                          <div className="w-9 h-9 rounded-2xl bg-surface-muted flex items-center justify-center border border-border-subtle transition-all duration-500"
                            style={{ borderColor: isHovered ? 'rgba(16,185,129,0.15)' : undefined }}>
                            <img src="/lorespring-assets/lorespring-logo.png" alt="" className="w-4 h-4 object-contain opacity-60" />
                          </div>
                          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium tracking-wide border transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] border-emerald-500/15 bg-emerald-500/[0.04] text-emerald-700">
                            <span className="w-1 h-1 rounded-full bg-emerald-500" />
                            Active
                          </span>
                        </div>

                        <div className="font-serif text-[20px] md:text-[22px] font-normal text-text-primary mb-1.5 leading-snug transition-colors duration-500"
                          style={{ color: isHovered ? '#047857' : undefined }}>
                          {project.title}
                        </div>

                        <div className="text-text-muted text-xs mb-4">
                          {project.genre} · {project.tone}
                        </div>

                        {/* Expandable description — revealed on hover */}
                        <div
                          className="overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
                          style={{
                            maxHeight: isHovered ? '80px' : '0px',
                            opacity: isHovered ? 1 : 0,
                            marginTop: isHovered ? 'auto' : '0',
                          }}
                        >
                          <div className="pt-4 border-t border-border-subtle/50">
                            <div className="text-text-muted text-[11px] leading-relaxed max-w-md">
                              {project.style ? `${project.style} · ${project.genre}` : 'A new story waiting to be told.'}
                            </div>
                          </div>
                        </div>

                        {!isHovered && <div className="mt-auto" />}

                        <div className="flex items-center gap-1.5 text-[11px] text-text-muted mt-4 transition-colors duration-500"
                          style={{ color: isHovered ? '#047857' : undefined }}>
                          <span>Open</span>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
                            style={{ transform: isHovered ? 'translateX(4px)' : 'translateX(0)' }}>
                            <path d="M5 12h14M12 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* ── New Project Card ── */}
            <div
              style={{
                opacity: cardsReady ? 1 : 0,
                transform: cardsReady ? 'translateY(0)' : 'translateY(24px)',
                transition: `opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${projects.length * 80}ms, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${projects.length * 80}ms`,
              }}
            >
              <button
                onClick={handleOpenModal}
                className="w-full h-full cursor-pointer group/new"
              >
                <div className="rounded-[1.5rem] border border-dashed border-border-subtle h-full transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover/new:border-emerald-500/30 group-hover/new:shadow-[0_8px_32px_rgba(13,140,74,0.04)]">
                  <div className="bg-transparent rounded-[1.5rem] min-h-[180px] md:min-h-[220px] flex flex-col items-center justify-center gap-3 p-6 relative overflow-hidden">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/[0.06] flex items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover/new:scale-110 group-hover/new:bg-emerald-500/[0.1]">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-emerald-600/50 transition-all duration-500 group-hover/new:text-emerald-600">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </div>
                    <span className="text-text-muted text-sm transition-colors duration-500 group-hover/new:text-text-secondary">
                      New project
                    </span>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* ── Empty State ── */}
          {projects.length === 0 && !loading && (
            <section className="text-center py-20 md:py-32 reveal reveal-delay-2">
              <div className="w-16 h-16 rounded-full bg-emerald-500/[0.05] flex items-center justify-center mx-auto mb-6 border border-emerald-500/10">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-emerald-600/40">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </div>
              <h3 className="font-serif text-[22px] text-text-primary mb-2">No stories yet</h3>
              <p className="text-text-muted text-sm max-w-xs mx-auto mb-8">
                Create your first project and begin crafting your narrative world.
              </p>
              <button
                onClick={handleOpenModal}
                className="group/btn inline-flex items-center gap-2.5 rounded-full bg-emerald-700 text-white px-7 py-3 text-sm font-medium cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-[0_8px_32px_rgba(13,140,74,0.25)] active:scale-[0.98]"
              >
                <span>Create Project</span>
                <span className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 group-hover/btn:scale-105">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/80">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </span>
              </button>
            </section>
          )}

        </div>
      </main>

      <CreateProjectModal isOpen={showModal} onClose={handleCloseModal}
        onSubmit={handleCreateProject} title={form.title} onTitleChange={form.setTitle}
        description={form.description} onDescriptionChange={form.setDescription}
        genre={form.genre} onGenreChange={form.setGenre} tone={form.tone}
        onToneChange={form.setTone} style={form.style} onStyleChange={form.setStyle}
        loading={createLoading} error={error} onErrorDismiss={clearError} />
    </div>
  )
}
