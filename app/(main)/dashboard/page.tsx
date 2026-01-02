"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { StatsCard } from "@/components/stats-card"
import { TrendingUp, CheckCircle2, Calendar, Plus, Trophy, Star, Zap, Brain, Target, FileText } from "lucide-react"
import { MiniHeatmap } from "@/components/mini-heatmap"
import { ScoreTrendChart } from "@/components/score-trend-chart"
import { getDailyScores, getDailyScore, createTask as createTaskInStorage, getDailyLogs, getAnalytics, saveAnalytics } from "@/lib/storage"
import type { DailyScore } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CoachInsights } from "@/components/coach-insights"
import { useBadges } from "@/lib/hooks/useBadges"
import BadgeDisplay from "@/components/badges/BadgeDisplay"

export default function DashboardPage() {
  const [todayScore, setTodayScore] = useState<DailyScore | null>(null)
  const [scores, setScores] = useState<DailyScore[]>([])
  const [streak, setStreak] = useState(0)
  const [avgScore, setAvgScore] = useState(0)
  const [weekAvg, setWeekAvg] = useState(0)
  const [monthAvg, setMonthAvg] = useState(0)
  const [scoreChange, setScoreChange] = useState(0)
  const [quickTaskTitle, setQuickTaskTitle] = useState("")
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [motivationalQuote, setMotivationalQuote] = useState("")
  const [analytics, setAnalytics] = useState({
    currentStreak: 0,
    longestStreak: 0,
    totalProductiveDays: 0,
    lastCalculated: "",
  })
  const [dailyLogs, setDailyLogs] = useState<any[]>([])

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
    
    // Load analytics
    const analyticsData = getAnalytics()
    setAnalytics(analyticsData)
    
    // Load daily logs
    const logs = getDailyLogs()
    setDailyLogs(logs)
  }
  
  const handleQuickAddTask = () => {
    if (!quickTaskTitle.trim()) return;
    
    setIsAddingTask(true);
    
    createTaskInStorage({
      title: quickTaskTitle.trim(),
      description: "Added from dashboard",
      priority: "Medium",
      date: new Date().toISOString().split("T")[0],
      completed: false,
      priority_weight: 0,
    });
    
    setQuickTaskTitle("");
    setIsAddingTask(false);
    
    // Refresh data to update task counts
    refreshData();
  }
  
  // Function to get a random motivational quote
  const getMotivationalQuote = () => {
    const quotes = [
      "The secret of getting ahead is getting started. - Mark Twain",
      "Don't watch the clock; do what it does. Keep going. - Sam Levenson",
      "The future depends on what you do today. - Mahatma Gandhi",
      "The only way to do great work is to love what you do. - Steve Jobs",
      "Success is not final, failure is not fatal: It is the courage to continue that counts. - Winston Churchill",
      "Believe you can and you're halfway there. - Theodore Roosevelt",
      "It does not matter how slowly you go as long as you do not stop. - Confucius",
      "The journey of a thousand miles begins with one step. - Lao Tzu",
      "The harder you work for something, the greater you'll feel when you achieve it. - Unknown",
      "Your time is limited, don't waste it living someone else's life. - Steve Jobs"
    ];
    
    const randomIndex = Math.floor(Math.random() * quotes.length);
    return quotes[randomIndex];
  };
  
  const { unlockedBadges, loading: badgesLoading } = useBadges();
  
  // Get the most recently unlocked badges (up to 4 for display)
  const recentBadges = unlockedBadges.slice(0, 4);
  
  useEffect(() => {
    setMotivationalQuote(getMotivationalQuote());
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

      {/* Quick Add Task */}
      <div className="p-6 border rounded-lg bg-card">
        <h2 className="text-lg font-semibold mb-4">Quick Add Task</h2>
        <div className="flex gap-2">
          <Input
            value={quickTaskTitle}
            onChange={(e) => setQuickTaskTitle(e.target.value)}
            placeholder="Add a new task..."
            onKeyDown={(e) => e.key === 'Enter' && handleQuickAddTask()}
            className="flex-1"
          />
          <Button onClick={handleQuickAddTask} disabled={isAddingTask || !quickTaskTitle.trim()}>
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>
      </div>
      
      {/* Quick Navigation */}
      <div className="p-6 border rounded-lg bg-card">
        <h2 className="text-lg font-semibold mb-4">Quick Navigation</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link href="/journal" className="p-4 border rounded-lg hover:bg-accent transition-colors text-center">
            <Calendar className="h-6 w-6 mx-auto mb-2 text-blue-500" />
            <p className="text-sm font-medium">Journal</p>
          </Link>
          <Link href="/achievements" className="p-4 border rounded-lg hover:bg-accent transition-colors text-center">
            <Trophy className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
            <p className="text-sm font-medium">Achievements</p>
          </Link>
          <Link href="/monthly-reports" className="p-4 border rounded-lg hover:bg-accent transition-colors text-center">
            <FileText className="h-6 w-6 mx-auto mb-2 text-green-500" />
            <p className="text-sm font-medium">Reports</p>
          </Link>
          <Link href="/coach-insights" className="p-4 border rounded-lg hover:bg-accent transition-colors text-center">
            <Brain className="h-6 w-6 mx-auto mb-2 text-purple-500" />
            <p className="text-sm font-medium">Coach</p>
          </Link>
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
      
      {/* Motivational Quote */}
      <div className="p-6 border rounded-lg bg-card">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          Quote of the Day
        </h2>
        <p className="text-lg italic text-center text-muted-foreground">"{motivationalQuote}"</p>
      </div>
      
      {/* Achievements & Badges */}
      <div className="p-6 border rounded-lg bg-card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Your Badges
          </h2>
          <Link href="/achievements" className="text-sm text-blue-500 hover:underline">
            View All
          </Link>
        </div>
        {badgesLoading ? (
          <p className="text-muted-foreground text-center py-4">Loading badges...</p>
        ) : recentBadges.length > 0 ? (
          <div className="flex flex-wrap gap-4 justify-center">
            {recentBadges.map((badge) => (
              <div key={badge.level} className="flex flex-col items-center">
                <BadgeDisplay 
                  level={badge.level} 
                  size="64x64" 
                  unlocked={true} 
                  showLabel={false}
                />
                <span className="text-xs mt-2 font-medium text-center max-w-[100px] truncate">
                  {badge.name}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-muted-foreground mb-2">No badges unlocked yet</p>
            <p className="text-sm text-muted-foreground">Complete tasks to earn your first badge!</p>
          </div>
        )}
      </div>

      {/* 7-Day Trend */}
      <div className="p-6 border rounded-lg bg-card">
        <h2 className="text-lg font-semibold mb-4">7-Day Score Trend</h2>
        <ScoreTrendChart scores={last7Days} />
      </div>

      {/* Coach Insights */}
      <div>
        <CoachInsights />
      </div>
      

    </div>
  )
}
