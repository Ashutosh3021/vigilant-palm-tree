export type Priority = "High" | "Medium" | "Low"

export interface Task {
  id: string
  user_id: string
  title: string
  description: string | null
  priority: Priority
  completed: boolean
  date: string
  created_at: string
  updated_at: string
}

export interface DailyScore {
  id: string
  user_id: string
  date: string
  score: number
  tasks_completed: number
  total_tasks: number
  created_at: string
  updated_at: string
}

export interface DayData {
  date: string
  score: number
  level: number
}
