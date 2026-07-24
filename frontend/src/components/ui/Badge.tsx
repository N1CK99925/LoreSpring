interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'dot' | 'status'
  className?: string
}

export const Badge = ({ children, variant = 'default', className = '' }: BadgeProps) => {
  const base = 'inline-flex items-center gap-2 rounded-full font-medium text-xs'

  const variants = {
    default: 'bg-emerald-700/8 border border-emerald-700/20 text-emerald-700 px-4 py-1.5 text-[11px] tracking-[0.2em] uppercase',
    dot: 'bg-emerald-700/8 border border-emerald-700/20 text-emerald-700 px-4 py-1.5 text-xs anim-pulse-glow',
    status: 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-700 px-2 py-0.5 text-[10px]',
  }

  return (
    <span className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}
