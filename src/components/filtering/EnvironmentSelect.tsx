"use client"

import { useState } from "react"
import { ChevronDown, Check } from "lucide-react"

interface EnvironmentSelectProps {
  value?: string
  onChange?: (env: string) => void
  environments?: string[]
}

export function EnvironmentSelect({
  value = "Production",
  onChange,
  environments = ["Production", "Staging", "Development", "QA"],
}: EnvironmentSelectProps) {
  const [selected, setSelected] = useState(value)
  const [isOpen, setIsOpen] = useState(false)

  const handleSelect = (env: string) => {
    setSelected(env)
    setIsOpen(false)
    if (onChange) onChange(env)
  }

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="bg-card border border-border hover:border-border/80 rounded-xl px-3.5 py-2 shadow-sm flex items-center justify-between gap-3 text-left transition-all cursor-pointer min-w-[140px]"
      >
        <div className="flex flex-col">
          <span className="text-xs font-bold text-foreground mt-1">{selected}</span>
        </div>
        <ChevronDown size={14} className={`text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-44 rounded-xl bg-popover border border-border shadow-lg py-1.5 z-50 animate-in fade-in zoom-in-95">
          {environments.map((env) => (
            <button
              key={env}
              onClick={() => handleSelect(env)}
              className="w-full flex items-center justify-between px-3.5 py-2 text-xs font-medium text-popover-foreground hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
            >
              <span>{env}</span>
              {selected === env && <Check size={14} className="text-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
