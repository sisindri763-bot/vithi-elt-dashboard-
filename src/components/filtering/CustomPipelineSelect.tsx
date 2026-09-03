"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown, Database, Check } from "lucide-react"

interface CustomPipelineSelectProps {
  value: string
  onChange: (value: string) => void
  pipelines: string[]
  loading?: boolean
}

export function CustomPipelineSelect({ value, onChange, pipelines, loading }: CustomPipelineSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const displayValue = value === "all" ? "All Pipelines" : value

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue)
    setIsOpen(false)
  }

  const allOptions = [
    { value: "all", label: "All Pipelines" },
    ...pipelines.map(pipeline => ({ 
      value: pipeline, 
      label: pipeline
    }))
  ]

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => !loading && setIsOpen(!isOpen)}
        disabled={loading}
        className={`
          flex items-center justify-between w-full min-w-[180px]
          bg-card border border-border rounded-lg px-3 py-2
          text-sm font-medium text-muted-foreground 
          focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring 
          transition-all duration-200 cursor-pointer
          disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-muted
          ${isOpen ? 'ring-2 ring-ring border-ring bg-accent' : ''}
        `}
      >
        <div className="flex items-center gap-2">
          <Database size={16} className="text-muted-foreground" />
          <span className="truncate">{displayValue}</span>
        </div>
        <div className="flex items-center gap-2">
          {loading && (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
          )}
          <ChevronDown 
            size={16} 
            className={`text-muted-foreground transition-transform duration-200 ${
              isOpen ? 'rotate-180' : 'rotate-0'
            }`} 
          />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {allOptions.length > 0 ? (
            allOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`
                  w-full flex items-center justify-between px-3 py-2.5 text-sm text-left
                  hover:bg-accent hover:text-accent-foreground transition-colors duration-150
                  first:rounded-t-lg last:rounded-b-lg
                  ${value === option.value ? 'bg-accent text-accent-foreground font-semibold' : 'text-popover-foreground'}
                `}
              >
                <span className="truncate">{option.label}</span>
                {value === option.value && (
                  <Check size={16} className="text-primary shrink-0 ml-2" />
                )}
              </button>
            ))
          ) : (
            <div className="px-3 py-2.5 text-sm text-muted-foreground italic">
              No pipelines available
            </div>
          )}
        </div>
      )}
    </div>
  )
}