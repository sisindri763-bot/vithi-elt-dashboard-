"use client"

import { useState, useRef, useEffect } from "react"
import { Search, ChevronDown, Check } from "lucide-react"

export interface FilterOption {
  label: string
  value: string
}

export interface FilterConfig {
  key: string
  label: string
  options: FilterOption[]
  defaultValue?: string
}

interface FilterBarProps {
  searchPlaceholder?: string
  filters?: FilterConfig[]
  onSearchChange?: (value: string) => void
  onFilterChange?: (key: string, value: string) => void
}

export function FilterBar({
  searchPlaceholder = "Search...",
  filters = [],
  onSearchChange,
  onFilterChange,
}: FilterBarProps) {
  const [search, setSearch] = useState("")
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(filters.map((f) => [f.key, f.defaultValue ?? f.options[0]?.value ?? ""]))
  )
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const filterRefs = useRef<Record<string, HTMLDivElement | null>>({})

  // Ensure new filter keys are always present (handles dynamic filters)
  const safeValues = Object.fromEntries(
    filters.map((f) => [f.key, values[f.key] ?? f.defaultValue ?? f.options[0]?.value ?? ""])
  )

  const handleSearch = (val: string) => {
    setSearch(val)
    onSearchChange?.(val)
  }

  const handleFilter = (key: string, val: string) => {
    setValues((prev) => ({ ...prev, [key]: val }))
    onFilterChange?.(key, val)
    setOpenDropdown(null)
  }

  const toggleDropdown = (key: string) => {
    setOpenDropdown(openDropdown === key ? null : key)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdown) {
        const ref = filterRefs.current[openDropdown]
        if (ref && !ref.contains(event.target as Node)) {
          setOpenDropdown(null)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openDropdown])

  return (
    <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-3 py-2.5 shadow-sm">
      {/* Search */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Search size={14} className="text-gray-400 shrink-0" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="text-xs placeholder:text-gray-400 bg-transparent focus:outline-none w-full"
        />
      </div>

      {/* Custom Dropdowns */}
      {filters.map((filter) => (
        <div key={filter.key} className="flex items-center gap-3">
          <div className="h-5 w-px bg-gray-200 shrink-0" />
          <div 
            ref={(el) => { filterRefs.current[filter.key] = el }}
            className="relative"
          >
            <button
              type="button"
              onClick={() => toggleDropdown(filter.key)}
              className="flex flex-col gap-0.5 text-left cursor-pointer hover:bg-gray-50 rounded-lg px-2 py-1 transition-colors"
            >
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide leading-none">
                {filter.label}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-700 font-medium">
                  {filter.options.find(opt => opt.value === safeValues[filter.key])?.label || filter.options[0]?.label}
                </span>
                <ChevronDown 
                  size={12} 
                  className={`text-gray-400 transition-transform ${openDropdown === filter.key ? "rotate-180" : ""}`} 
                />
              </div>
            </button>

            {openDropdown === filter.key && (
              <div className="absolute right-0 mt-1 w-44 rounded-xl bg-white border border-gray-200 shadow-lg py-1.5 z-50 max-h-48 overflow-y-auto transition-all duration-200 ease-out">
                {filter.options.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleFilter(filter.key, opt.value)}
                    className="w-full flex items-center justify-between px-3.5 py-2 text-xs font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer text-left"
                  >
                    <span className="truncate">{opt.label}</span>
                    {safeValues[filter.key] === opt.value && (
                      <Check size={12} className="text-blue-600 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
