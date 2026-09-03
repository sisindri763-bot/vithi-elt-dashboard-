"use client"

import {
  Network, CheckCircle2, PlayCircle,
  AlertCircle, Clock, AlertTriangle,
} from "lucide-react"
import type { PipelinesKPI } from "@/hooks/usePipelinesData"

const KPI_CONFIG: Record<string, {
  icon: React.ReactNode
  iconBg: string
  iconColor: string
}> = {
  total_pipelines: {
    icon: <Network size={15} />,
    iconBg: "bg-emerald-50 border border-emerald-100",
    iconColor: "text-emerald-700",
  },
  success_rate: {
    icon: <CheckCircle2 size={15} />,
    iconBg: "bg-emerald-50 border border-emerald-100",
    iconColor: "text-emerald-600",
  },
  failed_runs: {
    icon: <AlertCircle size={15} />,
    iconBg: "bg-rose-50 border border-rose-100",
    iconColor: "text-rose-500",
  },
  avg_duration: {
    icon: <Clock size={15} />,
    iconBg: "bg-orange-50 border border-orange-100",
    iconColor: "text-orange-500",
  },
  active_incidents: {
    icon: <AlertTriangle size={15} />,
    iconBg: "bg-rose-50 border border-rose-100",
    iconColor: "text-rose-600",
  },
  total_runs: {
    icon: <PlayCircle size={15} />,
    iconBg: "bg-blue-50 border border-blue-100",
    iconColor: "text-blue-600",
  },
}

function getFallbackConfig(id: string) {
  return KPI_CONFIG[id] ?? {
    icon: <Network size={15} />,
    iconBg: "bg-gray-50 border border-gray-100",
    iconColor: "text-gray-500",
  }
}

function getDeltaColor(tone: string, delta: number | null) {
  if (tone === "bad")  return "text-destructive"
  if (tone === "warn") return "text-orange-500"
  if (tone === "ok" || tone === "good") return "text-emerald-600"
  // neutral — use delta sign
  if (delta !== null) return delta >= 0 ? "text-emerald-600" : "text-destructive"
  return "text-muted-foreground"
}

interface PipelinesKPICardsProps {
  kpis: PipelinesKPI[]
  loading: boolean
}

export function PipelinesKPICards({ kpis, loading }: PipelinesKPICardsProps) {
  const count = kpis.length || 5

  if (loading) {
    return (
      <div className={`grid grid-cols-${count} gap-3`}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="bg-card px-3 py-2.5 rounded-xl border border-border shadow-sm animate-pulse h-24" />
        ))}
      </div>
    )
  }

  if (!kpis || kpis.length === 0) return null

  return (
    <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${kpis.length}, minmax(0, 1fr))` }}>
      {kpis.map((kpi) => {
        const config     = getFallbackConfig(kpi.id)
        const deltaColor = getDeltaColor(kpi.tone, kpi.delta)

        return (
          <div
            key={kpi.id}
            className="bg-card px-3 py-2.5 rounded-xl border border-border shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-2">
              <div className={`w-7 h-7 rounded-lg ${config.iconBg} flex items-center justify-center ${config.iconColor}`}>
                {config.icon}
              </div>
              <span className="text-[11px] font-semibold text-right leading-tight text-muted-foreground">
                {kpi.title}
              </span>
            </div>

            {/* Value */}
            <div className="mt-2">
              <div className="text-xl font-bold text-foreground tracking-tight">
                {kpi.display ?? (kpi.value !== null ? String(kpi.value) : "N/A")}
              </div>
              {kpi.delta !== null && kpi.delta_label ? (
                <div className={`text-[10px] font-medium mt-1 ${deltaColor}`}>
                  {kpi.delta >= 0 ? "+" : ""}{kpi.delta} {kpi.delta_label}
                </div>
              ) : (
                <div className="h-4 mt-1" />
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
