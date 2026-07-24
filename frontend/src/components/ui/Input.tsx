interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = ({ label, error, className = '', ...props }: InputProps) => (
  <div className="flex flex-col gap-1.5">
    {label && (
      <label className="text-text-secondary text-xs font-medium">{label}</label>
    )}
    <input
      className={`bg-surface-muted border border-border-subtle rounded-lg px-4 py-2.5 text-text-primary text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-700/10 transition-all disabled:opacity-50 ${error ? 'border-red-400' : ''} ${className}`}
      {...props}
    />
    {error && <p className="text-red-500 text-xs">{error}</p>}
  </div>
)

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = ({ label, error, className = '', ...props }: TextareaProps) => (
  <div className="flex flex-col gap-1.5">
    {label && (
      <label className="text-text-secondary text-xs font-medium">{label}</label>
    )}
    <textarea
      className={`bg-surface-muted border border-border-subtle rounded-lg px-4 py-2.5 text-text-primary text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-700/10 transition-all resize-none disabled:opacity-50 ${error ? 'border-red-400' : ''} ${className}`}
      {...props}
    />
    {error && <p className="text-red-500 text-xs">{error}</p>}
  </div>
)

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  children: React.ReactNode
}

export const Select = ({ label, error, className = '', children, ...props }: SelectProps) => (
  <div className="flex flex-col gap-1.5">
    {label && (
      <label className="text-text-secondary text-xs font-medium">{label}</label>
    )}
    <select
      className={`bg-surface-muted border border-border-subtle rounded-lg px-4 py-2.5 text-text-primary text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-700/10 transition-all disabled:opacity-50 ${error ? 'border-red-400' : ''} ${className}`}
      {...props}
    >
      {children}
    </select>
    {error && <p className="text-red-500 text-xs">{error}</p>}
  </div>
)
