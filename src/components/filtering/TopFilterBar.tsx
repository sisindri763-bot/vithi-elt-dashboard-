"use client"

import React from "react"
import { EnvironmentSelect } from "./EnvironmentSelect"
import { DateRangePicker } from "./DateRangePicker"
import { RefreshButton } from "./RefreshButton"
import { ExportButton } from "./ExportButton"
import { AddPipelineButton } from "./AddPipelineButton"

interface TopFilterBarProps {
  onEnvironmentChange?: (env: string) => void
  onRefresh?: () => void
  onExport?: () => void
  onAddPipeline?: () => void
  showAddPipeline?: boolean
}

export function TopFilterBar({
  onEnvironmentChange,
  onRefresh,
  onExport,
  onAddPipeline,
  showAddPipeline = true,
}: TopFilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <EnvironmentSelect onChange={onEnvironmentChange} />
      <DateRangePicker />
      <RefreshButton onRefresh={onRefresh} />
      <ExportButton onClick={onExport} />
      {showAddPipeline && <AddPipelineButton onClick={onAddPipeline} />}
    </div>
  )
}
