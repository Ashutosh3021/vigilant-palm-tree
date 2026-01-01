"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { getDailyScores, getTasks, getJournalEntries, getTimeEntriesByTask, calculateStreaks } from "@/lib/storage"
import type { DailyScore, Task } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Flame, Trophy, TrendingUp, Calendar, Clock, Target, Zap, FileText, Brain } from "lucide-react"

export default function AnalyticsPage() {
  const [scores, setScores] = useState<DailyScore[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [goals, setGoals] = useState<any[]>([])
  const [timeFilter, setTimeFilter] = useState<"week" | "month" | "year" | "all">("month")

  useEffect(() => {
    loadData()
    const handleUpdate = () => loadData()
    window.addEventListener("tasksUpdated", handleUpdate)
    window.addEventListener("dailyScoresUpdated", handleUpdate)
    window.addEventListener("journalEntriesUpdated", handleUpdate)
    return () => {
      window.removeEventListener("tasksUpdated", handleUpdate)
      window.removeEventListener("dailyScoresUpdated", handleUpdate)
      window.removeEventListener("journalEntriesUpdated", handleUpdate)
    }
  }, [])

  const loadData = () => {
    setScores(getDailyScores())
    setTasks(getTasks())
    
    // Load goals from localStorage
    const savedGoals = localStorage.getItem('momentum_goals');
    setGoals(savedGoals ? JSON.parse(savedGoals) : []);
  }

  // Filter scores by time period
  const getFilteredScores = () => {
    const now = new Date()
    const filtered = scores.filter((s) => {
      const scoreDate = new Date(s.date)
      switch (timeFilter) {
        case "week":
          const weekAgo = new Date(now)
          weekAgo.setDate(weekAgo.getDate() - 7)
          return scoreDate >= weekAgo
        case "month":
          const monthAgo = new Date(now)
          monthAgo.setMonth(monthAgo.getMonth() - 1)
          return scoreDate >= monthAgo
        case "year":
          const yearAgo = new Date(now)
          yearAgo.setFullYear(yearAgo.getFullYear() - 1)
          return scoreDate >= yearAgo
        default:
          return true
      }
    })
    return filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  const filteredScores = getFilteredScores()

  // Calculate stats
  const avgScore =
    filteredScores.length > 0
      ? Math.round(filteredScores.reduce((sum, s) => sum + s.score, 0) / filteredScores.length)
      : 0
  const medianScore =
    filteredScores.length > 0
      ? (() => {
          const sorted = [...filteredScores].sort((a, b) => a.score - b.score)
          const mid = Math.floor(sorted.length / 2)
          return sorted.length % 2 === 0
            ? Math.round((sorted[mid - 1].score + sorted[mid].score) / 2)
            : sorted[mid].score
        })()
      : 0
  const peakScore = filteredScores.length > 0 ? Math.max(...filteredScores.map((s) => s.score)) : 0

  const streaks = calculateStreaks()

  // Task performance
  const taskPerformance = () => {
    const taskMap = new Map<string, { completed: number; total: number; totalTime: number }>()
    tasks.forEach((task) => {
      const existing = taskMap.get(task.title) || { completed: 0, total: 0, totalTime: 0 }
      existing.total++
      if (task.completed) existing.completed++
      
      // Calculate actual time spent based on time entries
      const timeEntries = getTimeEntriesByTask(task.id);
      const taskTime = timeEntries.reduce((sum: number, entry: any) => sum + (entry.hours * 60), 0); // Convert hours to minutes
      existing.totalTime += taskTime;
      
      taskMap.set(task.title, existing)
    })

    return Array.from(taskMap.entries())
      .map(([title, stats]) => ({
        title,
        completionRate: Math.round((stats.completed / stats.total) * 100),
        avgPriority: Math.round((stats.completed / stats.total) * 100), // Use completion rate as priority indicator
        totalTime: `${Math.floor(stats.totalTime / 60)}h ${stats.totalTime % 60}m`,
      }))
      .sort((a, b) => b.completionRate - a.completionRate)
  }

  const taskStats = taskPerformance()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-balance">Analytics</h1>
        <p className="text-muted-foreground mt-1">Deep insights into your productivity patterns</p>
      </div>

      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="trends">Score Trends</TabsTrigger>
          <TabsTrigger value="performance">Task Performance</TabsTrigger>
          <TabsTrigger value="streaks">Streaks</TabsTrigger>
          <TabsTrigger value="patterns">Pattern Detection</TabsTrigger>
          <TabsTrigger value="distribution">Time Distribution</TabsTrigger>
        </TabsList>

        {/* Tab 1: Score Trends */}
        <TabsContent value="trends" className="space-y-4">
          <div className="flex gap-2">
            {(["week", "month", "year", "all"] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setTimeFilter(filter)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  timeFilter === filter
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>

          <Card className="p-6">
            <div className="h-[300px] relative">
              <svg className="w-full h-full">
                {/* Grid lines */}
                {[0, 25, 50, 75, 100].map((value) => (
                  <g key={value}>
                    <line
                      x1="40"
                      y1={280 - (value * 240) / 100}
                      x2="100%"
                      y2={280 - (value * 240) / 100}
                      stroke="currentColor"
                      strokeOpacity="0.1"
                    />
                    <text x="5" y={285 - (value * 240) / 100} fill="currentColor" opacity="0.5" fontSize="12">
                      {value}%
                    </text>
                  </g>
                ))}

                {/* Line chart */}
                {filteredScores.length > 1 && (
                  <polyline
                    points={filteredScores
                      .map((score, idx) => {
                        const x = 50 + (idx / (filteredScores.length - 1)) * (window.innerWidth * 0.7 - 100)
                        const y = 280 - (score.score * 240) / 100
                        return `${x},${y}`
                      })
                      .join(" ")}
                    fill="none"
                    stroke="#1e90ff"
                    strokeWidth="2"
                  />
                )}

                {/* Data points */}
                {filteredScores.map((score, idx) => {
                  const x = 50 + (idx / Math.max(filteredScores.length - 1, 1)) * (window.innerWidth * 0.7 - 100)
                  const y = 280 - (score.score * 240) / 100
                  return (
                    <circle
                      key={idx}
                      cx={x}
                      cy={y}
                      r="4"
                      fill="#1e90ff"
                      className="cursor-pointer hover:r-6 transition-all"
                    >
                      <title>{`${score.date}: ${score.score}%`}</title>
                    </circle>
                  )
                })}
              </svg>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
              <div className="text-center">
                <p className="text-2xl font-bold text-[#1e90ff]">{avgScore}%</p>
                <p className="text-sm text-muted-foreground">Average</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-[#4682b4]">{medianScore}%</p>
                <p className="text-sm text-muted-foreground">Median</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-[#00008b]">{peakScore}%</p>
                <p className="text-sm text-muted-foreground">Peak</p>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Tab 2: Task Performance */}
        <TabsContent value="performance">
          <Card className="p-6">
            <div className="space-y-3">
              <div className="grid grid-cols-4 gap-4 pb-3 border-b font-medium text-sm text-muted-foreground">
                <div>Task Name</div>
                <div>Completion</div>
                <div>Avg Priority</div>
                <div>Total Time</div>
              </div>
              {taskStats.map((task, idx) => (
                <div key={idx} className="grid grid-cols-4 gap-4 items-center py-2">
                  <div className="font-medium">{task.title}</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-[#1e90ff]" style={{ width: `${task.completionRate}%` }} />
                    </div>
                    <span className="text-sm text-muted-foreground">{task.completionRate}%</span>
                  </div>
                  <div className="text-sm">{task.avgPriority}%</div>
                  <div className="text-sm">{task.totalTime}</div>
                </div>
              ))}
              {taskStats.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No task data available yet</p>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Tab 3: Streaks & Milestones */}
        <TabsContent value="streaks">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Flame className="h-8 w-8 text-[#1e90ff]" />
                <div>
                  <p className="text-3xl font-bold">{streaks.currentStreak}</p>
                  <p className="text-sm text-muted-foreground">Current Streak</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {streaks.currentStreak > 0
                  ? `Keep it up! ${streaks.currentStreak} days and counting`
                  : "Start a new streak today!"}
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Trophy className="h-8 w-8 text-[#4682b4]" />
                <div>
                  <p className="text-3xl font-bold">{streaks.longestStreak}</p>
                  <p className="text-sm text-muted-foreground">Longest Streak</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {streaks.longestStreak > 0
                  ? `${new Date(streaks.longestEnd).toLocaleDateString()} - ${new Date(streaks.longestStart).toLocaleDateString()}`
                  : "Complete tasks to build streaks"}
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="h-8 w-8 text-[#00008b]" />
                <div>
                  <p className="text-3xl font-bold">
                    {scores.length > 0 ? Math.round((streaks.totalProductiveDays / scores.length) * 100) : 0}%
                  </p>
                  <p className="text-sm text-muted-foreground">Productive Days</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {streaks.totalProductiveDays} of {scores.length} days with 70%+ score
              </p>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 4: Pattern Detection */}
        <TabsContent value="patterns">
          <div className="grid gap-4">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-500" />
                  AI Insights
                </h3>
                <Link href="/coach-insights" className="text-sm text-primary hover:underline">View Full Insights</Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    Best Performing Days
                  </h4>
                  <p className="text-sm text-muted-foreground">Your peak performance days are typically Tuesday and Thursday</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-purple-500" />
                    Peak Performance Times
                  </h4>
                  <p className="text-sm text-muted-foreground">Your productivity peaks between 2 PM and 5 PM</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-green-500" />
                    Synergy Found
                  </h4>
                  <p className="text-sm text-muted-foreground">Completing exercise before work improves your focus</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium flex items-center gap-2 mb-2">
                    <Zap className="h-4 w-4 text-orange-500" />
                    Energy Patterns
                  </h4>
                  <p className="text-sm text-muted-foreground">Your energy levels are highest after 7 hours of sleep</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-500" />
                  Monthly Goals
                </h3>
                <Link href="/monthly-reports" className="text-sm text-primary hover:underline">View Reports</Link>
              </div>
              <div className="space-y-4">
                {goals.length > 0 ? (
                  goals.map((goal: any) => {
                    const progress = goal.target > 0 ? Math.min(100, Math.round((goal.currentValue / goal.target) * 100)) : 0;
                    return (
                      <div key={goal.id}>
                        <div className="flex justify-between mb-1">
                          <span>{goal.name}</span>
                          <span>{goal.currentValue}/{goal.target} {goal.unit}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-muted-foreground text-center py-4">No goals set yet. Add goals in the Goals section.</p>
                )}
              </div>
            </Card>
          </div>
        </TabsContent>
        
        {/* Tab 5: Time Distribution */}
        <TabsContent value="distribution">
          <Card className="p-6">
            <div className="space-y-4">
              {[
                {
                  category: "High Priority",
                  hours: tasks.filter((t) => t.priority === "High").length * 2,
                  color: "#1e90ff",
                },
                {
                  category: "Medium Priority",
                  hours: tasks.filter((t) => t.priority === "Medium").length * 1.5,
                  color: "#4682b4",
                },
                {
                  category: "Low Priority",
                  hours: tasks.filter((t) => t.priority === "Low").length * 1,
                  color: "#add8e6",
                },
              ].map((item, idx) => {
                const total = tasks.length * 1.5
                const percentage = total > 0 ? Math.round((item.hours / total) * 100) : 0
                return (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{item.category}</span>
                      <span className="text-muted-foreground">
                        {Math.round(item.hours)}h ({percentage}%)
                      </span>
                    </div>
                    <div className="h-6 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
