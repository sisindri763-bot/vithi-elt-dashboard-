"use client"

import { useState, useEffect, useCallback } from "react"

const API_BASE_URL = "https://etl-pipeline-lemon.vercel.app/api/v1"

export interface MetricsKPI {
  id: string
  title: string
  value: number
  display: string
  delta: number | null
  delta_label: string | null
  tone: "ok" | "bad" | "neutral" | "warn"
  available: boolean
}

export interface DurationPoint {
  timestamp: string
  pipeline_name: string
  duration_seconds: number
}

export interface SuccessRatePoint {
  timestamp: string
  success_rate_pct: number
}

export interface RunsByStatus {
  success: number
  failed: number
  running: number
  cancelled: number
}

export interface PipelineMetric {
  pipeline_id: string
  pipeline_name: string
  tool: string
  status: string
  status_key: "healthy" | "degraded" | "failed" | "unknown"
  last_run_at: string
  last_run_age: string
  duration: string
  avg_duration_seconds: number
  success_rate_pct: number
  avg_freshness_hours: number | null
  avg_freshness_display: string
  runs: number
}

export interface MetricsResponse {
  ok: boolean
  generated_at: string
  range: {
    from: string
    to: string
    preset: string
  }
  filters_applied: {
    pipeline_name: string | null
    pipeline_id: string | null
    tool: string | null
    preset: string
  }
  kpis: MetricsKPI[]
  series: {
    duration: DurationPoint[]
    success_rate_over_time: SuccessRatePoint[]
  }
  charts: {
    runs_by_status: RunsByStatus
    top_by_duration: PipelineMetric[]
  }
  items: PipelineMetric[]
  pagination: {
    page: number
    page_size: number
    total: number
  }
  summary: {
    total_runs: number
    success_runs: number
    failed_runs: number
    success_rate_pct: number
  }
}

interface UseMetricsDataOptions {
  preset?: string
  pipeline_name?: string
  pipeline_id?: string
  refreshInterval?: number
  refreshKey?: number
}

export function useMetricsData({
  preset = "30d",
  pipeline_name,
  pipeline_id,
  refreshInterval = 0,
  refreshKey = 0,
}: UseMetricsDataOptions = {}) {
  const [data, setData] = useState<MetricsResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [availablePipelines, setAvailablePipelines] = useState<string[]>([])

  const fetchMetricsData = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams()
      if (preset) params.append("preset", preset)
      if (pipeline_name && pipeline_name !== "all") params.append("pipeline_name", pipeline_name)
      if (pipeline_id) params.append("pipeline_id", pipeline_id)

      // Update this to the correct API endpoint when you provide it
      const url = `${API_BASE_URL}/metrics?${params.toString()}`
      
      const cacheBuster = `&_t=${Date.now()}`
      const finalUrl = url + cacheBuster
      
      const response = await fetch(finalUrl, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        }
      })

      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`)
      }

      const json = await response.json()

      if (json.ok) {
        setData(json)
        
        // Extract ALL unique pipeline instances for dropdown
        if (json.items && Array.isArray(json.items)) {
          const pipelineInstances = json.items
            .filter((item: any) => item && typeof item.pipeline_name === 'string' && item.pipeline_name.trim() !== '')
            .map((item: any) => {
              // For duplicate names, add ID suffix to distinguish them
              const name = item.pipeline_name as string
              const duplicateCount = json.items.filter((i: any) => i.pipeline_name === name).length
              
              if (duplicateCount > 1) {
                return `${name} (${item.pipeline_id?.slice(0, 8) || 'unknown'})`
              }
              return name
            })

          // Get unique pipeline instances
          const uniquePipelineInstances = [...new Set(pipelineInstances)] as string[]
          
          console.log('📊 Found pipeline instances:', uniquePipelineInstances.length, uniquePipelineInstances)
          
          setAvailablePipelines(prev => {
            const combined = [...new Set([...prev, ...uniquePipelineInstances])]
            return combined.length > prev.length ? combined : prev
          })
        }
      } else {
        throw new Error("Invalid response from API")
      }
    } catch (err: any) {
      console.error("❌ Error fetching metrics data:", err)
      setError(err.message || "Failed to fetch metrics data")
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [preset, pipeline_name, pipeline_id])

  useEffect(() => {
    fetchMetricsData()
  }, [fetchMetricsData, refreshKey])

  useEffect(() => {
    if (refreshInterval > 0) {
      const intervalId = setInterval(fetchMetricsData, refreshInterval)
      return () => clearInterval(intervalId)
    }
  }, [refreshInterval, fetchMetricsData])

  return { data, loading, error, availablePipelines, refetch: fetchMetricsData }
}