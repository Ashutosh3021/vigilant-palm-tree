"use client"

import { useState, useEffect } from "react"
import type { Task } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { updateTask } from "@/lib/storage"

interface PrioritySlidersProps {
  tasks: Task[]
  onPrioritiesChange?: (tasksWithPriorities: Array<{id: string, priority: number}>) => void
  onUpdate?: () => void
}

export function PrioritySliders({ tasks, onPrioritiesChange, onUpdate }: PrioritySlidersProps) {
  // Initialize priorities - use existing priority weights from tasks if available, otherwise distribute 100% among tasks
  const [priorities, setPriorities] = useState<Record<string, number>>(() => {
    const initialPriorities: Record<string, number> = {}
    
    // Use existing priority weights from tasks if available
    let totalExistingWeight = 0;
    tasks.forEach((task) => {
      const priorityWeight = task.priority_weight || 0;
      if (priorityWeight > 0) {
        initialPriorities[task.id] = priorityWeight;
        totalExistingWeight += priorityWeight;
      }
    });
    
    // If no existing weights or total is not 100, distribute equally
    if (totalExistingWeight === 0 || totalExistingWeight !== 100) {
      const basePriority = tasks.length > 0 ? Math.floor(100 / tasks.length) : 0
      let remaining = 100
      
      tasks.forEach((task, index) => {
        if (index === tasks.length - 1) {
          // Assign remaining percentage to the last task
          initialPriorities[task.id] = remaining
        } else {
          initialPriorities[task.id] = basePriority
          remaining -= basePriority
        }
      })
    }
    
    return initialPriorities
  })
  
  // Calculate total priority percentage
  const totalPriority = Object.values(priorities).reduce((sum, val) => sum + val, 0)
  
  // Update priorities when tasks change
  useEffect(() => {
    const newPriorities = { ...priorities }
    const existingTaskIds = new Set(tasks.map(t => t.id))
    
    // Remove priorities for tasks that no longer exist
    Object.keys(newPriorities).forEach(id => {
      if (!existingTaskIds.has(id)) {
        delete newPriorities[id]
      }
    })
    
    // Add priorities for new tasks, using existing priority weights if available
    tasks.forEach(task => {
      if (!(task.id in newPriorities)) {
        // Use the task's existing priority weight if available
        if (task.priority_weight && task.priority_weight > 0) {
          newPriorities[task.id] = task.priority_weight;
        } else {
          // Otherwise distribute equally
          newPriorities[task.id] = Math.max(0, Math.floor(100 / tasks.length));
        }
      }
    })
    
    // Normalize to ensure total is 100%
    const currentTotal = Object.values(newPriorities).reduce((sum, val) => sum + val, 0)
    if (currentTotal !== 100 && tasks.length > 0) {
      const adjustment = 100 / currentTotal
      Object.keys(newPriorities).forEach(id => {
        newPriorities[id] = Math.round(newPriorities[id] * adjustment)
      })
      
      // Adjust for rounding errors
      const finalTotal = Object.values(newPriorities).reduce((sum, val) => sum + val, 0)
      if (finalTotal !== 100) {
        const lastTaskId = tasks[tasks.length - 1]?.id
        if (lastTaskId) {
          newPriorities[lastTaskId] = newPriorities[lastTaskId] + (100 - finalTotal)
        }
      }
    }
    
    setPriorities(newPriorities)
  }, [tasks])
  
  // Handle priority change for a specific task
  const handlePriorityChange = (taskId: string, newPriority: number) => {
    const updatedPriorities = { ...priorities }
    const currentPriority = updatedPriorities[taskId] || 0
    const priorityDiff = newPriority - currentPriority
    
    // Adjust other tasks proportionally to maintain 100% total
    const otherTaskIds = Object.keys(updatedPriorities).filter(id => id !== taskId)
    
    if (otherTaskIds.length === 0) {
      // If there's only one task, just set its priority
      updatedPriorities[taskId] = 100
    } else {
      // Calculate how to distribute the difference among other tasks
      const totalOtherPriority = otherTaskIds.reduce((sum, id) => sum + (updatedPriorities[id] || 0), 0)
      
      if (totalOtherPriority > 0) {
        // Adjust other priorities proportionally
        otherTaskIds.forEach(id => {
          const currentOtherPriority = updatedPriorities[id] || 0
          const proportionalAdjustment = Math.round((currentOtherPriority / totalOtherPriority) * (-priorityDiff))
          updatedPriorities[id] = Math.max(0, currentOtherPriority + proportionalAdjustment)
        })
      }
      
      updatedPriorities[taskId] = newPriority
      
      // Adjust for rounding errors to ensure total is exactly 100
      const finalTotal = Object.values(updatedPriorities).reduce((sum, val) => sum + val, 0)
      if (finalTotal !== 100) {
        // Adjust the last task to compensate for rounding errors
        const lastTaskId = otherTaskIds[otherTaskIds.length - 1] || taskId
        if (lastTaskId) {
          updatedPriorities[lastTaskId] = updatedPriorities[lastTaskId] + (100 - finalTotal)
        }
      }
    }
    
    // Update the task priority weights in storage
    Object.entries(updatedPriorities).forEach(([id, priority]) => {
      updateTask(id, { priority_weight: priority });
    });
    
    setPriorities(updatedPriorities)
    notifyParent(updatedPriorities)
  }
  
  // Notify parent component of changes
  const notifyParent = (updatedPriorities: Record<string, number>) => {
    const prioritiesArray = Object.entries(updatedPriorities).map(([id, priority]) => ({
      id,
      priority
    }))
    if (onPrioritiesChange) {
      onPrioritiesChange(prioritiesArray)
    }
    
    if (onUpdate) {
      onUpdate();
    }
  }
  
  // Reset to equal distribution
  const handleReset = () => {
    const newPriorities: Record<string, number> = {}
    const basePriority = tasks.length > 0 ? Math.floor(100 / tasks.length) : 0
    let remaining = 100
    
    tasks.forEach((task, index) => {
      if (index === tasks.length - 1) {
        // Assign remaining percentage to the last task
        newPriorities[task.id] = remaining
      } else {
        newPriorities[task.id] = basePriority
        remaining -= basePriority
      }
    })
    
    setPriorities(newPriorities)
    notifyParent(newPriorities)
  }
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Priority Distribution</CardTitle>
          <Button variant="outline" size="sm" onClick={handleReset}>
            Reset
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">
          Adjust task priorities (Total: {totalPriority}%)
          <Badge variant={totalPriority === 100 ? "default" : "destructive"} className="ml-2">
            {totalPriority === 100 ? "✓ Balanced" : "⚠ Unbalanced"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {tasks.map((task) => (
          <div key={task.id} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium truncate max-w-[60%]">{task.title}</span>
              <span className="font-semibold">{priorities[task.id] || 0}%</span>
            </div>
            <Slider
              value={[priorities[task.id] || 0]}
              onValueChange={(value) => handlePriorityChange(task.id, value[0])}
              max={100}
              min={0}
              step={1}
              className="w-full"
            />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}