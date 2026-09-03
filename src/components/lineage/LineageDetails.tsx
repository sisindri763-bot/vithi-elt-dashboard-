"use client"

import { useState } from "react"
import { Database, Play, Target, Clock, Calendar, CheckCircle, AlertTriangle, XCircle, Info } from "lucide-react"
import type { PipelineDetailsResponse } from "@/hooks/usePipelineDetails"

interface LineageDetailsProps {
  pipelineDetails: PipelineDetailsResponse | null
  loading: boolean
  error: string | null
}

export function LineageDetails({ pipelineDetails, loading, error }: LineageDetailsProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "lineage" | "runs">("overview")

  console.log('LineageDetails received:', { pipelineDetails, loading, error }) // Debug log

  if (loading) {
    return (
      <div className="bg-card rounded-xl border border-border shadow-sm p-4">
        <div className="animate-pulse">
          <div className="h-6 bg-muted rounded w-3/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-4 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-card rounded-xl border border-border shadow-sm p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Pipeline Details</h3>
        <div className="text-center text-rose-600 py-8">
          <AlertTriangle size={48} className="mx-auto mb-4 opacity-50" />
          <p>Error loading pipeline details: {error}</p>
        </div>
      </div>
    )
  }

  if (!pipelineDetails || !pipelineDetails.meta || !pipelineDetails.meta.pipeline) {
    return (
      <div className="bg-card rounded-xl border border-border shadow-sm p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Pipeline Details</h3>
        <div className="text-center text-muted-foreground py-8">
          <Database size={48} className="mx-auto mb-4 opacity-30" />
          <p>Select a pipeline to view details</p>
          {/* Debug info */}
          <div className="mt-4 text-xs bg-gray-100 p-2 rounded">
            <p>Debug: pipelineDetails = {pipelineDetails ? 'exists' : 'null'}</p>
            <p>Loading: {loading ? 'true' : 'false'}</p>
            <p>Error: {error || 'none'}</p>
          </div>
        </div>
      </div>
    )
  }

  const { pipeline, lineage_item, last_run, assets, freshness, data_quality, schema } = pipelineDetails.meta

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "healthy": return "text-emerald-700 bg-emerald-50 border-emerald-200"
      case "degraded": return "text-orange-700 bg-orange-50 border-orange-200" 
      case "failed": return "text-rose-700 bg-rose-50 border-rose-200"
      default: return "text-gray-700 bg-gray-50 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "healthy": return <CheckCircle size={16} className="text-emerald-600" />
      case "degraded": return <AlertTriangle size={16} className="text-orange-600" />
      case "failed": return <XCircle size={16} className="text-rose-600" />
      default: return <Info size={16} className="text-gray-600" />
    }
  }

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`
  }

  return (
    <div className="space-y-4">
      {/* Pipeline Header */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-4">
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-foreground mb-1">
            {pipeline?.pipeline_name || 'Unknown Pipeline'}
          </h3>
          <p className="text-sm text-muted-foreground">{pipeline?.description || "Pipeline Details"}</p>
        </div>

        {/* Status Tabs */}
        <div className="flex gap-1 mb-4">
          {[
            { id: "overview", label: "Overview" },
            { id: "lineage", label: "Lineage" }, 
            { id: "runs", label: "Runs" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground border border-border hover:bg-accent"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Source Tool</span>
              <span className="text-sm font-medium text-foreground flex items-center gap-1">
                <Database size={12} className="text-blue-600" />
                {pipeline?.source_tool || 'Unknown'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Schema</span>
              <span className="text-sm font-medium text-foreground">
                {pipeline?.source_schema || 'Unknown'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">ETL Tool</span>
              <span className="text-sm font-medium text-foreground flex items-center gap-1">
                <Play size={12} className="text-purple-600" />
                {pipeline?.etl_tool || 'Unknown'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Target Tool</span>
              <span className="text-sm font-medium text-foreground flex items-center gap-1">
                <Target size={12} className="text-green-600" />
                {pipeline?.target_tool || 'Unknown'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Target Schema</span>
              <span className="text-sm font-medium text-foreground">
                {pipeline?.target_schema || 'Unknown'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Last Runtime</span>
              <span className="text-sm font-medium text-foreground">
                {last_run ? formatDuration(last_run.duration) : lineage_item?.duration || "—"}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Target Rows</span>
              <span className="text-sm font-medium text-foreground">
                {lineage_item?.target_rows ? lineage_item.target_rows.toLocaleString() : "—"}
              </span>
            </div>

            {last_run && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Rows Processed</span>
                <span className="text-sm font-medium text-foreground">
                  {last_run.rows_read ? `${last_run.rows_read.toLocaleString()} read` : "—"}
                </span>
              </div>
            )}
          </div>
        )}

        {activeTab === "lineage" && (
          <div className="space-y-3">
            <div className="text-sm">
              <div className="font-medium text-foreground mb-2">Data Flow</div>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-1 bg-blue-50 border border-blue-200 rounded flex items-center gap-1">
                  <Database size={10} />
                  {pipeline?.source_tool || 'Unknown'}
                </span>
                <span className="text-muted-foreground">→</span>
                <span className="px-2 py-1 bg-purple-50 border border-purple-200 rounded flex items-center gap-1">
                  <Play size={10} />
                  {pipeline?.etl_tool || 'Unknown'}
                </span>
                <span className="text-muted-foreground">→</span>
                <span className="px-2 py-1 bg-green-50 border border-green-200 rounded flex items-center gap-1">
                  <Target size={10} />
                  {pipeline?.target_tool || 'Unknown'}
                </span>
              </div>
            </div>

            {assets && assets.length > 0 && (
              <div>
                <div className="font-medium text-foreground text-sm mb-2">Data Assets</div>
                <div className="space-y-2">
                  {assets.map((asset, index) => (
                    <div key={asset.id} className="text-xs bg-muted/50 rounded p-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{asset.object_name}</span>
                        <span className={`px-1.5 py-0.5 rounded text-xs ${
                          asset.asset_role === "SOURCE" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                        }`}>
                          {asset.asset_role}
                        </span>
                      </div>
                      <div className="text-muted-foreground mt-1">
                        {asset.database_name}.{asset.schema_name} • {asset.row_count?.toLocaleString()} rows
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "runs" && last_run && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Run ID</span>
              <span className="text-xs font-mono text-foreground">{last_run.id}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <span className="text-sm font-medium text-emerald-600">{last_run.status}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Start Time</span>
              <span className="text-sm text-foreground">
                {new Date(last_run.start_time).toLocaleString()}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">End Time</span>
              <span className="text-sm text-foreground">
                {new Date(last_run.end_time).toLocaleString()}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Duration</span>
              <span className="text-sm font-medium text-foreground">
                {formatDuration(last_run.duration)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Triggered By</span>
              <span className="text-sm text-foreground">{last_run.triggered_by}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Execution Mode</span>
              <span className="text-sm text-foreground">{last_run.execution_mode}</span>
            </div>
          </div>
        )}
      </div>

      {/* Health Assessment */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-4">
        <h4 className="text-sm font-semibold text-foreground mb-3">HEALTH ASSESSMENT</h4>
        
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className={`p-2 rounded ${
            freshness?.status_key === "fresh" ? "bg-emerald-50 border border-emerald-200" : "bg-orange-50 border border-orange-200"
          }`}>
            <div className={`text-xs font-medium ${
              freshness?.status_key === "fresh" ? "text-emerald-700" : "text-orange-700"
            }`}>
              Freshness
            </div>
            <div className={`text-xs mt-1 ${
              freshness?.status_key === "fresh" ? "text-emerald-600" : "text-orange-600"
            }`}>
              {freshness?.current_lag_display || freshness?.status || "Unknown"}
            </div>
          </div>
          
          <div className={`p-2 rounded ${
            data_quality?.available ? "bg-blue-50 border border-blue-200" : "bg-gray-50 border border-gray-200"
          }`}>
            <div className={`text-xs font-medium ${
              data_quality?.available ? "text-blue-700" : "text-gray-700"
            }`}>
              Data Quality
            </div>
            <div className={`text-xs mt-1 ${
              data_quality?.available ? "text-blue-600" : "text-gray-600"
            }`}>
              {data_quality?.display || "N/A"}
            </div>
          </div>
          
          <div className={`p-2 rounded ${
            schema?.available ? "bg-purple-50 border border-purple-200" : "bg-gray-50 border border-gray-200"
          }`}>
            <div className={`text-xs font-medium ${
              schema?.available ? "text-purple-700" : "text-gray-700"
            }`}>
              Schema
            </div>
            <div className={`text-xs mt-1 ${
              schema?.available ? "text-purple-600" : "text-gray-600"
            }`}>
              {schema?.display || "N/A"}
            </div>
          </div>
        </div>
        
        {/* Overall Status */}
        <div className="mt-4 pt-3 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Overall Status</span>
            <div className="flex items-center gap-1">
              {getStatusIcon(lineage_item?.status || 'unknown')}
              <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(lineage_item?.status || 'unknown')}`}>
                {lineage_item?.status || 'Unknown'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm text-muted-foreground">Last Run</span>
            <span className="text-xs text-muted-foreground">
              {lineage_item?.last_run_age || "Unknown"}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-4">
        <h4 className="text-sm font-semibold text-foreground mb-3">QUICK ACTIONS</h4>
        
        <div className="space-y-2">
          <button className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-accent rounded-lg transition-colors">
            View Full Lineage
          </button>
          <button className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-accent rounded-lg transition-colors">
            Run History
          </button>
          <button className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-accent rounded-lg transition-colors">
            Data Quality Checks
          </button>
          <button className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-accent rounded-lg transition-colors">
            Configure Alerts
          </button>
        </div>
      </div>
    </div>
  )
}