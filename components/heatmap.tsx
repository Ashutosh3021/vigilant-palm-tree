"use client"

import { useEffect, useState } from "react"
import { getDailyLogs } from "@/lib/storage"
import type { DailyScore } from "@/lib/types"

interface HeatmapProps {
  scores: DailyScore[]
}

export function Heatmap({ scores }: HeatmapProps) {
  const [heatmapData, setHeatmapData] = useState<any[]>([])
  
  useEffect(() => {
    // Process scores to create heatmap data
    const processedData = scores.map(score => ({
      date: score.date,
      score: score.score,
      tasksCompleted: score.tasks_completed,
      totalTasks: score.total_tasks,
    }))
    
    setHeatmapData(processedData)
  }, [scores])
  
  // Get the start and end dates for the year
  const today = new Date()
  const startDate = new Date(today.getFullYear(), 0, 1) // Start of current year
  const endDate = today // Today
  
  // Generate all dates for the year
  const allDates = []
  const currentDate = new Date(startDate)
  while (currentDate <= endDate) {
    allDates.push(new Date(currentDate).toISOString().split('T')[0])
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  // Create a map of scores by date for quick lookup
  const scoreMap = new Map(heatmapData.map(item => [item.date, item]))
  
  // Function to get color based on score
  const getColor = (score: number) => {
    if (score === 0) return '#161b22' // dark/no activity
    if (score <= 20) return '#0e4429'
    if (score <= 40) return '#006d32'
    if (score <= 60) return '#26a641'
    if (score <= 80) return '#39d353'
    return '#57ff7a' // 81-100%
  }
  
  // Group dates by week
  const weeks = []
  
  // Start from the first Monday on or before Jan 1
  const startDay = new Date(startDate)
  const daysToSubtract = (startDay.getDay() + 6) % 7 // Days to go back to Monday
  startDay.setDate(startDay.getDate() - daysToSubtract)
  
  const allDatesWithPadding = []
  const tempDate = new Date(startDay)
  while (tempDate <= endDate) {
    allDatesWithPadding.push(new Date(tempDate).toISOString().split('T')[0])
    tempDate.setDate(tempDate.getDate() + 1)
  }
  
  // Group into weeks (7 days each)
  for (let i = 0; i < allDatesWithPadding.length; i += 7) {
    weeks.push(allDatesWithPadding.slice(i, i + 7))
  }
  
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Activity Heatmap</h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-sm bg-[#161b22]"></div>
            <div className="w-3 h-3 rounded-sm bg-[#0e4429]"></div>
            <div className="w-3 h-3 rounded-sm bg-[#006d32]"></div>
            <div className="w-3 h-3 rounded-sm bg-[#26a641]"></div>
            <div className="w-3 h-3 rounded-sm bg-[#39d353]"></div>
            <div className="w-3 h-3 rounded-sm bg-[#57ff7a]"></div>
          </div>
          <span>More</span>
        </div>
      </div>
      
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-1 min-w-max">
          {/* Day labels on the left */}
          <div className="flex flex-col gap-4">
            <div className="h-8"></div> {/* For alignment with weeks */}
            <div>Mon</div>
            <div></div> {/* Skip Tue for spacing */}
            <div>Wed</div>
            <div></div> {/* Skip Thu for spacing */}
            <div>Fri</div>
            <div></div> {/* Skip Sat for spacing */}
            <div>Sun</div>
          </div>
          
          {/* Heatmap grid */}
          <div className="flex gap-1">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.map((date, dayIndex) => {
                  const scoreData = scoreMap.get(date)
                  const score = scoreData ? scoreData.score : 0
                  const color = getColor(score)
                  
                  return (
                    <div 
                      key={`${weekIndex}-${dayIndex}`}
                      className="w-4 h-4 rounded-sm border border-transparent hover:border-border cursor-pointer relative group"
                      style={{ backgroundColor: color }}
                      title={`${date}: ${score}% (Tasks: ${scoreData?.tasksCompleted || 0}/${scoreData?.totalTasks || 0})`}
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                        {date}
                        <br />
                        Score: {score}%
                        <br />
                        Tasks: {scoreData?.tasksCompleted || 0}/{scoreData?.totalTasks || 0}
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}