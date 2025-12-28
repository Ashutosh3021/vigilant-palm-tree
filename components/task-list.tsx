"use client"

import type { Task } from "@/lib/types"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { useState } from "react"
import { updateTask, deleteTask as deleteTaskFromStorage, getTasksByDate, upsertDailyScore } from "@/lib/storage"
import { calculateDailyScore } from "@/lib/score-calculator"

interface TaskListProps {
  tasks: Task[]
  onTaskUpdated?: () => void
}

export function TaskList({ tasks, onTaskUpdated }: TaskListProps) {
  const [loading, setLoading] = useState<string | null>(null)

  const sortedTasks = [...tasks].sort((a, b) => {
    const priorityOrder = { High: 0, Medium: 1, Low: 2 }
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-[#1e90ff]/10 text-[#1e90ff] border-[#1e90ff]/20"
      case "Medium":
        return "bg-[#4682b4]/10 text-[#4682b4] border-[#4682b4]/20"
      case "Low":
        return "bg-[#add8e6]/10 text-[#4682b4] border-[#add8e6]/20"
      default:
        return ""
    }
  }

  const recalculateDailyScore = () => {
    const today = new Date().toISOString().split("T")[0]
    const todayTasks = getTasksByDate(today)
    const score = calculateDailyScore(todayTasks)
    const completedCount = todayTasks.filter((t) => t.completed).length

    upsertDailyScore({
      date: today,
      score,
      tasks_completed: completedCount,
      total_tasks: todayTasks.length,
    })
  }

  const handleToggleTask = async (taskId: string, completed: boolean) => {
    setLoading(taskId)
    updateTask(taskId, { completed })
    recalculateDailyScore()
    setLoading(null)
    onTaskUpdated?.()
  }

  const handleDeleteTask = async (taskId: string) => {
    setLoading(taskId)
    deleteTaskFromStorage(taskId)
    recalculateDailyScore()
    setLoading(null)
    onTaskUpdated?.()
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg">No tasks yet. Add your first task to get started!</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {sortedTasks.map((task) => (
        <div
          key={task.id}
          className={`p-4 border rounded-lg transition-all ${task.completed ? "opacity-60 bg-muted/30" : "bg-card"}`}
        >
          <div className="flex items-start gap-3">
            <Checkbox
              checked={task.completed}
              onCheckedChange={(checked) => handleToggleTask(task.id, checked as boolean)}
              disabled={loading === task.id}
              className="mt-1"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className={`font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                  {task.title}
                </h4>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
              </div>
              {task.description && <p className="text-sm text-muted-foreground mt-1">{task.description}</p>}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDeleteTask(task.id)}
              disabled={loading === task.id}
            >
              <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
