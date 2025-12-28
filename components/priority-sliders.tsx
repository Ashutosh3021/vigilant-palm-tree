"use client"

import { useState, useEffect } from "react"
import type { Task } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { updateTask } from "@/lib/storage"

interface PrioritySlidersProps {
  tasks: Task[]
  onUpdate?: () => void
}

export function PrioritySliders({ tasks, onUpdate }: PrioritySlidersProps) {
  // Initialize with equal distribution or existing priorities
  const [priorities, setPriorities] = useState<Record<string, number>>({})
  const [isOpen, setIsOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    // Initialize priorities based on task priority levels
    const initial: Record<string, number> = {}
    const equalShare = Math.floor(100 / tasks.length)
    let remaining = 100

    tasks.forEach((task, index) => {
      if (index === tasks.length - 1) {
        initial[task.id] = remaining // Give remaining to last task
      } else {
        initial[task.id] = equalShare
        remaining -= equalShare
      }
    })

    setPriorities(initial)
  }, [tasks])

  const handleSliderChange = (taskId: string, newValue: number) => {
    const otherTasks = tasks.filter((t) => t.id !== taskId)
    const otherPriorities = otherTasks.reduce((sum, t) => sum + (priorities[t.id] || 0), 0)

    if (otherPriorities === 0) {
      // Can't adjust if all others are 0
      return
    }

    const remaining = 100 - newValue
    const newPriorities: Record<string, number> = { ...priorities, [taskId]: newValue }

    // Proportionally distribute remaining percentage
    otherTasks.forEach((task) => {
      const currentValue = priorities[task.id] || 0
      const proportion = currentValue / otherPriorities
      newPriorities[task.id] = Math.round(proportion * remaining)
    })

    // Adjust for rounding errors
    const total = Object.values(newPriorities).reduce((sum, val) => sum + val, 0)
    if (total !== 100 && otherTasks.length > 0) {
      const diff = 100 - total
      newPriorities[otherTasks[0].id] += diff
    }

    setPriorities(newPriorities)
  }

  const handleSave = async () => {
    setIsSaving(true)

    // Update each task with its new priority weight
    for (const task of tasks) {
      const priority = priorities[task.id] || 0
      updateTask(task.id, { priority_weight: priority })
    }

    setIsSaving(false)
    setIsOpen(false)
    onUpdate?.()
  }

  if (!isOpen) {
    return (
      <div className="p-6 border rounded-lg bg-card">
        <Button onClick={() => setIsOpen(true)} variant="outline" className="w-full">
          Adjust Task Priorities
        </Button>
      </div>
    )
  }

  const total = Object.values(priorities).reduce((sum, val) => sum + val, 0)

  return (
    <div className="p-6 border rounded-lg bg-card space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Set Priority Weights (Total: {total}%)</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Drag the sliders to adjust task priorities. Total must equal 100%.
        </p>
      </div>

      <div className="space-y-6">
        {tasks.map((task) => (
          <div key={task.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm truncate max-w-[70%]">{task.title}</span>
              <span className="text-lg font-bold text-primary">{priorities[task.id] || 0}%</span>
            </div>
            <div className="relative">
              <input
                type="range"
                min="0"
                max="100"
                value={priorities[task.id] || 0}
                onChange={(e) => handleSliderChange(task.id, Number.parseInt(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${priorities[task.id] || 0}%, hsl(var(--muted)) ${priorities[task.id] || 0}%, hsl(var(--muted)) 100%)`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={isSaving || total !== 100} className="flex-1">
          {isSaving ? "Saving..." : "Save Priorities"}
        </Button>
        <Button variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
          Cancel
        </Button>
      </div>
    </div>
  )
}
