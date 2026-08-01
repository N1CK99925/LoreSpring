function ArrowLeft({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5" />
      <path d="M12 19l-7-7 7-7" />
    </svg>
  )
}

interface IslandNavProps {
  onNavigate: (path: string) => void
  variant?: 'full' | 'minimal'
}

export function IslandNav({ onNavigate, variant = 'full' }: IslandNavProps) {
  return (
    <nav className="fixed left-1/2 top-4 z-50 w-max max-w-[calc(100vw-1.5rem)] -translate-x-1/2 md:top-5">
      <div className="flex items-center gap-1.5 rounded-full border border-black/[0.07] bg-surface-card/80 py-2 pl-4 pr-2 shadow-[0_16px_50px_-28px_rgba(26,24,20,0.4)] backdrop-blur-2xl">
        <button
          className="flex cursor-pointer items-center gap-2.5 border-none bg-transparent no-underline"
          onClick={() => onNavigate('/')}
        >
          <img
            src="/lorespring-assets/lorespring-logo.png"
            alt="LoreSpring"
            className="h-7 w-7 object-contain md:h-8 md:w-8"
          />
          <span className="font-serif text-lg font-bold tracking-[0.06em] text-emerald-800 md:text-xl">
            LoreSpring
          </span>
        </button>

        {variant === 'full' && (
          <ul className="desktop-only flex items-center gap-1 list-none ml-2">
            {['Features', 'Docs'].map(item => (
              <li key={item}>
                <a
                  href={`#${item.toLowerCase()}`}
                  className="text-text-secondary no-underline text-[13px] font-medium px-3.5 py-2 rounded-full transition-all duration-250 hover:text-emerald-700 hover:bg-emerald-700/6"
                >
                  {item}
                </a>
              </li>
            ))}
            <li>
              <a
                href="/pipeline"
                onClick={(e) => { e.preventDefault(); onNavigate('/pipeline') }}
                className="text-text-secondary no-underline text-[13px] font-medium px-3.5 py-2 rounded-full transition-all duration-250 hover:text-emerald-700 hover:bg-emerald-700/6"
              >
                Pipeline
              </a>
            </li>
          </ul>
        )}

        {variant === 'full' ? (
          <button
            className="ml-1 bg-emerald-800 text-[#F7F4EC] border-none px-5 py-2 rounded-full text-xs md:text-[13px] font-medium cursor-pointer transition-all duration-250 hover:bg-emerald-700 hover:shadow-[0_8px_24px_-8px_rgba(5,150,105,0.4)]"
            onClick={() => onNavigate('/login')}
          >
            Get Started
          </button>
        ) : (
          <button
            aria-label="Back to home"
            onClick={() => onNavigate('/')}
            className="ml-1.5 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-black/[0.07] bg-white/60 text-text-secondary transition-colors duration-300 hover:bg-white hover:text-emerald-800"
          >
            <ArrowLeft />
          </button>
        )}
      </div>
    </nav>
  )
}
