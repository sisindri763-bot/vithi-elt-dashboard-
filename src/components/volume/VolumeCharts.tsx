"use client"

import { useState } from "react"
import type { VolumeResponse } from "@/hooks/useVolumeData"

interface VolumeChartsProps {
  data: VolumeResponse | null
  loading: boolean
  error: string | null
}

function formatTimestamp(ts: string): string {
  try {
    const date = new Date(ts)
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric"
    })
  } catch {
    return ts
  }
}

function SimpleLineChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) return null

  const maxRecords = Math.max(...data.map(d => d.records))
  const minRecords = Math.min(...data.map(d => d.records))
  const width = 700
  const height = 300
  const padding = 60

  return (
    <div className="bg-gray-50 rounded-lg p-4 relative">
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: "visible" }}>
        {/* Y-axis grid lines and labels */}
        {[maxRecords, maxRecords * 0.75, maxRecords * 0.5, maxRecords * 0.25, 0].map((value, i) => (
          <g key={i}>
            <line
              x1={padding}
              y1={padding + (height - padding * 2) * (i / 4)}
              x2={width - padding}
              y2={padding + (height - padding * 2) * (i / 4)}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
            <text
              x={padding - 15}
              y={padding + (height - padding * 2) * (i / 4) + 4}
              textAnchor="end"
              style={{
                fontSize: "12px",
                fill: "#6b7280",
                fontFamily: "system-ui, -apple-system, sans-serif"
              }}
            >
              {Math.round(value).toLocaleString()}
            </text>
          </g>
        ))}
        
        {/* X-axis labels */}
        {data.map((point, index) => {
          if (index % Math.max(1, Math.ceil(data.length / 6)) === 0 || index === data.length - 1) {
            const x = padding + (index / Math.max(data.length - 1, 1)) * (width - padding * 2)
            return (
              <text
                key={index}
                x={x}
                y={height - padding + 20}
                textAnchor="middle"
                style={{
                  fontSize: "11px",
                  fill: "#6b7280",
                  fontFamily: "system-ui, -apple-system, sans-serif"
                }}
              >
                {formatTimestamp(point.timestamp)}
              </text>
            )
          }
          return null
        })}
        
        {/* Line path */}
        <polyline
          fill="none"
          stroke="#3b82f6"
          strokeWidth="3"
          points={data.map((point, index) => {
            const x = padding + (index / Math.max(data.length - 1, 1)) * (width - padding * 2)
            const y = height - padding - (point.records / Math.max(maxRecords, 1)) * (height - padding * 2)
            return `${x},${y}`
          }).join(" ")}
        />
        
        {/* Data points with enhanced visibility */}
        {data.map((point, index) => {
          const x = padding + (index / Math.max(data.length - 1, 1)) * (width - padding * 2)
          const y = height - padding - (point.records / Math.max(maxRecords, 1)) * (height - padding * 2)
          return (
            <g key={index}>
              <circle
                cx={x}
                cy={y}
                r="5"
                fill="#3b82f6"
                stroke="white"
                strokeWidth="2"
                style={{ cursor: "pointer" }}
              />
              {/* Always visible value labels for key points */}
              {(point.records > 0 || index === 0 || index === data.length - 1) && (
                <text
                  x={x}
                  y={y - 15}
                  textAnchor="middle"
                  style={{
                    fontSize: "11px",
                    fill: "#1f2937",
                    fontWeight: "600",
                    fontFamily: "system-ui, -apple-system, sans-serif"
                  }}
                >
                  {point.records.toLocaleString()}
                </text>
              )}
            </g>
          )
        })}
      </svg>
      
      {/* Enhanced Summary Stats */}
      <div className="mt-6 grid grid-cols-4 gap-4 text-center">
        <div className="bg-white rounded-lg p-3 border">
          <div className="text-lg font-bold text-blue-600">{maxRecords.toLocaleString()}</div>
          <div className="text-xs text-gray-500">Peak Records</div>
        </div>
        <div className="bg-white rounded-lg p-3 border">
          <div className="text-lg font-bold text-gray-600">{minRecords.toLocaleString()}</div>
          <div className="text-xs text-gray-500">Low Records</div>
        </div>
        <div className="bg-white rounded-lg p-3 border">
          <div className="text-lg font-bold text-emerald-600">{data.length}</div>
          <div className="text-xs text-gray-500">Data Points</div>
        </div>
        <div className="bg-white rounded-lg p-3 border">
          <div className="text-lg font-bold text-purple-600">{data.reduce((sum, p) => sum + p.records, 0).toLocaleString()}</div>
          <div className="text-xs text-gray-500">Total Records</div>
        </div>
      </div>
    </div>
  )
}

