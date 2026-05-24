import { ErrorBanner } from './ErrorBanner'

interface CreateProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (title: string, description: string, genre: string, tone: string, style: string) => Promise<void>
  // Form state
  title: string
  onTitleChange: (value: string) => void
  description: string
  onDescriptionChange: (value: string) => void
  genre: string
  onGenreChange: (value: string) => void
  tone: string
  onToneChange: (value: string) => void
  style: string
  onStyleChange: (value: string) => void
  // Loading & error
  loading: boolean
  error: string
  onErrorDismiss: () => void
}

/**
 * CreateProjectModal Component
 * 
 * Modal dialog for creating new projects with:
 * - Title input
 * - Description textarea
 * - Genre dropdown
 * - Tone dropdown
 * - Style dropdown
 * - Submit/Cancel buttons
 * 
 * Props: Form state, event handlers, loading state
 */
export const CreateProjectModal = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  onTitleChange,
  description,
  onDescriptionChange,
  genre,
  onGenreChange,
  tone,
  onToneChange,
  style,
  onStyleChange,
  loading,
  error,
  onErrorDismiss
}: CreateProjectModalProps) => {
  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(title, description, genre, tone, style)
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#0F1A12] border border-[#1A3320] rounded-xl p-8 w-100 flex flex-col gap-4">
        {/* Header */}
        <h2 className="text-white text-lg font-semibold">Create New Project</h2>

        {/* Error */}
        {error && (
          <ErrorBanner
            message={error}
            onDismiss={onErrorDismiss}
            variant="modal"
          />
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Title */}
          <FormField
            label="Project Title"
            required
            input={
              <input
                type="text"
                placeholder="e.g., The Lost Kingdom"
                value={title}
                onChange={e => onTitleChange(e.target.value)}
                disabled={loading}
              />
            }
          />

          {/* Description */}
          <FormField
            label="Description"
            input={
              <textarea
                placeholder="Brief synopsis of your story"
                value={description}
                onChange={e => onDescriptionChange(e.target.value)}
                disabled={loading}
                className="resize-none h-20"
              />
            }
          />

          {/* Genre */}
          <FormField
            label="Genre"
            required
            input={
              <select
                value={genre}
                onChange={e => onGenreChange(e.target.value)}
                disabled={loading}
              >
                <option value="">Select genre...</option>
                <option value="fantasy">Fantasy</option>
                <option value="scifi">Sci-Fi</option>
                <option value="horror">Horror</option>
                <option value="romance">Romance</option>
                <option value="mystery">Mystery</option>
                <option value="historical">Historical</option>
                <option value="urban-fantasy">Urban Fantasy</option>
                <option value="other">Other</option>
              </select>
            }
          />

          {/* Tone */}
          <FormField
            label="Tone"
            required
            input={
              <select
                value={tone}
                onChange={e => onToneChange(e.target.value)}
                disabled={loading}
              >
                <option value="">Select tone...</option>
                <option value="dark">Dark</option>
                <option value="heroic">Heroic</option>
                <option value="comedic">Comedic</option>
                <option value="tragic">Tragic</option>
                <option value="romantic">Romantic</option>
                <option value="philosophical">Philosophical</option>
                <option value="introspective">Introspective</option>
              </select>
            }
          />

          {/* Style */}
          <FormField
            label="Style"
            required
            input={
              <select
                value={style}
                onChange={e => onStyleChange(e.target.value)}
                disabled={loading}
              >
                <option value="">Select style...</option>
                <option value="first-person">First Person</option>
                <option value="third-person">Third Person</option>
                <option value="omniscient">Omniscient</option>
                <option value="literary">Literary</option>
                <option value="fast-paced">Fast-Paced</option>
                <option value="descriptive">Descriptive</option>
                <option value="dialogue-heavy">Dialogue-Heavy</option>
              </select>
            }
          />

          {/* Buttons */}
          <div className="flex gap-3 mt-2">
            <button
              type="submit"
              className="flex-1 bg-[#00A86B] text-white rounded-lg py-2 text-sm cursor-pointer hover:shadow-[0_0_12px_rgba(0,168,107,0.4)] transition-all disabled:opacity-50 font-semibold"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Project'}
            </button>
            <button
              type="button"
              className="flex-1 border border-[#1A3320] text-[#A8C5B0] rounded-lg py-2 text-sm cursor-pointer hover:border-[#00A86B] transition-colors disabled:opacity-50"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
          </div>

          <p className="text-[#A8C5B0] text-xs mt-2">* Required fields</p>
        </form>
      </div>
    </div>
  )
}

/**
 * FormField Component
 * Wrapper for label + input/select/textarea
 */
interface FormFieldProps {
  label: string
  required?: boolean
  input: React.ReactNode
}

const FormField = ({ label, required, input }: FormFieldProps) => {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[#A8C5B0] text-xs font-semibold">
        {label} {required && '*'}
      </label>
      <div className="[&>input], [&>select], [&>textarea] { bg-[#080D0A] border border-[#1A3320] rounded-lg px-4 py-2 text-white text-sm outline-none focus:border-[#00A86B] disabled:opacity-50 }">
        {input}
      </div>
    </div>
  )
}