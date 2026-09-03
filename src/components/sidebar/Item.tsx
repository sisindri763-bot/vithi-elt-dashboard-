'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

type ItemProps = {
  label: string
  icon?: React.ReactNode
  active?: boolean
  href?: string
  isCollapsed?: boolean
}

export default function Item({
  label,
  icon,
  active,
  href,
  isCollapsed = false,
}: ItemProps) {
  const pathname = usePathname()
  const isItemActive =
    active !== undefined
      ? active
      : href
      ? href === '/'
        ? pathname === '/'
        : pathname.startsWith(href)
      : false

  const content = (
    <div
      className={`flex items-center ${
        isCollapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2'
      } rounded-xl cursor-pointer transition-all duration-150 group relative font-semibold text-xs ${
        isItemActive
          ? 'bg-emerald-500 text-white shadow-xs'
          : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
      }`}
      title={isCollapsed ? label : undefined}
    >
      {icon && (
        <span
          className={`w-5 h-5 flex items-center justify-center ${
            isItemActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'
          }`}
        >
          {icon}
        </span>
      )}
      {!isCollapsed && <span>{label}</span>}

      {isCollapsed && (
        <div className="absolute left-14 bg-slate-900 text-white text-xs px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-md">
          {label}
        </div>
      )}
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    )
  }

  return content
}
