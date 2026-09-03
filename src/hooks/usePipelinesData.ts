"use client"

import { useState, useEffect } from "react"

const API_BASE = "https://etl-pipeline-lemon.vercel.app/api/v1"

export interface PipelineItem {
  pipeline_id: string
  pipeline_name: string
  source: string
  etl: string
  target: string
  status: string
  status_key: "healthy" | "degraded" | "failed" | "unknown"
  last_run_at: string | null
  last_run_age: string | null
  duration: string | null
  freshness: string
  freshness_lag_hours: number | null
  target_rows: number
  data_quality: any | null
  data_quality_display: string
}

export interface PipelinesKPI {
  id: string
  title: string
  value: number | null
  display: string | null
  delta: number | null
  delta_label: string | null
  tone: "ok" | "bad" | "neutral"
  available: boolean
}

export interface PipelinesResponse {
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
  kpis: PipelinesKPI[]
  series: Record<string, any>
  charts: Record<string, any>
  items: PipelineItem[]
  pagination: {
    page: number
    page_size: number
    total: number
  }
  pillars: any[]
  incidents: any[]
  pipelines: PipelineItem[]
  health: any[]
  summary: {
    healthy: number
    degraded: number
    failed: number
    sources: number
  }
  meta: {
    nodes: any[]
    edges: any[]
    total_nodes: number
    total_edges: number
  }
}

interface UsePipelinesDataOptions {
  preset?: string
  page?: number
  pageSize?: number
  status?: string
  pipeline_id?: string
  pipeline_names?: string[]
  refreshKey?: number
}

export function usePipelinesData({
  preset = "24h",
  page = 1,
  pageSize = 10,
  status,
  pipeline_id,
  pipeline_names,
  refreshKey = 0,
}: UsePipelinesDataOptions = {}) {
  const [data, setData] = useState<PipelinesResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetch$ = async () => {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        params.set("preset", preset)
        params.set("page", String(page))
        params.set("page_size", String(pageSize))
        if (status && status !== "all") params.set("status", status)
        if (pipeline_id) params.set("pipeline_id", pipeline_id)
        if (pipeline_names && pipeline_names.length > 0) {
          pipeline_names.forEach(name => params.append("pipeline_name", name))
        }

        const apiUrl = `${API_BASE}/pipelines?${params.toString()}`
        const res = await fetch(apiUrl)
        if (!res.ok) throw new Error(`API ${res.status}`)
        const json = await res.json()
        if (json.ok) {
          // Filter out bad test data (Swagger placeholder pipelines)
          json.items = (json.items ?? []).filter(
            (p: PipelineItem) =>
              p.pipeline_id !== "string" &&
              p.pipeline_name !== "string" &&
              p.pipeline_id?.length > 8
          )
          setData(json)
        }
        else throw new Error("Invalid response")
      } catch (err: any) {
        setError(err.message ?? "Failed to fetch")
        setData(null)
      } finally {
        setLoading(false)
      }
    }
    fetch$()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset, page, pageSize, status, pipeline_id, pipeline_names, refreshKey])

  return { data, loading, error }
}
