"use client"

import type { Task, TimeEntry } from "@/lib/types"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Trash2, Edit, GripVertical, Clock } from "lucide-react"
import { useState } from "react"
import { updateTask, deleteTask as deleteTaskFromStorage, getTasksByDate, upsertDailyScore, createTask as createTaskInStorage, upsertDailyLog, getDailyLog, getDailyLogs, saveDailyScores } from "@/lib/storage"
import { calculateDailyScore } from "@/lib/score-calculator"
import { TaskForm } from "@/components/task-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// DnD Kit imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

// Time tracking imports
import { createTimeEntry, getTimeEntriesByTask } from "@/lib/storage"
import { TimeInput } from "@/components/time-input"

interface TaskListProps {
  tasks: Task[]
  onTaskUpdated?: () => void
}

export function TaskList({ tasks, onTaskUpdated }: TaskListProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null)
  const [timeTrackingTask, setTimeTrackingTask] = useState<Task | null>(null)
  const [timeSpent, setTimeSpent] = useState<number>(0)
  const [timeDescription, setTimeDescription] = useState<string>("")

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

  // Sort by priority first, then by user-defined order
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    const priorityOrder = { High: 0, Medium: 1, Low: 2 }
    const priorityComparison = priorityOrder[a.priority] - priorityOrder[b.priority]
    if (priorityComparison !== 0) return priorityComparison
    // If priority is the same, maintain user drag order
    return 0
  })
  
  // DnD Kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  // Handle drag end event
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = sortedTasks.findIndex(task => task.id === active.id);
      const newIndex = sortedTasks.findIndex(task => task.id === over.id);
      
      // In a real app, you would update the order in storage
      // For now, we'll just resort the tasks and trigger a refresh
      const newTasks = arrayMove(sortedTasks, oldIndex, newIndex);
      // In a real implementation, you would save the order to storage
      onTaskUpdated?.();
    }
  }

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
  
  // Sortable Task Item Component
  const SortableTaskItem = ({ task }: { task: Task }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: task.id });
  
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };
    
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`p-4 border rounded-lg transition-all ${task.completed ? "opacity-60 bg-muted/30" : "bg-card"}`}
      >
        <div className="flex items-start gap-3">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing mt-1"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
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
              {task.category && (
                <span className="text-xs px-2 py-0.5 rounded-full border bg-purple-100 text-purple-800 border-purple-200">
                  {task.category}
                </span>
              )}
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
    );
  }
  
  // Time Tracking Dialog
  const TimeTrackingDialog = () => {
    return (
      <Dialog open={!!timeTrackingTask} onOpenChange={(open) => !open && handleTimeTrackingCancel()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Track Time Spent</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="time-task">Task</Label>
              <div className="text-sm font-medium mt-1">
                {timeTrackingTask?.title}
              </div>
            </div>
            <div>
              <Label htmlFor="time-spent">Time Spent (hours)</Label>
              <Input
                id="time-spent"
                type="number"
                min="0"
                step="0.25"
                value={timeSpent || ''}
                onChange={(e) => setTimeSpent(parseFloat(e.target.value) || 0)}
                placeholder="e.g., 1.5"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="time-description">Description (optional)</Label>
              <Input
                id="time-description"
                value={timeDescription}
                onChange={(e) => setTimeDescription(e.target.value)}
                placeholder="What did you work on?"
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleTimeTrackingCancel}>Cancel</Button>
            <Button onClick={handleTimeTrackingSubmit}>Mark Complete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
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
    
    if (task && completed) {
      // If the task is being marked as completed, ask for time spent
      setTimeTrackingTask(task);
      setTimeSpent(0);
      setTimeDescription("");
    } else {
      // If the task is being marked as incomplete, just update it
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
  }
  
  const handleTimeTrackingSubmit = async () => {
    if (!timeTrackingTask) return;
    
    // Update the task as completed
    updateTask(timeTrackingTask.id, { completed: true });
    
    // If time was tracked, save it
    if (timeSpent > 0) {
      createTimeEntry({
        task_id: timeTrackingTask.id,
        date: new Date().toISOString().split("T")[0],
        hours: timeSpent,
        description: timeDescription || `Time spent on ${timeTrackingTask.title}`,
      });
    }
    
    // Update daily log to include this task completion
    const today = new Date().toISOString().split("T")[0];
    const existingLog = getDailyLog(today);
    
    // Get all tasks for today to calculate the daily score
    const todayTasks = getTasksByDate(today);
    const completedToday = todayTasks.filter(t => t.completed).length;
    
    const dailyLog = {
      date: today,
      tasks: todayTasks.map(t => {
        // Calculate time spent from time entries for this task
        const timeEntries = getTimeEntriesByTask(t.id);
        const totalTaskTime = timeEntries.reduce((sum: number, entry: TimeEntry) => sum + (entry.hours * 60), 0); // Convert hours to minutes
        
        return {
          taskId: t.id,
          priority: t.priority_weight || 0,
          isCompleted: t.completed,
          timeSpent: totalTaskTime, // Time spent in minutes
          completedAt: t.completed ? new Date().toISOString() : undefined,
        }
      }),
      totalScore: calculateDailyScore(todayTasks),
      tasksCompleted: completedToday,
      tasksAssigned: todayTasks.length,
    };
    
    upsertDailyLog(dailyLog);
    
    // Handle recurring tasks
    if (timeTrackingTask.isRecurring && timeTrackingTask.recurrenceDays) {
      createNextRecurrenceInstances(timeTrackingTask);
    }
    
    recalculateDailyScore();
    setLoading(null);
    setTimeTrackingTask(null);
    setTimeSpent(0);
    setTimeDescription("");
    onTaskUpdated?.();
  }
  
  const handleTimeTrackingCancel = () => {
    setTimeTrackingTask(null);
    setTimeSpent(0);
    setTimeDescription("");
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
          priority_weight: task.priority_weight || 0, // Preserve priority weight
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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={sortedTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {sortedTasks.map((task) => (
                <SortableTaskItem key={task.id} task={task} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
      <TimeTrackingDialog />
    </div>
  )
}
