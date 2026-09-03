"use client"

import React from "react"
import { Search, X } from "lucide-react"

interface SearchFilterInputProps {
  value: string
  onChange: (val: string) => void
  placeholder?: string
}

export function SearchFilterInput({
  value,
  onChange,
  placeholder = "Search pipelines...",
}: SearchFilterInputProps) {
  return (
    <div className="relative flex-1 min-w-[240px] max-w-sm">
      <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-9 pr-8 py-2 text-xs font-medium bg-card border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-ring focus:ring-1 focus:ring-ring shadow-sm transition-all"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-full cursor-pointer"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}
