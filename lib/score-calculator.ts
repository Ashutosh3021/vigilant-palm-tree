import type { Task } from "./types"
import { getCategoryWeight } from "./constants/categoryWeightage"

export function calculateDailyScore(tasks: Task[]): number {
  if (tasks.length === 0) return 0

  const completedTasks = tasks.filter((task) => task.completed)
  
  // Calculate total weight using category-based weights
  const totalWeight = tasks.reduce((sum, task) => {
    const categoryWeight = getCategoryWeight(task.category || "OTHER");
    return sum + categoryWeight;
  }, 0)
  
  // Calculate completed weight using category-based weights
  const completedWeight = completedTasks.reduce((sum, task) => {
    const categoryWeight = getCategoryWeight(task.category || "OTHER");
    return sum + categoryWeight;
  }, 0)

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