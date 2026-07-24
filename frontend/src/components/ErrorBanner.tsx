interface ErrorBannerProps {
  message: string
  onDismiss: () => void
  variant?: 'page' | 'modal'
}

export const ErrorBanner = ({ message, onDismiss, variant = 'page' }: ErrorBannerProps) => {
  if (variant === 'modal') {
    return (
      <div className="bg-red-900/20 border border-red-700 rounded px-3 py-2">
        <p className="text-red-300 text-xs">{message}</p>
      </div>
    )
  }
  return (
    <div className="bg-red-50 border-b border-red-200 px-6 py-3 flex items-center justify-between">
      <p className="text-red-600 text-sm">{message}</p>
      <button
        onClick={onDismiss}
        className="text-red-400 hover:text-red-600 text-xs font-semibold cursor-pointer"
      >
        Dismiss
      </button>
    </div>
  )
}
