// components/DashboardSidebar.tsx
import { useNavigate } from 'react-router-dom'
import type { Project } from '../types'

interface DashboardSidebarProps {
  projects: Project[]
  loading: boolean
  onNewProject: () => void
  onLogout: () => void
}

export const DashboardSidebar = ({
  projects,
  loading,
  onNewProject,
  onLogout
}: DashboardSidebarProps) => {
  const navigate = useNavigate()

  return (
    <div className="w-[220px] bg-white border-r border-[#c8e6cc] flex flex-col p-5 gap-2.5 flex-shrink-0">
      <div 
        className="flex items-center gap-2 text-[#0d8c4a] text-[21px] font-semibold font-serif cursor-pointer hover:opacity-80 transition-opacity mb-1"
        onClick={() => navigate('/dashboard')}
      >
        <SidebarLogo />
        LoreSpring
      </div>

      <button
        className="bg-[#0d8c4a] text-white text-sm rounded-lg py-2.5 px-3.5 cursor-pointer hover:shadow-[0_4px_16px_rgba(13,140,74,0.3)] transition-all disabled:opacity-50 font-medium text-left"
        onClick={onNewProject}
        disabled={loading}
      >
        + New Project
      </button>

      <div className="text-[#6a9e72] text-[10px] uppercase tracking-wider pt-1.5 pb-0.5">Projects</div>

      <div className="flex flex-col gap-1.5 overflow-y-auto flex-1">
        {loading ? (
          <p className="text-[#6a9e72] text-xs">Loading projects...</p>
        ) : projects.length === 0 ? (
          <p className="text-[#6a9e72] text-xs">No projects yet</p>
        ) : (
          projects.map(project => (
            <ProjectListItem
              key={project.id}
              project={project}
              onClick={() => navigate(`/project/${project.id}`)}
            />
          ))
        )}
      </div>

      <div className="mt-auto">
        <button
          onClick={onLogout}
          className="bg-transparent border-none text-[#6a9e72] text-xs cursor-pointer hover:text-red-500 transition-colors p-1 text-left"
        >
          Sign out
        </button>
      </div>
    </div>
  )
}

const ProjectListItem = ({ project, onClick }: { project: Project; onClick: () => void }) => {
  return (
    <div
      onClick={onClick}
      className="bg-transparent border border-[#c8e6cc] rounded-lg px-3 py-2 text-[#3d6b48] text-xs cursor-pointer hover:border-[#8ec99a] hover:bg-[#eef6ef] transition-all"
    >
      {project.title}
    </div>
  )
}

const SidebarLogo = () => (
  <svg width="22" height="22" viewBox="0 0 30 30" fill="none">
    <path d="M15 3L20 10L27 8L23 15L29 17L22 20L25 27L15 22L5 27L8 20L1 17L7 15L3 8L10 10Z" fill="#22c9a0" opacity="0.85"/>
    <path d="M15 15L13 26L15 28L17 26Z" fill="#0d8c4a"/>
    <ellipse cx="15" cy="12" rx="4" ry="4" fill="#b8f0e0" opacity="0.9"/>
  </svg>
)