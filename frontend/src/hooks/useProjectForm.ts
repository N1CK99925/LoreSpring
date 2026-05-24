import { useState, useCallback } from 'react'

interface UseFormReturn {
  title: string
  description: string
  genre: string
  tone: string
  style: string
  setTitle: (value: string) => void
  setDescription: (value: string) => void
  setGenre: (value: string) => void
  setTone: (value: string) => void
  setStyle: (value: string) => void
  reset: () => void
}

/**
 * Custom hook for managing form state
 * 
 * Handles:
 * - Form field state
 * - Reset to initial state
 */
export const useProjectForm = (): UseFormReturn => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [genre, setGenre] = useState('')
  const [tone, setTone] = useState('')
  const [style, setStyle] = useState('')

  const reset = useCallback(() => {
    setTitle('')
    setDescription('')
    setGenre('')
    setTone('')
    setStyle('')
  }, [])

  return {
    title,
    description,
    genre,
    tone,
    style,
    setTitle,
    setDescription,
    setGenre,
    setTone,
    setStyle,
    reset
  }
}