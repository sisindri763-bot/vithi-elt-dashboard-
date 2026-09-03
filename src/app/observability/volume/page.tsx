"use client"

import { useState, useEffect } from "react"
import { VolumeMetricCards } from "@/components/volume/VolumeMetricCards"
import { VolumeCharts } from "@/components/volume/VolumeCharts"
import { VolumeTable } from "@/components/volume/VolumeTable"
import { DateRangePicker } from "@/components/filtering/DateRangePicker"
import { EnvironmentSelect } from "@/components/filtering/EnvironmentSelect"
import { RefreshButton } from "@/components/filtering/RefreshButton"
import { CustomPipelineSelect } from "@/components/filtering/CustomPipelineSelect"
import { ExportButton } from "@/components/filtering/ExportButton"
import { useVolumeData } from "@/hooks/useVolumeData"

export default function VolumePage() {
  const [environment, setEnvironment] = useState("Production")
  const [preset, setPreset] = useState<string>("30d")
  const [selectedPipeline, setSelectedPipeline] = useState<string>("all")
  const [refreshKey, setRefreshKey] = useState(0)

  // Fetch volume data with better error handling
  const { data, loading, error, availablePipelines = [], refetch } = useVolumeData({ 
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

  // Reset pipeline selection if it's not available in the current list
  useEffect(() => {
    if (selectedPipeline !== "all" && availablePipelines.length > 0 && !availablePipelines.includes(selectedPipeline)) {
      setSelectedPipeline("all")
    }
  }, [availablePipelines, selectedPipeline])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 space-y-4">
        {/* Header + Filters */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Volume {selectedPipeline !== "all" && (
                <span className="text-blue-600">- {selectedPipeline}</span>
              )}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {selectedPipeline === "all" 
                ? "Monitor the volume of data flowing through your pipelines."
                : `Monitor the volume of data flowing through ${selectedPipeline} pipeline.`
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
        <VolumeMetricCards data={data} loading={loading} error={error} />

        {/* Charts */}
        <VolumeCharts data={data} loading={loading} error={error} />

        {/* Table */}
        <VolumeTable data={data} loading={loading} error={error} />

        {/* Footer */}
        <div className="flex items-start gap-2 text-xs text-gray-500 bg-blue-50 border border-blue-100 rounded-lg p-3">
          <span className="text-blue-500 mt-0.5">ℹ</span>
          <p>Volume metrics show data ingestion rates, record counts, and pipeline throughput over time.</p>
        </div>
      </div>
    </div>
  )
}