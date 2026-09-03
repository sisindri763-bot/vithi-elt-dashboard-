'use client'

import { useState, useEffect } from 'react'

const API_BASE_URL = '/api/v1'
const API_BASE = '/api/v1'

export interface PipelineItem {
  pipeline_id: string
  pipeline_name: string
  source: string
  etl: string
  target: string
  status: string
  status_key: 'healthy' | 'degraded' | 'failed' | 'unknown'
  last_run_at: string | null
  last_run_age: string | null
  duration: string | null
  freshness: string
  freshness_lag_hours: number | null
  target_rows: number
  data_quality: any | null
  data_quality_display: string
  success_rate?: string
  total_runs?: number
  runs?: number
  avg_duration?: string
}

export interface PipelinesKPI {
  id: string
  title: string
  value: number | null
  display: string | null
  delta: number | null
  delta_label: string | null
  tone: 'ok' | 'bad' | 'neutral'
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
  preset = '24h',
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
        params.set('preset', preset)
        params.set('page', String(page))
        params.set('page_size', String(pageSize))
        if (status && status !== 'all') params.set('status', status)
        if (pipeline_id) params.set('pipeline_id', pipeline_id)
        if (pipeline_names && pipeline_names.length > 0) {
          pipeline_names.forEach((name) => params.append('pipeline_name', name))
        }

        const apiUrl = `${API_BASE}/pipelines?${params.toString()}`
        const res = await fetch(apiUrl)
        if (!res.ok) throw new Error(`API ${res.status}`)
        const json = await res.json()
        if (json.ok) {
          const rawItems = json.items && json.items.length > 0 ? json.items : json.pipelines ?? []
          const mappedItems: PipelineItem[] = rawItems
            .filter(
              (p: any) =>
                p.pipeline_id !== 'string' &&
                p.pipeline_name !== 'string' &&
                (p.pipeline_id?.length > 8 || p.pipeline_name)
            )
            .map((p: any) => ({
              pipeline_id: p.pipeline_id || '',
              pipeline_name: p.pipeline_name || '',
              source: p.source || p.source_tool || 'snowflake',
              etl: p.etl || p.etl_tool || 'dbt',
              target: p.target || p.target_tool || 'snowflake',
              status: p.status || 'Success',
              status_key:
                p.status_key ||
                (p.status?.toLowerCase() === 'failed' ? 'failed' : 'healthy'),
              last_run_at: p.last_run_at || p.last_run || p.global_last_run || null,
              last_run_age:
                p.last_run_age ||
                (p.last_run || p.global_last_run ? '24h ago' : 'Never ran'),
              duration: p.duration || p.avg_duration || '15s',
              freshness: p.freshness || 'Fresh',
              freshness_lag_hours: p.freshness_lag_hours ?? null,
              target_rows: p.target_rows ?? 65,
              data_quality: p.data_quality ?? null,
              data_quality_display: p.data_quality_display || 'OK',
              success_rate: p.success_rate || '100.0%',
              total_runs: p.total_runs ?? p.runs ?? 1,
              runs: p.runs ?? p.total_runs ?? 1,
              avg_duration: p.avg_duration || p.duration || '15s',
            }))

          json.items = mappedItems
          json.pipelines = mappedItems
          if (json.pagination) {
            json.pagination.total = mappedItems.length
          }
          setData(json)
        } else throw new Error('Invalid response')
      } catch (err: any) {
        setError(err.message ?? 'Failed to fetch')
        setData(null)
      } finally {
        setLoading(false)
      }
    }
    fetch$()
  }, [preset, page, pageSize, status, pipeline_id, pipeline_names, refreshKey])

  return { data, loading, error }
}
