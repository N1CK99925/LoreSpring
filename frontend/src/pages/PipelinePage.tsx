import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useReveal } from '../hooks/useReveal'

/* ──────────────────────────────────────────────
   Agent data
   ────────────────────────────────────────────── */

interface AgentData {
  id: string
  name: string
  role: string
  description: string
  color: string
  stage: string
}

const agents: Record<string, AgentData> = {
  input: {
    id: 'input',
    name: 'Story Input',
    role: 'Source',
    description: 'Project metadata, chapter direction, and accumulated story summaries provide the raw narrative material.',
    color: '#8a857d',
    stage: '01',
  },
  writer: {
    id: 'writer',
    name: 'Writer Agent',
    role: 'Generation',
    description: 'Generates a full narrative draft from project metadata, direction, and retrieved summaries.',
    color: '#10b981',
    stage: '02',
  },
  continuity: {
    id: 'continuity',
    name: 'Continuity Check',
    role: 'Validation',
    description: 'Cross-references every sentence against established lore. Catches contradictions before they ship.',
    color: '#34d399',
    stage: '03',
  },
  revision: {
    id: 'revision',
    name: 'Revision Loop',
    role: 'Quality',
    description: 'Scores the draft against quality thresholds. Triggers iterative rewrites until the bar is met.',
    color: '#059669',
    stage: '04',
  },
  summarizer: {
    id: 'summarizer',
    name: 'Summarizer',
    role: 'Memory',
    description: 'Produces structured chapter summaries and extracts plot entities for future context.',
    color: '#047857',
    stage: '05',
  },
  memory: {
    id: 'memory',
    name: 'The Story Graph',
    role: 'Persistent Layer',
    description: 'A Neo4j knowledge graph storing every character, location, relationship, and plot thread. Grows richer with each chapter, providing long-term continuity.',
    color: '#b08947',
    stage: '06',
  },
}

const pipelineOrder = ['input', 'writer', 'continuity', 'revision', 'summarizer']

const ease = 'ease-[cubic-bezier(0.16,1,0.3,1)]'

/* ──────────────────────────────────────────────
   Icons
   ────────────────────────────────────────────── */

function ArrowUpRight({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 17L17 7" />
      <path d="M8 7h9v9" />
    </svg>
  )
}

function ArrowUp() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19V5" />
      <path d="M5 12l7-7 7 7" />
    </svg>
  )
}

/* ──────────────────────────────────────────────
   Nav — floating glass island + full overlay menu
   ────────────────────────────────────────────── */

const menuLinks = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'The Pipeline', to: '/pipeline' },
  { label: 'Get Started', to: '/register' },
]

