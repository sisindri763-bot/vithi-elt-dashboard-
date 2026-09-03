"use client"

import { useState, useEffect } from "react"

const API_BASE_URL = "/api/v1"
const API_BASE = "/api/v1"

export interface PipelineRun {
  id: string
  pipeline_id: string
  pipeline_name: string
  status: "success" | "failed" | string
  tool_name: string
  start_time: string | null
  end_time: string | null
  duration: number | null
  duration_display: string | null
  rows_read: number | null
  rows_written: number | null
  rows_added: number | null
  failure_stage: string | null
  failed_node: string | null
  error_class: string | null
  error_message: string | null
  execution_mode: string | null
  triggered_by: string | null
  created_at: string | null
}

export interface PipelineRunsResponse {
  ok: boolean
  items: PipelineRun[]
  pagination: {
    page: number
    page_size: number
    total: number
  }
}

interface UsePipelineRunsOptions {
  pipelineId: string | null
  page?: number
  pageSize?: number
  refreshKey?: number
}

export function usePipelineRuns({
  pipelineId,
  page = 1,
  pageSize = 20,
  refreshKey = 0,
}: UsePipelineRunsOptions) {
  const [data, setData]       = useState<PipelineRunsResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    if (!pipelineId) { setData(null); setLoading(false); return }

    const fetch$ = async () => {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        params.set("page", String(page))
        params.set("page_size", String(pageSize))
        const res = await fetch(`${API_BASE}/pipelines/${pipelineId}/runs?${params}`)
        if (!res.ok) throw new Error(`API ${res.status}`)
        const json = await res.json()
        setData(json)
      } catch (e: any) {
        setError(e.message ?? "Failed to fetch runs")
        setData(null)
      } finally {
        setLoading(false)
      }
    }
    fetch$()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pipelineId, page, pageSize, refreshKey])

  return { data, loading, error }
}