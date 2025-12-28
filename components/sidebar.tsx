"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, CheckSquare, Activity, BarChart3, Settings, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { getUserPreferences } from "@/lib/storage"
import { Button } from "@/components/ui/button"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tasks", label: "Today's Tasks", icon: CheckSquare },
  { href: "/heatmap", label: "Heatmap", icon: Activity },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
]

interface SidebarProps {
  isCollapsed: boolean
  onToggleCollapse: (collapsed: boolean) => void
}

export function Sidebar({ isCollapsed, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname()
  const [userName, setUserName] = useState("User")
  const [resetTime, setResetTime] = useState("04:00 AM")

  useEffect(() => {
    const prefs = getUserPreferences()
    if (prefs) {
      setUserName(prefs.name)
      setResetTime(prefs.dayResetTime)
    }
  }, [])

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen border-r bg-sidebar flex flex-col transition-all duration-300 z-50",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      {/* Logo Section */}
      <div className="p-6 border-b border-sidebar-border flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-sidebar-foreground truncate">MomentumTracker</h1>
            <p className="text-xs text-sidebar-foreground/60 mt-1 truncate">Welcome, {userName}</p>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onToggleCollapse(!isCollapsed)}
          className="shrink-0 ml-auto text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                isActive && "bg-sidebar-primary text-sidebar-primary-foreground",
                isCollapsed && "justify-center",
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Bottom Section */}
      {!isCollapsed && (
        <div className="p-4 border-t border-sidebar-border space-y-2">
          <div className="text-xs text-sidebar-foreground/60">
            <div>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}</div>
            <div className="mt-1">Day Reset: {resetTime}</div>
          </div>
        </div>
      )}
    </aside>
  )
}
