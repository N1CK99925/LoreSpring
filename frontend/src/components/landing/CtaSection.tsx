import { ContourLines } from './decorations'

function ArrowUpRight({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 17L17 7" />
      <path d="M8 7h9v9" />
    </svg>
  )
}

interface CtaSectionProps {
  onNavigate?: (path: string) => void
}

export const CtaSection = ({ onNavigate }: CtaSectionProps) => (
  <div className="relative z-10 px-6 md:px-8 pb-20 md:pb-32">
    <div className="max-w-[820px] mx-auto reveal">
      <div className="rounded-[2rem] bg-black/[0.05] p-2 ring-1 ring-black/[0.06] shadow-[0_30px_70px_-38px_rgba(26,24,20,0.4)]">
        <div className="relative overflow-hidden rounded-[calc(2rem-0.5rem)] bg-surface-card px-8 py-16 md:px-16 md:py-20 text-center">
          <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
          <ContourLines className="pointer-events-none absolute inset-x-0 bottom-0 h-32 w-full opacity-70" />
          <span className="pointer-events-none absolute -right-4 -top-10 select-none font-serif italic leading-none text-[8rem] text-black/[0.04]">
            05
          </span>

          <span className="font-mono text-[10px] uppercase tracking-[0.26em] text-text-muted">
            A new world
          </span>
          <h2 className="font-serif text-[clamp(28px,3vw,44px)] font-medium text-text-primary mt-4 mb-4">
            Ready to build <em className="italic text-emerald-800">your world?</em>
          </h2>
          <p className="text-base text-text-secondary mb-10 max-w-[440px] mx-auto">
            Create your first project, set a direction, and watch the agents bring your story to life.
          </p>

          <button
            className="group mx-auto flex w-max items-center justify-between gap-8 rounded-full bg-emerald-800 py-3.5 pl-8 pr-3 text-[15px] font-medium text-[#F7F4EC] cursor-pointer border-none transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-emerald-700 hover:shadow-[0_18px_50px_-18px_rgba(5,150,105,0.55)] active:scale-[0.98]"
            onClick={() => onNavigate?.('/register')}
          >
            Get Started
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:scale-105">
              <ArrowUpRight className="text-[#F7F4EC]/90" />
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
)
