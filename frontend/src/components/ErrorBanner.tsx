interface ErrorBannerProps {
  message: string
  onDismiss: () => void
  variant?: 'page' | 'modal'
}

/**
 * ErrorBanner Component
 * 
 * Displays error messages in a styled banner
 * 
 * Props:
 * - message: Error text to display
 * - onDismiss: Callback when user clicks dismiss
 * - variant: 'page' = full width, 'modal' = inline (default: 'page')
 */
export const ErrorBanner = ({ message, onDismiss, variant = 'page' }: ErrorBannerProps) => {
  if (variant === 'modal') {
    return (
      <div className="bg-red-900/20 border border-red-700 rounded px-3 py-2">
        <p className="text-red-300 text-xs">{message}</p>
      </div>
    )
  }

  // Page variant (full width)
  return (
    <div className="bg-red-900/20 border-b border-red-700 px-6 py-3 flex items-center justify-between">
      <p className="text-red-300 text-sm">{message}</p>
      <button
        onClick={onDismiss}
        className="text-red-400 hover:text-red-300 text-xs font-semibold"
      >
        Dismiss
      </button>
    </div>
  )
}