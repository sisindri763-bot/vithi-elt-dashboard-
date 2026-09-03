"use client"

import { ChevronDown, Database } from "lucide-react"

interface PipelineSelectProps {
  value: string
  onChange: (value: string) => void
  pipelines: string[]
  loading?: boolean
}

export function PipelineSelect({ value, onChange, pipelines, loading }: PipelineSelectProps) {
  const displayValue = value === "all" ? "All Pipelines" : value

  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={loading}
        className={`
          appearance-none bg-card border border-border rounded-lg px-3 py-2 pr-10 pl-9
          text-sm font-medium text-muted-foreground 
          hover:border-border/80 hover:bg-accent
          focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring 
          transition-all duration-200 min-w-[180px] cursor-pointer
          disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-muted
          shadow-sm hover:shadow-md
        `}
        style={{
          backgroundImage: 'none'
        }}
      >
        <option 
          value="all" 
          className="bg-card text-foreground py-3 px-4 font-medium hover:bg-accent"
        >
          All Pipelines
        </option>
        {pipelines.length > 0 ? (
          pipelines.map((pipeline) => (
            <option 
              key={pipeline} 
              value={pipeline} 
              className="bg-card text-foreground py-3 px-4 hover:bg-accent"
            >
              {pipeline}
            </option>
          ))
        ) : (
          !loading && (
            <option 
              disabled 
              className="text-muted-foreground py-3 px-4 italic"
            >
              No pipelines available
            </option>
          )
        )}
      </select>
      
      {/* Pipeline Icon */}
      <Database 
        size={16} 
        className={`absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors ${
          loading ? 'opacity-50' : 'opacity-100'
        }`} 
      />
      
      {/* Dropdown Arrow */}
      <ChevronDown 
        size={16} 
        className={`absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none transition-all duration-200 ${
          loading ? 'opacity-50' : 'opacity-100'
        }`} 
      />
      
      {/* Loading Spinner */}
      {loading && (
        <div className="absolute right-9 top-1/2 -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
        </div>
      )}
      
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-accent/20 opacity-0 hover:opacity-20 transition-opacity duration-200 rounded-lg pointer-events-none"></div>
    </div>
  )
}