"use client"

import { useState, useRef, useEffect } from "react"

interface MultiPipelineSelectProps {
  selectedPipelines: string[]
  onChange: (pipelines: string[]) => void
  pipelines: string[]
  loading?: boolean
}

export function MultiPipelineSelect({
  selectedPipelines,
  onChange,
  pipelines,
  loading = false,
}: MultiPipelineSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleToggleAll = () => {
    if (selectedPipelines.length === pipelines.length) {
      onChange([]) // Clear all
    } else {
      onChange([...pipelines]) // Select all
    }
  }

  const handleTogglePipeline = (pipeline: string) => {
    if (selectedPipelines.includes(pipeline)) {
      onChange(selectedPipelines.filter(p => p !== pipeline))
    } else {
      onChange([...selectedPipelines, pipeline])
    }
  }

  const removeTag = (pipeline: string) => {
    onChange(selectedPipelines.filter(p => p !== pipeline))
  }

  const getDisplayText = () => {
    if (selectedPipelines.length === 0) return "All Pipelines"
    if (selectedPipelines.length === 1) return selectedPipelines[0]
    return `${selectedPipelines.length} Selected`
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground bg-card border border-border rounded-lg hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 min-w-[140px] justify-between"
      >
        <span className="truncate">{getDisplayText()}</span>
        <svg 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Selected Tags */}
      {selectedPipelines.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 flex flex-wrap gap-1 z-10">
          {selectedPipelines.map((pipeline) => (
            <div
              key={pipeline}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-primary-foreground bg-primary/10 border border-primary/20 rounded-md"
            >
              <span className="truncate max-w-[100px]">{pipeline}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  removeTag(pipeline)
                }}
                className="text-primary hover:text-primary/80"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-lg shadow-lg z-20 max-h-64 overflow-y-auto">
          {/* Header with Select All / Clear All */}
          <div className="p-2 border-b border-border bg-muted/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                {selectedPipelines.length} of {pipelines.length} selected
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleToggleAll}
                  className="text-xs text-primary hover:text-primary/80 font-medium"
                >
                  {selectedPipelines.length === pipelines.length ? 'Clear All' : 'Select All'}
                </button>
              </div>
            </div>
          </div>

          {/* Pipeline Options */}
          <div className="p-1">
            {pipelines.map((pipeline) => (
              <label
                key={pipeline}
                className="flex items-center gap-3 px-3 py-2 text-sm text-popover-foreground hover:bg-accent cursor-pointer rounded-md"
              >
                <input
                  type="checkbox"
                  checked={selectedPipelines.includes(pipeline)}
                  onChange={() => handleTogglePipeline(pipeline)}
                  className="w-4 h-4 text-primary border-input rounded focus:ring-ring"
                />
                <span className="flex-1 truncate">{pipeline}</span>
                {selectedPipelines.includes(pipeline) && (
                  <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </label>
            ))}
          </div>

          {/* Footer */}
          {pipelines.length === 0 && (
            <div className="p-3 text-center text-sm text-muted-foreground">
              No pipelines available
            </div>
          )}
        </div>
      )}
    </div>
  )
}