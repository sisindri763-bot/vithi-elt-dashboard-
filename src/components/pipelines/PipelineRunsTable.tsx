"use client"

import { useState, useEffect } from "react"
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle, Search, AlertCircle, PlayCircle } from "lucide-react"
import { usePipelineRuns } from "@/hooks/usePipelineRuns"
import type { PipelineItem } from "@/hooks/usePipelinesData"

const DROPDOWN_ARROW = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`

function formatTime(ts: string | null): string {
  if (!ts) return "—"
  return new Date(ts).toLocaleString("en-US", {
    month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  })
}

function StatusBadge({ status }: { status: string }) {
  const statusLower = status?.toLowerCase() || "unknown"
  
  // Dynamic status styling based on status value
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "success":
        return {
          bg: "bg-emerald-50 text-emerald-700 border border-emerald-200",
          icon: <CheckCircle2 size={11} />,
          label: "Success"
        }
      case "failed":
      case "failure":
      case "error":
        return {
          bg: "bg-rose-50 text-rose-700 border border-rose-200",
          icon: <XCircle size={11} />,
          label: "Failed"
        }
      case "warning":
      case "warn":
        return {
          bg: "bg-orange-50 text-orange-700 border border-orange-200",
          icon: <AlertCircle size={11} />,
          label: "Warning"
        }
      case "running":
      case "active":
      case "in_progress":
        return {
          bg: "bg-blue-50 text-blue-700 border border-blue-200",
          icon: <PlayCircle size={11} />,
          label: "Running"
        }
      default:
        return {
          bg: "bg-gray-50 text-gray-700 border border-gray-200",
          icon: <AlertCircle size={11} />,
          label: status ? status.charAt(0).toUpperCase() + status.slice(1) : "Unknown"
        }
    }
  }

  const config = getStatusConfig(statusLower)
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium ${config.bg}`}>
      {config.icon} {config.label}
    </span>
  )
}

function Divider() {
  return <div className="h-5 w-px bg-gray-200 shrink-0" />
}

function FilterSelect({ label, value, onChange, children }: {
  label: string
  value: string
  onChange: (v: string) => void
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide leading-none">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-xs text-gray-700 bg-transparent focus:outline-none cursor-pointer pr-4 appearance-none"
        style={{ backgroundImage: DROPDOWN_ARROW, backgroundRepeat: "no-repeat", backgroundPosition: "right 0px center" }}
      >
        {children}
      </select>
    </div>
  )
}

interface PipelineRunsTableProps {
  pipelines: PipelineItem[]
  defaultPipelineId?: string
}

