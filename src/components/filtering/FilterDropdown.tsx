"use client"

import React from "react"

interface FilterDropdownProps {
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
  minWidth?: string
}

export function FilterDropdown({
  label,
  value,
  options,
  onChange,
  minWidth = "100px",
}: FilterDropdownProps) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] text-muted-foreground font-semibold tracking-wider uppercase leading-tight mb-0.5">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ minWidth }}
        className="bg-card border border-border rounded-xl px-3 py-1.5 text-xs font-semibold text-foreground focus:outline-none focus:border-ring focus:ring-1 focus:ring-ring cursor-pointer shadow-sm transition-all"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  )
}
