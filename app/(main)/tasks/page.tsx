"use client"

import { useEffect, useState } from "react"
import { TaskForm } from "@/components/task-form"
import { TaskList } from "@/components/task-list"
import { PrioritySliders } from "@/components/priority-sliders"
import { getTasks, getRecoveryTasks, isStreakBroken, generateRecoveryTasks, saveRecoveryTasks } from "@/lib/storage"
import type { Task } from "@/lib/types"
import { checkAllBadges } from "@/lib/badges"

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])

  const loadTasks = () => {
    const today = new Date().toISOString().split("T")[0]
    
    // Read from localStorage only once to improve performance
    const allTasks = getTasks();
    const recoveryTasks = getRecoveryTasks();
    
    let todayTasks = allTasks.sort((a: Task, b: Task) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
    
    // Check if streak is broken and add recovery tasks if needed
    if (isStreakBroken()) {
      let currentRecoveryTasks = recoveryTasks;
      
      // If no recovery tasks exist, generate them
      if (currentRecoveryTasks.length === 0) {
        currentRecoveryTasks = generateRecoveryTasks();
        saveRecoveryTasks(currentRecoveryTasks);
      }
      
      // Add recovery tasks to the main task list
      const recoveryTasksAsTasks: Task[] = currentRecoveryTasks.map(rt => ({
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
    
    // Check for newly unlocked badges when page loads
    checkAllBadges();
    
    const handleUpdate = () => {
      loadTasks();
      // Check for newly unlocked badges when tasks are updated
      checkAllBadges();
    };
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
