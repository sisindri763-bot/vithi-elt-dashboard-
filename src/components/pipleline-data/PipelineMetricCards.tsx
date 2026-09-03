"use client"

import React from "react"
import {
  Network,
  CheckCircle2,
  PlayCircle,
  AlertCircle,
  Clock,
} from "lucide-react"
import { usePipelineMetrics } from "@/hooks/usePipelineMetrics"

export interface MetricCardItem {
  id: string
  title: string
  value: string
  changeText: string
  isPositive: boolean
  iconType: "network" | "check" | "play" | "alert" | "clock" | string
  iconBgColor: string
  iconColor: string
  sparklineData: number[]
  sparklineColor: string
}

function RenderIcon({ type, className }: { type: string; className: string }) {
  switch (type) {
    case "network":
      return <Network size={20} className={className} />
    case "check":
      return <CheckCircle2 size={20} className={className} />
    case "play":
      return <PlayCircle size={20} className={className} />
    case "alert":
      return <AlertCircle size={20} className={className} />
    case "clock":
      return <Clock size={20} className={className} />
    default:
      return <Network size={20} className={className} />
  }   
}

function Sparkline({
  data,
  color = "#10b981",
  height = 36,
  width = 160,
}: {
  data: number[]
  color?: string
  height?: number
  width?: number
}) {
  if (!data || data.length === 0) return null

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const padding = 6

  const points = data.map((val, idx) => {
    const x = padding + (idx / (data.length - 1)) * (width - padding * 2)
    const y = height - padding - ((val - min) / range) * (height - padding * 2)
    return { x, y }
  })

  const pathPoints = points.map((p) => `${p.x},${p.y}`).join(" ")

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={pathPoints}
      />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="2.25" fill={color} />
      ))}
    </svg>
  )
}

export function SingleMetricCard({ item }: { item: MetricCardItem }) {
  return (
    <div className="bg-white px-3 py-2.5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:shadow-xs transition-shadow">
      <div className="flex items-center justify-between gap-2">
        <div className={`w-7 h-7 rounded-lg ${item.iconBgColor} flex items-center justify-center`}>
          <RenderIcon type={item.iconType} className={`${item.iconColor} !w-3.5 !h-3.5`} />
        </div>
        <span className="text-[11px] font-semibold text-slate-500 text-right leading-tight">{item.title}</span>
      </div>

      <div className="mt-2">
        <div className="text-xl font-bold text-slate-900 tracking-tight">{item.value}</div>
        {item.changeText ? (
          <div
            className={`flex items-center gap-0.5 text-[10px] font-semibold mt-0.5 ${
              item.isPositive ? "text-emerald-600" : "text-rose-600"
            }`}
          >
            <span>{item.isPositive ? "↑" : "↓"}</span>
            <span>{item.changeText}</span>
          </div>
        ) : (
          <div className="h-3.5 mt-0.5" />
        )}
      </div>

      <div className="mt-1.5">
        <Sparkline data={item.sparklineData} color={item.sparklineColor} width={180} height={24} />
      </div>
    </div>
  )
}

export function PipelineMetricCards({
  preset = "24h",
  data: externalData,
  loading: externalLoading,
}: {
  preset?: string
  data?: MetricCardItem[]
  loading?: boolean
}) {
  const internalHook = usePipelineMetrics({ preset, refreshInterval: 15000 })
  const data = externalData ?? internalHook.data
  const loading = externalLoading ?? internalHook.loading

  if (loading && data.length === 0) {
    return (
      <div className="grid grid-cols-5 gap-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-white px-3 py-2.5 rounded-xl border border-slate-200/80 shadow-2xs h-24 animate-pulse flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="w-7 h-7 bg-slate-100 rounded-lg" />
              <div className="w-14 h-3 bg-slate-100 rounded" />
            </div>
            <div className="w-12 h-5 bg-slate-100 rounded mt-1" />
            <div className="w-full h-3 bg-slate-50 rounded" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-5 gap-3">
      {data.map((card) => (
        <SingleMetricCard key={card.id} item={card} />
      ))}
    </div>
  )
}
