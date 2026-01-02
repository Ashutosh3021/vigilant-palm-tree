import type { Task } from "./types";
import { getCategoryWeight } from "./constants/categoryWeightage";
import { calculateDailyScore } from "./score-calculator";

/**
 * Get the weight for a task based on its category
 * @param task The task to get weight for
 * @returns The weight percentage based on the task's category
 */
export function getTaskWeight(task: Task): number {
  return getCategoryWeight(task.category || "OTHER");
}

/**
 * Calculate the daily score using category weights instead of individual task weights
 * @param tasks The list of tasks for the day
 * @returns The calculated daily score
 */
export function calculateDailyScoreWithCategoryWeights(tasks: Task[]): number {
  if (tasks.length === 0) return 0;

  // Calculate total possible points based on category weights
  let totalPossiblePoints = 0;
  let earnedPoints = 0;

  for (const task of tasks) {
    const weight = getTaskWeight(task);
    totalPossiblePoints += weight;
    
    if (task.completed) {
      earnedPoints += weight;
    }
  }

  // Avoid division by zero
  if (totalPossiblePoints === 0) return 0;

  // Calculate percentage score
  return Math.round((earnedPoints / totalPossiblePoints) * 100);
}

/**
 * Get the total weight for all tasks in a specific category
 * @param tasks The list of tasks to check
 * @param category The category to filter by
 * @returns The total weight for tasks in the category
 */
export function getCategoryTotalWeight(tasks: Task[], category: string): number {
  return tasks
    .filter(task => (task.category || "OTHER").toUpperCase() === category.toUpperCase())
    .reduce((total, task) => total + getCategoryWeight(task.category || "OTHER"), 0);
}

/**
 * Get the earned weight for completed tasks in a specific category
 * @param tasks The list of tasks to check
 * @param category The category to filter by
 * @returns The earned weight for completed tasks in the category
 */
export function getCategoryEarnedWeight(tasks: Task[], category: string): number {
  return tasks
    .filter(task => 
      (task.category || "OTHER").toUpperCase() === category.toUpperCase() && 
      task.completed
    )
    .reduce((total, task) => total + getCategoryWeight(task.category || "OTHER"), 0);
}

/**
 * Get task statistics by category
 * @param tasks The list of tasks to analyze
 * @returns An array of objects with category statistics
 */
export function getTaskStatsByCategory(tasks: Task[]): Array<{
  category: string;
  totalTasks: number;
  completedTasks: number;
  totalWeight: number;
  earnedWeight: number;
  completionPercentage: number;
}> {
  // Get all unique categories from tasks
  const categories = [...new Set(tasks.map(task => task.category || "OTHER"))];
  
  return categories.map(category => {
    const categoryTasks = tasks.filter(task => 
      (task.category || "OTHER").toUpperCase() === category.toUpperCase()
    );
    
    const totalTasks = categoryTasks.length;
    const completedTasks = categoryTasks.filter(task => task.completed).length;
    const totalWeight = getCategoryTotalWeight(categoryTasks, category);
    const earnedWeight = getCategoryEarnedWeight(categoryTasks, category);
    const completionPercentage = totalTasks > 0 
      ? Math.round((completedTasks / totalTasks) * 100) 
      : 0;
    
    return {
      category,
      totalTasks,
      completedTasks,
      totalWeight,
      earnedWeight,
      completionPercentage
    };
  });
}