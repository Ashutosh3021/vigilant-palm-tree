"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"
import { createTask as createTaskInStorage } from "@/lib/storage"

interface TaskFormProps {
  onTaskCreated?: () => void
}

export function TaskForm({ onTaskCreated }: TaskFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const priority = formData.get("priority") as "High" | "Medium" | "Low"
    const date = formData.get("date") as string

    createTaskInStorage({
      title,
      description: description || "",
      priority,
      date,
      completed: false,
      priority_weight: 0,
    })

    setIsLoading(false)
    setIsOpen(false)
    onTaskCreated?.()

    // Reset form
    e.currentTarget.reset()
  }

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} className="w-full bg-[#1e90ff] hover:bg-[#4682b4]" size="lg">
        <Plus className="h-5 w-5 mr-2" />
        Add Task
      </Button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 border rounded-lg bg-card">
      <h3 className="font-semibold text-lg">New Task</h3>
      <div className="space-y-3">
        <Input name="title" placeholder="Task title" required className="text-base" />
        <Textarea name="description" placeholder="Description (optional)" rows={3} />
        <Select name="priority" defaultValue="Medium" required>
          <SelectTrigger>
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="High">High Priority</SelectItem>
            <SelectItem value="Medium">Medium Priority</SelectItem>
            <SelectItem value="Low">Low Priority</SelectItem>
          </SelectContent>
        </Select>
        <Input name="date" type="date" defaultValue={new Date().toISOString().split("T")[0]} required />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={isLoading} className="flex-1 bg-[#1e90ff] hover:bg-[#4682b4]">
          {isLoading ? "Adding..." : "Add Task"}
        </Button>
        <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  )
}
