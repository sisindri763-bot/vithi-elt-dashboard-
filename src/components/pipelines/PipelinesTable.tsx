"use client"

import { useState } from "react"
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { FilterBar } from "@/components/ui/FilterBar"
import { ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react"
import { usePipelinesData } from "@/hooks/usePipelinesData"
import { InspectModal } from "@/components/pipelines/InspectModal"

import type { PipelineItem } from "@/hooks/usePipelinesData"

// ── helpers ───────────────────────────────────────────────────────────────────



function getStatusStyle(status: string) {
  switch (status?.toLowerCase()) {
    case "success": return "bg-emerald-50 text-emerald-700 border border-emerald-200"
    case "failed":  return "bg-rose-50 text-rose-700 border border-rose-200"
    case "warning": return "bg-orange-50 text-orange-700 border border-orange-200"
    case "running": return "bg-blue-50 text-blue-700 border border-blue-200"
    default:        return "bg-gray-100 text-gray-400 border border-gray-200"
  }
}

function getStatusLabel(status: string) {
  const s = status?.toLowerCase()
  if (!s || s === "n/a" || s === "unknown") return "No runs"
  return s.charAt(0).toUpperCase() + s.slice(1)
}


//need to see once  Sucess barrr
function SuccessBar({ pct, rate }: { pct: number | null; rate: number | string | null }) {
  let display: number | null = pct
  if (display === null && rate !== null && rate !== undefined) {
    const parsed = typeof rate === "string" ? parseFloat(rate.replace("%", "")) : rate
    display = isNaN(parsed as number) ? null : (parsed as number)
  }
  if (display === null) return <span className="text-gray-400 text-xs">—</span>
  const color = display >= 90 ? "bg-emerald-500" : display >= 70 ? "bg-orange-400" : "bg-rose-500"
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-gray-700 w-10 shrink-0">{display.toFixed(1)}%</span>
      <div className="flex-1 bg-gray-100 rounded-full h-1.5 min-w-[60px]">
        <div className={`${color} h-1.5 rounded-full`} style={{ width: `${Math.min(display, 100)}%` }} />
      </div>
    </div>
  )
}

// ── component ─────────────────────────────────────────────────────────────────

interface PipelinesTableProps {
  preset: string //Controls the time range for data fetching (e.g., "24h", "7d", "30d")
  refreshKey: number //Used to trigger data refreshes when incremented
  selectedPipelineId?: string | null
  onSelectPipeline?: (p: PipelineItem) => void
  filterPipelineId?: string
  filterPipelineNames?: string[]
}