function IslandNav({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)

  const openMenu = useCallback(() => {
    setMounted(true)
    requestAnimationFrame(() => setOpen(true))
  }, [])

  const close = useCallback(() => {
    if (!open) return
    setOpen(false)
    window.setTimeout(() => setMounted(false), 650)
  }, [open])

  useEffect(() => {
    if (!mounted) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mounted, open, close])

  useEffect(() => {
    if (mounted) {
      document.body.style.overflow = open ? 'hidden' : ''
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [mounted, open])

  const toggle = () => (mounted ? close() : openMenu())

  const go = (path: string) => {
    onNavigate(path)
    close()
  }

  return (
    <>
      <nav className="fixed left-1/2 top-4 md:top-5 z-50 w-max max-w-[calc(100vw-1.5rem)] -translate-x-1/2">
        <div className="flex items-center justify-between gap-5 md:gap-8 rounded-full border border-black/[0.07] bg-[#FDFBF7]/80 py-2 pl-4 pr-2 shadow-[0_16px_50px_-28px_rgba(26,24,20,0.4)] backdrop-blur-2xl">
          <button
            className="flex items-center gap-2.5 no-underline cursor-pointer bg-transparent border-none"
            onClick={() => go('/dashboard')}
          >
            <img
              src="/lorespring-assets/lorespring-logo.png"
              alt="LoreSpring"
              className="w-7 h-7 md:w-8 md:h-8 object-contain"
            />
            <span className="font-serif text-lg md:text-xl font-bold text-emerald-800 tracking-[0.06em]">
              LoreSpring
            </span>
          </button>

          <div className="hidden md:flex items-center gap-1">
            <button
              className="cursor-pointer bg-transparent border-none text-[13px] font-medium text-[#6B6559] px-4 py-2 rounded-full transition-colors duration-300 hover:text-emerald-800 hover:bg-emerald-800/[0.06]"
              onClick={() => go('/dashboard')}
            >
              Dashboard
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="group hidden md:flex items-center gap-2 rounded-full bg-emerald-800 py-2 pl-5 pr-2 text-[13px] font-medium text-[#F7F4EC] cursor-pointer border-none transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-emerald-700 hover:shadow-[0_14px_40px_-14px_rgba(5,150,105,0.55)] active:scale-[0.97]"
              onClick={() => go('/register')}
            >
              Get Started
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:scale-105">
                <ArrowUpRight className="text-[#F7F4EC]/90" />
              </span>
            </button>

            <button
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              onClick={toggle}
              className="relative h-9 w-9 cursor-pointer rounded-full border border-black/[0.07] bg-white/60 transition-colors duration-300 hover:bg-white"
            >
              <span
                className={`absolute left-1/2 top-1/2 h-px w-4 -translate-x-1/2 -translate-y-[3px] bg-[#221D14] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${open ? 'translate-y-0 rotate-45' : ''}`}
              />
              <span
                className={`absolute left-1/2 top-1/2 h-px w-4 -translate-x-1/2 translate-y-[3px] bg-[#221D14] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${open ? 'translate-y-0 -rotate-45' : ''}`}
              />
            </button>
          </div>
        </div>
      </nav>

      {mounted && (
        <div className={`fixed inset-0 z-40 ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
          <div
            className={`absolute inset-0 bg-[#F3EDDF]/85 backdrop-blur-3xl transition-opacity duration-600 ${ease} ${open ? 'opacity-100' : 'opacity-0'}`}
            onClick={close}
          />
          <div className="relative flex h-full flex-col items-center justify-center gap-3 px-6">
            {menuLinks.map((link, i) => (
              <button
                key={link.label}
                onClick={() => go(link.to)}
                className={`cursor-pointer bg-transparent border-none text-center font-serif text-4xl md:text-6xl font-medium text-[#221D14] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-emerald-800 hover:italic ${open ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0 blur-sm'}`}
                style={{ transitionDelay: open ? `${140 + i * 100}ms` : '0ms' }}
              >
                {link.label}
              </button>
            ))}
            <p
              className={`absolute bottom-8 left-0 right-0 text-center font-mono text-[10px] uppercase tracking-[0.24em] text-[#8A857D] transition-all duration-700 ${ease} ${open ? 'opacity-100' : 'opacity-0'}`}
              style={{ transitionDelay: open ? '520ms' : '0ms' }}
            >
              LoreSpring — narrative engineering
            </p>
          </div>
        </div>
      )}
    </>
  )
}

/* ──────────────────────────────────────────────
   Components
   ────────────────────────────────────────────── */

function AgentCard({ agent, index }: { agent: AgentData; index: number }) {
  const offset = index % 2 === 0 ? 'lg:ml-20' : 'lg:mr-20'
  const tilt = index % 2 === 0 ? 'lg:rotate-[1.5deg]' : 'lg:rotate-[-1.5deg]'

  return (
    <div className={`relative reveal-lift reveal-delay-${(index % 5) + 1} ${offset} hover:z-30`}>
      <div
        className={`group/card relative ${tilt} transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:rotate-0 hover:-translate-y-1.5`}
      >
        <div className="relative rounded-[2rem] p-1.5 bg-[#EAE3D3]/80 ring-1 ring-black/[0.07] shadow-[0_30px_70px_-38px_rgba(26,24,20,0.4)] transition-shadow duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover/card:shadow-[0_45px_95px_-40px_rgba(26,24,20,0.5)]">
          <div className="relative overflow-hidden rounded-[calc(2rem-0.375rem)] bg-[#FDFBF7] px-7 py-8 md:px-9 md:py-10">
            <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
            <span className="pointer-events-none absolute -right-3 -top-8 select-none font-serif italic leading-none text-[6.5rem] text-black/[0.04]">
              {agent.stage}
            </span>

            <div className="relative mb-5 flex items-center gap-3">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: agent.color }} />
              <span
                className="text-[10px] font-semibold uppercase tracking-[0.22em]"
                style={{ color: agent.color }}
              >
                {agent.role}
              </span>
            </div>

            <h3 className="relative font-serif text-[26px] md:text-3xl font-semibold tracking-tight text-[#221D14] mb-3">
              {agent.name}
            </h3>

            <p className="relative max-w-xl text-sm md:text-[15px] leading-relaxed text-[#6B6559]">
              {agent.description}
            </p>

            <div className="relative mt-7 flex items-center justify-between border-t border-black/[0.06] pt-5">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#A49C8B]">
                Stage {agent.stage}
              </span>
              <span className="flex items-center gap-1.5 text-[11px] font-medium text-[#8A857D] opacity-0 translate-x-2 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover/card:translate-x-0 group-hover/card:opacity-100">
                Into the flow
                <ArrowUpRight className="text-emerald-700" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StageConnector({ label }: { label?: string }) {
  return (
    <div className="relative z-0 flex flex-col items-center py-4 lg:py-5">
      <div className="h-8 lg:h-11 w-px bg-gradient-to-b from-black/[0.05] to-black/[0.15]" />
      <span className="mt-2 flex h-2.5 w-2.5 rotate-45 items-center justify-center border border-emerald-800/40 bg-emerald-800/10 transition-transform duration-500" />
      {label && (
        <span className="mt-3 font-mono text-[9px] uppercase tracking-[0.26em] text-[#A49C8B]">
          {label}
        </span>
      )}
    </div>
  )
}

function Constellation({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 400 300"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M40 44L112 82M112 82L72 150M112 82L182 118M182 118L224 208M182 118L300 68M224 208L282 240M300 68L342 158M342 158L282 240" className="text-amber-900/25" />
      <path d="M96 60L182 118M182 118L336 96" className="text-emerald-800/25" />
      <circle cx="40" cy="44" r="3" className="fill-amber-800/40" />
      <circle cx="112" cy="82" r="3" className="fill-amber-800/50" />
      <circle cx="72" cy="150" r="2" className="fill-amber-800/40" />
      <circle cx="182" cy="118" r="3.5" className="fill-emerald-700/50" />
      <circle cx="224" cy="208" r="2.5" className="fill-emerald-700/40" />
      <circle cx="300" cy="68" r="3" className="fill-amber-800/40" />
      <circle cx="342" cy="158" r="2.5" className="fill-amber-800/40" />
      <circle cx="282" cy="240" r="2" className="fill-emerald-700/40" />
      <circle cx="96" cy="60" r="1.5" className="fill-emerald-700/40" />
      <circle cx="336" cy="96" r="1.5" className="fill-amber-800/30" />
    </svg>
  )
}

function MemoryLayer() {
  const memory = agents.memory
  const stats = [
    { tag: '01 · Entities', text: 'Characters, locations & plot threads — indexed as they appear.' },
    { tag: '02 · Persistence', text: 'Neo4j-backed. Memory survives across every chapter you publish.' },
    { tag: '03 · Fidelity', text: 'Zero drift. Contradictions are caught before they ever ship.' },
  ]

  return (
    <div className="reveal-lift reveal-delay-3 relative mt-20 md:mt-28">
      <div className="relative rounded-[2.5rem] p-2 bg-gradient-to-br from-amber-900/[0.14] via-black/[0.05] to-emerald-900/[0.12] ring-1 ring-black/[0.07] shadow-[0_60px_140px_-70px_rgba(26,24,20,0.5)]">
        <div className="relative overflow-hidden rounded-[calc(2.5rem-0.5rem)] bg-[#FAF5E8] px-7 py-10 md:px-14 md:py-14">
          <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-amber-200 to-transparent" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_80%_at_85%_20%,rgba(176,137,71,0.08),transparent_60%)]" />
          <Constellation className="pointer-events-none absolute -right-8 top-1/2 hidden w-[26rem] -translate-y-1/2 text-amber-900 md:block opacity-70" />

          <div className="relative md:max-w-[58%]">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: memory.color }} />
              <span className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: memory.color }}>
                {memory.role}
              </span>
            </div>

            <h3 className="mt-4 font-serif text-3xl md:text-4xl font-semibold tracking-tight text-[#3B3326]">
              {memory.name}
            </h3>

            <p className="mt-4 max-w-xl text-[15px] md:text-base leading-relaxed text-[#6B6559]">
              {memory.description}
            </p>

            <div className="mt-9 grid grid-cols-1 gap-6 border-t border-amber-900/[0.12] pt-8 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-amber-900/[0.12]">
              {stats.map((stat) => (
                <div key={stat.tag} className="sm:px-6 first:sm:pl-0 last:sm:pr-0">
                  <div className="font-mono text-[9px] uppercase tracking-[0.24em] text-amber-900/60">
                    {stat.tag}
                  </div>
                  <p className="mt-2.5 font-serif text-lg italic leading-snug text-[#4A4031]">
                    {stat.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────
   Page component
   ────────────────────────────────────────────── */

export default function PipelinePage() {
  const navigate = useNavigate()
  useReveal()

  return (
    <div className="relative isolate min-h-[100dvh] overflow-x-hidden bg-[#F4EFE4] text-[#221D14]">
      <div className="grain-overlay" />

      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="anim-drift absolute -right-40 -top-48 h-[34rem] w-[34rem] rounded-full bg-emerald-200/25 blur-[120px] will-change-transform" />
        <div className="anim-drift-delayed absolute -left-44 bottom-[-12rem] h-[32rem] w-[32rem] rounded-full bg-amber-200/20 blur-[120px] will-change-transform" />
      </div>

      <IslandNav onNavigate={navigate} />

      <main className="relative px-4 pt-28 md:px-8 md:pt-36">
        {/* Hero */}
        <header className="mx-auto max-w-[1180px]">
          <div className="flex flex-col justify-between gap-10 py-10 md:flex-row md:items-end md:py-14">
            <div className="max-w-2xl">
              <span className="reveal-lift inline-flex items-center gap-2 rounded-full border border-black/[0.08] bg-white/50 px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8A857D]">
                <span className="h-1 w-1 rounded-full bg-emerald-700" />
                The Authoring Engine
              </span>

              <h1 className="reveal-lift reveal-delay-1 mt-7 font-serif font-medium leading-[0.95] tracking-[-0.015em] text-[#221D14] text-[42px] sm:text-6xl md:text-7xl lg:text-[5.5rem]">
                How an idea
                <br />
                becomes <em className="italic text-emerald-800">a story.</em>
              </h1>

              <p className="reveal-lift reveal-delay-2 mt-7 max-w-xl text-[15px] md:text-base leading-relaxed text-[#6B6559]">
                Five specialised agents take your notes, direction, and memory and hand them down a
                single unbroken chain — until every chapter you publish is lore-accurate by
                construction.
              </p>
            </div>

            <figure className="reveal-lift reveal-delay-3 md:max-w-[280px] md:pb-2 md:text-right">
              <div className="mb-6 h-px w-10 bg-emerald-800/40 md:ml-auto" />
              <blockquote className="font-serif text-xl italic leading-snug text-[#3B3326] md:text-2xl">
                &ldquo;Great stories are simply decisions, remembered.&rdquo;
              </blockquote>
              <figcaption className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-[#8A857D]">
                The LoreSpring thesis
              </figcaption>
            </figure>
          </div>
        </header>

        {/* Section label */}
        <div className="mx-auto mt-8 flex max-w-[1180px] items-center gap-5 md:mt-12">
          <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#A49C8B]">
            The Flow
          </span>
          <span className="h-px flex-1 bg-black/[0.07]" />
        </div>

        {/* Pipeline cascade */}
        <section className="relative mx-auto mt-10 max-w-[1180px] md:mt-14">
          <div className="flex flex-col items-center">
            {pipelineOrder.map((agentId, index) => (
              <div key={agentId} className="flex w-full max-w-2xl flex-col items-center">
                <div className={`w-full ${index === 0 ? '' : '-mt-6 lg:-mt-14'}`}>
                  <AgentCard agent={agents[agentId]} index={index} />
                </div>
                <StageConnector
                  label={index === pipelineOrder.length - 1 ? 'persists to' : undefined}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Memory foundation */}
        <section className="mx-auto max-w-[1180px] pb-28 md:pb-36">
          <MemoryLayer />

          <footer className="mt-16 flex flex-col items-center gap-3 md:mt-24">
            <ArrowUp />
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#A49C8B]">
              LoreSpring — narrative engineering
            </p>
          </footer>
        </section>
      </main>
    </div>
  )
}
