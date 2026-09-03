"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Search, Filter, MoreVertical } from "lucide-react"
import type { FreshnessResponse } from "@/hooks/useFreshnessData"

interface FreshnessTableProps {
  data: FreshnessResponse | null
  loading: boolean
  error: string | null
}

function formatTimestamp(dateString: string | null): string {
  if (!dateString) return "Never"
  
  try {
    const date = new Date(dateString)
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric", 
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    })
  } catch {
    return "Invalid date"
  }
}

function getStatusStyle(statusKey: string) {
  switch (statusKey) {
    case "fresh":   return { className: "bg-emerald-50 text-emerald-700 border border-emerald-200", label: "Fresh" }
    case "delayed": return { className: "bg-orange-50 text-orange-700 border border-orange-200",   label: "Delayed" }
    case "stale":   return { className: "bg-rose-50 text-rose-700 border border-rose-200",         label: "Stale" }
    default:        return { className: "bg-gray-100 text-gray-600",                               label: "Unknown" }
  }
}

function getLagColor(statusKey: string) {
  switch (statusKey) {
    case "fresh":   return "text-emerald-600"
    case "delayed": return "text-orange-500"
    case "stale":   return "text-rose-600"
    default:        return "text-gray-500"
  }
}

export function FreshnessTable({ data, loading, error }: FreshnessTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchQuery, setSearchQuery] = useState("")

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-5 bg-gray-100 rounded w-1/4"></div>
          <div className="h-48 bg-gray-100 rounded"></div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-sm text-rose-700">
        Error loading pipeline data: {error || "Unknown error"}
      </div>
    )
  }

  const pipelines = data.items || []
  const totalItems = data.pagination.total
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))

  const filteredPipelines = pipelines.filter((p) =>
    p.pipeline_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-800">Pipelines</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="Search pipelines..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <Button variant="outline" size="sm" className="gap-1.5 h-7 text-xs">
            <Filter size={13} />
            Filters
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="text-xs">
              <TableHead className="w-[220px] py-2">Pipeline Name</TableHead>
              <TableHead className="py-2">Last Updated</TableHead>
              <TableHead className="py-2">Last Updated Timestamp</TableHead>
              <TableHead className="py-2">SLA (Hours)</TableHead>
              <TableHead className="py-2">Current Lag</TableHead>
              <TableHead className="py-2">Status</TableHead>
              <TableHead className="w-8 py-2"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPipelines.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-sm text-gray-400">
                  No pipelines found
                </TableCell>
              </TableRow>
            ) : (
              filteredPipelines.map((pipeline) => {
                const statusStyle = getStatusStyle(pipeline.status_key)
                const lagColor = getLagColor(pipeline.status_key)
                return (
                  <TableRow key={pipeline.pipeline_id} className="text-xs hover:bg-gray-50/50">
                    <TableCell className="py-2.5">
                      <span className="font-medium text-gray-800">{pipeline.pipeline_name}</span>
                    </TableCell>
                    <TableCell className="py-2.5 text-gray-500">
                      {pipeline.last_updated_age || "Never"}
                    </TableCell>
                    <TableCell className="py-2.5 text-gray-500">
                      {formatTimestamp(pipeline.last_updated_at)}
                    </TableCell>
                    <TableCell className="py-2.5 text-gray-500">{pipeline.sla_hours}h</TableCell>
                    <TableCell className={`py-2.5 font-semibold ${lagColor}`}>
                      {pipeline.current_lag_display}
                    </TableCell>
                    <TableCell className="py-2.5">
                      <span className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-medium ${statusStyle.className}`}>
                        {statusStyle.label}
                      </span>
                    </TableCell>
                    <TableCell className="py-2.5">
                      <button className="text-gray-300 hover:text-gray-500">
                        <MoreVertical size={14} />
                      </button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-100">
        <span className="text-xs text-gray-400">
          Showing {filteredPipelines.length} of {totalItems} pipelines
        </span>
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" className="h-7 w-7 p-0"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}>
            <ChevronLeft size={14} />
          </Button>
          {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={page === currentPage ? "default" : "outline"}
              size="sm"
              className="h-7 w-7 p-0 text-xs"
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </Button>
          ))}
          <Button variant="outline" size="sm" className="h-7 w-7 p-0"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}>
            <ChevronRight size={14} />
          </Button>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="ml-1 border border-gray-200 rounded-lg text-xs px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
            <option value={50}>50 / page</option>
          </select>
        </div>
      </div>
    </div>
  )
}
