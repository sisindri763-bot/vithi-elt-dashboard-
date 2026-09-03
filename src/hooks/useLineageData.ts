"use client"

import { useState, useEffect } from "react"

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "") || "http://40.192.71.150:8002") + "/api/v1"

export interface LineageNode {
  id: string
  type: "source" | "pipeline" | "target"
  label: string
  metadata: any
}

export interface LineageEdge {
  from: string
  to: string
  label: string
}

export interface LineagePipeline {
  pipeline_id: string
  pipeline_name: string
  source: string
  etl: string
  target: string
  status: string
  status_key: "healthy" | "degraded" | "failed" | "unknown"
  last_run_at: string | null
  duration: string | null
  target_rows: number
  freshness: string
}

export interface LineageResponse {
  ok: boolean
  generated_at: string
  range: {
    from: string
    to: string
    preset: string
  }
  summary: {
    healthy: number
    degraded: number
    failed: number
    total_pipelines: number
  }
  meta: {
    nodes: LineageNode[]
    edges: LineageEdge[]
    total_nodes: number
    total_edges: number
  }
  items: LineagePipeline[]
}

interface UseLineageDataOptions {
  preset?: string
  refreshKey?: number
}

export function useLineageData({
  preset = "24h",
  refreshKey = 0,
}: UseLineageDataOptions = {}) {
  const [data, setData] = useState<LineageResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLineageData = async () => {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        params.set("preset", preset)
        
        // Try lineage endpoint first, fallback to pipelines
        const apiUrl = `${API_BASE}/lineage?${params.toString()}`
        const res = await fetch(apiUrl)
        
        if (!res.ok) {
          // Fallback to pipelines endpoint
          const fallbackUrl = `${API_BASE}/pipelines?${params.toString()}`
          const fallbackRes = await fetch(fallbackUrl)
          if (!fallbackRes.ok) throw new Error(`API ${fallbackRes.status}`)
          const fallbackJson = await fallbackRes.json()
          
          if (fallbackJson.ok) {
            setData(fallbackJson)
          } else {
            throw new Error("Invalid response from pipelines API")
          }
        } else {
          const json = await res.json()
          if (json.ok) {
            setData(json)
          } else {
            throw new Error("Invalid response from lineage API")
          }
        }
      } catch (err: any) {
        setError(err.message ?? "Failed to fetch lineage data")
        setData(null)
      } finally {
        setLoading(false)
      }
    }

    fetchLineageData()
  }, [preset, refreshKey])

  return { data, loading, error }
}