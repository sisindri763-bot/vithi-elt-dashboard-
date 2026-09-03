"use client"

import { CheckCircle, AlertTriangle, XCircle, Clock } from "lucide-react"
import type { FreshnessResponse } from "@/hooks/useFreshnessData"

interface MetricCardProps {
  icon: React.ReactNode
  iconBgColor: string
  title: string
  value: string
  percentage?: string
  percentageColor?: string
  progressValue: number
  progressColor: string
  subtitle: string
}

function MetricCard({
  icon,
  iconBgColor,
  title,
  value,
  percentage,
  percentageColor,
  progressValue,
  progressColor,
  subtitle,
}: MetricCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-7 h-7 rounded-lg ${iconBgColor} flex items-center justify-center`}>
          {icon}
        </div>
        <span className="text-xs font-medium text-gray-500">{title}</span>
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-1.5 mb-2">
        <span className="text-2xl font-bold text-gray-900">{value}</span>
        {percentage && (
          <span className={`text-sm font-semibold ${percentageColor}`}>
            {percentage}
          </span>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-1.5">
        <div className="w-full bg-gray-100 rounded-full h-1.5">
          <div
            className={`${progressColor} h-1.5 rounded-full transition-all duration-300`}
            style={{ width: `${progressValue}%` }}
          />
        </div>
      </div>

      {/* Subtitle */}
      <p className="text-[11px] text-gray-400">{subtitle}</p>
    </div>
  )
}

interface FreshnessMetricCardsProps {
  data: FreshnessResponse | null
  loading: boolean
  error: string | null
}

export function FreshnessMetricCards({ data, loading, error }: FreshnessMetricCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 px-4 py-3 animate-pulse">
            <div className="h-7 bg-gray-100 rounded mb-2"></div>
            <div className="h-6 bg-gray-100 rounded mb-2"></div>
            <div className="h-1.5 bg-gray-100 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-sm text-rose-700">
        Error loading freshness metrics: {error || "Unknown error"}
      </div>
    )
  }

  const summary = data.summary
  const kpis = data.kpis

  const freshKpi  = kpis.find((k) => k.id === "fresh")
  const delayedKpi = kpis.find((k) => k.id === "delayed")
  const staleKpi  = kpis.find((k) => k.id === "stale")
  const avgLagKpi = kpis.find((k) => k.id === "avg_lag")

  const totalMonitored = summary.monitored || 1
  const freshPct   = Math.round((summary.fresh   / totalMonitored) * 100)
  const delayedPct = Math.round((summary.delayed / totalMonitored) * 100)
  const stalePct   = Math.round((summary.stale   / totalMonitored) * 100)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
      <MetricCard
        icon={<CheckCircle size={16} className="text-emerald-600" />}
        iconBgColor="bg-emerald-50 border border-emerald-100"
        title={freshKpi?.title || "Fresh"}
        value={String(summary.fresh)}
        percentage={`${freshPct}%`}
        percentageColor="text-emerald-600"
        progressValue={freshPct}
        progressColor="bg-emerald-500"
        subtitle="Within SLA"
      />
      <MetricCard
        icon={<AlertTriangle size={16} className="text-orange-500" />}
        iconBgColor="bg-orange-50 border border-orange-100"
        title={delayedKpi?.title || "Delayed"}
        value={String(summary.delayed)}
        percentage={`${delayedPct}%`}
        percentageColor="text-orange-500"
        progressValue={delayedPct}
        progressColor="bg-orange-400"
        subtitle="Outside SLA"
      />
      <MetricCard
        icon={<XCircle size={16} className="text-rose-600" />}
        iconBgColor="bg-rose-50 border border-rose-100"
        title={staleKpi?.title || "Stale"}
        value={String(summary.stale)}
        percentage={`${stalePct}%`}
        percentageColor="text-rose-600"
        progressValue={stalePct}
        progressColor="bg-rose-500"
        subtitle="No recent updates"
      />
      <MetricCard
        icon={<Clock size={16} className="text-violet-500" />}
        iconBgColor="bg-violet-50 border border-violet-100"
        title={avgLagKpi?.title || "Average Lag"}
        value={avgLagKpi?.display || `${summary.avg_lag_hours.toFixed(1)}h`}
        progressValue={0}
        progressColor="bg-violet-400"
        subtitle="Across all pipelines"
      />
    </div>
  )
}
