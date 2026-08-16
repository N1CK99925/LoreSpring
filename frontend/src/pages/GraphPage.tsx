/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import ForceGraph2D, { type ForceGraphMethods } from "react-force-graph-2d"
import { useNavigate, useParams } from 'react-router-dom'
import { apiFetch } from "../api/client"

/* ───────────────────────────── Primitives ───────────────────────────── */

const GRAPH_BG = '#faf9f7'

type GraphNode = {
  id: string
  label: string
  type?: string
  color?: string
  attributes?: Record<string, unknown>
  x?: number
  y?: number
  __degree?: number
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

const ENTITY_COLORS: Record<string, string> = {
  person: '#1a7a5c',
  location: '#2e7d8a',
  organization: '#b8860b',
  concept: '#6b52b8',
  artifact: '#c0392b',
  unknown: '#8c8278',
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

/* ───────────────────────── Page ───────────────────────── */

export default function GraphPage() {
  const navigate = useNavigate()
  const { projectId } = useParams<{ projectId: string }>()
  const graphRef = useRef<ForceGraphMethods | undefined>(undefined)
  const containerRef = useRef<HTMLDivElement>(null)
  const hasFitRef = useRef(false)
  const zoomRef = useRef(1)

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

  const toggleType = useCallback((type: string) => {
    setVisibleTypes((prev) => prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type])
  }, [])

  const filteredData = useMemo<GraphData>(() => {
    const q = query.trim().toLowerCase()
    const nodes = graphData.nodes.filter((n) =>
      visibleTypes.includes(n.type || 'unknown') &&
      (!q || n.label.toLowerCase().includes(q)))
    const ids = new Set(nodes.map((n) => n.id))
    const links = graphData.links.filter((l) => ids.has(idOf(l.source)) && ids.has(idOf(l.target)))
    return { nodes, links }
  }, [graphData, visibleTypes, query])

  /* Compute degree for each node */
  const processedData = useMemo<GraphData>(() => {
    const degreeMap = new Map<string, number>()
    filteredData.links.forEach((l) => {
      const s = idOf(l.source), t = idOf(l.target)
      degreeMap.set(s, (degreeMap.get(s) || 0) + 1)
      degreeMap.set(t, (degreeMap.get(t) || 0) + 1)
    })
    return {
      nodes: filteredData.nodes.map((node) => ({
        ...node,
        color: ENTITY_COLORS[node.type || 'unknown'] || ENTITY_COLORS.unknown,
        __degree: degreeMap.get(node.id) || 0,
      })),
      links: filteredData.links,
    }
  }, [filteredData])

  const maxDegree = useMemo(() =>
    Math.max(1, ...processedData.nodes.map((n) => n.__degree || 0)),
    [processedData])

  const displayError = missingProject ? "Project ID not found. Please navigate from the dashboard." : error

  const selectedNode = useMemo(() =>
    processedData.nodes.find((n) => n.id === selectedId) ?? null,
    [processedData, selectedId])

  /* ── Highlight sets ── */

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

  const handleNodeClick = useCallback((node: any) => {
    setSelectedId(node.id)
    graphRef.current?.centerAt(node.x, node.y, 600)
  }, [])

  const handleNodeHover = useCallback((node: any) => {
    const id = node ? (node as GraphNode).id : null
    setHoveredId(id)
    document.body.style.cursor = id ? 'pointer' : ''
  }, [])

  useEffect(() => () => { document.body.style.cursor = '' }, [])

  const handleBackgroundClick = useCallback(() => setSelectedId(null), [])

  const handleEngineStop = useCallback(() => {
    if (!hasFitRef.current && processedData.nodes.length > 0) {
      hasFitRef.current = true
      graphRef.current?.zoomToFit(400, 100)
    }
  }, [processedData])

  const zoomBy = useCallback((factor: number) => {
    const g = graphRef.current
    if (!g) return
    g.zoom(g.zoom() * factor, 350)
  }, [])

  const fitGraph = useCallback(() => graphRef.current?.zoomToFit(400, 100), [])

  const reheat = useCallback(() => {
    hasFitRef.current = false
    graphRef.current?.d3ReheatSimulation()
  }, [])

  const focusNode = useCallback((n: GraphNode) => {
    setSelectedId(n.id)
    graphRef.current?.centerAt(n.x, n.y, 600)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelectedId(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  /* ── Node sizing ── */

  const nodeRadius = useCallback((node: GraphNode) => {
    const degree = node.__degree || 0
    const normalized = degree / maxDegree
    return 5 + normalized * 10
  }, [maxDegree])

  /* Configure d3 forces via ref */
  useEffect(() => {
    const g = graphRef.current
    if (!g) return
    const d3 = g.d3Force
    if (!d3) return
    const charge = d3('charge')
    if (charge && 'strength' in charge) (charge as any).strength(-600)
    const linkForce = d3('link')
    if (linkForce && 'distance' in linkForce) (linkForce as any).distance(160)
    const center = d3('center')
    if (center && 'strength' in center) (center as any).strength(0.01)
    const collision = d3('collision')
    if (collision && 'radius' in collision) {
      (collision as any).radius((node: any) => nodeRadius(node) + 16)
    }
  }, [nodeRadius])

  /* ── Canvas painters ── */

  const paintNodeArea = useCallback((node: any, color: string, ctx: CanvasRenderingContext2D) => {
    const n = node as GraphNode
    const r = nodeRadius(n)
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(n.x || 0, n.y || 0, r + 10, 0, 2 * Math.PI)
    ctx.fill()
  }, [nodeRadius])

  const drawNode = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const n = node as GraphNode
    const x = n.x || 0, y = n.y || 0
    const color = n.color || ENTITY_COLORS.unknown
    const r = nodeRadius(n)
    const zoom = zoomRef.current

    /* ── Depth hierarchy ── */
    let alpha = 0.88
    if (highlightIds.size > 0) {
      if (highlightIds.has(n.id)) {
        alpha = 1
      } else {
        alpha = 0.18
      }
    }

    ctx.save()
    ctx.globalAlpha = alpha

    /* ── Subtle ambient glow (only on highlighted nodes) ── */
    if (alpha > 0.5) {
      const glowR = r * 2.5
      const glow = ctx.createRadialGradient(x, y, r * 0.5, x, y, glowR)
      glow.addColorStop(0, withAlpha(color, 0.18))
      glow.addColorStop(1, withAlpha(color, 0))
      ctx.beginPath()
      ctx.arc(x, y, glowR, 0, 2 * Math.PI)
      ctx.fillStyle = glow
      ctx.fill()
    }

    /* ── Core node ── */
    ctx.beginPath()
    ctx.arc(x, y, r, 0, 2 * Math.PI)
    ctx.fillStyle = color

    if (alpha > 0.5) {
      ctx.shadowBlur = 12
      ctx.shadowColor = withAlpha(color, 0.35)
    }

    ctx.fill()
    ctx.shadowBlur = 0

    /* ── Subtle inner highlight ── */
    if (r > 3) {
      const highlight = ctx.createRadialGradient(x - r * 0.2, y - r * 0.2, 0, x, y, r)
      highlight.addColorStop(0, withAlpha('#ffffff', 0.25))
      highlight.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.beginPath()
      ctx.arc(x, y, r, 0, 2 * Math.PI)
      ctx.fillStyle = highlight
      ctx.fill()
    }

    /* ── Label rendering ── */
    const isHl = highlightIds.has(n.id)
    const isHovered = hoveredId === n.id
    const degree = n.__degree || 0
    const importance = degree / maxDegree

    let showLabel = false
    if (isHl || isHovered) {
      showLabel = true
    } else if (zoom > 2) {
      showLabel = importance > 0.15
    } else if (zoom > 1.4) {
      showLabel = importance > 0.3
    } else if (zoom > 1) {
      showLabel = importance > 0.5
    } else {
      showLabel = importance > 0.7
    }

    if (showLabel) {
      const fontSize = (isHl || isHovered ? 12 : 10.5) / globalScale
      const fontWeight = (isHl || isHovered) ? 600 : 500
      ctx.font = `${fontWeight} ${fontSize}px "Inter", "SF Pro Text", -apple-system, sans-serif`
      ctx.textBaseline = 'middle'
      const labelX = x + r + 5 / globalScale
      const labelY = y

      const textMetrics = ctx.measureText(n.label)
      const textW = textMetrics.width
      const textH = fontSize

      /* background pill */
      const padX = 4 / globalScale
      const padY = 2 / globalScale
      const pillH = textH + padY * 2
      const pillW = textW + padX * 2

      ctx.fillStyle = withAlpha(GRAPH_BG, 0.88)
      ctx.beginPath()
      ctx.roundRect(labelX - padX, labelY - pillH / 2, pillW, pillH, 3 / globalScale)
      ctx.fill()

      /* text */
      ctx.fillStyle = isHl ? color : (importance > 0.5 ? '#2c2520' : '#6b5f52')
      ctx.fillText(n.label, labelX, labelY + 0.5 / globalScale)
    }

    ctx.restore()
  }, [highlightIds, hoveredId, nodeRadius, maxDegree])

  /* ── Custom link rendering ── */

  const linkWidth = useCallback((l: any) => {
    if (highlightLinks.has(linkKey(l))) return 2
    return 1
  }, [highlightLinks])

  const linkColor = useCallback((l: any) => {
    if (highlightLinks.has(linkKey(l))) return withAlpha('#3b7d6e', 0.55)
    return withAlpha('#9a9186', 0.18)
  }, [highlightLinks])

  const linkCanvasObject = useCallback((link: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const isHl = highlightLinks.has(linkKey(link))
    const sx = (link.source as any).x || 0
    const sy = (link.source as any).y || 0
    const tx = (link.target as any).x || 0
    const ty = (link.target as any).y || 0

    const lineWidth = (isHl ? 2 : 1) / globalScale
    const alpha = isHl ? 0.6 : 0.2

    ctx.save()
    ctx.globalAlpha = alpha
    ctx.strokeStyle = isHl ? '#3b7d6e' : '#9a9186'
    ctx.lineWidth = lineWidth
    ctx.lineCap = 'round'

    ctx.beginPath()
    ctx.moveTo(sx, sy)
    ctx.lineTo(tx, ty)
    ctx.stroke()

    ctx.restore()
  }, [highlightLinks])

  const linkDirectionalParticles = useCallback((l: any) =>
    highlightLinks.has(linkKey(l)) ? 3 : 0, [highlightLinks])

  const selectedColor = selectedNode
    ? ENTITY_COLORS[selectedNode.type || 'unknown'] || ENTITY_COLORS.unknown
    : ENTITY_COLORS.unknown

  const description = selectedNode?.attributes?.description != null
    ? String(selectedNode.attributes.description)
    : null

  /* ── Render ── */

  return (
    <div className="h-[100dvh] bg-[#faf9f7] flex overflow-hidden font-sans">
      {sidebarOpen && <div className="fixed inset-0 bg-black/10 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* ── Sidebar ── */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-[320px] transform transition-transform duration-300 ease-out md:relative md:translate-x-0 md:z-auto md:shrink-0 md:m-3 md:h-[calc(100dvh-1.5rem)] ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ opacity: ready ? 1 : 0, transition: 'opacity 0.5s ease, transform 0.3s ease' }}
      >
        <div className="h-full rounded-2xl bg-white/80 backdrop-blur-xl border border-black/[0.06] shadow-[0_8px_40px_-12px_rgba(0,0,0,0.12)] overflow-hidden flex flex-col">

          {/* Brand */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => navigate('/dashboard')}>
              <div className="w-8 h-8 rounded-lg bg-[#3b7d6e]/[0.08] flex items-center justify-center transition-all duration-300 group-hover:bg-[#3b7d6e]/[0.12]">
                <img src="/lorespring-assets/lorespring-logo.png" alt="LoreSpring" className="w-4 h-4 object-contain" />
              </div>
              <div>
                <div className="text-[15px] font-semibold text-[#1a1714] tracking-tight leading-none group-hover:text-[#3b7d6e] transition-colors duration-300">LoreSpring</div>
                <div className="text-[9px] uppercase tracking-[0.18em] text-[#9a9186] mt-0.5 font-medium">Story graph</div>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
              className="md:hidden w-7 h-7 rounded-md border border-black/[0.08] flex items-center justify-center text-[#9a9186] cursor-pointer hover:bg-black/[0.03] transition-colors"
            >
              <Icon d="M18 6 6 18M6 6l12 12" />
            </button>
          </div>

          {/* Stats */}
          <div className="px-5 mt-2 grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-[#f5f3ef] px-3 py-2.5">
              <div className="text-[9px] uppercase tracking-[0.16em] text-[#9a9186] font-medium">Entities</div>
              <div className="text-[22px] font-light text-[#1a1714] leading-none mt-0.5 tabular-nums font-serif">{filteredData.nodes.length}</div>
            </div>
            <div className="rounded-xl bg-[#f5f3ef] px-3 py-2.5">
              <div className="text-[9px] uppercase tracking-[0.16em] text-[#9a9186] font-medium">Links</div>
              <div className="text-[22px] font-light text-[#1a1714] leading-none mt-0.5 tabular-nums font-serif">{filteredData.links.length}</div>
            </div>
          </div>

          {/* Search */}
          <div className="px-5 mt-4">
            <label className="text-[9px] uppercase tracking-[0.16em] text-[#9a9186] font-medium">Search entities</label>
            <div className="mt-1.5 rounded-lg bg-[#f5f3ef] p-0.5 focus-within:ring-1 focus-within:ring-[#3b7d6e]/30 transition-all flex items-center">
              <span className="pl-2.5 text-[#9a9186] shrink-0">
                <Icon d="M11 11a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm7 7-4-4" />
              </span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search labels..."
                className="w-full bg-transparent px-2 py-1.5 text-[12px] text-[#1a1714] outline-none placeholder:text-[#b5ad9e]"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  aria-label="Clear search"
                  className="mr-1 w-5 h-5 rounded flex items-center justify-center text-[#9a9186] cursor-pointer hover:text-[#1a1714] hover:bg-black/[0.04] transition-colors shrink-0"
                >
                  <Icon d="M18 6 6 18M6 6l12 12" />
                </button>
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="flex-1 min-h-0 overflow-y-auto px-3 mt-4 pb-2">
            <div className="flex items-center justify-between px-2 mb-1.5">
              <span className="text-[9px] uppercase tracking-[0.16em] text-[#9a9186] font-medium">Types</span>
              <button
                onClick={() => setVisibleTypes(visibleTypes.length === ALL_TYPES.length ? [] : ALL_TYPES)}
                className="text-[9px] uppercase tracking-[0.14em] text-[#3b7d6e] cursor-pointer hover:text-[#2d6357] transition-colors font-medium"
              >
                {visibleTypes.length === ALL_TYPES.length ? 'Hide all' : 'Show all'}
              </button>
            </div>
            <div className="flex flex-col gap-px">
              {ALL_TYPES.map((type) => {
                const color = ENTITY_COLORS[type]
                const count = typeCounts[type] || 0
                const active = visibleTypes.includes(type)
                return (
                  <button
                    key={type}
                    onClick={() => toggleType(type)}
                    className={`group w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 cursor-pointer transition-all duration-200 ${
                      active ? 'bg-[#f5f3ef]' : 'hover:bg-[#f5f3ef]/60'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 transition-all duration-200 ${active ? '' : 'opacity-30'}`}
                      style={{ background: color }}
                    />
                    <span className={`text-[12px] capitalize transition-colors duration-200 ${active ? 'text-[#1a1714]' : 'text-[#b5ad9e]'}`}>{type}</span>
                    <span className="flex-1" />
                    <span className={`text-[10px] tabular-nums ${active ? 'text-[#9a9186]' : 'text-[#d4cdc2]'}`}>{count}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Selection */}
          <div className="px-4 pb-4">
            {selectedNode ? (
              <div className="rounded-xl bg-[#f5f3ef] p-3 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0 mt-0.5" style={{ background: selectedColor }} />
                    <div className="min-w-0">
                      <div className="text-[14px] font-medium text-[#1a1714] truncate leading-tight">{selectedNode.label}</div>
                      <div className="text-[10px] text-[#9a9186] mt-0.5 capitalize">{selectedNode.type || 'unknown'}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedId(null)}
                    aria-label="Clear selection"
                    className="w-5 h-5 rounded flex items-center justify-center text-[#9a9186] cursor-pointer hover:text-[#1a1714] hover:bg-black/[0.04] transition-colors shrink-0"
                  >
                    <Icon d="M18 6 6 18M6 6l12 12" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#9a9186] tabular-nums">{neighborIds.size} connections</span>
                  <button
                    onClick={() => focusNode(selectedNode)}
                    className="text-[11px] text-[#3b7d6e] cursor-pointer hover:text-[#2d6357] transition-colors font-medium"
                  >
                    Re-center
                  </button>
                </div>
                {description && (
                  <p className="text-[11px] text-[#6b5f52] leading-relaxed">{description}</p>
                )}
                {neighbors.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {neighbors.slice(0, 6).map((n) => (
                      <button
                        key={n.id}
                        onClick={() => focusNode(n)}
                        className="flex items-center gap-1 rounded-md border border-black/[0.06] bg-white px-2 py-1 text-[10px] text-[#6b5f52] cursor-pointer transition-all hover:border-[#3b7d6e]/30 hover:text-[#3b7d6e] active:scale-95"
                      >
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: n.color || ENTITY_COLORS.unknown }} />
                        <span className="max-w-[100px] truncate">{n.label}</span>
                      </button>
                    ))}
                    {neighborIds.size > neighbors.length && (
                      <span className="flex items-center px-1 text-[10px] text-[#9a9186]">+{neighborIds.size - neighbors.length}</span>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-[11px] text-[#b5ad9e] leading-relaxed px-1">
                Click an entity to inspect its connections.
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-black/[0.04] p-2.5 flex flex-col gap-0.5">
            <button
              onClick={reheat}
              className="group/g w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[12px] text-[#6b5f52] cursor-pointer transition-all duration-200 hover:bg-[#f5f3ef] hover:text-[#1a1714]"
            >
              <Icon d="M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6" className="transition-transform duration-700 group-hover/g:rotate-180" />
              Re-layout
            </button>
            <button
              onClick={() => navigate(-1)}
              className="group/b w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[12px] text-[#b5ad9e] cursor-pointer transition-all duration-200 hover:bg-red-500/[0.04] hover:text-red-500"
            >
              <Icon d="M19 12H5M12 19l-7-7 7-7" />
              Back
            </button>
          </div>
        </div>
      </div>

      {/* ── Graph canvas ── */}
      <div ref={containerRef} className="flex-1 relative z-0 min-w-0">
        <div className={`absolute inset-0 transition-opacity duration-500 ease-out ${ready ? 'opacity-100' : 'opacity-0'}`}>
          <ForceGraph2D
            ref={graphRef}
            graphData={processedData}
            backgroundColor={GRAPH_BG}
            nodeRelSize={1}
            cooldownTicks={300}
            cooldownTime={3500}
            d3AlphaDecay={0.015}
            d3VelocityDecay={0.3}
            linkWidth={linkWidth}
            linkColor={linkColor}
            linkDirectionalParticles={linkDirectionalParticles}
            linkDirectionalParticleSpeed={0.002}
            linkDirectionalParticleWidth={1.2}
            linkDirectionalParticleColor={() => '#1a7a5c'}
            onNodeClick={handleNodeClick}
            onNodeHover={handleNodeHover}
            onBackgroundClick={handleBackgroundClick}
            onEngineStop={handleEngineStop}
            nodeCanvasObjectMode={() => 'replace'}
            nodeCanvasObject={drawNode}
            nodePointerAreaPaint={paintNodeArea}
            linkCanvasObjectMode={() => 'replace'}
            linkCanvasObject={linkCanvasObject}
            onZoom={({ k }: any) => { zoomRef.current = k }}
          />
        </div>

        {/* Loading */}
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#faf9f7]">
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-8 h-8">
                <div className="absolute inset-0 rounded-full border border-black/[0.06]" />
                <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#3b7d6e] animate-spin" />
              </div>
              <div className="text-center">
                <div className="text-[15px] text-[#1a1714] font-medium">Mapping the narrative</div>
                <div className="text-[12px] text-[#9a9186] mt-0.5">Assembling entities & connections</div>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {displayError && !loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#faf9f7] px-4">
            <div className="max-w-sm text-center">
              <div className="text-[16px] text-[#1a1714] font-medium mb-2">Couldn't load the graph</div>
              <p className="text-[13px] text-[#9a9186] leading-relaxed mb-6">{error}</p>
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center gap-2 rounded-lg bg-[#3b7d6e] text-white px-5 py-2.5 text-[13px] font-medium cursor-pointer transition-all duration-200 hover:bg-[#2d6357] active:scale-[0.98]"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        )}

        {/* ── Type filter bar ── */}
        {!loading && !displayError && (
          <div className="absolute top-4 left-4 z-10">
            <div className="inline-flex items-center gap-1 bg-white/80 backdrop-blur-xl border border-black/[0.06] rounded-xl px-2 py-1.5 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.06)]">
              {ALL_TYPES.map((type) => {
                const color = ENTITY_COLORS[type]
                const active = visibleTypes.includes(type)
                return (
                  <button
                    key={type}
                    onClick={() => toggleType(type)}
                    className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] uppercase tracking-[0.08em] font-medium whitespace-nowrap cursor-pointer transition-all duration-200 ${
                      active
                        ? 'bg-[#f5f3ef] text-[#1a1714]'
                        : 'text-[#b5ad9e] hover:text-[#9a9186]'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: active ? color : '#d4cdc2' }} />
                    <span className="hidden sm:inline">{type}</span>
                  </button>
                )
              })}
              <div className="w-px h-4 bg-black/[0.06] mx-0.5" />
              <button
                onClick={() => setVisibleTypes(visibleTypes.length === ALL_TYPES.length ? [] : ALL_TYPES)}
                className="rounded-lg px-2 py-1 text-[10px] uppercase tracking-[0.08em] font-medium whitespace-nowrap cursor-pointer text-[#9a9186] hover:text-[#1a1714] transition-colors"
              >
                {visibleTypes.length === ALL_TYPES.length ? 'All' : `${visibleTypes.length}/${ALL_TYPES.length}`}
              </button>
            </div>
          </div>
        )}

        {/* ── Zoom controls ── */}
        {!loading && !displayError && (
          <div className="absolute top-4 right-4 z-10">
            <div className="inline-flex items-center bg-white/80 backdrop-blur-xl border border-black/[0.06] rounded-xl px-1 py-1 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.06)]">
              <button onClick={() => zoomBy(1.4)} aria-label="Zoom in"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6b5f52] cursor-pointer transition-all duration-200 hover:text-[#1a1714] hover:bg-[#f5f3ef] active:scale-95">
                <Icon d="M12 5v14M5 12h14" strokeWidth={1.75} />
              </button>
              <button onClick={() => zoomBy(1 / 1.4)} aria-label="Zoom out"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6b5f52] cursor-pointer transition-all duration-200 hover:text-[#1a1714] hover:bg-[#f5f3ef] active:scale-95">
                <Icon d="M5 12h14" strokeWidth={1.75} />
              </button>
              <div className="w-px h-4 bg-black/[0.06] mx-0.5" />
              <button onClick={fitGraph} aria-label="Fit graph"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6b5f52] cursor-pointer transition-all duration-200 hover:text-[#1a1714] hover:bg-[#f5f3ef] active:scale-95">
                <Icon d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3" strokeWidth={1.75} />
              </button>
              <button onClick={reheat} aria-label="Re-layout"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6b5f52] cursor-pointer transition-all duration-200 hover:text-[#1a1714] hover:bg-[#f5f3ef] active:scale-95">
                <Icon d="M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6" strokeWidth={1.75} />
              </button>
            </div>
          </div>
        )}

        {/* ── Hint ── */}
        {!loading && !displayError && (
          <div className="absolute bottom-4 right-4 z-10 hidden md:block">
            <div className="rounded-lg bg-white/70 backdrop-blur-xl border border-black/[0.04] px-3 py-1.5 text-[10px] text-[#b5ad9e]">
              Scroll to zoom · Drag to move · Click to inspect
            </div>
          </div>
        )}

        {/* ── Mobile menu button ── */}
        <button
          onClick={() => setSidebarOpen(true)}
          aria-label="Open sidebar"
          className="md:hidden absolute top-4 left-4 z-20 rounded-lg border border-black/[0.06] bg-white/80 backdrop-blur-xl w-9 h-9 flex items-center justify-center text-[#6b5f52] cursor-pointer hover:bg-white transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
      </div>
    </div>
  )
}
