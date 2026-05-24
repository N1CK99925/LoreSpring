import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProjects } from '../hooks/useProjects'
import { useProjectForm } from '../hooks/useProjectForm'
import { DashboardSidebar } from '../components/DashboardSidebar'
import { CreateProjectModal } from '../components/CreateProjectModal'
import { ErrorBanner } from '../components/ErrorBanner'

/**
 * Dashboard Page
 * 
 * Main hub after login. Orchestrates:
 * - Project list (from sidebar)
 * - Modal for creating projects
 * - Error handling
 * - Authentication checks
 * 
 * Component hierarchy:
 * Dashboard
 *   ├── DashboardSidebar
 *   │   └── ProjectListItem (map)
 *   ├── CreateProjectModal
 *   │   └── FormField (map)
 *   └── ErrorBanner
 */
export default function Dashboard() {
  // Custom hooks for state management
  const { projects, loading, error, fetchProjects, addProject, clearError } = useProjects()
  const form = useProjectForm()

  // Local state
  const [showModal, setShowModal] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)

  // Navigation
  const navigate = useNavigate()

  /**
   * On mount: Check authentication and fetch projects
   */
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      navigate('/login')
      return
    }

    fetchProjects()
  }, [navigate, fetchProjects])

  /**
   * Handle new project creation
   * Validates form, calls API, updates state
   */
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

    // If successful, close modal and reset form
    if (newProject) {
      setShowModal(false)
      form.reset()
    }
  }

  /**
   * Handle logout
   */
  const handleLogout = () => {
    localStorage.clear()
    navigate('/login')
  }

  /**
   * Open modal and clear any errors
   */
  const handleOpenModal = () => {
    clearError()
    form.reset()
    setShowModal(true)
  }

  /**
   * Close modal and clear errors
   */
  const handleCloseModal = () => {
    setShowModal(false)
    clearError()
    form.reset()
  }

  return (
    <div className="min-h-screen bg-[#080D0A] flex flex-col">
      {/* Page-level error banner */}
      {error && !showModal && (
        <ErrorBanner
          message={error}
          onDismiss={clearError}
          variant="page"
        />
      )}

      <div className="flex flex-1">
        {/* Sidebar */}
        <DashboardSidebar
          projects={projects}
          loading={loading}
          onNewProject={handleOpenModal}
          onLogout={handleLogout}
        />

        {/* Main content */}
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[#A8C5B0] text-sm">
            {projects.length === 0
              ? 'Create a new project to get started'
              : 'Select a project from the sidebar'}
          </p>
        </div>
      </div>

      {/* Create Project Modal */}
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