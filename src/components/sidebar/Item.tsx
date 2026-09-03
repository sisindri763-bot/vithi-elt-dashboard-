"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

type ItemProps = {
  label: string
  icon?: React.ReactNode
  active?: boolean
  href?: string
  isCollapsed?: boolean
}

export default function Item({ label, icon, active, href, isCollapsed = false }: ItemProps) {
  const pathname = usePathname()
  const isItemActive = active !== undefined ? active : (href ? (href === '/' ? pathname === '/' : pathname.startsWith(href)) : false)

  const content = (
    <div
      className={`flex items-center ${isCollapsed ? 'justify-center px-2 py-3' : 'gap-3 px-3 py-2'} rounded-xl cursor-pointer transition-all group relative ${
        isItemActive
          ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      }`}
      title={isCollapsed ? label : undefined}
    >
      {icon && <span className="w-5 h-5 flex items-center justify-center">{icon}</span>}
      {!isCollapsed && <span className="text-sm font-medium">{label}</span>}
      
      {/* Tooltip for collapsed state */}
      {isCollapsed && (
        <div className="absolute left-14 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
          {label}
        </div>
      )}
    </div>
  )

  if (href) {
    return <Link href={href} className="block">{content}</Link>
  }

  return content
}