import type { Task, DailyScore } from "./types"

// User Preferences
export interface UserPreferences {
  name: string
  goal: string
  workingHours: { start: string; end: string }
  dayResetTime: string
  hasCompletedOnboarding: boolean
}

const STORAGE_KEYS = {
  TASKS: "momentum_tasks",
  DAILY_SCORES: "momentum_daily_scores",
  USER_PREFS: "momentum_user_prefs",
}

// User Preferences
export function getUserPreferences(): UserPreferences | null {
  if (typeof window === "undefined") return null
  const data = localStorage.getItem(STORAGE_KEYS.USER_PREFS)
  return data ? JSON.parse(data) : null
}

export function saveUserPreferences(prefs: UserPreferences) {
  localStorage.setItem(STORAGE_KEYS.USER_PREFS, JSON.stringify(prefs))
}

// Tasks
export function getTasks(): Task[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEYS.TASKS)
  return data ? JSON.parse(data) : []
}

export function saveTasks(tasks: Task[]) {
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks))
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("tasksUpdated"))
  }
}

export function getTasksByDate(date: string): Task[] {
  return getTasks().filter((task) => task.date === date)
}

export function createTask(task: Omit<Task, "id" | "created_at" | "updated_at" | "user_id">): Task {
  const tasks = getTasks()
  const newTask: Task = {
    ...task,
    id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    user_id: "local",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  tasks.push(newTask)
  saveTasks(tasks)
  return newTask
}

export function updateTask(taskId: string, updates: Partial<Task>) {
  const tasks = getTasks()
  const index = tasks.findIndex((t) => t.id === taskId)
  if (index !== -1) {
    tasks[index] = { ...tasks[index], ...updates, updated_at: new Date().toISOString() }
    saveTasks(tasks)
  }
}

export function deleteTask(taskId: string) {
  const tasks = getTasks().filter((t) => t.id !== taskId)
  saveTasks(tasks)
}

// Daily Scores
export function getDailyScores(): DailyScore[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEYS.DAILY_SCORES)
  return data ? JSON.parse(data) : []
}

export function saveDailyScores(scores: DailyScore[]) {
  localStorage.setItem(STORAGE_KEYS.DAILY_SCORES, JSON.stringify(scores))
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("dailyScoresUpdated"))
  }
}

export function getDailyScore(date: string): DailyScore | undefined {
  return getDailyScores().find((s) => s.date === date)
}

export function upsertDailyScore(score: Omit<DailyScore, "id" | "created_at" | "updated_at" | "user_id">): DailyScore {
  const scores = getDailyScores()
  const existingIndex = scores.findIndex((s) => s.date === score.date)

  const scoreData: DailyScore = {
    ...score,
    id:
      existingIndex !== -1
        ? scores[existingIndex].id
        : `score_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    user_id: "local",
    created_at: existingIndex !== -1 ? scores[existingIndex].created_at : new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  if (existingIndex !== -1) {
    scores[existingIndex] = scoreData
  } else {
    scores.push(scoreData)
  }

  saveDailyScores(scores)
  return scoreData
}
