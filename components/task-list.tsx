"use client"

import type { Task } from "@/lib/types"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Trash2, Edit } from "lucide-react"
import { useState } from "react"
import { updateTask, deleteTask as deleteTaskFromStorage, getTasksByDate, upsertDailyScore, createTask as createTaskInStorage } from "@/lib/storage"
import { calculateDailyScore } from "@/lib/score-calculator"
import { TaskForm } from "@/components/task-form"

interface TaskListProps {
  tasks: Task[]
  onTaskUpdated?: () => void
}

export function TaskList({ tasks, onTaskUpdated }: TaskListProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null)

  // Filter tasks based on recurrence and date conditions
  const filteredTasks = tasks.filter(task => {
    const today = new Date().toISOString().split("T")[0];
    
    // If task date is in the future and it's not recurring, don't show it yet
    if (task.date > today && !task.isRecurring) {
      return false;
    }
    
    // If task is recurring, check if today is one of the recurrence days
    if (task.isRecurring && task.recurrenceDays) {
      const todayDay = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      return !!task.recurrenceDays[todayDay as keyof typeof task.recurrenceDays];
    }
    
    // If task date is today or in the past, show it
    return task.date <= today;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
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
    
    // Get the task to check if it's recurring
    const task = tasks.find(t => t.id === taskId)
    
    if (task && task.isRecurring && task.recurrenceDays && completed) {
      // If it's a recurring task being marked as completed
      // Create new instances for the next occurrence dates
      createNextRecurrenceInstances(task)
    }
    
    updateTask(taskId, { completed })
    recalculateDailyScore()
    setLoading(null)
    onTaskUpdated?.()
  }
  
  const createNextRecurrenceInstances = (task: Task) => {
    if (!task.recurrenceDays) return
    
    const today = new Date()
    
    // Check the next 7 days to see if any match the recurrence pattern
    for (let i = 1; i <= 7; i++) {
      const nextDate = new Date(today)
      nextDate.setDate(today.getDate() + i)
      
      const dayOfWeek = nextDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
      
      if (task.recurrenceDays[dayOfWeek as keyof typeof task.recurrenceDays]) {
        // Create a new instance of the task for this date
        const newTask = {
          ...task,
          id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Generate new ID
          date: nextDate.toISOString().split('T')[0],
          completed: false, // New instances are not completed
          isRecurring: undefined, // Remove recurrence flag from new instance
          recurrenceDays: undefined, // Remove recurrence days from new instance
        }
        
        // Create the new task
        createTaskInStorage(newTask)
      }
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    setLoading(taskId)
    deleteTaskFromStorage(taskId)
    recalculateDailyScore()
    setLoading(null)
    onTaskUpdated?.()
  }
  
  const handleEditTask = (task: Task) => {
    setTaskToEdit(task)
  }
  
  const handleTaskEditComplete = () => {
    setTaskToEdit(null);
    onTaskUpdated?.();
  }

  if (filteredTasks.length === 0 && !taskToEdit) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg">No tasks yet. Add your first task to get started!</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {taskToEdit ? (
        <TaskForm 
          taskToEdit={taskToEdit} 
          onTaskCreated={handleTaskEditComplete} 
        />
      ) : (
        <>
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
                    {task.isRecurring && (
                      <span className="text-xs px-2 py-0.5 rounded-full border bg-blue-100 text-blue-800 border-blue-200">
                        Recurring
                      </span>
                    )}
                  </div>
                  {task.description && <p className="text-sm text-muted-foreground mt-1">{task.description}</p>}
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditTask(task)}
                    disabled={loading === task.id}
                  >
                    <Edit className="h-4 w-4 text-muted-foreground hover:text-primary" />
                  </Button>
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
            </div>
          ))}
        </>
      )}
    </div>
  )
}
