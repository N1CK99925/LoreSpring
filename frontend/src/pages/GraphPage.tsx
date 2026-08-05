/* eslint-disable @typescript-eslint/no-explicit-any */
// pages/GraphPage.tsx
import { useEffect, useMemo, useRef, useState } from "react"
import ForceGraph2D, { type ForceGraphMethods } from "react-force-graph-2d"
import { useNavigate, useParams } from 'react-router-dom'
import { apiFetch } from "../api/client"

/* ───────────────────────────── Primitives ───────────────────────────── */

const EASE = 'ease-[cubic-bezier(0.32,0.72,0,1)]'
const GRAPH_BG = '#f4efe4'
const NODE_RADIUS = 5

type GraphNode = {
  id: string
  label: string
  type?: string
  color?: string
  attributes?: Record<string, unknown>
  x?: number
  y?: number
}

type GraphLink = {
  source: string | any
  target: string | any
  label?: string
  attributes?: Record<string, unknown>
}

type GraphData = {
  nodes: GraphNode[]
  links: GraphLink[]
}

/* Curated warm-editorial palette, tuned against the cream canvas */
const ENTITY_COLORS: Record<string, string> = {
  person: '#047857',
  location: '#0f766e',
  organization: '#b45309',
  concept: '#6d28d9',
  artifact: '#be123c',
  unknown: '#a49c8b',
}

const ALL_TYPES = Object.keys(ENTITY_COLORS)

const withAlpha = (hex: string, alpha: number) => {
  const h = hex.replace('#', '')
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  const r = parseInt(full.slice(0, 2), 16)
  const g = parseInt(full.slice(2, 4), 16)
  const b = parseInt(full.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

const idOf = (v: any): string => {
  if (typeof v === 'string' || typeof v === 'number') return String(v)
  return String(v?.id ?? '')
}

const linkKey = (l: any): string => `${idOf(l.source)}→${idOf(l.target)}`

const Icon = ({ d, className = '', strokeWidth = 1.5 }: { d: string; className?: string; strokeWidth?: number }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}
    strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d={d} />
  </svg>
)

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 border border-emerald-500/10 bg-emerald-500/[0.03]">
    <span className="w-1 h-1 rounded-full bg-emerald-500" />
    <span className="text-[10px] uppercase tracking-[0.22em] font-medium text-emerald-700">{children}</span>
  </span>
)

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[1.25rem] bg-black/[0.03] p-[1px]">
      <div className="rounded-[calc(1.25rem-1px)] bg-surface-card px-4 py-3 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.02] to-transparent" />
        <div className="relative">
          <div className="text-[9px] uppercase tracking-[0.18em] text-text-muted font-medium">{label}</div>
          <div className="font-serif text-[26px] font-light text-text-primary leading-none mt-1 tabular-nums">{value}</div>
        </div>
      </div>
    </div>
  )
}

/* ───────────────────────────── Page ───────────────────────────── */

