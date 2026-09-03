"use client"

import { useState, useEffect } from "react"

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "") || "http://40.192.71.150:8002") + "/api/v1"

export interface FreshnessKPI {
  id: string
  title: string
  value: number
  display: string
  delta: number | null
  delta_label: string | null
  tone: "ok" | "bad" | "neutral"
  available: boolean
}

export interface FreshnessPipeline {
  pipeline_id: string
  pipeline_name: string
  source_tool: string
  etl_tool: string
  target_tool: string
  run_id: string | null
  last_updated_at: string | null
  last_updated_age: string | null
  sla_hours: number
  current_lag_hours: number | null
  current_lag_display: string
  status: string
  status_key: "fresh" | "delayed" | "stale"
}

export interface FreshnessResponse {
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
    preset: string
  }
  kpis: FreshnessKPI[]
  items: FreshnessPipeline[]
  pagination: {
    page: number
    page_size: number
    total: number
  }
  summary: {
    monitored: number
    fresh: number
    delayed: number
    stale: number
    fresh_pct: number
    avg_lag_hours: number
  }
  meta: {
    formula: string
    sla_hours: number
  }
}

interface UseFreshnessDataOptions {
  preset?: string
  pipeline_name?: string
  pipeline_id?: string
  refreshInterval?: number
  refreshKey?: number
}

export function useFreshnessData({
  preset = "24h",
  pipeline_name,
  pipeline_id,
  refreshInterval = 30000,
  refreshKey = 0,
}: UseFreshnessDataOptions = {}) {
  const [data, setData] = useState<FreshnessResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchFreshnessData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams()
      if (preset) params.append("preset", preset)
      if (pipeline_name) params.append("pipeline_name", pipeline_name)
      if (pipeline_id) params.append("pipeline_id", pipeline_id)

      const url = `${API_BASE_URL}/observability/freshness?${params.toString()}`
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`)
      }

      const json = await response.json()

      if (json.ok) {
        setData(json)
      } else {
        throw new Error("Invalid response from API")
      }
    } catch (err: any) {
      console.error("Error fetching freshness data:", err)
      setError(err.message || "Failed to fetch freshness data")
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFreshnessData()

    if (refreshInterval > 0) {
      const intervalId = setInterval(fetchFreshnessData, refreshInterval)
      return () => clearInterval(intervalId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset, pipeline_name, pipeline_id, refreshKey])

  return { data, loading, error, refetch: fetchFreshnessData }
}
