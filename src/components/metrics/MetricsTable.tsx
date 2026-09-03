"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Search, Filter, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { MetricsResponse } from "@/hooks/useMetricsData"

interface MetricsTableProps {
  data: MetricsResponse | null
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
    case "healthy": return { className: "bg-emerald-50 text-emerald-700 border border-emerald-200", label: "Healthy" }
    case "degraded": return { className: "bg-yellow-50 text-yellow-700 border border-yellow-200",   label: "Degraded" }
    case "failed":   return { className: "bg-rose-50 text-rose-700 border border-rose-200",         label: "Failed" }
    case "unknown":  return { className: "bg-gray-100 text-gray-600 border border-gray-200",       label: "Unknown" }
    default:         return { className: "bg-gray-100 text-gray-600 border border-gray-200",       label: "Unknown" }
  }
}

function getSuccessRateColor(rate: number) {
  if (rate >= 90) return "text-emerald-600"
  if (rate >= 75) return "text-yellow-600"
  return "text-rose-600"
}

export function MetricsTable({ data, loading, error }: MetricsTableProps) {
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
        Error loading metrics table: {error || "Unknown error"}
      </div>
    )
  }

  const items = data.items || []
  const totalItems = data.pagination.total
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))

  const filteredItems = items.filter((item) =>
    item.pipeline_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-800">Live Pipeline Metrics ({totalItems})</h2>
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
              <TableHead className="w-[140px] py-2">#</TableHead>
              <TableHead className="py-2">Pipeline</TableHead>
              <TableHead className="py-2">Source Tool</TableHead>
              <TableHead className="py-2">ETL Tool</TableHead>
              <TableHead className="py-2">Status</TableHead>
              <TableHead className="py-2">Last Run</TableHead>
              <TableHead className="py-2">Duration</TableHead>
              <TableHead className="py-2">Success Rate</TableHead>
              <TableHead className="py-2">Total Runs</TableHead>
              <TableHead className="w-8 py-2"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-sm text-gray-400">
                  No pipeline metrics found
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item, index) => {
                const statusStyle = getStatusStyle(item.status_key)
                const successRateColor = getSuccessRateColor(item.success_rate_pct)
                return (
                  <TableRow key={item.pipeline_id} className="text-xs hover:bg-gray-50/50">
                    <TableCell className="py-2.5">
                      <span className="text-gray-500 font-mono">
                        {String(currentPage === 1 ? index + 1 : (currentPage - 1) * pageSize + index + 1).padStart(2, '0')}
                      </span>
                    </TableCell>
                    <TableCell className="py-2.5">
                      <span className="font-medium text-gray-800">{item.pipeline_name}</span>
                    </TableCell>
                    <TableCell className="py-2.5 text-gray-500">
                      <span className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 rounded text-[10px] font-medium">
                        {item.tool || 'Unknown'}
                      </span>
                    </TableCell>
                    <TableCell className="py-2.5 text-gray-500">
                      <span className="inline-flex items-center px-2 py-1 bg-purple-50 text-purple-700 rounded text-[10px] font-medium">
                        {item.tool || 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell className="py-2.5">
                      <span className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-medium ${statusStyle.className}`}>
                        {statusStyle.label}
                      </span>
                    </TableCell>
                    <TableCell className="py-2.5 text-gray-500">
                      <div>
                        <div className="font-medium">{item.last_run_age}</div>
                        <div className="text-[10px] text-gray-400">{formatTimestamp(item.last_run_at)}</div>
                      </div>
                    </TableCell>
                    <TableCell className="py-2.5">
                      <span className="font-mono text-gray-700 bg-gray-50 px-2 py-1 rounded">
                        {item.duration}
                      </span>
                    </TableCell>
                    <TableCell className={`py-2.5 font-semibold ${successRateColor}`}>
                      {item.success_rate_pct}%
                    </TableCell>
                    <TableCell className="py-2.5 text-gray-500">
                      <span className="font-medium">{item.runs}</span>
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
          Showing {filteredItems.length} of {totalItems} pipeline metrics
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