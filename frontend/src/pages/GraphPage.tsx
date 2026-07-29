// pages/GraphPage.tsx
import { useEffect, useMemo, useState } from "react"
import ForceGraph2D from "react-force-graph-2d"
import { useNavigate, useParams } from 'react-router-dom'
import { apiFetch } from "../api/client"


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
  source: string
  target: string
  label?: string
  attributes?: Record<string, unknown>
}

type GraphData = {
  nodes: GraphNode[]
  links: GraphLink[]
}

const ENTITY_COLORS: Record<string, string> = {
  person: "#3b82f6",
  location: "#10b981",
  organization: "#ec4899",
  concept: "#f59e0b",
  artifact: "#8b5cf6",
  unknown: "#94a3b8",
}

export default function GraphPage() {
  const navigate = useNavigate()
  const { projectId } = useParams<{ projectId: string }>()
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] })
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!projectId) { setError("Project ID not found. Please navigate from the dashboard."); setLoading(false); return }
    const fetchGraph = async () => {
      try {
        setLoading(true); setError(null)
        const data = await apiFetch(`/graph?project_id=${encodeURIComponent(projectId)}`)
        setGraphData(data)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load graph"
        console.error("Graph fetch failed:", err)
        setError(errorMessage)
      } finally { setLoading(false) }
    }
    fetchGraph()
  }, [projectId])

  const processedData = useMemo<GraphData>(() => ({
    nodes: graphData.nodes.map((node) => ({ ...node, color: ENTITY_COLORS[node.type || "unknown"] || ENTITY_COLORS.unknown })),
    links: graphData.links,
  }), [graphData])

  return (
    <div className="w-screen h-screen bg-surface flex overflow-hidden">
      <div className="grain-overlay" />
      {/* SIDEBAR */}
      {sidebarOpen && <div className="sidebar-backdrop md:hidden" onClick={() => setSidebarOpen(false)} />}
      <div className={`w-[280px] md:w-[320px] border-r border-border-subtle bg-surface-card/80 backdrop-blur-md p-5 flex flex-col relative z-10 sidebar-overlay md:!static md:!transform-none ${sidebarOpen ? 'open' : ''}`}>
        <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => navigate('/dashboard')}>
          <img src="/lorespring-assets/lorespring-logo.png" alt="LoreSpring" className="w-6 h-6 object-contain anim-float" />
          <h1 className="font-serif text-xl font-semibold text-emerald-700">LoreSpring</h1>
        </div>
        <p className="text-sm text-text-muted mt-2">Narrative memory graph</p>
        <div className="mt-5 flex gap-5">
          <div>
            <div className="text-[10px] text-text-muted">Nodes</div>
            <div className="font-serif text-xl font-light text-text-primary">{processedData.nodes.length}</div>
          </div>
          <div>
            <div className="text-[10px] text-text-muted">Links</div>
            <div className="font-serif text-xl font-light text-text-primary">{processedData.links.length}</div>
          </div>
        </div>
        <div className="text-text-muted text-[10px] uppercase tracking-wider mt-4 mb-2">Legend</div>
        <div className="flex flex-col gap-1.5">
          {Object.entries(ENTITY_COLORS).map(([type, color]) => (
            <div key={type} className="flex items-center gap-2 text-xs text-text-secondary">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }}></div>
              <span className="capitalize">{type}</span>
            </div>
          ))}
        </div>
        <div className={`mt-4 pt-3 border-t border-border-subtle ${!selectedNode ? 'hidden' : ''}`}>
          {selectedNode && (
            <div className="space-y-3">
              <div>
                <div className="font-serif text-lg font-light text-text-primary">{selectedNode.label}</div>
                <span className="inline-block bg-emerald-500/20 border border-emerald-500/30 rounded-full px-2 py-0.5 text-[10px] text-emerald-700 mt-1">
                  {selectedNode.type || "unknown"}
                </span>
              </div>
              <div>
                <div className="text-text-muted text-[10px] uppercase">Description</div>
                <div className="text-text-secondary text-sm leading-relaxed mt-1">
                  {typeof selectedNode.attributes?.description === 'string'
                    ? selectedNode.attributes.description
                    : selectedNode.attributes?.description != null
                    ? String(selectedNode.attributes.description)
                    : 'No description available'}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="mt-auto pt-4">
          <button className="bg-transparent border-none text-text-muted text-xs cursor-pointer hover:text-red-500 transition-colors"
            onClick={() => navigate(-1)}>
            &larr; Back to project
          </button>
        </div>
      </div>

      {/* GRAPH */}
      <div className="flex-1 relative">
        <button className="md:hidden absolute top-3 left-3 z-20 bg-surface-card/80 border border-border-subtle backdrop-blur-sm rounded-lg p-2 cursor-pointer hover:bg-surface-muted transition-colors"
          onClick={() => setSidebarOpen(true)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-secondary">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface z-10">
            <div className="text-center">
              <div className="text-text-muted mb-4">Loading graph...</div>
              <div className="inline-block w-8 h-8 border-4 border-border-subtle border-t-emerald-400 rounded-full animate-spin"></div>
            </div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface z-10">
            <div className="text-center max-w-sm">
              <div className="text-red-500 text-lg mb-2">Error Loading Graph</div>
              <div className="text-text-muted text-sm mb-4">{error}</div>
              <button onClick={() => navigate('/dashboard')}
                className="bg-emerald-700 text-white px-4 py-2 rounded text-sm hover:bg-emerald-600 transition-colors">
                Back to Dashboard
              </button>
            </div>
          </div>
        )}
        <ForceGraph2D
          graphData={processedData}
          backgroundColor="#f4f1eb"
          nodeRelSize={4}
          linkWidth={1.5}
          cooldownTicks={100}
          linkColor={() => "rgba(142,201,154,0.5)"}
          nodeLabel={(node: object) => (node as GraphNode).label}
          onNodeClick={(node: object) => { setSelectedNode(node as GraphNode) }}
          nodeCanvasObject={(node: object, ctx: CanvasRenderingContext2D, globalScale: number) => {
            const n = node as GraphNode
            const fontSize = 12 / globalScale
            ctx.beginPath()
            ctx.arc(n.x || 0, n.y || 0, 7, 0, 2 * Math.PI)
            ctx.fillStyle = n.color || ENTITY_COLORS.unknown
            ctx.shadowBlur = 12
            ctx.shadowColor = n.color || ENTITY_COLORS.unknown
            ctx.fill()
            ctx.shadowBlur = 0
            ctx.beginPath()
            ctx.arc(n.x || 0, n.y || 0, 13, 0, 2 * Math.PI)
            ctx.fillStyle = `${n.color}18`
            ctx.fill()
            if (globalScale > 1.5) {
              ctx.font = `${fontSize}px 'Outfit', sans-serif`
              ctx.fillStyle = "#1a1814"
              ctx.fillText(n.label, (n.x || 0) + 10, (n.y || 0) + 4)
            }
          }}
        />
        <div className="absolute top-5 right-5 bg-surface-card/80 border border-border-subtle backdrop-blur-sm px-4 py-2 rounded-xl text-xs text-text-muted shadow-sm">
          Scroll to zoom · Drag to move
        </div>
      </div>
    </div>
  )
}
