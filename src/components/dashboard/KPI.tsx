"use client"

import React, { useState } from "react"
import {
  EnvironmentSelect,
  DateRangePicker,
  RefreshButton,
  ExportButton,
} from "@/components/filtering"
import { PipelineMetricCards } from "@/components/pipleline-data/PipelineMetricCards"

export default function Overview() {
  const [selectedEnv, setSelectedEnv] = useState("Production")
  const [selectedDateRange, setSelectedDateRange] = useState<string>()

  const handleRefresh = () => {
    console.log("Overview data refreshed")
  }

  const handleExport = () => {
    alert("Exporting Overview data...")
  }

  return (
    <div className="p-5 bg-gray-50 min-h-screen text-slate-900 space-y-4">
      
      {/* Header with Title and Filter components */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Overview</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Monitor system health and performance observability.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2">
          <EnvironmentSelect value={selectedEnv} onChange={setSelectedEnv} />
          <DateRangePicker onRangeChange={setSelectedDateRange} />
          <RefreshButton onRefresh={handleRefresh} />
          <ExportButton onClick={handleExport} />
        </div>
      </div>

      {/* 5 KPI Metric Cards from data.ts */}
      <PipelineMetricCards />

    </div>
  )
}