export function PipelineRunsTable({ pipelines, defaultPipelineId }: PipelineRunsTableProps) {
  const [selectedId, setSelectedId] = useState<string>(
    defaultPipelineId ?? pipelines[0]?.pipeline_id ?? ""
  )
  const [search, setSearch]       = useState("")
  const [statusFilter, setStatus] = useState("all")
  const [dateFilter, setDate]     = useState("")
  const [engineFilter, setEngine] = useState("all")
  const [page, setPage]           = useState(1)
  const pageSize                  = 10

  useEffect(() => {
    if (defaultPipelineId) { setSelectedId(defaultPipelineId); setPage(1) }
  }, [defaultPipelineId])

  const { data, loading, error } = usePipelineRuns({ pipelineId: selectedId, page, pageSize })

  const allRuns = data?.items ?? []
  const selectedName = pipelines.find((p) => p.pipeline_id === selectedId)?.pipeline_name ?? selectedId
  const uniqueEngines = Array.from(new Set(allRuns.map((r) => r.tool_name).filter(Boolean))) as string[]
  const uniqueStatuses = Array.from(new Set(allRuns.map((r) => r.status).filter(Boolean))) as string[]

  const filtered = allRuns.filter((run) => {
    const q = search.trim().toLowerCase()
    if (q && !String(run.id).toLowerCase().includes(q) && !run.pipeline_name.toLowerCase().includes(q)) return false
    if (statusFilter !== "all" && run.status.toLowerCase() !== statusFilter) return false
    if (engineFilter !== "all" && !run.tool_name?.toLowerCase().includes(engineFilter)) return false
    if (dateFilter) {
      const d = run.start_time ? new Date(run.start_time).toISOString().split("T")[0] : ""
      if (d !== dateFilter) return false
    }
    return true
  })

  const total      = data?.pagination.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-800">Pipeline Runs</h2>
        <p className="text-[11px] text-gray-400 mt-0.5">
          Showing runs for <span className="font-medium text-gray-600">{selectedName}</span>
          {total > 0 && <span className="ml-1">— {total} total</span>}
        </p>
      </div>

      {/* Unified Filter Bar */}
      <div className="p-3 border-b border-gray-100">
        <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-3 py-2.5 shadow-sm">

          {/* Search */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Search size={14} className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Search run ID, pipeline name..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="text-xs text-gray-700 placeholder:text-gray-400 bg-transparent focus:outline-none w-full"
            />
          </div>

          <Divider />
          <FilterSelect label="Pipeline" value={selectedId} onChange={(v) => { setSelectedId(v); setPage(1) }}>
            {pipelines.map((p) => (
              <option key={p.pipeline_id} value={p.pipeline_id}>{p.pipeline_name}</option>
            ))}
          </FilterSelect>

          <Divider />
          <FilterSelect label="Status" value={statusFilter} onChange={(v) => { setStatus(v); setPage(1) }}>
            <option value="all">All Statuses</option>
            {uniqueStatuses.map((s) => (
              <option key={s} value={s.toLowerCase()}>
                {s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()}
              </option>
            ))}
          </FilterSelect>

          <Divider />
          <FilterSelect label="Engine / Tool" value={engineFilter} onChange={(v) => { setEngine(v); setPage(1) }}>
            <option value="all">All Engines</option>
            {uniqueEngines.map((e) => (
              <option key={e} value={e.toLowerCase()}>{e}</option>
            ))}
          </FilterSelect>

          <Divider />
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide leading-none">Execution Date</span>
            <div className="flex items-center gap-1">
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => { setDate(e.target.value); setPage(1) }}
                className="text-xs text-gray-700 bg-transparent focus:outline-none cursor-pointer border-0 p-0 appearance-none"
              />
              {dateFilter && (
                <button onClick={() => { setDate(""); setPage(1) }} className="text-gray-400 hover:text-gray-600 text-[10px]">✕</button>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="text-xs bg-gray-50/50">
              <TableHead className="py-2 w-[150px]">Run ID</TableHead>
              <TableHead className="py-2">Status</TableHead>
              <TableHead className="py-2">Started</TableHead>
              <TableHead className="py-2">Ended</TableHead>
              <TableHead className="py-2">Duration</TableHead>
              <TableHead className="py-2">Rows Read</TableHead>
              <TableHead className="py-2">Rows Written</TableHead>
              <TableHead className="py-2">Triggered By</TableHead>
              <TableHead className="py-2">Error</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 9 }).map((_, j) => (
                    <TableCell key={j} className="py-2">
                      <div className="h-3 bg-gray-100 rounded animate-pulse" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : error ? (
              <TableRow><TableCell colSpan={9} className="text-center py-8 text-sm text-rose-500">{error}</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={9} className="text-center py-8 text-sm text-gray-400">No runs found</TableCell></TableRow>
            ) : (
              filtered.map((run) => (
                <TableRow key={run.id} className="text-xs hover:bg-gray-50/50">
                  <TableCell className="py-2.5">
                    <span className="font-mono text-[10px] text-gray-500 bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded">
                      {String(run.id).slice(0, 14)}…
                    </span>
                  </TableCell>
                  <TableCell className="py-2.5"><StatusBadge status={run.status} /></TableCell>
                  <TableCell className="py-2.5 text-gray-500">{formatTime(run.start_time)}</TableCell>
                  <TableCell className="py-2.5 text-gray-500">{formatTime(run.end_time)}</TableCell>
                  <TableCell className="py-2.5 text-gray-500">{run.duration_display ?? "—"}</TableCell>
                  <TableCell className="py-2.5 text-gray-500">{run.rows_read !== null ? run.rows_read.toLocaleString() : "—"}</TableCell>
                  <TableCell className="py-2.5 text-gray-500">{run.rows_written !== null ? run.rows_written.toLocaleString() : "—"}</TableCell>
                  <TableCell className="py-2.5 text-gray-500">{run.triggered_by ?? "—"}</TableCell>
                  <TableCell className="py-2.5 max-w-[180px]">
                    {run.error_message
                      ? <span title={run.error_message} className="text-rose-500 text-[11px] truncate block max-w-[160px]">{run.error_message}</span>
                      : <span className="text-gray-300">—</span>}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-100">
        <span className="text-xs text-gray-400">Showing {filtered.length} of {total} runs</span>
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
          <Button variant="outline" size="sm" className="h-7 w-7 p-0"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
            <ChevronRight size={14} />
          </Button>
        </div>
      </div>
    </div>
  )
}
