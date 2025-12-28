"use client"

import type React from "react"
import { Sidebar } from "@/components/sidebar"
import { useState } from "react"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className="flex min-h-screen">
      <Sidebar isCollapsed={isCollapsed} onToggleCollapse={setIsCollapsed} />
      <main className={`flex-1 p-8 transition-all duration-300 ${isCollapsed ? "ml-16" : "ml-64"}`}>
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  )
}
