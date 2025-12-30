import type { Task, DailyScore, TimeEntry } from "./types"

// User Preferences
export interface UserPreferences {
  name: string
  goal: string
  workingHours: { start: string; end: string }
  dayResetTime: string
  hasCompletedOnboarding: boolean
}

// New data structure
const STORAGE_KEYS = {
  TASKS: "momentum_tasks",
  DAILY_LOGS: "momentum_daily_logs",
  SETTINGS: "momentum_settings",
  ANALYTICS: "momentum_analytics",
  USER_PREFS: "momentum_user_prefs",
  TIME_ENTRIES: "momentum_time_entries",
}

// Daily Log interface
interface DailyLog {
  date: string;
  tasks: Array<{
    taskId: string;
    priority: number;
    isCompleted: boolean;
    timeSpent: number; // in minutes
    completedAt?: string;
  }>;
  totalScore: number;
  tasksCompleted: number;
  tasksAssigned: number;
}

// Analytics interface
interface Analytics {
  currentStreak: number;
  longestStreak: number;
  totalProductiveDays: number;
  lastCalculated: string;
}

// Settings interface
interface Settings {
  dayResetTime: string;
  theme: string;
  accentColor: string;
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
// Daily Logs functions
export function getDailyLogs(): DailyLog[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEYS.DAILY_LOGS)
  return data ? JSON.parse(data) : []
}

export function saveDailyLogs(logs: DailyLog[]) {
  localStorage.setItem(STORAGE_KEYS.DAILY_LOGS, JSON.stringify(logs))
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("dailyLogsUpdated"))
  }
}

export function getDailyLog(date: string): DailyLog | undefined {
  return getDailyLogs().find((log) => log.date === date)
}

export function upsertDailyLog(log: DailyLog): DailyLog {
  const logs = getDailyLogs()
  const existingIndex = logs.findIndex((l) => l.date === log.date)

  if (existingIndex !== -1) {
    logs[existingIndex] = log
  } else {
    logs.push(log)
  }

  saveDailyLogs(logs)
  return log
}

// Analytics functions
export function getAnalytics(): Analytics {
  if (typeof window === "undefined") return {
    currentStreak: 0,
    longestStreak: 0,
    totalProductiveDays: 0,
    lastCalculated: new Date().toISOString(),
  };
  const data = localStorage.getItem(STORAGE_KEYS.ANALYTICS);
  return data ? JSON.parse(data) : {
    currentStreak: 0,
    longestStreak: 0,
    totalProductiveDays: 0,
    lastCalculated: new Date().toISOString(),
  };
}

export function saveAnalytics(analytics: Analytics) {
  localStorage.setItem(STORAGE_KEYS.ANALYTICS, JSON.stringify(analytics));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("analyticsUpdated"));
  }
}

// Settings functions
export function getSettings(): Settings {
  if (typeof window === "undefined") return {
    dayResetTime: "04:00",
    theme: "dark",
    accentColor: "#3b82f6",
  };
  const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  return data ? JSON.parse(data) : {
    dayResetTime: "04:00",
    theme: "dark",
    accentColor: "#3b82f6",
  };
}

export function saveSettings(settings: Settings) {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("settingsUpdated"));
  }
}

// Backwards compatibility: convert old DailyScore to new DailyLog format
export function getDailyScores(): DailyScore[] {
  // For backwards compatibility, convert daily logs to daily scores
  const logs = getDailyLogs();
  return logs.map(log => ({
    id: `score_${log.date}`,
    user_id: "local",
    date: log.date,
    score: log.totalScore,
    tasks_completed: log.tasksCompleted,
    total_tasks: log.tasksAssigned,
    created_at: new Date(log.date).toISOString(),
    updated_at: new Date(log.date).toISOString(),
  }));
}

export function getDailyScore(date: string): DailyScore | undefined {
  const log = getDailyLog(date);
  if (!log) return undefined;
  
  return {
    id: `score_${log.date}`,
    user_id: "local",
    date: log.date,
    score: log.totalScore,
    tasks_completed: log.tasksCompleted,
    total_tasks: log.tasksAssigned,
    created_at: new Date(log.date).toISOString(),
    updated_at: new Date(log.date).toISOString(),
  };
}

export function upsertDailyScore(score: Omit<DailyScore, "id" | "created_at" | "updated_at" | "user_id">): DailyScore {
  // Convert DailyScore to DailyLog and save
  const log: DailyLog = {
    date: score.date,
    tasks: [], // We'll need to populate this based on actual tasks
    totalScore: score.score,
    tasksCompleted: score.tasks_completed,
    tasksAssigned: score.total_tasks,
  };
  
  upsertDailyLog(log);
  
  return {
    id: `score_${score.date}`,
    user_id: "local",
    date: score.date,
    score: score.score,
    tasks_completed: score.tasks_completed,
    total_tasks: score.total_tasks,
    created_at: new Date(score.date).toISOString(),
    updated_at: new Date(score.date).toISOString(),
  };
}

export function saveDailyScores(scores: DailyScore[]) {
  // Convert scores to logs and save
  const logs: DailyLog[] = scores.map(score => ({
    date: score.date,
    tasks: [], // We'll need to populate this based on actual tasks
    totalScore: score.score,
    tasksCompleted: score.tasks_completed,
    tasksAssigned: score.total_tasks,
  }));
  
  saveDailyLogs(logs);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("dailyLogsUpdated"));
  }
}

// Time Entries
const TIME_ENTRIES_KEY = "momentum_time_entries";

export function getTimeEntries(): TimeEntry[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(TIME_ENTRIES_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveTimeEntries(entries: TimeEntry[]) {
  localStorage.setItem(TIME_ENTRIES_KEY, JSON.stringify(entries));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("timeEntriesUpdated"));
  }
}

export function getTimeEntriesByTask(taskId: string): TimeEntry[] {
  return getTimeEntries().filter((entry) => entry.task_id === taskId);
}

export function getTimeEntriesByTaskAndWeek(taskId: string, weekStart: string, weekEnd: string): TimeEntry[] {
  return getTimeEntries().filter((entry) => 
    entry.task_id === taskId && 
    entry.date >= weekStart && 
    entry.date <= weekEnd
  );
}

export function createTimeEntry(entry: Omit<TimeEntry, "id" | "created_at" | "updated_at">): TimeEntry {
  const entries = getTimeEntries();
  const newEntry: TimeEntry = {
    ...entry,
    id: `time_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  entries.push(newEntry);
  saveTimeEntries(entries);
  return newEntry;
}

export function updateTimeEntry(entryId: string, updates: Partial<TimeEntry>) {
  const entries = getTimeEntries();
  const index = entries.findIndex((e) => e.id === entryId);
  if (index !== -1) {
    entries[index] = { ...entries[index], ...updates, updated_at: new Date().toISOString() };
    saveTimeEntries(entries);
  }
}

export function deleteTimeEntry(entryId: string) {
  const entries = getTimeEntries().filter((e) => e.id !== entryId);
  saveTimeEntries(entries);
}

export function getTotalTimeForTaskInWeek(taskId: string, weekStart: string, weekEnd: string): number {
  const entries = getTimeEntriesByTaskAndWeek(taskId, weekStart, weekEnd);
  return entries.reduce((total, entry) => total + entry.hours, 0);
}
