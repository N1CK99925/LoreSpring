interface CtaSectionProps {
  onNavigate?: (path: string) => void
}

export const CtaSection = ({ onNavigate }: CtaSectionProps) => (
  <div className="relative z-10 px-6 md:px-12 pb-20 md:pb-30">
    <div className="max-w-[900px] mx-auto text-center py-12 md:py-20 px-6 md:px-12 border-2 border-emerald-700/12 rounded-lg relative overflow-hidden bg-surface-card transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-emerald-700/30 hover:shadow-[0_20px_60px_rgba(5,150,105,0.08)] reveal">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-linear-to-r from-transparent via-emerald-500 to-transparent" />
      <img src="/lorespring-assets/LoreSpring-border.png" alt=""
        className="absolute -bottom-2.5 -left-2.5 w-[120px] h-[120px] object-contain opacity-20 rotate-180 transition-opacity duration-[400ms] hover:opacity-[0.35]" />
      <img src="/lorespring-assets/LoreSpring-border.png" alt=""
        className="absolute -top-2.5 -right-2.5 w-[120px] h-[120px] object-contain opacity-20  transition-opacity duration-[400ms] hover:opacity-[0.35]" />
      <h2 className="font-serif text-[clamp(28px,3vw,40px)] font-bold text-text-primary mb-4">
        Ready to build your world?
      </h2>
      <p className="text-base text-text-muted mb-9 max-w-[480px] mx-auto">
        Create your first project, set a direction, and watch the agents bring your story to life.
      </p>
      <button className="bg-emerald-700 text-white border-none px-9 py-4 rounded-md text-[15px] font-semibold cursor-pointer uppercase tracking-[0.04em] transition-all duration-250 hover:bg-emerald-600 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(5,150,105,0.25)] active:scale-[0.97]"
        onClick={() => onNavigate?.('/register')}>
        Get Started
      </button>
    </div>
  </div>
)
