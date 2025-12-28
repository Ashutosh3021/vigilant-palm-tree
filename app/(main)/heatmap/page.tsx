"use client"

import { useEffect, useState } from "react"
import { FullYearHeatmap } from "@/components/full-year-heatmap"
import { getDailyScores } from "@/lib/storage"
import type { DailyScore } from "@/lib/types"

export default function HeatmapPage() {
  const [scores, setScores] = useState<DailyScore[]>([])
  const [totalDays, setTotalDays] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [currentStreak, setCurrentStreak] = useState(0)

  const refreshData = () => {
    const yearStart = new Date(new Date().getFullYear(), 0, 1)
    const yearStartStr = yearStart.toISOString().split("T")[0]

    const allScores = getDailyScores()
      .filter((s) => s.date >= yearStartStr)
      .sort((a, b) => a.date.localeCompare(b.date))

    setScores(allScores)

    // Calculate stats
    setTotalDays(allScores.length)

    let maxStreak = 0
    let current = 0

    if (allScores.length > 0) {
      const sortedScores = [...allScores].reverse()
      let tempStreak = 0

      for (const score of sortedScores) {
        if (score.score >= 70) {
          tempStreak++
          if (tempStreak > maxStreak) maxStreak = tempStreak
        } else {
          tempStreak = 0
        }
      }

      // Calculate current streak
      for (const score of sortedScores) {
        if (score.score >= 70) {
          current++
        } else {
          break
        }
      }
    }

    setBestStreak(maxStreak)
    setCurrentStreak(current)
  }

  useEffect(() => {
    refreshData()

    const handleStorageChange = () => {
      refreshData()
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("tasksUpdated", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("tasksUpdated", handleStorageChange)
    }
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-balance">Momentum Heatmap</h1>
        <p className="text-muted-foreground mt-1">Your activity throughout the year</p>
      </div>

      {/* Full Year Heatmap */}
      <div className="p-6 border rounded-lg bg-card">
        <div className="overflow-x-auto">
          <FullYearHeatmap scores={scores} year={new Date().getFullYear()} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 border rounded-lg bg-card">
          <div className="text-sm text-muted-foreground">Total Days</div>
          <div className="text-2xl font-bold mt-1">{totalDays}</div>
        </div>
        <div className="p-4 border rounded-lg bg-card">
          <div className="text-sm text-muted-foreground">Best Streak</div>
          <div className="text-2xl font-bold mt-1">{bestStreak} days</div>
        </div>
        <div className="p-4 border rounded-lg bg-card">
          <div className="text-sm text-muted-foreground">Current Streak</div>
          <div className="text-2xl font-bold mt-1">{currentStreak} days</div>
        </div>
      </div>
    </div>
  )
}
