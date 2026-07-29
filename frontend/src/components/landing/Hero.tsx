interface HeroProps {
  onNavigate?: (path: string) => void
}

export const Hero = ({ onNavigate }: HeroProps) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center px-6 md:px-12 py-[48px] md:py-[72px] pb-16 md:pb-24 max-w-[1400px] mx-auto relative z-10">
    <div className="max-w-[600px]">
      <div className="inline-flex items-center gap-2 bg-emerald-700/8 border border-emerald-700/20 rounded-full px-4 py-1.5 text-xs font-medium text-emerald-700 mb-7 anim-pulse-glow hero-enter">
        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full anim-float" />
        AI story engine
      </div>
      <h1 className="font-serif text-[clamp(36px,8vw,88px)] md:text-[clamp(52px,6vw,88px)] font-bold leading-[1.02] text-text-primary mb-7 tracking-[-0.02em] hero-enter hero-enter-delay-1">
        Stories that <em className="italic text-emerald-700 transition-colors duration-300 hover:text-emerald-500">remember</em> themselves
      </h1>
      <p className="text-base md:text-lg leading-7 text-text-secondary max-w-[480px] mb-8 md:mb-10 hero-enter hero-enter-delay-2">
        LoreSpring generates narrative chapters with an LLM-driven agent pipeline. Every draft is continuity-checked, revised, and woven into a persistent story memory graph.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center hero-enter hero-enter-delay-3">
        <button className="w-full sm:w-auto bg-emerald-700 text-white border-none px-8 md:px-9 py-3.5 md:py-4 rounded-md text-sm md:text-[15px] font-semibold cursor-pointer uppercase tracking-[0.04em] transition-all duration-250 hover:bg-emerald-600 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(5,150,105,0.25)] active:scale-[0.97]"
          onClick={() => onNavigate?.('/register')}>
          Start Writing
        </button>
        <button className="w-full sm:w-auto bg-transparent text-text-secondary border-[1.5px] border-black/12 px-8 md:px-9 py-3.5 md:py-4 rounded-md text-sm md:text-[15px] font-medium cursor-pointer transition-all duration-250 hover:border-emerald-600 hover:text-emerald-700 hover:-translate-y-0.5"
          onClick={() => onNavigate?.('/pipeline')}>
          View the Pipeline
        </button>
      </div>
    </div>
    <div className="relative flex items-center justify-center md:block">
      <div className="relative w-full max-w-[400px] md:max-w-[520px] mx-auto">
        <div className="absolute inset-[-15%] bg-[radial-gradient(circle,rgba(5,150,105,0.1)_0%,transparent_60%)] rounded-full blur-[40px] anim-float-slow" />
        <div className="relative z-[2] anim-hero-image">
          <img src="/lorespring-assets/Emerald crystal tree of light.png" alt="Emerald Crystal Tree"
            className="w-full h-auto drop-shadow-[0_20px_40px_rgba(5,150,105,0.1)]" />
        </div>
        <img src="/lorespring-assets/wand.png" alt=""
          className="absolute -top-8 -right-8 w-28 md:w-40 h-28 md:h-40 object-contain opacity-60 z-[1] anim-drift" />
        <img src="/lorespring-assets/LoreSpring-leaves.png" alt=""
          className="absolute -bottom-5 -left-5 w-16 md:w-[100px] h-16 md:h-[100px] object-contain opacity-50 z-[1] anim-drift-delayed" />
      </div>
    </div>
  </div>
)
