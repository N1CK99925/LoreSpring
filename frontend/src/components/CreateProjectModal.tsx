import { ErrorBanner } from './ErrorBanner'

interface CreateProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (title: string, description: string, genre: string, tone: string, style: string) => Promise<void>
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
  loading: boolean
  error: string
  onErrorDismiss: () => void
}

export const CreateProjectModal = ({
  isOpen, onClose, onSubmit,
  title, onTitleChange,
  description, onDescriptionChange,
  genre, onGenreChange,
  tone, onToneChange,
  style, onStyleChange,
  loading, error, onErrorDismiss
}: CreateProjectModalProps) => {
  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(title, description, genre, tone, style)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-surface-card border border-border-subtle rounded-xl p-6 md:p-8 w-full max-w-[430px] mx-4 md:mx-0 shadow-xl">
        <h2 className="font-serif text-[21px] font-normal text-text-primary mb-4">New Project</h2>
        {error && (
          <ErrorBanner message={error} onDismiss={onErrorDismiss} variant="modal" />
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-text-secondary text-xs font-medium">Project Title *</label>
            <input type="text" placeholder="e.g., The Lost Kingdom" value={title}
              onChange={e => onTitleChange(e.target.value)} disabled={loading}
              className="w-full bg-surface-muted border border-border-subtle rounded-lg px-4 py-2.5 text-text-primary text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-700/10 transition-all disabled:opacity-50" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-text-secondary text-xs font-medium">Description</label>
            <textarea placeholder="Brief synopsis of your story" value={description}
              onChange={e => onDescriptionChange(e.target.value)} disabled={loading} rows={2}
              className="w-full bg-surface-muted border border-border-subtle rounded-lg px-4 py-2.5 text-text-primary text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-700/10 transition-all resize-none disabled:opacity-50" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-text-secondary text-xs font-medium">Genre *</label>
            <select value={genre} onChange={e => onGenreChange(e.target.value)} disabled={loading}
              className="w-full bg-surface-muted border border-border-subtle rounded-lg px-4 py-2.5 text-text-primary text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-700/10 transition-all disabled:opacity-50">
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
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-text-secondary text-xs font-medium">Tone *</label>
            <select value={tone} onChange={e => onToneChange(e.target.value)} disabled={loading}
              className="w-full bg-surface-muted border border-border-subtle rounded-lg px-4 py-2.5 text-text-primary text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-700/10 transition-all disabled:opacity-50">
              <option value="">Select tone...</option>
              <option value="dark">Dark</option>
              <option value="heroic">Heroic</option>
              <option value="comedic">Comedic</option>
              <option value="tragic">Tragic</option>
              <option value="romantic">Romantic</option>
              <option value="philosophical">Philosophical</option>
              <option value="introspective">Introspective</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-text-secondary text-xs font-medium">Style *</label>
            <select value={style} onChange={e => onStyleChange(e.target.value)} disabled={loading}
              className="w-full bg-surface-muted border border-border-subtle rounded-lg px-4 py-2.5 text-text-primary text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-700/10 transition-all disabled:opacity-50">
              <option value="">Select style...</option>
              <option value="first-person">First Person</option>
              <option value="third-person">Third Person</option>
              <option value="omniscient">Omniscient</option>
              <option value="literary">Literary</option>
              <option value="fast-paced">Fast-Paced</option>
              <option value="descriptive">Descriptive</option>
              <option value="dialogue-heavy">Dialogue-Heavy</option>
            </select>
          </div>
          <div className="flex gap-3 mt-2">
            <button type="submit" className="flex-1 bg-emerald-700 text-white rounded-lg py-2.5 text-sm font-medium cursor-pointer hover:shadow-[0_4px_16px_rgba(13,140,74,0.3)] transition-all disabled:opacity-50" disabled={loading}>
              {loading ? 'Creating...' : 'Create Project'}
            </button>
            <button type="button" className="flex-1 border border-border-subtle text-text-secondary rounded-lg py-2.5 text-sm cursor-pointer hover:border-emerald-500 hover:bg-surface-muted transition-colors disabled:opacity-50" onClick={onClose} disabled={loading}>
              Cancel
            </button>
          </div>
          <p className="text-text-muted text-xs mt-2">* Required fields</p>
        </form>
      </div>
    </div>
  )
}
