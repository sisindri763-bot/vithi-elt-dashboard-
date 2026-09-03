"use client"

import { Clock, Play, AlertTriangle, CheckCircle, Activity, Timer } from "lucide-react"
import type { MetricsResponse } from "@/hooks/useMetricsData"

interface MetricCardProps {
  icon: React.ReactNode
  iconBgColor: string
  title: string
  value: string
  changeText?: string
  changeColor?: string
  subtitle: string
  tone?: string
}

function MetricCard({
  icon,
  iconBgColor,
  title,
  value,
  changeText,
  changeColor,
  subtitle,
  tone,
}: MetricCardProps) {
  const isWarning = tone === "warn"
  const isBad = tone === "bad"
  
  let cardClassName = "bg-white border border-gray-200 hover:shadow-md transition-shadow duration-200"
  
  if (isBad) {
    cardClassName = "bg-red-50 border-2 border-red-200 hover:border-red-300 hover:shadow-md transition-all duration-200"
  } else if (isWarning) {
    cardClassName = "bg-orange-50 border-2 border-orange-200 hover:border-orange-300 hover:shadow-md transition-all duration-200"
  }
    
  return (
    <div className={`rounded-xl px-4 py-3 shadow-sm ${cardClassName}`}>
      {/* Tone indicator */}
      {(isWarning || isBad) && (
        <div className="flex items-center gap-1.5 mb-2">
          <span className={`text-xs ${isBad ? 'text-destructive' : 'text-orange-500'}`}>
            {isBad ? '🔴' : '⚠️'}
          </span>
          <span className={`text-xs font-medium ${isBad ? 'text-destructive' : 'text-orange-700'}`}>
            {isBad ? 'Alert' : 'Warning'}
          </span>
        </div>
      )}
      
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-7 h-7 rounded-lg ${iconBgColor} flex items-center justify-center`}>
          {icon}
        </div>
        <span className="text-xs font-medium text-muted-foreground">{title}</span>
      </div>

      {/* Value */}
      <div className="flex flex-col mb-2">
        <span className="text-2xl font-bold text-foreground">{value}</span>
        {changeText && (
          <span className={`text-xs font-medium mt-1 ${changeColor}`}>
            {changeText}
          </span>
        )}
      </div>

      {/* Subtitle */}
      <p className="text-xs text-muted-foreground">{subtitle}</p>
    </div>
  )
}

interface MetricsKPICardsProps {
  data: MetricsResponse | null
  loading: boolean
  error: string | null
  preset?: string
}

export function MetricsKPICards({ data, loading, error, preset }: MetricsKPICardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 px-4 py-3 animate-pulse">
            <div className="h-7 bg-gray-100 rounded mb-2"></div>
            <div className="h-6 bg-gray-100 rounded mb-2"></div>
            <div className="h-3 bg-gray-100 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-sm text-rose-700">
        Error loading metrics: {error || "Unknown error"}
      </div>
    )
  }

  const kpis = data.kpis

  const getChangeColor = (tone: string, delta: number | null) => {
    if (tone === "bad") return "text-destructive"
    if (tone === "warn") return "text-orange-600"
    if (tone === "ok") return "text-emerald-600"
    if (delta !== null && delta !== 0) {
      return delta > 0 ? "text-emerald-600" : "text-destructive"
    }
    return "text-muted-foreground"
  }

  const getChangeText = (kpi: any) => {
    if (kpi.delta !== null && kpi.delta !== undefined) {
      const sign = kpi.delta >= 0 ? "+" : ""
      const deltaText = `${sign}${kpi.delta}`
      const labelText = kpi.delta_label ? ` ${kpi.delta_label}` : ""
      return `${deltaText}${labelText}`
    }
    return kpi.delta_label || ""
  }

  // Get dynamic time range text based on API data or preset
  const getTimeRangeText = () => {
    if (data?.range?.preset) {
      const apiPreset = data.range.preset
      switch (apiPreset) {
        case "15m": return "Last 15 minutes"
        case "1h": return "Last hour"
        case "24h": return "Last 24 hours"
        case "7d": return "Last 7 days"
        case "30d": return "Last 30 days"
        case "90d": return "Last 90 days"
        default: return `Last ${apiPreset}`
      }
    }
    
    // Fallback to preset prop
    if (preset) {
      switch (preset) {
        case "15m": return "Last 15 minutes"
        case "1h": return "Last hour"
        case "24h": return "Last 24 hours"
        case "7d": return "Last 7 days"
        case "30d": return "Last 30 days"
        case "90d": return "Last 90 days"
        default: return `Last ${preset}`
      }
    }
    
    return "Last 30 days" // Default fallback
  }

  const timeRangeText = getTimeRangeText()

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {kpis.map((kpi) => {
        const changeColor = getChangeColor(kpi.tone, kpi.delta)
        const changeText = getChangeText(kpi)
        
        // Dynamic icon selection with tone-based styling
        let icon = <Clock size={16} />
        let iconBg = "bg-blue-50 border border-blue-100"
        
        switch (kpi.id) {
          case "avg_duration":
            icon = <Clock size={16} className="text-blue-600" />
            iconBg = "bg-blue-50 border border-blue-100"
            break
          case "runs":
            icon = <Play size={16} className="text-purple-600" />
            iconBg = "bg-purple-50 border border-purple-100"
            break
          case "failed_runs":
            icon = <AlertTriangle size={16} className="text-red-600" />
            iconBg = "bg-red-50 border border-red-100"
            break
          case "success_rate":
            if (kpi.tone === "warn") {
              icon = <CheckCircle size={16} className="text-orange-600" />
              iconBg = "bg-orange-50 border border-orange-100"
            } else {
              icon = <CheckCircle size={16} className="text-emerald-600" />
              iconBg = "bg-emerald-50 border border-emerald-100"
            }
            break
          case "avg_freshness":
            icon = <Timer size={16} className="text-indigo-600" />
            iconBg = "bg-indigo-50 border border-indigo-100"
            break
          case "run_frequency":
            icon = <Activity size={16} className="text-teal-600" />
            iconBg = "bg-teal-50 border border-teal-100"
            break
          default:
            icon = <Clock size={16} className="text-gray-600" />
            iconBg = "bg-gray-50 border border-gray-100"
        }

        return (
          <MetricCard
            key={kpi.id}
            icon={icon}
            iconBgColor={iconBg}
            title={kpi.title}
            value={kpi.display}
            changeText={changeText}
            changeColor={changeColor}
            subtitle={kpi.available ? timeRangeText : "Not available"}
            tone={kpi.tone}
          />
        )
      })}
    </div>
  )
}