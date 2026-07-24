interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'outline' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = ({ variant = 'primary', size = 'md', className = '', children, ...props }: ButtonProps) => {
  const base = 'font-medium cursor-pointer transition-all duration-250 ease-[cubic-bezier(0.16,1,0.3,1)] disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary: 'bg-emerald-700 text-white hover:bg-emerald-600 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(5,150,105,0.25)] active:scale-[0.97]',
    ghost: 'bg-transparent text-text-secondary border-[1.5px] border-black/12 hover:border-emerald-600 hover:text-emerald-700 hover:-translate-y-0.5',
    outline: 'bg-transparent text-emerald-700 border-[1.5px] border-emerald-700 hover:bg-emerald-700 hover:text-white hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(5,150,105,0.2)]',
    danger: 'bg-red-50 border border-red-200 text-red-600 hover:bg-red-100',
  }

  const sizes = {
    sm: 'px-4 py-2 text-xs rounded-md',
    md: 'px-6 py-2.5 text-sm rounded-md',
    lg: 'px-9 py-4 text-[15px] rounded-md uppercase tracking-[0.04em]',
  }

  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  )
}
