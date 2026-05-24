import { useNavigate } from 'react-router-dom'
import type { Project } from '../types'

interface DashboardSidebarProps {
  projects: Project[]
  loading: boolean
  onNewProject: () => void
  onLogout: () => void
}

/**
 * DashboardSidebar Component
 * 
 * Left navigation panel with:
 * - Logo
 * - New Project button
 * - Projects list
 * - Logout button
 * 
 * Props:
 * - projects: List of user's projects
 * - loading: Is data loading?
 * - onNewProject: Callback for new project button
 * - onLogout: Callback for logout button
 */
export const DashboardSidebar = ({
  projects,
  loading,
  onNewProject,
  onLogout
}: DashboardSidebarProps) => {
  const navigate = useNavigate()

  return (
    <div className="w-[220px] bg-[#0F1A12] border-r border-[#1A3320] flex flex-col p-4 gap-3">
      {/* Logo */}
      <h1
        className="text-[#00A86B] text-xl font-bold mb-2 cursor-pointer hover:opacity-80 transition-opacity"
        style={{ fontFamily: 'Fraunces, serif' }}
        onClick={() => navigate('/dashboard')}
      >
        LoreSpring
      </h1>

      {/* New Project Button */}
      <button
        className="bg-[#00A86B] text-white text-sm rounded-lg py-2 cursor-pointer hover:shadow-[0_0_12px_rgba(0,168,107,0.4)] transition-all disabled:opacity-50"
        onClick={onNewProject}
        disabled={loading}
      >
        + New Project
      </button>

      {/* Projects List */}
      <div className="flex flex-col gap-2 mt-2 flex-1 overflow-y-auto">
        {loading ? (
          <p className="text-[#A8C5B0] text-xs">Loading projects...</p>
        ) : projects.length === 0 ? (
          <p className="text-[#A8C5B0] text-xs">No projects yet</p>
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

      {/* Logout Button */}
      <button
        onClick={onLogout}
        className="text-xs text-[#A8C5B0] hover:text-red-400 cursor-pointer transition-colors"
      >
        Logout
      </button>
    </div>
  )
}

/**
 * ProjectListItem Component
 * Single clickable project in sidebar
 */
interface ProjectListItemProps {
  project: Project
  onClick: () => void
}

const ProjectListItem = ({ project, onClick }: ProjectListItemProps) => {
  return (
    <div
      onClick={onClick}
      className="bg-[#080D0A] border border-[#1A3320] rounded-lg px-3 py-2 text-[#A8C5B0] text-sm cursor-pointer hover:border-[#00A86B] transition-colors"
    >
      {project.title}
    </div>
  )
}