"use client"

import { useState, useEffect } from "react"

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "") || "http://40.192.71.150:8002") + "/api/v1"

export interface PipelineDetailsResponse {
  ok: boolean
  generated_at: string
  range: {
    from: string
    to: string
    preset: string
  }
  filters_applied: {
    pipeline_id: string
  }
  kpis: Array<{
    id: string
    title: string
    value: number
    display: string
    delta: number | null
    delta_label: string | null
    tone: "ok" | "warn" | "neutral" | "bad"
    available: boolean
  }>
  meta: {
    pipeline: {
      pipeline_id: string
      pipeline_name: string
      tenant_id: string
      description: string
      source_tool: string
      source_instance_id: string
      source_schema: string
      etl_tool: string
      etl_instance_id: string
      target_tool: string
      target_instance_id: string
      target_schema: string
      config_json: string
      created_at: string
      updated_at: string
      is_active: number
      is_operational: number
    }
    lineage_item: {
      pipeline_id: string
      pipeline_name: string
      source: string
      etl: string
      target: string
      status: string
      status_key: "healthy" | "degraded" | "failed" | "unknown"
      last_run_at: string
      last_run_age: string
      duration: string
      freshness: string
      freshness_lag_hours: number
      target_rows: number
      data_quality: any
      data_quality_display: string
    }
    last_run: {
      id: string
      pipeline_id: string
      pipeline_name: string
      status: string
      start_time: string
      end_time: string
      duration: number
      tool_name: string
      rows_read: number
      rows_written: number
      error_message: string | null
      execution_mode: string
      triggered_by: string
    }
    assets: Array<{
      id: number
      run_id: string
      asset_role: "SOURCE" | "TARGET"
      system_name: string
      system_type: string
      database_name: string
      schema_name: string
      object_name: string
      object_type: string
      row_count: number
      column_count: number
      size_bytes: number | null
      last_updated_at: string
      observed_at: string
      dataset_id: string
    }>
    freshness: {
      pipeline_id: string
      pipeline_name: string
      source_tool: string
      etl_tool: string
      target_tool: string
      run_id: string
      last_updated_at: string
      last_updated_age: string
      sla_hours: number
      current_lag_hours: number
      current_lag_display: string
      status: string
      status_key: string
    }
    data_quality: {
      available: boolean
      display: string
    }
    schema: {
      status: string
      display: string
      available: boolean
    }
  }
}

export function usePipelineDetails(pipelineId: string | null) {
  const [data, setData] = useState<PipelineDetailsResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!pipelineId) {
      setData(null)
      setLoading(false)
      setError(null)
      return
    }

    const fetchPipelineDetails = async () => {
      setLoading(true)
      setError(null)
      try {
        const apiUrl = `${API_BASE}/pipelines?pipeline_id=${pipelineId}`
        const res = await fetch(apiUrl)
        
        if (!res.ok) {
          throw new Error(`API ${res.status}`)
        }
        
        const json = await res.json()
        
        console.log('Pipeline details response:', json) // Debug log
        
        if (json.ok) {
          setData(json)
        } else {
          throw new Error("Invalid response")
        }
      } catch (err: any) {
        setError(err.message ?? "Failed to fetch pipeline details")
        setData(null)
      } finally {
        setLoading(false)
      }
    }

    fetchPipelineDetails()
  }, [pipelineId])

  return { data, loading, error }
}