export function PipelinesTable({ preset, refreshKey, selectedPipelineId, onSelectPipeline, filterPipelineId, filterPipelineNames }: PipelinesTableProps) {
  const [page, setPage]         = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [search, setSearch]     = useState("")
  const [status, setStatus]     = useState("all")
  const [source, setSource]     = useState("all")
  const [dest, setDest]         = useState("all")
  const [engine, setEngine]     = useState("all")
  const [inspecting, setInspecting] = useState<{ id: string; name: string } | null>(null)

  const { data, loading, error } = usePipelinesData({ 
    preset, 
    page, 
    pageSize, 
    refreshKey, 
    pipeline_id: filterPipelineId,
    pipeline_names: filterPipelineNames
  })

  const allItems = data?.items ?? []

  // Derive dynamic filter options from API data
  const uniqueSources  = Array.from(new Set(allItems.map((p) => p.source).filter(Boolean)))
  const uniqueTargets  = Array.from(new Set(allItems.map((p) => p.target).filter(Boolean)))
  const uniqueEngines  = Array.from(new Set(allItems.map((p) => p.etl).filter(Boolean)))
  const uniqueStatuses = Array.from(new Set(allItems.map((p) => p.status).filter(Boolean)))

  // Apply all filters client-side
const rows = allItems.filter((p) => {
  // Get search query in lowercase for case-insensitive matching
  const q = search.trim().toLowerCase()
  // 1. TEXT SEARCH FILTER
  if (q && !p.pipeline_name.toLowerCase().includes(q) && !p.pipeline_id.toLowerCase().includes(q)) 
    return false
  // 2. STATUS FILTER
  if (status !== "all" && p.status.toLowerCase() !== status) 
    return false
  // 4. SOURCE TOOL FILTER
  if (source !== "all" && !p.source.toLowerCase().includes(source)) 
    return false
  // 5. DESTINATION TOOL FILTER
  if (dest !== "all" && !p.target.toLowerCase().includes(dest)) 
    return false
  // 6. ETL ENGINE FILTER
  if (engine !== "all" && !p.etl.toLowerCase().includes(engine)) 
    return false
  // If all filters pass, include this pipeline
  return true
})


  const total      = data?.pagination.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const handleFilter = (key: string, val: string) => {
    if (key === "status")      { setStatus(val);           setPage(1) }
    if (key === "source")      { setSource(val);           setPage(1) }
    if (key === "destination") { setDest(val);             setPage(1) }
    if (key === "engine")      { setEngine(val);           setPage(1) }
  }

  return (
    <>
      <div className=" rounded-xl border  shadow-sm">
        {/* Filter bar — fully dynamic from API data */}
        <div className="p-3 border-b ">
          <FilterBar
            searchPlaceholder="Search by name or pipeline ID..."
            onSearchChange={setSearch}
            onFilterChange={handleFilter}
            filters={[
              {
                key: "status",
                label: "Status",
                options: [
                  { label: "All Statuses", value: "all" },
                  ...uniqueStatuses.map((s) => ({ 
                    label: s.charAt(0).toUpperCase() + s.slice(1).toLowerCase(), 
                    value: s.toLowerCase() 
                  })),
                ],
              },
              {
                key: "source",
                label: "Source",
                options: [
                  { label: "All Sources", value: "all" },
                  ...uniqueSources.map((s) => ({ label: s, value: s.toLowerCase() })),
                ],
              },
              {
                key: "destination",
                label: "Destination",
                options: [
                  { label: "All Destinations", value: "all" },
                  ...uniqueTargets.map((t) => ({ label: t, value: t.toLowerCase() })),
                ],
              },
              {
                key: "engine",
                label: "Engine / Tool",
                options: [
                  { label: "All Engines", value: "all" },
                  ...uniqueEngines.map((e) => ({ label: e, value: e.toLowerCase() })),
                ],
              },
            ]}
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="text-xs bg-gray-50/50">
                <TableHead className="py-2 w-[220px]">Pipeline Name</TableHead>
                <TableHead className="py-2 w-[110px]">Pipeline ID</TableHead>
                <TableHead className="py-2">Status</TableHead>
                <TableHead className="py-2">Last Run</TableHead>
                <TableHead className="py-2">Duration</TableHead>
                <TableHead className="py-2">Target Rows</TableHead>
                <TableHead className="py-2 min-w-[140px]">Freshness</TableHead>
                <TableHead className="py-2">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <TableCell key={j} className="py-2">
                        <div className="h-3 bg-gray-100 rounded animate-pulse" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-sm text-rose-500">{error}</TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-sm text-gray-400">No pipelines found</TableCell>
                </TableRow>
              ) : (

                //while selecting specific pipeline name
                rows.map((p) => (
                  <TableRow
                    key={p.pipeline_id}
                    onClick={() => onSelectPipeline?.(p)}
                    className={`text-xs cursor-pointer transition-colors ${
                      selectedPipelineId === p.pipeline_id
                        ? "bg-blue-50 hover:bg-blue-50 border-l-2 border-l-blue-500"
                        : "hover:bg-gray-50/50"
                    }`}
                  >
                    <TableCell className="py-2.5">
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 font-medium text-gray-800">
                            {p.pipeline_name}
                            {/* Check for failed status instead of has_open_incident */}
                            {p.status_key === "failed" && <AlertTriangle size={11} className="text-rose-500 shrink-0" />}
                          </div>
                          <div className="text-[11px] text-gray-400">{p.source} → {p.target}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-2.5">
                      <span className="font-mono text-[10px] text-gray-400 bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded">
                        {/*pipeline id printing */}
                        {p.pipeline_id.slice(0, 8)}… 
                      </span>
                    </TableCell>
                    <TableCell className="py-2.5">
                      <span className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-medium ${getStatusStyle(p.status)}`}>
                        {/* geting status */}
                        {getStatusLabel(p.status)}
                      </span>
                    </TableCell>
                    <TableCell className="py-2.5 text-gray-500">{p.last_run_age ?? "—"}</TableCell>
                    <TableCell className="py-2.5 text-gray-500">{p.duration ?? "—"}</TableCell>
                    <TableCell className="py-2.5 text-gray-500">
                      {p.target_rows > 0
                        ? <span className="text-gray-800">{p.target_rows.toLocaleString()}</span>
                        : "—"}
                    </TableCell>
                    <TableCell className="py-2.5">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          p.freshness === "Fresh" ? "bg-emerald-50 text-emerald-700" : "bg-orange-50 text-orange-700"
                        }`}>
                          {p.freshness}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-2.5">
                      <button
                        onClick={(e) => { e.stopPropagation(); setInspecting({ id: p.pipeline_id, name: p.pipeline_name }) }}
                        className="text-xs text-gray-500 hover:text-gray-900 border border-gray-200 hover:border-gray-400 px-2.5 py-1 rounded-lg transition-colors font-medium whitespace-nowrap"
                      >
                        Inspect
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-100">
          <span className="text-xs text-gray-400">Showing {rows.length} of {total} pipelines</span>
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="sm" className="h-7 w-7 p-0"
              onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
              <ChevronLeft size={14} />
            </Button>
            {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => i + 1).map((p) => (
              <Button key={p} size="sm" variant={p === page ? "default" : "outline"}
                className="h-7 w-7 p-0 text-xs" onClick={() => setPage(p)}>
                {p}
              </Button>
            ))}
            {totalPages > 3 && <span className="text-xs text-gray-400 px-1">...</span>}
            {totalPages > 3 && (
              <Button size="sm" variant={totalPages === page ? "default" : "outline"}
                className="h-7 w-7 p-0 text-xs" onClick={() => setPage(totalPages)}>
                {totalPages}
              </Button>
            )}
            <Button variant="outline" size="sm" className="h-7 w-7 p-0"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
              <ChevronRight size={14} />
            </Button>
            <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1) }}
              className="ml-1 border border-gray-200 rounded-lg text-xs px-2 py-1 focus:outline-none">
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
              <option value={50}>50 / page</option>
            </select>
          </div>
        </div>
      </div>

      {inspecting && (
        <InspectModal
          pipelineId={inspecting.id}
          pipelineName={inspecting.name}
          onClose={() => setInspecting(null)}
        />
      )}
    </>
  )
}
