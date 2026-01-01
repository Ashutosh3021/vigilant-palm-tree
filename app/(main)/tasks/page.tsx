"use client"

import { useEffect, useState } from "react"
import { TaskForm } from "@/components/task-form"
import { TaskList } from "@/components/task-list"
import { PrioritySliders } from "@/components/priority-sliders"
import { getTasksByDate, getRecoveryTasks, isStreakBroken, generateRecoveryTasks, saveRecoveryTasks } from "@/lib/storage"
import type { Task } from "@/lib/types"

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])

  const loadTasks = () => {
    const today = new Date().toISOString().split("T")[0]
    let todayTasks = getTasksByDate(today).sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
    
    // Check if streak is broken and add recovery tasks if needed
    if (isStreakBroken()) {
      let recoveryTasks = getRecoveryTasks();
      
      // If no recovery tasks exist, generate them
      if (recoveryTasks.length === 0) {
        recoveryTasks = generateRecoveryTasks();
        saveRecoveryTasks(recoveryTasks);
      }
      
      // Add recovery tasks to the main task list
      const recoveryTasksAsTasks: Task[] = recoveryTasks.map(rt => ({
        id: rt.id,
        title: rt.title,
        description: rt.description,
        priority: rt.priority,
        completed: rt.completed,
        date: rt.date,
        created_at: rt.created_at,
        updated_at: rt.updated_at,
        user_id: "local",
        priority_weight: rt.priority === "High" ? 3 : rt.priority === "Medium" ? 2 : 1,
        isRecovery: rt.isRecovery,
      }));
      todayTasks = [...todayTasks, ...recoveryTasksAsTasks];
    }
    
    setTasks(todayTasks)
  }

  useEffect(() => {
    loadTasks()
    
    const handleUpdate = () => loadTasks();
    window.addEventListener("tasksUpdated", handleUpdate);
    window.addEventListener("recoveryTasksUpdated", handleUpdate);
    
    return () => {
      window.removeEventListener("tasksUpdated", handleUpdate);
      window.removeEventListener("recoveryTasksUpdated", handleUpdate);
    };
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
      {tasks.length > 0 && <PrioritySliders tasks={tasks} onPrioritiesChange={() => {}} onUpdate={loadTasks} />}

      {/* Task List */}
      <TaskList tasks={tasks} onTaskUpdated={loadTasks} />
    </div>
  )
}
