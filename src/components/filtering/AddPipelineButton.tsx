"use client"

import React from "react"
import { Plus } from "lucide-react"

interface AddPipelineButtonProps {
  onClick?: () => void
  label?: string
}

export function AddPipelineButton({
  onClick,
  label = "Add Pipeline",
}: AddPipelineButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-primary hover:bg-primary/90 active:bg-primary/80 text-primary-foreground font-semibold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
    >
      <Plus size={16} className="stroke-[2.5]" />
      <span>{label}</span>
    </button>
  )
}
