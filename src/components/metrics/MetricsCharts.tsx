"use client"

import type { MetricsResponse } from "@/hooks/useMetricsData"

interface MetricsChartsProps {
  data: MetricsResponse | null
  loading: boolean
  error: string | null
}

// Clean Duration Line Chart
function DurationChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) return null

  const maxDuration = Math.max(...data.map(d => d.duration_seconds))
  const width = 350
  const height = 140
  const padding = 35

  // Group by pipeline for different lines
  const groupedData = data.reduce((acc: any, point) => {
    if (!acc[point.pipeline_name]) acc[point.pipeline_name] = []
    acc[point.pipeline_name].push(point)
    return acc
  }, {})

  const pipelineNames = Object.keys(groupedData)
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6']

  // Format timestamp for display
  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp)
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    } catch {
      return timestamp.split(' ')[0].split('-')[2]
    }
  }

  return (
    <div className="bg-white rounded-lg p-4">
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* Y-axis grid and labels */}
        {[maxDuration, maxDuration * 0.5, 0].map((value, i) => (
          <g key={i}>
            <line
              x1={padding}
              y1={padding + (height - padding * 2) * (i / 2)}
              x2={width - padding}
              y2={padding + (height - padding * 2) * (i / 2)}
              stroke="#f1f5f9"
              strokeWidth="1"
            />
            <text
              x={padding - 8}
              y={padding + (height - padding * 2) * (i / 2) + 4}
              textAnchor="end"
              className="text-xs fill-gray-500"
            >
              {Math.round(value)}s
            </text>
          </g>
        ))}

        {/* X-axis labels */}
        {(() => {
          const allPoints = Object.values(groupedData).flat().sort((a: any, b: any) => 
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          )
          const step = Math.max(1, Math.floor(allPoints.length / 4))
          return allPoints.filter((_: any, index: number) => index % step === 0).map((point: any, index: number) => {
            const totalIndex = allPoints.indexOf(point)
            const x = padding + (totalIndex / Math.max(allPoints.length - 1, 1)) * (width - padding * 2)
            return (
              <text
                key={index}
                x={x}
                y={height - padding + 15}
                textAnchor="middle"
                className="text-xs fill-gray-400"
              >
                {formatTime(point.timestamp)}
              </text>
            )
          })
        })()}

        {/* Lines and points for each pipeline */}
        {Object.entries(groupedData).map(([pipelineName, points]: [string, any], pipelineIndex) => (
          <g key={pipelineName}>
            {/* Line */}
            <polyline
              fill="none"
              stroke={colors[pipelineIndex % colors.length]}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={points.map((point: any, index: number) => {
                const x = padding + (index / Math.max(points.length - 1, 1)) * (width - padding * 2)
                const y = height - padding - (point.duration_seconds / maxDuration) * (height - padding * 2)
                return `${x},${y}`
              }).join(" ")}
            />
            
            {/* Data points */}
            {points.map((point: any, index: number) => {
              const x = padding + (index / Math.max(points.length - 1, 1)) * (width - padding * 2)
              const y = height - padding - (point.duration_seconds / maxDuration) * (height - padding * 2)
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="3"
                  fill={colors[pipelineIndex % colors.length]}
                  stroke="white"
                  strokeWidth="1.5"
                />
              )
            })}
          </g>
        ))}
      </svg>

      {/* Clean Legend */}
      <div className="mt-3 flex flex-wrap gap-4 text-sm">
        {pipelineNames.map((name, index) => (
          <div key={name} className="flex items-center gap-2">
            <div 
              className="w-3 h-0.5 rounded-full" 
              style={{ backgroundColor: colors[index % colors.length] }}
            ></div>
            <span className="text-gray-700">{name}</span>
            <span className="text-gray-400 text-xs">
              ({(groupedData as any)[name].length} runs)
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Clean Success Rate Chart
function SuccessRateChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) return null

  const width = 350
  const height = 140
  const padding = 35

  // Format timestamp for display
  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp)
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    } catch {
      return timestamp.split(' ')[0].split('-')[2]
    }
  }

  return (
    <div className="bg-white rounded-lg p-4">
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* Y-axis grid and labels */}
        {[100, 50, 0].map((value, i) => (
          <g key={i}>
            <line
              x1={padding}
              y1={padding + (height - padding * 2) * (i / 2)}
              x2={width - padding}
              y2={padding + (height - padding * 2) * (i / 2)}
              stroke="#f1f5f9"
              strokeWidth="1"
            />
            <text
              x={padding - 8}
              y={padding + (height - padding * 2) * (i / 2) + 4}
              textAnchor="end"
              className="text-xs fill-gray-500"
            >
              {value}%
            </text>
          </g>
        ))}

        {/* X-axis labels */}
        {data.filter((_, index) => index % Math.max(1, Math.floor(data.length / 4)) === 0).map((point, index) => {
          const originalIndex = data.indexOf(point)
          const x = padding + (originalIndex / Math.max(data.length - 1, 1)) * (width - padding * 2)
          return (
            <text
              key={index}
              x={x}
              y={height - padding + 15}
              textAnchor="middle"
              className="text-xs fill-gray-400"
            >
              {formatTime(point.timestamp)}
            </text>
          )
        })}

        {/* Area fill */}
        <path
          d={`M ${padding} ${height - padding} ${data.map((point, index) => {
            const x = padding + (index / Math.max(data.length - 1, 1)) * (width - padding * 2)
            const y = height - padding - (point.success_rate_pct / 100) * (height - padding * 2)
            return `L ${x} ${y}`
          }).join(' ')} L ${padding + (width - padding * 2)} ${height - padding} Z`}
          fill="url(#successGradient)"
        />

        {/* Success rate line */}
        <polyline
          fill="none"
          stroke="#10b981"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={data.map((point, index) => {
            const x = padding + (index / Math.max(data.length - 1, 1)) * (width - padding * 2)
            const y = height - padding - (point.success_rate_pct / 100) * (height - padding * 2)
            return `${x},${y}`
          }).join(' ')}
        />

        {/* Data points */}
        {data.map((point, index) => {
          const x = padding + (index / Math.max(data.length - 1, 1)) * (width - padding * 2)
          const y = height - padding - (point.success_rate_pct / 100) * (height - padding * 2)
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="3"
              fill="#10b981"
              stroke="white"
              strokeWidth="1.5"
            />
          )
        })}

        {/* Gradient definition */}
        <defs>
          <linearGradient id="successGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.2"/>
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.05"/>
          </linearGradient>
        </defs>
      </svg>

      {/* Success rate summary */}
      <div className="mt-3 text-sm text-gray-600">
        <span className="text-emerald-600 font-medium">
          Avg: {data.length > 0 ? Math.round(data.reduce((sum, d) => sum + d.success_rate_pct, 0) / data.length) : 0}%
        </span>
        {data.length > 0 && (
          <>
            <span className="mx-2">•</span>
            <span>Latest: {Math.round(data[data.length - 1]?.success_rate_pct || 0)}%</span>
          </>
        )}
      </div>
    </div>
  )
}

