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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white border border-[#c8e6cc] rounded-xl p-8 w-107.5 shadow-xl">
        {/* Header */}
        <h2 className="font-serif text-[21px] font-normal text-[#1a3320] mb-4">New Project</h2>

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
                className="w-full bg-[#eef6ef] border border-[#c8e6cc] rounded-lg px-4 py-2.5 text-[#1a3320] text-sm outline-none focus:border-[#8ec99a] focus:ring-2 focus:ring-[#0d8c4a]/10 transition-all disabled:opacity-50"
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
                rows={2}
                className="w-full bg-[#eef6ef] border border-[#c8e6cc] rounded-lg px-4 py-2.5 text-[#1a3320] text-sm outline-none focus:border-[#8ec99a] focus:ring-2 focus:ring-[#0d8c4a]/10 transition-all resize-none disabled:opacity-50"
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
                className="w-full bg-[#eef6ef] border border-[#c8e6cc] rounded-lg px-4 py-2.5 text-[#1a3320] text-sm outline-none focus:border-[#8ec99a] focus:ring-2 focus:ring-[#0d8c4a]/10 transition-all disabled:opacity-50"
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
                className="w-full bg-[#eef6ef] border border-[#c8e6cc] rounded-lg px-4 py-2.5 text-[#1a3320] text-sm outline-none focus:border-[#8ec99a] focus:ring-2 focus:ring-[#0d8c4a]/10 transition-all disabled:opacity-50"
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
                className="w-full bg-[#eef6ef] border border-[#c8e6cc] rounded-lg px-4 py-2.5 text-[#1a3320] text-sm outline-none focus:border-[#8ec99a] focus:ring-2 focus:ring-[#0d8c4a]/10 transition-all disabled:opacity-50"
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
              className="flex-1 bg-[#0d8c4a] text-white rounded-lg py-2.5 text-sm font-medium cursor-pointer hover:shadow-[0_4px_16px_rgba(13,140,74,0.3)] transition-all disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Project'}
            </button>
            <button
              type="button"
              className="flex-1 border border-[#c8e6cc] text-[#3d6b48] rounded-lg py-2.5 text-sm cursor-pointer hover:border-[#8ec99a] hover:bg-[#eef6ef] transition-colors disabled:opacity-50"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
          </div>

          <p className="text-[#6a9e72] text-xs mt-2">* Required fields</p>
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
    <div className="flex flex-col gap-1.5">
      <label className="text-[#3d6b48] text-xs font-medium">
        {label} {required && '*'}
      </label>
      {input}
    </div>
  )
}