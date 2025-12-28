"use client"

import { useEffect, useState } from "react"
import { StatsCard } from "@/components/stats-card"
import { TrendingUp, CheckCircle2, Calendar } from "lucide-react"
import { MiniHeatmap } from "@/components/mini-heatmap"
import { ScoreTrendChart } from "@/components/score-trend-chart"
import { getDailyScores, getDailyScore } from "@/lib/storage"
import type { DailyScore } from "@/lib/types"

export default function DashboardPage() {
  const [todayScore, setTodayScore] = useState<DailyScore | null>(null)
  const [scores, setScores] = useState<DailyScore[]>([])
  const [streak, setStreak] = useState(0)
  const [avgScore, setAvgScore] = useState(0)
  const [weekAvg, setWeekAvg] = useState(0)
  const [monthAvg, setMonthAvg] = useState(0)
  const [scoreChange, setScoreChange] = useState(0)

  const refreshData = () => {
    const today = new Date().toISOString().split("T")[0]
    const todayData = getDailyScore(today)
    setTodayScore(todayData || null)

    // Fetch last 90 days of scores
    const ninetyDaysAgo = new Date()
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
    const ninetyDaysAgoStr = ninetyDaysAgo.toISOString().split("T")[0]

    const allScores = getDailyScores()
      .filter((s) => s.date >= ninetyDaysAgoStr)
      .sort((a, b) => a.date.localeCompare(b.date))

    setScores(allScores)

    // Calculate streak
    let currentStreak = 0
    if (allScores.length > 0) {
      const sortedScores = [...allScores].reverse()
      for (const score of sortedScores) {
        if (score.score >= 70) {
          currentStreak++
        } else {
          break
        }
      }
    }
    setStreak(currentStreak)

    // Calculate averages
    const average =
      allScores.length > 0 ? Math.round(allScores.reduce((sum, s) => sum + s.score, 0) / allScores.length) : 0
    setAvgScore(average)

    // Calculate 7-day average
    const last7Days = allScores.length > 0 ? allScores.slice(-7) : []
    const weekAverage =
      last7Days.length > 0 ? Math.round(last7Days.reduce((sum, s) => sum + s.score, 0) / last7Days.length) : 0
    setWeekAvg(weekAverage)

    // Calculate month average
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const monthScores = allScores.filter((s) => new Date(s.date) >= thirtyDaysAgo)
    const monthAverage =
      monthScores.length > 0 ? Math.round(monthScores.reduce((sum, s) => sum + s.score, 0) / monthScores.length) : 0
    setMonthAvg(monthAverage)

    // Yesterday's score for comparison
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split("T")[0]
    const yesterdayScore = allScores.find((s) => s.date === yesterdayStr)
    const change = todayData && yesterdayScore ? todayData.score - yesterdayScore.score : 0
    setScoreChange(change)
  }

  useEffect(() => {
    refreshData()

    const handleStorageChange = () => {
      refreshData()
    }

    window.addEventListener("storage", handleStorageChange)
    // Custom event for same-page updates
    window.addEventListener("tasksUpdated", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("tasksUpdated", handleStorageChange)
    }
  }, [])

  const last7Days = scores.length > 0 ? scores.slice(-7) : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-balance">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Track your momentum and progress</p>
      </div>

      {/* Hero Score Card */}
      <div className="p-8 border rounded-lg bg-card">
        <h2 className="text-lg font-semibold mb-4">Today's Score</h2>
        <div className="flex items-center gap-6">
          <div className="text-6xl font-bold" style={{ color: "#1e90ff" }}>
            {todayScore ? `${todayScore.score}%` : "0%"}
          </div>
          <div className="flex-1 space-y-3">
            <div className="h-4 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full transition-all"
                style={{ width: `${todayScore?.score || 0}%`, backgroundColor: "#1e90ff" }}
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {todayScore ? `${todayScore.tasks_completed}/${todayScore.total_tasks}` : "0/0"} tasks completed
              </span>
              {scoreChange !== 0 && (
                <span style={{ color: scoreChange > 0 ? "#4682b4" : "#dc2626" }}>
                  {scoreChange > 0 ? "+" : ""}
                  {scoreChange}% from yesterday
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          title="Current Streak"
          value={`${streak} ${streak === 1 ? "day" : "days"}`}
          icon={TrendingUp}
          description="Days with 70%+ score"
        />
        <StatsCard title="Weekly Average" value={`${weekAvg}%`} icon={Calendar} description="Last 7 days" />
        <StatsCard title="This Month" value={`${monthAvg}%`} icon={CheckCircle2} description="Last 30 days" />
      </div>

      {/* 7-Day Trend */}
      <div className="p-6 border rounded-lg bg-card">
        <h2 className="text-lg font-semibold mb-4">7-Day Score Trend</h2>
        <ScoreTrendChart scores={last7Days} />
      </div>

      {/* Mini Heatmap Preview */}
      <div className="p-6 border rounded-lg bg-card">
        <MiniHeatmap scores={scores} />
      </div>
    </div>
  )
}
