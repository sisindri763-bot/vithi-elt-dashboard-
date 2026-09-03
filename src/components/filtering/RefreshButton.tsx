"use client"

import React, { useState } from "react"
import { RefreshCw } from "lucide-react"

interface RefreshButtonProps {
  onRefresh?: () => void
  loading?: boolean
}

export function RefreshButton({ onRefresh, loading = false }: RefreshButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(loading)

  const handleClick = () => {
    setIsRefreshing(true)
    if (onRefresh) onRefresh()
    setTimeout(() => setIsRefreshing(false), 700)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      title="Refresh data"
      className="bg-card border border-border hover:border-border/80 hover:bg-accent text-muted-foreground hover:text-foreground rounded-xl p-2.5 shadow-sm transition-all cursor-pointer flex items-center justify-center"
    >
      <RefreshCw size={16} className={isRefreshing ? "animate-spin text-primary" : ""} />
    </button>
  )
}
