"use client"

import { Database, GitFork, Play, Target } from "lucide-react"
import type { LineageResponse } from "@/hooks/useLineageData"

interface LineageGraphProps {
  data: LineageResponse | null
  loading: boolean
  error: string | null
  selectedPipeline: string | null
  onPipelineSelect: (pipelineId: string) => void
}

interface GraphNode {
  id: string
  type: "source" | "pipeline" | "target"
  label: string
  metadata: any
  x: number
  y: number
  status?: string
}

interface GraphEdge {
  from: string
  to: string
  label: string
}

export function LineageGraph({ data, loading, error, selectedPipeline, onPipelineSelect }: LineageGraphProps) {
  if (loading) {
    return (
      <div className="bg-card rounded-xl border border-border shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-muted rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="bg-card rounded-xl border border-border shadow-sm p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Pipeline Lineage Graph</h3>
        <div className="text-center text-muted-foreground py-8">
          {error ? `Error: ${error}` : "No lineage data available"}
        </div>
      </div>
    )
  }

  // Create mock nodes if meta data is not available
  const nodes = data.meta?.nodes || []
  const edges = data.meta?.edges || []

  // If no nodes, create simple visualization from pipeline data
  if (nodes.length === 0 && data.items) {
    const mockNodes: GraphNode[] = []
    const mockEdges: GraphEdge[] = []
    
    data.items.forEach((pipeline, index) => {
      const y = 50 + index * 60
      
      // Source node
      const sourceId = `source-${pipeline.pipeline_id}`
      mockNodes.push({
        id: sourceId,
        type: "source",
        label: pipeline.source || "Unknown Source",
        metadata: {},
        x: 50,
        y,
      })
      
      // Pipeline node  
      const pipelineId = `pipeline-${pipeline.pipeline_id}`
      mockNodes.push({
        id: pipelineId,
        type: "pipeline", 
        label: pipeline.pipeline_name,
        metadata: {},
        x: 300,
        y,
        status: pipeline.status_key,
      })
      
      // Target node
      const targetId = `target-${pipeline.pipeline_id}`
      mockNodes.push({
        id: targetId,
        type: "target",
        label: pipeline.target || "Unknown Target", 
        metadata: {},
        x: 550,
        y,
      })
      
      // Edges
      mockEdges.push({ from: sourceId, to: pipelineId, label: "extract" })
      mockEdges.push({ from: pipelineId, to: targetId, label: "load" })
    })
    
    return (
      <div className="bg-card rounded-xl border border-border shadow-sm">
        <div className="p-4 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">Pipeline Lineage Graph</h3>
        </div>
        
        <div className="p-4">
          <div className="relative bg-muted/20 rounded-lg overflow-auto" style={{ height: "400px" }}>
            <svg width="800" height={Math.max(400, mockNodes.length * 30)} className="absolute inset-0">
              {/* Render edges */}
              {mockEdges.map((edge, index) => {
                const fromNode = mockNodes.find(n => n.id === edge.from)
                const toNode = mockNodes.find(n => n.id === edge.to)
                
                if (!fromNode || !toNode) return null
                
                const x1 = fromNode.x + 100
                const y1 = fromNode.y + 20
                const x2 = toNode.x
                const y2 = toNode.y + 20
                
                return (
                  <g key={index}>
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="#6b7280"
                      strokeWidth="2"
                      markerEnd="url(#arrowhead)"
                    />
                    <text
                      x={(x1 + x2) / 2}
                      y={(y1 + y2) / 2 - 10}
                      textAnchor="middle"
                      className="text-xs fill-gray-500"
                    >
                      {edge.label}
                    </text>
                  </g>
                )
              })}
              
              {/* Arrow marker */}
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon
                    points="0 0, 10 3.5, 0 7"
                    fill="#6b7280"
                  />
                </marker>
              </defs>
            </svg>

            {/* Render nodes */}
            {mockNodes.map((node) => (
              <div
                key={node.id}
                className={`absolute cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedPipeline === node.id.replace("pipeline-", "") ? "ring-2 ring-primary" : ""
                }`}
                style={{
                  left: `${node.x}px`,
                  top: `${node.y}px`,
                  width: "180px",
                }}
                onClick={() => {
                  if (node.type === "pipeline") {
                    const pipelineId = node.id.replace("pipeline-", "")
                    onPipelineSelect(pipelineId)
                  }
                }}
              >
                <div className={`px-3 py-2 rounded-lg border-2 ${getNodeColor(node.type, node.status)} shadow-sm`}>
                  <div className="flex items-center gap-2 mb-1">
                    {getNodeIcon(node.type)}
                    <span className="text-xs font-semibold text-gray-700 uppercase">
                      {node.type}
                    </span>
                    {node.status && (
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        node.status === "healthy" ? "bg-emerald-100 text-emerald-700" :
                        node.status === "degraded" ? "bg-orange-100 text-orange-700" :
                        node.status === "failed" ? "bg-rose-100 text-rose-700" : ""
                      }`}>
                        {node.status}
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {node.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Pipeline Lineage Graph</h3>
      <div className="text-center text-muted-foreground py-8">
        <Database size={48} className="mx-auto mb-4 opacity-30" />
        <p>Lineage visualization will appear here when data is available</p>
      </div>
    </div>
  )
}

function getNodeIcon(type: string) {
  switch (type) {
    case "source": return <Database size={16} className="text-blue-600" />
    case "pipeline": return <Play size={16} className="text-purple-600" />
    case "target": return <Target size={16} className="text-green-600" />
    default: return <GitFork size={16} className="text-gray-600" />
  }
}

function getNodeColor(type: string, status?: string) {
  if (type === "pipeline") {
    switch (status) {
      case "healthy": return "border-emerald-500 bg-emerald-50"
      case "degraded": return "border-orange-500 bg-orange-50"
      case "failed": return "border-rose-500 bg-rose-50"
      default: return "border-gray-300 bg-gray-50"
    }
  }
  
  switch (type) {
    case "source": return "border-blue-300 bg-blue-50"
    case "target": return "border-green-300 bg-green-50"
    default: return "border-gray-300 bg-gray-50"
  }
}