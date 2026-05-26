// pages/GraphPage.tsx
import { useEffect, useMemo, useState } from "react"
import ForceGraph2D from "react-force-graph-2d"
import { useNavigate } from 'react-router-dom'

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
  const [graphData, setGraphData] = useState<GraphData>({
    nodes: [],
    links: [],
  })
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)

  useEffect(() => {
    fetch("http://localhost:8000/graph")
      .then((res) => res.json())
      .then((data: GraphData) => {
        setGraphData(data)
      })
      .catch((err) => {
        console.error("Graph fetch failed:", err)
      })
  }, [])

  const processedData = useMemo<GraphData>(() => {
    return {
      nodes: graphData.nodes.map((node) => ({
        ...node,
        color: ENTITY_COLORS[node.type || "unknown"] || ENTITY_COLORS.unknown,
      })),
      links: graphData.links,
    }
  }, [graphData])

  return (
    <div className="w-screen h-screen bg-[#f7faf7] flex overflow-hidden">
      {/* SIDEBAR */}
      <div className="w-[320px] border-r border-[#c8e6cc] bg-white/80 backdrop-blur-md p-5 flex flex-col">
        <div 
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => navigate('/dashboard')}
        >
          <svg width="22" height="22" viewBox="0 0 30 30" fill="none">
            <path d="M15 3L20 10L27 8L23 15L29 17L22 20L25 27L15 22L5 27L8 20L1 17L7 15L3 8L10 10Z" fill="#22c9a0" opacity="0.85"/>
            <path d="M15 15L13 26L15 28L17 26Z" fill="#0d8c4a"/>
            <ellipse cx="15" cy="12" rx="4" ry="4" fill="#b8f0e0" opacity="0.9"/>
          </svg>
          <h1 className="font-serif text-xl font-semibold text-[#0d8c4a]">
            LoreSpring
          </h1>
        </div>

        <p className="text-sm text-[#6a9e72] mt-2">
          Narrative memory graph
        </p>

        <div className="mt-5 flex gap-5">
          <div>
            <div className="text-[10px] text-[#6a9e72]">Nodes</div>
            <div className="font-serif text-xl font-light text-[#1a3320]">{processedData.nodes.length}</div>
          </div>
          <div>
            <div className="text-[10px] text-[#6a9e72]">Links</div>
            <div className="font-serif text-xl font-light text-[#1a3320]">{processedData.links.length}</div>
          </div>
        </div>

        <div className="text-[#6a9e72] text-[10px] uppercase tracking-wider mt-4 mb-2">Legend</div>
        <div className="flex flex-col gap-1.5">
          {Object.entries(ENTITY_COLORS).map(([type, color]) => (
            <div key={type} className="flex items-center gap-2 text-xs text-[#3d6b48]">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }}></div>
              <span className="capitalize">{type}</span>
            </div>
          ))}
        </div>

        <div className={`mt-4 pt-3 border-t border-[#c8e6cc] ${!selectedNode ? 'hidden' : ''}`}>
          {selectedNode && (
            <div className="space-y-3">
              <div>
                <div className="font-serif text-lg font-light text-[#1a3320]">
                  {selectedNode.label}
                </div>
                <span className="inline-block bg-[#d4f5ed] border border-[#22c9a0]/30 rounded-full px-2 py-0.5 text-[10px] text-[#0d8c6a] mt-1">
                  {selectedNode.type || "unknown"}
                </span>
              </div>
              <div>
                <div className="text-[#6a9e72] text-[10px] uppercase">Description</div>
                <div className="text-[#3d6b48] text-sm leading-relaxed mt-1">
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
          <button 
            className="bg-transparent border-none text-[#6a9e72] text-xs cursor-pointer hover:text-red-500 transition-colors"
            onClick={() => navigate(-1)}
          >
            ← Back to project
          </button>
        </div>
      </div>

      {/* GRAPH */}
      <div className="flex-1 relative">
        <ForceGraph2D
          graphData={processedData}
          backgroundColor="#f7faf7"
          nodeRelSize={4}
          linkWidth={1.5}
          cooldownTicks={100}
          linkColor={() => "rgba(142,201,154,0.5)"}
          nodeLabel={(node: object) => (node as GraphNode).label}
          onNodeClick={(node: object) => {
            setSelectedNode(node as GraphNode)
          }}
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
              ctx.font = `${fontSize}px 'DM Sans', sans-serif`
              ctx.fillStyle = "#1a3320"
              ctx.fillText(n.label, (n.x || 0) + 10, (n.y || 0) + 4)
            }
          }}
        />

        <div className="absolute top-5 right-5 bg-white/80 border border-[#c8e6cc] backdrop-blur-sm px-4 py-2 rounded-xl text-xs text-[#6a9e72] shadow-sm">
          Scroll to zoom · Drag to move
        </div>
      </div>
    </div>
  )
}