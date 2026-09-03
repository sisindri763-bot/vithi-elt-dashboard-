"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { Calendar, Check } from "lucide-react"

interface DateRangePickerProps {
  initialRange?: string
  onRangeChange?: (range: string) => void
  mode?: "date" | "preset" // New prop to switch between modes
  onPresetChange?: (preset: string) => void
  initialPreset?: string
}

function formatDate(date: Date): string {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const month = months[date.getMonth()]
  const day = String(date.getDate()).padStart(2, "0")
  const year = date.getFullYear()
  return `${month} ${day}, ${year}`
}

function getDynamicPresets() {
  const now = new Date()

  // Today
  const todayStr = `${formatDate(now)}`

  // Yesterday
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  const yesterdayStr = `${formatDate(yesterday)}`

  // Last 7 Days
  const last7 = new Date(now)
  last7.setDate(now.getDate() - 6)
  const last7Str = `${formatDate(last7)} – ${formatDate(now)}`

  // Last 30 Days
  const last30 = new Date(now)
  last30.setDate(now.getDate() - 29)
  const last30Str = `${formatDate(last30)} – ${formatDate(now)}`

  // This Month
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  const thisMonthStr = `${formatDate(monthStart)} – ${formatDate(monthEnd)}`

  return [
    { label: "Today", value: todayStr },
    { label: "Yesterday", value: yesterdayStr },
    { label: "Last 7 Days", value: last7Str },
    { label: "Last 30 Days", value: last30Str },
    { label: "This Month", value: thisMonthStr },
  ]
}

const TIME_PRESETS = [
  { label: "15 minutes", value: "15m" },
  { label: "24 hours", value: "24h" },
  { label: "7 days", value: "7d" },
  { label: "30 days", value: "30d" },
  { label: "All time", value: "all" },
]

export function DateRangePicker({
  initialRange,
  onRangeChange,
  mode = "date",
  onPresetChange,
  initialPreset = "24h",
}: DateRangePickerProps) {
  const datePresets = useMemo(() => getDynamicPresets(), [])
  const presets = mode === "preset" ? TIME_PRESETS : datePresets
  
  const defaultValue = mode === "preset" ? initialPreset : (initialRange || datePresets[0].value)
  const [selectedValue, setSelectedValue] = useState(defaultValue)
  const [isOpen, setIsOpen] = useState(false)

  // Current ISO date for inputs
  const todayISO = new Date().toISOString().split("T")[0]
  const [startDate, setStartDate] = useState(todayISO)
  const [endDate, setEndDate] = useState(todayISO)
  const [isCustom, setIsCustom] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSelectPreset = (value: string) => {
    setSelectedValue(value)
    setIsCustom(false)
    setIsOpen(false)
    
    if (mode === "preset" && onPresetChange) {
      onPresetChange(value)
    } else if (onRangeChange) {
      onRangeChange(value)
    }
  }

  const handleApplyCustom = () => {
    if (!startDate || !endDate) return
    const startObj = new Date(startDate)
    const endObj = new Date(endDate)
    const formatted = `${formatDate(startObj)} – ${formatDate(endObj)}`
    setSelectedValue(formatted)
    setIsCustom(true)
    setIsOpen(false)
    
    if (mode === "preset" && onPresetChange) {
      // For preset mode, send custom as a special value
      onPresetChange(`custom:${startDate}:${endDate}`)
    } else if (onRangeChange) {
      onRangeChange(formatted)
    }
  }

  // Get display label
  const displayLabel = mode === "preset" 
    ? (TIME_PRESETS.find(p => p.value === selectedValue)?.label || selectedValue)
    : selectedValue

  return (
    <div className="relative inline-block text-left" ref={popoverRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="bg-card border border-border rounded-xl px-3.5 py-2.5 shadow-sm flex items-center justify-between gap-3 transition-all cursor-pointer hover:bg-accent w-30"
      >
        <span className="text-xs font-semibold text-foreground tracking-tight">{displayLabel}</span>
        <div className="h-4 w-[1px] bg-border" />
        <Calendar size={16} className="text-muted-foreground" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-popover border border-border shadow-xl p-4 z-50 animate-in fade-in zoom-in-95">
          <div className="text-xs font-bold text-popover-foreground mb-2.5">
            {mode === "preset" ? "Select Time Range" : "Select Date Range"}
          </div>

          {/* Quick Presets */}
          <div className="space-y-1 mb-4">
            {presets.map((preset) => {
              const isSelected = !isCustom && selectedValue === preset.value
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handleSelectPreset(preset.value)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-accent text-accent-foreground font-semibold"
                      : "text-popover-foreground hover:bg-accent"
                  }`}
                >
                  <span>{preset.label}</span>
                  {isSelected && <Check size={14} className="text-primary" />}
                </button>
              )
            })}
          </div>

          {/* Custom Range - always show */}
          <div className="border-t border-border pt-3">
            <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Custom Range</div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div>
                <label className="text-[10px] text-muted-foreground font-medium block mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
                />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground font-medium block mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleApplyCustom}
              className="w-full bg-primary text-primary-foreground font-semibold py-2 rounded-xl text-xs shadow-sm transition-all cursor-pointer hover:bg-primary/90 hover:shadow-md hover:-translate-y-0.5"
            >
              Apply Custom Range
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
