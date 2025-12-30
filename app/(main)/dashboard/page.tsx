"use client"

import { useEffect, useState } from "react"
import { StatsCard } from "@/components/stats-card"
import { TrendingUp, CheckCircle2, Calendar, Plus, Trophy, Star, Zap, Brain, Target } from "lucide-react"
import { MiniHeatmap } from "@/components/mini-heatmap"
import { ScoreTrendChart } from "@/components/score-trend-chart"
import { getDailyScores, getDailyScore, createTask as createTaskInStorage, getDailyLogs, getAnalytics, saveAnalytics } from "@/lib/storage"
import type { DailyScore } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CoachInsights } from "@/components/coach-insights"

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
  
  // Function to get user badges based on achievements
  const getUserBadges = () => {
    const badges = [];
    
    // 7-Day Streak Badge
    if (streak >= 7) {
      badges.push({ 
        id: "7-day-streak", 
        name: "7-Day Streak", 
        description: "Maintained 7 days of 70%+ scores", 
        icon: Trophy,
        color: "bg-yellow-100 text-yellow-800",
        borderColor: "border-yellow-200"
      });
    }
    
    // Early Bird Badge (if user has tasks completed early in the day)
    // For now, we'll award it if the user has a good streak
    if (streak >= 3) {
      badges.push({ 
        id: "early-bird", 
        name: "Early Bird", 
        description: "Started strong with 3+ day streak", 
        icon: Zap,
        color: "bg-blue-100 text-blue-800",
        borderColor: "border-blue-200"
      });
    }
    
    // Weekend Warrior Badge (if user completes tasks on weekends)
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday
    if (dayOfWeek === 0 || dayOfWeek === 6) { // Weekend
      badges.push({ 
        id: "weekend-warrior", 
        name: "Weekend Warrior", 
        description: "Staying productive on the weekend", 
        icon: Star,
        color: "bg-purple-100 text-purple-800",
        borderColor: "border-purple-200"
      });
    }
    
    return badges;
  };
  
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
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Your Achievements
        </h2>
        <div className="flex flex-wrap gap-3">
          {getUserBadges().length > 0 ? (
            getUserBadges().map((badge) => {
              const Icon = badge.icon;
              return (
                <div 
                  key={badge.id} 
                  className={`flex flex-col items-center justify-center p-4 rounded-lg border ${badge.color} ${badge.borderColor} min-w-[120px]`}>
                  <Icon className="h-6 w-6 mb-2" />
                  <span className="font-medium text-center">{badge.name}</span>
                  <span className="text-xs text-center text-muted-foreground mt-1">{badge.description}</span>
                </div>
              );
            })
          ) : (
            <p className="text-muted-foreground text-center w-full">Complete tasks to earn badges!</p>
          )}
        </div>
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
