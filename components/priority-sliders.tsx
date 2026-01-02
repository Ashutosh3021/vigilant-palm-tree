"use client"

import { useState, useEffect } from "react"
import type { Task } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { updateTask } from "@/lib/storage"
import { getCategoryWeight, getAllCategoryWeights } from "@/lib/constants/categoryWeightage"

interface PrioritySlidersProps {
  tasks: Task[]
  onPrioritiesChange?: (tasksWithPriorities: Array<{id: string, priority: number}>) => void
  onUpdate?: () => void
}

export function PrioritySliders({ tasks, onPrioritiesChange, onUpdate }: PrioritySlidersProps) {
  // Initialize priorities - now based on category weights
  const [priorities, setPriorities] = useState<Record<string, number>>(() => {
    const initialPriorities: Record<string, number> = {}
    
    // Use category weights for each task
    tasks.forEach((task) => {
      const categoryWeight = getCategoryWeight(task.category || "OTHER");
      initialPriorities[task.id] = categoryWeight;
    });
    
    return initialPriorities
  })

  // Calculate total priority percentage based on unique categories
  const uniqueCategories = [...new Set(tasks.map(task => task.category || "OTHER"))];
  const totalPriority = uniqueCategories.reduce((sum, category) => sum + getCategoryWeight(category), 0);

  // Update priorities when tasks change
  useEffect(() => {
    const newPriorities = { ...priorities }
    
    // Update priorities based on task categories
    tasks.forEach(task => {
      const categoryWeight = getCategoryWeight(task.category || "OTHER");
      newPriorities[task.id] = categoryWeight;
    })
    
    setPriorities(newPriorities)
  }, [tasks])

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

  // Category weights for display
  const categoryWeights = getAllCategoryWeights();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Fixed Category Weights</CardTitle>
          <Button variant="outline" size="sm" onClick={() => notifyParent(priorities)}>
            Refresh
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">
          Category weights are fixed and never change (Total: {totalPriority}%)
          <Badge variant={totalPriority === 100 ? "default" : "destructive"} className="ml-2">
            {totalPriority === 100 ? "✓ Balanced" : "⚠ Unbalanced"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {tasks.map((task) => {
          const categoryWeight = getCategoryWeight(task.category || "OTHER");
          return (
            <div key={task.id} className="space-y-2 p-3 border rounded-lg">
              <div className="flex justify-between text-sm">
                <div>
                  <span className="font-medium truncate max-w-[60%]">{task.title}</span>
                  <span className="text-xs text-muted-foreground ml-2">({task.category || "OTHER"})</span>
                </div>
                <span className="font-semibold">{categoryWeight}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5">
                <div 
                  className="bg-primary h-2.5 rounded-full" 
                  style={{ width: `${categoryWeight}%` }}
                ></div>
              </div>
            </div>
          )
        })}
        
        {/* Display all category weights for reference */}
        <div className="pt-4 border-t">
          <h4 className="font-medium mb-2">All Category Weights:</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {categoryWeights.map(({ category, weight }) => (
              <div key={category} className="flex justify-between">
                <span>{category}:</span>
                <span className="font-medium">{weight}%</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
