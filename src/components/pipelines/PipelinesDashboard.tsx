"use client"

import { useState, useEffect, useRef } from "react"
import {
  DateRangePicker,
  RefreshButton,
  ExportButton,
  MultiPipelineSelect,
} from "@/components/filtering"
import { PipelinesKPICards } from "@/components/pipelines/PipelinesKPICards"
import { PipelinesTable } from "@/components/pipelines/PipelinesTable"
import { PipelineRunsTable } from "@/components/pipelines/PipelineRunsTable"
import { usePipelinesData } from "@/hooks/usePipelinesData"

export default function PipelinesDashboard() {
  const [env, setEnv] = useState("Production")
  const [preset, setPreset] = useState("30d")
  const [refreshKey, setRefreshKey] = useState(0)
  const [selectedPipelines, setSelectedPipelines] = useState<string[]>([]) // Changed to array
  const [selectedPipeline, setSelectedPipeline] = useState<{
    pipeline_id: string
    pipeline_name: string
  } | null>(null)

  // Fetch all pipelines for the table
  const { data: allData } = usePipelinesData({ preset, refreshKey })
  const pipelineList = allData?.items ?? []

  // Get available pipeline names for multi-select
  const availablePipelines = [...new Set(pipelineList.map(p => p.pipeline_name))]

  // Fetch KPIs filtered by selected pipelines
  const { data: kpiData, loading: kpiLoading } = usePipelinesData({
    preset,
    refreshKey,
    pipeline_names: selectedPipelines.length > 0 ? selectedPipelines : undefined,
  })

  const handlePipelinesChange = (pipelines: string[]) => {
    setSelectedPipelines(pipelines)
  }

  const displayTitle = () => {
    if (selectedPipelines.length === 0) {
      return "Pipelines - All"
    } else if (selectedPipelines.length === 1) {
      return `Pipelines - ${selectedPipelines[0]}`
    } else {
      return `Pipelines - ${selectedPipelines.length} Selected`
    }
  }

  return (
    <div className="p-5 bg-gray-50 min-h-screen text-slate-900 space-y-4">

      {/* Environment Header */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Current Environment</h2>
              <p className="text-xs text-gray-500">Active deployment environment</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              {env}
            </span>
            <select
              value={env}
              onChange={(e) => setEnv(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Production">Production</option>
              <option value="Staging">Staging</option>
              <option value="Development">Development</option>
            </select>
          </div>
        </div>
      </div>

      {/* Header + filters */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">{displayTitle()}</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {selectedPipelines.length === 0 
              ? "Monitor the health and performance of your data pipelines."
              : `Monitoring ${selectedPipelines.join(", ")} pipeline${selectedPipelines.length > 1 ? 's' : ''}.`
            }
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Multi Pipeline Selector */}
          <MultiPipelineSelect 
            selectedPipelines={selectedPipelines} 
            onChange={handlePipelinesChange}
            pipelines={availablePipelines}
            loading={false}
          />

          <DateRangePicker
            mode="preset"
            initialPreset={preset}
            onPresetChange={setPreset}
          />
          <RefreshButton onRefresh={() => setRefreshKey((k) => k + 1)} />
          <ExportButton onClick={() => window.print()} />
        </div>
      </div>

      {/* Selected Pipelines Info */}
      {selectedPipelines.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium text-blue-900">
                Filtering by: <span className="font-bold">
                  {selectedPipelines.join(", ")}
                </span>
              </span>
            </div>
            <button
              onClick={() => setSelectedPipelines([])}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear Filter
            </button>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <PipelinesKPICards kpis={kpiData?.kpis ?? []} loading={kpiLoading} />

      {/* Pipelines Table */}
      <PipelinesTable
        preset={preset}
        refreshKey={refreshKey}
        selectedPipelineId={selectedPipeline?.pipeline_id ?? null}
        onSelectPipeline={setSelectedPipeline}
        filterPipelineNames={selectedPipelines.length > 0 ? selectedPipelines : undefined}
      />

      {/* Runs Table — appears when a pipeline is selected */}
      {selectedPipeline && pipelineList.length > 0 && (
        <PipelineRunsTable
          pipelines={pipelineList}
          defaultPipelineId={selectedPipeline.pipeline_id}
        />
      )}

    </div>
  )
}
