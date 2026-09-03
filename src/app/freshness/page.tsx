"use client"

import { useState } from "react"
import { FreshnessMetricCards } from "@/components/freshness/FreshnessMetricCards"
import { FreshnessTable } from "@/components/freshness/FreshnessTable"
import { DateRangePicker } from "@/components/filtering/DateRangePicker"
import { EnvironmentSelect } from "@/components/filtering/EnvironmentSelect"
import { RefreshButton } from "@/components/filtering/RefreshButton"
import { ExportButton } from "@/components/filtering/ExportButton"
import { useFreshnessData } from "@/hooks/useFreshnessData"

export default function FreshnessPage() {
  const [environment, setEnvironment] = useState("Production")
  const [preset, setPreset] = useState<"15m" | "24h" | "7d" | "30d" | "all">("24h")
  const [refreshKey, setRefreshKey] = useState(0)

  // Single fetch here — passed down to both cards and table
  const { data, loading, error, refetch } = useFreshnessData({ preset, refreshKey })

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1)
  }

  const handlePresetChange = (value: string) => {
    setPreset(value as "15m" | "24h" | "7d" | "30d" | "all")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 space-y-4">
        {/* Header + Filters */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Data Freshness</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Monitor how up-to-date your data is across all pipelines.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <EnvironmentSelect value={environment} onChange={setEnvironment} />
            <DateRangePicker
              mode="preset"
              initialPreset={preset}
              onPresetChange={handlePresetChange}
            />
            <RefreshButton onRefresh={handleRefresh} />
            <ExportButton />
          </div>
        </div>

        {/* KPI Cards */}
        <FreshnessMetricCards data={data} loading={loading} error={error} />

        {/* Table */}
        <FreshnessTable data={data} loading={loading} error={error} />

        {/* Footer */}
        <div className="flex items-start gap-2 text-xs text-gray-500 bg-blue-50 border border-blue-100 rounded-lg p-3">
          <span className="text-blue-500 mt-0.5">ℹ</span>
          <p>Freshness is calculated based on the time since the last successful update compared to the defined SLA for each pipeline.</p>
        </div>
      </div>
    </div>
  )
}
