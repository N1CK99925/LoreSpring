export const Features = () => (
  <div className="max-w-[1400px] mx-auto px-6 md:px-12 pb-16 md:pb-24 relative z-10">
    <div className="mb-10 md:mb-14 reveal">
      <h2 className="font-serif text-[clamp(28px,3.5vw,48px)] font-bold text-text-primary">
        The pipeline that builds your world
      </h2>
      <p className="text-base text-text-muted mt-3">Six agents working in sequence, each with a single job.</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 md:gap-8 items-center bg-surface-muted border border-emerald-700/15 rounded-xl p-6 md:p-10 transition-all duration-[350ms] reveal relative overflow-hidden group">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-linear-to-r from-transparent via-emerald-500 to-transparent opacity-0 transition-opacity duration-[350ms] group-hover:opacity-100" />
        <img src="/lorespring-assets/Emerald crystal tree of light.png" alt="Crystal Tree" className="w-16 md:w-[100px] h-16 md:h-[100px] object-contain" />
        <div>
          <h3 className="font-serif text-[22px] font-bold text-text-primary mb-2.5">Persistent Story Memory</h3>
          <p className="text-sm leading-[1.6] text-text-secondary">Every chapter feeds back into the graph. Names, places, and plot threads stay consistent across your entire storyworld.</p>
        </div>
      </div>

      {[
        { title: 'Writer Agent', desc: 'Generates a full draft from your project metadata, chapter direction, and prior story summaries.', icon: '/lorespring-assets/lorespring-logo.png', delay: 1 },
        { title: 'Continuity Check', desc: 'Cross-references the draft against your established lore to catch contradictions before they ship.', icon: '/lorespring-assets/LoreSpring-leaves.png', delay: 2 },
        { title: 'Revision Loop', desc: 'Scores the draft against quality thresholds and triggers rewrites until the bar is met.', icon: '/lorespring-assets/LoreSpring circle.png', delay: 1 },
        { title: 'Summarizer', desc: 'Produces structured chapter summaries and plot memory for future context and recall.', icon: '/lorespring-assets/LoreSpring elements .png', delay: 2 },
      ].map((f) => (
        <div key={f.title} className={`bg-surface-card border border-border-subtle rounded-xl p-6 md:p-10 transition-all duration-[350ms] reveal reveal-delay-${f.delay} relative overflow-hidden group`}>
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-linear-to-r from-transparent via-emerald-500 to-transparent opacity-0 transition-opacity duration-[350ms] group-hover:opacity-100" />
          <div className="w-11 h-11 rounded-[10px] flex items-center justify-center mb-5 bg-emerald-700/8 transition-all duration-300 group-hover:bg-emerald-700 group-hover:scale-105">
            <img src={f.icon} alt="" className="w-[22px] h-[22px] object-contain" />
          </div>
          <h3 className="font-serif text-[22px] font-bold text-text-primary mb-2.5">{f.title}</h3>
          <p className="text-sm leading-[1.6] text-text-secondary">{f.desc}</p>
        </div>
      ))}
    </div>
  </div>
)
