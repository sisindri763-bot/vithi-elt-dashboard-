"use client"

import { useState } from "react"
import { LineageKPICards } from "@/components/lineage/LineageKPICards"
import { LineageGraph } from "@/components/lineage/LineageGraph"
import { LineageTable } from "@/components/lineage/LineageTable"
import { LineageDetails } from "@/components/lineage/LineageDetails"
import { DateRangePicker } from "@/components/filtering/DateRangePicker"
import { RefreshButton } from "@/components/filtering/RefreshButton"
import { ExportButton } from "@/components/filtering/ExportButton"
import { useLineageData } from "@/hooks/useLineageData"
import { usePipelineDetails } from "@/hooks/usePipelineDetails"

export default function LineagePage() {
  const [environment, setEnvironment] = useState("Production")
  const [preset, setPreset] = useState<string>("30d")
  const [refreshKey, setRefreshKey] = useState(0)
  const [selectedPipeline, setSelectedPipeline] = useState<string | null>(null)

  // Fetch lineage data
  const { data, loading, error } = useLineageData({ 
    preset, 
    refreshKey 
  })

  // Fetch individual pipeline details when selected
  const { data: pipelineDetails, loading: detailsLoading, error: detailsError } = usePipelineDetails(selectedPipeline)

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1)
  }

  const handlePresetChange = (value: string) => {
    setPreset(value)
  }

  const handlePipelineSelect = (pipelineId: string) => {
    console.log('Pipeline selected:', pipelineId) // Debug log
    setSelectedPipeline(pipelineId)
  }

  const handleExport = () => {
    if (!data || !data.items || data.items.length === 0) {
      alert("No data to export")
      return
    }

    try {
      // Create comprehensive CSV content
      const headers = [
        "Pipeline ID",
        "Pipeline Name", 
        "Source",
        "ETL Tool",
        "Target",
        "Status",
        "Status Key",
        "Last Run At",
        "Last Run Age", 
        "Duration",
        "Target Rows",
        "Freshness",
        "Freshness Lag Hours",
        "Data Quality"
      ]

      const csvData = data.items.map(pipeline => [
        pipeline.pipeline_id || "",
        pipeline.pipeline_name || "",
        pipeline.source || "",
        pipeline.etl || "",
        pipeline.target || "",
        pipeline.status || "",
        pipeline.status_key || "",
        pipeline.last_run_at || "",
        pipeline.last_run_age || "",
        pipeline.duration || "",
        pipeline.target_rows?.toString() || "0",
        pipeline.freshness || "",
        pipeline.freshness_lag_hours?.toString() || "",
        pipeline.data_quality_display || ""
      ])

      // Escape CSV fields that contain commas, quotes, or newlines
      const escapeCsvField = (field: string) => {
        if (typeof field !== 'string') return field
        if (field.includes(',') || field.includes('"') || field.includes('\n')) {
          return `"${field.replace(/"/g, '""')}"`
        }
        return field
      }

      // Create CSV content
      const csvContent = [
        headers.join(","),
        ...csvData.map(row => row.map(escapeCsvField).join(","))
      ].join("\n")

      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      
      // Generate filename with current date
      const currentDate = new Date().toISOString().slice(0, 10)
      const filename = `lineage-pipelines-${currentDate}.csv`
      
      link.setAttribute("href", url)
      link.setAttribute("download", filename)
      link.style.visibility = "hidden"
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Clean up the URL object
      URL.revokeObjectURL(url)
      
      console.log(`Exported ${data.items.length} pipelines to ${filename}`)
      
    } catch (error) {
      console.error('Export failed:', error)
      alert("Export failed. Please try again.")
    }
  }

  const selectedPipelineData = data?.items?.find(item => item.pipeline_id === selectedPipeline)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 space-y-4">
        {/* Header + Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Lineage
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">Environment:</span>
              <select
                value={environment}
                onChange={(e) => setEnvironment(e.target.value)}
                className="text-sm border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Production">Production</option>
                <option value="Staging">Staging</option>
                <option value="Development">Development</option>
              </select>
            </div>
            <DateRangePicker
              mode="preset"
              initialPreset={preset}
              onPresetChange={handlePresetChange}
            />
            <RefreshButton onRefresh={handleRefresh} />
            <ExportButton onClick={handleExport} />
          </div>
        </div>

        {/* KPI Cards */}
        <LineageKPICards data={data} loading={loading} error={error} />

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
          {/* Left Side - Lineage Graph and Table */}
          <div className="xl:col-span-3 space-y-4">
            {/* Lineage Graph */}
            <LineageGraph 
              data={data} 
              loading={loading} 
              error={error}
              selectedPipeline={selectedPipeline}
              onPipelineSelect={handlePipelineSelect}
            />

            {/* Pipeline Flows Table */}
            <LineageTable 
              data={data} 
              loading={loading} 
              error={error}
              onPipelineSelect={handlePipelineSelect}
              selectedPipeline={selectedPipeline}
            />
          </div>

          {/* Right Side - Pipeline Details */}
          <div className="xl:col-span-1">
            <LineageDetails 
              pipelineDetails={pipelineDetails}
              loading={detailsLoading}
              error={detailsError}
            />
          </div>
        </div>
      </div>
    </div>
  )
}