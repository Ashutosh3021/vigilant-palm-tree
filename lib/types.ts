export type Priority = "High" | "Medium" | "Low"

export interface Task {
  id: string
  user_id: string
  title: string
  description: string | null
  priority: Priority
  priority_weight?: number
  completed: boolean
  date: string
  created_at: string
  updated_at: string
  // Recurrence properties
  isRecurring?: boolean
  recurrenceDays?: RecurrenceDays
  // Weekly target hours
  weeklyTargetHours?: number
  // Category tags
  category?: string
  // Recovery task indicator
  isRecovery?: boolean
}

export interface RecurrenceDays {
  monday?: boolean
  tuesday?: boolean
  wednesday?: boolean
  thursday?: boolean
  friday?: boolean
  saturday?: boolean
  sunday?: boolean
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

export interface UserPreferences {
  name: string
  goal: string
  workingHours: { start: string; end: string }
  dayResetTime: string
  hasCompletedOnboarding: boolean
}

export interface TimeEntry {
  id: string
  task_id: string
  date: string
  hours: number
  description?: string
  created_at: string
  updated_at: string
}

export interface JournalEntry {
  date: string;
  screenTime?: string;
  sleepHours?: string;
  waterGlasses?: number;
  mood?: number;
  energy?: number;
  customMetrics?: Array<{name: string, value: string}>;
}
