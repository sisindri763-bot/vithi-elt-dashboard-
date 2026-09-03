"use client"

import { Download } from "lucide-react"

interface ExportButtonProps {
  onClick?: () => void
  label?: string
}

export function ExportButton({ onClick, label = "Export" }: ExportButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-card hover:bg-accent active:bg-accent/80 text-foreground font-semibold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 border border-border shadow-sm transition-all cursor-pointer"
    >
      <Download size={15} className="stroke-[2.2]" />
      <span>{label}</span>
    </button>
  )
}
