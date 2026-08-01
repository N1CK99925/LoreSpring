import { useNavigate } from 'react-router-dom'
import type { Project } from '../types'


interface DashboardSidebarProps {
  projects: Project[]
  loading: boolean
  onNewProject: () => void
  onLogout: () => void
  isOpen?: boolean
  onToggle?: () => void
}

export const DashboardSidebar = ({ projects, loading, onNewProject, onLogout, isOpen, onToggle }: DashboardSidebarProps) => {
  const navigate = useNavigate()
  return (
    <>
      {isOpen && <div className="sidebar-backdrop md:hidden" onClick={onToggle} />}
      <aside className={`w-60 bg-surface-card border-r border-border-subtle flex flex-col shrink-0 ${isOpen ? 'open' : ''} sidebar-overlay md:!static md:!transform-none`}>

        {/* ── Brand ── */}
        <div className="p-5 pb-4">
          <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => navigate('/dashboard')}>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/[0.06] flex items-center justify-center border border-emerald-500/10 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:bg-emerald-500/[0.1] group-hover:scale-105">
              <img src="/lorespring-assets/lorespring-logo.png" alt="LoreSpring" className="w-4 h-4 object-contain" />
            </div>
            <span className="font-serif text-[17px] font-normal text-text-primary tracking-tight group-hover:text-emerald-800 transition-colors duration-500">
              LoreSpring
            </span>
          </div>
        </div>

        {/* ── New Project Button ── */}
        <div className="px-3.5 mb-5">
          <button
            onClick={onNewProject}
            disabled={loading}
            className="group/btn w-full flex items-center gap-2.5 rounded-2xl bg-emerald-700 text-white px-4 py-2.5 text-[13px] font-medium cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-[0_8px_28px_rgba(13,140,74,0.28)] active:scale-[0.98] disabled:opacity-40"
          >
            <span className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover/btn:scale-105">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white/80">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </span>
            <span>New Project</span>
          </button>
        </div>

        {/* ── Divider ── */}
        <div className="mx-5 border-t border-border-subtle/60" />

        {/* ── Projects List ── */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <div className="text-[9px] uppercase tracking-[0.2em] text-text-muted font-medium px-2 mb-2.5">Projects</div>
          {loading ? (
            <div className="flex flex-col gap-1.5 px-2">
              {[1, 2, 3].map(n => (
                <div key={n} className="h-9 rounded-xl bg-surface-muted animate-pulse" />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <p className="text-text-muted text-xs px-2 leading-relaxed">No projects yet. Create your first story.</p>
          ) : (
            <div className="flex flex-col gap-0.5">
              {projects.map(project => (
                <button
                  key={project.id}
                  onClick={() => navigate(`/project/${project.id}`)}
                  className="group/item w-full text-left rounded-xl px-3 py-2.5 text-[13px] text-text-secondary cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-surface-muted hover:text-text-primary hover:pl-4"
                >
                  <span className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/40 shrink-0 transition-all duration-500 group-hover/item:bg-emerald-500 group-hover/item:scale-125" />
                    <span className="truncate">{project.title}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="p-4 border-t border-border-subtle/60">
          <button
            onClick={onLogout}
            className="group/signout w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-[12px] text-text-muted cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-red-500/[0.04] hover:text-red-600"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="transition-all duration-500 group-hover/signout:-translate-x-0.5">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Sign out</span>
          </button>
        </div>
      </aside>
    </>
  )
}
