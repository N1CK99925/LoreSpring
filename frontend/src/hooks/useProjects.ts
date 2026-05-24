import { useState, useCallback } from 'react'
import { getProjects, createProject } from '../api/projects'
import { handleApiError } from '../api/client'
import type { Project } from '../types'

interface UseProjectsReturn {
  projects: Project[]
  loading: boolean
  error: string
  fetchProjects: () => Promise<void>
  addProject: (title: string, description: string, genre: string, tone: string, style: string) => Promise<Project | null>
  clearError: () => void
}

/**
 * Custom hook for managing project state and API calls
 * 
 * Handles:
 * - Fetching user's projects
 * - Creating new projects with metadata
 * - Error handling & display
 * - Loading states
 */
export const useProjects = (): UseProjectsReturn => {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  /**
   * Fetch all projects for current user
   * Called on mount and after successful creation
   */
  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true)
      setError('')

      const res = await getProjects()

      // Validate response is array
      if (!Array.isArray(res)) {
        setError('Invalid response from server')
        setProjects([])
        return
      }

      setProjects(res || [])
    } catch (err) {
      const errorMsg = handleApiError(err)
      setError(errorMsg)
      setProjects([])
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Create new project with metadata
   * Returns newly created project or null if failed
   */
  const addProject = useCallback(
    async (
      title: string,
      description: string,
      genre: string,
      tone: string,
      style: string
    ): Promise<Project | null> => {
      try {
        setError('')

        // Validate inputs
        if (!title.trim()) {
          setError('Project title is required')
          return null
        }
        if (!genre) {
          setError('Please select a genre')
          return null
        }
        if (!tone) {
          setError('Please select a tone')
          return null
        }
        if (!style) {
          setError('Please select a style')
          return null
        }

        // API call
        const res = await createProject(
          title.trim(),
          description.trim(),
          genre,
          tone,
          style
        )

        // Validate response
        if (!res || !res.id) {
          setError('Failed to create project. Please try again.')
          return null
        }

        // Update projects list
        setProjects(prev => [...prev, res])
        return res
      } catch (err) {
        const errorMsg = handleApiError(err)
        setError(errorMsg)
        return null
      }
    },
    []
  )

  const clearError = useCallback(() => {
    setError('')
  }, [])

  return {
    projects,
    loading,
    error,
    fetchProjects,
    addProject,
    clearError
  }
}