"use client"

import { useState } from "react"
import { Database, Play, Target, Search } from "lucide-react"
import type { LineageResponse } from "@/hooks/useLineageData"

interface LineageTableProps {
  data: LineageResponse | null
  loading: boolean
  error: string | null
  selectedPipeline: string | null
  onPipelineSelect: (pipelineId: string) => void
}

export function LineageTable({ data, loading, error, selectedPipeline, onPipelineSelect }: LineageTableProps) {
  const [statusFilter, setStatusFilter] = useState("All Status")
  const [searchTerm, setSearchTerm] = useState("")

  if (loading) {
    return (
      <div className="bg-card rounded-xl border border-border shadow-sm p-4">
        <div className="animate-pulse">
          <div className="h-6 bg-muted rounded w-1/4 mb-4"></div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-muted rounded mb-2"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="bg-card rounded-xl border border-border shadow-sm p-4">
        <h3 className="text-lg font-semibold text-foreground mb-4">Pipeline Lineage Flows</h3>
        <div className="text-center text-muted-foreground py-8">
          {error ? `Error: ${error}` : "No pipeline data available"}
        </div>
      </div>
    )
  }

  const pipelines = data.items || []
  
  // Filter pipelines
  const filteredPipelines = pipelines.filter(pipeline => {
    const matchesStatus = statusFilter === "All Status" || pipeline.status === statusFilter
    const matchesSearch = pipeline.pipeline_name && pipeline.pipeline_name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "healthy": return "text-emerald-700 bg-emerald-50 border-emerald-200"
      case "degraded": return "text-orange-700 bg-orange-50 border-orange-200"
      case "failed": return "text-rose-700 bg-rose-50 border-rose-200"
      default: return "text-gray-700 bg-gray-50 border-gray-200"
    }
  }

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">
            Pipeline Lineage Flows ({filteredPipelines.length})
          </h3>
          <div className="flex gap-2">
            <button className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded-md">
              Pipeline View
            </button>
            <button className="px-3 py-1 text-xs text-muted-foreground border border-border rounded-md">
              Graph View
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">Status</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm border border-border rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="All Status">All Status</option>
              <option value="Healthy">Healthy</option>
              <option value="Degraded">Degraded</option>
              <option value="Failed">Failed</option>
            </select>
          </div>

          <div className="relative flex-1 max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search pipelines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <button 
            className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
            onClick={() => {
              setStatusFilter("All Status")
              setSearchTerm("")
            }}
          >
            Reset
          </button>
        </div>
      </div>

      <div className="divide-y divide-border">
        {filteredPipelines.map((pipeline, index) => (
          <div
            key={pipeline.pipeline_id}
            className={`p-3 hover:bg-accent cursor-pointer transition-colors ${
              selectedPipeline === pipeline.pipeline_id ? "bg-accent border-l-4 border-l-primary" : ""
            }`}
            onClick={() => onPipelineSelect(pipeline.pipeline_id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Pipeline Number */}
                <div className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                  #{index + 1}
                </div>

                {/* Flow Visualization */}
                <div className="flex items-center gap-1 flex-1 min-w-0">
                  <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 border border-blue-200 rounded text-xs min-w-0">
                    <Database size={10} className="text-blue-600 flex-shrink-0" />
                    <span className="text-blue-700 font-medium truncate">
                      {pipeline.source && typeof pipeline.source === 'string' ? 
                        (pipeline.source.includes('/') ? pipeline.source.split('/')[0] : pipeline.source) : 
                        'Source'}
                    </span>
                  </div>
                  <div className="text-gray-400 text-xs">→</div>
                  <div className="flex items-center gap-1 px-2 py-1 bg-purple-50 border border-purple-200 rounded text-xs min-w-0">
                    <Play size={10} className="text-purple-600 flex-shrink-0" />
                    <span className="text-purple-700 font-medium truncate">{pipeline.pipeline_name || 'Pipeline'}</span>
                  </div>
                  <div className="text-gray-400 text-xs">→</div>
                  <div className="flex items-center gap-1 px-2 py-1 bg-green-50 border border-green-200 rounded text-xs min-w-0">
                    <Target size={10} className="text-green-600 flex-shrink-0" />
                    <span className="text-green-700 font-medium truncate">
                      {pipeline.target && typeof pipeline.target === 'string' ? 
                        (pipeline.target.includes('/') ? pipeline.target.split('/')[0] : pipeline.target) : 
                        'Target'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                {/* Status */}
                <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(pipeline.status || 'unknown')}`}>
                  {pipeline.status || 'Unknown'}
                </span>

                {/* Metrics */}
                <div className="flex items-center gap-3 text-xs">
                  <div className="text-center">
                    <div className="text-foreground font-medium">
                      {pipeline.target_rows ? pipeline.target_rows.toLocaleString() : "0"}
                    </div>
                    <div className="text-muted-foreground">Rows</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-foreground font-medium">
                      {pipeline.duration || "—"}
                    </div>
                    <div className="text-muted-foreground">Duration</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPipelines.length === 0 && (
        <div className="p-8 text-center text-muted-foreground">
          No pipelines match your current filters
        </div>
      )}
    </div>
  )
}