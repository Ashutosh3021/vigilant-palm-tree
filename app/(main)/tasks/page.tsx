"use client"

import { useEffect, useState } from "react"
import { TaskForm } from "@/components/task-form"
import { OrganizedTaskList } from "@/components/organized-task-list"
import { PrioritySliders } from "@/components/priority-sliders"
import { getTasks, getRecoveryTasks, isStreakBroken, generateRecoveryTasks, saveRecoveryTasks } from "@/lib/storage"
import { getTodaysTasks, getOverdueTasks, getActiveTodaysTasks, getCompletedTodaysTasks } from "@/lib/taskFilters"
import type { Task } from "@/lib/types"
import { checkAllBadges } from "@/lib/badges"

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])

  const loadTasks = () => {
    const allTasks = getTasks();
    const recoveryTasks = getRecoveryTasks();
    
    // Filter to get only today's tasks
    const todaysTasks = getTodaysTasks(allTasks);
    
    // Combine with recovery tasks if needed
    let todayTasks = [...todaysTasks].sort((a, b) => {
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

  // Separate tasks into different categories for display
  const overdueTasks = getOverdueTasks(tasks);
  const activeTasks = getActiveTodaysTasks(tasks);
  const completedTasks = getCompletedTodaysTasks(tasks);

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
      <div className="space-y-4">
        {/* Overdue Tasks */}
        {overdueTasks.length > 0 && (
          <div className="border rounded-lg overflow-hidden">
            <div className="w-full flex items-center justify-between p-4 bg-destructive/10 font-medium text-sm">
              <div className="flex items-center gap-2">
                <span>⚠️</span>
                <span>OVERDUE ({overdueTasks.length})</span>
              </div>
            </div>
            <div className="p-2 space-y-2">
              {overdueTasks.map((task) => (
                <div key={task.id} className="p-4 border rounded-lg bg-card">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <h4 className="font-medium">{task.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                    </div>
                    <div className="text-sm text-red-600">Due: {task.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Tasks */}
        {activeTasks.length > 0 && (
          <div className="border rounded-lg overflow-hidden">
            <div className="w-full flex items-center justify-between p-4 bg-muted font-medium text-sm">
              <div className="flex items-center gap-2">
                <span>🎯</span>
                <span>ACTIVE TASKS ({activeTasks.length})</span>
              </div>
            </div>
            <div className="p-2 space-y-2">
              {activeTasks.map((task) => (
                <div key={task.id} className="p-4 border rounded-lg bg-card">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <h4 className="font-medium">{task.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                    </div>
                    <div className="text-sm text-green-600">Due: {task.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completed Today Tasks (Collapsible) */}
        {completedTasks.length > 0 && (
          <details className="border rounded-lg overflow-hidden">
            <summary className="w-full flex items-center justify-between p-4 bg-muted font-medium text-sm cursor-pointer hover:bg-muted/80 transition-colors">
              <div className="flex items-center gap-2">
                <span>✅</span>
                <span>COMPLETED TODAY ({completedTasks.length})</span>
              </div>
            </summary>
            <div className="p-2 space-y-2">
              {completedTasks.map((task) => (
                <div key={task.id} className="p-4 border rounded-lg bg-card opacity-60">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <h4 className="font-medium line-through">{task.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1 line-through">{task.description}</p>
                    </div>
                    <div className="text-sm text-blue-600">Completed: {task.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </details>
        )}

        {/* Show message if no tasks for today */}
        {tasks.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg">No tasks for today. Add a new task to get started!</p>
          </div>
        )}
      </div>
    </div>
  )
}