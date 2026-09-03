"use client"

import { useState, useEffect, useCallback } from "react"

const API_BASE_URL = "/api/v1"
const API_BASE = "/api/v1"

export interface VolumeKPI {
  id: string
  title: string
  value: number
  display: string
  delta: number | null
  delta_label: string | null
  tone: "ok" | "bad" | "neutral" | "warn"
  available: boolean
}

export interface VolumeSeriesPoint {
  timestamp: string
  records: number
  bytes: number
  volume_gb: number
}

export interface VolumeByPipeline {
  pipeline_name: string
  records: number
  bytes: number
  share_pct: number
}

export interface VolumeItem {
  pipeline_id: string
  pipeline_name: string
  records: number
  records_display: string
  bytes: number
  bytes_display: string
  pct_change: number | null
  status: string
  status_key: "healthy" | "unknown" | "warning" | "error"
  runs: number
  last_updated_at: string
  last_updated_age: string
}

export interface VolumeResponse {
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
  kpis: VolumeKPI[]
  series: {
    volume_over_time: VolumeSeriesPoint[]
  }
  charts: {
    by_pipeline: VolumeByPipeline[]
  }
  items: VolumeItem[]
  pagination: {
    page: number
    page_size: number
    total: number
  }
  summary: {
    total_rows: number
    total_bytes: number
    prev_rows: number
    prev_bytes: number
  }
  meta: {
    formula: string
    byte_note: string
  }
}

interface UseVolumeDataOptions {
  preset?: string
  pipeline_name?: string
  pipeline_id?: string
  refreshInterval?: number
  refreshKey?: number
}

export function useVolumeData({
  preset = "30d",
  pipeline_name,
  pipeline_id,
  refreshInterval = 0, // Disable auto-refresh by default
  refreshKey = 0,
}: UseVolumeDataOptions = {}) {
  const [data, setData] = useState<VolumeResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [availablePipelines, setAvailablePipelines] = useState<string[]>([])

  const fetchVolumeData = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams()
      if (preset) params.append("preset", preset)
      if (pipeline_name && pipeline_name !== "all") params.append("pipeline_name", pipeline_name)
      if (pipeline_id) params.append("pipeline_id", pipeline_id)

      const url = `${API_BASE_URL}/observability/volume?${params.toString()}`
      
      // Add cache busting parameter to force fresh data
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
        
        // Simple pipeline extraction
        if (json.items && Array.isArray(json.items)) {
          const pipelineNames: string[] = json.items
            .filter((item: any) => item?.pipeline_name)
            .map((item: any) => String(item.pipeline_name))
          
          if (pipelineNames.length > 0) {
            const uniquePipelines: string[] = [...new Set(pipelineNames)]
            setAvailablePipelines(uniquePipelines)
          }
        }
      } else {
        throw new Error("Invalid response from API")
      }
    } catch (err: any) {
      console.error("❌ Error fetching volume data:", err)
      setError(err.message || "Failed to fetch volume data")
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [preset, pipeline_name, pipeline_id])

  useEffect(() => {
    fetchVolumeData()
  }, [fetchVolumeData, refreshKey])

  // Separate effect for refresh interval to avoid dependency issues
  useEffect(() => {
    if (refreshInterval > 0) {
      const intervalId = setInterval(fetchVolumeData, refreshInterval)
      return () => clearInterval(intervalId)
    }
  }, [refreshInterval, fetchVolumeData])

  return { data, loading, error, availablePipelines, refetch: fetchVolumeData }
}