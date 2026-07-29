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
      <div className={`w-56 bg-surface-card border-r border-border-subtle flex flex-col p-5 gap-2.5 shrink-0 ${isOpen ? 'open' : ''} sidebar-overlay md:!static md:!transform-none`}>
      <div className="flex items-center gap-3 text-emerald-700 text-[21px] font-semibold font-serif cursor-pointer hover:opacity-80 transition-opacity mb-1"
        onClick={() => navigate('/dashboard')}>
        <img src="/lorespring-assets/lorespring-logo.png" alt="LoreSpring" className="w-6 h-6 object-contain anim-float" />
        LoreSpring
      </div>
      <button className="bg-emerald-700 text-white text-sm rounded-lg py-2.5 px-3.5 cursor-pointer hover:shadow-[0_4px_16px_rgba(13,140,74,0.3)] transition-all disabled:opacity-50 font-medium text-left"
        onClick={onNewProject} disabled={loading}>
        + New Project
      </button>
      <div className="text-text-muted text-[10px] uppercase tracking-wider pt-1.5 pb-0.5">Projects</div>
      <div className="flex flex-col gap-1.5 overflow-y-auto flex-1">
        {loading ? (
          <p className="text-text-muted text-xs">Loading projects...</p>
        ) : projects.length === 0 ? (
          <p className="text-text-muted text-xs">No projects yet</p>
        ) : (
          projects.map(project => (
            <div key={project.id}
              onClick={() => navigate(`/project/${project.id}`)}
              className="bg-transparent border border-border-subtle rounded-lg px-3 py-2 text-text-secondary text-xs cursor-pointer hover:border-emerald-500 hover:bg-surface-muted transition-all">
              {project.title}
            </div>
          ))
        )}
      </div>
      <div className="mt-auto">
        <button onClick={onLogout}
          className="bg-transparent border-none text-text-muted text-xs cursor-pointer hover:text-red-500 transition-colors p-1 text-left">
          Sign out
        </button>
      </div>
    </div>
    </>
  )
}