export default function GraphPage() {
  const navigate = useNavigate()
  const { projectId } = useParams<{ projectId: string }>()
  const graphRef = useRef<ForceGraphMethods | undefined>(undefined)
  const hasFitRef = useRef(false)

  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] })
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [visibleTypes, setVisibleTypes] = useState<string[]>(ALL_TYPES)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState<boolean>(() => Boolean(projectId))
  const [error, setError] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 60)
    return () => clearTimeout(t)
  }, [])

  const missingProject = !projectId
  useEffect(() => {
    if (missingProject) return
    let cancelled = false
    const fetchGraph = async () => {
      try {
        setLoading(true); setError(null)
        const data = await apiFetch(`/graph?project_id=${encodeURIComponent(projectId)}`)
        if (!cancelled) setGraphData(data)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load graph"
        console.error("Graph fetch failed:", err)
        if (!cancelled) setError(errorMessage)
      } finally { if (!cancelled) setLoading(false) }
    }
    fetchGraph()
    return () => { cancelled = true }
  }, [projectId, missingProject])

  /* ── Derived data ── */

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    graphData.nodes.forEach((n) => {
      const t = n.type || 'unknown'
      counts[t] = (counts[t] || 0) + 1
    })
    return counts
  }, [graphData])

  const legendData = useMemo(() =>
    ALL_TYPES.map((type) => ({ type, color: ENTITY_COLORS[type], count: typeCounts[type] || 0 })),
    [typeCounts])

  const toggleType = (type: string) => {
    setVisibleTypes((prev) => prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type])
  }

  const filteredData = useMemo<GraphData>(() => {
    const q = query.trim().toLowerCase()
    const nodes = graphData.nodes.filter((n) =>
      visibleTypes.includes(n.type || 'unknown') &&
      (!q || n.label.toLowerCase().includes(q)))
    const ids = new Set(nodes.map((n) => n.id))
    const links = graphData.links.filter((l) => ids.has(idOf(l.source)) && ids.has(idOf(l.target)))
    return { nodes, links }
  }, [graphData, visibleTypes, query])

  const processedData = useMemo<GraphData>(() => ({
    nodes: filteredData.nodes.map((node) => ({ ...node, color: ENTITY_COLORS[node.type || 'unknown'] || ENTITY_COLORS.unknown })),
    links: filteredData.links,
  }), [filteredData])

  const displayError = missingProject ? "Project ID not found. Please navigate from the dashboard." : error

  /* The selection is derived from the id so a filtered-out node clears itself */
  const selectedNode = useMemo(() =>
    processedData.nodes.find((n) => n.id === selectedId) ?? null,
    [processedData, selectedId])

  /* Highlight graph: the hovered / selected node plus its immediate neighbours */
  const { highlightIds, highlightLinks } = useMemo(() => {
    const ids = new Set<string>()
    const linkKeys = new Set<string>()
    const addNode = (id: string | null | undefined) => {
      if (!id) return
      ids.add(id)
      filteredData.links.forEach((l) => {
        const s = idOf(l.source), t = idOf(l.target)
        if (s === id) { ids.add(t); linkKeys.add(linkKey(l)) }
        if (t === id) { ids.add(s); linkKeys.add(linkKey(l)) }
      })
    }
    addNode(selectedNode?.id)
    addNode(hoveredId)
    return { highlightIds: ids, highlightLinks: linkKeys }
  }, [selectedNode, hoveredId, filteredData])

  const neighborIds = useMemo(() => {
    const ids = new Set<string>()
    if (!selectedNode) return ids
    filteredData.links.forEach((l) => {
      const s = idOf(l.source), t = idOf(l.target)
      if (s === selectedNode.id) ids.add(t)
      if (t === selectedNode.id) ids.add(s)
    })
    return ids
  }, [selectedNode, filteredData])

  const neighbors = useMemo(() =>
    processedData.nodes.filter((n) => neighborIds.has(n.id)),
    [processedData, neighborIds])

  /* ── Interactions ── */

  const handleNodeClick = (node: any) => {
    setSelectedId(node.id)
    graphRef.current?.centerAt(node.x, node.y, 600)
  }

  const handleNodeHover = (node: any) => {
    const id = node ? (node as GraphNode).id : null
    setHoveredId(id)
    document.body.style.cursor = id ? 'pointer' : ''
  }

  useEffect(() => () => { document.body.style.cursor = '' }, [])

  const handleBackgroundClick = () => setSelectedId(null)

  const handleEngineStop = () => {
    if (!hasFitRef.current && processedData.nodes.length > 0) {
      hasFitRef.current = true
      graphRef.current?.zoomToFit(500, 80)
    }
  }

  const zoomBy = (factor: number) => {
    const g = graphRef.current
    if (!g) return
    g.zoom(g.zoom() * factor, 350)
  }

  const fitGraph = () => graphRef.current?.zoomToFit(500, 80)

  const reheat = () => graphRef.current?.d3ReheatSimulation()

  const focusNode = (n: GraphNode) => {
    setSelectedId(n.id)
    graphRef.current?.centerAt(n.x, n.y, 600)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelectedId(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  /* ── Canvas painters ── */

  const paintNodeArea = (node: any, color: string, ctx: CanvasRenderingContext2D) => {
    const n = node as GraphNode
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(n.x || 0, n.y || 0, NODE_RADIUS * 2.6, 0, 2 * Math.PI)
    ctx.fill()
  }

  const drawNode = (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const n = node as GraphNode
    const x = n.x || 0, y = n.y || 0
    const isHl = highlightIds.has(n.id)
    const isDim = highlightIds.size > 0 && !isHl
    const color = n.color || ENTITY_COLORS.unknown
    const r = NODE_RADIUS * (isHl ? 1.5 : 1)

    ctx.save()
    ctx.globalAlpha = isDim ? 0.28 : 1

    /* soft radial halo */
    const halo = ctx.createRadialGradient(x, y, r * 0.6, x, y, r * 2.8)
    halo.addColorStop(0, withAlpha(color, isHl ? 0.32 : 0.16))
    halo.addColorStop(1, withAlpha(color, 0))
    ctx.beginPath()
    ctx.arc(x, y, r * 2.8, 0, 2 * Math.PI)
    ctx.fillStyle = halo
    ctx.fill()

    /* core */
    ctx.beginPath()
    ctx.arc(x, y, r, 0, 2 * Math.PI)
    ctx.fillStyle = color
    ctx.shadowBlur = isHl ? 18 : 10
    ctx.shadowColor = color
    ctx.fill()
    ctx.shadowBlur = 0

    /* glass rim */
    ctx.beginPath()
    ctx.arc(x, y, r - 0.5 / globalScale, 0, 2 * Math.PI)
    ctx.strokeStyle = 'rgba(255,255,255,0.55)'
    ctx.lineWidth = 1 / globalScale
    ctx.stroke()

    /* label */
    if (globalScale > 1.25 || isHl) {
      const fs = 12 / globalScale
      ctx.font = `500 ${fs}px Outfit, sans-serif`
      ctx.textBaseline = 'middle'
      const tx = x + r + 8 / globalScale
      ctx.strokeStyle = 'rgba(244,239,228,0.85)'
      ctx.lineWidth = 3 / globalScale
      ctx.strokeText(n.label, tx, y)
      ctx.fillStyle = isHl ? '#047857' : '#221d14'
      ctx.fillText(n.label, tx, y)
    }
    ctx.restore()
  }

  const selectedColor = selectedNode
    ? ENTITY_COLORS[selectedNode.type || 'unknown'] || ENTITY_COLORS.unknown
    : ENTITY_COLORS.unknown

  const description = selectedNode?.attributes?.description != null
    ? String(selectedNode.attributes.description)
    : null

  /* ── Render ── */

  return (
    <div className="h-[100dvh] bg-surface flex overflow-hidden">
      <div className="grain-overlay" />

      {sidebarOpen && <div className="sidebar-backdrop md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* ── Sidebar: floating panel on desktop, drawer on mobile ── */}
      <div className={`sidebar-overlay md:!static md:!transform-none md:shrink-0 md:m-4 md:h-[calc(100dvh-2rem)] md:w-[340px] md:max-w-none z-30 ${sidebarOpen ? 'open' : ''}`}
        style={{ opacity: ready ? 1 : 0, transition: `opacity 0.7s ease-[cubic-bezier(0.16,1,0.3,1)] 0.05s, transform 0.35s cubic-bezier(0.16,1,0.3,1)` }}>
        <div className="h-full md:rounded-[2rem] bg-black/[0.03] p-[1.5px] md:ring-1 md:ring-black/5 md:shadow-[0_32px_90px_-48px_rgba(26,24,20,0.45)]">
          <div className="h-full md:rounded-[calc(2rem-1.5px)] bg-surface-card overflow-hidden flex flex-col">

            {/* Brand */}
            <div className="flex items-center justify-between px-5 pt-5 pb-4">
              <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => navigate('/dashboard')}>
                <div className="w-8 h-8 rounded-xl bg-emerald-500/[0.06] flex items-center justify-center border border-emerald-500/10 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:bg-emerald-500/[0.1] group-hover:scale-105">
                  <img src="/lorespring-assets/lorespring-logo.png" alt="LoreSpring" className="w-4 h-4 object-contain" />
                </div>
                <div>
                  <div className="font-serif text-[17px] font-normal text-text-primary tracking-tight leading-none group-hover:text-emerald-800 transition-colors duration-500">LoreSpring</div>
                  <div className="text-[9px] uppercase tracking-[0.2em] text-text-muted mt-1">Story graph</div>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                aria-label="Close sidebar"
                className="md:hidden w-8 h-8 rounded-full border border-border-subtle flex items-center justify-center text-text-muted cursor-pointer hover:bg-surface-muted transition-all duration-500 active:scale-90"
              >
                <Icon d="M18 6 6 18M6 6l12 12" />
              </button>
            </div>

            {/* Eyebrow */}
            <div className="px-5">
              <Eyebrow>Narrative memory</Eyebrow>
            </div>

            {/* Stats */}
            <div className="px-5 mt-5 grid grid-cols-2 gap-2.5">
              <StatCard label="Entities" value={filteredData.nodes.length} />
              <StatCard label="Links" value={filteredData.links.length} />
            </div>

            {/* Search */}
            <div className="px-5 mt-5">
              <label className="text-[10px] uppercase tracking-[0.2em] text-text-muted font-medium">Filter entities</label>
              <div className="mt-2 rounded-full bg-black/[0.03] p-1 ring-1 ring-black/5 focus-within:ring-emerald-500/30 transition-all duration-500 flex items-center">
                <span className="pl-3 text-text-muted shrink-0">
                  <Icon d="M11 11a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm7 7-4-4" />
                </span>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search labels…"
                  className="w-full bg-transparent px-2.5 py-2 text-xs text-text-primary outline-none placeholder:text-text-muted/70"
                />
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    aria-label="Clear search"
                    className="mr-1 w-6 h-6 rounded-full flex items-center justify-center text-text-muted cursor-pointer hover:text-text-primary hover:bg-surface-muted transition-all duration-500 shrink-0"
                  >
                    <Icon d="M18 6 6 18M6 6l12 12" />
                  </button>
                )}
              </div>
            </div>

            {/* Legend */}
            <div className="flex-1 min-h-0 overflow-y-auto ls-scroll px-3 mt-5 pb-3">
              <div className="flex items-center justify-between px-2 mb-2">
                <span className="text-[10px] uppercase tracking-[0.22em] text-text-muted font-medium">Legend</span>
                <button
                  onClick={() => setVisibleTypes(visibleTypes.length === ALL_TYPES.length ? [] : ALL_TYPES)}
                  className="text-[9px] uppercase tracking-[0.16em] text-emerald-700 cursor-pointer hover:text-emerald-800 transition-colors duration-500"
                >
                  {visibleTypes.length === ALL_TYPES.length ? 'Hide all' : 'Show all'}
                </button>
              </div>
              <div className="flex flex-col gap-0.5">
                {legendData.map(({ type, color, count }) => {
                  const active = visibleTypes.includes(type)
                  return (
                    <button
                      key={type}
                      onClick={() => toggleType(type)}
                      className={`group w-full flex items-center gap-2.5 rounded-2xl px-3 py-2 cursor-pointer transition-all duration-500 ${EASE} ${active ? 'bg-surface-muted' : 'hover:bg-surface-muted/60'}`}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 transition-all duration-500 ${active ? '' : 'ring-1 ring-black/10'}`}
                        style={{ background: active ? color : 'transparent' }} />
                      <span className={`text-xs capitalize transition-colors duration-500 ${active ? 'text-text-primary' : 'text-text-muted'}`}>{type}</span>
                      <span className="flex-1" />
                      <span className={`text-[10px] tabular-nums ${active ? 'text-text-muted' : 'text-text-muted/50'}`}>{count}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Selection readout */}
            <div className="px-5 pb-5">
              {selectedNode ? (
                <div className="rounded-[1.5rem] bg-black/[0.03] p-[1px]">
                  <div className="rounded-[calc(1.5rem-1px)] bg-surface-card p-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.7)]">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0 mt-0.5" style={{ background: selectedColor }} />
                        <span className="font-serif text-[15px] text-text-primary truncate">{selectedNode.label}</span>
                      </div>
                      <button
                        onClick={() => setSelectedId(null)}
                        aria-label="Clear selection"
                        className="w-6 h-6 rounded-full flex items-center justify-center text-text-muted cursor-pointer hover:text-text-primary hover:bg-surface-muted transition-all duration-500 shrink-0"
                      >
                        <Icon d="M18 6 6 18M6 6l12 12" />
                      </button>
                    </div>
                    <div className="mt-2.5 flex items-center justify-between gap-2">
                      <span className="rounded-full px-2.5 py-0.5 text-[9px] uppercase tracking-[0.16em] font-medium"
                        style={{ background: withAlpha(selectedColor, 0.12), color: selectedColor }}>
                        {selectedNode.type || 'unknown'}
                      </span>
                      <button
                        onClick={() => focusNode(selectedNode)}
                        className="group/f text-[11px] text-text-muted cursor-pointer hover:text-emerald-800 transition-colors duration-500 flex items-center gap-1.5"
                      >
                        Re-center
                        <Icon d="M7 17 17 7M8 7h9v9" className="transition-transform duration-500 group-hover/f:translate-x-0.5 group-hover/f:-translate-y-0.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-text-muted leading-relaxed px-1">
                  Click an entity on the canvas to inspect its connections.
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-border-subtle/60 p-3 flex flex-col gap-1">
              <button
                onClick={reheat}
                className="group/g w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-[12px] text-text-secondary cursor-pointer transition-all duration-500 hover:bg-surface-muted hover:pl-4 hover:text-text-primary"
              >
                <Icon d="M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6" className="transition-transform duration-700 group-hover/g:rotate-180" />
                Re-layout graph
              </button>
              <button
                onClick={() => navigate(-1)}
                className="group/b w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-[12px] text-text-muted cursor-pointer transition-all duration-500 hover:bg-red-500/[0.04] hover:text-red-600 hover:pl-4"
              >
                <Icon d="M19 12H5M12 19l-7-7 7-7" />
                Back to project
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Graph canvas ── */}
      <div className="flex-1 relative z-0 min-w-0">
        {/* ambient editorial glow */}
        <div className="pointer-events-none absolute inset-0 z-[1]" aria-hidden>
          <div className="absolute -top-32 -right-24 w-[480px] h-[480px] rounded-full bg-emerald-500/[0.05] blur-3xl" />
          <div className="absolute -bottom-40 -left-24 w-[560px] h-[560px] rounded-full bg-gold-500/[0.04] blur-3xl" />
        </div>

        <div className={`absolute inset-0 transition-opacity duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${ready ? 'opacity-100' : 'opacity-0'}`}>
          <ForceGraph2D
            ref={graphRef}
            graphData={processedData}
            backgroundColor={GRAPH_BG}
            nodeRelSize={NODE_RADIUS}
            cooldownTicks={120}
            cooldownTime={1800}
            d3AlphaDecay={0.03}
            d3VelocityDecay={0.32}
            linkWidth={(l: any) => highlightLinks.has(linkKey(l)) ? 2 : 1}
            linkColor={(l: any) => highlightLinks.has(linkKey(l)) ? withAlpha('#047857', 0.6) : withAlpha('#0d9488', 0.16)}
            linkDirectionalParticles={(l: any) => highlightLinks.has(linkKey(l)) ? 2 : 0}
            linkDirectionalParticleSpeed={0.006}
            linkDirectionalParticleWidth={2}
            linkDirectionalParticleColor={() => '#047857'}
            onNodeClick={handleNodeClick}
            onNodeHover={handleNodeHover}
            onBackgroundClick={handleBackgroundClick}
            onEngineStop={handleEngineStop}
            nodeCanvasObjectMode={() => 'replace'}
            nodeCanvasObject={drawNode}
            nodePointerAreaPaint={paintNodeArea}
          />
        </div>

        {/* Loading */}
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-surface">
            <div className="hero-enter rounded-[2rem] bg-black/[0.03] p-[1.5px]">
              <div className="rounded-[calc(2rem-1.5px)] bg-surface-card px-9 py-10 flex flex-col items-center gap-5 text-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]">
                <div className="relative w-10 h-10">
                  <div className="absolute inset-0 rounded-full border border-emerald-500/15" />
                  <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-emerald-600 animate-spin" />
                </div>
                <div>
                  <div className="font-serif text-xl text-text-primary font-light">Mapping the narrative</div>
                  <div className="text-text-muted text-xs mt-1">Assembling entities &amp; connections…</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {displayError && !loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-surface px-4">
            <div className="hero-enter max-w-sm text-center">
              <div className="flex justify-center mb-5">
                <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 border border-red-500/15 bg-red-500/[0.04]">
                  <span className="w-1 h-1 rounded-full bg-red-500" />
                  <span className="text-[10px] uppercase tracking-[0.22em] font-medium text-red-600">Connection lost</span>
                </span>
              </div>
              <h3 className="font-serif text-2xl font-light text-text-primary mb-2">Couldn't load the graph</h3>
              <p className="text-text-muted text-sm leading-relaxed mb-7">{error}</p>
              <button
                onClick={() => navigate('/dashboard')}
                className="group/btn inline-flex items-center gap-2.5 rounded-full bg-emerald-700 text-white pl-5 pr-2.5 py-2.5 text-sm font-medium cursor-pointer transition-all duration-500 hover:shadow-[0_10px_32px_rgba(13,140,74,0.25)] active:scale-[0.98]"
              >
                Back to Dashboard
                <span className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center transition-all duration-500 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 group-hover/btn:scale-105">
                  <Icon d="M5 12h14M12 5l7 7-7 7" strokeWidth={2} className="text-white/90" />
                </span>
              </button>
            </div>
          </div>
        )}

        {/* ── Entity-type filter island ── */}
        {!loading && !displayError && (
          <div className="absolute top-16 inset-x-3 md:inset-x-auto md:top-6 md:left-6 z-10">
            <div className="inline-block max-w-full rounded-full bg-black/[0.03] p-1 ring-1 ring-black/5 backdrop-blur-xl">
              <div className="rounded-full bg-surface-card/85 flex items-center gap-1 px-1.5 py-1 overflow-x-auto ls-scroll">
                {legendData.map(({ type, color }) => {
                  const active = visibleTypes.includes(type)
                  return (
                    <button
                      key={type}
                      onClick={() => toggleType(type)}
                      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] font-medium whitespace-nowrap cursor-pointer transition-all duration-500 ${EASE} ${
                        active
                          ? 'bg-emerald-500/[0.06] text-emerald-800 ring-1 ring-emerald-500/15'
                          : 'text-text-muted hover:text-text-secondary'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: active ? color : 'rgba(0,0,0,0.12)' }} />
                      {type}
                    </button>
                  )
                })}
                <div className="w-px h-5 bg-border-subtle mx-1 shrink-0" />
                <button
                  onClick={() => setVisibleTypes(visibleTypes.length === ALL_TYPES.length ? [] : ALL_TYPES)}
                  className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] font-medium whitespace-nowrap cursor-pointer text-text-muted hover:text-emerald-800 transition-all duration-500"
                >
                  {visibleTypes.length === ALL_TYPES.length ? 'All' : `${visibleTypes.length}/${ALL_TYPES.length}`}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Zoom cluster ── */}
        {!loading && !displayError && (
          <div className="absolute top-3 right-3 md:top-6 md:right-6 z-10">
            <div className="rounded-full bg-black/[0.03] p-1 ring-1 ring-black/5 backdrop-blur-xl">
              <div className="rounded-full bg-surface-card/85 flex items-center gap-0.5 px-1 py-1">
                <button onClick={() => zoomBy(1.3)} aria-label="Zoom in"
                  className="w-9 h-9 rounded-full flex items-center justify-center text-text-muted cursor-pointer transition-all duration-500 hover:text-emerald-800 hover:bg-emerald-500/[0.06] active:scale-90">
                  <Icon d="M12 5v14M5 12h14" strokeWidth={1.75} />
                </button>
                <button onClick={() => zoomBy(1 / 1.3)} aria-label="Zoom out"
                  className="w-9 h-9 rounded-full flex items-center justify-center text-text-muted cursor-pointer transition-all duration-500 hover:text-emerald-800 hover:bg-emerald-500/[0.06] active:scale-90">
                  <Icon d="M5 12h14" strokeWidth={1.75} />
                </button>
                <div className="w-px h-5 bg-border-subtle mx-0.5" />
                <button onClick={fitGraph} aria-label="Fit graph"
                  className="w-9 h-9 rounded-full flex items-center justify-center text-text-muted cursor-pointer transition-all duration-500 hover:text-emerald-800 hover:bg-emerald-500/[0.06] active:scale-90">
                  <Icon d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3" strokeWidth={1.75} />
                </button>
                <button onClick={reheat} aria-label="Re-layout"
                  className="w-9 h-9 rounded-full flex items-center justify-center text-text-muted cursor-pointer transition-all duration-500 hover:text-emerald-800 hover:bg-emerald-500/[0.06] active:scale-90">
                  <Icon d="M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6" strokeWidth={1.75} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Hint chip ── */}
        {!loading && !displayError && (
          <div className="desktop-only absolute bottom-6 right-6 z-10">
            <div className="hero-enter hero-enter-delay-2 rounded-full bg-surface-card/85 border border-border-subtle backdrop-blur-xl px-4 py-2 text-[11px] text-text-muted">
              Scroll to zoom · Drag to move · Click an entity to inspect
            </div>
          </div>
        )}

        {/* ── Mobile menu button ── */}
        <button
          onClick={() => setSidebarOpen(true)}
          aria-label="Open sidebar"
          className="md:hidden absolute top-3 left-3 z-20 rounded-full border border-border-subtle bg-surface-card/85 backdrop-blur-xl w-10 h-10 flex items-center justify-center text-text-secondary cursor-pointer hover:bg-surface-muted transition-colors"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>

        {/* ── Floating entity inspector ── */}
        {selectedNode && (
          <div
            key={selectedNode.id}
            className="hero-enter absolute inset-x-3 bottom-3 md:inset-x-auto md:left-6 md:bottom-6 md:w-[380px] z-20"
          >
            <div className="rounded-[1.75rem] bg-black/[0.03] p-[1.5px] ring-1 ring-black/5 shadow-[0_32px_90px_-40px_rgba(26,24,20,0.5)]">
              <div className="rounded-[calc(1.75rem-1.5px)] bg-surface-card overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]">
                <div className="flex items-center justify-between gap-3 px-5 pt-5 pb-3.5 border-b border-border-subtle/60">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ background: selectedColor, boxShadow: `0 0 0 4px ${withAlpha(selectedColor, 0.12)}` }} />
                    <div className="min-w-0">
                      <div className="text-[9px] uppercase tracking-[0.2em] text-text-muted font-medium">Entity selected</div>
                      <div className="font-serif text-[20px] font-normal text-text-primary leading-tight truncate mt-0.5">{selectedNode.label}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedId(null)}
                    aria-label="Close inspector"
                    className="w-9 h-9 rounded-full border border-border-subtle bg-surface-card flex items-center justify-center text-text-muted cursor-pointer transition-all duration-500 hover:border-emerald-500/40 hover:text-emerald-800 active:scale-90 shrink-0"
                  >
                    <Icon d="M18 6 6 18M6 6l12 12" />
                  </button>
                </div>

                <div className="px-5 py-4 space-y-4">
                  <div className="flex items-center gap-2.5">
                    <span className="rounded-full px-2.5 py-0.5 text-[9px] uppercase tracking-[0.16em] font-medium"
                      style={{ background: withAlpha(selectedColor, 0.12), color: selectedColor }}>
                      {selectedNode.type || 'unknown'}
                    </span>
                    <span className="text-xs text-text-muted tabular-nums">{neighborIds.size} connections</span>
                  </div>

                  {description && (
                    <div>
                      <div className="text-[9px] uppercase tracking-[0.2em] text-text-muted font-medium">Description</div>
                      <p className="text-text-secondary text-[13px] leading-relaxed mt-1.5">{description}</p>
                    </div>
                  )}

                  {neighbors.length > 0 && (
                    <div>
                      <div className="text-[9px] uppercase tracking-[0.2em] text-text-muted font-medium">Connected to</div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {neighbors.slice(0, 8).map((n) => (
                          <button
                            key={n.id}
                            onClick={() => focusNode(n)}
                            className="group/chip flex items-center gap-1.5 rounded-full border border-border-subtle bg-surface-card px-3 py-1.5 text-[11px] text-text-secondary cursor-pointer transition-all duration-500 hover:border-emerald-500/40 hover:text-emerald-800 active:scale-95"
                          >
                            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: n.color || ENTITY_COLORS.unknown }} />
                            <span className="max-w-[140px] truncate">{n.label}</span>
                          </button>
                        ))}
                        {neighborIds.size > neighbors.length && (
                          <span className="flex items-center px-1 text-[11px] text-text-muted">+{neighborIds.size - neighbors.length} more</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="px-5 pb-5">
                  <button
                    onClick={() => focusNode(selectedNode)}
                    className="group/btn w-full flex items-center justify-between gap-3 rounded-full bg-emerald-700 text-white pl-5 pr-2.5 py-2.5 text-[13px] font-medium cursor-pointer transition-all duration-500 hover:shadow-[0_12px_40px_rgba(13,140,74,0.28)] active:scale-[0.98]"
                  >
                    <span>Center on node</span>
                    <span className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center transition-all duration-500 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 group-hover/btn:scale-105">
                      <Icon d="M7 17 17 7M8 7h9v9" strokeWidth={2} className="text-white/90" />
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