function PipelineProgressBar({ pipeline, maxRecords }: { pipeline: any; maxRecords: number }) {
  return (
    <div className="flex items-center justify-between py-3 hover:bg-gray-50 rounded-lg px-3 transition-colors border-b border-gray-100 last:border-b-0">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-gray-900 truncate">
            {pipeline.pipeline_name}
          </div>
          <div className="text-xs text-gray-500">
            {pipeline.share_pct.toFixed(1)}% of total volume
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4 ml-4">
        <div className="text-right">
          <div className="text-lg font-bold text-gray-900">{pipeline.records.toLocaleString()}</div>
          <div className="text-xs text-gray-500">records processed</div>
        </div>
        <div className="w-32 h-4 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-400 to-blue-500 transition-all duration-700 flex items-center justify-end pr-2"
            style={{ width: `${Math.min(Math.max(pipeline.share_pct, 5), 100)}%` }}
          >
            <span className="text-[10px] font-bold text-white">
              {pipeline.share_pct.toFixed(0)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function VolumeCharts({ data, loading, error }: VolumeChartsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
          <div className="h-6 bg-gray-100 rounded mb-4 w-1/3"></div>
          <div className="h-40 bg-gray-100 rounded"></div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
          <div className="h-6 bg-gray-100 rounded mb-4 w-1/3"></div>
          <div className="h-40 bg-gray-100 rounded"></div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-sm text-rose-700">
        Error loading volume charts: {error || "Unknown error"}
      </div>
    )
  }

  const timeSeriesData = data.series?.volume_over_time || []
  const pipelineData = data.charts?.by_pipeline || []
  const totalRecords = data.summary?.total_rows || 0
  const maxRecords = Math.max(...pipelineData.map(p => p.records))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Volume Ingestion Over Time */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-800">Volume Ingestion Over Time (Records)</h3>
              <p className="text-xs text-gray-500 mt-1">Record count trends over the selected period</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-blue-600">{totalRecords.toLocaleString()}</div>
              <div className="text-xs text-gray-500">Total Records</div>
            </div>
          </div>
        </div>
        <div className="p-4">
          {timeSeriesData.length > 0 ? (
            <SimpleLineChart data={timeSeriesData} />
          ) : (
            <div className="h-40 flex flex-col items-center justify-center text-gray-400 text-sm">
              <div className="text-base mb-2">📊</div>
              <div>No time series data available</div>
              <div className="text-xs mt-1">Try selecting a different time range</div>
            </div>
          )}
        </div>
      </div>

      {/* Top Records by Pipeline */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-800">Top Records by Pipeline</h3>
              <p className="text-xs text-gray-500 mt-1">Pipeline contribution to total record volume</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-emerald-600">{pipelineData.length}</div>
              <div className="text-xs text-gray-500">Active Pipelines</div>
            </div>
          </div>
        </div>
        <div className="p-4">
          {pipelineData.length > 0 ? (
            <div className="space-y-2">
              {pipelineData
                .sort((a, b) => b.records - a.records)
                .map((pipeline, index) => (
                <PipelineProgressBar key={index} pipeline={pipeline} maxRecords={maxRecords} />
              ))}
              
              {/* Total Summary */}
              <div className="mt-4 pt-3 border-t border-gray-200 bg-blue-50 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-blue-900">Total Across All Pipelines</span>
                  <span className="text-lg font-bold text-blue-700">
                    {pipelineData.reduce((sum, p) => sum + p.records, 0).toLocaleString()} records
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-40 flex flex-col items-center justify-center text-gray-400 text-sm">
              <div className="text-base mb-2">🔍</div>
              <div>No pipeline data available</div>
              <div className="text-xs mt-1">Check your data source</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}