// Enhanced Pie Chart for Runs by Status
function RunsByStatusChart({ data }: { data: any }) {
  if (!data) return null

  const total = data.success + data.failed + data.running + data.cancelled
  if (total === 0) return <div className="text-center text-gray-500 py-8">No data available</div>

  // Create segments with better colors
  const segments = [
    { name: 'Success', value: data.success, color: '#10b981', lightColor: '#d1fae5' },
    { name: 'Failed', value: data.failed, color: '#ef4444', lightColor: '#fee2e2' },
    { name: 'Running', value: data.running, color: '#3b82f6', lightColor: '#dbeafe' },
    { name: 'Cancelled', value: data.cancelled, color: '#6b7280', lightColor: '#f3f4f6' }
  ].filter(segment => segment.value > 0)

  const size = 200
  const center = size / 2
  const radius = 75

  // Calculate pie slices
  let currentAngle = -90 // Start from top
  const slices = segments.map((segment) => {
    const percentage = (segment.value / total) * 100
    const angle = (percentage / 100) * 360
    
    const startAngleRad = (currentAngle * Math.PI) / 180
    const endAngleRad = ((currentAngle + angle) * Math.PI) / 180
    
    const x1 = center + radius * Math.cos(startAngleRad)
    const y1 = center + radius * Math.sin(startAngleRad)
    const x2 = center + radius * Math.cos(endAngleRad)
    const y2 = center + radius * Math.sin(endAngleRad)
    
    const largeArcFlag = angle > 180 ? 1 : 0
    
    const pathData = [
      `M ${center} ${center}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ')

    // Calculate label position
    const labelAngle = (currentAngle + angle / 2) * Math.PI / 180
    const labelRadius = radius * 0.7
    const labelX = center + labelRadius * Math.cos(labelAngle)
    const labelY = center + labelRadius * Math.sin(labelAngle)

    currentAngle += angle

    return {
      ...segment,
      pathData,
      percentage: Math.round(percentage * 10) / 10,
      labelX,
      labelY,
      showLabel: percentage > 8 // Only show label if slice is big enough
    }
  })

  return (
    <div className="w-full">
      <div className="flex flex-col lg:flex-row items-center gap-6">
        {/* Pie Chart */}
        <div className="flex-shrink-0">
          <div className="relative">
            <svg width={size} height={size} className="drop-shadow-sm">
              {/* Pie slices */}
              {slices.map((slice, index) => (
                <g key={slice.name}>
                  {/* Main slice */}
                  <path
                    d={slice.pathData}
                    fill={slice.color}
                    stroke="white"
                    strokeWidth="3"
                    className="transition-all duration-200 hover:brightness-110"
                    style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                  />
                  
                  {/* Percentage labels on slices */}
                  {slice.showLabel && slice.percentage > 0 && (
                    <text
                      x={slice.labelX}
                      y={slice.labelY}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-xs font-semibold fill-white"
                      style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
                    >
                      {slice.percentage}%
                    </text>
                  )}
                </g>
              ))}
            </svg>
            
            {/* Center total */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center shadow-md border-2 border-gray-100">
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">{total}</div>
                  <div className="text-xs text-gray-500">Total</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Legend and Stats */}
        <div className="flex-1 w-full">
          {/* Summary Stats */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Summary</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-600">Total Runs:</div>
              <div className="font-semibold text-gray-900">{total}</div>
              <div className="text-gray-600">Success Rate:</div>
              <div className="font-semibold text-emerald-600">
                {total > 0 ? Math.round((data.success / total) * 100) : 0}%
              </div>
            </div>
          </div>

          {/* Detailed Legend */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700">Breakdown</h4>
            {segments.map((segment) => {
              const percentage = (segment.value / total) * 100
              return (
                <div key={segment.name} className="flex items-center justify-between p-2 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full shadow-sm border border-white"
                      style={{ backgroundColor: segment.color }}
                    />
                    <span className="text-sm font-medium text-gray-700">{segment.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-900">{segment.value}</div>
                    <div className="text-xs text-gray-500">{Math.round(percentage * 10) / 10}%</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// Clean Duration Distribution Histogram
function DurationDistributionChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) return null

  // Create histogram buckets
  const durations = data.map(d => d.duration_seconds)
  const minDuration = Math.min(...durations)
  const maxDuration = Math.max(...durations)
  const bucketCount = 5 // Reduced from 6 to 5 for better spacing
  const bucketSize = (maxDuration - minDuration) / bucketCount || 1

  const buckets = Array.from({ length: bucketCount }, (_, i) => {
    const start = minDuration + i * bucketSize
    const end = start + bucketSize
    const count = durations.filter(d => d >= start && d < end).length
    return { start: Math.round(start), end: Math.round(end), count }
  })

  const maxCount = Math.max(...buckets.map(b => b.count), 1)
  const width = 450 // Increased width for better spacing
  const height = 140
  const padding = 40 // Increased padding

  // Function to format label text more compactly
  const formatRangeLabel = (start: number, end: number) => {
    if (start === 0 && end <= 60) {
      return `${end}s`
    }
    if (start >= 60 && end >= 60) {
      return `${Math.round(start/60)}-${Math.round(end/60)}m`
    }
    return `${start}-${end}s`
  }

  return (
    <div className="bg-white rounded-lg p-4">
      <svg width="100%" height={height + 20} viewBox={`0 0 ${width} ${height + 20}`}>
        {/* Y-axis grid and labels */}
        {[maxCount, Math.ceil(maxCount / 2), 0].map((value, i) => (
          <g key={i}>
            <line
              x1={padding}
              y1={padding + (height - padding * 2) * (i / 2)}
              x2={width - padding}
              y2={padding + (height - padding * 2) * (i / 2)}
              stroke="#f1f5f9"
              strokeWidth="1"
            />
            <text
              x={padding - 8}
              y={padding + (height - padding * 2) * (i / 2) + 4}
              textAnchor="end"
              className="text-xs fill-gray-500"
            >
              {value}
            </text>
          </g>
        ))}

        {/* Bars */}
        {buckets.map((bucket, index) => {
          const barWidth = (width - padding * 2) / buckets.length - 8
          const barHeight = (bucket.count / maxCount) * (height - padding * 2)
          const x = padding + index * ((width - padding * 2) / buckets.length) + 4
          const y = height - padding - barHeight

          return (
            <g key={index}>
              {/* Bar */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill="#3b82f6"
                rx="3"
              />
              
              {/* Value label on top of bar */}
              {bucket.count > 0 && (
                <text
                  x={x + barWidth / 2}
                  y={y - 5}
                  textAnchor="middle"
                  className="text-xs fill-gray-600 font-medium"
                >
                  {bucket.count}
                </text>
              )}
              
              {/* Compact range label */}
              <text
                x={x + barWidth / 2}
                y={height - padding + 15}
                textAnchor="middle"
                className="text-xs fill-gray-400"
              >
                {formatRangeLabel(bucket.start, bucket.end)}
              </text>
            </g>
          )
        })}
      </svg>

      {/* Distribution summary */}
      <div className="mt-3 text-sm text-gray-600">
        <span>Total runs: <span className="font-medium text-gray-900">{durations.length}</span></span>
        <span className="mx-2">•</span>
        <span>Range: <span className="font-medium text-gray-900">{minDuration}s - {maxDuration}s</span></span>
      </div>
    </div>
  )
}

export function MetricsCharts({ data, loading, error }: MetricsChartsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
            <div className="h-6 bg-gray-100 rounded mb-4 w-1/3"></div>
            <div className="h-40 bg-gray-100 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-sm text-rose-700">
        Error loading metrics charts: {error || "Unknown error"}
      </div>
    )
  }

  const durationData = data.series?.duration || []
  const successRateData = data.series?.success_rate_over_time || []
  const runsByStatus = data.charts?.runs_by_status
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Duration Execution Trends */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-800">Pipeline Execution Trends</h3>
            <p className="text-xs text-gray-500 mt-1">Duration over time by pipeline</p>
          </div>
          <div className="p-2">
            <DurationChart data={durationData} />
          </div>
        </div>

        {/* Success Rate Over Time */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-800">Success Rate Over Time</h3>
            <p className="text-xs text-gray-500 mt-1">Pipeline success percentage trends</p>
          </div>
          <div className="p-2">
            <SuccessRateChart data={successRateData} />
          </div>
        </div>

        {/* Runs by Status Pie Chart */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-800">Runs by Status</h3>
            <p className="text-xs text-gray-500 mt-1">Distribution of pipeline run results</p>
          </div>
          <div className="p-4">
            <RunsByStatusChart data={runsByStatus} />
          </div>
        </div>

        {/* Pipelines by Duration Rankings */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-800">Top Pipelines by Duration</h3>
            <p className="text-xs text-gray-500 mt-1">Pipelines ranked by execution time</p>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {data.charts?.top_by_duration?.slice(0, 5).map((pipeline, index) => (
                <div key={pipeline.pipeline_id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{pipeline.pipeline_name}</div>
                      <div className="text-xs text-gray-500">{pipeline.runs} runs</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-blue-600">{pipeline.duration}</div>
                    <div className="text-xs text-gray-500">avg duration</div>
                  </div>
                </div>
              )) || (
                <div className="text-center py-4 text-sm text-gray-500">No duration data available</div>
              )}
            </div>
          </div>
        </div>

        {/* Duration Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm col-span-1 lg:col-span-2">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-800">Duration Distribution</h3>
            <p className="text-xs text-gray-500 mt-1">Histogram showing execution time distribution</p>
          </div>
          <div className="p-2">
            <DurationDistributionChart data={durationData} />
          </div>
        </div>
    </div>
  )
}