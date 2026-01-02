"use client"

import type { Task, TimeEntry } from "@/lib/types"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Trash2, Edit, GripVertical, Clock, ChevronDown, ChevronRight } from "lucide-react"
import { useState, useMemo } from "react"
import { updateTask, deleteTask as deleteTaskFromStorage, getTasksByDate, upsertDailyScore, createTask as createTaskInStorage, upsertDailyLog, getDailyLog, getDailyLogs, saveDailyScores, updateRecoveryTask, clearRecoveryTasks, getRecoveryTasks } from "@/lib/storage"
import { calculateDailyScore } from "@/lib/score-calculator"
import { TaskForm } from "@/components/task-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { checkAllBadges } from "@/lib/badges"
import { getCategoryWeight } from "@/lib/constants/categoryWeightage"

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

interface OrganizedTaskListProps {
  tasks: Task[]
  onTaskUpdated?: () => void
}

export function OrganizedTaskList({ tasks, onTaskUpdated }: OrganizedTaskListProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null)
  const [timeTrackingTask, setTimeTrackingTask] = useState<Task | null>(null)
  const [timeSpent, setTimeSpent] = useState<number>(0)
  const [timeDescription, setTimeDescription] = useState<string>("")
  const [completedExpanded, setCompletedExpanded] = useState(true);
  const [scheduledExpanded, setScheduledExpanded] = useState(true);

  // Organize tasks into different sections
  const { todayTasks, overdueTasks, completedTasks, scheduledTasks } = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const todayDate = new Date(today);
    
    // First, filter tasks based on recurrence and date conditions
    const allRelevantTasks = tasks.filter(task => {
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

    // Now organize tasks into sections
    const todayTasks: Task[] = [];
    const overdueTasks: Task[] = [];
    const completedTasks: Task[] = [];
    const scheduledTasks: Task[] = [];

    allRelevantTasks.forEach(task => {
      const taskDate = new Date(task.date);
      const isToday = task.date === today;
      const isOverdue = taskDate < todayDate && !task.completed;
      const isCompleted = task.completed;
      const isScheduled = task.date > today && !isCompleted;

      if (isOverdue) {
        overdueTasks.push(task);
      } else if (isCompleted) {
        completedTasks.push(task);
      } else if (isScheduled) {
        scheduledTasks.push(task);
      } else if (isToday) {
        todayTasks.push(task);
      } else {
        // For recurring tasks that match today's pattern, add to today's tasks
        if (task.isRecurring && task.recurrenceDays) {
          const todayDay = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
          if (!!task.recurrenceDays[todayDay as keyof typeof task.recurrenceDays]) {
            todayTasks.push(task);
          } else {
            todayTasks.push(task);
          }
        } else {
          todayTasks.push(task);
        }
      }
    });

    // Sort each section by priority
    const sortTasks = (tasks: Task[]) => {
      const priorityOrder = { High: 0, Medium: 1, Low: 2 };
      return [...tasks].sort((a, b) => {
        const priorityComparison = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityComparison !== 0) return priorityComparison;
        // If priority is the same, maintain user drag order
        return 0;
      });
    };

    return {
      todayTasks: sortTasks(todayTasks),
      overdueTasks: sortTasks(overdueTasks),
      completedTasks: sortTasks(completedTasks),
      scheduledTasks: sortTasks(scheduledTasks)
    };
  }, [tasks]);

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
      // For simplicity, we're not implementing cross-section dragging
      // This would require more complex logic to handle tasks moving between sections
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
    
    // Get category weight for display
    const categoryWeight = getCategoryWeight(task.category || "OTHER");
    
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
              {task.isRecovery && (
                <span className="text-xs px-2 py-0.5 rounded-full border bg-red-100 text-red-800 border-red-200">
                  Recovery
                </span>
              )}
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
              {/* Display category weight */}
              <span className="text-xs px-2 py-0.5 rounded-full border bg-green-100 text-green-800 border-green-200">
                {categoryWeight}%
              </span>
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
      // If it's a recovery task being marked as completed, check if all recovery tasks are done
      if (task && task.isRecovery) {
        updateRecoveryTask(taskId, { completed });
        
        // Check if all recovery tasks are completed
        const allRecoveryTasks = getRecoveryTasks();
        const allCompleted = allRecoveryTasks.every(t => t.completed);
        
        // If all recovery tasks are completed, clear them
        if (allCompleted) {
          clearRecoveryTasks();
        }
      } else {
        updateTask(taskId, { completed });
      }
      
      // Handle recurring tasks after updating the task
      if (task && task.isRecurring && task.recurrenceDays && completed) {
        // If it's a recurring task being marked as completed
        // Create new instances for the next occurrence dates
        createNextRecurrenceInstances(task)
      }
      
      recalculateDailyScore()
      
      // Check for newly unlocked badges
      checkAllBadges();
      
      setLoading(null)
      onTaskUpdated?.()
    }
  }
  
  const handleTimeTrackingSubmit = async () => {
    if (!timeTrackingTask) return;
    
    // Update the task as completed
    if (timeTrackingTask.isRecovery) {
      updateRecoveryTask(timeTrackingTask.id, { completed: true });
      
      // Check if all recovery tasks are completed
      const allRecoveryTasks = getRecoveryTasks();
      const allCompleted = allRecoveryTasks.every((t: any) => t.completed);
      
      // If all recovery tasks are completed, clear them
      if (allCompleted) {
        clearRecoveryTasks();
      }
    } else {
      updateTask(timeTrackingTask.id, { completed: true });
    }
    
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
    const recoveryTasks = getRecoveryTasks();
    const allTasks = [...todayTasks, ...recoveryTasks.map((rt: any) => ({
      ...rt,
      user_id: "local",
      priority_weight: rt.priority === "High" ? 3 : rt.priority === "Medium" ? 2 : 1,
    }))];
    
    const completedToday = allTasks.filter((t: any) => t.completed).length;
    
    const dailyLog = {
      date: today,
      tasks: allTasks.map((t: any) => {
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
      totalScore: calculateDailyScore(allTasks),
      tasksCompleted: completedToday,
      tasksAssigned: allTasks.length,
    };
    
    upsertDailyLog(dailyLog);
    
    // Handle recurring tasks after updating the task
    if (timeTrackingTask.isRecurring && timeTrackingTask.recurrenceDays) {
      createNextRecurrenceInstances(timeTrackingTask);
    }
    
    recalculateDailyScore();
        
    // Check for newly unlocked badges
    checkAllBadges();
        
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
        const newTask: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'user_id'> = {
          ...task,
          date: nextDate.toISOString().split('T')[0],
          completed: false, // New instances are not completed
          isRecurring: false, // New instances are not recurring to avoid infinite loop
          recurrenceDays: undefined, // Remove recurrence days from new instance
          priority_weight: task.priority_weight || (task.priority === 'High' ? 3 : task.priority === 'Medium' ? 2 : 1), // Preserve priority weight
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
    
    // Check for newly unlocked badges
    checkAllBadges();
    
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

  const renderTaskSection = (title: string, tasks: Task[], count: number, icon: string, expanded: boolean, setExpanded: (expanded: boolean) => void) => {
    if (tasks.length === 0) return null;

    return (
      <div className="border rounded-lg overflow-hidden">
        <button
          className="w-full flex items-center justify-between p-4 bg-muted font-medium text-sm hover:bg-muted/80 transition-colors"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center gap-2">
            <span>{icon}</span>
            <span>{title} ({count})</span>
          </div>
          {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
        {expanded && (
          <div className="p-2 space-y-2">
            {tasks.map((task) => (
              <SortableTaskItem key={task.id} task={task} />
            ))}
          </div>
        )}
      </div>
    );
  };

  // Check if we have any tasks to show
  const hasAnyTasks = todayTasks.length > 0 || overdueTasks.length > 0 || completedTasks.length > 0 || scheduledTasks.length > 0;

  if (!hasAnyTasks && !taskToEdit) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg">No tasks yet. Add your first task to get started!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {taskToEdit ? (
        <TaskForm 
          taskToEdit={taskToEdit} 
          onTaskCreated={handleTaskEditComplete} 
        />
      ) : (
        <>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={[...todayTasks, ...overdueTasks, ...completedTasks, ...scheduledTasks].map(t => t.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-4">
                {/* Today's Tasks */}
                {todayTasks.length > 0 && (
                  <div className="border rounded-lg overflow-hidden">
                    <div className="w-full flex items-center justify-between p-4 bg-muted font-medium text-sm">
                      <div className="flex items-center gap-2">
                        <span>📅</span>
                        <span>Today's Tasks ({todayTasks.length})</span>
                      </div>
                    </div>
                    <div className="p-2 space-y-2">
                      {todayTasks.map((task) => (
                        <SortableTaskItem key={task.id} task={task} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Overdue Tasks */}
                {overdueTasks.length > 0 && (
                  <div className="border rounded-lg overflow-hidden">
                    <div className="w-full flex items-center justify-between p-4 bg-destructive/10 font-medium text-sm">
                      <div className="flex items-center gap-2">
                        <span>⚠️</span>
                        <span>Overdue ({overdueTasks.length})</span>
                      </div>
                    </div>
                    <div className="p-2 space-y-2">
                      {overdueTasks.map((task) => (
                        <SortableTaskItem key={task.id} task={task} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Completed Tasks (Collapsible) */}
                {completedTasks.length > 0 && renderTaskSection(
                  "Completed",
                  completedTasks,
                  completedTasks.length,
                  "✓",
                  completedExpanded,
                  setCompletedExpanded
                )}

                {/* Scheduled Tasks (Collapsible) */}
                {scheduledTasks.length > 0 && renderTaskSection(
                  "Scheduled",
                  scheduledTasks,
                  scheduledTasks.length,
                  "📅",
                  scheduledExpanded,
                  setScheduledExpanded
                )}
              </div>
            </SortableContext>
          </DndContext>
        </>
      )}
      <TimeTrackingDialog />
    </div>
  )
}