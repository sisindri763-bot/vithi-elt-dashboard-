"use client"

import { useState } from "react"
import { MetricsKPICards } from "@/components/metrics/MetricsKPICards"
import { MetricsCharts } from "@/components/metrics/MetricsCharts"
import { MetricsTable } from "@/components/metrics/MetricsTable"
import { DateRangePicker } from "@/components/filtering/DateRangePicker"
import { EnvironmentSelect } from "@/components/filtering/EnvironmentSelect"
import { RefreshButton } from "@/components/filtering/RefreshButton"
import { ExportButton } from "@/components/filtering/ExportButton"
import { CustomPipelineSelect } from "@/components/filtering/CustomPipelineSelect"
import { useMetricsData } from "@/hooks/useMetricsData"

export default function MetricsPage() {
  const [environment, setEnvironment] = useState("Production")
  const [preset, setPreset] = useState<string>("30d")
  const [selectedPipeline, setSelectedPipeline] = useState<string>("all")
  const [refreshKey, setRefreshKey] = useState(0)

  // Fetch metrics data
  const { data, loading, error, availablePipelines } = useMetricsData({ 
    preset, 
    pipeline_name: selectedPipeline,
    refreshKey 
  })

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1)
  }

  const handlePresetChange = (value: string) => {
    setPreset(value)
  }

  const handlePipelineChange = (value: string) => {
    setSelectedPipeline(value)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 space-y-4">
        {/* Header + Filters */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Metrics {selectedPipeline !== "all" && (
                <span className="text-blue-600">- {selectedPipeline}</span>
              )}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {selectedPipeline === "all" 
                ? "Real-time and operational metrics and execution trends directly from backend."
                : `Real-time metrics and execution trends for ${selectedPipeline} pipeline.`
              }
            </p>
          </div>
          <div className="flex items-center gap-2">
            <EnvironmentSelect value={environment} onChange={setEnvironment} />
            <CustomPipelineSelect 
              value={selectedPipeline} 
              onChange={handlePipelineChange}
              pipelines={availablePipelines}
              loading={loading}
            />
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
        <MetricsKPICards data={data} loading={loading} error={error} preset={preset} />

        {/* Charts */}
        <MetricsCharts data={data} loading={loading} error={error} />

        {/* Table */}
        <MetricsTable data={data} loading={loading} error={error} />

        {/* Footer */}
        <div className="flex items-start gap-2 text-xs text-gray-500 bg-blue-50 border border-blue-100 rounded-lg p-3">
          <span className="text-blue-500 mt-0.5">ℹ</span>
          <p>Pipeline metrics show execution performance, duration trends, success rates and operational health over time.</p>
        </div>
      </div>
    </div>
  )
}