"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { Task } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus } from "lucide-react"
import { createTask as createTaskInStorage, updateTask } from "@/lib/storage"
import type { RecurrenceDays } from "@/lib/types"

interface TaskFormProps {
  onTaskCreated?: () => void
  taskToEdit?: Task | null
}

export function TaskForm({ onTaskCreated, taskToEdit }: TaskFormProps) {
  const [isOpen, setIsOpen] = useState(!!taskToEdit) // Open if editing a task
  const [isLoading, setIsLoading] = useState(false)
  const [isRecurring, setIsRecurring] = useState(!!taskToEdit && !!taskToEdit.isRecurring)
  const [recurrenceDays, setRecurrenceDays] = useState<RecurrenceDays>(
    taskToEdit?.isRecurring && taskToEdit.recurrenceDays 
      ? taskToEdit.recurrenceDays 
      : {
          monday: false,
          tuesday: false,
          wednesday: false,
          thursday: false,
          friday: false,
          saturday: false,
          sunday: false,
        }
  )
  
  // Update state when taskToEdit changes (for editing)
  useEffect(() => {
    if (taskToEdit) {
      setIsOpen(true)
      setIsRecurring(!!taskToEdit.isRecurring)
      setRecurrenceDays(
        taskToEdit.isRecurring && taskToEdit.recurrenceDays 
          ? taskToEdit.recurrenceDays 
          : {
              monday: false,
              tuesday: false,
              wednesday: false,
              thursday: false,
              friday: false,
              saturday: false,
              sunday: false,
            }
      )
    }
  }, [taskToEdit])

  const handleDayToggle = (day: keyof RecurrenceDays) => {
    setRecurrenceDays(prev => ({
      ...prev,
      [day]: !prev[day]
    }))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    
    // Validation: if recurring is enabled, at least one day must be selected
    if (isRecurring && !Object.values(recurrenceDays).some(day => day)) {
      alert("Please select at least one day for recurring task")
      return
    }
    
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const priority = formData.get("priority") as "High" | "Medium" | "Low"
    const date = formData.get("date") as string

    if (taskToEdit) {
      // Update existing task
      updateTask(taskToEdit.id, {
        title,
        description: description || "",
        priority,
        date,
        isRecurring,
        recurrenceDays: isRecurring ? recurrenceDays : undefined,
      })
    } else {
      // Create new task
      createTaskInStorage({
        title,
        description: description || "",
        priority,
        date,
        completed: false,
        priority_weight: 0,
        isRecurring,
        recurrenceDays: isRecurring ? recurrenceDays : undefined,
      })
    }

    setIsLoading(false)
    setIsOpen(false)
    onTaskCreated?.()

    // Reset form
    e.currentTarget.reset()
    setIsRecurring(false)
    setRecurrenceDays({
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false,
    })
  }

  if (!isOpen && !taskToEdit) { // Don't show button when editing (form is always open)
    return (
      <Button onClick={() => setIsOpen(true)} className="w-full bg-[#1e90ff] hover:bg-[#4682b4]" size="lg">
        <Plus className="h-5 w-5 mr-2" />
        Add Task
      </Button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 border rounded-lg bg-card">
      <h3 className="font-semibold text-lg">{taskToEdit ? "Edit Task" : "New Task"}</h3>
      <div className="space-y-3">
        <Input 
          name="title" 
          placeholder="Task title" 
          required 
          className="text-base" 
          defaultValue={taskToEdit?.title || ""}
        />
        <Textarea 
          name="description" 
          placeholder="Description (optional)" 
          rows={3} 
          defaultValue={taskToEdit?.description || ""}
        />
        <Select name="priority" defaultValue={taskToEdit?.priority || "Medium"} required>
          <SelectTrigger>
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="High">High Priority</SelectItem>
            <SelectItem value="Medium">Medium Priority</SelectItem>
            <SelectItem value="Low">Low Priority</SelectItem>
          </SelectContent>
        </Select>
        <Input 
          name="date" 
          type="date" 
          defaultValue={taskToEdit?.date || new Date().toISOString().split("T")[0]} 
          required 
        />
        
        {/* Recurrence Section */}
        <div className="pt-2 border-t">
          <div className="flex items-center gap-2 mb-3">
            <Checkbox 
              id="isRecurring"
              checked={isRecurring}
              onCheckedChange={(checked) => setIsRecurring(!!checked)}
            />
            <label htmlFor="isRecurring" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Recurring Task
            </label>
          </div>
          
          {isRecurring && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Select days to repeat:</p>
              <div className="grid grid-cols-7 gap-2">
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                  <div key={day} className="flex flex-col items-center">
                    <label className="text-xs text-muted-foreground capitalize">{day.substring(0, 3)}</label>
                    <Checkbox
                      checked={!!recurrenceDays[day as keyof RecurrenceDays]}
                      onCheckedChange={() => handleDayToggle(day as keyof RecurrenceDays)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={isLoading} className="flex-1 bg-[#1e90ff] hover:bg-[#4682b4]">
          {isLoading ? (taskToEdit ? "Updating..." : "Adding...") : (taskToEdit ? "Update Task" : "Add Task")}
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => {
            setIsOpen(false);
            // Reset taskToEdit when cancelling edit
            if (taskToEdit) {
              setIsRecurring(false);
              setRecurrenceDays({
                monday: false,
                tuesday: false,
                wednesday: false,
                thursday: false,
                friday: false,
                saturday: false,
                sunday: false,
              });
              // Notify parent to clear taskToEdit state
              onTaskCreated?.();
            }
          }} 
          className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  )
}
