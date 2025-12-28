"use client"

import Link from "next/link"
import type { DailyScore } from "@/lib/types"
import { getScoreLevel } from "@/lib/score-calculator"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MiniHeatmapProps {
  scores: DailyScore[]
}

export function MiniHeatmap({ scores }: MiniHeatmapProps) {
  // Show last 30 days in compact grid
  const days = 30
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

  const getLevelColor = (level: number) => {
    switch (level) {
      case 0:
        return "bg-[#ebedf0]"
      case 1:
        return "bg-[#add8e6]"
      case 2:
        return "bg-[#4682b4]"
      case 3:
        return "bg-[#1e90ff]"
      case 4:
        return "bg-[#00008b]"
      default:
        return "bg-[#ebedf0]"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Last 30 Days</h3>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/heatmap">
            View Full Heatmap
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </div>

      <div className="flex gap-1">
        {dates.map((date) => {
          const dateStr = date.toISOString().split("T")[0]
          const score = scoreMap.get(dateStr)
          const level = score ? getScoreLevel(score.score) : 0

          return (
            <div
              key={dateStr}
              className={`w-4 h-4 rounded-sm ${getLevelColor(level)} hover:ring-2 ring-foreground/50 transition-all cursor-pointer`}
              title={
                score
                  ? `${dateStr}: ${score.score}% (${score.tasks_completed}/${score.total_tasks} tasks)`
                  : `${dateStr}: No tasks`
              }
            />
          )
        })}
      </div>
    </div>
  )
}
