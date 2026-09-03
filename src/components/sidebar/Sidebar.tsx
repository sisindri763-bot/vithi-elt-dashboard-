'use client'

import { useState, useEffect } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import Item from './Item'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

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
  Plug,
} from 'lucide-react'

export default function Sidebar() {
  const currentYear = new Date().getFullYear()
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--sidebar-width',
      isCollapsed ? '64px' : '256px'
    )
  }, [isCollapsed])

  return (
    <div
      className={`${
        isCollapsed ? 'w-16' : 'w-64'
      } h-screen bg-white text-slate-700 flex flex-col border-r border-slate-200/80 fixed left-0 top-0 z-40 transition-all duration-300 shadow-xs`}
      data-no-print
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-4 min-h-[73px] relative">
        {!isCollapsed ? (
          <>
            <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center shadow-xs">
              <span className="text-white font-black text-lg">V</span>
            </div>
            <div>
              <p className="text-lg font-black text-slate-900 tracking-tight leading-none">VITHI</p>
              <p className="text-[11px] font-semibold text-emerald-600 mt-0.5">Data Observability</p>
            </div>
          </>
        ) : (
          <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center mx-auto shadow-xs">
            <span className="text-white font-black text-lg">V</span>
          </div>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute top-4 right-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600 cursor-pointer"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <Separator className="bg-slate-100" />

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
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
          <Item
            label="Integrations"
            icon={<Plug size={18} />}
            href="/integrations"
            isCollapsed={isCollapsed}
          />

          {!isCollapsed && (
            <Collapsible defaultOpen>
              <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-800 rounded-xl cursor-pointer transition">
                <div className="flex items-center gap-2.5">
                  <DatabaseArrowDown size={18} className="text-slate-400" />
                  <span>Data Observability</span>
                </div>
                <ChevronDown size={14} className="text-slate-400" />
              </CollapsibleTrigger>

              <CollapsibleContent className="ml-5 pl-2 border-l border-slate-100 space-y-0.5 mt-0.5">
                <Item label="Freshness" href="/freshness" isCollapsed={false} />
                <Item label="Volume" href="/observability/volume" isCollapsed={false} />
                <Item label="Lineage" href="/lineage" isCollapsed={false} />
              </CollapsibleContent>
            </Collapsible>
          )}

          {isCollapsed && (
            <Item
              label="Data Observability"
              icon={<DatabaseArrowDown size={18} />}
              href="/freshness"
              isCollapsed={isCollapsed}
            />
          )}

          <Item
            label="Metrics"
            icon={<BarChart3 size={18} />}
            href="/metrics"
            isCollapsed={isCollapsed}
          />
        </div>
      </ScrollArea>

      {!isCollapsed && (
        <div className="p-3 text-[11px] font-medium text-slate-400 border-t border-slate-100 flex items-center justify-between">
          <span>© {currentYear} VITHI</span>
          <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold text-[10px]">v2.1</span>
        </div>
      )}
    </div>
  )
}
