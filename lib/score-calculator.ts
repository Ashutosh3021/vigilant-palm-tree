import type { Task } from "./types"

const PRIORITY_WEIGHTS = {
  High: 3,
  Medium: 2,
  Low: 1,
}

export function calculateDailyScore(tasks: Task[]): number {
  if (tasks.length === 0) return 0

  const completedTasks = tasks.filter((task) => task.completed)
  const totalWeight = tasks.reduce((sum, task) => sum + (task.priority_weight || PRIORITY_WEIGHTS[task.priority]), 0)
  const completedWeight = completedTasks.reduce((sum, task) => sum + (task.priority_weight || PRIORITY_WEIGHTS[task.priority]), 0)

  if (totalWeight === 0) return 0

  return Math.round((completedWeight / totalWeight) * 100)
}

export function getScoreLevel(score: number): number {
  if (score === 0) return 0
  if (score < 25) return 1
  if (score < 50) return 2
  if (score < 75) return 3
  return 4
}
