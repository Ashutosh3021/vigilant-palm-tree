"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Brain, Lightbulb, AlertTriangle, Trophy, Info } from "lucide-react"
import { getDailyLogs, getTasks } from "@/lib/storage"
import type { Task } from "@/lib/types"

interface Insight {
  id: string
  type: 'day-pattern' | 'burnout-warning' | 'synergy' | 'streak-risk' | 'best-time' | 'positive'
  severity: 'high' | 'medium' | 'low' | 'positive' | 'info'
  message: string
  suggestion: string
  action?: string
  data?: any
}

export function CoachInsights() {
  const [insights, setInsights] = useState<Insight[]>([])
  
  useEffect(() => {
    generateInsights()
  }, [])
  
  const generateInsights = () => {
    const logs = getDailyLogs()
    const tasks = getTasks()
    
    const newInsights: Insight[] = []
    
    // Detect day patterns
    const dayPatterns = detectDayPatterns(logs, tasks)
    newInsights.push(...dayPatterns)
    
    // Detect burnout risks
    const burnoutRisks = detectBurnoutRisks(logs)
    newInsights.push(...burnoutRisks)
    
    // Detect task synergies
    const synergies = detectTaskSynergies(logs, tasks)
    newInsights.push(...synergies)
    
    // Detect streak risks
    const streakRisks = detectStreakRisks(logs)
    newInsights.push(...streakRisks)
    
    // Detect best performance times
    const bestTimes = detectBestTimes(logs)
    newInsights.push(...bestTimes)
    
    setInsights(newInsights)
  }
  
  // Detect patterns by day of week
  const detectDayPatterns = (logs: any[], tasks: Task[]): Insight[] => {
    const insights: Insight[] = []
    
    // Group logs by task
    const taskLogs: Record<string, any[]> = {}
    logs.forEach(log => {
      log.tasks.forEach((taskLog: any) => {
        if (!taskLogs[taskLog.taskId]) {
          taskLogs[taskLog.taskId] = []
        }
        taskLogs[taskLog.taskId].push({
          ...taskLog,
          date: log.date,
          isCompleted: taskLog.isCompleted,
        })
      })
    })
    
    // Analyze completion patterns by weekday
    Object.entries(taskLogs).forEach(([taskId, taskLogs]) => {
      const task = tasks.find(t => t.id === taskId)
      if (!task) return
      
      // Group by day of week
      const byDay: Record<string, boolean[]> = {
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: [],
        Saturday: [],
        Sunday: [],
      }
      
      taskLogs.forEach(log => {
        const date = new Date(log.date)
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' })
        byDay[dayName].push(log.isCompleted)
      })
      
      // Find worst performing day
      const dayRates = Object.entries(byDay)
        .map(([day, completions]) => ({
          day,
          rate: completions.length > 0 ? (completions.filter(c => c).length / completions.length) * 100 : 0,
          count: completions.length,
        }))
        .filter(d => d.count > 2) // Only consider days with at least 3 data points
        .sort((a, b) => a.rate - b.rate)
      
      if (dayRates.length > 0 && dayRates[0].rate < 50) {
        const worstDay = dayRates[0]
        insights.push({
          id: `day-pattern-${taskId}-${worstDay.day}`,
          type: 'day-pattern',
          severity: 'medium',
          message: `You complete "${task.title}" only ${worstDay.rate.toFixed(0)}% of the time on ${worstDay.day}s`,
          suggestion: `Consider moving to a better day or reducing priority on ${worstDay.day}s`,
          action: 'reschedule'
        })
      }
    })
    
    return insights
  }
  
  // Detect burnout risks
  const detectBurnoutRisks = (logs: any[]): Insight[] => {
    const insights: Insight[] = []
    
    if (logs.length < 14) return insights
    
    // Get last 14 days
    const sortedLogs = [...logs].sort((a, b) => a.date.localeCompare(b.date))
    const last14Days = sortedLogs.slice(-14)
    const recent7 = last14Days.slice(-7)
    const prior7 = last14Days.slice(0, 7)
    
    const recentAvg = recent7.reduce((sum, d) => sum + d.totalScore, 0) / recent7.length
    const priorAvg = prior7.reduce((sum, d) => sum + d.totalScore, 0) / prior7.length
    
    // High performance but declining
    if (recentAvg > 80 && (priorAvg - recentAvg) > 15) {
      insights.push({
        id: 'burnout-high-declining',
        type: 'burnout-warning',
        severity: 'high',
        message: `You've been crushing it (${recentAvg.toFixed(0)}% avg) but scores are dropping ${(priorAvg - recentAvg).toFixed(0)}%`,
        suggestion: 'Consider scheduling a recovery day to prevent burnout',
        action: 'recovery-day'
      })
    }
    
    // Consistent decline
    if (priorAvg - recentAvg > 10 && recentAvg > 70) {
      insights.push({
        id: 'burnout-decline',
        type: 'burnout-warning',
        severity: 'medium',
        message: 'Scores declining over last 14 days despite good performance',
        suggestion: 'Review your task load - might be overcommitting',
        action: 'reduce-load'
      })
    }
    
    return insights
  }
  
  // Detect task synergies
  const detectTaskSynergies = (logs: any[], tasks: Task[]): Insight[] => {
    const insights: Insight[] = []
    
    if (logs.length < 7) return insights
    
    // Get all unique task IDs
    const allTaskIds = new Set<string>()
    logs.forEach(log => {
      log.tasks.forEach((task: any) => allTaskIds.add(task.taskId))
    })
    
    const taskArray = Array.from(allTaskIds)
    
    // Check all task pairs
    for (let i = 0; i < taskArray.length; i++) {
      for (let j = i + 1; j < taskArray.length; j++) {
        const taskA = taskArray[i]
        const taskB = taskArray[j]
        
        // Days when both completed
        const bothDays = logs.filter(log => {
          const taskACompleted = log.tasks.some((t: any) => t.taskId === taskA && t.isCompleted)
          const taskBCompleted = log.tasks.some((t: any) => t.taskId === taskB && t.isCompleted)
          return taskACompleted && taskBCompleted
        })
        
        // Days when only one completed
        const onlyOneDays = logs.filter(log => {
          const taskACompleted = log.tasks.some((t: any) => t.taskId === taskA && t.isCompleted)
          const taskBCompleted = log.tasks.some((t: any) => t.taskId === taskB && t.isCompleted)
          return (taskACompleted !== taskBCompleted) // XOR
        })
        
        if (bothDays.length < 3 || onlyOneDays.length < 3) continue // Need sufficient data
        
        const synergyScore = bothDays.reduce((sum, d) => sum + d.totalScore, 0) / bothDays.length
        const regularScore = onlyOneDays.reduce((sum, d) => sum + d.totalScore, 0) / onlyOneDays.length
        
        if (synergyScore > regularScore + 10) {
          const taskAName = tasks.find(t => t.id === taskA)?.title || taskA
          const taskBName = tasks.find(t => t.id === taskB)?.title || taskB
          
          insights.push({
            id: `synergy-${taskA}-${taskB}`,
            type: 'synergy',
            severity: 'positive',
            message: `${taskAName} + ${taskBName} combo = ${synergyScore.toFixed(0)}% avg (vs ${regularScore.toFixed(0)}% alone)`,
            suggestion: 'Try scheduling these tasks together more often',
            action: 'pair-tasks'
          })
        }
      }
    }
    
    return insights
  }
  
  // Detect streak risks
  const detectStreakRisks = (logs: any[]): Insight[] => {
    const insights: Insight[] = []
    
    if (logs.length === 0) return insights
    
    // Calculate current streak
    const sortedLogs = [...logs].sort((a, b) => b.date.localeCompare(a.date)) // Most recent first
    let currentStreak = 0
    
    for (const log of sortedLogs) {
      if (log.totalScore >= 50) {
        currentStreak++
      } else {
        break
      }
    }
    
    // Check if today's score is low and streak is at risk
    const today = sortedLogs[0]
    const currentTime = new Date()
    const hoursLeft = 24 - currentTime.getHours() // Simplified: hours until day ends
    
    if (today.totalScore < 50 && hoursLeft < 6 && currentStreak >= 7) {
      const pointsNeeded = 50 - today.totalScore
      const uncompletedTasks = today.tasks
        .filter((t: any) => !t.isCompleted)
        .sort((a: any, b: any) => b.priority - a.priority)
      
      if (uncompletedTasks.length > 0) {
        insights.push({
          id: 'streak-risk',
          type: 'streak-risk',
          severity: 'high',
          message: `🔥 ${currentStreak}-day streak at risk! Need ${pointsNeeded} points in ${hoursLeft}h`,
          suggestion: `Quick wins: ${uncompletedTasks[0].taskId} (${uncompletedTasks[0].priority} pts)`,
          action: 'urgent-tasks',
          data: uncompletedTasks
        })
      }
    }
    
    return insights
  }
  
  // Detect best performance times
  const detectBestTimes = (logs: any[]): Insight[] => {
    const insights: Insight[] = []
    
    // For now, we'll just return a simple insight if we have enough data
    if (logs.length < 14) return insights
    
    const avgScore = logs.reduce((sum, log) => sum + log.totalScore, 0) / logs.length
    
    if (avgScore > 80) {
      insights.push({
        id: 'high-performance',
        type: 'positive',
        severity: 'positive',
        message: `You're maintaining a ${avgScore.toFixed(0)}% average - impressive consistency!`,
        suggestion: 'Keep up the great work and maintain your momentum',
        action: 'maintain'
      })
    }
    
    return insights
  }
  
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="w-4 h-4 text-red-500" />
      case 'medium': return <Lightbulb className="w-4 h-4 text-yellow-500" />
      case 'positive': return <Trophy className="w-4 h-4 text-green-500" />
      case 'info': return <Info className="w-4 h-4 text-blue-500" />
      default: return <Info className="w-4 h-4 text-gray-500" />
    }
  }
  
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'border-red-500/20 bg-red-50 dark:bg-red-950/10'
      case 'medium': return 'border-yellow-500/20 bg-yellow-50 dark:bg-yellow-950/10'
      case 'positive': return 'border-green-500/20 bg-green-50 dark:bg-green-950/10'
      case 'info': return 'border-blue-500/20 bg-blue-50 dark:bg-blue-950/10'
      default: return 'border-gray-500/20 bg-gray-50 dark:bg-gray-950/10'
    }
  }
  
  const handleAction = (insight: Insight) => {
    // Handle the action based on insight type
    console.log(`Action triggered for insight: ${insight.id}`, insight)
    // In a real app, this would perform the specific action
  }
  
  const dismissInsight = (id: string) => {
    setInsights(prev => prev.filter(insight => insight.id !== id))
  }
  
  return (
    <Card className={`coach-corner ${getSeverityColor('info')}`}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-blue-400" />
          <CardTitle className="text-lg">Momentum Coach</CardTitle>
          <Badge variant="outline" className="text-xs">v1</Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {insights.length > 0 ? (
          insights.map(insight => (
            <div 
              key={insight.id} 
              className={`p-4 rounded-lg border ${getSeverityColor(insight.severity)}`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-2 flex-1">
                  {getSeverityIcon(insight.severity)}
                  <div>
                    <p className="font-medium">{insight.message}</p>
                    <p className="text-sm text-muted-foreground mt-1">{insight.suggestion}</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => dismissInsight(insight.id)}
                  className="h-6 w-6 p-0"
                >
                  ×
                </Button>
              </div>
              <div className="flex gap-2 mt-3">
                {insight.action && (
                  <Button 
                    size="sm" 
                    variant={insight.severity === 'high' ? 'destructive' : 'default'}
                    onClick={() => handleAction(insight)}
                  >
                    {insight.action.replace('-', ' ')}
                  </Button>
                )}
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => dismissInsight(insight.id)}
                >
                  Dismiss
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            Keep tracking! Insights will appear once patterns are detected.
          </div>
        )}
      </CardContent>
    </Card>
  )
}