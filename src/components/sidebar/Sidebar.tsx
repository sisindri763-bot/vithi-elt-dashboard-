"use client"

import { useState, useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import Item from "./Item"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

import {
  Home,
  LineSquiggle,
  DatabaseArrowDown,
  AlertTriangle,
  BarChart3,
  Bell,
  Logs,
  ChevronDown,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react"

export default function Sidebar() {
  const currentYear = new Date().getFullYear()
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Update CSS variable for margin adjustment
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--sidebar-width', 
      isCollapsed ? '64px' : '256px'
    )
  }, [isCollapsed])

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} h-screen bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border fixed left-0 top-0 z-40 transition-all duration-300`} data-no-print>

      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-4 min-h-[73px] relative">
        {!isCollapsed ? (
          <>
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">V</span>
            </div>
            <div>
              <p className="text-lg font-semibold">VITHI</p>
              <p className="text-xs text-muted-foreground">Data Observability</p>
            </div>
          </>
        ) : (
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mx-auto">
            <span className="text-white font-bold text-lg">V</span>
          </div>
        )}
        
        {/* Collapse Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`absolute top-4 right-2 p-1.5 rounded-lg hover:bg-accent transition-colors`}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <Separator className="bg-border" />

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">

          {/* Main Items */}
          <Item 
            label="Overview" 
            icon={<Home size={18} />} 
            href="/overview" 
            isCollapsed={isCollapsed}
          />
          <Item 
            label="Pipelines" 
            icon={<LineSquiggle size={18} />} 
            href="/pipelines" 
            isCollapsed={isCollapsed}
          />

          {!isCollapsed && (
            /* Collapsible - only show when not collapsed */
            <Collapsible defaultOpen>
              <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-lg cursor-pointer">
                <div className="flex items-center gap-3">
                  <DatabaseArrowDown size={18} />
                  <span>Data Observability</span>
                </div>
                <ChevronDown size={16} />
              </CollapsibleTrigger>

              <CollapsibleContent className="ml-6 space-y-1 mt-1">
                <Item label="Freshness" href="/freshness" isCollapsed={false} />
                <Item label="Volume" href="/observability/volume" isCollapsed={false} />
                <Item label="Data Quality" href="/observability/quality" isCollapsed={false} />
                <Item label="Schema" href="/observability/schema" isCollapsed={false} />
                <Item label="Lineage" href="/lineage" isCollapsed={false} />
              </CollapsibleContent>
            </Collapsible>
          )}

          {isCollapsed && (
            /* Show Data Observability as single item when collapsed */
            <Item 
              label="Data Observability" 
              icon={<DatabaseArrowDown size={18} />} 
              href="/freshness" 
              isCollapsed={isCollapsed}
            />
          )}

          <Item 
            label="Incidents" 
            icon={<AlertTriangle size={18} />} 
            href="/incidents" 
            isCollapsed={isCollapsed}
          />
          <Item 
            label="Metrics" 
            icon={<BarChart3 size={18} />} 
            href="/metrics" 
            isCollapsed={isCollapsed}
          />
          <Item 
            label="Alerts" 
            icon={<Bell size={18} />} 
            href="/alerts" 
            isCollapsed={isCollapsed}
          />
          <Item 
            label="Logs" 
            icon={<Logs size={18} />} 
            href="/logs" 
            isCollapsed={isCollapsed}
          />
          <Item 
            label="Settings" 
            icon={<Settings size={18} />} 
            href="/settings" 
            isCollapsed={isCollapsed}
          />

        </div>
      </ScrollArea>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-3 text-xs text-muted-foreground">
          © {currentYear} VITHI
        </div>
      )}

    </div>
  )
}