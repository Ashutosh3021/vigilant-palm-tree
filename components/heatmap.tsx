"use client"

import type { DailyScore } from "@/lib/types"
import { getScoreLevel } from "@/lib/score-calculator"

interface HeatmapProps {
  scores: DailyScore[]
}

export function Heatmap({ scores }: HeatmapProps) {
  // Generate last 12 weeks of dates
  const weeks = 12
  const days = weeks * 7
  const today = new Date()
  const dates: Date[] = []

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    dates.push(date)
  }

  // Create a map of scores by date
  const scoreMap = new Map<string, DailyScore>()
  scores.forEach((score) => {
    scoreMap.set(score.date, score)
  })

  // Group dates by week
  const weekGroups: Date[][] = []
  for (let i = 0; i < dates.length; i += 7) {
    weekGroups.push(dates.slice(i, i + 7))
  }

  const getLevelColor = (level: number) => {
    switch (level) {
      case 0:
        return "bg-muted"
      case 1:
        return "bg-emerald-200 dark:bg-emerald-900"
      case 2:
        return "bg-emerald-400 dark:bg-emerald-700"
      case 3:
        return "bg-emerald-600 dark:bg-emerald-500"
      case 4:
        return "bg-emerald-800 dark:bg-emerald-300"
      default:
        return "bg-muted"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Momentum Heatmap</h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Less</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map((level) => (
              <div key={level} className={`w-3 h-3 rounded-sm ${getLevelColor(level)}`} />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto pb-2">
        {weekGroups.map((week, weekIdx) => (
          <div key={weekIdx} className="flex flex-col gap-1">
            {week.map((date) => {
              const dateStr = date.toISOString().split("T")[0]
              const score = scoreMap.get(dateStr)
              const level = score ? getScoreLevel(score.score) : 0

              return (
                <div
                  key={dateStr}
                  className={`w-3 h-3 rounded-sm ${getLevelColor(
                    level,
                  )} hover:ring-2 ring-foreground/50 transition-all cursor-pointer`}
                  title={
                    score
                      ? `${dateStr}: ${score.score}% (${score.tasks_completed}/${score.total_tasks} tasks)`
                      : `${dateStr}: No tasks`
                  }
                />
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
