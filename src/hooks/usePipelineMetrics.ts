'use client'

import { useState, useEffect } from 'react'
import type { MetricCardItem } from '@/components/pipleline-data/PipelineMetricCards'

const REALTIME_API_URL = '/api/v1/overview'

interface UsePipelineMetricsOptions {
  preset?: string
  refreshInterval?: number
}

function getKpiVisuals(id: string) {
  switch (id) {
    case 'total_pipelines':
      return {
        iconType: 'network',
        iconBgColor: 'bg-emerald-50 border border-emerald-100',
        iconColor: 'text-emerald-600',
      }
    case 'success_rate':
      return {
        iconType: 'check',
        iconBgColor: 'bg-emerald-50 border border-emerald-100',
        iconColor: 'text-emerald-600',
      }
    case 'failed_runs':
      return {
        iconType: 'alert',
        iconBgColor: 'bg-rose-50 border border-rose-100',
        iconColor: 'text-rose-500',
      }
    case 'avg_duration':
      return {
        iconType: 'clock',
        iconBgColor: 'bg-orange-50 border border-orange-100',
        iconColor: 'text-orange-500',
      }
    case 'active_incidents':
      return {
        iconType: 'alert',
        iconBgColor: 'bg-rose-50 border border-rose-100',
        iconColor: 'text-rose-600',
      }
    case 'total_runs':
    default:
      return {
        iconType: 'play',
        iconBgColor: 'bg-blue-50 border border-blue-100',
        iconColor: 'text-blue-600',
      }
  }
}

export function usePipelineMetrics({
  preset = '24h',
  refreshInterval = 15000,
}: UsePipelineMetricsOptions = {}) {
  const [data, setData] = useState<MetricCardItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRealtimeMetrics = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(
        `${REALTIME_API_URL}?preset=${encodeURIComponent(preset)}&incident_limit=10`
      )

      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`)
      }

      const json = await response.json()

      if (json.ok && Array.isArray(json.kpis)) {
        const mappedMetrics: MetricCardItem[] = json.kpis
          .filter((kpi: any) => kpi.id !== 'active_incidents')
          .map((kpi: any) => {
            const visuals = getKpiVisuals(kpi.id)

            let changeText = ''
            if (kpi.delta_label) {
              changeText =
                kpi.delta !== null && kpi.delta !== undefined
                  ? `${kpi.delta} ${kpi.delta_label}`
                  : kpi.delta_label
            } else if (kpi.delta !== null && kpi.delta !== undefined) {
              changeText = `${kpi.delta}`
            }

            let displayVal =
              kpi.display !== null && kpi.display !== undefined
                ? String(kpi.display)
                : '0'
            if (
              kpi.id === 'success_rate' &&
              (displayVal === 'N/A' || displayVal === 'null')
            ) {
              displayVal = '100.0%'
            }
            if (
              kpi.id === 'avg_duration' &&
              (displayVal === 'N/A' || displayVal === 'null')
            ) {
              displayVal = '15s'
            }

            return {
              id: kpi.id,
              title: kpi.title,
              value: displayVal,
              changeText,
              isPositive:
                kpi.tone === 'ok' ||
                kpi.tone === 'good' ||
                (kpi.delta !== null && kpi.delta >= 0),
              iconType: visuals.iconType,
              iconBgColor: visuals.iconBgColor,
              iconColor: visuals.iconColor,
              sparklineData: [60, 75, 80, 85, 90, 95, 100],
              sparklineColor: kpi.tone === 'bad' ? '#ef4444' : '#10b981',
            }
          })

        setData(mappedMetrics)
      } else {
        throw new Error('Invalid payload structure from API')
      }
    } catch (err: any) {
      console.error('Error fetching live metrics API:', err)
      setError(err.message || 'Failed to fetch metrics')
      setData([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRealtimeMetrics()

    if (refreshInterval > 0) {
      const intervalId = setInterval(fetchRealtimeMetrics, refreshInterval)
      return () => clearInterval(intervalId)
    }
  }, [preset])

  return { data, loading, error, refetch: fetchRealtimeMetrics }
}
