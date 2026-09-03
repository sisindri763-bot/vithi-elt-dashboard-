"use client"

import { Network, CheckCircle, AlertCircle, Database, GitFork } from "lucide-react"
import type { LineageResponse } from "@/hooks/useLineageData"

interface LineageKPICardsProps {
  data: LineageResponse | null
  loading: boolean
  error: string | null
}

export function LineageKPICards({ data, loading, error }: LineageKPICardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-card rounded-xl border border-border px-4 py-3 animate-pulse">
            <div className="h-7 bg-muted rounded mb-2"></div>
            <div className="h-8 bg-muted rounded mb-2"></div>
            <div className="h-4 bg-muted rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-sm text-rose-700">
        Error loading lineage data: {error || "Unknown error"}
      </div>
    )
  }

  const summary = data.summary || {}
  const totalPipelines = summary.total_pipelines || (summary.healthy + summary.degraded + summary.failed) || 0
  const totalNodes = data.meta?.total_nodes || 0
  const totalEdges = data.meta?.total_edges || 0

  const kpiCards = [
    {
      title: "Total Pipelines",
      value: totalPipelines,
      subtitle: "Live tracked nodes",
      icon: <Network size={16} className="text-blue-600" />,
      iconBg: "bg-blue-50 border border-blue-100",
    },
    {
      title: "Healthy", 
      value: summary.healthy || 0,
      subtitle: "Passing runs",
      icon: <CheckCircle size={16} className="text-emerald-600" />,
      iconBg: "bg-emerald-50 border border-emerald-100",
    },
    {
      title: "Failed",
      value: summary.failed || 0,
      subtitle: "Active failures", 
      icon: <AlertCircle size={16} className="text-destructive" />,
      iconBg: "bg-rose-50 border border-rose-100",
    },
    {
      title: "Graph Nodes",
      value: totalNodes,
      subtitle: "Sources & targets",
      icon: <Database size={16} className="text-indigo-600" />,
      iconBg: "bg-indigo-50 border border-indigo-100",
    },
    {
      title: "Dependency Edges", 
      value: totalEdges,
      subtitle: "Data flow connections",
      icon: <GitFork size={16} className="text-teal-600" />,
      iconBg: "bg-teal-50 border border-teal-100",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
      {kpiCards.map((kpi) => (
        <div
          key={kpi.title}
          className="bg-card px-4 py-3 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow"
        >
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-7 h-7 rounded-lg ${kpi.iconBg} flex items-center justify-center`}>
              {kpi.icon}
            </div>
            <span className="text-xs font-medium text-muted-foreground">{kpi.title}</span>
          </div>

          {/* Value */}
          <div className="mb-2">
            <div className="text-2xl font-bold text-foreground tracking-tight">
              {kpi.value}
            </div>
          </div>

          {/* Subtitle */}
          <p className="text-xs text-muted-foreground">{kpi.subtitle}</p>
        </div>
      ))}
    </div>
  )
}