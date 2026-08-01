const items = [
  'Writer Agent', 'Continuity Check', 'Revision Loop', 'Summarizer',
  'Human Review', 'Lore Keeper', 'Story Memory Graph', 'Persistent Lore',
]

export const Marquee = () => (
  <div className="overflow-hidden border-y border-border-subtle py-5 relative z-10 bg-emerald-700/[0.02]">
    <div className="flex w-max anim-marquee hover:[animation-play-state:paused]">
      {[...items, ...items].map((item, i) => (
        <span key={i} className="font-mono text-[11px] font-medium text-text-muted/60 uppercase tracking-[0.22em] px-10 whitespace-nowrap flex items-center gap-4">
          <span className="w-1 h-1 bg-emerald-500 rounded-full shrink-0" />
          {item}
        </span>
      ))}
    </div>
  </div>
)
