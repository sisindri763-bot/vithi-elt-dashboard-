"use client"

import { useEffect, useState } from "react"
import { X, Terminal, Eye } from "lucide-react"

const API_BASE = "https://etl-pipeline-lemon.vercel.app/api/v1"

interface PipelineRun {
  run_id: string
  pipeline_id: string
  pipeline_name: string
  status: string
  started_at: string | null
  finished_at: string | null
  duration_seconds: number | null
  duration_display: string | null
  triggered_by: string | null
  execution_mode: string | null
  error_message: string | null
}

interface InspectModalProps {
  pipelineId: string
  pipelineName: string
  onClose: () => void
}

function getStatusStyle(status: string) {
  switch (status?.toLowerCase()) {
    case "success": return "bg-emerald-100 text-emerald-700 border border-emerald-200"
    case "failed":  return "bg-rose-100 text-rose-700 border border-rose-200"
    case "warning": return "bg-orange-100 text-orange-700 border border-orange-200"
    case "running": return "bg-blue-100 text-blue-700 border border-blue-200"
    default:        return "bg-gray-100 text-gray-600 border border-gray-200"
  }
}

function formatTimestamp(ts: string | null): string {
  if (!ts) return "—"
  const d = new Date(ts)
  return d.toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  })
}

export function InspectModal({ pipelineId, pipelineName, onClose }: InspectModalProps) {
  const [runs, setRuns]       = useState<PipelineRun[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)
  const [selected, setSelected] = useState<PipelineRun | null>(null)

  useEffect(() => {
    const fetchRuns = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`${API_BASE}/pipelines/${pipelineId}/runs?page=1&page_size=20`)
        if (!res.ok) throw new Error(`API ${res.status}`)
        const json = await res.json()
        const items: PipelineRun[] = json.items ?? json.runs ?? []
        setRuns(items)
        if (items.length > 0) setSelected(items[0])
      } catch (e: any) {
        setError(e.message ?? "Failed to load runs")
      } finally {
        setLoading(false)
      }
    }
    fetchRuns()
  }, [pipelineId])

  // Close on backdrop click
  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={handleBackdrop}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <Terminal size={18} className="text-emerald-600" />
              <h2 className="text-base font-bold text-gray-900">
                Run Details {selected ? `#${selected.run_id}` : ""}
              </h2>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">
              Pipeline: <span className="font-semibold text-gray-700">{pipelineName}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 mt-0.5"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="p-6 text-rose-500 text-sm">{error}</div>
          ) : runs.length === 0 ? (
            <div className="p-6 text-gray-400 text-sm text-center">No runs found for this pipeline.</div>
          ) : (
            <div className="p-6 space-y-4">
              {/* Run detail cards */}
              {selected && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1.5">Status</p>
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusStyle(selected.status)}`}>
                      {selected.status}
                    </span>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1.5">Duration</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {selected.duration_display ?? (selected.duration_seconds ? `${selected.duration_seconds}s` : "—")}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1.5">Execution Timestamp</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatTimestamp(selected.started_at)}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1.5">Triggered By</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {selected.triggered_by ?? "—"}
                      {selected.execution_mode && (
                        <span className="text-xs text-gray-400 font-normal ml-1">
                          ({selected.execution_mode})
                        </span>
                      )}
                    </p>
                  </div>

                  {selected.error_message && (
                    <div className="col-span-2 bg-rose-50 rounded-xl p-4 border border-rose-100">
                      <p className="text-xs text-rose-500 mb-1.5 font-medium">Error</p>
                      <p className="text-xs font-mono text-rose-700 leading-relaxed">
                        {selected.error_message}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button className="flex items-center gap-2 text-sm text-gray-600 border border-gray-200 rounded-xl px-4 py-2 hover:bg-gray-50 transition-colors">
            <Eye size={15} />
            Open Full System Logs
          </button>
          <button
            onClick={onClose}
            className="text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-5 py-2 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
