"use client"

import React from "react"
import { SearchFilterInput } from "./SearchFilterInput"
import { FilterDropdown } from "./FilterDropdown"
import { Filter } from "lucide-react"

interface FilterBarProps {
  searchTerm: string
  onSearchChange: (val: string) => void
  status: string
  onStatusChange: (val: string) => void
  source: string
  onSourceChange: (val: string) => void
  destination: string
  onDestinationChange: (val: string) => void
  owner: string
  onOwnerChange: (val: string) => void
  schedule: string
  onScheduleChange: (val: string) => void
  onClear: () => void
}

export function FilterBar({
  searchTerm,
  onSearchChange,
  status,
  onStatusChange,
  source,
  onSourceChange,
  destination,
  onDestinationChange,
  owner,
  onOwnerChange,
  schedule,
  onScheduleChange,
  onClear,
}: FilterBarProps) {
  return (
    <div className="bg-card p-3.5 rounded-xl border border-border shadow-sm flex flex-wrap items-center justify-between gap-3">
      <SearchFilterInput value={searchTerm} onChange={onSearchChange} />

      <div className="flex flex-wrap items-center gap-2.5">
        <FilterDropdown
          label="Status"
          value={status}
          options={["All", "Success", "Warning", "Failed"]}
          onChange={onStatusChange}
          minWidth="95px"
        />

        <FilterDropdown
          label="Source"
          value={source}
          options={["All", "MySQL", "PostgreSQL", "SQL Server", "Oracle", "MongoDB"]}
          onChange={onSourceChange}
          minWidth="105px"
        />

        <FilterDropdown
          label="Destination"
          value={destination}
          options={["All", "Snowflake", "BigQuery"]}
          onChange={onDestinationChange}
          minWidth="105px"
        />

        <FilterDropdown
          label="Owner"
          value={owner}
          options={["All", "Data Team", "Analytics", "Infra"]}
          onChange={onOwnerChange}
          minWidth="95px"
        />

        <FilterDropdown
          label="Schedule"
          value={schedule}
          options={["All", "Hourly", "Daily", "Real-time"]}
          onChange={onScheduleChange}
          minWidth="95px"
        />

        <button
          type="button"
          className="mt-3.5 border border-border hover:border-ring text-primary bg-card hover:bg-accent px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition-colors shadow-sm"
        >
          <Filter size={14} />
          <span>More Filters</span>
        </button>

        <button
          type="button"
          onClick={onClear}
          className="mt-3.5 text-muted-foreground hover:text-foreground text-xs font-medium px-2 py-1.5 cursor-pointer transition-colors"
        >
          Clear
        </button>
      </div>
    </div>
  )
}
