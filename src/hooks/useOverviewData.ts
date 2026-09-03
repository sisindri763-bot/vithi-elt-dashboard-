'use client'

import { useState, useEffect } from 'react'

const API_BASE = '/api/v1'

export interface PillarItem {
  id: string
  name: string
  status: string
  score: number | null
  display?: string
  details?: any
}

export interface OverviewKPI {
  id: string
  title: string
  value: number | null
  display: string | null
  delta: number | null
  delta_label: string | null
  tone: string
  available: boolean
}

export interface OverviewPipelineItem {
  pipeline_id: string
  pipeline_name: string
  source_tool?: string
  etl_tool?: string
  target_tool?: string
  status: string
  status_key?: string
  runs?: number
  total_runs?: number
  success_rate?: string
  duration?: string
  avg_duration?: string
  last_run?: string
  last_run_age?: string
}

export interface OverviewResponse {
  ok: boolean
  generated_at: string
  range: {
    from: string
    to: string
    preset: string
  }
  kpis: OverviewKPI[]
  pillars: PillarItem[]
  items: OverviewPipelineItem[]
  pipelines: OverviewPipelineItem[]
  incidents: any[]
  summary: Record<string, any>
  series?: Record<string, any>
  charts?: Record<string, any>
}

export function useOverviewData(preset = '24h', refreshInterval = 15000) {
  const [data, setData] = useState<OverviewResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOverview = async () => {
    try {
      const res = await fetch(`${API_BASE}/overview?preset=${preset}&incident_limit=10`)
      if (!res.ok) throw new Error(`API HTTP ${res.status}`)
      const json = await res.json()
      if (json.ok) {
        setData(json)
      } else {
        throw new Error('API returned invalid payload')
      }
    } catch (err: any) {
      console.error('Failed to fetch overview data:', err)
      setError(err.message || 'Failed to fetch overview')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOverview()
    if (refreshInterval > 0) {
      const timer = setInterval(fetchOverview, refreshInterval)
      return () => clearInterval(timer)
    }
  }, [preset, refreshInterval])

  return { data, loading, error, refetch: fetchOverview }
}
