"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getUserPreferences, saveUserPreferences, getTasks, updateTask, deleteTask, getDailyScores } from "@/lib/storage"
import type { UserPreferences, Task } from "@/lib/types"
import { Trash2, Edit, Plus, RotateCcw } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function SettingsPage() {
  const [prefs, setPrefs] = useState<UserPreferences | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [resetTime, setResetTime] = useState("04:00")
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [newTaskCategory, setNewTaskCategory] = useState("")
  const [newTaskColor, setNewTaskColor] = useState("#1e90ff")
  const [streakRecoveryDialogOpen, setStreakRecoveryDialogOpen] = useState(false)
  const [recoveryTasks, setRecoveryTasks] = useState<Task[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    const userPrefs = getUserPreferences()
    setPrefs(userPrefs)
    if (userPrefs) {
      setResetTime(userPrefs.dayResetTime)
    }
    setTasks(getTasks())
  }

  const handleSaveResetTime = () => {
    if (prefs) {
      const updated = { ...prefs, dayResetTime: resetTime }
      saveUserPreferences(updated)
      setPrefs(updated)
      alert("Day reset time updated!")
    }
  }

  const handleDeleteTask = (taskId: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      // Find the task to get its title
      const taskToDelete = tasks.find(t => t.id === taskId);
      if (taskToDelete) {
        // Delete all tasks with the same title
        const tasksToDelete = tasks.filter(t => t.title === taskToDelete.title);
        tasksToDelete.forEach(t => deleteTask(t.id));
      }
      loadData()
    }
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setNewTaskTitle(task.title)
    setNewTaskCategory(task.description || "")
    setIsAddTaskOpen(true)
  }

  const handleSaveTask = () => {
    if (editingTask) {
      updateTask(editingTask.id, { title: newTaskTitle, description: newTaskCategory })
    }
    setIsAddTaskOpen(false)
    setEditingTask(null)
    setNewTaskTitle("")
    setNewTaskCategory("")
    loadData()
  }

  const currentTime = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })

  // Function to check if user has missed a day recently
  const checkStreakStatus = () => {
    const scores = getDailyScores().sort((a, b) => b.date.localeCompare(a.date));
    if (scores.length === 0) return false;
    
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];
    
    // Check if yesterday had a good score
    const yesterdayScore = scores.find(s => s.date === yesterdayStr);
    
    // If yesterday's score was below 70% or doesn't exist, streak is broken
    return !yesterdayScore || yesterdayScore.score < 70;
  };
  
  // Function to open streak recovery
  const handleOpenStreakRecovery = () => {
    // For simplicity, we'll just show a dialog with recovery tasks
    // In a real app, you might want to generate specific recovery tasks
    setRecoveryTasks([
      { id: "recovery-1", title: "Complete 3 tasks today", description: "Recovery task for missed day", priority: "High", completed: false, date: new Date().toISOString().split("T")[0], created_at: new Date().toISOString(), updated_at: new Date().toISOString(), user_id: "local" },
      { id: "recovery-2", title: "Review yesterday's missed tasks", description: "Recovery task for missed day", priority: "Medium", completed: false, date: new Date().toISOString().split("T")[0], created_at: new Date().toISOString(), updated_at: new Date().toISOString(), user_id: "local" },
      { id: "recovery-3", title: "Set 3 new tasks for today", description: "Recovery task for missed day", priority: "Medium", completed: false, date: new Date().toISOString().split("T")[0], created_at: new Date().toISOString(), updated_at: new Date().toISOString(), user_id: "local" },
    ]);
    setStreakRecoveryDialogOpen(true);
  };
  
  // Group tasks by title (master pool concept)
  const uniqueTasks = Array.from(
    new Map(
      tasks.map((task) => [
        task.title,
        { title: task.title, category: task.description || "Uncategorized", id: task.id },
      ]),
    ).values(),
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-balance">Settings</h1>
        <p className="text-muted-foreground mt-1">Configure your preferences and manage tasks</p>
      </div>

      {/* Day Reset Configuration */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Day Reset Time</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Label htmlFor="reset-time" className="min-w-[140px]">
              Your day resets at:
            </Label>
            <Select value={resetTime} onValueChange={setResetTime}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 24 }, (_, i) => {
                  const hour = i.toString().padStart(2, "0")
                  return (
                    <SelectItem key={hour} value={`${hour}:00`}>
                      {hour}:00
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-muted-foreground">
            ℹ️ New tasks become available after this time. Current time: {currentTime}
          </p>
          <Button onClick={handleSaveResetTime}>Save Reset Time</Button>
        </div>
      </Card>

      {/* Streak Recovery */}
      {checkStreakStatus() && (
        <Card className="p-6 border-red-200 bg-red-50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-red-600" />
              Streak Recovery
            </h2>
            <Button onClick={handleOpenStreakRecovery} size="sm" className="bg-red-600 hover:bg-red-700">
              <RotateCcw className="h-4 w-4 mr-2" />
              Repair Streak
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Your streak was broken yesterday. Complete these recovery tasks to repair your streak.
          </p>
        </Card>
      )}
      
      {/* Master Task Pool */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Manage Tasks</h2>
          <Button onClick={() => setIsAddTaskOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add New Task
          </Button>
        </div>

        <div className="space-y-3">
          {uniqueTasks.map((task, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 border rounded-lg bg-card">
              <div className="flex-1">
                <p className="font-medium">{task.title}</p>
                <p className="text-sm text-muted-foreground">{task.category}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const fullTask = tasks.find((t) => t.id === task.id)
                    if (fullTask) handleEditTask(fullTask)
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDeleteTask(task.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
          {uniqueTasks.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No tasks yet. Add your first task!</p>
          )}
        </div>
      </Card>
      
      {/* Streak Recovery Dialog */}
      <Dialog open={streakRecoveryDialogOpen} onOpenChange={setStreakRecoveryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Streak Recovery</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Complete these recovery tasks to repair your streak:
            </p>
            <div className="space-y-3">
              {recoveryTasks.map((task) => (
                <div key={task.id} className="flex items-center gap-3 p-3 border rounded-lg bg-card">
                  <div className="font-medium">{task.title}</div>
                  <div className="text-sm text-muted-foreground ml-auto">{task.priority}</div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStreakRecoveryDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              // In a real app, this would create the recovery tasks
              setStreakRecoveryDialogOpen(false);
              alert("Recovery tasks added to your list!");
            }}>Add Recovery Tasks</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Task Modal */}
      <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTask ? "Edit Task" : "Add New Task"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="task-name">Task Name</Label>
              <Input
                id="task-name"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="e.g., DSA Practice"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={newTaskCategory}
                onChange={(e) => setNewTaskCategory(e.target.value)}
                placeholder="e.g., Study"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="color"
                  type="color"
                  value={newTaskColor}
                  onChange={(e) => setNewTaskColor(e.target.value)}
                  className="w-20 h-10"
                />
                <span className="text-sm text-muted-foreground">{newTaskColor}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddTaskOpen(false)
                setEditingTask(null)
                setNewTaskTitle("")
                setNewTaskCategory("")
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveTask}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
