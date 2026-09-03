'use client'

import { Download } from 'lucide-react'

interface ExportButtonProps {
  onClick?: () => void
  label?: string
}

export function ExportButton({ onClick, label = 'Export' }: ExportButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-xs transition-all duration-150 cursor-pointer"
    >
      <Download size={15} className="stroke-[2.5]" />
      <span>{label}</span>
    </button>
  )
}
