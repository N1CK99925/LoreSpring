import { useNavigate } from 'react-router-dom'

/* ──────────────────────────────────────────────
   Agent data
   ────────────────────────────────────────────── */

interface AgentData {
  id: string
  name: string
  role: string
  description: string
  color: string
}

const agents: Record<string, AgentData> = {
  input: {
    id: 'input',
    name: 'Story Input',
    role: 'Source',
    description: 'Project metadata, chapter direction, and accumulated story summaries provide the raw narrative material.',
    color: '#8a857d',
  },
  writer: {
    id: 'writer',
    name: 'Writer Agent',
    role: 'Generation',
    description: 'Generates a full narrative draft from project metadata, direction, and retrieved summaries.',
    color: '#10b981',
  },
  continuity: {
    id: 'continuity',
    name: 'Continuity Check',
    role: 'Validation',
    description: 'Cross-references every sentence against established lore. Catches contradictions before they ship.',
    color: '#34d399',
  },
  revision: {
    id: 'revision',
    name: 'Revision Loop',
    role: 'Quality',
    description: 'Scores the draft against quality thresholds. Triggers iterative rewrites until the bar is met.',
    color: '#059669',
  },
  summarizer: {
    id: 'summarizer',
    name: 'Summarizer',
    role: 'Memory',
    description: 'Produces structured chapter summaries and extracts plot entities for future context.',
    color: '#047857',
  },
  memory: {
    id: 'memory',
    name: 'Story Graph',
    role: 'Persistence',
    description: 'A Neo4j knowledge graph storing every character, location, relationship, and plot thread. Grows richer with each chapter, providing long-term continuity.',
    color: '#b08947',
  },
}

const pipelineOrder = ['input', 'writer', 'continuity', 'revision', 'summarizer']

/* ──────────────────────────────────────────────
   Components
   ────────────────────────────────────────────── */

function AgentCard({ agent }: { agent: AgentData }) {
  return (
    <div className="relative group bg-white/70 backdrop-blur-sm border border-black/5 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full z-10">
      {/* Top color accent */}
      <div
        className="absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl opacity-80"
        style={{ backgroundColor: agent.color }}
      />

      <div className="flex items-center gap-3 mb-4 mt-2">
        <div
          className="w-3 h-3 rounded-full shadow-sm"
          style={{ backgroundColor: agent.color }}
        />
        <span
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color: agent.color }}
        >
          {agent.role}
        </span>
      </div>

      <h3 className="font-serif text-xl font-bold text-gray-900 mb-3">
        {agent.name}
      </h3>

      <p className="text-sm text-gray-600 leading-relaxed flex-grow">
        {agent.description}
      </p>
    </div>
  )
}

function ArrowRight() {
  return (
    <div className="hidden lg:flex items-center justify-center w-8 text-gray-300">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12"></line>
        <polyline points="12 5 19 12 12 19"></polyline>
      </svg>
    </div>
  )
}

function ArrowDown() {
  return (
    <div className="flex items-center justify-center h-8 text-gray-300 my-2">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <polyline points="19 12 12 19 5 12"></polyline>
      </svg>
    </div>
  )
}

/* ──────────────────────────────────────────────
   Page component
   ────────────────────────────────────────────── */

export default function PipelinePage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#f4f1eb] flex flex-col relative overflow-x-hidden text-gray-800">
      {/* grain overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("/noise.png")' }} />

      {/* nav */}
      <nav className="flex items-center justify-between px-12 py-5 relative z-20">
        <a
          href="/dashboard"
          className="flex items-center gap-3 no-underline"
          onClick={(e) => {
            e.preventDefault()
            navigate('/dashboard')
          }}
        >
          <img
            src="/lorespring-assets/lorespring-logo.png"
            alt="LoreSpring"
            className="w-9 h-9 object-contain"
          />
          <span className="font-serif text-2xl font-bold text-emerald-800 tracking-[0.06em]">
            LoreSpring
          </span>
        </a>

        <div className="flex items-center gap-6">
          <a
            href="/dashboard"
            className="text-gray-500 no-underline text-sm font-medium transition-colors duration-200 hover:text-emerald-700"
            onClick={(e) => {
              e.preventDefault()
              navigate('/dashboard')
            }}
          >
            Dashboard
          </a>
          <button
            className="bg-emerald-700 text-white border-none px-6 py-2.5 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-250 hover:bg-emerald-600 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-900/20"
            onClick={() => navigate('/register')}
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12 relative z-10 flex flex-col justify-center">

        {/* Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 tracking-tight mb-4">
            The Agent Pipeline
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            How LoreSpring turns raw ideas into cohesive, lore-accurate narratives.
          </p>
        </div>

        {/* The Pipeline UI */}
        <div className="flex flex-col gap-8 w-full">

          {/* Main Horizontal Flow */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 lg:gap-2">
            {pipelineOrder.map((agentId, index) => (
              <div key={agentId} className="flex flex-col lg:flex-row items-center flex-1">
                <div className="w-full flex-1">
                  <AgentCard agent={agents[agentId]} />
                </div>
                {index < pipelineOrder.length - 1 && (
                  <>
                    <ArrowRight />
                    <div className="lg:hidden">
                      <ArrowDown />
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Connectors down to memory layer */}
          <div className="hidden lg:grid grid-cols-5 gap-2 px-6">
            <div className="col-start-2 flex justify-center"><ArrowDown /></div>
            <div className="col-start-3 flex justify-center"><ArrowDown /></div>
            <div className="col-start-5 flex justify-center"><ArrowDown /></div>
          </div>

          <div className="lg:hidden flex justify-center">
            <ArrowDown />
          </div>

          {/* Foundational Memory Layer */}
          <div className="w-full mt-4 lg:mt-0 relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-700/5 via-amber-600/10 to-amber-700/5 rounded-3xl blur-xl transition-all duration-500 group-hover:blur-2xl opacity-50" />
            <div className="relative bg-[#fcfbfa] border-2 border-amber-900/10 rounded-3xl p-8 lg:p-10 shadow-sm transition-all duration-300 hover:shadow-md hover:border-amber-900/20">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: agents.memory.color }}
                />
                <span
                  className="text-sm font-bold uppercase tracking-widest"
                  style={{ color: agents.memory.color }}
                >
                  {agents.memory.role}
                </span>
              </div>

              <h3 className="font-serif text-2xl lg:text-3xl text-center font-bold text-gray-900 mb-4">
                {agents.memory.name}
              </h3>

              <p className="text-base lg:text-lg text-center text-gray-600 leading-relaxed max-w-4xl mx-auto">
                {agents.memory.description}
              </p>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
