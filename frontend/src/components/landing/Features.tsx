import { RootedBranch } from "./decorations";

export const Features = () => (
  <div className="max-w-[1180px] mx-auto px-6 md:px-8 pb-16 md:pb-24 relative z-10">
    <RootedBranch className="pointer-events-none absolute -right-16 top-10 hidden w-[16rem] rotate-12 text-amber-900 opacity-50 lg:block" />

    <div className="mb-10 md:mb-14 reveal">
      <span className="font-mono text-[10px] uppercase tracking-[0.26em] text-text-muted">
        The pipeline
      </span>
      <h2 className="font-serif text-[clamp(28px,3.5vw,48px)] font-medium text-text-primary mt-3">
        Six agents, <em className="italic text-emerald-800">one world.</em>
      </h2>
      <p className="text-base text-text-secondary mt-3">Each agent has a single job, and every draft passes through all six.</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 md:gap-8 items-center rounded-[2rem] bg-black/[0.04] p-2 ring-1 ring-black/[0.06] reveal">
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 md:gap-8 items-center rounded-[calc(2rem-0.5rem)] bg-surface-card px-6 py-8 md:px-10 md:py-10 relative overflow-hidden">
          <span className="pointer-events-none absolute -right-3 -top-8 select-none font-serif italic leading-none text-[6.5rem] text-black/[0.04]">
            00
          </span>
          <img src="/lorespring-assets/Emerald crystal tree of light.png" alt="Crystal Tree" className="w-16 md:w-[100px] h-16 md:h-[100px] object-contain relative z-[1]" />
          <div className="relative z-[1]">
            <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-text-muted">Always on</span>
            <h3 className="font-serif text-2xl font-medium text-text-primary mt-1.5 mb-2.5">Persistent Story Memory</h3>
            <p className="text-sm leading-[1.6] text-text-secondary max-w-lg">Every chapter feeds back into the graph. Names, places, and plot threads stay consistent across your entire storyworld.</p>
          </div>
        </div>
      </div>

      {[
        { n: '01', title: 'Writer Agent', desc: 'Generates a full draft from your project metadata, chapter direction, and prior story summaries.', icon: '/lorespring-assets/lorespring-logo.png', delay: 1 },
        { n: '02', title: 'Continuity Check', desc: 'Cross-references the draft against your established lore to catch contradictions before they ship.', icon: '/lorespring-assets/LoreSpring-leaves.png', delay: 2 },
        { n: '03', title: 'Revision Loop', desc: 'Scores the draft against quality thresholds and triggers rewrites until the bar is met.', icon: '/lorespring-assets/LoreSpring circle.png', delay: 1 },
        { n: '04', title: 'Summarizer', desc: 'Produces structured chapter summaries and plot memory for future context and recall.', icon: '/lorespring-assets/LoreSpring elements .png', delay: 2 },
      ].map((f) => (
        <div key={f.title} className={`rounded-[2rem] bg-black/[0.04] p-2 ring-1 ring-black/[0.06] reveal reveal-delay-${f.delay} group`}>
          <div className="rounded-[calc(2rem-0.5rem)] bg-surface-card px-6 py-8 md:px-8 md:py-10 relative overflow-hidden h-full transition-colors duration-500 group-hover:bg-white">
            <span className="pointer-events-none absolute -right-2 -top-6 select-none font-serif italic leading-none text-[4.5rem] text-black/[0.04]">
              {f.n}
            </span>
            <div className="w-11 h-11 rounded-full flex items-center justify-center mb-5 bg-emerald-700/8 transition-all duration-300 group-hover:bg-emerald-800 relative z-[1]">
              <img src={f.icon} alt="" className="w-[20px] h-[20px] object-contain" />
            </div>
            <h3 className="font-serif text-xl font-medium text-text-primary mb-2 relative z-[1]">{f.title}</h3>
            <p className="text-sm leading-[1.6] text-text-secondary relative z-[1]">{f.desc}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
)
