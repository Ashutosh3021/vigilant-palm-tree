"use client"

import type { DailyScore } from "@/lib/types"
import { getScoreLevel } from "@/lib/score-calculator"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface FullYearHeatmapProps {
  scores: DailyScore[]
  year: number
}

export function FullYearHeatmap({ scores, year: initialYear }: FullYearHeatmapProps) {
  const [year, setYear] = useState(initialYear)

  // Create a map of scores by date
  const scoreMap = new Map<string, DailyScore>()
  scores.forEach((score) => {
    scoreMap.set(score.date, score)
  })

  // Generate all weeks for the year
  const startDate = new Date(year, 0, 1) // Jan 1
  const endDate = new Date(year, 11, 31) // Dec 31

  // Find the first Monday on or before Jan 1
  const firstMonday = new Date(startDate)
  while (firstMonday.getDay() !== 1) {
    firstMonday.setDate(firstMonday.getDate() - 1)
  }

  // Generate all days from first Monday to end of year
  const allDays: Date[] = []
  const currentDate = new Date(firstMonday)

  while (currentDate <= endDate || currentDate.getDay() !== 0) {
    if (currentDate >= startDate && currentDate <= endDate) {
      allDays.push(new Date(currentDate))
    } else {
      allDays.push(new Date(currentDate)) // Include padding days but mark them
    }
    currentDate.setDate(currentDate.getDate() + 1)
    if (currentDate > endDate && currentDate.getDay() === 1) break
  }

  // Group by weeks
  const weeks: Date[][] = []
  for (let i = 0; i < allDays.length; i += 7) {
    weeks.push(allDays.slice(i, i + 7))
  }

  const getLevelColor = (level: number) => {
    switch (level) {
      case 0:
        return "bg-[#ebedf0] hover:bg-[#ebedf0]/80"
      case 1:
        return "bg-[#add8e6] hover:bg-[#add8e6]/80"
      case 2:
        return "bg-[#4682b4] hover:bg-[#4682b4]/80"
      case 3:
        return "bg-[#1e90ff] hover:bg-[#1e90ff]/80"
      case 4:
        return "bg-[#00008b] hover:bg-[#00008b]/80"
      default:
        return "bg-[#ebedf0] hover:bg-[#ebedf0]/80"
    }
  }

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const weekDays = ["Mon", "Wed", "Fri"]

  const monthGroups: { month: string; weeks: Date[][]; startCol: number }[] = []
  let currentMonth = -1
  let currentGroup: Date[][] = []
  let startCol = 0

  weeks.forEach((week, weekIdx) => {
    const monthOfWeek = week.find((d) => d.getFullYear() === year)?.getMonth()
    if (monthOfWeek !== undefined && monthOfWeek !== currentMonth) {
      if (currentGroup.length > 0) {
        monthGroups.push({ month: months[currentMonth], weeks: currentGroup, startCol })
      }
      currentMonth = monthOfWeek
      currentGroup = [week]
      startCol = weekIdx
    } else if (monthOfWeek !== undefined) {
      currentGroup.push(week)
    }
  })
  if (currentGroup.length > 0 && currentMonth !== -1) {
    monthGroups.push({ month: months[currentMonth], weeks: currentGroup, startCol })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{year} Activity</h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setYear(year - 1)}>
            <ChevronLeft className="h-4 w-4" />
            {year - 1}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setYear(year + 1)}
            disabled={year >= new Date().getFullYear()}
          >
            {year + 1}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {/* Month labels */}
        <div className="flex gap-2 pl-[52px]">
          {monthGroups.map((mg, idx) => (
            <div
              key={idx}
              className="text-xs text-muted-foreground whitespace-nowrap"
              style={{ width: `${mg.weeks.length * 14 - 2}px` }}
            >
              {mg.month}
            </div>
          ))}
        </div>

        {/* Heatmap grid */}
        <div className="flex gap-2">
          {/* Day labels */}
          <div className="flex flex-col gap-[2px] justify-between pr-2 text-xs text-muted-foreground pt-[14px]">
            {weekDays.map((day) => (
              <div key={day} className="h-[26px] flex items-center">
                {day}
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            {monthGroups.map((mg, monthIdx) => (
              <div key={monthIdx} className="flex gap-[2px]">
                {mg.weeks.map((week, weekIdx) => (
                  <div key={weekIdx} className="flex flex-col gap-[2px]">
                    {week.map((date, dayIdx) => {
                      const dateStr = date.toISOString().split("T")[0]
                      const score = scoreMap.get(dateStr)
                      const level = score ? getScoreLevel(score.score) : 0
                      const isOutsideYear = date.getFullYear() !== year

                      return (
                        <div
                          key={dayIdx}
                          className={`w-[12px] h-[12px] rounded-sm ${
                            isOutsideYear ? "opacity-0" : getLevelColor(level)
                          } transition-all cursor-pointer relative group`}
                          title={
                            isOutsideYear
                              ? ""
                              : score
                                ? `${dateStr}: ${score.score}% (${score.tasks_completed}/${score.total_tasks} tasks)`
                                : `${dateStr}: No tasks`
                          }
                        />
                      )
                    })}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-4">
          <span>Less</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map((level) => (
              <div key={level} className={`w-3 h-3 rounded-sm ${getLevelColor(level)}`} />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  )
}
