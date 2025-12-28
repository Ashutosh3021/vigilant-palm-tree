"use client"

import { useEffect, useState } from "react"
import { TaskForm } from "@/components/task-form"
import { TaskList } from "@/components/task-list"
import { PrioritySliders } from "@/components/priority-sliders"
import { getTasksByDate } from "@/lib/storage"
import type { Task } from "@/lib/types"

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])

  const loadTasks = () => {
    const today = new Date().toISOString().split("T")[0]
    const todayTasks = getTasksByDate(today).sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
    setTasks(todayTasks)
  }

  useEffect(() => {
    loadTasks()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-balance">Today's Tasks</h1>
        <p className="text-muted-foreground mt-1">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Task Form */}
      <TaskForm onTaskCreated={loadTasks} />

      {/* Priority Sliders - only show if there are tasks */}
      {tasks.length > 0 && <PrioritySliders tasks={tasks} onUpdate={loadTasks} />}

      {/* Task List */}
      <TaskList tasks={tasks} onTaskUpdated={loadTasks} />
    </div>
  )
}
