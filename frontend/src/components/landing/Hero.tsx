import { Constellation } from "./decorations"

function ArrowUpRight({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 17L17 7" />
      <path d="M8 7h9v9" />
    </svg>
  )
}

interface HeroProps {
  onNavigate?: (path: string) => void
}

export const Hero = ({ onNavigate }: HeroProps) => (
  <div className="relative mx-auto grid w-full max-w-[1180px] grid-cols-1 gap-14 px-4 pb-20 pt-28 md:px-8 md:pt-40 lg:min-h-[92vh] lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-24 lg:pb-24">

    {/* Editorial left */}
    <div className="relative flex flex-col justify-center">
      <Constellation className="pointer-events-none absolute -left-12 bottom-0 hidden w-[22rem] -rotate-6 text-amber-900 opacity-60 lg:block" />

      <div className="relative">
        <span className="reveal-lift inline-flex w-max items-center gap-2 rounded-full border border-black/[0.08] bg-white/50 px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-text-muted">
          <span className="h-1 w-1 rounded-full bg-emerald-700 anim-float" />
          AI story engine
        </span>

        <div className="reveal-lift reveal-delay-1 mt-8 h-px w-10 bg-emerald-800/40" />

        <h1 className="reveal-lift reveal-delay-1 mt-6 max-w-2xl font-serif font-medium leading-[0.95] tracking-[-0.015em] text-text-primary text-[42px] sm:text-6xl md:text-7xl lg:text-[5rem]">
          Stories that <em className="italic text-emerald-800">remember</em> themselves.
        </h1>

        <p className="reveal-lift reveal-delay-2 mt-7 max-w-md text-[15px] leading-relaxed text-text-secondary md:text-base">
          LoreSpring generates narrative chapters with an LLM-driven agent pipeline. Every draft is continuity-checked, revised, and woven into a persistent story memory graph.
        </p>

        <div className="reveal-lift reveal-delay-3 mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center">
          <button
            className="group flex items-center justify-between gap-6 rounded-full bg-emerald-800 py-3 pl-7 pr-3 text-[15px] font-medium text-[#F7F4EC] cursor-pointer border-none transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-emerald-700 hover:shadow-[0_18px_50px_-18px_rgba(5,150,105,0.55)] active:scale-[0.98]"
            onClick={() => onNavigate?.('/register')}
          >
            Start Writing
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:scale-105">
              <ArrowUpRight className="text-[#F7F4EC]/90" />
            </span>
          </button>
          <button
            className="group flex items-center justify-between gap-6 rounded-full border border-black/[0.1] bg-white/40 py-3 pl-7 pr-3 text-[15px] font-medium text-text-primary cursor-pointer transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-emerald-800/25 hover:bg-white hover:shadow-[0_16px_45px_-22px_rgba(26,24,20,0.35)] active:scale-[0.98]"
            onClick={() => onNavigate?.('/pipeline')}
          >
            View the Pipeline
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black/[0.05] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:scale-105 group-hover:bg-emerald-800">
              <ArrowUpRight className="text-text-muted transition-colors duration-500 group-hover:text-white" />
            </span>
          </button>
        </div>

        <div className="reveal-lift reveal-delay-3 mt-14 hidden items-center gap-3 lg:flex">
          <span className="font-mono text-[9px] uppercase tracking-[0.26em] text-text-muted">
            Your world, remembered
          </span>
          <span className="h-px w-16 bg-black/[0.08]" />
        </div>
      </div>
    </div>

    {/* Right — framed art panel, same bezel treatment as the auth card */}
    <div className="reveal-lift reveal-delay-2 w-full lg:w-[440px]">
      <div className="rounded-[2rem] bg-black/[0.05] p-2 ring-1 ring-black/[0.06] shadow-[0_30px_70px_-38px_rgba(26,24,20,0.4)]">
        <div className="relative overflow-hidden rounded-[calc(2rem-0.5rem)] bg-surface-card px-8 py-14 md:px-10">
          <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
          <span className="pointer-events-none absolute -right-3 -top-8 select-none font-serif italic leading-none text-[6.5rem] text-black/[0.04]">
            01
          </span>

          <div className="relative flex items-center justify-center">
            <div className="absolute inset-[-15%] bg-[radial-gradient(circle,rgba(5,150,105,0.1)_0%,transparent_60%)] rounded-full blur-[40px] anim-float-slow" />
            <div className="relative z-[2] anim-hero-image w-full max-w-[320px]">
              <img src="/lorespring-assets/Emerald crystal tree of light.png" alt="Emerald Crystal Tree"
                className="w-full h-auto drop-shadow-[0_20px_40px_rgba(5,150,105,0.1)]" />
            </div>
            <img src="/lorespring-assets/wand.png" alt=""
              className="absolute -top-4 -right-2 w-24 md:w-32 h-24 md:h-32 object-contain opacity-60 z-[1] anim-drift" />
            <img src="/lorespring-assets/LoreSpring-leaves.png" alt=""
              className="absolute -bottom-2 -left-2 w-14 md:w-20 h-14 md:h-20 object-contain opacity-50 z-[1] anim-drift-delayed" />
          </div>

          <p className="relative mt-8 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">
            Every chapter, remembered
          </p>
        </div>
      </div>
    </div>
  </div>
)
