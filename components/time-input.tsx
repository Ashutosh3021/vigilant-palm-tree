"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Clock, Plus } from "lucide-react"

interface TimeInputProps {
  value: number // in minutes
  onChange: (minutes: number) => void
  label?: string
}

// Convert minutes to HH:MM format
const formatTime = (minutes: number): string => {
  if (minutes === 0) return ""
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

// Parse HH:MM format to minutes
const parseTime = (timeStr: string): number => {
  if (!timeStr) return 0
  const [hours, minutes] = timeStr.split(':').map(Number)
  if (isNaN(hours) || isNaN(minutes)) return 0
  return hours * 60 + minutes
}

export function TimeInput({ value, onChange, label = "Time Spent" }: TimeInputProps) {
  const [inputValue, setInputValue] = useState<string>(formatTime(value))

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    
    // Parse and update the actual value
    const minutes = parseTime(newValue)
    onChange(minutes)
  }

  const handleQuickAdd = (minutes: number) => {
    onChange(value + minutes)
    setInputValue(formatTime(value + minutes))
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={inputValue}
            onChange={handleInputChange}
            placeholder="HH:MM"
            className="pl-10"
          />
        </div>
        <div className="flex gap-1">
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={() => handleQuickAdd(15)}
          >
            +15m
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={() => handleQuickAdd(30)}
          >
            +30m
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={() => handleQuickAdd(60)}
          >
            +1h
          </Button>
        </div>
      </div>
    </div>
  )
}